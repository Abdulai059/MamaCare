# Auth Debug Checklist

## Before Testing Login

### 1. Backend Setup
- [ ] `supabase start` is running
- [ ] `.env.local` has correct SUPABASE_URL and SUPABASE_ANON_KEY
- [ ] Check Supabase Studio: http://127.0.0.1:54323

### 2. Test User Exists
In Supabase Studio → Auth → Users:
- [ ] Email exists (e.g., `test@example.com`)
- [ ] Confirm password is set
- [ ] Raw user metadata includes: `{"role": "CHPS_WORKER"}`

### 3. Profile Exists
In Supabase Studio → profiles table:
- [ ] User has a row with id = auth user id
- [ ] `role` column = 'CHPS_WORKER'
- [ ] `full_name` is set (can be null)

If profile missing, run in Supabase SQL editor:
```sql
INSERT INTO profiles (id, email, role)
SELECT id, email, 'CHPS_WORKER'
FROM auth.users
WHERE id = '<user-id>'
AND id NOT IN (SELECT id FROM profiles);
```

---

## Testing Login

### Step 1: Check Console Errors

Open Metro console (your `npm run dev` terminal):

```
✓ No red errors about missing modules
✓ No "useAuth is not defined" errors
✓ No "Cannot read property 'signIn' of undefined"
```

### Step 2: Tap Login Button

Enter:
- Email: `test@example.com`
- Password: `<the password you set>`

**Expected console output:**
```
(blank - no errors)
```

**Expected behavior:**
- Loading spinner shows briefly
- Routes to home tab (or onboarding if first time)

### Step 3: If Error Alert Appears

Check the alert message:
- "Invalid login credentials" → Email/password wrong
- "Invalid email" → Format issue
- "User not confirmed" → Verify email not enabled (disable in Supabase)
- Other → Copy exact error and search

---

## Testing Logout

### Step 1: From Home Screen

Find Settings or Logout button and tap it.

**Expected behavior:**
- Routes back to login screen
- Session cleared
- Can log back in

---

## If Login Doesn't Work

### Check #1: Is Supabase Running?

```bash
# Terminal 1
supabase status

# Should show:
# Supabase API running at http://127.0.0.1:54321
# Supabase Studio running at http://127.0.0.1:54323
```

If not:
```bash
supabase stop
supabase start
```

---

### Check #2: Console Logs

Add temporary debug logs to understand where it breaks:

**In login.tsx**, before `signIn()`:
```typescript
console.log("🔐 Attempting login with:", email);

try {
  await signIn(email, password);
  console.log("✅ Sign in succeeded, waiting for navigation...");
} catch (error: any) {
  console.log("❌ Sign in error:", error?.message || error);
  Alert.alert("Login Failed", error?.message ?? "Unknown error");
}
```

**In useAuthStatus.ts**, to debug auth state:
```typescript
useEffect(() => {
  console.log("🔍 Auth Status:", {
    sessionExists: !!session,
    profileLoading: isProfileLoading,
    profileData: profile,
    isAuthenticated,
    isLoading,
  });
}, [session, profile, isProfileLoading, isAuthenticated, isLoading]);
```

---

### Check #3: Profile Query Failure

In **useAuthStatus.ts**, log any profile errors:
```typescript
useEffect(() => {
  if (profileError) {
    console.log("❌ Profile fetch error:", profileError);
  }
}, [profileError]);
```

If profile fetch fails:
1. Check user has valid id
2. Check profiles table has row for that id
3. Check role is 'CHPS_WORKER' exactly (case-sensitive)

---

### Check #4: Navigation Not Responding

In **_layout.tsx RootNavigator useEffect**, add logs:
```typescript
useEffect(() => {
  console.log("🛣️  Navigation check:", {
    isLoading,
    isAuthenticated,
    hasSeenOnboarding,
    currentAuthSegment: segments[0],
    shouldGoToHome: isAuthenticated && segments[0] !== "(tabs)",
  });

  if (isLoading) return;
  // ... rest of routing logic
}, [isAuthenticated, hasSeenOnboarding, isLoading, segments, router]);
```

---

## Nuclear Option: Reset Everything

If nothing works:

```bash
# 1. Stop app
# Ctrl+C in terminal

# 2. Reset Supabase (DELETES ALL DATA)
supabase db reset

# 3. Create new test user in Supabase Studio
# - Email: test@example.com
# - Password: Password123!
# - Raw metadata: {"role": "CHPS_WORKER"}

# 4. Restart app
npm run dev

# 5. Try login again
```

---

## Last Resort: Check Network

```bash
# Does the device/emulator have internet?
# Android Emulator: adb shell "ping 127.0.0.1"
# iOS Simulator: Should auto-work

# Is Supabase reachable?
curl http://127.0.0.1:54321
# Should return HTML (not "Connection refused")
```

---

## When You Find The Issue

Please share:
1. **Exact error message** (from alert or console)
2. **What you tried** (steps taken)
3. **Console logs** (what the debug logs show)
4. **Network request** (did Supabase respond?)

This helps pinpoint the exact cause faster.
