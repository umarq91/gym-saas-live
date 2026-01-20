"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api'
import { Gym, CreateGymData, GymPlan } from '@/types'
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, Building, Users, Crown, Star } from 'lucide-react'
import { toast } from 'sonner'

const gymSchema = z.object({
  name: z.string().min(2, 'Gym name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  googleMapAddress: z.string().min(5, 'Google Maps address must be at least 5 characters'),
  plan: z.enum(['FREE', 'BASIC', 'PRO']),
})

type GymFormData = z.infer<typeof gymSchema>

export default function GymsPage() {
  const { user } = useAuth()
  const [gyms, setGyms] = useState<Gym[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreateOwnerDialogOpen, setIsCreateOwnerDialogOpen] = useState(false)

  const form = useForm<GymFormData>({
    resolver: zodResolver(gymSchema),
    defaultValues: {
      name: '',
      address: '',
      googleMapAddress: '',
      plan: 'FREE',
    },
  })

  const ownerForm = useForm({
    defaultValues: {
      email: '',
      username: '',
      name: '',
      password: '',
    },
  })

  useEffect(() => {
    fetchGyms()
  }, [])

  const fetchGyms = async () => {
    try {
      // Mock data for now - would need API endpoint to fetch all gyms
      const mockGyms: Gym[] = [
        {
          id: '1',
          name: 'FitZone Downtown',
          address: '123 Main St, Downtown',
          googleMapAddress: 'https://maps.google.com/?q=123+Main+St',
          status: 'ACTIVE',
          plan: 'PRO',
        },
        {
          id: '2',
          name: 'Power Gym West',
          address: '456 Oak Ave, West Side',
          googleMapAddress: 'https://maps.google.com/?q=456+Oak+Ave',
          status: 'ACTIVE',
          plan: 'BASIC',
        },
        {
          id: '3',
          name: 'Elite Fitness',
          address: '789 Pine Rd, North District',
          googleMapAddress: 'https://maps.google.com/?q=789+Pine+Rd',
          status: 'INACTIVE',
          plan: 'FREE',
        },
      ]
      setGyms(mockGyms)
    } catch (error) {
      toast.error('Failed to fetch gyms')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: GymFormData) => {
    try {
      await apiClient.createGym(data)
      toast.success('Gym created successfully')
      setIsCreateDialogOpen(false)
      form.reset()
      fetchGyms()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create gym')
    }
  }

  const onCreateOwner = async (data: any) => {
    try {
      await apiClient.createOwner(data)
      toast.success('Gym owner created successfully')
      setIsCreateOwnerDialogOpen(false)
      ownerForm.reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create gym owner')
    }
  }

  const filteredGyms = gyms.filter(gym => {
    const matchesSearch = !searchTerm || 
      gym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gym.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPlan = selectedPlan === 'all' || gym.plan === selectedPlan
    return matchesSearch && matchesPlan
  })

  const getPlanIcon = (plan: GymPlan) => {
    switch (plan) {
      case 'PRO':
        return <Crown className="h-4 w-4 text-yellow-600" />
      case 'BASIC':
        return <Star className="h-4 w-4 text-blue-600" />
      default:
        return <Building className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Gym Management</h1>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gym Management</h1>
          <p className="text-muted-foreground">
            Manage all gyms in the SaaS platform
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateOwnerDialogOpen} onOpenChange={setIsCreateOwnerDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Crown className="mr-2 h-4 w-4" />
                Create Owner
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Gym Owner</DialogTitle>
                <DialogDescription>
                  Create a new gym owner account
                </DialogDescription>
              </DialogHeader>
              <Form {...ownerForm}>
                <form onSubmit={ownerForm.handleSubmit(onCreateOwner)} className="space-y-4">
                  <FormField
                    control={ownerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter owner name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ownerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ownerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ownerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">Create Owner</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Gym
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Gym</DialogTitle>
                <DialogDescription>
                  Add a new gym to the SaaS platform
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gym Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter gym name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter gym address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="googleMapAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Google Maps URL</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Google Maps URL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="plan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a plan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="FREE">Free</SelectItem>
                            <SelectItem value="BASIC">Basic</SelectItem>
                            <SelectItem value="PRO">Pro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">Create Gym</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gyms</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gyms.length}</div>
            <p className="text-xs text-muted-foreground">All gyms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Gyms</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {gyms.filter(g => g.status === 'ACTIVE').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pro Plans</CardTitle>
            <Crown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {gyms.filter(g => g.plan === 'PRO').length}
            </div>
            <p className="text-xs text-muted-foreground">Premium gyms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Basic Plans</CardTitle>
            <Star className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {gyms.filter(g => g.plan === 'BASIC').length}
            </div>
            <p className="text-xs text-muted-foreground">Standard gyms</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Gyms</CardTitle>
          <CardDescription>
            Find gyms by name, address, or plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search gyms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="FREE">Free</SelectItem>
                <SelectItem value="BASIC">Basic</SelectItem>
                <SelectItem value="PRO">Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gym List</CardTitle>
          <CardDescription>
            A list of all gyms in the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGyms.map((gym) => (
                <TableRow key={gym.id}>
                  <TableCell className="font-medium">{gym.name}</TableCell>
                  <TableCell>{gym.address}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getPlanIcon(gym.plan)}
                      <Badge variant="outline">{gym.plan}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={gym.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {gym.status}
                    </Badge>
                  </TableCell>
                  <TableCell>Jan 15, 2024</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Gym
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Gym
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredGyms.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No gyms found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
