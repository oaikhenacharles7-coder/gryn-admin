// Successful account submissions discard temporary drafts before a fresh form is opened.
export async function submitWorkspaceForm(form,{submit,saved,success,failure,read=f=>Object.fromEntries(new FormData(f))}){
 if(form.dataset.submitting==='true'||!form.reportValidity())return;
 form.dataset.submitting='true';const buttons=[...form.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);
 try{await submit(read(form));saved(form);form.reset();await success();}catch(err){await failure(err);}finally{delete form.dataset.submitting;buttons.forEach(b=>b.disabled=false);}
}
