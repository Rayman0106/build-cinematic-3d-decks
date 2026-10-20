# 声音：驾驶、叙事、空间与淡出

## 声音状态与画面时间分开

定义真实驾驶阶段：起步、巡航、制动、出弯；另定义叙事慢放/定格。显示速度乘了 slow-motion 不代表真实 engine RPM 降低。新镜头显示车也不代表再次从一档发车。

声音采样来自驾驶状态及其历史：gear、RPM、load、brake、shift event、source position、listener pose、mix gain。静态阅读页归静；用户可以静音/调音量。

## 多车声源

每辆车独立 ID、seed、相位、档位/RPM 与位置；同队两辆也不能共享同一个全局转速。差异应小而稳定，不每帧乱抖。主角优先，远车衰减；别把主角增益机械除以 22 导致听不见。

声源管理与对象显示分开：车辆变透明不立即硬断 audio node。用短包络释放，避免 click。远处无贡献的声源可虚拟化，但连续参数保留，回来不重发车。

## 换挡节奏

升档由当前档比、车速/负载与 RPM 阈值触发，有限 shift 时间和冷却；直道巡航不会每隔固定几百毫秒换一次档。降档只在真实制动时，根据下一档预测 RPM 和目标弯速限制。连续降档可以短促，补油要可听，但不是电机扫频。

F1 的 75–87 ms 最小降档间隔是某次音效设计参数，不是全部真实比赛标准。公开遥测采样率也未必能解析如此短瞬态，不能宣称复刻遥测。

## 多普勒

先统一速度单位与方向。令 n 从听者指向声源，sourceVelocity 与 listenerVelocity 为世界 m/s：

```text
ratio = (c + dot(listenerVelocity,n)) / (c + dot(sourceVelocity,n))
```

听者朝声源运动时分子增大；声源朝听者运动时点积为负、分母减小，音高上升。对近距离退化、超声速、不连续跳位做合理钳制/平滑；这是用于演示的简化，没有传播延迟与完整车辆声学。

camera 只是视角变化，不一定代表物理听者快速瞬移；先选听点是否跟相机，避免环绕摄影制造夸张音调。距离与立体声应变化自然，过车先升后降不靠预设随机 sweep。

## 慢放到 PPT 只淡音量

在视觉慢放开始时保存 RPM、load、Doppler 音高，随后保持并平滑淡出 gain。车到零视觉速度时不要突然删声源，也不要模拟一串降档。

```js
if (phase === 'reading-handoff') {
  rpm = heldAtHandoff.rpm;
  load = heldAtHandoff.load;
  doppler = heldAtHandoff.doppler;
  gain = heldAtHandoff.gain * (1 - smoothProgress);
}
```

held 参数需要由确定时刻的驾驶采样得到，不依赖先前是否播放过。

## 录音与纯代码合成

长重复视频只截需要片段，不为几十秒下完整十小时。下载失败如实报失败，不把空 m4a 当成功。用户提供路径时先检查长度、采样率、声道和实际内容，再按转速上/下行做分段与循环。

纯代码 V6 可借燃烧脉冲、各缸细微差别、排气波导/共振、负载相关气流噪声、短换档中断与降档补油。它是声音示意，不是发动机数字孪生。过度规则脉冲、窄共振、多车拍频、长滑音都会显“电音”；不是全部归咎于混动电机。先 A/B 试听再改合成层。

AudioWorklet 优先用于低延迟处理，但离线 file 页必须处理模块加载、data/blob 支持与回退。worker 失败不应导致整个演示无法 Start。AudioContext 在手势解锁，音量包络使用 AudioParam 调度/平滑，避免每帧 setValue 造成拉链声。

## 参考实现与证据

[powertrain.js](https://github.com/Rayman0106/f1-economics-3d-deck/blob/main/src/powertrain.js)、[sound.js](https://github.com/Rayman0106/f1-economics-3d-deck/blob/main/src/sound.js)、[engine-synth.js](https://github.com/Rayman0106/f1-economics-3d-deck/blob/main/src/engine-synth.js)、[参考与 MIT 署名](https://github.com/Rayman0106/f1-economics-3d-deck/blob/main/docs/Engine-Synthesis-References.md)。

离线单元测试可检查触发、节奏和不重复发车，无法证明声音好听。试听应涵盖起步、多车、巡航、制动、过车、慢放/定格，记录音量设备和浏览器是否真正测试。
