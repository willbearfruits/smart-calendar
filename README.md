# Smart Calendar - AI-Powered Calendar & Task Manager

<div align="center">

**Transform handwritten notes into digital calendars with AI**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB)](https://react.dev/)
[![Capacitor](https://img.shields.io/badge/Capacitor-6.2-119EFF)](https://capacitorjs.com/)

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Mobile](#mobile-development)

</div>

---

## Overview

Smart Calendar is a production-ready, cross-platform calendar and task management app that supports multiple AI providers including Gemini, OpenAI, Claude, Ollama, and LMStudio. Scan handwritten notes, chat with an AI assistant to schedule tasks, and manage your time effectively.

### ✨ Key Features

- 📸 **AI Note Scanning** - Upload photos of handwritten notes to extract tasks and events
- 🤖 **AI Assistant** - Chat with your preferred AI provider to schedule tasks, estimate time, and plan your week
- 🔌 **Multi-Provider Support** - Works with Gemini, OpenAI, Claude, Ollama, and LMStudio
- 🗓️ **Multiple Views** - Month, week, and day calendar views with drag-and-drop
- 📱 **Cross-Platform** - Web, iOS, Android from a single codebase
- 🎨 **Print Layouts** - Generate foldable A4 calendar booklets
- ⏱️ **Task Timers** - Track time spent on each task
- 🌙 **Dark Mode** - Light, dark, and midnight themes
- 💾 **Offline Support** - All data persists locally with localStorage
- 🔒 **Privacy First** - Secure backend API protects your Gemini API key

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **AI API Key** (Optional) - Get one from your preferred provider:
  - Gemini: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
  - OpenAI: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
  - Anthropic Claude: [console.anthropic.com](https://console.anthropic.com)
  - Or use local providers: Ollama or LMStudio (no API key needed)

### Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/smart-calendar.git
cd smart-calendar

# 2. Install all dependencies
npm install
npm run server:install

# 3. Setup AI Provider (Optional - app works without AI)
# For Gemini:
echo "AI_PROVIDER=gemini" > server/.env
echo "AI_API_KEY=your_api_key_here" >> server/.env

# For OpenAI:
echo "AI_PROVIDER=openai" > server/.env
echo "AI_API_KEY=your_api_key_here" >> server/.env
echo "AI_MODEL=gpt-4-turbo-preview" >> server/.env

# For Claude:
echo "AI_PROVIDER=claude" > server/.env
echo "AI_API_KEY=your_api_key_here" >> server/.env

# For Ollama (local, no API key needed):
echo "AI_PROVIDER=ollama" > server/.env
echo "AI_BASE_URL=http://localhost:11434" >> server/.env
echo "AI_MODEL=llama3.2" >> server/.env

# For LMStudio (local, no API key needed):
echo "AI_PROVIDER=lmstudio" > server/.env
echo "AI_BASE_URL=http://localhost:1234" >> server/.env

# 4. Start both frontend and backend
npm run dev:all
```

**Access the app**:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## 📱 Mobile Development

### Android

```bash
npm run android  # Builds and opens Android Studio
```

### iOS (macOS only)

```bash
npm run ios  # Builds and opens Xcode
```

**Prerequisites**: See [MOBILE_QUICKSTART.md](MOBILE_QUICKSTART.md) for detailed mobile setup.

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [QUICKSTART.md](QUICKSTART.md) | Get running in 3 minutes |
| [BACKEND_SETUP.md](BACKEND_SETUP.md) | Backend API configuration |
| [MOBILE_QUICKSTART.md](MOBILE_QUICKSTART.md) | Mobile app setup |
| [CAPACITOR_SETUP.md](CAPACITOR_SETUP.md) | Capacitor details |
| [CLAUDE.md](CLAUDE.md) | Architecture for AI assistants |

## 🏗️ Architecture

### Tech Stack

**Frontend**: React 19.2 • TypeScript 5.8 • Vite 6.2 • Tailwind CSS • Capacitor 6.2

**Backend**: Express 4.18 • TypeScript • Multi-Provider AI • Joi • Helmet • Rate Limiting

### Project Structure

```
smart-calendar/
├── src/                    # Frontend React app
│   ├── components/         # React components + ErrorBoundary + Toast
│   ├── services/          # API client services
│   ├── utils/             # Validation & helpers
│   └── App.tsx            # Main app
├── server/                # Secure backend API
│   └── src/               # Express routes + AI services
├── android/               # Android app (Capacitor)
├── ios/                   # iOS app (Capacitor)
└── electron/              # Electron desktop app
```

## 🔐 Security Features

- ✅ API key secured in backend (never exposed)
- ✅ Rate limiting (100 req/15min)
- ✅ Request validation (Joi schemas)
- ✅ Helmet security headers
- ✅ CORS protection
- ✅ Input sanitization
- ✅ Comprehensive error handling

## 🛠️ Development Scripts

```bash
# Development
npm run dev              # Frontend dev server
npm run server:dev       # Backend with hot reload
npm run dev:all          # Both servers

# Building
npm run build            # Production build
npm run server:build     # Compile backend
npm run build:mobile     # Build + sync mobile

# Mobile
npm run cap:sync         # Sync to native projects
npm run cap:open:android # Open Android Studio
npm run cap:open:ios     # Open Xcode
```

## 🌐 Environment Variables

**Frontend** (`.env.local`):
```env
VITE_API_URL=http://localhost:3001
```

**Backend** (`server/.env`):
```env
# Choose your AI provider
AI_PROVIDER=gemini                    # or: openai, claude, ollama, lmstudio
AI_API_KEY=your_api_key_here          # Not needed for ollama/lmstudio
AI_MODEL=gemini-2.5-flash             # Optional: override default model
AI_BASE_URL=http://localhost:11434    # Only for ollama/lmstudio

# Server config
PORT=3001
NODE_ENV=development
```

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a PR.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Supports multiple AI providers: Gemini, OpenAI, Claude, Ollama, LMStudio
- Built with [React](https://react.dev/) and [Capacitor](https://capacitorjs.com/)
- Icons by [Lucide](https://lucide.dev/)

---

<div align="center">

Open source project • MIT License

</div>
