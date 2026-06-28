---
title: "MMD 渲染教程之MD布料解算与Blender渲染"
description: "本文介绍了一套从 MikuMikuDance 经 Marvelous Designer 进行布料解算，再到 Blender 渲染与后期合成的完整工作流程，并分享了相关制作经验与注意事项。"
pubDate: "Jun 28 2026"
image: "/image/mmd/cover.webp"
categories:
  - guide
tags:
  - Arch Linux
  - VMware
---

## 写在前面

决定要退坑 MMD 渲染了。

之前我在 B 站零零散散地发过十几个视频，谈不上多产，却也意外收获了两千多位关注的朋友。这里想跟大家说一声抱歉——往后大概不会再有新视频了。我电脑里还留着两个已经做完解算的半成品，虽然做了场景渲染完就能完工，但可惜现在已经失去了兴趣。再加上马上要面对新的学业，几番考虑之后，还是决定停更 MMD 系列视频。

不过比起遗憾，我更想留住的是这几年折腾这件事本身的快乐。那时候只有一台核显笔记本，渲染一个视频经常要让电脑连续跑上几天，但我仍然乐意一帧一帧地抠动作、一点一点地调灯光材质。这种纯粹因为喜欢而愿意花时间的状态，现在回想起来反而很珍贵。

兴趣是最好的老师，现在看来也是如此。当初想学 MMD 的时候，我也是从网上找了很多教程，慢慢摸出了一套自己觉得最顺手的流程。现在退坑了，正好趁着还记得，把这套流程记录下来，希望能帮到同样对 MMD 渲染感兴趣的人。有些地方可能不太严谨准确的还请见谅。

> 这篇教程讲的是「MMD 模型导入 Blender 渲染」的流程，最终的渲染并不是在 MikuMikuDance 软件里完成的。准确地说，这是一条 **MikuMikuDance → Marvelous Designer 布料解算 → Blender 渲染** 的路线。

---

## 一、基础软件：

