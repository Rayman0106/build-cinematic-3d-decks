"""Startup-only profiles for the original case engines. No model-quality edits."""
import json,re

F1_ALL=['ferrari','mclaren','mercedes','redbull','cadillac','monza-scenery','start-gantry','aston','williams','haas','audi','alpine','racingbulls']
PROFILES={
 'math-type':dict(project='math',clips=['math-mean','math-type','math-words'],three=False),
 'math-scene':dict(project='math',clips=['math-screen','math-room','math-67','math-closing'],three=True),
 'f1-launch':dict(project='f1',clips=['f1-launch','f1-budget','f1-outline','f1-racing','f1-upgrade'],assets=['mclaren','redbull','monza-scenery','start-gantry'],world=True,gridIndices=[0,1],maskKinds=['opening','overtake','advantage','competition'],openingOffset=10.5),
 'f1-grid':dict(project='f1',clips=['f1-cadillac'],assets=F1_ALL,world=True,gridIndices=list(range(22)),maskKinds=['entry'])
}

class Edits:
 def __init__(self,text):self.text=text;self.items=[]
 def replace(self,old,new,label):
  count=self.text.count(old)
  if count!=1:raise ValueError(f'{label}: expected one match, found {count}')
  self.text=self.text.replace(old,new,1);self.items.append((old,new,label))
 def region(self,start,end,new,label):
  a=self.text.index(start);b=self.text.index(end,a);self.replace(self.text[a:b],new,label)
 def verify(self,original):
  restored=self.text
  for old,new,label in reversed(self.items):
   if new not in restored:raise ValueError('Cannot reverse '+label)
   restored=restored.replace(new,old,1)
  if restored!=original:raise ValueError('Change escaped recorded startup edits')
  return [label for old,new,label in self.items]

F1_WARMUP='''  const caseLabWarmKinds=new Set(),caseLabMasks=new Set();
  async function prepareLabClip(kind){
    if(caseLabWarmKinds.has(kind))return;
    if(kind==='overtake'&&!rightRoute){rightRoute=await createStoryRouteVariant(xa,Y,[J,environment.group]);i.add(rightRoute.road,rightRoute.scenery);worldRoots.push(rightRoute.road,rightRoute.scenery);registerRouteFurniture(rightRoute);}
    const maskKey=['advantage','competition'].includes(kind)?'race':kind;
    if(window.CASE_PLAN.world&&!caseLabMasks.has(maskKey)){const saved=window.CASE_PLAN.maskKinds;window.CASE_PLAN.maskKinds=maskKey==='race'?['advantage','competition']:[kind];try{await prepareFurnitureMasks(window.F1Story);caseLabMasks.add(maskKey);}finally{window.CASE_PLAN.maskKinds=saved;}}
    const points={opening:[10.5,12,16.6,20,27.8,31],overtake:[0,1,2.85,6.7,7.7,8.5,11.4],regulation:[0,.35,1.55,2.4,4.65,5.8],advantage:[0,2.9,3.2,3.8,6.1,6.5,7.1,11.8],competition:[0,3.8,7.5,12.4,18.4],entry:[0,.8,2,12,24,window.F1Story.entryFreeze,window.F1Story.entryFreeze+.8,35.5]};
    if(kind!=='opening'){const order=Object.keys(window.F1Story.durations),last=order.indexOf(kind);for(const name of order.slice(0,last+1)){makeWheelTables(window.F1Story[name],window.F1Story.durations[name]);await window.F1Boot?.tick();}}
    const times=points[kind]||[0,window.F1Story.durations[kind]];
    for(const time of times){if(!Number.isFinite(time))continue;if(kind==='opening')renderGridOpening(time);else render(window.F1Story[kind](time));await window.F1Boot?.tick();}
    caseLabWarmKinds.add(kind);reset();
  }
  async function warmup(story){
    frameCircuit(null);frameFurniture(false);gridOpening.configure(story);
    window.APEXTransition.seek(8.4);openingRedbullAngles=u.map(wheel=>gridOpening.distance(gridOpening.duration)/wheel.radius);
    const kind={'f1-launch':'opening','f1-budget':'regulation','f1-cadillac':'entry','f1-outline':'overtake','f1-racing':'competition','f1-upgrade':'advantage'}[window.CASE_PLAN.clip];
    await prepareLabClip(kind);reset();
  }
'''

MATH_FINAL_PREP='''const caseInitialClip=window.CASE_PLAN.clip;
const caseInitialPages=caseLabPages(caseInitialClip);
if(scene?.warmup)await scene.warmup({shots:caseLabShots(caseInitialClip),onProgress:(done,total,detail)=>boot.step('gpu',done,total,detail),yieldControl:boot.tick});
else boot.step('gpu',1,1,'Native typography — no 3D models loaded');
boot.step('pages',0,1,'Preparing selected original clip');
for(const page of caseInitialPages){const d=durationFor(page);for(const t of[0,d*.55,d]){updateStoryUI(page,t);await boot.tick();}}
caseLabPrepared.add(caseInitialClip);boot.step('pages',1,1,'Selected clip ready');
chartFloors.clear();resize();index=caseInitialPages[0];settled(index);await boot.tick();ready=true;
'''

