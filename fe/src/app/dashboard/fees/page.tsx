"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Fee, Member, CreateFeeData, DiscountType } from '@/types'
import { Plus, Search, DollarSign, Calendar, User } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

const feeSchema = z.object({
  memberId: z.string().min(1, 'Member is required'),
  originalAmount: z.number().min(0, 'Original amount must be positive'),
  amountPaid: z.number().min(0, 'Amount paid must be positive'),
  discountType: z.enum(['PERCENTAGE', 'FLAT']),
  discountApplied: z.number().min(0, 'Discount must be non-negative'),
  type: z.string().min(1, 'Fee type is required'),
})

type FeeFormData = z.infer<typeof feeSchema>

export default function FeesPage() {
  const { user } = useAuth()
  const [fees, setFees] = useState<Fee[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMember, setSelectedMember] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const form = useForm<FeeFormData>({
    resolver: zodResolver(feeSchema),
    defaultValues: {
      memberId: '',
      originalAmount: 0,
      amountPaid: 0,
      discountType: 'PERCENTAGE',
      discountApplied: 0,
      type: 'monthly',
    },
  })

  const watchedOriginalAmount = form.watch('originalAmount')
  const watchedDiscountType = form.watch('discountType')
  const watchedDiscountApplied = form.watch('discountApplied')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [feesData, membersData] = await Promise.all([
        apiClient.getFees(),
        apiClient.getMembers(),
      ])
      setFees(feesData)
      setMembers(membersData)
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const calculateDiscountedAmount = () => {
    if (watchedDiscountType === 'PERCENTAGE') {
      return watchedOriginalAmount * (1 - watchedDiscountApplied / 100)
    }
    return Math.max(0, watchedOriginalAmount - watchedDiscountApplied)
  }

  useEffect(() => {
    const discountedAmount = calculateDiscountedAmount()
    form.setValue('amountPaid', discountedAmount)
  }, [watchedOriginalAmount, watchedDiscountType, watchedDiscountApplied, form])

  const onSubmit = async (data: FeeFormData) => {
    try {
      await apiClient.createFee(data)
      toast.success('Fee recorded successfully')
      setIsCreateDialogOpen(false)
      form.reset()
      fetchData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to record fee')
    }
  }
  const filteredFees = fees && fees?.data && fees?.data.filter(fee => {
    const member = members?.data.find(m => m.id === fee.memberId)
    const matchesSearch = !searchTerm ||
      member?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMember = selectedMember === 'all' || fee.memberId === selectedMember
    return matchesSearch && matchesMember
  })
  console.log("FEES", fees)
  const totalRevenue = fees && fees?.data && fees?.data.reduce((sum, fee) => sum + fee.amountPaid, 0)
  const thisMonthRevenue = fees && fees?.data
    .filter(fee => {
      const feeDate = new Date(fee.createdAt)
      const now = new Date()
      return feeDate.getMonth() === now.getMonth() && feeDate.getFullYear() === now.getFullYear()
    })
    .reduce((sum, fee) => sum + fee.amountPaid, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Fees Management</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">Fees Management</h1>
          <p className="text-muted-foreground">
            Record and manage member fee payments
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Record Fee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Record Fee Payment</DialogTitle>
              <DialogDescription>
                Record a fee payment for a member
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="memberId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Member</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a member" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {members.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name} - {member.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="originalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Original Amount ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fee Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select fee type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="annual">Annual</SelectItem>
                            <SelectItem value="personal_training">Personal Training</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="discountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Discount type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                            <SelectItem value="FLAT">Flat Amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="discountApplied"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Discount {watchedDiscountType === 'PERCENTAGE' ? '(%)' : '($)'}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="amountPaid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Final Amount ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          readOnly
                          className="bg-muted"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Record Fee</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${thisMonthRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fees.length}</div>
            <p className="text-xs text-muted-foreground">Fee records</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.filter(m => m.isActive).length}</div>
            <p className="text-xs text-muted-foreground">Paying members</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee Records</CardTitle>
          <CardDescription>
            Search and filter fee payment records
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by member name or fee type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Original Amount</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFees.map((fee) => {
                const member = members.find(m => m.id === fee.memberId)
                return (
                  <TableRow key={fee.id}>
                    <TableCell className="font-medium">
                      {member?.name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {fee.type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>${fee.originalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      {fee.discountType === 'PERCENTAGE'
                        ? `${fee.discountApplied}%`
                        : `$${fee.discountApplied.toFixed(2)}`
                      }
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${fee.amountPaid.toFixed(2)}
                    </TableCell>
                    <TableCell>{format(new Date(fee.createdAt), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant="default">Paid</Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          {filteredFees.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No fee records found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
