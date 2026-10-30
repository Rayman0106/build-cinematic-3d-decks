/** Inert host-control test: no browser, network, image or model rendering. */
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {CaseClock,CaseFrameQueue,CASE_LESSONS} from '../examples/case-lab/state.mjs';
const root=new URL('../examples/case-lab/',import.meta.url),nodes=new Map(),createdFrames=[],outgoing=[];
class Element {
 constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.style={};this.dataset={};this.attributes={};this.events={};this.textContent='';this.innerHTML='';this.checked=false;this.disabled=false;this.hidden=false;this.value='';if(tag==='iframe'){this.contentWindow={postMessage:message=>outgoing.push({source:this.contentWindow,...message})};createdFrames.push(this);}}
 append(...items){for(const item of items){this.children.push(item);item.parent=this;}}
 replaceChildren(...items){this.children=[];this.append(...items);}
 remove(){if(this.parent)this.parent.children=this.parent.children.filter(child=>child!==this);}
 setAttribute(key,value){this.attributes[key]=String(value);}
 removeAttribute(key){delete this.attributes[key];}
 addEventListener(key,fn){(this.events[key]??=[]).push(fn);}
 emit(key){for(const fn of this.events[key]||[])fn({target:this});}
 closest(){return null;}
}
const html=fs.readFileSync(new URL('template.html',root),'utf8');
for(const m of html.matchAll(/<([a-z][a-z0-9]*)\b[^>]*\bid="([^"]+)"[^>]*>/g))nodes.set('#'+m[2],new Element(m[1]));
const rateButtons=[.25,.5,1].map(rate=>{const button=new Element('button');button.dataset.rate=String(rate);return button;});
const profiles={
 'math-type':{project:'math',runtime:'scenes/math-type.html',assetBytes:0,entryBytes:1450000,manualLoad:false},
 'math-scene':{project:'math',runtime:'scenes/math-native.html',assetBytes:90000000,entryBytes:4500000,manualLoad:false},
 'f1-launch':{project:'f1',runtime:'scenes/f1-launch.html',assetBytes:69000000,entryBytes:4000000,manualLoad:false},
 'f1-grid':{project:'f1',runtime:'scenes/f1-native.html',assetBytes:390000000,entryBytes:4000000,manualLoad:true}
};
const routes=Object.fromEntries(CASE_LESSONS.flatMap(lesson=>lesson.variants.map(id=>[id,id.startsWith('math-')?['math-type','math-mean','math-words'].includes(id)?'math-type':'math-scene':id==='f1-cadillac'?'f1-grid':'f1-launch'])));
const manifest={defaultLesson:'math-type',profiles,routes,posters:{room:'poster',type:'poster',grid:'poster',redbull:'poster',upgrade:'poster',budget:'poster',dotplot:'poster'},projects:{math:{name:'Math',original:'math.html',coverKicker:'Math'},f1:{name:'F1',original:'f1.html',coverKicker:'F1'}}};
nodes.get('#case-manifest').textContent=JSON.stringify(manifest);nodes.get('#show-text').checked=true;
const window={listeners:{},addEventListener(key,fn){(this.listeners[key]??=[]).push(fn);}};
const document={body:{dataset:{}},hidden:false,querySelector:key=>nodes.get(key),querySelectorAll(key){if(key==='[data-rate]')return rateButtons;if(key==='[data-lesson]')return nodes.get('#lessons').children;if(key==='#beats button')return nodes.get('#beats').children;throw new Error('Missing inert selector '+key);},createElement:tag=>new Element(tag),addEventListener(){}};
const context={window,document,CaseClock,CaseFrameQueue,CASE_LESSONS,matchMedia:()=>({matches:false}),performance:{now:()=>1000},requestAnimationFrame:()=>1,cancelAnimationFrame(){},console};
vm.runInNewContext(fs.readFileSync(new URL('main.js',root),'utf8'),context);
const api=window.SkillLab;
assert.equal(createdFrames.length,1);assert.equal(createdFrames[0].src,'scenes/math-type.html?clip=math-mean');assert.equal(api.snapshot().initialModelBytes,0);
const glyph=createdFrames[0],clips=['math-type','math-mean','math-words'].map(id=>({id,title:id,duration:8}));
function message(frame,type,data={}){for(const fn of window.listeners.message)fn({source:frame.contentWindow,data:{channel:'cinematic-real-case-lab-v1',project:frame===glyph?'math':'f1',type,...data}});}
message(glyph,'ready',{clips});assert(api.snapshot().ready);assert(!api.snapshot().started);
nodes.get('#start').emit('click');assert.equal(outgoing.at(-1).type,'start');message(glyph,'started');const preparation=outgoing.at(-1);assert.equal(preparation.type,'prepare');assert(nodes.get('#play').disabled);assert(nodes.get('#time').disabled);
const messagesBeforeSeek=outgoing.length;api.seek(3);api.play();assert.equal(outgoing.length,messagesBeforeSeek,'No frame sampling during native preparation');assert(!api.snapshot().playing);
message(glyph,'clip-ready',{clip:'math-mean',request:preparation.request-1,clips});assert.equal(outgoing.length,messagesBeforeSeek,'Stale preparation acknowledgements must be ignored');
message(glyph,'clip-ready',{clip:'math-mean',request:preparation.request,clips});const sample=outgoing.at(-1);assert.equal(sample.type,'sample');assert(nodes.get('#play').disabled,'Wait for the first sampled frame');message(glyph,'sampled',{seq:sample.seq,id:'math-mean'});assert(!nodes.get('#play').disabled);api.pause();
api.select('f1-launch');assert.equal(createdFrames.length,2,'Two-car launch loads its own four-asset profile');const heavy=createdFrames[1];assert.equal(heavy.src,'scenes/f1-launch.html?clip=f1-launch');
const f1Clips=['f1-launch','f1-budget','f1-outline','f1-racing','f1-upgrade'].map(id=>({id,title:id,duration:20}));message(heavy,'ready',{clips:f1Clips});nodes.get('#start').emit('click');message(heavy,'started');let nextPrepare=outgoing.at(-1);message(heavy,'clip-ready',{clip:'f1-launch',request:nextPrepare.request,clips:f1Clips});let nextSample=outgoing.at(-1);message(heavy,'sampled',{seq:nextSample.seq,id:'f1-launch'});api.pause();
api.select('math-type');assert.equal(createdFrames.length,2,'Returning to typography must reuse its prepared frame');assert(api.snapshot().ready);assert(api.snapshot().started);assert.equal(glyph.style.visibility,'visible');assert(nodes.get('#frame-slot').children.includes(heavy));assert.equal(heavy.style.visibility,'hidden');
message(heavy,'ready',{clips:[{id:'f1-launch',duration:31,title:'F1'}]});assert.equal(api.snapshot().profile,'math-type','Messages from the hidden heavy frame must not alter typography');
api.select('f1-upgrade');assert.equal(createdFrames.length,2,'Returning to a different F1 lesson must reuse the existing model frame');assert.equal(heavy.style.visibility,'visible');assert.equal(api.snapshot().profile,'f1-launch');assert.equal(api.snapshot().clip,'f1-upgrade');assert.equal(nodes.get('#frame-slot').children.length,2);
api.select('f1-budget');assert.equal(createdFrames.length,2,'Switching between F1 lessons must not reparse models');nextPrepare=outgoing.at(-1);message(heavy,'clip-ready',{clip:'f1-budget',request:nextPrepare.request,clips:f1Clips});nextSample=outgoing.at(-1);message(heavy,'sampled',{seq:nextSample.seq,id:'f1-budget'});api.pause();
const frameCount=createdFrames.length;nodes.get('#variant').value='f1-cadillac';nodes.get('#variant').emit('change');assert.equal(createdFrames.length,frameCount,'Eleven-team inspection remains opt-in');assert.match(nodes.get('#start').textContent,/加载/);nodes.get('#start').emit('click');assert.equal(createdFrames.length,frameCount+1);assert.match(createdFrames.at(-1).src,/f1-native.html\?clip=f1-cadillac/);
const bridgeEvents={},bridgeReplies=[],prepared=[],finish=new Map();
const parent={postMessage:message=>bridgeReplies.push(message)};
const native={prepareClip(id){prepared.push(id);return new Promise(resolve=>finish.set(id,resolve));},catalogue:()=>[]};
const bridgeWindow={CINEMATIC_CASE_PROJECT:'math',__DECK__:{lab:native},addEventListener(type,fn){bridgeEvents[type]=fn;}};
vm.runInNewContext(fs.readFileSync(new URL('native-bridge.js',root),'utf8'),{window:bridgeWindow,parent,document:{},setInterval:()=>1,clearInterval(){},console});
const request=(id,token)=>bridgeEvents.message({source:parent,data:{channel:'cinematic-real-case-lab-v1',type:'prepare',clip:id,request:token}});
const first=request('math-type',41),second=request('math-mean',42);
await new Promise(resolve=>setImmediate(resolve));assert.deepEqual(prepared,['math-type'],'Native preparation must not overlap');
finish.get('math-type')();await first;await new Promise(resolve=>setImmediate(resolve));assert.deepEqual(prepared,['math-type','math-mean']);
finish.get('math-mean')();await second;assert.deepEqual(bridgeReplies.filter(item=>item.type==='clip-ready').map(item=>[item.clip,item.request]),[['math-type',41],['math-mean',42]]);
console.log(JSON.stringify({status:'pass',firstViewTypographyOnly:true,noInitial3DRequest:true,twoCarLaunchProfile:true,teamInspectionRequiresExplicitLoad:true,typographyFrameReused:true,oneHeavyFrame:true,staleFrameMessagesIgnored:true,stalePreparationMessagesIgnored:true,noSamplingDuringPreparation:true,nativePreparationSerialized:true,sharedF1RendererReused:true,heavyFrameRetainedDuringTypography:true,scope:'Host-control doubles only, no browser or load-time measurement.'},null,2));
