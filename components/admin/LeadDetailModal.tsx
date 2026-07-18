"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";
import type { Lead, LeadNote, CallLog, Meeting, LeadTask, EmailHistory } from "@/lib/types";
import { Badge } from "@/components/ui";
import { Button } from "@/components/ui";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { LeadTimeline } from "./LeadTimeline";
import { X, User, Phone, Mail, IndianRupee, Calendar, CheckSquare } from "lucide-react";
import { toast } from "react-hot-toast";
import { AnimatedModal } from "@/components/animations";

interface LeadDetailModalProps {
  lead: Lead | null;
  notes: LeadNote[];
  callLogs: CallLog[];
  meetings: Meeting[];
  tasks: LeadTask[];
  emails: EmailHistory[];
  onClose: () => void;
  onLeadUpdate?: () => void;
  loading?: boolean;
}

export function LeadDetailModal({
  lead,
  notes,
  callLogs,
  meetings,
  tasks,
  emails,
  onClose,
  onLeadUpdate,
  loading,
}: LeadDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "notes" | "activity">("overview");
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  if (!lead) return null;

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setIsAddingNote(true);
    try {
      const response = await fetch(`/api/admin/leads/${lead.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote }),
      });
      if (response.ok) {
        toast.success("Note added");
        setNewNote("");
        onLeadUpdate?.();
      } else {
        toast.error("Failed to add note");
      }
    } catch {
      toast.error("Failed to add note");
    } finally {
      setIsAddingNote(false);
    }
  };

  if (loading) {
    return (
      <AnimatedModal isOpen={!!lead} onClose={onClose} title={`${lead.first_name} ${lead.last_name}`}>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AnimatedModal>
    );
  }

  const STATUS_COLORS: Record<string, string> = {
    new: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    qualified: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    proposal: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    negotiation: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    closed_won: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    closed_lost: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  const SOURCE_LABELS: Record<string, string> = {
    website: "Website",
    referral: "Referral",
    social_media: "Social Media",
    email_campaign: "Email Campaign",
    cold_call: "Cold Call",
    event: "Event",
    other: "Other",
  };

  const activities = [
    ...notes.map((n) => ({
      id: `note-${n.id}`,
      lead_id: n.lead_id,
      type: "note" as const,
      title: "Note added",
      description: n.content,
      timestamp: n.created_at,
      user_id: n.author_id,
      user_name: n.author_name,
    })),
    ...callLogs.map((c) => ({
      id: `call-${c.id}`,
      lead_id: c.lead_id,
      type: "call" as const,
      title: `${c.direction === "incoming" ? "Incoming" : "Outgoing"} call`,
      description: c.notes,
      timestamp: c.completed_at || c.scheduled_at,
      user_id: c.agent_id,
      user_name: c.agent_name,
    })),
    ...meetings.map((m) => ({
      id: `meeting-${m.id}`,
      lead_id: m.lead_id,
      type: "meeting" as const,
      title: "Meeting scheduled",
      description: m.title,
      timestamp: m.scheduled_at,
      user_id: m.agent_id,
      user_name: m.agent_name,
    })),
    ...tasks.map((t) => ({
      id: `task-${t.id}`,
      lead_id: t.lead_id,
      type: "task" as const,
      title: t.completed ? "Task completed" : "Task due",
      description: t.title,
      timestamp: t.due_date,
      user_id: t.assigned_to,
      user_name: t.assigned_to_name,
    })),
    ...emails.map((e) => ({
      id: `email-${e.id}`,
      lead_id: e.lead_id,
      type: "email" as const,
      title: "Email sent",
      description: e.subject,
      timestamp: e.sent_at,
      user_id: null,
      user_name: null,
    })),
  ];

  return (
    <AnimatedModal isOpen={!!lead} onClose={onClose} title={`${lead.first_name} ${lead.last_name}`}>
      <div className="border-b border-border px-6">
        <nav className="flex gap-6" aria-label="Lead detail tabs">
          {[
            { id: "overview", label: "Overview" },
            { id: "notes", label: "Notes" },
            { id: "activity", label: "Activity" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                 activeTab === tab.id
                   ? "border-primary text-primary"
                   : "border-transparent text-muted-foreground hover:text-foreground"
               }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "overview" && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
<Mail size={16} className="text-muted-foreground" />
                      <span className="text-foreground">{lead.email}</span>
                    </div>
<div className="flex items-center gap-2">
                       <Phone size={16} className="text-muted-foreground" />
                       <span className="text-foreground">{lead.phone ?? ""}</span>
                     </div>
                     {lead.value && lead.value > 0 && (
                       <div className="flex items-center gap-2">
                         <IndianRupee size={16} className="text-muted-foreground" />
                         <span className="text-foreground">
                           {(lead.value / 100000).toFixed(2)} Lakh
                         </span>
                       </div>
                     )}
                    {lead.assigned_to_name && (
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-muted-foreground" />
                        <span className="text-foreground">
                          Assigned to {lead.assigned_to_name}
                        </span>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>

            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                {tasks.filter((t) => !t.completed).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No upcoming tasks</p>
                ) : (
                  <div className="space-y-2">
                    {tasks
                      .filter((t) => !t.completed)
                      .slice(0, 5)
                      .map((task) => (
                        <div key={task.id} className="flex items-start gap-2">
                          <CheckSquare size={14} className="mt-0.5 text-muted-foreground" />
                          <div className="flex-1">
<p className="text-sm font-medium text-foreground">
                               {task.title}
                             </p>
<p className="text-xs text-muted-foreground">
                               Due {formatDate(task.due_date)}
                             </p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card variant="bordered" className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Calls</CardTitle>
              </CardHeader>
              <CardContent>
                {callLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No calls recorded</p>
                ) : (
                  <div className="space-y-3">
                    {callLogs.slice(0, 5).map((call) => (
<div key={call.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div className="flex items-center gap-3">
                          <Phone size={16} className="text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {call.direction === "incoming" ? "Incoming" : "Outgoing"} call
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(call.scheduled_at)} • {call.duration} min
                            </p>
                          </div>
                        </div>
                        <Badge variant={call.status === "completed" ? "success" : "outline"} size="sm">
                          {call.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "notes" && (
          <div className="space-y-4">
            <div>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                className="input w-full h-24 resize-none"
                rows={4}
              />
              <div className="mt-2 flex justify-end">
                <Button onClick={handleAddNote} loading={isAddingNote} disabled={!newNote.trim()}>
                  Add Note
                </Button>
              </div>
            </div>

{notes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notes yet</p>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <Card key={note.id} variant="bordered">
                    <CardContent className="p-4">
                      <p className="text-sm text-foreground">{note.content}</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>by {note.author_name || "Unknown"}</span>
                        <time>{formatDate(note.created_at)}</time>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "activity" && <LeadTimeline activities={activities} />}
      </div>
    </AnimatedModal>
  );
}