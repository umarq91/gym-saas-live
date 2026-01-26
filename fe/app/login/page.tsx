'use client';

import React from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Dumbbell } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    const success = await login(email, password);
    if (success) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-primary to-accent p-3 rounded-lg">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-balance">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                FitFlow
              </span>
            </h1>
          </div>
          <p className="text-text-muted">Gym Management SaaS Dashboard</p>
        </div>

        {/* Login Card */}
        <Card className="bg-card border-border p-8">
          <h2 className="text-xl font-semibold mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Messages */}
            {(formError || error) && (
              <div className="bg-destructive/10 border border-destructive text-destructive text-sm p-3 rounded-md">
                {formError || error}
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">Email or Username</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@fitflow.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-surface text-text border-border"
                disabled={isLoading}
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-surface text-text border-border"
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary-foreground text-white mt-6"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-text-muted mb-3">Demo Credentials:</p>
            <div className="space-y-1 text-xs text-text-muted">
              <p><span className="font-mono bg-surface px-2 py-1 rounded">admin@fitflow.com</span></p>
              <p><span className="font-mono bg-surface px-2 py-1 rounded">password123</span></p>
            </div>
          </div>
        </Card>

        {/* Features Info */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-center text-xs">
          <div className="bg-card/50 border border-border p-3 rounded-md">
            <p className="text-primary font-semibold">👥</p>
            <p className="text-text-muted mt-1">Members</p>
          </div>
          <div className="bg-card/50 border border-border p-3 rounded-md">
            <p className="text-accent font-semibold">📊</p>
            <p className="text-text-muted mt-1">Analytics</p>
          </div>
          <div className="bg-card/50 border border-border p-3 rounded-md">
            <p className="text-secondary font-semibold">💰</p>
            <p className="text-text-muted mt-1">Billing</p>
          </div>
        </div>
      </div>
    </div>
  );
}
