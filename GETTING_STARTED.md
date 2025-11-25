# Getting Started with Paper2Plan

Welcome! Paper2Plan is a cross-platform app that converts handwritten notes into digital calendar events using AI. This guide will get you up and running quickly.

## Choose Your Platform

### 🌐 Web Development
**Perfect for:** Quick testing, web-only deployment, beginners

**Start here:** [QUICKSTART.md](./QUICKSTART.md)

What you'll need:
- Node.js 18+
- Gemini API key

Time: ~3 minutes

### 📱 Mobile Development (iOS/Android)
**Perfect for:** Native mobile apps, full feature set, production deployment

**Start here:** [MOBILE_QUICKSTART.md](./MOBILE_QUICKSTART.md)

What you'll need:
- Everything from Web +
- Android Studio (for Android)
- Xcode + CocoaPods (for iOS, macOS only)

Time: ~10 minutes

## Quick Decision Guide

**Choose Web if you want to:**
- ✓ Test the app quickly
- ✓ Deploy to a website
- ✓ Develop without mobile IDEs
- ✓ Get started in 3 minutes

**Choose Mobile if you want to:**
- ✓ Build native iOS/Android apps
- ✓ Use native camera features
- ✓ Publish to App Store/Play Store
- ✓ Offline file storage
- ✓ Full mobile optimization

**Choose Both if you want to:**
- ✓ Universal deployment
- ✓ Same codebase, all platforms
- ✓ Maximum reach

## Directory Structure

```
note-to-calendar-converter/
├── QUICKSTART.md              ← Start here for web
├── MOBILE_QUICKSTART.md      ← Start here for mobile
├── CAPACITOR_SETUP.md        ← Detailed mobile setup guide
├── MOBILE_FEATURES.md        ← Platform-specific features
├── CAPACITOR_SUMMARY.md      ← What was configured
├── BACKEND_SETUP.md          ← Backend server details
├──
├── App.tsx                    ← Main React application
├── index.html                 ← HTML entry point
├── mobile.css                 ← Mobile optimizations
├── capacitor.config.ts        ← Capacitor configuration
├──
├── utils/
│   ├── platform.ts            ← Platform detection
│   └── capacitorHelpers.ts    ← Native API helpers
├──
├── android/                   ← Android native project
├── ios/                       ← iOS native project
├── server/                    ← Backend API server
└── resources/                 ← App icons & splash screens
```

## Feature Matrix

| Feature | Web | iOS | Android |
|---------|-----|-----|---------|
| Task Management | ✓ | ✓ | ✓ |
| Calendar Views | ✓ | ✓ | ✓ |
| AI Note Scanning | ✓ | ✓ | ✓ |
| Magic Scheduling | ✓ | ✓ | ✓ |
| AI Assistant | ✓ | ✓ | ✓ |
| Dark Mode | ✓ | ✓ | ✓ |
| Calendar Export | Download | Documents | Documents |
| Camera | File Upload | Native | Native |
| Touch Optimized | - | ✓ | ✓ |
| Safe Areas | - | ✓ | - |
| Offline Storage | ✓ | ✓ | ✓ |

## Common Commands

