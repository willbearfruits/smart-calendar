# Paper2Plan - Quick Start Guide

Get Paper2Plan running with backend API in 3 minutes.

## Prerequisites

- Node.js 18+ and npm
- A Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

## Installation

### 1. Install All Dependencies

```bash
# Install frontend dependencies
npm install

# Install server dependencies
npm run server:install
```

### 2. Configure API Key

Add your Gemini API key to the backend server:

```bash
# Edit server/.env and replace PLACEHOLDER_API_KEY
nano server/.env
```

Or use this one-liner (replace YOUR_KEY_HERE):
```bash
echo "GEMINI_API_KEY=YOUR_KEY_HERE
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100" > server/.env
```

### 3. Start Both Servers

**Terminal 1 - Start Backend:**
```bash
npm run server:dev
```

Wait for: `Server is running at http://localhost:3001`

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```

Open: http://localhost:5173

## That's It!

You should now have:
- Frontend running on http://localhost:5173
- Backend API on http://localhost:3001
- Secure API key handling (never exposed to frontend)

## Test the Setup

1. Open http://localhost:5173 in your browser
2. Try uploading an image with handwritten tasks
3. Chat with the AI assistant
4. Check that backend logs show API requests

## Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is available
lsof -i :3001

# Verify API key is set
cat server/.env | grep GEMINI_API_KEY
```

### Frontend can't reach backend
```bash
# Check backend is running
curl http://localhost:3001/health

# Check CORS settings in server/.env
cat server/.env | grep CORS_ORIGIN
```

### Still issues?
See [BACKEND_SETUP.md](./BACKEND_SETUP.md) for detailed documentation.

## Production Build

```bash
# Build frontend
npm run build

# Build backend
npm run server:build

# Start backend in production
npm run server:start

# Serve frontend build with your preferred static server
```

## Architecture Overview

```
┌─────────────────┐
│   Frontend      │  Port 5173
│   (React/Vite)  │
└────────┬────────┘
         │ HTTP Requests
         ▼
┌─────────────────┐
│   Backend API   │  Port 3001
│   (Express/TS)  │
└────────┬────────┘
         │ API Calls
         ▼
┌─────────────────┐
│   Gemini API    │
│   (Google)      │
└─────────────────┘
```

**Security**: The frontend never has access to your API key. All Gemini calls go through the backend.

## Available Scripts

### Frontend
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm run server:dev` - Start with hot reload
- `npm run server:build` - Compile TypeScript
- `npm run server:start` - Run production build
- `npm run server:install` - Install dependencies

### Mobile (Capacitor)
- `npm run android` - Build and open Android
- `npm run ios` - Build and open iOS

## Next Steps

- Customize the calendar in `App.tsx`
- Modify AI prompts in `server/src/services/geminiService.ts`
- Add new API endpoints in `server/src/routes/api.ts`
- Configure rate limits in `server/.env`

Enjoy using Paper2Plan!
