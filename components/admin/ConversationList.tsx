"use client";

import { Search, Filter, MessageSquare } from "lucide-react";
import type { Conversation } from "@/lib/types";

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  searchQuery,
  onSearchChange,
}: ConversationListProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  const getPresenceColor = (presence: string) => {
    switch (presence) {
      case "online":
        return "bg-success";
      case "away":
        return "bg-warning";
      default:
        return "bg-muted-foreground";
    }
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.participant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.property?.title && c.property.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-3">Messages</h2>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted-foreground">
            {filteredConversations.length} conversations
          </span>
          <button
            type="button"
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
          >
            <Filter size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 p-4">
            <MessageSquare size={32} className="text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No conversations found</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`w-full p-4 text-left transition-colors hover:bg-muted ${
                  selectedConversationId === conversation.id
                    ? "bg-accent/5 border-r-2 border-accent"
                    : ""
                }`}
              >
                <div className="flex gap-3">
                  <div className="relative flex-shrink-0">
                    {conversation.participant_avatar ? (
                      <img
                        src={conversation.participant_avatar}
                        alt={conversation.participant_name}
                        className="h-12 w-12 rounded-full"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                        <span className="text-sm font-medium text-accent">
                          {conversation.participant_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card ${getPresenceColor(
                        conversation.participant_presence
                      )}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-foreground truncate">
                        {conversation.participant_name}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conversation.last_message_at)}
                      </span>
                    </div>
                    {conversation.property && (
                      <p className="text-xs text-accent mt-0.5 truncate">
                        {conversation.property.title}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {conversation.last_message}
                    </p>
                  </div>
                  {conversation.unread_count > 0 && (
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-primary bg-accent rounded-full">
                        {conversation.unread_count > 99 ? "99+" : conversation.unread_count}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}