### Web Development
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
```

### Mobile Development
```bash
npm run android          # Build and open Android Studio
npm run ios              # Build and open Xcode (macOS only)
npm run build:mobile     # Build web and sync to native
npm run cap:sync         # Sync changes to native platforms
```

### Backend Server
```bash
npm run server:dev       # Start backend with hot reload
npm run server:build     # Build backend for production
npm run server:start     # Run production backend
```

## Documentation Overview

### Quick Starts
- **[QUICKSTART.md](./QUICKSTART.md)** - Web development (3 min)
- **[MOBILE_QUICKSTART.md](./MOBILE_QUICKSTART.md)** - Mobile setup (10 min)

### Detailed Guides
- **[CAPACITOR_SETUP.md](./CAPACITOR_SETUP.md)** - Complete Capacitor guide
- **[BACKEND_SETUP.md](./BACKEND_SETUP.md)** - Backend API documentation
- **[MOBILE_FEATURES.md](./MOBILE_FEATURES.md)** - Platform features explained

### Reference
- **[CAPACITOR_SUMMARY.md](./CAPACITOR_SUMMARY.md)** - What was configured
- **[resources/README.md](./resources/README.md)** - Icon & splash screen guide

## Prerequisites

### For Everyone
- [Node.js 18+](https://nodejs.org/) and npm
- [Google Gemini API Key](https://makersuite.google.com/app/apikey)
- Text editor or IDE

### For Android (Optional)
- [Android Studio](https://developer.android.com/studio)
- Android SDK (API 22+)
- Java JDK 11+

### For iOS (Optional, macOS only)
- [Xcode 14+](https://developer.apple.com/xcode/)
- Xcode Command Line Tools
- [CocoaPods](https://cocoapods.org/)

## Your First Steps

### Step 1: Choose Your Path
- Going web-only? → Open [QUICKSTART.md](./QUICKSTART.md)
- Building mobile apps? → Open [MOBILE_QUICKSTART.md](./MOBILE_QUICKSTART.md)

### Step 2: Install & Configure
Follow the instructions in your chosen quick start guide.

### Step 3: Start Developing
Make changes, test features, build your app!

## Getting Help

### Common Issues
Check the "Troubleshooting" sections in:
- [QUICKSTART.md](./QUICKSTART.md#troubleshooting) for web issues
- [MOBILE_QUICKSTART.md](./MOBILE_QUICKSTART.md#common-first-time-issues) for mobile issues

### Resources
- [Capacitor Docs](https://capacitorjs.com/docs) - For mobile development
- [React Docs](https://react.dev) - For frontend development
- [Gemini API Docs](https://ai.google.dev/docs) - For AI features

### Platform-Specific Help
- **Android:** [Android Developer Guide](https://developer.android.com)
- **iOS:** [iOS Developer Documentation](https://developer.apple.com/documentation/)
- **React:** [React Documentation](https://react.dev)

## What's Inside?

### Frontend (React + TypeScript)
- Modern React 19 with hooks
- TypeScript for type safety
- Tailwind CSS for styling
- Lucide React for icons
- Responsive design for all screen sizes

### Backend (Express + TypeScript)
- RESTful API architecture
- Rate limiting and security
- Gemini AI integration
- CORS configuration
- Environment-based configuration

### Mobile (Capacitor)
- Native iOS and Android apps
- Camera integration
- File system access
- Platform detection
- Safe area support (iOS)

### AI Features (Google Gemini)
- Handwritten note OCR
- Task extraction
- Event parsing
- Smart scheduling
- Time estimation
- Conversational assistant

## Architecture

```
┌──────────────────────────────────────────┐
│          Frontend (React/Vite)           │
│  - Web, iOS, Android (via Capacitor)    │
│  - Responsive UI, Dark Mode              │
└──────────────┬───────────────────────────┘
               │ HTTP Requests
               ▼
┌──────────────────────────────────────────┐
│        Backend API (Express/TS)          │
│  - Rate limiting, CORS, Security         │
│  - API key management                    │
└──────────────┬───────────────────────────┘
               │ API Calls
               ▼
┌──────────────────────────────────────────┐
│         Google Gemini API                │
│  - Vision (image analysis)               │
│  - Text generation (scheduling)          │
│  - Chat (assistant)                      │
└──────────────────────────────────────────┘
```

## Environment Variables

Create `.env` in the project root:
```env
GEMINI_API_KEY=your_api_key_here
```

The backend needs this key to communicate with Gemini AI.

## What's Next?

After getting started:

1. **Customize the UI**
   - Edit `App.tsx` for functionality
   - Modify `index.html` for layout
   - Update `mobile.css` for mobile styles

2. **Configure AI Prompts**
   - Backend prompts: `server/src/services/geminiService.ts`
   - Adjust for your use case

3. **Add Features**
   - Notifications
   - Cloud sync
   - Widgets
   - Share functionality

4. **Prepare for Production**
   - Add app icons: `resources/README.md`
   - Configure signing (iOS/Android)
   - Build release versions

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]

## Support

For issues or questions:
- Check the troubleshooting guides
- Review the documentation files
- Check platform-specific resources

---

**Ready to start?** Pick your platform and open the corresponding quick start guide!
- Web → [QUICKSTART.md](./QUICKSTART.md)
- Mobile → [MOBILE_QUICKSTART.md](./MOBILE_QUICKSTART.md)
