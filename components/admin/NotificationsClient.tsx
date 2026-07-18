"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, CheckCheck, Settings, BellOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { NotificationItem } from "./NotificationItem";
import { NotificationFiltersComponent } from "./NotificationFilters";
import type { Notification, NotificationFilters, NotificationSettings } from "@/lib/types";
import { useRole } from "@/components/RoleProvider";
import { cn } from "@/lib/utils";

const defaultSettings: NotificationSettings = {
  sound_enabled: true,
  push_enabled: true,
  email_digest: false,
  types: {
    inquiry: true,
    lead: true,
    listing: true,
    visit: true,
    message: true,
    system: true,
    billing: true,
    user: true,
  },
};

export function NotificationsClient() {
  const { role } = useRole();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filters, setFilters] = useState<NotificationFilters>({});
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type?.length) params.set('type', filters.type.join(','));
      if (filters.priority?.length) params.set('priority', filters.priority.join(','));
      if (filters.read !== undefined) params.set('read', String(filters.read));
      if (filters.date_range) params.set('date_range', filters.date_range);
      if (filters.search) params.set('search', filters.search);

      const response = await fetch(`/api/admin/notifications?${params}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    let result = true;

    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result && (n.title.toLowerCase().includes(search) || n.message.toLowerCase().includes(search));
    }

    if (filters.type?.length) {
      result = result && filters.type.includes(n.type);
    }

    if (filters.priority?.length) {
      result = result && filters.priority.includes(n.priority);
    }

    if (filters.read !== undefined) {
      result = result && n.read === filters.read;
    }

    if (filters.date_range && filters.date_range !== "all") {
      const now = new Date();
      const cutoff = new Date();
      switch (filters.date_range) {
        case "today":
          cutoff.setHours(0, 0, 0, 0);
          break;
        case "week":
          cutoff.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoff.setMonth(now.getMonth() - 1);
          break;
      }
      result = result && new Date(n.created_at) >= cutoff;
    }

    return result;
  });

  const playSound = useCallback(() => {
    if (settings.sound_enabled && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [settings.sound_enabled]);

  useEffect(() => {
    const lowPriorityUnread = notifications.filter(n => !n.read && n.priority === "high");
    if (lowPriorityUnread.length > 0) {
      playSound();
    }
  }, [notifications, playSound]);

  useEffect(() => {
    if (!("Notification" in window)) return;

    const checkAndRequestPermission = async () => {
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }
    };
    checkAndRequestPermission();

    const interval = setInterval(() => {
      setLastUpdated(new Date());
      const highPriorityNotifications = notifications.filter(
        (n) => !n.read && n.priority === "high"
      );
      if (settings.push_enabled && Notification.permission === "granted" && highPriorityNotifications.length > 0) {
        const randomNotif = highPriorityNotifications[Math.floor(Math.random() * highPriorityNotifications.length)];
        new Notification(randomNotif.title, {
          body: randomNotif.message,
          icon: "/favicon.ico",
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [notifications, settings.push_enabled]);

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    
    try {
      await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      });
    } catch (error) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    
    try {
      await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: unreadIds }),
      });
    } catch (error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: false })));
    }
  };

  const handleDelete = async (id: string) => {
    const deletedNotification = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    
    try {
      await fetch('/api/admin/notifications?ids=' + id, {
        method: 'DELETE',
      });
    } catch (error) {
      if (deletedNotification) {
        setNotifications((prev) => [...prev, deletedNotification]);
      }
    }
  };

  const handleSettingsChange = (newSettings: Partial<NotificationSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const groupedNotifications = filteredNotifications.reduce<Record<string, Notification[]>>((acc, n) => {
    const date = new Date(n.created_at).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(n);
    return acc;
  }, {});

  const groupLabels = Object.keys(groupedNotifications).map((date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString();
  });

  return (
    <div className="space-y-6">
      <audio ref={audioRef} src="/sounds/notification.mp3" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="h-8 w-8 text-primary" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-primary-dark">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
          <div>
<h1 className="text-3xl font-bold text-primary">
               Notifications
             </h1>
             <p className="text-muted-foreground mt-1">
               Stay updated with your activity
             </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium",
            isConnected ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
          )}>
            <span className={cn(
              "h-2 w-2 rounded-full",
              isConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
            )} />
            {isConnected ? "Live" : "Offline"}
          </div>
          
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4" />
            Settings
          </Button>

          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      <NotificationFiltersComponent filters={filters} onFiltersChange={setFilters} />

      <div className="space-y-4">
        {Object.entries(groupedNotifications).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
<BellOff className="h-12 w-12 text-muted-foreground" />
             <h3 className="mt-4 text-lg font-medium text-foreground">
               No notifications found
             </h3>
             <p className="mt-2 text-sm text-muted-foreground">
               Try adjusting your filters or check back later.
             </p>
          </div>
        ) : (
          Object.entries(groupedNotifications).map(([date, notifs], idx) => (
            <div key={date}>
<h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                 {groupLabels[idx]}
               </h3>
              <div className="space-y-2">
                {notifs.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={handleMarkRead}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4">
          <Card variant="elevated" className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                    Sound Alerts
                  </span>
                  <button
                    onClick={() => handleSettingsChange({ sound_enabled: !settings.sound_enabled })}
                    className={cn(
                      "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                      settings.sound_enabled ? "bg-accent" : "bg-muted dark:bg-muted"
                    )}
                  >
                    <span className={cn(
                      "inline-block h-3 w-3 rounded-full bg-white transition-transform",
                      settings.sound_enabled ? "translate-x-5" : "translate-x-1"
                    )} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                    Push Notifications
                  </span>
                  <button
                    onClick={() => handleSettingsChange({ push_enabled: !settings.push_enabled })}
                    className={cn(
                      "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                      settings.push_enabled ? "bg-accent" : "bg-muted dark:bg-muted"
                    )}
                  >
                    <span className={cn(
                      "inline-block h-3 w-3 rounded-full bg-white transition-transform",
                      settings.push_enabled ? "translate-x-5" : "translate-x-1"
                    )} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                    Email Digest
                  </span>
                  <button
                    onClick={() => handleSettingsChange({ email_digest: !settings.email_digest })}
                    className={cn(
                      "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                      settings.email_digest ? "bg-accent" : "bg-muted dark:bg-muted"
                    )}
                  >
                    <span className={cn(
                      "inline-block h-3 w-3 rounded-full bg-white transition-transform",
                      settings.email_digest ? "translate-x-5" : "translate-x-1"
                    )} />
                  </button>
                </div>
              </div>

<div className="border-t pt-4 border-border">
                 <h4 className="mb-3 text-sm font-semibold text-foreground">
                   Notification Types
                 </h4>
                 <div className="space-y-2">
                   {TYPE_OPTIONS.map((option) => (
                     <div key={option.value} className="flex items-center justify-between">
                       <span className="text-sm text-muted-foreground">
                         {option.label}
                       </span>
                      <button
                        onClick={() => handleSettingsChange({
                          types: { ...settings.types, [option.value]: !settings.types[option.value] }
                        })}
                        className={cn(
                          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                          settings.types[option.value] ? "bg-accent" : "bg-muted dark:bg-muted"
                        )}
                      >
                        <span className={cn(
                          "inline-block h-3 w-3 rounded-full bg-white transition-transform",
                          settings.types[option.value] ? "translate-x-5" : "translate-x-1"
                        )} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={() => setShowSettings(false)}>
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

const TYPE_OPTIONS: { value: "inquiry" | "lead" | "listing" | "visit" | "message" | "system" | "billing" | "user"; label: string }[] = [
  { value: "inquiry", label: "Inquiries" },
  { value: "lead", label: "Leads" },
  { value: "listing", label: "Listings" },
  { value: "visit", label: "Visits" },
  { value: "message", label: "Messages" },
  { value: "system", label: "System" },
  { value: "billing", label: "Billing" },
  { value: "user", label: "Users" },
];