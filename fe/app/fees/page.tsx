"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DataTable, Column } from "@/components/common/data-table";
import {
  TrendingDown,
  AlertCircle,
  Plus,
  Search,
  Download,
  DollarSign,
  Users,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import Loading from "./loading";
import { useApiGet } from "@/hooks/useApi";

interface MemberSummary {
  memberId: string;
  name: string;
  phone: string;
  email: string;
  joinDate: string;
  status: "PAID" | "OVERDUE";
  lastPayment: {
    paidAt: string;
    paidAmount: number;
    takenBy: {
      id: string;
      name: string;
      role: string;
      createdAt: string;
    };
  } | null;
}

interface FeesSummaryResponse {
  overdue: MemberSummary[];
  paid: MemberSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

type MemberSummaryWithId = MemberSummary & { id: string };

export default function FeesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "OVERDUE">("ALL");
  const { data: feesSummary, isLoading } = useApiGet<FeesSummaryResponse>("/fees");
  const router = useRouter();

  if (isLoading || !feesSummary) {
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );
  }

  const allMembers: MemberSummaryWithId[] = [
    ...(feesSummary.overdue || []),
    ...(feesSummary.paid || [])
  ].map(member => ({
    ...member,
    id: member.memberId
  }));

  const filteredMembers = allMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.memberId.includes(searchQuery) ||
      member.phone.includes(searchQuery);

    const matchesStatus = statusFilter === "ALL" || member.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalMembers: allMembers.length,
    overdueMembers: feesSummary.overdue?.length || 0,
    paidMembers: feesSummary.paid?.length || 0,
    totalCollected: allMembers.reduce((sum, member) => {
      return sum + (member.lastPayment?.paidAmount || 0);
    }, 0),
  };

  const columns: Column<MemberSummaryWithId>[] = [
    {
      key: "name",
      label: "Member",
      render: (value, row) => (
        <div>
          <div className="font-medium text-foreground">{value}</div>
          <div className="text-xs text-muted-foreground">{row.phone}</div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (value) => <span className="text-muted-foreground">{value || "-"}</span>,
    },
    {
      key: "joinDate",
      label: "Join Date",
      render: (value) => format(new Date(value), "MMM dd, yyyy"),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span
          className={value === "PAID"
            ? "text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-md"
            : "text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-md"
          }
        >
          {value}
        </span>
      ),
    },
    {
      key: "lastPayment",
      label: "Last Payment",
      render: (value) => value ? (
        <div>
          <div className="font-medium text-foreground">{formatCurrency(value.paidAmount)}</div>
          <div className="text-xs text-muted-foreground">
            {format(new Date(value.paidAt), "MMM dd, yyyy")}
          </div>
        </div>
      ) : (
        <span className="text-muted-foreground">No payment</span>
      ),
    },
    {
      key: "lastPayment",
      label: "Taken By",
      render: (value) => <span className="text-muted-foreground">{value?.takenBy?.name || "-"}</span>,
    },
   {
      key: "memberId",
      label: "Actions",
      render: (value, row) => (
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => router.push(`/fees/record?memberId=${value}`)}
          >
            Add Payment
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => router.push(`/fees/${value}`)}
          >
            View
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Fees</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track member payment status and collections
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button
            onClick={() => router.push('/fees/record')}
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Total Members</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalMembers}</p>
            </div>
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Users className="w-5 h-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Paid Members</p>
              <p className="text-2xl font-bold text-success">{stats.paidMembers}</p>
            </div>
            <div className="p-2.5 bg-success/10 rounded-xl">
              <TrendingDown className="w-5 h-5 text-success" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Overdue Members</p>
              <p className="text-2xl font-bold text-destructive">{stats.overdueMembers}</p>
            </div>
            <div className="p-2.5 bg-destructive/10 rounded-xl">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Total Collected</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalCollected)}</p>
            </div>
            <div className="p-2.5 bg-chart-3/10 rounded-xl">
              <DollarSign className="w-5 h-5 text-chart-3" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "ALL" | "PAID" | "OVERDUE")}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
        >
          <option value="ALL">All Status</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
        </select>
      </div>

      {/* Summary Table */}
      <DataTable
        columns={columns}
        data={filteredMembers}
        emptyMessage="No members found matching your search"
        pagination={{
          page: feesSummary.pagination?.page || 1,
          limit: feesSummary.pagination?.limit || 20,
          total: feesSummary.pagination?.total || filteredMembers.length,
          totalPages: feesSummary.pagination?.pages || 1,
        }}
        onPageChange={(page) => {
          console.log("Page changed to:", page);
        }}
      />

    </DashboardLayout>
  );
}
