import React from "react";
import { cn } from "@/lib/utils";

export default function ProfileTag({ label, variant = "default", className }) {
  const variants = {
    default: "bg-[#2C2C2E] text-[#8E8E93]",
    accent: "slyd-gradient text-white",
    outline: "border border-[#2C2C2E] text-[#8E8E93]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {label}
    </span>
  );
}