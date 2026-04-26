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
    Compute multi-level skill match.
    Each required skill (including compound ones like "React Or Next.Js") is
    expanded into tokens and matched against the candidate's expanded skill set.
    If ANY token from a requirement matches ANY candidate token → counted as matched.
    """
    candidate_expanded = _expand_skills(candidate_skills)

    matched_display:  list[str] = []
    missing_display:  list[str] = []

    for req in required_skills:
        req_tokens = _expand_skills([req])          # e.g. {"react or next.js","react","next.js"}
        if req_tokens & candidate_expanded:          # any overlap → match
            matched_display.append(req.title())
        else:
            # Semantic fallback via TF-IDF char n-gram similarity
            matched_semantically = False
            if candidate_skills:
                try:
                    from sklearn.feature_extraction.text import TfidfVectorizer
                    from sklearn.metrics.pairwise import cosine_similarity as _cos
                    req_tokens_list = [t for t in req_tokens if t not in _NOISE and len(t) > 1]
                    cand_list       = list(candidate_expanded)
                    if req_tokens_list and cand_list:
                        vectorizer  = TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 4))
                        all_terms   = cand_list + req_tokens_list
                        matrix      = vectorizer.fit_transform(all_terms)
                        cand_vecs   = matrix[: len(cand_list)]
                        req_vecs    = matrix[len(cand_list):]
                        sim         = _cos(cand_vecs, req_vecs)
                        if sim.max() > 0.55:
                            matched_semantically = True
                except Exception:
                    pass

            if matched_semantically:
                matched_display.append(req.title())
            else:
                missing_display.append(req.title())

    # Preferred skills
    preferred_expanded = _expand_skills(preferred_skills)
    preferred_matched  = [s.title() for s in (candidate_expanded & preferred_expanded)]

    total    = max(len(required_skills), 1)
    matched  = len(matched_display)
    pref_bon = min(10.0, len(preferred_matched) * 3.0)
    score    = min(100.0, (matched / total) * 100 + pref_bon)

    return {
        "matched_skills":    sorted(matched_display),
        "missing_skills":    sorted(missing_display),
        "preferred_matched": sorted(preferred_matched),
        "score":             round(score, 1),
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
