import React from "react";
import OnlineIndicator from "./OnlineIndicator";
import { cn } from "@/lib/utils";

export default function UserAvatar({ src, name, isOnline, size = "md", className }) {
  const sizes = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20",
    xl: "w-28 h-28",
  };

  const indicatorSizes = {
    sm: "xs",
    md: "sm",
    lg: "md",
    xl: "lg",
  };

  const fallbackLetter = name ? name[0].toUpperCase() : "?";

  return (
    <div className={cn("relative shrink-0", sizes[size], className)}>
      {src ? (
        <img
          src={src}
          alt={name || "User"}
          className={cn("object-cover rounded-2xl w-full h-full", sizes[size])}
        />
      ) : (
        <div
          className={cn(
            "rounded-2xl w-full h-full flex items-center justify-center bg-[#2C2C2E] text-[#8E8E93] font-bold",
            size === "sm" ? "text-sm" : size === "md" ? "text-lg" : "text-2xl"
          )}
        >
          {fallbackLetter}
        </div>
      )}
      <OnlineIndicator
        isOnline={isOnline}
        size={indicatorSizes[size]}
        className="absolute -bottom-0.5 -right-0.5"
      />
    </div>
  );
}