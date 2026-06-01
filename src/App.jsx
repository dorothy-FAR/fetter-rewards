/* eslint-disable */
import { useState, useEffect, useCallback } from "react";

const LOGO_FULL = "/logo-full.png";
const LOGO_SQUARE = "/logo-square.jpg";
const SUPABASE_URL = "https://fcfjucdwhykngrfnaqtm.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjZmp1Y2R3aHlrbmdyZm5hcXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MTg2NzcsImV4cCI6MjA5NDk5NDY3N30.zu2xiT20O9vshVStyeuj2MbyhhYRdGt94265m5VNHpU";

// ─── SUPABASE CLIENT ─────────────────────────────────────────────────────────
const SB_HEADERS = {
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json"
};

const db = {
  async query(table, params = "") {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}${params}`, {
        method: "GET",
        mode: "cors",
        headers: SB_HEADERS
      });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    } catch(e) { console.error("DB query error:", e); throw e; }
  },
  async insert(table, data) {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: "POST",
        mode: "cors",
        headers: { ...SB_HEADERS, "Prefer": "return=representation" },
        body: JSON.stringify(data)
      });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    } catch(e) { console.error("DB insert error:", e); throw e; }
  },
  async update(table, match, data) {
    try {
      const params = Object.entries(match).map(([k,v])=>`${k}=eq.${encodeURIComponent(v)}`).join("&");
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
        method: "PATCH",
        mode: "cors",
        headers: { ...SB_HEADERS, "Prefer": "return=representation" },
        body: JSON.stringify(data)
      });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    } catch(e) { console.error("DB update error:", e); throw e; }
  },
  async delete(table, match) {
    try {
      const params = Object.entries(match).map(([k,v])=>`${k}=eq.${encodeURIComponent(v)}`).join("&");
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
        method: "DELETE",
        mode: "cors",
        headers: SB_HEADERS
      });
      if (!r.ok) throw new Error(await r.text());
      return true;
    } catch(e) { console.error("DB delete error:", e); throw e; }
  }
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const C = {
  black:"#000000", dark:"#111111", dark2:"#1a1a1a", dark3:"#222222",
  mid:"#565656", gray:"#afafaf", gray2:"#c2c2c2", light:"#f4f4f4", white:"#ffffff",
  orange:"#ed7d05", orange2:"#c6761f", orange3:"#ff961c",
  alaNavy:"#0a1628", alaDark:"#0d1f3c", alaBorder:"#1a3a6b",
  alaRed:"#c8102e", alaBlue:"#003f87", alaGold:"#c8a951",
};

const TIERS = [
  { name:"FAR Family", min:0,    max:749,      color:"#afafaf", icon:"🔑", order:0,
    perks:["Earn 1 pt per $1 spent","+50 pts per invoiced visit","Redeem 1,000 pts for a $25 coupon","Max 2 coupons redeemable per visit","Referral bonus — 1,000 pts per referred friend","Points are non-transferable","Points expire after 18 months of no visit activity","Coupons valid for 12 months once issued"] },
  { name:"FAR Crew",   min:750,  max:1999,     color:"#c6761f", icon:"🔧", order:1,
    perks:["Earn 1 pt per $1 spent","+50 pts per invoiced visit","Redeem 1,000 pts for a $25 coupon","Max 2 coupons redeemable per visit","Referral bonus — 1,000 pts per referred friend","Seasonal promo access","Points are non-transferable","Points expire after 18 months of no visit activity","Coupons valid for 12 months once issued"] },
  { name:"FAR Pro",    min:2000, max:4999,     color:"#ed7d05", icon:"⚙️", order:2,
    perks:["Earn 1 pt per $1 spent","+50 pts per invoiced visit","Redeem 1,000 pts for a $25 coupon","Max 2 coupons redeemable per visit","Referral bonus — 1,000 pts per referred friend","Seasonal promo access","Birthday double points — all month, capped at +500 bonus pts","Points are non-transferable","Points expire after 18 months of no visit activity","Coupons valid for 12 months once issued"] },
  { name:"FAR Elite",  min:5000, max:Infinity, color:"#ff961c", icon:"🏆", order:3,
    perks:["Earn 1 pt per $1 spent","+50 pts per invoiced visit","Redeem 1,000 pts for a $25 coupon","Max 2 coupons redeemable per visit","Referral bonus — 1,000 pts per referred friend","Seasonal promo access","Birthday double points — all month, capped at +500 bonus pts","Priority scheduling","Free air & cabin filter once per year","Points are non-transferable","Points expire after 18 months of no visit activity","Coupons valid for 12 months once issued"] },
];

const BONUS_ACTIONS = [
  { id:"referral",    label:"Refer a Friend",           pts:1000, desc:"Your friend completes their first visit",                  once:false },
  { id:"testimonial", label:"Film a Video Testimonial", pts:500,  desc:"Filmed in-shop, verified by service advisor",              once:true  },
  { id:"social",      label:"Social Media Shoutout",    pts:250,  desc:"Share our page or give us a shoutout — one time",          once:true  },
];

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const ALA_NAME = "American Leadership Academy (ALA) of Applied Technology — Automotive Program";
const ALA_SHORT = "ALA Automotive Program";

const TERMS = `FETTER AUTO REWARDS (F.A.R.) — TERMS & CONDITIONS

1. ENROLLMENT
Membership is open to all customers of Fetter Automotive Repair. Enrollment is free and requires a valid name, phone number, and email address. Birth month is optional but required to receive birthday double points.

2. EARNING POINTS
Members earn 1 point for every $1 spent on invoiced services, plus 50 bonus points per invoiced visit. Points are non-transferable and may not be combined between accounts.

3. REDEEMING POINTS
1,000 points = $25 reward. Members may choose to receive a $25 coupon toward their next service, or donate the $25 value to the ${ALA_NAME}. A maximum of 2 coupons ($50) may be redeemed per visit. Coupons have no cash value.

4. TIERS
Tiers are based on anniversary year spend (12 months from signup date). FAR Family: $0–$749/yr. FAR Crew: $750–$1,999/yr. FAR Pro: $2,000–$4,999/yr. FAR Elite: $5,000+/yr. Tier upgrades take effect immediately. Tier downgrades occur at the anniversary date only. Members receive a 60-day warning if spend is at risk of dropping below their current tier threshold.

5. BIRTHDAY BONUS
FAR Pro and FAR Elite members earn double points during their birth month, capped at 500 bonus points per month.

6. REFERRAL BONUS
Members earn 1,000 points when a referred friend completes their first paid visit.

7. BONUS ACTIONS
One-time bonuses: video testimonial (500 pts), social media shoutout (250 pts). Recurring: referrals. All verified by a service advisor.

8. EXPIRATION
Points expire after 18 months of no visit activity. Reward coupons expire 12 months after issuance. Donated rewards do not expire.

9. DONATIONS & RECOGNITION
Members may donate their $25 reward value to the ${ALA_NAME}. Donors are recognized on the in-app leaderboard and celebrated on Fetter Automotive Repair's social media each December, when the year's total donations are presented to ALA students.

10. GENERAL
Fetter Automotive Repair reserves the right to modify or discontinue F.A.R. at any time. Points and coupons have no cash value. Membership may be revoked for abuse of the program.`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function getTier(spent) { return TIERS.slice().reverse().find(t=>spent>=t.min)||TIERS[0]; }
function normalizePhone(phone) {
  return phone.replace(/\D/g, '');
}

function isBirthdayMonth(birthMonth) {
  if (birthMonth===null||birthMonth===undefined) return false;
  return new Date().getMonth()===parseInt(birthMonth);
}
function getYearDonated(coupons=[]) {
  const year=new Date().getFullYear();
  return coupons.filter(c=>c.donated&&new Date(c.created_at).getFullYear()===year).reduce((s,c)=>s+25,0);
}

const S = {
  screen: { minHeight:"100vh", background:C.black, color:C.white, fontFamily:"'Barlow',sans-serif", maxWidth:430, margin:"0 auto" },
  btn: (bg,color,extra={}) => ({ padding:"13px 20px", borderRadius:10, border:"none", background:bg, color, cursor:"pointer", fontFamily:"'Oswald',sans-serif", fontSize:14, fontWeight:600, letterSpacing:3, textTransform:"uppercase", width:"100%", ...extra }),
  input: { width:"100%", padding:"12px 14px", borderRadius:10, border:`1px solid ${C.mid}`, background:C.dark2, color:C.white, fontFamily:"'Barlow',sans-serif", fontSize:14, outline:"none", boxSizing:"border-box", marginBottom:14 },
  label: { fontSize:10, color:C.gray, textTransform:"uppercase", letterSpacing:3, fontFamily:"'Oswald',sans-serif", display:"block", marginBottom:6 },
  card: (extra={}) => ({ background:C.dark2, border:`1px solid ${C.mid}`, borderRadius:14, padding:18, marginBottom:12, ...extra }),
};

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function ProgressBar({ spent }) {
  const tier=getTier(spent), idx=TIERS.indexOf(tier), next=TIERS[idx+1];
  if (!next) return <div style={{textAlign:"center",color:C.orange3,fontFamily:"'Oswald',sans-serif",fontSize:12,letterSpacing:3,textTransform:"uppercase"}}>🏆 Maximum Tier — FAR Elite</div>;
  const pct=Math.min(((spent-tier.min)/(next.min-tier.min))*100,100);
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
        <span style={{color:tier.color,fontSize:11,fontFamily:"'Oswald',sans-serif",letterSpacing:2,textTransform:"uppercase"}}>{tier.name}</span>
        <span style={{color:C.gray,fontSize:11}}>${(next.min-spent).toLocaleString()} to {next.name}</span>
      </div>
      <div style={{background:C.dark3,borderRadius:3,height:6,overflow:"hidden"}}>
        <div style={{background:`linear-gradient(90deg,${tier.color},${next.color})`,width:`${pct}%`,height:"100%",borderRadius:3,transition:"width 0.8s"}} />
      </div>
    </div>
  );
}

function TierBadge({ tier, size="sm" }) {
  return <span style={{background:`${tier.color}20`,color:tier.color,border:`1px solid ${tier.color}50`,borderRadius:6,padding:size==="lg"?"5px 14px":"3px 10px",fontSize:size==="lg"?13:11,fontFamily:"'Oswald',sans-serif",fontWeight:600,letterSpacing:2,textTransform:"uppercase",whiteSpace:"nowrap"}}>{tier.icon} {tier.name}</span>;
}

function TermsModal({ onClose }) {
  return (
    <div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:999,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{background:C.dark,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:430,maxHeight:"80vh",overflow:"hidden",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.mid}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:15,fontWeight:600,letterSpacing:3,textTransform:"uppercase"}}>Terms & Conditions</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.gray,cursor:"pointer",fontSize:22,lineHeight:1}}>✕</button>
        </div>
        <div style={{padding:20,overflowY:"auto",fontSize:12,color:C.gray2,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{TERMS}</div>
        <div style={{padding:"16px 20px",borderTop:`1px solid ${C.mid}`}}>
          <button onClick={onClose} style={S.btn(C.orange,C.black)}>Close</button>
        </div>
      </div>
    </div>
  );
}

function LoadingScreen({ message="Loading..." }) {
  return (
    <div style={{...S.screen,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:`radial-gradient(ellipse at top,#3a3a3a 0%,#1a1a1a 40%,${C.black} 75%)`}}>
      <img src={LOGO_FULL} alt="Fetter" style={{width:"100%",maxWidth:300,marginBottom:24}} />
      <div style={{fontFamily:"'Oswald',sans-serif",fontSize:13,color:C.gray,letterSpacing:4,textTransform:"uppercase"}}>{message}</div>
      <div style={{marginTop:16,display:"flex",gap:6}}>
        {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:C.orange,animation:`pulse 1.2s ${i*0.2}s infinite`}} />)}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:0.2}50%{opacity:1}}`}</style>
    </div>
  );
}

// ─── COUPON CARD ─────────────────────────────────────────────────────────────
function CouponCard({ coupon, customerName, tier }) {
  const expiry = coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "";
  return (
    <div style={{background:`linear-gradient(135deg,${C.dark2},${C.dark3})`,border:`2px solid ${C.orange}`,borderRadius:16,padding:20,marginBottom:12,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",right:-8,top:-8,fontSize:70,opacity:0.05}}>⚙️</div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <img src={LOGO_SQUARE} alt="FAR" style={{height:34,width:34,borderRadius:6,mixBlendMode:"screen"}} />
          <div>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:9,color:C.orange,letterSpacing:3,textTransform:"uppercase"}}>Fetter Auto Rewards</div>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:9,color:C.gray,letterSpacing:2,textTransform:"uppercase",fontStyle:"italic"}}>FETTER is BETTER</div>
          </div>
        </div>
        <TierBadge tier={tier} />
      </div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
        <div style={{fontSize:28}}>⚙️</div>
        <div>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:11,color:C.gray,letterSpacing:3,textTransform:"uppercase"}}>Reward Coupon</div>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:44,fontWeight:700,color:C.orange,lineHeight:1}}>$25 <span style={{fontSize:18,color:C.gray2,fontWeight:400}}>OFF</span></div>
        </div>
      </div>
      <div style={{borderTop:`1px solid ${C.mid}`,paddingTop:12}}>
        <div style={{fontFamily:"'Oswald',sans-serif",fontSize:15,color:C.white,letterSpacing:2}}>{customerName.toUpperCase()}</div>
        <div style={{fontSize:11,color:C.gray,marginTop:3}}>Show to service advisor at checkout · Max 2 per visit</div>
        <div style={{fontSize:10,color:C.mid,marginTop:4}}>{expiry && `Expires ${expiry} · `}Non-transferable · Fetter Automotive Repair</div>
      </div>
    </div>
  );
}

// ─── DONATION CERTIFICATE ─────────────────────────────────────────────────────
function DonationCert({ coupon, customerName }) {
  const donatedDate = coupon.created_at ? new Date(coupon.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "";
  return (
    <div style={{background:`linear-gradient(160deg,${C.alaNavy} 0%,${C.alaDark} 60%,#1a0a0a 100%)`,border:`2px solid ${C.alaBlue}`,borderRadius:16,padding:20,marginBottom:12,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",right:-10,top:20,fontSize:60,opacity:0.06}}>⭐</div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
        <div style={{fontSize:28}}>🎓⭐</div>
        <div>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:9,color:C.alaGold,letterSpacing:3,textTransform:"uppercase"}}>Community Give Back</div>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:15,fontWeight:600,color:C.white,letterSpacing:1}}>Donation Certificate</div>
        </div>
      </div>
      <div style={{background:`${C.alaBlue}30`,border:`1px solid ${C.alaBlue}`,borderRadius:10,padding:"12px 14px",marginBottom:14}}>
        <div style={{fontSize:13,color:C.gray2,lineHeight:1.7}}><strong style={{color:C.white}}>{customerName}</strong> has proudly donated a <strong style={{color:C.alaGold}}>$25 reward</strong> to the</div>
        <div style={{fontFamily:"'Oswald',sans-serif",fontSize:12,color:C.white,fontWeight:600,letterSpacing:1,marginTop:6,lineHeight:1.5}}>{ALA_NAME}</div>
      </div>
      <div style={{fontSize:11,color:C.gray,lineHeight:1.7,marginBottom:10}}>
        Each December, Fetter Automotive Repair presents the year's total member donations to ALA students. Donors are recognized on our in-app leaderboard and celebrated on <strong style={{color:C.gray2}}>Fetter Automotive Repair's social media.</strong>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:`1px solid ${C.alaBlue}50`,paddingTop:10}}>
        <div style={{fontSize:10,color:C.alaGold}}>⭐ Thank you for investing in the next generation of technicians</div>
        <div style={{fontSize:10,color:C.mid,whiteSpace:"nowrap",marginLeft:8}}>{donatedDate}</div>
      </div>
    </div>
  );
}

