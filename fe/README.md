# FitFlow - Gym Management SaaS Dashboard

A modern, scalable React TypeScript dashboard for comprehensive gym management with member tracking, attendance monitoring, and financial management.

## Overview

FitFlow is a production-ready SaaS platform designed for gym owners and staff to efficiently manage:
- Member profiles and status tracking
- Attendance monitoring with real-time analytics
- Fee collection and financial reporting
- Staff management and gym operations
- Role-based access control (OWNER, STAFF, SUPER_USER)

## Tech Stack

- **Frontend Framework**: Next.js 16 with React 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **HTTP Client**: Axios with interceptors
- **State Management**: Zustand + React Context API
- **Form Handling**: React Hook Form + Zod validation
- **Charts**: Recharts for data visualization
- **Notifications**: Sonner toast system
- **Icons**: Lucide React

## Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout with theme/toaster
│   ├── page.tsx                # Home redirect
│   ├── login/
│   │   └── page.tsx            # Login page
│   ├── dashboard/
│   │   └── page.tsx            # Dashboard with analytics
│   ├── members/
│   │   └── page.tsx            # Members CRUD operations
│   ├── attendance/
│   │   └── page.tsx            # Attendance tracking
│   ├── fees/
│   │   └── page.tsx            # Fee management
│   ├── gym/
│   │   └── page.tsx            # Gym settings (OWNER only)
│   └── settings/
│       └── page.tsx            # User settings
├── components/
│   ├── ui/                     # shadcn components
│   ├── layout/
│   │   ├── sidebar.tsx         # Navigation sidebar
│   │   ├── top-nav.tsx         # Top navigation
│   │   └── dashboard-layout.tsx # Layout wrapper
│   ├── common/
│   │   └── data-table.tsx      # Reusable data table
│   ├── members/
│   │   └── member-form.tsx     # Member form modal
│   └── auth-guard.tsx          # Route protection
├── lib/
│   ├── api-client.ts           # Axios config + generic methods
│   ├── utils.ts                # Tailwind utilities
│   ├── utils/
│   │   └── format.ts           # Format utilities
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   └── store/
│       ├── auth-store.ts       # Zustand auth store
│       └── members-store.ts    # Zustand members store
├── hooks/
│   ├── use-mobile.ts           # Mobile detection
│   ├── use-toast.ts            # Toast hook
│   └── useApi.ts               # Custom API hooks
├── app/globals.css             # Global styles + theme
└── env.example                 # Environment variables template
```

## Features

### Authentication
- JWT-based login system
- Token persistence in localStorage
- Automatic redirect for unauthorized access
- Role-based access control

### Dashboard
- Real-time analytics with charts
- Member statistics (total, active, inactive)
- Revenue tracking with trends
- Attendance rate visualization
- Recent activity feed

### Members Management
- CRUD operations with modal forms
- Search by name, email, or phone
- Filter by status (active/inactive)
- Pagination support
- Responsive data table

### Attendance Tracking
- Calendar-based date selection
- Individual and bulk attendance marking
- Status tracking (PRESENT, LATE, ABSENT)
- Check-in/check-out times
- Attendance rate calculations

### Fees Management
- Payment recording with discount calculations
- Status tracking (PAID, PENDING, OVERDUE)
- Outstanding balance calculations
- Filter and search capabilities
- Revenue reporting

### Gym Management (Admin)
- Gym details editing
- Staff member management
- Add/remove staff
- Plan information display
- Gym status toggle

### Settings
- User profile management
- Password change
- Notification preferences
- Display preferences
- Account security

## Setup & Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation Steps

1. **Clone and install dependencies**
```bash
npm install
# or
yarn install
```

2. **Configure environment variables**
```bash
cp env.example .env.local
```

Edit `.env.local` with your API configuration:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

3. **Start development server**
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production
```bash
npm run build
npm start
```

## API Integration

The dashboard supports all existing and future API endpoints through a scalable architecture:

### Endpoints Structure

```typescript
// Authentication
POST   /auth/login              # User login
POST   /auth/logout             # User logout
GET    /auth/profile            # Get current user

// Members
GET    /members                 # List members (paginated)
POST   /members                 # Create member
PATCH  /members/:id             # Update member
DELETE /members/:id             # Delete member

// Attendance
POST   /attendance              # Mark attendance
GET    /attendance/member/:memberId  # Member history
GET    /attendance?date=YYYY-MM-DD   # Date-based view
PATCH  /attendance/:id          # Update attendance

