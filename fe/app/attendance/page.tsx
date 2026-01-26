'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DataTable, Column } from '@/components/common/data-table';
import { CheckCircle, XCircle, Clock, User, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

// Mock attendance data
const mockAttendanceData = [
  {
    id: '1',
    memberId: '101',
    memberName: 'John Doe',
    date: new Date(2024, 0, 15),
    status: 'PRESENT' as const,
    checkInTime: '06:30 AM',
    checkOutTime: '07:30 AM',
  },
  {
    id: '2',
    memberId: '102',
    memberName: 'Jane Smith',
    date: new Date(2024, 0, 15),
    status: 'PRESENT' as const,
    checkInTime: '07:00 AM',
    checkOutTime: '08:00 AM',
  },
  {
    id: '3',
    memberId: '103',
    memberName: 'Mike Johnson',
    date: new Date(2024, 0, 15),
    status: 'LATE' as const,
    checkInTime: '07:15 AM',
    checkOutTime: '08:15 AM',
  },
  {
    id: '4',
    memberId: '104',
    memberName: 'Sarah Williams',
    date: new Date(2024, 0, 15),
    status: 'ABSENT' as const,
  },
];

interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  date: Date;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  checkInTime?: string;
  checkOutTime?: string;
}

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>(mockAttendanceData);
  const [markOpen, setMarkOpen] = useState(false);
  const [markStatus, setMarkStatus] = useState<'PRESENT' | 'ABSENT' | 'LATE'>('PRESENT');
  const [selectedMemberId, setSelectedMemberId] = useState('');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'ABSENT':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'LATE':
        return <Clock className="w-4 h-4 text-warning" />;
      default:
        return null;
    }
  };

  const columns: Column<AttendanceRecord>[] = [
    {
      key: 'memberName',
      label: 'Member Name',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-text-muted" />
          {value}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(value)}
          <Badge
            className={
              value === 'PRESENT'
                ? 'bg-success/20 text-success'
                : value === 'ABSENT'
                  ? 'bg-destructive/20 text-destructive'
                  : 'bg-warning/20 text-warning'
            }
          >
            {value}
          </Badge>
        </div>
      ),
    },
    {
      key: 'checkInTime',
      label: 'Check In',
      render: (value) => <span className="text-text-muted">{value || '-'}</span>,
    },
    {
      key: 'checkOutTime',
      label: 'Check Out',
      render: (value) => <span className="text-text-muted">{value || '-'}</span>,
    },
    {
      key: 'id',
      label: 'Actions',
      render: () => (
        <Button variant="outline" size="sm">
          Edit
        </Button>
      ),
    },
  ];

  const todayStats = {
    present: attendanceData.filter((a) => a.status === 'PRESENT').length,
    absent: attendanceData.filter((a) => a.status === 'ABSENT').length,
    late: attendanceData.filter((a) => a.status === 'LATE').length,
    total: attendanceData.length,
  };

  const attendanceRate = Math.round(
    ((todayStats.present + todayStats.late) / todayStats.total) * 100
  );

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-text mb-2">Attendance Tracking</h2>
        <p className="text-text-muted">
          Monitor member attendance and check-in/check-out times
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card className="bg-card border-border p-4">
          <p className="text-sm text-text-muted mb-1">Total Members</p>
          <p className="text-2xl font-bold text-text">{todayStats.total}</p>
        </Card>
        <Card className="bg-card border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-success" />
            <p className="text-sm text-text-muted">Present</p>
          </div>
          <p className="text-2xl font-bold text-success">{todayStats.present}</p>
        </Card>
        <Card className="bg-card border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-warning" />
            <p className="text-sm text-text-muted">Late</p>
          </div>
          <p className="text-2xl font-bold text-warning">{todayStats.late}</p>
        </Card>
        <Card className="bg-card border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-destructive" />
            <p className="text-sm text-text-muted">Absent</p>
          </div>
          <p className="text-2xl font-bold text-destructive">{todayStats.absent}</p>
        </Card>
        <Card className="bg-card border-border p-4">
          <p className="text-sm text-text-muted mb-1">Attendance Rate</p>
          <p className="text-2xl font-bold text-accent">{attendanceRate}%</p>
        </Card>
      </div>

      {/* Calendar & Mark Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Calendar */}
        <Card className="bg-card border-border p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Select Date</h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border border-border"
            disabled={() => false}
          />
        </Card>

        {/* Quick Mark Attendance */}
        <Card className="bg-card border-border p-6 lg:col-span-3">
          <h3 className="text-lg font-semibold text-text mb-4">Mark Attendance</h3>
          <div className="space-y-4">
            {/* Date Info */}
            <div className="flex items-center gap-2 p-3 bg-surface/50 rounded-lg">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <p className="text-sm text-text">
                {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'No date selected'}
              </p>
            </div>

            {/* Bulk Mark Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={() => setMarkOpen(true)}
                className="bg-success hover:bg-green-600 text-white gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Mark All Present
              </Button>
              <Button
                variant="outline"
                onClick={() => setMarkOpen(true)}
                className="border-warning text-warning hover:bg-warning/10"
              >
                <Clock className="w-4 h-4" />
                Mark All Late
              </Button>
              <Button
                variant="outline"
                onClick={() => setMarkOpen(true)}
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                <XCircle className="w-4 h-4" />
                Mark All Absent
              </Button>
            </div>

            {/* Individual Mark */}
            <div className="pt-4 border-t border-border">
              <Label className="text-text mb-3 block">Individual Member</Label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Member ID or name"
                  className="flex-1 bg-surface border border-border rounded px-3 py-2 text-text text-sm"
                />
                <Select value={markStatus} onValueChange={(v: any) => setMarkStatus(v)}>
                  <SelectTrigger className="w-32 bg-surface border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="PRESENT">Present</SelectItem>
                    <SelectItem value="LATE">Late</SelectItem>
                    <SelectItem value="ABSENT">Absent</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="bg-primary hover:bg-primary-dark text-white">Mark</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-text mb-4">
            Attendance for {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Today'}
          </h3>
          <DataTable
            columns={columns}
            data={attendanceData}
            emptyMessage="No attendance records found"
          />
        </div>
      </Card>

      {/* Mark Attendance Dialog */}
      <Dialog open={markOpen} onOpenChange={setMarkOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
            <DialogDescription className="text-text-muted">
              Confirm the action for all selected members
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-text">
              Mark all members as <span className="font-semibold">{markStatus}</span> for{' '}
              {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'today'}?
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setMarkOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-primary hover:bg-primary-dark text-white"
                onClick={() => setMarkOpen(false)}
              >
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
