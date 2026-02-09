"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  DollarSign,
  Search,
  User,
  Calendar,
  Receipt,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useApiMutation, useApiGet } from "@/hooks/useApi";
import { formatCurrency } from "@/lib/utils/format";

const paymentSchema = z.object({
  memberId: z.string().min(1, "Please select a member"),
  originalAmount: z.number().min(1, "Amount must be greater than 0"),
  amountPaid: z.number().min(1, "Amount paid must be greater than 0"),
  discountType: z.enum(["PERCENTAGE", "FLAT", ""]).optional(),
  discountApplied: z.string().optional(),
  type: z.string().min(1, "Please select a fee type"),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface Member {
  id: string;
  name: string;
  phone: string;
  email?: string;
  joinDate: string;
  isActive: boolean;
}

interface FeeRecord {
  id: string;
  memberId: string;
  originalAmount: number;
  amountPaid: number;
  discountType?: "PERCENTAGE" | "FLAT";
  discountApplied?: string;
  type: string;
  paidAt: string;
}

export default function RecordPaymentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showMemberList, setShowMemberList] = useState(false);
  const [calculatedAmount, setCalculatedAmount] = useState<number | null>(null);
  const [recentPayments, setRecentPayments] = useState<FeeRecord[]>([]);

  const { data: membersData, isLoading: isLoadingMembers } =
    useApiGet("/members");
  const { data: recentFeesData } = useApiGet("/fees?limit=5");
  const { mutate: createPayment, isLoading: isCreatingPayment } =
    useApiMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    trigger,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      discountType: "",
      discountApplied: "",
      type: "MONTHLY",
    },
  });

  const watchOriginalAmount = watch("originalAmount");
  const watchDiscountType = watch("discountType");
  const watchDiscountApplied = watch("discountApplied");

  // Filter members based on search
  const filteredMembers = membersData?.filter(
    (member: Member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.includes(searchQuery) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Calculate discount
  useEffect(() => {
    if (
      watchOriginalAmount &&
      watchDiscountType &&
      watchDiscountApplied &&
      parseFloat(watchDiscountApplied) > 0
    ) {
      const discountValue = parseFloat(watchDiscountApplied);
      let finalAmount = watchOriginalAmount;

      if (watchDiscountType === "PERCENTAGE") {
        const discount = (watchOriginalAmount * discountValue) / 100;
        finalAmount = watchOriginalAmount - discount;
      } else if (watchDiscountType === "FLAT") {
        finalAmount = watchOriginalAmount - discountValue;
      }

      setCalculatedAmount(Math.max(finalAmount, 0));
      setValue("amountPaid", finalAmount);
    } else {
      setCalculatedAmount(null);
      setValue("amountPaid", watchOriginalAmount || 0);
    }
  }, [watchOriginalAmount, watchDiscountType, watchDiscountApplied, setValue]);

  // Load recent payments for selected member
  useEffect(() => {
    if (selectedMember?.id && recentFeesData) {
      const memberPayments = recentFeesData
        .filter((fee: FeeRecord) => fee.memberId === selectedMember.id)
        .slice(0, 3);
      setRecentPayments(memberPayments);
    } else {
      setRecentPayments([]);
    }
  }, [selectedMember, recentFeesData]);

  const handleMemberSelect = (member: Member) => {
    setSelectedMember(member);
    setValue("memberId", member.id);
    setShowMemberList(false);
    setSearchQuery("");
  };

  const calculateDiscount = (
    original: number,
    discountType?: string,
    discountValue?: string,
  ) => {
    if (!discountType || !discountValue || parseFloat(discountValue) <= 0)
      return 0;

    const value = parseFloat(discountValue);
    return discountType === "PERCENTAGE" ? (original * value) / 100 : value;
  };

  const onSubmit = async (data: PaymentFormData) => {
    try {
      setSubmitError("");
      setIsSubmitting(true);

      // Validate amount paid is not greater than original
      if (data.amountPaid > data.originalAmount) {
        throw new Error("Amount paid cannot be greater than original amount");
      }

      const paymentData = {
        ...data,
        discountType: data.discountType || undefined,
        discountApplied: data.discountApplied || undefined,
      };

      const response = await createPayment("/fees", paymentData);

      if (response) {
        // Reset form
        reset();
        setSelectedMember(null);
        setCalculatedAmount(null);

        // Show success message and redirect after a brief delay
        setTimeout(() => {
          router.push("/fees");
        }, 1500);
      }
    } catch (error: any) {
      setSubmitError(
        error.message || "Failed to record payment. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
        {/* Header Section */}
        <div className="border-b border-border/30 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <div className="w-1 h-8 bg-border/50 rounded-full" />
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                    <DollarSign className="w-8 h-8 text-primary" />
                    Record Payment
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Record a payment for a gym member
                  </p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-lg border border-primary/10">
                <Receipt className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Secure payment recording
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-2">
              <Card className="border-border/40 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-4 border-b border-border/30">
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Payment Details
                  </h2>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                  {submitError && (
                    <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                      <div>
                        <p className="font-medium text-destructive">Error</p>
                        <p className="text-destructive/80 text-sm mt-1">
                          {submitError}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-8">
                    {/* Member Search Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border/30">
                        Member Information
                      </h3>

                      <div className="space-y-4">
                        <div className="relative">
                          <Label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Search Member *
                          </Label>
                          <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                              placeholder="Search by name, phone, or email..."
                              value={searchQuery}
                              onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowMemberList(true);
                              }}
                              onFocus={() => setShowMemberList(true)}
                              className="pl-10 h-11 border-border/50 focus:border-primary/50 bg-background"
                            />
                            <input type="hidden" {...register("memberId")} />
                          </div>

                          {errors.memberId && (
                            <p className="text-sm text-destructive mt-2 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.memberId.message}
                            </p>
                          )}

                          {/* Member List Dropdown */}
                          {showMemberList && searchQuery && (
                            <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
                              {isLoadingMembers ? (
                                <div className="p-4 text-center">
                                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                </div>
                              ) : filteredMembers &&
                                filteredMembers.length > 0 ? (
                                filteredMembers.map((member: Member) => (
                                  <div
                                    key={member.id}
                                    className="p-3 hover:bg-accent cursor-pointer border-b border-border last:border-b-0"
                                    onClick={() => handleMemberSelect(member)}
                                  >
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <p className="font-medium text-foreground">
                                          {member.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          {member.phone}
                                        </p>
                                      </div>
                                      <Badge
                                        variant={
                                          member.isActive
                                            ? "default"
                                            : "secondary"
                                        }
                                        className="ml-2"
                                      >
                                        {member.isActive
                                          ? "Active"
                                          : "Inactive"}
                                      </Badge>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="p-4 text-center text-muted-foreground">
                                  No members found
                                </div>
                              )}
                            </div>
                          )}

                          {/* Selected Member Display */}
                          {selectedMember && (
                            <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-foreground">
                                    {selectedMember.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedMember.phone} •{" "}
                                    {selectedMember.email}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Joined:{" "}
                                    {new Date(
                                      selectedMember.joinDate,
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedMember(null);
                                    setValue("memberId", "");
                                  }}
                                  className="text-destructive hover:text-destructive/80"
                                >
                                  Clear
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Payment Details Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border/30">
                        Payment Details
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Original Amount */}
                        <div className="space-y-3">
                          <Label
                            htmlFor="originalAmount"
                            className="text-sm font-medium text-foreground"
                          >
                            Original Amount (PKR) *
                          </Label>
                          <Input
                            id="originalAmount"
                            type="number"
                            placeholder="0.00"
                            {...register("originalAmount", {
                              valueAsNumber: true,
                            })}
                            className="h-11 border-border/50 focus:border-primary/50 bg-background"
                            disabled={isSubmitting}
                          />
                          {errors.originalAmount && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.originalAmount.message}
                            </p>
                          )}
                        </div>

                        {/* Fee Type */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-foreground">
                            Fee Type *
                          </Label>
                          {/* <Select
                            onValueChange={(value) => setValue("type", value)}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger className="h-11 border-border/50 focus:border-primary/50 bg-background">
                              <SelectValue placeholder="Select fee type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MONTHLY">Monthly</SelectItem>
                              <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                              <SelectItem value="YEARLY">Yearly</SelectItem>
                              <SelectItem value="ONE_TIME">One Time</SelectItem>
                              <SelectItem value="REGISTRATION">Registration</SelectItem>
                              <SelectItem value="PERSONAL_TRAINING">Personal Training</SelectItem>
                            </SelectContent>
                          </Select> */}
                          {errors.type && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.type.message}
                            </p>
                          )}
                        </div>

                        {/* Discount Type */}
                        {/* <div className="space-y-3">
                          <Label className="text-sm font-medium text-foreground">
                            Discount Type
                          </Label>
                          <Select
                            onValueChange={(value: "PERCENTAGE" | "FLAT" | "") => 
                              setValue("discountType", value)
                            }
                            disabled={isSubmitting}
                          >
                            <SelectTrigger className="h-11 border-border/50 focus:border-primary/50 bg-background">
                              <SelectValue placeholder="No discount" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">No Discount</SelectItem>
                              <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                              <SelectItem value="FLAT">Flat Amount</SelectItem>
                            </SelectContent>
                          </Select>
                        </div> */}

                        {/* Discount Value */}
                        <div className="space-y-3">
                          <Label
                            htmlFor="discountApplied"
                            className="text-sm font-medium text-foreground"
                          >
                            Discount Value
                          </Label>
                          <Input
                            id="discountApplied"
                            type="number"
                            placeholder="0.00"
                            {...register("discountApplied")}
                            className="h-11 border-border/50 focus:border-primary/50 bg-background"
                            disabled={isSubmitting || !watchDiscountType}
                          />
                        </div>

                        {/* Calculated Amount */}
                        {calculatedAmount !== null && (
                          <div className="md:col-span-2 p-4 bg-success/10 border border-success/20 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-success">
                                  Final Amount After Discount
                                </p>
                                <p className="text-2xl font-bold text-foreground mt-1">
                                  {formatCurrency(calculatedAmount)}
                                </p>
                                {watchDiscountType && watchDiscountApplied && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Discount:{" "}
                                    {watchDiscountType === "PERCENTAGE"
                                      ? `${watchDiscountApplied}%`
                                      : formatCurrency(
                                          parseFloat(watchDiscountApplied),
                                        )}
                                  </p>
                                )}
                              </div>
                              <CheckCircle className="w-8 h-8 text-success" />
                            </div>
                          </div>
                        )}

                        {/* Amount Paid */}
                        <div className="md:col-span-2 space-y-3">
                          <Label
                            htmlFor="amountPaid"
                            className="text-sm font-medium text-foreground"
                          >
                            Amount Paid (PKR) *
                          </Label>
                          <Input
                            id="amountPaid"
                            type="number"
                            placeholder="0.00"
                            {...register("amountPaid", { valueAsNumber: true })}
                            className="h-11 border-border/50 focus:border-primary/50 bg-background"
                            disabled={isSubmitting || calculatedAmount !== null}
                          />
                          {errors.amountPaid && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.amountPaid.message}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {calculatedAmount !== null
                              ? "Auto-calculated based on discount"
                              : "Enter the amount actually paid by the member"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="mt-10 pt-8 border-t border-border/30 flex flex-col sm:flex-row gap-3 justify-between">
                    <div className="text-sm text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <span className="text-destructive">*</span>
                        <span>Required fields</span>
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                        className="px-8 h-11 border-border/50 hover:bg-accent"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting || !selectedMember}
                        className="px-8 h-11 bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-shadow disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Recording Payment...
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-4 h-4 mr-2" />
                            Record Payment
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </Card>
            </div>

            {/* Right Column - Guidance & Recent Payments */}
            <div className="space-y-6">
              {/* Selected Member Info */}
              {selectedMember && (
                <Card className="border-border/30 p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Member Summary
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Member Since
                      </p>
                      <p className="font-medium text-foreground">
                        {new Date(selectedMember.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge
                        variant={
                          selectedMember.isActive ? "default" : "secondary"
                        }
                        className="mt-1"
                      >
                        {selectedMember.isActive ? "Active Member" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </Card>
              )}

              {/* Recent Payments */}
              {recentPayments.length > 0 && (
                <Card className="border-border/30 p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Recent Payments
                  </h3>
                  <div className="space-y-4">
                    {recentPayments.map((payment) => (
                      <div
                        key={payment.id}
                        className="p-3 bg-accent/5 rounded-lg border border-border/30"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm text-foreground">
                              {payment.type}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(payment.paidAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-foreground">
                              {formatCurrency(payment.amountPaid)}
                            </p>
                            {payment.discountApplied && (
                              <p className="text-xs text-muted-foreground">
                                Discount:{" "}
                                {payment.discountType === "PERCENTAGE"
                                  ? `${payment.discountApplied}%`
                                  : formatCurrency(
                                      parseFloat(payment.discountApplied),
                                    )}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Guidelines Card */}
              <Card className="border-border/30 p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  Important Notes
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Search and select the member before proceeding
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Discounts are automatically calculated
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      All payments are recorded immediately
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      You can edit payments later from the fees page
                    </span>
                  </li>
                </ul>
              </Card>

              {/* Quick Actions */}
              <Card className="border-border/30 p-6 bg-gradient-to-br from-primary/5 to-primary/10">
                <h3 className="font-semibold text-foreground mb-2">
                  Quick Actions
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Common fee management tasks
                </p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-primary/30 hover:bg-primary/10"
                    onClick={() => router.push("/fees")}
                  >
                    View All Payments
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-primary/30 hover:bg-primary/10"
                    onClick={() => router.push("/members")}
                  >
                    Manage Members
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
