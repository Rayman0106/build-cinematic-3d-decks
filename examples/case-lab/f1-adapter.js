/* Local case-study adapter. Inserted inside the approved deck closure.
 * Actor, camera, material, route and typography samplers remain unchanged. */
let caseLabScene=null,caseLabMoving=false;
let caseLabPhotoPrepared=window.CASE_PLAN?.clip==='f1-outline';
function caseLabPlayback(moving){const next=Boolean(moving);if(next!==caseLabMoving){window.F1Cinematic.setPlayback(next);caseLabMoving=next;}if(next)window.F1Cinematic.sampleFrame?.(performance.now());}
const caseLabClips={
 'f1-launch':{title:'双车发车：迈凯伦与红牛',kind:'opening',offset:window.CASE_PLAN?.openingOffset||0,duration:31-(window.CASE_PLAN?.openingOffset||0)},
 'f1-outline':{title:'迈凯伦超越 → 慢放 → 轮廓 → 照片',kind:'overtake',from:0,to:1,duration:story.durations.overtake},
 'f1-budget':{title:'从预算条驶出 → 恢复实体 → 支出上限',kind:'regulation',from:2,to:3,duration:story.durations.regulation},
 'f1-cadillac':{title:'发车区检阅 → 凯迪拉克轮廓',kind:'entry',from:5,to:6,duration:story.durations.entry},
 'f1-upgrade':{title:'拆下前后翼，迭代后回装',kind:'advantage',from:3,to:4,duration:story.durations.advantage},
 'f1-racing':{title:'尾流、交叉线与出弯超越',kind:'competition',from:4,to:5,duration:story.durations.competition}
};
function caseLabStart(){
 if(!ready)return false;
 stopMotion();caseLabMoving=false;awaitingStart=false;starting=false;
 const gate=$('#start-gate');if(gate){gate.hidden=true;gate.style.display='none';}
 document.body.classList.remove('deck-await-start');return true;
}
function caseLabSample(id,seconds,moving=false){
 const clip=caseLabClips[id];if(!clip||!Number.isFinite(seconds))throw new RangeError('Unknown clip or invalid time');
 if(window.CASE_PLAN&&!window.CASE_PLAN.clips.includes(id))throw new Error('This clip needs its own asset profile');
 if(!ready||awaitingStart)throw new Error('The native deck is not started');
 const t=Math.max(0,Math.min(clip.duration,seconds));
 if(clip.kind==='opening'){
  if(caseLabScene!==id){stopMotion();caseLabMoving=false;window.F1Cinematic.reset();opening=false;}
  caseLabPlayback(moving);openingFrame(t+(clip.offset||0),false);if(t===clip.duration){showSlideInstant(0);caseLabMoving=false;}
 }else{
  if(caseLabScene!==id||!transition||transition.from!==clip.from||transition.to!==clip.to||t<transition.seconds){
   stopMotion();caseLabMoving=false;showSlideInstant(clip.from);beginTransition(clip.from,clip.to);
  }
  transition.playing=false;caseLabPlayback(moving);transitionFrame(t);if(t===clip.duration)caseLabMoving=false;
 }
 caseLabScene=id;
 return {id,time:t,duration:clip.duration,scope:'Original native camera, actors, materials and typography'};
}
const caseLabApi=Object.freeze({start:caseLabStart,sample:caseLabSample,async prepareClip(id){const clip=caseLabClips[id];if(!clip||window.CASE_PLAN&&!window.CASE_PLAN.clips.includes(id))throw new Error('Clip unavailable in this profile');if(id==='f1-outline'&&!caseLabPhotoPrepared){calibratePhoto();preparePhotoVector();caseLabPhotoPrepared=true;}await window.F1Cinematic.prepareLabClip?.(clip.kind);},catalogue:()=>Object.entries(caseLabClips).filter(([id])=>!window.CASE_PLAN||window.CASE_PLAN.clips.includes(id)).map(([id,value])=>({id,...value})),pause(){caseLabMoving=false;window.F1Cinematic.setPlayback(false);window.F1Sound?.stop();}});
