"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/auth-context'
import { UserRole } from '@/types'
import {
  BarChart3,
  Users,
  DollarSign,
  Calendar,
  Settings,
  LogOut,
  Building,
  UserPlus,
  Crown,
  Dumbbell,
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    roles: ['OWNER', 'STAFF', 'SUPER__USER'] as UserRole[],
  },
  {
    name: 'Members',
    href: '/dashboard/members',
    icon: Users,
    roles: ['OWNER', 'STAFF'] as UserRole[],
  },
  {
    name: 'Fees',
    href: '/dashboard/fees',
    icon: DollarSign,
    roles: ['OWNER', 'STAFF'] as UserRole[],
  },
  {
    name: 'Attendance',
    href: '/dashboard/attendance',
    icon: Calendar,
    roles: ['OWNER', 'STAFF'] as UserRole[],
  },
  {
    name: 'Staff',
    href: '/dashboard/staff',
    icon: UserPlus,
    roles: ['OWNER'] as UserRole[],
  },
  {
    name: 'Gyms',
    href: '/dashboard/gyms',
    icon: Building,
    roles: ['SUPER__USER'] as UserRole[],
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    roles: ['OWNER', 'STAFF', 'SUPER__USER'] as UserRole[],
  },
]

interface DashboardSidebarProps {
  className?: string
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { user, logout, gym } = useAuth()

  const filteredNavigation = navigation.filter(item =>
    user?.role && item.roles.includes(user.role)
  )

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'SUPER__USER':
        return <Crown className="h-4 w-4" />
      case 'OWNER':
        return <Building className="h-4 w-4" />
      case 'STAFF':
        return <Dumbbell className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center space-x-2 mb-6">
            <Dumbbell className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">Gym SaaS</h2>
              {gym && (
                <p className="text-sm text-muted-foreground">{gym.name}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-1">
            {filteredNavigation.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div className="px-3 py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarFallback>
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{user?.name}</span>
                <div className="flex items-center text-xs text-muted-foreground">
                  {getRoleIcon(user?.role || 'STAFF')}
                  <span className="ml-1">{user?.role?.replace('_', ' ')}</span>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
