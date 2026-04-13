'use client';
import { useState, useMemo, useEffect } from "react";

/* ═══════════════════════════════════════════════════════════════════
   SCHENGEN 90/180 CALCULATOR — xnomadic
   Light, Apple-inspired, two-column with content sidebar
   ═══════════════════════════════════════════════════════════════════ */

const DAY=864e5;
const iso=t=>{const d=new Date(t);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const parse=s=>{if(typeof s==="number")return s;if(s instanceof Date)return s.getTime();const[y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d).getTime()};
const addD=(d,n)=>d+n*DAY;
const daysBtw=(a,b)=>Math.round((b-a)/DAY)+1;
const mn=i=>["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i];
const fmt=t=>{const d=new Date(t);return `${d.getDate()} ${mn(d.getMonth())} ${d.getFullYear()}`};
const fmtS=t=>{const d=new Date(t);return `${d.getDate()} ${mn(d.getMonth())}`};

const SCHENGEN=["Austria","Belgium","Bulgaria","Croatia","Czech Republic","Denmark","Estonia","Finland","France","Germany","Greece","Hungary","Iceland","Italy","Latvia","Liechtenstein","Lithuania","Luxembourg","Malta","Netherlands","Norway","Poland","Portugal","Romania","Slovakia","Slovenia","Spain","Sweden","Switzerland"];

/* ─── Engine ─── */
function calc(trips,dateT){
  const d=typeof dateT==="number"?dateT:parse(dateT), ws=d-179*DAY;
  let used=0;
  for(let i=0; i<trips.length; i++){
    const t=trips[i];
    const e=t.pE||parse(t.entry), x=t.pX||parse(t.exit);
    const s=e<ws?ws:e, f=x>d?d:x;
    if(s<=f)used+=Math.round((f-s)/DAY)+1;
  }
  return{used,left:Math.max(0,90-used),ws};
}
function maxStay(trips,entry){
  const e=parse(entry);
  let m=0;
  for(let i=0;i<91;i++){
    const d=e+i*DAY;
    const testTrips=[...trips,{pE:e,pX:d}];
    if(calc(testTrips,d).used<=90)m=i+1;else break;
  }
  return m;
}
function reentry(trips,todayT){
  for(let i=0;i<=400;i++){const d=todayT+i*DAY;if(calc(trips,d).left>0)return{date:d,wait:i};}
  return null;
}

/* ─── Ring ─── */
function Ring({used,size=200}){
  const[anim,setAnim]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setAnim(true),150);return()=>clearTimeout(t)},[used]);
  const left=90-used,pct=used/90,r=(size/2)-14,cx=size/2,cy=size/2,circ=2*Math.PI*r;
  const color=pct>0.85?"#E8453C":pct>0.6?"#E8973C":"#22C55E";
  const bg=pct>0.85?"#FEF2F2":pct>0.6?"#FFFBEB":"#F0FDF4";
  const word=pct>0.85?"Critical":pct>0.6?"Caution":used===0?"All clear":"On track";
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
      <div style={{position:"relative",width:size,height:size}}>
        <svg viewBox={`0 0 ${size} ${size}`} style={{width:size,height:size,transform:"rotate(-90deg)"}}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth="11"/>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="11"
            strokeLinecap="round" strokeDasharray={`${anim?pct*circ:0} ${circ}`}
            style={{transition:"stroke-dasharray 1.2s cubic-bezier(0.22,1,0.36,1)"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:48,fontWeight:750,color:"#0F172A",letterSpacing:"-0.04em",lineHeight:1}}>{left}</span>
          <span style={{fontSize:12,color:"#94A3B8",fontWeight:500,marginTop:4}}>days remaining</span>
        </div>
      </div>
      <div style={{display:"inline-flex",alignItems:"center",gap:6,background:bg,color,fontSize:12,fontWeight:600,padding:"5px 14px",borderRadius:20}}>
        <span style={{width:5,height:5,borderRadius:"50%",background:color}}/>
        {word}
      </div>
    </div>
  );
}

