# Backend API Server Setup Guide

This document provides instructions for setting up and running the Paper2Plan backend API server.

## Overview

The backend server is a production-ready Express + TypeScript API that:
- Securely proxies all Gemini API calls to protect your API key
- Implements rate limiting, validation, and security best practices
- Provides endpoints for image analysis, schedule suggestions, chat, and task duration estimation

## Quick Start

### 1. Install Server Dependencies

From the project root:
```bash
npm run server:install
```

Or manually:
```bash
cd server
npm install
```

### 2. Configure Environment Variables

The server needs your Gemini API key. You have two options:

**Option A: Copy from root .env.local**
```bash
# Copy the API key from root .env.local to server/.env
cp .env.local server/.env
```

**Option B: Set manually**
```bash
cd server
# Edit the .env file and replace PLACEHOLDER_API_KEY with your actual key
nano .env
```

Your `server/.env` should look like:
```
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Start the Server

**Development Mode (with hot reload):**
```bash
# From project root:
npm run server:dev

# Or from server directory:
cd server
npm run dev
```

**Production Mode:**
```bash
# Build first:
npm run server:build

# Then start:
npm run server:start
```

### 4. Verify Server is Running

Open your browser or use curl:
```bash
curl http://localhost:3001/health
```

You should see:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-11-25T...",
  "environment": "development"
}
```

## Running Frontend + Backend Together

### Terminal 1 - Backend Server:
```bash
npm run server:dev
```

### Terminal 2 - Frontend Dev Server:
```bash
npm run dev
```

Now your app will:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- All Gemini API calls go through the backend (API key is secure)

## API Endpoints

### Health Check
```bash
GET http://localhost:3001/health
```

### Analyze Image
```bash
POST http://localhost:3001/api/analyze-image
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

### Suggest Schedule
```bash
POST http://localhost:3001/api/suggest-schedule
Content-Type: application/json

{
  "tasks": [...],
  "existingEvents": [...],
  "currentDate": "2025-11-25"
}
```

### Chat with AI
```bash
POST http://localhost:3001/api/chat
Content-Type: application/json

{
  "messages": [...],
  "tasks": [...],
  "events": [...],
  "currentDate": "2025-11-25"
}
```

### Estimate Task Duration
```bash
POST http://localhost:3001/api/estimate-duration
Content-Type: application/json

{
  "taskTitle": "Write documentation"
}
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| GEMINI_API_KEY | (required) | Your Google Gemini API key |
| PORT | 3001 | Server port |
| NODE_ENV | development | Environment mode |
| CORS_ORIGIN | http://localhost:5173 | Allowed frontend origin |
| RATE_LIMIT_WINDOW_MS | 900000 | Rate limit window (15 min) |
| RATE_LIMIT_MAX_REQUESTS | 100 | Max requests per window |

### CORS Configuration

To allow requests from different origins (e.g., production frontend):
```bash
# In server/.env
CORS_ORIGIN=https://yourdomain.com
```

For multiple origins, modify `server/src/index.ts` to use an array:
```typescript
app.use(cors({
  origin: ['http://localhost:5173', 'https://yourdomain.com'],
  credentials: true
}));
```

## Security Features

1. **Helmet**: Security headers to protect against common vulnerabilities
2. **CORS**: Restricts requests to allowed origins only
3. **Rate Limiting**: Prevents abuse (100 requests per 15 minutes by default)
4. **Request Validation**: Joi schemas validate all incoming data
5. **API Key Protection**: Gemini API key never exposed to frontend
6. **Error Sanitization**: Production errors don't leak sensitive info

## Troubleshooting

### Server won't start - "GEMINI_API_KEY is not set"
- Check that `server/.env` exists and contains your API key
- Make sure the key is not wrapped in quotes in the .env file

### CORS errors in browser
- Verify `CORS_ORIGIN` in `server/.env` matches your frontend URL
- Check that both servers are running
- Clear browser cache and reload

### Rate limiting errors
- Increase `RATE_LIMIT_MAX_REQUESTS` in `server/.env`
- Or increase `RATE_LIMIT_WINDOW_MS` for a longer time window

### Frontend still trying to call Gemini directly
- Make sure you're using the updated `services/geminiService.ts`
- Check that `VITE_API_URL` is not set to something incorrect
- Clear browser cache and restart dev server

## Production Deployment

### Build the Server
```bash
npm run server:build
```

### Set Production Environment
```bash
# In server/.env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-production-domain.com
```

### Run with Process Manager (PM2)
```bash
npm install -g pm2
cd server
pm2 start dist/index.js --name paper2plan-api
pm2 save
```

### Using Docker (Optional)
Create `server/Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

## Development Tips

### Watch Mode
The server uses nodemon in development mode, so it automatically restarts when you make changes to TypeScript files.

### Type Checking
```bash
cd server
npm run type-check
```

### Logging
- Development: Colored, detailed logs with morgan 'dev' format
- Production: Standard combined format for log aggregation

### Testing Endpoints
Use a tool like:
- Postman
- Insomnia
- curl
- VS Code REST Client extension

## Architecture

```
server/
├── src/
│   ├── config/
│   │   └── env.ts              # Environment configuration
│   ├── middleware/
│   │   ├── errorHandler.ts     # Error handling middleware
│   │   └── validation.ts       # Request validation with Joi
│   ├── routes/
│   │   └── api.ts              # API route definitions
│   ├── services/
│   │   └── geminiService.ts    # Gemini API integration
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   └── index.ts                # Main server entry point
├── dist/                        # Compiled JavaScript (generated)
├── .env                         # Environment variables (gitignored)
├── .env.example                 # Example environment file
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
└── nodemon.json                 # Nodemon configuration
```

## Next Steps

1. Update your Gemini API key in `server/.env`
2. Start the backend server: `npm run server:dev`
3. Start the frontend: `npm run dev`
4. Test the integration by uploading an image or chatting with the AI

The frontend is now configured to call the backend API instead of Gemini directly, keeping your API key secure!
