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
let mode='handoff',seconds=0,playing=false,started=false,ready=false,origin=0,dirty=true,webglError=null;
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
 uniforms:{allImage:{value:allTarget.texture},foreground:{value:fgTarget.texture},lineImage:{value:lineTarget.texture},worldAmount:{value:1},outlineAmount:{value:0},base:{value:new THREE.Color('#edf4ed')}},
 vertexShader:'varying vec2 uv0;void main(){uv0=uv;gl_Position=vec4(position.xy,0.,1.);}',
 fragmentShader:`uniform sampler2D allImage,foreground,lineImage;uniform float worldAmount,outlineAmount;uniform vec3 base;varying vec2 uv0;
 void main(){vec4 f=mix(texture2D(foreground,uv0),texture2D(lineImage,uv0),outlineAmount);vec4 c=mix(f,texture2D(allImage,uv0),worldAmount);gl_FragColor=vec4(c.rgb+base*(1.-c.a),1.);
 #include <colorspace_fragment>
 }`});
compositeScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),compositeMaterial));
function renderHandoff(t){
 const state=sampleHandoff(t);hero.position.set(...state.actor.position);wheelRolls.forEach(r=>r.rotation.z=-(state.actor.position[0]+5)/.39);
 camera.position.set(...state.camera.position);camera.lookAt(...state.camera.target);camera.fov=state.camera.fov;camera.updateProjectionMatrix();
 titleLayer.style.opacity=state.typeAmount;titleLayer.style.right='6%';titleLayer.style.top='12%';
 if(renderer){hero.updateMatrixWorld(true);for(const[n,l]of linePairs)l.matrix.copy(n.matrixWorld);
  const bg=mainScene.background;renderer.setClearColor(0,0);worldRoot.visible=true;renderer.setRenderTarget(allTarget);renderer.clear();renderer.render(mainScene,camera);
  worldRoot.visible=false;mainScene.background=null;renderer.setRenderTarget(fgTarget);renderer.clear();renderer.render(mainScene,camera);
  renderer.setRenderTarget(lineTarget);renderer.clear();renderer.render(lineScene,camera);worldRoot.visible=true;mainScene.background=bg;
  compositeMaterial.uniforms.worldAmount.value=state.worldAmount;compositeMaterial.uniforms.outlineAmount.value=state.outlineAmount;
  renderer.setRenderTarget(null);renderer.clear();renderer.render(compositeScene,quadCamera);
 }
 return {phase:state.phase,metrics:`world ${state.worldAmount.toFixed(2)}\noutline ${state.outlineAmount.toFixed(2)}\nhero x ${state.actor.position[0].toFixed(3)}\nopaque material ${carPaint.opacity.toFixed(1)}`};
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
 const align=phase(t,0,3.6),push=phase(t,3.6,8.4),distance=5*9/16/(2*Math.tan(36*Math.PI/360));
 camera.position.set(mix(5,0,align),mix(3.6,1.6,align),mix(10,mix(8,distance,push),align));camera.lookAt(0,1.6,0);camera.fov=36;camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
 if(renderer){renderer.setRenderTarget(null);renderer.setClearColor(0,0);renderer.render(screenScene,camera);}
 const a=projectPoint([-2.5,1.6+5*9/32,0]),b=projectPoint([2.5,1.6-5*9/32,0]);
 const native=phase(t,8.4,10.2),screenDom=$('#screen-dom');screenDom.style.display='block';screenDom.style.opacity=native;
 screenDom.style.left=(a.x+1)*50+'%';screenDom.style.top=(1-a.y)*50+'%';screenDom.style.width=(b.x-a.x)*50+'%';screenDom.style.height=(a.y-b.y)*50+'%';
 return {phase:t<3.6?'align-to-screen':t<8.4?'push-along-normal':'same-corners-2D',metrics:`camera x ${camera.position.x.toFixed(2)}\n2D handoff ${native.toFixed(2)}\nno camera flip`};
}
const palette=['#26766b','#d39b4e'];let particlePlan=[],inkPlan=[],inkStrokes=[],inkData=null,inkCanvas=null,inkCtx=null,chartItems=[];
function drawText(text,x,y,size=18,color='#183f3a',weight=600){ctx.fillStyle=color;ctx.font=`${weight} ${size}px system-ui`;ctx.fillText(text,x,y);}
function dot(point,r=3,color=palette[0],alpha=1){ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.beginPath();ctx.arc(point[0],point[1],r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
function stroke(points,color,width=2,alpha=1){if(points.length<2)return;ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();ctx.globalAlpha=1;}
function glyphTargets(text){const canvas=document.createElement('canvas');canvas.width=LAB_W;canvas.height=LAB_H;const q=canvas.getContext('2d',{willReadFrequently:true});q.font='800 112px system-ui';q.textAlign='center';q.fillText(text,480,255);const pixels=q.getImageData(0,0,LAB_W,LAB_H).data,points=[];
 for(let y=140;y<270;y+=4)for(let x=100;x<860;x+=4)if(pixels[(y*LAB_W+x)*4+3]>160)points.push([x,y]);return points;}
const sourceRandom=seeded(55),particleSources={left:Array.from({length:22},(_,i)=>[140+i*9,415+sourceRandom()*50]),right:Array.from({length:22},(_,i)=>[620+i*9,415+sourceRandom()*50])};
function renderParticles(t){
 ctx.fillStyle='#edf4ed';ctx.fillRect(0,0,LAB_W,LAB_H);drawText('TWO SOURCES / ONE IDEA',64,65,14,'#56776a');
 for(const key of ['left','right']){stroke([[key==='left'?125:605,480],[key==='left'?355:835,480]],'#b9cdc0');particleSources[key].forEach(p=>dot(p,3.2,palette[key==='left'?0:1]));}
 drawText('GROUP A',140,515,13,palette[0]);drawText('GROUP B',620,515,13,palette[1]);
 const native=phase(t,4.5,6.6),flight=Math.max(0,t-.6);for(const item of particlePlan){const state=sampleParticle(item,flight);dot(state.point,1.8,palette[item.group==='left'?0:1],1-native);}
 ctx.globalAlpha=native;ctx.font='800 112px system-ui';ctx.textAlign='center';ctx.fillStyle='#173e38';ctx.fillText('MEAN',480,255);ctx.textAlign='left';ctx.globalAlpha=1;
 drawText('The title has a visible origin.',300,325,20,'#5d7f70',450);
 return {phase:t<.6?'source-samples':t<4.5?'both-groups-travel':'native-text-handoff',metrics:`left ${particlePlan.filter(p=>p.group==='left').length}\nright ${particlePlan.filter(p=>p.group==='right').length}\nnative ${native.toFixed(2)}`};
}
function prepareInk(){
 inkCanvas=document.createElement('canvas');inkCanvas.width=LAB_W;inkCanvas.height=LAB_H;inkCtx=inkCanvas.getContext('2d',{willReadFrequently:true});const pixels=[];
 const skeletons={D:[[[.05,1],[.05,0]],[[.05,0],[.65,0],[1,.3],[1,.7],[.65,1],[.05,1]]],A:[[[0,1],[.5,0],[1,1]],[[.22,.65],[.78,.65]]],T:[[[0,0],[1,0]],[[.5,0],[.5,1]]]};
 let x=240,index=0;const allStrokes=[];
 for(const char of 'DATA'){
  const c=document.createElement('canvas');c.width=200;c.height=200;const q=c.getContext('2d',{willReadFrequently:true});q.font='800 142px system-ui';q.fillText(char,12,155);const m=q.measureText(char),left=12-m.actualBoundingBoxLeft,top=155-m.actualBoundingBoxAscent,w=m.actualBoundingBoxLeft+m.actualBoundingBoxRight,h=m.actualBoundingBoxAscent+m.actualBoundingBoxDescent;
  const image=q.getImageData(0,0,200,200);for(let y=0;y<200;y++)for(let px=0;px<200;px++){const a=image.data[(y*200+px)*4+3];if(a)pixels.push({x:px+x,y:y+115,alpha:a,glyph:index});}
  for(const path of skeletons[char])allStrokes.push({glyph:index,points:path.map(p=>[x+left+p[0]*w,115+top+p[1]*h])});
  x+=m.width+8;index++;
 }
 const lengths=allStrokes.map(s=>polylineInfo(s.points).total),total=lengths.reduce((a,b)=>a+b,0);let cursor=.02;
 inkStrokes=allStrokes.map((s,i)=>{const span=.80*lengths[i]/total,next={...s,start:cursor,end:cursor+span};cursor+=span+.012;return next;});
 inkPlan=assignInkTimes(pixels,inkStrokes);inkData=inkCtx.createImageData(LAB_W,LAB_H);
}
function renderInk(t){
 ctx.fillStyle='#edf4ed';ctx.fillRect(0,0,LAB_W,LAB_H);drawText('AUTHORED STROKES / REAL GLYPH PIXELS',64,65,14,'#56776a');const u=clamp01(t/9.4);let sum=0,total=0;
 for(const p of inkPlan){const i=(Math.round(p.y)*LAB_W+Math.round(p.x))*4,a=inkAlpha(p,u);inkData.data[i]=24;inkData.data[i+1]=67;inkData.data[i+2]=58;inkData.data[i+3]=a;sum+=a;total+=p.alpha;}
 inkCtx.putImageData(inkData,0,0);ctx.drawImage(inkCanvas,0,0);
 for(const s of inkStrokes)if(u>=s.start&&u<=s.end){const tip=pointOnPolyline(s.points,(u-s.start)/(s.end-s.start));dot(tip,6,'#d0a34d');dot(tip,11,'#d0a34d',.15);}
 drawText('Every corner belongs to a stroke. No final-frame patch.',210,390,18,'#5d7f70',450);
 return {phase:u<.98?'per-letter-writing':'complete-without-swap',metrics:`glyph pixels ${inkPlan.length}\ncoverage ${(sum/total*100).toFixed(1)}%\nDOM replacement not used`};
}
function boxSegments(y,group){const k=group?35:0;return [[[180+k,y],[330+k,y]],[[330+k,y-38],[620+k,y-38],[620+k,y+38],[330+k,y+38],[330+k,y-38]],[[465+k,y-38],[465+k,y+38]],[[620+k,y],[780+k,y]],[[180+k,y-21],[180+k,y+21]],[[780+k,y-21],[780+k,y+21]]];}
function prepareCharts(){const rand=seeded(7);for(let group=0;group<2;group++)for(let i=0;i<160;i++){const segments=boxSegments(group?355:205,group),line=segments[i%segments.length];chartItems.push({group,from:[100+i%40*18,group?350+rand()*80:140+rand()*80],to:pointOnPolyline(line,Math.floor(i/segments.length)/(Math.floor(160/segments.length)+1))});}}
function renderCharts(t){ctx.fillStyle='#edf4ed';ctx.fillRect(0,0,LAB_W,LAB_H);drawText('LET THE STRUCTURE SETTLE',64,65,14,'#56776a');
 const move=phase(t,.7,4.8),native=phase(t,5.8,8.8);for(const p of chartItems)dot([mix(p.from[0],p.to[0],move),mix(p.from[1],p.to[1],move)],2.5,palette[p.group],1-native);
 for(let g=0;g<2;g++)for(const line of boxSegments(g?355:205,g))stroke(line,palette[g],3,native);
 drawText('GROUP A',65,210,12,palette[0]);drawText('GROUP B',65,360,12,palette[1]);drawText('arrive → hold → slowly become the native chart',230,470,18,'#5d7f70',450);
 return {phase:t<4.8?'form-the-geometry':t<5.8?'hold-and-read':t<8.8?'slow-native-handoff':'reading',metrics:`position ${move.toFixed(2)}\nnative ${native.toFixed(2)}\nhandoff 3.0 s`};}
function renderRig(t){ctx.fillStyle='#edf4ed';ctx.fillRect(0,0,LAB_W,LAB_H);drawText('A CHAIN, NOT A FLOATING HAND',64,65,14,'#56776a');
 const bow=phase(t,10,11.8)*(1-phase(t,12.4,14)),angle=bow*.63,pivot=[480,335];
 const transform=point=>[pivot[0]+point[0]*Math.cos(angle)-point[1]*Math.sin(angle),pivot[1]+point[0]*Math.sin(angle)+point[1]*Math.cos(angle)];
 const neck=transform([0,-135]),head=transform([0,-179]);stroke([pivot,neck],'#c5d5c6',78);dot(head,29,'#dbb87f');stroke([head,[head[0]+Math.cos(angle)*18,head[1]+Math.sin(angle)*18]],'#7d674d',2);
 for(const sign of [-1,1]){const hip=[pivot[0]+sign*25,pivot[1]],ankle=[480+sign*47,463],leg=twoBoneIK(hip,ankle,72,74,-sign);stroke([hip,leg.elbow,leg.wrist],'#537f73',25);stroke([[ankle[0]-16,478],[ankle[0]+19,478]],'#204d43',15);dot([ankle[0],478],3,'#d2a049');}
 const envelope=phase(t,2.4,3.6)*(1-phase(t,7.7,9.1)),arms=[];
 for(const sign of [-1,1]){const shoulder=transform([sign*47,-126]),pulse=Math.sin((t-3.6)*Math.PI*.85+(sign<0?0:Math.PI));
  const wanted=transform([sign*(113+8*envelope),-12-60*envelope*(.5+.5*pulse)]),arm=twoBoneIK(shoulder,wanted,78,78,-sign);
  stroke([shoulder,arm.elbow,arm.wrist],'#287869',17);dot(arm.elbow,7,'#d0aa63');dot(arm.wrist,5,'#d0aa63');
  const wristAngle=arm.forearmAngle+.14*Math.sin(t*2-0.18)*envelope;stroke([arm.wrist,[arm.wrist[0]+Math.cos(wristAngle)*24,arm.wrist[1]+Math.sin(wristAngle)*24]],'#dbb87f',12);arms.push(arm);
 }
 stroke([[350,490],[620,490]],'#bad0c1',2);drawText('fixed sole contacts',390,520,13,'#698878',450);drawText('shoulder → elbow → wrist',65,250,15,'#4e7769');
 return {phase:t<2.4?'supported-rest':t<9.1?'alternating-linked-arms':t<10?'settle':'torso-and-head-bow',metrics:`bow ${(angle*180/Math.PI).toFixed(1)} deg\nforearm ${(arms[0].forearmAngle*180/Math.PI).toFixed(1)} deg\nsoles anchored`};}
function render(){
 ctx.clearRect(0,0,LAB_W,LAB_H);$('#three').style.display=['handoff','screen'].includes(mode)&&renderer?'block':'none';$('#screen-dom').style.display='none';titleLayer.style.opacity=0;
 const methods={handoff:renderHandoff,screen:renderScreen,particles:renderParticles,ink:renderInk,charts:renderCharts,rig:renderRig};const state=methods[mode](seconds);
 if(webglError&&['handoff','screen'].includes(mode))drawText('WebGL unavailable. Select a 2D mechanism.',140,270,24);
 $('#phase-label').textContent=state.phase;$('#metrics').textContent=state.metrics;$('#time').value=seconds;$('#time-label').textContent=`${seconds.toFixed(2)} / ${studies[mode].duration.toFixed(2)} s`;$('#play').textContent=playing?'暂停':'播放';dirty=false;
}
function setMode(next){mode=next;seconds=0;playing=false;const item=studies[mode];$('#mode-title').textContent=item.title;$('#description').textContent=item.description;$('#limit').textContent=item.limit;$('#time').max=item.duration;$('#mode').value=mode;dirty=true;}
$('#mode').addEventListener('change',()=>setMode($('#mode').value));
$('#start').addEventListener('click',()=>{if(!ready)return;started=true;$('#gate').style.display='none';playing=true;origin=performance.now()-seconds*1000;dirty=true;});
$('#play').addEventListener('click',()=>{if(!started)return;playing=!playing;if(playing){if(seconds>=studies[mode].duration)seconds=0;origin=performance.now()-seconds*1000;}dirty=true;});
$('#reset').addEventListener('click',()=>{seconds=0;playing=false;dirty=true;});
$('#time').addEventListener('input',()=>{seconds=Number($('#time').value);playing=false;dirty=true;});
function frame(now){if(playing){seconds=Math.min(studies[mode].duration,(now-origin)/1000);if(seconds>=studies[mode].duration)playing=false;dirty=true;}if(dirty)render();requestAnimationFrame(frame);}
const yieldPaint=()=>new Promise(resolve=>document.visibilityState==='hidden'?setTimeout(resolve,0):requestAnimationFrame(()=>setTimeout(resolve,0)));
async function prepare(){
 const steps=[['Fonts',async()=>{await document.fonts.ready;}],['Geometry',async()=>{mainScene.updateMatrixWorld(true);screenScene.updateMatrixWorld(true);}],['Particle targets',async()=>{particlePlan=planParticles(particleSources,glyphTargets('MEAN'));}],['Glyph arrival map',async()=>{prepareInk();}],['Chart paths',async()=>{prepareCharts();}],['GPU and representative views',async()=>{if(renderer){renderer.compile(mainScene,camera);renderer.compile(screenScene,camera);for(const key of Object.keys(studies)){mode=key;seconds=studies[key].duration*.65;render();await yieldPaint();}}}]];
 for(let i=0;i<steps.length;i++){$('#load-label').textContent=steps[i][0];await yieldPaint();await steps[i][1]();$('#progress').value=i+1;}
 setMode('handoff');render();ready=true;$('#mode').disabled=false;for(const selector of ['#start','#play','#reset','#time'])$(selector).disabled=false;$('#ready-title').textContent='Ready when you are.';$('#load-label').textContent=webglError?'2D studies ready; WebGL unavailable.':'机制已准备；等待你开始。';$('#start').textContent='Start';
}
window.SkillLab={seek(t){seconds=Math.max(0,Math.min(studies[mode].duration,t));playing=false;dirty=true;},select:setMode,snapshot(){return {mode,seconds,ready,started,playing,webgl:!!renderer,particleSources:[...new Set(particlePlan.map(p=>p.group))],inkPixels:inkPlan.length};}};
setMode('handoff');requestAnimationFrame(frame);prepare().catch(error=>{$('#ready-title').textContent='Preparation interrupted';$('#load-label').textContent=String(error.message||error);console.error(error);});
