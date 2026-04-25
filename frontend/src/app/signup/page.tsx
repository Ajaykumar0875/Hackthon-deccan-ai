"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !password) { setError("All fields are required."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Registration failed");

      // Auto-login after register
      sessionStorage.setItem("user_email", data.email);
      sessionStorage.setItem("user_role", data.role);
      sessionStorage.setItem("user_name", data.name);
      // New users always go to onboarding first
      router.push("/candidate/onboarding");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 14, outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #0f0c29 0%, #1a1a3e 50%, #0f0c29 100%)",
      fontFamily: "'Poppins', sans-serif", padding: "24px",
      position: "relative", overflow: "hidden",
    }}>
      {/* Blobs */}
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)", top: -100, left: -100, pointerEvents: "none" }}/>
      <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)", bottom: -80, right: -60, pointerEvents: "none" }}/>

      <div style={{
        width: "100%", maxWidth: 440,
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 24, padding: "40px 36px", backdropFilter: "blur(20px)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{ width: 40, height: 40, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}>
            <svg width="22" height="22" viewBox="0 0 44 44" fill="none">
              <path d="M22 4L38 13V31L22 40L6 31V13L22 4Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/>
              <circle cx="22" cy="22" r="6" fill="white"/>
            </svg>
          </div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 17, letterSpacing: "-0.3px" }}>KizunaHire</span>
        </div>

        <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 700, margin: "0 0 4px" }}>Create account</h2>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, margin: "0 0 28px" }}>
          Join KizunaHire as a candidate
        </p>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div style={{ marginBottom: 14 }}>
            <label htmlFor="signup-name" style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>Full Name</label>
            <input id="signup-name" name="name" autoComplete="name" style={inp} type="text" placeholder="Candidate Name" value={name} onChange={e => setName(e.target.value)} />
          </div>

          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label htmlFor="signup-email" style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>Email address</label>
            <input id="signup-email" name="email" autoComplete="email" style={inp} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 14 }}>
            <label htmlFor="signup-password" style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>Password <span style={{ color: "rgba(255,255,255,0.3)" }}>(min 8 chars)</span></label>
            <div style={{ position: "relative" }}>
              <input id="signup-password" name="password" autoComplete="new-password" style={inp} type={showPass ? "text" : "password"} placeholder="Create a strong password" value={password} onChange={e => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", padding: 0 }}>
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
          <div style={{ marginBottom: 24 }}>
            <label htmlFor="signup-confirm" style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 }}>Confirm Password</label>
            <input id="signup-confirm" name="confirm_password" autoComplete="new-password" style={inp} type="password" placeholder="Repeat your password" value={confirm} onChange={e => setConfirm(e.target.value)} />
          </div>

          <button type="submit" disabled={loading} style={{
            width: "100%", height: 48, borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff",
            fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 4px 20px rgba(99,102,241,0.4)", opacity: loading ? 0.7 : 1,
            transition: "all 0.2s", fontFamily: "inherit",
          }}>
            {loading ? "Creating account…" : "Create Account →"}
          </button>

          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textAlign: "center", marginTop: 20 }}>
            Already have an account?{" "}
            <Link href="/signin" style={{ color: "#818cf8", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
