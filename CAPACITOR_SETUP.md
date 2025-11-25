# Capacitor Cross-Platform Setup Guide

This guide explains how to build and run Paper2Plan on iOS, Android, and Desktop platforms using Capacitor.

## Overview

Paper2Plan is now a cross-platform app that works on:
- **Web** - Modern browsers
- **iOS** - iPhone and iPad
- **Android** - Android phones and tablets
- **Desktop** - Electron (optional)

## Prerequisites

### For Web Development
- Node.js 18+ and npm
- Modern web browser

### For Android Development
- [Android Studio](https://developer.android.com/studio) (Arctic Fox or newer)
- Android SDK (API level 22+, recommended 33+)
- Java JDK 11 or newer
- `ANDROID_HOME` environment variable set

### For iOS Development (macOS only)
- Xcode 14+ (from Mac App Store)
- Xcode Command Line Tools: `xcode-select --install`
- CocoaPods: `sudo gem install cocoapods`
- iOS device or simulator

## Initial Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Build the web app**
   ```bash
   npm run build
   ```

3. **Sync Capacitor platforms** (after first build)
   ```bash
   npm run cap:sync
   ```

## Development Workflow

### Web Development
```bash
npm run dev
```
Open http://localhost:3000 in your browser.

### Android Development

1. **Build and sync to Android**
   ```bash
   npm run android
   ```
   This will build the web app, sync to Android, and open Android Studio.

2. **In Android Studio:**
   - Wait for Gradle sync to complete
   - Select a device/emulator from the toolbar
   - Click the Run button (green play icon)

3. **Development iteration:**
   ```bash
   # After making web changes:
   npm run cap:sync:android
   # Then press Run in Android Studio again
   ```

### iOS Development (macOS only)

1. **Install CocoaPods dependencies**
   ```bash
   cd ios/App
   pod install
   cd ../..
   ```

2. **Build and sync to iOS**
   ```bash
   npm run ios
   ```
   This will build the web app, sync to iOS, and open Xcode.

3. **In Xcode:**
   - Select a target device/simulator
   - Configure signing (select your development team)
   - Click the Run button (play icon)

4. **Development iteration:**
   ```bash
   # After making web changes:
   npm run cap:sync:ios
   # Then press Run in Xcode again
   ```

## Available NPM Scripts

### Building
- `npm run build` - Build web app for production
- `npm run build:mobile` - Build and sync to all platforms

### Capacitor Sync
- `npm run cap:sync` - Sync to all platforms
- `npm run cap:sync:android` - Sync to Android only
- `npm run cap:sync:ios` - Sync to iOS only

### Opening IDEs
- `npm run cap:open:android` - Open Android Studio
- `npm run cap:open:ios` - Open Xcode

### Running on Devices
- `npm run cap:run:android` - Build and run on Android
- `npm run cap:run:ios` - Build and run on iOS

### Quick Commands
- `npm run android` - Build, sync, and open Android Studio
- `npm run ios` - Build, sync, and open Xcode

## Native Features

### Camera API
The app uses Capacitor's Camera plugin for native camera access:
- On **mobile**: Uses native camera with permission requests
- On **web**: Falls back to HTML5 file input

### Filesystem API
Calendar exports use the Filesystem plugin:
- On **mobile**: Saves to Documents directory
- On **web**: Triggers browser download

### Platform Detection
The app automatically detects the platform and adjusts behavior:
```typescript
import { Platform } from './utils/platform';

if (Platform.isNative()) {
  // Use native APIs
} else {
  // Use web APIs
}
```

## Permissions

### Android Permissions (AndroidManifest.xml)
- `CAMERA` - Take photos to scan notes
- `READ_MEDIA_IMAGES` - Select photos from gallery
- `WRITE_EXTERNAL_STORAGE` - Save calendar files (Android ≤ 12)
- `READ_EXTERNAL_STORAGE` - Read images (Android ≤ 12)

### iOS Permissions (Info.plist)
Configured in `capacitor.config.ts`:
- `NSCameraUsageDescription` - Camera access for scanning notes
- `NSPhotoLibraryUsageDescription` - Photo library access

## Troubleshooting

### Android Issues

**Gradle sync failed**
```bash
cd android
./gradlew clean
cd ..
npm run cap:sync:android
```

**App not updating after changes**
1. Make sure you ran `npm run build` first
2. Run `npm run cap:sync:android`
3. In Android Studio: Build > Clean Project > Rebuild Project

**Permission denied errors**
- Check AndroidManifest.xml has all required permissions
- On Android 6+, permissions are requested at runtime

### iOS Issues

**Pod install failed**
```bash
cd ios/App
pod repo update
pod install --repo-update
cd ../..
```

**Signing errors in Xcode**
1. Open Xcode: Signing & Capabilities tab
2. Select your development team
3. Enable "Automatically manage signing"

**App not updating after changes**
1. Make sure you ran `npm run build` first
2. Run `npm run cap:sync:ios`
3. In Xcode: Product > Clean Build Folder

### General Issues

**White screen on app launch**
- Check browser console (web) or Xcode/Android Studio logs
- Ensure all environment variables are set (GEMINI_API_KEY)
- Verify dist folder was created: `ls dist/`

**Camera not working**
- On mobile: Check app has camera permissions in system settings
- On web: Use HTTPS or localhost (camera requires secure context)

## Building for Production

### Android APK/AAB

1. **Open Android Studio**
   ```bash
   npm run cap:open:android
   ```

2. **Build signed APK:**
   - Build > Generate Signed Bundle / APK
   - Select APK or Android App Bundle
   - Create or select keystore
   - Follow signing wizard

3. **Release build from command line:**
   ```bash
   cd android
   ./gradlew assembleRelease
   cd ..
   ```
   APK location: `android/app/build/outputs/apk/release/`

### iOS IPA (requires Apple Developer account)

1. **Open Xcode**
   ```bash
   npm run cap:open:ios
   ```

2. **Archive for distribution:**
   - Product > Archive
   - Window > Organizer
   - Select archive > Distribute App
   - Follow App Store Connect or Ad Hoc distribution flow

## App Configuration

Edit `capacitor.config.ts` to configure:
- App ID: `com.glitches.paper2plan`
- App name: `Paper2Plan`
- Splash screen settings
- Plugin permissions
- Platform-specific settings

## File Structure

```
.
├── android/              # Android native project
│   └── app/
│       └── src/main/
│           └── AndroidManifest.xml
├── ios/                  # iOS native project
│   └── App/
│       ├── App.xcodeproj
│       └── App.xcworkspace
├── dist/                 # Built web assets (synced to native)
├── utils/
│   ├── platform.ts       # Platform detection utilities
│   └── capacitorHelpers.ts # Capacitor API wrappers
├── capacitor.config.ts   # Capacitor configuration
└── mobile.css           # Mobile-specific styles
```

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [iOS Development Guide](https://capacitorjs.com/docs/ios)
- [Android Development Guide](https://capacitorjs.com/docs/android)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)

## Environment Variables

Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_api_key_here
```

This is required for the AI features to work on all platforms.

## Notes

- The app requires an active internet connection for AI features
- First build takes longer due to dependency downloads
- iOS simulator does not have camera hardware (use photos library)
- Android emulator camera may need configuration in AVD settings
