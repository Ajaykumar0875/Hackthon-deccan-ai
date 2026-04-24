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
│  │ (Gemini) │  │ TF-IDF+LLM │  │   (Gemini)    │  │
│  └──────────┘  └─────────────┘  └───────────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │  Candidate Database (25 rich profiles)      │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                      │
              Google Gemini 1.5 Flash
```

## 📊 Scoring Logic

| Component | Weight | Method |
|---|---|---|
| Skill Match | 40% of Match | TF-IDF cosine similarity |
| Experience Match | 20% of Match | Years vs requirement |
| Role Fit | 40% of Match | Gemini LLM evaluation |
| **Match Score** | 60% of Combined | Weighted sum |
| Interest Score | 40% of Combined | Gemini conversation sentiment |
| **Combined Score** | Final Rank | 0.6×Match + 0.4×Interest |

---

## 🚀 Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- [Google Gemini API Key](https://aistudio.google.com/app/apikey) (free)

### 1. Backend Setup

```bash
cd backend

# Copy env and add your key
copy .env.example .env
# Edit .env → set GEMINI_API_KEY=your_key_here

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
│   │   ├── jd_parser.py        # Gemini JD parsing
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
| AI | Google Gemini 1.5 Flash |
| Matching | TF-IDF Vectorizer + Cosine Similarity (scikit-learn) |
| Charts | Recharts |
| Data Validation | Pydantic v2 |

## 📝 Submission

- ✅ Working prototype with local setup
- ✅ Source code with README
- ✅ Architecture diagram (above)
- ✅ Scoring methodology documented
- ✅ Sample inputs/outputs in API docs (`/docs`)
