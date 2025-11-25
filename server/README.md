# Paper2Plan Backend API Server

Production-ready Express + TypeScript backend for the Paper2Plan calendar application.

## Features

- Secure Gemini API proxy to protect API keys
- Rate limiting and request validation
- Security headers with Helmet
- CORS configuration
- Request compression
- Error handling and logging
- Health check endpoint
- TypeScript for type safety

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Add your Gemini API key to `.env`:
```
GEMINI_API_KEY=your_actual_api_key_here
```

## Development

Run the server in development mode with hot reload:
```bash
npm run dev
```

## Production

Build and run in production:
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Image Analysis
- `POST /api/analyze-image`
- Body: `{ "image": "base64_encoded_image" }`
- Returns extracted tasks and events from handwritten notes

### Schedule Suggestions
- `POST /api/suggest-schedule`
- Body: `{ "tasks": [], "existingEvents": [], "currentDate": "string" }`
- Returns AI-suggested schedule for uncompleted tasks

### Chat with AI
- `POST /api/chat`
- Body: `{ "messages": [], "tasks": [], "events": [], "currentDate": "string" }`
- Returns AI chat response with optional calendar event tool calls

### Duration Estimation
- `POST /api/estimate-duration`
- Body: `{ "taskTitle": "string" }`
- Returns estimated time to complete a task

## Environment Variables

See `.env.example` for all available configuration options.

## Security Features

- Helmet security headers
- CORS protection
- Rate limiting (100 requests per 15 minutes by default)
- Request validation with Joi
- API key protection (never exposed to frontend)
- Error message sanitization

## Architecture

```
server/
├── src/
│   ├── config/        # Environment and configuration
│   ├── middleware/    # Express middleware (validation, errors)
│   ├── routes/        # API route definitions
│   ├── services/      # Business logic (Gemini integration)
│   ├── types/         # TypeScript type definitions
│   └── index.ts       # Application entry point
├── dist/              # Compiled JavaScript (generated)
├── .env               # Environment variables (gitignored)
├── .env.example       # Example environment file
├── package.json       # Dependencies and scripts
└── tsconfig.json      # TypeScript configuration
```
