/** Pure geometry for semantic motion examples. No DOM, renderer or private assets. MIT. */
import {clamp01, mix, phase, seeded, smooth5} from './animation-core.mjs';
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
export function polylineInfo(points) {
  if (!Array.isArray(points)||points.length<2||points.some(p=>!Array.isArray(p)||p.length!==2||!p.every(Number.isFinite)))
    throw new TypeError('Polyline requires >=2 finite [x,y] points');
  const lengths=points.slice(1).map((p,i)=>dist(points[i],p)),total=lengths.reduce((a,b)=>a+b,0);
  if(total<=1e-9)throw new RangeError('Nondegenerate polyline required');
  return {points,lengths,total};
}
export function pointOnPolyline(points, amount) {
  const path=polylineInfo(points);let left=path.total*clamp01(amount);
  for(let i=0;i<path.lengths.length;i++) {
    if(left<=path.lengths[i]||i===path.lengths.length-1){const u=clamp01(left/(path.lengths[i]||1));return path.points[i].map((v,k)=>mix(v,path.points[i+1][k],u));}
    left-=path.lengths[i];
  }
}
export function reversePolyline(points, amount) {
  const path=polylineInfo(points),station=path.total*(1-clamp01(amount)),head=pointOnPolyline(points,1-clamp01(amount));
  let travelled=0;const remaining=[points[0].slice()];
  for(let i=0;i<path.lengths.length;i++) {
    if(travelled+path.lengths[i]<station){remaining.push(points[i+1].slice());travelled+=path.lengths[i];}
    else break;
  }
  if(dist(remaining.at(-1),head)>1e-9)remaining.push(head);
  return {head,remaining,remainingLength:station};
}
export function planParticles(sources, targets, seed=19) {
  const groups=Object.keys(sources).sort(),random=seeded(seed);
  if(!groups.length||groups.some(g=>!sources[g].length)||!targets.length)throw new RangeError('Nonempty source groups and targets required');
  return targets.map((to,i)=>{const group=groups[i%groups.length],list=sources[group];
    return {id:i,group,from:list[Math.floor(random()*list.length)].slice(),to:to.slice(),delay:random()*.45,arch:45+random()*80};});
}
export function sampleParticle(item, seconds, travel=3.4) {
  const u=phase(seconds,item.delay,item.delay+travel),v=1-u;
  // A visible take-off and a common tangent at arrival; preserve exact endpoints.
  const dx=item.to[0]-item.from[0],c1=[item.from[0]+dx*.22,item.from[1]-item.arch],c2=[item.to[0]-dx*.18,item.to[1]-item.arch*.25];
  return {point:[0,1].map(k=>v*v*v*item.from[k]+3*v*v*u*c1[k]+3*v*u*u*c2[k]+u*u*u*item.to[k]),progress:u,group:item.group};
}
/** Each opaque glyph pixel gets a stroke arrival; no late rectangle fill.
 * pixels: {x,y,alpha,glyph}; strokes: {points,start,end,glyph} in the same coordinates.
 * This is a nearest-centerline teaching mapper, not automatic handwriting inference.
 */
export function assignInkTimes(pixels, strokes) {
  if(!pixels.length||!strokes.length)throw new RangeError('Pixels and authored strokes required');
  const paths=strokes.map(s=>{if(!(s.start>=0&&s.end>s.start&&s.end<=.96))throw new RangeError('Stroke times must fit [0,.96]');return {...s,...polylineInfo(s.points)};});
  return pixels.map(pixel=>{
    let nearest=Infinity,arrival=NaN;
    for(const path of paths.filter(s=>s.glyph===pixel.glyph)) {
      let before=0;
      for(let i=0;i<path.lengths.length;i++) {
        const a=path.points[i],b=path.points[i+1],dx=b[0]-a[0],dy=b[1]-a[1];
        const u=clamp01(((pixel.x-a[0])*dx+(pixel.y-a[1])*dy)/(dx*dx+dy*dy||1));
        const d=(pixel.x-a[0]-u*dx)**2+(pixel.y-a[1]-u*dy)**2;
        if(d<nearest){nearest=d;arrival=mix(path.start,path.end,(before+path.lengths[i]*u)/path.total);}
        before+=path.lengths[i];
      }
    }
    if(!Number.isFinite(arrival))throw new Error('No authored strokes for glyph '+pixel.glyph);
    return {...pixel,arrival};
  });
}
export function inkAlpha(pixel, normalizedTime, feather=.035) {
  if(!(feather>0&&feather<=.04))throw new RangeError('feather must be in (0,.04]');
  return Math.round(pixel.alpha*smooth5((normalizedTime-pixel.arrival)/feather));
}
export function twoBoneIK(shoulder, wanted, upperLength, lowerLength, bend=1) {
  if(![...shoulder,...wanted,upperLength,lowerLength,bend].every(Number.isFinite)||upperLength<=0||lowerLength<=0)
    throw new RangeError('Finite points and positive segment lengths required');
  const raw=dist(shoulder,wanted),d=Math.min(upperLength+lowerLength-1e-6,Math.max(Math.abs(upperLength-lowerLength)+1e-6,raw));
  const direction=raw>1e-9?[(wanted[0]-shoulder[0])/raw,(wanted[1]-shoulder[1])/raw]:[0,1];
  const a=(upperLength**2-lowerLength**2+d*d)/(2*d),height=Math.sqrt(Math.max(0,upperLength**2-a*a))*(bend>=0?1:-1);
  const elbow=[shoulder[0]+direction[0]*a-direction[1]*height,shoulder[1]+direction[1]*a+direction[0]*height];
  const wrist=[shoulder[0]+direction[0]*d,shoulder[1]+direction[1]*d];
  return {elbow,wrist,clamped:Math.abs(raw-d)>1e-5,upperAngle:Math.atan2(elbow[1]-shoulder[1],elbow[0]-shoulder[0]),forearmAngle:Math.atan2(wrist[1]-elbow[1],wrist[0]-elbow[0])};
}
