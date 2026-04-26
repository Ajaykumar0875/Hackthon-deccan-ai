"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, SampleJD } from "@/lib/api";
import Navbar from "@/components/Navbar";
import styles from "./page.module.css";

// ── Platform feature cards (adapted from feature4.jsx) ────────────────────────
const PLATFORM_FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    title: "JD Parsing",
    description: "Groq (Llama 3.3 70B) extracts required skills, seniority, and expectations from any raw job description instantly.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
    title: "Semantic Matching",
    description: "Skill overlap + LLM role-fit scoring surfaces the best-aligned candidates from your talent pool.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: "AI Outreach Simulation",
    description: "Simulates realistic recruiter-candidate conversations to score genuine interest level automatically.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: "Ranked Shortlist",
    description: "Combined Score = 60% Match + 40% Interest. Instant, explainable rankings recruiters can act on.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    title: "Email Invitations",
    description: "Send styled interview invitations directly to shortlisted candidates with a single click.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <path d="M16 3.128a4 4 0 0 1 0 7.744"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
        <circle cx="9" cy="7" r="4"/>
      </svg>
    ),
    title: "Admin Control",
    description: "Role-based access for recruiters. Full visibility into candidate pipeline, scores and outreach status.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [jdText, setJdText] = useState("");
  const [topN, setTopN] = useState(5);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState("");
  const [sampleJDs, setSampleJDs] = useState<SampleJD[]>([]);
  const [charCount, setCharCount] = useState(0);
  const [authChecked, setAuthChecked] = useState(false);

  // ── Admin auth guard ─────────────────────────────────────────────────────
  useEffect(() => {
    const role = sessionStorage.getItem("user_role");
    const email = sessionStorage.getItem("user_email");
    if (!email || role !== "admin") {
      router.replace("/user/home");
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  useEffect(() => {
    if (authChecked) {
      api.getSampleJDs().then((r) => setSampleJDs(r.sample_jds)).catch(() => {});
    }
  }, [authChecked]);

  const handleJDChange = (value: string) => {
    setJdText(value);
    setCharCount(value.length);
    if (error) setError("");
  };

  const handleSampleJD = (jd: SampleJD) => {
    setJdText(jd.text);
    setCharCount(jd.text.length);
    setError("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/auth/parse-jd-file`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to parse file");
      handleJDChange(data.text);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to read file");
    } finally {
      setUploadLoading(false);
      // reset so same file can be re-uploaded
      e.target.value = "";
    }
  };

  const handleSubmit = async () => {
    if (jdText.trim().length < 50) {
      setError("Please enter a job description with at least 50 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      sessionStorage.setItem("jd_text", jdText);
      sessionStorage.setItem("top_n", String(topN));
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  // Block render until auth verified
  if (!authChecked) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#000" }}>
        <div className="auth-spinner" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className={styles.main}>

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section className={styles.hero}>
          <div className="container">
            <div className={styles.heroContent}>
              <button className={styles.heroBadgeBtn}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                AI-Powered Talent Intelligence
              </button>

              <h1 className={styles.heroTitle}>
                Find Your Perfect<br/>
                <span className={styles.heroGradient}>Candidates, Instantly</span>
              </h1>

              <p className={styles.heroSubtitle}>
                Paste a job description and our AI agent discovers matching candidates,
                simulates outreach conversations, and delivers a ranked shortlist —
                scored on both match quality and genuine interest.
              </p>

              <div className={styles.featurePills}>
                {["JD Parsing", "Semantic Matching", "AI Outreach", "Explainable Rankings"].map((f) => (
                  <span key={f} className={styles.pill}>
                    <span className={styles.pillDot} />
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── JD Input ───────────────────────────────────────────────────── */}
        <section className={styles.inputSection}>
          <div className="container">
            <div className={styles.inputCard}>
              {sampleJDs.length > 0 && (
                <div className={styles.sampleSection}>
                  <p className={styles.sampleLabel}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    Try a sample JD:
                  </p>
                  <div className={styles.sampleButtons}>
                    {sampleJDs.map((jd) => (
                      <button
                        key={jd.title}
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleSampleJD(jd)}
                        id={`sample-jd-${jd.title.replace(/\s+/g, "-").toLowerCase()}`}
                      >
                        {jd.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.textareaWrapper}>
                <div className={styles.textareaHeader}>
                  <label htmlFor="jd-input" className={styles.textareaLabel}>Job Description</label>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    {/* ── Upload JD File button ── */}
                    <label htmlFor="jd-file-upload" style={{
                      display:"inline-flex", alignItems:"center", gap:6,
                      padding:"5px 12px", borderRadius:6, cursor: uploadLoading ? "not-allowed" : "pointer",
                      background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.3)",
                      color:"var(--accent-blue-light)", fontSize:12, fontWeight:600,
                      opacity: uploadLoading ? 0.6 : 1, transition:"all 0.2s",
                    }}>
                      {uploadLoading ? (
                        <><div className="spinner" style={{ width:12, height:12, borderWidth:2 }}/> Parsing…</>
                      ) : (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                          </svg>
                          Upload JD (PDF/DOCX/TXT)
                        </>
                      )}
                      <input
                        id="jd-file-upload"
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileUpload}
                        disabled={uploadLoading}
                        style={{ display:"none" }}
                      />
                    </label>
                    <span className={styles.charCount} style={{ color: charCount < 50 ? "var(--accent-rose)" : "var(--text-muted)" }}>
                      {charCount} chars {charCount < 50 ? `(need ${50 - charCount} more)` : "✓"}
                    </span>
                  </div>
                </div>
                <textarea
                  id="jd-input"
                  className="textarea-primary"
                  rows={12}
                  placeholder={`Paste your full job description here...\n\nInclude role title, required skills, experience, responsibilities, and any other relevant details.`}
                  value={jdText}
                  onChange={(e) => handleJDChange(e.target.value)}
                />
              </div>

              <div className={styles.controls}>
                <div className={styles.topNControl}>
                  <label htmlFor="top-n" className={styles.topNLabel}>Shortlist size</label>
                  <div className={styles.topNButtons}>
                    {[3, 5, 8, 10].map((n) => (
                      <button
                        key={n}
                        id={`top-n-${n}`}
                        className={`btn btn-sm ${topN === n ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => setTopN(n)}
                      >
                        Top {n}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  id="generate-shortlist-btn"
                  className="btn btn-primary btn-lg"
                  onClick={handleSubmit}
                  disabled={loading || jdText.length < 50}
                >
                  {loading ? (
                    <>
                      <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                      </svg>
                      Generate Shortlist
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className={styles.errorBanner}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Platform Features (feature4 style) ─────────────────────────── */}
        <section style={{ padding: "5rem 0", background: "#000" }}>
          <div className="container">
            <div className={styles.featuresSectionHeader}>
              <button className={styles.featuresBadgeBtn}>Platform Features</button>
              <h2 className={styles.featuresTitle}>
                AI Agents That Automate<br/>and Accelerate Hiring.
              </h2>
              <p className={styles.featuresSub}>
                Streamline recruitment, boost match quality, and scale effortlessly — all powered by intelligent automation.
              </p>
            </div>
            <div className={styles.featuresGrid}>
              {PLATFORM_FEATURES.map((f, i) => (
                <div key={i} className={styles.featureCard}>
                  <div className={styles.featureIconWrap}>{f.icon}</div>
                  <p className={styles.featureCardTitle}>{f.title}</p>
                  <p className={styles.featureCardDesc}>{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <footer style={{ background: "#000", color: "#6b7280", fontSize: 13, padding: "48px 48px 32px", borderTop: "1px solid #1e293b" }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 32, maxWidth: 1100, margin: "0 auto" }}>
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, background: "#6366f1", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 44 44" fill="none">
                    <path d="M22 4L38 13V31L22 40L6 31V13L22 4Z" stroke="white" strokeWidth="3" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 15 }}>KizunaHire</span>
              </div>
              <p style={{ fontSize: 12, maxWidth: 260, lineHeight: 1.7, color: "#475569" }}>
                AI-powered talent scouting — connecting the right people with the right roles.
              </p>
              {/* Social Icons */}
              <div style={{ display: "flex", gap: 14, marginTop: 20 }}>
                <a href="https://www.linkedin.com/in/ajaykumar-8b2ab4258/" target="_blank" rel="noreferrer" style={{ color: "#475569", textDecoration: "none" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
                <a href="https://github.com/Ajaykumar0875" target="_blank" rel="noreferrer" style={{ color: "#475569", textDecoration: "none" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                    <path d="M9 18c-4.51 2-5-2-7-2"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com/___aj.ai__/" target="_blank" rel="noreferrer" style={{ color: "#475569", textDecoration: "none" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Links */}
            <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
              <div>
                <p style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Platform</p>
                <a href="#" style={{ display: "block", color: "#475569", textDecoration: "none", marginBottom: 8, fontSize: 13 }}>Admin Dashboard</a>
                <a href="#" style={{ display: "block", color: "#475569", textDecoration: "none", marginBottom: 8, fontSize: 13 }}>Candidate Pool</a>
                <a href="#" style={{ display: "block", color: "#475569", textDecoration: "none", marginBottom: 8, fontSize: 13 }}>AI Shortlist</a>
              </div>
              <div>
                <p style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Legal</p>
                <a href="#" style={{ display: "block", color: "#475569", textDecoration: "none", marginBottom: 8, fontSize: 13 }}>Privacy Policy</a>
                <a href="#" style={{ display: "block", color: "#475569", textDecoration: "none", marginBottom: 8, fontSize: 13 }}>Terms of Use</a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <p style={{ textAlign: "center", borderTop: "1px solid #1e293b", paddingTop: 20, marginTop: 32, fontSize: 12 }}>
            © 2026 KizunaHire. Built by{" "}
            <a href="https://www.linkedin.com/in/ajaykumar-8b2ab4258/" target="_blank" rel="noreferrer" style={{ color: "#818cf8" }}>
              Ajay Kumar
            </a>
            . All rights reserved.
          </p>
        </footer>

      </main>
    </>
  );
}
