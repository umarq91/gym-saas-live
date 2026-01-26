'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable, Column } from '@/components/common/data-table';
import {
  DollarSign,
  TrendingDown,
  AlertCircle,
  Plus,
  Search,
  Download,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { format } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Loading from './loading';

// Mock fees data
const mockFeesData = [
  {
    id: '1',
    memberId: '101',
    memberName: 'John Doe',
    originalAmount: 50,
    discountType: 'PERCENTAGE' as const,
    discountValue: 10,
    amountPaid: 45,
    feeType: 'MONTHLY' as const,
    paymentStatus: 'PAID' as const,
    paidDate: new Date(2024, 0, 10),
  },
  {
    id: '2',
    memberId: '102',
    memberName: 'Jane Smith',
    originalAmount: 50,
    discountType: undefined,
    discountValue: 0,
    amountPaid: 50,
    feeType: 'MONTHLY' as const,
    paymentStatus: 'PAID' as const,
    paidDate: new Date(2024, 0, 5),
  },
  {
    id: '3',
    memberId: '103',
    memberName: 'Mike Johnson',
    originalAmount: 150,
    discountType: 'FLAT' as const,
    discountValue: 20,
    amountPaid: 0,
    feeType: 'QUARTERLY' as const,
    paymentStatus: 'PENDING' as const,
  },
  {
    id: '4',
    memberId: '104',
    memberName: 'Sarah Williams',
    originalAmount: 50,
    discountType: undefined,
    discountValue: 0,
    amountPaid: 0,
    feeType: 'MONTHLY' as const,
    paymentStatus: 'OVERDUE' as const,
  },
];

interface FeeRecord {
  id: string;
  memberId: string;
  memberName: string;
  originalAmount: number;
  discountType?: 'PERCENTAGE' | 'FLAT';
  discountValue?: number;
  amountPaid: number;
  feeType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ONE_TIME';
  paymentStatus: 'PAID' | 'PENDING' | 'OVERDUE';
  paidDate?: Date;
}

export default function FeesPage() {
  const searchParams = useSearchParams();
  const [feeData, setFeeData] = useState<FeeRecord[]>(mockFeesData);
  const [formOpen, setFormOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'PAID' | 'PENDING' | 'OVERDUE'>(
    'all'
  );
  const [searchQuery, setSearchQuery] = useState('');

  const calculateDiscount = (original: number, type?: string, value?: number) => {
    if (!type || !value) return 0;
    if (type === 'PERCENTAGE') return (original * value) / 100;
    return value;
  };

  const filteredFees = feeData.filter((fee) => {
    const matchesSearch =
      fee.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fee.memberId.includes(searchQuery);
    const matchesStatus = filterStatus === 'all' || fee.paymentStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    totalCollected: feeData
      .filter((f) => f.paymentStatus === 'PAID')
      .reduce((sum, f) => sum + f.amountPaid, 0),
    outstanding: feeData
      .filter((f) => f.paymentStatus !== 'PAID')
      .reduce((sum, f) => sum + (f.originalAmount - f.amountPaid), 0),
    pending: feeData.filter((f) => f.paymentStatus === 'PENDING').length,
    overdue: feeData.filter((f) => f.paymentStatus === 'OVERDUE').length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return '✓';
      case 'PENDING':
        return '⏳';
      case 'OVERDUE':
        return '⚠️';
      default:
        return '-';
    }
  };

  const columns: Column<FeeRecord>[] = [
    {
      key: 'memberName',
      label: 'Member',
    },
    {
      key: 'feeType',
      label: 'Fee Type',
      render: (value) => (
        <Badge className="bg-primary/20 text-primary">{value}</Badge>
      ),
    },
    {
      key: 'originalAmount',
      label: 'Original Amount',
      render: (value) => formatCurrency(value),
    },
    {
      key: 'discountValue',
      label: 'Discount',
      render: (value, row) =>
        value ? (
          <span className="text-text-muted">
            {row.discountType === 'PERCENTAGE'
              ? `${value}%`
              : `$${value}`} -$
            {calculateDiscount(
              row.originalAmount,
              row.discountType,
              value
            ).toFixed(2)}
          </span>
        ) : (
          <span className="text-text-muted">-</span>
        ),
    },
    {
      key: 'amountPaid',
      label: 'Amount Paid',
      render: (value) => formatCurrency(value),
    },
    {
      key: 'paymentStatus',
      label: 'Status',
      render: (value) => (
        <Badge
          className={
            value === 'PAID'
              ? 'bg-success/20 text-success'
              : value === 'PENDING'
                ? 'bg-warning/20 text-warning'
                : 'bg-destructive/20 text-destructive'
          }
        >
          {value}
        </Badge>
      ),
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

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-text mb-2">Fees Management</h2>
        <p className="text-text-muted">Track member payments and fee collections</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-card border-border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-muted mb-1">Total Collected</p>
              <p className="text-3xl font-bold text-accent">
                {formatCurrency(stats.totalCollected)}
              </p>
            </div>
            <div className="p-3 bg-accent/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-accent" />
            </div>
          </div>
        </Card>

        <Card className="bg-card border-border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-muted mb-1">Outstanding</p>
              <p className="text-3xl font-bold text-warning">
                {formatCurrency(stats.outstanding)}
              </p>
            </div>
            <div className="p-3 bg-warning/20 rounded-lg">
              <TrendingDown className="w-6 h-6 text-warning" />
            </div>
          </div>
        </Card>

        <Card className="bg-card border-border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-muted mb-1">Pending Payments</p>
              <p className="text-3xl font-bold text-text">{stats.pending}</p>
            </div>
            <div className="p-3 bg-primary/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="bg-card border-border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-muted mb-1">Overdue Fees</p>
              <p className="text-3xl font-bold text-destructive">{stats.overdue}</p>
            </div>
            <div className="p-3 bg-destructive/20 rounded-lg">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card className="bg-card border-border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
            <Input
              placeholder="Search by member name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-surface border-border text-text"
            />
          </div>

          <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
            <SelectTrigger className="w-40 bg-surface border-border">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="OVERDUE">Overdue</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => setFormOpen(true)}
            className="bg-primary hover:bg-primary-dark text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            Record Payment
          </Button>

          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </Card>

      {/* Fees Table */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="p-6">
          <DataTable
            columns={columns}
            data={filteredFees}
            emptyMessage="No fee records found"
          />
        </div>
      </Card>

      {/* Record Payment Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription className="text-text-muted">
              Record a new payment or fee entry
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="member">Member *</Label>
              <Input
                id="member"
                placeholder="Select member"
                className="bg-surface border-border text-text"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  className="bg-surface border-border text-text"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feeType">Fee Type *</Label>
                <Select defaultValue="MONTHLY">
                  <SelectTrigger className="bg-surface border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                    <SelectItem value="ONE_TIME">One Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount">Discount Type</Label>
                <Select>
                  <SelectTrigger className="bg-surface border-border">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FLAT">Flat Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountValue">Discount Value</Label>
                <Input
                  id="discountValue"
                  type="number"
                  placeholder="0.00"
                  className="bg-surface border-border text-text"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-primary hover:bg-primary-dark text-white">
                Record Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

// export function Loading() {
//   return null;
// }
