'use client';

import { Check } from 'lucide-react';
import { useState } from 'react';
import { InquiryForm } from './InquiryForm';

interface ScheduleVisitSidebarProps {
  propertyId: string;
  propertyTitle: string;
  agencyId: string;
}

const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'];

export function ScheduleVisitSidebar({ propertyId, propertyTitle, agencyId }: ScheduleVisitSidebarProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [preferredContact, setPreferredContact] = useState('call');

  return (
    <aside className="card h-fit p-6">
      <h2 className="text-lg font-semibold text-primary">Schedule a Visit</h2>
      <p className="mt-2 text-sm text-muted-foreground">Choose your preferred date and time</p>

      <div className="mt-6 space-y-5">
        <div>
          <label htmlFor="visit-date" className="label">
            Preferred Date
          </label>
          <input
            type="date"
            id="visit-date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div>
          <label className="label">Preferred Time</label>
          <div className="grid grid-cols-3 gap-2.5">
            {TIME_SLOTS.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => setSelectedTime(time)}
className={`rounded-xl border px-2 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent focus-visible:bg-accent/10 ${
                      selectedTime === time
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border text-muted-foreground hover:border-accent/50 hover:bg-accent/5 dark:border-border dark:text-muted-foreground dark:hover:border-accent/50 dark:hover:bg-accent/10'
                    }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Contact Method</label>
          <div className="flex gap-2.5">
            {['call', 'email', 'whatsapp'].map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPreferredContact(method)}
className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium capitalize transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent focus-visible:bg-accent/10 ${
                      preferredContact === method
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border text-muted-foreground hover:border-accent/50 hover:bg-accent/5 dark:border-border dark:text-muted-foreground dark:hover:border-accent/50 dark:hover:bg-accent/10'
                    }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        <InquiryForm propertyId={propertyId} agencyId={agencyId} />

        <div className="space-y-2.5 pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Check size={14} className="text-emerald-500" />
            Free property visit
          </div>
          <div className="flex items-center gap-2">
            <Check size={14} className="text-emerald-500" />
            No obligation
          </div>
          <div className="flex items-center gap-2">
            <Check size={14} className="text-emerald-500" />
            Flexible timing
          </div>
        </div>
      </div>
    </aside>
  );
}