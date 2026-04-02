import React from "react";
import { cn } from "@/lib/utils";

export default function OnlineIndicator({ isOnline, size = "sm", className }) {
  const sizes = {
    xs: "w-2 h-2",
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  if (!isOnline) return null;

  return (
    <span
      className={cn(
        "rounded-full bg-[#30D158] border-2 border-[#0A0A0A] block",
        sizes[size],
        className
      )}
    />
  );
}