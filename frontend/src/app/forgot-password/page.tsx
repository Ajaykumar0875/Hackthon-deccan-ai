"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/* ── Style tokens ──────────────────────────────────────────────────────────── */
const INP: React.CSSProperties = {
  width: "100%", background: "#0a0a0a", border: "1px solid #262626",
  borderRadius: 8, padding: "12px 14px", color: "#fff", fontSize: 14,
  outline: "none", boxSizing: "border-box", fontFamily: "inherit",
};
const BTN: React.CSSProperties = {
  width: "100%", padding: "13px 0", borderRadius: 8, border: "none",
  background: "#16a34a", color: "#fff", fontWeight: 700, fontSize: 15,
  cursor: "pointer", fontFamily: "inherit",
};
const LBL: React.CSSProperties = { color: "#a1a1aa", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6 };
const ERR: React.CSSProperties = {
  background: "#1c0505", border: "1px solid #7f1d1d", color: "#fca5a5",
  borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16,
};
const SUC: React.CSSProperties = {
  background: "#052010", border: "1px solid #14532d", color: "#6ee7b7",
  borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16,
};

type Step = "email" | "otp" | "password" | "done";

/* ── OTP Input — exact logic from otppage.jsx ──────────────────────────────── */
function OTPInput({ onChange }: { onChange: (v: string) => void }) {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      onChange(newOtp.join(""));
    }
    if (value.length === 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Backspace" && !inputRefs.current[index]?.value && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent): void => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    pasted.split("").forEach((ch, i) => { if (i < 6) newOtp[i] = ch; });
    setOtp(newOtp);
    onChange(newOtp.join(""));
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .otp-box {
          width: 44px; height: 52px; text-align: center;
          font-size: 22px; font-weight: 800;
          background-color: #1a1a1a !important;
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          caret-color: #16a34a;
          border-radius: 8px;
          outline: none;
          transition: border-color 0.15s;
          font-family: inherit;
        }
        .otp-box:focus { border-color: #16a34a !important; }
      `}} />
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <input
            key={index}
            className="otp-box"
            type="text"
            maxLength={1}
            value={otp[index] || ""}
            ref={(el) => { inputRefs.current[index] = el; }}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            autoFocus={index === 0}
            style={{ border: `1px solid ${otp[index] ? "#16a34a" : "#333"}` }}
          />
        ))}
      </div>
    </>
  );
}

/* ── Page shell ─────────────────────────────────────────────────────────────── */
const SHELL: React.CSSProperties = {
  minHeight: "100vh", display: "flex", alignItems: "center",
  justifyContent: "center", background: "#000",
  fontFamily: "'Geist',sans-serif", padding: 24,
};
const CARD: React.CSSProperties = {
  maxWidth: 420, width: "100%", background: "#0a0a0a",
  border: "1px solid #262626", borderRadius: 20, padding: "44px 36px",
};
const GEIST = `@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap');
  input:focus{border-color:#16a34a!important;} input::placeholder{color:#52525b;}`;

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function ForgotPasswordPage() {
  const router  = useRouter();
  const otpRef  = useRef("");

  const [step,        setStep]        = useState<Step>("email");
  const [email,       setEmail]       = useState("");
  const [newPass,     setNewPass]     = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [info,        setInfo]        = useState("");

  // Inject fonts + base input styles ONCE — avoids CSS re-parse on every keystroke
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap');
      .fp-input:focus { border-color: #16a34a !important; outline: none !important; }
      .fp-input { -webkit-text-fill-color: #fff !important; color: #fff !important; }
      .fp-input::placeholder { color: #52525b; }
    `;
    document.head.appendChild(el);
    return () => { document.head.removeChild(el); };
  }, []);

  // Step indicator
  const stepIdx = ["email", "otp", "password"].indexOf(step === "done" ? "password" : step);
  const StepDots = (
    <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 28 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: i <= stepIdx ? 24 : 8, height: 8, borderRadius: 4, background: i <= stepIdx ? "#16a34a" : "#262626", transition: "all 0.3s" }} />
      ))}
    </div>
  );

  /* Step 1 — Send OTP */
  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setInfo(""); setLoading(true);
    try {
      const res  = await fetch(`${API}/api/auth/forgot-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed");
      setInfo(`OTP sent to ${email}. Check your inbox.`);
      setStep("otp");
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Error"); }
    finally { setLoading(false); }
  };

  /* Step 2 — OTP auto-verify on 6 digits (no parent re-render per digit) */
  const handleOtpChange = async (val: string) => {
    otpRef.current = val;
    if (val.length === 6) {
      setError(""); setLoading(true);
      try {
        const res  = await fetch(`${API}/api/auth/verify-otp`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase(), otp: val }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Invalid OTP");
        setStep("password");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Invalid OTP");
        otpRef.current = "";
      }
      finally { setLoading(false); }
    }
  };

  /* Step 3 — Reset password */
  const resetPass = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (newPass.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (newPass !== confirmPass) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/auth/reset-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otpRef.current.trim(), new_password: newPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Reset failed");
      setStep("done");
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Error"); }
    finally { setLoading(false); }
  };

  /* ── STEP 1: Email ── */
  if (step === "email") return (
    <div style={SHELL}>
      <div style={CARD}>
        {StepDots}
        <p style={{ color: "#16a34a", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px" }}>Account Recovery</p>
        <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: "0 0 6px" }}>Forgot Password?</h1>
        <p style={{ color: "#71717a", fontSize: 13, margin: "0 0 24px", lineHeight: 1.7 }}>Enter your registered email — we&apos;ll send a 6-digit OTP.</p>
        {error && <div style={ERR}>{error}</div>}
        {info  && <div style={SUC}>{info}</div>}
        <form onSubmit={sendOtp}>
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="fp-email" style={LBL}>Email Address</label>
            <input id="fp-email" type="email" className="fp-input" style={INP} value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required autoComplete="email" />
          </div>
          <button type="submit" style={{ ...BTN, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? "Sending OTP…" : "Send OTP →"}
          </button>
        </form>
        <p style={{ color: "#3f3f46", fontSize: 12, textAlign: "center", marginTop: 20 }}>
          Remembered it?{" "}<Link href="/signin" style={{ color: "#16a34a", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );

  /* ── STEP 2: OTP ── */
  if (step === "otp") return (
    <div style={SHELL}>
      <div style={CARD}>
        {StepDots}
        <p style={{ color: "#16a34a", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px" }}>Verify OTP</p>
        <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: "0 0 6px" }}>Check Your Email</h1>
        <p style={{ color: "#71717a", fontSize: 13, margin: "0 0 28px", lineHeight: 1.7 }}>
          Sent to <strong style={{ color: "#fff" }}>{email}</strong> — type all 6 digits, it verifies automatically.
        </p>
        {error && <div style={ERR}>{error}</div>}
        {loading ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ width: 32, height: 32, border: "3px solid #1c2e1c", borderTopColor: "#16a34a", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 10px" }} />
            <style dangerouslySetInnerHTML={{ __html: `@keyframes spin{to{transform:rotate(360deg)}}` }} />
            <p style={{ color: "#71717a", fontSize: 13, margin: 0 }}>Verifying…</p>
          </div>
        ) : (
          <OTPInput onChange={handleOtpChange} />
        )}
        <p style={{ color: "#52525b", fontSize: 11, marginTop: 12, textAlign: "center" }}>OTP expires in 10 minutes</p>
        <button onClick={() => { setStep("email"); otpRef.current = ""; setError(""); }} style={{
          width: "100%", marginTop: 16, padding: "12px 0", borderRadius: 8, cursor: "pointer",
          background: "transparent", border: "1px solid #262626", color: "#71717a", fontSize: 13, fontFamily: "inherit",
        }}>
          ← Resend / Change Email
        </button>
      </div>
    </div>
  );

  /* ── STEP 3: New Password ── */
  if (step === "password") return (
    <div style={SHELL}>
      <div style={CARD}>
        {StepDots}
        <p style={{ color: "#16a34a", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px" }}>New Password</p>
        <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: "0 0 6px" }}>Reset Password</h1>
        <p style={{ color: "#71717a", fontSize: 13, margin: "0 0 24px", lineHeight: 1.7 }}>OTP verified — set your new password below.</p>
        {error && <div style={ERR}>{error}</div>}
        <form onSubmit={resetPass}>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="fp-np" style={LBL}>New Password</label>
            <div style={{ position: "relative" }}>
              <input id="fp-np" type={showPass ? "text" : "password"} style={{ ...INP, paddingRight: 44 }}
                value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Min 8 characters" required />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 0 }}>
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="fp-cp" style={LBL}>Confirm Password</label>
            <input id="fp-cp" type={showPass ? "text" : "password"}
              style={{ ...INP, borderColor: confirmPass && confirmPass !== newPass ? "#7f1d1d" : "#262626" }}
              value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Repeat your password" required />
            {confirmPass && confirmPass !== newPass && <p style={{ color: "#f87171", fontSize: 11, marginTop: 4 }}>Passwords do not match</p>}
          </div>
          <button type="submit" style={{ ...BTN, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? "Resetting…" : "Reset Password →"}
          </button>
        </form>
      </div>
    </div>
  );

  /* ── DONE ── */
  return (
    <div style={SHELL}>
      <div style={{ ...CARD, textAlign: "center" }}>
        <div style={{ width: 72, height: 72, background: "#052010", border: "2px solid #16a34a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 0 32px rgba(22,163,74,0.2)" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <p style={{ color: "#16a34a", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px" }}>Success</p>
        <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>Password Reset!</h1>
        <p style={{ color: "#71717a", fontSize: 14, margin: "0 0 28px", lineHeight: 1.7 }}>Your password has been updated. You can now sign in.</p>
        <button onClick={() => router.push("/signin")} style={BTN}>Go to Sign In →</button>
      </div>
    </div>
  );
}
