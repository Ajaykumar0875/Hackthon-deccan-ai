"use client";
import { useState } from "react";
import { CandidateScore } from "@/lib/api";
import styles from "./CandidateCard.module.css";
import ConversationModal from "./ConversationModal";

interface Props {
  candidate: CandidateScore;
  rank: number;
  offerCount?: number;
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

export default function CandidateCard({ candidate, rank, offerCount = 0 }: Props) {
  const [showModal, setShowModal]   = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [sending, setSending]       = useState(false);

  const handleSendInvite = async () => {
    if (inviteSent || sending) return;
    setSending(true);
    try {
      const res = await fetch("http://localhost:8000/api/email/send-invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidates: [{
            name:        candidate.candidate_name,
            email:       candidate.candidate_id,   // DB candidates use email as ID
            role:        candidate.candidate_title,
            match_score: candidate.match_score,
          }],
          interview_base_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/interview`,
        }),
      });
      const data = await res.json();
      if (data.sent?.length > 0) setInviteSent(true);
      else alert("Failed to send invite. Check email config.");
    } catch {
      alert("Network error sending invite.");
    } finally {
      setSending(false);
    }
  };

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
            {offerCount > 0 && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                marginTop: 6, padding: "2px 8px", borderRadius: 6,
                background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.35)",
                color: "#f59e0b", fontSize: 11, fontWeight: 700,
              }}>
                ✅ Offer Active · {offerCount}
              </span>
            )}
          </div>
          {/* Combined score ring */}
          <div className={styles.scoreRing}>
            <svg width="64" height="64" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4"/>
              <circle
                cx="32" cy="32" r="28"
                fill="none"
                stroke={getCombinedColor(candidate.match_score)}
                strokeWidth="4"
                strokeDasharray={`${(candidate.match_score / 100) * 176} 176`}
                strokeLinecap="round"
                transform="rotate(-90 32 32)"
                style={{ filter: `drop-shadow(0 0 6px ${getCombinedColor(candidate.match_score)})` }}
              />
            </svg>
            <div className={styles.scoreRingLabel}>
              <span className={styles.scoreRingValue} style={{ color: getCombinedColor(candidate.match_score) }}>
                {candidate.match_score.toFixed(0)}
              </span>
              <span className={styles.scoreRingText}>Match</span>
            </div>
          </div>
        </div>



        {/* Score Breakdown */}
        <div className={styles.scores}>
          <ScoreBar label="Match Score" value={candidate.match_score} colorClass="progress-blue" />

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

        {/* CTA buttons */}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>


          {/* Send Invite — only for real DB candidates (email as ID) with match > 40 */}
          {candidate.match_score > 40 && candidate.candidate_id.includes("@") && (
            <button
              onClick={handleSendInvite}
              disabled={inviteSent || sending}
              style={{
                display:"flex", alignItems:"center", gap:6,
                padding:"6px 14px", borderRadius:8, border:"1px solid",
                borderColor: inviteSent ? "#16a34a" : "#16a34a",
                background: inviteSent ? "#052010" : "#16a34a",
                color: inviteSent ? "#4ade80" : "#fff",
                fontWeight:600, fontSize:12, cursor: inviteSent ? "default" : "pointer",
                opacity: sending ? 0.6 : 1, transition:"all 0.2s",
              }}
            >
              {inviteSent ? (
                <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> Invite Sent</>
              ) : sending ? "Sending…" : (
                <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,12 2,6"/></svg> Send Invite</>
              )}
            </button>
          )}
        </div>
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
