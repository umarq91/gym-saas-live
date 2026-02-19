'use client';

import React from "react"

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  TrendingUp,
  Activity,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useApiGet } from '@/hooks/useApi';
import { Skeleton } from '@/components/ui/skeleton';

// Mock data for charts
const revenueData = [
  { month: 'Jan', revenue: 4000, target: 2400 },
  { month: 'Feb', revenue: 3000, target: 1398 },
  { month: 'Mar', revenue: 2000, target: 9800 },
  { month: 'Apr', revenue: 2780, target: 3908 },
  { month: 'May', revenue: 1890, target: 4800 },
  { month: 'Jun', revenue: 2390, target: 3800 },
];

const attendanceData = [
  { date: 'Mon', members: 85, percent: 72 },
  { date: 'Tue', members: 92, percent: 78 },
  { date: 'Wed', members: 88, percent: 75 },
  { date: 'Thu', members: 95, percent: 81 },
  { date: 'Fri', members: 110, percent: 93 },
  { date: 'Sat', members: 45, percent: 38 },
  { date: 'Sun', members: 38, percent: 32 },
];

interface StatCard {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ label, value, change, icon, color }: StatCard) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {change > 0 ? (
                <>
                  <ArrowUpRight className="w-3.5 h-3.5 text-success" />
                  <span className="text-xs text-success font-medium">+{change}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-3.5 h-3.5 text-destructive" />
                  <span className="text-xs text-destructive font-medium">{change}%</span>
                </>
              )}
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-2.5 rounded-xl ${color}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="bg-popover border border-border/50 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <p key={idx} style={{ color: entry.color }} className="text-muted-foreground">
          {entry.name}: <span className="font-medium" style={{ color: entry.color }}>{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useApiGet('/api/dashboard/stats');

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Here's your gym performance overview</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Members"
          value={isLoading ? <Skeleton className="h-8 w-16" /> : '1,248'}
          change={12}
          icon={<Users className="w-5 h-5 text-primary" />}
          color="bg-primary/10"
        />
        <StatCard
          label="Monthly Revenue"
          value={isLoading ? <Skeleton className="h-8 w-16" /> : '$45,300'}
          change={8}
          icon={<DollarSign className="w-5 h-5 text-success" />}
          color="bg-success/10"
        />
        <StatCard
          label="Attendance Rate"
          value={isLoading ? <Skeleton className="h-8 w-16" /> : '78%'}
          change={-5}
          icon={<Activity className="w-5 h-5 text-warning" />}
          color="bg-warning/10"
        />
        <StatCard
          label="Active Trainers"
          value={isLoading ? <Skeleton className="h-8 w-16" /> : '12'}
          change={2}
          icon={<TrendingUp className="w-5 h-5 text-chart-3" />}
          color="bg-chart-3/10"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Revenue Chart */}
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">Revenue Trends</h3>
            <p className="text-xs text-muted-foreground">Monthly revenue vs targets</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="month" className="text-xs" tick={{ fill: 'var(--muted-foreground)' }} />
              <YAxis className="text-xs" tick={{ fill: 'var(--muted-foreground)' }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="revenue" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="target" fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Quick Actions */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Button className="w-full justify-start" size="sm">
              Add New Member
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              Mark Attendance
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              Record Payment
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              View Reports
            </Button>
          </div>
        </Card>
      </div>

      {/* Attendance Chart */}
      <Card className="p-5 mb-6">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground">Weekly Attendance</h3>
          <p className="text-xs text-muted-foreground">Members present by day</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={attendanceData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis dataKey="date" className="text-xs" tick={{ fill: 'var(--muted-foreground)' }} />
            <YAxis className="text-xs" tick={{ fill: 'var(--muted-foreground)' }} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line
              type="monotone"
              dataKey="members"
              stroke="var(--chart-2)"
              strokeWidth={2}
              dot={{ fill: 'var(--chart-2)', r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="percent"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={{ fill: 'var(--chart-1)', r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Recent Members</h3>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm font-medium text-foreground">John Doe</p>
                  <p className="text-xs text-muted-foreground">Joined 2 days ago</p>
                </div>
                <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-md">Active</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Pending Payments</h3>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm font-medium text-foreground">Jane Smith</p>
                  <p className="text-xs text-muted-foreground">Due: $45.00</p>
                </div>
                <span className="text-xs font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-md">Pending</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
