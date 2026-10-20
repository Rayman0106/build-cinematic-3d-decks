# 3D 模型寻找、筛选、转换与适配

## 从动作需求反推资产条件

| 需求 | 下载前要问 | 下载后检查 |
|---|---|---|
| 赛车近景 | 高清纹理、车型和格式是否适合 | 独立轮胎、UV、轴向、前后轴 |
| 部件迭代 | 独立组件还是同名贴花 | 实体几何、材料组、连接面 |
| 操作鼠标/起立 | 已绑骨、手指和衣物权重怎样 | 实际骨架、手掌朝向、前臂、坐姿裤裆 |
| 面部表情 | 下载格式有 morph targets 吗 | GLB targets，不靠商品描述 |
| 连续场地 | 地标、看台是否真实实体 | 薄板背面、厚度、树木视廊 |
| 多车开场 | 是否可共享与实例化 | 几何/纹理内存、draw call、克隆关系 |

人物先看中景、侧面及坐/抬臂/起立三种姿态。风格化降低写实恐怖谷，却不自动解决关节。别只凭缩略头像选人。

## 搜索、下载和来源

组合“题材 + rigged/animated/GLB/download + 风格/年代”。Sketchfab 是来源之一，也可考虑作者仓库、Kenney、Quaternius、Poly Haven；平台名不等于许可。

比较模型预览、下载选项和包内说明。可旋转网页不等于可下载、可转换或可公开原文件。记录作品名、作者、URL、许可、下载日期、文件哈希与修改说明。转换、演示使用、公开再分发是不同范围。

登录下载走用户授权的浏览器/连接器，不提取 cookie 或绕过登录。独立下载可并行，各包结构判断依次完成。用户对特定 GLB 的授权不能扩展到所有作者资产。

资产清单至少包含：`id/title/creator/source_url/downloaded_at/source_file/derived_file/license/modifications/permission_note`。书面许可的私人证据可私有保留，公开清单保留范围和作者要求。最终 credits 可访问，不只留在聊天中。

## GLB 体检与适配层

运行 `python scripts/inspect_glb.py model.glb --out model-report.json`。检查 node、primitive、三角形、alphaMode、纹理、skins、clips。报告 local bounds 不等于父组变换后的世界包围盒。重复 primitive 哈希是候选；左右轮共享几何很正常，只有同世界位置的重复才可能争深度。

外部 URI 和 Draco/Meshopt/KTX2 等扩展需要随包依赖与兼容解码器。GLB 可解析只证明容器正确，不证明动作可用。加载后补三视图、语义锚点和极端姿势。

用语义适配层隔离原节点命名：

```js
const adapter = {
  root, unitScale: 1, forward: [-1, 0, 0], up: [0, 1, 0],
  wheels: { FL: { center, radius, axle, steerRoot, rollRoot } },
  parts: { frontWing: { root: completeAssembly, restLocalMatrix } },
  anchors: { nose, leftFrontWheel, rightFrontWheel, rearWingTop }
};
```

一套全局坐标，在适配根组消化差异，不在每场景交换 XYZ。轮心、半径用实际模型标定，不硬套旧值。人物用语义 joints 映射，不把名字相似的辅助节点都转一遍。

## 拆件：实体、贴花和变换

F1 失败案例：Rear_Wing 节点主要是涂装，真实尾翼留在 Body；按质心范围粗切前翼，又剩跨边界翼片。

1. 各 primitive 临时纯色显示，定位实体、贴花与透明层。检查连通组件、材料组和拓扑。
2. 合并网格按连通与语义切分。跨边界三角形不只看质心；保留索引、normal、tangent、UV、skin 与材料组。
3. 旋转相机检查原位完全空出，没有实体、白框或旧阴影残留。
4. 换父保持 matrixWorld。均匀缩放适合时可用 `newParent.attach(part)`；非均匀缩放/剪切需验证分解。
5. 回装恢复保存的原局部矩阵，不手写一个差不多的 y。放大/高亮只加在强调包装组，退出完全恢复。

升级需要“基线→拆出→改变→回装→验证”，只飞出再飞回不代表迭代。

## 材质、共享与优化

颜色与数据纹理按格式语义处理，不全设 sRGB。保留 roughness/metalness/alphaTest；共享材质修改前克隆。不以统一高光代替真实感。

固定投影大小与目标设备后再优化。保住广告、轮胎、UV 接缝和拆件边界。静态合并可降 draw call，却可能破坏部件互动；保留语义边界。多车共享不可变 geometry/texture，关节与可变材质分离。蒙皮克隆用 SkeletonUtils 等保持骨骼关联的方法。

原始模型不变，加工另存；不在硬链接上原位写回。优化前后保存三视图、贴图细节和统计。变小不代表变好。

## 案例入口

- [F1 许可](https://github.com/Rayman0106/f1-economics-3d-deck/blob/main/THIRD_PARTY_NOTICES.md)、[轮心/部件标定](https://github.com/Rayman0106/f1-economics-3d-deck/tree/main/docs/evidence/P22)。
- [数学来源及适配](https://github.com/Rayman0106/reaction-time-math-3d-deck/blob/main/docs/ASSET-SOURCES.txt)、[人物实现](https://github.com/Rayman0106/reaction-time-math-3d-deck/blob/main/src/character.js)。网页宣称的表情不代表 GLB 实际包含。
