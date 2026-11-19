export const PROGRAMS=['Foundation','Diploma','International Year 1 / Direct BSc','Top-Up','Pre-Master','Master - taught','Master - research','PhD','Undergraduate / Year 1'];
const school=['CV','Passport','WAEC / NECO','WAEC / NECO PIN','Personal statement'];
const refs=['Academic reference','Work reference'];
const masters=[...school.filter(t=>t!=='WAEC / NECO PIN'),'Degree certificate','Transcript',...refs];
export const DOC_CATEGORIES=[...new Set([...masters,"A' levels certificate",'ND certificate','ND transcript','HND certificate','HND transcript','IELTS','Research proposal','Thesis','Other'])];
export function requiredFor(app={}){
 let required=['Foundation','Diploma'].includes(app.program)?school:['Undergraduate / Year 1','International Year 1 / Direct BSc'].includes(app.program)?[...school,"A' levels or ND certificate",'ND transcript']:app.program==='Top-Up'?(app.topUpQualification==='Third-class BSc'?[...masters]:[...school,"A' levels or ND certificate",'ND transcript','HND certificate','HND transcript',...refs]):['Master - research','PhD'].includes(app.program)?[...masters,'Research proposal']:masters;
 return [...required,...(app.englishRequired==='Yes'?['IELTS']:[])];
}
export function missingDocuments(app={}){return requiredFor(app).filter(type=>!(app.documents||[]).some(d=>d.id&&(type==="A' levels or ND certificate"?["A' levels certificate",'ND certificate',type].includes(d.category):d.category===type)));}
export function validateSubmission(app){
 if(!PROGRAMS.includes(app.program))throw Error('Choose the program before submitting.');
 if(app.program==='Top-Up'&&!['HND','Third-class BSc'].includes(app.topUpQualification))throw Error('Choose the Top-Up qualification route.');
 const missing=missingDocuments(app);
 if(!['Green','Amber','Red'].includes(app.manualRank))throw Error('Choose Green, Amber or Red before submitting.');
 return missing;
}
export function isApplication(a){return !!(a.proceededAt||a.submittedAt||a.historical||a.status!=='In review'||a.documents?.length);}
