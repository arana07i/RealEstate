"use client";

import { useState, useMemo } from "react";
import { ConversationList } from "./ConversationList";
import { ChatWindow } from "./ChatWindow";
import type { Conversation, Message } from "@/lib/types";

const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    participant_id: "user-1",
    participant_name: "Rajesh Kumar",
    participant_presence: "online",
    last_message: "Is the property still available? I'm interested in scheduling a visit.",
    last_message_at: new Date().toISOString(),
    unread_count: 2,
    property: { id: "prop-1", title: "Luxury Apartment in Sector 15" },
  },
  {
    id: "conv-2",
    participant_id: "user-2",
    participant_name: "Priya Sharma",
    participant_presence: "offline",
    last_message: "Thanks for the details. Can you share more photos?",
    last_message_at: new Date(Date.now() - 3600000).toISOString(),
    unread_count: 0,
    property: { id: "prop-2", title: "Villa in DLF Phase 2" },
  },
  {
    id: "conv-3",
    participant_id: "user-3",
    participant_name: "Amit Patel",
    participant_presence: "away",
    last_message: "What's the price negotiation range?",
    last_message_at: new Date(Date.now() - 7200000).toISOString(),
    unread_count: 1,
  },
  {
    id: "conv-4",
    participant_id: "user-4",
    participant_name: "Sneha Reddy",
    participant_presence: "online",
    last_message: "Great, looking forward to the viewing tomorrow!",
    last_message_at: new Date(Date.now() - 10800000).toISOString(),
    unread_count: 0,
    property: { id: "prop-3", title: "Penthouse in Sector 45" },
  },
  {
    id: "conv-5",
    participant_id: "user-5",
    participant_name: "Mohit Singh",
    participant_presence: "offline",
    last_message: "I've shared the required documents.",
    last_message_at: new Date(Date.now() - 86400000).toISOString(),
    unread_count: 0,
  },
];

const mockMessages: Record<string, Message[]> = {
  "conv-1": [
    {
      id: "msg-1",
      conversation_id: "conv-1",
      sender_id: "user-1",
      sender_name: "Rajesh Kumar",
      content: "Hi! I saw your listing for the luxury apartment. Is it still available?",
      created_at: new Date(Date.now() - 7200000).toISOString(),
      status: "read",
    },
    {
      id: "msg-2",
      conversation_id: "conv-1",
      sender_id: "current-user",
      sender_name: "Admin",
      content: "Yes, it's still available! Would you like to schedule a viewing?",
      created_at: new Date(Date.now() - 6600000).toISOString(),
      status: "read",
    },
    {
      id: "msg-3",
      conversation_id: "conv-1",
      sender_id: "user-1",
      sender_name: "Rajesh Kumar",
      content: "Is the property still available? I'm interested in scheduling a visit.",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      status: "read",
    },
    {
      id: "msg-4",
      conversation_id: "conv-1",
      sender_id: "user-1",
      sender_name: "Rajesh Kumar",
      content: "Also, can you share more photos of the bedrooms?",
      created_at: new Date().toISOString(),
      status: "delivered",
    },
  ],
  "conv-2": [
    {
      id: "msg-5",
      conversation_id: "conv-2",
      sender_id: "user-2",
      sender_name: "Priya Sharma",
      content: "I'm interested in the villa. Can you send more details?",
      created_at: new Date(Date.now() - 10800000).toISOString(),
      status: "read",
    },
    {
      id: "msg-6",
      conversation_id: "conv-2",
      sender_id: "current-user",
      sender_name: "Admin",
      content:
        "Absolutely! Here are the property details and some additional photos.",
      created_at: new Date(Date.now() - 7200000).toISOString(),
      status: "read",
      attachments: [
        {
          id: "att-1",
          name: "villa-floor-plan.pdf",
          url: "/placeholder.pdf",
          type: "document",
          size: 2456789,
          mime_type: "application/pdf",
        },
      ],
    },
    {
      id: "msg-7",
      conversation_id: "conv-2",
      sender_id: "user-2",
      sender_name: "Priya Sharma",
      content: "Thanks for the details. Can you share more photos?",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      status: "read",
    },
  ],
  "conv-3": [
    {
      id: "msg-8",
      conversation_id: "conv-3",
      sender_id: "user-3",
      sender_name: "Amit Patel",
      content: "What's the final price on this property?",
      created_at: new Date(Date.now() - 14400000).toISOString(),
      status: "read",
    },
    {
      id: "msg-9",
      conversation_id: "conv-3",
      sender_id: "current-user",
      sender_name: "Admin",
      content: "The listed price is firm, but we can discuss minor negotiations.",
      created_at: new Date(Date.now() - 10800000).toISOString(),
      status: "read",
    },
    {
      id: "msg-10",
      conversation_id: "conv-3",
      sender_id: "user-3",
      sender_name: "Amit Patel",
      content: "What's the price negotiation range?",
      created_at: new Date(Date.now() - 7200000).toISOString(),
      status: "delivered",
    },
  ],
};

export default function MessagesClient() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);

  const selectedConversation = useMemo(() => {
    return mockConversations.find((c) => c.id === selectedConversationId) || null;
  }, [selectedConversationId]);

  const conversationMessages = useMemo(() => {
    return selectedConversationId ? messages[selectedConversationId] || [] : [];
  }, [selectedConversationId, messages]);

  const handleSendMessage = (content: string, attachments?: File[]) => {
    if (!selectedConversationId) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversation_id: selectedConversationId,
      sender_id: "current-user",
      sender_name: "Admin",
      content,
      created_at: new Date().toISOString(),
      status: "sent",
      attachments: attachments?.map((file, index) => ({
        id: `att-${Date.now()}-${index}`,
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type.startsWith("image/") ? "image" : "document",
        size: file.size,
        mime_type: file.type,
      })),
    };

    setMessages((prev) => ({
      ...prev,
      [selectedConversationId]: [...(prev[selectedConversationId] || []), newMessage],
    }));
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-card rounded-xl overflow-hidden border border-border">
      <div className="w-80 lg:w-96 border-r border-border">
        <ConversationList
          conversations={mockConversations}
          selectedConversationId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>
      <div className="flex-1">
        <ChatWindow
          conversation={selectedConversation}
          messages={conversationMessages}
          onSendMessage={handleSendMessage}
          onTyping={(isTyping) => {}}
        />
      </div>
    </div>
  );
}