[MikuMikuDance](https://sites.google.com/view/vpvp/) 可以说是当今各种 MMD 视频的起源，由樋口優开发。

MMD 里有几种需要先了解的核心格式：

- **PMX**：MMD 的模型文件格式；
- **VMD**：MMD 的动作（动画）文件格式。

![MikuMikuDance](/image/mmd/mmd.webp)

[PmxEditor](http://kkhk22.seesaa.net/category/14045227-1.html) 是专门用来修改 PMX 格式模型的软件，由极北P开发。这个工具非常强大，可以：

- 修改材质；
- 增删分离模型部件；
- 调整骨骼与刚体；

等等。

![PmxEditor](/image/mmd/pmxview.webp)

### 顺便聊聊模型的「式」

玩 MMD 的人大概都听过「XX式」这种说法，指的是同一角色（比如初音未来）由不同建模师做出来的不同版本模型，体型比例、骨骼结构、面部造型风格都会有所差异。常见的有「あにまさ式」（MMD 自带的标准模型）、「Lat式」、「Tda式」、「YYB式」等等。不同的模型骨骼结构略有差异，所以在使用别人发布的动作（VMD）文件时，有时会出现轻微的比例不匹配（比如手部够不到预期的位置），这也是后面「K帧」阶段经常需要手动微调的原因之一。

---

## 二、K帧：让动作真正适配模型

把现成的动作套到角色模型上，经常会出现各种「穿模」（衣服/身体部位互相穿插）的情况。这时就需要根据具体情况，对动作或模型本身做调整——这个调整动作的阶段，俗称「**K帧**」。

![K帧](/image/mmd/k.webp)

K帧这一步算是比较繁琐的，需要逐帧仔细检查、调整。如果这一步没做好，后期做布料解算时很容易出现穿模问题，导致前面的工作要推倒重做。

K帧、调整完成后，记得保存好处理过的模型文件和动作文件，后面的流程都会用到它们。

完成 K帧之后，会分出两条思路：

1. **思路一**：用 Marvelous Designer 给角色穿上 zpac 格式的服装做布料解算。这种方式需要提前准备好角色的「素体」（不含衣服的裸模）。
2. **思路二**：直接使用原模型（自带衣服）进行后续操作。

---

## 三、用 MMDBridge 导出 Alembic 文件

接下来要用到 [MMDBridge](https://github.com/uimac/mmdbridge)，这是一个可以把套上动作的 MMD 模型导出为 abc（Alembic）文件的插件，方便接入 Blender、Cinema 4D 等其他渲染软件。

![MMDBridge](/image/mmd/mmdbridge.webp)

**如果走思路一（布料解算）**，使用 MMDBridge 时建议在动作前面预留 30 帧左右的空隙再开始播放动作，方便后续给人物穿上衣物。

具体操作上：

1. 点击 MMDBridge 进行配置，选择「実行する」；

   这里要根据两条思路分别选择不同的导出脚本：

   - **思路一**（先去 Cinema 4D 调整，再进 Marvelous Designer 做布料解算）：选择 `mmdbridge_alembic_for_c4d.py`；
   - **思路二**（直接用 MMD 自身引擎处理衣物效果，再导入 Blender）：选择 `mmdbridge_alembic_for_blender.py`。

2. 配置好后，照常导出 avi 文件，帧数选 30；（分辨率可以设置成 1×1）

3. 渲染完成后，会自动导出 abc 文件。

---

## 四、用 Cinema 4D 中转处理（思路一）

把上一步导出的 abc 文件导入 [Cinema 4D](https://www.maxon.net/en/cinema-4d) 的 R19 版本（后续版本导入会报错）。导入设置：

- 帧率：30；
- 缩放：10。

![Cinema 4D](/image/mmd/c4d.webp)

> 如果一开始就打算用 Marvelous Designer 来解算布料，建议先在 PmxEditor 里把角色的手部单独分离出去。手指在解算时很容易勾住布料，导致整个解算结果出问题。实测去掉手部之后，最终效果几乎没有影响。

导入 Cinema 4D 之后，还要把头发也去掉，尽量只留下做布料解算所必需的身体部位。处理完之后，把这个「精简版」人物模型再次导出为 abc 文件，留给下一步在 Marvelous Designer 里使用。原版的人物模型也导出保存一下，方便后续导入Blender中。

---

## 五、用 Marvelous Designer 做布料解算（思路一）

打开 [Marvelous Designer](https://www.marvelousdesigner.com/) 。导入设置：

- 单位：cm (DAZ Studio)；
- 缩放：100.00%。

![Marvelous Designer](/image/mmd/md.webp)

**注意导入顺序**：要先导入服装，再导入人物 abc 文件，否则动作数据会被吞掉。

给模型穿衣服、调整布料这部分流程比较细，这里就不展开说了。完成穿衣之后，选择模拟品质为「**动画（完成）**」进行最终解算。解算完成后，把衣服单独导出为 abc 文件。

---

## 六、导入 Blender

最后，把人物的 abc 文件和衣服的 abc 文件，一起导入 [Blender](https://www.blender.org/)。

![Blender](/image/mmd/blender.webp)

### 给 abc 模型上材质（按 `N` 唤出插件侧边栏）

1. 先用 [MMD Tools](https://github.com/MMD-Blender/blender_mmd_tools) 插件把原始 PMX 模型导入 Blender；
2. 再用 [MMD Helper](https://www.bilibili.com/video/BV1pW4y1d7FS/) 插件里的 **Material Transfer** 功能，把 PMX 模型上的材质直接转移到导入的 abc 模型上。

![Blender插件](/image/mmd/blendertool.webp)

布料部分的材质，可以用 Blender 自带的 **Node Wrangler** 插件辅助导入：在材质节点编辑界面用 `Ctrl + Shift + T` 快速生成贴图节点。

> ：在 Blender 的时间线上，也可以顺手导入音乐方便对齐节奏。

### 打光、调材质、渲染

接下来打光和细调材质的部分因人而异、因项目而异，这里就不一一展开了。

不过有一点建议想强调一下：**渲染输出尽量使用图片序列格式，而不是直接出视频文件**。这样如果渲染中途因为各种原因中断，也可以从断点接着继续渲染，不用从头再来。

![渲染导出](/image/mmd/blenderrender.webp)

### 后期合成

最后，把渲染出的图片序列用 [DaVinci Resolve](https://www.blackmagicdesign.com/products/davinciresolve) 等剪辑软件合并成视频并调色，就完成了。

---

## 七、发布前别忘了写借物表（重中之重）

这一点非常重要，怎么强调都不为过：**视频做完、准备发布之前，一定要写好「借物表」（Credits）**。

MMD 能延续这么久，本质上是建立在无数建模师、动作制作者、特效作者无偿分享自己作品的基础上的。我们在借用他人做的模型、动作、舞台去完成自己的作品，最基本的尊重就是在视频发布的时候，把用到的素材和对应的作者都标注清楚。

### 使用素材之前：一定要读 readme

在下载、使用任何模型、动作、舞台、特效之前，**务必认真阅读原作者附带的 readme（使用规约）文件**。不同作者、不同素材的使用规则差异很大，常见的限制项包括：

- 是否允许用于商用；
- 是否允许二次改造、二次配布；
- readme中需要包含的作者的署名；
- 是否限制作品上传平台。

使用前一定要确认清楚，避免给作者带来困扰，也避免给自己带来不必要的麻烦。

![readme](/image/mmd/readme.webp)

### 借物表的常见格式

视频发布时（不管是简介区还是视频内嵌字幕），习惯上会附上一份借物表，常见格式大致是这样：

```
借物表/Credits
[Motion]　动作作者
[Stage]　 舞台作者
[Model]　 模型作者
[Cloth]　 服装/布料作者
[BGM]　   曲名 - 歌手
```

根据实际项目用到的素材，这几项可以增减，比如还会单独列出特效（MME）、镜头（Camera）等。核心原则就是：**用了谁的东西，就标注谁**，让看到视频的人能顺着借物表找到原作者，也是对原作者最直接的支持。

---

## 八、一些推荐的工具与资源网站

写到这里，再补充几个很有帮助的网站：

- **[MMD-YBK](https://mmdybk.vercel.app/)**：一个由 MMD 爱好者维护的教程资源合集站
- **[BowlRoll](https://bowlroll.net/)**：日本 MMD 最主流的素材配布站，模型、动作、特效（MME）、舞台道具等几乎所有 MMD 相关素材都能在这里找到
- **[模之屋](https://www.aplaybox.com/)**：中国的模型创作分享社区，国人居多
- **[DeviantArt](https://www.deviantart.com/)**：海外艺术作品分享社区，上面可以找到很多海外作者配布的模型
- **[Poly Haven](https://polyhaven.com/zh/hdris)**：免费、开放版权的全景贴图资源站，在 Blender 里给场景做背景非常好用

## 流程总览

```
MikuMikuDance（K帧、调整动作）
        │
        ▼
   PmxEditor（模型修改、分离手部等）
        │
        ▼
   MMDBridge（导出 Alembic abc 文件）
        │
   ┌────┴────┐
   ▼         ▼
思路一       思路二
Cinema 4D    （跳过，直接用 MMD 自带衣物效果）
   │
   ▼
Marvelous Designer
（布料解算）
   │
   └────┬────┘
        ▼
     Blender
（MMD Tools 转材质 + Node Wrangler 导入贴图 + 打光渲染）
        │
        ▼
  DaVinci Resolve（剪辑、调色、合成）
```

---

## 写在最后

虽然说是退坑了，但回头看这几年的 MMD 制作时光，依然觉得很快乐。即使最终做出来的作品没有多出色，没有多少播放量，那些为了一个动作反复调整、为了一处光影来回比对的时间，留下的回忆是抹不掉的。

希望这份流程记录能帮到正在摸索、或者刚入坑的你。也希望大家都能玩得开心——成为一名 MMDer！😎

---

_最后更新：2026年6月_
