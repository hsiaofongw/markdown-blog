---
title: "几个好用的 Linux 命令行工具推荐"
date: "2020-04-14T21:09:35+08:00"
lastmod: "2020-04-14T21:09:35+08:00"
draft: false
tags: ["linux","shell"]
categories: ["经验分享"]
---

# 几个好用的 Linux 命令行工具推荐

*写于 2020 年 4 月 14 日：*

命令行的东西能自动化、能与其他命令行工具配合、体积小好安装，而且（往往）开源且免费，这些就是它相比图形工具最大的优势．

### \# cpulimit -- 限制进程的CPU占用率

对于那种廉价的 VPS 主机，厂商一般会明确注明不可长时间满负载占用，这部分是由于厂商使用的虚拟化技术不够成熟导致的——你用得太多了可能影响到你的「邻居」．如果实在要高强度长时间使用 CPU，以下是一个折中方案：

首先安装 `cpulimit` ：

```
apt install cpulimit
```

然后找到要限速的进程的进程号，例如`ffmpeg`

```
pgrep ffmpeg
```

输出进程号比如说是25196，然后运行 `cpulimit` ，建议在`tmux `后台运行` cpulimit`：

```
tmux
cpulimit -p 25196 -l 50
```

这样一来25196号进程的CPU占用率就被限定在50上下了．CPU占用率不会恒定保存在50%，是因为 `cpulimit` 的工作方式是间歇性地挂起和恢复进程.

### \# jq -- JSON内容格式化工具

例如我们有这么一段JSON文本

```
{"username": "admin", "active": true, "lastLogin": "2020-04-14T21:21:07+08:00"}
```

最简单地我们可以用 `jq` 来使内容看起来更整齐一些

```
cat data.json | jq
```

那么会有如下效果

![figure](/linux-tools-recommendation-1/jq-effect.png)

对于自己写的JSON文本， `jq` 也能检查是否存在语法错误. `jq` 也经常和 `curl` 通过管道连接起来一起使用用来调试 API．

### \# tmux -- 后台任务管理

在Windows下我们可以把窗口最小化或者最小化到托盘以实现程序的后台运行，在Linux中有一款管理「会话」的工具它叫做 `tmux` ，首先我们可以创建一个「会话」也就是一个Session：

```
tmux
```

然后我们运行要后台运行的命令

```
ping www.google.com
```

然后我们按住Control键再按B键，松开，再按D键即可回到我们的主界面

```
Control+B D
```

而任务仍然留在后台运行，即使我们执行

```
exit
```

退出远程ssh会话也不影响正在运行着的 `tmux` 会话，我们可以通过

```
tmux list-sessions
```

命令来查看有哪些会话，会有类似下面的输出

![figure](/linux-tools-recommendation-1/tmux-list-sessions.png)

如果会话没有指定名字可以通过序号来访问，例如`21`号会话，冒号左边的数字便是会话的序号，如下命令回到 `tmux` 会话命令行

```
tmux attach-session -t 21
```

再回到主界面还是按Control+B D，而要给会话起一个名字可以按

```
Control+B :rename-session 新的会话名字 
```

再按回车．再之后就可以通过会话名字访问了

```
tmux attach-session -t 新的会话名字
```

可以运行

```
man tmux
```

查看有关终端复用器 `tmux` 的更多文档.

当我们运行爬虫，或者是比较耗时的科学计算任务的时候， `tmux` 是个不错的选择，因为即使你退出了远程ssh会话， `tmux` 会话运行的任务还是会保持运行.

### \# goaccess -- 网站日志分析器

一般来说网页服务器例如Apache HTTPd或者NginX会习惯把请求日志存放在`access.log`这个日志文件中，而如果没有经过设置的话默认的NginX的请求日志是存放在

```
/var/log/nginx/access.log
```

这个地方，我们可以用 `goaccess` 工具分析日志数据所蕴含的访客流量信息

```
goaccess /var/log/nginx/access.log
```

可以看到独立访客，请求次数，流量，请求资源路径等信息.

有关 `goaccess` 的更多信息可以通过

```
man goaccess
```

查看.

但是需要注意的是对于启用了CDN的网站来说不是所有的请求都会被转发至源服务器，有可能请求仅仅是到达CDN的边沿服务器就命中缓存产生响应．所以 `goaccess` 适用于运行在边沿服务器上.

