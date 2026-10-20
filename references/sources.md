# 官方资料、参考项目与版本边界

以下是继续深入时可用的原始资料。网页/API 会变化，新工程核对固定依赖版本。实验室为兼容两例离线构建，固定使用 Three.js **r160**，不宣称最新版；新项目可以选择适合的新版本并验证迁移。

| 来源 | 用途 | 范围 |
|---|---|---|
| [Three.js glTF loading](https://threejs.org/manual/pages/loading-3d-models.html) | 模型加载与依赖 | 不授予模型许可 |
| [Three.js color management](https://threejs.org/manual/pages/color-management.html) | 输入/工作/输出色彩，后处理 | 不把 renderer 内部开关当公共 API |
| [WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html) | compile/compileAsync、target、统计 | API 以目标版本为准 |
| [AnimationMixer](https://threejs.org/docs/pages/AnimationMixer.html) | 动作绝对时间/片段 | setTime 不解决所有自定义接触状态 |
| [SkeletonUtils](https://threejs.org/docs/pages/module-SkeletonUtils.html) | 蒙皮克隆和重定向 | bone mapping/rest pose 仍需适配 |
| [Three.js r160 源码](https://github.com/mrdoob/three.js/tree/r160) | 实验室固定版，MIT | vendor 保留 LICENSE |
| [glTF 2.0 规范](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html) | GLB、accessor、skin、材质 | inspect_glb 只做有边界的结构检查 |
| [SVG2 paths](https://www.w3.org/TR/SVG2/paths.html) | 曲线路径/长度 | 图形轮廓不是自动手写笔顺 |
| [SVG2 painting](https://www.w3.org/TR/SVG2/painting.html) | stroke-dash、cap/join | dashoffset 不等于字形完整填色 |
| [Vivus](https://github.com/maxwellito/vivus) | 路径书写思想与时序 | 本 Skill 不打包其代码；采用时核对许可 |
| [GSAP](https://github.com/greensock/GSAP) | 时间线/缓动可参考 | 自有许可随版本核对，不自动 MIT |
| [Motion](https://github.com/motiondivision/motion) | DOM/SVG/时间线参考 | 只在确需依赖时引入 |
| [Mesh2Motion](https://github.com/mesh2motion/mesh2motion-app) | 骨骼和动作流程 | 工具与动作资产许可分开 |
| [Adobe Mixamo FAQ](https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html) | 项目使用说明 | 不当作可公开原始动作库 |
| [Adobe Mixamo 许可补充](https://community.adobe.com/questions-696/mixamo-faq-licensing-royalties-ownership-eula-and-tos-589400?lang=en) | 原始素材再分发边界 | 有新分发用途需重新核实 |
| [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | 署名、来源、修改说明 | 每份资产以实际许可为准 |
| [Web Audio 规范](https://www.w3.org/TR/webaudio/) | AudioParam、声源和处理 | Doppler 和 engine 仍需自定义设计 |

两例的媒体、模型来源、字体和声音引用以其仓库 notices 为准。此文件是导航，不是替它们统一改许可，也不保证第三方平台始终有同一免费资产。
