"use client";
import { useEffect } from "react";
import { CandidateScore } from "@/lib/api";
import styles from "./ConversationModal.module.css";

interface Props {
  candidate: CandidateScore;
  onClose: () => void;
}

function getInterestColor(score: number): string {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#3b82f6";
  if (score >= 40) return "#f59e0b";
  return "#f43f5e";
}

function getInterestLabel(score: number): string {
  if (score >= 80) return "Very Interested";
  if (score >= 60) return "Interested";
  if (score >= 40) return "Neutral";
  return "Not Interested";
}

export default function ConversationModal({ candidate, onClose }: Props) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const interestColor = getInterestColor(candidate.interest_score);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Conversation with ${candidate.candidate_name}`}
      >
        {/* Header */}
        <div className="modal-header">
          <div className={styles.headerInfo}>
            <h3 className={styles.modalTitle}>{candidate.candidate_name}</h3>
            <p className={styles.modalSubtitle}>{candidate.candidate_title}</p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.interestScore} style={{ borderColor: interestColor }}>
              <span className={styles.interestNum} style={{ color: interestColor }}>
                {candidate.interest_score.toFixed(0)}
              </span>
              <span className={styles.interestText}>Interest</span>
            </div>
            <button
              className={`btn btn-secondary btn-sm ${styles.closeBtn}`}
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="modal-body">
          {/* Interest Label */}
          <div className={styles.interestBanner} style={{ background: `${interestColor}15`, borderColor: `${interestColor}30` }}>
            <div className={styles.interestDot} style={{ background: interestColor, boxShadow: `0 0 8px ${interestColor}` }} />
            <span style={{ color: interestColor, fontWeight: 600 }}>{getInterestLabel(candidate.interest_score)}</span>
            <span className={styles.interestSummary}>{candidate.conversation_summary}</span>
          </div>

          {/* Conversation — rendered from stored data in candidate */}
          <div className={styles.conversationContainer}>
            <p className={styles.sectionTitle}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Simulated Outreach Conversation
            </p>
            <div className={styles.chatContainer}>
              {/* Static conversation display — data is in summary from API */}
              <div className={styles.noConvNote}>
                <div className={styles.chatBubbleWrap} style={{ alignSelf: "flex-start" }}>
                  <div className={styles.chatLabel}>
                    <div className={styles.avatarRecruiter}>R</div>
                    <span>Recruiter</span>
                  </div>
                  <div className="chat-bubble-recruiter">
                    <p className={styles.chatText}>
                      Hi {candidate.candidate_name.split(" ")[0]}! I came across your profile and I think you&apos;d be a great fit for a {candidate.candidate_title.includes("Senior") ? "Senior" : "Mid-level"} role we&apos;re hiring for. The position involves{" "}
                      {candidate.matched_skills.slice(0, 2).join(" and ")} — aligns well with your background. Would you be open to a quick chat?
                    </p>
                  </div>
                </div>

                <div className={styles.chatBubbleWrap} style={{ alignSelf: "flex-end" }}>
                  <div className={styles.chatLabel} style={{ justifyContent: "flex-end" }}>
                    <span>{candidate.candidate_name.split(" ")[0]}</span>
                    <div className={styles.avatarCandidate}>{candidate.candidate_name[0]}</div>
                  </div>
                  <div className="chat-bubble-candidate">
                    <p className={styles.chatText}>{candidate.conversation_summary}</p>
                  </div>
                </div>

                <div className={styles.chatBubbleWrap} style={{ alignSelf: "flex-start" }}>
                  <div className={styles.chatLabel}>
                    <div className={styles.avatarRecruiter}>R</div>
                    <span>Recruiter</span>
                  </div>
                  <div className="chat-bubble-recruiter">
                    <p className={styles.chatText}>
                      That&apos;s great! The role is remote-friendly and offers a competitive package. The team is growing fast and there&apos;s real opportunity for impact. Would you be available for a 30-min intro call this week?
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Score Summary */}
          <div className={styles.scoreSummary}>
            <p className={styles.sectionTitle}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              Score Breakdown
            </p>
            <div className={styles.scoreGrid}>
              {[
                { label: "Match Score", value: candidate.match_score, color: "#3b82f6" },
                { label: "Interest Score", value: candidate.interest_score, color: interestColor },
                { label: "Skill Match", value: candidate.skill_match_score, color: "#8b5cf6" },
                { label: "Experience", value: candidate.experience_match_score, color: "#06b6d4" },
                { label: "Role Fit", value: candidate.role_fit_score, color: "#10b981" },
                { label: "Combined", value: candidate.combined_score, color: "#f59e0b" },
              ].map((item) => (
                <div key={item.label} className={styles.scoreItem}>
                  <div className={styles.scoreCircle} style={{ borderColor: item.color }}>
                    <span style={{ color: item.color }}>{item.value.toFixed(0)}</span>
                  </div>
                  <span className={styles.scoreLabel}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className={styles.skillsSection}>
            <div>
              <p className={styles.sectionTitle} style={{ color: "var(--accent-emerald)" }}>✓ Matched Skills</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "0.5rem" }}>
                {candidate.matched_skills.map((s) => <span key={s} className="skill-tag matched">{s}</span>)}
                {candidate.matched_skills.length === 0 && <span className={styles.emptyNote}>None identified</span>}
              </div>
            </div>
            <div>
              <p className={styles.sectionTitle} style={{ color: "var(--accent-rose)" }}>✗ Missing Skills</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "0.5rem" }}>
                {candidate.missing_skills.map((s) => <span key={s} className="skill-tag missing">{s}</span>)}
                {candidate.missing_skills.length === 0 && <span className={styles.emptyNote} style={{ color: "var(--accent-emerald)" }}>All required skills matched!</span>}
              </div>
            </div>
          </div>

          {/* Match Explanation */}
          <div className={styles.explanation}>
            <p className={styles.sectionTitle}>AI Recruiter Analysis</p>
            <p className={styles.explanationText}>{candidate.match_explanation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
