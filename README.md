# Cinematic 3D Decks · 让 AI 制作有故事线的三维演示

**给 AI 一份报告、一个主题或已有工程，用这个 Skill 把它发展成「2D 讲解页 + 连续 3D 动画」的网页演示。**

它指导 AI 从内容提炼和故事线开始，寻找与处理模型，设计相机、转场、文字和图表之间的互动，最后交付能在浏览器播放的演示、可修改源码与构建说明。适合课堂汇报、研究展示和产品原理讲解，也适合接管已有项目，修复跳位、穿模、闪烁、字效无意义和加载卡顿。

例如：维修成本在赛车旁累积，再转成预算图；人物查看电脑后，镜头进入屏幕，图上的数据点组成结论标题。**模型、图表和文字在前后页之间保留关系，让观众知道“为什么下一页会这样出现”。**

English: a Codex skill that helps an AI turn reports, ideas or existing code into narrative browser presentations, combining readable 2D slides with continuous 3D scenes, meaningful text/chart animation and reproducible offline delivery.

## 装上以后，AI 可以帮你做什么？

它把两个完整项目的设计方法、实现代码和修复经验交给执行任务的 AI，覆盖从内容策划到可重建工程的九类具体工作。

### 1. 从内容设计整份演示

给 AI 一份报告或一个主题，它可以据此提炼观众需要理解的问题、证据和结论，安排每页讲什么、为什么进入下一页，并选择贯穿整份演示的对象。

例如，F1 中同一辆车从竞赛者变成维修与研发对象；数学项目从人物操作电脑，进入屏幕中的数据，再回到人物反思。每页先有可阅读的稳定构图，动画把上一页的判断带到下一页。

**具体产出**：故事线、逐页分镜、每页的核心判断、静态构图、相邻页面的动作与交接状态。[设计方法](references/design-and-story.md)

### 2. 寻找并处理适合动画的 3D 模型

按实际动作和镜头需求寻找素材，核对作者、来源与许可，检查下载文件是否真的包含需要的部件、骨骼、动画和纹理。再处理模型尺寸、坐标轴、轮心、部件挂点、材质与共享资源。

例如，拆尾翼时确认整个实体组件都被取出，回装恢复原始位置；人物要完成操作电脑、坐姿与起立，就先检查手臂、手掌、腿部和衣物结构。网页宣传的表情、骨骼或动画，以实际下载包为准。

**具体产出**：资产选型、模型结构检查、适配代码、轮心/挂点标定、来源许可清单。[模型流程](references/model-pipeline.md)

### 3. 设计镜头和物体运动

根据观众需要看清的关系，选择固定机位、转动跟拍、推进、变焦或环绕，安排加速、减速与停留。检查物体在三维空间是否穿模，也检查最终画面是否被树木、看台或其它主体挡住。

例如，发车后让机位保持不动，通过转动与焦距跟随头车；展示多辆车时控制相对速度，让观众认得清；进入电脑屏幕时沿屏幕方向平滑推进，保留前后镜头的空间关系。

**具体产出**：相机路径、对象轨迹、节奏分段、主体投影与文字安全区、遮挡检查。[相机与构图](references/camera-and-composition.md)

### 4. 实现 3D、轮廓、照片与 2D 页面的连续交接

让模型在同一位置变成轮廓，轮廓按实际裁切和关键结构贴合照片，再从相同投影恢复实体；也可以让三维场景退去，留下主体与二维讲解内容，或让实体电脑屏幕接入二维图表页。

这里同时处理对象位置、相机、投影、页面坐标和时间。修复的典型问题包括中间跳位、停顿、白轮廓闪现、主体突然消失、车身透明，以及背景天空忽然变色。

**具体产出**：配准锚点、轮廓对应、前后页端点合同、背景合成与表示切换代码。[转场与配准](references/transitions-and-registration.md)

### 5. 让字体动画解释内容

