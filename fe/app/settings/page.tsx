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
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-text mb-2">Settings</h2>
        <p className="text-text-muted">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card className="bg-card border-border overflow-hidden">
            <div className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                      isActive
                        ? 'bg-primary/20 text-primary border-l-2 border-primary'
                        : 'text-text-muted hover:bg-surface/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card className="bg-card border-border p-6">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-text mb-2">Profile Information</h3>
                <p className="text-text-muted">Update your personal details</p>
              </div>

              <div className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                    <span className="text-2xl text-white font-bold">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <Button variant="outline" className="mb-2 block bg-transparent">
                      Change Avatar
                    </Button>
                    <p className="text-xs text-text-muted">JPG, PNG or GIF. Max 5MB</p>
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                      className="bg-surface border-border text-text"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({ ...profileData, email: e.target.value })
                      }
                      className="bg-surface border-border text-text"
                    />
                  </div>
                </div>

                {/* Phone & Bio */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1-234-567-8900"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({ ...profileData, phone: e.target.value })
                      }
                      className="bg-surface border-border text-text"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <div className="flex items-center gap-2 p-2 bg-surface border border-border rounded">
                      <Badge className="bg-primary/20 text-primary">{user?.role}</Badge>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData({ ...profileData, bio: e.target.value })
                    }
                    className="bg-surface border-border text-text min-h-24"
                  />
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveProfile}
                    className="bg-primary hover:bg-primary-dark text-white"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <Card className="bg-card border-border p-6">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-text mb-2">Security Settings</h3>
                <p className="text-text-muted">Manage your password and security options</p>
              </div>

              <div className="space-y-6">
                {/* Change Password */}
                <div className="p-4 bg-surface/50 rounded-lg border border-border">
                  <h4 className="font-semibold text-text mb-4">Change Password</h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
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
                        className="bg-surface border-border text-text"
                      />
                    </div>
                    <div className="space-y-2">
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
                        className="bg-surface border-border text-text"
                      />
                    </div>
                    <div className="space-y-2">
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
                        className="bg-surface border-border text-text"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button
                      onClick={handleChangePassword}
                      className="bg-primary hover:bg-primary-dark text-white"
                    >
                      Update Password
                    </Button>
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* Two Factor Auth */}
                <div className="flex items-center justify-between p-4 bg-surface/50 rounded-lg border border-border">
                  <div>
                    <h4 className="font-semibold text-text">Two-Factor Authentication</h4>
                    <p className="text-sm text-text-muted mt-1">
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
            <Card className="bg-card border-border p-6">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-text mb-2">Notifications</h3>
                <p className="text-text-muted">Manage how you receive updates</p>
              </div>

              <div className="space-y-4">
                {[
                  { title: 'Email Notifications', desc: 'Get updates via email' },
                  { title: 'Payment Alerts', desc: 'Alert when payments are received' },
                  { title: 'Low Attendance', desc: 'Notify when attendance is low' },
                  { title: 'New Members', desc: 'Alert when new members join' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-surface/50 rounded-lg border border-border"
                  >
                    <div>
                      <h4 className="font-semibold text-text">{item.title}</h4>
                      <p className="text-sm text-text-muted">{item.desc}</p>
                    </div>
                    <Switch defaultChecked={idx < 2} />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <Card className="bg-card border-border p-6">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-text mb-2">Preferences</h3>
                <p className="text-text-muted">Customize your experience</p>
              </div>

              <div className="space-y-4">
                {[
                  { title: 'Dark Mode', desc: 'Always use dark theme' },
                  { title: 'Compact View', desc: 'Show more data in tables' },
                  { title: 'Auto-Save', desc: 'Automatically save changes' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-surface/50 rounded-lg border border-border"
                  >
                    <div>
                      <h4 className="font-semibold text-text">{item.title}</h4>
                      <p className="text-sm text-text-muted">{item.desc}</p>
                    </div>
                    <Switch defaultChecked={idx === 0} />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Logout Section */}
          <Card className="bg-destructive/10 border border-destructive p-6">
            <h3 className="text-xl font-bold text-destructive mb-2">Danger Zone</h3>
            <p className="text-sm text-destructive/80 mb-4">
              Log out from your account on all devices
            </p>
            <Button
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
              className="bg-destructive hover:bg-red-600 text-white gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
