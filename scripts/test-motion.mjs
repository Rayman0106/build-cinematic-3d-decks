import assert from 'node:assert/strict';
import {hermite,slowFastSlow,sampleHandoff} from '../assets/animation-core.mjs';
import {planParticles,sampleParticle,reversePolyline,assignInkTimes,inkAlpha,twoBoneIK} from '../assets/semantic-motion.mjs';
const near=(a,b,tol=1e-7)=>assert(Math.abs(a-b)<tol,`${a} != ${b}`);
const delta=1e-5;
near(hermite(2,3,12,1,4,0),2);near(hermite(2,3,12,1,4,4),12);
near((hermite(2,3,12,1,4,delta)-2)/delta,3,2e-5);
near((12-hermite(2,3,12,1,4,4-delta))/delta,1,2e-5);
let previous=-1,integral=0;const step=.002;
for(let t=0;t<=12;t+=step){const p=slowFastSlow(t);assert(p.position>=previous);previous=p.position;
 if(t>0)integral+=(slowFastSlow(t-step).velocity+p.velocity)*step/2;
 near(p.position,integral,2e-5);
 if(t>.1&&t<11.9)near((slowFastSlow(t+delta).position-slowFastSlow(t-delta).position)/(2*delta),p.velocity,1e-6);
}
near(slowFastSlow(0).velocity,.3);near(slowFastSlow(12).velocity,.3);assert(slowFastSlow(6).velocity>2);
assert.throws(()=>slowFastSlow(1,{base:-1}));
assert.deepEqual(sampleHandoff(9),sampleHandoff(9));
assert.deepEqual(sampleHandoff(4.8).actor,sampleHandoff(12).actor);
const sources={left:[[0,1],[1,2]],right:[[10,1],[11,2]]},targets=Array.from({length:100},(_,i)=>[i,100]);
const plan=planParticles(sources,targets,41);assert.deepEqual(plan,planParticles(sources,targets,41));
assert.equal(plan.filter(p=>p.group==='left').length,50);assert.equal(plan.filter(p=>p.group==='right').length,50);
for(const p of plan){assert.deepEqual(sampleParticle(p,0).point,p.from);const end=sampleParticle(p,5).point;end.forEach((v,i)=>near(v,p.to[i]));}
const path=[[0,0],[10,0],[10,10]],mid=reversePolyline(path,.25);
assert.deepEqual(mid.head,[10,5]);assert.deepEqual(mid.remaining,[[0,0],[10,0],[10,5]]);
assert.deepEqual(reversePolyline(path,0).head,[10,10]);assert.deepEqual(reversePolyline(path,1).remaining,[[0,0]]);
// Include wide off-centre corners: each glyph pixel, not just centreline pixels, must fill.
const pixels=Array.from({length:200},(_,i)=>({x:i%20,y:Math.floor(i/20),alpha:i%255+1,glyph:0}));
const ink=assignInkTimes(pixels,[{glyph:0,points:[[2,0],[2,9]],start:.02,end:.4},{glyph:0,points:[[2,0],[18,5],[2,9]],start:.45,end:.94}]);
for(const p of ink){assert.equal(inkAlpha(p,0),0);assert.equal(inkAlpha(p,1),p.alpha);assert(inkAlpha(p,.9)<=inkAlpha(p,.95));}
assert.throws(()=>assignInkTimes([{x:0,y:0,alpha:255,glyph:9}],[{glyph:0,points:path,start:0,end:.9}]));
for(let i=0;i<120;i++){const wanted=[Math.cos(i)*4,Math.sin(i)*4],ik=twoBoneIK([0,0],wanted,2,3,i%2?1:-1);
 near(Math.hypot(...ik.elbow),2);near(Math.hypot(ik.wrist[0]-ik.elbow[0],ik.wrist[1]-ik.elbow[1]),3);}
assert(twoBoneIK([0,0],[40,0],2,3).clamped);
console.log(JSON.stringify({status:'pass',hermiteEndpointVelocities:true,integralAndMonotonicTravel:true,deterministicHandoff:true,
  bothParticleSources:true,retraceSamePolyline:true,allOpaquePixelsFillBeforeHandoff:true,IKLengthsAndReach:true}));