让粒子从左右两组实际图形或数据点同时出发，组成结论标题；让每个字母按照笔画逐渐填充，笔尖沿同一条路径移动；也可以从正文里的对应字母抽取副本，重新组成关键词。

同时统一字体与字号层级，处理明暗对比、字距和原生文字交接。避免来源不明的光点、开始就露出的关键词，以及最后一帧才突然补满的字形。品牌页可按明确需求使用不同字标与 Logo。

**具体产出**：按语义选择的字效、真实来源锚点、字形采样/笔顺计划、可读且保留原生文本的标题。[字体动画](references/typography.md)

### 6. 让图表之间有可理解的变化

让数据点移动、聚集成箱线图，保持一段时间，再缓慢变成实体线条；让线条沿原路径反向收回成点；在不同比较视图之间保留参与者身份、组别和颜色。

动画读取实际图表坐标，并保留报告的数据边界。例如，数学项目能区分总体汇总与个体配对，展示剔除敏感性；没有完整原始数据时，示意采样点不会被当成真实观测，也不会凭动画补造统计结果。

**具体产出**：共享的图表几何、元素 ID/组别映射、点线变换与慢速实体交接、与报告一致的最终图表。[图表编舞](references/chart-choreography.md)

### 7. 处理角色与机械动作的联动

人物方面，选择适合的动作模板并适配骨架，处理肩、肘、腕、手掌与足底接触，检查衣物、桌面、椅子等实际碰撞关系。车辆方面，分离轮胎滚动与转向，处理完整部件的拆装、强调、回位和迭代展示。

例如，67 手势中手腕随小臂变化，进入动作前抽手避开躯干；站起先让椅子让路，鞠躬时头颈随躯干移动；最后一脚扭回时检查动作片段、根节点和接触约束的交接。复杂舞蹈优先寻找已授权模板并重定向。

**具体产出**：动作选型与骨架映射、动作阶段、关节/接触修正、部件装配状态，以及针对穿模、脚滑和错位的修复。[人物动作](references/character-animation.md) · [车辆与部件](references/scene-quality.md)

### 8. 设计声音、预处理与启动流程

声音可以按车辆建立独立声源，组织换挡、音量、空间位置和多普勒变化；区分真实制动与演示慢放，让衔接二维页面的慢放只淡出声音，保留进入慢放时的发动机参数。

性能方面，把字形采样、路径计算、模型解析和 GPU 准备尽量放到开始之前，显示真实阶段进度，等待用户按 Start 后再播放。根据设备能力调整渲染分辨率、装饰数量与目标帧率，并保留文字清晰度。

**具体产出**：声音控制与混音方案、预计算缓存、加载进度、手动启动/全屏流程、质量档位和性能排查记录。[声音](references/audio.md) · [性能与启动](references/performance-and-startup.md)

### 9. 接管、验证并交付可继续开发的工程

保留用户已经认可的部分，定位指定片段的问题，利用模型检查、端点连续性和确定性采样工具辅助验证。把“构建通过”“几何正确”和“实际播放自然”分开记录，明确哪些画面或设备还未实测。

最终整理离线 HTML、可修改源码、构建入口、素材来源与许可。需要时按授权打包、公开到 GitHub，并区分源码、正式成品、预览和历史记录，让后续开发者可以接手。

**具体产出**：问题原因与修改、验证证据、可运行演示、可重建工程、资产清单和交付说明。[验证](references/verification.md) · [构建与交付](references/delivery.md)

以上能力通过方法、可复用代码、检查工具和项目参照提供给 AI。实际制作需要当前环境能操作文件、运行代码、获取素材并查看画面；素材使用遵守各自许可，复杂动作与最终观感通过实际播放确认。

## 它如何让整份演示成为一个故事？

先确定观众最终要理解的问题，再选择一个会随着解释改变状态的对象。每页先有可阅读的稳定构图，动画负责把上一个判断带到下一个判断。

