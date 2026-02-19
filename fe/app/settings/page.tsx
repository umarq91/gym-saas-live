'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAuthStore } from '@/lib/store/auth-store';
import { User, Lock, Bell, Palette, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences'>('profile');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    bio: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Palette },
  ];

  const handleSaveProfile = () => {
    console.log('Saving profile:', profileData);
  };

  const handleChangePassword = () => {
    console.log('Changing password');
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card className="overflow-hidden p-0">
            <div className="space-y-0.5 p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm rounded-lg transition-all ${
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-1">Profile Information</h3>
                <p className="text-sm text-muted-foreground">Update your personal details</p>
              </div>

              <div className="space-y-5">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary/15 rounded-full flex items-center justify-center">
                    <span className="text-xl text-primary font-bold">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <Button variant="outline" size="sm" className="mb-1 block">
                      Change Avatar
                    </Button>
                    <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 5MB</p>
                  </div>
                </div>

                <Separator />

                {/* Name & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({ ...profileData, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Phone & Role */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1-234-567-8900"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({ ...profileData, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Role</Label>
                    <div className="flex items-center gap-2 h-9 px-3 bg-muted/50 border border-border rounded-md">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">{user?.role}</span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-1.5">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData({ ...profileData, bio: e.target.value })
                    }
                    className="min-h-20"
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <Card className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-1">Security Settings</h3>
                <p className="text-sm text-muted-foreground">Manage your password and security options</p>
              </div>

              <div className="space-y-5">
                <div className="p-4 bg-muted/30 rounded-xl">
                  <h4 className="font-medium text-foreground text-sm mb-3">Change Password</h4>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button onClick={handleChangePassword}>
                      Update Password
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                  <div>
                    <h4 className="font-medium text-foreground text-sm">Two-Factor Authentication</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Add an extra layer of security
                    </p>
                  </div>
                  <Switch disabled />
                </div>
              </div>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-1">Notifications</h3>
                <p className="text-sm text-muted-foreground">Manage how you receive updates</p>
              </div>

              <div className="space-y-2">
                {[
                  { title: 'Email Notifications', desc: 'Get updates via email' },
                  { title: 'Payment Alerts', desc: 'Alert when payments are received' },
                  { title: 'Low Attendance', desc: 'Notify when attendance is low' },
                  { title: 'New Members', desc: 'Alert when new members join' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium text-foreground text-sm">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <Switch defaultChecked={idx < 2} />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <Card className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-1">Preferences</h3>
                <p className="text-sm text-muted-foreground">Customize your experience</p>
              </div>

              <div className="space-y-2">
                {[
                  { title: 'Dark Mode', desc: 'Always use dark theme' },
                  { title: 'Compact View', desc: 'Show more data in tables' },
                  { title: 'Auto-Save', desc: 'Automatically save changes' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium text-foreground text-sm">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <Switch defaultChecked={idx === 0} />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Logout Section */}
          <Card className="p-5 border-destructive/30 bg-destructive/5">
            <h3 className="text-sm font-semibold text-destructive mb-1">Danger Zone</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Log out from your account on all devices
            </p>
            <Button
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
              variant="destructive"
              size="sm"
              className="gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </Button>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
