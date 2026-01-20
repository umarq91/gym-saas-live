import { 
  AuthResponse, 
  LoginCredentials, 
  User, 
  Gym, 
  Member, 
  Fee, 
  Attendance,
  CreateMemberData,
  CreateFeeData,
  CreateAttendanceData,
  CreateStaffData,
  CreateGymData
} from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

class ApiClient {
  private token: string | null = null

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('gym-saas-token', token)
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gym-saas-token')
    }
    return this.token
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken()
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Authentication
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    this.setToken(response.token)
    return response
  }

  // Gym Management
  async createGym(data: CreateGymData): Promise<Gym> {
    return this.request<Gym>('/gyms', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async addStaff(data: CreateStaffData): Promise<User> {
    return this.request<User>('/gyms/add-staff', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Member Management
  async createMember(data: CreateMemberData): Promise<Member> {
    return this.request<Member>('/members', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getMembers(): Promise<Member[]> {
    return this.request<Member[]>('/members')
  }

  async getMember(id: string): Promise<Member> {
    return this.request<Member>(`/members/${id}`)
  }

  // Fees Management
  async getFees(memberId?: string): Promise<Fee[]> {
    const endpoint = memberId ? `/fees/${memberId}` : '/fees'
    return this.request<Fee[]>(endpoint)
  }

  async createFee(data: CreateFeeData): Promise<Fee> {
    return this.request<Fee>('/fees', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Attendance Management
  async getAttendance(memberId?: string, date?: string): Promise<Attendance[]> {
    const params = new URLSearchParams()
    if (memberId) params.append('memberId', memberId)
    if (date) params.append('date', date)
    
    const endpoint = `/attendance${params.toString() ? `?${params.toString()}` : ''}`
    return this.request<Attendance[]>(endpoint)
  }

  async createAttendance(data: CreateAttendanceData): Promise<Attendance> {
    return this.request<Attendance>('/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateAttendance(id: string, data: Partial<CreateAttendanceData>): Promise<Attendance> {
    return this.request<Attendance>(`/attendance/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // Internal APIs (SUPER_USER only)
  async createOwner(data: CreateStaffData): Promise<User> {
    return this.request<User>('/internals/create-owner', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async createSaasOwner(data: CreateStaffData): Promise<User> {
    return this.request<User>('/internals/saas-owner', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

export const apiClient = new ApiClient()