**F1：一场竞争，为什么会变成经济问题？**

发车建立竞争 → 赛车事件引出维修成本 → 成本进入预算约束 → 有限预算迫使研发取舍 → 升级影响竞争 → 新车队进入 → 回到竞争格局的结论。同一辆车先是竞赛者，再是维修对象、研发对象和比较对象。

**反应时间：一个直觉，如何接受数据检验？**

人物做反应测试 → 提出背景对话是否影响反应的问题 → 交代方法 → 镜头进入电脑中的证据 → 比较分布与配对结果 → 检查异常值处理是否改变结论 → 说明局限 → 回到人物与最后判断。图表和标题从同一组证据继续变化。

新题材按自己的问题组织。例如电池回收可以用“整电池 → 拆解材料 → 材料流图 → 回收方案比较 → 回到下一代产品”。本 Skill 的可复用部分是这种组织方法，题材和镜头由当前内容决定。

## 你提供什么，会得到什么？

**提供**：主题或报告、受众、预计时长、必须保留的内容；有现成模型或工程时一起给出。没有模型时，可让 AI 先提出选材方案并在授权范围内寻找。

**得到**：故事线与分镜、可读的页面、相邻页面的动画、模型与文字的适配、能运行的 HTML/WebGL 演示，以及源码、构建入口、素材来源和验证记录。已有项目可以只修改指定部分。

适合的最终格式是**浏览器演示**。如果需要原生可编辑 PPTX，应先明确这一交付要求，再选择相应实现方式。复杂动作和照片贴合仍需实际检查，不能靠安装 Skill 就保证观感。

## 可以直接给 AI 的三个请求

```text
使用 $build-cinematic-3d-decks，把这份研究报告做成课堂演示。
先明确观众要理解的问题和结论，选择贯穿对象，给出逐页故事线；
再实现 2D 讲解与 3D 转场，交付离线 HTML 和可重建工程。
```

```text
使用 $build-cinematic-3d-decks 接管这个项目。
只修复轮廓恢复实体时的跳位和进入屏幕时的相机停顿，
说明原因并验证前后页衔接，保留已经认可的其它镜头。
```

```text
使用 $build-cinematic-3d-decks，为这张统计图设计标题动画。
粒子同时来自左右两组实际数据点，形成结论词后交给完整文字；
让观众看得清来源与关系，保留原生可编辑文本。
```

## 两个完整案例

