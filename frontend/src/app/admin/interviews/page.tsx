"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

const API = "http://localhost:8000";

interface InterviewResult {
  candidate_email:  string;
  candidate_name:   string;
  role:             string;
  match_score:      number;
  interest_score:   number;
  technical_score:  number;
  summary:          string;
  recommendation:   string;
  key_strengths:    string[];
  concerns:         string[];
  status:           "pending" | "approved" | "declined";
  completed_at:     string;
}

function ScorePill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value.toFixed(0)}</div>
      <div style={{ fontSize: 10, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string; label: string }> = {
    pending:  { bg: "#1a1200", color: "#fbbf24", label: "⏳ Pending" },
    approved: { bg: "#052010", color: "#4ade80", label: "✅ Approved" },
    declined: { bg: "#1a0505", color: "#f87171", label: "✗ Declined" },
  };
  const c = cfg[status] || cfg.pending;
  return (
    <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.color}40`, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>
      {c.label}
    </span>
  );
}

function RecBadge({ rec }: { rec: string }) {
  const colors: Record<string, string> = { "Strong Yes": "#16a34a", "Yes": "#22c55e", "Maybe": "#f59e0b", "No": "#ef4444" };
  const color = colors[rec] || "#6b7280";
  return (
    <span style={{ background: `${color}18`, color, border: `1px solid ${color}40`, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
      {rec}
    </span>
  );
}

export default function AdminInterviewsPage() {
  const router = useRouter();
  const [results,  setResults]  = useState<InterviewResult[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [deciding, setDeciding] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const email = sessionStorage.getItem("user_email") || "";
    const role  = sessionStorage.getItem("user_role")  || "";
    if (!email || role !== "admin") { router.replace("/signin"); return; }
    fetchResults();
  }, [router]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/interview/results`);
      const data = await res.json();
      setResults(data.results || []);
    } catch { setResults([]); }
    finally   { setLoading(false); }
  };

  const makeDecision = async (email: string, decision: "approved" | "declined") => {
    setDeciding(email + decision);
    try {
      await fetch(`${API}/api/interview/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate_email: email, decision }),
      });
      setResults(prev => prev.map(r => r.candidate_email === email ? { ...r, status: decision } : r));
    } catch { alert("Failed to update decision."); }
    finally   { setDeciding(null); }
  };

  const fmt = (iso: string) => {
    try { return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
    catch { return iso; }
  };

  const S = {
    page:    { minHeight: "100vh", background: "#000", paddingTop: 80, fontFamily: "'Inter',sans-serif" } as React.CSSProperties,
    wrap:    { maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem" } as React.CSSProperties,
    hdr:     { marginBottom: "2rem" } as React.CSSProperties,
    title:   { fontSize: "1.6rem", fontWeight: 800, color: "#fff", margin: 0 } as React.CSSProperties,
    sub:     { fontSize: "0.875rem", color: "#52525b", marginTop: 4 } as React.CSSProperties,
    card:    { background: "#0a0a0a", border: "1px solid #1c1c1c", borderRadius: 14, marginBottom: 14, overflow: "hidden", transition: "border-color 0.2s" } as React.CSSProperties,
    cardHdr: { padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" } as React.CSSProperties,
    avatar:  { width: 42, height: 42, borderRadius: "50%", background: "#052010", border: "1.5px solid #16a34a", display: "flex", alignItems: "center", justifyContent: "center", color: "#4ade80", fontWeight: 800, fontSize: 16, flexShrink: 0 } as React.CSSProperties,
    scores:  { display: "flex", gap: 20, padding: "12px 20px", borderTop: "1px solid #141414", background: "#060606" } as React.CSSProperties,
    body:    { padding: "16px 20px", borderTop: "1px solid #141414" } as React.CSSProperties,
    summary: { fontSize: 13, color: "#a1a1aa", lineHeight: 1.7, marginBottom: 12 } as React.CSSProperties,
    section: { fontSize: 12, color: "#52525b", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.5px", marginBottom: 6, marginTop: 12 },
    tag:     (color: string): React.CSSProperties => ({ display: "inline-block", background: `${color}18`, color, border: `1px solid ${color}30`, borderRadius: 6, padding: "2px 8px", fontSize: 11, margin: "2px 3px 2px 0" }),
    actions: { display: "flex", gap: 8, padding: "14px 20px", borderTop: "1px solid #141414" } as React.CSSProperties,
    btnApprove: { flex: 1, padding: "9px", background: "#052010", border: "1px solid #16a34a", color: "#4ade80", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" } as React.CSSProperties,
    btnDecline: { flex: 1, padding: "9px", background: "#120505", border: "1px solid #7f1d1d", color: "#f87171", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" } as React.CSSProperties,
    empty:   { textAlign: "center" as const, padding: "60px 20px", color: "#3f3f46" },
  };

  return (
    <>
      <Navbar />
      <main style={S.page}>
        <div style={S.wrap}>
          <div style={S.hdr}>
            <h1 style={S.title}>Interview Results</h1>
            <p style={S.sub}>{results.length} candidate{results.length !== 1 ? "s" : ""} completed the AI interview</p>
          </div>

          {loading ? (
            <div style={S.empty}>Loading results…</div>
          ) : results.length === 0 ? (
            <div style={S.empty}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
              <p>No interview results yet.</p>
              <p style={{ fontSize: 13, color: "#27272a" }}>Results appear here once candidates complete the AI interview.</p>
            </div>
          ) : results.map(r => (
            <div key={r.candidate_email} style={{ ...S.card, borderColor: expanded === r.candidate_email ? "#16a34a40" : "#1c1c1c" }}>
              {/* Card header */}
              <div style={S.cardHdr} onClick={() => setExpanded(e => e === r.candidate_email ? null : r.candidate_email)}>
                <div style={S.avatar}>{(r.candidate_name || "?").charAt(0).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{r.candidate_name}</span>
                    <RecBadge rec={r.recommendation} />
                    <StatusBadge status={r.status} />
                  </div>
                  <div style={{ color: "#52525b", fontSize: 12, marginTop: 2 }}>
                    {r.role} · {r.candidate_email} · {fmt(r.completed_at)}
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2"
                  style={{ transform: expanded === r.candidate_email ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>

              {/* Score row */}
              <div style={S.scores}>
                <ScorePill label="Match"    value={r.match_score}    color="#3b82f6" />
                <ScorePill label="Interest" value={r.interest_score} color="#a855f7" />
                <ScorePill label="Technical" value={r.technical_score} color="#f59e0b" />
              </div>

              {/* Expanded details */}
              {expanded === r.candidate_email && (
                <div style={S.body}>
                  <p style={S.summary}>{r.summary}</p>

                  {r.key_strengths?.length > 0 && (
                    <>
                      <p style={S.section}>✅ Key Strengths</p>
                      <div>{r.key_strengths.map((s, i) => <span key={i} style={S.tag("#16a34a")}>{s}</span>)}</div>
                    </>
                  )}
                  {r.concerns?.length > 0 && (
                    <>
                      <p style={S.section}>⚠️ Concerns</p>
                      <div>{r.concerns.map((c, i) => <span key={i} style={S.tag("#f59e0b")}>{c}</span>)}</div>
                    </>
                  )}
                </div>
              )}

              {/* Approve / Decline */}
              {r.status === "pending" && (
                <div style={S.actions}>
                  <button
                    style={S.btnApprove}
                    disabled={deciding !== null}
                    onClick={() => makeDecision(r.candidate_email, "approved")}
                  >
                    {deciding === r.candidate_email + "approved" ? "Approving…" : "✅ Approve"}
                  </button>
                  <button
                    style={S.btnDecline}
                    disabled={deciding !== null}
                    onClick={() => makeDecision(r.candidate_email, "declined")}
                  >
                    {deciding === r.candidate_email + "declined" ? "Declining…" : "✗ Decline"}
                  </button>
                </div>
              )}
              {r.status !== "pending" && (
                <div style={{ padding: "10px 20px", borderTop: "1px solid #141414", fontSize: 12, color: r.status === "approved" ? "#4ade80" : "#f87171" }}>
                  {r.status === "approved" ? "✅ You approved this candidate" : "✗ You declined this candidate"}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
