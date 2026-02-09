"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMembersStore } from "@/lib/store/members-store";
import { CreateMemberInput } from "@/lib/types";
import {
  ArrowLeft,
  UserPlus,
  User,
  Mail,
  Phone,
  Shield,
  AlertCircle,
  FileText,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const memberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  // membershipType: z.string().min(1, "Please select a membership type"),
  emergency_contact: z.string().optional(),
  notes: z.string().optional(),
});

type MemberFormData = z.infer<typeof memberSchema>;

export default function NewMemberPage() {
  const router = useRouter();
  const store = useMembersStore();
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    // defaultValues: {
    //   membershipType: "",
    // },
  });

  // const membershipType = watch("membershipType");

  const onSubmit = async (data: MemberFormData) => {
    try {
      setSubmitError("");
      setIsLoading(true);
      console.log("DATAAA", data);
      const success = await store.createMember(data as CreateMemberInput);
      if (success) {
        router.push("/members");
      } else {
        setSubmitError("Failed to create member. Please try again.");
      }
    } catch (error) {
      setSubmitError("An error occurred. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
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
                    <UserPlus className="w-8 h-8 text-primary" />
                    Add New Member
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Register a new member to your gym. Fill in all required
                    fields marked with *
                  </p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-lg border border-primary/10">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  All data is securely stored
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
                    <User className="w-5 h-5" />
                    Member Information
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
                    {/* Personal Information Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border/30">
                        Personal Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="space-y-3">
                          <Label
                            htmlFor="name"
                            className="text-sm font-medium text-foreground flex items-center gap-2"
                          >
                            <User className="w-4 h-4" />
                            Full Name *
                          </Label>
                          <Input
                            id="name"
                            placeholder="John Smith"
                            {...register("name")}
                            className="h-11 border-border/50 focus:border-primary/50 bg-background"
                            disabled={isLoading}
                          />
                          {errors.name && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.name.message}
                            </p>
                          )}
                        </div>

                        {/* Email */}
                        <div className="space-y-3">
                          <Label
                            htmlFor="email"
                            className="text-sm font-medium text-foreground flex items-center gap-2"
                          >
                            <Mail className="w-4 h-4" />
                            Email Address *
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="john.smith@example.com"
                            {...register("email")}
                            className="h-11 border-border/50 focus:border-primary/50 bg-background"
                            disabled={isLoading}
                          />
                          {errors.email && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.email.message}
                            </p>
                          )}
                        </div>

                        {/* Phone */}
                        <div className="space-y-3">
                          <Label
                            htmlFor="phone"
                            className="text-sm font-medium text-foreground flex items-center gap-2"
                          >
                            <Phone className="w-4 h-4" />
                            Phone Number *
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="(123) 456-7890"
                            {...register("phone")}
                            className="h-11 border-border/50 focus:border-primary/50 bg-background"
                            disabled={isLoading}
                          />
                          {errors.phone && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.phone.message}
                            </p>
                          )}
                        </div>

                        {/* Membership Type */}
                        {/* <div className="space-y-3">
                          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Membership Type *
                          </Label>
                          <Select
                            value={membershipType}
                            onValueChange={(value) =>
                              setValue("membershipType", value)
                            }
                            disabled={isLoading}
                          >
                            <SelectTrigger className="h-11 border-border/50 focus:border-primary/50 bg-background">
                              <SelectValue placeholder="Select membership type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basic">Basic</SelectItem>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                              <SelectItem value="family">
                                Family Plan
                              </SelectItem>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="corporate">
                                Corporate
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.membershipType && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.membershipType.message}
                            </p>
                          )}
                        </div> */}
                      </div>
                    </div>

                    {/* Additional Information Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border/30">
                        Additional Information
                      </h3>
                      <div className="grid grid-cols-1 gap-6">
                        {/* Emergency Contact */}
                        <div className="space-y-3">
                          <Label
                            htmlFor="emergency_contact"
                            className="text-sm font-medium text-foreground"
                          >
                            Emergency Contact
                          </Label>
                          <Input
                            id="emergency_contact"
                            placeholder="Jane Smith (Relationship) - (123) 456-7890"
                            {...register("emergency_contact")}
                            className="h-11 border-border/50 focus:border-primary/50 bg-background"
                            disabled={isLoading}
                          />
                          <p className="text-xs text-muted-foreground">
                            Include name, relationship, and contact number
                          </p>
                        </div>

                        {/* Notes */}
                        <div className="space-y-3">
                          <Label
                            htmlFor="notes"
                            className="text-sm font-medium text-foreground flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            Notes
                          </Label>
                          <Textarea
                            id="notes"
                            placeholder="Any special requirements, health conditions, or preferences..."
                            {...register("notes")}
                            className="min-h-32 border-border/50 focus:border-primary/50 bg-background resize-none"
                            disabled={isLoading}
                          />
                          <p className="text-xs text-muted-foreground">
                            Optional - Add any additional information about the
                            member
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
                        disabled={isLoading}
                        className="px-8 h-11 border-border/50 hover:bg-accent"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 h-11 bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-shadow"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Creating Member...
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Create Member
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </Card>
            </div>

            {/* Right Column - Guidance */}
            <div className="space-y-6">
              {/* Guidelines Card */}
              <Card className="border-border/30 p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  Important Guidelines
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Ensure all required fields marked with * are filled
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Verify email and phone number accuracy
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Emergency contact information is optional but recommended
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Membership can be upgraded or changed later
                    </span>
                  </li>
                </ul>
              </Card>

              {/* Membership Types Card */}
              <Card className="border-border/30 p-6">
                <h3 className="font-semibold text-foreground mb-4">
                  Membership Types
                </h3>
                <div className="space-y-4">
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <p className="font-medium text-sm text-foreground">Basic</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Gym access during off-peak hours
                    </p>
                  </div>
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <p className="font-medium text-sm text-foreground">
                      Standard
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Full gym access + group classes
                    </p>
                  </div>
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <p className="font-medium text-sm text-foreground">
                      Premium
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      All access + personal training sessions
                    </p>
                  </div>
                </div>
              </Card>

              {/* Support Card */}
              <Card className="border-border/30 p-6 bg-gradient-to-br from-primary/5 to-primary/10">
                <h3 className="font-semibold text-foreground mb-2">
                  Need Help?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Contact support if you encounter any issues
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-primary/30 hover:bg-primary/10"
                  onClick={() => router.push("/support")}
                >
                  Contact Support
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
