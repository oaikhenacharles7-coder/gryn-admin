const $=x=>document.querySelector(x),id=new URL(location.href).searchParams.get('id');
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let conference,actor,meeting,revision=0,dirty=false,initial=true;
const validLink=url=>/^https:\/\/(?:meet\.jit\.si\/[A-Za-z0-9_-]{8,150}|8x8\.vc\/vpaas-magic-cookie-c723237c84fb41e0833377135d426cdf\/[A-Za-z0-9_-]{8,150})$/.test(url||'');
async function action(action,extra={}){const r=await fetch('/api/gryn/action',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,id,...extra})});const d=await r.json();if(!r.ok)throw Error(d.error);return d;}
function showError(e){$('#meetingStatus').textContent=e.message||e;}
async function refresh(){
 const r=await fetch('/api/gryn/state');if(!r.ok)throw Error('Sign in to Gryn in another tab, then reload this meeting.');
 const d=await r.json();actor=d.actor;meeting=d.state?.meetings.find(x=>x.id===id);
 if(!meeting)throw Error('You are not invited to this meeting, or it does not exist.');
 const ended=meeting.status==='Ended',hasLink=validLink(meeting.meetUrl);
 $('#meetingTitle').textContent=meeting.title;
 $('#meetingStatus').textContent=meeting.status+' · '+meeting.mode+' meeting'+(!ended&&!hasLink?' · Waiting for the host to add a Jitsi link.':'');
 $('#joinMeeting').disabled=ended||!hasLink;
 $('#endMeeting').hidden=meeting.host!==actor||ended;
 $('#meetLinkPanel').hidden=meeting.host!==actor||ended;
 $('#leaveMeeting').hidden=ended||!meeting.attendance.some(a=>a.actor===actor&&!a.leftAt);
 if(initial){for(const key of ['notes','decisions','actions'])$('#meetingNotes').elements[key].value=meeting[key]||'';$('#meetLinkForm').elements.meetUrl.value=meeting.meetUrl||'';revision=meeting.revision||0;initial=false;}
 $('#meetingNotes').hidden=ended;
 if(ended){conference?.dispose();conference=null;const report=meeting.report;if(!report)return;$('#meetingReport').innerHTML=`<h3>Meeting report</h3><p>${esc(report.source)}</p><p>Ended: ${new Date(report.endedAt).toLocaleString()}</p><h3>Gryn participation records</h3>${report.attendance.map(x=>`<p>${esc(x.name)} · ${new Date(x.joinedAt).toLocaleString()} → ${new Date(x.leftAt).toLocaleString()}</p>`).join('')||'<p>No check-ins recorded.</p>'}${['notes','decisions','actions'].map(k=>`<h3>${k}</h3><p class="preserve">${esc(report[k]||'None saved.')}</p>`).join('')}`;}
}
$('#meetingNotes').addEventListener('input',()=>dirty=true);
$('#meetingNotes').onsubmit=async e=>{e.preventDefault();try{const d=await action('meetingNotes',{...Object.fromEntries(new FormData(e.target)),revision});meeting=d.state.meetings.find(x=>x.id===id);revision=meeting.revision;dirty=false;showError('Meeting notes saved.');}catch(err){showError(err)}};
$('#meetLinkForm').onsubmit=async e=>{e.preventDefault();try{await action('meetingLink',{meetUrl:e.target.elements.meetUrl.value.trim()});await refresh();showError('Jitsi link saved for invited colleagues.');}catch(err){showError(err)}};
$('#leaveMeeting').onclick=async()=>{try{conference?.executeCommand('hangup');conference?.dispose();conference=null;await action('meetingLeave');await refresh();showError('You left the meeting.');}catch(err){showError(err)}};
$('#endMeeting').onclick=async()=>{try{if(dirty)throw Error('Save your notes before ending the meeting record.');await action('meetingEnd');await refresh();}catch(e){showError(e)}};
$('#joinMeeting').onclick=async()=>{
 if(!meeting||meeting.status==='Ended'||!validLink(meeting.meetUrl))return;
 try{if(conference)return;if(meeting.meetUrl.startsWith('https://meet.jit.si/')){window.open(meeting.meetUrl,'_blank','noopener,noreferrer');await action('meetingJoin');showError('Legacy public Jitsi room opened. The room creator may need to sign in.');return;}$('#joinMeeting').disabled=true;
 const r=await fetch('/api/gryn/meeting-access',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})}),access=await r.json();if(!r.ok)throw Error(access.error);
 if(!window.JitsiMeetExternalAPI)await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://8x8.vc/vpaas-magic-cookie-c723237c84fb41e0833377135d426cdf/external_api.js';script.onload=resolve;script.onerror=()=>reject(Error('Meeting service could not load. Please retry.'));document.head.append(script);});
 conference=new window.JitsiMeetExternalAPI(access.domain,{roomName:access.roomName,jwt:access.jwt,parentNode:$('#conference'),width:'100%',height:650,configOverwrite:{startWithVideoMuted:access.mode==='audio',prejoinConfig:{enabled:false}}});
 conference.addListener('videoConferenceJoined',()=>action('meetingJoin').then(refresh).catch(showError));
 conference.addListener('videoConferenceLeft',()=>{action('meetingLeave').then(refresh).catch(showError);conference?.dispose();conference=null;});
 conference.addListener('errorOccurred',()=>showError('The meeting service reported a connection error. Check camera/microphone permissions and retry.'));
 showError('Connecting to your Gryn meeting…');
 }catch(e){showError(e);}finally{$('#joinMeeting').disabled=false;}
};
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
refresh().catch(showError);setInterval(()=>refresh().catch(showError),10000);
