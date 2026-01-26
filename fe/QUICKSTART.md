# FitFlow Dashboard - Quick Start Guide

Get up and running with the Gym Management SaaS dashboard in 5 minutes.

## 1. Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local
```

## 2. Configure API

Edit `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

## 3. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 4. Login

**Demo Credentials:**
- Email: `admin@fitflow.com`
- Password: `password123`

## Project Navigation

### Main Pages
- **Dashboard** (`/dashboard`) - Overview & analytics
- **Members** (`/members`) - Member CRUD operations
- **Attendance** (`/attendance`) - Attendance tracking
- **Fees** (`/fees`) - Payment management
- **Gym** (`/gym`) - Gym settings (Admin)
- **Settings** (`/settings`) - User preferences

### Key Components
- `components/layout/` - Layout components
- `components/members/` - Member-specific components
- `components/common/` - Reusable components
- `lib/store/` - State management
- `hooks/useApi.ts` - API hooks

## Common Tasks

### Add a New Member
1. Navigate to Members page
2. Click "Add Member" button
3. Fill form and submit
4. Member appears in table

### Mark Attendance
1. Go to Attendance page
2. Select date in calendar
3. Click "Mark All Present/Absent/Late" or select individual member
4. Confirm action

### Record Payment
1. Navigate to Fees page
2. Click "Record Payment"
3. Select member and enter amount
4. Apply discount if applicable
5. Submit

### Manage Staff
1. Go to Gym page (Admin only)
2. Click "Add Staff"
3. Fill staff details
4. Select role
5. Submit

## API Connection Testing

### Check API Connection
1. Open browser DevTools (F12)
2. Go to Network tab
3. Perform any action (login, create member, etc.)
4. Verify API requests show successful responses

### Common Issues
- **401 Unauthorized** - Token expired, login again
- **500 Server Error** - API server issue, check backend logs
- **CORS Error** - Enable CORS in backend

## Code Examples

### Fetching Data
```typescript
import { useApiGet } from '@/hooks/useApi';

export function MyComponent() {
  const { data, isLoading, error } = useApiGet('/members');
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{data?.length} members</div>;
}
```

### Creating Data
```typescript
import { useApiCreate } from '@/hooks/useApi';

export function CreateForm() {
  const { mutate, isLoading } = useApiCreate('/members', {
    onSuccess: () => console.log('Created!')
  });

  const handleSubmit = async (data) => {
    await mutate('/members', data);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Using Stores
```typescript
import { useMembersStore } from '@/lib/store/members-store';

export function MembersList() {
  const store = useMembersStore();
  
  // Fetch members
  useEffect(() => {
    store.fetchMembers();
  }, []);

  // Search
  const handleSearch = (query) => {
    store.searchMembers(query);
  };

  return (
    <div>
      <input onChange={(e) => handleSearch(e.target.value)} />
      {store.filteredMembers.map(m => <div key={m.id}>{m.name}</div>)}
    </div>
  );
}
```

## Building & Deployment

### Production Build
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
vercel
```

## Database Schema (Reference)

The API should support these tables:

### members
```sql
- id (UUID)
- name (string)
- email (string)
- phone (string)
- status (ACTIVE/INACTIVE)
- joinDate (date)
- membershipType (string)
- emergencyContact (string)
- notes (text)
```

### attendance
```sql
- id (UUID)
- memberId (UUID)
- date (date)
- status (PRESENT/ABSENT/LATE)
- checkInTime (time)
- checkOutTime (time)
```

### fees
```sql
- id (UUID)
- memberId (UUID)
- originalAmount (decimal)
- discountType (PERCENTAGE/FLAT)
- discountValue (decimal)
- amountPaid (decimal)
- feeType (MONTHLY/QUARTERLY/YEARLY/ONE_TIME)
- paymentStatus (PAID/PENDING/OVERDUE)
- dueDate (date)
- paidDate (date)
```

## Debugging

### Enable Console Logging
Add debug logs to understand flow:
```typescript
console.log('[v0] Data:', data);
console.log('[v0] Error:', error);
```

### Check State
Use React DevTools to inspect:
1. Component state
2. Props
3. Hooks state

### API Logs
Check Network tab in DevTools to see:
1. Request headers
2. Request body
3. Response status
4. Response body

## Next Steps

1. **Customize Branding** - Update colors in `app/globals.css`
2. **Add Features** - Follow modular pattern to add new pages
3. **Connect Backend** - Replace mock data with real API
4. **Deploy** - Follow deployment instructions in README
5. **Monitor** - Set up error tracking (Sentry)

## Support Resources

- **Documentation**: See README.md
- **Code Comments**: Check inline comments in components
- **TypeScript**: Hover over variables for type info
- **API Docs**: Document your backend API endpoints

## Tips

- Use TypeScript strict mode for safety
- Keep components small and focused
- Use custom hooks for logic reuse
- Follow existing patterns for consistency
- Test API endpoints before implementation
- Use loading states for better UX

Happy coding! 🚀
