'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CheckCircle,
  Search,
  User,
  Phone,
  Mail,
  Calendar,
  Loader2,
  Undo2,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isAfter,
  parseISO,
  isSameDay,
} from 'date-fns';
import { apiGet, apiPost, apiDelete } from '@/lib/api-client';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Member {
  id: string;
  name: string;
  phone: string;
  email?: string;
  isActive: boolean;
  joinDate: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  markedBy: { id: string; name: string };
  createdAt: string;
}

interface TodayRecord {
  id: string;
  date: string;
  status: string;
  member: { id: string; name: string };
  markedBy: { id: string; name: string };
  createdAt: string;
}

interface AttendanceSummary {
  presentCount: number;
  totalDays: number;
  absentCount: number;
  rate: number;
}

interface DaySlot {
  date: Date;
  record: AttendanceRecord | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayStr() {
  return format(new Date(), 'yyyy-MM-dd');
}

// Build month slots — excludes Sundays and future dates, newest first
function buildMonthSlots(records: AttendanceRecord[], monthStr: string): DaySlot[] {
  const base = parseISO(monthStr + '-01');
  const days = eachDayOfInterval({ start: startOfMonth(base), end: endOfMonth(base) });
  const today = new Date();

  return days
    .filter((day) => day.getDay() !== 0 && !isAfter(day, today))
    .map((day) => {
      // defensive: only count PRESENT records
      const record =
        records.find((r) => r.status === 'PRESENT' && isSameDay(parseISO(r.date), day)) ?? null;
      return { date: day, record };
    })
    .reverse();
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AttendancePage() {
  // ── search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // ── selected member
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // ── mark attendance (top card)
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [isMarking, setIsMarking] = useState(false);
  const [dateRecord, setDateRecord] = useState<AttendanceRecord | null | undefined>(undefined);
  const [isCheckingRecord, setIsCheckingRecord] = useState(false);

  // ── monthly history
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyMonth, setHistoryMonth] = useState(format(new Date(), 'yyyy-MM'));

  // ── lifetime summary
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  // ── today's gym-wide overview (default view)
  const [todayRecords, setTodayRecords] = useState<TodayRecord[]>([]);
  const [isLoadingToday, setIsLoadingToday] = useState(false);

  // ── action states
  const [undoingId, setUndoingId] = useState<string | null>(null);
  const [markingDates, setMarkingDates] = useState<Set<string>>(new Set());

  // ── Load today's overview on mount (and after any mark/undo affecting today)
  const fetchTodayOverview = useCallback(async () => {
    setIsLoadingToday(true);
    const res = await apiGet<TodayRecord[]>(`/attendance?date=${todayStr()}`);
    setTodayRecords(res.success && res.data ? res.data : []);
    setIsLoadingToday(false);
  }, []);

  useEffect(() => {
    fetchTodayOverview();
  }, [fetchTodayOverview]);

  // ── Search members (debounced)
  const searchMembers = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setIsSearching(true);
    const res = await apiGet<any>(`/members?search=${encodeURIComponent(q)}&limit=8`);
    if (res.success && res.data) {
      const members: Member[] = Array.isArray(res.data) ? res.data : res.data.items ?? res.data;
      setSearchResults(members);
    }
    setIsSearching(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchMembers(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery, searchMembers]);

  // ── Check if selected date is already marked
  useEffect(() => {
    if (!selectedMember) { setDateRecord(undefined); return; }
    const check = async () => {
      setIsCheckingRecord(true);
      setDateRecord(undefined);
      const res = await apiGet<AttendanceRecord[]>(
        `/attendance/member/${selectedMember.id}?from=${selectedDate}&to=${selectedDate}`
      );
      if (res.success && res.data) {
        const present = res.data.find((r) => r.status === 'PRESENT') ?? null;
        setDateRecord(present);
      } else {
        setDateRecord(null);
      }
      setIsCheckingRecord(false);
    };
    check();
  }, [selectedMember, selectedDate]);

  // ── Load monthly history
  useEffect(() => {
    if (!selectedMember) { setRecords([]); return; }
    const fetch = async () => {
      setIsLoadingHistory(true);
      const from = format(startOfMonth(parseISO(historyMonth + '-01')), 'yyyy-MM-dd');
      const to = format(endOfMonth(parseISO(historyMonth + '-01')), 'yyyy-MM-dd');
      const res = await apiGet<AttendanceRecord[]>(
        `/attendance/member/${selectedMember.id}?from=${from}&to=${to}`
      );
      setRecords(res.success && res.data ? res.data : []);
      setIsLoadingHistory(false);
    };
    fetch();
  }, [selectedMember, historyMonth]);

  // ── Load lifetime summary when member changes
  useEffect(() => {
    if (!selectedMember) { setSummary(null); return; }
    const fetch = async () => {
      setIsLoadingSummary(true);
      const res = await apiGet<AttendanceSummary>(
        `/attendance/member/${selectedMember.id}/summary`
      );
      setSummary(res.success && res.data ? res.data : null);
      setIsLoadingSummary(false);
    };
    fetch();
  }, [selectedMember]);

  // ── Select a member
  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
    setSearchQuery(member.name);
    setShowDropdown(false);
    setSelectedDate(todayStr());
    setHistoryMonth(format(new Date(), 'yyyy-MM'));
  };

