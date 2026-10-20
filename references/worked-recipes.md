# 从请求到实现：六个可照着执行的方案

这些是完整的工作分解，不是替所有题材固定参数。先读任务对应参考，再运行实验室相应场景；完整生产实现从两个案例链接查阅。

## A. 新项目：电池回收的 2D+3D 演示

**用户目标**：解释回收材料如何回到下一代产品，而非做无主题产品片。

1. 主线对象选电池模组；数据母题选材料流。每页判断可为使用→拆分→分类→再生→权衡→循环结论。
2. 先设计六个静态落点。电池实物不挡文字，材料图有单位和来源，结论安静可读。
3. 模型需求表写清外壳、独立单体、内部片层；无可拆结构就先适配或用明确示意的程序几何，不让贴花代替组件。
4. 用端点合同连接：同一模组拆出→材料单元→二维流量图；只有颜色/表示变化时保留同一投影。
5. 字效选择：分类标签从对应组件出现，回收比例从图表结构汇聚，结尾回扣开头电池。不要套 F1 的超车、车队检阅和蒙扎。
6. 先交可审的主线和一个关键交接，再扩完整工程。缺事实来源不能凭动画填数值。

交付包括源资产清单、图表来源、逐页判断/端点、离线构建、验证记录。实验室 handoff 是表示交接练习，storyboard.json 是合同样式。

## B. 修复“轮廓恢复实体时跳位”

**复现**：直接进入目标页、从上一页进入、重播各一次。

记录冻结点的 actor matrixWorld、camera matrixWorld/projectionMatrix、stage CSS、viewport、照片 natural size/object-fit/object-position、命名锚点。

先运行屏幕端点检查。如果世界位置一致而 nose 投影不同，查相机/裁切/外层 CSS；若从默认 station/lane 创建新 pose，改继承冻结端点。

```js
// 伪接口，需接到实际工程的同一状态源
const a = frozenPhotoAlignedPose;
const pose = {
  actor: a.actor,
  camera: a.camera,
  modelAmount: phase(t, 0, .8),
  outlineAmount: 1 - phase(t, 0, .8)
};
// 在同投影恢复后才启用后续轨迹；要连续速度时另匹配导数。
```

查双份白轮廓是否同时 visible，检查字幕从正确 contentBornAt 开始。最终看连续播放中的交接，不只对两个静帧。

## C. 从两个图形产生标题粒子

前提：标题字体已加载、内容布局稳定，两个图形是可解释来源。

1. 对 SVG 坐标使用 getScreenCTM，再转换为 stage 逻辑像素；不要手加一个 y 偏移。
2. 采集目标字形点，运行 `planParticles({left, right}, targetPoints, seed)`。
3. 每帧 `sampleParticle(item, seconds-bornAt)`，group 控制颜色；提前隐藏目标完整词。
4. 图形仍可辨时让第一批点出发，两个来源在同一时段都有贡献。
5. 粒子形成标题后保持，再切换原生 DOM，位置/字体完全一致。

坐标片段（二维仿射情形）：

```js
function svgToStage(svg, point, stage, logicalWidth=1920) {
  const p = new DOMPoint(point[0], point[1]).matrixTransform(svg.getScreenCTM());
  const r = stage.getBoundingClientRect(), k=logicalWidth/r.width;
  return [(p.x-r.left)*k, (p.y-r.top)*k];
}
```

此片段假设 stage 只做等比例缩放和平移。若 stage 有透视/旋转，使用完整逆矩阵，不能继续仅减 bounds。文字粒子先不做太多 trail/bloom，确保来源和终点在正常速度下看得懂。

## D. 点拼成箱线图后实体化太急

1. 检查 native 图与目标点共用同一组 line segments 和 scale。
2. 把时间拆成 move、hold、native crossfade，而不是一个 progress 控制所有东西。
3. hold 时目标结构完整可辨；crossfade 只改表示权重，不重新定位线段。
4. incoming 标题按内容入场生效，旧图退出时不突然出现额外解释字幕。

```js
const moved = phase(t, .6, 4.8);
const native = phase(t, 5.8, 8.8);
const dotPosition = source.map((v,i)=>mix(v,target[i],moved));
const particleAlpha = 1-native;
const nativeLineAlpha = native;
```

秒数是实验室示例；实际内容以观众能认出图形为准。统计 ID/group 保持，不把多个渲染点误称多个参与者。

## E. 人物抬手仍僵硬，最后一脚扭回

先单独显示骨骼和足底轨迹。关闭 root 呼吸/gaze 后对照，区分动作层、IK层、皮肤权重。

手臂检查：肩是否准备、肘是否有 pole、腕是本地继承还是世界锁平、手抽出是否经过躯干。进入/退出路径要有外侧弧线，手接触桌面先释放。循环段用67反相目标，手掌朝向随前臂变化。

脚检查：swing→stance 的世界鞋底点是否稳定；clip 切换时 root/hip 有没有双重位移；stance约束是否在源动作已抬脚后仍锁住；最后是否被 idle 的旧脚旋转拉回。修完看尾部半秒与下一次重播。

复杂舞蹈优先已授权模板，做骨架/rest pose适配，不自己编一堆正弦。实际碰撞对象包括椅子座面、扶手、裤腿，不只有双脚。

## F. 卡顿、黑屏和背景闪烁同时发生

不要“一次调低所有材质”。先拆三类：

1. **冷启动**：阶段进度、字体/图像解码、模型解析、字形和图表预计算、GPU代表机位；等待手动Start。
2. **播放中卡顿**：frame time/long task与事件时间相对齐。首次shader/纹理尖峰就预热；反复getImageData就缓存；GPU过载才调整渲染质量。
3. **灰面闪烁**：静态/动态相机对照，关阴影/纯色材质/逐组隐藏原立面与补体。共面冲突修几何或局部偏置，alpha边缘修采样，别混为一谈。

预热后恢复首幕状态，Start先全屏/resize再启动时钟。发布记录分别写“数值检查通过”“包可重建”“实际播放是否测试”；未实测时不下无卡顿结论。

## 验收记录模板

```text
请求与保留范围：
采用的语义关系和修改：
资产来源/适配/许可变化：
源码 commit / 构建输出：
数值与几何检查：
正常速度/试听检查：
直接进入、相邻进入、重播、反向、resize：
未覆盖设备/浏览器与已知边界：
用户可打开的正式入口/交付链接：
```
