# Reaction Time 数学案例：从实验现场进入证据

[公开项目](https://github.com/Rayman0106/reaction-time-math-3d-deck) · [场景图/GIF](https://github.com/Rayman0106/reaction-time-math-3d-deck#scene-gallery) · [正式成品](https://github.com/Rayman0106/reaction-time-math-3d-deck/releases/latest)

## 故事线

角色在电脑前经历反应测试→提出问题→介绍方法→镜头进入真实屏幕→比较分布/累计/箱线图→区分 pooled 与 paired→检验剔除的敏感性→反思局限→退出屏幕返回角色→结束。

贯穿元素不是“每页都有人摇摆”，而是实验者的注意力、电脑屏幕和同一组证据。角色提供行为与情绪，数据页面让人停下来阅读。15 个主页面与附录是项目选择，不是 skill 页数要求。

## 代码导航

| 文件 | 学什么 |
|---|---|
| [content.js](https://github.com/Rayman0106/reaction-time-math-3d-deck/blob/main/src/content.js) | 内容、叙事边界和逐页信息 |
| [camera.js](https://github.com/Rayman0106/reaction-time-math-3d-deck/blob/main/src/camera.js) | 上页镜头连续到下一页，不每页重置宽景 |
| [screen-transition.js](https://github.com/Rayman0106/reaction-time-math-3d-deck/blob/main/src/screen-transition.js) | 实体 monitor 与二维内容投影交接 |
| [character.js](https://github.com/Rayman0106/reaction-time-math-3d-deck/blob/main/src/character.js) | 骨骼/接触/服装适配 |
| [rig-motion.js](https://github.com/Rayman0106/reaction-time-math-3d-deck/blob/main/src/rig-motion.js) | 动作片段与程序接触层结合，绝对时间取样 |
| [letter-ink.js](https://github.com/Rayman0106/reaction-time-math-3d-deck/blob/main/src/letter-ink.js) | 每字笔画方向、全像素到达表和真实笔尖 |
| [type-choreography.js](https://github.com/Rayman0106/reaction-time-math-3d-deck/blob/main/src/type-choreography.js) | 从图形/文字真实锚点出发的字效 |
| [typography.js](https://github.com/Rayman0106/reaction-time-math-3d-deck/blob/main/src/typography.js) | 粒子和原生文本交接 |
| [analysis-transitions.js](https://github.com/Rayman0106/reaction-time-math-3d-deck/blob/main/src/analysis-transitions.js) | 图表身份、沿线回收和慢速实体交接 |
| [preparation.js](https://github.com/Rayman0106/reaction-time-math-3d-deck/blob/main/src/preparation.js) | 阶段进度与手动 Start |
| [build.py](https://github.com/Rayman0106/reaction-time-math-3d-deck/blob/main/build.py) | 单文件内嵌依赖、模型、字体、正式导航 |

## 具体教训

- **动作**：人物要精致风格化，但换模型之后必须重校手掌、前臂、脚底和衣物。67 双手交替被接受，前置抽手仍曾穿身；不能只验循环。
- **鞠躬**：头颈随身，脚底稳定，椅子先让路。最后一脚扭回往往是片段和约束切换，而不是少加一个 ease。
- **字效**：第9页的 slowed down 粒子被认可，修改别页时不能顺便替换。粒子同时来自左右两个相关图形，后续页风格可呼应但来源各有语义。
- **逐笔**：从左到右擦出不等于按笔画。只画轮廓最后补满会露角；预计算每个真实 glyph 像素到达时间，笔尖共用曲线。
- **图表**：曲线必须对齐原图实际绘图区，收线点沿原曲线反向，拼成箱线图后留保持/缓慢实体交接。
- **字幕**：cluster/pooled 开始即出现属于初始状态错误；开发提示不能在10→11、11→12突然当字幕出现。
- **开场 UI**：用户要美化循环，不能理解为直接删除；圆形版本被否定就回滚，不以个人审美覆盖已确认版本。
- **启动**：完整预处理→用户 Start→全屏尺寸稳定→播放。比播放中反复做字形采样有效。

## 内容和许可边界

研究是30名参与者的报告，不能从图像重建不存在的完整试次数据。角色和房间是叙事示意，不是实际实验照片；opening 示例反应值不当观测数据。统计解释必须区分 pooled/paired，敏感性计算标近似，无原始数据不追加未经支持的显著性结论。

公开源码包含允许再分发的 CC0 动作；可选 Mixamo《江南 Style》原始动作不公开，公开重建默认采用 CC0 鞠躬，正式课堂成品保留其融入演示的舞蹈。不要把两个分发范围混为一谈。详见 [THIRD_PARTY_NOTICES](https://github.com/Rayman0106/reaction-time-math-3d-deck/blob/main/THIRD_PARTY_NOTICES.md)。

README 中人物 GIF 是历史开发录制，不保证代表当前所有字效；slideshow 也已明确标记。使用此例时保留这些证据边界。
