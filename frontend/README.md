<<<<<<< HEAD
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
=======
# 🤖 AI-Powered Talent Scouting & Engagement Agent

> **Deccan AI Project** — Intelligent recruiter agent that parses JDs, discovers candidates, simulates outreach, and delivers an explainable ranked shortlist.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Next.js 14 Frontend                │
│  Landing Page → JD Input → Dashboard → Shortlist   │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP / REST
┌─────────────────────▼───────────────────────────────┐
│                  FastAPI Backend                     │
│                                                     │
│  ┌──────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │ JD Parser│  │  Matcher    │  │ Outreach Agent│  │
│  │  (Groq)  │  │ TF-IDF+LLM │  │    (Groq)     │  │
│  └──────────┘  └─────────────┘  └───────────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │  Candidate Database (25 rich profiles)      │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                      │
              Groq — Llama 3.3 70B Versatile
```

## 📊 Scoring Logic

| Component | Weight | Method |
|---|---|---|
| Skill Match | 40% of Match | TF-IDF cosine similarity |
| Experience Match | 20% of Match | Years vs requirement |
| Role Fit | 40% of Match | Groq LLM evaluation |
| **Match Score** | 60% of Combined | Weighted sum |
| Interest Score | 40% of Combined | Groq conversation sentiment |
| **Combined Score** | Final Rank | 0.6×Match + 0.4×Interest |

---

## 🚀 Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- [Groq API Key](https://console.groq.com) (free — 6,000 req/day)

### 1. Backend Setup

```bash
cd backend

# Copy env and add your key
copy .env.example .env
# Edit .env → set GROQ_API_KEY=your_key_here

# Install dependencies
pip install -r requirements.txt

# Start backend
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
Swagger docs at: http://localhost:8000/docs

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies (already done)
npm install

# Start dev server
npm run dev
```

Frontend runs at: http://localhost:3000

---

## 📁 Project Structure

```
DECCAN_AI_PROJECT/
├── backend/
│   ├── main.py                 # FastAPI entry point
│   ├── config.py               # Settings management
│   ├── requirements.txt
│   ├── .env.example
│   ├── agents/
│   │   ├── jd_parser.py        # Groq LLM JD parsing
│   │   ├── candidate_matcher.py # TF-IDF + LLM matching
│   │   └── outreach_agent.py   # Conversation simulation
│   ├── data/
│   │   └── candidates.py       # 25 candidate profiles
│   ├── models/
│   │   └── schemas.py          # Pydantic data models
│   ├── routers/
│   │   └── api_router.py       # API endpoints
│   └── utils/
│       └── embeddings.py       # Cosine similarity utils
└── frontend/
    ├── src/app/
    │   ├── page.tsx            # Landing page
    │   ├── dashboard/page.tsx  # Results dashboard
    │   └── globals.css         # Design system
    ├── src/components/
    │   ├── CandidateCard.tsx
    │   ├── ConversationModal.tsx
    │   ├── ShortlistTable.tsx
    │   └── Navbar.tsx
    └── src/lib/api.ts          # Typed API client
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/sample-jds` | Get demo JDs |
| GET | `/api/candidates` | List all candidates |
| POST | `/api/shortlist` | Full pipeline: JD→Match→Outreach→Rank |
| POST | `/api/parse-jd` | Parse JD only |

### Sample Request

```json
POST /api/shortlist
{
  "jd_text": "We are looking for a Senior Full Stack Engineer...",
  "top_n": 5
}
```

### Sample Response

```json
{
  "parsed_jd": {
    "role_title": "Senior Full Stack Engineer",
    "required_skills": ["React", "Node.js", "TypeScript", "AWS"],
    "required_experience_years": 5,
    "experience_level": "Senior"
  },
  "total_candidates_evaluated": 25,
  "shortlisted_candidates": [
    {
      "candidate_name": "Aarav Mehta",
      "match_score": 87.5,
      "interest_score": 82.0,
      "combined_score": 85.3,
      "rank": 1,
      "matched_skills": ["React", "Node.js", "TypeScript", "AWS"],
      "match_explanation": "Strong match across all required skills with 7 years of experience..."
    }
  ],
  "processing_time_seconds": 18.3
}
```

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Vanilla CSS |
| Backend | FastAPI, Python 3.11, Uvicorn |
| AI | Groq (Llama 3.3 70B) — 6,000 free req/day |
| Matching | TF-IDF Vectorizer + Cosine Similarity (scikit-learn) |
| Charts | Recharts |
| Data Validation | Pydantic v2 |

>>>>>>> 5f0e1fef62167953cf4a9e039c4cbad07b1ac6ac