def specialize(text,profile,bank):
 """Return small native HTML and a reversible edit record; bank is asset-id -> URL."""
 original=text;e=Edits(text);plan=PROFILES[profile]
 if plan['project']=='math':
  e.replace("function tick(){return new Promise(resolve=>document.visibilityState==='hidden'?setTimeout(resolve,0):requestAnimationFrame(()=>setTimeout(resolve,0)));}","const caseTasks=new MessageChannel(),caseWaiters=[];caseTasks.port1.onmessage=()=>caseWaiters.shift()?.();function tick(){return new Promise(resolve=>{caseWaiters.push(resolve);caseTasks.port2.postMessage(0);});}",'Preparation must not depend on occluded iframe paint')
  model=re.search(r'<script>window\.DECK_MODEL_DATA=(.*?);</script>',e.text,re.S)
  if not model:raise ValueError('Missing Math model bank')
  replacement='<script>window.DECK_MODEL_DATA={};</script>' if not plan['three'] else '<script src="'+bank['math-models']+'"></script>'
  e.replace(model.group(),replacement,'Math models only for room/character profiles')
  if not plan['three']:
   e.replace('<script type="module">','<script>(async()=>{','Typography-only runtime needs no module loader')
   end=e.text.rfind('</script>');e.replace(e.text[end-4:end+9],e.text[end-4:end]+ '\n})().catch(error=>{window.dispatchEvent(new ErrorEvent("error",{message:String(error.message||error)}));});</script>','Close typography async entry')
   rig=re.search(r'<script>window\.DECK_RIG_MOTION=.*?;</script>',e.text,re.S)
   if rig:e.replace(rig.group(),'<script>window.DECK_RIG_MOTION=null;</script>','No skeletal data for typography')
   imports=re.search(r'<script type="importmap">.*?</script>',e.text,re.S)
   e.replace(imports.group(),'<!-- Native typography uses no Three.js or GLTF imports. -->','No 3D library in text-only profile')
   prefix="import * as THREE from 'three';import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';"
   e.replace(prefix,'const THREE=null,GLTFLoader=null,mergeGeometries=null;','Do not compile unused 3D modules')
  e.replace('for(const [index,section]of sections.entries()){','for(const [index,section]of sections.entries()){if(options.only&&!options.only.includes(index))continue;','Keep original title indices while preparing selected pages')
  e.replace('options.onProgress?.(index+1,sections.length);','options.onProgress?.(options.only?options.only.indexOf(index)+1:index+1,options.only?.length||sections.length);','Report preparation progress for the selected titles')
  e.replace('await window.DeckTypography.prepare(sections,{onProgress:','await window.DeckTypography.prepare(sections,{only:window.CaseLabPagesFor(window.CASE_PLAN.clip),onProgress:','Prepare only this clip title masks')
  e.replace("let scene=null;try{scene=await window.createReactionScene", "let scene=null;try{if(window.CASE_PLAN.three)scene=await window.createReactionScene",'Create the original room only when needed')
  e.replace('async function warmup({onProgress=()=>{},yieldControl=()=>Promise.resolve()}={}){','async function warmup({onProgress=()=>{},yieldControl=()=>Promise.resolve(),shots:requestedShots=null}={}){','Native GPU warmup accepts selected shots')
  e.replace('const total=textures.size+shots.length+1;','if(requestedShots)shots.splice(0,shots.length,...requestedShots);\n    const total=textures.size+shots.length+1;','Upload real textures but exercise only selected cameras')
  e.region('if(scene?.warmup)await scene.warmup({onProgress:', '// Prepared and playing are separate states.', MATH_FINAL_PREP,'Remove whole-deck page and transition warmup')
 else:
  for match in list(re.finditer(r'<script\b[^>]*\bid="asset-([^"]+)"[^>]*>.*?</script>',e.text,re.S)):
   key=match.group(1)
   replacement=('<script type="application/octet-stream" id="asset-'+key+'" data-src="'+bank[key].replace('.js','.glb')+'"></script>'
    +'<script>if(location.protocol==="file:")document.write('+json.dumps('<script src="'+bank[key]+'"><'+'/script>').replace('</script>','<\\/script>')+');</script>') if key in plan['assets'] else '<!-- Deferred unused asset: '+key+' -->'
   e.replace(match.group(),replacement,'Shared asset bank: '+key if key in plan['assets'] else 'Do not request unused asset: '+key)
  e.replace("Object.fromEntries(['ferrari','mercedes','cadillac'].map(key=>{", "Object.fromEntries(['ferrari','mercedes','cadillac'].filter(key=>window.CASE_PLAN.assets.includes(key)).map(key=>{",'Only construct required story actor controllers')
  e.replace("for(const key of ['aston','williams','haas','audi','alpine','racingbulls']){", "for(const key of ['aston','williams','haas','audi','alpine','racingbulls'].filter(key=>window.CASE_PLAN.assets.includes(key))){",'Only parse requested grid templates')
  e.replace('for(const source of Object.values(templates)){', 'for(const source of Object.entries(templates).filter(([key])=>window.CASE_PLAN.gridIndices.some(index=>index>1&&order[index]===key)).map(([,value])=>value)){','Skip LOD generation for cars used only as full-quality primary actors')
  e.replace('order.forEach((key,index)=>{','order.forEach((key,index)=>{if(!window.CASE_PLAN.gridIndices.includes(index))return;','Clone only cars used in this experiment')
  e.replace(".map(key=>[key,templates[key]])),backgroundGroups", ".map(key=>[key,templates[key]]).filter(([,value])=>value)),backgroundGroups",'Expose only prepared story templates')
  e.replace('async function prepareSignals(){','async function prepareSignals(){if(!window.CASE_PLAN.assets.includes(\'start-gantry\'))return;','Skip starting-light GLB outside grid experiments')
  e.replace('async function ve(U){','const caseAssetBuffers=new Map();async function ve(U){if(!caseAssetBuffers.has(U))caseAssetBuffers.set(U,caseReadAsset(U));return caseAssetBuffers.get(U);}async function caseReadAsset(U){','Cache original binary model reads')
  e.replace('async function tick(){await new Promise(requestAnimationFrame);await new Promise(resolve=>setTimeout(resolve,0));}','const caseTasks=new MessageChannel(),caseWaiters=[];caseTasks.port1.onmessage=()=>caseWaiters.shift()?.();let caseYield=performance.now();async function tick(){if(performance.now()-caseYield<8)return;await new Promise(resolve=>{caseWaiters.push(resolve);caseTasks.port2.postMessage(0);});caseYield=performance.now();}','Bounded preparation work yields without waiting for background animation frames')
  e.replace("const imported=await loader.parseAsync(await readAsset('monza-scenery'),'');", "if(window.CASE_PLAN.world){const imported=await loader.parseAsync(await readAsset('monza-scenery'),'');",'Skip hidden track import in wing experiment')
  e.replace('    skyMap.mapping=THREE.EquirectangularReflectionMapping;', '    }\n    skyMap.mapping=THREE.EquirectangularReflectionMapping;','Retain identical PBR sky reflections even without track geometry')
  e.replace('      const rays=[];\n      for(const kind of kinds)', "      const activeKinds=kinds.filter(kind=>window.CASE_PLAN.maskKinds.includes(kind));if(!activeKinds.length)continue;\n      const rays=[];\n      for(const kind of activeKinds)",'Only inspect relevant furniture corridors')
  e.region('  async function warmup(story){','  function captureBaseAngles',F1_WARMUP,'Selected-clip shader warmup instead of all acts')
  e.replace('return Object.freeze({prepare,warmup,reset,render,textureState,','return Object.freeze({prepare,warmup,prepareLabClip,reset,render,textureState,','Expose cached on-demand clip warmup')
  e.replace('calibratePhoto();calibrateEntryPhoto();costReference=window.F1Cinematic.render(story.costs(9.8),null,true);',"if(window.CASE_PLAN.clip==='f1-outline')calibratePhoto();if(window.CASE_PLAN.assets.includes('cadillac'))calibrateEntryPhoto();",'No unused photo solve, budget render or Cadillac calibration')
  e.replace('await window.F1Cinematic.warmup(story);await window.F1Typography.prepareBackdrops(story);','await window.F1Cinematic.warmup(story);','No whole-project backdrop readbacks')
  e.replace('preparePhotoVector();prepareEntryVectors();await window.F1Sound?.prepare();',"if(window.CASE_PLAN.clip==='f1-outline')preparePhotoVector();if(window.CASE_PLAN.assets.includes('cadillac'))prepareEntryVectors();",'No unused outline set or silent audio preparation')
  e.replace('{requestAnimationFrame(waitReady);return;}','{setTimeout(waitReady,16);return;}','Readiness polling does not wait for a visible animation frame')
  e.replace('}requestAnimationFrame(waitReady);','}setTimeout(waitReady,0);','Start readiness polling independently of paint')
  e.replace("requestAnimationFrame(()=>{document.body.classList.remove('deck-boot');window.F1Boot?.finish();});","document.body.classList.remove('deck-boot');window.F1Boot?.finish();",'Finish preparation before the outer Lab start gate')
 labels=e.verify(original)
 return e.text,labels

def head_plan(profile):
 plan={**PROFILES[profile],'profile':profile};default=plan['clips'][0]
 return '''<script>window.CASE_PLAN='''+json.dumps(plan)+''';
var requestedCaseClip=new URLSearchParams(location.search).get('clip');window.CASE_PLAN.clip=window.CASE_PLAN.clips.includes(requestedCaseClip)?requestedCaseClip:'''+json.dumps(default)+''';
window.CaseLabPagesFor=function(id){return {'math-screen':[4,5],'math-room':[11,12],'math-67':[12],'math-closing':[14],'math-type':[8],'math-mean':[9],'math-words':[11]}[id]||[8];};
</script>'''
