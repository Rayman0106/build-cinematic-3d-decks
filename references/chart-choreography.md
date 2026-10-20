# 图表编舞：保留数据身份和几何关系

## 从关系选择动作

| 讲解关系 | 可见变化 | 不应暗示 |
|---|---|---|
| 分布→累计分布 | 同一组/同一取值顺序组织成累计轨迹 | 没有原始数据却编出精确频数 |
| 分布→箱线图 | 点沿同组统计结构聚集，再交接线形 | 每个点都是真实试次，若只是示意采样 |
| pooled→paired | 保持 participant ID，点成对比较 | pooled 均值等于个体效应 |
| 均值→中位数 | 来自现有点的不同汇总机制 | 装饰粒子就是实际计算过程 |
| 剔除敏感性 | 明确恢复哪两条观测和汇总变化 | 所有剔除必然错误或因果确定 |
| 局限→下一次设计 | 将证据中的问题转成改进条件 | 凭空加一个控制变量当已实施 |

数学项目的原报告缺少完整试次表；直方图/累计图沿用原图，箱线图按报告统计重绘，敏感性比较标明近似。这种数据边界比特效选择更先确定。

## 一个图表几何源

native 图、装饰轨迹、移动点、标题粒子都读取同一个几何模型：

```js
const chart = {
  plotRect: {x: 80, y: 120, width: 720, height: 360},
  groups: ['quiet', 'conversation'],
  observations: [{id: 'participant-01', group: 'quiet', value: 250}],
  marks: [{id: 'quiet-median', kind: 'line', points: [[x1,y1],[x2,y2]]}]
};
```

使用实际 scale、padding、SVG viewBox 和 transform。DOM bounds 不包含 SVG 内部轴域语义；手写“看起来差不多”的两条线不叫拟合。

原图是 raster 时，可用已知坐标标定、作者提供锚点或可复查的颜色提取；提取结果保存为派生几何并叠加对照。不要每次播放中重新 getImageData 猜曲线。

## 保持身份，不只匹配最近点

paired 视图按 participant ID 匹配，group 颜色保持。点数不同时，区分原始数据和渲染采样点；沿线采样的 160 个点不代表 160 个参与者。

随机匹配虽然能制造粒子雨，却会破坏配对关系。重复抽样或复制图形采样要在元数据中保留 origin/group/markId，不当真实数据。

## 点拼成图后，慢慢交给实体

可靠分段：

```text
源图稳定 → 取出源元素 → 移向目标 → 点的结构可辨
→ 短暂保持 → 粒子淡出与实体线缓慢同步淡入 → 可读图表
```

点到位那一帧不能直接切整张 native 图。交接时点坐标与实体线坐标完全一样，alpha 互补或按可读性设计，线宽/颜色在目标状态一致。可用约 1–2 秒交接作为试做起点，最终按内容和播放反馈决定；不要把示例秒数变成通则。

实验室 charts 场景提供可拖动的 slow handoff；在 nativeAmount 约一半时检查有没有双重影线和位置差。

## 收线变点必须真的沿线反向

设原线从 A 画到 B，要收回到 A：

```js
// path 是与显示线完全相同的折线/曲线
const tip = pointAtArcLength(path, (1 - u) * totalLength);
// 显示 A 到 tip 的剩余线段，不从 B 直接画一条新捷径到 A
```

移动点就沿同一 arc-length 参数从 B 到 A。先完成收线，再离开旧图走向下一图；不能线还长着，点却斜飞出去。`reversePolyline` 返回当前位置与剩余折线，可用于确定性采样。

有曲线时累积实际弧长，而非直接插值两端。原图曲线和动画曲线必须在同坐标，无额外 CSS 偏移。

## 标题、图表与换页时间

- incoming 内容若过早出现，观众会在转场前看到 Pooled/cluster；准备阶段就隐藏动画覆盖的关键词。
- 不自动插入“check excluded response”“back to evidence”等开发提示。正式文字来自内容表。
- 10→11、11→12 这类不同语义的关系不能复用一个随机爆散模板。没有强映射时，用稳定的焦点/相关词汇交接。
- 8→9、9→10 观众反馈太急时，增加结构保持时间，不只把整个 tween 拉长；关键读图节点要留可辨时刻。

## 检查清单

标记的 ID/group 是否保持？线和点的源坐标完全一致？收线方向是否正确？粒子形成图形后能否看懂再变实图？正反向、跳页后是否残留？最终统计值、单位、图例与报告一致？

实现入口：[charts.js](https://github.com/Rayman0106/reaction-time-math-3d-deck/blob/main/src/charts.js)、[analysis-transitions.js](https://github.com/Rayman0106/reaction-time-math-3d-deck/blob/main/src/analysis-transitions.js)、[确定性图表 QA](https://github.com/Rayman0106/reaction-time-math-3d-deck/blob/main/tools/qa/qa-chart-motion.mjs)。
