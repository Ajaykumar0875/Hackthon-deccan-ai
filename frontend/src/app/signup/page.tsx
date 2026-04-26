"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap');
      .su-input {
        width: 100%; background: #111 !important; border: 1px solid #16a34a !important;
        border-radius: 8px; padding: 11px 14px; color: #fff !important;
        -webkit-text-fill-color: #fff !important; font-size: 14px;
        outline: none; box-sizing: border-box; font-family: inherit;
        transition: border-color 0.2s;
      }
      .su-input::placeholder { color: #3f3f46 !important; }
      .su-input:focus { border-color: #4ade80 !important; }
    `;
    document.head.appendChild(el);
    return () => { document.head.removeChild(el); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !password) { setError("All fields are required."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/auth/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Registration failed");
      sessionStorage.setItem("user_email", data.email);
      sessionStorage.setItem("user_role",  data.role);
      sessionStorage.setItem("user_name",  data.name);
      if (data.token) sessionStorage.setItem("auth_token", data.token);
      router.push("/candidate/onboarding");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#000", fontFamily: "'Geist', sans-serif", padding: 24, position: "relative",
    }}>
      {/* Green glow blobs */}
      <div style={{ position:"fixed", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(22,163,74,0.10) 0%, transparent 70%)", top:-150, left:-150, pointerEvents:"none" }}/>
      <div style={{ position:"fixed", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle, rgba(22,163,74,0.07) 0%, transparent 70%)", bottom:-100, right:-100, pointerEvents:"none" }}/>

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 440, position: "relative", zIndex: 1,
        background: "#0a0a0a", border: "1.5px solid #16a34a", borderRadius: 20,
        padding: "40px 36px",
        boxShadow: "0 0 60px rgba(22,163,74,0.12), 0 24px 64px rgba(0,0,0,0.8)",
      }}>
        {/* Logo row */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28 }}>
          <div style={{ width:36, height:36, background:"#052010", border:"1px solid #16a34a", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="18" height="18" viewBox="0 0 44 44" fill="none">
              <path d="M22 4L38 13V31L22 40L6 31V13L22 4Z" stroke="#4ade80" strokeWidth="2.5" strokeLinejoin="round"/>
              <circle cx="22" cy="22" r="6" fill="#4ade80"/>
            </svg>
          </div>
          <span style={{ color:"#fff", fontWeight:700, fontSize:16 }}>KizunaHire</span>
          <div style={{ marginLeft:"auto", background:"#052010", border:"1px solid #14532d", borderRadius:6, padding:"2px 10px", fontSize:10, color:"#4ade80", fontWeight:700, letterSpacing:"0.5px" }}>
            CANDIDATE
          </div>
        </div>

        <h2 style={{ color:"#fff", fontSize:22, fontWeight:800, margin:"0 0 4px" }}>Create account</h2>
        <p style={{ color:"#52525b", fontSize:13, margin:"0 0 24px" }}>Join KizunaHire as a candidate</p>

        {error && (
          <div style={{ background:"#1c0505", border:"1px solid #7f1d1d", color:"#fca5a5", borderRadius:8, padding:"9px 12px", fontSize:12, marginBottom:16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div style={{ marginBottom:12 }}>
            <label htmlFor="su-name" style={{ color:"#71717a", fontSize:11, fontWeight:500, display:"block", marginBottom:5 }}>Full Name</label>
            <input id="su-name" name="name" type="text" autoComplete="name" className="su-input"
              placeholder="Candidate Name" value={name} onChange={e => setName(e.target.value)}/>
          </div>

          {/* Email */}
          <div style={{ marginBottom:12 }}>
            <label htmlFor="su-email" style={{ color:"#71717a", fontSize:11, fontWeight:500, display:"block", marginBottom:5 }}>Email address</label>
            <input id="su-email" name="email" type="email" autoComplete="email" className="su-input"
              placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}/>
          </div>

          {/* Password */}
          <div style={{ marginBottom:12 }}>
            <label htmlFor="su-pass" style={{ color:"#71717a", fontSize:11, fontWeight:500, display:"block", marginBottom:5 }}>
              Password <span style={{ color:"#3f3f46" }}>(min 8 chars)</span>
            </label>
            <div style={{ position:"relative" }}>
              <input id="su-pass" name="password" type={showPass ? "text" : "password"} autoComplete="new-password" className="su-input"
                placeholder="Create a strong password" value={password} onChange={e => setPassword(e.target.value)}
                style={{ paddingRight: 40 }}/>
              <button type="button" onClick={() => setShowPass(v => !v)}
                style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#3f3f46", padding:0, lineHeight:0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {showPass
                    ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                    : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                  }
                </svg>
              </button>
            </div>
          </div>

          {/* Confirm */}
          <div style={{ marginBottom:20 }}>
            <label htmlFor="su-confirm" style={{ color:"#71717a", fontSize:11, fontWeight:500, display:"block", marginBottom:5 }}>Confirm Password</label>
            <input id="su-confirm" name="confirm_password" type="password" autoComplete="new-password" className="su-input"
              placeholder="Repeat your password" value={confirm} onChange={e => setConfirm(e.target.value)}
              style={{ borderColor: confirm && confirm !== password ? "#7f1d1d" : undefined }}/>
            {confirm && confirm !== password && (
              <p style={{ color:"#f87171", fontSize:11, marginTop:4 }}>Passwords do not match</p>
            )}
          </div>

          <button type="submit" disabled={loading} style={{
            width:"100%", height:44, borderRadius:8, border:"none",
            background:"#16a34a", color:"#fff", fontWeight:700, fontSize:14,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow:"0 4px 24px rgba(22,163,74,0.4)", opacity: loading ? 0.7 : 1,
            transition:"all 0.2s", fontFamily:"inherit",
          }}>
            {loading ? "Creating account…" : "Create Account →"}
          </button>

          <p style={{ color:"#3f3f46", fontSize:12, textAlign:"center", marginTop:18 }}>
            Already have an account?{" "}
            <Link href="/signin" style={{ color:"#16a34a", fontWeight:600, textDecoration:"none" }}>Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
