# Cinematic 3D Decks · 让 AI 制作有故事线的三维演示

**给 AI 一份报告、一个主题或已有工程，用这个 Skill 把它发展成「2D 讲解页 + 连续 3D 动画」的网页演示。**

它指导 AI 从内容提炼和故事线开始，寻找与处理模型，设计相机、转场、文字和图表之间的互动，最后交付能在浏览器播放的演示、可修改源码与构建说明。适合课堂汇报、研究展示和产品原理讲解，也适合接管已有项目，修复跳位、穿模、闪烁、字效无意义和加载卡顿。

例如：维修成本在赛车旁累积，再转成预算图；人物查看电脑后，镜头进入屏幕，图上的数据点组成结论标题。**模型、图表和文字在前后页之间保留关系，让观众知道“为什么下一页会这样出现”。**

English: a Codex skill that helps an AI turn reports, ideas or existing code into narrative browser presentations, combining readable 2D slides with continuous 3D scenes, meaningful text/chart animation and reproducible offline delivery.

## 装上以后，AI 可以帮你做什么？

| 你提出的任务 | Skill 指导 AI 完成的工作 | 你能看到或拿到的结果 |
|---|---|---|
| “把这份报告做成演示” | 提炼问题、证据与结论，选择贯穿对象，规划各页之间的因果 | 故事线、逐页分镜和完整演示 |
| “找合适的模型，做得精细些” | 按动作需求筛模型，记录许可，检查材质、骨骼、轮胎和部件 | 可用于该镜头的资产、适配代码与来源清单 |
| “让 3D 动画自然进入 PPT 内容” | 统一对象位置、相机和时间，让实体、轮廓、照片或屏幕内容连续交接 | 同一位置与投影连续交接的 2D/3D 转场 |
| “字体要有亮点，还要和内容互动” | 让粒子来自真实图形，让笔尖沿每个字母笔画书写，让点线逐渐变成图表 | 有来源、能解释内容的字效和图表动画 |
| “人物动作别像机器人” | 使用合适动作模板，适配骨架，检查肩肘腕、足底、衣物与道具接触 | 有关节联动的动作，以及穿模/脚滑的修复方案 |
| “接管这个工程，解决卡顿与交付” | 排查闪烁和端点跳变，预计算字形/路径，准备 GPU，整理构建与资源 | 加载进度、手动 Start、离线 HTML 和可重建工程 |

它把两个项目中的方法、代码机制和修复经验提供给执行任务的 AI。实际下载模型、运行 3D 和查看画面，仍需该 AI 所在环境具备相应工具；素材是否能使用、公开，按各自许可判断。

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
