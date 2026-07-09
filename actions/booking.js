"use server"

import { db } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { StreamClient } from "@stream-io/node-sdk"
import { revalidatePath } from "next/cache"
import { createRateLimiter, checkRateLimit } from "@/lib/arcjet"
import { request } from "@arcjet/next"


const bookingLimiter = createRateLimiter({
  refillRate: 10,
  interval: "1h",
  capacity: 5,
})


export const getInterviewerProfile = async (interviewerId) => {
  try {
    const interviewer = await db.user.findUnique({
      where: {
        id: interviewerId,
        role: "INTERVIEWER"

      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        title: true,
        company: true,
        yearsExp: true,
        bio: true,
        categories: true,
        creditRate: true,
        availabilities: {
          where: {
            status: "AVAILABLE"
          },
          select: {
            startTime: true,
            endTime: true
          },
          take: 1,
        },
        bookingAsInterviewer: {
          where: { status: "SCHEDULED" },
          select: {
            startTime: true,
            endTime: true
          },
        }
      },
    });

    return interviewer ?? null;

  } catch (error) {
    console.error("getInterviewerProfile error:", error);
    return null;

  }
};

export const bookSlot = async ({ interviewerId, startTime, endTime }) => {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }


  const req = await request();
  const rateLimitError = await checkRateLimit(
    bookingLimiter,
    req,
    user.id
  );
  if (rateLimitError) throw new Error(rateLimitError);

  const [dbUser, interviewer] = await Promise.all([
    db.user.findUnique({
      where: { clerkUserId: user.id }
    }),
    db.user.findUnique({
      where: { id: interviewerId }
    }),

  ]);

  if (!dbUser || dbUser.role !== "INTERVIEWEE")
    throw new Error("Only interviewees can book Sessions");
  if (!interviewer || interviewer.role !== "INTERVIEWER")
    throw new Error("Interviewer not found.");


  const credits = interviewer.creditRate ?? 1;

  if (dbUser.credits < credits) {
    throw new Error("Insufficient Credits. Please upgrade your plans.");
  };

  const conflict = await db.booking.findFirst({
    where:
    {
      interviewerId,
      status: "SCHEDULED",
      startTime: {
        lt: new Date(endTime)
      },
      endTime: {
        gt: new Date(startTime)
      },
    },
  });

  if (conflict) {
    throw new Error("This slot was just booked. Please pick another.");

  }


  let streamCallId;
  try {
    const streamClient = new StreamClient(process.env.NEXT_PUBLIC_STREAM_API_KEY, process.env.STREAM_SECRET_KEY,);

    await streamClient.upsertUsers([
      {
        id: dbUser.clerkUserId,
        name: dbUser.name ?? "Interviewee",
        image: dbUser.imageUrl ?? undefined,
        role: "user",
      },
      {
        id: interviewer.clerkUserId,
        name: interviewer.name ?? "Interviewer",
        image: interviewer.imageUrl ?? undefined,
        role: "user",
      }
    ]);

    streamCallId = `mock_${Date.now()}_${Math.random().toString(36)
      .slice(2, 7)}`;

    const call = streamClient.video.call("default", streamCallId);

    await call.getOrCreate({
      data: {
        created_by_id: dbUser.clerkUserId,
        members: [
          { user_id: dbUser.clerkUserId, role: "host" },
          { user_id: interviewer.clerkUserId, role: "host" }
        ],
        settings_override: {
          recording: { mode: "available", quality: "1080p" },
          screensharing: {
            enabled: true,
          },
          transcription: {
            mode: "auto-on"
          },

        },
      },
    });


  } catch (error) {
    console.error("Stream call creation failed:", error)
    throw new Error("Failed to create video call. Please try again.")

  }

  try {
    const booking = await db.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          intervieweeId: dbUser.id,
          interviewerId,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          status: "SCHEDULED",
          creditsCharged: credits,
          streamCallId,
        },
      });

      await tx.creditTransaction.create({
        data: {
          userId: dbUser.id,
          amount: -credits,
          type: "BOOKING_DEDUCTION",
          bookingId: newBooking.id,
        },
      });

      await tx.user.update({
        where: { id: dbUser.id },
        data: {
          credits: {
            decrement: credits
          }
        },


      });

      await tx.user.update({
        where: { id: interviewerId },
        data: {
          creditBalance: { increment: credits },
        }
      });

      return newBooking;


    });

    revalidatePath(`/interviewers/${interviewerId}`)
    revalidatePath("/dashboard");

    return { success: true, bookingId: booking.id, streamCallId }

  } catch (error) {
    console.error("bookslot transaction failed:", error)
    throw new Error("Booking failed. Please try again.");

  }










};