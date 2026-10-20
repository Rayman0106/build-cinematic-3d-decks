# F1 案例：可复用经验与项目限定

[公开项目](https://github.com/Rayman0106/f1-economics-3d-deck) · [动画/GIF](https://github.com/Rayman0106/f1-economics-3d-deck#see-it-in-action) · [正式成品](https://github.com/Rayman0106/f1-economics-3d-deck/releases/latest)

来源：用户认可的 P42 视觉终版及 2026-10-14 后续音效修订。这个案例是浏览器 HTML／WebGL 演示，并不是一个原生 PPTX。当前 skill 只打包方法、原创数学工具与参考，不包含赛车模型、照片、字体、Logo、音轨、私人聊天或庞大的正式 HTML。

## 八页叙事关系

| 页 | 讲解关系与最终方案 |
|---|---|
| 1 | 22 辆／11 车队起步建立规模，聚焦红牛；封面保留大尺寸主体 |
| 2 | 迈凯伦超车、过弯到照片位置，慢放到稳定投影，再进入轮廓与照片 |
| 3 | 赛车在同一地点生成离散成本柱，最后进入横向二维预算表达 |
| 4 | 从预算图形连续转向预算上限与规则 |
| 5 | 基线、完整前翼／尾翼取出、修订、回装、测试，表现迭代升级 |
| 6 | 吸尾流、变线、刹车与交叉线等可读竞争；最后落在稳定主体构图 |
| 7 | 蒙扎发车区按车队逐行检阅，两车错位一前一后；凯迪拉克最后进入，再成为照片轮廓 |
| 8 | 从凯迪拉克、Alpine、小红牛、哈斯转到迈凯伦、法拉利、梅奔、红牛；收紧到不规则、方向不同且无穿模的四车构图 |

前几版曾尝试迈凯伦打滑，最终用户明确删除。不要从历史中把甩尾重新当成终版要求。页数最初上限曾是十页，最终收为八页；新项目不继承这一页数。

## 这个项目特有的决定

- 所有赛车世界场景保持蒙扎空间识别；静态讲解页退出赛道背景，只保留需要的车辆与内容。连续地点不要求每幕都有全部后车。
- 主字体 Inter，配 CJK 回退；每页标题效果可不同。车队检阅例外，字标用各自字体和 Logo，选 D 光带扫过。
- 字体库例子：红牛／迈凯伦／Alpine 用 Barlow Condensed Bold Italic，法拉利用 Bodoni，梅奔／Audi 用 Space Grotesk，Racing Bulls 用 Sora；这是视觉选型，不是声称官方品牌字体。
- 普通页白色衬托删除；检阅的黑色面板贴左上角并给上下空间。
- 开场镜头先从队尾到队首，随后机位固定、转动跟拍并改变焦距；迈凯伦前排起步，红牛及其它车在观众可见处展开超车；首幕端点是红牛侧面。
- 加载有阶段进度，加载完成等 Start；点击后请求全屏、等尺寸稳定再播放。正式版移除左下方编辑／重播整排按钮，保留导航和已有键盘流程。
- 后续声音为纯代码合成；每车独立声源，直道不追档，真实制动降档更响更快，慢放进 PPT 只淡出，不降转速／音调。

这些决定只在接管该 F1 工程时作为基准。别的题材、品牌、交付平台和使用环境按用户目标选择。

## 关键失败变成的方法

| 项目反馈 | 可复用经验 |
|---|---|
| 动画快、角度绕太大、车出画 | 先设计屏幕端点和可读运动，用相对运动与固定参照 |
| 轮廓框不住照片 | 匹配真实透视、照片裁切、结构关键点和边界对应 |
| 轮廓恢复实体中间一跳 | 首帧继承上一页冻结投影，恢复实体后再开始运动 |
| 预算柱被看台／其它车挡住 | 数据也是主体，检查相机—数据之间的视廊 |
| 只拆出涂装、翼片没取全 | 不相信节点名称，检查实际连通几何与挂点 |
| 赛道淡出时车透明／天空变色 | 保留主体材质与深度，以一致颜色管理合成整个世界 |
| 看台灰色闪烁 | 区分共面争夺、阴影与 alpha 采样，不用静帧蒙混过关 |
| 多车结尾穿模 | 世界碰撞与屏幕可见面积一起验证，方向可以不同 |
| 字体好看但不可读／首帧闪 | 加载完成后按统一时钟初始化字效和字幕，最终回原生文字 |
| 换挡鬼畜、慢放音调降低 | 驾驶状态独立于视觉时钟，真实制动和纯视觉慢放分开 |

## 原工程中的索引

这些是原 F1 工程路径，不是 skill 的运行依赖：

| 文件 | 可检查的实现 |
|---|---|
| src/story-scenes.js | 绝对时间场景、冻结点、相机、检阅与结尾 |
| src/deck.js | DOM／照片／SVG 配准、阅读状态、Start 流程 |
| src/typography.js / typography.css | 字形动效、文字时钟、对比色、Logo |
| src/world-dissolve.js | 主体保留、整幅世界淡出、离屏颜色适配 |
| src/environment-v10.js | 看台实体、共面偏置、alpha 边缘、远侧场景 |
| src/cinematic-engine.js | 完整部件、关节、轮胎里程、遮挡视廊 |
| src/engine-synth.js / powertrain.js / sound.js | 纯代码声音、独立声源、快速降档及纯淡出 |
| tools/build.py / check.py / export.py | 可重建输出、模型／嵌入资源校验与打包 |

## 证据边界

早期“像素级贴合”“无卡顿”等结论只依据拼图和脚本，后来被用户否定，应视为未验证。几何端点、字效库映射、包的哈希一致性可以检查，正常速度的自然感不能从这些检查推导。

后续声音检查包含生成 PCM、控制器回放、转场中 RPM／负载／多普勒保持及静音端点；没有实际听音输入，也没有在最后两轮直接用桌面 Edge 播放核验。原生工具曾因无法确认浏览器 URL 停止，不应把兼容分支代码测试写成桌面实际播放通过。

原生视频导出的 2400×1350、60 fps、四分钟是当时环境与交付要求，不是默认模板。没有默认给每次更改录完整视频。被批准的清理和外部咨询授权只属于那次会话，不可作为 skill 的永久权限。

## 公开代码入口

- [story-scenes.js](https://github.com/Rayman0106/f1-economics-3d-deck/blob/main/src/story-scenes.js)
- [deck.js](https://github.com/Rayman0106/f1-economics-3d-deck/blob/main/src/deck.js)
- [opening-grid.js](https://github.com/Rayman0106/f1-economics-3d-deck/blob/main/src/opening-grid.js)
- [complete-rear-wing.js](https://github.com/Rayman0106/f1-economics-3d-deck/blob/main/src/complete-rear-wing.js)
- [world-dissolve.js](https://github.com/Rayman0106/f1-economics-3d-deck/blob/main/src/world-dissolve.js)
- [environment-v10.js](https://github.com/Rayman0106/f1-economics-3d-deck/blob/main/src/environment-v10.js)
- [cinematic-engine.js](https://github.com/Rayman0106/f1-economics-3d-deck/blob/main/src/cinematic-engine.js)
- [finish-stage.js](https://github.com/Rayman0106/f1-economics-3d-deck/blob/main/src/finish-stage.js)
- [start-gantry.js](https://github.com/Rayman0106/f1-economics-3d-deck/blob/main/src/start-gantry.js)
- [typography.js](https://github.com/Rayman0106/f1-economics-3d-deck/blob/main/src/typography.js)
- [engine-synth.js](https://github.com/Rayman0106/f1-economics-3d-deck/blob/main/src/engine-synth.js)
- [powertrain.js](https://github.com/Rayman0106/f1-economics-3d-deck/blob/main/src/powertrain.js)
- [sound.js](https://github.com/Rayman0106/f1-economics-3d-deck/blob/main/src/sound.js)
