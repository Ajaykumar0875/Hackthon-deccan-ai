"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function InterviewThankYouPage() {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 100); }, []);

  return (
    <div style={{
      minHeight:"100vh", background:"#000", display:"flex", alignItems:"center",
      justifyContent:"center", fontFamily:"'Inter',sans-serif", padding:24,
    }}>
      {/* Green glow */}
      <div style={{ position:"fixed", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(22,163,74,0.12) 0%, transparent 70%)", top:-100, left:-100, pointerEvents:"none" }}/>
      <div style={{ position:"fixed", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle, rgba(22,163,74,0.08) 0%, transparent 70%)", bottom:-80, right:-80, pointerEvents:"none" }}/>

      <div style={{
        maxWidth:500, width:"100%", textAlign:"center", position:"relative", zIndex:1,
        opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(20px)",
        transition:"all 0.6s ease",
      }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:32 }}>
          <div style={{ width:36, height:36, background:"#052010", border:"1px solid #16a34a", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="18" height="18" viewBox="0 0 44 44" fill="none">
              <path d="M22 4L38 13V31L22 40L6 31V13L22 4Z" stroke="#4ade80" strokeWidth="2.5" strokeLinejoin="round"/>
              <circle cx="22" cy="22" r="6" fill="#4ade80"/>
            </svg>
          </div>
          <span style={{ color:"#fff", fontWeight:700, fontSize:16 }}>KizunaHire</span>
        </div>

        {/* Checkmark animation */}
        <div style={{
          width:80, height:80, borderRadius:"50%", background:"#052010", border:"2px solid #16a34a",
          display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 28px",
          boxShadow:"0 0 40px rgba(22,163,74,0.25)",
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <h1 style={{ color:"#fff", fontSize:28, fontWeight:800, margin:"0 0 12px", letterSpacing:"-0.5px" }}>
          Interview Complete! 🎉
        </h1>
        <p style={{ color:"#71717a", fontSize:15, lineHeight:1.7, margin:"0 0 8px" }}>
          Thank you for attending the KizunaHire AI Interview.
        </p>
        <p style={{ color:"#52525b", fontSize:14, lineHeight:1.7, margin:"0 0 32px" }}>
          Your responses have been recorded and are being analyzed.<br/>
          Our team will review and get back to you within <strong style={{ color:"#4ade80" }}>5–7 business days</strong>.
        </p>

        {/* Info cards */}
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:32 }}>
          {[
            { icon:"📊", text:"Your answers are being analyzed by our AI" },
            { icon:"📧", text:"You'll receive an update via email" },
            { icon:"📅", text:"Results expected within 5–7 business days" },
          ].map((item, i) => (
            <div key={i} style={{
              background:"#0a0a0a", border:"1px solid #1c2e1c", borderRadius:10,
              padding:"12px 16px", display:"flex", alignItems:"center", gap:12,
              fontSize:13, color:"#a1a1aa",
            }}>
              <span style={{ fontSize:18 }}>{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>

        <p style={{ color:"#3f3f46", fontSize:12 }}>
          Questions? Email us at{" "}
          <a href="mailto:ajay.grandhisila@gmail.com" style={{ color:"#16a34a", textDecoration:"none" }}>
            ajay.grandhisila@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
