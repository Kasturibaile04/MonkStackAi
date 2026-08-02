# MONKSTACK AI

**MONKSTACK AI** is a resume roasting and critique SaaS product. Upload your resume, pick a tone, and get an AI-generated "roast report" — a mix of sharp, honest feedback and concrete, actionable fixes to actually make your resume better.

Built as a full-stack portfolio project demonstrating end-to-end product thinking: file upload handling, AI prompt engineering, structured output generation, and PDF processing.

---

## 🔗 Live Demo

- **Live App:** https://monk-stack-ai-frontend.vercel.app/

---

## ✨ Features

- **Resume Upload & Parsing** — Upload a PDF resume; text is extracted server-side for analysis.
- **AI Roast Report** — Get a tone-adjustable critique of your resume:
  - `savage` — sharp, sarcastic, comedian-energy roasting
  - `mild` — light teasing, mostly constructive
  - `motivational` — encouraging, upbeat, fix-focused
- **Section-by-Section Roasts** — Specific quotes from your resume, roasted and paired with concrete fixes.
- **Self-Description Reality Check** — Compares how you describe yourself against what your resume actually shows.
- **Role Fit Analysis** — Optional target-role input evaluates readiness/gaps for a specific job.
- **Upgrade Intel** — Actionable improvement suggestions:
  - Weak → strong action verb swaps
  - Vague claims → quantifiable metrics
  - Buzzword/fluff detection and replacements
  - Layout/structure issue callouts
  - Missing ATS keywords for your target role
  - Contact info clarity feedback
- **Resume Upgrade PDF** — Generates a rewritten, upgraded version of your resume as a downloadable PDF.
- **Report History** — Save and revisit past resume analyses.

---

## 🛠 Tech Stack

**Frontend**
- React
- SCSS

**Backend**
- Node.js / Express
- MongoDB + Mongoose
- Multer (file upload handling, in-memory storage)
- pdfjs-dist (PDF text extraction)
- Puppeteer (HTML → PDF generation for upgraded resumes)
- JWT + bcryptjs (authentication)
- dotenvx (encrypted environment variable management)

**AI**
- Groq API (`llama-3.3-70b-versatile`) — resume analysis and roast generation

**Deployment**
- Render (backend)

---

## 📁 Project Structure

```
Backend/
├── src/
│   ├── app.js
│   ├── controllers/
│   │   └── resume.controller.js
│   ├── models/
│   │   └── resume.model.js
│   ├── routes/
│   │   └── resume.routes.js
│   ├── services/
│   │   └── ai.service.js
│   ├── middlewares/
│   │   └── upload.middleware.js
│   └── utils/
│       └── pdfExtract.js
├── server.js
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance (local or Atlas)
- A free [Groq API key](https://console.groq.com/keys)

### Installation

```bash
git clone <your-repo-url>
cd Backend
npm install
```

### Environment Variables

Create a `.env` file in the `Backend` root:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```

### Run locally

```bash
npm run dev     # development, with nodemon auto-restart
npm start        # production mode
```

The server runs on `http://localhost:3000` by default.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|--------------|
| `POST` | `/api/resume/` | Upload a resume PDF and generate a roast report |
| `GET` | `/api/resume/:resumeId` | Fetch a specific resume report by ID |
| `GET` | `/api/resume/` | Fetch all resume reports for the logged-in user |
| `POST` | `/api/resume/upgrade` | Upload a resume + job description, get back an upgraded resume PDF |
| `POST` | `/api/resume/:resumeId/upgrade-intel` | Generate upgrade intel for an existing saved report |

All routes are protected by an authentication middleware and require a logged-in user.

---

## 🧠 How It Works

1. User uploads a resume PDF (max 5MB, PDF only).
2. `pdfjs-dist` extracts plain text from the file.
3. The extracted text, along with the user's self-description, target role, and chosen tone, is sent to Groq's `llama-3.3-70b-versatile` model with a structured prompt.
4. The model returns a JSON-formatted roast report, which is validated, saved to MongoDB, and returned to the user.
5. Optionally, the user can request an "upgraded" version of their resume, which is generated as HTML by the AI and rendered to a PDF via Puppeteer.

---

## 🗺 Roadmap / Ideas

- OCR support for scanned/image-based resume PDFs
- Multi-language resume support
- Shareable public roast report links
- Resume version comparison (before/after upgrade)




