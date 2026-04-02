import React from "react";
import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";
import moment from "moment";

export default function MessageBubble({ message, isOwn }) {
  return (
    <div className={cn("flex mb-2 px-4", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3.5 py-2.5 relative",
          isOwn
            ? "slyd-gradient text-white rounded-br-md"
            : "bg-[#1C1C1E] text-white rounded-bl-md"
        )}
      >
        {message.image_url && (
          <img
            src={message.image_url}
            alt="Attachment"
            className="rounded-xl max-w-full mb-1.5"
          />
        )}
        <p className="text-sm leading-relaxed break-words">{message.content}</p>
        <div
          className={cn(
            "flex items-center gap-1 mt-1",
            isOwn ? "justify-end" : "justify-start"
          )}
        >
          <span className="text-[10px] opacity-60">
            {moment(message.created_date).format("h:mm A")}
          </span>
          {isOwn && (
            message.is_read ? (
              <CheckCheck className="w-3 h-3 opacity-80" />
            ) : (
              <Check className="w-3 h-3 opacity-50" />
            )
          )}
        </div>
      </div>
    </div>
  );
}