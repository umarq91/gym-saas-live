# Gym SaaS Management System - Frontend

A complete frontend dashboard for a multi-tenant gym management platform built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

### 🔐 Authentication
- JWT-based authentication system
- Role-based access control (RBAC)
- Login/logout functionality
- Protected routes with role validation

### 👥 User Roles
- **SUPER_USER**: SaaS Admin - Can create gyms and gym owners
- **OWNER**: Gym Owner - Can manage staff, members, fees, and attendance
- **STAFF**: Gym Staff - Can manage members, fees, and attendance

### 🏢 Core Features

#### Dashboard
- Role-based dashboard views
- Quick statistics (members, revenue, attendance, staff)
- Real-time data visualization

#### Member Management
- Create, view, and manage gym members
- Search and filter functionality
- Member status tracking (active/inactive)
- Member detail views with fees and attendance history

#### Fees Management
- Record fee payments with discount support
- Percentage and flat discount types
- Fee history and analytics
- Revenue tracking and reporting

#### Attendance Tracking (BASIC+ plans)
- Mark attendance for members
- Bulk attendance marking
- Attendance history and analytics
- Date-based attendance filtering

#### Staff Management (OWNER only)
- Add and manage gym staff members
- Role assignment and permissions
- Staff activity tracking

#### Gym Management (SUPER_USER only)
- Create new gyms
- Plan management (FREE, BASIC, PRO)
- Gym owner creation
- Multi-gym oversight

#### Settings & Profile
- User profile management
- Password change functionality
- Application preferences
- Logout functionality

### 🎨 UI/UX
- Dark aesthetic theme
- Responsive design (mobile, tablet, desktop)
- Modern UI components with shadcn/ui
- Toast notifications for user feedback
- Loading states and error handling

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Notifications**: Sonner

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Configure your API URL in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
fe/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/         # Protected dashboard pages
│   │   │   ├── members/       # Member management
│   │   │   ├── fees/          # Fees management
│   │   │   ├── attendance/    # Attendance tracking
│   │   │   ├── staff/         # Staff management (OWNER)
│   │   │   ├── gyms/          # Gym management (SUPER_USER)
│   │   │   └── settings/      # User settings
│   │   ├── login/             # Login page
│   │   ├── unauthorized/      # Access denied page
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page (redirect)
│   ├── components/            # Reusable components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── dashboard-sidebar.tsx
│   │   ├── dashboard-layout.tsx
│   │   └── protected-route.tsx
│   ├── contexts/             # React contexts
│   │   └── auth-context.tsx
│   ├── lib/                  # Utility functions
│   │   ├── api.ts           # API client
│   │   ├── theme-provider.tsx
│   │   └── utils.ts
│   └── types/               # TypeScript type definitions
│       └── index.ts
├── public/                  # Static assets
└── package.json
```

## API Integration

The frontend is designed to work with a backend API. The API client (`src/lib/api.ts`) handles:

- Authentication (login)
- Member management
- Fee recording and tracking
- Attendance management
- Staff management
- Gym management
- Error handling and token management

## Plan-Based Features

### FREE Plan
- Basic member management
- Limited fee tracking
- No attendance tracking

### BASIC Plan
- All FREE features
- Attendance tracking
- Advanced fee management
- Staff management (for owners)

### PRO Plan
- All BASIC features
- Advanced analytics
- Priority support
- Custom features

## Authentication Flow

1. User logs in with email/password
2. JWT token is stored in localStorage
3. User role and gym information are cached
4. Protected routes validate authentication and role
5. API requests include the JWT token

## Development Notes

- The app uses a dark theme by default
- All forms include proper validation with Zod schemas
- Error states are handled with toast notifications
- Loading states are implemented for better UX
- The sidebar navigation is role-based
- Responsive design works on all screen sizes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
