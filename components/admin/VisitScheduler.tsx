'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, User, Home, Video, Bell, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Visit, VisitFormData, VisitStatus, ReminderType } from '@/lib/types';

interface VisitSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  visit?: Visit | null;
  onSuccess?: () => void;
}

export function VisitScheduler({ isOpen, onClose, selectedDate, visit, onSuccess }: VisitSchedulerProps) {
  const [formData, setFormData] = useState<VisitFormData>({
    property_id: '',
    lead_id: '',
    agent_id: '',
    scheduled_at: selectedDate ? format(selectedDate, "yyyy-MM-dd'T'HH:mm") : '',
    duration: 60,
    reminder_type: 'email',
    location: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const { data: properties } = useQuery({
    queryKey: ['properties-for-schedule'],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase.from('listings').select('id, title, location, price').eq('draft', false);
      return data || [];
    },
  });

  const { data: leads } = useQuery({
    queryKey: ['leads-for-schedule'],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase.from('leads').select('id, first_name, last_name, email, phone');
      return data || [];
    },
  });

  const { data: agents } = useQuery({
    queryKey: ['agents-for-schedule'],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase.from('profiles').select('id, full_name, email').eq('role', 'agent');
      return data || [];
    },
  });

  useEffect(() => {
    if (visit) {
      setFormData({
        property_id: visit.property_id,
        lead_id: visit.lead_id,
        agent_id: visit.agent_id,
        scheduled_at: format(new Date(visit.scheduled_at), "yyyy-MM-dd'T'HH:mm"),
        duration: visit.duration,
        reminder_type: visit.reminder_type,
        location: visit.location || '',
        notes: visit.description || '',
      });
    } else if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        scheduled_at: format(selectedDate, "yyyy-MM-dd'T'HH:mm"),
      }));
    }
  }, [visit, selectedDate]);

  const scheduleVisitMutation = useMutation({
    mutationFn: async (data: VisitFormData & { status?: VisitStatus }) => {
      const supabase = createClient();
      
      const visitData = {
        ...data,
        meeting_link: generateMeetingLink(),
      };

      if (visit?.id) {
        const { error } = await supabase
          .from('visits')
          .update(visitData)
          .eq('id', visit.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('visits').insert(visitData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      onSuccess?.();
      onClose();
    },
  });

  const generateMeetingLink = () => {
    const meetingId = Math.random().toString(36).substring(2, 15);
    return `https://meet.hcrealestate.com/${meetingId}`;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.property_id) newErrors.property_id = 'Property is required';
    if (!formData.lead_id) newErrors.lead_id = 'Lead is required';
    if (!formData.agent_id) newErrors.agent_id = 'Agent is required';
    if (!formData.scheduled_at) newErrors.scheduled_at = 'Date & time is required';
    if (!formData.location) newErrors.location = 'Location is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      scheduleVisitMutation.mutate(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-muted/90 dark:bg-muted p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{visit ? 'Edit Visit' : 'Schedule Visit'}</CardTitle>
<button onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent transition-colors">
             <X size={20} />
           </button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Home size={16} /> Property
              </label>
<select
                 value={formData.property_id}
                 onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
                 className="w-full rounded-lg border border-border px-3 py-2 bg-card dark:bg-muted dark:border-border"
                 disabled={!!visit}
               >
                <option value="">Select Property</option>
                {properties?.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
              {errors.property_id && <p className="text-xs text-red-500 mt-1">{errors.property_id}</p>}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <User size={16} /> Lead
              </label>
<select
                 value={formData.lead_id}
                 onChange={(e) => setFormData({ ...formData, lead_id: e.target.value })}
                 className="w-full rounded-lg border border-border px-3 py-2 bg-card dark:bg-muted dark:border-border"
                 disabled={!!visit}
               >
                <option value="">Select Lead</option>
                {leads?.map((l: any) => (
                  <option key={l.id} value={l.id}>
                    {l.first_name} {l.last_name}
                  </option>
                ))}
              </select>
              {errors.lead_id && <p className="text-xs text-red-500 mt-1">{errors.lead_id}</p>}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <User size={16} /> Agent
              </label>
<select
                 value={formData.agent_id}
                 onChange={(e) => setFormData({ ...formData, agent_id: e.target.value })}
                 className="w-full rounded-lg border border-border px-3 py-2 bg-card dark:bg-muted dark:border-border"
               >
                <option value="">Select Agent</option>
                {agents?.map((a: any) => (
                  <option key={a.id} value={a.id}>{a.full_name}</option>
                ))}
              </select>
              {errors.agent_id && <p className="text-xs text-red-500 mt-1">{errors.agent_id}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <CalendarIcon size={16} /> Date & Time
                </label>
<input
                   type="datetime-local"
                   value={formData.scheduled_at}
                   onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                   className="w-full rounded-lg border border-border px-3 py-2 bg-card dark:bg-muted dark:border-border"
                 />
                {errors.scheduled_at && <p className="text-xs text-red-500 mt-1">{errors.scheduled_at}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Clock size={16} /> Duration
                </label>
<select
                   value={formData.duration}
                   onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                   className="w-full rounded-lg border border-border px-3 py-2 bg-card dark:bg-muted dark:border-border"
                 >
                  <option value={30}>30 min</option>
                  <option value={60}>60 min</option>
                  <option value={90}>90 min</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Video size={16} /> Location
              </label>
<input
                 type="text"
                 value={formData.location}
                 onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                 placeholder="Property address or meeting link"
                 className="w-full rounded-lg border border-border px-3 py-2 bg-card dark:bg-muted dark:border-border"
               />
              {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Bell size={16} /> Reminder
              </label>
<select
                 value={formData.reminder_type}
                 onChange={(e) => setFormData({ ...formData, reminder_type: e.target.value as ReminderType })}
                 className="w-full rounded-lg border border-border px-3 py-2 bg-card dark:bg-muted dark:border-border"
               >
                <option value="email">Email Reminder</option>
                <option value="sms">SMS Reminder</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes for the visit"
                rows={3}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card dark:bg-muted dark:border-border resize-none"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1" loading={scheduleVisitMutation.isPending}>
                <Check size={16} />
                {visit ? 'Update Visit' : 'Schedule Visit'}
              </Button>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}