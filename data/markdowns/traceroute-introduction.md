---
title: "traceroute 的简易版本"
date: "2020-03-30T05:39:01+08:00"
lastmod: "2020-03-30T05:39:01+08:00"
draft: false
tags: ["traceroute", "network","linux"]
categories: ["技术交流"]
---

# traceroute 的简易版本

*写于 2020 年 3 月 30 日：*

## traceroute是什么


在Linux操作系统中，系统管理员使用 `traceroute`（现在已被替换为 `mtr` ）命令来打印从本机发送到目标主机的数据包 (`datagram`) 所途经的中间节点的IP地址和延迟.

举个例子，如果我们想知道，自己正在使用的这台计算机到 cloudflare.com 的一台主机之间都经过了哪些中间节点，可以运行：

```
sudo mtr --report -c 1 --no-dns cloudflare.com
```

其中 `--report` 选项表示打印报告，而不是一直刷新显示，`-c 1` 选项表示只对链路上的每个节点发送一份数据包，而 `--no-dns` 选项将禁止 `mtr` 程序将 `ip` 地址反解析成主机名，接下来您将能够看到如下输出

![figure](/traceroute-introduction/an-mtr-example.png)

这表示，一个数据包从当前计算机发送到 cloudflare.com 名下的一台主机 104.17.176.85 ，至少要先后经过 208.64.231.6 和 206.72.211.63．其中 Last 字段是对应中间每台主机的往返延迟，也就是说，到 104.17.176.85 的往返需要 1.3ms ，而到 208.64.231.6 的往返延迟是 1.1ms ，你可能注意到到 206.72.211.63 的往返延迟竟然比后面的还高，那是因为数据包前往和数据包返回走的未必会是同样的路径，并且前往时和返回时网路的拥堵情况也不一样，所以说可能是数据包返回时消耗了更长的时间.

## traceroute能做什么

### 诊断连通性

简而言之， `traceroute` (或者 `mtr` )能帮组我们诊断网络链路的连通性和拥堵情况，下面我们分别以一台京东云主机和一台阿里云主机到`162.244.241.102`这台服务器的 `traceroute` 为例来讲解

![figure](/traceroute-introduction/jd-mtr-test.png)

从上图看来，从京东云发出的数据包并没有送达目标主机 162.244.241.102 ，因为 162.244.241.102 并没有出现在 `traceroute` 报告的最后一行.

![figure](/traceroute-introduction/al-mtr-test.png)

从上图看来，从阿里云发出的数据包到达了目标主机 162.244.241.102 ，因为 162.244.241.102 出现在了  traceroute  报告的最后一．我们还可以参考前后两个节点的延迟，猜测拥堵的位置，例如，到 59.43.186.246 的平均延迟为 12.7ms ，而到 59.43.246.238 的平均延迟为 131.3ms ，那么可能是这两个节点的链路发生的拥塞，但是不一定.

### 比较链路质量

下面我们在同样一台主机，先后 `mtr` 到 exploro.one 和 beyondstars.xyz 这两个地址，得到下面两份 `traceroute` 报告.

![figure](/traceroute-introduction/al-to-exploro-one.png)

![figure](/traceroute-introduction/al-to-beyondstars-xyz.png)

对比以上两幅图，我们可以发现，从做测试的那一台主机到 exploro.one 的链路差一些：因为中间经过了更多的节点，而且到每一个节点的延迟都相对较高，而到 beyondstars.xyz 的链路好一些：因为中间节点更少，延迟也都比较．根据这个信息，可以考虑将 exploro.one 的 CDN 服务商更换为 beyondstars.xyz 的 CDN 服务商.

## traceroute的原理

`traceroute` 是依赖于互联网协议 (Internet Protocol, IP) 的，所谓互联网协议大概就是：互联网中的两台主机要互相通信要知道对方的IP地址，并且规定了具体的通信方．值得注意的一点是，根据 IP 协议，通信的发起方需要在要发送的消息的信封（IP分组头部）加入一个 TTL（Time To Live，生存时间）字段，然后消息（IP分组）会由发送方到接收方的中间节点层层传递，每到达一个中间节点，中间节点将 TT L的值减去 1 ，如果 TTL 减去 1 后等于 0 ，那就把该 IP 分组的接收方字段和发送方字段互换——退回来，如果 TTL 减去 1 后不等于 0 ，那就将该 IP 分组传递给下一个节点，有点类似接力赛的样子.

