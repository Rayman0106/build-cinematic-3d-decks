/* Local case-study adapter. Original scene/letter/chart functions are reused. */
let caseLabScene=null,caseLabPreviousTime=0;
const caseLabPrepared=new Set();
function caseLabPages(id){return window.CaseLabPagesFor?.(id)||({'math-screen':[4,5],'math-room':[11,12],'math-67':[12],'math-closing':[14],'math-type':[8],'math-mean':[9],'math-words':[11]}[id]||[8]);}
function caseLabShots(id){const clip=caseLabCatalogue().find(c=>c.id===id);if(!clip)return[];return clip.kind==='episode'?[0,clip.duration*.5,clip.duration].map(t=>[clip.page,clip.page,1,t]):[0,.55,1].map(p=>[clip.from,clip.to,p,0]);}
async function caseLabPrepareClip(id){
 if(caseLabPrepared.has(id))return;
 if(window.CASE_PLAN&&!window.CASE_PLAN.clips.includes(id))throw new Error('Clip unavailable in this profile');
 const pages=caseLabPages(id);await window.DeckTypography.prepare(sections,{only:pages,yieldControl:boot.tick});
 if(scene?.warmup)await scene.warmup({shots:caseLabShots(id),yieldControl:boot.tick});
 for(const page of pages){const d=durationFor(page);for(const t of[0,d*.55,d]){updateStoryUI(page,t);await boot.tick();}}
 caseLabPrepared.add(id);caseLabScene=null;
}
function caseLabCatalogue(){return[
 {id:'math-screen',title:'从实体房间进入电脑屏幕',from:4,to:5,duration:2.7,kind:'transition'},
 {id:'math-room',title:'从证据页面回到人物',from:11,to:12,duration:2.7,kind:'transition'},
 {id:'math-type',title:'两侧图形组成 slowed down',page:8,duration:durationFor(8),kind:'episode'},
 {id:'math-mean',title:'图中的点组成 Mean / Median',page:9,duration:durationFor(9),kind:'episode'},
 {id:'math-words',title:'从正文抽取字母组成判断',page:11,duration:durationFor(11),kind:'episode'},
 {id:'math-67',title:'人物双臂交替：肩、肘、腕联动',page:12,duration:durationFor(12),kind:'episode'},
 {id:'math-closing',title:'原版人物谢幕',page:14,duration:durationFor(14),kind:'episode'}
];}
function caseLabStart(){
 if(!ready)return false;
 cancelAnimationFrame(raf);raf=0;captureFrozen=true;started=true;starting=false;auto=false;reduce=false;
 $('#viewport').inert=false;$('#controls').inert=false;boot.dismiss();return true;
}
function caseLabSample(id,seconds){
 const clip=caseLabCatalogue().find(value=>value.id===id);if(!clip||!Number.isFinite(seconds))throw new RangeError('Unknown clip or invalid time');
 if(!ready||!started)throw new Error('The native deck is not started');
 cancelAnimationFrame(raf);raf=0;captureFrozen=true;auto=false;reduce=false;
 const t=Math.max(0,Math.min(clip.duration,seconds));
 if(clip.kind==='episode'){
  if(caseLabScene!==id||t<caseLabPreviousTime){transition=null;index=clip.page;chartFloors.clear();heldTypeIndex=null;settled(index,{seconds:0});}
  episode(index,t);episodeDone=true;
 }else{
  if(caseLabScene!==id||!transition||transition.from!==clip.from||transition.to!==clip.to||t<((transition.caseLabTime)||0)){
   transition=null;index=clip.from;chartFloors.clear();heldTypeIndex=null;settled(index,{finish:true});go(clip.to);
  }
  const tr=transition;if(tr){tr.caseLabTime=t;frame(tr.start+t*1000);}
 }
 caseLabScene=id;caseLabPreviousTime=t;
 return {id,time:t,duration:clip.duration,scope:'Original room, student, charts and text choreography'};
}
const caseLabApi=Object.freeze({start:caseLabStart,sample:caseLabSample,prepareClip:caseLabPrepareClip,catalogue:caseLabCatalogue,pause(){cancelAnimationFrame(raf);raf=0;captureFrozen=true;}});
