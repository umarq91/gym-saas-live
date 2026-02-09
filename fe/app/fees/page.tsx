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
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import Loading from "./loading";
import { useApiGet } from "@/hooks/useApi";
import { FeeDetailsModal } from "@/components/modals/fees-details-modal";

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
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: feesSummary, isLoading } = useApiGet<FeesSummaryResponse>("/fees");
  const router = useRouter();

  // Handler for opening the modal
  const handleViewMember = (memberId: string) => {
    setSelectedMemberId(memberId);
    setIsModalOpen(true);
  };

  // Handler for closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMemberId(null);
  };

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
    averagePayment: feesSummary.paid?.length 
      ? feesSummary.paid.reduce((sum, member) => sum + (member.lastPayment?.paidAmount || 0), 0) / feesSummary.paid.length
      : 0,
  };

  const columns: Column<MemberSummaryWithId>[] = [
    {
      key: "name",
      label: "Member",
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-text-muted">{row.phone}</div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (value) => value || "-",
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
        <Badge 
          className={value === "PAID" 
            ? "bg-green-500/20 text-green-600" 
            : "bg-red-500/20 text-red-600"
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: "lastPayment",
      label: "Last Payment",
      render: (value) => value ? (
        <div>
          <div className="font-medium">{formatCurrency(value.paidAmount)}</div>
          <div className="text-sm text-text-muted">
            {format(new Date(value.paidAt), "MMM dd, yyyy")}
          </div>
        </div>
      ) : (
        <span className="text-text-muted">No payment</span>
      ),
    },
    {
      key: "lastPayment",
      label: "Taken By",
      render: (value) => value?.takenBy?.name || "-",
    },
   {
  key: "memberId",
  label: "Actions",
  render: (value, row) => (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => router.push(`/fees/record?memberId=${value}`)}
      >
        Add Payment
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => router.push(`/fees/${value}`)} // Changed to navigate to page
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
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-text mb-2">Fees Management</h2>
        <p className="text-text-muted">
          Track member payment status and fee collections
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-card border-border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-muted mb-1">Total Members</p>
              <p className="text-3xl font-bold text-accent">
                {stats.totalMembers}
              </p>
            </div>
            <div className="p-3 bg-accent/20 rounded-lg">
              PKR
            </div>
          </div>
        </Card>

        <Card className="bg-card border-border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-muted mb-1">Paid Members</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.paidMembers}
              </p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <TrendingDown className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="bg-card border-border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-muted mb-1">Overdue Members</p>
              <p className="text-3xl font-bold text-destructive">
                {stats.overdueMembers}
              </p>
            </div>
            <div className="p-3 bg-destructive/20 rounded-lg">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
          </div>
        </Card>

        <Card className="bg-card border-border p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-muted mb-1">Total Collected</p>
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(stats.totalCollected)}
              </p>
            </div>
            <div className="p-3 bg-primary/20 rounded-lg">
              PKR
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
              placeholder="Search by member name, ID, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-surface border-border text-text"
            />
          </div>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "ALL" | "PAID" | "OVERDUE")}
            className="w-[180px] bg-surface border border-border rounded-md px-3 py-2 text-text"
          >
            <option value="ALL">All Status</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
          </select>

          <Button
            onClick={() => router.push('/fees/record')}
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

      {/* Summary Table */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="p-6">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-text">
              Member Payment Status ({filteredMembers.length} members)
            </h3>
            <div className="text-sm text-text-muted">
              Page {feesSummary.pagination?.page || 1} of {feesSummary.pagination?.pages || 1}
            </div>
          </div>
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
        </div>
      </Card>

      {/* Fee Details Modal */}
      {selectedMemberId && (
        <FeeDetailsModal
          memberId={selectedMemberId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </DashboardLayout>
  );
}