import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

const PLAN_CREDITS = {
  "free": 1,
  "starter": 5,
  "pro": 15,
}

const getCurrentPlan = async () => {
  const { has } = await auth();
  if (has({ plan: "pro" })) return "pro";
  if (has({ plan: "starter" })) return "starter";
  return "free";
}

const shouldAllocateCredits = (dbUser, currentPlan) => {
  if (dbUser.currentPlan !== currentPlan) return true;
  if (!dbUser.creditsLastAllocatedAt) return true;

  const now = new Date();
  const last = new Date(dbUser.creditsLastAllocatedAt);
  return now.getFullYear() > last.getFullYear() || now.getMonth() > last.getMonth();
}

export const checkUser = async () => {
  const user = await currentUser();
  if (!user) return null;

  try {
    const currentPlan = await getCurrentPlan();
    const credits = PLAN_CREDITS[currentPlan];

    const loggedInUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (loggedInUser) {
      if (shouldAllocateCredits(loggedInUser, credits)) {
        return await db.user.update({
          where: { clerkUserId: user.id },
          data: { credits, currentPlan, creditsLastAllocatedAt: new Date() },
        });
      }
      return loggedInUser;
    }

    const name = `${user.firstName} ${user.lastName}`;

    return await db.user.create({
      data: {
        clerkUserId: user.id,
        email: user.emailAddresses[0].emailAddress,
        name,
        imageUrl: user.imageUrl,
        currentPlan,
        credits,
        creditsLastAllocatedAt: new Date(),
      },
    });
  } catch (err) {
    console.error("Checking User Error:", err.message);
    return null;
  }
}