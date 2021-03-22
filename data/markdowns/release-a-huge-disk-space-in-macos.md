---
title: "在 macOS 上释放磁盘空间的一次经历"
date: "2020-05-11T18:31:33+08:00"
lastmod: "2020-05-11T18:31:33+08:00"
draft: false
tags: ["macos","sip"]
categories: ["经验分享"]
---

# 在 macOS 上释放磁盘空间的一次经历

*写于 2020 年 5 月 11 日：*

## 摘要

提到了怎么关 SIP，磁盘空间不足的原因，以及重启进入恢复模式的方法．

## 事件起因

事件起因是在使用过程中遇到了频繁的弹窗如下图

![figure](/release-a-huge-disk-space-in-macos/release-disk-spaces/disk-full-usage-warning.png)

一般情况下我会选择关闭这个提示，但是这次，这个提示在被关闭后几乎是立刻又再次显示了，况且还记得上一次总共清出十几个 G 的空间，于是打开 Dr．Cleaner Pro 进行一遍磁盘分析.

## 磁盘分析

以前也使用过 Dr. Cleaner Pro 的「磁盘分析」功能手动分析文件的磁盘空间占用情况，但是都仅限于查看用户空间的内容，例如应用程序和home目录，这次决定去系统文件夹看看，具体是，有一个奇怪的 `/private` 文件夹占用空间特别大，而据我所知距离上一次清空系统缓存才刚过去不久，就这样一直点进去，直到看到

![figure](/release-a-huge-disk-space-in-macos/release-disk-spaces/dr-cleaner-pro-display.png)

好家伙，足足有16个G的空间占用！

## 尝试直接删除

由于莽撞就直接输入了删除这些文件的命令，然而遇到了熟悉的提示

```
... Operation not permitted
```

先说一下贸然删除swap文件其实是不对的，会有丢失数据和损坏系统的风险，但是我其实是不得已才这样做，才清出十几个G的空间立马又被占满，内心还是比较不满．现在提示这条消息并不是因为权限不足而是系统的 SIP 机制 (System Integrity Protection) 一并限制了管理员和普通用户的磁盘操作权限，删除被系统认为是「关键」的文件会被拒绝执行.

获得权限的办法是关闭系统的机制 (SIP) ，具体做法是在重启系统的过程中同时按 Command 和 R 键，似乎并没有提示什么时候按，不过我的做法是在重启过程中频繁按这个组合键，直到进入恢复模式，恢复模式下的触控板恢复成了默认设置，要按下去才有单击效果，轻触是没有单击效果的，接下来如图所示

![figure](/release-a-huge-disk-space-in-macos/release-disk-spaces/select-the-terminal-tool-in-recovery-mode.jpg)

然后执行

```
csrutil disable
```

以及

```
reboot
```

![figure](/release-a-huge-disk-space-in-macos/release-disk-spaces/execute-commands.jpg)

重启进入正常的系．本来这时候就可以cd到/private/var/vm文件夹并且删除那些swapfile文件了，但是我忘了这样做，于是引出了后续.

## 真正的原因

重启后我再次 cd 到 `/private/var/vm` 文件夹却发现里面空空如也（我并没有在恢复模式下将这些文件删除），猜测可能是系统自动释放了，

![figure](/release-a-huge-disk-space-in-macos/release-disk-spaces/what-after-reboot.png)

之前我以为系统的 swapfile 的释放机制没有正常工作需要人工干预，然而原因或许仅仅是系统内存占用一直比较高却没有软件愿意把内存释放出来，导致系统不得不始终分配大量的磁盘空间作为虚拟内存使．否则系统如果字面意义上耗尽了内存其实是很危险的.

回想起来最近经常使用的软件是 Mathematica ，这玩意其实是个内存大户，之前也遇到过提示，并且「磁盘空间不足」的提示和「内存不足」的提示似乎还同时出现过好多次，但是没有仔细研究一直以为是 Mathematica 在哪个地方存了「临时文件」或者缓存之类．其实原因就是软件占用的内存过高又一直没有释放之.

## 总结

之前并不是没有「重启」过，而我的操作习惯一般都是按住键盘右上角的电源键好一会，然后等屏幕熄灭，然后再按一会电源键，就以为系统是「重启」了，实际上这应该仅仅是休眠和恢复吧，真正的重启，按住这次的经验，是要点击屏幕左上角  图标的「重新启动」按钮

![figure](/release-a-huge-disk-space-in-macos/release-disk-spaces/how-to-reboot-the-system.png)

内存才会被释放，因而，swapfile 虚拟内存文件也才会被释放.

## 参考资料

[1] [System Integrity Protection - Wikipedia](https://en.wikipedia.org/wiki/System_Integrity_Protection)