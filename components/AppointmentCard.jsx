"use client"

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AppointmentCard = ({ booking, mode, isPast = false }) => {

  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const {
    startTime,
    endTime,
    status,
    creditsCharged,
    streamCallId,
    recordingUrl,
    feedback, 
  } = booking;

  const person = mode === "interviewee" ? booking.interviewee : booking.interviewer;

  const creditsLabel = 
  mode === "interviewer"
  ? `${creditsCharged} credits earned`
  : `${creditsCharged} credits`;

  const creditsStyle = 
  mode === "interviewer"
  ? "border-green-500/20 bg-green-500/10 text-green-400"
  : "border-amber-400/20 bg-amber-400/5 text-amber-400";

  const isUpcoming = status === "SCHEDULED";


  return <>
     <article className="group relative bg-[#0f0f11] border border-white/10 transition-all duration-3 hover:-translate-y-0.5 rounded-2xl bg-linear-to-t from-transparent via-transparent to-amber-300/10 p-7 flex flex-col gap-6">
     <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <Avatar className="w-14 h-14 border border-white/10 rounded-2xl shrink-0">
              <AvatarImage
                src={person?.imageUrl}
                alt={person?.name}
                className="rounded-2xl"
              />
              <AvatarFallback className="rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 text-lg font-medium">
                {person?.name?.[0] ?? "?"}
              </AvatarFallback>
            </Avatar>

      </div>
     </div>

     </article>
    </>;
  
};

export default AppointmentCard;