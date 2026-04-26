/**
 * Typed API client for the KizunaHire backend.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Auth header helper ─────────────────────────────────────────────────────────
function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = sessionStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface ParsedJD {
  role_title: string;
  required_skills: string[];
  preferred_skills: string[];
  required_experience_years: number;
  experience_level: string;
  responsibilities: string[];
  qualifications: string[];
  location_preference: string | null;
  remote_ok: boolean;
  salary_range_usd: string | null;
  industry: string;
  key_requirements_summary: string;
}

export interface CandidateScore {
  candidate_id: string;
  candidate_name: string;
  candidate_title: string;
  candidate_location: string;
  candidate_skills: string[];
  skill_match_score: number;
  experience_match_score: number;
  role_fit_score: number;
  match_score: number;
  interest_score: number;
  combined_score: number;
  match_explanation: string;
  matched_skills: string[];
  missing_skills: string[];
  conversation_summary: string;
  rank: number;
}

export interface ShortlistResponse {
  parsed_jd: ParsedJD;
  total_candidates_evaluated: number;
  shortlisted_candidates: CandidateScore[];
  processing_time_seconds: number;
}

export interface SampleJD {
  title: string;
  text: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),           // ← attach JWT on every call
      ...(options?.headers as Record<string, string> | undefined),
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    // Redirect to signin if token expired / invalid
    if (res.status === 401 && typeof window !== "undefined") {
      sessionStorage.clear();
      window.location.href = "/signin";
    }
    throw new Error(`API Error ${res.status}: ${errorBody}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  health: () => request<{ status: string }>("/api/health"),

  getSampleJDs: () =>
    request<{ sample_jds: SampleJD[] }>("/api/sample-jds"),

  generateShortlist: (jd_text: string, top_n: number = 5) =>
    request<ShortlistResponse>("/api/shortlist", {
      method: "POST",
      body: JSON.stringify({ jd_text, top_n }),
    }),
};
