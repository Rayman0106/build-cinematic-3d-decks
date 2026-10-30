import assert from 'node:assert/strict';
import {LAB_DEFAULTS,normalizeLabOptions,labTimeline,sampleLabHandoff,sampleLabScreen,sampleLabChart,sampleLabArm,labTimeAtProgress} from '../examples/lab/lab-state.mjs';
import {LAB_CONTENT} from '../examples/lab/lab-content.mjs';
import * as THREE from '../vendor/three.module.min.js';
const near=(a,b,epsilon=1e-7)=>assert(Math.abs(a-b)<=epsilon,`${a} != ${b}`);
let assertions=0;
for(const mode of Object.keys(LAB_DEFAULTS)){
  assert.deepEqual(normalizeLabOptions(mode),LAB_DEFAULTS[mode]);
  assert.equal(LAB_CONTENT[mode].controls.length,2);
  const timeline=labTimeline(mode),again=labTimeline(mode);
  assert.deepEqual(timeline,again);assert(timeline.duration>timeline.beats.at(-1).time);
  assert(timeline.beats.every((b,i)=>i===0||b.time>timeline.beats[i-1].time));
  near(labTimeAtProgress(mode,-1),0);near(labTimeAtProgress(mode,2),timeline.duration);
  for(const control of LAB_CONTENT[mode].controls){
    if(control.type)continue;
    for(const value of [control.min,control.max,NaN,Infinity,-1000,1000]){
      const options=normalizeLabOptions(mode,{[control.key]:value});
      assert(Number.isFinite(options[control.key]));assert(options[control.key]>=control.min&&options[control.key]<=control.max);
      const adapted=labTimeline(mode,options);assert(adapted.beats.every(b=>b.time<adapted.duration));assertions++;
    }
  }
}
assert.throws(()=>normalizeLabOptions('invalid'),RangeError);
for(const fade of [1,2.4,4])for(const offset of [0,30,60]){
 const config={fade,offset},end=labTimeline('handoff',config).duration,landing=sampleLabHandoff(4.2,config);
 for(let t=4.2;t<=end;t+=.05){assert.deepEqual(sampleLabHandoff(t,config).actor,landing.actor);assertions++;}
 const last=sampleLabHandoff(end,config);near(last.worldAmount,0);near(last.outlineAmount,1);near(last.typeAmount,1);near(last.anchorError,offset);
 near(last.actor.position[1]+.36-.39,-.06); // tyre bottom = actual procedural road top
}
// Real Three.js projection math; no browser or renderer. Check every FOV/push endpoint.
for(const fov of [30,36,48])for(const push of [3,4.8,7]){
 const options={fov,push},end=labTimeline('screen',options).duration;
 let previous=Infinity;
 for(let t=0;t<=end;t+=.01){const s=sampleLabScreen(t,options);assert(s.position[2]<=previous+1e-9);assert(s.position[1]>=1.6);previous=s.position[2];assertions++;}
 const epsilon=1e-5,join=sampleLabScreen(3.2,options),before=sampleLabScreen(3.2-epsilon,options),after=sampleLabScreen(3.2+epsilon,options);
 for(let k=0;k<3;k++)near((join.position[k]-before.position[k])/epsilon,(after.position[k]-join.position[k])/epsilon,2e-5);
 const s=sampleLabScreen(end,options),camera=new THREE.PerspectiveCamera(fov,16/9,.1,150);camera.position.set(...s.position);camera.lookAt(...s.target);camera.updateMatrixWorld(true);
 const a=new THREE.Vector3(-2.5,1.6+5*9/32,0).project(camera),b=new THREE.Vector3(2.5,1.6-5*9/32,0).project(camera);
 near(a.x,-1);near(a.y,1);near(b.x,1);near(b.y,-1);near(s.nativeAmount,1);
}
for(const hold of [.3,1,2.5])for(const handoff of [.4,3,5]){
 const options={hold,handoff},start=4.8+hold;
 near(sampleLabChart(4.8,options).move,1);near(sampleLabChart(start-.001,options).nativeAmount,0);
 near(sampleLabChart(start+handoff,options).nativeAmount,1);
 const mid=sampleLabChart(start+handoff/2,options);near(mid.nativeAmount,.5);near(mid.move,1);
}
for(const tempo of [.35,.65,1])for(let t=3.6;t<7.7;t+=.01){
 const left=sampleLabArm(t,-1,{tempo}),right=sampleLabArm(t,1,{tempo});near(left.pulse,-right.pulse);
 const paused=sampleLabArm(t,-1,{tempo});assert.deepEqual(left,paused);assertions++;
}
console.log(JSON.stringify({status:'pass',samples:assertions,boundedControls:true,stationaryOutlineLanding:true,monotonicScreenApproach:true,screenVelocityContinuous:true,projectedCornersCoincide:true,chartHoldThenCrossfade:true,armsCounterphase:true,scope:'Pure state and Three.js projection math; not browser playback.'},null,2));
