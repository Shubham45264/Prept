"use client"

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { STATUS_STYLES } from "@/lib/data";
import { Calendar } from "lucide-react";
import { Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatTime, formatDate } from "@/lib/helpers";
import { CATEGORY_LABEL } from "@/lib/data";

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

            <div className="flex flex-col gap-1 min-w-0">
              <p className="text-base font-medium text-stone-200 leading-tight truncate">
                {person?.name ?? "-"}
              </p>
              {person?.title && person?.company ? (
                <p className="text-xs text-stone-500 truncate">
                  {person.title}
                  <span className="text-stone-700 mx-1.5">•</span>
                  {person.company}
                </p>
              ) : (
                <p className="text-xs text-stone-600 truncate">
                  {person?.email}
                </p>
              )}

              {mode === "interviewee" && person?.categories?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {person.categories.slice(0,3).map((cat) => (
                  <span
                   key = {cat}
                   className="text-[10px] px-2 py-0.5 rounded-md border border-amber-400/20 bg-amber-400/5 text-amber-400 leading-tight"
                   >
                    {CATEGORY_LABEL[cat]}
                    </span>
                ))}
                </div>
              )}
            </div>

      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <Badge variant="outline" className={STATUS_STYLES[status]}>
          {status.charAt(0) + status.slice(1).toLowerCase()}
        </Badge>
        <Badge variant="outline" className={creditsStyle}>
          {creditsLabel}
        </Badge>
      </div>
    </div>
    <Separator className="my-2" />
       <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-stone-600">
            <Calendar size={12}/>
            <span className="text-[10px] font-semibold tracking-widest uppercase">Date</span>
          </div>
          <p className="text-sm text-stone-300">{formatDate(startTime)}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-stone-600">
            <Clock size={12}/>
            <span className="text-[10px] font-semibold tracking-widest uppercase">Time</span>
          </div>
          <p className="text-sm text-stone-300">
            {formatTime(startTime)}
          <span className="text-stone-600 mx-1">-{formatTime(endTime)}</span>
          </p>
        </div>
        <div class>

        </div>
        
            
          
        </div>

     </article>
    </>;
  
};

export default AppointmentCard;