| F1 Economics | Reaction Time · Mathematics |
|---|---|
| [![F1 presentation cover](https://raw.githubusercontent.com/Rayman0106/f1-economics-3d-deck/main/docs/media/cover.jpg)](https://github.com/Rayman0106/f1-economics-3d-deck#see-it-in-action) | [![Reaction Time study room](https://raw.githubusercontent.com/Rayman0106/reaction-time-math-3d-deck/main/docs/media/study-room.jpg)](https://github.com/Rayman0106/reaction-time-math-3d-deck#scene-gallery) |
| 赛车、成本、预算约束、研发和竞争形成主线；赛道退去后进入纯 2D 阅读。 | 实验者、电脑屏幕、图表证据、反思和结尾形成主线；字体从内容中产生。 |

上图是链接到案例的项目预览，不随 Skill 再分发其模型或原始动作。案例媒体来源、许可和版本边界见各项目说明。

## 安装与使用

AI 入口：[SKILL.md](SKILL.md)。按任务只读相关参考，不需要一次加载全部。

下载 [Release 中的 Skill ZIP](https://github.com/Rayman0106/build-cinematic-3d-decks/releases/latest)，解压为：

```text
~/.codex/skills/build-cinematic-3d-decks/SKILL.md
```

Windows 对应用户目录下的 `.codex/skills/`。若已有同名 Skill，先备份再更新；不要嵌套成两层同名目录。也可以克隆到该目录，已有目录不能直接覆盖。

```sh
git clone https://github.com/Rayman0106/build-cinematic-3d-decks.git ~/.codex/skills/build-cinematic-3d-decks
```

重启或新开会话以重新发现 Skill，使用上面的请求即可。先从一个关键转场做起，也可以直接接管已有工程。

## 可运行的实例

下载 [examples/playground.html](examples/playground.html) 的原始文件，用桌面 Edge/Chrome 打开；Release ZIP 也包含。准备后按 Start，选择场景、播放或拖动时间。无需模型下载、npm 或本地服务器。

1. **3D → 轮廓**：保持主体投影，背景退去，实体交接给同投影线框表示。
2. **进入屏幕**：沿屏幕法向推进，同一组四角把内容接到 DOM。
3. **双来源粒子**：两个数据群同时参与标题形成，来源可辨。
4. **逐笔书写**：每个字母的笔画分配像素到达时间，末端无补字跳帧。
5. **图表交接**：点沿箱线图就位，再缓慢交接到同坐标实体线。
6. **关节联动**：上臂、小臂、手腕同一链，脚底固定，鞠躬带动头部。

这些是新写的最小机制示例，不是重新录制的正式项目。实验室线框不是照片轮廓提取器，程序关节也不是完整人体重定向器；完整方案与边界见参考。

## 内容索引

| 主题 | 文档 |
|---|---|
| 故事线、逐页信息和结尾 | [设计与叙事](references/design-and-story.md) |
| Sketchfab、GLB、拆件和许可 | [模型流程](references/model-pipeline.md) |
| 确定性时钟、缓动和恢复 | [动画系统](references/animation-system.md) |
| 跟拍、固定镜头与群组布局 | [相机与构图](references/camera-and-composition.md) |
| 轮廓、照片、投影与背景合成 | [转场与配准](references/transitions-and-registration.md) |
| 角色、IK、脚底与动作模板 | [人物动画](references/character-animation.md) |
| 字与内容互动、逐笔和粒子 | [字体动画](references/typography.md) |
| 数据、箱线图与反向收线 | [图表编舞](references/chart-choreography.md) |
| 闪烁、材质、轮胎和遮挡 | [场景质量](references/scene-quality.md) |
| 声源、换挡、慢放与多普勒 | [声音](references/audio.md) |
| 预计算、启动和设备质量 | [性能](references/performance-and-startup.md) |
| 离线 HTML、清理与发布 | [交付](references/delivery.md) |
| 验证与故障复现 | [验证](references/verification.md) |
| 项目代码导航与经验出处 | [F1](references/f1-case-study.md) · [数学](references/reaction-time-case-study.md) |
| 官方资料与参考项目 | [来源](references/sources.md) |
| 从请求到实现的六个分解示范 | [完整工作示范](references/worked-recipes.md) |

## 重建与检查

Python 3.10+、Node.js 18+，脚本只用标准库。实验室固定使用随包 **Three.js r160**，保留 MIT 许可。只有运行对应工具时才需要 Python/Node。

```sh
python scripts/build_examples.py
python scripts/validate_package.py
python scripts/validate_storyboard.py examples/storyboard.json
node scripts/test-kernel.mjs
node scripts/test-motion.mjs
python scripts/inspect_glb.py path/to/model.glb --out model-report.json
python scripts/check-continuity.py examples/fixtures/handoffs.json
```

数值测试不等于画面自然。[验证记录](VALIDATION.md) 明确哪些执行过、哪些还需正常速度播放确认。

## 文件与许可

`SKILL.md` 是短入口，`references/` 按需详解，`assets/` 可复用机制，`scripts/` 工具，`examples/` 实例，`vendor/` 只含固定版 Three.js 与许可。

原创说明与代码使用 [MIT](LICENSE)。第三方库见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。两个案例的照片、赛车、人模、字体和动作不因被链接而获得 MIT 授权。本仓库不打包 Blender 工程、FBX 或 Mixamo 原始动作。
