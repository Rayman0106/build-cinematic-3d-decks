/* Built with animation-core and semantic-motion; see scripts/build_examples.py.
 * Six mechanism studies, not an imitation of the final case-study decks. */
const LAB_W=960,LAB_H=540,$=selector=>document.querySelector(selector);
const flat=$('#flat'),ctx=flat.getContext('2d'),stage=$('#stage'),titleLayer=$('#title-layer');
const studies={
 handoff:{title:'投影不动，表示改变。',duration:12,description:'程序赛车先落到稳定位置，再把完整世界淡去，最后在同一机位切换到线框。主体没有重新定位。',limit:'此例是同投影线框，不是照片轮廓；生产照片配准还需要实际边界、裁切和语义锚点。'},
 screen:{title:'从实体进入证据。',duration:12,description:'先收敛到屏幕法向，再向前推进。2D 层与实体发光屏幕使用同一幅图和同一组四角。',limit:'示例最终正视，使用矩形投影；任意倾斜屏幕要用四点单应性，完整案例包含可编辑内容。'},
 particles:{title:'两个来源，同一个判断。',duration:8,description:'青色与橙色示意样本同时进入标题。每个粒子保留来源 ID，并沿确定路径移动，最后交接完整文字。',limit:'点是机制示意，不是研究数据；预计算字形使用本机 system-ui 字体，外观会随系统略有差异。'},
 ink:{title:'笔画走到，字才显现。',duration:10,description:'每个字母都有书写中心线，所有字形像素预分配到最近笔画的到达时刻。笔尖与填色共用进度，没有最后补满。',limit:'中心线是手工编写，不是从任意字体自动推断笔顺；字形来自本机字体的真实 raster。'},
 charts:{title:'先看懂结构，再交给图。',duration:10,description:'两组点先分别落到箱线图线段，保持一段时间，再慢慢交接实体线。数据源和目标的组别保持一致。',limit:'这是两组示意几何。生产图表必须使用真实统计、坐标和 ID，不把采样点数量当参与者数量。'},
 rig:{title:'手腕属于整条手臂。',duration:14,description:'肩、肘、腕在同一条 IK 链上。两手反相摆动；结束后躯干与头一起倾斜，双脚仍在接触点。',limit:'平面关节机制，不是完整人体动画/皮肤模拟；实际角色需三维 pole、关节限制、模板重定向和接触检查。'}
};
const options=Object.fromEntries(Object.entries(LAB_DEFAULTS).map(([key,value])=>[key,{...value}]));
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let mode='handoff',seconds=0,playing=false,started=false,ready=false,origin=0,playbackFrom=0,rate=1,dirty=true,webglError=null,frameRequest=0;
let showGuides=true;
const duration=()=>labTimeline(mode,options[mode]).duration;
let renderer=null;
try{renderer=new THREE.WebGLRenderer({canvas:$('#three'),alpha:true,antialias:true});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.setSize(LAB_W,LAB_H,false);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;}
catch(error){webglError=error;$('#three').style.display='none';}
const camera=new THREE.PerspectiveCamera(36,16/9,.1,150),mainScene=new THREE.Scene(),worldRoot=new THREE.Group(),hero=new THREE.Group();
mainScene.add(worldRoot,hero);mainScene.background=new THREE.Color('#bcd5d3');
function addLights(scene){scene.add(new THREE.HemisphereLight(0xf7fff1,0x3c5852,1.3));const sun=new THREE.DirectionalLight(0xffedce,2.2);sun.position.set(4,10,6);scene.add(sun);}
addLights(mainScene);
const material=(color,roughness=.6)=>new THREE.MeshStandardMaterial({color,roughness,metalness:.12});
function box(parent,size,position,mat){const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);mesh.position.set(...position);parent.add(mesh);return mesh;}
box(worldRoot,[35,.18,10],[0,-.15,0],material('#43595b',.95));
for(let x=-15;x<=15;x+=3){box(worldRoot,[1.6,.025,.09],[x,-.045,2.5],material('#dce9df'));box(worldRoot,[1.6,.025,.09],[x,-.045,-2.5],material('#dce9df'));}
for(let x=-12;x<=12;x+=3){box(worldRoot,[2.6,1.1,1.5],[x,.45,-6],material(x%2?'#aec5b5':'#8daaa2'));box(worldRoot,[.12,2.5,.12],[x,1.1,-5],material('#627f75'));}
const carPaint=material('#e5aa4d',.37),dark=material('#163e43',.48),rubber=material('#182e2d',.93),wheelRolls=[];
box(hero,[3.7,.38,1.05],[0,.38,0],carPaint);box(hero,[1.65,.45,.8],[-.15,.73,0],dark);
box(hero,[1.1,.16,.6],[1.9,.28,0],carPaint);box(hero,[.38,.1,2.15],[2.2,.2,0],dark);box(hero,[.42,.14,1.95],[-1.8,1.03,0],dark);
for(const x of [-1.35,1.35])for(const z of [-.95,.95]){const roll=new THREE.Group();roll.position.set(x,.36,z);const tire=new THREE.Mesh(new THREE.CylinderGeometry(.39,.39,.31,24),rubber);tire.rotation.x=Math.PI/2;roll.add(tire);hero.add(roll);wheelRolls.push(roll);}
const lineScene=new THREE.Scene(),lineRoot=new THREE.Group();lineScene.add(lineRoot);
const lineMaterial=new THREE.LineBasicMaterial({color:'#1a5452'});
hero.updateMatrixWorld(true);const linePairs=[];
hero.traverse(node=>{if(node.isMesh){const edge=new THREE.LineSegments(new THREE.EdgesGeometry(node.geometry,25),lineMaterial);edge.matrixAutoUpdate=false;lineRoot.add(edge);linePairs.push([node,edge]);}});
// Linear render targets; one final display conversion. No private renderer flags.
const rtOptions={depthBuffer:true,type:THREE.UnsignedByteType,samples:renderer?Math.min(4,renderer.capabilities.maxSamples||0):0};
const allTarget=new THREE.WebGLRenderTarget(LAB_W,LAB_H,rtOptions),fgTarget=new THREE.WebGLRenderTarget(LAB_W,LAB_H,rtOptions),lineTarget=new THREE.WebGLRenderTarget(LAB_W,LAB_H,rtOptions);
const compositeScene=new THREE.Scene(),quadCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
const compositeMaterial=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,toneMapped:false,
 uniforms:{allImage:{value:allTarget.texture},foreground:{value:fgTarget.texture},lineImage:{value:lineTarget.texture},lineShift:{value:0},worldAmount:{value:1},outlineAmount:{value:0},base:{value:new THREE.Color('#edf4ed')}},
 vertexShader:'varying vec2 uv0;void main(){uv0=uv;gl_Position=vec4(position.xy,0.,1.);}',
 fragmentShader:`uniform sampler2D allImage,foreground,lineImage;uniform float worldAmount,outlineAmount,lineShift;uniform vec3 base;varying vec2 uv0;
 void main(){vec4 f=mix(texture2D(foreground,uv0),texture2D(lineImage,uv0-vec2(lineShift,0.)),outlineAmount);vec4 c=mix(f,texture2D(allImage,uv0),worldAmount);gl_FragColor=vec4(c.rgb+base*(1.-c.a),1.);
 #include <colorspace_fragment>
 }`});
compositeScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),compositeMaterial));
function renderHandoff(t){
 const state=sampleLabHandoff(t,options.handoff);hero.position.set(...state.actor.position);wheelRolls.forEach(r=>r.rotation.z=-(state.actor.position[0]+5)/.39);
 camera.position.set(...state.camera.position);camera.lookAt(...state.camera.target);camera.fov=state.camera.fov;camera.updateProjectionMatrix();
 titleLayer.style.opacity=state.typeAmount;titleLayer.style.right='6%';titleLayer.style.top='12%';
 if(renderer){hero.updateMatrixWorld(true);for(const[n,l]of linePairs)l.matrix.copy(n.matrixWorld);
  const bg=mainScene.background;renderer.setClearColor(0,0);worldRoot.visible=true;renderer.setRenderTarget(allTarget);renderer.clear();renderer.render(mainScene,camera);
  worldRoot.visible=false;mainScene.background=null;renderer.setRenderTarget(fgTarget);renderer.clear();renderer.render(mainScene,camera);
  renderer.setRenderTarget(lineTarget);renderer.clear();renderer.render(lineScene,camera);worldRoot.visible=true;mainScene.background=bg;
  compositeMaterial.uniforms.worldAmount.value=state.worldAmount;compositeMaterial.uniforms.outlineAmount.value=state.outlineAmount;compositeMaterial.uniforms.lineShift.value=state.offset/LAB_W;
  renderer.setRenderTarget(null);renderer.clear();renderer.render(compositeScene,quadCamera);
 }
 if(showGuides&&t>4.2&&renderer){camera.updateMatrixWorld(true);const p=projectPoint([1.35+state.actor.position[0],state.actor.position[1]+.36,.95]),xy=[(p.x+1)*480,(1-p.y)*270];
  dot(xy,5,'#258c7d');const shifted=[xy[0]+state.offset,xy[1]];stroke([xy,shifted],'#b47734',1.5);dot(shifted,3.5,'#b47734');
  drawText(`ANCHOR Δ ${state.offset.toFixed(0)} px`,xy[0]-60,xy[1]+28,11,'#315e50',550);}
 return {phase:state.phase,metrics:`背景 ${state.worldAmount.toFixed(2)} · 轮廓 ${state.outlineAmount.toFixed(2)}\n轮廓偏移 ${state.offset.toFixed(0)} 逻辑 px · 主体透明度 ${carPaint.opacity.toFixed(1)}`};
}
const screenScene=new THREE.Scene();screenScene.background=new THREE.Color('#d6e5dc');addLights(screenScene);
box(screenScene,[7,.18,3],[0,-.14,0],material('#92ad9e'));box(screenScene,[5.4,3.2,.16],[0,1.6,-.13],dark);box(screenScene,[.4,1.6,.25],[0,.25,-.2],dark);
const screenCanvas=document.createElement('canvas');screenCanvas.width=960;screenCanvas.height=540;
const sc=screenCanvas.getContext('2d');sc.fillStyle='#edf4ed';sc.fillRect(0,0,960,540);sc.fillStyle='#246d62';sc.font='700 16px system-ui';sc.fillText('THE SAME EVIDENCE',65,70);sc.fillStyle='#183f3a';sc.font='800 54px system-ui';sc.fillText('From room to reasoning.',65,145);
sc.strokeStyle='#bed0c1';sc.lineWidth=2;sc.beginPath();sc.moveTo(85,440);sc.lineTo(85,220);sc.moveTo(85,440);sc.lineTo(870,440);sc.stroke();
for(let i=0;i<18;i++){sc.fillStyle=i%2?'#d99b4d':'#287969';sc.beginPath();sc.arc(140+i*37,350-60*Math.sin(i*.4),8,0,Math.PI*2);sc.fill();}
const screenTexture=new THREE.CanvasTexture(screenCanvas);screenTexture.colorSpace=THREE.SRGBColorSpace;
const screenFace=new THREE.Mesh(new THREE.PlaneGeometry(5,5*9/16),new THREE.MeshBasicMaterial({map:screenTexture,toneMapped:false}));screenFace.position.set(0,1.6,0);screenScene.add(screenFace);
$('#screen-dom img').src=screenCanvas.toDataURL();
function projectPoint(point){return new THREE.Vector3(...point).project(camera);}
function renderScreen(t){
 const state=sampleLabScreen(t,options.screen);
 camera.position.set(...state.position);camera.lookAt(...state.target);camera.fov=state.fov;camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
 if(renderer){renderer.setRenderTarget(null);renderer.setClearColor(0,0);renderer.render(screenScene,camera);}
 const a=projectPoint([-2.5,1.6+5*9/32,0]),b=projectPoint([2.5,1.6-5*9/32,0]);
 const native=state.nativeAmount,screenDom=$('#screen-dom');screenDom.style.display=native>0?'block':'none';screenDom.style.opacity=native;
 screenDom.style.left=(a.x+1)*50+'%';screenDom.style.top=(1-a.y)*50+'%';screenDom.style.width=(b.x-a.x)*50+'%';screenDom.style.height=(a.y-b.y)*50+'%';
 if(showGuides&&native<1){const corners=[[-2.5,1.6+5*9/32,0],[2.5,1.6+5*9/32,0],[2.5,1.6-5*9/32,0],[-2.5,1.6-5*9/32,0]].map(v=>{const p=projectPoint(v);return[(p.x+1)*480,(1-p.y)*270];});corners.forEach((p,i)=>{dot(p,3,'#be9450');if(t<7)drawText(String(i+1),p[0]+8,p[1]-8,11,'#326454');});}
 return {phase:state.phase,metrics:`相机横向 ${camera.position.x.toFixed(2)} · FOV ${state.fov.toFixed(0)}°\n2D 交接 ${native.toFixed(2)} · 同幅图，共享四角`};
}
const palette=['#26766b','#d39b4e'];let particlePlan=[],particleTargets=[],inkPlan=[],inkStrokes=[],inkData=null,inkCanvas=null,inkCtx=null,inkGeometryCache=null,chartItems=[];
function drawText(text,x,y,size=18,color='#183f3a',weight=600){ctx.fillStyle=color;ctx.font=`${weight} ${size}px system-ui`;ctx.fillText(text,x,y);}
function dot(point,r=3,color=palette[0],alpha=1){ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.beginPath();ctx.arc(point[0],point[1],r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
function stroke(points,color,width=2,alpha=1){if(points.length<2)return;ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();ctx.globalAlpha=1;}
function glyphTargets(text){const canvas=document.createElement('canvas');canvas.width=LAB_W;canvas.height=LAB_H;const q=canvas.getContext('2d',{willReadFrequently:true});q.font='800 112px system-ui';q.textAlign='center';q.fillText(text,480,255);const pixels=q.getImageData(0,0,LAB_W,LAB_H).data,points=[];
 for(let y=140;y<270;y+=4)for(let x=100;x<860;x+=4)if(pixels[(y*LAB_W+x)*4+3]>160)points.push([x,y]);return points;}
const sourceRandom=seeded(55),particleSources={left:Array.from({length:22},(_,i)=>[140+i*9,415+sourceRandom()*50]),right:Array.from({length:22},(_,i)=>[620+i*9,415+sourceRandom()*50])};
function rebuildParticles(){const group=options.particles.source,sources=group==='both'?particleSources:{[group]:particleSources[group]};particlePlan=planParticles(sources,particleTargets).map(item=>({...item,arch:item.arch*options.particles.arc}));}
function renderParticles(t){
 ctx.fillStyle='#edf4ed';ctx.fillRect(0,0,LAB_W,LAB_H);drawText('TWO SOURCES / ONE IDEA',64,65,14,'#56776a');
 for(const key of ['left','right']){stroke([[key==='left'?125:605,480],[key==='left'?355:835,480]],'#b9cdc0');particleSources[key].forEach(p=>dot(p,3.2,palette[key==='left'?0:1]));}
 drawText('GROUP A',140,515,13,palette[0]);drawText('GROUP B',620,515,13,palette[1]);
 const native=phase(t,4.8,6.8),flight=Math.max(0,t-.7);for(const item of particlePlan){const state=sampleParticle(item,flight),color=palette[item.group==='left'?0:1];
  if(showGuides&&item.id%40===0&&state.progress>0&&state.progress<1){const trail=Array.from({length:6},(_,i)=>sampleParticle(item,Math.max(0,flight-(5-i)*.035)).point);stroke(trail,color,1,(1-native)*.3);}
  dot(state.point,1.8,color,1-native);}
 ctx.globalAlpha=native;ctx.font='800 112px system-ui';ctx.textAlign='center';ctx.fillStyle='#173e38';ctx.fillText('MEAN',480,255);ctx.textAlign='left';ctx.globalAlpha=1;
 drawText('The title has a visible origin.',300,325,20,'#5d7f70',450);
 const left=particlePlan.filter(p=>p.group==='left').length;
 return {phase:t<.7?'先看见两组来源':t<4.8?'来源粒子沿曲线进入标题':t<6.8?'交接完整文字':'停留阅读',metrics:`A 组 ${left} · B 组 ${particlePlan.length-left} 个字形采样点\n真实统计：无，当前为机制示意`};
}
function prepareInk(){
 if(inkGeometryCache){retimeInk();return;}
 inkCanvas=document.createElement('canvas');inkCanvas.width=LAB_W;inkCanvas.height=LAB_H;inkCtx=inkCanvas.getContext('2d',{willReadFrequently:true});const pixels=[];
 const skeletons={D:[[[.05,1],[.05,0]],[[.05,0],[.65,0],[1,.3],[1,.7],[.65,1],[.05,1]]],A:[[[0,1],[.5,0],[1,1]],[[.22,.65],[.78,.65]]],T:[[[0,0],[1,0]],[[.5,0],[.5,1]]]};
 const ruler=document.createElement('canvas').getContext('2d');ruler.font='800 142px system-ui';
 let x=(LAB_W-[...'DATA'].reduce((sum,char)=>sum+ruler.measureText(char).width,0)-24)/2,index=0;const allStrokes=[];
 for(const char of 'DATA'){
  const c=document.createElement('canvas');c.width=200;c.height=200;const q=c.getContext('2d',{willReadFrequently:true});q.font='800 142px system-ui';q.fillText(char,12,155);const m=q.measureText(char),left=12-m.actualBoundingBoxLeft,top=155-m.actualBoundingBoxAscent,w=m.actualBoundingBoxLeft+m.actualBoundingBoxRight,h=m.actualBoundingBoxAscent+m.actualBoundingBoxDescent;
  const image=q.getImageData(0,0,200,200);for(let y=0;y<200;y++)for(let px=0;px<200;px++){const a=image.data[(y*200+px)*4+3];if(a)pixels.push({x:Math.round(px+x),y:y+115,alpha:a,glyph:index});}
  for(const path of skeletons[char])allStrokes.push({glyph:index,points:path.map(p=>[x+left+p[0]*w,115+top+p[1]*h])});
  x+=m.width+8;index++;
 }
 const lengths=allStrokes.map(s=>polylineInfo(s.points).total),total=lengths.reduce((a,b)=>a+b,0);let cursor=.02;
 const baseStrokes=allStrokes.map((s,i)=>{const span=.88*lengths[i]/total,next={...s,start:cursor,end:cursor+span};cursor+=span;return next;});
 inkGeometryCache={strokes:baseStrokes,plan:assignInkTimes(pixels,baseStrokes)};inkData=inkCtx.createImageData(LAB_W,LAB_H);
 for(const p of pixels){const i=(p.y*LAB_W+p.x)*4;inkData.data[i]=24;inkData.data[i+1]=67;inkData.data[i+2]=58;}
 retimeInk();
}
function retimeInk(){
 const gap=options.ink.spacing,scale=(.88-3*gap)/.88,time=(t,glyph)=>.02+(t-.02)*scale+glyph*gap;
 inkStrokes=inkGeometryCache.strokes.map(s=>({...s,start:time(s.start,s.glyph),end:time(s.end,s.glyph)}));
 inkPlan=inkGeometryCache.plan.map(p=>({...p,arrival:time(p.arrival,p.glyph)}));
}
function renderInk(t){
 ctx.fillStyle='#edf4ed';ctx.fillRect(0,0,LAB_W,LAB_H);drawText('AUTHORED STROKES / REAL GLYPH PIXELS',64,65,14,'#56776a');const u=clamp01(t/9.4);let sum=0,total=0;
 for(const p of inkPlan){const i=(p.y*LAB_W+p.x)*4,a=inkAlpha(p,u);inkData.data[i+3]=a;sum+=a;total+=p.alpha;}
 inkCtx.putImageData(inkData,0,0);ctx.drawImage(inkCanvas,0,0);
 if(showGuides)for(const s of inkStrokes)stroke(s.points,'#9eaf99',.6,.18);
 for(const s of inkStrokes)if(options.ink.tips&&u>=s.start&&u<=s.end){const tip=pointOnPolyline(s.points,(u-s.start)/(s.end-s.start));dot(tip,6,'#d0a34d');dot(tip,11,'#d0a34d',.15);}
 drawText('Every corner belongs to a stroke. No final-frame patch.',210,390,18,'#5d7f70',450);
 return {phase:u<.94?'沿每个字母的笔画书写':'字形完整，无末帧补满',metrics:`字形像素 ${inkPlan.length} · 已覆盖 ${(sum/total*100).toFixed(1)}%\n字母停顿 ${(options.ink.spacing*9.4).toFixed(2)} s · 不作最终替换`};
}
function boxSegments(y,group){const k=group?35:0;return [[[180+k,y],[330+k,y]],[[330+k,y-38],[620+k,y-38],[620+k,y+38],[330+k,y+38],[330+k,y-38]],[[465+k,y-38],[465+k,y+38]],[[620+k,y],[780+k,y]],[[180+k,y-21],[180+k,y+21]],[[780+k,y-21],[780+k,y+21]]];}
function prepareCharts(){const rand=seeded(7);for(let group=0;group<2;group++)for(let i=0;i<160;i++){const segments=boxSegments(group?355:205,group),line=segments[i%segments.length];chartItems.push({group,from:[100+i%40*18,group?350+rand()*80:140+rand()*80],to:pointOnPolyline(line,Math.floor(i/segments.length)/(Math.floor(160/segments.length)+1))});}}
function renderCharts(t){ctx.fillStyle='#edf4ed';ctx.fillRect(0,0,LAB_W,LAB_H);drawText('LET THE STRUCTURE SETTLE',64,65,14,'#56776a');
 const state=sampleLabChart(t,options.charts),move=state.move,native=state.nativeAmount;for(const p of chartItems)dot([mix(p.from[0],p.to[0],move),mix(p.from[1],p.to[1],move)],2.5,palette[p.group],1-native);
 for(let g=0;g<2;g++)for(const line of boxSegments(g?355:205,g))stroke(line,palette[g],3,native);
 drawText('GROUP A',65,210,12,palette[0]);drawText('GROUP B',65,360,12,palette[1]);drawText('arrive → hold → slowly become the native chart',230,470,18,'#5d7f70',450);
 if(showGuides){ctx.setLineDash([3,7]);stroke([[465,120],[465,255]],'#7c9272',1,.25);stroke([[500,290],[500,410]],'#7c9272',1,.25);ctx.setLineDash([]);}
 return {phase:state.phase,metrics:`点已到位 ${(move*100).toFixed(0)}% · 实体线 ${(native*100).toFixed(0)}%\n停留 ${options.charts.hold.toFixed(1)} s · 交接 ${options.charts.handoff.toFixed(1)} s`};}
function renderRig(t){ctx.fillStyle='#edf4ed';ctx.fillRect(0,0,LAB_W,LAB_H);drawText('A CHAIN, NOT A FLOATING HAND',64,65,14,'#56776a');
 const bow=phase(t,10,11.8)*(1-phase(t,12.4,14)),angle=bow*.63,pivot=[480,335];
 const transform=point=>[pivot[0]+point[0]*Math.cos(angle)-point[1]*Math.sin(angle),pivot[1]+point[0]*Math.sin(angle)+point[1]*Math.cos(angle)];
 const neck=transform([0,-135]),head=transform([0,-179]);stroke([pivot,neck],'#c5d5c6',78);dot(head,29,'#dbb87f');stroke([head,[head[0]+Math.cos(angle)*18,head[1]+Math.sin(angle)*18]],'#7d674d',2);
 for(const sign of [-1,1]){const hip=[pivot[0]+sign*25,pivot[1]],ankle=[480+sign*47,463],leg=twoBoneIK(hip,ankle,72,74,-sign);stroke([hip,leg.elbow,leg.wrist],'#537f73',25);stroke([[ankle[0]-16,478],[ankle[0]+19,478]],'#204d43',15);dot([ankle[0],478],3,'#d2a049');}
 const arms=[];
 for(const sign of [-1,1]){const shoulder=transform([sign*47,-126]),motion=sampleLabArm(t,sign,options.rig);
  const wanted=transform(motion.wristLocal),arm=twoBoneIK(shoulder,wanted,78,78,-sign);
  stroke([shoulder,arm.elbow,arm.wrist],'#287869',17);dot(arm.elbow,7,'#d0aa63');dot(arm.wrist,5,'#d0aa63');
  const wristAngle=motion.linked?arm.forearmAngle+.14*Math.sin(t*2-0.18)*motion.envelope:0;stroke([arm.wrist,[arm.wrist[0]+Math.cos(wristAngle)*24,arm.wrist[1]+Math.sin(wristAngle)*24]],'#dbb87f',12);arms.push({...arm,wristAngle});
 }
 stroke([[350,490],[620,490]],'#bad0c1',2);drawText('fixed sole contacts',390,520,13,'#698878',450);drawText('shoulder → elbow → wrist',65,250,15,'#4e7769');
 if(showGuides){for(const sign of [-1,1])stroke([[480+sign*47,463],[480+sign*47,490]],'#c49d58',1,.7);}
 return {phase:t<2.4?'双脚接触地面':t<9.1?'两手交替，检查关节链':t<10?'动作收势':'躯干与头一起鞠躬',metrics:`鞠躬 ${(angle*180/Math.PI).toFixed(1)}° · 小臂 ${(arms[0].forearmAngle*180/Math.PI).toFixed(1)}°\n手部 ${(arms[0].wristAngle*180/Math.PI).toFixed(1)}° · 双脚接触点固定`};}
function setText(selector,text){const node=$(selector);if(node.textContent!==text)node.textContent=text;}
function render(){
 ctx.clearRect(0,0,LAB_W,LAB_H);$('#three').style.display=['handoff','screen'].includes(mode)&&renderer?'block':'none';$('#screen-dom').style.display='none';titleLayer.style.opacity=0;
 const methods={handoff:renderHandoff,screen:renderScreen,particles:renderParticles,ink:renderInk,charts:renderCharts,rig:renderRig};const state=methods[mode](seconds);
 if(webglError&&['handoff','screen'].includes(mode)){$('#screen-dom').style.display='none';titleLayer.style.opacity=0;ctx.fillStyle='#edf4ed';ctx.fillRect(0,0,LAB_W,LAB_H);drawText('WebGL unavailable',110,230,35);drawText('Choose particles, ink, charts or joints to continue.',110,280,21,'#5d7f70',450);}
 setText('#phase-label',state.phase);setText('#metrics',state.metrics);$('#time').value=seconds;
 setText('#time-label',`${seconds.toFixed(2)} / ${duration().toFixed(2)} s`);
 const label=playing?'暂停':seconds>=duration()?'重播':'播放';
 const play=$('#play');const markup=`${playing?'Ⅱ':'▶'} <span>${label}</span>`;if(play.innerHTML!==markup)play.innerHTML=markup;play.setAttribute('aria-label',label);
 const beats=labTimeline(mode,options[mode]).beats;let current=0;beats.forEach((b,i)=>{if(seconds>=b.time)current=i;});
 document.querySelectorAll('#beats button').forEach((button,i)=>button.setAttribute('aria-current',String(i===current)));
 dirty=false;
}
function invalidate(){dirty=true;if(!frameRequest)frameRequest=requestAnimationFrame(frame);}
function clockTime(now=performance.now()){return Math.min(duration(),playbackFrom+(now-origin)*rate/1000);}
function frame(now){frameRequest=0;if(playing){seconds=clockTime(now);if(seconds>=duration())playing=false;dirty=true;}if(dirty)render();if(playing)invalidate();}
function pause(){if(playing)seconds=clockTime();playing=false;invalidate();}
function seek(value){const next=Number(value);if(!Number.isFinite(next))throw new RangeError('Finite scene time required');seconds=Math.max(0,Math.min(duration(),next));playing=false;invalidate();}
function play(){if(!ready||!started)return;if(seconds>=duration())seconds=0;playing=true;playbackFrom=seconds;origin=performance.now();invalidate();}
function togglePlay(){if(playing)pause();else play();}
function setRate(value){const next=Number(value);if(![.5,1,1.5].includes(next))throw new RangeError('Use 0.5, 1 or 1.5 playback rate');if(playing)seconds=clockTime();rate=next;playbackFrom=seconds;origin=performance.now();$('#rate').value=String(rate);invalidate();}
function refreshTimeline(){
 const timeline=labTimeline(mode,options[mode]);$('#time').max=timeline.duration;seconds=Math.min(seconds,timeline.duration);
 const container=$('#beats');container.replaceChildren();
 for(const beat of timeline.beats){const button=document.createElement('button');button.type='button';button.textContent=beat.label;button.disabled=!ready||!started;button.title=`${beat.time.toFixed(2)} s`;button.addEventListener('click',()=>seek(beat.time));container.append(button);}
}
function parameterValue(control,value){return `${(value*(control.factor||1)).toFixed(control.step===1?0:2)} ${control.unit||''}`;}
function refreshParameters(){
 const container=$('#parameters');container.replaceChildren();
 for(const control of LAB_CONTENT[mode].controls){
  const row=document.createElement('div');row.className='param'+(control.type==='checkbox'?' param-check':'');
  const label=document.createElement('label');label.htmlFor='param-'+control.key;label.textContent=control.label;row.append(label);
  const input=document.createElement(control.type==='select'?'select':'input');input.id='param-'+control.key;input.dataset.parameter=control.key;input.disabled=!ready||!started;
  if(control.type==='select'){for(const [value,text]of control.choices){const option=document.createElement('option');option.value=value;option.textContent=text;input.append(option);}input.value=options[mode][control.key];}
  else if(control.type==='checkbox'){input.type='checkbox';input.checked=options[mode][control.key];}
  else {input.type='range';input.min=control.min;input.max=control.max;input.step=control.step;input.value=options[mode][control.key];
   const output=document.createElement('output');output.id='output-'+control.key;output.htmlFor=input.id;output.textContent=parameterValue(control,options[mode][control.key]);row.append(output);}
  input.addEventListener(control.type==='checkbox'||control.type==='select'?'change':'input',()=>{
   const value=control.type==='checkbox'?input.checked:control.type==='select'?input.value:Number(input.value);
   changeOptions({[control.key]:value});if(!control.type)setText('#output-'+control.key,parameterValue(control,options[mode][control.key]));
  });row.append(input);container.append(row);
 }
}
function changeOptions(input){
 pause();options[mode]=normalizeLabOptions(mode,{...options[mode],...input});
 if(mode==='particles'&&particleTargets.length)rebuildParticles();if(mode==='ink'&&inkCanvas)prepareInk();
 refreshTimeline();invalidate();
}
function setControlsEnabled(){
 $('#mode').disabled=!ready;document.querySelectorAll('[data-study]').forEach(button=>button.disabled=!ready);
 for(const selector of ['#play','#reset','#step-back','#step-next','#time','#rate','#restore'])$(selector).disabled=!ready||!started;
 document.querySelectorAll('#parameters input,#parameters select,#beats button').forEach(control=>control.disabled=!ready||!started);
}
function setMode(next,{autoplay=false,updateHash=false}={}){
 if(!Object.hasOwn(studies,next))throw new RangeError('Unknown study: '+next);
 mode=next;seconds=0;playing=false;const item=studies[mode],content=LAB_CONTENT[mode];
 setText('#mode-title',item.title);setText('#mode-kicker','STUDY '+content.kicker);setText('#description',item.description);setText('#limit',item.limit);
 setText('#experiment-hint',content.hint);setText('#recipe-explanation',content.explanation);setText('#recipe-code',content.code);
 $('#reference-link').href='https://github.com/Rayman0106/build-cinematic-3d-decks/blob/main/references/'+content.reference;
 $('#mode').value=mode;$('#experiment').setAttribute('aria-labelledby','tab-'+mode);
 document.querySelectorAll('[data-study]').forEach(button=>{const selected=button.dataset.study===mode;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;});
 refreshTimeline();refreshParameters();setControlsEnabled();
 if(updateHash)try{history.replaceState(null,'','#'+mode);}catch{/* The experiment also works when history is unavailable. */}
 setText('#announcement',item.title);if(autoplay&&started&&!reducedMotion.matches)play();else invalidate();
}
$('#mode').addEventListener('change',()=>setMode($('#mode').value,{autoplay:true,updateHash:true}));
$('#study-nav').addEventListener('click',event=>{const button=event.target.closest('[data-study]');if(button&&!button.disabled)setMode(button.dataset.study,{autoplay:true,updateHash:true});});
$('#study-nav').addEventListener('keydown',event=>{
 const buttons=[...document.querySelectorAll('[data-study]')],index=buttons.indexOf(event.target);if(index<0||!ready)return;
 const next=event.key==='ArrowDown'||event.key==='ArrowRight'?(index+1)%buttons.length:event.key==='ArrowUp'||event.key==='ArrowLeft'?(index+buttons.length-1)%buttons.length:event.key==='Home'?0:event.key==='End'?buttons.length-1:null;
 if(next!==null){event.preventDefault();buttons[next].focus();setMode(buttons[next].dataset.study,{autoplay:false,updateHash:true});}
});
$('#start').addEventListener('click',()=>{
 if(!ready)return;started=true;$('#gate').style.display='none';setControlsEnabled();
 if(reducedMotion.matches)seek(duration());else play();$('#play').focus();
});
$('#play').addEventListener('click',togglePlay);$('#reset').addEventListener('click',()=>seek(0));
$('#step-back').addEventListener('click',()=>seek(seconds-1/60));$('#step-next').addEventListener('click',()=>seek(seconds+1/60));
$('#time').addEventListener('input',()=>seek($('#time').value));$('#rate').addEventListener('change',()=>setRate($('#rate').value));
$('#guides').addEventListener('change',()=>{showGuides=$('#guides').checked;invalidate();});
$('#restore').addEventListener('click',()=>{changeOptions({...LAB_DEFAULTS[mode]});seek(0);refreshParameters();});
window.addEventListener('keydown',event=>{
 if(!started||event.altKey||event.ctrlKey||event.metaKey||event.target.closest('input,select,textarea,button,a,summary,[contenteditable="true"]'))return;
 if(event.code==='Space'){event.preventDefault();togglePlay();}
 else if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();seek(seconds+(event.key==='ArrowLeft'?-1:1)*(event.shiftKey?1:1/60));}
});
window.addEventListener('hashchange',()=>{const hash=location.hash.slice(1);if(ready&&Object.hasOwn(studies,hash))setMode(hash);});
window.addEventListener('pagehide',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)pause();});
$('#three').addEventListener('webglcontextlost',event=>{event.preventDefault();pause();webglError=new Error('WebGL context lost');renderer=null;setText('#announcement','3D 上下文已丢失，可继续使用四个二维实验。');invalidate();});
const syncOrientation=()=>$('#study-nav').setAttribute('aria-orientation',window.innerWidth<=820?'horizontal':'vertical');window.addEventListener('resize',syncOrientation);syncOrientation();
const yieldPaint=()=>new Promise(resolve=>document.visibilityState==='hidden'?setTimeout(resolve,0):requestAnimationFrame(()=>setTimeout(resolve,0)));
async function prepare(){
 const steps=[
  ['字体与屏幕图像',async()=>{await document.fonts.load('800 112px system-ui');await document.fonts.ready;const image=$('#screen-dom img');if(image.decode)await image.decode();}],
  ['几何与投影',async()=>{mainScene.updateMatrixWorld(true);screenScene.updateMatrixWorld(true);}],
  ['粒子来源与目标',async()=>{particleTargets=glyphTargets('MEAN');rebuildParticles();}],
  ['字形像素与笔画',async()=>{prepareInk();}],
  ['图表对应与路径',async()=>{prepareCharts();}],
  ['GPU 与代表状态',async()=>{if(renderer){renderer.compile(mainScene,camera);renderer.compile(screenScene,camera);for(const key of Object.keys(studies)){mode=key;for(const progress of [.5,.85,1]){seconds=duration()*progress;render();}await yieldPaint();}}}]
 ];
 for(let i=0;i<steps.length;i++){setText('#load-label',steps[i][0]);await yieldPaint();await steps[i][1]();$('#progress').value=i+1;setText('#load-percent',Math.round((i+1)/steps.length*100)+'%');}
 ready=true;const requested=location.hash.slice(1);setMode(Object.hasOwn(studies,requested)?requested:'handoff');render();
 $('#start').disabled=false;setText('#ready-title','准备就绪，由你开始。');setText('#load-label',webglError?'2D 实验就绪；当前设备未能启用 WebGL。':'路径、字形与代表状态已准备。');setText('#start','进入实验室  →');
 setText('#gate-note',reducedMotion.matches?'已启用减少动态：先展示静态落点，可手动播放。':'播放不会自动开始。');
}
window.SkillLab={
 seek,select(next){setMode(next,{updateHash:true});},configure(input){changeOptions(input);refreshParameters();},play,pause,setRate,
 snapshot(){return {mode,seconds,ready,started,playing,webgl:!!renderer,rate,duration:duration(),options:{...options[mode]},beats:labTimeline(mode,options[mode]).beats,particleSources:[...new Set(particlePlan.map(p=>p.group))],inkPixels:inkPlan.length};}
};
setMode('handoff');prepare().catch(error=>{setText('#ready-title','准备过程未完成');setText('#load-label',String(error.message||error));setText('#gate-note','请刷新或重新打开文件后重试；错误信息保留在上方。');console.error(error);});
