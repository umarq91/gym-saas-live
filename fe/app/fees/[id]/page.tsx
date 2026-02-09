"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Download, Calendar, Phone, Mail, User } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { format } from "date-fns";
import { useApiGet } from "@/hooks/useApi";
import Loading from "@/app/fees/loading";

interface FeeDetail {
  id: string;
  originalAmount: number;
  amountPaid: number;
  discountType: "PERCENTAGE" | "FLAT" | null;
  discountApplied: string | null;
  type: string;
  paidAt: string;
  createdAt: string;
  updatedAt: string;
  takenBy: {
    id: string;
    name: string;
    role: string;
  };
}

interface MemberInfo {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  joinDate: string;
  isActive: boolean;
  notes: string | null;
  emergency_contact: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function MemberFeeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.id as string;

  const { data: feesData, isLoading: feesLoading } = useApiGet<FeeDetail[]>(
    memberId ? `/fees/${memberId}` : null
  );

  const { data: memberData, isLoading: memberLoading } = useApiGet<MemberInfo>(
    memberId ? `/members/${memberId}` : null
  );

  const isLoading = feesLoading || memberLoading;

  const calculateStats = (fees: FeeDetail[]) => {
    const totalPaid = fees.reduce((sum, fee) => sum + fee.amountPaid, 0);
    const totalOriginal = fees.reduce((sum, fee) => sum + fee.originalAmount, 0);
    const totalDiscount = totalOriginal - totalPaid;
    const lastPayment = fees.length > 0 ? fees[0] : null;

    return {
      totalPaid,
      totalOriginal,
      totalDiscount,
      transactionCount: fees.length,
      lastPayment,
    };
  };

  const stats = feesData ? calculateStats(feesData) : null;

