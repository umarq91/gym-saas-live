"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable, Column } from "@/components/common/data-table";
import { MemberForm } from "@/components/members/member-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMembersStore } from "@/lib/store/members-store";
import { useApiCreate, useApiUpdate, useApiDelete } from "@/hooks/useApi";
import { Member, CreateMemberInput, UpdateMemberInput } from "@/lib/types";
import { Edit2, Trash2, Plus, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Loading from "./loading";

export default function MembersPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const store = useMembersStore();

  const createMutation = useApiCreate<Member, CreateMemberInput>({
    onSuccess: () => setFormOpen(false),
  });
  const updateMutation = useApiUpdate<Member, UpdateMemberInput>({
    onSuccess: () => setEditingMember(null),
  });
  const deleteMutation = useApiDelete<Member>();

  const searchParams = useSearchParams();

  // Load members on mount
  useEffect(() => {
    store.fetchMembers();
  }, []);

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    store.searchMembers(query);
  };

  // Handle form submission
  const handleFormSubmit = async (
    data: CreateMemberInput | UpdateMemberInput,
  ) => {
    if (editingMember) {
      const success = await store.updateMember(
        editingMember.id,
        data as UpdateMemberInput,
      );
      if (success) {
        setEditingMember(null);
      }
      return success;
    } else {
      const success = await store.createMember(data as CreateMemberInput);
      if (success) {
        setFormOpen(false);
      }
      return success;
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteId) return;
    const success = await store.deleteMember(deleteId);
    if (success) {
      setDeleteId(null);
    }
  };

  // Table columns
  const columns: Column<Member>[] = [
    {
      key: "name",
      label: "Member Name",
      sortable: true,
    },
    {
      key: "email",
      label: "Email",
      render: (value) => (
        <a href={`mailto:${value}`} className="text-primary hover:underline">
          {value}
        </a>
      ),
    },
    {
      key: "phone",
      label: "Phone",
    },
    {
      key: "joinDate",
      label: "Join Date",
      render: (value) =>
        formatDistanceToNow(new Date(value), { addSuffix: true }),
    },
    {
      key: "is_Active",
      label: "Status",
      render: (value) => (
        <Badge
          className={
            value === true
              ? "bg-success/20 text-success"
              : "bg-destructive/20 text-destructive"
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: "id",
      label: "Actions",
      width: "w-24",
      render: (_, member) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditingMember(member)}
            className="text-primary hover:bg-primary/10"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeleteId(member.id)}
            className="text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  console.log("Filterd members", store);

  return (
    <Suspense fallback={<Loading />}>
      <DashboardLayout>
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-text mb-2">Members</h2>
          <p className="text-text-muted">
            Manage gym members and their profiles
          </p>
        </div>

        {/* Filters & Actions */}
        <Card className="bg-card border-border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-surface border-border text-text"
              />
            </div>
            <Button
              onClick={() => {
                setEditingMember(null);
                setFormOpen(true);
              }}
              className="bg-primary hover:bg-primary-dark text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Member
            </Button>
          </div>
        </Card>

        {/* Data Table */}
        <Card className="bg-card border-border overflow-hidden">
          <div className="p-6">
            <DataTable
              columns={columns}
              data={store.filteredMembers}
              isLoading={store.isLoading}
              pagination={store.pagination}
              onPageChange={(page) =>
                store.fetchMembers({ ...store.filters, page })
              }
              emptyMessage="No members found"
            />
          </div>
        </Card>

        {/* Member Form Modal */}
        <MemberForm
          open={formOpen || editingMember !== null}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditingMember(null);
          }}
          member={editingMember || undefined}
          onSubmit={handleFormSubmit}
          isLoading={store.isLoading}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deleteId !== null}
          onOpenChange={(open) => !open && setDeleteId(null)}
        >
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Member</AlertDialogTitle>
              <AlertDialogDescription className="text-text-muted">
                Are you sure you want to delete this member? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel className="bg-surface text-text border-border hover:bg-surface/80">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive hover:bg-red-600 text-white"
              >
                Delete
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardLayout>
    </Suspense>
  );
}
