"""Pydantic schemas for all API models."""
from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


# ─── Enums ────────────────────────────────────────────────────────────────────

class ExperienceLevel(str, Enum):
    junior = "Junior"
    mid = "Mid"
    senior = "Senior"
    lead = "Lead"
    principal = "Principal"


class EmploymentType(str, Enum):
    full_time = "Full-Time"
    part_time = "Part-Time"
    contract = "Contract"
    remote = "Remote"


# ─── Candidate Models ──────────────────────────────────────────────────────────

class CandidateProfile(BaseModel):
    id: str
    name: str
    title: str
    location: str
    experience_years: int
    experience_level: ExperienceLevel
    skills: list[str]
    summary: str
    education: str
    previous_companies: list[str]
    achievements: list[str]
    expected_salary_usd: int
    open_to_remote: bool
    availability: str  # e.g. "Immediate", "2 weeks", "1 month"
    linkedin_url: Optional[str] = None


class CandidateScore(BaseModel):
    candidate_id: str
    candidate_name: str
    candidate_title: str
    candidate_location: str
    candidate_skills: list[str]
    skill_match_score: float = Field(ge=0, le=100)
    experience_match_score: float = Field(ge=0, le=100)
    role_fit_score: float = Field(ge=0, le=100)
    match_score: float = Field(ge=0, le=100, description="Weighted: skill+exp+role")
    interest_score: float = Field(ge=0, le=100, description="From simulated conversation")
    combined_score: float = Field(ge=0, le=100, description="0.6*match + 0.4*interest")
    match_explanation: str
    matched_skills: list[str]
    missing_skills: list[str]
    conversation_summary: str
    rank: int


# ─── JD Models ────────────────────────────────────────────────────────────────

class JobDescriptionInput(BaseModel):
    jd_text: str = Field(min_length=50, description="Raw job description text")
    top_n: int = Field(default=5, ge=1, le=25, description="Number of candidates to shortlist")


class ParsedJD(BaseModel):
    role_title: str
    required_skills: list[str]
    preferred_skills: list[str]
    required_experience_years: int
    experience_level: ExperienceLevel
    responsibilities: list[str]
    qualifications: list[str]
    location_preference: Optional[str] = None
    remote_ok: bool = False
    salary_range_usd: Optional[str] = None
    industry: str
    key_requirements_summary: str


# ─── Outreach Models ──────────────────────────────────────────────────────────

class OutreachRequest(BaseModel):
    candidate_id: str
    parsed_jd: ParsedJD


class ConversationTurn(BaseModel):
    role: str  # "recruiter" or "candidate"
    message: str


class OutreachResult(BaseModel):
    candidate_id: str
    candidate_name: str
    conversation: list[ConversationTurn]
    interest_score: float = Field(ge=0, le=100)
    interest_label: str  # "Very Interested", "Interested", "Neutral", "Not Interested"
    key_signals: list[str]
    summary: str


# ─── Final Shortlist Response ──────────────────────────────────────────────────

class ShortlistResponse(BaseModel):
    parsed_jd: ParsedJD
    total_candidates_evaluated: int
    shortlisted_candidates: list[CandidateScore]
    processing_time_seconds: float
