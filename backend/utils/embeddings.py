"""Embedding utilities for semantic skill similarity using TF-IDF + cosine similarity."""
import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Words that act as glue in compound skill names — not skills themselves
_NOISE = {"with", "or", "and", "for", "the", "a", "an", "in", "on", "at", "to", "of", "using"}


def _expand_skills(skills: list[str]) -> set[str]:
    """
    Expand compound skill strings into individual tokens.
    "Node.Js With Express Or Fastify" → {"node.js with express or fastify", "node.js", "express", "fastify"}
    "React Or Next.Js"               → {"react or next.js", "react", "next.js"}
    """
    expanded: set[str] = set()
    for skill in skills:
        clean = skill.strip()
        expanded.add(clean.lower())
        # Split on " with ", " or ", " and ", "/", ","
        parts = re.split(r"\s+(?:with|or|and|using)\s+|[/,]", clean, flags=re.IGNORECASE)
        for part in parts:
            part = part.strip().lower()
            if part and part not in _NOISE and len(part) > 1:
                expanded.add(part)
    return expanded


def compute_skill_overlap(candidate_skills: list[str], required_skills: list[str], preferred_skills: list[str]) -> dict:
    """
    Compute multi-level skill match:
    - Exact matches (normalized, with compound skill expansion)
    - Semantic similarity via TF-IDF cosine
    Returns: dict with matched, missing, preferred_matched, and score
    """
    candidate_set  = _expand_skills(candidate_skills)
    required_set   = {s.lower().strip() for s in required_skills}
    preferred_set  = {s.lower().strip() for s in preferred_skills}

    # Exact matches (compound-expanded candidate vs JD skills)
    exact_required  = candidate_set & required_set
    exact_preferred = candidate_set & preferred_set
    missing_required = required_set - candidate_set

    # Semantic match for remaining skills using TF-IDF
    semantic_bonus = 0.0
    if missing_required and candidate_skills:
        try:
            vectorizer = TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 4))
            all_terms = list(candidate_set) + list(missing_required)
            if len(all_terms) >= 2:
                matrix = vectorizer.fit_transform(all_terms)
                candidate_vectors = matrix[: len(candidate_set)]
                missing_vectors = matrix[len(candidate_set) :]
                sim_matrix = cosine_similarity(candidate_vectors, missing_vectors)
                for j in range(sim_matrix.shape[1]):
                    if sim_matrix[:, j].max() > 0.5:
                        semantic_bonus += 0.5
        except Exception:
            pass

    # Score calculation
    required_match_count = len(exact_required) + semantic_bonus
    required_score = min(100.0, (required_match_count / max(len(required_set), 1)) * 100)
    preferred_bonus = min(10.0, len(exact_preferred) * 3.0)
    final_score = min(100.0, required_score + preferred_bonus)

    return {
        "matched_skills":    sorted([s.title() for s in exact_required]),
        "missing_skills":    sorted([s.title() for s in missing_required - {s.lower() for s in exact_required}]),
        "preferred_matched": sorted([s.title() for s in exact_preferred]),
        "score":             round(final_score, 1),
    }


def compute_experience_score(candidate_years: int, required_years: int) -> float:
    """Score experience match. Overqualified is capped, underqualified is penalized."""
    if candidate_years >= required_years:
        # Overqualified: perfect score but no extra bonus
        excess = candidate_years - required_years
        if excess > 5:
            return 85.0  # Might be overqualified
        return 100.0
    else:
        deficit = required_years - candidate_years
        penalty = deficit * 15.0
        return max(0.0, 100.0 - penalty)
