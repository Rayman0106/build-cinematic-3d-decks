# 预加载、预计算、启动与设备质量

## 把等待放到可解释的准备阶段

阶段进度报告工作，不是假装百分比：字体→图像解码→模型解析→字形/粒子→骨骼与路径→shader/纹理→代表页面与转场。不能把阶段计数叫下载字节，也不硬承诺剩余秒数。

加载完显示 Ready，等用户 Start。Start 同一手势发起声音解锁/全屏，await 屏幕尺寸稳定后才开时钟。不能准备好就偷偷播完第一幕。

```js
start.onclick = async () => {
  const fullscreen = stage.requestFullscreen?.(); // 手势内发起
  const audioUnlock = audioContext?.resume();
  await Promise.allSettled([fullscreen, audioUnlock]);
  resizeRendererAndOverlays();
  await nextPaint();
  clock.startAt(0);
};
```

全屏失败可以继续窗口播放并给用户明确入口，不无限等待事件。不能以预处理为由隐藏长时间黑屏。后台 tab 的 rAF 可能暂停；yield/finalize 不能永远等不可来的帧。

## 预处理什么

| 工作 | 预处理阶段 | 播放阶段 |
|---|---|---|
| 字体/图片 | fonts.load/ready，decode | 只引用已就绪资源 |
| 粒子/逐笔 | raster sampling、到达时间、目标点 | typed arrays 查表/插值 |
| 图表 | 真实坐标、弧长、对应关系 | 查询同一几何 |
| 角色 | rig mapping、clip、接触区间 | 绝对时间采样 |
| 轮胎 | 轮心/轴向、累计里程表 | angle=distance/radius |
| GPU | 代表材质、光照、阴影、RenderTarget | 复用，不首次分配 |
| 转场 | 轮廓、端点、布局/字时钟 | 不重新解析模型 |

`document.fonts.ready` 只等当前字体集；需要的 face 要显式 load。先设显示尺寸再测文字，resize/字号/换字体时按依赖失效，别每帧重建。

## GPU 预热的边界

Three.js 版本固定。配置最终 lights/environment 后 compile；有 `compileAsync` 且适合时使用，旧版走 compile。shader 变体由 skinning、alpha、灯数、阴影、材质和后处理决定；只渲染一个普通盒子不等于人物和淡出都已热好。

纹理解码≠上传；shader compile≠RenderTarget、MSAA resolve 和字形纹理已准备。必要时渲染代表机位与转场 pass，逐步 yield 避免进度条自己卡住。预热后复原场景状态，首幕不能停在最后一次测试姿势。

一次预热所有大纹理可能超过设备内存。按可见场景分批，缓存复用且 dispose 不再用的 target，不能为了“零卡顿”把内存加到崩溃。

## 发现卡顿先测什么

记录 p50/p95 frame time、超预算帧数、JS long task、draw calls、triangles、纹理/geometry 数量、first-use 事件。平均60不代表没有偶发200ms。

首先区分：编译/上传首次尖峰、JS getImageData/布局、GC、GPU fill、过多 draw call、阴影、CPU 骨骼、资源加载。再针对修改：缓存、合批、实例化、减少 target 分辨率、分段预计算。不要每次都降低所有贴图质量。

## 设备目标帧率与分辨率

可以按能力档选择目标，但能力不是单凭 UA 或“手机”判断。给 conservative 默认，通过短基准和运行 frame time 调整，允许用户覆盖。

| 示意档 | 初始目标 | 首选降级顺序 |
|---|---|---|
| 高性能桌面 | 60fps，受控 DPR/原生画布 | 后处理/阴影、远景 LOD |
| 普通笔记本 | 45或60fps，较低 renderScale | 双 pass target 和装饰数量 |
| 移动/省电 | 30fps，DPR cap | 粒子/阴影/几何，静态构图优先 |

这些不是硬承诺。实际刷新率、GPU、浏览器和散热均变化。独立设置 CSS 逻辑画布与 drawingBuffer；文字可保清晰 DOM，3D 降 renderScale。动态分辨率用迟滞和冷却，不每帧变化造成呼吸式清晰度。

目标30不是把场景时间每帧加1/30；时间仍按真实时钟采样，仅控制提交频率。固定视频60fps采用精确 frame/60 采样，避免实时录屏的掉帧变成动画跳跃。

## reduced motion 与失败

用户偏好减少动态时显示静态落点或短淡变，保留信息和手动导航。WebGL 失败、声音不可用、图片解码失败要有可解释 fallback。功能不足不能静默宣称全部通过。

实际项目：[数学 preparation.js](https://github.com/Rayman0106/reaction-time-math-3d-deck/blob/main/src/preparation.js)、[runtime.js](https://github.com/Rayman0106/reaction-time-math-3d-deck/blob/main/src/runtime.js)、[F1 启动进度](https://github.com/Rayman0106/f1-economics-3d-deck/blob/main/src/boot-progress.html)。
