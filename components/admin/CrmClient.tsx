"use client";

import { useState, useEffect, useMemo } from "react";
import { CrmPipeline } from "./CrmPipeline";
import { LeadFiltersComponent } from "./LeadFilters";
import { LeadDetailModal } from "./LeadDetailModal";
import type { Lead, LeadFilters, LeadNote, CallLog, Meeting, LeadTask, EmailHistory } from "@/lib/types";
import { toast } from "react-hot-toast";

export default function CrmClient() {
  const [filters, setFilters] = useState<LeadFilters>({});
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [tasks, setTasks] = useState<LeadTask[]>([]);
  const [emails, setEmails] = useState<EmailHistory[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [filters]);

  useEffect(() => {
    if (selectedLead) {
      fetchLeadDetails(selectedLead.id);
    }
  }, [selectedLead]);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      if (filters.status && filters.status.length > 0) {
        filters.status.forEach(s => searchParams.append('status', s));
      }
      if (filters.source && filters.source.length > 0) {
        filters.source.forEach(s => searchParams.append('source', s));
      }
      if (filters.tags && filters.tags.length > 0) {
        filters.tags.forEach(t => searchParams.append('tags', t));
      }
      if (filters.assigned_to) {
        searchParams.set('assigned_to', filters.assigned_to);
      }
      if (filters.search) {
        searchParams.set('search', filters.search);
      }
      if (filters.date_range) {
        searchParams.set('date_range', filters.date_range);
      }
      if (filters.value_min !== undefined) {
        searchParams.set('value_min', filters.value_min.toString());
      }
      if (filters.value_max !== undefined) {
        searchParams.set('value_max', filters.value_max.toString());
      }

      const response = await fetch(`/api/admin/leads?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }
      const data = await response.json();
      setLeads(data.leads || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leads');
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeadDetails = async (leadId: string) => {
    setDetailLoading(true);
    try {
      const [notesRes, callLogsRes, meetingsRes, tasksRes, emailsRes] = await Promise.all([
        fetch(`/api/admin/leads/${leadId}/notes`),
        fetch(`/api/admin/leads/${leadId}/call-logs`),
        fetch(`/api/admin/leads/${leadId}/meetings`),
        fetch(`/api/admin/leads/${leadId}/tasks`),
        fetch(`/api/admin/leads/${leadId}/emails`),
      ]);

      if (notesRes.ok) {
        const notesData = await notesRes.json();
        setNotes(notesData.notes || []);
      } else {
        setNotes([]);
      }

      if (callLogsRes.ok) {
        const callLogsData = await callLogsRes.json();
        setCallLogs(callLogsData.callLogs || []);
      } else {
        setCallLogs([]);
      }

      if (meetingsRes.ok) {
        const meetingsData = await meetingsRes.json();
        setMeetings(meetingsData.meetings || []);
      } else {
        setMeetings([]);
      }

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData.tasks || []);
      } else {
        setTasks([]);
      }

      if (emailsRes.ok) {
        const emailsData = await emailsRes.json();
        setEmails(emailsData.emails || []);
      } else {
        setEmails([]);
      }
    } catch {
      toast.error('Failed to load lead details');
      setNotes([]);
      setCallLogs([]);
      setMeetings([]);
      setTasks([]);
      setEmails([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredLeads = useMemo(() => {
    return leads;
  }, [leads]);

  const handleExport = () => {
    const csv = [
      ["Name", "Email", "Phone", "Status", "Source", "Value", "Tags"],
      ...filteredLeads.map((l) => [
        `${l.first_name} ${l.last_name}`,
        l.email,
        l.phone,
        l.status,
        l.source,
        l.value.toString(),
        l.tags.map((t) => t.name).join(", "),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Exported leads to CSV");
  };

  const handleBulkAction = async (action: string) => {
    if (selectedLeads.length === 0) return;

    switch (action) {
      case "assign":
        toast("Assign to agent feature coming soon");
        break;
      case "status":
        toast("Change status feature coming soon");
        break;
      case "delete":
        if (confirm(`Delete ${selectedLeads.length} leads?`)) {
          try {
            await Promise.all(
              selectedLeads.map(leadId =>
                fetch('/api/admin/leads', {
                  method: 'DELETE',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: leadId }),
                })
              )
            );
            toast.success("Leads deleted");
            setLeads(leads.filter(l => !selectedLeads.includes(l.id)));
            setSelectedLeads([]);
          } catch {
            toast.error("Failed to delete leads");
          }
        }
        break;
    }
  };

  const handleStatusChange = async (leadId: string, status: string) => {
    try {
      const response = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, status }),
      });
      if (response.ok) {
        const data = await response.json();
        setLeads(leads.map(l => l.id === leadId ? { ...l, status: data.lead.status, updated_at: data.lead.updated_at } : l));
        toast.success("Status updated");
      } else {
        toast.error("Failed to update status");
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground dark:text-muted-foreground">CRM</h1>
<p className="mt-1 text-muted-foreground">
           Manage your sales pipeline and track lead interactions
         </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
          {error}
        </div>
      )}

      <LeadFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        onExport={handleExport}
        onBulkAction={handleBulkAction}
        selectedLeads={selectedLeads}
      />

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <CrmPipeline leads={filteredLeads} onLeadClick={setSelectedLead} onStatusChange={handleStatusChange} />
      )}

      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          notes={notes}
          callLogs={callLogs}
          meetings={meetings}
          tasks={tasks}
          emails={emails}
          onClose={() => setSelectedLead(null)}
          onLeadUpdate={() => selectedLead && fetchLeadDetails(selectedLead.id)}
          loading={detailLoading}
        />
      )}
    </div>
  );
}