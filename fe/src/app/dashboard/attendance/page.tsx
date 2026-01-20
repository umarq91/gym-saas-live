"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api'
import { Attendance, Member, CreateAttendanceData } from '@/types'
import { Plus, Search, CalendarCheck, CalendarX, Users, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

const attendanceSchema = z.object({
  memberId: z.string().min(1, 'Member is required'),
  date: z.string().min(1, 'Date is required'),
  status: z.string().min(1, 'Status is required'),
})

type AttendanceFormData = z.infer<typeof attendanceSchema>

export default function AttendancePage() {
  const { user, gym } = useAuth()
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [selectedMember, setSelectedMember] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)

  const form = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      memberId: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      status: 'present',
    },
  })

  useEffect(() => {
    fetchData()
  }, [selectedDate])

  const fetchData = async () => {
    try {
      const [attendanceData, membersData] = await Promise.all([
        apiClient.getAttendance(undefined, selectedDate),
        apiClient.getMembers(),
      ])
      setAttendance(attendanceData)
      setMembers(membersData)
    } catch (error) {
      toast.error('Failed to fetch attendance data')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: AttendanceFormData) => {
    try {
      await apiClient.createAttendance(data)
      toast.success('Attendance marked successfully')
      setIsCreateDialogOpen(false)
      form.reset()
      fetchData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to mark attendance')
    }
  }

  const handleBulkAttendance = async (status: string) => {
    try {
      const activeMembers = members.filter(m => m.isActive)
      const promises = activeMembers.map(member =>
        apiClient.createAttendance({
          memberId: member.id,
          date: selectedDate,
          status,
        })
      )
      await Promise.all(promises)
      toast.success(`Bulk attendance marked as ${status}`)
      setIsBulkDialogOpen(false)
      fetchData()
    } catch (error) {
      toast.error('Failed to mark bulk attendance')
    }
  }

  const filteredAttendance = attendance.filter(record => {
    const member = members.find(m => m.id === record.memberId)
    const matchesSearch = !searchTerm || 
      member?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMember = selectedMember === 'all' || record.memberId === selectedMember
    return matchesSearch && matchesMember
  })

  const presentCount = attendance.filter(a => a.status === 'present').length
  const absentCount = attendance.filter(a => a.status === 'absent').length
  const totalCount = members.filter(m => m.isActive).length
  const attendanceRate = totalCount > 0 ? (presentCount / totalCount * 100).toFixed(1) : '0'

  // Check if gym has access to attendance (BASIC+ plan)
  const hasAttendanceAccess = gym?.plan !== 'FREE'

  if (!hasAttendanceAccess) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Tracking</h1>
          <p className="text-muted-foreground">
            Track member attendance and gym usage
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarX className="h-5 w-5" />
              Feature Not Available
            </CardTitle>
            <CardDescription>
              Attendance tracking is only available on BASIC and PRO plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <CalendarX className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Upgrade Your Plan</h3>
              <p className="text-muted-foreground mb-4">
                Get access to attendance tracking, member analytics, and more by upgrading to a BASIC or PRO plan.
              </p>
              <Button>Contact Support</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Attendance Tracking</h1>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Tracking</h1>
          <p className="text-muted-foreground">
            Track member attendance and gym usage
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Bulk Mark
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Bulk Attendance</DialogTitle>
                <DialogDescription>
                  Mark attendance for all active members
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Button 
                  onClick={() => handleBulkAttendance('present')} 
                  className="w-full"
                  variant="default"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark All Present
                </Button>
                <Button 
                  onClick={() => handleBulkAttendance('absent')} 
                  className="w-full"
                  variant="destructive"
                >
                  <CalendarX className="mr-2 h-4 w-4" />
                  Mark All Absent
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Mark Attendance
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Mark Attendance</DialogTitle>
                <DialogDescription>
                  Record attendance for a specific member
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="memberId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Member</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a member" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {members.filter(m => m.isActive).map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="present">Present</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                            <SelectItem value="late">Late</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">Mark Attendance</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <CalendarCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentCount}</div>
            <p className="text-xs text-muted-foreground">Members present today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <CalendarX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absentCount}</div>
            <p className="text-xs text-muted-foreground">Members absent today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">Today's attendance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground">Total active members</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>
            View and manage attendance records
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-[200px]"
            />
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by member name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Marked By</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendance.map((record) => {
                const member = members.find(m => m.id === record.memberId)
                return (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {member?.name || 'Unknown'}
                    </TableCell>
                    <TableCell>{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          record.status === 'present' ? 'default' :
                          record.status === 'absent' ? 'destructive' : 'secondary'
                        }
                      >
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{user?.name}</TableCell>
                    <TableCell>{format(new Date(record.createdAt), 'hh:mm a')}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          {filteredAttendance.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No attendance records found for this date
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
