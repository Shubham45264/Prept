"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";
import UpgradeModal from "@/components/UpgradeModal"

export default function CreditButton({ role, credits }) {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (role === "INTERVIEWER") {
      window.location.href = "/dashboard";

    } else {
      setOpen(true);
    }

  };

  return (
    <>
      <Button
        className="border-amber-400/20 text-amber-400 cursor-pointer"
        onClick={handleClick}
      >
        <Coins size={14} />
        <span className="opacity-70">
          {credits} {role === "INTERVIEWER" ? "Earned" : "Credits"}
        </span>
      </Button>

      <UpgradeModal open={open} onOpenChange={setOpen}/>
    </>
  );
}