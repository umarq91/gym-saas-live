# FitFlow Architecture & Scalability Guide

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (React 19)                   │
│              TypeScript + Tailwind CSS                  │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
   ┌────▼────┐          ┌────▼────┐
   │ Zustand │          │ API     │
   │ Stores  │          │ Client  │
   └────┬────┘          └────┬────┘
        │                    │
   ┌────▼────────────────────▼────┐
   │   HTTP Layer (Axios)          │
   │   + Interceptors              │
   └────┬─────────────────────────┘
        │
   ┌────▼──────────────────────┐
   │   Backend API              │
   │   (Node/Express/etc)       │
   └────┬──────────────────────┘
        │
   ┌────▼──────────────────────┐
   │   PostgreSQL Database      │
   │   + JWT Auth               │
   └───────────────────────────┘
```

## Layer Architecture

### 1. API Client Layer (`lib/api-client.ts`)

**Purpose**: Centralized HTTP communication with automatic token management

**Features**:
- Generic request methods: `apiGet`, `apiPost`, `apiPatch`, `apiDelete`
- Request interceptor: Adds JWT token to headers
- Response interceptor: Handles 401 errors
- Endpoint configuration: Centralized URL definitions
- Error handling: Standardized error responses

**Scalability**: Add new endpoints to the `endpoints` object:
```typescript
export const endpoints = {
  // Existing modules...
  newModule: {
    list: '/new-module',
    create: '/new-module',
    detail: (id: string) => `/new-module/${id}`,
  },
};
```

### 2. State Management Layer (`lib/store/`)

**Purpose**: Centralized state with Zustand for reactive updates

**Architecture**:
- Auth Store: User authentication and session
- Members Store: Member CRUD and filtering
- Pattern: Factory pattern for consistency

**Adding New Stores**:
```typescript
import { create } from 'zustand';

export const useNewStore = create<State>((set, get) => ({
  data: [],
  isLoading: false,
  
  fetch: async () => {
    set({ isLoading: true });
    const response = await apiGet('/endpoint');
    set({ data: response.data });
  },
}));
```

### 3. Custom Hooks Layer (`hooks/`)

**Purpose**: Reusable logic with built-in error handling and loading states

**Key Hooks**:
- `useApiGet`: Auto-fetch on mount
- `useApiCreate`: POST with success/error callbacks
- `useApiUpdate`: PATCH operations
- `useApiDelete`: DELETE operations
- `useApi.ts`: Base implementation

**Creating New Hooks**:
```typescript
export const useNewFeature = () => {
  const [state, setState] = useState();
  
  const operation = useCallback(async () => {
    // Logic here
  }, []);
  
  return { state, operation };
};
```

### 4. Component Layer (`components/`)

**Structure**:
```
components/
├── ui/              # shadcn components
├── layout/          # Page layouts
├── common/          # Reusable components
├── members/         # Feature-specific
├── attendance/      # Feature-specific
└── fees/            # Feature-specific
```

**Component Patterns**:
- Functional components with hooks
- Props interfaces with TypeScript
- Composition over inheritance
- Memoization where needed

### 5. Page Layer (`app/`)

**Route Structure**:
- `/login` - Public authentication page
- `/dashboard` - Protected dashboard with analytics
- `/members` - Member CRUD with pagination
- `/attendance` - Attendance tracking
- `/fees` - Payment management
- `/gym` - Admin settings
- `/settings` - User preferences
- `/unauthorized` - Access denied

**Protection**: `DashboardLayout` wrapper with `AuthGuard`

## Type System (`lib/types/`)

**Benefits**:
- Type-safe across layers
- IDE autocomplete
- Compile-time error checking
- Self-documenting code

**Core Types**:
- Domain models: `Member`, `Attendance`, `Fee`, `Gym`
- Input types: `CreateMemberInput`, `UpdateMemberInput`
- API responses: `ApiResponse<T>`, `PaginatedResponse<T>`
- Request options: `FilterOptions`

**Adding New Types**:
```typescript
export interface NewEntity {
  id: string;
  name: string;
  // ... properties
}

export interface CreateNewEntityInput {
  name: string;
  // ... inputs (no id, no timestamps)
}
```

## Data Flow Example: Creating a Member

```typescript
// 1. User fills form in MemberForm component
// 2. Form validates with Zod schema
// 3. onSubmit called with validated data

// 4. useMembersStore.createMember() called
const handleSubmit = async (data: CreateMemberInput) => {
  return await store.createMember(data);
};

// 5. Store calls apiPost via API client
export const useApiCreate = () => {
  return useCallback(async (endpoint, data) => {
    const response = await apiPost(endpoint, data); // With JWT token
    return response;
  }, []);
};

