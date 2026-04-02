import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import UserAvatar from "../shared/UserAvatar";
import moment from "moment";

export default function ConversationItem({ conversation, currentEmail }) {
  const isUser1 = conversation.participants?.[0] === currentEmail;
  const otherIndex = isUser1 ? 1 : 0;
  const otherName = conversation.participant_names?.[otherIndex] || "User";
  const otherAvatar = conversation.participant_avatars?.[otherIndex];
  const unread = isUser1 ? conversation.unread_count_user1 : conversation.unread_count_user2;

  const timeAgo = conversation.last_message_time
    ? moment(conversation.last_message_time).fromNow()
    : "";

  return (
    <Link
      to={createPageUrl(`ChatRoom?conversationId=${conversation.id}`)}
      className="flex items-center gap-3 px-4 py-3 hover:bg-[#1C1C1E] transition-colors active:bg-[#2C2C2E]"
    >
      <UserAvatar src={otherAvatar} name={otherName} isOnline={false} size="md" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-white text-sm truncate">{otherName}</p>
          <span className="text-[10px] text-[#8E8E93] shrink-0 ml-2">{timeAgo}</span>
        </div>
        <p className="text-xs text-[#8E8E93] truncate mt-0.5">
          {conversation.last_message || "Tap to start chatting"}
        </p>
      </div>

      {unread > 0 && (
        <span className="shrink-0 w-5 h-5 rounded-full slyd-gradient flex items-center justify-center text-[10px] font-bold text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}