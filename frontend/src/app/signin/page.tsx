"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [tab,      setTab]      = useState<"user" | "admin">("user");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap');
      .si-input {
        background: transparent !important; border: none !important; outline: none !important;
        color: #fff !important; -webkit-text-fill-color: #fff !important;
        font-size: 14px; flex: 1; font-family: inherit; width: 100%;
      }
      .si-input::placeholder { color: rgba(255,255,255,0.25) !important; }
    `;
    document.head.appendChild(el);
    return () => { document.head.removeChild(el); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res  = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");
      sessionStorage.setItem("user_email", data.email);
      sessionStorage.setItem("user_role",  data.role);
      sessionStorage.setItem("user_name",  data.name);
      if (data.token) sessionStorage.setItem("auth_token", data.token);
      if (data.role === "admin") window.location.href = "/";
      else window.location.href = "/user/dashboard";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally { setLoading(false); }
  };

  const isAdmin = tab === "admin";

  return (
    /* Full page — black bg, center everything */
    <div style={{
      minHeight: "100vh", background: "#000",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Geist', sans-serif", padding: 24,
    }}>
      {/* Green glow blobs */}
      <div style={{ position:"fixed", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle, rgba(22,163,74,0.10) 0%, transparent 70%)", top:-200, left:-200, pointerEvents:"none" }}/>
      <div style={{ position:"fixed", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(22,163,74,0.07) 0%, transparent 70%)", bottom:-150, right:-150, pointerEvents:"none" }}/>

      {/* ── Two separate green-bordered boxes with gap ── */}
      <div style={{
        display: "flex", width: "100%", maxWidth: 920,
        gap: 24, alignItems: "center", justifyContent: "center",
        position: "relative", zIndex: 1,
      }}>

        {/* ── LEFT PANEL ── */}
        <div style={{
          width: 340, flexShrink: 0,
          background: "#050505",
          border: "1.5px solid #16a34a",
          borderRadius: 20,
          boxShadow: "0 0 40px rgba(22,163,74,0.12), 0 16px 48px rgba(0,0,0,0.8)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "40px 28px",
          alignSelf: "stretch",
        }}>
          {/* Logo */}
          <div style={{ width:68, height:68, background:"#052010", border:"2px solid #16a34a", borderRadius:18, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 40px rgba(22,163,74,0.3)", marginBottom:20 }}>
            <svg width="34" height="34" viewBox="0 0 44 44" fill="none">
              <path d="M22 4L38 13V31L22 40L6 31V13L22 4Z" stroke="#4ade80" strokeWidth="2.5" strokeLinejoin="round"/>
              <circle cx="22" cy="22" r="6" fill="#4ade80"/>
            </svg>
          </div>

          <h1 style={{ color:"#fff", fontSize:22, fontWeight:800, margin:"0 0 8px", textAlign:"center" }}>KizunaHire</h1>
          <p style={{ color:"#52525b", textAlign:"center", lineHeight:1.7, fontSize:12, margin:"0 0 32px", maxWidth:240 }}>
            AI-powered talent matching, resume parsing, and interview simulation.
          </p>

          {/* Feature grid — green bordered boxes */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, width:"100%" }}>
            {[
              { icon:"⚡", label:"AI Matching" },
              { icon:"📄", label:"Resume Parsing" },
              { icon:"🤖", label:"AI Interview" },
              { icon:"📊", label:"Smart Ranking" },
            ].map(f => (
              <div key={f.label} style={{
                background: "#0a0a0a", border: "1px solid #16a34a",
                borderRadius: 10, padding: "14px 8px", textAlign: "center",
                boxShadow: "0 0 10px rgba(22,163,74,0.07)",
              }}>
                <div style={{ fontSize:18, marginBottom:5 }}>{f.icon}</div>
                <p style={{ color:"#71717a", fontSize:11, margin:0, fontWeight:500 }}>{f.label}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display:"flex", gap:24, marginTop:28, paddingTop:24, borderTop:"1px solid #111", width:"100%", justifyContent:"center" }}>
            {[["99%","Response Rate"],["24h","Avg. Decision"],["500+","Companies"]].map(([v,l]) => (
              <div key={l} style={{ textAlign:"center" }}>
                <div style={{ color:"#4ade80", fontWeight:800, fontSize:16 }}>{v}</div>
                <div style={{ color:"#3f3f46", fontSize:10 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT FORM PANEL ── */}
        <div style={{
          flex: 1, background: "#0a0a0a",
          border: "1.5px solid #16a34a",
          borderRadius: 20,
          boxShadow: "0 0 40px rgba(22,163,74,0.12), 0 16px 48px rgba(0,0,0,0.8)",
          padding: "40px 36px",
          display: "flex", flexDirection: "column", justifyContent: "center",
        }}>

          {/* Header row */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28 }}>
            <div style={{ width:32, height:32, background:"#052010", border:"1px solid #16a34a", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="16" height="16" viewBox="0 0 44 44" fill="none">
                <path d="M22 4L38 13V31L22 40L6 31V13L22 4Z" stroke="#4ade80" strokeWidth="2.5" strokeLinejoin="round"/>
                <circle cx="22" cy="22" r="5" fill="#4ade80"/>
              </svg>
            </div>
            <span style={{ color:"#fff", fontWeight:700, fontSize:15 }}>KizunaHire</span>
            <div style={{ marginLeft:"auto", background:"#052010", border:"1px solid #14532d", borderRadius:6, padding:"2px 10px", fontSize:10, color:"#4ade80", fontWeight:700, letterSpacing:"0.5px" }}>
              {isAdmin ? "ADMIN" : "CANDIDATE"}
            </div>
          </div>

          <h2 style={{ color:"#fff", fontSize:20, fontWeight:800, margin:"0 0 4px" }}>
            {isAdmin ? "Admin Portal" : "Welcome back"}
          </h2>
          <p style={{ color:"#52525b", fontSize:12, margin:"0 0 24px" }}>
            {isAdmin ? "Sign in to access the recruiter dashboard" : "Sign in to your candidate account"}
          </p>

          {/* Tab toggle */}
          <div style={{ display:"flex", background:"#111", borderRadius:10, padding:3, marginBottom:24, border:"1px solid #1a1a1a", gap:3 }}>
            {(["user","admin"] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError(""); setEmail(""); setPassword(""); }}
                style={{
                  flex:1, padding:"8px 0", borderRadius:8, border:"none", cursor:"pointer",
                  fontSize:12, fontWeight:600, transition:"all 0.2s", fontFamily:"inherit",
                  background: tab===t ? "#16a34a" : "transparent",
                  color: tab===t ? "#fff" : "#52525b",
                  boxShadow: tab===t ? "0 2px 12px rgba(22,163,74,0.35)" : "none",
                }}>
                {t==="user" ? "👤  Candidate" : "🔐  Admin"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background:"#1c0505", border:"1px solid #7f1d1d", color:"#fca5a5", borderRadius:8, padding:"9px 12px", fontSize:12, marginBottom:14 }}>
                {error}
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom:12 }}>
              <label htmlFor="si-email" style={{ color:"#71717a", fontSize:11, fontWeight:500, display:"block", marginBottom:5 }}>Email address</label>
              <div style={{ display:"flex", alignItems:"center", gap:8, background:"#111", border:"1px solid #16a34a", borderRadius:8, padding:"0 12px", height:44 }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#3f3f46" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <input id="si-email" name="email" type="email" autoComplete="email" className="si-input"
                  placeholder={isAdmin ? "admin@gmail.com" : "you@example.com"} value={email} onChange={e => setEmail(e.target.value)} required/>
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom:14 }}>
              <label htmlFor="si-pass" style={{ color:"#71717a", fontSize:11, fontWeight:500, display:"block", marginBottom:5 }}>Password</label>
              <div style={{ display:"flex", alignItems:"center", gap:8, background:"#111", border:"1px solid #16a34a", borderRadius:8, padding:"0 12px", height:44 }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#3f3f46" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <input id="si-pass" name="password" type={showPass?"text":"password"} autoComplete="current-password" className="si-input"
                  placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required/>
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ background:"none", border:"none", cursor:"pointer", padding:0, lineHeight:0 }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#3f3f46" strokeWidth="2">
                    {showPass
                      ? <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                      : <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></>
                    }
                  </svg>
                </button>
              </div>
            </div>

            {/* Forgot */}
            {!isAdmin && (
              <div style={{ textAlign:"right", marginBottom:18 }}>
                <Link href="/forgot-password" style={{ color:"#16a34a", fontSize:12, fontWeight:500, textDecoration:"none" }}>
                  Forgot password?
                </Link>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width:"100%", height:44, borderRadius:8, border:"none",
              cursor: loading?"not-allowed":"pointer",
              background:"#16a34a", color:"#fff", fontWeight:700, fontSize:14,
              boxShadow:"0 4px 24px rgba(22,163,74,0.4)", opacity:loading?0.7:1,
              transition:"all 0.2s", fontFamily:"inherit",
            }}>
              {loading ? "Signing in…" : isAdmin ? "Access Dashboard →" : "Sign In →"}
            </button>

            {!isAdmin && (
              <p style={{ color:"#3f3f46", fontSize:12, textAlign:"center", marginTop:18 }}>
                Don&apos;t have an account?{" "}
                <Link href="/signup" style={{ color:"#16a34a", fontWeight:600, textDecoration:"none" }}>Sign up</Link>
              </p>
            )}
            {isAdmin && (
              <p style={{ color:"#262626", fontSize:11, textAlign:"center", marginTop:14 }}>
                Admin access only. Unauthorized login attempts are logged.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