// ─── REDEEM MODAL ─────────────────────────────────────────────────────────────
function RedeemModal({ customer, tier, onCoupon, onDonate, onClose, loading }) {
  const [step, setStep] = useState("choose");
  return (
    <div style={{position:"fixed",inset:0,background:"#000000dd",zIndex:999,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{background:C.dark,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:430,overflow:"hidden"}}>
        <div style={{padding:"18px 20px 14px",borderBottom:`1px solid ${C.mid}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:16,fontWeight:600,letterSpacing:3,textTransform:"uppercase"}}>Redeem 1,000 Points</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.gray,cursor:"pointer",fontSize:22,lineHeight:1}}>✕</button>
        </div>
        {step==="choose" && (
          <div style={{padding:20}}>
            <div style={{fontSize:13,color:C.gray,marginBottom:20,textAlign:"center",lineHeight:1.6}}>How would you like to use your <strong style={{color:C.orange}}>1,000 points ($25 value)</strong>?</div>
            <button onClick={loading?null:onCoupon} style={{width:"100%",background:C.dark2,border:`2px solid ${C.orange}`,borderRadius:14,padding:18,cursor:"pointer",textAlign:"left",marginBottom:12,color:C.white,opacity:loading?0.6:1}}>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{fontSize:30}}>⚙️</div>
                <div>
                  <div style={{fontFamily:"'Oswald',sans-serif",fontSize:18,fontWeight:600,color:C.orange,letterSpacing:1}}>$25 Off My Next Visit</div>
                  <div style={{fontSize:12,color:C.gray,marginTop:3}}>A digital coupon to show your service advisor at checkout</div>
                </div>
              </div>
            </button>
            <button onClick={loading?null:()=>setStep("anon")} style={{width:"100%",background:C.alaNavy,border:`2px solid ${C.alaBlue}`,borderRadius:14,padding:18,cursor:"pointer",textAlign:"left",color:C.white,opacity:loading?0.6:1}}>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{fontSize:30}}>⭐</div>
                <div>
                  <div style={{fontFamily:"'Oswald',sans-serif",fontSize:18,fontWeight:600,color:C.white,letterSpacing:1}}>Donate to ALA Students</div>
                  <div style={{fontSize:12,color:C.gray,marginTop:3}}>Give your $25 value to the {ALA_SHORT}</div>
                  <div style={{fontSize:11,color:C.alaGold,marginTop:4}}>🎓 You'll be recognized in-app and on Fetter Automotive Repair's social media</div>
                </div>
              </div>
            </button>
            <div style={{marginTop:16,fontSize:11,color:C.mid,textAlign:"center",lineHeight:1.6}}>Each December, Fetter Automotive Repair presents all member donations to ALA automotive students.</div>
          </div>
        )}
        {step==="anon" && (
          <div style={{padding:20}}>
            <div style={{background:C.alaNavy,border:`1px solid ${C.alaBlue}`,borderRadius:14,padding:20,marginBottom:20}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:36,marginBottom:8}}>⭐</div>
                <div style={{fontFamily:"'Oswald',sans-serif",fontSize:17,fontWeight:600,color:C.white,letterSpacing:2,textTransform:"uppercase"}}>Thank You!</div>
                <div style={{fontSize:13,color:C.gray,marginTop:8,lineHeight:1.7}}>Your <strong style={{color:C.alaGold}}>$25 donation</strong> to the {ALA_SHORT} makes a real difference to local automotive students.</div>
              </div>
            </div>
            <div style={{fontSize:13,color:C.gray2,marginBottom:14,textAlign:"center"}}>How would you like to appear on the donor leaderboard and Fetter Automotive Repair's social media?</div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
              <button onClick={loading?null:()=>onDonate(false)} style={{...S.btn(C.alaBlue,C.white,{letterSpacing:2}),opacity:loading?0.6:1}}>Use My Real Name — {customer.name}</button>
              <button onClick={loading?null:()=>onDonate(true)} style={{...S.btn("transparent",C.gray,{border:`1px solid ${C.mid}`,letterSpacing:2}),opacity:loading?0.6:1}}>Stay Anonymous</button>
            </div>
            {loading && <div style={{textAlign:"center",color:C.orange,fontSize:12,fontFamily:"'Oswald',sans-serif",letterSpacing:2}}>Saving...</div>}
            <button onClick={()=>setStep("choose")} style={S.btn("transparent",C.mid,{border:"none",fontSize:12,padding:"8px"})}>← Go Back</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DONOR LEADERBOARD ────────────────────────────────────────────────────────
function DonorLeaderboard({ currentCustomerId }) {
  const [donors, setDonors] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const year = new Date().getFullYear();
  const medals = ["🥇","🥈","🥉"];

  useEffect(()=>{
    (async()=>{
      try {
        const data = await db.query("coupons", `?donated=eq.true&select=customer_id,anonymous,created_at,customers(name)`);
        const yearData = data.filter(c=>new Date(c.created_at).getFullYear()===year);
        const map = {};
        yearData.forEach(c=>{
          const id=c.customer_id;
          if (!map[id]) map[id]={id,name:c.anonymous?"Anonymous":(c.customers && c.customers.name ? c.customers.name : "Member"),donated:0,anonymous:c.anonymous};
          map[id].donated+=25;
          if (c.anonymous) map[id].name="Anonymous";
        });
        const sorted=Object.values(map).sort((a,b)=>b.donated-a.donated);
        setDonors(sorted);
        setTotal(sorted.reduce((s,d)=>s+d.donated,0));
      } catch(e){ console.error(e); }
      setLoading(false);
    })();
  },[]);

  if (loading) return <div style={{padding:40,textAlign:"center",color:C.gray}}>Loading leaderboard...</div>;

  return (
    <div style={{padding:16}}>
      <div style={{fontFamily:"'Oswald',sans-serif",fontSize:22,fontWeight:600,letterSpacing:3,textTransform:"uppercase",marginBottom:4}}>🎓 Donor Leaderboard</div>
      <div style={{fontSize:12,color:C.mid,marginBottom:16}}>{year} donations to {ALA_SHORT}</div>
      <div style={{background:`linear-gradient(160deg,${C.alaNavy} 0%,${C.alaDark} 60%,#1a0a0a 100%)`,border:`2px solid ${C.alaBlue}`,borderRadius:16,padding:20,marginBottom:20,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:`linear-gradient(90deg,${C.alaRed} 33%,${C.white} 33%,${C.white} 66%,${C.alaBlue} 66%)`}} />
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:4,background:`linear-gradient(90deg,${C.alaBlue} 33%,${C.white} 33%,${C.white} 66%,${C.alaRed} 66%)`}} />
        <div style={{position:"absolute",right:-10,top:20,fontSize:60,opacity:0.06}}>⭐</div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,marginTop:4}}>
          <div style={{fontSize:26}}>🎓⭐</div>
          <div>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:9,color:C.alaGold,letterSpacing:3,textTransform:"uppercase"}}>Community Give Back</div>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:15,fontWeight:600,color:C.white,letterSpacing:1}}>Total Donated in {year}</div>
          </div>
        </div>
        <div style={{background:`${C.alaBlue}30`,border:`1px solid ${C.alaBlue}`,borderRadius:10,padding:"12px 14px",marginBottom:14,textAlign:"center"}}>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:44,fontWeight:700,color:C.white,lineHeight:1}}>${total}</div>
          <div style={{fontSize:11,color:C.gray2,marginTop:4}}>donated to {ALA_SHORT}</div>
        </div>
        <div style={{fontSize:11,color:C.gray,lineHeight:1.7,marginBottom:10}}>Each December, Fetter Automotive Repair presents the year's total member donations to ALA students. Donors are recognized on our in-app leaderboard and celebrated on <strong style={{color:C.gray2}}>Fetter Automotive Repair's social media.</strong></div>
        <div style={{fontSize:10,color:C.alaGold,borderTop:`1px solid ${C.alaBlue}50`,paddingTop:10}}>⭐ Thank you for investing in the next generation of technicians</div>
      </div>
      {donors.length===0
        ? <div style={{textAlign:"center",color:C.mid,padding:"30px 0",fontSize:13}}>No donations yet this year.<br/><span style={{fontSize:12}}>Be the first to give back to ALA students!</span></div>
        : donors.map((d,i)=>{
          const isMe=d.id===currentCustomerId;
          return (
            <div key={d.id} style={{background:isMe?C.alaNavy:C.dark2,border:`1px solid ${isMe?C.alaBlue:C.mid}`,borderRadius:12,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:14}}>
              <div style={{fontFamily:"'Oswald',sans-serif",fontSize:22,minWidth:32,textAlign:"center"}}>{i<3?medals[i]:<span style={{color:C.mid,fontSize:14}}>#{i+1}</span>}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Oswald',sans-serif",fontSize:16,fontWeight:600,letterSpacing:1,color:isMe?C.alaGold:C.white}}>
                  {d.anonymous?"Anonymous":d.name}
                  {isMe && <span style={{fontSize:10,color:C.alaGold,marginLeft:8,letterSpacing:2}}>· YOU</span>}
                </div>
                <div style={{fontSize:11,color:C.mid,marginTop:2}}>donated to {ALA_SHORT}</div>
              </div>
              <div style={{fontFamily:"'Oswald',sans-serif",fontSize:20,fontWeight:700,color:C.alaGold}}>${d.donated}</div>
            </div>
          );
        })
      }
    </div>
  );
}


