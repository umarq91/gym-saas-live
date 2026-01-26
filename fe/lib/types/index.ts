// Member Types
export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  membershipType?: string;
  emergencyContact?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMemberInput {
  name: string;
  email: string;
  phone: string;
  membershipType?: string;
  emergencyContact?: string;
  notes?: string;
}

export interface UpdateMemberInput {
  name?: string;
  email?: string;
  phone?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  membershipType?: string;
  emergencyContact?: string;
  notes?: string;
}

// Attendance Types
export interface Attendance {
  id: string;
  memberId: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  notes?: string;
  createdAt: string;
}

export interface MarkAttendanceInput {
  memberId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

export interface AttendanceStats {
  totalMembers: number;
  presentToday: number;
  attendanceRate: number;
  averageAttendance: number;
}

// Fee Types
export type FeeType = 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ONE_TIME';
export type DiscountType = 'PERCENTAGE' | 'FLAT';
export type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE';

export interface Fee {
  id: string;
  memberId: string;
  memberName: string;
  originalAmount: number;
  discountType?: DiscountType;
  discountValue?: number;
  amountPaid: number;
  feeType: FeeType;
  paymentStatus: PaymentStatus;
  dueDate: string;
  paidDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeeInput {
  memberId: string;
  originalAmount: number;
  discountType?: DiscountType;
  discountValue?: number;
  feeType: FeeType;
  dueDate?: string;
  notes?: string;
}

export interface FeesStats {
  totalCollected: number;
  outstandingAmount: number;
  pendingPayments: number;
  overdueFees: number;
  averageFee: number;
  feeBreakdown: Record<FeeType, number>;
}

// Gym Types
export type GymPlan = 'FREE' | 'BASIC' | 'PRO';

export interface GymStaff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'MANAGER' | 'TRAINER' | 'RECEPTIONIST' | 'JANITOR';
  joinDate: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Gym {
  id: string;
  name: string;
  address: string;
  googleMapsLink?: string;
  status: 'ACTIVE' | 'INACTIVE';
  plan: GymPlan;
  staff: GymStaff[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateGymInput {
  name: string;
  address: string;
  googleMapsLink?: string;
}

export interface AddStaffInput {
  name: string;
  email: string;
  phone: string;
  role: 'MANAGER' | 'TRAINER' | 'RECEPTIONIST' | 'JANITOR';
}

// Dashboard Stats
export interface DashboardStats {
  totalMembers: number;
  totalMembersChange: number;
  totalRevenue: number;
  totalRevenueChange: number;
  attendanceRate: number;
  attendanceRateChange: number;
  activeMembers: number;
  inactiveMembers: number;
}

export interface RecentActivity {
  id: string;
  type: 'MEMBER_JOINED' | 'PAYMENT_RECEIVED' | 'ATTENDANCE_MARKED' | 'MEMBER_LEFT';
  description: string;
  timestamp: string;
  icon?: string;
}

// API Request/Response Helpers
export interface FilterOptions {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface ApiListResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
