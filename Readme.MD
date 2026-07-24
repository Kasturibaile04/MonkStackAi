# MonkStack AI

**Face the truth about your career choices.**

MonkStack AI analyzes your resume — and, if you're brave enough, your own self-description — and generates a brutally honest (or mild, or motivational) AI roast, complete with real, actionable fixes to actually get your resume past a human.

---

## Why I Built This

Most resume feedback is either painfully generic or too polite to be useful. MonkStack AI feeds your actual resume text and self-description into an LLM and generates a structured critique — buzzword call-outs, vague-bullet roasts, a reality check against how you describe yourself, and concrete fixes — instead of vague "add more action verbs" advice nobody acts on.

---

## Features

- **Resume roast** — section-by-section critique with the exact offending quote, the joke, and the fix
- **Adjustable tone** — `savage`, `mild`, or `motivational`
- **Target role fit** — optional target role input adds a readiness/gap check for that specific role
- **Self-description reality check** — compares how you describe yourself to what your resume actually shows
- **PDF resume upload** — text extracted server-side, no manual copy-pasting
- **Authenticated accounts** — login/register to save and revisit past roasts
- **Responsive UI** — bold, neo-brutalist design; works across desktop and mobile

---

## Tech Stack

| Layer      | Technology                   |
|------------|------------------------------|
| Frontend   | React (Vite), SCSS           |
| Backend    | Node.js, Express             |
| Database   | MongoDB                      |
| AI         | Gemini api (`@google/genai`) |
| PDF Parsing| `pdf-parse`                  |
| Routing    | React Router v6              |

---

## Architecture

The backend follows a simple service-oriented separation of concerns:

```
Route Layer     → Express handlers — validate input, call services, shape responses
Service Layer    → ai.service.js — builds prompts, calls Gemini, validates output shape
Config Layer     → Database connection, environment setup
```

The AI service is isolated from Express entirely — `analyzeResume()` takes plain
data in and returns a plain, schema-validated object out, so it can be tested or
swapped (Groq, Gemini, etc.) without touching route logic.

---

## Project Structure

```
Frontend/
  src/
    features/
      auth/
        pages/          # Login, Register
        style/           # style.scss (shared login/register styles)

Backend/
  src/
    routes/
    controllers/
    config/
      database.js        # MongoDB connection
    services/
      ai.service.js       # Gemini integration — analyzeResume()
  server.js
```

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- A MongoDB instance (local or Atlas)
- A Google Gemini API key

### 1. Clone and install

```bash
git clone <your-repo-url>
cd DevWrapper

cd Frontend
npm install

cd ../Backend
npm install
```

### 2. Set environment variables

**Backend `.env`:**

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

**Frontend `.env`:**

```env
VITE_API_BASE_URL=http://localhost:3000
```

### 3. Run locally

```bash
# Terminal 1 — backend
cd Backend
npm run dev

# Terminal 2 — frontend
cd Frontend
npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:3000`.

> **Note:** avoid running this project from a OneDrive-synced folder — live file
> syncing can cause the dev server (HMR / nodemon) to behave unpredictably.
> Prefer a local path like `C:\Projects\DevWrapper`.

---

## API Overview

| Method | Endpoint              | Description                                                        |
|--------|------------------------|----------------------------------------------------------------------|
| POST   | `/api/auth/register`   | Register a new user                                                 |
| POST   | `/api/auth/login`      | Log in an existing user                                             |
| POST   | `/api/roast-resume`    | Upload a resume PDF + self description, get a structured AI roast   |

*(Adjust these to match your actual backend routes.)*

---

## Data Model

```json
{
  "overall_score": 3.5,
  "opening_jab": "...",
  "section_roasts": [
    { "section": "...", "quote": "...", "roast": "...", "fix": "..." }
  ],
  "self_description_reality_check": "...",
  "backhanded_compliment": "...",
  "real_fixes": ["...", "...", "..."],
  "role_fit": "... (only present if a target role was provided)",
  "closing_line": "..."
}
```

---

## Roadmap

- [ ] Export roast as a shareable PDF/image
- [ ] Roast history per user account
- [ ] Public shareable roast links
- [ ] Cover letter roast mode

---

## Author

Built by **Kasturi**