  // ── Mark present (top card)
  const markPresent = async () => {
    if (!selectedMember) return;
    setIsMarking(true);

    const res = await apiPost<any>('/attendance', {
      memberId: selectedMember.id,
      date: selectedDate,
      status: 'PRESENT',
    });

    if (res.success) {
      toast.success(`${selectedMember.name} marked present`);
      const newRecord: AttendanceRecord = {
        id: res.data?.id ?? crypto.randomUUID(),
        date: selectedDate,
        status: 'PRESENT',
        markedBy: { id: '', name: 'You' },
        createdAt: new Date().toISOString(),
      };
      setDateRecord(newRecord);
      if (selectedDate.startsWith(historyMonth)) {
        setRecords((prev) => [newRecord, ...prev]);
      }
      // refresh lifetime summary & today overview
      setSummary((s) => s ? { ...s, presentCount: s.presentCount + 1, absentCount: s.absentCount - 1, rate: Math.round(((s.presentCount + 1) / s.totalDays) * 100) } : s);
      if (selectedDate === todayStr()) fetchTodayOverview();
    } else {
      toast.error(res.error ?? 'Failed to mark attendance');
    }
    setIsMarking(false);
  };

  // ── Mark present from table row
  const markPresentForDate = async (dateStr: string) => {
    if (!selectedMember) return;
    setMarkingDates((prev) => new Set(prev).add(dateStr));

    const res = await apiPost<any>('/attendance', {
      memberId: selectedMember.id,
      date: dateStr,
      status: 'PRESENT',
    });

    if (res.success) {
      toast.success(`Marked present for ${format(parseISO(dateStr), 'MMM dd')}`);
      const newRecord: AttendanceRecord = {
        id: res.data?.id ?? crypto.randomUUID(),
        date: dateStr,
        status: 'PRESENT',
        markedBy: { id: '', name: 'You' },
        createdAt: new Date().toISOString(),
      };
      setRecords((prev) => [newRecord, ...prev]);
      if (dateStr === selectedDate) setDateRecord(newRecord);
      setSummary((s) => s ? { ...s, presentCount: s.presentCount + 1, absentCount: s.absentCount - 1, rate: Math.round(((s.presentCount + 1) / s.totalDays) * 100) } : s);
      if (dateStr === todayStr()) fetchTodayOverview();
    } else {
      toast.error(res.error ?? 'Failed to mark attendance');
    }
    setMarkingDates((prev) => { const s = new Set(prev); s.delete(dateStr); return s; });
  };

