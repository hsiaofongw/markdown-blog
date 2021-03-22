---
title: "修复CloudCone VPS无法自动同步时间的问题"
date: "2020-03-18T22:04:23+08:00"
lastmod: "2020-03-18T22:04:23+08:00"
draft: false
tags: ["ntp","cloudcone"]
categories: ["经验分享"]
---

# 修复 CloudCone VPS 无法自动同步时间的问题

*写于 2020 年 3 月 18 日：*

## 问题描述

最开始是为了分析 Nginx 服务器的缓存命中率，于是在要用到 `$date_gmt` 这个变量，然后发现 `$date_gmt` 的值总是和本地的时间不对，在谷歌搜索当地时间，看到本地的时间是对的，服务器的时间慢了几分钟.

## 排查问题

到服务器先是运行

```
date
```

命令，可以看到Nginx只是参照系统的时间，是系统的时间没有正确设置，于是又运行

```
timedatectl status
```

可以看到其中

```
System clock synchronized: no
systemd-timesyncd.service active: yes
```

可以看到系统当前的时钟并没有和网络时钟同步，但是`timesyncd`服务（Ubuntu自带的通过NTP同步系统时钟的服务）是开了的，接下来看一下`timesyncd`服务有没有给出什么日志，运行

```
journalctl -xefu systemd-timesyncd
```

看到有很多类似

```
Mar 18 13:58:30 apiserver2 systemd-timesyncd[11311]: Timed out waiting for reply from 91.189.89.198:123 (ntp.ubuntu.com).
```

这样的输出，提示和NTP服务器的连接是超时的，接下来看一下是不是NTP服务器的问题，主要是TCP Ping一下NTP服务器的123端口：

```
nmap -sA -p 123 ntp.ubuntu.com
```

输出是

```
Host is up ...
```

于是又在

```
/etc/systemd/timesyncd.conf
```

将

```
NTP=
```

更改为

```
NTP=time.google.com
```

同样是在`journalctl`日志中看到超时的提示并且`nmap`同样提示"Host is up".

在此之后又陆续绕了很久.

## 问题的突破口

尝试使用`ntpdate`工具手动地和NTP服务器通信

```
ntpdate ntp.ubuntu.com
```

只得到一行提示

```
no server suitable for synchronization found
```

于是又想看一下具体的日志

```
ntpdate -qvd ntp.ubuntu.com
```

有几点比较可疑，比如说

```
reference time:    00000000.00000000  Thu, Feb  7 2036  6:28:16.000
originate timestamp: 00000000.00000000  Thu, Feb  7 2036  6:28:16.000
transmit timestamp:  e21cacb9.f1c346e7  Wed, Mar 18 2020 14:20:41.944
```

看起来服务器返回的数据似乎都被置0了，不太确定是不是如此，康康有没有网友遇到相似的问题，于是在谷歌上搜索

```
no server suitable for synchronization found
```

在[askubuntu.com](https://askubuntu.com/questions/429306/ntpdate-no-server-suitable-for-synchronization-found)有这么一个回答：

```
Your hosting provider is blocking ntp packets.
```

想想刚才看到的怪异的服务器返回的时间，似乎也有道理，于是又想起了上一次同样是遇到服务器时间不同步的问题开的工单得到的答复其中似乎包含有CloudCone NTP服务器的地址

```
ntp.cloudcone.com
```

先试一下

```
ntpdate -qvd ntp.cloudcone.com
```

看到

```
adjust time server 173.82.15.22 offset 0.033083 sec
```

说明ntp.cloudcone.com这个NTP服务器是可用．接下来肯定是修改

```
/etc/systemd/timesyncd.conf
```

修改

```
NTP=ntp.ubuntu.com
```

为

```
NTP=ntp.cloudcone.com
```

然后再

```
timedatectl set-ntp false
timedatectl set-ntp true
```

为了验证问题是否已解决，再运行

```
timedatectl status
```

看到

```
System clock synchronized: yes
```

并且Local time字段和实际的时间基本一致，说明问题已解决！

## 后续总结

在解决问题的过程中用到过下列命令

- `hwclock`
- `date`
- `timedatectl`
- `ntpdate`
- `ntpd`
- `chronyd`

下面一个一个的解释

### `hwclock` 硬件时钟命令

`hwclock`即`hardware clock`的意思，即「硬件时钟」，就是计算机主板上的存储着的时间，而不是操作系统内存里面存储着的时间，有几个命令可能会有用

```
hwclock -r 
```

会读取硬件时钟并打印出来，r即是read，读取的意思.

```
hwclock --hctosys 
```

会读取硬件时钟存储着的时间并设置到系统时钟，即将系统时钟同步为硬件时钟，hctosys可以理解为hardware clock to system clock.

```
hwclock --systohc
```

即system clock to hardware clock，将系统时钟写入硬件时钟，和`-hctosys`刚好是相反的.

### `date` 系统日期时间命令

`date`可以读取、设置系统时钟，也能用来转换时间格式

```
date
```

输出当前系统时间

```
Wed Mar 18 14:38:27 UTC 2020
```

`date`后面加格式，例如

```
date +%T  # 其中加号+不能少，%T是格式
```

会显示

```
14:39:34
```

另外

```
date +[格式] --set="时间字符串表示"
```

可以手动地设置系统时间，适用于系统没有网络连接可用，或者所有的NTP服务器都不可用的时候.

以及

```
date --date='@2147483647'
```

会输出

```
Tue Jan 19 03:14:07 UTC 2038
```

说明`date`其实还可以用来转换时间，其中2147483647是距离UNIX Epoch的秒数，具体是

```
date --date='@0'
```

即，Unix Epoch就是

```
Thu Jan  1 00:00:00 UTC 1970 #(UTC)
```

### `timedatectl` 命令

`timedatectl`是Ubuntu发行版自带的NTP客户端timesyncd服务的命令行操作工具

```
timedatectl status
```

可以显示当前时间和NTP同步状态

```
Local time: Wed 2020-03-18 14:46:28 UTC
Universal time: Wed 2020-03-18 14:46:28 UTC
RTC time: Wed 2020-03-18 14:46:29
Time zone: Etc/UTC (UTC, +0000)
System clock synchronized: yes
systemd-timesyncd.service active: yes
RTC in local TZ: no
```

另外

```
timedatectl help
```

或者

```
man timedatectl
```

可以显示帮助.

```
timedatectl set-ntp true
```

开启NTP时间同步服务，之后系统就会一直自动和NTP服务器同步时间

```
timedatectl set-local-rtc true
```

会使timesyncd在同步系统时间的同时一并更新硬件时钟.

在Ubuntu 18.04.2 LTS发行版上，timesyncd的配置文件是在

```
/etc/systemd/timesyncd.conf
```

可以通过

```
man 5 timesyncd.conf
```

查看`timesyncd.conf`配置文件的语法格式.

### `ntpdate` 工具

`ntpdate`工具可以手动和NTP服务器通信

```
ntpdate -q ntpServerHostname
```

会默认和ntpServerHostname指向的NTP服务器的123端口通信，并且查询NTP服务器的时间，但不设置，去掉`-q`选项可以同时让ntpdate更新系统时间.

### `ntpd`和`chronyd`

可用来提供NTP服务和充当NTP客户端，和timesyncd类似.

## 总结

这篇文章介绍了一种解决问题的工作流程：

```
发现问题 -> 观察现象 -> 收集日志 -> 分析原因 -> 对症下药
```