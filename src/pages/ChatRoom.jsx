import { db } from '@/api/apiClient';

import React, { useState, useEffect, useRef } from "react";

import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MessageBubble from "../components/chat/MessageBubble";
import UserAvatar from "../components/shared/UserAvatar";
import LoadingScreen from "../components/shared/LoadingScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function ChatRoom() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const conversationId = urlParams.get("conversationId");
  const queryClient = useQueryClient();

  const [currentEmail, setCurrentEmail] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    db.auth.me().then((u) => setCurrentEmail(u.email));
  }, []);

  const { data: conversation, isLoading: convoLoading } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: async () => {
      const convos = await db.entities.Conversation.filter({ id: conversationId });
      return convos[0] || null;
    },
    enabled: !!conversationId,
  });

  const { data: messages = [], isLoading: msgsLoading } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => db.entities.Message.filter({ conversation_id: conversationId }, "created_date"),
    enabled: !!conversationId,
    refetchInterval: 3000,
  });

  // Mark messages as read
  useEffect(() => {
    if (!messages.length || !currentEmail || !conversation) return;
    const unread = messages.filter(
      (m) => m.sender_email !== currentEmail && !m.is_read
    );
    unread.forEach((m) => db.entities.Message.update(m.id, { is_read: true }));

    // Reset unread count
    const isUser1 = conversation.participants?.[0] === currentEmail;
    if (isUser1 && conversation.unread_count_user1 > 0) {
      db.entities.Conversation.update(conversation.id, { unread_count_user1: 0 });
    } else if (!isUser1 && conversation.unread_count_user2 > 0) {
      db.entities.Conversation.update(conversation.id, { unread_count_user2: 0 });
    }
  }, [messages, currentEmail, conversation]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: async (content) => {
      await db.entities.Message.create({
        conversation_id: conversationId,
        sender_email: currentEmail,
        content,
        message_type: "text",
      });

      const isUser1 = conversation.participants?.[0] === currentEmail;
      await db.entities.Conversation.update(conversation.id, {
        last_message: content.substring(0, 100),
        last_message_time: new Date().toISOString(),
        last_message_by: currentEmail,
        ...(isUser1
          ? { unread_count_user2: (conversation.unread_count_user2 || 0) + 1 }
          : { unread_count_user1: (conversation.unread_count_user1 || 0) + 1 }),
      });
    },
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: ["messages", conversationId] });
      const previous = queryClient.getQueryData(["messages", conversationId]);
      const optimistic = {
        id: `optimistic-${Date.now()}`,
        conversation_id: conversationId,
        sender_email: currentEmail,
        content,
        message_type: "text",
        is_read: false,
        created_date: new Date().toISOString(),
      };
      queryClient.setQueryData(["messages", conversationId], (old = []) => [...old, optimistic]);
      return { previous };
    },
    onError: (_err, _content, context) => {
      queryClient.setQueryData(["messages", conversationId], context.previous);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
    },
  });

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMutation.mutate(newMessage.trim());
    setNewMessage("");
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    await db.entities.Message.create({
      conversation_id: conversationId,
      sender_email: currentEmail,
      content: "📷 Photo",
      image_url: file_url,
      message_type: "image",
    });
    queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
  };

  if (convoLoading || !currentEmail) return <LoadingScreen />;
  if (!conversation) return <div className="p-6 text-center text-[#8E8E93]">Conversation not found</div>;

  const isUser1 = conversation.participants?.[0] === currentEmail;
  const otherIndex = isUser1 ? 1 : 0;
  const otherName = conversation.participant_names?.[otherIndex] || "User";
  const otherAvatar = conversation.participant_avatars?.[otherIndex];
  const otherEmail = conversation.participants?.[otherIndex];

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-[#0A0A0A]">
      {/* Header */}
      <div className="sticky top-0 z-40 slyd-glass border-b border-[#2C2C2E]/50 px-3 py-2.5 flex items-center gap-3">
        <button onClick={() => navigate(createPageUrl("Inbox"))} className="p-1">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={() => navigate(createPageUrl(`ProfileDetail?email=${encodeURIComponent(otherEmail)}`))}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          <UserAvatar src={otherAvatar} name={otherName} size="sm" />
          <div className="min-w-0">
            <p className="font-semibold text-sm text-white truncate">{otherName}</p>
            <p className="text-[10px] text-[#8E8E93]">Tap to view profile</p>
          </div>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4">
        {msgsLoading ? (
          <LoadingScreen />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <UserAvatar src={otherAvatar} name={otherName} size="lg" className="mb-4" />
            <p className="text-sm text-[#8E8E93]">Say hi to {otherName}! 👋</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender_email === currentEmail}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 slyd-glass border-t border-[#2C2C2E]/50 p-3 safe-bottom">
        <div className="flex items-center gap-2">
          <label className="p-2 cursor-pointer text-[#8E8E93] hover:text-white transition-colors">
            <ImageIcon className="w-5 h-5" />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-[#1C1C1E] border-[#2C2C2E] text-white rounded-full h-10 px-4 placeholder:text-[#8E8E93]"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              newMessage.trim() ? "slyd-gradient" : "bg-[#1C1C1E]"
            }`}
          >
            <Send className={`w-4 h-4 ${newMessage.trim() ? "text-white" : "text-[#8E8E93]"}`} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}