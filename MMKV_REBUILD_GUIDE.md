# MMKV Native Module Rebuild Guide

## The Issue

MMKV is a native React Native module that needs to be compiled for Android/iOS. The error means:
```
The native MMKV Module could not be found
```

This happens when:
- Native modules aren't autolinked
- Gradle cache is stale
- App wasn't rebuilt with native dependencies

## Solution: Rebuild Everything

### Step 1: Stop the Running App
Press `Ctrl+C` in your terminal to stop Metro bundler.

### Step 2: Verify Autolink
```bash
cd /home/zesung/Desktop/projects/mamalink/mobile
npx react-native config
```

**You should see output containing:**
```
"react-native-mmkv": {
  "android": {...},
  "ios": {...}
}
```

If MMKV is not listed, run:
```bash
npx link react-native-mmkv
```

### Step 3: Clean Android Build
```bash
cd /home/zesung/Desktop/projects/mamalink/mobile/android
./gradlew clean
cd ..
```

### Step 4: Rebuild for Android
```bash
npm run android
```

This will:
- Rebuild all native modules
- Recompile Android app
- Launch on emulator/device
- Might take 3-5 minutes

### Alternative: Full Reset
If the above doesn't work:

```bash
# 1. Remove node modules and build cache
rm -rf node_modules android/.gradle android/app/build
npm cache clean --force

# 2. Reinstall everything
npm install

# 3. Rebuild
npm run android
```

---

## For iOS (if testing on iOS)

```bash
cd /home/zesung/Desktop/projects/mamalink/mobile/ios
rm -rf Pods Podfile.lock
cd ..
npx pod-install
npm run ios
```

---

## Verify MMKV is Working

After rebuild, check console for:
```
✅ No "Failed to create a new MMKV instance" error
✅ App starts without crashing
✅ Households tab loads
✅ Can create a household
```

If still failing, add debug logging:

```typescript
// In src/state/setup.ts
export function initializeStorage() {
  if (mmkvStorage) return;

  try {
    console.log("🔄 Initializing MMKV...");
    mmkvStorage = new MMKV({ id: "app-local-db" });
    console.log("✅ MMKV initialized successfully");
    
    // ... rest of setup
  } catch (error) {
    console.error("❌ Failed to initialize MMKV:", error);
    throw error;  // Let it crash so you see the error
  }
}
```

---

## Common Issues & Solutions

### ❌ "gradlew not found"
**Solution:** You might be in wrong directory. Run:
```bash
cd /home/zesung/Desktop/projects/mamalink/mobile
# Then run the gradle commands again
```

### ❌ "Could not determine which Gradle version to use"
**Solution:** Clear gradle cache:
```bash
rm -rf ~/.gradle
# Then rebuild
npm run android
```

### ❌ "MMKV still not working after rebuild"
**Solution:** Check that it's actually autolinked:
```bash
# Look at android/settings.gradle
# Should include: include ':react-native-mmkv'
cat android/settings.gradle | grep mmkv
```

If not there, manually add it to `android/settings.gradle`

### ❌ "Build failed - out of memory"
**Solution:** Increase Java heap:
```bash
export _JAVA_OPTIONS="-Xmx4g"
npm run android
```

---

## What Gets Built

When you run `npm run android`, this happens:

```
1. Metro bundler bundles JS code
2. Gradle runs for Android
3. Gradle finds react-native-mmkv in node_modules
4. Autolink runs → adds MMKV to build.gradle
5. C++ code compiled → produces .so (shared object) files
6. Android app linked with native MMKV library
7. APK created with MMKV built-in
8. APK installed on device/emulator
9. App launches with working MMKV
```

---

## After Rebuild

**Test the households feature:**

1. Open Households tab
2. Create a household
3. Kill the app
4. Restart
5. Verify household still shows (MMKV working!)

---

## Reference

- MMKV Docs: https://github.com/Tencent/MMKV/wiki/android_setup
- React Native MMKV: https://github.com/mrousavy/react-native-mmkv

---

## Still Stuck?

If after full rebuild it still fails:

1. Check console for exact error message
2. Paste the full error here
3. We can try:
   - Using AsyncStorage instead of MMKV (fallback)
   - Manual native linking
   - Different MMKV version

For now, proceed with rebuild and let's see what happens! 🚀
