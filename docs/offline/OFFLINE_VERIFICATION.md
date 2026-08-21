# Offline Setup Verification Checklist

## Phase 1 & 2 Complete ✅

Run this checklist to verify everything is set up correctly:

### Dependencies
- [ ] `npm list react-native-mmkv` → should show `^3.1.0`
- [ ] `npm list @legendapp/state` → should show `^3.0.0-beta.48`
- [ ] `npm list uuid` → should exist

### Files Created/Modified
- [ ] `src/lib/supabase.ts` - Uses MMKV for auth storage
- [ ] `src/lib/queryClient.ts` - TanStack Query configured
- [ ] `src/state/setup.ts` - Legend State + Supabase sync (NEW)
- [ ] `src/state/auth.ts` - Auth observables (NEW)
- [ ] `src/app/_layout.tsx` - Calls initializeAuth() on startup

### Environment
- [ ] `.env.local` has `EXPO_PUBLIC_SUPABASE_URL`
- [ ] `.env.local` has `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Test Auth Flow

**Before starting:** Create a test user in Supabase Studio
- Email: `test@example.com`
- Password: `TestPassword123!`
- Raw metadata: `{"role": "CHPS_WORKER"}`
- Assign to a community via `profiles.assigned_community_id` or `worker_assignments`

**Then test:**

```bash
# 1. Start the app
npm run dev

# 2. In your code, import and log auth state
import { currentProfile$, assignedCommunityIds$ } from "@/state/auth";

// Add to any component or useEffect
useEffect(() => {
  const interval = setInterval(() => {
    console.log("Profile:", currentProfile$.get());
    console.log("Communities:", assignedCommunityIds$.get());
  }, 2000);
  return () => clearInterval(interval);
}, []);

# 3. Login with test user

# 4. Check console for:
✅ Profile loaded with correct role
✅ assignedCommunityIds$ has at least 1 community ID

# 5. Kill app and restart
✅ Session restored (still logged in)

# 6. Logout
✅ Profile → null
✅ Communities → []
✅ Route to login
```

---

## Ready for Phase 3?

Once verified, we can create the first offline-first table: **households**

This will test the full offline cycle:
1. Create household offline
2. Kill app
3. Restart app → household still there
4. Enable network
5. Confirm household synced to Supabase

👉 **Proceed to Phase 3?** Reply with test results and I'll create the households offline table!
