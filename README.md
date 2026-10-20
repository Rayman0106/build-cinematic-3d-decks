# Cinematic 3D Decks · Skill

**让三维对象、二维阅读页和文字动画讲同一件事。**

这是一份可安装的 Codex Skill，也是带源码、检查工具和离线实验室的设计手册。以两个实际完成的项目为案例，整理模型、故事线、镜头、轮廓配准、人物关节、语义字效、图表变换、声音、预加载、构建和公开交付。

English: an installable skill for narrative HTML/WebGL presentations, with Chinese implementation references, reusable JavaScript/Python tools and an offline interactive lab. It connects readable 2D slides to continuous 3D scenes rather than treating transitions as unrelated effects.

## 两个完整案例

| F1 Economics | Reaction Time · Mathematics |
|---|---|
| [![F1 presentation cover](https://raw.githubusercontent.com/Rayman0106/f1-economics-3d-deck/main/docs/media/cover.jpg)](https://github.com/Rayman0106/f1-economics-3d-deck#see-it-in-action) | [![Reaction Time study room](https://raw.githubusercontent.com/Rayman0106/reaction-time-math-3d-deck/main/docs/media/study-room.jpg)](https://github.com/Rayman0106/reaction-time-math-3d-deck#scene-gallery) |
| 赛车、成本、预算约束、研发和竞争形成主线；赛道退去后进入纯 2D 阅读。 | 实验者、电脑屏幕、图表证据、反思和结尾形成主线；字体从内容中产生。 |

上图是链接到案例的项目预览，不随 Skill 再分发其模型或原始动作。案例媒体来源、许可和版本边界见各项目说明。

## 开始使用

AI 入口：[SKILL.md](SKILL.md)。按任务只读相关参考，不需要一次加载全部。

下载 [Release 中的 Skill ZIP](https://github.com/Rayman0106/build-cinematic-3d-decks/releases/latest)，解压为：

```text
~/.codex/skills/build-cinematic-3d-decks/SKILL.md
```

Windows 对应用户目录下的 `.codex/skills/`。若已有同名 Skill，先备份再更新；不要嵌套成两层同名目录。也可以克隆到该目录，已有目录不能直接覆盖。

```sh
git clone https://github.com/Rayman0106/build-cinematic-3d-decks.git ~/.codex/skills/build-cinematic-3d-decks
```

重启或新开会话以重新发现 Skill，然后使用：

```text
使用 $build-cinematic-3d-decks，设计一份关于……的 HTML 演示。
先列故事线、贯穿对象、每页阅读落点和相邻转场，再实现。
```

```text
使用 $build-cinematic-3d-decks 接管这个工程。
只修复轮廓恢复实体时的跳位；保留已认可的其它镜头。
```

```text
使用 $build-cinematic-3d-decks，给这张统计图设计能解释内容的标题动画。
粒子从真实数据点出发，最终交接到可编辑文字。
```

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
