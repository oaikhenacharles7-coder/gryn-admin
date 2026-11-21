// Generic training questions only. No applicant answers, identity or SAR identifiers are retained.
export const STANDARD_VERSION='gii-preparation-2026-11-21';
export const PREPARATION_RUBRIC=[
 {key:'introduction',max:10,label:'Personal introduction and previous education'},
 {key:'activity',max:15,label:'Current activities, employment and study-gap explanation; relevance to the proposed course'},
 {key:'course',max:25,label:'Course motivation, academic progression and researched actual programme modules'},
 {key:'university',max:20,label:'University strengths, relevant facilities and a learning environment suited to the applicant'},
 {key:'destination',max:15,label:'Evidence-based destination choice and education/research comparison with the home country'},
 {key:'future',max:15,label:'Genuine career plans and intended contribution to the home country and community'}
];
export const standardQuestions=[
 ['identity','Please confirm your full name.','opening'],
 ['accessibility','Can you hear clearly, and are you comfortable and ready to continue?','opening'],
 ['independent','Is anyone assisting you, and do you have any prepared answers you intend to read? Please answer in your own words.','opening'],
 ['deposit','How much have you paid towards tuition, what remains and what evidence confirms these amounts?','financial'],
 ['travel','Have you previously travelled to or applied to travel to your study destination?','history'],
 ['refusals','Have you ever been refused a visa, entry or a permit in any country? Explain the stated reasons and what has changed.','history'],
 ['choice','Why have you chosen {destination} for this programme? Compare specific education and research opportunities with your home country.','destination'],
 ['alternatives','Which other destinations and universities did you research, and what informed your final choice?','destination'],
 ['research-sites','Which official websites or other reliable resources did you use in your research?','research'],
 ['current-activity','What are you currently doing, and what have you been doing since leaving school? How does this relate to this course?','activity'],
 ['study-gap','Why return to education now? Explain any study gap using your actual work and personal history.','activity'],
 ['course-choice','Why this course, and how does it progress from or differ from your earlier studies?','course'],
 ['university-strengths','What is your university known for in your subject, and why does its learning environment suit you?','university'],
 ['facility','You mentioned a facility or laboratory. What is it used for and how does it relate to your programme?','university'],
 ['modules','Explain three actual modules from your chosen programme and what you expect to learn from them.','course'],
 ['career-contribution','How will the course affect your career? Explain your genuine plans, including any intention to return and contribute to your home country.','future'],
 ['funding','Who is funding your studies and living costs? Explain the source, timing, availability and supporting evidence for the money.','financial'],
 ['bank-evidence','Which financial documents support your plan, and can you explain the transaction history and any large deposits?','financial'],
 ['agent','Did an education agent assist? What did they do, and which research and decisions did you make yourself?','ownership'],
 ['understanding','Have you understood the questions, and would you like anything repeated or clarified?','closing'],
 ['additional','Is there anything you want to add or correct about your application or study plans?','closing'],
 ['wellbeing','Are you comfortable after the mock interview, and do you have feedback or questions about the process?','closing']
].map(([id,question,topic])=>({id:'standard-'+id,topic,question,source:'Adapted generic topics from user-supplied UKVI interview transcript, pages 5–9; not a universal UKVI script.'}));
export function rubricSchema(){return PREPARATION_RUBRIC.map(x=>({key:x.key,status:'assessed | not_assessed | needs_verification',score:'integer 0–'+x.max+' when assessed, otherwise null',evidence:'exact excerpt from supplied statement or interview answer, or empty',feedback:'specific preparation feedback'}));}
export function validatePreparationRubric(rows,corpus){if(!Array.isArray(rows)||rows.length!==PREPARATION_RUBRIC.length)throw Error('The six-part preparation rubric is required.');let total=0,assessed=0;const clean=rows.map((r,i)=>{const criterion=PREPARATION_RUBRIC[i];if(r.key!==criterion.key||!['assessed','not_assessed','needs_verification'].includes(r.status)||typeof r.evidence!=='string'||r.evidence&&!corpus.includes(r.evidence)||typeof r.feedback!=='string'||r.feedback.length>3000)throw Error('Unsupported preparation grading evidence.');if(r.status==='assessed'){if(!Number.isInteger(r.score)||r.score<0||r.score>criterion.max||r.score>0&&!r.evidence)throw Error('Invalid preparation grade.');assessed++;total+=r.score;}else if(r.score!==null)throw Error('Unassessed or unverified criteria cannot receive a numeric grade.');return {...r,max:criterion.max,label:criterion.label};});return {version:STANDARD_VERSION,criteria:clean,assessed,total:assessed===6?total:null,availablePoints:100,notice:'Internal preparation coverage and explanation grade, not an assessment of honesty, immigration intent, admission eligibility or visa outcome. Unasked topics remain unassessed. Do not require invented home ties, return promises or criticism of the home country.'};}
