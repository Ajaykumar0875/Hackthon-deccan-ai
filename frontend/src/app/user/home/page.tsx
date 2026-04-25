"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import "../../user.css";

const faqs = [
  { q: "How does AI matching work?", a: "Our AI parses your profile and compares your skills against live job descriptions using advanced semantic matching." },
  { q: "Is my resume data secure?", a: "Yes. We only extract structured data (skills, experience, education). The original file is never stored." },
  { q: "How is the Interest Score calculated?", a: "After the AI interview simulation, your responses are analysed for enthusiasm, accuracy, and role alignment." },
  { q: "Can I apply without a resume?", a: "Yes — fill in your details manually through our guided application form." },
  { q: "How long does the AI interview take?", a: "Typically 8–12 minutes. 3 technical + 3 behavioural questions tailored to the role." },
];

const testimonials = [
  { name: "Aarav Mehta", handle: "@aarav_dev", img: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200", text: "Got shortlisted in 48 hours. The AI interview was surprisingly natural!" },
  { name: "Priya Nair", handle: "@priya_ux", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200", text: "The resume parser extracted everything correctly. No manual entry needed." },
  { name: "Rohan Sharma", handle: "@rohan_ml", img: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200", text: "Best hiring experience I have had. Transparent scores and fast feedback." },
  { name: "Anita Desai", handle: "@anita_ds", img: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200", text: "Applied at 9 PM, got an interview slot by morning. Impressive!" },
  { name: "Kiran Patel", handle: "@kiran_be", img: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200", text: "The AI asked exactly the kind of questions a senior engineer would ask." },
];

const features = [
  { emoji: "⚡", title: "AI-Powered Matching", desc: "Your profile is matched against job requirements using advanced semantic AI." },
  { emoji: "📄", title: "Smart Resume Parsing", desc: "Upload your resume once. Our AI extracts and structures your data automatically." },
  { emoji: "🤖", title: "AI Interview Simulation", desc: "Complete a personalised AI interview at your convenience. No scheduling needed." },
  { emoji: "📊", title: "Transparent Scoring", desc: "See your Match Score and Interest Score clearly before a recruiter calls." },
  { emoji: "🔒", title: "Privacy First", desc: "Your data is only shared with companies you apply to." },
  { emoji: "🚀", title: "Lightning Fast", desc: "From application to shortlist decision in under 24 hours." },
];

const steps = [
  { step: "01", title: "Sign In & Apply", desc: "Create your account, fill out the application form and optionally upload your resume." },
  { step: "02", title: "AI Matching", desc: "Our AI scores your profile against job requirements — skills, experience, and role fit." },
  { step: "03", title: "AI Interview", desc: "Receive an interview link via email. Complete it in your own time and get ranked." },
];

export default function UserHome() {
  const [openFaq, setOpenFaq]   = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName]   = useState("");
  const [darkMode, setDarkMode]   = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("kizuna-theme");
    if (saved === "dark") setDarkMode(true);
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("kizuna-theme", next ? "dark" : "light");
  };

  useEffect(() => {
    const email = sessionStorage.getItem("user_email");
    const role = sessionStorage.getItem("user_role");
    if (email && role === "user") {
      setIsLoggedIn(true);
      setUserName(email.split("@")[0]);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("user_email");
    sessionStorage.removeItem("user_role");
    setIsLoggedIn(false);
    setUserName("");
  };

  const dk = darkMode;
  const s = {
    page:         { background: dk?"#000":"#fff", minHeight:"100vh", color:dk?"#e4e4e7":"#1e293b", fontFamily:"'Inter','Poppins',sans-serif", transition:"background 0.3s,color 0.3s" } as React.CSSProperties,
    nav:          { position:"sticky" as const, top:0, zIndex:50, background:dk?"rgba(0,0,0,0.92)":"rgba(255,255,255,0.92)", backdropFilter:"blur(12px)", borderBottom:`1px solid ${dk?"#1a1a1a":"#e2e8f0"}`, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 48px", transition:"background 0.3s" },
    logo:         { display:"flex", alignItems:"center", gap:8 },
    logoBox:      { width:32, height:32, background:dk?"#16a34a":"#6366f1", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" },
    logoText:     { fontWeight:700, fontSize:18, color:dk?"#fff":"#1e293b" },
    navLinks:     { display:"flex", alignItems:"center", gap:32, fontSize:14, color:dk?"#a1a1aa":"#64748b" },
    navRight:     { display:"flex", alignItems:"center", gap:12 },
    btnPrimary:   { background:dk?"#16a34a":"#6366f1", color:"#fff", padding:"10px 22px", borderRadius:999, fontSize:14, fontWeight:600, textDecoration:"none", border:"none", cursor:"pointer" },
    btnGhost:     { color:dk?"#a1a1aa":"#64748b", fontSize:14, fontWeight:500, textDecoration:"none", background:"none", border:"none", cursor:"pointer" },
    hero:         { maxWidth:800, margin:"0 auto", padding:"80px 24px 56px", textAlign:"center" as const },
    badge:        { display:"inline-flex", alignItems:"center", gap:6, fontSize:13, color:dk?"#4ade80":"#3730a3", background:dk?"rgba(22,163,74,0.1)":"rgba(99,102,241,0.08)", border:`1px solid ${dk?"rgba(22,163,74,0.3)":"rgba(99,102,241,0.2)"}`, borderRadius:999, padding:"5px 14px", marginBottom:24 },
    h1:           { fontSize:54, fontWeight:800, lineHeight:1.15, color:dk?"#fff":"#0f172a", margin:"0 0 20px" },
    h1Accent:     { color:dk?"#4ade80":"#6366f1" },
    subtitle:     { fontSize:17, color:dk?"#71717a":"#64748b", maxWidth:520, margin:"0 auto 32px", lineHeight:1.7 },
    heroBtns:     { display:"flex", alignItems:"center", justifyContent:"center", gap:16, flexWrap:"wrap" as const },
    note:         { fontSize:12, color:dk?"#52525b":"#94a3b8", marginTop:14 },
    marqueeSec:   { overflow:"hidden", padding:"20px 0", background:dk?"#0a0a0a":"#f8fafc", borderTop:`1px solid ${dk?"#1a1a1a":"#e2e8f0"}`, borderBottom:`1px solid ${dk?"#1a1a1a":"#e2e8f0"}` },
    marqueeTrack: { display:"flex", animation:"marqueeScroll 35s linear infinite", width:"max-content", gap:16 },
    card:         { flexShrink:0, width:260, background:dk?"#0a0a0a":"#fff", border:`1px solid ${dk?"#1a1a1a":"#e2e8f0"}`, borderRadius:16, padding:16, boxShadow:dk?"0 2px 8px rgba(0,0,0,0.4)":"0 2px 8px rgba(0,0,0,0.06)" },
    cardRow:      { display:"flex", gap:10, alignItems:"center", marginBottom:10 },
    avatar:       { width:40, height:40, borderRadius:"50%", objectFit:"cover" as const },
    cardName:     { fontWeight:600, fontSize:13, color:dk?"#fff":"#1e293b" },
    cardHandle:   { fontSize:11, color:dk?"#52525b":"#94a3b8" },
    cardText:     { fontSize:13, color:dk?"#a1a1aa":"#64748b", lineHeight:1.6 },
    section:      { maxWidth:1000, margin:"0 auto", padding:"72px 24px" },
    sectionTitle: { fontSize:32, fontWeight:700, textAlign:"center" as const, color:dk?"#fff":"#0f172a", margin:"0 0 8px" },
    sectionSub:   { fontSize:14, color:dk?"#71717a":"#94a3b8", textAlign:"center" as const, maxWidth:480, margin:"0 auto 56px" },
    featureGrid:  { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))", gap:32 },
    featureCard:  { background:dk?"#0a0a0a":"#f8fafc", border:`1px solid ${dk?"#1a1a1a":"#e2e8f0"}`, borderRadius:16, padding:24 },
    featureEmoji: { fontSize:28, marginBottom:14, width:48, height:48, display:"flex", alignItems:"center", justifyContent:"center", background:dk?"rgba(22,163,74,0.1)":"rgba(99,102,241,0.08)", borderRadius:12 },
    featureTitle: { fontWeight:600, fontSize:15, color:dk?"#fff":"#0f172a", margin:"0 0 6px" },
    featureDesc:  { fontSize:13, color:dk?"#a1a1aa":"#64748b", lineHeight:1.65, margin:0 },
    howSec:       { background:dk?"#0a0a0a":"#f8fafc", padding:"72px 24px", borderTop:`1px solid ${dk?"#1a1a1a":"#e2e8f0"}`, borderBottom:`1px solid ${dk?"#1a1a1a":"#e2e8f0"}` },
    stepsRow:     { display:"flex", gap:40, justifyContent:"center", flexWrap:"wrap" as const, maxWidth:900, margin:"0 auto" },
    stepCard:     { textAlign:"center" as const, maxWidth:240 },
    stepNum:      { width:56, height:56, background:dk?"#16a34a":"#6366f1", color:"#fff", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:18, margin:"0 auto 16px" },
    stepTitle:    { fontWeight:600, fontSize:15, color:dk?"#fff":"#1e293b", margin:"0 0 8px" },
    stepDesc:     { fontSize:13, color:dk?"#a1a1aa":"#64748b", lineHeight:1.65, margin:0 },
    ctaSec:       { maxWidth:1000, margin:"0 auto", padding:"48px 24px" },
    ctaBox:       { display:"flex", alignItems:"center", justifyContent:"space-between", border:`1px solid ${dk?"#1a1a1a":"#e2e8f0"}`, background:dk?"#0a0a0a":"#fff", borderRadius:24, padding:"48px 48px", gap:32, flexWrap:"wrap" as const },
    ctaImg:       { maxWidth:260, borderRadius:16 },
    faqSec:       { maxWidth:720, margin:"0 auto", padding:"48px 24px 72px" },
    faqItem:      { border:`1px solid ${dk?"#1a1a1a":"#e2e8f0"}`, borderRadius:12, overflow:"hidden" as const, marginBottom:12, background:dk?"#0a0a0a":"#fff" },
    faqBtn:       { width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 18px", background:"none", border:"none", cursor:"pointer", textAlign:"left" as const, fontSize:14, fontWeight:500, color:dk?"#e4e4e7":"#334155" },
    faqAnswer:    { fontSize:13, color:dk?"#a1a1aa":"#64748b", padding:"0 18px 16px", lineHeight:1.7 },
    footer:       { background:dk?"#0a0a0a":"#0f172a", color:dk?"#52525b":"#94a3b8", padding:"48px", fontSize:13, borderTop:`1px solid ${dk?"#1a1a1a":"#1e293b"}` },
    footerRow:    { display:"flex", justifyContent:"space-between", flexWrap:"wrap" as const, gap:32, maxWidth:1000, margin:"0 auto" },
    footerLogo:   { display:"flex", alignItems:"center", gap:8, marginBottom:10 },
    footerLogoBox:  { width:28, height:28, background:dk?"#16a34a":"#6366f1", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center" },
    footerLogoText: { color:"#fff", fontWeight:700, fontSize:15 },
    footerTagline:  { fontSize:12, maxWidth:260, lineHeight:1.7, color:dk?"#52525b":"#64748b" },
    footerSocial:   { display:"flex", gap:14, marginTop:20 },
    socialLink:     { color:dk?"#52525b":"#64748b", textDecoration:"none" },
    footerLinks:    { display:"flex", gap:48 },
    footerCol:      {} as React.CSSProperties,
    footerColTitle: { color:"#f1f5f9", fontWeight:600, fontSize:13, marginBottom:14 },
    footerLink:     { display:"block", color:dk?"#52525b":"#64748b", textDecoration:"none", marginBottom:8, fontSize:13 },
    footerBottom:   { textAlign:"center" as const, borderTop:`1px solid ${dk?"#1a1a1a":"#1e293b"}`, paddingTop:20, marginTop:32, maxWidth:1000, margin:"32px auto 0", fontSize:12 },
  };

  return (
    <div style={s.page}>

      {/* Navbar */}
      <nav style={s.nav}>
        <div style={s.logo}>
          <div style={s.logoBox}>
            <svg width="18" height="18" viewBox="0 0 44 44" fill="none">
              <path d="M22 4L38 13V31L22 40L6 31V13L22 4Z" stroke="white" strokeWidth="3" strokeLinejoin="round"/>
              <circle cx="22" cy="22" r="5" fill="white"/>
            </svg>
          </div>
          <span style={s.logoText}>KizunaHire</span>
        </div>
        <div style={s.navLinks}>
          <a href="#features" style={s.btnGhost}>Features</a>
          <a href="#how-it-works" style={s.btnGhost}>How It Works</a>
          <a href="#faq" style={s.btnGhost}>FAQ</a>
        </div>
        <div style={s.navRight}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={darkMode ? "Switch to Light" : "Switch to Dark (Green)"}
            style={{
              width: 36, height: 36, borderRadius: 8, border: `1px solid ${darkMode?"#262626":"#e2e8f0"}`,
              background: darkMode?"#0a0a0a":"#f8fafc", cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center",
              transition:"all 0.2s", flexShrink: 0,
            }}
          >
            {darkMode ? (
              /* Sun icon */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              /* Moon icon */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
          {isLoggedIn ? (
            <>
              <span style={{ fontSize: 14, color: "#64748b" }}>Hi, {userName} 👋</span>
              <Link href="/apply" style={s.btnPrimary}>Apply Now</Link>
              <button onClick={handleLogout} style={{ ...s.btnGhost, color: "#ef4444" }}>Logout</button>
            </>
          ) : (
            <>
              <Link href="/signin" style={s.btnGhost}>Sign In</Link>
              <Link href="/signin" style={s.btnPrimary}>Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.badge}>
          <svg width="12" height="13" viewBox="0 0 13 14" fill="none">
            <path d="M1.613 8.2a.62.62 0 0 1-.553-.341.59.59 0 0 1 .076-.637l6.048-6.118a.31.31 0 0 1 .375-.069c.061.033.11.084.137.147a.3.3 0 0 1 .014.197L6.537 4.991a.59.59 0 0 0 .07.552.61.61 0 0 0 .504.257h4.276a.62.62 0 0 1 .553.341.59.59 0 0 1-.076.637l-6.048 6.119a.31.31 0 0 1-.375.067.295.295 0 0 1-.15-.344l1.172-3.61a.59.59 0 0 0-.07-.553.61.61 0 0 0-.504-.257z" stroke="#1E4BAF" strokeMiterlimit="5.759" strokeLinecap="round"/>
          </svg>
          Responded to 99% of applicants within 24 hours
        </div>
        <h1 style={s.h1}>
          Your Dream Job is<br/>
          <span style={s.h1Accent}>One Application Away</span>
        </h1>
        <p style={s.subtitle}>Apply once. Let AI match your skills, simulate your interview, and get you in front of the right recruiter.</p>
        <div style={s.heroBtns}>
          {isLoggedIn ? (
            <Link href="/apply" style={s.btnPrimary}>Apply Now</Link>
          ) : (
            <>
              <Link href="/signin" style={s.btnPrimary}>Sign In to Apply</Link>
              <Link href="/signin" style={{ ...s.btnGhost, display: "flex", alignItems: "center", gap: 6, color: "#6366f1", fontWeight: 600 }}>
                Create Account →
              </Link>
            </>
          )}
        </div>
        {!isLoggedIn && <p style={s.note}>You must be signed in to submit an application.</p>}
      </section>

      {/* Testimonials Marquee */}
      <section style={s.marqueeSec}>
        <div style={s.marqueeTrack}>
          {[...testimonials, ...testimonials].map((t, i) => (
            <div key={i} style={s.card}>
              <div style={s.cardRow}>
                <img src={t.img} alt={t.name} style={s.avatar}/>
                <div>
                  <p style={s.cardName}>{t.name}</p>
                  <p style={s.cardHandle}>{t.handle}</p>
                </div>
              </div>
              <p style={s.cardText}>{t.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={s.section}>
        <h2 style={s.sectionTitle}>Why KizunaHire?</h2>
        <p style={s.sectionSub}>Everything you need to land your next role — powered by AI at every step.</p>
        <div style={s.featureGrid}>
          {features.map((f, i) => (
            <div key={i} style={s.featureCard}>
              <div style={s.featureEmoji}>{f.emoji}</div>
              <h3 style={s.featureTitle}>{f.title}</h3>
              <p style={s.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={s.howSec}>
        <h2 style={{ ...s.sectionTitle, marginBottom: 8 }}>How It Works</h2>
        <p style={{ ...s.sectionSub, marginBottom: 48 }}>Three simple steps to go from applicant to shortlisted candidate.</p>
        <div style={s.stepsRow}>
          {steps.map((step, i) => (
            <div key={i} style={s.stepCard}>
              <div style={s.stepNum}>{step.step}</div>
              <h3 style={s.stepTitle}>{step.title}</h3>
              <p style={s.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={s.ctaSec}>
        <div style={s.ctaBox}>
          <div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: dk ? "#fff" : "#0f172a", margin: "0 0 20px", lineHeight: 1.3 }}>
              Ready to get hired?<br/>Start today.
            </h2>
            {isLoggedIn
              ? <Link href="/apply" style={s.btnPrimary}>Apply Now</Link>
              : <Link href="/signin" style={s.btnPrimary}>Sign In to Apply</Link>
            }
          </div>
          <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/appDownload/excitedWomenImage.png" alt="Apply" style={s.ctaImg}/>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={s.faqSec}>
        <h2 style={s.sectionTitle}>Frequently Asked Questions</h2>
        <p style={{ ...s.sectionSub, marginBottom: 36 }}>Everything you need to know before applying.</p>
        {faqs.map((f, i) => (
          <div key={i} style={s.faqItem}>
            <button style={s.faqBtn} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              {f.q}
              <svg style={{ transition: "transform 0.2s", transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }} width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="m4.5 7.2 3.793 3.793a1 1 0 0 0 1.414 0L13.5 7.2" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {openFaq === i && <p style={s.faqAnswer}>{f.a}</p>}
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer style={s.footer}>
        <div style={s.footerRow}>
          <div>
            <div style={s.footerLogo}>
              <div style={s.footerLogoBox}>
                <svg width="14" height="14" viewBox="0 0 44 44" fill="none">
                  <path d="M22 4L38 13V31L22 40L6 31V13L22 4Z" stroke="white" strokeWidth="3" strokeLinejoin="round"/>
                </svg>
              </div>
              <span style={s.footerLogoText}>KizunaHire</span>
            </div>
            <p style={s.footerTagline}>AI-powered talent scouting — connecting the right people with the right roles.</p>
            <div style={s.footerSocial}>
              <a href="https://www.linkedin.com/in/ajaykumar-8b2ab4258/" target="_blank" rel="noreferrer" style={s.socialLink}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
              <a href="https://github.com/Ajaykumar0875" target="_blank" rel="noreferrer" style={s.socialLink}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                  <path d="M9 18c-4.51 2-5-2-7-2"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/___aj.ai__/" target="_blank" rel="noreferrer" style={s.socialLink}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
            </div>
          </div>
          <div style={s.footerLinks}>
            <div style={s.footerCol}>
              <p style={s.footerColTitle}>Platform</p>
              <a href="#features" style={s.footerLink}>Features</a>
              <a href="#how-it-works" style={s.footerLink}>How It Works</a>
              <a href="#faq" style={s.footerLink}>FAQ</a>
            </div>
            <div style={s.footerCol}>
              <p style={s.footerColTitle}>Legal</p>
              <a href="#" style={s.footerLink}>Privacy Policy</a>
              <a href="#" style={s.footerLink}>Terms of Use</a>
            </div>
          </div>
        </div>
        <div style={s.footerBottom}>
          © 2026 KizunaHire. Built by{" "}
          <a href="https://www.linkedin.com/in/ajaykumar-8b2ab4258/" target="_blank" rel="noreferrer" style={{ color: "#818cf8" }}>Ajay Kumar</a>
          . All rights reserved.
        </div>
      </footer>
    </div>
  );
}
