(() => {
 'use strict';
 const $=selector=>document.querySelector(selector),manifest=JSON.parse($('#case-manifest').textContent),channel='cinematic-real-case-lab-v1';
 const clock=new CaseClock(31),queue=new CaseFrameQueue(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let lesson=CASE_LESSONS.find(item=>item.id===manifest.defaultLesson)||CASE_LESSONS[0],clip=lesson.variants[0],project=null,profile=null,iframe=null,glyphCache=null,heavyCache=null,waitingLoad=null,catalogue=new Map(),nativeReady=false,nativeStarted=false,pendingReveal=false,prepareVersion=0,autoplayAfterReveal=false,raf=0,resizeRaf=0,loadStartedAt=0;
 const originals=manifest.projects;
 if(manifest.showcaseHome)document.querySelector('.brand').href=manifest.showcaseHome;
 const post=message=>{if(iframe?.contentWindow)iframe.contentWindow.postMessage({channel,...message},'*');};
 function setText(selector,value){if($(selector).textContent!==value)$(selector).textContent=value;}
 function sourceClip(){return catalogue.get(clip);}
 function enableControls(){
  for(const id of ['#play','#reset','#step-back','#step-next','#time','#variant'])$(id).disabled=!nativeReady||!nativeStarted||pendingReveal;
  document.querySelectorAll('[data-rate]').forEach(button=>button.disabled=!nativeReady||!nativeStarted||pendingReveal);
 }
 function drawTransport(){
  const t=clock.sample(performance.now());$('#time').value=t;$('#time').max=clock.duration;setText('#clock',`${t.toFixed(2)} / ${clock.duration.toFixed(2)} s`);
  const playLabel=clock.playing?'暂停':t>=clock.duration?'重播':'播放',markup=`${clock.playing?'Ⅱ':'▶'} <span>${playLabel}</span>`;
  if($('#play').innerHTML!==markup)$('#play').innerHTML=markup;$('#play').setAttribute('aria-label',playLabel);
  document.querySelectorAll('[data-rate]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.rate)===clock.rate)));
  let current=0;getBeats().forEach((beat,i)=>{if(t>=beat.time)current=i;});document.querySelectorAll('#beats button').forEach((button,i)=>button.setAttribute('aria-current',String(i===current)));
 }
 function sendSample(time,moving=false){const next=queue.submit({clip,time,playing:moving});if(next)post({type:'sample',...next});}
 function drawFrame(now){
  raf=0;let t=clock.sample(now);
  if(clock.playing&&t>=clock.duration){if($('#loop').checked){clock.seek(0,now);clock.play(now);queue.clear();t=0;}else clock.pause(now);}
  drawTransport();if(nativeStarted&&!pendingReveal)sendSample(t,clock.playing);if(clock.playing)raf=requestAnimationFrame(drawFrame);
 }
 function play(){if(!nativeReady||!nativeStarted||pendingReveal)return;clock.play(performance.now());if(!raf)raf=requestAnimationFrame(drawFrame);setText('#status',`${project==='f1'?'F1':'Math'} 原版片段 · ${clock.rate}×`);drawTransport();}
 function refreshPausedView(){cancelAnimationFrame(resizeRaf);resizeRaf=requestAnimationFrame(()=>{resizeRaf=requestAnimationFrame(()=>{resizeRaf=0;if(nativeReady&&nativeStarted&&!pendingReveal&&!clock.playing){queue.clear();sendSample(clock.sample(performance.now()),false);}});});}
 function pause(){clock.pause(performance.now());cancelAnimationFrame(raf);raf=0;post({type:'pause'});drawTransport();refreshPausedView();}
 function seek(time){if(!nativeReady||!nativeStarted||pendingReveal)return;pause();clock.seek(Number(time),performance.now());sendSample(clock.time,false);drawTransport();}
 function setRate(rate){clock.setRate(Number(rate),performance.now());drawTransport();setText('#status',`${project==='f1'?'F1':'Math'} 原版片段 · ${clock.rate}×`);if(clock.playing&&!raf)raf=requestAnimationFrame(drawFrame);}
 function getBeats(){
  if(clip!==lesson.variants[0])return [[0,'原版起点'],[.25,'展开'],[.5,'主要动作'],[.8,'交接'],[1,'结束']].map(([time,label])=>({time:time*clock.duration,label}));
  return lesson.beats.map(([time,label])=>({time:lesson.relative?time*clock.duration:Math.min(time,clock.duration),label}));
 }
 function drawBeats(){const box=$('#beats');box.replaceChildren();for(const beat of getBeats()){const button=document.createElement('button');button.type='button';button.textContent=beat.label;button.disabled=!nativeStarted||pendingReveal;button.title=beat.time.toFixed(2)+' s';button.addEventListener('click',()=>seek(beat.time));box.append(button);}}
 function updateVariants(){
  const titles={'f1-launch':'双车发车：迈凯伦与红牛','f1-budget':'从预算条驶出 → 恢复实体 → 支出上限','f1-outline':'迈凯伦超越 → 慢放 → 轮廓 → 照片','f1-racing':'尾流、交叉线与出弯超越','f1-upgrade':'拆下前后翼，迭代后回装','f1-cadillac':'完整车队检阅 → 凯迪拉克（额外加载）','math-screen':'从实体房间进入电脑屏幕','math-room':'从证据页面回到人物','math-type':'两侧图形组成 slowed down','math-mean':'图中的点组成 Mean / Median','math-words':'从正文抽取字母组成判断','math-67':'人物双臂交替：肩、肘、腕联动','math-closing':'原版人物谢幕'};
  $('#variant').replaceChildren();for(const id of lesson.variants){const item=catalogue.get(id),option=document.createElement('option');option.value=id;option.textContent=item?.title||titles[id]||id;$('#variant').append(option);}$('#variant').value=clip;
  const item=sourceClip();if(item){clock.setDuration(item.duration,performance.now());$('#shot-title').textContent=lesson.heading;}else{const estimates={'f1-launch':20.5,'f1-budget':5.8,'f1-outline':11.4,'f1-racing':18.4,'f1-upgrade':11.8,'f1-cadillac':35.5,'math-screen':2.7,'math-room':2.7,'math-type':6.8,'math-mean':6.8,'math-words':8.4,'math-67':10,'math-closing':24};clock.setDuration(estimates[clip]||31,performance.now());}
  drawBeats();drawTransport();enableControls();
 }
 function revealClip(autoplay){
  if(!nativeReady||!nativeStarted)return;
  pendingReveal=true;autoplayAfterReveal=autoplay&&!reduced.matches;$('#cover').hidden=false;$('#start').disabled=true;$('#load-progress').removeAttribute('value');setText('#load-number','片段准备中');setText('#start','正在准备片段…');clock.seek(0,performance.now());queue.clear();setText('#cover-detail','只准备当前片段的字形、材质状态与镜头。');post({type:'prepare',clip,request:++prepareVersion});enableControls();drawBeats();drawTransport();
 }
 function selectLesson(id){
  const next=CASE_LESSONS.find(item=>item.id===id);if(!next)throw new RangeError('Unknown scene');pause();lesson=next;clip=next.variants[0];
  document.body.dataset.project=lesson.project;setText('#shot-kicker',lesson.number+' / '+lesson.kicker);setText('#shot-title',lesson.heading);setText('#watch-note',lesson.watch);setText('#try-note',lesson.try);
  setText('#project-label',originals[lesson.project].name);setText('#cover-kicker',originals[lesson.project].coverKicker);setText('#cover-title',lesson.cover);
  $('#poster').src=manifest.posters[lesson.poster];$('#poster').alt=originals[lesson.project].name+' 原项目预览图';$('#open-original').href=window.location?.protocol==='file:'?originals[lesson.project].original:originals[lesson.project].repository||originals[lesson.project].original;
  document.querySelectorAll('[data-lesson]').forEach(button=>button.setAttribute('aria-current',String(button.dataset.lesson===id)));
  const targetProfile=manifest.routes[clip];if(profile!==targetProfile)loadProject(targetProfile);else {updateVariants();if(nativeStarted)revealClip(true);}
 }
 function loadProject(next,{force=false}={}){
  const plan=manifest.profiles[next];if(!plan)throw new Error('Missing experiment profile');
  if(iframe){if(profile==='math-type'&&nativeReady){glyphCache={iframe,catalogue,nativeReady,nativeStarted};iframe.style.visibility='hidden';iframe.style.pointerEvents='none';}else if(next==='math-type'&&nativeReady){heavyCache={iframe,catalogue,nativeReady,nativeStarted,profile};iframe.style.visibility='hidden';iframe.style.pointerEvents='none';}else{iframe.src='about:blank';iframe.remove();}iframe=null;}
  nativeReady=false;nativeStarted=false;pendingReveal=false;prepareVersion++;catalogue=new Map();queue.clear();clock.seek(0,performance.now());loadStartedAt=performance.now();profile=next;project=plan.project;waitingLoad=null;
  $('#cover').hidden=false;$('#render-error').hidden=true;$('#load-progress').removeAttribute('value');setText('#load-number','读取中');$('#start').disabled=true;setText('#start','正在准备原项目…');
  const size=((plan.entryBytes+plan.assetBytes)/1000000).toFixed(1);
  setText('#cover-detail',next==='math-type'?'只准备这一页的原版字效，不读取任何赛车、人物或房间模型。':`准备当前实验所需资源（约 ${size} MB）；保持原模型与贴图质量。`);setText('#status','按需准备 '+originals[project].name);
  if(next==='math-type'&&glyphCache){
   ({iframe,catalogue,nativeReady,nativeStarted}=glyphCache);iframe.style.visibility='visible';iframe.style.pointerEvents='auto';updateVariants();
   if(nativeStarted)revealClip(true);else{$('#load-progress').value=100;setText('#load-number','100%');setText('#start','开始这个片段  →');$('#start').disabled=false;}return;
  }
  if(heavyCache&&next===heavyCache.profile){
   ({iframe,catalogue,nativeReady,nativeStarted}=heavyCache);heavyCache=null;iframe.style.visibility='visible';iframe.style.pointerEvents='auto';updateVariants();
   if(nativeStarted)revealClip(true);else{setText('#load-number','100%');$('#load-progress').value=100;setText('#start','开始这个片段  →');$('#start').disabled=false;}return;
  }
  if(heavyCache&&next!=='math-type'){heavyCache.iframe.src='about:blank';heavyCache.iframe.remove();heavyCache=null;}
  if(plan.manualLoad&&!force){waitingLoad=next;setText('#cover-detail',`完整车队检阅需要 11 款赛车，约 ${size} MB；不会在打开 Lab 时自动加载。`);setText('#load-number','按需加载');setText('#start','加载 11 车型检阅  →');$('#start').disabled=false;updateVariants();return;}
  iframe=document.createElement('iframe');iframe.title=originals[project].name+' native renderer';iframe.allow='fullscreen';iframe.addEventListener('error',()=>nativeError('片段文件读取失败，请确认资源目录完整，或使用在线版。'));if(plan.inlineHtml)iframe.srcdoc=plan.inlineHtml;else iframe.src=plan.runtime+'?clip='+encodeURIComponent(clip);$('#frame-slot').append(iframe);updateVariants();const loadingFrame=iframe;if(typeof setTimeout==='function')setTimeout(()=>{if(iframe===loadingFrame&&!nativeReady)nativeError('准备暂未完成。可重试当前片段；若使用本地文件，请保留完整资源目录。');},45000);
 }
 function nativeError(message){pause();queue.clear();$('#render-error').hidden=false;$('#render-error').textContent='原项目运行提示：'+message;setText('#cover-detail',message);setText('#load-number','加载提示');setText('#status','原项目返回运行提示');if(!nativeReady){$('#start').disabled=false;setText('#start','重试当前片段 →');}}
 window.addEventListener('message',event=>{
  const data=event.data;if(!iframe||event.source!==iframe.contentWindow||!data||data.channel!==channel||data.project!==project)return;
  if(data.type==='progress'){$('#load-progress').value=Math.max(0,Math.min(100,data.percent));setText('#load-number',data.percent+'%');setText('#cover-detail','正在准备 '+data.detail+'。');}
  else if(data.type==='ready'){
   catalogue=new Map(data.clips.map(item=>[item.id,item]));nativeReady=true;const ms=Math.round(performance.now()-loadStartedAt);$('#status').dataset.preparationMs=String(ms);$('#load-progress').value=100;setText('#load-number','100%');setText('#cover-detail',profile==='math-type'?'本页原版字效已准备，未读取任何 3D 模型。':'当前实验所需模型、材质与镜头已准备。');setText('#start','开始这个片段  →');$('#start').disabled=false;setText('#status',`当前实验已准备 · ${(ms/1000).toFixed(1)} 秒 · 等待开始`);updateVariants();
  }else if(data.type==='started'){
   nativeStarted=true;enableControls();drawBeats();post({type:'text',visible:$('#show-text').checked});revealClip(true);
  }else if(data.type==='clip-ready'){
   if(data.clip!==clip||data.request!==prepareVersion)return;if(data.clips)catalogue=new Map(data.clips.map(item=>[item.id,item]));updateVariants();sendSample(0,false);
  }else if(data.type==='sampled'){
   const ack=queue.acknowledge(data.seq);if(!ack.accepted)return;if(ack.next)post({type:'sample',...ack.next});
   if(pendingReveal&&data.id===clip){pendingReveal=false;$('#cover').hidden=true;$('#render-error').hidden=true;enableControls();drawBeats();setText('#status','原项目实时渲染 · 声音关闭');if(autoplayAfterReveal){autoplayAfterReveal=false;play();}}
  }else if(data.type==='error')nativeError(data.message);
  else if(data.type==='key')shortcut(data.key,data.shift);
 });
 function shortcut(key,shift=false){
  if(!nativeStarted||pendingReveal)return;if(key===' '){if(clock.playing)pause();else play();}
  else if(key==='ArrowLeft'||key==='ArrowRight')seek(clock.sample(performance.now())+(key==='ArrowRight'?1:-1)*(shift?1:1/60));
  else if(key.toLowerCase()==='r')seek(0);else if(key.toLowerCase()==='f')void fullscreen();
 }
 async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen({navigationUI:'hide'});}catch{setText('#status','当前浏览器未允许全屏，可继续在窗口内检查。');}}
 for(const item of CASE_LESSONS){const button=document.createElement('button');button.type='button';button.className='lesson';button.dataset.lesson=item.id;const image=document.createElement('img');image.src=manifest.posters[item.poster];image.alt='';const copy=document.createElement('span');copy.className='lesson-copy';const index=document.createElement('small');index.textContent=item.number+' / '+(item.project==='f1'?'F1 ECONOMICS':'REACTION TIME');const title=document.createElement('b');title.textContent=item.title;copy.append(index,title);button.append(image,copy);button.addEventListener('click',()=>selectLesson(item.id));$('#lessons').append(button);}
 $('#start').addEventListener('click',()=>{if(waitingLoad){loadProject(waitingLoad,{force:true});return;}if(nativeReady){$('#start').disabled=true;post({type:'start'});}else loadProject(profile,{force:true});});
 $('#play').addEventListener('click',()=>clock.playing?pause():play());$('#reset').addEventListener('click',()=>seek(0));
 $('#step-back').addEventListener('click',()=>seek(clock.sample(performance.now())-1/60));$('#step-next').addEventListener('click',()=>seek(clock.sample(performance.now())+1/60));
 $('#time').addEventListener('input',()=>seek(Number($('#time').value)));$('#variant').addEventListener('change',()=>{pause();clip=$('#variant').value;const target=manifest.routes[clip];if(target!==profile)loadProject(target);else{updateVariants();revealClip(true);}});
 $('#rates').addEventListener('click',event=>{const button=event.target.closest('[data-rate]');if(button&&!button.disabled)setRate(Number(button.dataset.rate));});
 $('#show-text').addEventListener('change',()=>post({type:'text',visible:$('#show-text').checked}));$('#fullscreen').addEventListener('click',()=>void fullscreen());
 $('#credits-button').addEventListener('click',()=>{pause();$('#credits').showModal();});$('#close-credits').addEventListener('click',()=>$('#credits').close());
 window.addEventListener('keydown',event=>{if(event.target.closest('button,input,select,textarea,a,summary'))return;if([' ','ArrowLeft','ArrowRight','r','R','f','F'].includes(event.key)){event.preventDefault();shortcut(event.key,event.shiftKey);}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else refreshPausedView();});window.addEventListener('pagehide',pause);window.addEventListener('resize',refreshPausedView);if(typeof ResizeObserver==='function')new ResizeObserver(refreshPausedView).observe($('#viewer'));
 window.SkillLab={select:selectLesson,seek,play,pause,setRate,snapshot(){return {project,profile,lesson:lesson.id,clip,ready:nativeReady,started:nativeStarted,playing:clock.playing,seconds:clock.sample(performance.now()),rate:clock.rate,duration:clock.duration,source:'original-project-runtime',inFlight:!!queue.pending,initialModelBytes:0};}};
 selectLesson(manifest.defaultLesson||'math-type');
})();
