'use client';

import { useQuery } from '@tanstack/react-query';
import { Building2, CreditCard, Users, Plus, TrendingUp, TrendingDown, Clock, AlertCircle, CheckCircle2, Shield, Cpu, Database, RefreshCw, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PermissionGate } from '@/components/PermissionGate';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/lib/types';

interface Listing {
  id: string;
  status: string;
  price: number;
  views: number;
  created_at: string;
}

interface DashboardData {
  listings: Listing[];
  inquiries: Inquiry[];
  agents: Profile[];
}

interface RevenueData {
  month: string;
  revenue: number;
}

interface LeadData {
  stage: string;
  count: number;
}

interface PropertyView {
  property: string;
  views: number;
  engagement: number;
}

interface Agent {
  id: string;
  name: string;
  avatar?: string;
  sales: number;
  revenue: number;
  rating: number;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

interface Inquiry {
  id: string;
  name: string;
  property: string;
  status: 'new' | 'contacted' | 'closed' | 'spam';
  created_at: string;
  amount?: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  time: string;
}

interface Task {
  id: string;
  title: string;
  due: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

interface Visit {
  id: string;
  property: string;
  client: string;
  date: string;
  time: string;
}

const fetchDashboardData = async () => {
  const supabase = createClient();
  
  const [
    listingsResult,
    inquiriesResult,
    usersResult,
  ] = await Promise.all([
    supabase.from('listings').select('id, status, price, views, created_at').eq('draft', false),
    supabase.from('inquiries').select('id, name, status, created_at, property_id').order('created_at', { ascending: false }).limit(5),
    supabase.from('profiles').select('id, full_name, avatar_url').eq('role', 'agent').limit(5),
  ]);

  return {
    listings: listingsResult.data || [],
    inquiries: inquiriesResult.data || [],
    agents: usersResult.data || [],
  };
};

const generateRevenueData = (): RevenueData[] => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  return months.map((month, i) => ({
    month,
    revenue: Math.floor(80000 + i * 15000 + Math.random() * 20000),
  }));
};

const generateLeadFunnel = (): LeadData[] => [
  { stage: 'Leads', count: 245 },
  { stage: 'Qualified', count: 180 },
  { stage: 'Viewed', count: 120 },
  { stage: 'Negotiating', count: 75 },
  { stage: 'Closed', count: 45 },
];

const generatePropertyViews = (): PropertyView[] => [
  { property: 'Luxury Villa', views: 1245, engagement: 85 },
  { property: 'Penthouse', views: 892, engagement: 72 },
  { property: 'Townhouse', views: 654, engagement: 63 },
  { property: 'Apartment', views: 512, engagement: 58 },
  { property: 'Condo', views: 378, engagement: 45 },
];

const generateMockAgents = (): Agent[] => [
  { id: '1', name: 'Sarah Johnson', sales: 24, revenue: 1250000, rating: 4.9, full_name: 'Sarah Johnson', email: '', avatar_url: null },
  { id: '2', name: 'Michael Chen', sales: 18, revenue: 980000, rating: 4.7, full_name: 'Michael Chen', email: '', avatar_url: null },
  { id: '3', name: 'Priya Sharma', sales: 15, revenue: 875000, rating: 4.8, full_name: 'Priya Sharma', email: '', avatar_url: null },
  { id: '4', name: 'David Wilson', sales: 12, revenue: 720000, rating: 4.6, full_name: 'David Wilson', email: '', avatar_url: null },
  { id: '5', name: 'Anita Patel', sales: 9, revenue: 560000, rating: 4.5, full_name: 'Anita Patel', email: '', avatar_url: null },
];

const generateMockInquiries = (): Inquiry[] => [
  { id: '1', name: 'Rajesh Kumar', property: 'Luxury Villa', status: 'new', created_at: '2026-07-15T10:30:00', amount: 1250000 },
  { id: '2', name: 'Meera Singh', property: 'Penthouse', status: 'contacted', created_at: '2026-07-14T15:45:00', amount: 850000 },
  { id: '3', name: 'Amit Desai', property: 'Townhouse', status: 'new', created_at: '2026-07-13T09:15:00', amount: 650000 },
  { id: '4', name: 'Neha Gupta', property: 'Apartment', status: 'closed', created_at: '2026-07-10T11:20:00', amount: 450000 },
  { id: '5', name: 'Rohit Malhotra', property: 'Condo', status: 'new', created_at: '2026-07-12T14:00:00', amount: 320000 },
];

const generateMockNotifications = (): Notification[] => [
  { id: '1', title: 'New lead assigned', message: 'Rajesh Kumar interested in Luxury Villa', priority: 'high', time: '5 min ago' },
  { id: '2', title: 'Booking confirmed', message: 'Penthouse viewing scheduled for tomorrow', priority: 'medium', time: '12 min ago' },
  { id: '3', title: 'Payment received', message: '$850K from Meera Singh', priority: 'high', time: '1 hour ago' },
  { id: '4', title: 'Property verified', message: 'Townhouse listing approved', priority: 'low', time: '2 hours ago' },
  { id: '5', title: 'System update', message: 'Scheduled maintenance complete', priority: 'low', time: '4 hours ago' },
];

const generateMockTasks = (): Task[] => [
  { id: '1', title: 'Follow up with Rajesh Kumar', due: 'Today, 5:00 PM', priority: 'high', completed: false },
  { id: '2', title: 'Schedule property viewing', due: 'Today, 3:00 PM', priority: 'high', completed: false },
  { id: '3', title: 'Send contract to Meera Singh', due: 'Tomorrow', priority: 'medium', completed: false },
  { id: '4', title: 'Update property listings', due: 'Jul 18', priority: 'low', completed: true },
  { id: '5', title: 'Review monthly analytics', due: 'Jul 19', priority: 'medium', completed: false },
];

const generateMockVisits = (): Visit[] => [
  { id: '1', property: 'Luxury Villa', client: 'Rajesh Kumar', date: 'Jul 18', time: '10:00 AM' },
  { id: '2', property: 'Penthouse', client: 'Meera Singh', date: 'Jul 18', time: '2:30 PM' },
  { id: '3', property: 'Townhouse', client: 'Amit Desai', date: 'Jul 19', time: '11:00 AM' },
];

const propertyTypeData = [
  { name: 'Villa', value: 35, color: '#3b82f6' },
  { name: 'Apartment', value: 40, color: '#10b981' },
  { name: 'Penthouse', value: 15, color: '#f59e0b' },
  { name: 'Townhouse', value: 10, color: '#8b5cf6' },
];

export default function AdminDashboardPage() {
  const { data, refetch } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: fetchDashboardData,
    refetchInterval: 30000,
  });

  const revenueData = useMemo(() => generateRevenueData(), []);
  const leadFunnel = useMemo(() => generateLeadFunnel(), []);
  const propertyViews = useMemo(() => generatePropertyViews(), []);
  const mockAgents = useMemo(() => generateMockAgents(), []);
  const mockInquiries = useMemo(() => generateMockInquiries(), []);
  const mockNotifications = useMemo(() => generateMockNotifications(), []);
  const mockTasks = useMemo(() => generateMockTasks(), []);
  const mockVisits = useMemo(() => generateMockVisits(), []);

  const totalListings = data?.listings?.length || 0;
  const activeListings = data?.listings?.filter((l: Listing) => l.status === 'active').length || 0;
  const soldListings = data?.listings?.filter((l: Listing) => l.status === 'sold').length || 0;
  const totalInquiries = data?.inquiries?.length || 0;
  const conversionRate = 18.3;
  const avgCommission = 2.4;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your business overview.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <RevenueCard
          title="Total Revenue"
          value="$2.4M"
          change={12.5}
          data={revenueData}
          color="#10b981"
        />
        <RevenueCard
          title="Active Listings"
          value={activeListings.toString()}
          change={8.2}
          data={revenueData.slice(0, 6)}
          color="#3b82f6"
        />
        <RevenueCard
          title="New Leads"
          value="245"
          change={-3.1}
          data={revenueData.map((d, i) => ({ month: d.month, revenue: 20 + i * 5 }))}
          color="#f59e0b"
        />
        <RevenueCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          change={5.4}
          data={revenueData.map((d, i) => ({ month: d.month, revenue: 12 + i * 2 }))}
          color="#8b5cf6"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card variant="premium" className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue for the current year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d4af37" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#d4af37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
