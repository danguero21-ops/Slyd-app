import { db } from '@/api/apiClient';

import React, { useState, useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import ConversationItem from "../components/chat/ConversationItem";
import LoadingScreen from "../components/shared/LoadingScreen";
import EmptyState from "../components/shared/EmptyState";
import { MessageCircle } from "lucide-react";

export default function Inbox() {
  const [currentEmail, setCurrentEmail] = useState(null);

  useEffect(() => {
    db.auth.me().then((u) => setCurrentEmail(u.email));
  }, []);

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations", currentEmail],
    queryFn: async () => {
      const allConvos = await db.entities.Conversation.list("-last_message_time");
      return allConvos.filter((c) => c.participants?.includes(currentEmail));
    },
    enabled: !!currentEmail,
    refetchInterval: 5000,
  });

  if (!currentEmail || isLoading) return <LoadingScreen />;

  return (
    <div className="max-w-lg mx-auto">
      <div className="px-4 py-4">
        <h1 className="text-xl font-bold">Messages</h1>
      </div>

      {conversations.length > 0 ? (
        <div className="divide-y divide-[#1C1C1E]">
          {conversations.map((convo) => (
            <ConversationItem key={convo.id} conversation={convo} currentEmail={currentEmail} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={MessageCircle}
          title="No messages"
        />
      )}
    </div>
  );
}