![figure](/traceroute-introduction/traceroute-demonstration.png)

假设 `traceroute` 是在 \\( t_1 \\) 时刻开始工作，假设目的主机是 receiver（如上图所示），那么 `traceroute` 会在 \\( t_1 \\) 时刻向 receiver 发送一个 TTL=1 的分组 (Packet) ，交由下一个接力点 hop1 转发，而接力点 hop1 收到 TTL=1 的分组之后，先将 TTL 减去 1 ，于是 TTL=0 ，于是 hop1 将该分组退回， sender 在时刻 \\( t_2 \\) 收到 hop1 退回的分组.

sender 在 \\( t_2 \\) 时刻收到 hop1 退回的分组之后，立刻，创建一个`TTL=2`的分组发向 receiver ，这次 hop1 给分组的TTL减去1之后还剩1，于是`hop2`收到分组，`hop2`收到分组再给TTL减去1发现TTL变成0，于是 hop2 把分组退回给 sender． sender 在 \\( t_3 \\) 时刻收到退回的分组，并且立刻发送`TTL=3`的分组.

就这样，从`TTL=1`开始， sender 依次增加TTL的值并发送新的分组，直到 sender 检视收到的退回的分组看到是来自 receiver 为止，这样 sender 可以分别计算 \\( \Delta t_i = t_{i+1} - t_i \\) 来获知到第 \\( i \\) 个中间节点的往返延迟，并通过检视退回分组的头部，来查看中间节点的IP地址.

![figure](/traceroute-introduction/WireShark-screenshot.png)

上图是在一次运行 `mtr` 时 `WireShark` 捕获的ICMP分组：可以看到有很多 "Time-to-live exceeded" 的消息.

## traceroute的简单实现

为了验证我们对 `traceroute` 的了解是正确的，下面我们尝试用 `Shell` 语言编写一个能打印到目的主机之间所有中间节点的IP地址的脚本程序，该程序运行在Linux操作系统上，依赖于最新版本的 `bash` 和 `iputils` .

```
#!/bin/bash

hostname=$1
maxhop=64

xpingfunc()
{
	IP_ADDR_REGEX="[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}"
	ping -c 1 -t $2 -W 4 -n $1 | 
	sed -n '2p' | 
	egrep --only-matching "$IP_ADDR_REGEX" | 
	head -n 1
}

targethostname=$(dig +short $hostname A | head -n 1)

for i in $(seq 1 $maxhop)
do
	replyfrom=$(xpingfunc $targethostname $i)
	echo $replyfrom
	if [ ! -z $replyfrom ] && [ $replyfrom = $targethostname ]
	then
		exit 0
	fi
done
```

其中 `xpingfunc` 函数的作用是 ping 一个主机，然后返回收到的响应的源 IP 地址，而下边的循环则是依次增加 TTL 的值，使得数据包可以到达越来越远的中间节点，并打印每一个中间节点的 IP 地址 ，同时判断最远的数据包是否已经到达目的主机，若是则结束程序，若否则继续增加 TTL，直到 TTL 增加超过「最大跳」maxhop 的值为止.

将以上这段脚本保存为后缀名为 `.sh` 的文件，例如 `xping.sh` ，然后以一个域名作为参数运行：

![figure](/traceroute-introduction/xping-exploro-one.png)

![figure](/traceroute-introduction/xping-beyondstars-xyz.png)

![figure](/traceroute-introduction/xping-cloudflare-com.png)

测试样例均输出了正确的结果.

## 总结

`traceroute` 利用 IP 协议中规定的 IP 分组头部的 TTL 字段和 ICMP 协议规定的 TTL 耗尽时的自动返回机制展示从当前主机到目的主机之间的所有中间节点，是诊断和分析网络状况的好工具．`traceroute` 的实现可以简单的，仅仅是不断地增加 IP 头部的 TTL 字段，直到当前 TTL 字段的值超过最大跳或者收到目标主机的回复为止，其实很好理解.

## 参考文献

[1] [RFC 792 - Internet Control Message Protocol](https://tools.ietf.org/html/rfc792)

[2] [traceroute - Wikipedia](https://en.wikipedia.org/wiki/Traceroute)

[3] [RFC 791 - Internet Protocol](https://tools.ietf.org/html/rfc791)