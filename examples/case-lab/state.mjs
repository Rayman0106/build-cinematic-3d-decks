/** Transport helpers for sampling the real project runtimes. No renderer. MIT. */
export class CaseClock {
 constructor(duration=31){this.duration=duration;this.time=0;this.rate=1;this.playing=false;this.origin=0;this.base=0;}
 sample(now){return this.playing?Math.max(0,Math.min(this.duration,this.base+(now-this.origin)*this.rate/1000)):this.time;}
 seek(time,now=0){if(!Number.isFinite(time))throw new RangeError('Finite time required');this.time=Math.max(0,Math.min(this.duration,time));this.playing=false;this.base=this.time;this.origin=now;return this.time;}
 play(now){if(this.time>=this.duration)this.time=0;this.base=this.time;this.origin=now;this.playing=true;}
 pause(now){this.time=this.sample(now);this.playing=false;this.base=this.time;this.origin=now;return this.time;}
 setRate(rate,now){if(![.25,.5,1].includes(rate))throw new RangeError('Unsupported rate');this.time=this.sample(now);this.rate=rate;this.base=this.time;this.origin=now;}
 setDuration(duration,now=0){if(!Number.isFinite(duration)||duration<=0)throw new RangeError('Positive duration required');this.pause(now);this.duration=duration;this.seek(Math.min(this.time,duration),now);}
}
export class CaseFrameQueue {
 constructor(){this.serial=0;this.pending=null;this.latest=null;this.signature=null;}
 submit(sample){
  if(!sample||!Number.isFinite(sample.time)||typeof sample.clip!=='string')throw new TypeError('A finite sample and clip ID are required');
  if(this.pending){this.latest={...sample};return null;}
  const signature=JSON.stringify(sample);if(signature===this.signature)return null;
  this.signature=signature;this.pending={...sample,seq:++this.serial};return this.pending;
 }
 acknowledge(seq){if(this.pending?.seq!==seq)return{accepted:false,next:null};this.pending=null;const next=this.latest;this.latest=null;return{accepted:true,next:next?this.submit(next):null};}
 clear(){this.pending=null;this.latest=null;this.signature=null;}
}
export const CASE_LESSONS=[
 {id:'f1-launch',project:'f1',number:'01',title:'双车发车',heading:'两辆赛车，同一个起点。',kicker:'F1 ECONOMICS / TWO-CAR START',poster:'grid',cover:'迈凯伦在前，红牛发起挑战。',variants:['f1-launch'],watch:'保留原版赛道、五盏红灯、起步超越与红牛聚焦。只加载迈凯伦和红牛，从前排镜头开始。',try:'原速看起步和超越，再用半速观察红牛如何从迈凯伦身后抽头。',beats:[[0,'前排与红灯'],[6.1,'灯灭发车'],[10,'抽头超越'],[16,'跟拍聚焦'],[19.1,'落入阅读页']]},
 {id:'f1-budget',project:'f1',number:'02',title:'从预算条驶出',heading:'预算上的标记，开成下一页的主角。',kicker:'F1 ECONOMICS / BUDGET TO CAR',poster:'budget',cover:'让同一辆车，从预算中驶出。',variants:['f1-budget','f1-cadillac','f1-racing'],watch:'迈凯伦从预算条上的小车标记起步，保持位置连续，恢复三维体积；预算条同时重组成下一页的支出上限。',try:'先原速看完整的 5.8 秒。再用 ¼× 检查小车标记如何驶出、恢复实体，以及预算条怎样接上支出上限。',beats:[[0,'预算条与小车'],[.35,'从条上起步'],[1.55,'恢复三维'],[2.4,'预算变为上限'],[4.65,'驶入下一页'],[5.8,'稳定阅读']]},
 {id:'f1-upgrade',project:'f1',number:'03',title:'拆翼与迭代',heading:'把改进，做在同一辆车上。',kicker:'F1 ECONOMICS / DEVELOPMENT',poster:'upgrade',cover:'真实部件，完整拆出。',variants:['f1-upgrade'],watch:'迈凯伦的前翼、尾翼沿原拆装计划取出、强调并回装。保留真实车身、涂装、安装关系与原版字效。',try:'拖动到部件分离的时刻，再逐帧检查部件与车身的关系；回装时观察原位对齐。',beats:[[0,'基线赛车'],[2.35,'前翼分离'],[3.65,'前翼回装'],[4.3,'测试迭代'],[5.6,'尾翼分离'],[6.95,'尾翼回装'],[9,'下一轮研发']]},
 {id:'math-screen',project:'math',number:'04',title:'走进电脑屏幕',heading:'从人物所在的房间，走进证据。',kicker:'REACTION TIME / SCREEN HANDOFF',poster:'room',cover:'房间没有消失，视角走了进去。',variants:['math-screen','math-room'],watch:'使用原学生、电脑、房间和镜头。显示器里的图像与最终分析页共享配准，先建立空间关系再进入平面。',try:'这个转场原速只有 2.7 秒，适合切换 ¼×。拖动最后一小段，观察显示器与二维页面的交接。',beats:[[0,'实体房间'],[.7,'接近屏幕'],[1.9,'正视收敛'],[2.43,'接入二维'],[2.7,'证据页面']]},
 {id:'math-type',project:'math',number:'05',title:'圆点图写出 Mean / Median',heading:'图上的圆点，写出均值与中位数。',kicker:'REACTION TIME / DOT PLOT TO TYPE',poster:'dotplot',cover:'每一组字，都从图中的点出发。',variants:['math-mean'],watch:'原版圆点图保留每个参与者的位置与组别。蓝色与橙色数据点沿真实图形出发，聚合成 Mean / Median，再交回清晰的原生文字。',try:'用 ½× 看清两种颜色的来源，再拖到粒子聚合时刻。注意粒子怎样从下面的数据出发，而不是从画面外凭空出现。',beats:[[0,'圆点图与数据'],[.2,'沿图形出发'],[.5,'粒子聚合'],[.8,'接回原生文字'],[1,'稳定阅读']],relative:true},
 {id:'math-character',project:'math',number:'06',title:'人物与关节动作',heading:'肩、肘、腕，属于同一个动作。',kicker:'REACTION TIME / CHARACTER',poster:'room',cover:'这个人，还是原来那个人。',variants:['math-67','math-closing'],watch:'复用原版带骨骼学生、服装、房间和动作。可观察 67 交替摆手，也能切换完整谢幕片段。',try:'半速观察手从桌面收回、双臂交替和掌面跟随。最后一段直接使用原工程的谢幕动作。',beats:[[0,'初始姿态'],[.2,'准备动作'],[.45,'关节联动'],[.8,'跟随与收势'],[1,'结束落点']],relative:true}
];
