# MamaLink Authentication Setup Guide

## Overview

MamaLink uses **Supabase Auth** with PostgreSQL. The system automatically creates user profiles when they sign up.

## How Auth Works

### 1. Database Schema

**Profiles Table** - Bridges Supabase `auth.users` to app identity:
```sql
profiles (
  id UUID → references auth.users(id)
  full_name TEXT
  email TEXT
  phone TEXT
  role ENUM → CAREGIVER | CHPS_WORKER (required)
  assigned_community_id UUID → references communities
  assigned_district_id UUID → references districts
  is_active BOOLEAN
  created_at TIMESTAMPTZ
  updated_at TIMESTAMPTZ
)
```

### 2. Auto-Create Profile on Sign-Up

A PostgreSQL trigger automatically creates a profile when a user signs up:

```sql
handle_new_user() TRIGGER
→ After insert on auth.users
→ Creates profile with:
  - id = auth.user.id
  - email = auth.user.email
  - role = (from raw_user_meta_data) OR default 'CHPS_WORKER'
```

### 3. Row Level Security (RLS)

Profiles table is protected with RLS policies:

| Action | Policy | Rule |
|--------|--------|------|
| SELECT | users read their own profile | `auth.uid() = id` |
| UPDATE | users update their own profile | `auth.uid() = id` |
| INSERT | allow insert on profile creation | `auth.uid() = id` |

## Setup Instructions

### 1. Start Supabase Local Dev

```bash
cd mobile
supabase start
```

This will:
- Create PostgreSQL database
- Run migrations (creates schema, triggers, RLS)
- Run seed.sql (loads test regions/districts/communities)
- Start local Supabase services on port 54321

### 2. Get Supabase Credentials

After `supabase start`, you'll see:
```
Started supabase local development setup.

API URL: http://127.0.0.1:54321
DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
Anon key: eyJhbG...
Service key: eyJhbG...
```

### 3. Configure Environment Variables

Create `.env.local` in the mobile app root:

```bash
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<copy from supabase start output>
```

### 4. Run the App

```bash
npm install
npm run dev  # or npx expo start
```

## Sign Up Flow

1. User enters email & password
2. Supabase Auth creates `auth.users` record
3. PostgreSQL trigger fires: `handle_new_user()`
4. Profile auto-created with role from metadata (or default CHPS_WORKER)
5. AuthContext listener detects session change
6. `fetchProfile()` loads profile data
7. User is now authenticated

## Sign In Flow

1. User enters email & password
2. `supabase.auth.signInWithPassword()` returns session
3. AuthContext listener detects session change
4. `fetchProfile()` loads profile data
5. `isAuthenticated` = true if role is CHPS_WORKER

## Key Functions

### Auth Service (`src/services/auth.ts`)

```typescript
signIn(email, password)        // Sign in user
signOut()                       // Sign out user
fetchProfile(userId)            // Get user's profile
```

### Auth Context (`src/shared/context/AuthContext.tsx`)

```typescript
useAuth() → {
  isAuthenticated: boolean      // True if signed in + valid role
  session: Session | null       // Supabase session
  profile: Profile | null       // User profile data
  signIn(email, password)       // Sign in
  signOut()                      // Sign out
  isLoading: boolean            // Loading state
}
```

## Testing

### Create a Test User

1. Go to Supabase Studio: http://127.0.0.1:54323
2. Auth → Users → Add user
3. Email: `test@example.com`
4. Password: `TestPassword123`
5. Raw user metadata:
```json
{
  "role": "CHPS_WORKER"
}
```

### Sign In Via App

```javascript
const { signIn } = useAuth();
await signIn('test@example.com', 'TestPassword123');
```

## Troubleshooting

### "Profile not found" error

**Cause**: Trigger didn't fire or user created without role metadata
**Solution**: 
```sql
-- Manually create profile
INSERT INTO profiles (id, email, role)
SELECT id, email, 'CHPS_WORKER'
FROM auth.users
WHERE email = 'test@example.com'
AND id NOT IN (SELECT id FROM profiles);
```

### "fetchProfile is not a function"

**Cause**: Old code uses `getProfile` instead of `fetchProfile`
**Solution**: Already fixed in auth.ts

### RLS Policy Violation on Insert

**Cause**: Profile trigger fails RLS check
**Solution**: Ensure `allow insert on profile creation` policy exists (already added)

### No Regions/Districts/Communities

**Cause**: seed.sql didn't run
**Solution**: 
```bash
# Reset database (WARNING: deletes all data)
supabase db reset
# Or manually run seed
supabase db execute seed.sql
```

## Production Deployment

For production (Supabase Cloud):

1. Create Supabase project at https://app.supabase.com
2. Run migrations:
   ```bash
   supabase db push --remote
   ```
3. Create auth provider (Email, Google, etc.)
4. Update environment variables to point to cloud URLs
5. Configure Auth redirect URLs in project settings

## Key Principles

- **Never store passwords** - Supabase Auth handles this
- **Always check RLS** - Verify policies before production
- **Profile is required** - Every user must have a profile
- **Role determines auth** - Only CHPS_WORKER can access app
- **Offline first** - Mobile app works offline with SQLite

## Related Files

- Database schema: `supabase/migrations/20260729085943_001_initial_schema.sql`
- Test data: `supabase/seed.sql`
- Config: `supabase/config.toml`
- Auth service: `src/services/auth.ts`
- Auth context: `src/shared/context/AuthContext.tsx`
- Supabase client: `src/lib/supabase.ts`