/* ─── Timeline ─── */
function Timeline({trips,ws,today}){
  if(!trips.length)return null;
  return(
    <div style={{marginTop:20,width:"100%"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
        <span style={{fontSize:10,color:"#94A3B8"}}>{fmtS(ws)}</span>
        <span style={{fontSize:10,color:"#64748B",fontWeight:600}}>180-day window</span>
        <span style={{fontSize:10,color:"#94A3B8"}}>{fmtS(today)}</span>
      </div>
      <div style={{position:"relative",height:28,background:"#F1F5F9",borderRadius:8,overflow:"hidden"}}>
        {trips.map((t,i)=>{
          const e=t.pE||parse(t.entry),x=t.pX||parse(t.exit);
          const oS=e<ws?ws:e,oE=x>today?today:x;
          if(oS>today||oE<ws)return null;
          const l=((oS-ws)/DAY)/180*100;
          const w=Math.max(1.5,daysBtw(oS,oE)/180*100);
          return <div key={i} style={{position:"absolute",top:4,bottom:4,left:`${l}%`,width:`${Math.min(w,100-l)}%`,background:"linear-gradient(135deg,#3B82F6,#60A5FA)",borderRadius:5,minWidth:3}} title={`${t.country}: ${fmt(e)} → ${fmt(x)}`}/>;

        })}
        <div style={{position:"absolute",right:-1,top:"50%",transform:"translateY(-50%)",width:8,height:8,borderRadius:"50%",background:"#0F172A",border:"2px solid white",boxShadow:"0 0 0 1px #0002"}}/>
      </div>
    </div>
  );
}

/* ─── Sidebar Card ─── */
function SideCard({emoji,title,children,accent="#EFF6FF",accentText="#1D4ED8"}){
  return(
    <div style={{background:"#fff",borderRadius:16,padding:"18px",border:"1px solid #F1F5F9",boxShadow:"0 1px 2px #0000000a"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
        <span style={{fontSize:18,width:32,height:32,borderRadius:9,background:accent,display:"flex",alignItems:"center",justifyContent:"center"}}>{emoji}</span>
        <span style={{fontSize:13,fontWeight:700,color:"#0F172A"}}>{title}</span>
      </div>
      <div style={{fontSize:12,color:"#64748B",lineHeight:1.7}}>{children}</div>
    </div>
  );
}

/* ─── Stat Pill for sidebar ─── */
function StatRow({label,value,sub}){
  return(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"8px 0",borderBottom:"1px solid #F8FAFC"}}>
      <span style={{fontSize:12,color:"#64748B"}}>{label}</span>
      <div style={{textAlign:"right"}}>
        <span style={{fontSize:13,fontWeight:700,color:"#0F172A"}}>{value}</span>
        {sub&&<span style={{fontSize:10,color:"#94A3B8",marginLeft:4}}>{sub}</span>}
      </div>
    </div>
  );
}

/* ═══════ MAIN ═══════ */
export default function App(){
  const[trips,setTrips]=useState([]);
  const[step,setStep]=useState("dash");
  const[entry,setEntry]=useState("");
  const[exit,setExit]=useState("");
  const[country,setCountry]=useState("");
  const[label,setLabel]=useState("");
  const[editIdx,setEditIdx]=useState(null);
  const[planEntry,setPlanEntry]=useState("");
  const[planDays,setPlanDays]=useState("");

  const [mounted, setMounted] = useState(false);
  const [todayT, setTodayT] = useState(() => { const d=new Date(); d.setHours(0,0,0,0); return d.getTime(); });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('schengen_trips');
      if (saved) {
        const parsed = JSON.parse(saved);
        setTrips(parsed.map(t => ({...t, pE: t.pE||parse(t.entry), pX: t.pX||parse(t.exit)})));
      }
    } catch(e){}
    setMounted(true);
  }, []);

  useEffect(() => {
    if(mounted) localStorage.setItem('schengen_trips', JSON.stringify(trips));
  }, [trips, mounted]);

  useEffect(() => {
    const updateToday = () => {
      const d = new Date(); d.setHours(0,0,0,0);
      setTodayT(d.getTime());
    };
    const t = setInterval(updateToday, 60000);
    window.addEventListener('focus', updateToday);
    return () => { clearInterval(t); window.removeEventListener('focus', updateToday); };
  }, []);

  const r=useMemo(()=>calc(trips,todayT),[trips,todayT]);
  const re=useMemo(()=>r.left===0?reentry(trips,todayT):null,[trips,r.left,todayT]);
  const planR=useMemo(()=>{
    if(!planEntry)return null;
    const ms=maxStay(trips,planEntry),dur=planDays?parseInt(planDays):null;
    return{max:ms,dur,over:dur?dur>ms:false,exitDate:addD(parse(planEntry),ms-1)};
  },[trips,planEntry,planDays]);

  const pct=r.used/90;
  const sc=pct>0.85?"#E8453C":pct>0.6?"#E8973C":"#22C55E";

  const save=()=>{
    if(!entry||!exit||parse(exit)<parse(entry))return;
    const t={entry,exit,country:country||"Schengen",label,pE:parse(entry),pX:parse(exit)};
    if(editIdx!==null){setTrips(ts=>ts.map((x,i)=>i===editIdx?t:x));setEditIdx(null);}
    else setTrips(ts=>[...ts,t].sort((a,b)=>a.pE - b.pE));
    setEntry("");setExit("");setCountry("");setLabel("");setStep("dash");
  };
  const edit=i=>{const t=trips[i];setEntry(t.entry);setExit(t.exit);setCountry(t.country||"");setLabel(t.label||"");setEditIdx(i);setStep("add");};
  const cancel=()=>{setEntry("");setExit("");setCountry("");setLabel("");setEditIdx(null);setStep("dash");};

  return(
    <div style={P.page}>
      {/* Header */}
      <header style={P.header}>
        <div style={P.headerInner}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:34,height:34,borderRadius:10,background:"#EFF6FF",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="#3B82F6" strokeWidth="1.5"/><path d="M5 10c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round"/><circle cx="10" cy="10" r="1.5" fill="#3B82F6"/></svg>
            </div>
            <div>
              <h1 style={{fontSize:16,fontWeight:750,margin:0,color:"#0F172A",letterSpacing:"-0.02em"}}>Schengen Calculator</h1>
              <p style={{fontSize:11,color:"#94A3B8",margin:0}}>The most comprehensive 90/180 planner for Indian travelers</p>
            </div>
          </div>
          <div style={{fontSize:12,color:"#64748B",fontWeight:500}}>{fmt(todayT)}</div>
        </div>
      </header>

      {/* Two Column Layout */}
      <div className="layout-two-col" style={P.layout}>
        {/* ─── LEFT: Calculator ─── */}
        <main style={P.mainCol}>

          {step==="dash"&&(<>

            {/* Positioning */}
            <section style={{background:"linear-gradient(135deg,#0F172A,#1E293B)",borderRadius:20,padding:"22px 24px",boxShadow:"0 10px 24px #0f172a24"}}>
              <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"#1E40AF",color:"#DBEAFE",fontSize:10,fontWeight:700,padding:"4px 10px",borderRadius:999,textTransform:"uppercase",letterSpacing:0.6,marginBottom:10}}>
                Built for serious visa planning
              </div>
              <h2 style={{fontSize:24,fontWeight:800,color:"#fff",margin:"0 0 10px",letterSpacing:"-0.02em",lineHeight:1.2}}>
                The most comprehensive Schengen day tracker for Indian travelers
              </h2>
              <p style={{fontSize:13,color:"#BFDBFE",margin:"0 0 14px",lineHeight:1.7}}>
                Not just day counting. This combines 90/180 accuracy, future trip simulation, overstay warnings, country logic, and a detailed visa-file checklist flow in one place.
              </p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:8}}>
                {[
                  "Precise rolling-window engine",
                  "Future-trip safety simulation",
                  "India-focused visa prep content",
                  "Overstay risk guardrails"
                ].map((i)=>(
                  <div key={i} style={{fontSize:11,fontWeight:600,color:"#E2E8F0",background:"#ffffff12",border:"1px solid #ffffff1f",padding:"8px 10px",borderRadius:10}}>
                    {i}
                  </div>
                ))}
              </div>
            </section>

            {/* ═══ THE RULE — explained like you're 5 ═══ */}
            <section style={{background:"#fff",borderRadius:20,padding:"24px",boxShadow:"0 1px 3px #0000000a,0 8px 24px #00000006"}}>
              <h2 style={{fontSize:18,fontWeight:750,color:"#0F172A",margin:"0 0 6px",letterSpacing:"-0.02em"}}>The Schengen Rule, Simply</h2>
              <p style={{fontSize:14,color:"#475569",margin:"0 0 18px",lineHeight:1.7}}>
                Europe has 29 countries that share open borders — called the <strong style={{color:"#1E293B"}}>Schengen Area</strong>. 
                As a visitor, here's the one rule you need to know:
              </p>

              {/* The rule in a box */}
              <div style={{background:"#EFF6FF",borderRadius:16,padding:"20px",marginBottom:18,border:"1px solid #DBEAFE"}}>
                <div style={{fontSize:16,fontWeight:750,color:"#1E40AF",marginBottom:8,lineHeight:1.3}}>
                  You get 90 days. That's it.
                </div>
                <p style={{fontSize:13,color:"#3B82F6",margin:0,lineHeight:1.7}}>
                  Out of every 180-day period, you can spend a maximum of <strong>90 days</strong> inside 
                  Schengen countries. All countries count together — 10 days in France + 10 days in 
                  Germany = 20 days used, not 10.
                </p>
              </div>

              {/* Visual example */}
              <div style={{marginBottom:18}}>
                <div style={{fontSize:12,fontWeight:700,color:"#0F172A",marginBottom:10,textTransform:"uppercase",letterSpacing:0.5}}>Quick Example</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <div style={{width:28,height:28,borderRadius:8,background:"#DBEAFE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#2563EB",flexShrink:0}}>1</div>
                    <p style={{fontSize:13,color:"#475569",margin:0,lineHeight:1.5}}>You spend <strong style={{color:"#1E293B"}}>14 days in Italy</strong> in March. You've used 14 of your 90 days.</p>
                  </div>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <div style={{width:28,height:28,borderRadius:8,background:"#DBEAFE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#2563EB",flexShrink:0}}>2</div>
                    <p style={{fontSize:13,color:"#475569",margin:0,lineHeight:1.5}}>Then <strong style={{color:"#1E293B"}}>21 days in France</strong> in June. Now you've used 35 days total.</p>
                  </div>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <div style={{width:28,height:28,borderRadius:8,background:"#DBEAFE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#2563EB",flexShrink:0}}>3</div>
                    <p style={{fontSize:13,color:"#475569",margin:0,lineHeight:1.5}}>You have <strong style={{color:"#22C55E"}}>55 days left</strong> to use before those March days "expire" from the 180-day window.</p>
                  </div>
                </div>
              </div>

              {/* Why it's confusing */}
              <div style={{background:"#FFFBEB",borderRadius:12,padding:"14px 16px",border:"1px solid #FEF3C7"}}>
                <p style={{fontSize:13,color:"#92400E",margin:0,lineHeight:1.6}}>
                  <strong>Why it's confusing:</strong> The 180-day window isn't January–June. It's a <em>rolling</em> window — every single day, the system looks back 180 days and counts how many you spent inside Schengen. That's why manual counting goes wrong. That's why this tool exists.
                </p>
              </div>
            </section>

            {/* ═══ HOW TO USE THIS TOOL — step by step ═══ */}
            <section style={{background:"#fff",borderRadius:20,padding:"24px",boxShadow:"0 1px 3px #0000000a"}}>
              <h2 style={{fontSize:16,fontWeight:750,color:"#0F172A",margin:"0 0 16px"}}>How to Use This Tool</h2>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div style={{display:"flex",gap:12}}>
                  <div style={{width:32,height:32,borderRadius:10,background:"#F0FDF4",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:"#22C55E",flexShrink:0}}>1</div>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:"#1E293B"}}>Add your past trips</div>
                    <p style={{fontSize:12,color:"#64748B",margin:"4px 0 0",lineHeight:1.6}}>Open your passport. For every Schengen trip, enter the date you arrived and the date you left. That's it — just two dates per trip.</p>
                  </div>
                </div>
                <div style={{display:"flex",gap:12}}>
                  <div style={{width:32,height:32,borderRadius:10,background:"#F0FDF4",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:"#22C55E",flexShrink:0}}>2</div>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:"#1E293B"}}>See your remaining days instantly</div>
                    <p style={{fontSize:12,color:"#64748B",margin:"4px 0 0",lineHeight:1.6}}>The ring above shows how many of your 90 days are left. Green = lots of room. Yellow = getting tight. Red = almost out.</p>
                  </div>
                </div>
                <div style={{display:"flex",gap:12}}>
                  <div style={{width:32,height:32,borderRadius:10,background:"#F0FDF4",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:"#22C55E",flexShrink:0}}>3</div>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:"#1E293B"}}>Plan your next trip</div>
                    <p style={{fontSize:12,color:"#64748B",margin:"4px 0 0",lineHeight:1.6}}>Hit "Plan Future Trip," enter when you want to go, and the tool tells you exactly how many days you can stay without overstaying.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* ═══ GAUGE (hero ring) ═══ */}
            <section style={P.card}>
              <div style={{fontSize:12,fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Your Status Right Now</div>
              <Ring used={r.used}/>
              <Timeline trips={trips} ws={r.ws} today={todayT}/>
              <div style={{display:"flex",width:"100%",marginTop:20,paddingTop:18,borderTop:"1px solid #F8FAFC"}}>
                {[{n:r.used,l:"Used"},{n:r.left,l:"Left",c:sc},{n:trips.length,l:trips.length===1?"Trip":"Trips"}].map((s,i)=>(
                  <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,
                    borderLeft:i?"1px solid #F1F5F9":"none"}}>
                    <span style={{fontSize:20,fontWeight:750,color:s.c||"#0F172A"}}>{s.n}</span>
                    <span style={{fontSize:10,color:"#94A3B8",fontWeight:500,textTransform:"uppercase",letterSpacing:0.5}}>{s.l}</span>
                  </div>
                ))}
              </div>
              {r.left===0&&re&&(
                <div style={{...P.alert,background:"#FEF2F2",borderColor:"#FECACA",color:"#B91C1C"}}>
                  All 90 days used. Re-entry opens <strong>{fmt(re.date)}</strong> ({re.wait} days away).
                </div>
              )}
              {r.left>0&&r.left<=15&&trips.length>0&&(
                <div style={{...P.alert,background:"#FFFBEB",borderColor:"#FDE68A",color:"#92400E"}}>
                  Only {r.left} days left. Keep buffer days for emergencies.
                </div>
              )}
              {/* Nudge if empty */}
              {trips.length===0&&(
                <div style={{width:"100%",marginTop:14,textAlign:"center"}}>
                  <p style={{fontSize:13,color:"#94A3B8",margin:"0 0 4px"}}>This is showing 90 days because you haven't added any trips yet.</p>
                  <p style={{fontSize:12,color:"#CBD5E1",margin:0}}>↓ Tap "Add Trip" below to get your real number ↓</p>
                </div>
              )}
            </section>

            {/* Actions */}
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setStep("add")} style={P.btnP} aria-controls="add-trip-form"><span aria-hidden="true" style={{fontSize:20,lineHeight:1}}>+</span> Add Trip</button>
              <button onClick={()=>setStep("plan")} style={P.btnS} aria-controls="plan-trip-form">Plan Future Trip</button>
            </div>

            {/* First-time helper text under buttons */}
            {trips.length===0&&(
              <div style={{textAlign:"center",padding:"0 10px"}}>
                <p style={{fontSize:13,color:"#64748B",margin:0,lineHeight:1.6}}>
                  <strong style={{color:"#1E293B"}}>First time?</strong> Grab your passport and tap <strong style={{color:"#3B82F6"}}>"+ Add Trip"</strong>. 
                  Enter the dates from your entry and exit stamps for each Schengen visit. 
                  Haven't been to Europe yet? Hit <strong style={{color:"#475569"}}>"Plan Future Trip"</strong> to see how long you can stay.
                </p>
              </div>
            )}

            {/* Trips */}
            {trips.length>0&&(
              <section>
                <h3 style={P.secTitle}>Your trips</h3>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {trips.map((t,i)=>{
                    const e=t.pE||parse(t.entry),x=t.pX||parse(t.exit),days=daysBtw(e,x);
                    const inW=x>=r.ws&&e<=todayT;
                    return(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"#fff",borderRadius:14,border:"1px solid #F1F5F9",opacity:inW?1:0.45,cursor:"pointer"}} onClick={()=>edit(i)}>
                        <div style={{width:36,height:36,borderRadius:10,background:inW?"#EFF6FF":"#F8FAFC",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>✈</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:600,color:"#1E293B"}}>{t.country}{t.label?` · ${t.label}`:""}</div>
                          <div style={{fontSize:11,color:"#94A3B8",marginTop:1}}>{fmtS(e)} → {fmtS(x)} · <span style={{fontWeight:600,color:inW?sc:"#94A3B8"}}>{days}d</span>{!inW&&<span style={{marginLeft:6,fontSize:10,color:"#CBD5E1"}}>expired</span>}</div>
                        </div>
                        <span style={{color:"#CBD5E1",fontSize:16}}>›</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Things people get wrong */}
            <section style={{background:"#fff",borderRadius:20,padding:"24px",boxShadow:"0 1px 3px #0000000a"}}>
              <h3 style={{fontSize:16,fontWeight:750,color:"#0F172A",margin:"0 0 16px"}}>Things People Get Wrong</h3>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {[
                  {wrong:"\"I was in France for 10 days and Germany for 10 days, so I used 10 days.\"",right:"Nope — all Schengen countries share the same counter. You used 20 days."},
                  {wrong:"\"I left for one day, so my counter resets.\"",right:"The counter never resets. It's a rolling window. Leaving for a day just means that day doesn't count, but all your other days still do."},
                  {wrong:"\"My flight lands at 11pm, so that day doesn't really count.\"",right:"It counts. Arrive at 11:59pm? That's a full day used. Same for departure day."},
                  {wrong:"\"I have a multi-entry visa, so I get 90 days per entry.\"",right:"Multi-entry means you can enter multiple times. But every entry adds to the same 90-day total."},
                  {wrong:"\"I transited through Frankfurt airport but didn't leave. That doesn't count.\"",right:"If you cleared immigration (passport was stamped), it counts. Even if you stayed inside the terminal."},
                ].map((item,i)=>(
                  <div key={i} style={{padding:"14px 16px",background:"#FAFBFD",borderRadius:14,border:"1px solid #F1F5F9"}}>
                    <div style={{fontSize:13,color:"#E8453C",fontWeight:600,marginBottom:6,lineHeight:1.5}}>❌ {item.wrong}</div>
                    <div style={{fontSize:13,color:"#065F46",lineHeight:1.6}}>✓ {item.right}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h3 style={P.secTitle}>Frequently asked questions</h3>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {[
                  {q:"What happens if I overstay even by 1 day?",a:"You risk fines of €200–5,000+, entry bans of 1–5 years, and for Indian passport holders specifically, it almost certainly means future Schengen visa refusals. The new EES system (Entry/Exit System) tracks this digitally — there's no hiding it anymore."},
                  {q:"When do my used days 'expire'?",a:"Each day expires exactly 180 days after it was used. So if you entered on January 1, that day stops counting against you on June 30. This is why the rolling window is tricky — your allowance gradually refills over time."},
                  {q:"I haven't been to Europe yet. Can I still use this tool?",a:"Yes! Tap 'Plan Future Trip' and enter when you want to go. Since you have no past trips, you'll have the full 90 days available."},
                  {q:"Does UK count as Schengen?",a:"No. The UK, Ireland, Turkey, and most Balkan countries are NOT in Schengen. Days spent there don't count toward your 90. This is useful — you can 'pause' your Schengen clock by visiting these countries mid-trip."},
                  {q:"I have a 2-year Schengen visa. Does that mean I can stay 2 years?",a:"No. A 2-year visa means you can enter Schengen anytime within 2 years, but each stay is still limited to 90 days within any 180-day window. The visa duration and the stay duration are different things."},
                ].map((item,i)=><FaqItem key={i} q={item.q} a={item.a}/>)}
              </div>
            </section>
          </>)}

          {/* Add/Edit */}
          {step==="add"&&(
            <section id="add-trip-form" style={P.card}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <h2 style={{fontSize:18,fontWeight:750,margin:0,color:"#0F172A"}}>{editIdx!==null?"Edit Trip":"Add a Trip"}</h2>
                <button onClick={cancel} style={P.xBtn} aria-label="Close edit trip form">✕</button>
              </div>
              <p style={{fontSize:13,color:"#94A3B8",margin:"0 0 18px"}}>Enter dates from your passport stamps.</p>
              <div style={P.fg}><label style={P.lbl}>When did you enter?</label><input type="date" value={entry} onChange={e=>setEntry(e.target.value)} style={P.inp}/></div>
              <div style={P.fg}><label style={P.lbl}>When did you leave?</label><input type="date" value={exit} onChange={e=>setExit(e.target.value)} style={P.inp}/></div>
              {entry&&exit&&parse(exit)>=parse(entry)&&(
                <div style={{textAlign:"center",fontSize:14,fontWeight:700,color:"#3B82F6",padding:"10px",background:"#EFF6FF",borderRadius:12,marginBottom:14}}>
                  {daysBtw(parse(entry),parse(exit))} days in Schengen
                </div>
              )}
              <div style={P.fg}><label style={P.lbl}>Country <span style={{fontWeight:400,color:"#CBD5E1"}}>(optional)</span></label>
                <select value={country} onChange={e=>setCountry(e.target.value)} style={P.inp}><option value="">Any Schengen country</option>{SCHENGEN.map(c=><option key={c}>{c}</option>)}</select>
              </div>
              <div style={P.fg}><label style={P.lbl}>Trip name <span style={{fontWeight:400,color:"#CBD5E1"}}>(optional)</span></label>
                <input placeholder="e.g. Summer in Italy" value={label} onChange={e=>setLabel(e.target.value)} style={P.inp}/>
              </div>
              <div style={{display:"flex",gap:8,marginTop:4}}>
                {editIdx!==null&&<button onClick={()=>{setTrips(t=>t.filter((_,j)=>j!==editIdx));cancel();}} style={{...P.btnS,color:"#E8453C",borderColor:"#FECACA",flex:"none",padding:"10px 18px"}}>Delete</button>}
                <div style={{flex:1}}/>
                <button onClick={cancel} style={{...P.btnS,flex:"none",padding:"10px 18px"}}>Cancel</button>
                <button onClick={save} style={{...P.btnP,flex:"none",padding:"10px 24px"}}>{editIdx!==null?"Update":"Add"}</button>
              </div>
            </section>
          )}

          {/* Plan */}
          {step==="plan"&&(
            <section id="plan-trip-form" style={P.card}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <h2 style={{fontSize:18,fontWeight:750,margin:0}}>Plan a Future Trip</h2>
                <button onClick={()=>{setStep("dash");setPlanEntry("");setPlanDays("")}} style={P.xBtn} aria-label="Close plan future trip form">✕</button>
              </div>
              <p style={{fontSize:13,color:"#94A3B8",margin:"0 0 18px"}}>See how many days you can stay.</p>
              <div style={P.fg}><label style={P.lbl}>When do you want to enter?</label><input type="date" value={planEntry} onChange={e=>setPlanEntry(e.target.value)} style={P.inp}/></div>
              <div style={P.fg}><label style={P.lbl}>How many days? <span style={{fontWeight:400,color:"#CBD5E1"}}>(optional)</span></label><input type="number" min={1} max={90} placeholder="e.g. 14" value={planDays} onChange={e=>setPlanDays(e.target.value)} style={P.inp}/></div>
              {planR&&(
                <div style={{padding:24,background:"#FAFBFD",borderRadius:16,border:"1px solid #F1F5F9",textAlign:"center"}}>
                  <div style={{fontSize:52,fontWeight:800,color:planR.over?"#E8453C":"#22C55E",letterSpacing:"-0.04em",lineHeight:1}}>{planR.max}</div>
                  <div style={{fontSize:12,color:"#94A3B8",marginTop:6}}>max days you can stay</div>
                  <div style={{fontSize:11,color:"#CBD5E1",marginTop:4}}>Latest exit: {fmt(planR.exitDate)}</div>
                  {planR.dur&&(
                    <div style={{padding:"10px 14px",borderRadius:12,marginTop:14,fontSize:13,fontWeight:500,lineHeight:1.5,
                      background:planR.over?"#FEF2F2":"#F0FDF4",color:planR.over?"#B91C1C":"#065F46"}}>
                      {planR.over?`⚠ ${planR.dur} days exceeds limit by ${planR.dur-planR.max}`:`✓ ${planR.dur} days is safe — ${planR.max-planR.dur} buffer days left`}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}
        </main>

        {/* ─── RIGHT: Sidebar ─── */}
        <aside className="sidebar-col hide-scrollbar" style={P.sidebar}>
          {/* Visa success stats */}
          <SideCard emoji="📊" title="India → Schengen Stats" accent="#F0FDF4" accentText="#166534">
            <StatRow label="Applications (2024)" value="1.1M+"/>
            <StatRow label="Approval rate" value="~85%"/>
            <StatRow label="Avg. refusal rate" value="~15%"/>
            <StatRow label="Easiest embassies" value="France, Switzerland"/>
            <StatRow label="Hardest embassy" value="Malta" sub="38% refusal"/>
            <p style={{marginTop:10,fontSize:11,color:"#94A3B8",lineHeight:1.6}}>Source: European Commission visa statistics 2024</p>
          </SideCard>

          {/* Share */}
          <SideCard emoji="🔥" title="Share with friends" accent="#FEF2F2" accentText="#B91C1C">
            <p style={{margin:"0 0 10px",fontSize:12,color:"#64748B",lineHeight:1.6}}>Help other travelers accurately calculate their days by sharing this free tool!</p>
            <ShareButtons />
          </SideCard>

          {/* EES Alert */}
          <SideCard emoji="🔔" title="New: Entry/Exit System (EES)" accent="#FEF3C7" accentText="#92400E">
            <p style={{margin:0}}>From 2026, all Schengen borders digitally record your entry and exit. <strong style={{color:"#1E293B"}}>Overstays are now impossible to hide.</strong> Your biometric data creates a permanent travel footprint. Accurate day tracking is no longer optional — it's essential.</p>
          </SideCard>

          {/* Escape routes */}
          <SideCard emoji="🛫" title="Pause Your Schengen Clock" accent="#EFF6FF">
            <p style={{margin:"0 0 10px"}}>These countries are <strong style={{color:"#1E293B"}}>outside Schengen</strong>. Days here don't count toward your 90:</p>
            {[
              {f:"🇬🇧",c:"UK",n:"Separate visa needed"},
              {f:"🇹🇷",c:"Turkey",n:"e-Visa with Schengen"},
              {f:"🇷🇸",c:"Serbia",n:"Visa-free with Schengen"},
              {f:"🇦🇱",c:"Albania",n:"Visa-free with Schengen"},
              {f:"🇬🇪",c:"Georgia",n:"Visa-free for Indians"},
              {f:"🇲🇪",c:"Montenegro",n:"Visa-free with Schengen"},
              {f:"🇧🇦",c:"Bosnia",n:"Visa-free with Schengen"},
              {f:"🇲🇰",c:"N. Macedonia",n:"Visa-free with Schengen"},
            ].map((r,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:i<7?"1px solid #F8FAFC":"none"}}>
                <span style={{fontSize:16}}>{r.f}</span>
                <span style={{fontSize:12,fontWeight:600,color:"#1E293B",flex:1}}>{r.c}</span>
                <span style={{fontSize:10,color:"#94A3B8"}}>{r.n}</span>
              </div>
            ))}
          </SideCard>

          {/* Common mistakes */}
          <SideCard emoji="⚠" title="Mistakes Indians Make" accent="#FEF2F2" accentText="#B91C1C">
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[
                {m:"Ignoring transit days",d:"Clearing Schengen immigration during a layover counts as a full day — even if you don't leave the airport."},
                {m:"Counting entry/exit as 1 day",d:"Arrive Monday, leave Tuesday = 2 days, not 1. Both border-crossing days count."},
                {m:"Thinking multi-entry = extra days",d:"Multi-entry lets you cross borders multiple times. Your total still can't exceed 90 days in 180."},
                {m:"Last-minute bank deposits",d:"Embassies track financial behavior over months, not just the day of application. Sudden deposits raise red flags."},
                {m:"No buffer days",d:"Flight delay = overstay = ban. Always keep 3-5 days as emergency buffer."},
              ].map((item,i)=>(
                <div key={i}>
                  <div style={{fontSize:12,fontWeight:700,color:"#1E293B"}}>{item.m}</div>
                  <div style={{fontSize:11,color:"#64748B",lineHeight:1.6,marginTop:2}}>{item.d}</div>
                </div>
              ))}
            </div>
          </SideCard>

          {/* Cost reference */}
          <SideCard emoji="💰" title="Daily Budget Reference" accent="#F5F3FF" accentText="#6D28D9">
            <p style={{margin:"0 0 8px"}}>Minimum financial proof expected by consulates (after flights & hotel booked):</p>
            <StatRow label="Germany" value="€45/day"/>
            <StatRow label="France" value="€65/day"/>
            <StatRow label="Italy" value="€52/day"/>
            <StatRow label="Spain" value="€55/day"/>
            <StatRow label="Netherlands" value="€55/day"/>
            <p style={{marginTop:8,fontSize:11,color:"#94A3B8",lineHeight:1.5}}>These are indicative. Consulates assess overall financial health, not just daily amounts.</p>
          </SideCard>

          {/* Schengen members */}
          <SideCard emoji="🇪🇺" title={`Schengen Members (${SCHENGEN.length})`} accent="#EFF6FF">
            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {SCHENGEN.map(c=><span key={c} style={{fontSize:10,color:"#475569",background:"#F1F5F9",padding:"3px 8px",borderRadius:5}}>{c}</span>)}
            </div>
          </SideCard>

          {/* CTA */}
          <div style={{background:"linear-gradient(135deg,#3B82F6,#2563EB)",borderRadius:20,padding:"22px 18px",color:"#fff",textAlign:"center",boxShadow:"0 10px 24px #2563eb40"}}>
            <div style={{fontSize:18,fontWeight:800,marginBottom:10,letterSpacing:"-0.02em"}}>Planning a Schengen trip?</div>
            <p style={{fontSize:12,opacity:0.92,margin:"0 0 16px",lineHeight:1.8}}>
              Get our free document checklist tailored to your profile — self-employed, salaried, or student.
            </p>
            <a
              href="./checklist"
              style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",background:"#fff",color:"#2563EB",fontSize:15,fontWeight:800,padding:"12px 18px",borderRadius:14,cursor:"pointer",border:"none",fontFamily:"inherit",boxShadow:"0 1px 2px #0000001f",textDecoration:"none"}}
              aria-label="Get Free Checklist"
            >
              Get Free Checklist
              <span aria-hidden="true" style={{fontSize:24,lineHeight:0.8}}>→</span>
            </a>
          </div>
        </aside>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebApplication",
                "name": "Schengen 90/180 Day Calculator",
                "url": "https://xnomadic.com/tools/schengen-calculator/",
                "applicationCategory": "TravelApplication",
                "operatingSystem": "Any",
                "description": "Free Schengen calculator for Indian travelers. Track your 90-day limit, plan future trips, and avoid overstaying in the Schengen Area."
              },
              {
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "What happens if I overstay even by 1 day?",
                    "acceptedAnswer": { "@type": "Answer", "text": "You risk fines of €200–5,000+, entry bans of 1–5 years, and for Indian passport holders specifically, it almost certainly means future Schengen visa refusals." }
                  },
                  {
                    "@type": "Question",
                    "name": "When do my used days 'expire'?",
                    "acceptedAnswer": { "@type": "Answer", "text": "Each day expires exactly 180 days after it was used. So if you entered on January 1, that day stops counting against you on June 30." }
                  },
                  {
                    "@type": "Question",
                    "name": "I haven't been to Europe yet. Can I still use this tool?",
                    "acceptedAnswer": { "@type": "Answer", "text": "Yes! Tap 'Plan Future Trip' and enter when you want to go. Since you have no past trips, you'll have the full 90 days available." }
                  },
                  {
                    "@type": "Question",
                    "name": "Does UK count as Schengen?",
                    "acceptedAnswer": { "@type": "Answer", "text": "No. The UK, Ireland, Turkey, and most Balkan countries are NOT in Schengen. Days spent there don't count toward your 90." }
                  },
                  {
                    "@type": "Question",
                    "name": "I have a 2-year Schengen visa. Does that mean I can stay 2 years?",
                    "acceptedAnswer": { "@type": "Answer", "text": "No. A 2-year visa means you can enter Schengen anytime within 2 years, but each stay is still limited to 90 days within any 180-day window." }
                  }
                ]
              }
            ]
          })
        }}
      />

      <footer style={{maxWidth:1060,margin:"0 auto",padding:"20px 20px",textAlign:"center",borderTop:"1px solid #F1F5F9"}}>
        <p style={{fontSize:10,color:"#CBD5E1",margin:0}}>Planning tool only. Not legal advice. Always verify with official authorities.</p>
        <p style={{fontSize:10,color:"#E2E8F0",margin:"4px 0 0",fontWeight:600}}>xnomadic · Built for Indian travelers</p>
      </footer>
    </div>
  );
}

