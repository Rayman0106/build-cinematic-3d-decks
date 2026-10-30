/* Message-only bridge; file:// documents need no cross-frame DOM access. */
(() => {
 const channel='cinematic-real-case-lab-v1',project=window.CINEMATIC_CASE_PROJECT;
 const send=message=>parent.postMessage({channel,project,...message},'*');
 const api=()=>project==='f1'?window.F1Briefing?.lab:window.__DECK__?.lab;
 let reportedReady=false,lastProgress=-1,prepareSerial=Promise.resolve();
 function notify(){
  const state=project==='f1'?window.F1Briefing?.getState():window.__DECK__?.inspect();
  const loading=project==='f1'?window.F1Boot?.state():window.DeckPreparation?.inspect();
  const percent=project==='f1'?loading?.percent:loading?loading.completed/Math.max(1,loading.stages)*100:null;
  if(Number.isFinite(percent)&&Math.floor(percent)!==lastProgress){lastProgress=Math.floor(percent);send({type:'progress',percent:lastProgress,detail:project==='f1'?'当前实验的赛车、贴图与原版镜头':window.CASE_PLAN?.three===false?'本页原版字形与内容锚点':'人物、房间与当前片段'});}
  if(state?.ready&&api()&&!reportedReady){reportedReady=true;if(project==='math'&&window.CASE_PLAN?.three!==false&&state.three===false)send({type:'error',message:'原项目的人物与房间未能创建 3D 场景，未将二维回退当作真实场景播放。'});else send({type:'ready',clips:api().catalogue()});}
 }
 const poll=setInterval(()=>{try{notify();if(reportedReady)clearInterval(poll);}catch(error){send({type:'error',message:String(error.message||error)});}},250);
 window.addEventListener('message',async event=>{
  const data=event.data;if(event.source!==parent||!data||data.channel!==channel)return;
  try{
   const native=api();if(!native)throw new Error('原项目正在准备，请稍候');
   if(data.type==='start'){if(!native.start())throw new Error('原项目尚未准备完成');send({type:'started'});}
   else if(data.type==='prepare'){prepareSerial=prepareSerial.catch(()=>{}).then(()=>native.prepareClip?.(data.clip));await prepareSerial;send({type:'clip-ready',clip:data.clip,request:data.request,clips:native.catalogue()});}
   else if(data.type==='sample'){const result=native.sample(data.clip,Number(data.time),Boolean(data.playing));send({type:'sampled',seq:data.seq,...result});}
   else if(data.type==='pause')native.pause();
   else if(data.type==='text')document.documentElement.classList.toggle('case-lab-hide-text',data.visible===false);
  }catch(error){send({type:'error',seq:data.seq,message:String(error.message||error)});}
 });
 window.addEventListener('error',event=>send({type:'error',message:event.message||'原项目脚本加载失败'}));
 window.addEventListener('unhandledrejection',event=>send({type:'error',message:String(event.reason?.message||event.reason||'准备失败')}));
 window.addEventListener('keydown',event=>{
  if(event.target.closest?.('input,select,textarea'))return;
  if([' ','ArrowLeft','ArrowRight','r','R','m','M','f','F','e','E','n','N'].includes(event.key)){
   event.preventDefault();event.stopImmediatePropagation();
   send({type:'key',key:event.key,shift:event.shiftKey});
  }
 },true);
 window.addEventListener('pagehide',()=>{clearInterval(poll);api()?.pause();});
 send({type:'hello'});
})();