// ─── EDIT PROFILE ────────────────────────────────────────────────────────────
function EditProfile({ customer, onSave, onBack }) {
  const [form, setForm] = useState({
    name: customer.name || '',
    email: customer.email || '',
    birthMonth: customer.birth_month !== null && customer.birth_month !== undefined ? MONTHS[customer.birth_month] : ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const nameValid = form.name.trim().split(' ').filter(w=>w.length>0).length >= 2;

  const save = async () => {
    if (!nameValid) { setError('Please enter your first and last name'); return; }
    if (!form.name || !form.email) { setError('Name and email are required'); return; }
    setLoading(true); setError('');
    try {
      await db.update('customers', {id: customer.id}, {
        name: form.name.trim(),
        email: form.email.trim(),
        birth_month: form.birthMonth ? MONTHS.indexOf(form.birthMonth) : null
      });
      setSuccess(true);
      setTimeout(()=>onSave({...customer, name:form.name.trim(), email:form.email.trim(), birth_month:form.birthMonth?MONTHS.indexOf(form.birthMonth):null}), 1000);
    } catch(e) {
      setError('Something went wrong. Please try again.');
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div style={{...S.screen, paddingBottom:40}}>
      <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Barlow:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <div style={{borderBottom:`1px solid ${C.mid}`, padding:"18px 20px 14px", display:"flex", alignItems:"center", gap:14, background:C.dark}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:C.gray,cursor:"pointer",fontSize:20,padding:0}}>←</button>
        <div style={{fontFamily:"'Oswald',sans-serif",fontSize:18,fontWeight:600,letterSpacing:3,textTransform:"uppercase"}}>Edit Profile</div>
      </div>
      <div style={{padding:24}}>
        {success && (
          <div style={{background:"#0f2419",border:"1px solid #4caf7d",borderRadius:10,padding:"12px 16px",marginBottom:20,fontSize:13,color:"#4caf7d",textAlign:"center"}}>
            ✓ Profile updated successfully!
          </div>
        )}
        {error && (
          <div style={{background:"#44000030",border:"1px solid #ff6b6b",borderRadius:10,padding:"12px 16px",marginBottom:14,fontSize:12,color:"#ff6b6b"}}>{error}</div>
        )}
        <label style={S.label}>Full Name *</label>
        <input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="First Last" style={S.input} />
        {form.name && !nameValid && (
          <div style={{fontSize:11,color:"#ff6b6b",marginTop:-10,marginBottom:14}}>Please enter your first and last name</div>
        )}
        <label style={S.label}>Email Address *</label>
        <input value={form.email} onChange={e=>set("email",e.target.value)} placeholder="you@email.com" type="email" style={S.input} />
        <label style={S.label}>Birth Month <span style={{color:C.mid}}>optional</span></label>
        <select value={form.birthMonth} onChange={e=>set("birthMonth",e.target.value)} style={S.input}>
          <option value="">Select month…</option>
          {MONTHS.map(m=><option key={m} value={m}>{m}</option>)}
        </select>
        <div style={{background:C.dark3,borderRadius:10,padding:"12px 16px",marginBottom:20,fontSize:12,color:C.mid,lineHeight:1.6}}>
          To update your phone number please visit us in store or contact us directly.
        </div>
        <button onClick={save} disabled={!nameValid||!form.name||!form.email||loading}
          style={S.btn(nameValid&&form.name&&form.email&&!loading?C.orange:C.mid, nameValid&&form.name&&form.email&&!loading?C.black:C.dark3, {cursor:nameValid&&form.name&&form.email&&!loading?"pointer":"default"})}>
          {loading?"Saving...":"Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ─── INSTALL PROMPT ──────────────────────────────────────────────────────────
function InstallPrompt({ onDismiss }) {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(()=>{
    const ua = navigator.userAgent;
    setIsIOS(/iphone|ipad|ipod/i.test(ua));
    setIsAndroid(/android/i.test(ua));
  },[]);

  return (
    <div style={{position:"fixed",inset:0,background:"#000000ee",zIndex:9999,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{background:C.dark,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:430,overflow:"hidden",paddingBottom:20}}>
        <div style={{background:`linear-gradient(135deg,${C.dark2},${C.dark})`,padding:"20px 20px 16px",borderBottom:`1px solid ${C.mid}`}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:4}}>
            <img src={LOGO_SQUARE} alt="FAR" style={{height:44,width:44,borderRadius:10,mixBlendMode:"screen"}} />
            <div>
              <div style={{fontFamily:"'Oswald',sans-serif",fontSize:18,fontWeight:600,letterSpacing:2,color:C.white}}>Add F.A.R. to Your Home Screen</div>
              <div style={{fontSize:12,color:C.gray,marginTop:2}}>Access your rewards instantly like a real app</div>
            </div>
          </div>
        </div>
        <div style={{padding:"20px 20px 0"}}>
          {isIOS && (
            <div>
              <div style={{fontSize:12,color:C.gray2,marginBottom:16,lineHeight:1.6}}>Follow these steps in <strong style={{color:C.orange}}>Safari</strong> on your iPhone:</div>
              {[
                ["Open in Safari","Make sure you have the link open in Safari — not Chrome or any other browser","🌐"],
                ["Long press the web address","Press and hold the URL at the top of Safari until a menu appears","👆"],
                ["Tap the Share button","The box with an arrow at the bottom of your screen","⬆️"],
                ["Scroll down and tap","Add to Home Screen","＋"],
                ["Tap Add","The F.A.R. icon will appear on your home screen","✓"],
              ].map(([title,desc,icon],i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 0",borderBottom:`1px solid ${C.dark3}`}}>
                  <div style={{width:36,height:36,borderRadius:10,background:C.orange,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:16}}>{icon}</div>
                  <div>
                    <div style={{fontFamily:"'Oswald',sans-serif",fontSize:14,fontWeight:500,color:C.white,letterSpacing:1}}>{title}</div>
                    <div style={{fontSize:11,color:C.gray,marginTop:2}}>{desc}</div>
                  </div>
                </div>
              ))}
              <div style={{marginTop:14,padding:"10px 14px",background:`${C.orange}15`,border:`1px solid ${C.orange}30`,borderRadius:10,fontSize:11,color:C.gray}}>
                Must use <strong style={{color:C.orange}}>Safari</strong> on iPhone. If you received this link through a text or app, copy the link and open it directly in Safari.
              </div>
            </div>
          )}
          {isAndroid && (
            <div>
              <div style={{fontSize:12,color:C.gray2,marginBottom:16,lineHeight:1.6}}>Make sure you are using <strong style={{color:C.orange}}>Google Chrome</strong> — not your default browser or any in-app browser:</div>
              {[
                ["Open in Chrome","Make sure you have the link open in Google Chrome before starting","🌐"],
                ["Tap the menu button","The three dots in the top right corner of Chrome","⋮"],
                ["Tap","Add to Home screen","＋"],
                ["Tap Add","The F.A.R. icon will appear on your home screen","✓"],
              ].map(([title,desc,icon],i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 0",borderBottom:`1px solid ${C.dark3}`}}>
                  <div style={{width:36,height:36,borderRadius:10,background:C.orange,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:16}}>{icon}</div>
                  <div>
                    <div style={{fontFamily:"'Oswald',sans-serif",fontSize:14,fontWeight:500,color:C.white,letterSpacing:1}}>{title}</div>
                    <div style={{fontSize:11,color:C.gray,marginTop:2}}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!isIOS && !isAndroid && (
            <div style={{fontSize:13,color:C.gray,lineHeight:1.7,textAlign:"center",padding:"10px 0"}}>
              On your phone, open this page in your browser and look for <strong style={{color:C.orange}}>"Add to Home Screen"</strong> in the browser menu.
            </div>
          )}
          <div style={{marginTop:20,display:"flex",flexDirection:"column",gap:10}}>
            <button onClick={onDismiss} style={S.btn(C.orange,C.black)}>Got It</button>
            <button onClick={onDismiss} style={S.btn("transparent",C.mid,{border:"none",fontSize:12,padding:"8px"})}>Maybe Later</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SPLASH ───────────────────────────────────────────────────────────────────
function SplashScreen({ onLogin, onSignup, onAdmin, onInstall, isInstalled }) {
  return (
    <div style={{...S.screen,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",minHeight:"100vh",background:`radial-gradient(ellipse at top,#3a3a3a 0%,#1a1a1a 40%,${C.black} 75%)`}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 32px 0",width:"100%",boxSizing:"border-box"}}>
        <img src={LOGO_FULL} alt="Fetter Automotive Repair" style={{width:"100%",maxWidth:360,marginBottom:8}} />
        <div style={{textAlign:"center",marginTop:16}}>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:26,fontWeight:700,letterSpacing:6,color:C.orange,textTransform:"uppercase"}}>F.A.R</div>
          <div style={{fontFamily:"'Barlow',sans-serif",fontSize:12,color:C.gray,letterSpacing:4,textTransform:"uppercase",marginTop:4}}>Fetter Auto Rewards</div>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:13,color:C.gray2,letterSpacing:4,textTransform:"uppercase",marginTop:6,fontStyle:"italic"}}>FETTER is BETTER</div>
        </div>
        <div style={{marginTop:40,width:"100%",maxWidth:320}}>
          <div style={{textAlign:"center",marginBottom:24,fontSize:13,color:C.gray,lineHeight:1.7}}>Earn points on every visit.<br/>Redeem for real rewards — or give back to local students.</div>
          <button onClick={onSignup} style={S.btn(C.orange,C.black)}>Join F.A.R. — It's Free</button>
          <button onClick={onLogin} style={{...S.btn("transparent",C.gray,{border:`1px solid ${C.mid}`,marginTop:10})}}>Sign In</button>
          {!isInstalled && (
            <button onClick={onInstall} style={{background:"none",border:"none",color:C.mid,cursor:"pointer",fontSize:11,fontFamily:"'Oswald',sans-serif",letterSpacing:2,textTransform:"uppercase",marginTop:14,width:"100%",textAlign:"center",padding:"4px 0"}}>
              Add to Home Screen
            </button>
          )}
        </div>
      </div>
      <div style={{padding:"20px 0 28px",display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
        <div style={{fontSize:10,color:C.mid,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Oswald',sans-serif"}}>Fetter Automotive Repair</div>
        <button onClick={onAdmin} style={{background:"none",border:"none",color:C.mid,cursor:"pointer",fontSize:10,fontFamily:"'Oswald',sans-serif",letterSpacing:2,textTransform:"uppercase"}}>Staff Access</button>
      </div>
    </div>
  );
}

// ─── SIGNUP ───────────────────────────────────────────────────────────────────
function SignupScreen({ onBack, onComplete }) {
  const [form, setForm] = useState({name:"",phone:"",email:"",birthMonth:""});
  const [showTerms, setShowTerms] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const nameValid=form.name.trim().split(' ').filter(w=>w.length>0).length>=2;
  const valid=nameValid&&form.phone&&form.email&&agreed;

  const submit=async()=>{
    if (!valid||loading) return;
    setLoading(true); setError("");
    try {
      // Check if phone already exists
      const existing=await db.query("customers",`?phone=eq.${encodeURIComponent(normalizePhone(form.phone))}&select=id`);
      if (existing.length>0) { setError("An account with this phone number already exists. Please sign in."); setLoading(false); return; }
      const anniversaryDate=new Date(Date.now()+365*24*60*60*1000).toISOString().split("T")[0];
      const memberSince=new Date().toLocaleDateString("en-US",{month:"long",year:"numeric"});
      const result=await db.insert("customers",{
        name:form.name, phone:normalizePhone(form.phone), email:form.email,
        birth_month:form.birthMonth?MONTHS.indexOf(form.birthMonth):null,
        member_since:memberSince, anniversary_date:anniversaryDate,
        points:0, claimed_bonuses:[]
      });
      onComplete(result[0]);
    } catch(e){ setError("Something went wrong. Please try again."); console.error(e); }
    setLoading(false);
  };

  return (
    <div style={{...S.screen,background:`radial-gradient(ellipse at top,#3a3a3a 0%,#1a1a1a 40%,${C.black} 75%)`,paddingBottom:40}}>
      <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Barlow:wght@300;400;500;600&display=swap" rel="stylesheet" />
      {showTerms && <TermsModal onClose={()=>setShowTerms(false)} />}
      <div style={{borderBottom:`1px solid ${C.mid}`,padding:"18px 20px 14px",display:"flex",alignItems:"center",gap:14}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:C.gray,cursor:"pointer",fontSize:20,padding:0}}>←</button>
        <div style={{fontFamily:"'Oswald',sans-serif",fontSize:18,fontWeight:600,letterSpacing:3,textTransform:"uppercase"}}>Join F.A.R.</div>
      </div>
      <div style={{padding:"24px"}}>
        <img src={LOGO_FULL} alt="Fetter" style={{width:"100%",maxWidth:260,display:"block",margin:"0 auto 20px"}} />
        <div style={{textAlign:"center",marginBottom:24,fontFamily:"'Oswald',sans-serif",fontSize:12,color:C.gray2,letterSpacing:4,textTransform:"uppercase",fontStyle:"italic"}}>FETTER is BETTER</div>
        {error && <div style={{background:"#44000030",border:"1px solid #ff6b6b",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:12,color:"#ff6b6b"}}>{error}</div>}
        <label style={S.label}>Full Name *</label>
        <input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="First Last" style={S.input} />
        {form.name && !form.name.trim().split(' ').filter(w=>w.length>0).length >= 2 && (
          <div style={{fontSize:11,color:"#ff6b6b",marginTop:-10,marginBottom:14}}>Please enter your first and last name</div>
        )}
        <label style={S.label}>Phone Number *</label>
        <input value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="555-000-0000" style={S.input} />
        <div style={{fontSize:11,color:C.mid,marginTop:-10,marginBottom:14}}>Any format works — dashes, spaces, or none</div>
        <label style={S.label}>Email Address *</label>
        <input value={form.email} onChange={e=>set("email",e.target.value)} placeholder="you@email.com" type="email" style={S.input} />
        <label style={S.label}>Birth Month <span style={{color:C.mid}}>optional — unlocks birthday bonus</span></label>
        <select value={form.birthMonth} onChange={e=>set("birthMonth",e.target.value)} style={S.input}>
          <option value="">Select month…</option>
          {MONTHS.map(m=><option key={m} value={m}>{m}</option>)}
        </select>
        <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:20,marginTop:4}}>
          <input type="checkbox" id="terms" checked={agreed} onChange={e=>setAgreed(e.target.checked)} style={{marginTop:3,accentColor:C.orange,width:16,height:16,flexShrink:0}} />
          <label htmlFor="terms" style={{fontSize:12,color:C.gray,lineHeight:1.6,cursor:"pointer"}}>
            I agree to the F.A.R. <span onClick={e=>{e.preventDefault();setShowTerms(true);}} style={{color:C.orange,textDecoration:"underline",cursor:"pointer"}}>Terms & Conditions</span>. Points and rewards are non-transferable and tied to my account only.
          </label>
        </div>
        <button onClick={submit} disabled={!valid||loading} style={S.btn(valid&&!loading?C.orange:C.mid,valid&&!loading?C.black:C.dark3,{cursor:valid&&!loading?"pointer":"default"})}>
          {loading?"Creating Account...":"Create My Account"}
        </button>
      </div>
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({ onBack, onLogin }) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit=async()=>{
    if (!phone||loading) return;
    setLoading(true); setError("");
    try {
      const result=await db.query("customers",`?phone=eq.${encodeURIComponent(normalizePhone(phone))}&select=*`);
      if (result.length===0) { setError("No account found with that phone number. Please sign up."); setLoading(false); return; }
      onLogin(result[0]);
    } catch(e){ setError("Something went wrong. Please try again."); console.error(e); }
    setLoading(false);
  };

  return (
    <div style={{...S.screen,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 24px",background:`radial-gradient(ellipse at top,#3a3a3a 0%,#1a1a1a 40%,${C.black} 75%)`}}>
      <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Barlow:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <button onClick={onBack} style={{position:"absolute",top:20,left:20,background:"none",border:"none",color:C.gray,cursor:"pointer",fontSize:20}}>←</button>
      <img src={LOGO_FULL} alt="Fetter" style={{width:"100%",maxWidth:280,marginBottom:24}} />
      <div style={{fontFamily:"'Oswald',sans-serif",fontSize:12,color:C.gray2,letterSpacing:4,textTransform:"uppercase",fontStyle:"italic",marginBottom:28}}>FETTER is BETTER</div>
      <div style={{width:"100%",maxWidth:320}}>
        {error && <div style={{background:"#44000030",border:"1px solid #ff6b6b",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:12,color:"#ff6b6b"}}>{error}</div>}
        <label style={S.label}>Phone Number</label>
        <input value={phone} onChange={e=>setPhone(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="555-000-0000" style={S.input} />
        <div style={{fontSize:11,color:C.mid,marginTop:-10,marginBottom:14}}>Enter the number you signed up with</div>
        <button onClick={submit} disabled={!phone||loading} style={S.btn(!phone||loading?C.mid:C.orange,!phone||loading?C.dark3:C.black,{cursor:!phone||loading?"default":"pointer"})}>
          {loading?"Signing In...":"Sign In"}
        </button>
      </div>
    </div>
  );
}

// ─── CUSTOMER APP ─────────────────────────────────────────────────────────────
function CustomerApp({ customer:initCustomer, onLogout }) {
  const [tab, setTab] = useState("home");
  const [cust, setCust] = useState(initCustomer);
  const [visits, setVisits] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [showTerms, setShowTerms] = useState(false);
  const [showRedeem, setShowRedeem] = useState(false);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const spent = visits.reduce((s,v)=>s+v.amount,0);
  const tier = getTier(spent);
  const birthdayBonus = isBirthdayMonth(cust.birth_month) && tier.order>=2;
  const activeCoupons = coupons.filter(c=>!c.redeemed&&!c.donated);
  const donatedCoupons = coupons.filter(c=>c.donated);
  const redeemedCoupons = coupons.filter(c=>c.redeemed);
  const donatedThisYear = getYearDonated(coupons);
  const showWarning = tier.order>0 && spent<tier.min+300;

  const loadData=useCallback(async()=>{
    try {
      const [v,cp]=await Promise.all([
        db.query("visits",`?customer_id=eq.${cust.id}&order=created_at.desc`),
        db.query("coupons",`?customer_id=eq.${cust.id}&order=created_at.desc`)
      ]);
      setVisits(v); setCoupons(cp);
    } catch(e){ console.error(e); }
    setDataLoading(false);
  },[cust.id]);

  useEffect(()=>{ loadData(); },[loadData]);

  const handleCoupon=async()=>{
    if (cust.points<1000||redeemLoading) return;
    setRedeemLoading(true);
    try {
      const expires=new Date(Date.now()+365*24*60*60*1000).toISOString();
      await db.insert("coupons",{customer_id:cust.id,value:25,redeemed:false,donated:false,expires_at:expires});
      await db.update("customers",{id:cust.id},{points:cust.points-1000});
      setCust(c=>({...c,points:c.points-1000}));
      await loadData();
      setShowRedeem(false);
    } catch(e){ console.error(e); }
    setRedeemLoading(false);
  };

  const handleDonate=async(anonymous)=>{
    if (cust.points<1000||redeemLoading) return;
    setRedeemLoading(true);
    try {
      await db.insert("coupons",{customer_id:cust.id,value:25,redeemed:false,donated:true,anonymous});
      await db.update("customers",{id:cust.id},{points:cust.points-1000});
      setCust(c=>({...c,points:c.points-1000}));
      await loadData();
      setShowRedeem(false);
    } catch(e){ console.error(e); }
    setRedeemLoading(false);
  };

  const tabs=[
    {id:"home",    label:"Home",    icon:"⊙"},
    {id:"rewards", label:"Rewards", icon:"★"},
    {id:"history", label:"History", icon:"≡"},
    {id:"tiers",   label:"Tiers",   icon:"◈"},
    {id:"earn",    label:"Earn",    icon:"+"},
    {id:"give",    label:"Give",    icon:"🎓"},
  ];

  return (
    <div style={{...S.screen,paddingBottom:80}}>
      <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Barlow:wght@300;400;500;600&display=swap" rel="stylesheet" />
      {showEditProfile && <EditProfile customer={cust} onSave={(updated)=>{setCust(updated);setShowEditProfile(false);}} onBack={()=>setShowEditProfile(false)} />}
      {showTerms && <TermsModal onClose={()=>setShowTerms(false)} />}
      {showRedeem && <RedeemModal customer={cust} tier={tier} onCoupon={handleCoupon} onDonate={handleDonate} onClose={()=>setShowRedeem(false)} loading={redeemLoading} />}

      <div style={{background:`linear-gradient(180deg,${C.dark} 0%,${C.black} 100%)`,padding:"12px 16px",borderBottom:`1px solid ${C.mid}`,position:"sticky",top:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <img src={LOGO_SQUARE} alt="FAR" style={{height:42,width:42,borderRadius:8,mixBlendMode:"screen"}} />
        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:10,letterSpacing:4,color:C.orange,textTransform:"uppercase"}}>Fetter Auto Rewards</div>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:10,color:C.gray,letterSpacing:3,textTransform:"uppercase",fontStyle:"italic"}}>FETTER is BETTER</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{background:C.dark3,border:`2px solid ${tier.color}`,borderRadius:10,padding:"4px 12px",textAlign:"center"}}>
            <div style={{fontSize:9,letterSpacing:2,color:tier.color,textTransform:"uppercase",fontFamily:"'Oswald',sans-serif"}}>{tier.name}</div>
            <div style={{fontSize:18,fontWeight:600,fontFamily:"'Oswald',sans-serif",color:C.white,lineHeight:1.1}}>{cust.points.toLocaleString()} <span style={{fontSize:9,color:C.gray}}>pts</span></div>
          </div>
          <button onClick={onLogout} style={{background:"none",border:`1px solid ${C.mid}`,color:C.gray,borderRadius:8,padding:"6px 8px",cursor:"pointer",fontSize:9,fontFamily:"'Oswald',sans-serif",letterSpacing:2,textTransform:"uppercase"}}>Sign Out</button>
        </div>
      </div>

      {birthdayBonus && <div style={{background:`${C.orange}22`,borderBottom:`1px solid ${C.orange}40`,padding:"10px 20px",textAlign:"center",fontSize:13,color:C.orange}}>🎂 <strong>Birthday Month!</strong> You're earning double points this month (capped at +500 pts)</div>}
      {showWarning && <div style={{background:"#44000022",borderBottom:"1px solid #55000040",padding:"10px 20px",fontSize:12,color:"#ff6b6b",textAlign:"center"}}>⚠️ Spend ${(tier.min-spent+1).toLocaleString()} more before your anniversary to keep {tier.name}</div>}

      <div style={{padding:"0 0 16px"}}>

        {tab==="home" && (
          <div>
            <div style={{margin:16,background:`linear-gradient(135deg,${C.dark2},${C.dark})`,border:`1px solid ${tier.color}30`,borderRadius:16,padding:22,position:"relative",overflow:"hidden"}}>
              <div style={{fontSize:10,color:C.gray,letterSpacing:3,textTransform:"uppercase",fontFamily:"'Oswald',sans-serif",marginBottom:4}}>Welcome back</div>
              <div style={{fontSize:24,fontWeight:600,fontFamily:"'Oswald',sans-serif",letterSpacing:2,textTransform:"uppercase"}}>{cust.name}</div>
              <div style={{fontSize:11,color:C.mid,marginTop:2}}>Member since {cust.member_since} · Anniversary {new Date(cust.anniversary_date).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</div>
              <div style={{height:1,background:C.dark3,margin:"16px 0"}} />
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:18}}>
                {[["Spend",dataLoading?"…":`$${spent.toLocaleString()}`,C.white],["Points",cust.points.toLocaleString(),C.orange],["Coupons",dataLoading?"…":activeCoupons.length,C.orange3],["Donated",dataLoading?"…":`$${donatedThisYear}`,C.alaGold]].map(([l,v,c])=>(
                  <div key={l} style={{background:C.dark3,borderRadius:8,padding:"8px 8px"}}>
                    <div style={{fontSize:9,color:C.mid,textTransform:"uppercase",letterSpacing:1,fontFamily:"'Oswald',sans-serif"}}>{l}</div>
                    <div style={{fontFamily:"'Oswald',sans-serif",fontSize:17,fontWeight:600,color:c,lineHeight:1.2}}>{v}</div>
                  </div>
                ))}
              </div>
              {!dataLoading && <ProgressBar spent={spent} />}
            </div>
            <div style={{margin:"0 16px 16px"}}>
              <div style={{fontSize:10,letterSpacing:3,color:C.mid,textTransform:"uppercase",fontFamily:"'Oswald',sans-serif",marginBottom:10}}>{tier.name} Perks</div>
              {tier.perks.map((p,i)=>(
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"9px 0",borderBottom:`1px solid ${C.dark3}`}}>
                  <div style={{width:4,height:4,borderRadius:"50%",background:tier.color,flexShrink:0,marginTop:7}} />
                  <span style={{fontSize:13,color:C.gray2,lineHeight:1.5}}>{p}</span>
                </div>
              ))}
            </div>
            <div style={{margin:"0 16px 10px"}}>
              <button onClick={()=>setShowRedeem(true)} disabled={cust.points<1000} style={S.btn(cust.points>=1000?C.orange:C.mid,cust.points>=1000?C.black:C.dark3,{cursor:cust.points>=1000?"pointer":"default"})}>
                {cust.points>=1000?"Redeem Points →":`${(1000-cust.points).toLocaleString()} pts until next reward`}
              </button>
            </div>
            <div style={{margin:"0 16px 10px"}}>
              <button onClick={()=>setShowEditProfile(true)} style={S.btn("transparent",C.orange2,{border:`1px solid ${C.orange2}50`,fontSize:11})}>Edit My Profile</button>
            </div>
            <div style={{margin:"0 16px"}}>
              <button onClick={()=>setShowTerms(true)} style={S.btn("transparent",C.gray,{border:`1px solid ${C.mid}`,fontSize:11})}>View Terms & Conditions</button>
            </div>
          </div>
        )}

        {tab==="rewards" && (
          <div style={{padding:16}}>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:22,fontWeight:600,letterSpacing:3,textTransform:"uppercase",marginBottom:4}}>Rewards</div>
            <div style={{fontSize:11,color:C.mid,marginBottom:20}}>Max 2 coupons per visit · Non-transferable · Valid 12 months</div>
            <div style={S.card({border:`1px solid ${C.orange}30`,marginBottom:20})}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div>
                  <div style={{fontFamily:"'Oswald',sans-serif",fontSize:18,fontWeight:600,letterSpacing:1}}>Redeem 1,000 Points</div>
                  <div style={{fontSize:12,color:C.gray,marginTop:3}}>Choose: $25 coupon or donate to ALA students</div>
                </div>
                <div style={{background:`${C.orange}20`,border:`1px solid ${C.orange}40`,borderRadius:8,padding:"4px 10px",fontSize:13,fontFamily:"'Oswald',sans-serif",fontWeight:600,color:C.orange,whiteSpace:"nowrap",marginLeft:12}}>1,000 pts</div>
              </div>
              {cust.points>=1000
                ? <button onClick={()=>setShowRedeem(true)} style={S.btn(C.orange,C.black)}>Redeem Now — Choose Your Reward</button>
                : <div style={{background:C.dark3,borderRadius:10,padding:14,textAlign:"center"}}>
                    <div style={{fontFamily:"'Oswald',sans-serif",fontSize:13,color:C.gray,letterSpacing:2}}>Need {(1000-cust.points).toLocaleString()} more points</div>
                    <div style={{marginTop:8,background:C.dark,borderRadius:4,height:5,overflow:"hidden"}}>
                      <div style={{background:C.orange,width:`${Math.min((cust.points/1000)*100,100)}%`,height:"100%",borderRadius:4,transition:"width 0.8s"}} />
                    </div>
                  </div>
              }
            </div>
            {dataLoading && <div style={{textAlign:"center",color:C.gray,padding:"20px 0"}}>Loading...</div>}
            {!dataLoading && activeCoupons.length>0 && (
              <>
                <div style={{fontSize:10,color:C.mid,textTransform:"uppercase",letterSpacing:3,fontFamily:"'Oswald',sans-serif",marginBottom:12}}>Your Active Coupons</div>
                {activeCoupons.map(cp=><CouponCard key={cp.id} coupon={cp} customerName={cust.name} tier={tier} />)}
              </>
            )}
            {!dataLoading && donatedCoupons.length>0 && (
              <>
                <div style={{fontSize:10,color:C.alaGold,textTransform:"uppercase",letterSpacing:3,fontFamily:"'Oswald',sans-serif",marginBottom:12,marginTop:8}}>⭐ Your Donations</div>
                {donatedCoupons.map(cp=><DonationCert key={cp.id} coupon={cp} customerName={cust.name} />)}
              </>
            )}
            {!dataLoading && redeemedCoupons.length>0 && (
              <>
                <div style={{fontSize:10,color:C.mid,textTransform:"uppercase",letterSpacing:3,fontFamily:"'Oswald',sans-serif",marginBottom:10,marginTop:8}}>Redeemed</div>
                {redeemedCoupons.map(cp=>(
                  <div key={cp.id} style={S.card({opacity:0.4,padding:"12px 16px"})}>
                    <span style={{fontSize:13,color:C.gray}}>✓ $25 coupon redeemed</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {tab==="history" && (
          <div style={{padding:16}}>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:22,fontWeight:600,letterSpacing:3,textTransform:"uppercase",marginBottom:16}}>Service History</div>
            {dataLoading
              ? <div style={{textAlign:"center",color:C.gray,padding:"20px 0"}}>Loading...</div>
              : visits.length===0
                ? <div style={{textAlign:"center",color:C.mid,padding:"40px 0",fontSize:13}}>No visits yet.<br/><span style={{fontSize:11}}>Your history will appear after your first service.</span></div>
                : visits.map((v,i)=>(
                  <div key={i} style={S.card({display:"flex",justifyContent:"space-between",alignItems:"center"})}>
                    <div>
                      <div style={{fontFamily:"'Oswald',sans-serif",fontSize:14,fontWeight:500,letterSpacing:1}}>{v.service}</div>
                      <div style={{fontSize:11,color:C.mid,marginTop:2}}>{new Date(v.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0,marginLeft:12}}>
                      <div style={{fontFamily:"'Oswald',sans-serif",fontSize:16,fontWeight:600}}>${v.amount.toLocaleString()}</div>
                      <div style={{fontSize:11,color:C.orange}}>+{v.pts_earned} pts</div>
                    </div>
                  </div>
                ))
            }
            {!dataLoading && (
              <div style={{marginTop:8,background:C.dark3,borderRadius:12,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",border:`1px solid ${C.orange}25`}}>
                <span style={{fontFamily:"'Oswald',sans-serif",fontSize:13,color:C.gray,letterSpacing:2,textTransform:"uppercase"}}>Anniversary Year Total</span>
                <span style={{fontFamily:"'Oswald',sans-serif",fontSize:20,fontWeight:600,color:C.orange}}>${spent.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {tab==="tiers" && (
          <div style={{padding:16}}>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:22,fontWeight:600,letterSpacing:3,textTransform:"uppercase",marginBottom:4}}>Tier Levels</div>
            <div style={{fontSize:12,color:C.mid,marginBottom:20}}>Based on anniversary year spend · Upgrades immediate · Drops at anniversary</div>
            {TIERS.map((t,i)=>{
              const isActive=tier.name===t.name;
              return (
                <div key={i} style={{background:isActive?`${t.color}10`:C.dark2,border:`1px solid ${isActive?t.color:C.mid}`,borderRadius:16,padding:20,marginBottom:12,position:"relative"}}>
                  {isActive && <div style={{position:"absolute",top:-1,right:14,background:t.color,color:C.black,fontFamily:"'Oswald',sans-serif",fontSize:9,fontWeight:600,letterSpacing:3,padding:"3px 10px",borderRadius:"0 0 8px 8px",textTransform:"uppercase"}}>Your Tier</div>}
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                    <div style={{fontSize:26}}>{t.icon}</div>
                    <div>
                      <div style={{fontFamily:"'Oswald',sans-serif",fontSize:18,fontWeight:600,color:t.color,letterSpacing:2,textTransform:"uppercase"}}>{t.name}</div>
                      <div style={{fontSize:11,color:C.mid}}>{t.max===Infinity?`$${t.min.toLocaleString()}+/yr`:`$${t.min.toLocaleString()}–$${t.max.toLocaleString()}/yr`}</div>
                    </div>
                  </div>
                  {t.perks.map((p,j)=>(
                    <div key={j} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"6px 0",borderTop:`1px solid ${C.dark3}`}}>
                      <div style={{width:4,height:4,borderRadius:"50%",background:t.color,flexShrink:0,marginTop:6}} />
                      <span style={{fontSize:12,color:C.gray2,lineHeight:1.5}}>{p}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {tab==="earn" && (
          <div style={{padding:16}}>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:22,fontWeight:600,letterSpacing:3,textTransform:"uppercase",marginBottom:4}}>Earn Bonus Points</div>
            <div style={{fontSize:12,color:C.mid,marginBottom:20}}>Extra ways to earn beyond your normal visits</div>
            {BONUS_ACTIONS.map(a=>{
              const done=(cust.claimed_bonuses||[]).includes(a.id);
              return (
                <div key={a.id} style={S.card({opacity:done?0.5:1})}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div>
                      <div style={{fontFamily:"'Oswald',sans-serif",fontSize:17,fontWeight:500,letterSpacing:1}}>{a.label}</div>
                      <div style={{fontSize:12,color:C.gray,marginTop:3}}>{a.desc}</div>
                      {a.once && <div style={{fontSize:10,color:C.mid,marginTop:4,fontFamily:"'Oswald',sans-serif",letterSpacing:2,textTransform:"uppercase"}}>One time only</div>}
                    </div>
                    <div style={{background:`${C.orange}20`,border:`1px solid ${C.orange}40`,borderRadius:8,padding:"4px 10px",fontSize:13,fontFamily:"'Oswald',sans-serif",fontWeight:600,color:C.orange,whiteSpace:"nowrap",marginLeft:12}}>+{a.pts.toLocaleString()} pts</div>
                  </div>
                  <div style={{fontSize:11,color:C.mid,background:C.dark3,borderRadius:8,padding:"8px 12px"}}>
                    {done?"✓ Completed — points awarded by service advisor":a.id==="referral"?"Ask your service advisor after your friend's first visit":"Ask your service advisor to verify and apply"}
                  </div>
                </div>
              );
            })}
            <div style={S.card({background:C.dark3,marginTop:8})}>
              <div style={{fontFamily:"'Oswald',sans-serif",fontSize:11,color:C.mid,letterSpacing:3,textTransform:"uppercase",marginBottom:10}}>Standard Earning</div>
              {[["$1 spent = 1 point","On every invoice"],["+ 50 points per visit","Added each invoiced visit"]].map(([t,d])=>(
                <div key={t} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderTop:`1px solid ${C.dark}`}}>
                  <div style={{fontSize:13,color:C.white}}>{t}</div>
                  <div style={{fontSize:11,color:C.gray}}>{d}</div>
                </div>
              ))}
            </div>

            {/* Help Us Grow */}
            <div style={{marginTop:8,background:`linear-gradient(135deg,${C.dark2},${C.dark})`,border:`1px solid ${C.orange}30`,borderRadius:16,padding:20,marginBottom:12}}>
              <div style={{fontFamily:"'Oswald',sans-serif",fontSize:15,fontWeight:600,letterSpacing:2,textTransform:"uppercase",color:C.orange,marginBottom:4}}>Help Us Grow</div>
              <div style={{fontSize:11,color:C.mid,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Oswald',sans-serif",marginBottom:16}}>No points — just love 🧡</div>

              <div style={{fontSize:13,color:C.gray2,lineHeight:1.8,marginBottom:14}}>
                We want to take a moment to extend our heartfelt gratitude for choosing us in your search for an auto shop you can trust and build a lasting relationship with.
              </div>
              <div style={{fontSize:13,color:C.gray2,lineHeight:1.8,marginBottom:14}}>
                If you've had a great experience with us, we'd truly appreciate you sharing it. Your feedback not only helps others feel confident choosing us, but also helps us continue refining what we do every day.
              </div>
              <div style={{fontSize:13,color:C.gray,lineHeight:1.8,marginBottom:20,fontStyle:"italic"}}>
                Our sincerest thanks,<br/>Marty &amp; Tess 🧡
              </div>

              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <a href="https://g.page/r/CernIFAPjuYsEBM/review" target="_blank" rel="noopener noreferrer"
                  style={{display:"flex",alignItems:"center",gap:14,background:C.dark3,border:`1px solid ${C.mid}`,borderRadius:12,padding:"14px 16px",textDecoration:"none",color:C.white}}>
                  <img src="data:image/png;base64,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" alt="Google" style={{width:40,height:40,borderRadius:10,flexShrink:0}} />
                  <div>
                    <div style={{fontFamily:"'Oswald',sans-serif",fontSize:15,fontWeight:600,letterSpacing:1,color:C.white}}>Review Us on Google</div>
                    <div style={{fontSize:11,color:C.gray,marginTop:2}}>Share your experience with others</div>
                  </div>
                  <div style={{marginLeft:"auto",color:C.mid,fontSize:16}}>→</div>
                </a>

                <a href="https://www.carfax.com/Reviews-Fetter-Automotive-Repair-Mesa-AZ_LWEQ1MKBDD" target="_blank" rel="noopener noreferrer"
                  style={{display:"flex",alignItems:"center",gap:14,background:C.dark3,border:`1px solid ${C.mid}`,borderRadius:12,padding:"14px 16px",textDecoration:"none",color:C.white}}>
                  <img src="data:image/png;base64,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" alt="Carfax" style={{width:40,height:40,borderRadius:10,flexShrink:0}} />
                  <div>
                    <div style={{fontFamily:"'Oswald',sans-serif",fontSize:15,fontWeight:600,letterSpacing:1,color:C.white}}>Review Us on Carfax</div>
                    <div style={{fontSize:11,color:C.gray,marginTop:2}}>Help drivers find a shop they can trust</div>
                  </div>
                  <div style={{marginLeft:"auto",color:C.mid,fontSize:16}}>→</div>
                </a>
              </div>

              <div style={{marginTop:16,fontSize:11,color:C.mid,textAlign:"center",lineHeight:1.6}}>
                Reviewing us costs nothing and means everything, thank you!
              </div>
            </div>
          </div>
        )}

        {tab==="give" && <DonorLeaderboard currentCustomerId={cust.id} />}
      </div>

      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:C.dark,borderTop:`1px solid ${C.mid}`,display:"flex",padding:"8px 0 14px",zIndex:100}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"4px 0"}}>
            <span style={{fontSize:t.id==="give"?15:17,color:tab===t.id?C.orange:C.mid,lineHeight:1}}>{t.icon}</span>
            <span style={{fontSize:9,fontFamily:"'Oswald',sans-serif",letterSpacing:1.5,textTransform:"uppercase",fontWeight:tab===t.id?600:400,color:tab===t.id?C.orange:C.mid}}>{t.label}</span>
            {tab===t.id && <div style={{width:14,height:2,background:C.orange,borderRadius:2}} />}
          </button>
        ))}
      </div>
    </div>
  );
}


// ─── STAFF EDIT CUSTOMER ─────────────────────────────────────────────────────
function StaffEditCustomer({ customer, onSave, onBack, toast_ }) {
  const [form, setForm] = useState({
    name: customer.name || '',
    phone: customer.phone || '',
    email: customer.email || '',
    birthMonth: customer.birth_month !== null && customer.birth_month !== undefined ? MONTHS[customer.birth_month] : ''
  });
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const save = async () => {
    if (!form.name || !form.phone) return;
    setLoading(true);
    try {
      await db.update('customers', {id: customer.id}, {
        name: form.name.trim(),
        phone: normalizePhone(form.phone),
        email: form.email.trim(),
        birth_month: form.birthMonth ? MONTHS.indexOf(form.birthMonth) : null
      });
      toast_('✓ Customer updated');
      onSave();
    } catch(e) {
      toast_('Error saving', '#ef4444');
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div style={{marginBottom:12}}>
      <div style={S.card({border:`1px solid ${C.orange}30`})}>
        <div style={{fontFamily:"'Oswald',sans-serif",fontSize:13,fontWeight:600,letterSpacing:2,color:C.orange,marginBottom:14,textTransform:"uppercase"}}>✏️ Edit Member Info</div>
        <label style={S.label}>Full Name *</label>
        <input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="First Last" style={S.input} />
        <label style={S.label}>Phone Number *</label>
        <input value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="555-000-0000" style={S.input} />
        <label style={S.label}>Email</label>
        <input value={form.email} onChange={e=>set("email",e.target.value)} placeholder="optional" style={S.input} />
        <label style={S.label}>Birth Month</label>
        <select value={form.birthMonth} onChange={e=>set("birthMonth",e.target.value)} style={S.input}>
          <option value="">Select…</option>
          {MONTHS.map(m=><option key={m} value={m}>{m}</option>)}
        </select>
        <div style={{display:"flex",gap:10}}>
          <button onClick={save} disabled={!form.name||!form.phone||loading}
            style={{...S.btn(C.orange,C.black,{flex:1})}}>
            {loading?"Saving...":"Save Changes"}
          </button>
          <button onClick={onBack}
            style={{...S.btn("transparent",C.gray,{border:`1px solid ${C.mid}`,flex:1})}}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN LOGIN ──────────────────────────────────────────────────────────────
function AdminLogin({ onSuccess, onBack }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const attempt=()=>{
    if (pin==="1523") onSuccess();
    else { setError(true); setPin(""); setTimeout(()=>setError(false),1500); }
  };
  return (
    <div style={{...S.screen,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,background:`radial-gradient(ellipse at top,#3a3a3a 0%,#1a1a1a 40%,${C.black} 75%)`}}>
      <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Barlow:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <button onClick={onBack} style={{position:"absolute",top:20,left:20,background:"none",border:"none",color:C.gray,cursor:"pointer",fontSize:20}}>←</button>
      <img src={LOGO_FULL} alt="Fetter" style={{width:"100%",maxWidth:260,display:"block",margin:"0 auto",marginBottom:24}} />
      <div style={{fontFamily:"'Oswald',sans-serif",fontSize:15,letterSpacing:4,color:C.gray,textTransform:"uppercase",marginBottom:24}}>Service Advisor Access</div>
      <div style={{width:"100%",maxWidth:280}}>
        <label style={S.label}>Staff PIN</label>
        <input type="password" value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attempt()} placeholder="••••"
          style={{...S.input,fontSize:24,letterSpacing:10,textAlign:"center",border:`1px solid ${error?"#ff6b6b":C.mid}`}} />
        {error && <div style={{color:"#ff6b6b",fontSize:12,textAlign:"center",marginBottom:10,marginTop:-8}}>Incorrect PIN</div>}
        <button onClick={attempt} style={S.btn(C.orange,C.black)}>Sign In</button>
        
      </div>
    </div>
  );
}

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
function AdminPanel({ onLogout }) {
  const [view, setView] = useState("list");
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [visits, setVisits] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [svcDesc, setSvcDesc] = useState("");
  const [svcAmt, setSvcAmt] = useState("");
  const [bonusPts, setBonusPts] = useState("");
  const [bonusNote, setBonusNote] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newBirth, setNewBirth] = useState("");
  const year = new Date().getFullYear();

  const toast_=(msg,color="#22c55e")=>{ setToast({msg,color}); setTimeout(()=>setToast(null),2500); };

  const loadCustomers=async()=>{
    try {
      const data=await db.query("customers","?order=name.asc&select=*");
      setCustomers(data);
    } catch(e){ console.error(e); }
    setLoading(false);
  };

  const loadSelected=async(c)=>{
    try {
      const [v,cp]=await Promise.all([
        db.query("visits",`?customer_id=eq.${c.id}&order=created_at.desc`),
        db.query("coupons",`?customer_id=eq.${c.id}&order=created_at.desc`)
      ]);
      setVisits(v); setCoupons(cp);
    } catch(e){ console.error(e); }
  };

  useEffect(()=>{ loadCustomers(); },[]);

  const selectCustomer=async(c)=>{ setSelected(c); await loadSelected(c); setView("detail"); };

  const getSpent=(c)=>{
    // This is approximate from customer list — detail view uses real visits
    return 0;
  };

  const addService=async()=>{
    if (!svcDesc||!svcAmt||!selected) return;
    const amt=parseFloat(svcAmt); if(isNaN(amt)||amt<=0) return;
    const ptsEarned=Math.floor(amt)+50;
    try {
      await db.insert("visits",{customer_id:selected.id,service:svcDesc,amount:amt,pts_earned:ptsEarned});
      await db.update("customers",{id:selected.id},{points:selected.points+ptsEarned});
      setSelected(s=>({...s,points:s.points+ptsEarned}));
      await loadSelected(selected);
      setSvcDesc(""); setSvcAmt("");
      toast_(`✓ Logged · +${ptsEarned} pts`);
    } catch(e){ toast_("Error saving","#ef4444"); console.error(e); }
  };

  const addBonus=async()=>{
    const pts=parseInt(bonusPts); if(isNaN(pts)||pts===0||!selected) return;
    try {
      const newPts=Math.max(0,selected.points+pts);
      await db.update("customers",{id:selected.id},{points:newPts});
      setSelected(s=>({...s,points:newPts}));
      setBonusPts(""); setBonusNote("");
      toast_(`✓ ${pts>0?"+":""}${pts} pts applied`);
    } catch(e){ toast_("Error saving","#ef4444"); console.error(e); }
  };

  const redeemCoupon=async(couponId)=>{
    try {
      await db.update("coupons",{id:couponId},{redeemed:true});
      await loadSelected(selected);
      toast_("✓ Coupon marked as redeemed");
    } catch(e){ toast_("Error","#ef4444"); console.error(e); }
  };

  const enrollCustomer=async()=>{
    if (!newName||!newPhone) return;
    try {
      const anniversaryDate=new Date(Date.now()+365*24*60*60*1000).toISOString().split("T")[0];
      const memberSince=new Date().toLocaleDateString("en-US",{month:"long",year:"numeric"});
      await db.insert("customers",{
        name:newName,phone:normalizePhone(newPhone),email:newEmail,
        birth_month:newBirth?MONTHS.indexOf(newBirth):null,
        member_since:memberSince,anniversary_date:anniversaryDate,
        points:0,claimed_bonuses:[]
      });
      await loadCustomers();
      setNewName("");setNewPhone("");setNewEmail("");setNewBirth("");
      setView("list"); toast_("✓ Member enrolled!");
    } catch(e){ toast_("Error enrolling","#ef4444"); console.error(e); }
  };

  const filtered=customers.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||c.phone.includes(search));
  const totalDonated=customers.reduce((s,c)=>{
    // approximate — leaderboard has real data
    return s;
  },0);

  const activeCoupons=coupons.filter(c=>!c.redeemed&&!c.donated);
  const donatedCoupons=coupons.filter(c=>c.donated);
  const redeemedCoupons=coupons.filter(c=>c.redeemed);
  const visitSpent=visits.reduce((s,v)=>s+v.amount,0);

  return (
    <div style={{...S.screen,paddingBottom:32}}>
      <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Barlow:wght@300;400;500;600&display=swap" rel="stylesheet" />
      {toast && <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",background:toast.color,color:C.black,padding:"10px 20px",borderRadius:10,fontFamily:"'Oswald',sans-serif",fontWeight:600,fontSize:14,letterSpacing:1,zIndex:999,whiteSpace:"nowrap",boxShadow:"0 4px 20px #0008"}}>{toast.msg}</div>}

      <div style={{background:C.dark,padding:"14px 18px",borderBottom:`1px solid ${C.mid}`,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <img src={LOGO_SQUARE} alt="FAR" style={{height:38,width:38,borderRadius:6,mixBlendMode:"screen"}} />
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:15,fontWeight:600,letterSpacing:2,textTransform:"uppercase",lineHeight:1}}>Staff Panel</div>
        </div>
        <button onClick={onLogout} style={{background:C.dark3,border:`1px solid ${C.mid}`,color:C.gray,borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:10,fontFamily:"'Oswald',sans-serif",letterSpacing:2,textTransform:"uppercase"}}>Sign Out</button>
      </div>

      <div style={{padding:16}}>
        {view==="list" && (
          <>
            <div style={{display:"flex",gap:10,marginBottom:14}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or phone…" style={{...S.input,flex:1,marginBottom:0}} />
              <button onClick={()=>setView("add")} style={{background:C.orange,border:"none",borderRadius:10,padding:"0 18px",color:C.black,fontFamily:"'Oswald',sans-serif",fontWeight:600,fontSize:22,cursor:"pointer"}}>+</button>
            </div>
            {loading
              ? <div style={{textAlign:"center",color:C.gray,padding:"40px 0"}}>Loading members...</div>
              : <>
                <div style={{fontSize:10,color:C.mid,letterSpacing:3,textTransform:"uppercase",fontFamily:"'Oswald',sans-serif",marginBottom:10}}>{filtered.length} Members</div>
                {filtered.map(c=>{
                  const t=getTier(0);
                  return (
                    <button key={c.id} onClick={()=>selectCustomer(c)} style={{width:"100%",background:C.dark2,border:`1px solid ${C.mid}`,borderRadius:12,padding:"14px 16px",marginBottom:10,cursor:"pointer",textAlign:"left",color:C.white}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div>
                          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:17,fontWeight:500,letterSpacing:1}}>{c.name}</div>
                          <div style={{fontSize:12,color:C.mid,marginTop:2}}>{c.phone}</div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:12,color:C.orange,fontFamily:"'Oswald',sans-serif",fontWeight:600}}>{c.points.toLocaleString()} pts</div>
                          <div style={{fontSize:11,color:C.mid,marginTop:2}}>Since {c.member_since}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
                {filtered.length===0 && <div style={{textAlign:"center",color:C.mid,padding:"40px 0",fontFamily:"'Oswald',sans-serif",fontSize:14,letterSpacing:2}}>No members found</div>}
              </>
            }
          </>
        )}

        {view==="edit" && selected && (
          <StaffEditCustomer
            customer={selected}
            toast_={toast_}
            onSave={async()=>{
              await loadSelected(selected);
              await loadCustomers();
              setView("detail");
            }}
            onBack={()=>setView("detail")}
          />
        )}

        {view==="add" && (
          <>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
              <button onClick={()=>setView("list")} style={{background:"none",border:"none",color:C.gray,cursor:"pointer",fontSize:22,padding:0}}>←</button>
              <div style={{fontFamily:"'Oswald',sans-serif",fontSize:18,fontWeight:600,letterSpacing:3,textTransform:"uppercase"}}>Enroll Member</div>
            </div>
            <label style={S.label}>Full Name *</label>
            <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="First Last" style={S.input} />
            <label style={S.label}>Phone *</label>
            <input value={newPhone} onChange={e=>setNewPhone(e.target.value)} placeholder="555-000-0000" style={S.input} />
            <label style={S.label}>Email</label>
            <input value={newEmail} onChange={e=>setNewEmail(e.target.value)} placeholder="optional" style={S.input} />
            <label style={S.label}>Birth Month</label>
            <select value={newBirth} onChange={e=>setNewBirth(e.target.value)} style={S.input}>
              <option value="">Select…</option>
              {MONTHS.map(m=><option key={m} value={m}>{m}</option>)}
            </select>
            <button onClick={enrollCustomer} style={S.btn(C.orange,C.black)}>Enroll Member</button>
          </>
        )}

        {view==="detail" && selected && (
          <>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
              <button onClick={()=>{setView("list");setSelected(null);loadCustomers();}} style={{background:"none",border:"none",color:C.gray,cursor:"pointer",fontSize:22,padding:0}}>←</button>
              <div style={{fontFamily:"'Oswald',sans-serif",fontSize:18,fontWeight:600,letterSpacing:3,textTransform:"uppercase"}}>Member Detail</div>
            </div>
            <div style={{marginBottom:16,marginTop:-8}}>
              <button onClick={()=>setView("edit")} style={{...S.btn(C.orange2,C.white,{padding:"8px 14px",fontSize:11})}}>✏️ Edit Member Info</button>
            </div>

            {(()=>{
              const t=getTier(visitSpent);
              const yearDonated=getYearDonated(coupons);
              return (
                <>
                  <div style={{background:`${t.color}0e`,border:`1px solid ${t.color}35`,borderRadius:16,padding:18,marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                      <div>
                        <div style={{fontFamily:"'Oswald',sans-serif",fontSize:21,fontWeight:600,letterSpacing:1}}>{selected.name.toUpperCase()}</div>
                        <div style={{fontSize:12,color:C.gray,marginTop:2}}>{selected.phone}</div>
                        <div style={{fontSize:11,color:C.mid,marginTop:2}}>Since {selected.member_since} · Ann. {new Date(selected.anniversary_date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</div>
                      </div>
                      <TierBadge tier={t} size="lg" />
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
                      {[["Spent",`$${visitSpent.toLocaleString()}`,C.white],["Points",selected.points.toLocaleString(),C.orange],["Coupons",activeCoupons.length,C.orange3],["Donated",`$${yearDonated}`,C.alaGold]].map(([l,v,c])=>(
                        <div key={l} style={{background:`${C.black}60`,borderRadius:8,padding:"8px 10px"}}>
                          <div style={{fontSize:9,color:C.mid,textTransform:"uppercase",letterSpacing:2,fontFamily:"'Oswald',sans-serif"}}>{l}</div>
                          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:16,fontWeight:600,color:c,lineHeight:1.2}}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <ProgressBar spent={visitSpent} />
                  </div>

                  {activeCoupons.length>0 && (
                    <div style={S.card({border:`1px solid ${C.orange}30`})}>
                      <div style={{fontFamily:"'Oswald',sans-serif",fontSize:13,fontWeight:600,letterSpacing:2,color:C.orange,marginBottom:12,textTransform:"uppercase"}}>⚙️ Active Coupons — Mark as Redeemed</div>
                      {activeCoupons.map(cp=>(
                        <div key={cp.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.dark3}`}}>
                          <div>
                            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:18,fontWeight:600,color:C.orange}}>$25 OFF</div>
                            <div style={{fontSize:10,color:C.mid}}>Expires {cp.expires_at?new Date(cp.expires_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):""}</div>
                          </div>
                          <button onClick={()=>redeemCoupon(cp.id)} style={S.btn(C.orange,C.black,{width:"auto",padding:"8px 14px",fontSize:11})}>Mark Redeemed</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {donatedCoupons.length>0 && (
                    <div style={S.card({background:C.alaNavy,border:`1px solid ${C.alaBlue}`})}>
                      <div style={{fontFamily:"'Oswald',sans-serif",fontSize:13,letterSpacing:2,color:C.alaGold,textTransform:"uppercase",marginBottom:8}}>⭐ ALA Donations ({donatedCoupons.length})</div>
                      {donatedCoupons.map(cp=>(
                        <div key={cp.id} style={{fontSize:12,color:C.gray,padding:"6px 0",borderBottom:`1px solid ${C.alaBorder}`,display:"flex",justifyContent:"space-between"}}>
                          <span>$25 donated {new Date(cp.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span>
                          <span style={{color:C.gray2}}>{cp.anonymous?"Anonymous":selected.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {redeemedCoupons.length>0 && (
                    <div style={S.card({opacity:0.5})}>
                      <div style={{fontFamily:"'Oswald',sans-serif",fontSize:12,letterSpacing:2,color:C.gray,textTransform:"uppercase",marginBottom:8}}>✓ Redeemed ({redeemedCoupons.length})</div>
                      {redeemedCoupons.map(cp=><div key={cp.id} style={{fontSize:12,color:C.mid,padding:"4px 0"}}>$25 redeemed</div>)}
                    </div>
                  )}

                  <div style={S.card()}>
                    <div style={{fontFamily:"'Oswald',sans-serif",fontSize:13,fontWeight:600,letterSpacing:2,color:C.orange,marginBottom:12,textTransform:"uppercase"}}>📋 Log Service Visit</div>
                    <label style={S.label}>Service Description</label>
                    <input value={svcDesc} onChange={e=>setSvcDesc(e.target.value)} placeholder="e.g. Full Brake Job" style={S.input} />
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                      <div><label style={S.label}>Invoice Amount ($)</label><input value={svcAmt} onChange={e=>setSvcAmt(e.target.value)} placeholder="0.00" type="number" style={S.input} /></div>
                    </div>
                    {svcAmt&&!isNaN(parseFloat(svcAmt))&&parseFloat(svcAmt)>0&&(
                      <div style={{fontSize:11,color:C.orange,marginBottom:10,fontFamily:"'Oswald',sans-serif",letterSpacing:2}}>→ {Math.floor(parseFloat(svcAmt))+50} pts (${Math.floor(parseFloat(svcAmt))} spend + 50 visit)</div>
                    )}
                    <button onClick={addService} style={S.btn(C.orange,C.black)}>Log Visit & Award Points</button>
                  </div>

                  <div style={S.card()}>
                    <div style={{fontFamily:"'Oswald',sans-serif",fontSize:13,fontWeight:600,letterSpacing:2,color:C.orange2,marginBottom:12,textTransform:"uppercase"}}>⭐ Manual Point Adjustment</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                      <div><label style={S.label}>Points (– to deduct)</label><input value={bonusPts} onChange={e=>setBonusPts(e.target.value)} placeholder="+500 or -100" type="number" style={S.input} /></div>
                      <div><label style={S.label}>Reason</label><input value={bonusNote} onChange={e=>setBonusNote(e.target.value)} placeholder="Referral, testimonial…" style={S.input} /></div>
                    </div>
                    <button onClick={addBonus} style={S.btn(`${C.orange2}18`,C.orange2,{border:`1px solid ${C.orange2}40`})}>Apply Adjustment</button>
                  </div>

                  <div style={{fontFamily:"'Oswald',sans-serif",fontSize:11,fontWeight:600,letterSpacing:3,color:C.mid,textTransform:"uppercase",marginBottom:10}}>Service History</div>
                  {visits.length===0&&<div style={{color:C.mid,fontSize:13,padding:"12px 0"}}>No visits logged yet.</div>}
                  {visits.map((v,i)=>(
                    <div key={i} style={S.card({padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"})}>
                      <div>
                        <div style={{fontFamily:"'Oswald',sans-serif",fontSize:13,fontWeight:500,letterSpacing:1}}>{v.service}</div>
                        <div style={{fontSize:11,color:C.mid,marginTop:2}}>{new Date(v.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0,marginLeft:12}}>
                        <div style={{fontFamily:"'Oswald',sans-serif",fontSize:15,fontWeight:600}}>${v.amount.toLocaleString()}</div>
                        <div style={{fontSize:11,color:C.orange}}>+{v.pts_earned} pts</div>
                      </div>
                    </div>
                  ))}
                </>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("splash");
  const [customer, setCustomer] = useState(null);
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(()=>{
    // Check if already installed
    try {
      const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
      setIsInstalled(!!standalone);
    } catch(e) {}

    // Capture Android install prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  },[]);

  const handleInstall = () => {
    if (deferredPrompt) {
      // Android - trigger native install prompt
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(()=>setDeferredPrompt(null));
    } else {
      // iPhone/other - show instructions
      setShowInstall(true);
    }
  };

  const dismissInstall = () => {
    setShowInstall(false);
  };

  useEffect(()=>{
    // Skip DB test entirely — show app immediately
    // DB connection happens only when customer actually signs in or signs up
    setDbReady(true);
  },[]);

  if (!dbReady) return <LoadingScreen message="Loading..." />;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Barlow:wght@300;400;500;600&display=swap" rel="stylesheet" />
      {showInstall && <InstallPrompt onDismiss={dismissInstall} />}
      {screen==="customer"&&customer && <CustomerApp customer={customer} onLogout={()=>{setCustomer(null);setScreen("splash");}} />}
      {screen==="adminLogin" && <AdminLogin onSuccess={()=>{setAdminAuthed(true);setScreen("admin");}} onBack={()=>setScreen("splash")} />}
      {screen==="admin"&&adminAuthed && <AdminPanel onLogout={()=>{setAdminAuthed(false);setScreen("splash");}} />}
      {screen==="signup" && <SignupScreen onBack={()=>setScreen("splash")} onComplete={c=>{setCustomer(c);setScreen("customer");}} />}
      {screen==="login" && <LoginScreen onBack={()=>setScreen("splash")} onLogin={c=>{setCustomer(c);setScreen("customer");}} />}
      {screen==="splash" && <SplashScreen onLogin={()=>setScreen("login")} onSignup={()=>setScreen("signup")} onAdmin={()=>setScreen("adminLogin")} onInstall={handleInstall} isInstalled={isInstalled} />}
    </>
  );
}
