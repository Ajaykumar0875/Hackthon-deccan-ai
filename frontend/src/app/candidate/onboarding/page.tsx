"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const API = "http://localhost:8000";

const EXP   = ["Fresher", "Junior (1-2 yrs)", "Mid (3-5 yrs)", "Senior (6-9 yrs)", "Lead (10+ yrs)"];
const AVAIL = ["Immediate", "Within 1 month", "Within 2 months", "Within 3 months"];
const SKILLS_SUGGESTIONS = ["Python","JavaScript","TypeScript","React","Next.js","Node.js","FastAPI","Django","SQL","MongoDB","AWS","Docker","Machine Learning","Data Science","Java","Go","Kotlin","Swift","Flutter","GraphQL"];
const ROLE_SUGGESTIONS   = ["Frontend Developer","Backend Developer","Full Stack Developer","Data Scientist","ML Engineer","DevOps Engineer","Product Manager","UI/UX Designer","Data Analyst","Mobile Developer"];

/* ── Shared style tokens ───────────────────────────────────────── */
const INP: React.CSSProperties = {
  background:"#0a0a0a", border:"1px solid #262626", borderRadius:8,
  padding:"11px 14px", color:"#fff", fontSize:14, outline:"none",
  width:"100%", boxSizing:"border-box", fontFamily:"'Geist',sans-serif",
  transition:"border-color 0.2s",
};
const LBL: React.CSSProperties = { color:"#a1a1aa", fontSize:12, fontWeight:500, display:"block", marginBottom:6 };
const SEC: React.CSSProperties = { color:"#16a34a", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", margin:"0 0 14px", paddingBottom:8, borderBottom:"1px solid #1c2e1c" };
const TAG = (on:boolean): React.CSSProperties => ({
  padding:"5px 12px", borderRadius:20, fontSize:12, fontWeight:500, cursor:"pointer", border:"1px solid",
  background: on ? "#16a34a" : "#0a0a0a", borderColor: on ? "#16a34a" : "#262626",
  color: on ? "#fff" : "#71717a", transition:"all 0.2s",
});

export default function OnboardingPage() {
  const router  = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  /* state */
  const [email, setEmail]         = useState("");
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [parsing, setParsing]     = useState(false);
  const [parseMsg, setParseMsg]   = useState("");
  const [hasProfile, setHasProfile] = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [name, setName]           = useState("");
  const [phone, setPhone]         = useState("");
  const [location, setLocation]   = useState("");
  const [linkedin, setLinkedin]   = useState("");
  const [summary, setSummary]     = useState("");
  const [expLevel, setExpLevel]   = useState("");
  const [availability, setAvailability] = useState("");
  const [salary, setSalary]       = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [skills, setSkills]       = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [roles, setRoles]         = useState<string[]>([]);
  const [resumeName, setResumeName] = useState("");
  const [resumeB64, setResumeB64]   = useState("");

  /* auth + profile check */
  useEffect(() => {
    const e = sessionStorage.getItem("user_email");
    const r = sessionStorage.getItem("user_role");
    if (!e || r !== "candidate") { router.replace("/signin"); return; }
    setEmail(e);
    fetch(`${API}/api/candidate/profile?email=${encodeURIComponent(e)}`)
      .then(r => r.json()).then(d => {
        if (d.exists && d.profile) {
          setHasProfile(true);
          const p = d.profile;
          setName(p.name||""); setPhone(p.phone||""); setLocation(p.location||"");
          setLinkedin(p.linkedin||""); setSummary(p.summary||"");
          setExpLevel(p.experience_level||""); setAvailability(p.availability||"");
          setSalary(p.expected_salary||""); setTargetRole(p.target_role||"");
          setSkills(p.skills||[]); setRoles(p.preferred_roles||[]);
          setResumeName(p.resume_filename||"");
        }
      }).catch(()=>{}).finally(()=>setLoading(false));
  }, [router]);

  /* resume upload + AI parse */
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 5*1024*1024){ setError("Resume must be under 5 MB"); return; }
    setResumeName(file.name); setError("");
    const b64:string = await new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res((r.result as string).split(",")[1]); r.onerror=rej; r.readAsDataURL(file); });
    setResumeB64(b64);
    setParsing(true); setParseMsg("🤖 Reading your resume with AI…");
    try {
      const resp = await fetch(`${API}/api/candidate/parse-resume`,{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({resume_base64:b64}) });
      const data = await resp.json();
      if(!resp.ok) throw new Error(data.detail||"Parse failed");
      const f = data.fields;
      if(f.name&&!name) setName(f.name);
      if(f.phone&&!phone) setPhone(f.phone);
      if(f.location&&!location) setLocation(f.location);
      if(f.linkedin&&!linkedin) setLinkedin(f.linkedin);
      if(f.summary&&!summary) setSummary(f.summary);
      if(f.experience_level&&!expLevel) setExpLevel(f.experience_level);
      if(f.target_role&&!targetRole) setTargetRole(f.target_role);
      if(f.expected_salary&&!salary) setSalary(f.expected_salary);
      if(f.skills?.length&&skills.length===0) setSkills(f.skills);
      if(f.preferred_roles?.length&&roles.length===0) setRoles(f.preferred_roles);
      setParseMsg("✅ Fields auto-filled from your resume — review and edit as needed.");
    } catch(err:unknown){ setParseMsg("⚠️ "+(err instanceof Error?err.message:"Parse failed. Fill fields manually.")); }
    finally{ setParsing(false); }
  };

  const addSkill    = (s:string) => { const t=s.trim(); if(t&&!skills.includes(t)) setSkills(p=>[...p,t]); setSkillInput(""); };
  const removeSkill = (s:string) => setSkills(p=>p.filter(x=>x!==s));
  const toggleRole  = (r:string) => setRoles(p=>p.includes(r)?p.filter(x=>x!==r):[...p,r]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSuccess("");
    if(!name||!phone||!location||!expLevel||!availability||roles.length===0){
      setError("Please fill all required fields and select at least one preferred role."); return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/candidate/profile`,{ method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ email,name,phone,location,linkedin,summary, experience_level:expLevel, availability, expected_salary:salary, target_role:targetRole, skills, preferred_roles:roles, resume_filename:resumeName, resume_base64:resumeB64 }) });
      const data = await res.json();
      if(!res.ok) throw new Error(data.detail||"Save failed");
      setSubmitted(true);
    } catch(err:unknown){ setError(err instanceof Error?err.message:"Save failed"); }
    finally{ setSaving(false); }
  };

  /* Thank You screen */
  if(submitted) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#000",fontFamily:"'Geist',sans-serif",padding:24}}>
      <style dangerouslySetInnerHTML={{__html:`@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap');`}}/>
      <div style={{maxWidth:480,width:"100%",background:"#0a0a0a",border:"1px solid #262626",borderRadius:20,padding:"52px 40px",textAlign:"center"}}>
        {/* Animated checkmark */}
        <div style={{width:80,height:80,background:"#052010",border:"2px solid #16a34a",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 28px",boxShadow:"0 0 32px rgba(22,163,74,0.25)"}}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <p style={{color:"#16a34a",fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 12px"}}>Application Received</p>
        <h1 style={{color:"#fff",fontSize:28,fontWeight:800,margin:"0 0 16px",lineHeight:1.3}}>Thank you!<br/>We&apos;ll be in touch.</h1>
        <p style={{color:"#71717a",fontSize:15,margin:"0 0 12px",lineHeight:1.7}}>
          Your profile has been successfully submitted to <span style={{color:"#fff",fontWeight:600}}>KizunaHire</span>.
        </p>
        <p style={{color:"#52525b",fontSize:13,margin:"0 0 36px",lineHeight:1.7}}>
          Our team will review your details and reach out soon.<br/>Keep an eye on your inbox and phone — we&apos;ll contact you shortly!
        </p>
        {/* divider */}
        <div style={{borderTop:"1px solid #1a1a1a",margin:"0 0 28px"}}/>
        <button onClick={()=>router.push("/user/home")} style={{
          width:"100%",padding:"14px 0",borderRadius:8,border:"none",cursor:"pointer",
          background:"#16a34a",color:"#fff",fontWeight:700,fontSize:16,fontFamily:"inherit",
          transition:"background 0.2s",
        }}>
          Go to Home →
        </button>
        <p style={{color:"#3f3f46",fontSize:12,marginTop:16}}>
          Questions? Email us at <a href="mailto:ajay.grandhisila@gmail.com" style={{color:"#16a34a",textDecoration:"none"}}>ajay.grandhisila@gmail.com</a>
        </p>
      </div>
    </div>
  );

  /* Loading */
  if(loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#000"}}>
      <div style={{width:36,height:36,border:"3px solid #1c2e1c",borderTopColor:"#16a34a",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <style dangerouslySetInnerHTML={{__html:`@keyframes spin{to{transform:rotate(360deg)}}`}}/>
    </div>
  );

  /* ── Application Status Screen (already submitted) ─────────────────── */
  if(hasProfile && !success) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#000",fontFamily:"'Geist',sans-serif",padding:24}}>
      <style dangerouslySetInnerHTML={{__html:`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap');
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
      `}}/>
      <div style={{maxWidth:520,width:"100%"}}>

        {/* Header */}
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"#052010",border:"1px solid #14532d",borderRadius:20,padding:"6px 16px",marginBottom:20}}>
            <span style={{width:8,height:8,background:"#16a34a",borderRadius:"50%",display:"inline-block",animation:"pulse 1.5s ease-in-out infinite"}}/>
            <span style={{color:"#16a34a",fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.8px"}}>Application Under Review</span>
          </div>
          <h1 style={{color:"#fff",fontSize:26,fontWeight:800,margin:"0 0 8px"}}>
            Hey {name.split(" ")[0]}! You&apos;re all set 👋
          </h1>
          <p style={{color:"#71717a",fontSize:14,margin:0,lineHeight:1.7}}>
            Your profile has been submitted. Our team will reach out to you soon.
          </p>
        </div>

        {/* Profile Summary Card */}
        <div style={{background:"#0a0a0a",border:"1px solid #262626",borderRadius:16,overflow:"hidden",marginBottom:16}}>
          {/* Card header */}
          <div style={{padding:"16px 20px",borderBottom:"1px solid #1a1a1a",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,background:"#052010",border:"1px solid #14532d",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div>
              <p style={{color:"#fff",fontSize:14,fontWeight:700,margin:0}}>{name}</p>
              <p style={{color:"#52525b",fontSize:12,margin:0}}>{email}</p>
            </div>
          </div>

          {/* Details grid */}
          <div style={{padding:"20px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div>
              <p style={{color:"#52525b",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 4px"}}>Target Role</p>
              <p style={{color:"#e4e4e7",fontSize:13,margin:0}}>{targetRole||"—"}</p>
            </div>
            <div>
              <p style={{color:"#52525b",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 4px"}}>Experience</p>
              <p style={{color:"#e4e4e7",fontSize:13,margin:0}}>{expLevel||"—"}</p>
            </div>
            <div>
              <p style={{color:"#52525b",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 4px"}}>Availability</p>
              <p style={{color:"#e4e4e7",fontSize:13,margin:0}}>{availability||"—"}</p>
            </div>
            <div>
              <p style={{color:"#52525b",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 4px"}}>Expected Salary</p>
              <p style={{color:"#e4e4e7",fontSize:13,margin:0}}>{salary||"—"}</p>
            </div>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div style={{padding:"0 20px 20px"}}>
              <p style={{color:"#52525b",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px",margin:"0 0 8px"}}>Skills</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {skills.slice(0,8).map(s=>(
                  <span key={s} style={{padding:"3px 10px",borderRadius:20,fontSize:12,background:"#0d1f0d",border:"1px solid #14532d",color:"#4ade80"}}>{s}</span>
                ))}
                {skills.length > 8 && <span style={{padding:"3px 10px",borderRadius:20,fontSize:12,background:"#1a1a1a",border:"1px solid #262626",color:"#52525b"}}>+{skills.length-8} more</span>}
              </div>
            </div>
          )}

          {/* Status bar */}
          <div style={{padding:"14px 20px",background:"#0d1f0d",borderTop:"1px solid #1c2e1c",display:"flex",alignItems:"center",gap:8}}>
            <span style={{width:8,height:8,background:"#16a34a",borderRadius:"50%",display:"inline-block",animation:"pulse 1.5s ease-in-out infinite"}}/>
            <span style={{color:"#4ade80",fontSize:12,fontWeight:600}}>Application active — our team will contact you shortly</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <button onClick={()=>router.push("/user/home")} style={{
            padding:"14px 0",borderRadius:8,border:"none",cursor:"pointer",
            background:"#16a34a",color:"#fff",fontWeight:700,fontSize:15,fontFamily:"inherit",
          }}>
            Go to Dashboard →
          </button>
          <button onClick={()=>setHasProfile(false)} style={{
            padding:"14px 0",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:14,fontFamily:"inherit",
            background:"transparent",border:"1px solid #262626",color:"#71717a",
          }}>
            ✏️  Update Profile / Apply for Another Role
          </button>
        </div>

      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#000",fontFamily:"'Geist',sans-serif",padding:"40px 24px"}}>
      <style dangerouslySetInnerHTML={{__html:`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap');
        input:focus,textarea:focus,select:focus{border-color:#16a34a!important;}
        input::placeholder,textarea::placeholder{color:#52525b;}
      `}}/>

      <div style={{maxWidth:720,margin:"0 auto"}}>
        {/* Header */}
        <div style={{marginBottom:36}}>
          <p style={{color:"#16a34a",fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 8px"}}>Candidate Onboarding</p>
          <h1 style={{color:"#fff",fontSize:32,fontWeight:800,margin:"0 0 8px"}}>
            {hasProfile?"Update Your Profile":"Complete Your Profile"}
          </h1>
          <p style={{color:"#71717a",fontSize:14,margin:0}}>Upload your resume first — AI will auto-fill your details instantly.</p>
        </div>

        <div style={{background:"#0a0a0a",border:"1px solid #262626",borderRadius:20,padding:"36px 32px"}}>
          {error   && <div style={{background:"#1c0505",border:"1px solid #7f1d1d",color:"#fca5a5",borderRadius:8,padding:"10px 14px",fontSize:13,marginBottom:20}}>{error}</div>}
          {success && <div style={{background:"#052010",border:"1px solid #14532d",color:"#6ee7b7",borderRadius:8,padding:"10px 14px",fontSize:13,marginBottom:20}}>{success}</div>}

          <form onSubmit={handleSubmit}>

            {/* ── RESUME UPLOAD (top) ── */}
            <div style={{marginBottom:32}}>
              <p style={SEC}>Resume Upload</p>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFile} style={{display:"none"}}/>
              <button type="button" onClick={()=>fileRef.current?.click()} disabled={parsing} style={{
                width:"100%",padding:"22px",borderRadius:10,cursor:parsing?"not-allowed":"pointer",fontFamily:"inherit",
                background: parsing?"#0d1f0d":"transparent",
                border:`2px dashed ${parsing?"#16a34a":"#262626"}`,
                color:"#a1a1aa",fontSize:14,transition:"all 0.2s",
              }}>
                {parsing ? "⏳ Parsing resume with AI…"
                  : resumeName
                    ? <span>📄 <strong style={{color:"#fff"}}>{resumeName}</strong> — click to replace</span>
                    : <span>📎 Upload Resume <span style={{color:"#52525b",fontSize:12}}>(PDF/DOC, max 5MB) — AI auto-fills your details</span></span>
                }
              </button>
              {parseMsg && !parsing && (
                <div style={{marginTop:10,padding:"8px 12px",borderRadius:8,fontSize:12,
                  background: parseMsg.startsWith("✅")?"#052010":"#1c1505",
                  border:`1px solid ${parseMsg.startsWith("✅")?"#14532d":"#713f12"}`,
                  color: parseMsg.startsWith("✅")?"#6ee7b7":"#fcd34d"}}>
                  {parseMsg}
                </div>
              )}
            </div>

            {/* ── BASIC INFO ── */}
            <div style={{marginBottom:28}}>
              <p style={SEC}>Basic Information</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                <div>
                  <label htmlFor="ob-name" style={LBL}>Full Name *</label>
                  <input id="ob-name" name="name" style={INP} type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name" required/>
                </div>
                <div>
                  <label style={LBL}>Email</label>
                  <input style={{...INP,opacity:0.4,cursor:"not-allowed"}} type="email" value={email} readOnly/>
                </div>
                <div>
                  <label htmlFor="ob-phone" style={LBL}>Phone Number *</label>
                  <input id="ob-phone" name="phone" style={INP} type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+91 9876543210" required/>
                </div>
                <div>
                  <label htmlFor="ob-location" style={LBL}>Location *</label>
                  <input id="ob-location" name="location" style={INP} type="text" value={location} onChange={e=>setLocation(e.target.value)} placeholder="City, Country" required/>
                </div>
              </div>
              <div>
                <label htmlFor="ob-linkedin" style={LBL}>LinkedIn URL</label>
                <input id="ob-linkedin" name="linkedin" style={INP} type="url" value={linkedin} onChange={e=>setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/yourprofile"/>
              </div>
            </div>

            {/* ── PROFESSIONAL ── */}
            <div style={{marginBottom:28}}>
              <p style={SEC}>Professional Details</p>
              <div style={{marginBottom:14}}>
                <label htmlFor="ob-target" style={LBL}>Target Role / Job Title</label>
                <input id="ob-target" name="targetRole" style={INP} type="text" value={targetRole} onChange={e=>setTargetRole(e.target.value)} placeholder="e.g. Senior Backend Engineer"/>
              </div>
              <div style={{marginBottom:14}}>
                <label style={LBL}>Experience Level *</label>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {EXP.map(l=><button key={l} type="button" onClick={()=>setExpLevel(l)} style={TAG(expLevel===l)}>{l}</button>)}
                </div>
              </div>
              <div>
                <label style={LBL}>Summary / Bio</label>
                <textarea value={summary} onChange={e=>setSummary(e.target.value)} placeholder="Brief intro — your strengths and what you're looking for…" rows={3}
                  style={{...INP,resize:"vertical",lineHeight:1.6}}/>
              </div>
            </div>

            {/* ── SKILLS ── */}
            <div style={{marginBottom:28}}>
              <p style={SEC}>Skills</p>
              <div style={{display:"flex",gap:8,marginBottom:10}}>
                <input id="ob-skill" style={{...INP,flex:1}} type="text" value={skillInput}
                  onChange={e=>setSkillInput(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addSkill(skillInput);}}}
                  placeholder="Type a skill and press Enter"/>
                <button type="button" onClick={()=>addSkill(skillInput)} style={{padding:"0 18px",borderRadius:8,background:"#16a34a",border:"none",color:"#fff",fontWeight:600,cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>Add</button>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
                {SKILLS_SUGGESTIONS.filter(s=>!skills.includes(s)).slice(0,12).map(s=>(
                  <button key={s} type="button" onClick={()=>addSkill(s)} style={TAG(false)}>+ {s}</button>
                ))}
              </div>
              {skills.length>0 && (
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {skills.map(s=>(
                    <span key={s} style={{...TAG(true),display:"flex",alignItems:"center",gap:6}}>
                      {s}
                      <button type="button" onClick={()=>removeSkill(s)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.7)",cursor:"pointer",padding:0,fontSize:15,lineHeight:1}}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ── PREFERENCES ── */}
            <div style={{marginBottom:28}}>
              <p style={SEC}>Preferences</p>
              <div style={{marginBottom:16}}>
                <label style={LBL}>Preferred Roles * (select all that apply)</label>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {ROLE_SUGGESTIONS.map(r=><button key={r} type="button" onClick={()=>toggleRole(r)} style={TAG(roles.includes(r))}>{r}</button>)}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div>
                  <label style={LBL}>Availability *</label>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {AVAIL.map(a=>(
                      <button key={a} type="button" onClick={()=>setAvailability(a)}
                        style={{...TAG(availability===a),borderRadius:8,textAlign:"left",padding:"8px 12px"}}>
                        {availability===a?"✓ ":""}{a}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="ob-salary" style={LBL}>Expected Salary</label>
                  <input id="ob-salary" name="salary" style={INP} type="text" value={salary} onChange={e=>setSalary(e.target.value)} placeholder="e.g. ₹12-18 LPA"/>
                </div>
              </div>
            </div>

            {/* ── ACTIONS ── */}
            <button type="submit" disabled={saving} style={{
              width:"100%",height:50,borderRadius:8,border:"none",cursor:saving?"not-allowed":"pointer",
              background:"#16a34a",color:"#fff",fontWeight:700,fontSize:16,fontFamily:"inherit",
              opacity:saving?0.7:1,transition:"background 0.2s",
            }}>
              {saving?"Saving…":hasProfile?"Update Profile →":"Save Profile & Continue →"}
            </button>
            <button type="button" onClick={()=>router.push("/user/home")} style={{
              width:"100%",marginTop:10,padding:"12px 0",borderRadius:8,cursor:"pointer",
              background:"transparent",border:"1px solid #262626",color:"#52525b",fontSize:13,fontFamily:"inherit",
            }}>
              Skip for now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
