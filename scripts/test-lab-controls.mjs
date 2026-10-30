/** Runtime input tests using inert DOM/Canvas doubles. No browser or image rendering. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as THREE from '../vendor/three.module.min.js';

const root=new URL('../',import.meta.url),files=['assets/animation-core.mjs','assets/semantic-motion.mjs','examples/lab/lab-state.mjs','examples/lab/lab-content.mjs','examples/lab/main.mjs'];
let clock=1000,rasterReads=0;const frames=[],nodes=new Map();
class Element {
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.listeners={};this.style={};this.dataset={};this.attributes={};this.textContent='';this.innerHTML='';this.value='';this.checked=false;this.disabled=false;}
 append(...items){this.children.push(...items);}
 replaceChildren(...items){this.children=[...items];}
 setAttribute(key,value){this.attributes[key]=String(value);}
 getAttribute(key){return this.attributes[key];}
 addEventListener(key,listener){(this.listeners[key]??=[]).push(listener);}
 emit(key,event={}){for(const listener of this.listeners[key]||[])listener({target:this,preventDefault(){},...event});}
 focus(){document.activeElement=this;}
 closest(){return null;}
 getContext(){return canvasContext;}
 toDataURL(){return 'data:image/png;base64,';}
 decode(){return Promise.resolve();}
}
// Only tiny synthetic masks are returned, for exercising preparation control flow.
const canvasContext=new Proxy({
 measureText(){return{width:90.375,actualBoundingBoxLeft:0,actualBoundingBoxRight:90.375,actualBoundingBoxAscent:100,actualBoundingBoxDescent:0};},
 getImageData(x,y,w,h){rasterReads++;const data=new Uint8ClampedArray(w*h*4);const points=w===960?[[200,200],[204,200],[208,200]]:[[30,80],[32,82],[34,84]];for(const [px,py]of points)data[(py*w+px)*4+3]=255;return{data,width:w,height:h};},
 createImageData(w,h){return{data:new Uint8ClampedArray(w*h*4),width:w,height:h};}
},{get(object,key){return key in object?object[key]:(...args)=>{};}});
const template=fs.readFileSync(new URL('examples/lab/template.html',root),'utf8');
for(const match of template.matchAll(/<([a-z][a-z0-9]*)\b[^>]*\bid="([^"]+)"[^>]*>/g))nodes.set('#'+match[2],new Element(match[1]));
const tabs=[...template.matchAll(/data-study="([^"]+)"/g)].map(match=>{const node=nodes.get('#tab-'+match[1]);node.dataset.study=match[1];return node;});
nodes.set('#screen-dom img',new Element('img'));
const walk=node=>node.children.flatMap(child=>[child,...walk(child)]);
const document={
 visibilityState:'hidden',hidden:false,fonts:{ready:Promise.resolve(),load:()=>Promise.resolve([])},activeElement:null,listeners:{},
 querySelector(selector){const found=nodes.get(selector);if(found)return found;return walk(nodes.get('#parameters')).find(node=>'#'+node.id===selector)||null;},
 querySelectorAll(selector){
  if(selector==='[data-study]')return tabs;
  if(selector==='#beats button')return nodes.get('#beats').children;
  if(selector==='#parameters input,#parameters select,#beats button')return[...walk(nodes.get('#parameters')).filter(node=>['INPUT','SELECT'].includes(node.tagName)),...nodes.get('#beats').children];
  throw new Error('Unimplemented inert selector: '+selector);
 },createElement:tag=>new Element(tag),addEventListener(key,fn){(this.listeners[key]??=[]).push(fn);}
};
const window={innerWidth:1400,devicePixelRatio:1,matchMedia:()=>({matches:false}),listeners:{},addEventListener(key,fn){(this.listeners[key]??=[]).push(fn);}};
const context={document,window,THREE:{...THREE,WebGLRenderer:class {constructor(){throw new Error('WebGL deliberately disabled in control test');}}},console,performance:{now:()=>clock},location:{hash:'#charts'},history:{replaceState(){}},setTimeout,clearTimeout,requestAnimationFrame:fn=>{frames.push(fn);return frames.length;}};
const code=files.map(file=>fs.readFileSync(new URL(file,root),'utf8').replace(/^import [^\n]+\n/gm,'').replace(/\bexport (?=(?:const|let|function|class)\b)/g,'')).join('\n');
const realm=vm.createContext(context);vm.runInContext(code,realm,{filename:'lab-control-test.js'});
const api=window.SkillLab;
assert(!api.snapshot().started);api.play();assert(!api.snapshot().playing);
for(let i=0;i<50&&!api.snapshot().ready;i++)await new Promise(resolve=>setTimeout(resolve,5));
assert(api.snapshot().ready,'Preparation did not finish');assert(!api.snapshot().started);assert(!api.snapshot().playing);assert.equal(api.snapshot().mode,'charts');
assert(vm.runInContext('inkPlan.every(p=>Number.isInteger(p.x)&&Number.isInteger(p.y)&&inkData.data[(p.y*LAB_W+p.x)*4]===24)',realm),'Fractional font advances must still address real glyph pixels');
assert.equal(nodes.get('#play').disabled,true);assert.equal(nodes.get('#start').disabled,false);
nodes.get('#start').emit('click');assert(api.snapshot().started);assert(api.snapshot().playing);assert.equal(nodes.get('#play').disabled,false);
api.select('particles');api.configure({source:'right',arc:1.8});assert.deepEqual(Array.from(api.snapshot().particleSources),['right']);assert(!api.snapshot().playing);
api.select('ink');const readsBefore=rasterReads;api.configure({spacing:.09,tips:false});assert(api.snapshot().inkPixels>0);assert.equal(api.snapshot().options.spacing,.09);assert.equal(rasterReads,readsBefore,'Timing controls must reuse prepared glyph rasters');
api.select('rig');api.configure({linked:false});nodes.get('#step-next').emit('click');assert(Math.abs(api.snapshot().seconds-1/60)<1e-9);
api.seek(1);api.setRate(1.5);api.play();clock+=200;frames.shift()(clock);assert(Math.abs(api.snapshot().seconds-1.3)<1e-9);
api.pause();const frozen=api.snapshot().seconds;clock+=500;while(frames.length)frames.shift()(clock);assert.equal(api.snapshot().seconds,frozen);
api.select('charts');api.configure({handoff:5,hold:2.5});api.seek(999);assert.equal(api.snapshot().seconds,api.snapshot().duration);
nodes.get('#restore').emit('click');assert.equal(api.snapshot().seconds,0);assert.equal(api.snapshot().options.handoff,3);assert.equal(api.snapshot().options.hold,1);
api.play();document.hidden=true;for(const handler of document.listeners.visibilitychange)handler();assert(!api.snapshot().playing);
assert.throws(()=>api.seek(NaN));assert.throws(()=>api.select('missing'));assert.throws(()=>api.setRate(0));
console.log(JSON.stringify({status:'pass',startGate:true,hashSelection:true,parameterRebuild:true,particleSourceSwitch:true,preparedGlyphsReused:true,frameStep:true,rateContinuity:true,pauseAndReset:true,hiddenTabPause:true,webglFallback:true,scope:'Inert input/control doubles and synthetic masks only. No browser, pixels or GPU validated.'},null,2));
