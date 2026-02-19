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
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Building,
  MapPin,
  Users,
  Settings,
  Plus,
  Trash2,
  Phone,
  Mail,
} from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  joinDate: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const mockStaff: StaffMember[] = [
  {
    id: '1',
    name: 'Alex Manager',
    email: 'alex@gym.com',
    phone: '+1-234-567-8900',
    role: 'Manager',
    joinDate: '2023-01-15',
    status: 'ACTIVE',
  },
  {
    id: '2',
    name: 'Chris Trainer',
    email: 'chris@gym.com',
    phone: '+1-234-567-8901',
    role: 'Trainer',
    joinDate: '2023-06-20',
    status: 'ACTIVE',
  },
  {
    id: '3',
    name: 'Jordan Staff',
    email: 'jordan@gym.com',
    phone: '+1-234-567-8902',
    role: 'Receptionist',
    joinDate: '2024-01-10',
    status: 'ACTIVE',
  },
];

export default function GymPage() {
  const [gymStatus, setGymStatus] = useState(true);
  const [staffOpen, setStaffOpen] = useState(false);
  const [staff, setStaff] = useState<StaffMember[]>(mockStaff);
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Manager',
  });

  const handleAddStaff = () => {
    if (staffForm.name && staffForm.email && staffForm.phone) {
      const newStaff: StaffMember = {
        id: String(staff.length + 1),
        name: staffForm.name,
        email: staffForm.email,
        phone: staffForm.phone,
        role: staffForm.role,
        joinDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
      };
      setStaff([...staff, newStaff]);
      setStaffForm({ name: '', email: '', phone: '', role: 'Manager' });
      setStaffOpen(false);
    }
  };

  const handleDeleteStaff = (id: string) => {
    setStaff(staff.filter((s) => s.id !== id));
  };

  return (
    <DashboardLayout allowedRoles={['OWNER', 'SUPER_USER']}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Gym Management</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your gym settings and staff</p>
      </div>

      {/* Gym Details */}
      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1.5">FitFlow Gym</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">123 Fitness St, New York, NY 10001</p>
              </div>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                View on Maps
              </a>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-md">Active</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Gym Status:</span>
              <Switch
                checked={gymStatus}
                onCheckedChange={setGymStatus}
                aria-label="Toggle gym status"
              />
            </div>
          </div>
        </div>

        <Separator className="my-5" />

        {/* Plan Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted/30 rounded-xl">
            <p className="text-xs text-muted-foreground mb-1">Current Plan</p>
            <p className="text-xl font-bold text-primary">PRO</p>
            <p className="text-xs text-muted-foreground mt-1.5">Highest tier features</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-xl">
            <p className="text-xs text-muted-foreground mb-1">Member Limit</p>
            <p className="text-xl font-bold text-foreground">Unlimited</p>
            <p className="text-xs text-muted-foreground mt-1.5">1,248 / Unlimited</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-xl">
            <p className="text-xs text-muted-foreground mb-1">Renewal Date</p>
            <p className="text-xl font-bold text-foreground">Mar 15, 2025</p>
            <p className="text-xs text-muted-foreground mt-1.5">45 days remaining</p>
          </div>
        </div>
      </Card>

      {/* Staff Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Staff Members</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Manage gym staff and their roles</p>
          </div>
          <Button
            onClick={() => setStaffOpen(true)}
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Staff
          </Button>
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((member) => (
            <Card key={member.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/15 rounded-lg flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground text-sm">{member.name}</h4>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteStaff(member.id)}
                  className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-3.5 h-3.5" />
                  <a href={`mailto:${member.email}`} className="text-primary hover:underline">
                    {member.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-3.5 h-3.5" />
                  <a href={`tel:${member.phone}`} className="text-primary hover:underline">
                    {member.phone}
                  </a>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Joined {member.joinDate}
                </span>
                <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-md">{member.status}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Staff Dialog */}
      <Dialog open={staffOpen} onOpenChange={setStaffOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
            <DialogDescription>
              Add a new staff member to your gym
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Full name"
                value={staffForm.name}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="staff@gym.com"
                value={staffForm.email}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1-234-567-8900"
                value={staffForm.phone}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, phone: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={staffForm.role}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, role: e.target.value })
                }
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
              >
                <option value="Manager">Manager</option>
                <option value="Trainer">Trainer</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Janitor">Janitor</option>
              </select>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setStaffOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddStaff}>
                Add Staff
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
