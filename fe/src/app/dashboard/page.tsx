"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, DollarSign, CalendarCheck, UserCheck } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api'
import { Member, Fee, Attendance } from '@/types'

interface DashboardStats {
  totalMembers: number
  activeMembers: number
  totalRevenue: number
  thisMonthRevenue: number
  attendanceRate: number
  staffCount: number
}

export default function DashboardPage() {
  const { user, gym } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    totalRevenue: 0,
    thisMonthRevenue: 0,
    attendanceRate: 0,
    staffCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const [members, fees] = await Promise.all([
          apiClient.getMembers(),
          apiClient.getFees(),
        ])

        const activeMembers = members?.filter(m => m.isActive).length
        const thisMonth = new Date().getMonth()
        const thisYear = new Date().getFullYear()
        
        const thisMonthFees = fees.filter(fee => {
          const feeDate = new Date(fee.createdAt)
          return feeDate.getMonth() === thisMonth && feeDate.getFullYear() === thisYear
        })

        const totalRevenue = fees.reduce((sum, fee) => sum + fee.amountPaid, 0)
        const thisMonthRevenue = thisMonthFees.reduce((sum, fee) => sum + fee.amountPaid, 0)

        setStats({
          totalMembers: members.length,
          activeMembers,
          totalRevenue,
          thisMonthRevenue,
          attendanceRate: 85.5, // Mock data - would calculate from attendance records
          staffCount: 3, // Mock data - would fetch from staff API
        })
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchDashboardStats()
    }
  }, [user])

  const statCards = [
    {
      title: 'Total Members',
      value: stats.totalMembers,
      description: `${stats.activeMembers} active members`,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      description: `$${stats.thisMonthRevenue.toLocaleString()} this month`,
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Attendance Rate',
      value: `${stats.attendanceRate}%`,
      description: 'Average this month',
      icon: CalendarCheck,
      color: 'text-purple-600',
    },
    {
      title: 'Staff Members',
      value: stats.staffCount,
      description: 'Active staff',
      icon: UserCheck,
      color: 'text-orange-600',
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-4 w-4 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded mb-2" />
                <div className="h-3 w-24 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Here's an overview of your gym.
        </p>
        {gym && (
          <div className="mt-2">
            <Badge variant="outline">
              {gym.name} - {gym.plan} Plan
            </Badge>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest member activities and fee payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Activity feed will be displayed here
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Gym Performance</CardTitle>
            <CardDescription>
              Monthly overview and trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Performance charts will be displayed here
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
