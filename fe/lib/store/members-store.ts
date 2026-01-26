import { create } from 'zustand';
import { Member, CreateMemberInput, UpdateMemberInput, FilterOptions } from '@/lib/types';
import { apiGet, apiPost, apiPatch, apiDelete, endpoints } from '@/lib/api-client';

interface MembersState {
  members: Member[];
  filteredMembers: Member[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: FilterOptions;

  // Actions
  fetchMembers: (filters?: FilterOptions) => Promise<void>;
  createMember: (data: CreateMemberInput) => Promise<boolean>;
  updateMember: (id: string, data: UpdateMemberInput) => Promise<boolean>;
  deleteMember: (id: string) => Promise<boolean>;
  setFilters: (filters: FilterOptions) => void;
  searchMembers: (query: string) => void;
  clearError: () => void;
}

export const useMembersStore = create<MembersState>((set, get) => ({
  members: [],
  filteredMembers: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {
    page: 1,
    limit: 20,
    search: '',
    status: undefined,
  },

  fetchMembers: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const params = {
        page: filters?.page || 1,
        limit: filters?.limit || 20,
        search: filters?.search || '',
        status: filters?.status || '',
      };

      const response = await apiGet<any>(
        `${endpoints.members.list}?page=${params.page}&limit=${params.limit}&search=${params.search}${params.status ? `&status=${params.status}` : ''}`
      );

      if (response.success && response.data) {
        const data = response.data;
        set({
          members: data.items || data,
          filteredMembers: data.items || data,
          pagination: {
            page: data.page || params.page,
            limit: data.limit || params.limit,
            total: data.total || (Array.isArray(data) ? data.length : 0),
            totalPages: data.totalPages || 1,
          },
          filters: params,
          isLoading: false,
        });
      } else {
        throw new Error(response.error || 'Failed to fetch members');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch members';
      set({ error: errorMsg, isLoading: false });
    }
  },

  createMember: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiPost<Member>(endpoints.members.create, data);
      if (response.success && response.data) {
        const newMember = response.data;
        set((state) => ({
          members: [newMember, ...state.members],
          filteredMembers: [newMember, ...state.filteredMembers],
          isLoading: false,
        }));
        return true;
      } else {
        throw new Error(response.error || 'Failed to create member');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create member';
      set({ error: errorMsg, isLoading: false });
      return false;
    }
  },

  updateMember: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiPatch<Member>(endpoints.members.update(id), data);
      if (response.success && response.data) {
        const updated = response.data;
        set((state) => ({
          members: state.members.map((m) => (m.id === id ? updated : m)),
          filteredMembers: state.filteredMembers.map((m) => (m.id === id ? updated : m)),
          isLoading: false,
        }));
        return true;
      } else {
        throw new Error(response.error || 'Failed to update member');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update member';
      set({ error: errorMsg, isLoading: false });
      return false;
    }
  },

  deleteMember: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiDelete(endpoints.members.delete(id));
      if (response.success) {
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
          filteredMembers: state.filteredMembers.filter((m) => m.id !== id),
          isLoading: false,
        }));
        return true;
      } else {
        throw new Error(response.error || 'Failed to delete member');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete member';
      set({ error: errorMsg, isLoading: false });
      return false;
    }
  },

  setFilters: (filters) => {
    set({ filters });
  },

  searchMembers: (query) => {
    const { members } = get();
    const filtered = members.filter((member) =>
      member.name.toLowerCase().includes(query.toLowerCase()) ||
      member.email.toLowerCase().includes(query.toLowerCase()) ||
      member.phone.includes(query)
    );
    set({ filteredMembers: filtered });
  },

  clearError: () => {
    set({ error: null });
  },
}));
