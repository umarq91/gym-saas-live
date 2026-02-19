"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Loading from "./loading";

export default function MembersPage() {
  const router = useRouter();
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const store = useMembersStore();

  const updateMutation = useApiUpdate<Member, UpdateMemberInput>({
    onSuccess: () => setEditingMember(null),
  });
  const deleteMutation = useApiDelete<Member>();

  const searchParams = useSearchParams();

  useEffect(() => {
    store.fetchMembers();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    store.searchMembers(query);
  };

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
    }
    return false;
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const success = await store.deleteMember(deleteId);
    if (success) {
      setDeleteId(null);
    }
  };

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
      render: (value) => {
        const date = new Date(value);
        return date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      },
    },
    {
      key: "fees",
      label: "Last fee paid at",
      render: (value) => {
        if(value?.length>0){
           const date = new Date(value[0]?.paidAt);
        return (
          date.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }) || "NOT PAID"
        );
        }else{
          return <span className="text-muted-foreground">No Record</span>
        }
      },
    },
    {
      key: "isActive",
      label: "Status",
      render: (value) => (
        <span
          className={
            value === true
              ? "text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-md"
              : "text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-md"
          }
        >
          {value == true ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "id",
      label: "Actions",
      width: "w-24",
      render: (_, member) => (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditingMember(member)}
            className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeleteId(member.id)}
            className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Suspense fallback={<Loading />}>
      <DashboardLayout>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Members</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage gym members and their profiles
            </p>
          </div>
          <Button
            onClick={() => router.push("/members/new")}
            className="gap-2"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            Add Member
          </Button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Data Table */}
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

        {/* Member Form Modal - Edit Only */}
        {editingMember && (
          <MemberForm
            open={editingMember !== null}
            onOpenChange={(open) => {
              if (!open) setEditingMember(null);
            }}
            member={editingMember}
            onSubmit={handleFormSubmit}
            isLoading={store.isLoading}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deleteId !== null}
          onOpenChange={(open) => !open && setDeleteId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Member</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this member? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
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
