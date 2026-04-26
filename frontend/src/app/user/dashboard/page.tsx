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
  const [showResumeModal, setShowResumeModal] = useState(false);

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
    // ── Resume Modal ──
    modalOverlay: { position:"fixed" as const, inset:0, background:"rgba(0,0,0,0.85)", backdropFilter:"blur(8px)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:24 },
    modalCard:    { background:"#0a0a0a", border:"1px solid #0d2010", borderRadius:20, maxWidth:860, width:"100%", overflow:"hidden" as const, boxShadow:"0 32px 80px rgba(0,0,0,0.9)", display:"flex", flexDirection:"row" as const },
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

          {/* Resume Builder CTA */}
          <div style={{ marginTop:"auto", paddingTop:24 }}>
            <div
              onClick={() => setShowResumeModal(true)}
              style={{
                background:"linear-gradient(135deg, #1a0533, #0d1a33)",
                border:"1px solid #4f46e530",
                borderRadius:12, padding:"14px", cursor:"pointer",
                transition:"all 0.2s",
              }}
            >
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                <span style={{ fontSize:18 }}>📄</span>
                <span style={{ color:"#a78bfa", fontWeight:700, fontSize:13 }}>Create Resume</span>
              </div>
              <p style={{ color:"#6b7280", fontSize:11, margin:0, lineHeight:1.5 }}>
                Build an ATS-friendly resume with AI
              </p>
            </div>
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

      {/* AI Resume Builder Modal */}
      {showResumeModal && (
        <div style={S.modalOverlay} onClick={() => setShowResumeModal(false)}>
          <div style={S.modalCard} onClick={e => e.stopPropagation()}>
            <style dangerouslySetInnerHTML={{__html:`
              @keyframes pulse-green { 0%,100%{opacity:0.3} 50%{opacity:0.8} }
              @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
              @keyframes drift { 0%,100%{transform:translate(0,0)} 50%{transform:translate(4px,-4px)} }
              .resume-cta:hover { opacity:0.88 !important; transform:translateY(-2px) !important; }
              .resume-cta { transition: all 0.2s !important; }
            `}}/>

            {/* ── LEFT PANEL: Illustration ── */}
            <div style={{
              width:340, minWidth:340, background:"#020d04",
              borderRight:"1px solid #0d2010", position:"relative" as const,
              overflow:"hidden" as const, display:"flex", flexDirection:"column" as const,
              alignItems:"center", justifyContent:"center", padding:"40px 24px",
            }}>
              {/* Background glow blobs */}
              <div style={{ position:"absolute" as const, top:-60, left:-60, width:280, height:280,
                background:"radial-gradient(circle, #16a34a22 0%, transparent 65%)",
                animation:"pulse-green 3s ease-in-out infinite" }}/>
              <div style={{ position:"absolute" as const, bottom:-40, right:-40, width:200, height:200,
                background:"radial-gradient(circle, #4ade8015 0%, transparent 65%)",
                animation:"pulse-green 4s ease-in-out infinite 1.5s" }}/>
              {/* Grid pattern overlay */}
              <div style={{ position:"absolute" as const, inset:0,
                backgroundImage:"linear-gradient(#16a34a08 1px, transparent 1px), linear-gradient(90deg, #16a34a08 1px, transparent 1px)",
                backgroundSize:"32px 32px" }}/>

              {/* Person at desk SVG illustration */}
              <div style={{ position:"relative" as const, zIndex:2, animation:"float 5s ease-in-out infinite" }}>
                <svg width="260" height="300" viewBox="0 0 260 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Desk */}
                  <rect x="20" y="210" width="220" height="12" rx="6" fill="#0d2010" stroke="#16a34a" strokeWidth="1"/>
                  <rect x="40" y="222" width="12" height="60" rx="6" fill="#0d2010" stroke="#16a34a30" strokeWidth="1"/>
                  <rect x="208" y="222" width="12" height="60" rx="6" fill="#0d2010" stroke="#16a34a30" strokeWidth="1"/>

                  {/* Laptop base */}
                  <rect x="70" y="185" width="120" height="28" rx="4" fill="#0a1a0a" stroke="#16a34a" strokeWidth="1.5"/>
                  {/* Laptop hinge */}
                  <rect x="124" y="180" width="12" height="10" rx="2" fill="#16a34a30"/>
                  {/* Laptop screen */}
                  <rect x="60" y="80" width="140" height="105" rx="8" fill="#050d05" stroke="#16a34a" strokeWidth="1.5"/>
                  {/* Screen content - resume preview */}
                  <rect x="68" y="88" width="124" height="89" rx="4" fill="#020902"/>
                  {/* Green header on screen */}
                  <rect x="68" y="88" width="124" height="22" rx="4" fill="#052010"/>
                  <rect x="76" y="94" width="55" height="5" rx="2.5" fill="#16a34a" opacity="0.9"/>
                  <rect x="76" y="102" width="35" height="3" rx="1.5" fill="#4ade80" opacity="0.4"/>
                  <circle cx="175" cy="97" r="8" fill="#0d2010" stroke="#16a34a" strokeWidth="1"/>
                  <circle cx="175" cy="95" r="3" fill="#16a34a" opacity="0.7"/>
                  {/* Screen lines */}
                  <rect x="76" y="116" width="24" height="3" rx="1.5" fill="#16a34a" opacity="0.7"/>
                  <rect x="76" y="123" width="108" height="2" rx="1" fill="#1a2e1a"/>
                  <rect x="76" y="128" width="90" height="2" rx="1" fill="#1a2e1a" opacity="0.7"/>
                  <rect x="76" y="133" width="100" height="2" rx="1" fill="#1a2e1a" opacity="0.5"/>
                  <rect x="76" y="142" width="26" height="3" rx="1.5" fill="#16a34a" opacity="0.7"/>
                  <rect x="76" y="149" width="108" height="2" rx="1" fill="#1a2e1a"/>
                  <rect x="76" y="154" width="75" height="2" rx="1" fill="#1a2e1a" opacity="0.6"/>
                  {/* ATS badge on screen */}
                  <rect x="140" y="113" width="44" height="14" rx="7" fill="#052010" stroke="#16a34a" strokeWidth="1"/>
                  <text x="162" y="123" textAnchor="middle" fill="#4ade80" fontSize="6" fontWeight="700">ATS ✓</text>

                  {/* Person body */}
                  <ellipse cx="130" cy="62" rx="22" ry="24" fill="#0d2010" stroke="#16a34a" strokeWidth="1.5"/>
                  {/* Face */}
                  <circle cx="130" cy="58" r="14" fill="#0a0a0a" stroke="#16a34a" strokeWidth="1"/>
                  {/* Eyes */}
                  <circle cx="125" cy="56" r="2.5" fill="#4ade80" opacity="0.8"/>
                  <circle cx="135" cy="56" r="2.5" fill="#4ade80" opacity="0.8"/>
                  {/* Smile */}
                  <path d="M124 63 Q130 68 136 63" stroke="#16a34a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  {/* Hair */}
                  <path d="M116 52 Q118 40 130 38 Q142 40 144 52" fill="#052010" stroke="#16a34a" strokeWidth="1"/>
                  {/* Torso */}
                  <path d="M108 82 Q115 78 130 78 Q145 78 152 82 L158 175 L102 175 Z" fill="#052010" stroke="#16a34a30" strokeWidth="1"/>
                  {/* Arms */}
                  <path d="M108 95 Q85 120 80 180" stroke="#0d2010" strokeWidth="14" strokeLinecap="round" fill="none"/>
                  <path d="M108 95 Q85 120 80 180" stroke="#16a34a" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4"/>
                  <path d="M152 95 Q175 120 180 180" stroke="#0d2010" strokeWidth="14" strokeLinecap="round" fill="none"/>
                  <path d="M152 95 Q175 120 180 180" stroke="#16a34a" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4"/>
                  {/* Hands on keyboard */}
                  <ellipse cx="85" cy="196" rx="14" ry="8" fill="#0d2010" stroke="#16a34a" strokeWidth="1"/>
                  <ellipse cx="175" cy="196" rx="14" ry="8" fill="#0d2010" stroke="#16a34a" strokeWidth="1"/>

                  {/* Floating sparkles */}
                  <circle cx="38" cy="120" r="3" fill="#4ade80" opacity="0.6" style={{animation:"drift 3s ease-in-out infinite"}}/>
                  <circle cx="222" cy="100" r="2" fill="#16a34a" opacity="0.8" style={{animation:"drift 4s ease-in-out infinite 1s"}}/>
                  <circle cx="45" cy="165" r="2" fill="#4ade80" opacity="0.4" style={{animation:"drift 5s ease-in-out infinite 0.5s"}}/>
                  <text x="28" y="92" fill="#4ade80" fontSize="10" opacity="0.5">✦</text>
                  <text x="215" y="140" fill="#16a34a" fontSize="8" opacity="0.6">✦</text>
                  <text x="218" y="72" fill="#4ade80" fontSize="12" opacity="0.4">✦</text>
                </svg>
              </div>

              {/* Label under illustration */}
              <div style={{ position:"relative" as const, zIndex:2, textAlign:"center" as const, marginTop:-8 }}>
                <span style={{
                  background:"#052010", border:"1px solid #16a34a30",
                  color:"#4ade80", borderRadius:20, padding:"6px 16px",
                  fontSize:11, fontWeight:700, letterSpacing:"0.5px",
                }}>✦ Powered by AI</span>
              </div>
            </div>

            {/* ── RIGHT PANEL: Content ── */}
            <div style={{ flex:1, display:"flex", flexDirection:"column" as const, background:"#050505" }}>

              {/* Back button at top */}
              <div style={{ padding:"20px 28px 0" }}>
                <button
                  onClick={() => setShowResumeModal(false)}
                  style={{
                    display:"inline-flex", alignItems:"center", gap:6,
                    background:"transparent", border:"1px solid #1c2e1c",
                    color:"#4ade80", padding:"6px 14px", borderRadius:8,
                    fontSize:12, fontWeight:600, cursor:"pointer",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                  Back to Dashboard
                </button>
              </div>

              {/* Content */}
              <div style={{ padding:"20px 28px 28px", flex:1, display:"flex", flexDirection:"column" as const, justifyContent:"center" }}>

                {/* Title */}
                <div style={{ marginBottom:20 }}>
                  <h2 style={{ color:"#fff", margin:"0 0 8px", fontSize:24, fontWeight:800, letterSpacing:"-0.5px" }}>
                    AI Resume Builder
                  </h2>
                  <p style={{ color:"#52525b", fontSize:13, margin:0, lineHeight:1.6 }}>
                    Make your resume stand out and maximize your chances.
                  </p>
                </div>

                {/* Stats */}
                <div style={{ display:"flex", gap:10, marginBottom:20 }}>
                  {[["500+", "Resumes Built"], ["98%", "ATS Pass Rate"], ["< 5 min", "Build Time"]].map(([val, lbl], i) => (
                    <div key={i} style={{
                      flex:1, background:"#0a0a0a", border:"1px solid #0d2010",
                      borderRadius:10, padding:"10px 8px", textAlign:"center" as const,
                    }}>
                      <div style={{ color:"#4ade80", fontWeight:800, fontSize:16 }}>{val}</div>
                      <div style={{ color:"#3f3f46", fontSize:10, marginTop:2 }}>{lbl}</div>
                    </div>
                  ))}
                </div>

                {/* Feature pills */}
                <div style={{ display:"flex", flexWrap:"wrap" as const, gap:8, marginBottom:24 }}>
                  {[
                    "✦ ATS-Optimized",
                    "✦ AI Bullet Points",
                    "✦ PDF Export",
                    "✦ Keyword Matching",
                    "✦ Multiple Templates",
                    "✦ Free to Use",
                  ].map((f, i) => (
                    <span key={i} style={{
                      background:"#0a0a0a", border:"1px solid #16a34a25",
                      color:"#4ade80", borderRadius:20, padding:"5px 12px",
                      fontSize:11, fontWeight:600,
                    }}>{f}</span>
                  ))}
                </div>

                {/* CTA */}
                <a
                  href="https://ai-resume-builder-frontend-app.onrender.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="resume-cta"
                  style={{
                    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                    background:"linear-gradient(135deg, #16a34a, #15803d)",
                    color:"#fff", textDecoration:"none", padding:"14px 24px",
                    borderRadius:12, fontWeight:700, fontSize:15,
                    boxShadow:"0 0 28px rgba(22,163,74,0.35)",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  Build Your Resume Now →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
