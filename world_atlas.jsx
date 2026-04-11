import { useState, useEffect, useCallback } from "react";

const CC = { europe: "#34d399", asia: "#f87171", africa: "#fbbf24", americas: "#60a5fa", oceania: "#c084fc" };
const MW = 960, MH = 500;
const lonX = (ln) => ((ln + 180) / 360) * MW;
const latY = (lt) => { const r = (lt * Math.PI) / 180; return MH / 2 - (MH * Math.log(Math.tan(Math.PI / 4 + r / 2))) / (2 * Math.PI); };
const fmt = (n) => n >= 1e9 ? (n/1e9).toFixed(2)+"B" : n >= 1e6 ? (n/1e6).toFixed(1)+"M" : n >= 1e3 ? (n/1e3).toFixed(0)+"K" : n;

export default function WorldAtlas() {
  const [db, setDb] = useState(null);
  const [view, setView] = useState("world");
  const [cont, setCont] = useState(null);
  const [country, setCountry] = useState(null);
  const [hov, setHov] = useState(null);
  const [hovCity, setHovCity] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("wgdb_v2");
        if (r?.value) { setDb(JSON.parse(r.value)); return; }
      } catch(e) {}
      // First load - store the data
      const D = await fetch("data:application/json;base64," + btoa(unescape(encodeURIComponent(DBSTR)))).then(r=>r.json());
      setDb(D);
      try { await window.storage.set("wgdb_v2", DBSTR); } catch(e) {}
    })();
  }, []);

  const goCont = useCallback((c) => { setCont(c); setCountry(null); setView("continent"); }, []);
  const goCountry = useCallback((c) => { setCountry(c); setView("country"); }, []);
  const goBack = useCallback(() => { if(view==="country"){setCountry(null);setView("continent");} else{setCont(null);setView("world");} }, [view]);

  if (!db) return (
    <div style={S.loading}>
      <div style={{fontSize:48,marginBottom:16}}>🌍</div>
      <div style={{color:"#64748b",fontSize:14,fontFamily:"Georgia,serif"}}>Loading World Atlas...</div>
      <div style={S.loadBar}><div style={S.loadFill}/></div>
      <style>{`@keyframes ld{0%{width:5%;margin-left:0}50%{width:50%;margin-left:25%}100%{width:5%;margin-left:95%}}`}</style>
    </div>
  );

  const Nav = () => (
    <div style={S.nav}>
      {view!=="world" && <button onClick={goBack} style={S.backBtn} onMouseEnter={e=>e.target.style.borderColor="#2dd4bf"} onMouseLeave={e=>e.target.style.borderColor="#475569"}>← Back</button>}
      <span onClick={()=>{setCont(null);setCountry(null);setView("world");}} style={{...S.crumb,color:view==="world"?"#f8fafc":"#64748b",cursor:"pointer",fontWeight:view==="world"?700:400}}>🌍 World</span>
      {cont && <><span style={{color:"#334155",margin:"0 6px"}}>›</span><span onClick={()=>{setCountry(null);setView("continent");}} style={{...S.crumb,color:view==="continent"?"#f8fafc":"#64748b",cursor:view==="country"?"pointer":"default"}}>{cont.name}</span></>}
      {country && <><span style={{color:"#334155",margin:"0 6px"}}>›</span><span style={{...S.crumb,color:"#f8fafc",fontWeight:600}}>{country.name}</span></>}
      <span style={{marginLeft:"auto",fontSize:10,color:"#334155",letterSpacing:2,textTransform:"uppercase",fontFamily:"Georgia,serif"}}>Atlas DB</span>
    </div>
  );

  // ═══ WORLD VIEW ═══
  const WorldView = () => {
    const conts = db.continents;
    const contPos = { europe:{x:510,y:145}, asia:{x:670,y:155}, africa:{x:510,y:230}, americas:{x:230,y:175}, oceania:{x:730,y:270} };
    const contPaths = {
      europe:"M470,115 Q490,108 520,112 Q545,115 558,122 Q568,130 572,138 L568,148 Q555,158 535,165 Q510,170 488,165 Q472,155 468,142 Q466,130 470,115Z",
      asia:"M558,118 Q585,108 620,105 Q660,108 700,115 Q730,125 738,142 L732,160 Q715,175 685,185 Q645,192 605,185 Q575,175 562,158 Q555,140 558,118Z",
      africa:"M482,168 Q500,165 520,172 Q535,185 538,210 Q535,240 522,260 Q505,275 488,270 Q472,258 466,235 Q465,208 472,185Z",
      americas:"M195,75 Q220,68 248,78 Q268,95 272,118 Q265,140 252,158 Q255,178 260,200 Q255,228 242,255 Q225,278 208,282 Q198,268 192,240 Q185,205 182,175 Q180,145 185,115 Q188,92 195,75Z",
      oceania:"M680,210 Q705,200 728,210 Q740,225 735,242 Q722,252 700,250 Q682,242 675,228 Q674,218 680,210Z"
    };
    return (
      <div style={{display:"flex",height:"100%"}}>
        <div style={{flex:1,position:"relative"}}>
          <svg viewBox={`0 0 ${MW} ${MH}`} style={{width:"100%",height:"100%"}}>
            <defs>
              <radialGradient id="og" cx="50%" cy="50%" r="60%"><stop offset="0%" stopColor="#1a3a5c"/><stop offset="100%" stopColor="#0a1628"/></radialGradient>
              <filter id="gl"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              <pattern id="gr" width={MW/8} height={MH/6} patternUnits="userSpaceOnUse"><path d={`M ${MW/8} 0 L 0 0 0 ${MH/6}`} fill="none" stroke="#1e3a5f" strokeWidth=".3" opacity=".3"/></pattern>
            </defs>
            <rect width={MW} height={MH} fill="url(#og)"/><rect width={MW} height={MH} fill="url(#gr)"/>
            {/* Ocean labels */}
            {[{t:"PACIFIC OCEAN",x:120,y:210},{t:"ATLANTIC OCEAN",x:370,y:210},{t:"INDIAN OCEAN",x:620,y:290},{t:"ARCTIC OCEAN",x:500,y:45}].map((o,i)=>
              <text key={i} x={o.x} y={o.y} fill="#1a3654" fontSize="9" textAnchor="middle" fontFamily="Georgia,serif" fontStyle="italic" letterSpacing="3">{o.t}</text>
            )}
            {/* Sea labels */}
            {db.seas?.slice(0,8).map((s,i)=>{
              const sx=lonX(s.lng),sy=latY(s.lat);
              return sx>20&&sx<MW-20&&sy>20&&sy<MH-20 ? <text key={i} x={sx} y={sy} fill="#1e4d7a" fontSize="6.5" textAnchor="middle" fontStyle="italic" opacity=".45" fontFamily="Georgia,serif">{s.name}</text> : null;
            })}
            {/* Continent shapes */}
            {conts.map(c => {
              const h = hov===c.id, p = contPaths[c.id], pos = contPos[c.id];
              return (
                <g key={c.id} onClick={()=>goCont(c)} onMouseEnter={()=>setHov(c.id)} onMouseLeave={()=>setHov(null)} style={{cursor:"pointer"}}>
                  <path d={p} fill={CC[c.id]} fillOpacity={h?.85:.5} stroke={h?"#fff":CC[c.id]} strokeWidth={h?2.5:1} filter={h?"url(#gl)":"none"} style={{transition:"all .3s"}}/>
                  <text x={pos.x} y={pos.y} fill="#fff" fontSize={h?15:12} fontWeight="700" textAnchor="middle" fontFamily="'Trebuchet MS',sans-serif" style={{pointerEvents:"none",transition:"font-size .3s",textShadow:"0 2px 10px rgba(0,0,0,.9)"}}>{c.name}</text>
                  <text x={pos.x} y={pos.y+16} fill="#94a3b8" fontSize="9" textAnchor="middle" style={{pointerEvents:"none"}}>{c.countries.length} countries</text>
                </g>
              );
            })}
          </svg>
          <div style={{position:"absolute",bottom:10,left:14,fontSize:10,color:"#334155",fontFamily:"Georgia,serif",fontStyle:"italic"}}>Click a continent to explore its countries</div>
        </div>
        {/* Panel */}
        <div style={S.panel}>
          <div style={S.panelTitle}>Continents</div>
          {conts.map(c=>(
            <div key={c.id} onClick={()=>goCont(c)} onMouseEnter={()=>setHov(c.id)} onMouseLeave={()=>setHov(null)}
              style={{...S.listItem,borderLeft:`3px solid ${hov===c.id?CC[c.id]:"transparent"}`,background:hov===c.id?"#1e293b":"transparent"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:CC[c.id],boxShadow:`0 0 6px ${CC[c.id]}55`}}/>
                <div>
                  <div style={{color:"#e2e8f0",fontSize:13,fontWeight:500}}>{c.name}</div>
                  <div style={{color:"#64748b",fontSize:10,marginTop:2}}>{c.countries.length} countries · {fmt(c.population)}</div>
                </div>
              </div>
            </div>
          ))}
          <div style={{...S.panelTitle,marginTop:12}}>Overview</div>
          <div style={{padding:"0 16px",color:"#475569",fontSize:11,lineHeight:2}}>
            <div>Countries: {db.continents.reduce((s,c)=>s+c.countries.length,0)}</div>
            <div>Oceans: {db.oceans?.length||5} · Seas: {db.seas?.length||0}</div>
            <div>Lakes: {db.lakes?.length||0}</div>
          </div>
        </div>
      </div>
    );
  };

  // ═══ CONTINENT VIEW ═══
  const ContinentView = () => {
    const countries = cont.countries;
    const lats = countries.map(c=>c.center.lat), lngs = countries.map(c=>c.center.lng);
    const pad=50,bN=Math.max(...lats)+5,bS=Math.min(...lats)-5,bW2=Math.min(...lngs)-5,bE=Math.max(...lngs)+5;
    const pX=ln=>pad+((ln-bW2)/(bE-bW2))*(MW-pad*2), pY=lt=>pad+((bN-lt)/(bN-bS))*(MH-pad*2);
    const lakes = db.lakes?.filter(l=>l.continent===cont.id)||[];
    return (
      <div style={{display:"flex",height:"100%"}}>
        <div style={{flex:1}}>
          <svg viewBox={`0 0 ${MW} ${MH}`} style={{width:"100%",height:"100%"}}>
            <defs><radialGradient id="cg" cx="50%" cy="50%" r="55%"><stop offset="0%" stopColor={CC[cont.id]} stopOpacity=".08"/><stop offset="100%" stopColor="transparent"/></radialGradient></defs>
            <rect width={MW} height={MH} fill="#0a1628"/><rect width={MW} height={MH} fill="url(#cg)"/>
            {lakes.map((l,i)=>{
              const lx=pX(l.lng),ly=pY(l.lat),lr=Math.max(Math.sqrt(l.area_km2)*.008,3);
              return lx>0&&lx<MW&&ly>0&&ly<MH?(
                <g key={i}><circle cx={lx} cy={ly} r={lr} fill="#1a4971" opacity=".6"/><text x={lx} y={ly+lr+9} fill="#2a6fa8" fontSize="7" textAnchor="middle" fontStyle="italic">{l.name}</text></g>
              ):null;
            })}
            {countries.map(c=>{
              const cx=pX(c.center.lng),cy=pY(c.center.lat),r=Math.min(Math.max(Math.sqrt(c.area_km2)*.005,7),32),h=hov===c.id;
              return(
                <g key={c.id} onClick={()=>goCountry(c)} onMouseEnter={()=>setHov(c.id)} onMouseLeave={()=>setHov(null)} style={{cursor:"pointer"}}>
                  {h&&<circle cx={cx} cy={cy} r={r+6} fill="none" stroke={CC[cont.id]} strokeWidth="1" opacity=".4"><animate attributeName="r" values={`${r+4};${r+10};${r+4}`} dur="2s" repeatCount="indefinite"/></circle>}
                  <circle cx={cx} cy={cy} r={r} fill={CC[cont.id]} fillOpacity={h?.85:.5} stroke={h?"#fff":CC[cont.id]} strokeWidth={h?2:.5} style={{transition:"all .2s"}}/>
                  {r>10&&<text x={cx} y={cy+1} fill="#fff" fontSize={Math.min(r*.6,10)} textAnchor="middle" dominantBaseline="middle" fontWeight="700" style={{pointerEvents:"none",textShadow:"0 1px 4px rgba(0,0,0,.9)"}}>{c.id}</text>}
                  {h&&<><rect x={cx-45} y={cy-r-22} width={90} height={18} rx={4} fill="#0f172aee" stroke={CC[cont.id]} strokeWidth=".5"/><text x={cx} y={cy-r-10} fill="#f8fafc" fontSize="10" textAnchor="middle" fontWeight="600">{c.name}</text></>}
                </g>
              );
            })}
            <text x={MW/2} y={26} fill="#fff" fontSize="20" textAnchor="middle" fontWeight="700" fontFamily="Georgia,serif">{cont.name}</text>
            <text x={MW/2} y={44} fill="#94a3b8" fontSize="10" textAnchor="middle">{countries.length} Countries · {fmt(cont.area_km2)} km² · {fmt(cont.population)} people</text>
          </svg>
        </div>
        <div style={S.panel}>
          <div style={S.panelTitle}>Countries ({countries.length})</div>
          <div style={{overflowY:"auto",flex:1}}>
            {[...countries].sort((a,b)=>b.population-a.population).map(c=>(
              <div key={c.id} onClick={()=>goCountry(c)} onMouseEnter={()=>setHov(c.id)} onMouseLeave={()=>setHov(null)}
                style={{...S.listItem,borderLeft:`3px solid ${hov===c.id?CC[cont.id]:"transparent"}`,background:hov===c.id?"#1e293b":"transparent"}}>
                <div style={{color:"#e2e8f0",fontSize:12,fontWeight:500}}>{c.name}</div>
                <div style={{color:"#64748b",fontSize:10,marginTop:1}}>
                  {c.capital} · {fmt(c.population)}
                  {c.subdivisions&&<span style={{color:"#4b5563"}}> · {c.subdivisions.length} {(c.subdivisions_type||"regions").split(" ")[0]}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ═══ COUNTRY VIEW ═══
  const CountryView = () => {
    const cities = country.cities||[], subdivs = country.subdivisions||[];
    const pts = [...cities.map(c=>({lat:c.lat,lng:c.lng}))];
    subdivs.forEach(s=>{if(s.center)pts.push({lat:s.center.lat,lng:s.center.lng});});
    if(!pts.length) pts.push(country.center);
    const lats=pts.map(p=>p.lat),lngs=pts.map(p=>p.lng);
    const pad=60,bN=Math.max(...lats)+2,bS=Math.min(...lats)-2,bW2=Math.min(...lngs)-3,bE=Math.max(...lngs)+3;
    const rW=bE-bW2||10,rH=bN-bS||10;
    const pX=ln=>pad+((ln-bW2)/rW)*(MW-pad*2), pY=lt=>pad+((bN-lt)/rH)*(MH-pad*2);

    return (
      <div style={{display:"flex",height:"100%"}}>
        {/* City panel */}
        <div style={{...S.panel,borderRight:"1px solid #1e293b",borderLeft:"none",order:-1}}>
          <div style={{padding:16,borderBottom:"1px solid #1e293b"}}>
            <div style={{fontSize:17,fontWeight:700,color:"#f8fafc",fontFamily:"Georgia,serif"}}>{country.name}</div>
            <div style={{fontSize:11,color:"#64748b",marginTop:6,lineHeight:1.7}}>
              Capital: <span style={{color:"#ef4444"}}>{country.capital}</span><br/>
              Pop: {fmt(country.population)} · {country.area_km2.toLocaleString()} km²
            </div>
          </div>
          <div style={S.panelTitle}>Cities ({cities.length})</div>
          <div style={{overflowY:"auto",flex:1}}>
            {[...cities].sort((a,b)=>b.population-a.population).map((c,i)=>(
              <div key={i} onMouseEnter={()=>setHovCity(c.name)} onMouseLeave={()=>setHovCity(null)}
                style={{...S.listItem,borderLeft:`3px solid ${hovCity===c.name?(c.capital?"#ef4444":"#38bdf8"):"transparent"}`,background:hovCity===c.name?"#1e293b":"transparent"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:c.capital?"#ef4444":"#38bdf8",flexShrink:0,boxShadow:c.capital?"0 0 6px #ef444488":"none"}}/>
                  <div>
                    <div style={{color:"#e2e8f0",fontSize:12,fontWeight:c.capital?600:400}}>
                      {c.name} {c.capital&&<span style={{fontSize:8,color:"#ef4444",fontWeight:800}}>★</span>}
                    </div>
                    <div style={{color:"#64748b",fontSize:10}}>{fmt(c.population)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {subdivs.length>0 && (
            <>
              <div style={{...S.panelTitle,borderTop:"1px solid #1e293b",paddingTop:12}}>{country.subdivisions_type||"Regions"} ({subdivs.length})</div>
              <div style={{overflowY:"auto",maxHeight:180}}>
                {subdivs.map((s,i)=>(
                  <div key={i} onMouseEnter={()=>setHov(s.id)} onMouseLeave={()=>setHov(null)}
                    style={{...S.listItem,borderLeft:`3px solid ${hov===s.id?"#4ade80":"transparent"}`,background:hov===s.id?"#1e293b":"transparent"}}>
                    <div style={{color:"#bbf7d0",fontSize:11}}>{s.name}</div>
                    <div style={{color:"#475569",fontSize:9}}>Capital: {s.capital}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        {/* Map */}
        <div style={{flex:1}}>
          <svg viewBox={`0 0 ${MW} ${MH}`} style={{width:"100%",height:"100%"}}>
            <defs><radialGradient id="cog" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor={CC[cont?.id]||"#3b82f6"} stopOpacity=".1"/><stop offset="100%" stopColor="transparent"/></radialGradient></defs>
            <rect width={MW} height={MH} fill="#0a1628"/><rect width={MW} height={MH} fill="url(#cog)"/>
            {/* Subdivision regions */}
            {subdivs.map((s,i)=>{
              if(!s.center) return null;
              const sx=pX(s.center.lng),sy=pY(s.center.lat),h2=hov===s.id;
              return(
                <g key={i} onMouseEnter={()=>setHov(s.id)} onMouseLeave={()=>setHov(null)}>
                  <circle cx={sx} cy={sy} r={h2?22:16} fill="#4ade80" fillOpacity={h2?.2:.07} stroke="#4ade80" strokeWidth={h2?1.5:.5} strokeOpacity={h2?.7:.25} strokeDasharray="5,3" style={{transition:"all .2s"}}/>
                  {h2&&<text x={sx} y={sy-26} fill="#4ade80" fontSize="9" textAnchor="middle" fontWeight="600">{s.name}</text>}
                </g>
              );
            })}
            {/* Cities */}
            {cities.map((c,i)=>{
              const cx=pX(c.lng),cy=pY(c.lat),cap=c.capital,h2=hovCity===c.name,r=cap?7:4;
              return(
                <g key={i} onMouseEnter={()=>setHovCity(c.name)} onMouseLeave={()=>setHovCity(null)}>
                  {cap&&<circle cx={cx} cy={cy} r={14} fill="none" stroke="#ef4444" strokeWidth="1" opacity=".25"><animate attributeName="r" values="10;18;10" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values=".25;.08;.25" dur="3s" repeatCount="indefinite"/></circle>}
                  <circle cx={cx} cy={cy} r={h2?r+2:r} fill={cap?"#ef4444":"#38bdf8"} stroke="#fff" strokeWidth={h2?2:1} style={{transition:"all .15s",filter:cap?"drop-shadow(0 0 5px #ef4444)":"none"}}/>
                  <text x={cx+(cap?12:10)} y={cy+4} fill={h2?"#fff":"#cbd5e1"} fontSize={cap?12:10} fontWeight={cap?700:400} fontFamily="'Trebuchet MS',sans-serif" style={{textShadow:"0 1px 5px rgba(0,0,0,.9)"}}>{c.name}</text>
                  {h2&&<text x={cx+(cap?12:10)} y={cy+17} fill="#64748b" fontSize="9">{fmt(c.population)}</text>}
                </g>
              );
            })}
            <text x={MW/2} y={28} fill="#fff" fontSize="22" textAnchor="middle" fontWeight="700" fontFamily="Georgia,serif">{country.name}</text>
            <text x={MW/2} y={47} fill="#94a3b8" fontSize="10" textAnchor="middle">{country.capital} · {fmt(country.population)} · {country.area_km2.toLocaleString()} km²{subdivs.length>0&&` · ${subdivs.length} ${(country.subdivisions_type||"regions")}`}</text>
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div style={{width:"100%",height:"100vh",display:"flex",flexDirection:"column",background:"#0a1628",overflow:"hidden",fontFamily:"'Trebuchet MS','Segoe UI',sans-serif"}}>
      <Nav/>
      <div style={{flex:1,overflow:"hidden"}}>
        {view==="world"&&<WorldView/>}
        {view==="continent"&&cont&&<ContinentView/>}
        {view==="country"&&country&&<CountryView/>}
      </div>
    </div>
  );
}

const S = {
  loading:{width:"100%",height:"100vh",background:"#0a1628",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"},
  loadBar:{width:200,height:3,background:"#1e293b",borderRadius:2,marginTop:16,overflow:"hidden"},
  loadFill:{width:"30%",height:"100%",background:"linear-gradient(90deg,#3b82f6,#2dd4bf)",borderRadius:2,animation:"ld 1.5s ease-in-out infinite"},
  nav:{display:"flex",alignItems:"center",gap:8,padding:"10px 18px",background:"linear-gradient(135deg,#0f172a,#1e293b)",borderBottom:"1px solid #1e293bee",fontFamily:"'Trebuchet MS',sans-serif"},
  backBtn:{background:"none",border:"1px solid #475569",borderRadius:6,color:"#94a3b8",padding:"3px 10px",cursor:"pointer",fontSize:12,marginRight:6,transition:"all .2s"},
  crumb:{fontSize:13,transition:"color .2s"},
  panel:{width:240,background:"#0f172aee",borderLeft:"1px solid #1e293b",display:"flex",flexDirection:"column",fontFamily:"'Trebuchet MS',sans-serif"},
  panelTitle:{padding:"14px 16px 6px",fontSize:10,color:"#475569",textTransform:"uppercase",letterSpacing:2,fontWeight:700},
  listItem:{padding:"8px 16px",cursor:"pointer",transition:"all .12s"},
};

// ─── INLINE DB STRING (loaded once, then cached in persistent storage) ───
const DBSTR = '{"continents":[{"id":"europe","name":"Europe","area_km2":10180000,"population":750000000,"countries":[{"id":"DE","name":"Germany","capital":"Berlin","population":83784000,"area_km2":357022,"center":{"lat":51.2,"lng":10.4},"cities":[{"name":"Berlin","lat":52.52,"lng":13.4,"population":3748000,"capital":true},{"name":"Hamburg","lat":53.55,"lng":9.99,"population":1899000},{"name":"Munich","lat":48.13,"lng":11.58,"population":1484000},{"name":"Cologne","lat":50.94,"lng":6.96,"population":1085000},{"name":"Frankfurt","lat":50.11,"lng":8.68,"population":753000}],"subdivisions_type":"States","subdivisions":[{"id":"DE-BW","name":"Baden-Württemberg","capital":"Stuttgart","center":{"lat":48.5,"lng":9}},{"id":"DE-BY","name":"Bavaria","capital":"Munich","center":{"lat":48.8,"lng":11.5}},{"id":"DE-BE","name":"Berlin","capital":"Berlin","center":{"lat":52.5,"lng":13.4}},{"id":"DE-NW","name":"North Rhine-Westphalia","capital":"Düsseldorf","center":{"lat":51.5,"lng":7.5}},{"id":"DE-NI","name":"Lower Saxony","capital":"Hanover","center":{"lat":52.8,"lng":9.8}}]},{"id":"GB","name":"United Kingdom","capital":"London","population":67886000,"area_km2":243610,"center":{"lat":55.3,"lng":-3.4},"cities":[{"name":"London","lat":51.51,"lng":-0.13,"population":8982000,"capital":true},{"name":"Birmingham","lat":52.49,"lng":-1.89,"population":1141000},{"name":"Glasgow","lat":55.86,"lng":-4.25,"population":635000},{"name":"Manchester","lat":53.48,"lng":-2.24,"population":553000}],"subdivisions_type":"Constituent Nations","subdivisions":[{"id":"GB-ENG","name":"England","capital":"London","center":{"lat":52.5,"lng":-1.5}},{"id":"GB-SCT","name":"Scotland","capital":"Edinburgh","center":{"lat":56.5,"lng":-4}},{"id":"GB-WLS","name":"Wales","capital":"Cardiff","center":{"lat":52.1,"lng":-3.6}},{"id":"GB-NIR","name":"Northern Ireland","capital":"Belfast","center":{"lat":54.6,"lng":-6.7}}]},{"id":"FR","name":"France","capital":"Paris","population":67390000,"area_km2":640679,"center":{"lat":46,"lng":2},"cities":[{"name":"Paris","lat":48.86,"lng":2.35,"population":2161000,"capital":true},{"name":"Marseille","lat":43.3,"lng":5.37,"population":870000},{"name":"Lyon","lat":45.76,"lng":4.84,"population":522000},{"name":"Toulouse","lat":43.6,"lng":1.44,"population":493000}],"subdivisions_type":"Regions","subdivisions":[{"id":"FR-IDF","name":"Île-de-France","capital":"Paris","center":{"lat":48.8,"lng":2.5}},{"id":"FR-ARA","name":"Auvergne-Rhône-Alpes","capital":"Lyon","center":{"lat":45.4,"lng":4.4}},{"id":"FR-OCC","name":"Occitanie","capital":"Toulouse","center":{"lat":43.6,"lng":2.3}},{"id":"FR-PAC","name":"Provence-Alpes-Côte d\'Azur","capital":"Marseille","center":{"lat":43.9,"lng":6.1}}]},{"id":"IT","name":"Italy","capital":"Rome","population":60461000,"area_km2":301340,"center":{"lat":41.9,"lng":12.6},"cities":[{"name":"Rome","lat":41.9,"lng":12.5,"population":2873000,"capital":true},{"name":"Milan","lat":45.46,"lng":9.19,"population":1396000},{"name":"Naples","lat":40.85,"lng":14.27,"population":959000},{"name":"Turin","lat":45.07,"lng":7.69,"population":875000}],"subdivisions_type":"Regions","subdivisions":[{"id":"IT-25","name":"Lombardy","capital":"Milan","center":{"lat":45.6,"lng":9.9}},{"id":"IT-52","name":"Tuscany","capital":"Florence","center":{"lat":43.3,"lng":11.3}},{"id":"IT-62","name":"Lazio","capital":"Rome","center":{"lat":41.9,"lng":12.7}},{"id":"IT-82","name":"Sicily","capital":"Palermo","center":{"lat":37.6,"lng":14}}]},{"id":"ES","name":"Spain","capital":"Madrid","population":46754000,"area_km2":505990,"center":{"lat":40,"lng":-4},"cities":[{"name":"Madrid","lat":40.42,"lng":-3.7,"population":3223000,"capital":true},{"name":"Barcelona","lat":41.39,"lng":2.16,"population":1636000},{"name":"Valencia","lat":39.47,"lng":-0.38,"population":800000},{"name":"Seville","lat":37.39,"lng":-5.98,"population":688000}],"subdivisions_type":"Autonomous Communities","subdivisions":[{"id":"ES-AN","name":"Andalusia","capital":"Seville","center":{"lat":37.4,"lng":-4.8}},{"id":"ES-CT","name":"Catalonia","capital":"Barcelona","center":{"lat":41.6,"lng":1.5}},{"id":"ES-MD","name":"Madrid","capital":"Madrid","center":{"lat":40.4,"lng":-3.7}}]},{"id":"UA","name":"Ukraine","capital":"Kyiv","population":43733000,"area_km2":603500,"center":{"lat":49,"lng":32},"cities":[{"name":"Kyiv","lat":50.45,"lng":30.52,"population":2962000,"capital":true},{"name":"Kharkiv","lat":49.99,"lng":36.23,"population":1443000},{"name":"Odessa","lat":46.48,"lng":30.71,"population":1017000}]},{"id":"PL","name":"Poland","capital":"Warsaw","population":37846000,"area_km2":312696,"center":{"lat":52,"lng":20},"cities":[{"name":"Warsaw","lat":52.23,"lng":21.01,"population":1793000,"capital":true},{"name":"Kraków","lat":50.06,"lng":19.95,"population":779000},{"name":"Wrocław","lat":51.11,"lng":17.03,"population":642000}],"subdivisions_type":"Voivodeships","subdivisions":[{"id":"PL-MZ","name":"Masovia","capital":"Warsaw","center":{"lat":52.2,"lng":20.9}},{"id":"PL-MA","name":"Lesser Poland","capital":"Kraków","center":{"lat":49.8,"lng":20.1}}]},{"id":"RO","name":"Romania","capital":"Bucharest","population":19237000,"area_km2":238397,"center":{"lat":46,"lng":25},"cities":[{"name":"Bucharest","lat":44.43,"lng":26.1,"population":1883000,"capital":true}]},{"id":"NL","name":"Netherlands","capital":"Amsterdam","population":17134000,"area_km2":41543,"center":{"lat":52.1,"lng":5.3},"cities":[{"name":"Amsterdam","lat":52.37,"lng":4.89,"population":872000,"capital":true},{"name":"Rotterdam","lat":51.92,"lng":4.48,"population":651000}]},{"id":"BE","name":"Belgium","capital":"Brussels","population":11589000,"area_km2":30528,"center":{"lat":50.5,"lng":4.5},"cities":[{"name":"Antwerp","lat":51.22,"lng":4.4,"population":529000},{"name":"Brussels","lat":50.85,"lng":4.36,"population":185000,"capital":true}],"subdivisions_type":"Regions","subdivisions":[{"id":"BE-VLG","name":"Flanders","capital":"Brussels","center":{"lat":51,"lng":3.7}},{"id":"BE-WAL","name":"Wallonia","capital":"Namur","center":{"lat":50.3,"lng":4.9}}]},{"id":"CZ","name":"Czech Republic","capital":"Prague","population":10708000,"area_km2":78866,"center":{"lat":49.8,"lng":15.5},"cities":[{"name":"Prague","lat":50.08,"lng":14.44,"population":1324000,"capital":true}]},{"id":"GR","name":"Greece","capital":"Athens","population":10423000,"area_km2":131957,"center":{"lat":39,"lng":22},"cities":[{"name":"Athens","lat":37.98,"lng":23.73,"population":3153000,"capital":true}]},{"id":"PT","name":"Portugal","capital":"Lisbon","population":10196000,"area_km2":92212,"center":{"lat":39.4,"lng":-8.2},"cities":[{"name":"Lisbon","lat":38.72,"lng":-9.14,"population":545000,"capital":true},{"name":"Porto","lat":41.16,"lng":-8.63,"population":249000}]},{"id":"SE","name":"Sweden","capital":"Stockholm","population":10099000,"area_km2":450295,"center":{"lat":62,"lng":15},"cities":[{"name":"Stockholm","lat":59.33,"lng":18.07,"population":975000,"capital":true}]},{"id":"HU","name":"Hungary","capital":"Budapest","population":9660000,"area_km2":93028,"center":{"lat":47,"lng":20},"cities":[{"name":"Budapest","lat":47.5,"lng":19.04,"population":1752000,"capital":true}]}]},{"id":"asia","name":"Asia","area_km2":44580000,"population":4641054775,"countries":[{"id":"CN","name":"China","capital":"Beijing","population":1402112000,"area_km2":9596961,"center":{"lat":35.9,"lng":104.2},"cities":[{"name":"Shanghai","lat":31.23,"lng":121.47,"population":24870000},{"name":"Beijing","lat":39.9,"lng":116.41,"population":21540000,"capital":true},{"name":"Guangzhou","lat":23.13,"lng":113.26,"population":18676000},{"name":"Shenzhen","lat":22.54,"lng":114.06,"population":17560000}],"subdivisions_type":"Provinces","subdivisions":[{"id":"CN-BJ","name":"Beijing","capital":"Beijing","center":{"lat":39.9,"lng":116.4}},{"id":"CN-SH","name":"Shanghai","capital":"Shanghai","center":{"lat":31.2,"lng":121.5}},{"id":"CN-GD","name":"Guangdong","capital":"Guangzhou","center":{"lat":23.1,"lng":113.3}},{"id":"CN-SC","name":"Sichuan","capital":"Chengdu","center":{"lat":30.6,"lng":104.1}}]},{"id":"IN","name":"India","capital":"New Delhi","population":1380004000,"area_km2":3287263,"center":{"lat":20.6,"lng":79},"cities":[{"name":"Mumbai","lat":19.08,"lng":72.88,"population":20411000},{"name":"New Delhi","lat":28.61,"lng":77.21,"population":16787000,"capital":true},{"name":"Kolkata","lat":22.57,"lng":88.36,"population":14850000},{"name":"Bengaluru","lat":12.97,"lng":77.59,"population":12327000}],"subdivisions_type":"States","subdivisions":[{"id":"IN-MH","name":"Maharashtra","capital":"Mumbai","center":{"lat":19.7,"lng":75.7}},{"id":"IN-UP","name":"Uttar Pradesh","capital":"Lucknow","center":{"lat":27,"lng":81}},{"id":"IN-TN","name":"Tamil Nadu","capital":"Chennai","center":{"lat":11.1,"lng":78.7}},{"id":"IN-WB","name":"West Bengal","capital":"Kolkata","center":{"lat":22.9,"lng":87.9}}]},{"id":"ID","name":"Indonesia","capital":"Jakarta","population":273523000,"area_km2":1904569,"center":{"lat":-0.8,"lng":114},"cities":[{"name":"Jakarta","lat":-6.17,"lng":106.84,"population":10562000,"capital":true},{"name":"Surabaya","lat":-7.25,"lng":112.75,"population":2874000}],"subdivisions_type":"Provinces","subdivisions":[{"id":"ID-JK","name":"Jakarta","capital":"Jakarta","center":{"lat":-6.2,"lng":106.8}},{"id":"ID-BA","name":"Bali","capital":"Denpasar","center":{"lat":-8.4,"lng":115.2}}]},{"id":"PK","name":"Pakistan","capital":"Islamabad","population":220892000,"area_km2":881913,"center":{"lat":30.4,"lng":69.3},"cities":[{"name":"Karachi","lat":24.86,"lng":67.01,"population":14910000},{"name":"Lahore","lat":31.55,"lng":74.34,"population":11126000},{"name":"Islamabad","lat":33.69,"lng":73.04,"population":1095000,"capital":true}],"subdivisions_type":"Provinces","subdivisions":[{"id":"PK-PB","name":"Punjab","capital":"Lahore","center":{"lat":31.5,"lng":72.5}},{"id":"PK-SD","name":"Sindh","capital":"Karachi","center":{"lat":26,"lng":69}}]},{"id":"BD","name":"Bangladesh","capital":"Dhaka","population":164689000,"area_km2":147570,"center":{"lat":23.7,"lng":90.4},"cities":[{"name":"Dhaka","lat":23.81,"lng":90.41,"population":21006000,"capital":true}]},{"id":"RU","name":"Russia","capital":"Moscow","population":145934000,"area_km2":17098242,"center":{"lat":61.5,"lng":105.3},"cities":[{"name":"Moscow","lat":55.76,"lng":37.62,"population":12615000,"capital":true},{"name":"Saint Petersburg","lat":59.93,"lng":30.34,"population":5383000},{"name":"Novosibirsk","lat":55.01,"lng":82.94,"population":1625000}],"subdivisions_type":"Federal Districts","subdivisions":[{"id":"RU-MOW","name":"Central","capital":"Moscow","center":{"lat":55,"lng":38}},{"id":"RU-SIB","name":"Siberian","capital":"Novosibirsk","center":{"lat":55,"lng":85}},{"id":"RU-FER","name":"Far Eastern","capital":"Vladivostok","center":{"lat":55,"lng":135}}]},{"id":"JP","name":"Japan","capital":"Tokyo","population":126476000,"area_km2":377975,"center":{"lat":36.2,"lng":138.3},"cities":[{"name":"Tokyo","lat":35.68,"lng":139.76,"population":13960000,"capital":true},{"name":"Yokohama","lat":35.44,"lng":139.64,"population":3749000},{"name":"Osaka","lat":34.69,"lng":135.5,"population":2753000}],"subdivisions_type":"Prefectures","subdivisions":[{"id":"JP-13","name":"Tokyo","capital":"Tokyo","center":{"lat":35.7,"lng":139.7}},{"id":"JP-27","name":"Osaka","capital":"Osaka","center":{"lat":34.7,"lng":135.5}},{"id":"JP-01","name":"Hokkaido","capital":"Sapporo","center":{"lat":43.1,"lng":141.3}}]},{"id":"PH","name":"Philippines","capital":"Manila","population":109581000,"area_km2":300000,"center":{"lat":12.9,"lng":122},"cities":[{"name":"Manila","lat":14.6,"lng":120.98,"population":1780000,"capital":true}]},{"id":"VN","name":"Vietnam","capital":"Hanoi","population":97338000,"area_km2":331212,"center":{"lat":14.1,"lng":108.3},"cities":[{"name":"Ho Chi Minh City","lat":10.82,"lng":106.63,"population":8993000},{"name":"Hanoi","lat":21.03,"lng":105.85,"population":8054000,"capital":true}]},{"id":"TR","name":"Turkey","capital":"Ankara","population":84339000,"area_km2":783562,"center":{"lat":39,"lng":35.2},"cities":[{"name":"Istanbul","lat":41.01,"lng":28.98,"population":15462000},{"name":"Ankara","lat":39.93,"lng":32.86,"population":5663000,"capital":true}]},{"id":"IR","name":"Iran","capital":"Tehran","population":83992000,"area_km2":1648195,"center":{"lat":32.4,"lng":53.7},"cities":[{"name":"Tehran","lat":35.69,"lng":51.39,"population":8694000,"capital":true},{"name":"Mashhad","lat":36.31,"lng":59.6,"population":3001000}]},{"id":"TH","name":"Thailand","capital":"Bangkok","population":69799000,"area_km2":513120,"center":{"lat":15.9,"lng":101},"cities":[{"name":"Bangkok","lat":13.76,"lng":100.5,"population":10539000,"capital":true}]},{"id":"MM","name":"Myanmar","capital":"Naypyidaw","population":54409000,"area_km2":676578,"center":{"lat":19.8,"lng":96},"cities":[{"name":"Yangon","lat":16.87,"lng":96.19,"population":5160000},{"name":"Naypyidaw","lat":19.76,"lng":96.08,"population":1160000,"capital":true}]},{"id":"KR","name":"South Korea","capital":"Seoul","population":51269000,"area_km2":100210,"center":{"lat":35.9,"lng":127.8},"cities":[{"name":"Seoul","lat":37.57,"lng":126.98,"population":9776000,"capital":true},{"name":"Busan","lat":35.18,"lng":129.07,"population":3429000}]},{"id":"IQ","name":"Iraq","capital":"Baghdad","population":40222000,"area_km2":438317,"center":{"lat":33.2,"lng":43.7},"cities":[{"name":"Baghdad","lat":33.31,"lng":44.37,"population":7144000,"capital":true}]}]},{"id":"africa","name":"Africa","area_km2":30370000,"population":1340598147,"countries":[{"id":"NG","name":"Nigeria","capital":"Abuja","population":206139000,"area_km2":923768,"center":{"lat":9.1,"lng":8.7},"cities":[{"name":"Lagos","lat":6.52,"lng":3.38,"population":15388000},{"name":"Abuja","lat":9.06,"lng":7.49,"population":3464000,"capital":true}],"subdivisions_type":"States","subdivisions":[{"id":"NG-LA","name":"Lagos","capital":"Ikeja","center":{"lat":6.5,"lng":3.4}},{"id":"NG-FC","name":"FCT","capital":"Abuja","center":{"lat":9.1,"lng":7.5}}]},{"id":"ET","name":"Ethiopia","capital":"Addis Ababa","population":114963000,"area_km2":1104300,"center":{"lat":9.1,"lng":40.5},"cities":[{"name":"Addis Ababa","lat":9.03,"lng":38.75,"population":3352000,"capital":true}]},{"id":"EG","name":"Egypt","capital":"Cairo","population":102334000,"area_km2":1002450,"center":{"lat":26.8,"lng":30.8},"cities":[{"name":"Cairo","lat":30.04,"lng":31.24,"population":10230000,"capital":true},{"name":"Alexandria","lat":31.2,"lng":29.92,"population":5200000}]},{"id":"CD","name":"DR Congo","capital":"Kinshasa","population":89561000,"area_km2":2344858,"center":{"lat":-4,"lng":22},"cities":[{"name":"Kinshasa","lat":-4.44,"lng":15.27,"population":14342000,"capital":true}]},{"id":"TZ","name":"Tanzania","capital":"Dodoma","population":59734000,"area_km2":947303,"center":{"lat":-6.4,"lng":34.9},"cities":[{"name":"Dar es Salaam","lat":-6.79,"lng":39.21,"population":6702000},{"name":"Dodoma","lat":-6.16,"lng":35.75,"population":410000,"capital":true}]},{"id":"ZA","name":"South Africa","capital":"Pretoria","population":59308000,"area_km2":1221037,"center":{"lat":-29,"lng":25},"cities":[{"name":"Johannesburg","lat":-26.2,"lng":28.05,"population":5783000},{"name":"Cape Town","lat":-33.92,"lng":18.42,"population":4618000},{"name":"Pretoria","lat":-25.75,"lng":28.19,"population":2472000,"capital":true}],"subdivisions_type":"Provinces","subdivisions":[{"id":"ZA-GP","name":"Gauteng","capital":"Johannesburg","center":{"lat":-26.3,"lng":28.1}},{"id":"ZA-WC","name":"Western Cape","capital":"Cape Town","center":{"lat":-33.9,"lng":18.5}}]},{"id":"KE","name":"Kenya","capital":"Nairobi","population":53771000,"area_km2":580367,"center":{"lat":0,"lng":38},"cities":[{"name":"Nairobi","lat":-1.29,"lng":36.82,"population":4734000,"capital":true}]},{"id":"UG","name":"Uganda","capital":"Kampala","population":45741000,"area_km2":241038,"center":{"lat":1.4,"lng":32.3},"cities":[{"name":"Kampala","lat":0.35,"lng":32.58,"population":1680000,"capital":true}]},{"id":"DZ","name":"Algeria","capital":"Algiers","population":43851000,"area_km2":2381741,"center":{"lat":28,"lng":1.7},"cities":[{"name":"Algiers","lat":36.75,"lng":3.06,"population":3416000,"capital":true}]},{"id":"SD","name":"Sudan","capital":"Khartoum","population":43849000,"area_km2":1861484,"center":{"lat":12.9,"lng":30.2},"cities":[{"name":"Khartoum","lat":15.6,"lng":32.54,"population":5274000,"capital":true}]},{"id":"MA","name":"Morocco","capital":"Rabat","population":36910000,"area_km2":446550,"center":{"lat":32,"lng":-5},"cities":[{"name":"Casablanca","lat":33.57,"lng":-7.59,"population":3752000},{"name":"Rabat","lat":34.02,"lng":-6.84,"population":577000,"capital":true}]},{"id":"AO","name":"Angola","capital":"Luanda","population":32866000,"area_km2":1246700,"center":{"lat":-12.5,"lng":18.5},"cities":[{"name":"Luanda","lat":-8.84,"lng":13.29,"population":8330000,"capital":true}]}]},{"id":"americas","name":"Americas","area_km2":42549000,"population":1013480000,"countries":[{"id":"US","name":"United States","capital":"Washington, D.C.","population":331002000,"area_km2":9833520,"center":{"lat":37.1,"lng":-95.7},"cities":[{"name":"New York","lat":40.71,"lng":-74.01,"population":8336000},{"name":"Los Angeles","lat":34.05,"lng":-118.24,"population":3979000},{"name":"Chicago","lat":41.88,"lng":-87.63,"population":2693000},{"name":"Houston","lat":29.76,"lng":-95.37,"population":2320000},{"name":"Washington, D.C.","lat":38.91,"lng":-77.04,"population":689000,"capital":true}],"subdivisions_type":"States","subdivisions":[{"id":"US-CA","name":"California","capital":"Sacramento","center":{"lat":36.8,"lng":-119.4}},{"id":"US-TX","name":"Texas","capital":"Austin","center":{"lat":31,"lng":-99.9}},{"id":"US-FL","name":"Florida","capital":"Tallahassee","center":{"lat":28.6,"lng":-81.5}},{"id":"US-NY","name":"New York","capital":"Albany","center":{"lat":43,"lng":-75}}]},{"id":"BR","name":"Brazil","capital":"Brasília","population":212559000,"area_km2":8515767,"center":{"lat":-14.2,"lng":-51.9},"cities":[{"name":"São Paulo","lat":-23.55,"lng":-46.63,"population":12325000},{"name":"Rio de Janeiro","lat":-22.91,"lng":-43.17,"population":6748000},{"name":"Brasília","lat":-15.78,"lng":-47.93,"population":3055000,"capital":true}],"subdivisions_type":"States","subdivisions":[{"id":"BR-SP","name":"São Paulo","capital":"São Paulo","center":{"lat":-22,"lng":-49.3}},{"id":"BR-RJ","name":"Rio de Janeiro","capital":"Rio de Janeiro","center":{"lat":-22.3,"lng":-43}},{"id":"BR-AM","name":"Amazonas","capital":"Manaus","center":{"lat":-3.4,"lng":-65.9}}]},{"id":"MX","name":"Mexico","capital":"Mexico City","population":128932000,"area_km2":1964375,"center":{"lat":23.6,"lng":-102.5},"cities":[{"name":"Mexico City","lat":19.43,"lng":-99.13,"population":9209000,"capital":true},{"name":"Guadalajara","lat":20.66,"lng":-103.35,"population":1495000}],"subdivisions_type":"States","subdivisions":[{"id":"MX-CMX","name":"Mexico City","capital":"Mexico City","center":{"lat":19.4,"lng":-99.1}},{"id":"MX-JAL","name":"Jalisco","capital":"Guadalajara","center":{"lat":20.6,"lng":-103.3}}]},{"id":"CO","name":"Colombia","capital":"Bogotá","population":50882000,"area_km2":1141748,"center":{"lat":4.6,"lng":-74.3},"cities":[{"name":"Bogotá","lat":4.71,"lng":-74.07,"population":7181000,"capital":true},{"name":"Medellín","lat":6.25,"lng":-75.57,"population":2569000}]},{"id":"AR","name":"Argentina","capital":"Buenos Aires","population":45195000,"area_km2":2780400,"center":{"lat":-38.4,"lng":-63.6},"cities":[{"name":"Buenos Aires","lat":-34.6,"lng":-58.38,"population":2891000,"capital":true},{"name":"Córdoba","lat":-31.42,"lng":-64.19,"population":1329000}],"subdivisions_type":"Provinces","subdivisions":[{"id":"AR-C","name":"Buenos Aires City","capital":"Buenos Aires","center":{"lat":-34.6,"lng":-58.4}},{"id":"AR-X","name":"Córdoba","capital":"Córdoba","center":{"lat":-31.4,"lng":-64.2}}]},{"id":"CA","name":"Canada","capital":"Ottawa","population":37742000,"area_km2":9984670,"center":{"lat":56.1,"lng":-106.3},"cities":[{"name":"Toronto","lat":43.65,"lng":-79.38,"population":2930000},{"name":"Montreal","lat":45.5,"lng":-73.57,"population":1780000},{"name":"Ottawa","lat":45.42,"lng":-75.69,"population":994000,"capital":true}],"subdivisions_type":"Provinces","subdivisions":[{"id":"CA-ON","name":"Ontario","capital":"Toronto","center":{"lat":51.3,"lng":-85.3}},{"id":"CA-QC","name":"Quebec","capital":"Quebec City","center":{"lat":52.9,"lng":-73.5}},{"id":"CA-BC","name":"British Columbia","capital":"Victoria","center":{"lat":53.7,"lng":-127.6}}]},{"id":"PE","name":"Peru","capital":"Lima","population":32971000,"area_km2":1285216,"center":{"lat":-9.2,"lng":-75},"cities":[{"name":"Lima","lat":-12.05,"lng":-77.04,"population":10719000,"capital":true}]},{"id":"VE","name":"Venezuela","capital":"Caracas","population":28435000,"area_km2":916445,"center":{"lat":6.4,"lng":-66.6},"cities":[{"name":"Caracas","lat":10.48,"lng":-66.9,"population":2935000,"capital":true}]},{"id":"CL","name":"Chile","capital":"Santiago","population":19116000,"area_km2":756102,"center":{"lat":-35.7,"lng":-71.5},"cities":[{"name":"Santiago","lat":-33.45,"lng":-70.67,"population":5614000,"capital":true}]},{"id":"EC","name":"Ecuador","capital":"Quito","population":17643000,"area_km2":283561,"center":{"lat":-1.8,"lng":-78.2},"cities":[{"name":"Guayaquil","lat":-2.17,"lng":-79.92,"population":2698000},{"name":"Quito","lat":-0.18,"lng":-78.47,"population":1978000,"capital":true}]},{"id":"GT","name":"Guatemala","capital":"Guatemala City","population":17915000,"area_km2":108889,"center":{"lat":15.8,"lng":-90.2},"cities":[{"name":"Guatemala City","lat":14.63,"lng":-90.55,"population":2450000,"capital":true}]},{"id":"BO","name":"Bolivia","capital":"La Paz","population":11673000,"area_km2":1098581,"center":{"lat":-16.3,"lng":-63.6},"cities":[{"name":"La Paz","lat":-16.49,"lng":-68.12,"population":816000,"capital":true}]}]},{"id":"oceania","name":"Oceania","area_km2":8525989,"population":42677813,"countries":[{"id":"AU","name":"Australia","capital":"Canberra","population":25499000,"area_km2":7692024,"center":{"lat":-25.3,"lng":133.8},"cities":[{"name":"Sydney","lat":-33.87,"lng":151.21,"population":5312000},{"name":"Melbourne","lat":-37.81,"lng":144.96,"population":5078000},{"name":"Brisbane","lat":-27.47,"lng":153.02,"population":2514000},{"name":"Perth","lat":-31.95,"lng":115.86,"population":2085000},{"name":"Canberra","lat":-35.28,"lng":149.13,"population":462000,"capital":true}],"subdivisions_type":"States & Territories","subdivisions":[{"id":"AU-NSW","name":"New South Wales","capital":"Sydney","center":{"lat":-31.8,"lng":147.3}},{"id":"AU-VIC","name":"Victoria","capital":"Melbourne","center":{"lat":-36.9,"lng":145}},{"id":"AU-QLD","name":"Queensland","capital":"Brisbane","center":{"lat":-20.9,"lng":142.7}},{"id":"AU-WA","name":"Western Australia","capital":"Perth","center":{"lat":-25,"lng":122.8}}]},{"id":"PG","name":"Papua New Guinea","capital":"Port Moresby","population":8947000,"area_km2":462840,"center":{"lat":-6.3,"lng":147},"cities":[{"name":"Port Moresby","lat":-9.48,"lng":147.15,"population":364000,"capital":true}]},{"id":"NZ","name":"New Zealand","capital":"Wellington","population":5084000,"area_km2":268838,"center":{"lat":-40.9,"lng":174.9},"cities":[{"name":"Auckland","lat":-36.85,"lng":174.76,"population":1571000},{"name":"Wellington","lat":-41.29,"lng":174.78,"population":215000,"capital":true}],"subdivisions_type":"Regions","subdivisions":[{"id":"NZ-AUK","name":"Auckland","capital":"Auckland","center":{"lat":-36.8,"lng":174.8}},{"id":"NZ-WGN","name":"Wellington","capital":"Wellington","center":{"lat":-41.3,"lng":175}}]},{"id":"FJ","name":"Fiji","capital":"Suva","population":896000,"area_km2":18274,"center":{"lat":-17.7,"lng":178.1},"cities":[{"name":"Suva","lat":-18.14,"lng":178.44,"population":93000,"capital":true}]}]}],"oceans":[{"id":"pacific","name":"Pacific Ocean"},{"id":"atlantic","name":"Atlantic Ocean"},{"id":"indian","name":"Indian Ocean"},{"id":"southern","name":"Southern Ocean"},{"id":"arctic","name":"Arctic Ocean"}],"seas":[{"id":"mediterranean","name":"Mediterranean Sea","lat":35,"lng":18},{"id":"caribbean","name":"Caribbean Sea","lat":15,"lng":-75},{"id":"south_china","name":"South China Sea","lat":12,"lng":114},{"id":"gulf_of_mexico","name":"Gulf of Mexico","lat":25,"lng":-90},{"id":"north_sea","name":"North Sea","lat":56,"lng":3},{"id":"red_sea","name":"Red Sea","lat":20,"lng":38},{"id":"baltic","name":"Baltic Sea","lat":58,"lng":20},{"id":"black_sea","name":"Black Sea","lat":43,"lng":35}],"lakes":[{"id":"lake_superior","name":"Lake Superior","continent":"americas","lat":47.7,"lng":-87.5,"area_km2":82100},{"id":"lake_victoria","name":"Lake Victoria","continent":"africa","lat":-1,"lng":33,"area_km2":68870},{"id":"lake_baikal","name":"Lake Baikal","continent":"asia","lat":53.5,"lng":108,"area_km2":31722},{"id":"lake_tanganyika","name":"Lake Tanganyika","continent":"africa","lat":-6,"lng":29.5,"area_km2":32600},{"id":"lake_malawi","name":"Lake Malawi","continent":"africa","lat":-12,"lng":34.5,"area_km2":29600}]}';
