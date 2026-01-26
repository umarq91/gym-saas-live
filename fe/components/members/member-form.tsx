'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Member } from '@/lib/types';

const memberSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Invalid phone number'),
  membershipType: z.string().optional(),
  emergencyContact: z.string().optional(),
  notes: z.string().optional(),
});

type MemberFormData = z.infer<typeof memberSchema>;

interface MemberFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: Member;
  onSubmit: (data: MemberFormData) => Promise<boolean>;
  isLoading?: boolean;
}

export function MemberForm({
  open,
  onOpenChange,
  member,
  onSubmit,
  isLoading,
}: MemberFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: member
      ? {
          name: member.name,
          email: member.email,
          phone: member.phone,
          membershipType: member.membershipType,
          emergencyContact: member.emergencyContact,
          notes: member.notes,
        }
      : undefined,
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
    }
    onOpenChange(newOpen);
  };

  const onFormSubmit = async (data: MemberFormData) => {
    const success = await onSubmit(data);
    if (success) {
      reset();
      handleOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-text">
            {member ? 'Edit Member' : 'Add New Member'}
          </DialogTitle>
          <DialogDescription className="text-text-muted">
            {member
              ? 'Update member information'
              : 'Add a new member to your gym'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="John Doe"
              {...register('name')}
              className="bg-surface border-border text-text"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              {...register('email')}
              className="bg-surface border-border text-text"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1-234-567-8900"
              {...register('phone')}
              className="bg-surface border-border text-text"
              disabled={isLoading}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          {/* Membership Type */}
          <div className="space-y-2">
            <Label htmlFor="membershipType">Membership Type</Label>
            <Input
              id="membershipType"
              placeholder="Premium, Standard, Basic"
              {...register('membershipType')}
              className="bg-surface border-border text-text"
              disabled={isLoading}
            />
          </div>

          {/* Emergency Contact */}
          <div className="space-y-2">
            <Label htmlFor="emergencyContact">Emergency Contact</Label>
            <Input
              id="emergencyContact"
              placeholder="Contact name"
              {...register('emergencyContact')}
              className="bg-surface border-border text-text"
              disabled={isLoading}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              {...register('notes')}
              className="bg-surface border-border text-text min-h-24"
              disabled={isLoading}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
