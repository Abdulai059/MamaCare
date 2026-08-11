# MamaLink Auth Flow - Complete Setup

## Architecture Overview

Your auth system uses a **separation of concerns** pattern:

```
AuthProvider (Session only)
    ↓
useAuthStatus (Combines session + profile)
    ↓
Navigation + UI Components
```

### Files Involved

| File | Purpose | What it does |
|------|---------|-------------|
| `AuthProvider.tsx` | Session management | Handles Supabase auth session, exposes `signIn`/`signOut` |
| `auth.ts` | Profile fetching | `getProfile(userId)` queries Supabase profiles table |
| `useProfile.ts` | Profile caching | TanStack Query hook wrapping `getProfile()` |
| `useAuthStatus.ts` | Combined status | Merges session + profile into one auth object |
| `_layout.tsx` | Navigation | Routes based on `useAuthStatus()` |
| `login.tsx` | Login UI | Calls `signIn()` from `useAuth()` |

---

## Login Flow (Step by Step)

### 1. User enters email/password and taps Login

**File:** `src/app/(auth)/login.tsx`
```typescript
const { signIn } = useAuth();  // Gets from AuthProvider
await signIn(email, password);
```

### 2. SignIn calls Supabase Auth

**File:** `src/hooks/providers/AuthProvider.tsx`
```typescript
const signIn = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  // Session updates automatically via onAuthStateChange listener
};
```

### 3. Supabase creates auth.users record

- User is now authenticated in Supabase
- Session is stored in device storage (AsyncStorage)

### 4. AuthProvider detects session change

**File:** `src/hooks/providers/AuthProvider.tsx` (useEffect with onAuthStateChange)
```typescript
const { data: listener } = supabase.auth.onAuthStateChange(
  async (_event: string, newSession: Session | null) => {
    setSession(newSession);  // ← Session updated here
  },
);
```

### 5. useAuthStatus loads the profile

**File:** `src/hooks/useAuthStatus.ts`
```typescript
const userId = session?.user.id ?? null;
const { data: profile, isLoading: isProfileLoading } = useProfile(userId);
// ↓ useProfile hook fires when userId exists
```

### 6. useProfile fetches from Supabase

**File:** `src/hooks/query/useProfile.ts`
```typescript
export function useProfile(userId: string | null) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => getProfile(userId!),  // ← Calls auth.ts
    enabled: !!userId,
  });
}
```

### 7. getProfile queries profiles table

**File:** `src/services/auth.ts`
```typescript
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();  // ← Important: doesn't throw if not found

  if (error) throw error;
  return data;  // ← Profile data or null
}
```

### 8. useAuthStatus computes isAuthenticated

**File:** `src/hooks/useAuthStatus.ts`
```typescript
const isAuthenticated = !!(
  session &&
  profile &&
  profile.role === "CHPS_WORKER"
);
// ↓ True only if ALL three are truthy
```

### 9. Navigation responds and routes to home

**File:** `src/app/_layout.tsx` (RootNavigator useEffect)
```typescript
const { isAuthenticated, isLoading, hasSeenOnboarding } = useAuthStatus();

useEffect(() => {
  if (isLoading) return;  // Wait for both session + profile

  if (isAuthenticated) {
    if (authSegment !== "(tabs)") {
      router.replace("/(tabs)");  // ← Route to home
    }
  }
}, [isAuthenticated, isLoading, ...]);
```

---

## Logout Flow

### 1. User taps Logout

**File:** Any screen can call
```typescript
const { signOut } = useAuth();
await signOut();
```

### 2. SignOut clears Supabase session

**File:** `src/hooks/providers/AuthProvider.tsx`
```typescript
const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
```

### 3. AuthProvider detects session cleared

```typescript
const { data: listener } = supabase.auth.onAuthStateChange(
  async (_event: string, newSession: Session | null) => {
    setSession(null);  // ← Session is now null
  },
);
```

### 4. useAuthStatus reacts

```typescript
const isAuthenticated = !!(
  session &&  // ← Now false (null session)
  profile &&
  profile.role === "CHPS_WORKER"
);
// Result: isAuthenticated = false
```

### 5. Navigation routes to login

```typescript
if (!isAuthenticated) {
  if (!hasSeenOnboarding) {
    router.replace("/(auth)/onboarding");
  } else {
    router.replace("/(auth)/login");  // ← Route back to login
  }
}
```

---

## Common Issues & Fixes

### ❌ Problem: Login works but user not authenticated

**Cause:** Profile not created when user signed up
**Solution:**
```sql
-- Manually create profile for existing user
INSERT INTO profiles (id, email, role)
SELECT id, email, 'CHPS_WORKER'
FROM auth.users
WHERE id = '<user-id>'
AND id NOT IN (SELECT id FROM profiles);
```

### ❌ Problem: Stuck on splash screen

**Cause:** Profile query never completes or errors silently
**Debug:**
```typescript
// Add to useAuthStatus to see profile status
console.log("Profile loading:", isProfileLoading);
console.log("Profile error:", profileError);
console.log("Profile data:", profile);
```

### ❌ Problem: Login button disabled but not working

**Cause:** `signIn` threw an error
**Solution:** Check console for error details:
```typescript
try {
  await signIn(email, password);
} catch (error: any) {
  console.error("Sign in failed:", error?.message);
}
```

### ❌ Problem: useAuthStatus hook not found

**Cause:** File missing
**Solution:**
```bash
ls src/hooks/useAuthStatus.ts  # Should exist
```

---

## Key Points

✅ **AuthProvider** - Light, just sessions
✅ **useProfile** - Cached via TanStack Query
✅ **useAuthStatus** - The single source of truth for auth state
✅ **Login screen** - Only needs `signIn` from AuthProvider
✅ **Navigation** - Only checks `useAuthStatus()` result

## Testing Login/Logout

```bash
# 1. Start app
npm run dev

# 2. Try login with:
# Email: test@example.com
# Password: TestPassword123

# 3. Should route to home if profile exists

# 4. Try logout from settings

# 5. Should route back to login
```

If you see errors, check:
1. Are you in Supabase Studio? Create test user with role metadata
2. Does the profile exist for that user?
3. What does the console show?
