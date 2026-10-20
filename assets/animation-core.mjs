/** Deterministic teaching primitives. Units: seconds and caller's world units. MIT. */
export const clamp01 = x => Math.max(0, Math.min(1, x));
export const mix = (a, b, u) => a + (b - a) * u;
export function smooth5(x) {
  const u = clamp01(x); return u*u*u*(u*(u*6-15)+10);
}
export function phase(t, start, end) {
  if (![t,start,end].every(Number.isFinite) || end <= start) throw new RangeError('Finite times and end > start required');
  return smooth5((t-start)/(end-start));
}
export function hermite(p0, v0, p1, v1, duration, seconds) {
  if (![p0,v0,p1,v1,duration,seconds].every(Number.isFinite) || duration<=0) throw new RangeError('Finite values and positive duration required');
  const u=clamp01(seconds/duration), u2=u*u, u3=u2*u;
  return (2*u3-3*u2+1)*p0+(u3-2*u2+u)*duration*v0+(-2*u3+3*u2)*p1+(u3-u2)*duration*v1;
}
// Integral of the clamped quintic smoothstep, extending linearly after 1.
function integral5(u) {return u<=0 ? 0 : u>=1 ? u-.5 : u**6-3*u**5+2.5*u**4;}
export function slowFastSlow(seconds, options={}) {
  const {duration=12,base=.3,boost=2,rise=3,fall=8,ramp=1.2}=options;
  if (![seconds,duration,base,boost,rise,fall,ramp].every(Number.isFinite) ||
      duration<=0 || base<0 || boost<0 || ramp<=0 || rise<0 || fall<rise+ramp || fall+ramp>duration)
    throw new RangeError('Use nonnegative speed and nonoverlapping ramps within duration');
  const t=Math.max(0,Math.min(duration,seconds));
  const extra=smooth5((t-rise)/ramp)-smooth5((t-fall)/ramp);
  return {position:base*t+boost*ramp*(integral5((t-rise)/ramp)-integral5((t-fall)/ramp)),
    velocity:base+boost*extra, duration};
}
export function seeded(seed=1) {
  let state=seed>>>0;
  return ()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
}
export function sampleHandoff(t) {
  const move=phase(t,0,4.8), world=1-phase(t,4.8,7.2), outline=phase(t,7.2,9.8);
  return {seconds:Math.max(0,Math.min(12,t)),
    actor:{position:[mix(-5,0,move),.45,0],heading:0,scale:1},
    camera:{position:[8,4.5,12],target:[0,.5,0],fov:36},
    worldAmount:world, modelAmount:1-outline, outlineAmount:outline,
    typeAmount:phase(t,9.8,11.4), phase:t<4.8?'travel':t<7.2?'world-dissolve':t<9.8?'same-pose-outline':'reading'};
}
