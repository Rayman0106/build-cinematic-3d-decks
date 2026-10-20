# 时间、状态、缓动与恢复

## 最小架构

```text
prepare → ready → user Start → playing episode → reading
                                ↑                ↓
                          replay/prev/next/seek
```

准备不推进叙事时间。静态阅读可持续任意长；页内动作完不代表自动翻页。显式维护 pageId、transitionId、time、contentBornAt，不从 CSS 类反推阶段。

`sample(id, seconds)` 是纯函数或等价确定接口。相同时间返回相同状态；渲染只应用状态，不累加旋转、不重抽随机数。复杂模拟用固定步长预计算，再按时间插值。

```js
const pose = sampleEpisode('budget-reveal', seconds);
applyActors(pose.actors);
applyCamera(pose.camera);
applyWorld(pose.world);
applyType(pose.type, seconds - pose.type.bornAt);
applyAudio(pose.audio); // 实际驾驶阶段，不是所有视觉变速
```

## 缓动选择

| 关系 | 方式 | 误用 |
|---|---|---|
| 从静止开始并落定 | minimum-jerk/quintic | 每个细小子段都停一次 |
| 连续行驶/镜头 | 共享曲线或 Hermite 匹配速度 | 每段 lerp 后归零速度 |
| 快触发慢恢复 | 不对称阶段 | 对称摇摆像普通转向 |
| 慢→快→慢爬头 | 非负速度积分成位移 | 给位置加振荡导致倒退 |
| 关节跟随 | 上游带下游，短时滞后 | 每根骨头同相，或锁死手腕 |
| 书写 | 长度/曲率/抬笔距离决定节奏 | 每字每笔固定同一时长 |

`assets/animation-core.mjs` 提供解析速度积分及秒单位 Hermite。slowFastSlow 端点速度可以非零，下一段要承接，不当成静止。

## 前后页端点

```text
上页静态末状态 A = 转场 t=0
转场 t=end      B = 下页静态首状态
```

包含 root、部件、轮相、关节/clip time、camera position/target/up/FOV/主点、viewport、背景/曝光、轮廓/照片权重、DOM 矩阵、文字时钟和声音阶段。

世界相同但屏幕跳位，继续查 stage CSS、crop、投影矩阵、DPR、字体。只打印车位置不够。测试直接入页、前页进入、跳末页返回、重播、反向相邻页、播放中 resize。

恢复函数撤销临时材质、visibility、样式、clip、相机偏置与粒子。屏内 visible 一帧开关常被读成消失。新角色通过自然入画、遮挡揭露或同位轮廓恢复出现。别用不同克隆拼接却漏同步阴影。

## 审完整动作链

67 循环自然，进入前手从鼠标到腿上却线性冲过身体，仍未解决。列“释放接触→外侧避障→下降→稳定→循环→退出”。关键点按身体尺度和阅读节奏安排，不靠增加关键帧。

可见性和 pose 各有一个最终状态所有者。多个系统同时修改父组、子网格和轮廓，容易闪白框或下页残留。

## 文字、声音与场景的不同时间

字效从内容真正入场算。如果相机转场三秒，标题也从点击开始写三秒，观众进入时只看到已写完的字。出生时刻是状态的一部分。

慢放衔接 PPT 不是直道制动。声音保存起始 RPM、负载与 Doppler，仅按包络淡出；真实制动才触发降档。见 [声音](audio.md)。

开发模式提供 snapshot 与 seek，输出 episode、seconds、phase、actors、camera、typeBornAt、worldAmount、chartAmount、sourceIds。正式 UI 可隐藏调试控制，源码保留检查工具；工程阶段文案不自动变正文字幕。