// Fees
GET    /fees                    # Fees summary
GET    /fees/:memberId          # Member fee history
POST   /fees                    # Record payment
PATCH  /fees/:id                # Update fee
DELETE /fees/:id                # Delete fee

// Gym
POST   /gyms                    # Create gym (SUPER_USER)
POST   /gyms/add-staff          # Add staff (OWNER)
GET    /gyms                    # Get gym details
```

## State Management

### Zustand Stores

#### Auth Store (`lib/store/auth-store.ts`)
```typescript
- user: Current user info
- token: JWT token
- login(email, password): Authenticate
- logout(): Clear auth
- setUser(user): Update user
- loadAuthFromStorage(): Hydrate from localStorage
```

#### Members Store (`lib/store/members-store.ts`)
```typescript
- members: Member list
- filteredMembers: Search results
- pagination: Pagination state
- fetchMembers(filters): Fetch with filters
- createMember(data): Add member
- updateMember(id, data): Edit member
- deleteMember(id): Remove member
- searchMembers(query): Search functionality
```

## Custom Hooks

### useApiGet
Fetch data on component mount
```typescript
const { data, isLoading, error } = useApiGet('/members');
```

### useApiCreate / useApiUpdate / useApiDelete
Mutation hooks with loading states
```typescript
const { mutate, isLoading } = useApiCreate('/members');
const success = await mutate('/members', { name: '...' });
```

## Form Validation

All forms use React Hook Form + Zod for validation:
```typescript
const memberSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
});
```

## Components

### DataTable
Reusable pagination table with sorting:
```typescript
<DataTable
  columns={columns}
  data={data}
  pagination={pagination}
  onPageChange={handlePageChange}
/>
```

### MemberForm
Modal form for creating/editing members:
```typescript
<MemberForm
  open={open}
  member={editingMember}
  onSubmit={handleSubmit}
/>
```

### DashboardLayout
Wrapper with sidebar, top nav, auth guard:
```typescript
<DashboardLayout allowedRoles={['OWNER']}>
  {children}
</DashboardLayout>
```

## Theme System

The dashboard uses CSS custom properties for theming:
- Primary: Blue (#3b82f6) - Main actions
- Accent: Green (#10b981) - Success states
- Secondary: Purple (#8b5cf6) - Additional accent
- Background: Dark (#0f172a) - Main background
- Surface: Slate (#1e293b) - Card backgrounds
- Borders: Gray (#475569) - Dividers

Customize in `app/globals.css`:
```css
:root {
  --color-primary: #3b82f6;
  --color-accent: #10b981;
  /* ... */
}
```

## Security Best Practices

- JWT tokens stored in localStorage
- Automatic logout on 401 errors
- Role-based route protection via AuthGuard
- CSRF protection via API interceptors
- TypeScript strict mode for type safety
- Input validation with Zod schemas

## Performance Optimizations

- Lazy component loading with dynamic imports
- Memoization of expensive computations
- Pagination for large datasets
- Responsive images and assets
- Debounced search functionality
- Skeleton loading states

## Testing

To add tests, install testing libraries:
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms
```bash
npm run build
# Deploy the .next folder
```

## Future Enhancements

- Email notifications
- SMS alerts
- Advanced reporting & exports
- Multi-gym support
- Member portal
- Mobile app
- Dark/Light theme toggle
- Backup & recovery
- Advanced analytics

## Scalability Features

- **Generic CRUD hooks** - Easy to add new entities
- **Modular store pattern** - Add stores for new features
- **Standardized API responses** - Consistent error handling
- **Reusable components** - DataTable, Forms, Layouts
- **Type-safe endpoints** - Centralized endpoint config
- **Middleware pattern** - Request/response interceptors

## Troubleshooting

### API Connection Errors
1. Verify `NEXT_PUBLIC_API_BASE_URL` is correct
2. Check API server is running
3. Ensure CORS is enabled on backend

### Authentication Issues
1. Clear browser localStorage
2. Check token expiration
3. Verify JWT format

### Build Errors
1. Run `npm install` to ensure dependencies
2. Clear `.next` folder and rebuild
3. Check TypeScript errors: `npm run type-check`

## Support

For issues or questions:
1. Check documentation in this README
2. Review component prop types (TypeScript)
3. Check console logs for error messages
4. Verify API endpoint responses

## License

Proprietary - FitFlow SaaS Platform
