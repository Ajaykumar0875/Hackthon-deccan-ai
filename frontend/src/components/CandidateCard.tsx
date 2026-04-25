"use client";
import { useState } from "react";
import { CandidateScore } from "@/lib/api";
import styles from "./CandidateCard.module.css";
import ConversationModal from "./ConversationModal";

interface Props {
  candidate: CandidateScore;
  rank: number;
}

function ScoreBar({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass: string;
}) {
  return (
    <div className={styles.scoreBarRow}>
      <div className={styles.scoreBarLabel}>
        <span>{label}</span>
        <span className={styles.scoreBarValue}>{value.toFixed(0)}</span>
      </div>
      <div className="progress-bar">
        <div
          className={`progress-fill ${colorClass}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function getRankClass(rank: number) {
  if (rank === 1) return "rank-1";
  if (rank === 2) return "rank-2";
  if (rank === 3) return "rank-3";
  return "rank-other";
}

function getInterestLabel(score: number): { label: string; class: string } {
  if (score >= 80) return { label: "Very Interested", class: "badge-emerald" };
  if (score >= 60) return { label: "Interested", class: "badge-blue" };
  if (score >= 40) return { label: "Neutral", class: "badge-amber" };
  return { label: "Not Interested", class: "badge-rose" };
}

function getCombinedColor(score: number): string {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#3b82f6";
  if (score >= 40) return "#f59e0b";
  return "#f43f5e";
}

export default function CandidateCard({ candidate, rank }: Props) {
  const [showModal, setShowModal] = useState(false);
  const interestMeta = getInterestLabel(candidate.interest_score);

  return (
    <>
      <div className={`card ${styles.card} animate-fade-in-up`}>
        {/* Header */}
        <div className={styles.header}>
          <div className={`rank-badge ${getRankClass(rank)}`}>#{rank}</div>
          <div className={styles.candidateInfo}>
            <h3 className={styles.name}>{candidate.candidate_name}</h3>
            <p className={styles.title}>{candidate.candidate_title}</p>
            <span className={styles.location}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {candidate.candidate_location}
            </span>
          </div>
          {/* Combined score ring */}
          <div className={styles.scoreRing}>
            <svg width="64" height="64" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4"/>
              <circle
                cx="32" cy="32" r="28"
                fill="none"
                stroke={getCombinedColor(candidate.combined_score)}
                strokeWidth="4"
                strokeDasharray={`${(candidate.combined_score / 100) * 176} 176`}
                strokeLinecap="round"
                transform="rotate(-90 32 32)"
                style={{ filter: `drop-shadow(0 0 6px ${getCombinedColor(candidate.combined_score)})` }}
              />
            </svg>
            <div className={styles.scoreRingLabel}>
              <span className={styles.scoreRingValue} style={{ color: getCombinedColor(candidate.combined_score) }}>
                {candidate.combined_score.toFixed(0)}
              </span>
              <span className={styles.scoreRingText}>Combined</span>
            </div>
          </div>
        </div>

        {/* Interest Badge */}
        <div className={styles.interestRow}>
          <span className={`badge ${interestMeta.class}`}>{interestMeta.label}</span>
          <span className={styles.conversationSummary}>{candidate.conversation_summary}</span>
        </div>

        {/* Score Breakdown */}
        <div className={styles.scores}>
          <ScoreBar label="Match Score" value={candidate.match_score} colorClass="progress-blue" />
          <ScoreBar label="Interest Score" value={candidate.interest_score} colorClass="progress-purple" />
          <div className={styles.subScores}>
            <div className={styles.subScore}>
              <span className={styles.subScoreLabel}>Skill Match</span>
              <span className={styles.subScoreValue}>{candidate.skill_match_score.toFixed(0)}%</span>
            </div>
            <div className={styles.subScore}>
              <span className={styles.subScoreLabel}>Experience</span>
              <span className={styles.subScoreValue}>{candidate.experience_match_score.toFixed(0)}%</span>
            </div>
            <div className={styles.subScore}>
              <span className={styles.subScoreLabel}>Role Fit</span>
              <span className={styles.subScoreValue}>{candidate.role_fit_score.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className={styles.skills}>
          <p className={styles.skillsHeader}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            Matched Skills
          </p>
          <div className={styles.skillTags}>
            {candidate.matched_skills.slice(0, 6).map((s) => (
              <span key={s} className="skill-tag matched">{s}</span>
            ))}
            {candidate.missing_skills.slice(0, 3).map((s) => (
              <span key={s} className="skill-tag missing">✗ {s}</span>
            ))}
          </div>
        </div>

        {/* Explanation */}
        <p className={styles.explanation}>{candidate.match_explanation}</p>

        {/* CTA */}
        <button
          className={`btn btn-secondary btn-sm ${styles.viewBtn}`}
          onClick={() => setShowModal(true)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          View Conversation
        </button>
      </div>

      {showModal && (
        <ConversationModal
          candidate={candidate}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
