"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Offer {
  role:            string;
  match_score:     number;
  interest_score:  number;
  summary:         string;
  recommendation:  string;
  key_strengths:   string[];
  concerns:        string[];
  completed_at:    string;
}

export default function UserDashboardPage() {
  const router  = useRouter();
  const [email,    setEmail]    = useState("");
  const [name,     setName]     = useState("");
  const [tab,      setTab]      = useState<"offers"|"apply">("offers");
  const [offers,   setOffers]   = useState<Offer[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState<Offer | null>(null);

  useEffect(() => {
    const e = sessionStorage.getItem("user_email") || "";
    const r = sessionStorage.getItem("user_role")  || "";
    if (!e || r !== "candidate") { router.replace("/signin"); return; }
    setEmail(e);
    // Fetch real name from candidate profile
    fetch(`${API}/api/candidate/profile?email=${encodeURIComponent(e)}`)
      .then(res => res.json())
      .then(d => {
        if (d.exists && d.profile?.name) {
          setName(d.profile.name);
        } else {
          // fallback to email prefix
          const prefix = e.split("@")[0];
          setName(prefix.charAt(0).toUpperCase() + prefix.slice(1));
        }
      })
      .catch(() => {
        const prefix = e.split("@")[0];
        setName(prefix.charAt(0).toUpperCase() + prefix.slice(1));
      });
    fetchOffers(e);
  }, [router]);

  const fetchOffers = async (e: string) => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/interview/my-offers?email=${encodeURIComponent(e)}`);
      const data = await res.json();
      setOffers(data.offers || []);
      if ((data.offers || []).length > 0) setSelected(data.offers[0]);
    } catch { setOffers([]); }
    finally   { setLoading(false); }
  };

  const fmt = (iso: string) => {
    try { return new Date(iso).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }); }
    catch { return iso; }
  };

  const S = {
    page:      { minHeight:"100vh", background:"#000", fontFamily:"'Inter',sans-serif", display:"flex", flexDirection:"column" as const },
    // ── Nav ──
    nav:       { background:"rgba(0,0,0,0.95)", backdropFilter:"blur(12px)", borderBottom:"1px solid #1a1a1a", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 32px", position:"sticky" as const, top:0, zIndex:50 },
    logo:      { display:"flex", alignItems:"center", gap:8 },
    logoBox:   { width:30, height:30, background:"#16a34a", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" },
    logoText:  { color:"#fff", fontWeight:700, fontSize:17 },
    navRight:  { display:"flex", alignItems:"center", gap:16 },
    greeting:  { color:"#52525b", fontSize:13 },
    logoutBtn: { background:"transparent", border:"1px solid #27272a", color:"#71717a", padding:"6px 14px", borderRadius:8, fontSize:13, cursor:"pointer" },
    // ── Layout ──
    body:      { display:"flex", flex:1 },
    // ── Sidebar ──
    sidebar:   { width:220, background:"#050505", borderRight:"1px solid #1a1a1a", padding:"24px 12px", display:"flex", flexDirection:"column" as const, gap:4 },
    sideHead:  { fontSize:11, color:"#3f3f46", fontWeight:700, textTransform:"uppercase" as const, letterSpacing:"0.8px", padding:"8px 12px", marginBottom:4 },
    sideItem:  (active: boolean): React.CSSProperties => ({
      display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:10, cursor:"pointer",
      background: active ? "#0d2010" : "transparent",
      border: active ? "1px solid #16a34a30" : "1px solid transparent",
      color: active ? "#4ade80" : "#52525b",
      fontSize:13, fontWeight: active ? 600 : 400, transition:"all 0.15s",
    }),
    // ── Main ──
    main:      { flex:1, padding:"32px", overflowY:"auto" as const },
    mainTitle: { fontSize:"1.4rem", fontWeight:800, color:"#fff", marginBottom:4 },
    mainSub:   { fontSize:13, color:"#3f3f46", marginBottom:28 },
    // ── Empty state ──
    empty:     { textAlign:"center" as const, padding:"64px 24px", color:"#3f3f46" },
    // ── Offer card grid ──
    grid:      { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:16 },
    offerCard: (sel: boolean): React.CSSProperties => ({
      background:"#0a0a0a", border:`1px solid ${sel ? "#16a34a" : "#1c1c1c"}`,
      borderRadius:14, padding:"20px", cursor:"pointer", transition:"border-color 0.2s",
    }),
    offerRole: { color:"#fff", fontWeight:700, fontSize:15, margin:"0 0 4px" },
    offerDate: { color:"#3f3f46", fontSize:11, marginBottom:14 },
    scoreRow:  { display:"flex", gap:12, marginBottom:16 },
    scoreBox:  { flex:1, background:"#050505", border:"1px solid #1c1c1c", borderRadius:10, padding:"10px", textAlign:"center" as const },
    scoreVal:  (color: string): React.CSSProperties => ({ fontSize:20, fontWeight:800, color }),
    scoreLbl:  { fontSize:10, color:"#3f3f46", textTransform:"uppercase" as const, letterSpacing:"0.5px", marginTop:2 },
    tag:       (color: string): React.CSSProperties => ({
      display:"inline-block", background:`${color}18`, color, border:`1px solid ${color}30`,
      borderRadius:6, padding:"2px 8px", fontSize:11, margin:"2px 3px 2px 0",
    }),
    section:   { fontSize:11, color:"#3f3f46", fontWeight:700, textTransform:"uppercase" as const, letterSpacing:"0.5px", margin:"12px 0 6px" },
    badge:     { display:"inline-block", background:"#052010", color:"#4ade80", border:"1px solid #16a34a40", borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:700 },
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user_email");
    sessionStorage.removeItem("user_role");
    router.push("/signin");
  };

  return (
    <div style={S.page}>
      {/* Navbar */}
      <nav style={S.nav}>
        <div style={S.logo}>
          <div style={S.logoBox}>
            <svg width="16" height="16" viewBox="0 0 44 44" fill="none">
              <path d="M22 4L38 13V31L22 40L6 31V13L22 4Z" stroke="white" strokeWidth="3" strokeLinejoin="round"/>
              <circle cx="22" cy="22" r="5" fill="white"/>
            </svg>
          </div>
          <span style={S.logoText}>KizunaHire</span>
        </div>
        <div style={S.navRight}>
          <span style={{ color:"#71717a", fontSize:13 }}>Hi, <strong style={{ color:"#a1a1aa" }}>{name}</strong></span>
          <Link href="/user/home" style={{
            color:"#a1a1aa", fontSize:13, textDecoration:"none",
            padding:"6px 14px", borderRadius:8, border:"1px solid #27272a",
            background:"#0a0a0a", transition:"all 0.2s",
            display:"inline-flex", alignItems:"center", gap:6,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Home
          </Link>
          <button style={{
            background:"transparent", border:"1px solid #3f0a0a", color:"#f87171",
            padding:"6px 14px", borderRadius:8, fontSize:13, cursor:"pointer",
            display:"inline-flex", alignItems:"center", gap:6, transition:"all 0.2s",
          }} onClick={handleLogout}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Log out
          </button>
        </div>
      </nav>

      <div style={S.body}>
        {/* Sidebar */}
        <aside style={S.sidebar}>
          <p style={S.sideHead}>My Portal</p>

          <div style={S.sideItem(tab === "offers")} onClick={() => setTab("offers")}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Offers
            {offers.length > 0 && (
              <span style={{ marginLeft:"auto", background:"#16a34a", color:"#fff", borderRadius:999, padding:"1px 7px", fontSize:10, fontWeight:700 }}>
                {offers.length}
              </span>
            )}
          </div>

          <div style={S.sideItem(tab === "apply")} onClick={() => { setTab("apply"); router.push("/candidate/onboarding?fresh=true"); }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Fill New Form
          </div>
        </aside>

        {/* Main content */}
        <main style={S.main}>
          {tab === "offers" && (
            <>
              <h1 style={S.mainTitle}>My Offers 🎉</h1>
              <p style={S.mainSub}>
                {loading ? "Loading your offers…" : offers.length === 0
                  ? "No approved offers yet. Complete your interview to get started."
                  : `${offers.length} approved offer${offers.length > 1 ? "s" : ""} from KizunaHire`}
              </p>

              {loading ? (
                <div style={{ display:"flex", flexDirection:"column" as const, alignItems:"center", justifyContent:"center", padding:"80px 24px", gap:16 }}>
                  <style dangerouslySetInnerHTML={{__html:`@keyframes spin{to{transform:rotate(360deg)}}`}}/>
                  <div style={{ width:36, height:36, border:"3px solid #1a1a1a", borderTopColor:"#16a34a", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
                  <p style={{ color:"#3f3f46", fontSize:13 }}>Loading your offers…</p>
                </div>
              ) : offers.length === 0 ? (
                <div style={S.empty}>
                  <div style={{ fontSize:52, marginBottom:16 }}>📭</div>
                  <p style={{ color:"#52525b", fontSize:15, fontWeight:600 }}>No offers yet</p>
                  <p style={{ fontSize:13, marginTop:6, color:"#27272a" }}>
                    Complete the AI interview after receiving an invite — once the admin approves, your offer will appear here.
                  </p>
                  <button
                    onClick={() => router.push("/candidate/onboarding")}
                    style={{ marginTop:20, background:"#16a34a", color:"#fff", border:"none", borderRadius:10, padding:"10px 24px", fontWeight:600, fontSize:14, cursor:"pointer" }}
                  >
                    Apply Now →
                  </button>
                </div>
              ) : (
                <div style={S.grid}>
                  {offers.map((offer, i) => (
                    <div
                      key={i}
                      style={S.offerCard(selected === offer)}
                      onClick={() => setSelected(offer)}
                    >
                      {/* Header */}
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:4 }}>
                        <p style={S.offerRole}>{offer.role}</p>
                        <span style={S.badge}>✅ Approved</span>
                      </div>
                      <p style={S.offerDate}>Completed on {fmt(offer.completed_at)}</p>

                      {/* Scores */}
                      <div style={S.scoreRow}>
                        <div style={S.scoreBox}>
                          <div style={S.scoreVal("#3b82f6")}>{offer.match_score.toFixed(0)}</div>
                          <div style={S.scoreLbl}>Match</div>
                        </div>
                        <div style={S.scoreBox}>
                          <div style={S.scoreVal("#a855f7")}>{offer.interest_score.toFixed(0)}</div>
                          <div style={S.scoreLbl}>Interest</div>
                        </div>
                      </div>

                      {/* Summary */}
                      <p style={{ fontSize:12, color:"#71717a", lineHeight:1.65, marginBottom:10 }}>{offer.summary}</p>

                      {/* Strengths */}
                      {offer.key_strengths?.length > 0 && (
                        <>
                          <p style={S.section}>✅ Key Strengths</p>
                          <div>{offer.key_strengths.map((s, j) => <span key={j} style={S.tag("#16a34a")}>{s}</span>)}</div>
                        </>
                      )}

                      {/* Recommendation */}
                      <p style={{ ...S.section, marginTop:14 }}>Recommendation</p>
                      <span style={S.tag(offer.recommendation === "Strong Yes" || offer.recommendation === "Yes" ? "#22c55e" : "#f59e0b")}>
                        {offer.recommendation}
                      </span>

                      <p style={{ fontSize:11, color:"#3f3f46", marginTop:16, paddingTop:12, borderTop:"1px solid #141414" }}>
                        🎉 Congratulations! The team will be in touch with next steps.
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
