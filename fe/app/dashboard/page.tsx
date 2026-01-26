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
    <Card className="bg-card border-border p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-muted mb-1">{label}</p>
          <p className="text-3xl font-bold text-text">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {change > 0 ? (
                <>
                  <ArrowUpRight className="w-4 h-4 text-success" />
                  <span className="text-sm text-success">+{change}% from last month</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-destructive">{change}% from last month</span>
                </>
              )}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useApiGet('/api/dashboard/stats');

  return (
    <DashboardLayout>
      {/* Header with Action Buttons */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-text mb-1">Welcome back!</h2>
          <p className="text-text-muted">Here's your gym performance overview</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Export Report</Button>
          <Button className="bg-primary hover:bg-primary-dark text-white">
            View Details
          </Button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Total Members"
          value={isLoading ? <Skeleton className="h-9 w-20" /> : '1,248'}
          change={12}
          icon={<Users className="w-6 h-6 text-white" />}
          color="bg-primary/20"
        />
        <StatCard
          label="Monthly Revenue"
          value={isLoading ? <Skeleton className="h-9 w-20" /> : '$45,300'}
          change={8}
          icon={<DollarSign className="w-6 h-6 text-white" />}
          color="bg-accent/20"
        />
        <StatCard
          label="Attendance Rate"
          value={isLoading ? <Skeleton className="h-9 w-20" /> : '78%'}
          change={-5}
          icon={<Activity className="w-6 h-6 text-white" />}
          color="bg-secondary/20"
        />
        <StatCard
          label="Active Trainers"
          value={isLoading ? <Skeleton className="h-9 w-20" /> : '12'}
          change={2}
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          color="bg-primary/20"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <Card className="bg-card border-border p-6 lg:col-span-2">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-text">Revenue Trends</h3>
            <p className="text-sm text-text-muted">Monthly revenue vs targets</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
              <Legend />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="target" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-card border-border p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button className="w-full bg-primary hover:bg-primary-dark text-white justify-start">
              Add New Member
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              Mark Attendance
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              Record Payment
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              View Reports
            </Button>
          </div>
        </Card>
      </div>

      {/* Attendance Chart */}
      <Card className="bg-card border-border p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-text">Weekly Attendance</h3>
          <p className="text-sm text-text-muted">Members present by day</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={attendanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
            <Legend />
            <Line
              type="monotone"
              dataKey="members"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="percent"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="bg-card border-border p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Recent Members</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded bg-surface/50">
                <div>
                  <p className="text-sm font-medium text-text">John Doe</p>
                  <p className="text-xs text-text-muted">Joined 2 days ago</p>
                </div>
                <span className="badge-success">Active</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-card border-border p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Pending Payments</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded bg-surface/50">
                <div>
                  <p className="text-sm font-medium text-text">Jane Smith</p>
                  <p className="text-xs text-text-muted">Due: $45.00</p>
                </div>
                <span className="badge-warning">Pending</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
