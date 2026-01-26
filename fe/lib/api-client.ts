import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API Client Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/';
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Create axios instance with defaults
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - Add auth token
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - Handle auth errors
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Clear token and redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return client;
};

export const apiClient = createApiClient();

// Generic GET request
export const apiGet = async <T = any>(
  endpoint: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.get<ApiResponse<T>>(endpoint, config);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Generic POST request
export const apiPost = async <T = any>(
  endpoint: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.post<ApiResponse<T>>(endpoint, data, config);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Generic PATCH request
export const apiPatch = async <T = any>(
  endpoint: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.patch<ApiResponse<T>>(endpoint, data, config);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Generic DELETE request
export const apiDelete = async <T = any>(
  endpoint: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.delete<ApiResponse<T>>(endpoint, config);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Error handler
const handleApiError = (error: any): ApiResponse => {
  const axiosError = error as AxiosError;
  const status = axiosError.response?.status || 500;
  const message =
    (axiosError.response?.data as any)?.message ||
    axiosError.message ||
    'An error occurred';

  console.error(`[API Error] ${status}:`, message);

  return {
    success: false,
    error: message,
    statusCode: status,
  };
};

// API endpoints configuration for scalability
export const endpoints = {
  // Auth
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    profile: '/auth/profile',
  },
  // Members
  members: {
    list: '/members',
    create: '/members',
    detail: (id: string) => `/members/${id}`,
    update: (id: string) => `/members/${id}`,
    delete: (id: string) => `/members/${id}`,
  },
  // Attendance
  attendance: {
    mark: '/attendance',
    memberHistory: (memberId: string) => `/attendance/member/${memberId}`,
    dateHistory: '/attendance',
    update: (id: string) => `/attendance/${id}`,
  },
  // Fees
  fees: {
    summary: '/fees',
    memberHistory: (memberId: string) => `/fees/${memberId}`,
    record: '/fees',
    update: (id: string) => `/fees/${id}`,
    delete: (id: string) => `/fees/${id}`,
  },
  // Gym
  gym: {
    create: '/gyms',
    addStaff: '/gyms/add-staff',
    details: '/gyms',
  },
} as const;

export default apiClient;
