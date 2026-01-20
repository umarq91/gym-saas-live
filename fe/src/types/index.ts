export type UserRole = 'OWNER' | 'STAFF' | 'SUPER__USER'

export type GymPlan = 'FREE' | 'BASIC' | 'PRO'

export type DiscountType = 'PERCENTAGE' | 'FLAT'

export interface User {
  id: string
  email: string
  username: string
  name: string
  role: UserRole
  gymId: string
}

export interface Gym {
  id: string
  name: string
  address: string
  googleMapAddress: string
  status: 'ACTIVE' | 'INACTIVE'
  plan: GymPlan
}

export interface Member {
  id: string
  name: string
  phone: string
  email: string
  joinDate: string
  isActive: boolean
  gymId: string
}

export interface Fee {
  id: string
  originalAmount: number
  amountPaid: number
  discountType: DiscountType
  discountApplied: number
  memberId: string
  gymId: string
  takenById: string
  type: string
  createdAt: string
  updatedAt: string
}

export interface Attendance {
  id: string
  date: string
  memberId: string
  gymId: string
  markedById: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  token: string
  gym?: Gym
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface CreateMemberData {
  name: string
  phone: string
  email: string
  joinDate: string
}

export interface CreateFeeData {
  memberId: string
  originalAmount: number
  amountPaid: number
  discountType: DiscountType
  discountApplied: number
  type: string
}

export interface CreateAttendanceData {
  memberId: string
  date: string
  status: string
}

export interface CreateStaffData {
  email: string
  username: string
  name: string
  password: string
}

export interface CreateGymData {
  name: string
  address: string
  googleMapAddress: string
  plan: GymPlan
}
