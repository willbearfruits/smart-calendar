# Mobile Quick Start Guide - Capacitor Setup

Get Paper2Plan running on mobile devices in 5 minutes!

## Prerequisites Check

**Required for all platforms:**
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)

**For Android:**
- [ ] Android Studio installed
- [ ] ANDROID_HOME environment variable set

**For iOS (macOS only):**
- [ ] Xcode installed
- [ ] CocoaPods installed (`pod --version`)

## 1. Install Dependencies

```bash
cd /home/glitches/Documents/neworganization/web-apps/calendar/note-to-calendar-converter
npm install
```

## 2. Build the Web App

```bash
npm run build
```

This creates the `dist/` folder with your compiled web assets.

## 3. Test on Android

### Quick Method
```bash
npm run android
```

This will:
1. Build the web app
2. Sync to Android
3. Open Android Studio

### In Android Studio
1. Wait for Gradle sync (first time takes a few minutes)
2. Click the green "Run" button (▶️)
3. Select an emulator or connected device

### Manual Method
```bash
# Build and sync
npm run build
npm run cap:sync:android

# Open Android Studio
npm run cap:open:android
```

## 4. Test on iOS (macOS only)

### First Time Setup
```bash
cd ios/App
pod install
cd ../..
```

### Quick Method
```bash
npm run ios
```

This will:
1. Build the web app
2. Sync to iOS
3. Open Xcode

### In Xcode
1. Select a simulator from the device menu (e.g., iPhone 15)
2. Click the "Run" button (▶️)
3. Wait for app to build and launch

### Manual Method
```bash
# Build and sync
npm run build
npm run cap:sync:ios

# Open Xcode
npm run cap:open:ios
```

## 5. Making Changes

After modifying your web code (React/TypeScript):

```bash
# Rebuild and sync to platforms
npm run build:mobile

# Then in Android Studio or Xcode, press Run again
```

## Common First-Time Issues

### Android: "SDK location not found"
**Fix:**
```bash
export ANDROID_HOME=$HOME/Android/Sdk
# Add to ~/.bashrc or ~/.zshrc to make permanent
```

### Android: Gradle sync failed
**Fix:**
```bash
cd android
./gradlew clean
cd ..
npm run cap:sync:android
```

### iOS: "CocoaPods not installed"
**Fix:**
```bash
sudo gem install cocoapods
cd ios/App
pod install
cd ../..
```

### iOS: Signing error
**Fix in Xcode:**
1. Select your project in the navigator
2. Select "App" target
3. Go to "Signing & Capabilities" tab
4. Check "Automatically manage signing"
5. Select your team from dropdown

### App shows white screen
**Fix:**
1. Check console in Android Studio / Xcode
2. Ensure `dist/` folder exists and has files
3. Verify environment variables (GEMINI_API_KEY)

## Testing Checklist

Once the app launches, test these features:

### Core Features
- [ ] App launches successfully
- [ ] Dark/light theme toggle works
- [ ] Tasks can be added and checked off
- [ ] Calendar views switch (Month/Week/Day)
- [ ] Events can be added manually

### Mobile-Specific Features
- [ ] Camera button opens native camera
- [ ] Camera permissions are requested
- [ ] Can take photo or select from gallery
- [ ] AI analyzes handwritten notes
- [ ] Export calendar (saves to Documents on mobile)
- [ ] Drag and drop tasks to calendar
- [ ] Safe areas respected (iOS notch/island)
- [ ] Orientation changes work smoothly

## Next Steps

### Development Workflow
1. Make changes to React code
2. Run `npm run build`
3. Run `npm run cap:sync` (or platform-specific sync)
4. Press Run in IDE

### Add Custom Icons
1. Create 1024x1024 icon as `resources/icon.png`
2. Create 2732x2732 splash as `resources/splash.png`
3. Run: `npx capacitor-assets generate`

### Production Build

**Android APK:**
```bash
npm run cap:open:android
# In Android Studio: Build > Generate Signed Bundle / APK
```

**iOS Archive:**
```bash
npm run cap:open:ios
# In Xcode: Product > Archive
```

## Useful Commands Reference

```bash
# Development
npm run dev              # Run web dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Capacitor
npm run cap:sync         # Sync to all platforms
npm run build:mobile     # Build and sync
npm run android          # Open Android Studio
npm run ios              # Open Xcode

# Platform-specific
npm run cap:sync:android # Sync to Android only
npm run cap:sync:ios     # Sync to iOS only
npm run cap:run:android  # Run on Android device
npm run cap:run:ios      # Run on iOS device
```

## Get Help

- **Capacitor Issues:** [Capacitor Docs](https://capacitorjs.com/docs)
- **Android Issues:** [Android Developer Guide](https://developer.android.com/studio)
- **iOS Issues:** [Xcode Help](https://developer.apple.com/xcode/)
- **React Issues:** [React Documentation](https://react.dev)

## Environment Setup

Create `.env` file in project root:
```env
GEMINI_API_KEY=your_api_key_here
```

This is required for AI features (note scanning, magic schedule, assistant).

## Performance Tips

- Use a physical device for best performance
- Android emulator: Enable hardware acceleration
- iOS simulator: Choose newer device models
- First build is slow, subsequent builds are faster

## Directory Structure

```
.
├── android/              # Android native code
├── ios/                  # iOS native code
├── dist/                 # Built web assets (git ignored)
├── src/                  # React source code
├── utils/                # Platform utilities
│   ├── platform.ts       # Platform detection
│   └── capacitorHelpers.ts # Native feature helpers
├── resources/            # Icons and splash screens
├── capacitor.config.ts   # Capacitor configuration
└── mobile.css           # Mobile-specific styles
```

## Success!

If you see Paper2Plan running on your device with the camera working and tasks/calendar functional, you're all set! 🎉

Read `MOBILE_FEATURES.md` to learn about all the platform-specific features and `CAPACITOR_SETUP.md` for detailed setup instructions.