### \# openssl -- 证书签发和TLS测试工具

关于怎么用 `openssl` 签发CA证书和网站证书，以及怎么查看网站的证书信息，以及怎么查看证书信息和验证证书在[这篇文章中有介绍](https://beyondstars.xyz/posts/openssl-certificates/).

用 `openssl` 测试网站的TLS性能是这样的

```
openssl s_time -connect cloudflare.com:443
```

得出的数据是在给定时间内当前客户端能和网站服务器建立多少个TLS连接，一定程度上反应了网络状况：

![figure](/linux-tools-recommendation-1/client-ssl-to-cloudflare-com-1.png)

![figure](/linux-tools-recommendation-1/client-ssl-to-cloudflare-com-2.png)

就以上两份测试结果而言我们肯定任务第一台客户端到cloudflare.com的网络状况好一些，TLS握手快一些，而第二台客户端到cloudflare.com的网络状况则差一些.

要查看 `openssl` 的更多使用姿势你可以运行

```
man 1 openssl
```

仔细查看.

### \# ssh -- 免密登录与安全连接

我们可以使用

```
ssh-keygen -f testkey
```

来生成一对公私钥，其中 `testkey` 文件是私钥，而`testkey.pub`文件是公钥，可以自己给密钥对别的名．

![figure](/linux-tools-recommendation-1/ssh-key-gen-gen-test-key.png)

然后，`##如果你还没有配置ssh私钥的话##` `可以将` 将私钥文件，这里是 `testkey` 复制到`$HOME/.ssh/id_rsa`，公钥文件复制到`$HOME/.ssh/id_rsa.pub`，

![figure](/linux-tools-recommendation-1/ssk-key-gen-default-key-pair-files.png)

并且将`id_rsa.pub`文件上传到服务器上，在服务器上将这个公钥文件`id_rsa.pub`并入`authorized_keys`就可以实现免密登录了

```
cat id_rsa.pub >> ~/.ssh/authorized_keys
```

另外一种简单地将自己的公钥并入目标主机的`authorized_keys`文件的方法是

```
ssh-copy-id -i path/to/公钥  user@ip 
```

例如

```
ssh-copy-id -i ~/.ssh/id_rsa.pub user@ip
```

这样成功之后，就看可以直接通过

```
ssh username@ip地址
```

的方式免密登录VPS服务器，免密登录部署成功之后，可以禁用密码登录（但是本地的私钥文件id_rsa和id_rsa.pub要保存好），通过编辑配置文件

```
vi /etc/ssh/sshd_config
```

将

```
#PasswordAuthentication yes
```

改为

```
PasswordAuthentication no
```

保存退出后重启sshd服务

```
systemctl restart sshd
```

![figure](/linux-tools-recommendation-1/disable-ssh-password-login.png)

就成功禁用密码登录了，在这之后还可以编辑本地的ssh配置文件

```
vi /etc/ssh/ssh_config
```

添加以下内容

```
Host myvps
    Hostname ip地址
    User vps登录用户名
```

来给你的VPS一个ssh别名叫做myvps，之后登录和复制文件会方便很多，例如登录：

```
ssh myvps
```

例如复制文件：

```
rsync file1 myvps:/path/to/copy/to
```

例如作为远程Git仓库：

```
git remote add vpsrepo "myvps:/path/to/project.git"
```

都很方便.

### \# tail -- 实时显示日志文件

模拟网页服务器访问日志的实时刷新我们用 `ping` 去ping一个主机，这样也有实时刷新的效果

```
ping www.google.com > testfile.log &
```

以上命令后台运行 `ping` 并且把输出重定向到当前目录下的`testfile.log`文件，然后为了查看实时的日志我们可以运行

```
tail -F testfile.log
```

这样就有了那种网页服务器不断跳动的访问日志．现在可以运行

```
jobs
```

来查看后台任务，例如刚才的ping的任务编号是1，那就

```
fg 1
```

使这个ping任务转为前台，然后按

```
Control+C
```

关掉这个ping任务.

### \# tee -- 多处重定向输出

例如

```
ping www.google.com | tee testlog2.txt
```

会在屏幕上显示ping Google的输出的同时还把ping的输出记录到testlog2.txt这个文件，同样如果这时我们运行

```
tail -F testlog2.txt
```

也是有跟正常运行`tail -F`一样的效果.

### \# journalctl -- 服务日志查看

有时候我们想知道一个服务它启用了，或者是不是启用了但是又因为什么问题停止了，我们可以查看服务的日志，注意不是守护进程产生的日志，是这个服务和systemd有关的日志：

```
journalctl -xefu nginx.service
```

或者我们想看看时间同步服务运行得如何

```
journalctl -xefu systemd-timesyncd.service
```

或者我们想看看是谁在爆破我们的VPS服务器

```
journalctl -xefu ssh.service
```

可以说 `journalctl` 是个很方便的日志管理工．可以运行

```
journalctl --help
```

来查看使用说明.

### \# systemctl -- 服务查看工具

我们知道Windows操作系统下有「服务」这个概念，而Linux上也有，「服务」其实是通过systemd守护进程来实现的，而systemctl则是用来和systemd交互的命令行工具.

查看所有服务

```
systemctl list-units
```

重启某个服务

```
systemctl restart sshd
```

停止某个服务

```
systemctl stop nginx
```

关闭某个服务（不会再被启用）

```
systemctl disable httpd
```

启用某个服务

```
systemctl enable httpd
```

查看使用说明

```
systemctl --help
```

### \# netstat -- 网络连接情况查看

`netstat`可以帮助你查看有哪些端口被监听，以及当前机器和哪台机器建立了TCP连接以及连接的状态。

要查看活跃的连接

```
netstat -t -n
```

要查看哪些端口被监听

```
netstat -t -n -l
```

查看本地socket端口连接情况

```
netstat -x
```

查看路由表

```
netstat -r
```

查看IPv6路由表

```
netstat -6 -r
```

查看netstat的使用姿势

```
netstat --help
```

要是有不明的端口正在被监听，可能是后门，建议找出是哪个进程监听的那个端口，例如

### \# lsof -- 进程文件使用情况

查看端口被哪个进程使用

```
lsof -i :443
```

查看PID为2961的进程监听了哪些个端口

```
lsof -p 2961 -a -i
```

查看PID为2961的进程打开了哪些文件

```
lsof -p 2961
```

查看某个用户打开了哪些文件

```
lsof -u root
```

查看某个文件是被哪些进程打开

```
lsof /var/log/nginx/access.log
```

查看 `lsof` 的使用姿势

```
lsof --help
```

或者

```
man lsof
```

Linux实在太易用了！

### \# which -- 查看可执行文件具体位置

假如我们要删除macOS自带的旧版的openssl，可以运行

```
rm `which openssl`
```

然后再安装新版的

```
brew install openssl
```

### \# w -- 查看登录情况和运行情况

要查看系统运行了多久，有多少位用户登录，负载平均，可以运行

```
w
```

来查看.

### \# who -- 查看登录情况

要是仅仅想查看登录情况，可以运行

```
who
```

这样就只看到有哪个用户登录了.

### \# date -- 显示时间

要查看当前时间，可以运行

```
date
```

要显示年份

```
date +%Y
```

要显示月份

```
date +%m
```

要显示是当月的多少号

```
date +%d
```

要显示时分秒

```
date +%H:%M:%S
```

要查看当前距离Unix-Epoch过了多少秒

```
date +%s
```

要查看Unix-Epoch是什么时候

```
date --date='@0'
```

要查看 `date` 的更多用法，可以运行

```
date --help
```

### \# 加减乘除法

要做加法

```
echo $((2020+1))
```

输出为

```
2021
```

要做减法

```
echo $((2020-1))
```

输出为

```
2019
```

要做乘法

```
echo $((2020*12))
```

输出为

```
24240
```

要做除法

```
echo $((2020/12))
```

输出为

```
168
```

### \# 小技巧

返回上一个工作目录

```
cd -
```

更改上一条命令，假如我们运行了

```
echo hello
```

想要把hello更改为hello123再重新运行，那就运行

```
^hello^hello123
```

效果就是输出

```
hello123
```

重做上一次命令

```
echo hello
!!
```

输出为

```
hello
hello
```

### \# last -- 登录记录

查看登录记录

```
last
```

每一次登录记录都看得清清楚楚.

### \# history -- 运行记录

查看命令运行记录

```
history
```

用户运行过的每一个命令都记得清清楚楚.

查看最近10条命令

```
history 10
```

查看帮助，避免误操作

```
history --help
```

删掉历史记录

```
history -c
```

### \# lsb_release -- 查看当前系统版本

查看当前系统版本

```
lsb_release --all
```

### \# lscpu -- CPU信息查看

查看CPU信息

```
lscpu
```

### \# df -- 磁盘使用量查看

查看磁盘空间使用量

```
df
```

查看磁盘空间使用了多少兆字节

```
df -m
```

查看挂载在根目录的磁盘使用了多少G

```
df -B G /
```

查看 `df` 的使用说明

```
df --help
```

### \# lsblk -- 列出磁盘

列出当前机器有哪些磁盘

```
lsblk
```

输出类似于

```
NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
sr0     11:0    1  9.6M  0 rom
vda    252:0    0   20G  0 disk
└─vda1 252:1    0   20G  0 part /
```

### \# fdisk -- 磁盘管理工具

查看分区表

```
fdisk -l /dev/vda
```

查看 `fdisk` 的使用方式

```
fdisk --help
```

### \# iftop -- 网络流量查看

查看网络流量

```
iftop
```

查看 `iftop` 使用说明

```
man iftop
```

### \# man -- 文档查看工具

要查看某个命令的说明，例如查看 `man` 这个命令的说明，可以运行

```
man man
```

要查看 `curl` 的说明，可以运行

```
man curl
```

一般来说 `man` 显示的文档比加上`--help`参数运行命令显示出的文档要更加详细.

![figure](/linux-tools-recommendation-1/man-manual-screencut.png)

同时注意 `man` 有不同的章节，不同的章节会显示不同的内容，例如

```
man 1 crontab
```

显示的是 `crontab` 的基本解释，而

```
man 5 crontab
```

则显示针对 `crontab` 的更加详细的文档.

同时 `man` 也能显示特殊设备文件的文档，例如

```
man 4 null
```

显示`/dev/null`的文档，而

```
man 4 zero
```

显示`/dev/zero`的文档，而

```
man 4 urandom
```

显示`/dev/urandom`的文档.

### \# nmap -- 端口扫描工具

查看你的网上邻居

```
nmap -v -sn 192.168.1.0/24
```

查看cloudflare.com开启了哪些端口

```
nmap -v -sT cloudflare.com
```

![figure](/linux-tools-recommendation-1/nmap-scan-cloudflare-for-open-ports.png)

查看 `nmap` 的一般使用说明

```
nmap --help
```

查看 `nmap` 的详细使用说明

```
man nmap
```

### \# find -- 文件搜索器

要搜索一些文件，例如以`.png`作为后缀名的文件

```
find -name "*.png"
```

会找出好多`.png`的文件。

要搜索某个文件，例如文件名是`hwy_vs_displ-1.png`

```
find -name "hwy_vs_displ-1.png"
```

要查看 `find` 的更多用法

```
find --help
```

### \# tree -- 目录结构打印

有时候我们想看一个目录下都有哪些子目录和文件，例如当前目录的目录结构

```
tree .
```

于是目录结构一览无余

```
.
├── a
│   └── c
│       ├── d
│       ├── e
│       └── f
├── b
├── testfile.log
└── testlog2.txt
```

也可以只打印1层

```
tree -L 1 .
```

或者打印2层

```
tree -L 2 .
```

因为有时候目录树太深了不方便查看，所以只打印几层就够了.

### \# 文件管理

列出最新的文件，使用 `ls` 命令

```
ls -t . | head -n 10
```

![figure](/linux-tools-recommendation-1/ls-newest-files.png)

在macOS上安装coreutils包后用gdu替代缺乏维护的du，然后我们用gdu打印当前目录下每个目录占用的磁盘空间，交由sort排序

```
gdu -BM -c -d 1 | sort -n -k 1
```

这样可以方便的清理磁盘空间.

## 总结

要想快速地学习，一是勤用搜索引擎，二是不会的时候多查看文档，途径有很多，比如 `--help` 选项，`man` 命令，还有软件的官网等．