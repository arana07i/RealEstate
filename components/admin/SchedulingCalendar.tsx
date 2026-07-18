'use client';

import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay, addDays, addMonths, subMonths, isSameDay, isSameMonth, parseISO, addMinutes } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { VisitScheduler } from './VisitScheduler';
import type { Visit, CalendarEvent, VisitStatus, AgentAvailability } from '@/lib/types';

type CalendarView = 'month' | 'week' | 'day';

const statusColors: Record<VisitStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  rescheduled: 'bg-amber-100 text-amber-700 border-amber-200',
};

export function SchedulingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const queryClient = useQueryClient();

  const { data: visits } = useQuery({
    queryKey: ['visits', format(currentDate, 'yyyy-MM')],
    queryFn: async () => {
      const supabase = createClient();
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      const { data } = await supabase
        .from('visits')
        .select(`
          *,
          property: listings (title, location, price),
          lead: leads (first_name, last_name, email, phone),
          agent: profiles (full_name, email)
        `)
        .gte('scheduled_at', start.toISOString())
        .lte('scheduled_at', end.toISOString())
        .order('scheduled_at', { ascending: true });
      return data as Visit[] || [];
    },
  });

  const { data: agentAvailability } = useQuery({
    queryKey: ['agent-availability'],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('agent_availability')
        .select('*');
      return data as AgentAvailability[] || [];
    },
  });

  const calendarEvents = useMemo(() => {
    return visits?.map((visit) => ({
      id: visit.id,
      title: `${visit.property?.title || 'Property'} - ${visit.lead?.first_name || 'Lead'}`,
      start: parseISO(visit.scheduled_at),
      end: addMinutes(parseISO(visit.scheduled_at), visit.duration),
      resource: visit,
    })) || [];
  }, [visits]);

  const handleDrop = (date: Date, hour: number) => {
    const visitId = localStorage.getItem('draggedVisitId');
    if (visitId) {
      const visit = visits?.find(v => v.id === visitId);
      if (visit) {
        const newDate = new Date(date);
        newDate.setHours(hour, 0, 0, 0);
        updateVisitMutation.mutate({
          id: visit.id,
          scheduled_at: newDate.toISOString(),
        });
      }
      localStorage.removeItem('draggedVisitId');
    }
  };

  const updateVisitMutation = useMutation({
    mutationFn: async (data: { id: string; scheduled_at?: string; status?: VisitStatus }) => {
      const supabase = createClient();
      const updates: Record<string, string | undefined> = {};
      if (data.scheduled_at) updates.scheduled_at = data.scheduled_at;
      if (data.status) updates.status = data.status;
      const { error } = await supabase.from('visits').update(updates).eq('id', data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });

  const handleStatusChange = (visit: Visit, newStatus: VisitStatus) => {
    updateVisitMutation.mutate({ id: visit.id, status: newStatus });
  };

  const openScheduler = (date?: Date) => {
    setSelectedDate(date);
    setSelectedVisit(null);
    setShowScheduler(true);
  };

  const openVisitEditor = (visit: Visit) => {
    setSelectedVisit(visit);
    setSelectedDate(undefined);
    setShowScheduler(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-primary">Visit Calendar</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            >
              <ChevronLeft size={16} />
            </Button>
            <h2 className="text-xl font-semibold text-foreground min-w-48 text-center">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border p-1">
            {(['month', 'week', 'day'] as CalendarView[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 rounded text-sm font-medium capitalize ${
                  view === v ? 'bg-accent text-primary-dark' : 'text-foreground hover:bg-muted'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <Button onClick={() => openScheduler(new Date())}>
            <Plus size={16} />
            Schedule Visit
          </Button>
        </div>
      </div>

      {view === 'month' && (
        <MonthlyView
          currentDate={currentDate}
          events={calendarEvents}
          onDateClick={openScheduler}
          onEventClick={openVisitEditor}
        />
      )}

      {view === 'week' && (
        <WeeklyView
          currentDate={currentDate}
          events={calendarEvents}
          onTimeSlotClick={openScheduler}
          onEventClick={openVisitEditor}
        />
      )}

      {view === 'day' && (
        <DailyView
          currentDate={currentDate}
          events={calendarEvents}
          onTimeSlotClick={openScheduler}
          onEventClick={openVisitEditor}
        />
      )}

      <AvailabilityLegend availability={agentAvailability || []} />

      <VisitScheduler
        isOpen={showScheduler}
        onClose={() => setShowScheduler(false)}
        selectedDate={selectedDate}
        visit={selectedVisit}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['visits'] })}
      />
    </div>
  );
}

function MonthlyView({
  currentDate,
  events,
  onDateClick,
  onEventClick,
}: {
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (visit: Visit) => void;
}) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const weeks: Date[][] = [];
  let week: Date[] = [];
  let day = startDate;

  while (day <= endDate) {
    week.push(day);
    day = addDays(day, 1);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  const getDayEvents = (day: Date) => {
    return events.filter((event) => isSameDay(event.start, day));
  };

  return (
    <Card variant="premium">
      <CardContent className="p-4">
        <div className="grid grid-cols-7 gap-px bg-border">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName) => (
            <div key={dayName} className="bg-muted p-2 text-center text-sm font-semibold">
              {dayName}
            </div>
          ))}
          {weeks.map((week, wi) =>
            week.map((day) => {
              const dayEvents = getDayEvents(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              return (
                <div
                  key={`${wi}-${day.toISOString()}`}
                  className={`min-h-32 bg-card p-2 cursor-pointer hover:bg-muted/50 ${
                    !isCurrentMonth ? 'opacity-40' : ''
                  }`}
                  onClick={() => onDateClick(day)}
                >
                  <span className={`text-sm font-medium ${
                    isSameDay(day, new Date()) ? 'text-accent' : 'text-muted-foreground'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <button
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event.resource!);
                        }}
                        className={`w-full rounded px-2 py-1 text-left text-xs transition-all ${statusColors[event.resource!.status]}`}
                        draggable
                        onDragStart={(e) => {
                          localStorage.setItem('draggedVisitId', event.id);
                        }}
                      >
                        <div className="truncate font-medium">
                          {format(event.start, 'HH:mm')} - {event.resource!.lead?.first_name || 'Client'}
                        </div>
                      </button>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-xs text-muted-foreground">+{dayEvents.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function WeeklyView({
  currentDate,
  events,
  onTimeSlotClick,
  onEventClick,
}: {
  currentDate: Date;
  events: CalendarEvent[];
  onTimeSlotClick: (date: Date) => void;
  onEventClick: (visit: Visit) => void;
}) {
  const weekStart = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getDayEvents = (day: Date) => {
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    return events.filter((event) => event.start >= dayStart && event.start < dayEnd);
  };

  const formatHour = (hour: number) => {
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    return format(date, 'HH:mm');
  };

  return (
    <Card variant="premium">
      <CardContent className="p-2">
        <div className="max-h-[600px] overflow-y-auto">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-muted">
              <tr>
                <th className="p-2 text-sm font-semibold text-foreground border border-border">Time</th>
                {weekDays.map((day) => (
                  <th key={day.toISOString()} className="p-2 text-sm font-semibold text-foreground border border-border">
                    {format(day, 'EEE d')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hours.map((hour) => (
                <tr key={hour}>
                  <td className="p-2 text-xs text-muted-foreground border border-border w-20">
                    {formatHour(hour)}
                  </td>
                  {weekDays.map((day) => {
                    const dayEvents = getDayEvents(day).filter(
                      (e) => e.start.getHours() === hour
                    );
                    return (
                      <td
                        key={`${day.toISOString()}-${hour}`}
                        className="border border-border p-1 h-16 align-top cursor-pointer hover:bg-muted/50"
                        onClick={() => onTimeSlotClick(new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, 0, 0))}
                      >
                        {dayEvents.map((event) => (
                          <button
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick(event.resource!);
                            }}
                            className={`w-full rounded px-2 py-1 text-left text-xs transition-all ${statusColors[event.resource!.status]}`}
                          >
                            <div className="truncate font-medium">
                              {event.resource!.lead?.first_name || 'Client'}
                            </div>
                          </button>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function DailyView({
  currentDate,
  events,
  onTimeSlotClick,
  onEventClick,
}: {
  currentDate: Date;
  events: CalendarEvent[];
  onTimeSlotClick: (date: Date) => void;
  onEventClick: (visit: Visit) => void;
}) {
  const dayEvents = events.filter(
    (event) => isSameDay(event.start, currentDate)
  );
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const formatHourAm = (hour: number) => {
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    return format(date, 'ha');
  };

  return (
    <Card variant="premium">
      <CardHeader>
        <CardTitle>{format(currentDate, 'EEEE, MMMM d, yyyy')}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {hours.map((hour) => {
            const hourEvents = dayEvents.filter(
              (e) => e.start.getHours() === hour
            );
            return (
              <div
                key={hour}
                className="grid grid-cols-12 gap-4 border-t border-border py-2 cursor-pointer hover:bg-muted/50"
                onClick={() => onTimeSlotClick(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), hour, 0, 0))}
              >
                <div className="col-span-2 text-sm font-medium text-muted-foreground">
                  {formatHourAm(hour)}
                </div>
                <div className="col-span-10">
                  {hourEvents.map((event) => (
                    <button
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event.resource!);
                      }}
                      className={`mb-2 block w-full rounded-lg border px-4 py-2 text-left transition-all ${statusColors[event.resource!.status]}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {event.resource!.lead?.first_name} {event.resource!.lead?.last_name}
                        </span>
                        <span className="text-xs">
                          {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                        </span>
                      </div>
                      <p className="mt-1 text-xs">{event.resource!.property?.title}</p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

interface AgentInfo {
  id: string;
  full_name: string;
}

function AvailabilityLegend({ availability }: { availability: AgentAvailability[] }) {
  const { data: agents } = useQuery({
    queryKey: ['agents-for-legend'],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase.from('profiles').select('id, full_name').eq('role', 'agent');
      return data as AgentInfo[] || [];
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Agent Availability</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid gap-4 md:grid-cols-2">
          {agents?.map((agent) => {
            const agentAvail = availability.filter((a) => a.agent_id === agent.id);
            const workingDays = agentAvail
              .filter((a) => a.is_available)
              .map((a) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][a.day_of_week]);
            return (
              <div key={agent.id} className="flex items-center justify-between rounded-lg bg-muted p-3">
                <span className="font-medium text-foreground">{agent.full_name}</span>
                <span className="text-sm text-muted-foreground">
                  {workingDays.length > 0 ? `${workingDays.join(', ')}` : 'Not set'}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}