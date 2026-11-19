export async function requestJSON(path,body,{send=fetch,pause=ms=>new Promise(r=>setTimeout(r,ms)),onRetry=()=>{},attempts=5}={}){
 const value=body?{...body,...(path.endsWith('/action')&&!body._requestId?{_requestId:crypto.randomUUID()}:{} )}:undefined;
 const safe=!body||path.endsWith('/action');
 for(let attempt=0;;attempt++){try{const r=await send(path,{cache:'no-store',signal:AbortSignal.timeout(20000),...(value?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(value)}:{})});let data;try{data=await r.json();}catch{throw Object.assign(Error('CRM connection interrupted.'),{retry:true});}if(!r.ok)throw Object.assign(Error(data.error||'CRM request failed.'),{status:r.status,retry:[408,429,500,502,503,504,409].includes(r.status)&&!data.conflict});return data;}catch(e){if(!safe||attempt>=attempts-1||e.status&&!e.retry)throw e;onRetry(attempt+1);await pause(Math.min(15000,1000*2**attempt));}}
}
