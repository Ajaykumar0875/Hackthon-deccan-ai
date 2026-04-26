# KizunaHire — System Architecture

> AI-powered recruitment pipeline: JD parsing → candidate matching → outreach simulation → AI interview → admin decision → candidate offer.

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
