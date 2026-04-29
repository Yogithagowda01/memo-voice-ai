# MemoVoice AI - Backend Documentation

## Overview

MemoVoice AI is a voice-enabled companion application designed for elderly people with early-stage dementia. The backend provides AI-powered conversation, memory management, and medication tracking features.

**Technology Stack:**
- **Runtime:** Node.js
- **Framework:** Express.js
- **AI Engine:** Google Gemini API
- **Database:** JSON files (memories.json for persistent storage)
- **Additional:** CORS support, environment-based configuration

---

## Quick Start

### 1. Prerequisites
- Node.js v16+ installed
- Google Gemini API key (free at https://aistudio.google.com/app/apikey)
- npm or yarn

### 2. Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file with your API key
echo "GEMINI_API_KEY=your_api_key_here" > .env
echo "GEMINI_MODEL=gemini-1.5-flash" >> .env
echo "PORT=5000" >> .env

# Start the server
npm start
```

### 3. Verify Installation

Open your browser and visit:
- **Health Check:** http://localhost:5000/health
- **Test Endpoint:** http://localhost:5000/test
- **Debug Info:** http://localhost:5000/debug-env
- **List Available Models:** http://localhost:5000/list-models

---

## API Endpoints

### Core Endpoints

#### `GET /` - Service Info
Returns basic information about the running service.

**Response:**
```json
{
  "service": "MemoVoice AI Backend",
  "status": "running",
  "active_model": "gemini-1.5-flash",
  "routes": [...]
}
```

#### `GET /health` - Health Check
Returns the current status of the service, active model, and data statistics.

**Response:**
```json
{
  "status": "ok",
  "model": "gemini-1.5-flash",
  "uptime": "1234s",
  "memories": 5,
  "medications": 3
}
```

#### `GET /test` - Smoke Test
Tests the Gemini API connection.

**Response:**
```json
{
  "status": "✅ Gemini API is working!",
  "model": "gemini-1.5-flash",
  "response": "Hello! I'm MemoVoice AI...",
  "latency_ms": 1250
}
```

### AI Conversation

#### `POST /ask-ai` - Chat with AI
Send a message to the AI companion. The AI responds in a warm, gentle manner suitable for elderly users.

**Request:**
```json
{
  "message": "When do I take my pills?",
  "context": "[optional] Additional context about the user"
}
```

**Response:**
```json
{
  "reply": "You take your medication at 9 AM every morning with breakfast...",
  "model": "gemini-1.5-flash",
  "latency_ms": 1450
}
```

**Context Behavior:**
- If `context` is not provided, the API automatically includes recent memories and medications
- Memories are limited to the 5 most recent entries
- All medications in the database are included

### Memory Management

#### `POST /memories` - Save a Family Memory
Store a memory about family members or important events.

**Request:**
```json
{
  "text": "My daughter visited last Sunday",
  "person": "Daughter Sarah",
  "category": "family"
}
```

**Response:**
```json
{
  "success": true,
  "memory": {
    "id": "1712345678",
    "text": "My daughter visited last Sunday",
    "person": "Daughter Sarah",
    "category": "family",
    "date": "4/5/2024",
    "created": "2024-04-05T14:30:00.000Z"
  }
}
```

#### `GET /memories` - Load All Memories
Retrieve all stored family memories.

**Response:**
```json
{
  "count": 5,
  "memories": [
    {
      "id": "1712345678",
      "text": "My daughter visited last Sunday",
      "person": "Daughter Sarah",
      "category": "family",
      "date": "4/5/2024",
      "created": "2024-04-05T14:30:00.000Z"
    }
  ]
}
```

### Medication Management

#### `POST /medications` - Save Medication Reminder
Add a medication to track.

**Request:**
```json
{
  "name": "Aspirin",
  "dosage": "81mg",
  "time": "09:00",
  "frequency": "daily"
}
```

**Response:**
```json
{
  "success": true,
  "medication": {
    "id": "1712345679",
    "name": "Aspirin",
    "dosage": "81mg",
    "time": "09:00",
    "frequency": "daily",
    "created": "2024-04-05T14:35:00.000Z"
  }
}
```

#### `GET /medications` - Load All Medications
Retrieve all tracked medications.

**Response:**
```json
{
  "count": 3,
  "medications": [
    {
      "id": "1712345679",
      "name": "Aspirin",
      "dosage": "81mg",
      "time": "09:00",
      "frequency": "daily",
      "created": "2024-04-05T14:35:00.000Z"
    }
  ]
}
```

### Debugging

#### `GET /list-models` - Check Available Models
Probes all Gemini models to see which ones work with your API key.

**Response:**
```json
{
  "summary": "2 model(s) work with your key",
  "recommended": "gemini-1.5-flash",
  "all_results": [
    { "model": "gemini-2.0-flash", "status": "❌ not available for your key" },
    { "model": "gemini-1.5-flash", "status": "✅ works" }
  ]
}
```

#### `GET /debug-env` - Environment Debug Info
Shows current environment settings.

**Response:**
```json
{
  "NODE_ENV": "development",
  "PORT": 5000,
  "ACTIVE_MODEL": "gemini-1.5-flash",
  "API_KEY_SET": true,
  "API_KEY_HINT": "AIzaSy...NNj8",
  "DOTENV_EXISTS": true
}
```

---

## Configuration

### Environment Variables (.env)

```bash
# Required
GEMINI_API_KEY=your_api_key_here

# Optional
GEMINI_MODEL=gemini-1.5-flash      # Specific model to use
PORT=5000                           # Server port (default: 5000)
NODE_ENV=development                # development or production
FRONTEND_URL=http://localhost:3000  # CORS origin for frontend
```

### Safety Settings

The backend includes safety filters for Gemini API:
- Harassment: BLOCK_ONLY_HIGH
- Hate Speech: BLOCK_ONLY_HIGH
- Sexually Explicit: BLOCK_ONLY_HIGH
- Dangerous Content: BLOCK_ONLY_HIGH

### System Prompt

The AI uses a specific system prompt to ensure appropriate behavior:

> "You are MemoVoice AI, a warm and caring voice companion for elderly people with early-stage dementia. Speak simply and gently. Keep responses to 2-4 sentences. Never use markdown formatting, bullet points, or asterisks. Plain conversational speech only. Always end warmly. If medications are mentioned, be clear and reassuring."

---

## Data Storage

### Directory Structure

```
backend/
├── server.js          # Main server file
├── api.js             # Frontend API helper (copy to src/)
├── memories.json      # Persistent data store
├── .env               # Configuration (DO NOT commit)
├── package.json       # Dependencies
├── node_modules/      # Installed packages
└── test.js            # Test file
```

### Data Schema (memories.json)

```json
{
  "memories": [
    {
      "id": "1712345678",
      "text": "Memory content",
      "person": "Family member name",
      "category": "family",
      "date": "4/5/2024",
      "created": "2024-04-05T14:30:00.000Z"
    }
  ],
  "medications": [
    {
      "id": "1712345679",
      "name": "Medication name",
      "dosage": "Dosage info",
      "time": "HH:MM",
      "frequency": "daily",
      "created": "2024-04-05T14:35:00.000Z"
    }
  ],
  "conversations": [
    {
      "ts": "2024-04-05T14:40:00.000Z",
      "user": "User message",
      "ai": "AI response",
      "ms": 1250
    }
  ]
}
```

---

## Frontend Integration

### 1. Copy API Module
Copy `src/api.js` from the backend to your React project's `src/` folder.

### 2. Set Environment Variable
Create `.env` in your React project root:

```bash
REACT_APP_BACKEND_URL=http://localhost:5000
```

### 3. Use API Functions

```javascript
import { 
  askAI, 
  saveMemory, 
  saveMedication, 
  loadMemories, 
  loadMedications,
  checkHealth 
} from './api';

// Ask AI a question
const response = await askAI("When do I take my pills?");
console.log(response.reply);

// Save a memory
const memory = await saveMemory({
  text: "My grandson visited",
  person: "Grandson Mike",
  category: "family"
});

// Save medication
const med = await saveMedication({
  name: "Aspirin",
  dosage: "81mg",
  time: "09:00"
});

// Load all data
const { memories, medications } = await loadAll();
```

---

## Development

### Running with Hot Reload
```bash
npm run dev
```
(Requires nodemon, which is included as a dev dependency)

### Testing

#### Basic Test
```bash
curl http://localhost:5000/test
```

#### Ask AI
```bash
curl -X POST http://localhost:5000/ask-ai \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'
```

#### Save Memory
```bash
curl -X POST http://localhost:5000/memories \
  -H "Content-Type: application/json" \
  -d '{"text":"Visited garden","person":"Myself"}'
```

#### Save Medication
```bash
curl -X POST http://localhost:5000/medications \
  -H "Content-Type: application/json" \
  -d '{"name":"Aspirin","dosage":"81mg","time":"09:00"}'
```

---

## Troubleshooting

### Issue: API Key Not Found
**Error:** `GEMINI_API_KEY missing or not set in .env`

**Solution:**
1. Get a free key at https://aistudio.google.com/app/apikey
2. Add to `.env`: `GEMINI_API_KEY=your_key_here`
3. Restart the server

### Issue: No Models Available
**Error:** `No Gemini model worked with your API key`

**Causes & Solutions:**
1. **Quota Exceeded:** Wait 24 hours, or upgrade your Google Cloud account
2. **API Not Enabled:** Visit https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
3. **Key Expired:** Generate a new key at https://aistudio.google.com/app/apikey
4. **Regional Restriction:** Some regions restrict Gemini access

**Debug:**
```bash
curl http://localhost:5000/list-models
```

### Issue: Port Already in Use
**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Change port in .env
PORT=5001

# Or kill the process using port 5000
# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -i :5000
kill -9 <PID>
```

### Issue: CORS Errors from Frontend
**Error:** `No 'Access-Control-Allow-Origin' header`

**Solution:**
Add your frontend URL to `.env`:
```bash
FRONTEND_URL=http://localhost:3000
```

Then restart the server.

---

## Performance Optimization

### Response Times
- Typical latency: 1-3 seconds (depends on Gemini API)
- Memories are cached in memory for fast retrieval
- First request includes model initialization overhead

### Scaling Considerations
- Current implementation uses JSON file storage
- For production, consider:
  - Database migration (MongoDB, PostgreSQL)
  - Caching layer (Redis)
  - Load balancing with multiple instances

---

## Security

### Best Practices
1. **Never commit `.env` file** to version control
2. **Keep API key private** - regenerate if exposed
3. **CORS is configured** for localhost only in development
4. **Rate limiting** is not implemented (add for production)
5. **Input validation** is basic (add stricter validation for production)

### Production Deployment
Before deploying:
- [ ] Move from JSON to proper database
- [ ] Add authentication/authorization
- [ ] Implement rate limiting
- [ ] Add comprehensive logging
- [ ] Enable HTTPS
- [ ] Set strict CORS policies
- [ ] Add API request validation
- [ ] Implement error tracking (Sentry, etc.)

---

## API Reference Summary

| Method | Endpoint | Purpose | Authentication |
|--------|----------|---------|-----------------|
| GET | / | Service info | None |
| GET | /health | Health check | None |
| GET | /test | Smoke test | None |
| GET | /list-models | Check available models | None |
| GET | /debug-env | Debug environment | None |
| POST | /ask-ai | Chat with AI | None |
| GET | /memories | Load memories | None |
| POST | /memories | Save memory | None |
| GET | /medications | Load medications | None |
| POST | /medications | Save medication | None |

---

## Support & Resources

- **Google Gemini API:** https://ai.google.dev/
- **Gemini Models:** https://ai.google.dev/models
- **Express.js Docs:** https://expressjs.com/
- **GitHub:** https://github.com/

---

**Last Updated:** April 2024
**Version:** 1.0.0
