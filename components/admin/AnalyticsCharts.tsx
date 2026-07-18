"use client";

import { useMemo } from "react";
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
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { Download, FileText } from "lucide-react";

const COLORS = ["#d4af37", "#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

const chartContainerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const barVariants = {
  hidden: { scaleY: 0 },
  visible: (i: number) => ({
    scaleY: 1,
  }),
};

export interface RevenueData {
  month: string;
  revenue: number;
  bookings: number;
  avgBooking: number;
}

export interface TrafficSource {
  source: string;
  visitors: number;
  percentage: number;
  color: string;
}

export interface FunnelStage {
  stage: string;
  count: number;
  conversion: number;
}

export interface CityPerformance {
  city: string;
  properties: number;
  bookings: number;
  revenue: number;
  growth: number;
}

export interface PropertyPerformance {
  property: string;
  views: number;
  bookings: number;
  revenue: number;
  previousRevenue: number;
  conversion: number;
}

export interface AgentRanking {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  rating: number;
  growth: number;
  avatar?: string;
}

export interface BookingTrend {
  date: string;
  count: number;
}

export interface VisitorData {
  id: string;
  page: string;
  location: string;
  time: string;
  source: string;
}

function ExportButton({ data, filename }: { data: unknown[]; filename: string }) {
  const exportCSV = () => {
    const firstItem = (data[0] as Record<string, unknown>) || {};
    const headers = Object.keys(firstItem).join(",");
    const rows = data.map((row) => {
      const r = row as Record<string, unknown>;
      return Object.values(r).map(v => String(v).replace(/"/g, '""')).join(",");
    }).join("\n");
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    console.log("PDF export would be implemented with jsPDF or similar library", data);
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={exportCSV}>
        <Download className="h-4 w-4" />
        CSV
      </Button>
      <Button variant="outline" size="sm" onClick={exportPDF}>
        <FileText className="h-4 w-4" />
        PDF
      </Button>
    </div>
  );
}

export function RevenueChart({ data, title = "Revenue Analytics" }: { data: RevenueData[]; title?: string }) {
  const trend = useMemo(() => {
    if (data.length < 2) return 0;
    const last = data[data.length - 1].revenue;
    const prev = data[data.length - 2].revenue;
    return ((last - prev) / prev) * 100;
  }, [data]);

  return (
    <motion.div variants={chartContainerVariants} initial="hidden" animate="visible">
      <Card variant="premium">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>Monthly revenue with trend analysis</CardDescription>
            </div>
            <ExportButton data={data} filename="revenue-analytics" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4af37" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#d4af37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  formatter={(v: any) => [`₹${(v / 100000).toFixed(2)} Lakh`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#d4af37" strokeWidth={2} fill="url(#revenueGradient)" />
                <Line type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Trend</span>
            <span className={`text-sm font-medium ${trend >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {trend >= 0 ? "+" : ""}{trend.toFixed(1)}% from last month
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function ConversionFunnel({ data, title = "Conversion Analytics" }: { data: FunnelStage[]; title?: string }) {
  return (
    <motion.div variants={chartContainerVariants} initial="hidden" animate="visible">
      <Card variant="premium">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>Lead to sale conversion funnel</CardDescription>
            </div>
            <ExportButton data={data} filename="conversion-funnel" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" />
                <YAxis type="category" dataKey="stage" stroke="#64748b" width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {data.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {data.map((stage, i) => (
              <motion.div
                key={stage.stage}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-24 text-sm text-muted-foreground">{stage.stage}</div>
                <div className="flex-1 bg-muted dark:bg-muted rounded-full h-6 overflow-hidden">
<motion.div
                     className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
                     style={{ backgroundColor: COLORS[i % COLORS.length] }}
                     initial={{ width: 0 }}
                     animate={{ width: `${stage.conversion}%` }}
                   >
                     <span className="text-xs font-bold text-white">{stage.count}</span>
                   </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function TrafficChart({ data, title = "Traffic Analytics" }: { data: TrafficSource[]; title?: string }) {
  const totalVisitors = useMemo(() => data.reduce((sum, d) => sum + d.visitors, 0), [data]);

  return (
    <motion.div variants={chartContainerVariants} initial="hidden" animate="visible">
      <Card variant="premium">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>Total visitors: {totalVisitors.toLocaleString()}</CardDescription>
            </div>
            <ExportButton data={data} filename="traffic-analytics" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="visitors"
                  nameKey="source"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  animationBegin={0}
                  animationDuration={1000}
                  animationEasing="ease-out"
                >
                  {data.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  formatter={(v: any) => [`${v.toLocaleString()} visitors`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {data.map((item) => (
              <motion.div
                key={item.source}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2"
              >
                <span className="block h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm font-medium text-muted-foreground">{item.source} {item.percentage}%</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function TopCitiesTable({ data }: { data: CityPerformance[] }) {
  return (
    <motion.div variants={chartContainerVariants} initial="hidden" animate="visible">
      <Card variant="premium">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Top Cities Performance</CardTitle>
              <CardDescription>Revenue by location</CardDescription>
            </div>
            <ExportButton data={data} filename="top-cities" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border dark:border-border">
<th className="text-left text-xs font-semibold text-muted-foreground uppercase pb-3">City</th>
                   <th className="text-left text-xs font-semibold text-muted-foreground uppercase pb-3">Properties</th>
                   <th className="text-left text-xs font-semibold text-muted-foreground uppercase pb-3">Bookings</th>
                   <th className="text-left text-xs font-semibold text-muted-foreground uppercase pb-3">Revenue</th>
                   <th className="text-left text-xs font-semibold text-muted-foreground uppercase pb-3">Growth</th>
                </tr>
              </thead>
              <tbody>
                {data.map((city, i) => (
                  <motion.tr
                    key={city.city}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="border-b border-border last:border-0"
                  >
                    <td className="py-3 font-medium text-foreground">{city.city}</td>
<td className="py-3 text-muted-foreground">{city.properties}</td>
                     <td className="py-3 text-muted-foreground">{city.bookings}</td>
                    <td className="py-3 font-semibold text-emerald-600">₹{(city.revenue / 100000).toFixed(1)}L</td>
                    <td className={`py-3 font-medium ${city.growth >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {city.growth >= 0 ? "+" : ""}{city.growth}%
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function TopPropertiesChart({ data }: { data: PropertyPerformance[] }) {
  return (
    <motion.div variants={chartContainerVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
      <Card variant="premium">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Top Properties Performance</CardTitle>
              <CardDescription>Revenue comparison</CardDescription>
            </div>
            <ExportButton data={data} filename="top-properties" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="property" stroke="#64748b" />
                <YAxis stroke="#64748b" tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                />
                <Bar dataKey="previousRevenue" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Previous" />
                <Bar dataKey="revenue" fill="#d4af37" radius={[4, 4, 0, 0]} name="Current" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            {data.map((prop, i) => (
              <motion.div
                key={prop.property}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-center justify-between"
              >
                <div className="flex-1">
<p className="font-medium text-foreground">{prop.property}</p>
                   <p className="text-sm text-muted-foreground">{prop.views} views • {prop.conversion}% conversion</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">₹{(prop.revenue / 100000).toFixed(1)}L</p>
                   <p className="text-sm text-muted-foreground">{prop.bookings} bookings</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function AgentRankings({ data }: { data: AgentRanking[] }) {
  return (
    <motion.div variants={chartContainerVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
      <Card variant="premium">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Agent Rankings Leaderboard</CardTitle>
              <CardDescription>Top performers this month</CardDescription>
            </div>
            <ExportButton data={data} filename="agent-rankings" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{agent.name}</p>
                    <p className="text-sm text-muted-foreground">{agent.sales} sales</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">${(agent.revenue / 1000).toFixed(0)}K</p>
                  <span className="text-sm text-amber-600">★ {agent.rating}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function BookingCalendarHeatmap({ data }: { data: BookingTrend[] }) {
  const heatmapData = useMemo(() => {
    const weeks: { date: string; count: number; day: number }[][] = [];
    let currentWeek: { date: string; count: number; day: number }[] = [];
    
    data.forEach((item, i) => {
      if (i % 7 === 0 && i > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push({ ...item, day: i % 7 });
    });
    if (currentWeek.length > 0) weeks.push(currentWeek);
    return weeks;
  }, [data]);

  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <motion.div variants={chartContainerVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
      <Card variant="premium">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Booking Trends</CardTitle>
              <CardDescription>Calendar heatmap of bookings</CardDescription>
            </div>
            <ExportButton data={data} filename="booking-trends" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex justify-between gap-1">
            {heatmapData.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => {
                  const intensity = day.count / maxCount;
                  return (
                    <motion.div
                      key={day.date}
                      className="w-4 h-4 rounded-sm cursor-pointer"
                      style={{
                        backgroundColor: intensity > 0 
                          ? `rgba(212, 175, 55, ${0.2 + intensity * 0.8})` 
                          : "#e2e8f0",
                      }}
                      title={`${day.date}: ${day.count} bookings`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 + dayIndex * 0.02 }}
                      whileHover={{ scale: 1.2 }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              {[0.2, 0.4, 0.6, 0.8, 1].map((intensity, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-sm"
                  style={{ backgroundColor: `rgba(212, 175, 55, ${intensity})` }}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function MonthlyGrowthChart({ data }: { data: RevenueData[] }) {
  const growthData = useMemo(() => {
    return data.map((d, i) => {
      if (i === 0) return { month: d.month, growth: 0 };
      const prev = data[i - 1].revenue;
      const growth = ((d.revenue - prev) / prev) * 100;
      return { month: d.month, growth };
    });
  }, [data]);

  return (
    <motion.div variants={chartContainerVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }}>
      <Card variant="premium">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Monthly Growth</CardTitle>
              <CardDescription>Revenue growth percentage</CardDescription>
            </div>
            <ExportButton data={growthData} filename="monthly-growth" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                />
                <Bar dataKey="growth" radius={[4, 4, 0, 0]}>
                  {growthData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.growth >= 0 ? "#10b981" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function RealTimeVisitors({ visitors }: { visitors: VisitorData[] }) {
  return (
    <motion.div variants={chartContainerVariants} initial="hidden" animate="visible" transition={{ delay: 0.6 }}>
      <Card variant="premium">
        <CardHeader>
          <CardTitle>Real-time Visitors</CardTitle>
          <CardDescription>Currently active on site</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {visitors.map((visitor, i) => (
              <motion.div
                key={visitor.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.05 }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted dark:hover:bg-muted"
              >
                <div>
<p className="font-medium text-foreground">{visitor.page}</p>
                   <p className="text-xs text-muted-foreground">{visitor.location} • {visitor.source}</p>
                 </div>
                 <span className="text-xs text-muted-foreground">{visitor.time}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StatsCard({ 
  title, 
  value, 
  prefix, 
  suffix, 
  growth 
}: { 
  title: string; 
  value: number; 
  prefix?: string; 
  suffix?: string;
  growth: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card variant="elevated" className="p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
          {growth !== 0 && (
            <span className={`text-xs font-medium ${growth >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {growth >= 0 ? "+" : ""}{growth.toFixed(1)}%
            </span>
          )}
        </div>
<p className="text-2xl font-bold text-foreground">{prefix}{value.toLocaleString()}{suffix}</p>
      </Card>
    </motion.div>
  );
}

export interface AnalyticsStats {
  totalRevenue: number;
  totalVisitors: number;
  totalBookings: number;
  conversionRate: number;
  revenueGrowth: number;
  visitorGrowth: number;
  bookingGrowth: number;
  avgSessionDuration: string;
}

export function AnalyticsStatsGrid({ stats }: { stats: AnalyticsStats }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      <StatsCard title="Total Revenue" value={stats.totalRevenue} prefix="₹" suffix="L" growth={stats.revenueGrowth} />
      <StatsCard title="Total Visitors" value={stats.totalVisitors} prefix="" suffix="" growth={stats.visitorGrowth} />
      <StatsCard title="Total Bookings" value={stats.totalBookings} prefix="" suffix="" growth={stats.bookingGrowth} />
      <StatsCard title="Conversion Rate" value={stats.conversionRate} prefix="" suffix="%" growth={0} />
    </motion.div>
  );
}