function FaqItem({q,a}){
  const[open,setOpen]=useState(false);
  return(
    <button onClick={()=>setOpen(!open)} style={{width:"100%",textAlign:"left",background:"#fff",border:"1px solid #F1F5F9",borderRadius:12,padding:"12px 14px",cursor:"pointer",fontFamily:"inherit"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:13,fontWeight:600,color:"#1E293B"}}>{q}</span>
        <span style={{fontSize:16,color:"#CBD5E1",flexShrink:0,marginLeft:10,transition:"transform 0.2s",transform:open?"rotate(45deg)":"none"}}>+</span>
      </div>
      {open&&<p style={{fontSize:12,color:"#64748B",lineHeight:1.7,margin:"8px 0 0"}}>{a}</p>}
    </button>
  );
}

/* ─── Styles ─── */
function ShareButtons() {
  const url = encodeURIComponent("https://xnomadic.com/tools/schengen-calculator/");
  const text = encodeURIComponent("Track your 90-day Schengen limit effortlessly. Free calculator for Indian travelers: ");
  const title = encodeURIComponent("Schengen 90/180 Day Calculator");

  const iconStyle = { width: 22, height: 22, display: "block" };
  const btnStyle = {
    width: 54,
    height: 54,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    textDecoration: "none",
    boxShadow: "0 1px 2px #00000014",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  };

  return (
    <div style={{display:"flex",gap:12,marginTop:8}}>
      <a
        href={`https://api.whatsapp.com/send?text=${text}%20${url}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        style={{...btnStyle,background:"#25D366"}}
      >
        <svg fill="currentColor" viewBox="0 0 24 24" style={iconStyle} aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.768.966-.94 1.164-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.787-1.48-1.758-1.653-2.055-.173-.297-.018-.458.13-.606.135-.135.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.372-.025-.521-.074-.149-.669-1.612-.916-2.205-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.075-.792.372-.273.298-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.214 3.074.149.198 2.1 3.2 5.077 4.487.71.306 1.263.489 1.695.626.712.227 1.36.195 1.872.118.571-.085 1.758-.718 2.006-1.412.248-.694.248-1.289.174-1.412-.075-.124-.273-.198-.57-.347M12.003 2.003c-5.514 0-9.98 4.466-9.98 9.98 0 1.75.455 3.39 1.246 4.812L2 22l5.343-1.216a9.94 9.94 0 0 0 4.66 1.185h.004c5.51 0 9.993-4.466 9.993-9.98 0-2.672-1.04-5.184-2.928-7.072-1.887-1.887-4.4-2.914-7.07-2.914m0 18.278h-.003a8.26 8.26 0 0 1-4.208-1.15l-.303-.18-3.17.722.678-3.092-.197-.317a8.25 8.25 0 0 1-1.274-4.38c0-4.56 3.712-8.272 8.274-8.272 2.21 0 4.287.86 5.849 2.422a8.22 8.22 0 0 1 2.42 5.85c-.002 4.56-3.715 8.273-8.274 8.273"/>
        </svg>
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${url}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        style={{...btnStyle,background:"#0A66C2"}}
      >
        <svg fill="currentColor" viewBox="0 0 24 24" style={iconStyle} aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </a>
      <a
        href={`https://www.reddit.com/submit?url=${url}&title=${title}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Reddit"
        style={{...btnStyle,background:"#FF4500"}}
      >
        <svg fill="currentColor" viewBox="0 0 24 24" style={iconStyle} aria-hidden="true">
          <path d="M14.516 15.348c-.766.765-2.206.805-3.099.805-.893 0-2.333-.04-3.099-.805a.42.42 0 1 1 .595-.595c.457.457 1.54.559 2.504.559.965 0 2.047-.102 2.504-.559a.42.42 0 0 1 .595.595m-6.884-1.666a1.043 1.043 0 1 1 0-2.086 1.043 1.043 0 0 1 0 2.086m5.731-2.087a1.043 1.043 0 1 0 0 2.086 1.043 1.043 0 0 0 0-2.086M22 12a2 2 0 0 1-3.278 1.536c.051.265.078.536.078.812 0 2.812-3.134 5.087-7 5.087-3.866 0-7-2.275-7-5.087 0-.276.027-.547.079-.812A2 2 0 1 1 7.2 10.9c1.214-.822 2.896-1.333 4.745-1.37l.802-3.765 2.613.557a1.67 1.67 0 1 1-.211.979l-1.684-.359-.57 2.675c1.75.052 3.338.561 4.495 1.362A1.99 1.99 0 0 1 20 10a2 2 0 0 1 2 2m-1.161 0A.839.839 0 1 0 19.16 12a.839.839 0 0 0 1.678 0M5.839 12A.839.839 0 1 0 4.16 12a.839.839 0 0 0 1.678 0"/>
        </svg>
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${text}%20${url}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Twitter"
        style={{...btnStyle,background:"#1D9BF0"}}
      >
        <svg fill="currentColor" viewBox="0 0 24 24" style={iconStyle} aria-hidden="true">
          <path d="M23.954 4.569a10 10 0 0 1-2.825.775 4.958 4.958 0 0 0 2.163-2.723 9.896 9.896 0 0 1-3.127 1.195 4.92 4.92 0 0 0-8.384 4.482A13.969 13.969 0 0 1 1.671 3.149a4.92 4.92 0 0 0 1.523 6.57 4.9 4.9 0 0 1-2.229-.616v.061a4.923 4.923 0 0 0 3.946 4.827 4.86 4.86 0 0 1-2.212.084 4.93 4.93 0 0 0 4.604 3.417 9.867 9.867 0 0 1-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.94 13.94 0 0 0 7.548 2.212c9.142 0 14.307-7.721 13.995-14.646a9.94 9.94 0 0 0 2.38-2.527z"/>
        </svg>
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${url}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        style={{...btnStyle,background:"#1877F2"}}
      >
        <svg fill="currentColor" viewBox="0 0 24 24" style={iconStyle} aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </a>
    </div>
  );
}

/* ─── Styles ─── */
const P={
  page:{minHeight:"100vh",background:"linear-gradient(180deg,#FAFBFD,#F1F5F9)",fontFamily:"'SF Pro Display','Inter',-apple-system,system-ui,sans-serif",color:"#1E293B"},
  header:{background:"rgba(255,255,255,0.85)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderBottom:"1px solid #F1F5F9",position:"sticky",top:0,zIndex:10},
  headerInner:{maxWidth:1060,margin:"0 auto",padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"},
  layout:{maxWidth:1060,margin:"0 auto",padding:"20px 20px 40px",display:"flex",gap:24,alignItems:"flex-start"},
  mainCol:{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:18},
  sidebar:{width:320,flexShrink:0,display:"flex",flexDirection:"column",gap:14,position:"sticky",top:70,maxHeight:"calc(100vh - 90px)",overflowY:"auto",paddingBottom:20,
    // Hide scrollbar
    scrollbarWidth:"none",msOverflowStyle:"none",
  },
  card:{background:"#fff",borderRadius:20,padding:"28px 24px",boxShadow:"0 1px 3px #0000000a,0 8px 24px #00000006",display:"flex",flexDirection:"column",alignItems:"center"},
  alert:{width:"100%",marginTop:14,padding:"10px 14px",borderRadius:10,fontSize:12,lineHeight:1.5,border:"1px solid"},
  btnP:{flex:1,padding:"14px",borderRadius:14,border:"none",background:"#3B82F6",color:"#fff",fontSize:14,fontWeight:650,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 2px 8px #3B82F640"},
  btnS:{flex:1,padding:"14px",borderRadius:14,background:"#fff",border:"1px solid #E2E8F0",color:"#475569",fontSize:14,fontWeight:650,cursor:"pointer",fontFamily:"inherit"},
  secTitle:{fontSize:15,fontWeight:700,color:"#0F172A",margin:"0 0 10px"},
  xBtn:{background:"#F8FAFC",border:"none",width:30,height:30,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",color:"#94A3B8",fontSize:16,cursor:"pointer",fontFamily:"inherit"},
  fg:{marginBottom:14},
  lbl:{display:"block",fontSize:12,fontWeight:600,color:"#475569",marginBottom:5},
  inp:{width:"100%",boxSizing:"border-box",padding:"11px 14px",borderRadius:12,border:"1.5px solid #E2E8F0",background:"#FAFBFD",fontSize:14,color:"#1E293B",fontFamily:"inherit",outline:"none"},

  // Mobile responsive via media query workaround — stack on small screens
  // Since we can't use @media in inline styles, sidebar hides below 768px via JS
};
