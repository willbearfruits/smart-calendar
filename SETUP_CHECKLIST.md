# Capacitor Setup Verification Checklist

Use this checklist to verify your Capacitor setup is complete and working.

## ✓ Packages Installed

Run these commands to verify installations:

```bash
# Check Capacitor packages
npm list @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios @capacitor/camera @capacitor/filesystem @capacitor/app

# Should show version 7.x.x for all packages
```

**Expected:** All packages listed with version numbers

## ✓ Configuration Files Created

Verify these files exist:

```bash
ls capacitor.config.ts       # Capacitor configuration
ls utils/platform.ts         # Platform detection utility
ls utils/capacitorHelpers.ts # Capacitor API helpers
ls mobile.css                # Mobile-specific styles
```

**Expected:** All files exist

## ✓ Native Projects Created

Check native project directories:

```bash
ls -d android ios           # Should show both directories
ls android/app/src/main/AndroidManifest.xml
ls ios/App/App.xcodeproj
```

**Expected:** Both directories exist with native project files

## ✓ Android Configuration

Verify Android permissions in `android/app/src/main/AndroidManifest.xml`:

```bash
grep -E "CAMERA|READ_MEDIA_IMAGES|WRITE_EXTERNAL_STORAGE" android/app/src/main/AndroidManifest.xml
```

**Expected output:**
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" ...
```

## ✓ iOS Configuration

Verify iOS project structure:

```bash
ls ios/App/Podfile
ls ios/App/App/Info.plist
```

**Expected:** Files exist

## ✓ NPM Scripts Added

Check package.json has new scripts:

```bash
npm run | grep cap:
```

**Expected output includes:**
```
cap:init
cap:sync
cap:sync:android
cap:sync:ios
cap:open:android
cap:open:ios
build:mobile
android
ios
```

## ✓ Code Integration

Verify App.tsx imports Capacitor utilities:

```bash
grep -n "capacitorHelpers\|platform" App.tsx
```

**Expected:** Import statements for platform and capacitorHelpers

## ✓ Mobile Meta Tags

Check index.html has mobile optimizations:

```bash
grep -E "viewport-fit|apple-mobile-web-app|theme-color" index.html
```

**Expected:** Mobile meta tags present

## ✓ Build Test

Test the build process:

```bash
npm run build
```

**Expected:** 
- Build completes without errors
- `dist/` directory created
- Files in dist/assets/

## ✓ Sync Test

Test Capacitor sync:

```bash
npm run cap:sync
```

**Expected:**
```
✔ copy android
✔ update android
✔ copy ios
✔ update ios
Sync finished
```

## ✓ Android Test (Optional)

If Android Studio is installed:

```bash
npm run android
```

**Expected:**
- Android Studio opens
- Project loads without errors
- Gradle sync completes

## ✓ iOS Test (Optional, macOS only)

If Xcode is installed:

```bash
npm run ios
```

**Expected:**
- Xcode opens
- Project loads without errors
- No signing errors (or can be resolved in Xcode)

## ✓ Documentation

Verify all documentation exists:

```bash
ls CAPACITOR_SETUP.md MOBILE_FEATURES.md MOBILE_QUICKSTART.md CAPACITOR_SUMMARY.md GETTING_STARTED.md
```

**Expected:** All documentation files exist

## ✓ .gitignore Updated

Check .gitignore excludes build artifacts:

```bash
grep -E "android/.*build|ios/App/Pods" .gitignore
```

**Expected:** Native build directories in .gitignore

## Complete Setup Summary

If all checks pass, your Capacitor setup is complete! ✓

### What You Can Now Do:

- ✓ Build for web, iOS, and Android from single codebase
- ✓ Use native camera on mobile devices
- ✓ Save files to device storage
- ✓ Detect platform and adapt behavior
- ✓ Handle iOS safe areas (notch/Dynamic Island)
- ✓ Deploy to App Store and Play Store

### Next Steps:

1. **Test on Android:**
   ```bash
   npm run android
   ```

2. **Test on iOS (macOS):**
   ```bash
   npm run ios
   ```

3. **Add custom icons:**
   - See `resources/README.md`

4. **Build for production:**
   - Android: Open Android Studio → Build → Generate Signed Bundle
   - iOS: Open Xcode → Product → Archive

## Quick Reference Commands

```bash
# Development
npm run dev              # Web dev server
npm run build            # Build web assets
npm run build:mobile     # Build and sync to native

# Android
npm run android          # Open Android Studio
npm run cap:sync:android # Sync to Android only

# iOS
npm run ios              # Open Xcode
npm run cap:sync:ios     # Sync to iOS only

# Both platforms
npm run cap:sync         # Sync to all platforms
```

## Troubleshooting

If any checks fail:

1. **Missing packages:** Run `npm install`
2. **Build errors:** Check console output, verify dependencies
3. **Android issues:** See `MOBILE_QUICKSTART.md` troubleshooting
4. **iOS issues:** Ensure CocoaPods installed: `gem install cocoapods`

## Support Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [MOBILE_QUICKSTART.md](./MOBILE_QUICKSTART.md) - Quick start guide
- [CAPACITOR_SETUP.md](./CAPACITOR_SETUP.md) - Detailed setup
- [MOBILE_FEATURES.md](./MOBILE_FEATURES.md) - Feature documentation

---

**Status:** [  ] All checks passed  
**Date:** _______________  
**Notes:** _______________
