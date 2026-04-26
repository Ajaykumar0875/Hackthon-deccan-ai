"use client";
import { ShortlistResponse } from "@/lib/api";
import styles from "./ShortlistTable.module.css";

interface Props {
  data: ShortlistResponse;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#3b82f6";
  if (score >= 40) return "#f59e0b";
  return "#f43f5e";
}

function ScoreCell({ value }: { value: number }) {
  const color = getScoreColor(value);
  return (
    <div className={styles.scoreCell} style={{ color }}>
      <span className={styles.scoreCellValue}>{value.toFixed(0)}</span>
      <div
        className={styles.scoreCellBar}
        style={{ background: color, width: `${value}%`, opacity: 0.2 }}
      />
    </div>
  );
}

export default function ShortlistTable({ data }: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Role</span>
          <span className={styles.metaValue}>{data.parsed_jd.role_title}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Candidates Evaluated</span>
          <span className={styles.metaValue}>{data.total_candidates_evaluated}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Shortlisted</span>
          <span className={styles.metaValue}>{data.shortlisted_candidates.length}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Processing Time</span>
          <span className={styles.metaValue}>{data.processing_time_seconds}s</span>
        </div>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Candidate</th>
              <th>Location</th>
              <th>Match ↓</th>
              <th>Key Skills</th>
            </tr>
          </thead>
          <tbody>
            {data.shortlisted_candidates.map((c) => (
              <tr key={c.candidate_id} className={styles.row}>
                <td>
                  <div
                    className={`rank-badge ${
                      c.rank === 1 ? "rank-1" : c.rank === 2 ? "rank-2" : c.rank === 3 ? "rank-3" : "rank-other"
                    }`}
                  >
                    #{c.rank}
                  </div>
                </td>
                <td>
                  <div className={styles.nameCell}>
                    <span className={styles.candidateName}>{c.candidate_name}</span>
                    <span className={styles.candidateTitle}>{c.candidate_title}</span>
                  </div>
                </td>
                <td>
                  <span className={styles.location}>{c.candidate_location}</span>
                </td>
                <td><ScoreCell value={c.match_score} /></td>
                <td>
                  <div className={styles.skillsList}>
                    {c.matched_skills.slice(0, 3).map((s) => (
                      <span key={s} className="skill-tag matched">{s}</span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
