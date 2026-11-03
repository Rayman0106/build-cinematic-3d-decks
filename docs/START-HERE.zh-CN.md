# 从视频到自己的第一份 3D 演示

仓库：**Rayman0106/build-cinematic-3d-decks**。这份指南帮助你选择入口、安装 Skill，并开始一个小项目。

## 只想先播放完整作品

- [F1 Economics 成品下载](https://github.com/Rayman0106/f1-economics-3d-deck/releases/latest)：选择 `F1-Economics-Final.html`，约 395 MB。
- [Reaction Time 数学成品下载](https://github.com/Rayman0106/reaction-time-math-3d-deck/releases/latest)：选择 `Reaction-Time-Final.html`，约 95 MB。

下载完成后，用桌面 Edge 或 Chrome 打开 HTML，等待准备完成，点击 Start。方向键换页。首次解析模型和预热需要时间；完整演示适合先下载再播放。作品格式为 HTML，修改需要相应项目源码，无法直接作为 PowerPoint 的 PPTX 模板编辑。

想先看效果，可以打开 [Showcase](https://rayman0106.github.io/build-cinematic-3d-decks/) 或 [真实项目 Lab](https://rayman0106.github.io/build-cinematic-3d-decks/lab/)。Lab 的初始字效不加载赛车和人物；选择相应场景后才准备模型。

## 想用 Skill 做自己的演示

1. 打开 [最新发行版](https://github.com/Rayman0106/build-cinematic-3d-decks/releases/latest)，下载名为 `build-cinematic-3d-decks-v<版本>.zip` 的文件。GitHub 自动附带的 Source code 压缩包是另一种源码下载入口。
2. 解压后，将包含 `SKILL.md` 的 `build-cinematic-3d-decks` 文件夹放入 `~/.codex/skills/`。Windows 对应 `%USERPROFILE%\.codex\skills\`。若已有同名安装，先备份后更新，避免重复嵌套文件夹。
3. 新开 Codex 对话，附上自己的报告、主题或已有项目，并明确调用 `$build-cinematic-3d-decks`。
4. 先审阅故事板和一个关键转场，再扩展整份演示。实际生成需要当前 AI 的执行环境和相应工具；ZIP 不包含模型账号、API 额度或案例完整资产库。

可以复制这段请求，并把方括号内的信息换成自己的内容：

```text
使用 $build-cinematic-3d-decks，围绕[主题]设计三页浏览器演示。
先给出每页要表达的判断、贯穿三页的同一个对象，以及两次转场的起止状态。
先实现一个可运行的关键转场：对象从图表中出现，再进入下一页的讲解。
从简单几何或我已有的授权模型开始；正文清楚可读，加载完成后由我点击 Start。
保留可修改源码、素材来源、构建说明和离线 HTML，并说明实际完成了哪些检查。
```

该请求是起步示范，不保证固定时间、成本或一次生成完整作品。先把一段动作和它要表达的意思做好，再加入复杂模型与人物。

## 想研究具体机制

下载同一 Release 附带的 `playground.html`，或打开 ZIP 中的 `examples/playground.html`。它包含六种小型机制示例，可离线运行，无需另下案例模型。其几何体用于解释机制；真实赛车、人物和房间在在线 Lab 及各自完整项目中。

源码检查从仓库根目录运行：

```sh
python scripts/build_examples.py
python scripts/build_site.py --check-source
python scripts/validate_package.py
```

完整案例生成与公开 Lab 的区别、素材范围和验证限制见 [当前状态](current-status.md)；素材保留各自的 [第三方许可](../THIRD_PARTY_NOTICES.md)。
