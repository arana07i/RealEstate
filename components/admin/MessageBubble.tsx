"use client";

import { Check, CheckCheck, Clock } from "lucide-react";
import type { Message } from "@/lib/types";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case "sent":
        return <Clock size={12} className="text-muted-foreground" />;
      case "delivered":
        return <Check size={12} className="text-muted-foreground" />;
      case "read":
        return <CheckCheck size={12} className="text-accent" />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex gap-2 ${isOwn ? "justify-end" : "justify-start"}`}>
      {!isOwn && message.sender_avatar && (
        <img
          src={message.sender_avatar}
          alt={message.sender_name}
          className="h-8 w-8 rounded-full flex-shrink-0"
        />
      )}
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl ${
          isOwn
            ? "bg-accent text-accent-foreground rounded-br-md"
            : "bg-card text-foreground rounded-bl-md border border-border"
        }`}
      >
        {message.attachments && message.attachments.length > 0 && (
          <div className="mb-2 space-y-2">
            {message.attachments.map((attachment) => (
              <div key={attachment.id}>
                {attachment.type === "image" ? (
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="max-w-full rounded-lg max-h-48 object-cover cursor-pointer hover:opacity-90"
                  />
                ) : (
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                      isOwn
                        ? "bg-primary/10 hover:bg-primary/20"
                        : "bg-muted hover:bg-accent/20"
                    }`}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.828a2 2 0 00-.5-.7l-6.828-6.828a2 2 0 00-.7-.5H7a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm truncate">{attachment.name}</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
        {message.content && (
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        )}
        <div
          className={`flex items-center justify-end gap-1 mt-1 ${
            isOwn ? "text-primary/70" : "text-muted-foreground"
          }`}
        >
          <span className="text-xs">{formatTime(message.created_at)}</span>
          {isOwn && getStatusIcon()}
        </div>
      </div>
      {isOwn && (!message.sender_avatar || (
        <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-medium text-accent">
            {message.sender_name.charAt(0).toUpperCase()}
          </span>
        </div>
      ))}
    </div>
  );
}