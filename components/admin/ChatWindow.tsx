"use client";

import { useState, useRef, useEffect } from "react";
import { Paperclip, Send, Smile } from "lucide-react";
import type { Conversation, Message, QuickReplyTemplate } from "@/lib/types";
import { MessageBubble } from "./MessageBubble";

interface ChatWindowProps {
  conversation: Conversation | null;
  messages: Message[];
  onSendMessage: (content: string, attachments?: File[]) => void;
  onTyping?: (isTyping: boolean) => void;
}

const quickReplyTemplates: QuickReplyTemplate[] = [
  { id: "1", title: "Available for viewing", content: "The property is available for viewing. When would you like to schedule a visit?" },
  { id: "2", title: "Send property details", content: "I'll send you the detailed property information shortly." },
  { id: "3", title: "Price negotiation", content: "Let me check with the seller about your offer. I'll get back to you soon." },
  { id: "4", title: "Follow up", content: "Just following up on our previous conversation. Are you still interested?" },
];

export function ChatWindow({ conversation, messages, onSendMessage, onTyping }: ChatWindowProps) {
  const [message, setMessage] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [isTypingIndicator, setIsTypingIndicator] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (message) {
      onTyping?.(true);
      const timer = setTimeout(() => onTyping?.(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onTyping]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
      onTyping?.(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTemplateSelect = (content: string) => {
    setMessage(content);
    setShowTemplates(false);
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4-.858V21l4-4h4l4 4v-4.858A9.863 9.863 0 0121 12z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground">Select a conversation</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Choose from the list to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-muted">
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="relative">
            {conversation.participant_avatar ? (
              <img
                src={conversation.participant_avatar}
                alt={conversation.participant_name}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-sm font-medium text-accent">
                  {conversation.participant_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card ${
                conversation.participant_presence === "online"
                  ? "bg-success"
                  : conversation.participant_presence === "away"
                  ? "bg-warning"
                  : "bg-muted-foreground"
              }`}
            />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {conversation.participant_name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {conversation.participant_presence === "online"
                ? "Online"
                : conversation.participant_presence === "away"
                ? "Away"
                : "Offline"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isOwn={msg.sender_id === "current-user"} />
        ))}
        {isTypingIndicator && (
          <div className="flex gap-2 justify-start">
            <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-accent-foreground">
                {conversation.participant_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="bg-card px-4 py-2.5 rounded-2xl rounded-tl-md border border-border">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border bg-card">
        {showTemplates && (
          <div className="mb-3 p-3 bg-card rounded-lg border border-border shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Quick Replies</span>
              <button
                type="button"
                onClick={() => setShowTemplates(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1.5">
              {quickReplyTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleTemplateSelect(template.content)}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
                >
                  <span className="font-medium text-foreground">{template.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full resize-none px-3 py-2 pr-10 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            <div className="absolute right-2 bottom-2 flex gap-1">
              <button
                type="button"
                onClick={() => setShowTemplates(!showTemplates)}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <Smile size={16} />
              </button>
              <label className="p-1 text-muted-foreground hover:text-foreground cursor-pointer">
                <Paperclip size={16} />
                <input type="file" multiple className="hidden" onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    onSendMessage("", Array.from(files));
                  }
                }} />
              </label>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSend}
            disabled={!message.trim()}
            className="p-2.5 rounded-lg bg-accent text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}