<YAxis stroke="#64748b" tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
                   <Tooltip
                     contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                     formatter={(v: number) => [`$${(v / 1000000).toFixed(2)} M`, 'Revenue']}
                   />
                  <Area type="monotone" dataKey="revenue" stroke="#d4af37" strokeWidth={2} fill="url(#revenueGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card variant="premium" className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Leads Pipeline</CardTitle>
            <CardDescription>Sales funnel visualization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadFunnel} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" />
                  <YAxis type="category" dataKey="stage" stroke="#64748b" width={80} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {leadFunnel.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981'][i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card variant="premium" className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Property Performance</CardTitle>
            <CardDescription>Views and engagement metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={propertyViews}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="property" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="engagement" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card variant="premium" className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Top Agents</CardTitle>
            <CardDescription>Leaderboard based on sales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAgents.map((agent, index) => (
                <div key={agent.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-primary">{agent.name}</p>
                      <p className="text-sm text-muted-foreground">{agent.sales} sales</p>
                    </div>
                  </div>
                  <div className="text-right">
<p className="font-semibold text-primary">${(agent.revenue / 1000000).toFixed(1)}M</p>
                      <p className="text-sm text-muted-foreground">★ {agent.rating}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Inquiries</CardTitle>
            <CardDescription>Latest customer inquiries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockInquiries.map((inquiry) => (
<div key={inquiry.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium text-primary">{inquiry.name}</p>
                        <p className="text-sm text-muted-foreground">{inquiry.property}</p>
                      </div>
                  <Badge
                    variant={inquiry.status === 'new' ? 'info' : inquiry.status === 'contacted' ? 'warning' : inquiry.status === 'closed' ? 'success' : 'ghost'}
                    size="sm"
                  >
                    {inquiry.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Upcoming visits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockVisits.map((visit) => (
                <div key={visit.id} className="flex items-center gap-3">
                  <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-accent/10">
                    <span className="text-xs font-bold text-accent">{visit.date.split(' ')[0]}</span>
                    <span className="text-xs text-accent">{visit.date.split(' ')[1]}</span>
                  </div>
                  <div>
<p className="font-medium text-primary">{visit.client}</p>
                      <p className="text-sm text-muted-foreground">{visit.property}</p>
                      <p className="text-xs text-muted-foreground">{visit.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Recent activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockNotifications.map((notification) => (
                <div key={notification.id} className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      notification.priority === 'high' ? 'bg-red-100 text-red-600' :
                      notification.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {notification.priority === 'high' ? <AlertCircle size={14} /> :
                       notification.priority === 'medium' ? <Clock size={14} /> : <CheckCircle2 size={14} />}
                    </div>
                  </div>
                  <div>
<p className="text-sm font-medium text-primary">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                      <span className="text-xs text-muted-foreground">{notification.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
            <CardDescription>Tasks assigned to you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3">
<input
                     type="checkbox"
                     checked={task.completed}
                     readOnly
                     className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                   />
                   <div className="flex-1">
                     <span className={`text-sm font-medium ${task.completed ? 'text-muted-foreground line-through' : 'text-primary'}`}>
                       {task.title}
                     </span>
                     <p className="text-xs text-muted-foreground">{task.due}</p>
                   </div>
                  <Badge
                    variant={task.priority === 'high' ? 'sold' : task.priority === 'medium' ? 'warning' : 'outline'}
                    size="xs"
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Platform status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-primary">Uptime</span>
                </div>
                <span className="text-sm font-semibold text-emerald-600">99.9%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-primary">Performance</span>
                </div>
                <span className="text-sm font-semibold text-blue-600">98ms</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-primary">Database</span>
                </div>
                <span className="text-sm font-semibold text-purple-600">Healthy</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <PermissionGate permissions={['manage_listings', 'create_listings']}>
              <QuickActionButton href="/admin/listings/new" icon={Plus} label="Add Listing" />
            </PermissionGate>
            <PermissionGate permissions={['manage_listings', 'view_listings']}>
              <QuickActionButton href="/admin/listings" icon={Building2} label="View Listings" />
            </PermissionGate>
            <PermissionGate permissions={['manage_billing']}>
              <QuickActionButton href="/admin/billing" icon={CreditCard} label="Billing" />
            </PermissionGate>
            <PermissionGate permissions={['manage_users']}>
              <QuickActionButton href="/admin/users" icon={Users} label="Users" />
            </PermissionGate>
            <Link href="/" target="_blank" className="flex flex-col items-center justify-center p-4 rounded-xl bg-card ring-1 ring-border hover:shadow-md transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent mb-2">
                <ExternalLink size={24} />
              </div>
              <span className="text-sm font-medium text-primary">View Site</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <PropertyHeatmap views={propertyViews} />
        </div>
        <ConversionFunnel data={leadFunnel} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="premium">
          <CardHeader>
            <CardTitle>Property Types Distribution</CardTitle>
            <CardDescription>Listing breakdown by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={propertyTypeData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                  >
                    {propertyTypeData.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {propertyTypeData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="block h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.name} {item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RevenueCard({ title, value, change, data, color }: {
  title: string;
  value: string;
  change: number;
  data: { month: string; revenue: number }[];
  color: string;
}) {
  return (
    <Card variant="elevated" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={`flex items-center gap-1 text-sm font-medium ${change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(change)}%
        </div>
      </div>
      <p className="text-2xl font-bold text-primary mb-3">{value}</p>
      <div className="h-12">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line type="monotone" dataKey="revenue" stroke={color} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function QuickActionButton({ href, icon: Icon, label }: {
  href: string;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center p-4 rounded-xl bg-card ring-1 ring-border hover:shadow-md transition-all">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent mb-2">
        <Icon size={24} />
      </div>
      <span className="text-sm font-medium text-primary">{label}</span>
    </Link>
  );
}

function PropertyHeatmap({ views }: { views: PropertyView[] }) {
  const maxViews = Math.max(...views.map((v) => v.views));
  
  return (
    <Card variant="premium">
      <CardHeader>
        <CardTitle>Property Views Heatmap</CardTitle>
        <CardDescription>Engagement by property</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2">
          {views.map((view, i) => {
            const intensity = view.views / maxViews;
            return (
              <div
                key={view.property}
                className="aspect-square rounded-lg p-3 transition-all hover:scale-105 cursor-pointer"
                style={{
                  backgroundColor: `rgba(212, 175, 55, ${0.2 + intensity * 0.8})`,
                }}
              >
                <p className="text-xs font-semibold text-primary truncate">{view.property}</p>
                <p className="text-lg font-bold text-primary mt-1">{view.views}</p>
                <p className="text-xs text-muted-foreground">{view.engagement}% engagement</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function ConversionFunnel({ data }: { data: LeadData[] }) {
  return (
    <Card variant="premium">
      <CardHeader>
        <CardTitle>Conversion Rate</CardTitle>
        <CardDescription>Lead to sale</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, i) => {
            const percentage = ((item.count / data[0].count) * 100).toFixed(0);
            return (
              <div key={item.stage} className="flex items-center gap-3">
                <div className="w-20 text-sm text-muted-foreground">{item.stage}</div>
                <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981'][i],
                    }}
                  >
                    <span className="text-xs font-bold text-white">{item.count}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}