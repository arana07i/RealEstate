"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  RevenueChart,
  ConversionFunnel,
  TrafficChart,
  TopCitiesTable,
  TopPropertiesChart,
  AgentRankings,
  BookingCalendarHeatmap,
  MonthlyGrowthChart,
  AnalyticsStats,
  AnalyticsStatsGrid,
} from "@/components/admin/AnalyticsCharts";

interface AnalyticsData {
  stats: {
    totalRevenue: number;
    totalVisitors: number;
    totalBookings: number;
    conversionRate: number;
    revenueGrowth: number;
  };
  revenueData: Array<{
    month: string;
    revenue: number;
    bookings: number;
    avgBooking: number;
  }>;
  trafficSources: Array<{
    source: string;
    visitors: number;
    percentage: number;
    color: string;
  }>;
  funnelData: Array<{
    stage: string;
    count: number;
    conversion: number;
  }>;
  cityPerformance: Array<{
    city: string;
    properties: number;
    bookings: number;
    revenue: number;
    growth: number;
  }>;
  propertyPerformance: Array<{
    property: string;
    views: number;
    bookings: number;
    revenue: number;
    previousRevenue: number;
    conversion: number;
  }>;
  agentRankings: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
    rating: number;
    growth: number;
  }>;
  bookingTrends: Array<{
    date: string;
    count: number;
  }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<string>("30d");

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      const params = new URLSearchParams();

      if (dateRange === "30d") {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        params.set("startDate", thirtyDaysAgo.toISOString());
        params.set("endDate", now.toISOString());
      } else if (dateRange === "90d") {
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        params.set("startDate", ninetyDaysAgo.toISOString());
        params.set("endDate", now.toISOString());
      }

      const response = await fetch(`/api/admin/analytics?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch analytics");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const stats = useMemo<AnalyticsStats>(() => {
    if (!data?.stats) return {
      totalRevenue: 0,
      totalVisitors: 0,
      totalBookings: 0,
      conversionRate: 0,
      revenueGrowth: 0,
      visitorGrowth: 0,
      bookingGrowth: 0,
      avgSessionDuration: "0m 0s",
    };

    const totalRevenue = data.stats.totalRevenue ?? 0;
    const totalBookings = data.revenueData?.reduce((sum, d) => sum + d.bookings, 0) ?? 0;

    return {
      totalRevenue: Math.round(totalRevenue / 100000),
      totalVisitors: 0,
      totalBookings,
      conversionRate: data.stats?.conversionRate ?? 0,
      revenueGrowth: data.stats?.revenueGrowth ?? 0,
      visitorGrowth: 0,
      bookingGrowth: 0,
      avgSessionDuration: "3m 42s",
    };
  }, [data]);

  const revenueData = data?.revenueData ?? [];
  const trafficData = data?.trafficSources ?? [];
  const funnelData = data?.funnelData ?? [];
  const cityData = data?.cityPerformance ?? [];
  const propertyData = data?.propertyPerformance ?? [];
  const agentData = data?.agentRankings ?? [];
  const bookingData = data?.bookingTrends ?? [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Analytics</h1>
          <p className="text-muted-foreground mt-1">Comprehensive business insights and performance metrics</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-muted text-sm"
          >
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button variant="outline" size="sm" onClick={fetchAnalytics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <AnalyticsStatsGrid stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart data={revenueData} title="Revenue Analytics" />
        <TrafficChart data={trafficData} title="Traffic Sources" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ConversionFunnel data={funnelData} title="Conversion Pipeline" />
        <TopCitiesTable data={cityData} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TopPropertiesChart data={propertyData} />
        <AgentRankings data={agentData} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BookingCalendarHeatmap data={bookingData} />
        <MonthlyGrowthChart data={revenueData} />
      </div>
    </div>
  );
}