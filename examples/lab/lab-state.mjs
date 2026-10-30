/** Interactive controls and deterministic timeline samplers. No renderer or DOM. MIT. */
import {clamp01, mix, phase, hermite} from '../../assets/animation-core.mjs';

export const LAB_DEFAULTS = Object.freeze({
  handoff: Object.freeze({fade:2.4, offset:0}),
  screen: Object.freeze({push:4.8, fov:36}),
  particles: Object.freeze({source:'both', arc:1}),
  ink: Object.freeze({spacing:0.035, tips:true}),
  charts: Object.freeze({handoff:3, hold:1}),
  rig: Object.freeze({linked:true, tempo:0.65})
});

export function normalizeLabOptions(mode, input={}) {
  if(!Object.hasOwn(LAB_DEFAULTS,mode)) throw new RangeError('Unknown study: '+mode);
  const defaults=LAB_DEFAULTS[mode], value={...defaults};
  const ranges={fade:[1,4],offset:[0,60],push:[3,7],fov:[30,48],arc:[0.2,1.8],spacing:[0.015,0.09],handoff:[0.4,5],hold:[0.3,2.5],tempo:[0.35,1]};
  for(const key of Object.keys(defaults)) {
    if(typeof defaults[key]==='number') {
      const n=Number(input[key]??defaults[key]), [min,max]=ranges[key];
      value[key]=Number.isFinite(n)?Math.max(min,Math.min(max,n)):defaults[key];
    } else if(typeof defaults[key]==='boolean') value[key]=typeof input[key]==='boolean'?input[key]:defaults[key];
    else value[key]=['both','left','right'].includes(input[key])?input[key]:defaults[key];
  }
  return value;
}

export function labTimeline(mode, input={}) {
  const p=normalizeLabOptions(mode,input); let beats;
  switch(mode) {
    case 'handoff': {const end=4.2+p.fade;beats=[[0,'移动'],[4.2,'背景退去'],[end,'同位轮廓'],[end+2.6,'标题进入'],[end+3.8,'阅读']];break;}
    case 'screen': {const end=3.2+p.push;beats=[[0,'实体屏幕'],[3.2,'沿法向推进'],[end,'接入 2D'],[end+1.8,'阅读']];break;}
    case 'particles': beats=[[0,'两组样本'],[0.7,'共同出发'],[4.8,'交接文字'],[6.8,'阅读']];break;
    case 'ink': beats=[[0,'起笔'],[2.1,'逐字推进'],[4.2,'沿笔画书写'],[8.8,'完整字形']];break;
    case 'charts': {const end=4.8+p.hold;beats=[[0,'两组点'],[0.7,'形成结构'],[4.8,'停留辨认'],[end,'慢交接'],[end+p.handoff,'阅读']];break;}
    case 'rig': beats=[[0,'接触点'],[2.4,'连动摆手'],[9.1,'收势'],[10,'躯干带动头部']];break;
  }
  const duration=mode==='ink'?10:mode==='rig'?14:beats.at(-1)[0]+1.6;
  return {duration,beats:beats.map(([time,label])=>({time,label}))};
}

export function sampleLabHandoff(seconds,input={}) {
  const p=normalizeLabOptions('handoff',input), timeline=labTimeline('handoff',p);
  const t=Math.max(0,Math.min(timeline.duration,seconds)), fadeEnd=4.2+p.fade;
  const world=1-phase(t,4.2,fadeEnd), outline=phase(t,fadeEnd,fadeEnd+2.6);
  return {actor:{position:[mix(-5,0,phase(t,0,4.2)),-.03,0]},
    camera:{position:[8,4.5,12],target:[1.8,.5,0],fov:36},
    worldAmount:world,outlineAmount:outline,typeAmount:phase(t,fadeEnd+2.6,fadeEnd+3.8),
    offset:p.offset,anchorError:p.offset*outline,
    phase:t<4.2?'移动到落点':t<fadeEnd?'背景退去，主体保持不透明':t<fadeEnd+2.6?'同机位切换表示':t<fadeEnd+3.8?'轮廓停稳，标题进入':'停留阅读'};
}

export function sampleLabScreen(seconds,input={}) {
  const p=normalizeLabOptions('screen',input), timeline=labTimeline('screen',p), t=Math.max(0,Math.min(timeline.duration,seconds));
  const align=phase(t,0,3.2), end=3.2+p.push;
  const landing=(5*9/16)/(2*Math.tan(p.fov*Math.PI/360));
  const z=t<3.2?hermite(10,0,7.8,-0.55,3.2,t):hermite(7.8,-0.55,landing,0,p.push,t-3.2);
  return {position:[mix(5,0,align),mix(3.6,1.6,align),z],target:[0,1.6,0],fov:p.fov,
    nativeAmount:phase(t,end,end+1.8),
    phase:t<3.2?'向屏幕法向收敛':t<end?'保持朝向，向前推进':t<end+1.8?'共享四角，交接 2D':'进入证据'};
}

export function sampleLabChart(seconds,input={}) {
  const p=normalizeLabOptions('charts',input), end=4.8+p.hold;
  return {move:phase(seconds,.7,4.8),nativeAmount:phase(seconds,end,end+p.handoff),
    phase:seconds<.7?'两组样本':seconds<4.8?'点形成箱线结构':seconds<end?'停留，先看懂形状':seconds<end+p.handoff?'点慢慢交给实体线':'停留阅读'};
}

export function sampleLabArm(seconds,side,input={}) {
  const p=normalizeLabOptions('rig',input), env=phase(seconds,2.4,3.6)*(1-phase(seconds,7.7,9.1));
  const pulse=Math.sin((seconds-3.6)*Math.PI*p.tempo+(side<0?0:Math.PI));
  return {envelope:env,pulse,linked:p.linked,wristLocal:[side*(113+8*env),-12-60*env*(.5+.5*pulse)]};
}

export function labTimeAtProgress(mode, progress, input={}) {
  return clamp01(progress)*labTimeline(mode,input).duration;
}
