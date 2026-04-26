"use client";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function AdminProfilePage() {
  const router = useRouter();
  const [email, setEmail]     = useState("");
  const [name, setName]       = useState("");
  const [role, setRole]       = useState("");
  const [since, setSince]     = useState("");
  const [editName, setEditName] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Change password state
  const [curPwd, setCurPwd]       = useState("");
  const [newPwd, setNewPwd]       = useState("");
  const [confPwd, setConfPwd]     = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg]       = useState({ text: "", ok: false });
  const [showCur, setShowCur]     = useState(false);
  const [showNew, setShowNew]     = useState(false);
  const [showConf, setShowConf]   = useState(false);

  useEffect(() => {
    const e = sessionStorage.getItem("user_email") || "";
    const r = sessionStorage.getItem("user_role")  || "";
    if (!e || r !== "admin") { router.replace("/user/home"); return; }
    setEmail(e);
    fetchProfile(e);
  }, [router]);

  const fetchProfile = async (e: string) => {
    try {
      const res = await fetch(`${API_URL}/api/user/profile?email=${encodeURIComponent(e)}`);
      if (res.ok) {
        const d = await res.json();
        setName(d.name); setEditName(d.name);
        setRole(d.role);
        setSince(d.created_at ? new Date(d.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "—");
      }
    } catch { /* offline */ }
  };

  const handleSaveName = async () => {
    setSaving(true); setSaveMsg("");
    try {
      const res = await fetch(`${API_URL}/api/user/profile?email=${encodeURIComponent(email)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      if (res.ok) { setName(editName); setEditMode(false); setSaveMsg("Name updated!"); }
      else setSaveMsg("Failed to update name.");
    } catch { setSaveMsg("Network error."); }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    setPwdMsg({ text: "", ok: false });
    if (!curPwd || !newPwd || !confPwd) { setPwdMsg({ text: "All fields required.", ok: false }); return; }
    if (newPwd !== confPwd) { setPwdMsg({ text: "New passwords do not match.", ok: false }); return; }
    if (newPwd.length < 8) { setPwdMsg({ text: "Password must be at least 8 characters.", ok: false }); return; }
    setPwdLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user/change-password?email=${encodeURIComponent(email)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: curPwd, new_password: newPwd, confirm_password: confPwd }),
      });
      const d = await res.json();
      if (res.ok) {
        setPwdMsg({ text: "Password changed successfully!", ok: true });
        setCurPwd(""); setNewPwd(""); setConfPwd("");
      } else {
        setPwdMsg({ text: d.detail || "Failed to change password.", ok: false });
      }
    } catch { setPwdMsg({ text: "Network error.", ok: false }); }
    setPwdLoading(false);
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const S = {
    page: { minHeight: "100vh", background: "#000", paddingTop: 80, fontFamily: "'Inter', sans-serif" } as React.CSSProperties,
    container: { maxWidth: 720, margin: "0 auto", padding: "2.5rem 1.5rem" } as React.CSSProperties,
    pageTitle: { fontSize: "1.6rem", fontWeight: 700, color: "#f3f4f6", marginBottom: "0.25rem" } as React.CSSProperties,
    pageSub: { fontSize: "0.9rem", color: "#6b7280", marginBottom: "2rem" } as React.CSSProperties,
    card: { background: "linear-gradient(to bottom, #020204, #191130)", border: "1px solid #374151", borderRadius: 12, padding: "1.75rem", marginBottom: "1.5rem" } as React.CSSProperties,
    cardTitle: { fontSize: "1rem", fontWeight: 600, color: "#f3f4f6", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: 8 } as React.CSSProperties,
    avatarWrap: { display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1.5rem" } as React.CSSProperties,
    avatar: { width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", fontWeight: 700, color: "#fff" } as React.CSSProperties,
    row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "0.75rem" } as React.CSSProperties,
    label: { fontSize: "0.75rem", color: "#6b7280", marginBottom: 4, display: "block" } as React.CSSProperties,
    value: { fontSize: "0.95rem", color: "#e2e8f0", fontWeight: 500 } as React.CSSProperties,
    input: { width: "100%", background: "#0d0d18", border: "1px solid #374151", borderRadius: 8, padding: "0.6rem 0.85rem", color: "#f3f4f6", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" as const } as React.CSSProperties,
    badge: { display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 20, padding: "3px 12px", fontSize: "0.78rem", color: "#818cf8" } as React.CSSProperties,
    btnPrimary: { background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "0.55rem 1.25rem", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s", fontFamily: "inherit" } as React.CSSProperties,
    btnSecondary: { background: "transparent", color: "#9ca3af", border: "1px solid #374151", borderRadius: 8, padding: "0.55rem 1.25rem", fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit" } as React.CSSProperties,
    btnRow: { display: "flex", gap: 10, marginTop: "1rem" } as React.CSSProperties,
    pwdWrap: { position: "relative" as const, marginBottom: "0.85rem" },
    eyeBtn: { position: "absolute" as const, right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: 0 } as React.CSSProperties,
    msg: (ok: boolean) => ({ fontSize: "0.83rem", color: ok ? "#34d399" : "#f87171", marginTop: 8 } as React.CSSProperties),
  };

  const EyeIcon = ({ open }: { open: boolean }) => open
    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;

  return (
    <>
      <Navbar />
      <main style={S.page}>
        <div style={S.container}>
          <h1 style={S.pageTitle}>My Profile</h1>
          <p style={S.pageSub}>Manage your account details and security settings</p>

          {/* ── Account Info Card ────────────────────────────────────────── */}
          <div style={S.card}>
            <p style={S.cardTitle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Account Information
            </p>

            {/* Avatar + name */}
            <div style={S.avatarWrap}>
              <div style={S.avatar}>{(name || "A").charAt(0).toUpperCase()}</div>
              <div>
                <p style={{ color: "#f3f4f6", fontWeight: 700, fontSize: "1.1rem", margin: 0 }}>{name || "—"}</p>
                <p style={{ color: "#6b7280", fontSize: "0.85rem", margin: "2px 0 6px" }}>{email}</p>
                <div style={S.badge}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#818cf8", display: "inline-block" }} />
                  {role}
                </div>
              </div>
            </div>

            {/* Fields */}
            <div style={S.row}>
              <div>
                <span style={S.label}>Display Name</span>
                {editMode
                  ? <input style={S.input} value={editName} onChange={e => setEditName(e.target.value)} />
                  : <p style={S.value}>{name || "—"}</p>}
              </div>
              <div>
                <span style={S.label}>Email</span>
                <p style={S.value}>{email || "—"}</p>
              </div>
              <div>
                <span style={S.label}>Role</span>
                <p style={{ ...S.value, textTransform: "capitalize" }}>{role || "—"}</p>
              </div>
              <div>
                <span style={S.label}>{role === "admin" ? "Admin Since" : "Candidate Since"}</span>
                <p style={S.value}>{since || "—"}</p>
              </div>
            </div>

            {saveMsg && <p style={S.msg(saveMsg === "Name updated!")}>{saveMsg}</p>}

            <div style={S.btnRow}>
              {editMode ? (
                <>
                  <button style={S.btnPrimary} onClick={handleSaveName} disabled={saving}>
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                  <button style={S.btnSecondary} onClick={() => { setEditMode(false); setEditName(name); }}>
                    Cancel
                  </button>
                </>
              ) : (
                <button style={S.btnPrimary} onClick={() => setEditMode(true)}>Edit Name</button>
              )}
            </div>
          </div>

          {/* ── Change Password Card ─────────────────────────────────────── */}
          <div style={S.card}>
            <p style={S.cardTitle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Change Password
            </p>

            {/* Current */}
            <label style={S.label}>Current Password</label>
            <div style={S.pwdWrap}>
              <input style={S.input} type={showCur ? "text" : "password"} placeholder="Enter current password" value={curPwd} onChange={e => setCurPwd(e.target.value)} />
              <button style={S.eyeBtn} onClick={() => setShowCur(v => !v)}><EyeIcon open={showCur} /></button>
            </div>

            {/* New */}
            <label style={S.label}>New Password <span style={{ color: "#6b7280" }}>(min 8 chars)</span></label>
            <div style={S.pwdWrap}>
              <input style={S.input} type={showNew ? "text" : "password"} placeholder="Enter new password" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
              <button style={S.eyeBtn} onClick={() => setShowNew(v => !v)}><EyeIcon open={showNew} /></button>
            </div>

            {/* Confirm */}
            <label style={S.label}>Confirm New Password</label>
            <div style={S.pwdWrap}>
              <input style={S.input} type={showConf ? "text" : "password"} placeholder="Confirm new password" value={confPwd} onChange={e => setConfPwd(e.target.value)} />
              <button style={S.eyeBtn} onClick={() => setShowConf(v => !v)}><EyeIcon open={showConf} /></button>
            </div>

            {pwdMsg.text && <p style={S.msg(pwdMsg.ok)}>{pwdMsg.text}</p>}

            <div style={S.btnRow}>
              <button style={S.btnPrimary} onClick={handleChangePassword} disabled={pwdLoading}>
                {pwdLoading ? "Updating…" : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
