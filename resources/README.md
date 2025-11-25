# App Icons and Splash Screens

This directory should contain your app icons and splash screens for iOS and Android.

## Required Assets

### App Icon
Create a high-resolution app icon (1024x1024 PNG with no transparency) and place it here as `icon.png`.

### Splash Screen
Create a splash screen image (2732x2732 PNG) and place it here as `splash.png`.

## Generating Platform-Specific Assets

Once you have the source files, you can use tools to generate all required sizes:

### Option 1: Capacitor Assets Generator (Recommended)
```bash
npm install -g @capacitor/assets
npx capacitor-assets generate --iconBackgroundColor '#0f172a' --iconBackgroundColorDark '#0f172a' --splashBackgroundColor '#0f172a' --splashBackgroundColorDark '#0f172a'
```

### Option 2: Manual Generation

**iOS Icons Required:**
- 20x20, 29x29, 40x40, 58x58, 60x60, 76x76, 80x80, 87x87, 120x120, 152x152, 167x167, 180x180, 1024x1024

Place in: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

**Android Icons Required:**
- mdpi: 48x48
- hdpi: 72x72
- xhdpi: 96x96
- xxhdpi: 144x144
- xxxhdpi: 192x192

Place in respective directories:
- `android/app/src/main/res/mipmap-mdpi/`
- `android/app/src/main/res/mipmap-hdpi/`
- `android/app/src/main/res/mipmap-xhdpi/`
- `android/app/src/main/res/mipmap-xxhdpi/`
- `android/app/src/main/res/mipmap-xxxhdpi/`

**iOS Splash Screens:**
Place in: `ios/App/App/Assets.xcassets/Splash.imageset/`

**Android Splash Screens:**
Place in: `android/app/src/main/res/drawable/`

## Design Guidelines

### App Icon
- Simple, recognizable design
- Works well at small sizes
- No transparency (Android requirement)
- Consider both light and dark backgrounds
- Suggested: Calendar icon with paper/note element

### Splash Screen
- Center your logo/icon
- Use app's primary color as background (#0f172a - dark slate)
- Keep it simple - users see this briefly
- Ensure it looks good on various screen sizes

## Current Setup

The app is currently using default Capacitor icons. Replace them with your branded assets for a professional appearance.

## Tools

- [Icon Generator](https://icon.kitchen/) - Web-based icon generator
- [App Icon Generator](https://www.appicon.co/) - Generate all sizes
- [Figma](https://figma.com) - Design your icons
- [Sketch](https://www.sketch.com/) - macOS design tool
