# 2D／3D 转场、轮廓与照片配准

## 一套状态，多个表示

场景采用绝对时间采样 `sampleScene(seconds)`，输出对象、相机、世界可见度、轮廓／照片权重、DOM 布局、文字出生时刻及声音阶段。重复采样同一时刻，应得到相同构图与关节相位。

保存上一页终帧、转场首帧、转场终帧、下一页静态帧。已冻结的对象不能在下一段被 station／lane 常量覆盖。不要最后再靠 CSS transform 或相机主点把主体“补挪”到位。

世界位姿相同还不够：外层 CSS 矩阵、viewport、camera principal、FOV、target、照片裁切及字体加载都能造成屏幕跳位。打印两侧完整状态与投影后的命名关键点。

## 正向：3D → 剪影 → 轮廓／照片

1. 主体与相机收敛到目标投影，先给一次稳定落点。
2. 在相同位姿和相机中单独渲染主体 opaque mask，提取边界，包括轮胎、翼片、Halo 等可见凸起。
3. 实体填充在此轮廓下消退，保留轮廓；换材质或相机的同一帧不要重新定位模型。
4. 照片与模型不同，先对齐透视和关键结构，再让**细轮廓**适应照片。不要用明显变形的实心黑团掩盖几何差异。
5. 最终轮廓落在照片实际边界上，不能停在原模型轮廓、近似矩形或未考虑裁切的原图坐标。

名称和外接框不能证明模型与照片相同。正侧面、前 3/4、近正面有本质差别；概念资产与实车照片可能需要明确的示意说明。

## 逆向：照片／轮廓 → 3D

首帧保持上一页完整静态表示。让轮廓回到当时模型投影，在同一屏幕位置恢复实体；模型充分可见后再移动相机或主体。不要插入停顿或重新使用默认世界原点导致一跳。

可用顺序：照片与适配轮廓 → 注册后的模型轮廓 → 同位姿 opaque 模型 → 新轨迹。顺序可合并，端点须共享。对象只出现一次，层之间的替代不能闪出第二份白色轮廓。

透视与正交相机的对象类型切换不会自动产生连续画面。优先沿用透视机位，必要时用长焦侧面。确需换投影时单独验证尺寸、视差和背景变形；自定义投影插值是额外实现，不是默认修复。

## 照片坐标与裁切

分清世界、逻辑画布、浏览器 CSS、照片自然像素。`object-fit: cover` 的映射：

```text
s = max(boxWidth / imageWidth, boxHeight / imageHeight)
cropX = (boxWidth  - imageWidth  * s) * objectPositionX
cropY = (boxHeight - imageHeight * s) * objectPositionY
logicalX = boxLeft + cropX + photoX * s
logicalY = boxTop  + cropY + photoY * s
```

objectPositionX/Y 是 0–1 对齐位置，不能一律当成居中。照片框再被 CSS 变换时，还需应用仿射矩阵。DPR 不属于布局公式；转换到真实截屏像素时再乘显示比例。

以轮心、车鼻、尾翼顶角、Halo 等关键点校准朝向／俯仰／滚转与尺寸。只匹配 bounds 能把错误角度缩到差不多，不能证明贴合。

## 边界重采样与对应

按弧长采样成相同点数，统一顺／逆时针，搜索循环起点。方向反了或起点不同会使中间轮廓扭转、自交。有多个孔洞／部件时按结构配对，不把轮胎孔洞拼成一条路径。

`assets/transition-kernel.mjs` 提供裁切映射、等弧长采样、方向和循环对齐。它不求解真实相机、不重建照片、不解决拓扑变化；几何不同可用分段对应或人工关键点改善。

## 世界退到讲解页

世界 W 包含主体 F。单独渲染保留主体的 F，再用 `mix(F, W, worldAmount)` 合成：worldAmount 从 1 到 0，主体保持不透明，背景退到页面底色。两次渲染使用相同相机、DPR、阴影与颜色管理。

逐个把赛道、看台和车辆材质切成 transparent 会改变深度与排序，可能暴露内部、造成下半车消失或天空变色。其它分层方案也可用，但要核对直接渲染和合成路径的颜色、边缘与曝光。

F1 固定引擎版本曾对离屏色彩路径做内部适配；其 XR render-target 标记不是推荐的可移植 API。新项目采用引擎支持的颜色管理，不能照抄内部开关。

## 端点检查协议

`scripts/check-continuity.py` 接受 JSON，检查指定对象。world 模式检查 position、heading、scale 和可选 camera；screen 模式检查 projected bounds 与命名 anchors。关键点比外接框信息多，但仍不能证明整条轮廓或自然观感。

```json
{
  "version": 1,
  "edges": [{
    "name": "outline-to-model",
    "mode": "screen",
    "actor_ids": ["hero"],
    "screen_tolerance": 1.5,
    "from": {"actors": {"hero": {"bounds": [80, 120, 700, 240], "anchors": {"nose": [82, 285], "rear": [775, 170]}}}},
    "to": {"actors": {"hero": {"bounds": [80, 120, 700, 240], "anchors": {"nose": [82, 285], "rear": [775, 170]}}}}
  }]
}
```

运行 `python scripts/check-continuity.py handoffs.json`。容差按当前逻辑画布决定，不把示例 1.5 像素当成所有项目的标准。每个 edge 必须有可比较字段，缺数据不能算通过。

## 小停顿排查

先确认时钟是否暂停，再查 pose 分支重置、相机／CSS 投影跳变、过早钳制终帧、字体／字幕另开计时器、首次编译或纹理上传。将相邻帧和计时日志对应起来；只放大 easing 区间可能掩盖根因。

## 不把线框冒充剪影边界

EdgesGeometry 展示硬边/内部线，不能提供最终照片外围轮廓。实验室 handoff 用它演示同投影表示交接，真实项目要从单独主体 mask 提外边界，或使用已标定的照片轮廓。轮胎内孔、Halo、翼片等拓扑按结构保存。

可实现路径：主体 ID/mask render target → alpha 阈值 → marching squares/轮廓追踪 → 平滑与等弧长重采样 → 语义关键点对齐。阈值和简化误差在最终分辨率检查，不每帧重算。必要时离线标注照片边界，并记录原图尺寸和裁切参数。

`alignClosedContours` 只求同向与循环起点，不求真实相机。两款外形不同的车形状相近也不说明照片匹配；细轮廓适配时保留示意说明，不拉扯实体车去假装相同。

## 数学的屏幕交接是同一类问题

物理屏幕的四个发光角、DOM 的四角和相机投影共享一份锚点。倾斜时需单应性；完全正视时可矩形缩放。入场先沿屏幕法向收敛，不从上方翻折；退出按反向状态继续，角色/椅子不重置。详见 [相机](camera-and-composition.md)。

## 合成流程的可移植性

新实现以 linear render targets 计算，再在唯一输出步骤 tone map/转 sRGB；保持 premultiplied-alpha 一致。不能在一个 pass 已做显示转换，下一 pass 再转一次。天空颜色变、画面忽暗忽亮时先对比 direct 与 composite 的固定颜色块。

实验室使用 r160、NoToneMapping、普通 RGBA target 和最终 colorspace chunk 展示机制；复杂 HDR/透明/阴影产品需单独验证。原 F1 的特定内部 XR target 适配只可阅读其历史，不作为通用范例推荐。
