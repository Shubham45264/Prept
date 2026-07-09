import { currentUser } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/prisma";
import PageHeader from "@/components/reusables";
import PayoutReviewClient from "./_components/PayoutReviewClient";

export default async function PayoutReviewPage({ params }) {
  const { id } = await params;

  const user = await currentUser();
  if (!user) redirect("/");

  const dbUser = await db.user.findUnique({
    where: { clerkUserId: user.id },
    select: { role: true },
  });

  if (!dbUser) redirect("/");
  if (dbUser.role === "UNASSIGNED") redirect("/onboarding");

  // Fetch payout details
  const payout = await db.payout.findUnique({
    where: { id },
    include: {
      interviewer: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!payout) notFound();

  // Map database payout to page payload structure for PayoutReviewClient
  const payoutData = {
    id: payout.id,
    interviewerName: payout.interviewer.name,
    interviewerEmail: payout.interviewer.email,
    credits: payout.credits,
    platformFee: payout.platformFee,
    netAmount: payout.netAmount,
    paymentMethod: payout.paymentMethod,
    paymentDetail: payout.paymentDetail,
    status: payout.status,
  };

  return (
    <main className="min-h-screen bg-black">
      <PageHeader
        label="Payout Review"
        gray="Review & Approve"
        gold="Withdrawals"
        description="Verify details and authorize the selected withdrawal request."
      />
      <div className="max-w-xl mx-auto px-8 py-12">
        <PayoutReviewClient payout={payoutData} />
      </div>
    </main>
  );
}