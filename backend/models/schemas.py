"""Pydantic schemas for all API models."""
from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, Any
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
    required_skills: list[str] = []
    preferred_skills: list[str] = []
    required_experience_years: int = 3
    experience_level: ExperienceLevel = ExperienceLevel.mid
    responsibilities: list[str] = []
    qualifications: list[str] = []
    location_preference: Optional[str] = None
    remote_ok: bool = False
    salary_range_usd: Optional[str] = None
    industry: str = "Technology"
    key_requirements_summary: str = ""

    @model_validator(mode="before")
    @classmethod
    def coerce_nulls(cls, values: Any) -> Any:
        """Coerce None values from LLM to safe defaults before field validation."""
        if not isinstance(values, dict):
            return values
        # Bool fields: None → False
        if values.get("remote_ok") is None:
            values["remote_ok"] = False
        # List fields: None → []
        for list_field in ("required_skills", "preferred_skills", "responsibilities", "qualifications"):
            if values.get(list_field) is None:
                values[list_field] = []
        # Int fields: None → default
        if values.get("required_experience_years") is None:
            values["required_experience_years"] = 3
        # String fields: None → default
        if values.get("industry") is None:
            values["industry"] = "Technology"
        if values.get("key_requirements_summary") is None:
            values["key_requirements_summary"] = ""
        if values.get("role_title") is None:
            values["role_title"] = "Unknown Role"
        return values


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


# ─── User / Auth Models ───────────────────────────────────────────────────────

class UserProfile(BaseModel):
    name: str
    email: str
    role: str
    created_at: str


class UpdateProfileRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=8, description="Min 8 characters")
    confirm_password: str

    @model_validator(mode="after")
    def passwords_match(self) -> "ChangePasswordRequest":
        if self.new_password != self.confirm_password:
            raise ValueError("New password and confirm password do not match")
        return self


# ─── Admin Statistics ─────────────────────────────────────────────────────────

class AdminStats(BaseModel):
    total_users: int
    total_candidates: int
    total_admins: int
    candidates_by_role: dict[str, int]
    latest_registrations: list[UserProfile]
