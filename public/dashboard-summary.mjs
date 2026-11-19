import {isApplication} from './application-rules.mjs';
export const lagosDay=(now=new Date())=>new Date(+now+3600000).toISOString().slice(0,10);
export function periodBounds(period,day){
 const start=new Date(day+'T00:00:00Z');if(!Number.isFinite(+start))throw Error('Choose a valid date.');
 if(period==='week')start.setUTCDate(start.getUTCDate()-(start.getUTCDay()+6)%7);
 if(period==='month')start.setUTCDate(1);
 if(period==='year'){start.setUTCMonth(0,1);}
 const end=new Date(start);if(period==='year')end.setUTCFullYear(end.getUTCFullYear()+1);else if(period==='month')end.setUTCMonth(end.getUTCMonth()+1);else end.setUTCDate(end.getUTCDate()+(period==='week'?7:1));
 return {from:+start-3600000,to:+end-3600000,label:start.toISOString().slice(0,10)+' – '+new Date(+end-86400000).toISOString().slice(0,10)};
}
export function dashboardSummary(state,period='month',day=lagosDay()){
 const bounds=periodBounds(period,day),leads=new Map(state.leads.map(l=>[l.id,l]));
 const apps=state.applications.filter(a=>isApplication(a)&&Date.parse(a.createdAt)>=bounds.from&&Date.parse(a.createdAt)<bounds.to);
 const counts=field=>{const rows=new Map();for(const a of apps){const name=String(a[field]||leads.get(a.leadId)?.[field]||'Not recorded').trim()||'Not recorded',key=name.toLowerCase();const row=rows.get(key)||{name,count:0};row.count++;rows.set(key,row);}return [...rows.values()].sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name)).slice(0,5);};
 const rank=(people,field)=>people.map(u=>{const cases=apps.filter(a=>{const l=leads.get(a.leadId);return (field==='staff'?(l?.admissionId||l?.staffId):l?.referralId)===u.id;});return {name:u.name,count:cases.length,enrolled:cases.filter(a=>a.status==='Enrolled').length,offers:cases.filter(a=>/offer/i.test(a.status)).length,submitted:cases.filter(a=>a.submittedAt).length};}).filter(r=>r.count).sort((a,b)=>b.enrolled-a.enrolled||b.offers-a.offers||b.submitted-a.submitted||b.count-a.count||a.name.localeCompare(b.name)).slice(0,5);
 return {...bounds,total:apps.length,countries:counts('country'),universities:counts('school'),staff:rank(state.staff,'staff'),agents:rank(state.referrals||[],'referral')};
}
