import assert from 'node:assert/strict';
import {coverTransform, photoPoint, affinePoint, ndcToLogical, resampleClosed,
  alignClosedContours, interpolateContour, signedArea, progress, shortAngleLerp} from '../assets/transition-kernel.mjs';
const near = (a,b,tolerance=1e-8) => assert(Math.abs(a-b) <= tolerance, `${a} != ${b}`);
const pointNear = (a,b) => a.forEach((v,i) => near(v,b[i]));
const fit = coverTransform(2048,1152,{x:50,y:20,width:960,height:600});
pointNear(photoPoint([1024,576],fit),[530,320]);
const offCenter = coverTransform(1024,1152,{x:80,y:10,width:800,height:400},[.5,.65]);
near(offCenter.y,10+(400-900)*.65);
pointNear(affinePoint([3,4],[0,2,-2,0,50,40]),[42,46]);
pointNear(ndcToLogical({x:0,y:0,z:.3},1600,900).point,[800,450]);
assert(ndcToLogical({x:-1,y:1,z:0},1600,900).inside);
assert(!ndcToLogical({x:0,y:0,z:2},1600,900).inside);
const square=[[0,0],[8,0],[8,8],[0,8]];
const sampled=resampleClosed([...square,[0,8],[0,0]],8);
assert.equal(sampled.length,8);pointNear(sampled[1],[4,0]);pointNear(sampled[7],[0,4]);near(signedArea(sampled),64);
const target=square.map(p=>[p[0]*2+30,p[1]*2+20]).reverse();
target.push(target.shift());
const pair=alignClosedContours(square,target,32);
assert(pair.reversed);assert(pair.normalizedError<1e-10);
pair.from.forEach((p,i)=>pointNear(pair.to[i],[p[0]*2+30,p[1]*2+20]));
assert.deepEqual(interpolateContour(pair,0),pair.from);assert.deepEqual(interpolateContour(pair,1),pair.to);
const halfway=interpolateContour(pair,.5);halfway.forEach((p,i)=>pointNear(p,[(pair.from[i][0]+pair.to[i][0])/2,(pair.from[i][1]+pair.to[i][1])/2]));
assert(signedArea(halfway)>0); // Same geometry with different winding must not turn inside out.
near(progress(1,2,4),0);near(progress(5,2,4),1);near(progress(3,2,4),.5);
near(shortAngleLerp(179*Math.PI/180,-179*Math.PI/180,.5),Math.PI);
assert.throws(()=>coverTransform(0,10,{width:10,height:10}));
assert.throws(()=>photoPoint([1,2,3],fit));
assert.throws(()=>affinePoint([1,2,3],[1,0,0,1,0,0]));
assert.throws(()=>alignClosedContours([[0,0],[1,0],[2,0]],square));
assert.throws(()=>resampleClosed(square,2));
console.log(JSON.stringify({status:'pass',photoCrop:true,cssTransform:true,logicalProjection:true,
  resampling:true,reversedWindingAndCyclicStart:true,completeMorphEndpoints:true,noInsideOutMidpoint:true,shortAnglePath:true}));
