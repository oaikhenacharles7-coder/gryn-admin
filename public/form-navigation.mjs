export function controlKeys(els){const counts=new Map();return els.map(el=>{const base=el.name+'|'+el.type+'|'+(el.dataset?.draftKey||'');const index=counts.get(base)||0;counts.set(base,index+1);return base+'|'+index;});}
export function restoreDraftControls(els,values){const keys=controlKeys(els),byKey=new Map(keys.map((k,i)=>[k,els[i]]));for(const v of values){const el=byKey.get(v.key);if(!el)continue;if(v.type==='file'){try{el.files=v.files;}catch{}}else if(['checkbox','radio'].includes(v.type))el.checked=v.checked;else el.value=v.value;}}
// Temporary drafts stay in memory in this tab; never persist personal files to browser storage.
export function installFormNavigation(ctx){
 const modal=document.querySelector('#dialog'),body=document.querySelector('#dialogbody'),title=document.querySelector('#dialogtitle');
 const drafts=new Map(),history=[];let stack=[],parked=null,restoring=false;
 const controls=f=>[...f.querySelectorAll('input[name],select[name],textarea[name]')];
 // Do not include transient visual flags in a form's identity.
 const identity=f=>{const d={...f.dataset};delete d.unsaved;return ctx.actor()+'|'+ctx.route()+'|'+JSON.stringify(d);};

 function capture(f){if(!f||restoring)return;const k=identity(f);const els=controls(f),keys=controlKeys(els);drafts.set(k,els.map((el,index)=>({key:keys[index],name:el.name,type:el.type,value:el.value,checked:el.checked,files:el.type==='file'?el.files:null})));f.dataset.unsaved='true';}
 function restore(f){const values=drafts.get(identity(f));if(!values)return false;restoreDraftControls(controls(f),values);f.dataset.unsaved='true';return true;}
 function frame(){return {title:title.textContent,nodes:[...body.childNodes],scroll:modal.scrollTop};}
 function show(f){restoring=true;title.textContent=f.title;body.replaceChildren(...f.nodes);if(!modal.open)modal.showModal();modal.scrollTop=f.scroll;restoring=false;decorate();}
 function beforeOpen(){if(!restoring&&modal.open&&body.childNodes.length)stack.push(frame());if(stack.length>12)stack.shift();}
 function previous(){if(modal.open){for(const f of body.querySelectorAll('form[data-unsaved]'))capture(f);parked=frame();if(stack.length)show(stack.pop());else modal.close();notice();return;}const dest=history.pop()||'dashboard';restoring=true;ctx.go(dest);restoring=false;}
 function routeChange(to){if(to!==ctx.route()&&!restoring)history.push(ctx.route());if(history.length>30)history.shift();}
 function saved(f){drafts.delete(identity(f));delete f.dataset.unsaved;stack=[];parked=null;for(const current of document.querySelectorAll('form'))if(identity(current)===identity(f)){delete current.dataset.unsaved;for(const input of current.querySelectorAll('input[type="file"]'))input.value='';}notice();}
 function discardClose(){if(body.querySelector('[data-unsaved]')&&!confirm('Discard changes in this form? Choose Cancel, then Previous, to keep a temporary draft.'))return;for(const f of body.querySelectorAll('form'))drafts.delete(identity(f));stack=[];parked=null;modal.close();notice();}
 function notice(){let n=document.querySelector('#formDraftNotice');if(!n){n=document.createElement('div');n.id='formDraftNotice';document.querySelector('main').prepend(n);}n.replaceChildren();n.hidden=!parked&&!drafts.size;if(!parked&&drafts.size){const info=document.createElement('span');info.textContent='Unsaved form entries are kept in this tab. Return to their page to continue. Reloading or signing out clears them.';n.append(info);}if(parked){const text=document.createElement('span');text.textContent='Form paused · '+parked.title;const b=document.createElement('button');b.type='button';b.className='secondary smallbtn';b.textContent='Resume form';b.onclick=()=>{const p=parked;parked=null;show(p);notice();};n.append(text,b);}if(parked||drafts.size){const discard=document.createElement('button');discard.type='button';discard.className='secondary smallbtn';discard.textContent='Discard temporary drafts';discard.onclick=()=>{if(!confirm('Discard all unfinished form entries in this tab?'))return;drafts.clear();stack=[];parked=null;modal.close();ctx.go(ctx.route());notice();};n.append(discard);}}
 function decorate(){for(const f of document.querySelectorAll('#content form,#dialogbody form')){if(f.querySelector('.form-navigation'))continue;const restored=restore(f);const bar=document.createElement('div');bar.className='form-navigation';const b=document.createElement('button');b.type='button';b.className='secondary';b.textContent='← Previous';b.onclick=previous;const help=document.createElement('small');help.textContent='Changes are saved only when you submit. Previous keeps your entries in this tab.';bar.append(b,help);f.prepend(bar);if(restored)document.dispatchEvent(new CustomEvent('gryn:form-restored',{detail:f}));}notice();}
 document.addEventListener('input',e=>{capture(e.target.closest('form'));},true);
 document.addEventListener('change',e=>capture(e.target.closest('form')),true);
 document.addEventListener('gryn:form-draft-updated',e=>capture(e.detail));
 document.addEventListener('gryn:form-saved',e=>saved(e.detail));
 modal.addEventListener('cancel',e=>{e.preventDefault();discardClose();});
 window.addEventListener('beforeunload',e=>{if(drafts.size){e.preventDefault();e.returnValue='';}});
 document.addEventListener('invalid',e=>{e.target.setAttribute('aria-invalid','true');e.target.closest('form')?.querySelector('.form-navigation small')?.replaceChildren(document.createTextNode('Please complete the highlighted field before saving.'));},true);
 document.addEventListener('input',e=>e.target.removeAttribute('aria-invalid'));
 new MutationObserver(()=>decorate()).observe(document.querySelector('#content'),{childList:true});
 return {beforeOpen,decorate,previous,routeChange,discardClose,saved,hasDrafts:()=>drafts.size>0,reset:()=>{drafts.clear();stack=[];parked=null;notice();}};
}
