"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TOTAL_QUESTIONS = 10;

interface Message { role: "user" | "assistant"; content: string; }

function InterviewChat() {
  const params        = useSearchParams();
  const email         = params.get("email") || "";
  const role          = params.get("role")  || "Software Engineer";
  const name          = params.get("name")  || "";
  const matchScore    = parseFloat(params.get("match") || "70");

  const router       = useRouter();
  const [messages,  setMessages]  = useState<Message[]>([]);
  const [input,     setInput]     = useState("");
  const [qNum,      setQNum]      = useState(1);
  const [loading,   setLoading]   = useState(false);
  const [phase,     setPhase]     = useState<"intro"|"chat"|"submitting">("intro");
  const bottomRef = useRef<HTMLDivElement>(null);
  const qaPairs   = useRef<{q: string; a: string}[]>([]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const fetchNextQuestion = async (history: Message[], nextQNum: number) => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/interview/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, messages: history, question_number: nextQNum }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      setQNum(nextQNum + 1);
    } catch {
      setMessages(prev => [...prev, { role:"assistant", content:"Sorry, I had a connection issue. Please try refreshing." }]);
    } finally { setLoading(false); }
  };

  const startInterview = async () => {
    setPhase("chat");
    await fetchNextQuestion([], 1);
  };

  const sendAnswer = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const lastQ = messages.filter(m => m.role === "assistant").at(-1)?.content || "";
    qaPairs.current.push({ q: lastQ, a: input.trim() });
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");

    if (qaPairs.current.length >= TOTAL_QUESTIONS) {
      // All 10 answered — show thank-you message then analyze + redirect
      setPhase("submitting");
      setLoading(true);
      setMessages(prev => [...prev, { role:"assistant", content:"Thank you for completing the interview! 🎉 We'll review your responses and get back to you soon. Submitting your results now..." }]);
      try {
        await fetch(`${API}/api/interview/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            candidate_email: email,
            candidate_name:  name || email.split("@")[0],
            role,
            match_score:     matchScore,
            qa_pairs:        qaPairs.current,
          }),
        });
      } catch { /* best-effort */ }
      finally { setLoading(false); }
      // Short delay so candidate sees the thank-you message, then redirect
      setTimeout(() => router.push("/interview/complete"), 2000);
    } else {
      await fetchNextQuestion(newHistory, qNum);
    }
  };

  // Progress: show current question number / total (1-indexed while answering)
  const answeredCount = qaPairs.current.length;
  const displayedQ    = Math.min(answeredCount + 1, TOTAL_QUESTIONS); // current question being answered
  const progress      = (displayedQ / TOTAL_QUESTIONS) * 100;

  // ── Styles ─────────────────────────────────────────────────────────────────
  const s = {
    wrap:    { minHeight:"100vh", background:"#000", display:"flex", flexDirection:"column" as const, alignItems:"center", justifyContent:"center", padding:"24px", fontFamily:"'Inter',sans-serif" },
    card:    { width:"100%", maxWidth:680, background:"#0a0a0a", border:"1.5px solid #16a34a", borderRadius:20, overflow:"hidden", boxShadow:"0 0 60px rgba(22,163,74,0.12)" },
    header:  { background:"#050e05", borderBottom:"1px solid #1c2e1c", padding:"20px 28px", display:"flex", alignItems:"center", gap:12 },
    logo:    { width:32, height:32, background:"#052010", border:"1px solid #16a34a", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" },
    hTitle:  { color:"#fff", fontWeight:700, fontSize:15 },
    hSub:    { color:"#4ade80", fontSize:12 },
    progBar: { height:3, background:"#1a1a1a" },
    progFill:{ height:"100%", background:"linear-gradient(90deg,#16a34a,#4ade80)", transition:"width 0.4s" },
    msgs:    { height:420, overflowY:"auto" as const, padding:"20px 28px", display:"flex", flexDirection:"column" as const, gap:12 },
    bubble:  (r:"user"|"assistant"): React.CSSProperties => ({
      maxWidth:"80%", padding:"11px 15px", borderRadius: r==="user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
      background: r==="user" ? "#16a34a" : "#131313",
      border: r==="user" ? "none" : "1px solid #1e1e1e",
      color:"#fff", fontSize:14, lineHeight:1.6, alignSelf: r==="user" ? "flex-end" : "flex-start",
    }),
    inputRow:{ borderTop:"1px solid #1c2e1c", padding:"16px 20px", display:"flex", gap:8 },
    inp:     { flex:1, background:"#111", border:"1px solid #262626", borderRadius:8, padding:"10px 14px", color:"#fff", fontSize:14, outline:"none", fontFamily:"inherit" } as React.CSSProperties,
    sendBtn: { width:44, height:44, background:"#16a34a", border:"none", borderRadius:8, color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" } as React.CSSProperties,
    intro:   { padding:"40px 28px", textAlign:"center" as const },
    done:    { padding:"40px 28px", textAlign:"center" as const },
  };

  if (phase === "intro") return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.header}>
          <div style={s.logo}>
            <svg width="16" height="16" viewBox="0 0 44 44" fill="none">
              <path d="M22 4L38 13V31L22 40L6 31V13L22 4Z" stroke="#4ade80" strokeWidth="2.5" strokeLinejoin="round"/>
              <circle cx="22" cy="22" r="6" fill="#4ade80"/>
            </svg>
          </div>
          <div>
            <div style={s.hTitle}>KizunaHire AI Interview</div>
            <div style={s.hSub}>{role}</div>
          </div>
        </div>
        <div style={s.intro}>
          <div style={{ fontSize:48, marginBottom:16 }}>🤖</div>
          <h2 style={{ color:"#fff", fontWeight:800, fontSize:22, margin:"0 0 12px" }}>Welcome to your AI Interview</h2>
          <p style={{ color:"#71717a", fontSize:14, lineHeight:1.7, margin:"0 0 8px" }}>
            You're applying for: <strong style={{ color:"#4ade80" }}>{role}</strong>
          </p>
          <p style={{ color:"#52525b", fontSize:13, lineHeight:1.7, margin:"0 0 28px" }}>
            The AI will ask you <strong style={{ color:"#fff" }}>10 questions</strong> — a mix of technical and behavioural.<br/>
            Answer honestly and in detail. Takes approximately 10 minutes.
          </p>
          <button onClick={startInterview} style={{
            background:"#16a34a", color:"#fff", border:"none", borderRadius:10,
            padding:"13px 32px", fontWeight:700, fontSize:15, cursor:"pointer",
            boxShadow:"0 4px 20px rgba(22,163,74,0.4)",
          }}>
            Start Interview →
          </button>
          <p style={{ color:"#3f3f46", fontSize:12, marginTop:16 }}>Your responses will be analyzed and sent to the recruiter.</p>
        </div>
      </div>
    </div>
  );


  return (
    <div style={s.wrap}>
      <div style={s.card}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.logo}>
            <svg width="16" height="16" viewBox="0 0 44 44" fill="none">
              <path d="M22 4L38 13V31L22 40L6 31V13L22 4Z" stroke="#4ade80" strokeWidth="2.5" strokeLinejoin="round"/>
              <circle cx="22" cy="22" r="6" fill="#4ade80"/>
            </svg>
          </div>
          <div style={{ flex:1 }}>
            <div style={s.hTitle}>KizunaHire AI Interview — {role}</div>
            <div style={s.hSub}>Question {displayedQ} of {TOTAL_QUESTIONS}</div>
          </div>
          <div style={{ color:"#4ade80", fontWeight:700, fontSize:13 }}>{displayedQ}/{TOTAL_QUESTIONS}</div>
        </div>

        {/* Progress bar */}
        <div style={s.progBar}><div style={{ ...s.progFill, width:`${progress}%` }}/></div>

        {/* Messages */}
        <div style={s.msgs}>
          {messages.map((m, i) => (
            <div key={i} style={s.bubble(m.role)}>{m.content}</div>
          ))}
          {loading && (
            <div style={{ ...s.bubble("assistant"), color:"#52525b" }}>
              <span style={{ display:"inline-flex", gap:4 }}>
                {[0,1,2].map(d => (
                  <span key={d} style={{ width:6, height:6, borderRadius:"50%", background:"#4ade80", display:"inline-block", animation:`pulse 1.2s ${d*0.2}s infinite` }}/>
                ))}
              </span>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* Input */}
        <div style={s.inputRow}>
          <input
            style={s.inp}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendAnswer()}
            placeholder={phase === "submitting" ? "Submitting your results…" : "Type your answer and press Enter…"}
            disabled={loading || phase === "submitting"}
          />
          <button onClick={sendAnswer} disabled={loading || !input.trim()} style={{ ...s.sendBtn, opacity: loading || !input.trim() ? 0.5 : 1 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:.3;transform:scaleY(.6)}50%{opacity:1;transform:scaleY(1)}}`}</style>
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:"100vh", background:"#000", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ color:"#4ade80", fontSize:14 }}>Loading interview…</div>
      </div>
    }>
      <InterviewChat/>
    </Suspense>
  );
}
