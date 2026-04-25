"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, ShortlistResponse, CandidateScore } from "@/lib/api";
import Navbar from "@/components/Navbar";
import CandidateCard from "@/components/CandidateCard";
import ShortlistTable from "@/components/ShortlistTable";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import styles from "./dashboard.module.css";

type ViewMode = "cards" | "table";

const STEPS = [
  { id: 1, label: "Parsing JD", icon: "📄", desc: "Extracting requirements..." },
  { id: 2, label: "Matching Candidates", icon: "🔍", desc: "Scoring 25 profiles..." },
  { id: 3, label: "AI Role Evaluation", icon: "🧠", desc: "Groq LLM evaluating fit..." },
  { id: 4, label: "Simulating Outreach", icon: "💬", desc: "Running conversations..." },
  { id: 5, label: "Ranking Results", icon: "🏆", desc: "Computing final scores..." },
];

function LoadingScreen({ currentStep }: { currentStep: number }) {
  return (
    <div className={styles.loadingScreen}>
      <div className={styles.loadingInner}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinnerRing} />
          <div className={styles.spinnerDot} />
        </div>
        <h2 className={styles.loadingTitle}>Running AI Pipeline</h2>
        <p className={styles.loadingSubtitle}>
          This takes 15–45 seconds depending on shortlist size
        </p>

        <div className={styles.steps}>
          {STEPS.map((step) => {
            const isDone = currentStep > step.id;
            const isActive = currentStep === step.id;
            return (
              <div
                key={step.id}
                className={`${styles.step} ${isDone ? styles.stepDone : ""} ${isActive ? styles.stepActive : ""}`}
              >
                <div className={styles.stepIcon}>{isDone ? "✓" : step.icon}</div>
                <div className={styles.stepInfo}>
                  <span className={styles.stepLabel}>{step.label}</span>
                  {isActive && <span className={styles.stepDesc}>{step.desc}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function JDSummaryCard({ jd }: { jd: ShortlistResponse["parsed_jd"] }) {
  return (
    <div className={`card ${styles.jdCard}`}>
      <div className={styles.jdHeader}>
        <div className={styles.jdMeta}>
          <span className={`badge badge-blue`}>{jd.experience_level}</span>
          <span className={`badge badge-purple`}>{jd.industry}</span>
          {jd.remote_ok && <span className={`badge badge-emerald`}>Remote OK</span>}
        </div>
        <div>
          <h2 className={styles.jdTitle}>{jd.role_title}</h2>
          <p className={styles.jdSummary}>{jd.key_requirements_summary}</p>
        </div>
      </div>
      <div className={styles.jdDetails}>
        <div className={styles.jdDetailItem}>
          <span className={styles.jdDetailLabel}>Experience</span>
          <span className={styles.jdDetailValue}>{jd.required_experience_years}+ years</span>
        </div>
        {jd.salary_range_usd && (
          <div className={styles.jdDetailItem}>
            <span className={styles.jdDetailLabel}>Salary</span>
            <span className={styles.jdDetailValue}>{jd.salary_range_usd}</span>
          </div>
        )}
        {jd.location_preference && (
          <div className={styles.jdDetailItem}>
            <span className={styles.jdDetailLabel}>Location</span>
            <span className={styles.jdDetailValue}>{jd.location_preference}</span>
          </div>
        )}
        <div className={styles.jdDetailItem}>
          <span className={styles.jdDetailLabel}>Required Skills</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginTop: "0.3rem" }}>
            {jd.required_skills.map((s) => <span key={s} className="skill-tag">{s}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

const CUSTOM_TOOLTIP = ({ active, payload, label }: Record<string, unknown>) => {
  if (active && Array.isArray(payload) && payload.length) {
    return (
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
        borderRadius: 8, padding: "0.6rem 0.9rem", fontSize: "0.8rem"
      }}>
        <p style={{ color: "var(--text-muted)", marginBottom: 4 }}>{String(label)}</p>
        {(payload as Array<{name: string; value: unknown; color: string}>).map((p) => (
          <p key={p.name} style={{ color: p.color, fontWeight: 600 }}>
            {p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : String(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<ShortlistResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  const runPipeline = useCallback(async (jdText: string, topN: number) => {
    try {
      // Simulate step progression for UX
      const stepInterval = setInterval(() => {
        setCurrentStep((s) => Math.min(s + 1, 5));
      }, 6000);

      const result = await api.generateShortlist(jdText, topN);
      clearInterval(stepInterval);
      setCurrentStep(5);
      setTimeout(() => {
        setData(result);
        setLoading(false);
      }, 500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Pipeline failed. Please check backend connection.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const jdText = sessionStorage.getItem("jd_text");
    const topN = parseInt(sessionStorage.getItem("top_n") || "5", 10);
    if (jdText) {
      runPipeline(jdText, topN);
    } else {
      setLoading(false); // no data — show empty state
    }
  }, [router, runPipeline]);

  if (loading) return (
    <>
      <Navbar />
      <LoadingScreen currentStep={currentStep} />
    </>
  );

  if (error) return (
    <>
      <Navbar />
      <div className={styles.errorScreen}>
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2>Pipeline Error</h2>
          <p>{error}</p>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 8 }}>
            Make sure the AI backend is running at <code>http://localhost:8000</code> with the <code>/api/shortlist</code> endpoint.
          </p>
          <button className="btn btn-primary" onClick={() => router.push("/")}>← Back to Home</button>
        </div>
      </div>
    </>
  );

  // No JD submitted — show empty state
  if (!data) return (
    <>
      <Navbar />
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 520 }}>
          <div style={{ width: 80, height: 80, background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 24px" }}>📋</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 10px", color: "var(--text-primary)" }}>No Shortlist Yet</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.7, margin: "0 0 28px" }}>
            Submit a Job Description from the home page to run the AI pipeline and see shortlisted candidates here.
          </p>
          <button className="btn btn-primary" onClick={() => router.push("/")}>
            ← Go to Home & Submit JD
          </button>
        </div>
      </div>
    </>
  );

  const { shortlisted_candidates: candidates, parsed_jd } = data;

  // Chart data
  const barData = candidates.map((c: CandidateScore) => ({
    name: c.candidate_name.split(" ")[0],
    Match: parseFloat(c.match_score.toFixed(1)),
    Interest: parseFloat(c.interest_score.toFixed(1)),
    Combined: parseFloat(c.combined_score.toFixed(1)),
  }));

  const radarData = candidates[0]
    ? [
        { subject: "Skill Match", value: candidates[0].skill_match_score },
        { subject: "Experience", value: candidates[0].experience_match_score },
        { subject: "Role Fit", value: candidates[0].role_fit_score },
        { subject: "Interest", value: candidates[0].interest_score },
        { subject: "Combined", value: candidates[0].combined_score },
      ]
    : [];

  const BAR_COLORS = ["#3b82f6", "#8b5cf6", "#10b981"];

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          {/* Header */}
          <div className={`${styles.pageHeader} animate-fade-in-up`}>
            <div>
              <button className={`btn btn-secondary btn-sm ${styles.backBtn}`} onClick={() => router.push("/")}>
                ← New Search
              </button>
              <h1 className={styles.pageTitle}>Shortlist Results</h1>
              <p className={styles.pageSubtitle}>
                Evaluated <strong>{data.total_candidates_evaluated}</strong> candidates ·{" "}
                Shortlisted <strong>{candidates.length}</strong> ·{" "}
                Completed in <strong>{data.processing_time_seconds}s</strong>
              </p>
            </div>
            <div className={styles.viewToggle}>
              <button
                id="view-cards"
                className={`btn btn-sm ${viewMode === "cards" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setViewMode("cards")}
              >
                Cards
              </button>
              <button
                id="view-table"
                className={`btn btn-sm ${viewMode === "table" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setViewMode("table")}
              >
                Table
              </button>
            </div>
          </div>

          {/* JD Summary */}
          <div className="animate-fade-in-up delay-100">
            <JDSummaryCard jd={parsed_jd} />
          </div>

          {/* Charts */}
          <div className={`grid-2 animate-fade-in-up delay-200`} style={{ marginBottom: "2rem" }}>
            {/* Bar Chart */}
            <div className="card">
              <h3 className={styles.chartTitle}>Score Comparison</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CUSTOM_TOOLTIP />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  {["Match", "Interest", "Combined"].map((key, i) => (
                    <Bar key={key} dataKey={key} fill={BAR_COLORS[i]} radius={[4, 4, 0, 0]} maxBarSize={20} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
              <div className={styles.chartLegend}>
                {["Match", "Interest", "Combined"].map((k, i) => (
                  <div key={k} className={styles.legendItem}>
                    <div className={styles.legendDot} style={{ background: BAR_COLORS[i] }} />
                    <span>{k}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar Chart - top candidate */}
            <div className="card">
              <h3 className={styles.chartTitle}>
                Top Candidate Profile —{" "}
                <span style={{ color: "var(--accent-blue-light)" }}>
                  {candidates[0]?.candidate_name}
                </span>
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="rgba(255,255,255,0.07)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#6b7280", fontSize: 10 }} />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Results */}
          <div className={`animate-fade-in-up delay-300`}>
            <h2 className={styles.resultsTitle}>
              🏆 Ranked Shortlist
              <span className={styles.resultsBadge}>{candidates.length} candidates</span>
            </h2>

            {viewMode === "cards" ? (
              <div className={`grid-3`}>
                {candidates.map((c: CandidateScore) => (
                  <CandidateCard key={c.candidate_id} candidate={c} rank={c.rank} />
                ))}
              </div>
            ) : (
              <ShortlistTable data={data} />
            )}
          </div>

          {/* Scoring Methodology */}
          <div className={`card ${styles.methodologyCard} animate-fade-in-up`}>
            <h3 className={styles.methodologyTitle}>📊 Scoring Methodology</h3>
            <div className={styles.methodologyGrid}>
              <div className={styles.methodologyItem}>
                <span className={styles.methodologyWeight} style={{ color: "#3b82f6" }}>40%</span>
                <span className={styles.methodologyLabel}>Skill Match</span>
                <span className={styles.methodologyDesc}>TF-IDF cosine similarity on required skills</span>
              </div>
              <div className={styles.methodologyItem}>
                <span className={styles.methodologyWeight} style={{ color: "#06b6d4" }}>20%</span>
                <span className={styles.methodologyLabel}>Experience</span>
                <span className={styles.methodologyDesc}>Years vs requirement, penalizing deficit</span>
              </div>
              <div className={styles.methodologyItem}>
                <span className={styles.methodologyWeight} style={{ color: "#8b5cf6" }}>40%</span>
                <span className={styles.methodologyLabel}>Role Fit</span>
                <span className={styles.methodologyDesc}>Groq LLM holistic evaluation</span>
              </div>
              <div className={styles.methodologyItem}>
                <span className={styles.methodologyWeight} style={{ color: "#10b981" }}>+40%</span>
                <span className={styles.methodologyLabel}>Interest Score</span>
                <span className={styles.methodologyDesc}>Simulated conversation sentiment</span>
              </div>
            </div>
            <p className={styles.methodologyFormula}>
              <strong>Match Score</strong> = 0.4 × Skill + 0.2 × Experience + 0.4 × RoleFit &nbsp;|&nbsp;
              <strong>Combined</strong> = 0.6 × Match + 0.4 × Interest
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
