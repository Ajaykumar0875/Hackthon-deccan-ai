# KizunaHire — AI-Powered Talent Scouting & Engagement Agent

> AI-powered recruitment pipeline: JD parsing → candidate matching → outreach simulation → AI interview → admin decision → candidate offer.

---

## 🚀 Local Setup Instructions

### Prerequisites
Make sure you have the following installed:
- **Python** 3.10 or higher → [python.org](https://python.org)
- **Node.js** 18 or higher → [nodejs.org](https://nodejs.org)
- **npm** (comes with Node.js)
- A **Groq API key** → [console.groq.com](https://console.groq.com) (free)
- A **MongoDB Atlas** cluster URI → [mongodb.com/atlas](https://www.mongodb.com/atlas) (free tier works)
- A **Gmail App Password** for email sending → [Google App Passwords](https://myaccount.google.com/apppasswords)

---

### 📦 Dependencies

You do **not** need to install these manually — the commands in the setup steps will handle everything. This is just for reference.

#### 🐍 Backend — Python Packages (`pip install -r requirements.txt`)

| Package | Version | Purpose |
|---------|---------|---------|
| `fastapi` | 0.111.0 | Web framework |
| `uvicorn[standard]` | 0.29.0 | ASGI server to run FastAPI |
| `python-dotenv` | 1.0.1 | Loads `.env` config file |
| `groq` | 0.11.0 | Groq LLM API (LLaMA 3.1) |
| `pydantic` | ≥2.7.4 | Data validation and schemas |
| `pydantic-settings` | 2.2.1 | Settings loaded from `.env` |
| `numpy` | 1.26.4 | Numerical operations |
| `scikit-learn` | 1.4.2 | TF-IDF vectorization + cosine similarity |
| `httpx` | 0.27.0 | Async HTTP client |
| `python-multipart` | 0.0.9 | File upload (resume) support |
| `passlib[bcrypt]` | 1.7.4 | Password hashing |
| `motor` | ≥3.3.2 | Async MongoDB driver |
| `pdfplumber` | 0.11.4 | PDF resume parsing |
| `bcrypt` | latest | Password encryption |
| `python-docx` | 1.1.2 | Word document (.docx) resume parsing |

#### ⚛️ Frontend — Node Packages (`npm install`)

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 14.2.35 | React framework (Next.js 14) |
| `react` | ^18 | UI library |
| `react-dom` | ^18 | React DOM rendering |
| `lucide-react` | ^1.11.0 | Icon library |
| `recharts` | ^3.8.1 | Charts for admin dashboard |
| `tailwindcss` | ^3.4.19 | CSS utility framework |
| `typescript` | ^5 | TypeScript support |
| `autoprefixer` | ^10.5.0 | CSS autoprefixing |
| `postcss` | ^8.5.10 | CSS processing |

---


### 1. Clone the Repository
```bash
git clone https://github.com/Ajaykumar0875/hackthon-deccan-ai.git
cd hackthon-deccan-ai
```

---

### 2. Backend Setup

```bash
cd backend
```

**Create and activate a virtual environment:**
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python -m venv venv
source venv/bin/activate
```

**Install dependencies:**
```bash
pip install -r requirements.txt
```

**Create the environment file:**

Create a file named `.env` inside the `backend/` folder with the following content:

```env
GROQ_API_KEY=your_groq_api_key_here
ENVIRONMENT=development
LOG_LEVEL=INFO
MONGODB_URI=your_mongodb_atlas_connection_string
ADMIN_EMAIL=your_admin_email@gmail.com
ADMIN_PASSWORD=your_admin_password
SENDER_EMAIL=your_gmail@gmail.com
SENDER_APP_PASSWORD=your_gmail_app_password
```

> **Note:** `SENDER_APP_PASSWORD` is a Gmail App Password (16 characters), NOT your Gmail login password. Generate one at [Google App Passwords](https://myaccount.google.com/apppasswords).

**Run the backend server:**
```bash
uvicorn main:app --reload --port 8000
```

Backend will be live at: `http://localhost:8000`  
API docs available at: `http://localhost:8000/docs`

---

### 3. Frontend Setup

Open a **new terminal** and run:

```bash
cd frontend
npm install
```

**Create the environment file:**

Create a file named `.env.local` inside the `frontend/` folder:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Start the frontend:**
```bash
npm run dev
```

Frontend will be live at: `http://localhost:3000`

---

### 4. Seed the Database (Optional)

> **For testing/demo purposes only.** The `seed_db.py` script inserts a set of dummy candidate profiles into MongoDB so you can immediately test the JD matching, outreach simulation, and admin dashboard without needing real candidate signups. These are synthetic/duplicate entries created solely for evaluation and demonstration.

```bash
cd backend
python seed_db.py
```

---

### 5. Access the App

| Role | URL | Credentials |
|------|-----|-------------|
| **Admin** | `http://localhost:3000/signin` | Use `ADMIN_EMAIL` + `ADMIN_PASSWORD` from your `.env` |
| **Candidate** | `http://localhost:3000/signup` | Register a new account |
| **API Docs** | `http://localhost:8000/docs` | No auth required |

---

### Project Structure

```
hackthon-deccan-ai/
├── backend/
│   ├── agents/          # JD parser, candidate matcher, outreach agent
│   ├── routers/         # FastAPI route handlers
│   ├── models/          # Pydantic schemas
│   ├── database/        # MongoDB connection
│   ├── utils/           # Embeddings, password hashing
│   ├── main.py          # FastAPI app entry point
│   ├── requirements.txt
│   └── .env             # ← You create this
└── frontend/
    ├── src/app/         # Next.js pages
    ├── src/components/  # Reusable UI components
    └── .env.local       # ← You create this
```

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js 14)               │
│                     localhost:3000                        │
│                                                           │
│  /user/home          Public landing page                  │
│  /signin             Auth (candidate + admin)             │
│  /signup             Candidate registration               │
│  /candidate/onboarding   Profile + resume upload          │
│  /user/dashboard     Candidate offer dashboard            │
│  /                   Admin shortlist dashboard            │
│  /dashboard          Admin shortlist results              │
│  /admin/interviews   AI interview review & decisions      │
│  /interview          Live AI interview (WebSocket-like)   │
└───────────────────────────┬─────────────────────────────┘
                            │  REST API (HTTP/JSON)
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   BACKEND (FastAPI / Python)              │
│                     localhost:8000                        │
│                                                           │
│  /api/auth           Login, Register, Forgot Password     │
│  /api/candidate      Profile CRUD, Resume Parse           │
│  /api/shortlist      JD → Match pipeline                  │
│  /api/interview      AI Interview, Analyze, Results       │
│  /api/email          Send interview invites               │
│  /api/user           User profile management              │
└───────────┬───────────────────────┬─────────────────────┘
            │                       │
            ▼                       ▼
  ┌─────────────────┐     ┌─────────────────────┐
  │    MongoDB       │     │    Groq LLM API      │
  │  (Atlas / Local) │     │  (Llama 3.1 / 3.3)  │
  │                  │     │                      │
  │  collections:    │     │  · JD Parsing        │
  │  · users         │     │  · Role-fit scoring  │
  │  · candidates    │     │  · Outreach sim      │
  │  · interviews    │     │  · Interview eval    │
  └─────────────────┘     └─────────────────────┘
```

---

## 2. Full Pipeline Flow

```
Admin pastes JD text
        │
        ▼
┌──────────────────┐
│  1. JD PARSING   │  ← Groq Llama 3.3-70B
│  jd_parser.py    │
│                  │
│  Extracts:       │
│  · role_title    │
│  · required_skills (list)
│  · preferred_skills
│  · experience_years
│  · experience_level
│  · salary (₹5–30 LPA)
│  · location      │
│  · key_summary   │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────┐
│  2. CANDIDATE FETCH              │
│  candidate_matcher.py            │
│                                  │
│  Priority: MongoDB profiles first│
│  Fallback: static candidates.py  │
│  (if < 3 DB profiles)            │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  3. LOCAL SKILL SCORING          │
│  utils/embeddings.py             │
│  (zero API calls — deterministic)│
│                                  │
│  For each required_skill:        │
│  · Expand compound terms         │
│    "React Or Next.Js"            │
│     → {react, next.js}           │
│  · Check vs candidate skill set  │
│  · TF-IDF char n-gram fallback   │
│    (cosine sim > 0.55 = match)   │
│                                  │
│  skill_score = matched/total × 100
│                                  │
│  exp_score:                      │
│  · candidate_yrs >= required_yrs │
│    → 100 (perfect)               │
│  · Each year short = -15 pts     │
│                                  │
│  pre_score = skill×0.6 + exp×0.4 │
└────────┬─────────────────────────┘
         │  Top 10 by pre_score
         ▼
┌──────────────────────────────────┐
│  4. AI ROLE-FIT SCORING          │
│  1 batched Groq call             │
│  Model: llama-3.1-8b-instant     │
│                                  │
│  Input: all top-10 candidates    │
│         + JD requirements        │
│  Output: role_fit_score (0–100)  │
│          + 2-3 sentence reason   │
│                                  │
│  Fallback if API fails: 55.0     │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  5. FINAL MATCH SCORE            │
│                                  │
│  match_score =                   │
│    skill_score  × 0.50           │
│  + exp_score    × 0.30           │
│  + role_fit     × 0.20           │
│                                  │
│  Range: 0–100 (no artificial floor)
└────────┬─────────────────────────┘
         │  Sort & return top_n (default 5)
         ▼
┌──────────────────────────────────┐
│  6. OUTREACH SIMULATION          │
│  outreach_agent.py               │
│  Model: llama-3.1-8b-instant     │
│                                  │
│  Simulates a recruiter message   │
│  + candidate reply conversation  │
│                                  │
│  Scores:                         │
│  interest_score (0–100) used     │
│  INTERNALLY for ranking only     │
│  (not displayed to recruiter)    │
│                                  │
│  internal_rank_score =           │
│    match_score × 0.30            │
│  + interest_score × 0.70         │
└──────────────────────────────────┘
         │  Used for internal ranking only
         ▼
┌──────────────────────────────────┐
│  7. ADMIN SENDS INVITE           │
│  email_router.py                 │
│                                  │
│  Sends HTML email with:          │
│  · Interview link                │
│  · Role & company details        │
│  · SMTP via Gmail                │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  8. AI INTERVIEW                 │
│  interview_router.py             │
│  Model: llama-3.3-70b-versatile  │
│                                  │
│  10 dynamic questions:           │
│  Q1  Icebreaker                  │
│  Q2  Background                  │
│  Q3  Tech Core 1 (role-specific) │
│  Q4  Tech Core 2 (architecture)  │
│  Q5  Problem-solving             │
│  Q6  Team/Process                │
│  Q7  Motivation                  │
│  Q8  Situational                 │
│  Q9  Culture fit                 │
│  Q10 Candidate questions         │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  9. INTERVIEW ANALYSIS           │
│  Model: llama-3.3-70b-versatile  │
│                                  │
│  Output JSON:                    │
│  · interest_score  (0–100)       │
│  · summary  (3–4 sentences)      │
│  · recommendation                │
│    Strong Yes / Yes / Maybe / No │
│  · key_strengths  []             │
│  · concerns  []                  │
│                                  │
│  Saved to MongoDB: interviews    │
│  Admin emailed HTML report       │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  10. ADMIN DECISION              │
│  /admin/interviews               │
│                                  │
│  Admin reviews result cards:     │
│  · Match Score + Interest Score  │
│  · Recommendation badge          │
│  · Strengths & Concerns          │
│                                  │
│  Actions:                        │
│  ✅ Approve  →  status=approved  │
│  ✗  Decline  →  status=declined  │
│                                  │
│  On approval: candidate emailed  │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  11. CANDIDATE OFFER DASHBOARD   │
│  /user/dashboard                 │
│                                  │
│  GET /api/interview/my-offers    │
│  Fetches approved results for    │
│  candidate's email               │
│                                  │
│  Displays per offer:             │
│  · Role & date                   │
│  · Match Score                   │
│  · Interest Score (from REAL     │
│    AI interview answers)         │
│  · AI summary                   │
│  · Key strengths                 │
└──────────────────────────────────┘
```

---

## 3. Scoring System — Deep Dive

### 3.1 Skill Overlap (`utils/embeddings.py`)

```python
# Each required skill is expanded into tokens first
"React Or Next.Js"              → {react, next.js, react or next.js}
"Node.Js With Express Or Fastify" → {node.js, express, fastify, ...}

# Token-level matching
for each required_skill:
    if any(token in candidate_expanded_skills):
        → MATCHED ✅
    elif TF-IDF cosine_similarity > 0.55:
        → MATCHED (semantic) ✅
    else:
        → MISSING ✗

skill_score = len(matched) / len(required) × 100
preferred_bonus = min(10, len(preferred_matched) × 3)
final_skill_score = min(100, skill_score + preferred_bonus)
```

### 3.2 Experience Score (`utils/embeddings.py`)

```python
if candidate_years >= required_years:
    if excess > 5 years: return 85.0   # overqualified flag
    else:                return 100.0
else:
    penalty = deficit_years × 15.0
    return max(0.0, 100.0 - penalty)
```

### 3.3 Match Score (`candidate_matcher.py`)

```
match_score = skill_score × 0.50
            + exp_score   × 0.30
            + role_fit    × 0.20
```

| Component | Weight | Source |
|-----------|--------|--------|
| Skill Overlap | 50% | Deterministic token matching |
| Experience | 30% | Years vs JD requirement |
| AI Role Fit | 20% | Groq Llama evaluation |

### 3.4 Internal Ranking Score (not displayed)

After outreach simulation, candidates are re-ranked internally using:

```
internal_rank = match_score   × 0.30
              + interest_score × 0.70   ← interest is the decider
```

This score is **not shown** to the recruiter on `/dashboard`. The recruiter only sees the `match_score` on the shortlist.
The real `interest_score` shown in `/admin/interviews` comes from the actual candidate's interview answers (Step 9).

---

## 4. Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Vanilla CSS |
| Backend | FastAPI (Python 3.11+), async/await |
| Database | MongoDB (Motor async driver) |
| AI / LLM | Groq API — Llama 3.1-8B (fast), Llama 3.3-70B (quality) |
| Email | SMTP via Gmail (smtplib) |
| Resume Parsing | Groq vision / text extraction → structured JSON |
| Skill Matching | scikit-learn TF-IDF + cosine similarity |
| Auth | Session-based (sessionStorage) — email + role |

---

## 5. Authentication & Role Routing

```
User signs in at /signin
        │
        ├── role = "admin"     →  window.location.href = "/"
        └── role = "candidate" →  window.location.href = "/user/dashboard"

Session keys (sessionStorage):
  · user_email
  · user_role     ("admin" | "candidate")
  · user_name

Route guards:
  /user/dashboard     requires role === "candidate"
  /admin/interviews   requires role === "admin"
  /candidate/onboarding  requires role === "candidate"

Logout redirects:
  Admin logout  (Navbar)          →  /user/home
  Candidate logout (/user/dashboard)  →  /signin

Other key redirects:
  /user/home  "Create Account" button  →  /signup
  /signup after register               →  /candidate/onboarding
  /candidate/onboarding "Skip for now" →  /user/dashboard
```

---

## 6. Complete Route Map

| Route | Access | Description |
|-------|--------|-------------|
| `/user/home` | Public | Landing page for candidates |
| `/signin` | Public | Login (admin + candidate) |
| `/signup` | Public | Candidate registration |
| `/forgot-password` | Public | Password reset |
| `/candidate/onboarding` | Candidate | Profile form + resume upload |
| `/candidate/onboarding?fresh=true` | Candidate | Force new application form |
| `/user/dashboard` | Candidate | View approved offers |
| `/interview` | Candidate (via email link) | Live AI interview |
| `/interview/complete` | Candidate | Post-interview confirmation |
| `/` | Admin | JD input + shortlist trigger |
| `/dashboard` | Admin | Shortlist results & analytics |
| `/admin/interviews` | Admin | Review AI interviews, approve/decline |
| `/admin/stats` | Admin | Recruitment analytics |

---

## 7. API Endpoints

### Auth (`/api/auth`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/login` | Returns role + user info |
| POST | `/register` | Creates candidate account |
| POST | `/forgot-password` | Sends OTP reset email |
| POST | `/reset-password` | Updates password |

### Candidate (`/api/candidate`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/profile?email=` | Fetch profile |
| POST | `/profile` | Create/update profile |
| POST | `/parse-resume` | AI resume → JSON fields |

### Shortlist (`/api/shortlist`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Full JD → ranked candidates pipeline |

### Interview (`/api/interview`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/start` | Generate 10 interview questions |
| POST | `/analyze` | Score answers, save, email admin |
| GET | `/results` | All interview results (admin) |
| POST | `/decision` | Approve or decline candidate |
| GET | `/my-offers?email=` | Approved offers for candidate |

### Email (`/api/email`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/send-invite` | Send interview invite email |

---

## 8. Data Models

### Candidate Profile (MongoDB: `candidates`)
```json
{
  "email": "user@example.com",
  "name": "Full Name",
  "phone": "9876543210",
  "location": "City, Country",
  "linkedin": "https://linkedin.com/in/...",
  "summary": "...",
  "experience_level": "Junior (1-2 yrs)",
  "availability": "Immediate",
  "expected_salary": "₹8-12 LPA",
  "target_role": "Full Stack Developer",
  "skills": ["React", "Node.js", "MongoDB"],
  "preferred_roles": ["Full Stack Developer", "Backend Developer"],
  "resume_filename": "resume.pdf"
}
```

### Interview Result (MongoDB: `interviews`)
```json
{
  "candidate_email": "user@example.com",
  "candidate_name": "Full Name",
  "role": "Full Stack Developer",
  "match_score": 76.5,
  "interest_score": 82.0,
  "summary": "...",
  "recommendation": "Strong Yes",
  "key_strengths": ["React expertise", "System design"],
  "concerns": ["Limited cloud experience"],
  "status": "pending | approved | declined",
  "completed_at": "2026-04-26T12:00:00"
}
```

---

## 9. Interest Score — How It's Calculated

The **Interest Score** (0–100) measures how genuinely interested and committed a candidate is in **this specific job offer**, not just their technical ability.

### What Triggers the Calculation?
After all 10 interview questions are answered, the frontend calls `POST /api/interview/analyze` with the full Q&A transcript. The backend uses **Groq (LLaMA 3.1)** to evaluate the responses.

### Signal Sources (Per Question)

| Question | What It Captures |
|----------|-----------------|
| Q1 — Warm-up | General motivation and background context |
| Q2 — Career Alignment | Whether this role fits their long-term goals |
| Q3 — Technical Core 1 | Baseline competency (filters disengaged candidates) |
| Q4 — Technical Core 2 | Depth of real-world problem awareness |
| Q5 — Adaptability | Willingness to grow within this team/stack |
| Q6 — Team Dynamics | Cultural fit and collaboration interest |
| Q7 — Work Environment | Whether this role's environment suits them |
| Q8 — Passion Indicator | What excites them — compared to this role's nature |
| Q9 — Availability & Timeline | Urgency and commitment to joining |
| Q10 — Closing | Engaged candidates always ask thoughtful questions |

### Scoring Dimensions (Evaluated by LLM)

```
1. Technical Knowledge    — Depth and accuracy of technical answers
2. Communication Clarity  — How clearly and confidently they express ideas
3. Enthusiasm & Interest  — Language signals, energy, specificity about THIS role
4. Problem-Solving        — How they approach scenarios and challenges
5. Cultural Fit Signals   — Alignment with team, environment, and growth mindset
```

### LLM Output Format
The Groq model returns a structured JSON at `temperature=0.3` (low randomness for consistent scoring):

```json
{
  "interest_score": 85,
  "technical_score": 72,
  "summary": "3-4 sentence summary of performance, strengths, and concerns",
  "recommendation": "Strong Yes | Yes | Maybe | No",
  "key_strengths": ["strength1", "strength2"],
  "concerns": ["concern1"]
}
```

### How It's Used
- Admin Dashboard (`/admin/interviews`) shows `interest_score`, `technical_score`, and `match_score` side by side
- Admin uses all three scores + LLM recommendation to **approve or decline** the candidate
- On approval → congratulations email is automatically sent to the candidate

### Score Interpretation

| Interest Score | Meaning |
|---------------|---------|
| 85–100 | Highly motivated — clear enthusiasm for this specific offer |
| 65–84 | Moderately interested — good signals with some uncertainty |
| 45–64 | Lukewarm — may be passively exploring, not committed |
| 0–44 | Low interest — responses lack enthusiasm or specificity |

---

## 10. Semantic Skill Matching — Embeddings & Cosine Similarity

The **Match Score** (0–100) is calculated using a two-pass semantic matching pipeline in `backend/utils/embeddings.py`. This is **not** a simple string comparison — it uses TF-IDF vectorization and cosine similarity to handle real-world skill name variations.

### Why Semantic Matching?
Candidates write skills in many ways:
- `"JS"` vs `"JavaScript"`
- `"Node"` vs `"Node.js"`
- `"React or Next.js"` (compound skill) vs `"React"` and `"Next.js"` separately

A plain string match would miss all of these. The semantic pipeline catches them.

### Two-Pass Matching Pipeline

**Pass 1 — Exact Token Overlap**
- Skills are expanded into tokens: `"React Or Next.js"` → `{"react", "next.js", "react or next.js"}`
- Candidate token set is intersected with JD required skill tokens
- Any overlap → counted as a match

**Pass 2 — TF-IDF Semantic Fallback** (only if Pass 1 fails)
- Uses `TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 4))` — character-level n-grams
- Builds vectors for all candidate skills and the unmatched required skill
- Computes **cosine similarity** between them
- If `max similarity > 0.55` → counted as a semantic match

```python
# Simplified core logic
vectorizer = TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 4))
matrix     = vectorizer.fit_transform(candidate_skills + required_skill_tokens)
similarity = cosine_similarity(candidate_vecs, req_vecs)
if similarity.max() > 0.55:
    matched = True   # semantic match found
```

### Match Score Formula

```
base_score = (matched_required_skills / total_required_skills) * 100
bonus      = min(10.0, preferred_skills_matched * 3.0)
match_score = min(100.0, base_score + bonus)
```

- **Required skills** → each worth equal weight toward the base score
- **Preferred skills** → each adds +3 points (capped at +10 bonus)
- **Overqualified candidates** (5+ extra years) → capped at 85 to flag potential mismatch

### What It Does NOT Use
- No transformer-based embeddings (e.g. BERT, OpenAI embeddings)
- No vector database (e.g. Pinecone, Weaviate)
- No approximate nearest-neighbor search

The TF-IDF + cosine similarity approach is lightweight, runs locally with no API calls, and is sufficient for skill-name fuzzy matching at this scale.
