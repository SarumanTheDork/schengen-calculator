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
              <p style={{fontSize:11,color:"#94A3B8",margin:0}}>90/180 day rule for Indian travelers</p>
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

          {/* Share */}
          <SideCard emoji="🔥" title="Share with friends" accent="#FEF2F2" accentText="#B91C1C">
            <p style={{margin:"0 0 10px",fontSize:12,color:"#64748B",lineHeight:1.6}}>Help other travelers accurately calculate their days by sharing this free tool!</p>
            <ShareButtons />
          </SideCard>

          {/* CTA */}
          <div style={{background:"linear-gradient(135deg,#3B82F6,#2563EB)",borderRadius:16,padding:"20px",color:"#fff",textAlign:"center"}}>
            <div style={{fontSize:15,fontWeight:700,marginBottom:6}}>Planning a Schengen trip?</div>
            <p style={{fontSize:12,opacity:0.85,margin:"0 0 14px",lineHeight:1.6}}>
              Get our free document checklist tailored to your profile — self-employed, salaried, or student.
            </p>
            <div style={{display:"inline-block",background:"#fff",color:"#2563EB",fontSize:13,fontWeight:700,padding:"10px 24px",borderRadius:10,cursor:"pointer"}} aria-label="Get Free Checklist">
              Get Free Checklist →
            </div>
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
  
  return (
    <div style={{display:"flex",gap:10,marginTop:6}}>
      <a href={`https://api.whatsapp.com/send?text=${text}%20${url}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp" style={{width:36,height:36,borderRadius:10,background:"#25D366",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",textDecoration:"none"}}>
        <svg fill="currentColor" viewBox="0 0 24 24" width="18" height="18"><path d="M12.031 21.096c-1.897 0-3.754-.509-5.385-1.474l-.386-.228-4.004 1.05 1.068-3.905-.25-.398A10.985 10.985 0 0 1 1.393 10.99 11.028 11.028 0 0 1 12.031.022a11.023 11.023 0 0 1 11.027 10.967 11.024 11.024 0 0 1-11.027 11.092ZM6.368 18.067a9.308 9.308 0 0 0 5.663 1.897 9.294 9.294 0 0 0 9.293-9.308 9.295 9.295 0 0 0-9.293-9.309 9.295 9.295 0 0 0-9.293 9.309c0 1.637.426 3.23 1.233 4.654l.115.203-.63 2.302 2.355-.618.204.12Z"/><path d="m17.513 14.129-.026-.067c-.204-.378-.65-.568-1.339-.81-.663-.256-1.926-.959-2.208-1.066-.312-.135-.551-.15-.768.161-.243.378-.856 1.08-1.053 1.282-.191.203-.41.229-.687.108-.276-.121-1.35-.499-2.574-1.587-.945-.845-1.588-1.89-1.78-2.228-.19-.324-.037-.472.109-.593.12-.095.303-.325.432-.486.136-.162.176-.283.27-.472.096-.189.041-.365-.027-.486-.067-.135-.61-1.472-.851-2.012-.228-.528-.458-.459-.621-.459-.162 0-.35-.014-.525-.014-.19 0-.486.068-.742.338-.27.27-1.027 1.002-1.027 2.441 0 1.444 1.053 2.847 1.202 3.037.15.189 2.052 3.144 4.965 4.412 1.957.85 2.508.824 3.414.688.756-.12 1.926-.783 2.196-1.54.27-.756.27-1.403.189-1.539Z"/></svg>
      </a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${url}`} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" style={{width:36,height:36,borderRadius:10,background:"#0A66C2",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",textDecoration:"none"}}>
        <svg fill="currentColor" viewBox="0 0 24 24" width="16" height="16"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
      </a>
      <a href={`https://www.reddit.com/submit?url=${url}&title=${title}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Reddit" style={{width:36,height:36,borderRadius:10,background:"#FF4500",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",textDecoration:"none"}}>
        <svg fill="currentColor" viewBox="0 0 24 24" width="18" height="18"><path d="M22 11.5a2.5 2.5 0 0 0-3.32-2.37c-.77-.47-1.74-.78-2.8-.83l1-3.1 2.35.53a2 2 0 1 0 .6-1.92l-2.65-.6-1.13 3.52c-1.12.03-2.14.34-2.95.82a2.5 2.5 0 0 0-3.6 2.35c0 1.04.64 1.95 1.56 2.34-.04.18-.06.36-.06.56 0 3.31 3.13 6 7 6s7-2.69 7-6c0-.2-.02-.38-.07-.56A2.5 2.5 0 0 0 22 11.5zm-15.5 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm5.5 4.5c-1.63 0-2.85-.7-2.93-.75a.75.75 0 1 1 .96-1.18c.03.02 1.02.6 1.97.6.93 0 1.83-.55 1.87-.57a.75.75 0 1 1 .86 1.25c-.1.06-1.28.8-2.73.8v-.15zm2.5-3.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${url}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" style={{width:36,height:36,borderRadius:10,background:"#1877F2",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",textDecoration:"none"}}>
        <svg fill="currentColor" viewBox="0 0 24 24" width="16" height="16"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
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
