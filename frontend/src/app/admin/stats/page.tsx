"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface Stats {
  total_users: number;
  total_candidates: number;
  total_admins: number;
  candidates_by_role: Record<string, number>;
  latest_registrations: Array<{ name: string; email: string; role: string; created_at: string }>;
}

export default function AdminStatsPage() {
  const router  = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const e = sessionStorage.getItem("user_email") || "";
    const r = sessionStorage.getItem("user_role")  || "";
    if (!e || r !== "admin") { router.replace("/user/home"); return; }
    fetch("http://localhost:8000/api/user/admin/stats")
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  const S = {
    page: { minHeight: "100vh", background: "#000", paddingTop: 80, fontFamily: "'Inter', sans-serif" } as React.CSSProperties,
    container: { maxWidth: 900, margin: "0 auto", padding: "2.5rem 1.5rem" } as React.CSSProperties,
    pageTitle: { fontSize: "1.6rem", fontWeight: 700, color: "#f3f4f6", marginBottom: "0.25rem" } as React.CSSProperties,
    pageSub: { fontSize: "0.9rem", color: "#6b7280", marginBottom: "2rem" } as React.CSSProperties,
    grid3: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem", marginBottom: "1.75rem" } as React.CSSProperties,
    statCard: (accent: string) => ({
      background: "linear-gradient(to bottom, #020204, #191130)",
      border: `1px solid ${accent}33`,
      borderRadius: 12,
      padding: "1.5rem",
      textAlign: "center" as const,
    }),
    statNum: (accent: string) => ({ fontSize: "2.5rem", fontWeight: 800, color: accent, lineHeight: 1 }),
    statLabel: { fontSize: "0.85rem", color: "#9ca3af", marginTop: 8 } as React.CSSProperties,
    card: { background: "linear-gradient(to bottom, #020204, #191130)", border: "1px solid #374151", borderRadius: 12, padding: "1.75rem", marginBottom: "1.5rem" } as React.CSSProperties,
    cardTitle: { fontSize: "1rem", fontWeight: 600, color: "#f3f4f6", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: 8 } as React.CSSProperties,
    barWrap: { marginBottom: "1rem" } as React.CSSProperties,
    barLabel: { display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: "0.85rem", color: "#d1d5db" } as React.CSSProperties,
    barBg: { background: "#1e293b", borderRadius: 4, height: 10, overflow: "hidden" } as React.CSSProperties,
    barFill: (pct: number, color: string) => ({ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.8s ease" }) as React.CSSProperties,
    table: { width: "100%", borderCollapse: "collapse" as const, fontSize: "0.875rem" } as React.CSSProperties,
    th: { textAlign: "left" as const, color: "#6b7280", fontWeight: 500, padding: "0.5rem 0.75rem", borderBottom: "1px solid #1e293b" } as React.CSSProperties,
    td: { padding: "0.75rem", borderBottom: "1px solid #1e293b", color: "#d1d5db" } as React.CSSProperties,
    roleBadge: (role: string) => ({
      display: "inline-block", padding: "2px 10px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 500,
      background: role === "admin" ? "rgba(99,102,241,0.15)" : "rgba(16,185,129,0.12)",
      color: role === "admin" ? "#818cf8" : "#34d399",
      border: `1px solid ${role === "admin" ? "rgba(99,102,241,0.3)" : "rgba(16,185,129,0.25)"}`,
    }) as React.CSSProperties,
  };

  if (loading) return (
    <>
      <Navbar />
      <main style={S.page}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
          <p style={{ color: "#6b7280" }}>Loading statistics…</p>
        </div>
      </main>
    </>
  );

  const total = stats?.total_users || 1;
  const admPct = Math.round(((stats?.total_admins || 0) / total) * 100);
  const cndPct = Math.round(((stats?.total_candidates || 0) / total) * 100);

  return (
    <>
      <Navbar />
      <main style={S.page}>
        <div style={S.container}>
          <h1 style={S.pageTitle}>Platform Statistics</h1>
          <p style={S.pageSub}>Overview of all users and system activity</p>

          {/* ── Stat Cards ─────────────────────────────────────────────── */}
          <div style={S.grid3}>
            <div style={S.statCard("#818cf8")}>
              <p style={S.statNum("#818cf8")}>{stats?.total_users ?? "—"}</p>
              <p style={S.statLabel}>Total Users</p>
            </div>
            <div style={S.statCard("#34d399")}>
              <p style={S.statNum("#34d399")}>{stats?.total_candidates ?? "—"}</p>
              <p style={S.statLabel}>Candidates</p>
            </div>
            <div style={S.statCard("#f59e0b")}>
              <p style={S.statNum("#f59e0b")}>{stats?.total_admins ?? "—"}</p>
              <p style={S.statLabel}>Admins</p>
            </div>
          </div>

          {/* ── User Breakdown ─────────────────────────────────────────── */}
          <div style={S.card}>
            <p style={S.cardTitle}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              User Role Breakdown
            </p>

            <div style={S.barWrap}>
              <div style={S.barLabel}>
                <span>Admins</span>
                <span>{stats?.total_admins ?? 0} ({admPct}%)</span>
              </div>
              <div style={S.barBg}><div style={S.barFill(admPct, "#818cf8")} /></div>
            </div>

            <div style={S.barWrap}>
              <div style={S.barLabel}>
                <span>Candidates</span>
                <span>{stats?.total_candidates ?? 0} ({cndPct}%)</span>
              </div>
              <div style={S.barBg}><div style={S.barFill(cndPct, "#34d399")} /></div>
            </div>
          </div>

          {/* ── Latest Registrations ───────────────────────────────────── */}
          <div style={S.card}>
            <p style={S.cardTitle}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Latest Registrations
            </p>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Name</th>
                  <th style={S.th}>Email</th>
                  <th style={S.th}>Role</th>
                  <th style={S.th}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.latest_registrations || []).map((u, i) => (
                  <tr key={i}>
                    <td style={S.td}>{u.name}</td>
                    <td style={{ ...S.td, color: "#6b7280" }}>{u.email}</td>
                    <td style={S.td}><span style={S.roleBadge(u.role)}>{u.role}</span></td>
                    <td style={{ ...S.td, color: "#6b7280" }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString("en-IN") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