  // ── Undo (delete record)
  const undoAttendance = async (record: AttendanceRecord) => {
    setUndoingId(record.id);
    const res = await apiDelete(`/attendance/${record.id}`);

    if (res.success) {
      toast.success('Attendance mark removed');
      if (dateRecord?.id === record.id) setDateRecord(null);
      setRecords((prev) => prev.filter((r) => r.id !== record.id));
      setSummary((s) => s ? { ...s, presentCount: s.presentCount - 1, absentCount: s.absentCount + 1, rate: Math.round(((s.presentCount - 1) / s.totalDays) * 100) } : s);
      if (record.date === todayStr()) fetchTodayOverview();
    } else {
      toast.error(res.error ?? 'Failed to remove');
    }
    setUndoingId(null);
  };

  // ── Derived
  const monthSlots = buildMonthSlots(records, historyMonth);
  const monthPresent = monthSlots.filter((s) => s.record).length;
  const monthTotal = monthSlots.length;
  const monthRate = monthTotal > 0 ? Math.round((monthPresent / monthTotal) * 100) : 0;

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    return { value: format(d, 'yyyy-MM'), label: format(d, 'MMMM yyyy') };
  });

  // ───────────────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-text mb-2">Attendance</h2>
        <p className="text-text-muted">
          Search a member to mark or review — absent days are inferred automatically
        </p>
      </div>

      {/* ── Search ─────────────────────────────────────────────────────────── */}
      <Card className="bg-card border-border p-6 mb-6">
        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
          <Input
            placeholder="Search member by name or phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
              if (!e.target.value.trim()) setSelectedMember(null);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            className="pl-10 bg-surface border-border text-text"
          />

          {showDropdown && searchQuery.trim() && (
            <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-auto">
              {isSearching ? (
                <div className="p-4 flex items-center justify-center gap-2 text-text-muted">
                  <Loader2 className="w-4 h-4 animate-spin" /> Searching...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((m) => (
                  <button
                    key={m.id}
                    onMouseDown={() => handleSelectMember(m)}
                    className="w-full text-left px-4 py-3 hover:bg-surface transition-colors border-b border-border last:border-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-text">{m.name}</p>
                        <p className="text-sm text-text-muted">{m.phone}</p>
                      </div>
                      <Badge className={m.isActive ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}>
                        {m.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-text-muted">No members found</div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════════
          DEFAULT VIEW — no member selected: show today's gym-wide overview
      ══════════════════════════════════════════════════════════════════════ */}
      {!selectedMember && (
        <Card className="bg-card border-border overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-text flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Today's Attendance
                  <span className="text-text-muted font-normal text-base">
                    — {format(new Date(), 'EEEE, MMM dd yyyy')}
                  </span>
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">
                    {isLoadingToday ? '…' : todayRecords.length} checked in
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-text-muted"
                  onClick={fetchTodayOverview}
                  disabled={isLoadingToday}
                >
                  {isLoadingToday ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
                </Button>
              </div>
            </div>

            {isLoadingToday ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : todayRecords.length > 0 ? (
              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-surface/50">
                      <TableHead>#</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Marked By</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todayRecords.map((r, i) => (
                      <TableRow key={r.id} className="hover:bg-surface/40">
                        <TableCell className="text-text-muted text-sm w-10">{i + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-primary">
                                {r.member.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium text-text">{r.member.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-text-muted text-sm">
                          {r.markedBy?.name || '—'}
                        </TableCell>
                        <TableCell className="text-text-muted text-sm">
                          {format(new Date(r.createdAt), 'hh:mm a')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-text-muted" />
                </div>
                <p className="text-text font-medium mb-1">No attendance marked yet today</p>
                <p className="text-text-muted text-sm">Search a member above to get started</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MEMBER VIEW — member selected
      ══════════════════════════════════════════════════════════════════════ */}
      {selectedMember && (
        <>
          {/* Member card + mark panel */}
          <Card className="bg-card border-border p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-text">{selectedMember.name}</h3>
                    <Badge className={selectedMember.isActive ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}>
                      {selectedMember.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1 text-sm text-text-muted">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> {selectedMember.phone}
                    </span>
                    {selectedMember.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> {selectedMember.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <Input
                  type="date"
                  value={selectedDate}
                  max={todayStr()}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-surface border-border text-text h-9 text-sm w-40"
                />
                {isCheckingRecord || dateRecord === undefined ? (
                  <div className="flex items-center gap-2 text-text-muted text-sm px-3 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Checking...
                  </div>
                ) : dateRecord ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 bg-success/10 border border-success/30 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium text-success">
                        Present — {dateRecord.markedBy?.name || 'staff'}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-text-muted hover:text-destructive gap-1 h-9"
                      disabled={undoingId === dateRecord.id}
                      onClick={() => undoAttendance(dateRecord)}
                    >
                      {undoingId === dateRecord.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Undo2 className="w-3.5 h-3.5" />}
                      Undo
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="bg-primary hover:bg-primary/90 text-white gap-2"
                    disabled={isMarking}
                    onClick={markPresent}
                  >
                    {isMarking ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Mark Attendance
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* ── Lifetime stats ────────────────────────────────────────────── */}
          <Card className="bg-card border-border p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-text">
                Overall since{' '}
                <span className="text-text-muted font-normal">
                  {format(parseISO(selectedMember.joinDate), 'MMM dd, yyyy')}
                </span>
              </span>
            </div>
            {isLoadingSummary ? (
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
              </div>
            ) : summary ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-text-muted mb-1">Total Days</p>
                  <p className="text-2xl font-bold text-text">{summary.totalDays}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-1">Present</p>
                  <p className="text-2xl font-bold text-success">{summary.presentCount}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-1">Absent</p>
                  <p className="text-2xl font-bold text-destructive">{summary.absentCount}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-1">Lifetime Rate</p>
                  <p className="text-2xl font-bold text-accent">{summary.rate}%</p>
                </div>
              </div>
            ) : null}
          </Card>

          {/* ── Monthly history ───────────────────────────────────────────── */}
          <Card className="bg-card border-border overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-text">
                    {format(parseISO(historyMonth + '-01'), 'MMMM yyyy')}
                  </h3>
                  {!isLoadingHistory && (
                    <p className="text-sm text-text-muted mt-0.5">
                      {monthPresent} present · {monthTotal - monthPresent} absent · {monthRate}% rate
                    </p>
                  )}
                </div>
                <Select value={historyMonth} onValueChange={setHistoryMonth}>
                  <SelectTrigger className="w-44 bg-surface border-border text-text h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {monthOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isLoadingHistory ? (
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : (
                <div className="border border-border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-surface/50">
                        <TableHead>Date</TableHead>
                        <TableHead>Day</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Marked By</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthSlots.map(({ date, record }) => {
                        const dateStr = format(date, 'yyyy-MM-dd');
                        const isMarkingThis = markingDates.has(dateStr);
                        return (
                          <TableRow
                            key={date.toISOString()}
                            className={record ? 'hover:bg-surface/40' : 'hover:bg-surface/20'}
                          >
                            <TableCell className="font-medium">{format(date, 'dd MMM yyyy')}</TableCell>
                            <TableCell className="text-text-muted">{format(date, 'EEE')}</TableCell>
                            <TableCell>
                              {record ? (
                                <Badge className="bg-success/20 text-success gap-1">
                                  <CheckCircle className="w-3 h-3" /> Present
                                </Badge>
                              ) : (
                                <span className="text-text-muted text-sm">Absent</span>
                              )}
                            </TableCell>
                            <TableCell className="text-text-muted text-sm">
                              {record?.markedBy?.name ?? '—'}
                            </TableCell>
                            <TableCell className="text-right">
                              {record ? (
                                <Button
                                  variant="ghost" size="sm"
                                  className="h-7 px-2 text-text-muted hover:text-destructive"
                                  disabled={undoingId === record.id}
                                  onClick={() => undoAttendance(record)}
                                  title="Remove this mark"
                                >
                                  {undoingId === record.id
                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    : <Undo2 className="w-3.5 h-3.5" />}
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost" size="sm"
                                  className="h-7 px-2 text-text-muted hover:text-success gap-1 text-xs"
                                  disabled={isMarkingThis}
                                  onClick={() => markPresentForDate(dateStr)}
                                  title="Mark as present"
                                >
                                  {isMarkingThis
                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    : <><CheckCircle className="w-3.5 h-3.5" /> Mark</>}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </DashboardLayout>
  );
}
