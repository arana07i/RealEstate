'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRole } from '@/components/RoleProvider';
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  CreditCard,
  Settings,
  Users,
  LogOut,
  Home,
  UsersRound,
  BarChart3,
  CalendarDays,
  Mail,
  Bell,
  User,
  FileText,
  Key,
  Zap,
  LinkIcon,
  Palette,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true, permission: null },
  { href: '/admin/profile', label: 'Profile', icon: User, exact: false, permission: null },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, exact: false, permission: 'view_analytics' },
  { href: '/admin/usage', label: 'Usage', icon: BarChart3, exact: false, permission: 'view_analytics' },
  { href: '/admin/listings', label: 'Listings', icon: Building2, exact: false, permission: 'view_listings' },
  { href: '/admin/inquiries', label: 'Inquiries', icon: MessageSquare, exact: false, permission: 'view_inquiries' },
  { href: '/admin/crm', label: 'CRM', icon: UsersRound, exact: false, permission: 'view_leads' },
  { href: '/admin/messages', label: 'Messages', icon: Mail, exact: false, permission: 'view_leads' },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell, exact: false, permission: null },
  { href: '/admin/calendar', label: 'Calendar', icon: CalendarDays, exact: false, permission: 'view_visits' },
  { href: '/admin/billing', label: 'Billing', icon: CreditCard, exact: false, permission: 'manage_billing' },
  { href: '/admin/invoices', label: 'Invoices', icon: FileText, exact: false, permission: 'manage_billing' },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: FileText, exact: false, permission: 'view_audit_logs' },
  { href: '/admin/api-keys', label: 'API Keys', icon: Key, exact: false, permission: 'manage_api_keys' },
  { href: '/admin/webhooks', label: 'Webhooks', icon: LinkIcon, exact: false, permission: 'manage_webhooks' },
  { href: '/admin/automation', label: 'Automation', icon: Zap, exact: false, permission: 'manage_automation' },
  { href: '/admin/branding', label: 'Branding', icon: Palette, exact: false, permission: 'manage_settings' },
  { href: '/admin/settings', label: 'Settings', icon: Settings, exact: false, permission: 'manage_settings' },
  { href: '/admin/users', label: 'Users', icon: Users, exact: false, permission: 'manage_users' },
];

const sidebarVariants = {
  hidden: { x: -100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const navItemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
};

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { hasPermission, role } = useRole();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const visibleNavItems = navItems.filter((item) => {
    if (!item.permission) return true;
    if (role === 'super_admin') return true;
    return hasPermission(item.permission);
  });

  const isActive = (item: typeof navItems[0]) =>
    item.exact ? pathname === item.href : (pathname?.startsWith(item.href) ?? false);

  return (
    <>
      {/* Mobile Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="lg:hidden border-b border-border bg-card"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-xs font-bold text-primary">
              HC
            </span>
            <span className="text-sm font-bold text-primary">Admin</span>
          </Link>
          <motion.button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-xl"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-lg">{mobileOpen ? '✕' : '☰'}</span>
          </motion.button>
        </div>
      </motion.header>

      {/* Desktop Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        className="hidden w-64 flex-col border-r border-border bg-card px-4 py-6 lg:flex"
      >
        <Link href="/admin" className="flex items-center gap-3 px-2 py-4">
          <motion.span
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-sm font-bold text-primary"
          >
            HC
          </motion.span>
          <span>
            <span className="block text-sm font-bold text-primary">Admin Portal</span>
          </span>
        </Link>

        <nav className="mt-8 flex flex-col gap-1" aria-label="Admin">
          {visibleNavItems.map((item, i) => {
            const active = isActive(item);
            return (
              <motion.div key={item.href} variants={navItemVariants} custom={i}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
                    active
                      ? 'bg-accent/10 text-accent'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-primary'
                  }`}
                >
                  <motion.span whileHover={{ scale: 1.1 }} transition={{ duration: 0.1 }}>
                    <item.icon size={18} />
                  </motion.span>
                  <span>{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className="mt-auto pt-6">
          <motion.button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <LogOut size={18} />
            Sign Out
          </motion.button>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 mt-1"
          >
            <Home size={18} />
            View Site
          </Link>
        </div>
      </motion.aside>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-40 w-64 flex-col gap-2 border-r border-border bg-card p-4 lg:hidden"
            aria-label="Mobile admin navigation"
          >
            <Link href="/admin" className="flex items-center gap-2 px-2 py-4" onClick={() => setMobileOpen(false)}>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-xs font-bold text-primary">
                HC
              </span>
              <span className="text-sm font-bold text-primary">Admin</span>
            </Link>

            <div className="flex flex-col gap-1">
              {visibleNavItems.map((item, i) => {
                const active = isActive(item);
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
                        active
                          ? 'bg-accent/10 text-accent'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-primary'
                      }`}
                    >
                      <item.icon size={18} />
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-auto pt-4">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}