// 6. API client sends POST request with token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 7. Backend validates and creates member
// 8. Response returned to store
// 9. Store updates state
set({ members: [newMember, ...state.members] });

// 10. Component re-renders
// 11. Toast notification shown
toast.success('Member created!');
```

## Scalability Patterns

### Adding a New Feature Module

**Step 1: Define Types**
```typescript
// lib/types/index.ts
export interface NewFeature {
  id: string;
  name: string;
  // ...
}
```

**Step 2: Update API Client**
```typescript
// lib/api-client.ts
export const endpoints = {
  // ...
  newFeature: {
    list: '/new-feature',
    create: '/new-feature',
    detail: (id) => `/new-feature/${id}`,
    update: (id) => `/new-feature/${id}`,
    delete: (id) => `/new-feature/${id}`,
  },
};
```

**Step 3: Create Store**
```typescript
// lib/store/new-feature-store.ts
export const useNewFeatureStore = create<State>((set) => ({
  items: [],
  isLoading: false,
  fetchItems: async () => { /* ... */ },
  createItem: async (data) => { /* ... */ },
  // ...
}));
```

**Step 4: Create Components**
```typescript
// components/new-feature/new-feature-form.tsx
// components/new-feature/new-feature-list.tsx
```

**Step 5: Create Page**
```typescript
// app/new-feature/page.tsx
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function NewFeaturePage() {
  return (
    <DashboardLayout>
      {/* Content */}
    </DashboardLayout>
  );
}
```

### Generic CRUD Hook Factory

```typescript
export const useCRUD = <T extends { id: string }, I>(
  endpoint: string,
  options?: UseApiOptions
) => {
  const read = useApiGet<T[]>(endpoint);
  const create = useApiCreate<T, I>(options);
  const update = useApiUpdate<T, Partial<I>>(options);
  const delete_ = useApiDelete<T>(options);

  return { read, create, update, delete_ };
};

// Usage
const crud = useCRUD<Member, CreateMemberInput>('/members');
```

## Performance Optimizations

### Code Splitting
- Pages are automatically split by route
- Components are lazy loaded on demand

### Memoization
```typescript
const MemoizedDataTable = React.memo(DataTable);
const handleSort = useCallback(() => { /* ... */ }, [deps]);
```

### Pagination
- Large datasets split into pages
- Server-side pagination supported
- Default limit: 20 items

### Caching
- API responses cached by Axios
- Zustand state persists in memory
- localStorage for auth tokens

## Error Handling

**Hierarchy**:
1. API errors caught by axios
2. Errors handled in hooks
3. Toast notifications shown
4. State updated with error
5. Component displays error state

```typescript
// lib/api-client.ts
client.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      logout();
      redirect('/login');
    }
    return Promise.reject(error);
  }
);
```

## Security Considerations

### Authentication
- JWT tokens stored in localStorage
- Token sent in Authorization header
- Automatic 401 handling with logout

### Authorization
- Role-based access control (RBAC)
- Routes protected by AuthGuard
- Conditional component rendering

### Input Validation
- Zod schemas for all forms
- Server-side validation (backend)
- XSS prevention via React

### API Security
- CORS configuration (backend)
- CSRF protection (backend tokens)
- SQL injection prevention (parameterized queries)

## Monitoring & Debugging

### Development
```typescript
console.log('[v0] Event:', data);
// Shows in browser console
```

### Production
- Error tracking: Sentry integration
- Performance monitoring: Web Vitals
- Analytics: User behavior tracking

## Testing Strategy

### Unit Tests
```typescript
// components/__tests__/DataTable.test.tsx
import { render, screen } from '@testing-library/react';

describe('DataTable', () => {
  it('renders data', () => {
    render(<DataTable columns={[]} data={[]} />);
    // assertions
  });
});
```

### Integration Tests
```typescript
// Test full data flow
// API call → Store → Component render
```

## Deployment Architecture

```
GitHub Repository
    ↓
Vercel CI/CD
    ↓
Build & Test
    ↓
Deploy to CDN (Edge Network)
    ↓
Environment Variables Set
    ↓
Live Production
```

## Future Architecture Enhancements

1. **Multi-tenancy**: Support multiple gyms
2. **Real-time**: WebSocket for live updates
3. **Offline Support**: Service workers
4. **Mobile App**: React Native version
5. **API Gateway**: Rate limiting, caching
6. **Message Queue**: For background jobs
7. **Event Sourcing**: Audit trail
8. **GraphQL**: Alternative to REST

## Conclusion

This architecture provides:
- **Scalability**: Easy to add features
- **Maintainability**: Clear separation of concerns
- **Type Safety**: Full TypeScript coverage
- **Performance**: Optimized rendering
- **Security**: Role-based protection
- **Developer Experience**: Clear patterns and conventions
