# Mobile Features & Platform-Specific Behavior

This document describes how Paper2Plan adapts to different platforms and the native features available on mobile.

## Platform Detection

The app automatically detects the platform and adjusts its behavior accordingly.

### Available Platforms
- **Web** - Browser-based version
- **iOS** - Native iOS app
- **Android** - Native Android app

### Using Platform Detection in Code

```typescript
import { Platform } from './utils/platform';

// Check if running on native platform
if (Platform.isNative()) {
  // Use native APIs
}

// Check specific platforms
if (Platform.isIOS()) {
  // iOS-specific code
}

if (Platform.isAndroid()) {
  // Android-specific code
}

if (Platform.isWeb()) {
  // Web-specific code
}

// Check if mobile (iOS or Android)
if (Platform.isMobile()) {
  // Mobile-specific code
}
```

## Native Features

### 1. Camera Integration

**Web Behavior:**
- Uses HTML5 file input
- User selects image from files or takes photo (if browser supports)
- Limited camera control

**Mobile Behavior:**
- Native camera integration
- Direct camera access with full control
- Access to photo library
- Permission requests handled by OS

**Implementation:**
```typescript
import { takePicture, requestCameraPermissions } from './utils/capacitorHelpers';

// Request permissions first
const hasPermission = await requestCameraPermissions();

// Take picture with native camera
const image = await takePicture({
  source: 'prompt', // Let user choose camera or photos
  quality: 90
});
```

### 2. Filesystem Access

**Web Behavior:**
- Browser download for ICS file export
- Uses Blob and download links
- Files saved to user's Downloads folder

**Mobile Behavior:**
- Direct filesystem access
- Saves to Documents directory
- Can read/write app-specific directories
- Better integration with OS file managers

**Implementation:**
```typescript
import { saveTextFile } from './utils/capacitorHelpers';
import { Directory } from '@capacitor/filesystem';

// Save calendar export to device
await saveTextFile('schedule.ics', icsContent, Directory.Documents);
```

### 3. Safe Area Support (iOS)

**iOS Notch/Dynamic Island Handling:**
- Automatic padding for status bar
- Respects safe area insets
- Navigation bar positioned correctly
- Floating elements (chat assistant) avoid notch

**CSS Variables:**
```css
--sat: env(safe-area-inset-top);
--sab: env(safe-area-inset-bottom);
--sal: env(safe-area-inset-left);
--sar: env(safe-area-inset-right);
```

### 4. Touch Optimizations

**Mobile-Specific Improvements:**
- Larger touch targets (min 44x44 points)
- Improved drag-and-drop for tasks
- Touch feedback animations
- Momentum scrolling
- Pull-to-refresh ready (can be enabled)
- Disabled hover effects on touch devices

### 5. Orientation Support

**Portrait & Landscape:**
- Responsive layouts for all orientations
- Optimized for landscape mode on tablets
- Reduced spacing in landscape on phones
- Calendar views adapt to screen size

## Mobile UI Adaptations

### Navigation Bar
- **Web:** Standard fixed navigation
- **Mobile:** Respects safe areas, collapses labels on small screens

### Sidebar
- **Web:** Fixed width sidebar
- **Mobile:** Full-width on small screens, swipe-friendly

### Calendar Views
- **Month View:** Responsive grid, smaller cells on mobile
- **Week View:** Horizontal scroll support on mobile
- **Day View:** Optimized for portrait viewing

### Modals & Dialogs
- **Mobile:** Full-screen on small devices
- **Tablet:** Centered with appropriate sizing
- **Web:** Standard modal behavior

### Assistant Chat
- **Mobile:** Positioned above keyboard, safe area aware
- **Tablet/Web:** Fixed bottom-right corner

## Performance Optimizations

### Mobile-Specific
- Hardware-accelerated animations
- Efficient scrolling with momentum
- Reduced re-renders on drag operations
- Optimized touch event handling
- Lazy loading of calendar events

### All Platforms
- LocalStorage for persistence
- Efficient state management
- Debounced API calls
- Optimistic UI updates

## Permissions

### Android Permissions
Requested at runtime when needed:
- **Camera:** When scanning a note
- **Storage:** When exporting calendar or selecting images
- **Internet:** Always available for API calls

### iOS Permissions
Requested at runtime with system dialogs:
- **Camera:** "Paper2Plan needs access to your camera to scan handwritten notes"
- **Photo Library:** "Paper2Plan needs access to your photo library to select images"

## Offline Support (Future Enhancement)

While the app currently requires internet for AI features, the architecture supports offline capabilities:

**What Works Offline:**
- Viewing existing tasks and events
- Managing calendar (add/edit/delete events)
- Task management
- Calendar export (mobile only)

**Requires Internet:**
- Scanning handwritten notes (Gemini AI)
- Magic schedule generation
- AI assistant chat
- Time estimation

## Progressive Web App (PWA)

The web version can be installed as a PWA:
- Add to home screen on iOS
- Install from browser on Android
- Offline capable (with service worker)
- Full-screen experience

## Platform-Specific Tips

### iOS
- Swipe gestures work for navigation
- Long-press for context menus
- Use 3D Touch where available
- Respects system dark mode preference

### Android
- Back button navigates modals
- Material Design ripple effects
- System sharing integration
- Notification support (can be added)

### Web
- Keyboard shortcuts available
- Mouse hover effects
- Desktop-optimized spacing
- Browser extensions compatible

## Testing on Different Platforms

### iOS Simulator
```bash
npm run ios
# Select iPhone/iPad simulator in Xcode
```

### Android Emulator
```bash
npm run android
# Create AVD in Android Studio if needed
```

### Physical Device (iOS)
- Requires Apple Developer account
- Enable developer mode on device
- Trust computer when prompted

### Physical Device (Android)
- Enable Developer Options
- Enable USB Debugging
- Install via USB or wireless debugging

## Debugging

### iOS
- Safari Developer Tools
- View > Develop > [Your Device] > Paper2Plan
- Xcode console for native logs

### Android
- Chrome DevTools
- chrome://inspect
- Android Studio Logcat for native logs

### Web
- Standard browser DevTools
- Console, Network, Elements tabs

## Known Platform Differences

1. **Date Pickers:** Native pickers on mobile, HTML5 on web
2. **File Selection:** Native galleries on mobile, file dialog on web
3. **Haptic Feedback:** Available on mobile, not on web
4. **Status Bar:** Native control on mobile, not applicable on web
5. **Navigation:** Hardware back button (Android), gestures (iOS), browser (Web)

## Future Platform Features

### Planned Enhancements
- [ ] Share calendar events via native share sheet
- [ ] Notification reminders for events
- [ ] Widget support (iOS 14+, Android)
- [ ] Background sync for task timers
- [ ] Siri/Google Assistant shortcuts
- [ ] Apple Watch / Wear OS companion
- [ ] iCloud/Google Drive sync
- [ ] Face ID / Fingerprint authentication
- [ ] Handoff between devices (iOS/macOS)

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Android Material Design](https://material.io/design)
- [Web Responsive Design](https://web.dev/responsive-web-design-basics/)