  const exportToCSV = () => {
    if (!feesData || !memberData) return;

    const headers = [
      'Payment Date',
      'Type',
      'Original Amount',
      'Discount Type',
      'Discount Applied',
      'Amount Paid',
      'Collected By',
      'Transaction Date'
    ];

    const csvContent = [
      headers.join(','),
      ...feesData.map(fee => [
        format(new Date(fee.paidAt), 'yyyy-MM-dd'),
        fee.type,
        fee.originalAmount,
        fee.discountType || 'N/A',
        fee.discountApplied || '0',
        fee.amountPaid,
        fee.takenBy.name,
        format(new Date(fee.createdAt), 'yyyy-MM-dd HH:mm')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${memberData.name}_fee_history_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );
  }

  if (!memberData) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <h2 className="text-2xl font-bold mb-4">Member Not Found</h2>
          <p className="text-text-muted mb-6">The member you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/fees')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Fees
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header with Back Button */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/fees')}
          className="mb-4 px-0 hover:bg-transparent"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Fees
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-text mb-2">
              {memberData.name}'s Fee History
            </h2>
            <p className="text-text-muted">
              Complete payment history and member details
            </p>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button
              onClick={() => router.push(`/fees/record?memberId=${memberId}`)}
              className="bg-primary hover:bg-primary-dark text-white"
            >
              Add New Payment
            </Button>
            <Button
              variant="outline"
              onClick={exportToCSV}
              disabled={!feesData || feesData.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Member Information Card */}
      <Card className="bg-card border-border p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text">{memberData.name}</h3>
                <div className="flex items-center gap-4 mt-2">
                  <Badge className={memberData.isActive ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"}>
                    {memberData.isActive ? "Active Member" : "Inactive Member"}
                  </Badge>
                  <span className="text-sm text-text-muted">
                    Member since {format(new Date(memberData.joinDate), "MMM dd, yyyy")}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-text-muted" />
                <span className="font-medium">{memberData.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-text-muted" />
                <span className="font-medium">{memberData.email || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-text-muted" />
                <span className="font-medium">
                  {format(new Date(memberData.joinDate), "MMM dd, yyyy")}
                </span>
              </div>
            </div>

            {memberData.emergency_contact && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="text-sm font-medium text-yellow-600 mb-1">Emergency Contact</div>
                <div className="text-text">{memberData.emergency_contact}</div>
              </div>
            )}
          </div>

          <div className="md:text-right">
            <div className="text-sm text-text-muted mb-1">Member ID</div>
            <code className="bg-surface px-3 py-1 rounded text-sm font-mono">
              {memberData.id}
            </code>
          </div>
        </div>

        {memberData.notes && (
          <div className="mt-6 pt-6 border-t border-border">
            <div className="text-sm font-medium text-text-muted mb-2">Notes</div>
            <div className="text-text">{memberData.notes}</div>
          </div>
        )}
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-card border-border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-muted mb-1">Total Transactions</p>
              <p className="text-3xl font-bold text-accent">
                {stats?.transactionCount || 0}
              </p>
            </div>
            <div className="p-3 bg-accent/20 rounded-lg">
              <Calendar className="w-6 h-6 text-accent" />
            </div>
          </div>
        </Card>

        <Card className="bg-card border-border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-muted mb-1">Total Amount Paid</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(stats?.totalPaid || 0)}
              </p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              PKR
            </div>
          </div>
        </Card>

        <Card className="bg-card border-border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-muted mb-1">Total Discount</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(stats?.totalDiscount || 0)}
              </p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <span className="text-blue-600 font-medium">%</span>
            </div>
          </div>
        </Card>
      
      </div>

      {/* Last Payment Summary */}
      {stats?.lastPayment && (
        <Card className="bg-card border-border p-6 mb-8">
          <h3 className="text-lg font-semibold text-text mb-4">Last Payment</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-text-muted mb-1">Amount</div>
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(stats.lastPayment.amountPaid)}
              </div>
            </div>
            <div>
              <div className="text-sm text-text-muted mb-1">Date</div>
              <div className="text-xl font-medium">
                {format(new Date(stats.lastPayment.paidAt), "MMM dd, yyyy")}
              </div>
            </div>
            <div>
              <div className="text-sm text-text-muted mb-1">Type</div>
              <Badge variant="outline">{stats.lastPayment.type}</Badge>
            </div>
            <div>
              <div className="text-sm text-text-muted mb-1">Collected By</div>
              <div className="text-xl font-medium">
                {stats.lastPayment.takenBy.name}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Fee History Table */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="p-6">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-text">
              Payment History {feesData && `(${feesData.length} transactions)`}
            </h3>
            {feesData && feesData.length > 0 && (
              <div className="text-sm text-text-muted">
                Total billed: {formatCurrency(stats?.totalOriginal || 0)}
              </div>
            )}
          </div>

          {feesData && feesData.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Original Amount</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Amount Paid</TableHead>
                    <TableHead>Collected By</TableHead>
                    <TableHead>Transaction Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feesData.map((fee) => (
                    <TableRow key={fee.id} className="hover:bg-surface">
                      <TableCell className="font-medium">
                        <div>
                          {format(new Date(fee.paidAt), "MMM dd, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-surface">
                          {fee.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(fee.originalAmount)}
                      </TableCell>
                      <TableCell>
                        {fee.discountType && fee.discountApplied ? (
                          <div className="flex flex-col">
                            <span className="text-green-600">
                              -{formatCurrency(fee.originalAmount - fee.amountPaid)}
                            </span>
                            <span className="text-xs text-text-muted">
                              {fee.discountApplied} {fee.discountType.toLowerCase()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-text-muted">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatCurrency(fee.amountPaid)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{fee.takenBy.name}</div>
                          <div className="text-xs text-text-muted">{fee.takenBy.role}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-text-muted">
                        {format(new Date(fee.createdAt), "hh:mm a")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-text-muted" />
              </div>
              <h4 className="text-lg font-medium text-text mb-2">No Payment History</h4>
              <p className="text-text-muted mb-6 max-w-md mx-auto">
                This member hasn't made any payments yet. Record their first payment to get started.
              </p>
              <Button
                onClick={() => router.push(`/fees/record?memberId=${memberId}`)}
                className="bg-primary hover:bg-primary-dark text-white"
              >
                Record First Payment
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Summary Footer */}
      {stats && feesData && feesData.length > 0 && (
        <div className="mt-6 flex flex-col md:flex-row justify-between items-center p-4 bg-surface rounded-lg">
          <div className="text-sm text-text-muted mb-2 md:mb-0">
            Showing {feesData.length} transaction{feesData.length !== 1 ? 's' : ''}
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <div className="text-sm text-text-muted">Total Billed</div>
              <div className="text-lg font-bold">{formatCurrency(stats.totalOriginal)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-text-muted">Total Paid</div>
              <div className="text-lg font-bold text-green-600">{formatCurrency(stats.totalPaid)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-text-muted">Total Discount</div>
              <div className="text-lg font-bold text-blue-600">{formatCurrency(stats.totalDiscount)}</div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}