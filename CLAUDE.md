# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Art on Wall AI" - A React application that uses AI to place artwork (paintings or statues) in professional mockup environments. Users upload an image of their art, select styling options, and the app generates a polished presentation image using AI image editing APIs.

## Commands

### Development
```bash
npm install          # Install frontend dependencies
npm run dev          # Start Vite dev server
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview production build
```

### Server (for Cloud Run deployment with API key proxy)
```bash
cd server
npm install          # Install server dependencies
npm start            # Start production server
npm run dev          # Start with nodemon (hot reload)
```

### Deployment (Google Cloud Run)
```bash
gcloud run deploy my-app --source=. --update-secrets=GEMINI_API_KEY=gemini_api_key:latest
```

## Architecture

### Frontend Stack
- React 19 + TypeScript + Vite
- FAL AI client (`@fal-ai/client`) for image generation
- Google GenAI SDK (`@google/genai`) for Gemini integration

### Key Files
- `App.tsx` - Main application component with state management for the full workflow
- `types.ts` - TypeScript enums for artwork types, frames, walls, rooms, pedestals, AI models, aspect ratios
- `services/falService.ts` - Primary AI service: image editing via FAL (Gemini 3 Pro, GPT Image 1.5, Seedream, Qwen), video generation (Veo 3.1, Wan 2.6)
- `services/geminiService.ts` - Legacy Gemini API service (direct integration)
- `components/` - UI selectors for each configuration option

### AI Models (via FAL)
- **Qwen** (default): `fal-ai/qwen-image-edit-2511`
- **NanoBananaNew**: `fal-ai/gemini-3-pro-image-preview/edit`
- **GptImage15**: `fal-ai/gpt-image-1.5/edit`
- **Seedream**: `fal-ai/bytedance/seedream/v4.5/edit`

### Video Generation
- Statue rotation: Veo 3.1 (`fal-ai/veo3.1/fast/first-last-frame-to-video`)
- Painting animation: Wan 2.6 (`fal-ai/wan-25-preview/image-to-video`)

### Server Proxy
The Express server (`server/server.js`) proxies Gemini API requests to avoid exposing API keys in the frontend. It also handles WebSocket connections for real-time features.

## Environment Variables

Set in `.env` at root:
- `GEMINI_API_KEY` - Google Gemini API key
- `FAL_API_KEY` - FAL AI API key

Vite exposes these via `process.env.GEMINI_API_KEY` and `process.env.FAL_API_KEY` (configured in `vite.config.ts`).

## Workflow

1. User uploads artwork image
2. Selects artwork type (painting/statue)
3. Configures styling (frame, wall/room color, pedestal)
4. Chooses AI model and aspect ratio
5. App generates mockup via FAL API
6. Optional: animate the result (video generation)
