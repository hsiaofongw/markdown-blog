---
title: "HTTPS 证书：原理、签发、部署和验证"
date: "2020-04-08T16:20:16+08:00"
lastmod: "2020-04-08T16:20:22+08:00"
draft: false
tags: ["https","tls","certs"]
categories: ["概念普及"]
---

# HTTPS 证书：原理、签发、部署和验证

*写于 2020 年 4 月 8 日：*

## 前言：HTTP 和 HTTPS

HTTP 协议被广泛应用，例如这张网页，它实质上是字节的有限长序列，浏览器通过 HTTP 协议请求它，服务器通过 HTTP 协议返回它．

HTTP 协议默认传输的是明文，这意味着浏览器和服务器中间链路上的任何节点，都能看到它们之间的通信．

![figure](/openssl-certificates/xiaoming-login-to-github.png)

一些网页应用有「登录」功能，我们不希望传给服务器的用户名和密码被人看到．

## 公钥加密

我们只会介绍基本的概念，而不会引入太多的数学讨论，也就说不会引入太多的数学公式，要想了解更多，您可以直接翻看文末的「参考链接」.

公钥和私钥只不过分别是数学上的一个「整数」，没错其实就是数学课本上说的整数，如果说不是一个整数，那至多是若干个整数，由若干个整数就能表示．我们把公钥记做 \\( p \\) ，把私钥记做$q．现在你只需知道

\\[
p, q \in \mathbb{Z}.
\\]

有这么一个场景， David 和 Bob 有一天聚在一起， David 和 Bob 希望实现一种方法，使得今后 Bob 能给 David 传纸条，而纸条上的内容即使被中间递送纸条的人看见了，递送纸条的人也看不懂纸条上写的内容是什么意． David 想到了自己学过公钥加密的知识， Bob 其实也有一些公钥加密的知识，于是 David 和 Bob 决定使用一种叫做RSA的密码（密码是加密解密方式的一系列约定，并不是说「RSA」就是密码）.

首先 David 随机挑选了一个非常非常大的质数，叫做 \\( q \\) ， David 把 \\( q \\) 选做私钥，然后 David 翻看RSA的手册，按照手册中描述的方法，由私钥 \\( q \\) 计算出或者说生成出公钥 \\( p \\) ，按照RSA手册中描述的，有一个数学运算，叫做 \\( f_e \\) ，把明文转换为整数 \\( d \\) 之后，可以这样计算出加密后的数据 \\( e \\) 

\\[
e = f_e(p, d)
\\]

这就是加密的过程， \\( f_e \\) 是一套运算过程，也是加密算法， \\( d \\) 可以是明文，比如说账号和密码，而如果拿到了 \\( e \\) ，是看不出关于 \\( d \\) 的任何信息的，是不能够从密文 \\( e \\) 当中看出任何和明文（账号密码）有关的信息的，要想由 \\( e \\) 解密出 \\( d \\) ，只有知道私钥 \\( q \\) 的人能做到，下面是解密过程

\\[
d = f_d(q, e)
\\]

式中 \\( e \\) 是密文， \\( q \\) 是私钥，而 \\( d \\) 就是前面那个式子中的 \\( d \\) ，也就是明．

现在 David 告诉 Bob 公钥 \\( p \\) 的值，当然了 David 和 Bob 都知道 \\( f_e \\) 和 \\( f_d \\) 的具体表达式，也就是都知道有了公钥如何加密，有了私钥如何解密，那么从今以后， Bob 要给 David 发送信息 \\( d_1 \\) ，可以先用加密算子 \\( f_e \\) 和 David 的公钥计算出密文 \\( e_1 \\) 

\\[
e_1 = f_e(p, d_1)
\\]

然后把密文 \\( e \\) 写在信中，交给任何人递送， David 收到密信 \\( e_1 \\) 后，用自己的私钥 \\( q \\) 和知道的RSA密码套件约定的解密方法 \\( f_d \\) 解密，得到原文 \\( d_1 \\) 

\\[
d_1 = f_d(q, e_1)
\\]

以上就是公钥加密和私钥解密的基本概．加密算子和加密算子必须要足够健壮使得仅仅根据密文 \\( e \\) 很难算出明文 \\( d \\) .

## 公钥递送过程中所面临的问题

前面我们说 David 和 Bob 先是聚在一起，然后 David 才把公钥 \\( p \\) 交给 Bob ，那能不能 David 和 Bob 不见面，通过中间人把公钥 \\( p \\) 递送给 Bob 呢？

不行.

假设中间人叫做 Mallory ，它怀着恶意，当 David 委托中间人 Mallory 把公钥 \\( p \\) 递送给 Bob 时， Mallory 假装答应，随后 Mallory 并没有把 David 的公钥真正地递送给 Bob ，而是把自己的公钥 \\( p_m \\) （ Mallory 的公钥）递送给 Bob ，而当 Bob 收到 \\( p_m \\) 后，仅仅根据RSA的知识，并且在 Bob 对 David 的公钥 \\( p \\) 和 David 的公钥的特征 \\( \lambda(p) \\) 一无所知的情况下，是无法分辨 Mallory 的公钥 \\( p_m \\) 和 David 的公钥 \\( p \\) 有任何差别的，于是 Bob 会毫不怀疑地把 Mallory 的公钥 \\( p_m \\) 当成是 David 的公钥 \\( p \\) .

然后 Bob 会给 David 写信，信的内容是 \\( d \\) ，首先 Bob 加密 \\( d \\) ，用的当然是 Mallory 的公钥：

\\[
e = f_e(p_m, d)
\\]

然后 Bob 把密件 \\( e \\) 交给 Mallory 递送，而公钥是由私钥生成的， Mallory 当然有和 \\( p_m \\) 对应的私钥 \\( q_m \\) ，于是 Mallory 就可以轻松地解密 \\( e \\) ，看到明文 \\( d \\) 的内容：

\\[
d = f_q(q_m, e)
\\]

这种情况也被叫做「中间人攻击」(MITM)，是MITM所有攻击方式中比较简单的，这个例子告诉我们，公钥 \\( p_{\text{david}} \\) 必须真的是收件人主体 David 的，而不能是任何其他人，更不能是中间人 Mallory 的，否则公钥加密得到的密文就会被 David 之外的人解密，失去效．公钥加密对公钥的递送有很高的要求，尤其是，公钥在递送中切不可被篡改、替换或伪造，否则就会使公钥加密方法失去效果，造成很严重的信息泄露问题.

## 通过第三方签名的方式来解决公钥递送问题

### 德高望重的 Viktor

就拿我们前面举的这个例子来说， David 无法把公钥 \\( p \\) 远程地委托中间人 Mallory 递送给 Bob ，就算 Bob 收到了一个来源不明的私钥 \\( p_x \\) ，仅根据 \\( p_x \\) ， Bob 无法确定 \\( p_x \\) 就是 David 的公钥 \\( p \\) ，因此也不能放心地使用来源不明的自称是 David 的公钥 \\( p_x \\) 给 David 发送密信.

设想有这么一位德高望重的好朋友他叫 Viktor ， Viktor 受 David 和 Bob 的信任，并且 David 和 Bob 之前都跟 Viktor 见过面， David 、 Bob 和 Viktor 都很确定自己有着真实未被篡改的 Viktor 的公钥 \\( p_v \\) .

### 散列函数与散列值

继续说下去之前，必须要知道散列函数 \\( h: \mathbb{Z} \mapsto \mathbb{D} \\) ，其中 \\( \mathbb{D} \subset \mathbb{Z} \\) ， \\( \mathbb{D} \\) 是有限个整数组成的集．对于 \\( h \\) ，我们只需知道，如果 \\( x \neq y \\) 那么几乎可以确定 \\( h(x) \neq h(y) \\) ，并且几乎不可能在仅仅知道 \\( h(x) \\) 的情况下以任何方式计算出 \\( x \\) ，特例发生的概率大概不超过百万分之．于是，我们把 \\( h \\) 叫做「散列函数」(Hash Function,  `hashfunc` )，而把 \\( h(x) \\) 叫做 \\( x \\) 的「散列值」(Hash Value,  `hashval` ).

### 给公钥「签名」

为了即使通过中间人 Mallory 也能让 Bob 收到 David 的真正的公钥 \\( p_{\text{david}} \\) ， David 和 Viktor 进行一次会面， Viktor 给 David 的公钥签名，然后把 Viktor 把「签名」给 David ，具体是这样的：

1. 首先 Viktor 计算 David 的证书 \\( p_{\text{david}} \\) 的散列值 \\( h(p_{\text{david}}) \\) .
2. 然后 Viktor 用自己的私钥对 \\( h(p_{\text{david}}) \\) 加密， Viktor 计算 \\( h_e = f_d(q_v, h(p_{\text{david}})) \\) ，你只需知道 \\( f_d \\) 和 \\( f_e \\) 是可以互相转化．这里的 \\( h_e \\) 就是「签名」，就是 David 的公钥 \\( p_{\text{david}} \\) 的签名.

David拿到了 Viktor 给自己证书的签名 \\( h_e \\) ，就可以放心大胆地，把自己的公钥 \\( p_{\text{david}} \\) 交由任何人递送给 Bob 了，仅仅要求，在递送公钥 \\( p_{\text{david}} \\) 时，必须连同签名一起

\\[
\text{David} \rightarrow \text{Mallory}([p_{\text{david}}, h_e]) \rightarrow \text{Bob}
\\]

Bob收到$[p_x, h_{ex}]$后，要验证 \\( p_x \\) 是不是 \\( p_{\text{david}} \\) 其实也很简单：

1. Bob首先解密 \\( h_{ex} \\) ， Bob 计算 \\( h_x = f_e(p_v, h_{ex}) \\) ，也就是利用 Viktor 的公钥 \\( p_v \\) 和 \\( f_d \\) 的反函数 \\( f_e \\) 来由 \\( h_{ex} \\) 反算出 \\( h_x \\) ，如果一切没问题，现在得到的 \\( h_x \\) 应该等于 Viktor 之前计算的 \\( h(p_{\text{david}}) \\) 

2. Bob计算 \\( h_y = h(p_x) \\) ，相当于 Bob 也对这个公钥做一次散列运算，就跟 Viktor 对 David 的公钥做散列运算一样，如果 Mallory 没做任何篡改，那么肯定会有 \\( h_y=h_x \\) 

因为如果 Mallory 篡改了 \\( p_x \\) ，使 \\( p_x \\) 不再等于 \\( p_{\text{david}} \\) ，那么 \\( h(p_x) \\) 也就不再等于 \\( h_(p_{\text{david}}) \\) ， Mallory 很难通过篡改 \\( h_e \\) 来使得 \\( h_e \\) 解密后得到的 \\( h_d \\) 等于篡改了的 \\( p_x \\) 的散列值 \\( h(p_x) \\) ，因此 Mallory 如果对递送的公钥或者公钥签名做了任何动作，一定会被发现.

我知道上面这个过程多少有些抽象，为此，我画了一幅图，描述了签名、递送和验证的过程：

![figure](/openssl-certificates/sign-send-verify.png)

图中对签名的描绘很好理解，而在验证过程中的第3步， Bob 首先对 `ehashval x` 解密，就相当于签名图示中三角形△所示的步骤，然后对 `data x` 计算散列值，相当于签名图示中圆形○所示的步骤，如果数据在递送中没有被串改，解密 `ehashval x` 得到的 `hashval x` 应该等于由数据 `data x` 算出来的散列值 `hashval d` .

希望你已经大概理解了签名和验证的概念.

## CA、HTTPS 证书和信任链

在介绍 HTTPS 证书如何实现客户端和服务器之间的双向加密之前，我想先讲另外一个例子：

网站的内容是以文件的形式存储在服务器中的，浏览器要打开一个网站，就要和提供这个网站的内容的服务器建立连接，譬如说，我想打开 `cloudflare.com` 这个网站，那么

![figure](/openssl-certificates/curl-open-cloudflare-ip.png)

那么客户端会首先尝试查询 `cloudflare.com` ，也就是网站的域名，所对应的IP地址，这里得到的 `cloudflare.com` 的IP地址是 `104.17.176.85` ，然后客户端才向 `104.17.176.85` 这台服务器请求 `cloudflare.com` 的内．域名 `cloudflare.com` 和IP地址 `104.17.176.85` 的关系，就像是建筑名和详细地址的关系.

但是要注意到这么一点，假使我们打开的是一个银行网站 `www.abank.com` ，首先客户端会向 DNS 服务器发起请求，询问 `www.abank.com` 的IP地址是多少， DNS 服务器回答了正确的IP地址，但是无论是 DNS 查询的请求还是响应都是要经过中间人 Mallory ， Mallory 把 DNS 服务器返回的结果`(www.abank.com, 104.17.176.85)`中的IP地址字段换成自己制作的假冒的银行网站的服务器`(www.abank.com, 52.17.17.2)`，用户的客户端接着就会把 `52.17.17.2` 这个服务器看成是银行网站 `www.abank.com` 的服务器，就会打开假冒的银行网站而不是正规的银行网站，用户接下来输入的账号和密码都会传到恶意的中间人 Mallory 的假冒银行网站的服务器 `52.17.17.2` 而非正规的银行网站的服务器 `104.17.176.85` ，从而造成用户的账号密码泄．打个比方，就好像是张三（无辜）问路人丙（恶意）银行在哪我要去存钱，结果路人丙给张三指路指向了一家骗子机构，张三信以为真那是银行，于是张三去了骗子机构存钱.

HTTPS证书是为了防止刚才说的这种事情的发．具体地， HTTPS 协议能够保证：当张三使用 HTTPS 协议打开银行网站 `www.abank.com` ，如果客户端连接到的是骗子的服务器而不是正规的银行网站的服务器，那张三一定会被告． HTTPS 就是那个好心的路人甲，当路人丙告诉张三的是骗子机构而非正规的银行机构时，跳出来揭穿路人丙并提醒张三的路人甲.

![figure](/openssl-certificates/browser-prompt-that-the-website-is-not-safe.png)

HTTPS协议是怎样做到这一点的？ HTTPS 协议是根据什么来判断：假如说服务器x声称它能够提供网站 domainx.com 的页面，那服务器x是否真的是 domainx.com 的合法内容提供者？

回顾上一节，我们说到，即使 David 的公钥仍然通过不可信的中间人 Mallory 递送，只要公钥和公钥的签名一起递送，那么 Bob 收到数据后，还是可以拿 Viktor 的公钥来验证 Viktor 对公钥的签名，并且如果公钥或者签名在递送中被篡改了，一定会验证失败，这从而确保了（与签名一起递送的）公钥在递送过程中的不可篡改性（至少，如果篡改了会有提示，可看做是递送失败．也就是说，通过引入第三方的签名机构（所有人都有这个第三方签名机构的公钥），可以实现在不可靠的信道上递送敏感数据，同时还可确保敏感数据不被篡改（完整性．一句话说就是，这种基于权威第三方的签名机制可以一定程度上保证数据的完整性（至少当数据完整性被破坏时会有某种告警机制）.

那为什么我们会提到这个通过权威第三方签名来保证数据完整性的例子？事实上，一个服务器要想向别人证明自己是 ` domainx.com ` 的合法内容提供者，按照我们上面说到的用权威第三方签名来确保数据完整性的例子，它需要有主体是 `domainx.com` 的一对公私钥（ domainx.com 对应 David ），以及 CA 的对 `domainx.com` 的证书（证书可以简单地看做公钥附上一些必要的主体身份信息）的签．浏览器和服务器建立连接，并且浏览器告知服务器要请求的域名（比如说是 domainx.com ），服务器为了证明自身提供相应内容的合法性，会提供相应域名的证书（ domainx.com 的证书），一个证书，你可以看做是一个包含了网站主体信息和站长的公私钥和 CA 的签名的一个文．由于现代操作系统中存储有许多 CA 的公钥，因此操作系统能够验证 CA 对网站证书的签名，而验证了 CA 对网站证书的签名，就等同于验证了网站证书的完整性在递送过程中没有受到影响（未受篡改），由于网站的证书还包含了站长的公钥，因此，浏览器可以拿这个公钥来验证证书上面声称的主体信息（例如证书声称这个证书对应的主体常用名称是 domainx.com ），可以看做是，拿站长的公钥，来验证站长对证书的签名.

![figure](/openssl-certificates/the-chain-of-trust-also-full-chain.png)

首先用户相信自己的操作系统存储的钥匙环并没有被恶意篡改，然后浏览器会使用操作系统钥匙环中存储着的 CA 的公钥的散列值验证收到的证书中的 CA 公钥的完整性，证明了 CA 公钥的完整性之后，在用 CA 的公钥来验证 CA 的证书的完整性，其中， CA 的证书也含有 CA 的主体信息和 CA 的公钥，在证明了 CA 的证书的完整性之后，再用 CA 的公钥来验证网站证书的完整性，因为网站证书有 CA 的签名，所以可用 CA 的公钥来验证 CA 在网站证书中的签名，然后，证明了网站证书的完整性之后，可以拿网站证书的站长公钥，来验证网站证书的完整性，从而保证网站证书中的网站主体信息没有被篡改，然后浏览器比较网站证书中的主体信息的「常用主体名称」字段和当前请求的域名是否匹配，如果匹配，则整个网站证书验证过程成功完成，即证明浏览器收到了的响应是来自合法的服务器.

由此，我们就引出了「信任链」的概念，验证也可以看成是一种信任，因为你相信验证结果具有意义，即，你「信任」这个验证得出的结．用户信任操作系统的钥匙环的完整性，操作系统的钥匙环信任 CA 不会给不合法的服务器签发要请求的网站的证书， CA （经过调查和服务器完成主体授权挑战）信任该服务器有资格提供相应的域名的内容从而签发证书，再结合验证过程，就实现了

```
用户 --- 信任 --> 操作系统 并且

操心系统 --- 信任 --> CA 并且

CA --- 信任 --> 网站与服务器主体身份一致性
```

的这么样的一条信任链或者叫验证链.

信任链事实上也可以推广到更广泛的话题上，例如，消费者信任超市的食品的质量和安全性，超市信任供应商的食品的质量和安全性，供应商信任生产食品的农民．从而实现了消费者对食品安全的信．或者，就投资而言，客户信任基金经理，基金经理信任投资对象的经营者的经营能力，而投资对象的经营者信任市场前景，因而也就实现了客户对资金投资收益前景的信．

整个信任链条中最基本的受信任节点，被称作「信任锚」(trust anchor)，在 HTTPS 验证涉及到的信任链中， CA 运营主体的道德品质和守法程度被看做是信任锚，我们相信 CA 不会违背职业道德，给别的未经过足够主体身份信息核对的服务器也签发自己网站的证书，我们还相信 CA 会妥善保管自己的私钥使之不被泄露，因而我们相信 CA ，这就是 CA 作为「信任锚」的原．信任锚，就是信任最初产生的地方.

实际生产环境中，验证 HTTPS 证书所涉及到的信任链往往不止2层，可能有3层甚至4层（例如亚马逊 AWS 的网站），更加复杂的情况也有，比如说交叉信任链，但这不在我们的讨论范围内.

![figure](/openssl-certificates/a-trust-chain-of-length-three.png)

![figure](/openssl-certificates/a-trust-chain-of-length-four.png)

拥有四层证书信任链的证书一般是颁发给较为复杂且对灵活性和合规性要求较高的业务，最底层的根证书的私钥需要受到极其严密的保护，不过大多数情况，还是三层证书居多，这样可以保证最底层的根证书的私钥极少使用，而要签发网站证书，只要用到二级 CA 的私钥，这里，拿cloudflare.com举例，签发根证书的 CA 叫做DigiCert High Assurance EV Root CA，也叫根 CA ，而二级 CA 叫做DigiCert ECC Extended Validation Server CA，也叫二级 CA 或者服务器 CA ，一般来说根 CA 负责给二级 CA 的证书签名（从而大家得以验证二级 CA 的证书的完整性），而二级证书的 CA 给网站证书签名（从而大家得以验证网站证书的完整性），二级证书的 CA 的私钥会常被用到，而根 CA 的私钥则事实上受到了良好的保护，因为它极少会被访问到和使用到.

3层或者是4层的网站证书的验证，和最开始我们演示的：2层网站证书的验证，过程是类似的，浏览器借助操作系统的钥匙环验证根 CA 证书的完整性，再借助根 CA 证书验证2级 CA 证书的完整性，再借助2级 CA 证书验证网站证书的完整性，再借助网站证书的公钥验证网站证书表明的主体信息的完整性，以此来完成整个 HTTPS 证书链的验证.

## 和服务器建立双向的加密信道

我们知道，借助于一个主体的公钥，我们可以使用这个公钥向拥有这个公钥的主体发送加密信息，而发送的这些加密信息，只有公钥的所属主体才能用公钥对应的私钥来解密取得明．譬如说， David 拥有 Bob 的公钥，那么 David 可以向 Bob 发送加密信息，而如果 Bob 有 David 的公钥， Bob 也可以向 David 发送加密信息.

现在的问题是，浏览器根据 HTTPS 协议完成了对服务器发来的证书的完整性的检验，已经确保该证书未被篡改且该证书表明的主体名称正匹配得上浏览器正在访问的网站的域名，那么无疑浏览器可以发送加密信息给服务器，而服务器又没有浏览器的公钥，服务器怎么能够给浏览器发送加密信息呢？事实上是不能直接发送，但是通过一种叫Diffie-Hellman key exchange的方法，再基于浏览器能够向服务器发送加密信息的这一事实（尽管服务器一开始不能直接向浏览器发送加密信息），浏览器能够和服务器同时算出一个整数，这个整数只有浏览器和服务器知道，任何第三方都不知道，因而，被称作Shared Secret，即「共享的秘密」，再由这个「共享的秘密」，浏览器和服务器可以实现对称加密，即浏览器和服务器使用同一套密码来对要发送的消息和收到的消息进行加解密，以此实现浏览器和服务器双向的加密通信，而不再仅仅是单向的.

这么说可能不够具体，细说一下这个「共享秘密」是如何算出来的的也无妨.

### 原根

Definition (primitive root):  \\( g \\)  is a primitive root modulo  \\( n \\)  iff. for all  \\( x \\) , where  \\( x \\)  coprime to  \\( n \\) , there exist a least an integer  \\( k \\)  such that  \\( g^k \equiv x (\text{mod } n) \\) .

也就是说如果 \\( g \\) 这个整数是 \\( n \\) 的原根的话，那必定得对每一个和 \\( n \\) 互质的数 \\( x \\) ，都能找到某个整数 \\( k \\) 使得 \\( g^k \\) 和 \\( x \\) 模 \\( n \\) 同．这时我们说： \\( g \\) 是 \\( n \\) 的原根.

下面我们举一个例子，比如说， \\( 3 \\) 这个数呢它是 \\( 7 \\) 的原根，怎么验证这一点呢？且看

\begin{align*}
3^1 \equiv 3 (\text{mod } 7) \\\\
3^2 \equiv 2 (\text{mod } 7) \\\\
3^3 \equiv 6 (\text{mod } 7) \\\\
3^4 \equiv 4 (\text{mod } 7) \\\\
3^5 \equiv 5 (\text{mod } 7) \\\\
3^6 \equiv 1 (\text{mod } 7) 
\end{align*}

也就是说为了验证 \\( 3 \\) 是 \\( 7 \\) 的原根，我们分别算了从 \\( 3 \\) 的 \\( 1 \\) 次方一直到 \\( 3 \\) 的 \\( 6 \\) 次方的值，然后再把每个数都对 \\( 7 \\) 取余数，比如说， \\( 3 \\) 的 \\( 4 \\) 次方除以 \\( 7 \\) ，余数是 \\( 4 \\) ，所以呢， \\( 3 \\) 的 \\( 4 \\) 次方和 \\( 4 \\) 这两个数是模 \\( 7 \\) 同余的，同样地， \\( 3 \\) 的 \\( 6 \\) 次方除以 \\( 7 \\) ，余数呢是 \\( 1 \\) ，所以说， \\( 3 \\) 的 \\( 6 \\) 次方和 \\( 1 \\) 这两个数之间有这么一种叫做模 \\( 7 \\) 同余的关系.

我们为什么要这么算呢？为什么要把 \\( 3 \\) 的 \\( 1 \\) 次方一直到 \\( 3 \\) 的 \\( 6 \\) 次方统统算一遍然后再分别对 \\( 7 \\) 取余数呢？我们且看同余符号 \\( \equiv \\) 的右边，你可能已经注意到了，同余符号右边的数字，实际上包括了 \\( 1 \\) 到 \\( 6 \\) 这个范围的每一个数，同余号右边有 \\( 3,2,6,4,5,1 \\) ，可以看到 \\( 1 \\) 到 \\( 6 \\) 这个范围的每一个数都在里面．我们再回顾一下原根的定义，定义说要对「每一个」和 \\( n \\) 互质，这里 \\( n \\) 是 \\( 7 \\) ，每一个和 \\( 7 \\) 互质的数 \\( x \\) 都要能找到一个正整数 \\( k \\) 使 \\( g \\) ，这里 \\( g \\) 是 \\( 3 \\) ，使 \\( g^k \equiv x (\text{mod } n) \\) 成立，注意到这么一个事实，如果一个数 \\( x \\) 它和 \\( 7 \\) 互质，那么这个数 \\( x \\) 对 \\( 7 \\) 取得的余数必定不是 \\( 0 \\) ，也就是实际上就有 \\( x \equiv a (\text{mod } n), a=1,2,3,4,5,6 \\) ，这种关系，现在呢，对上面那一排式子我们改写一下：

\begin{align*}
3^1 \equiv 3 \equiv x_3 (\text{mod } 7) \\\\
3^2 \equiv 2 \equiv x_2 (\text{mod } 7) \\\\
3^3 \equiv 6 \equiv x_6 (\text{mod } 7) \\\\
3^4 \equiv 4 \equiv x_4 (\text{mod } 7) \\\\
3^5 \equiv 5 \equiv x_5 (\text{mod } 7) \\\\
3^6 \equiv 1 \equiv x_1 (\text{mod } 7) 
\end{align*}

其中的 \\( x_i \\) 表示所有和 \\( 7 \\) 互质的数当中余数是 \\( i \\) 的，所以呢， \\( x_1,x_2,\cdots,x_6 \\) 实质上就足以表示所有的和 \\( 7 \\) 互质的数了（模 \\( 7 \\) 剩余类．任何一个和 \\( 7 \\) 互质的数，它必定会是 \\( x_1,\cdots,x_6 \\) 之中的某一个，而对 \\( x_1,\cdots,x_6 \\) 我们再看同余号左边，实质上都是 \\( g^k \\) 的这种形式，都能找到这样的正整数 \\( k \\) 使同余关系式成立，从而我们就证明了 \\( 3 \\) 这个数它是 \\( 7 \\) 的这么样的一个原．证明完成啦.

下面我们再举一个例子，看为什么 \\( 4 \\) 这个数并不是 \\( 7 \\) 这个数它的一个原．还是用的是差不多的验证方法，且看

\begin{align*}
4^1 \equiv 4 (\text{mod } 7) \\\\
4^2 \equiv 2 (\text{mod } 7) \\\\
4^3 \equiv 1 (\text{mod } 7) \\\\
4^4 \equiv 4 (\text{mod } 7) \\\\
4^5 \equiv 2 (\text{mod } 7) \\\\
4^6 \equiv 1 (\text{mod } 7) \\\\
4^7 \equiv 4 (\text{mod } 7) \\\\
4^8 \equiv 2 (\text{mod } 7) \\\\
4^9 \equiv 1 (\text{mod } 7) \\\\
4^{10} \equiv 4 (\text{mod } 7) \\\\
4^{11} \equiv 2 (\text{mod } 7) \\\\
\end{align*}

你能看到右边是重复的，我多算几步是为了提示大家最多只算到 \\( 6 \\) 次方就够了，这里其实算到 \\( 4 \\) 次方就已经能看到循环了，就可以不用再往下算了，因为右边的余数它是会循环的，循环的周期最大是 \\( n-1 \\) ，这里 \\( n \\) 是 \\( 7 \\) ，所以循环周期就是 \\( 7-1 \\) 就是 \\( 6 \\) .

我们从上面的式子组可以看到，对于 \\( x_3,x_5,x_6 \\) ，也就是对于所有和 \\( 7 \\) 互质的数当中，余数为 \\( 3 \\) 或者 \\( 5 \\) 或者 \\( 6 \\) 的哪些，都不会有 \\( k \\) 使得 \\( 4^k \equiv x_3 (\text{mod } n) \\) ， \\( 4^k \equiv x_4 (\text{mod } n) \\) ，或者是 \\( 4^k \equiv x_6 (\text{mod } n) \\) ，因为左边的那个 \\( k \\) 它再怎么加，右边的余数也是循环出现的那几个，不会有 \\( 3 \\) ， \\( 5 \\) 或者 \\( 6 \\) ，所以，根据定义， \\( 4 \\) 这个数它不是 \\( 7 \\) 这个数的原根.

讲到这里希望您已经对「原根」(primitive root)这个概念有了一个最基本的了．接下来可以开始讲解迪菲-赫尔曼密钥交换过程了.

### Diffie–Hellman key exchange

迪菲赫曼密钥交换方法可以用于在可确保接收方身份的公开信道上，通过一系列模 \\( p \\) 剩余类环上的乘法运算，使参与双方最终都计算出同一个「共享秘密」(shared secret).

首先一般来说参与双方会选择一个比较大的质数 \\( p \\) ，和这个质数 \\( p \\) 的一个原根 \\( g \\) ，这个讨论可以在公开信道上进行，在启用了 HTTPS 的情况下浏览器干脆可以把 \\( p \\) 和 \\( g \\) 加密发送给服务．在这里作为演示我们只选择了 \\( p=29 \\) ，也就是第10个质数，而 \\( g \\) 可以不用取太大，这里取 \\( g=2 \\) 也没关系，是原根就行.

我们假设参与的其中一方叫做 Alice ，另一方叫做 Bob ，然后 Alice 首先挑选一个自己知道的秘密，可以是随机挑选的，比较大的数， \\( a \\) ，也就是说这个秘密数 \\( a \\) 只有 Alice 知道，这里用作演示我们选了 \\( a=32 \\) ，然后 Alice 计算要在公开信道上发送给 Bob 的 \\( A \\) ， \\( A \\) 等于

\\[
A = g^a \\; \text{mod} \\;  p
\\]

也就是 \\( g \\) 的 \\( a \\) 次方对 \\( p \\) 取余数，这里我们算得 \\( A=16 \\) ，然后发送给Bo．

与此同时， Bob 也会选择自己的秘密数，这里 Bob 选择了 \\( b=219 \\) ，同样的， \\( b \\) 实际上也应该选择大一些的数为了安全，但是作为演示，我们只选了219，然后同样的 Bob 也计算要在公开信道上发送给 Alice 的数 \\( B=g^b \\; \text{mod} \\; p \\) ， Bob 算得 \\( B=10 \\) ，然后 Bob 把 \\( 10 \\) 发送给 Alice .

Alice在收到 \\( B=10 \\) 这个讯息之后， Alice 会计算 \\( s=B^a \\; \text{mod} \\; p\\)， Alice 算得 \\( s=24 \\)． Bob 在收到 \\( A=16 \\) 之后，类似地计算 \\( s=A^b \\; \text{mod} \\; p \\)， Bob 刚好也算得 \\( s=24 \\) ，但这其实不是巧．其中的 \\( a \\) 和 \\( b \\) 也就是刚才 Alice 和 Bob 自己挑选的秘密数.

在这期间，中间人 Mallory 可能会知道 \\( p=29, g=2, A=16, B=10 \\) ，但是 Mallory 不知道 \\( a=32, b=219, s=24 \\) ，而最终 Alice 和 Bob 都算出了 \\( s=24 \\) ，于是之后他们得以用 \\( s=24 \\) 这个只有他俩知道的共享秘密来构建一个双向对称加密信道.

下表中的每一行对应每一个 DHKE 方法中的每一个过程或者说每一个阶段，各列列出的是参与方（也包括中间人 Mallory ）知道的和不知道的信息.

![figure](/openssl-certificates/dhke-information-table.png)

值得注意的是，参与方必须要确认对方是对方， Alice 在收到信息之后，必须要确定那是 Bob 发来的，同样 Bob 在收到信息之后，也必须要确定那是 Alice 发来的，否则应当终止 DHKE ，因为在不能够确认对方身份的情况下，有可能是 Mallory 对 Alice 伪装成 Bob ，同时 Mallory 也对 Bob 伪装成 Alice ，这样 DHKE 方法计算出来的 \\( A, B \\) 和 \\( s \\) 实际上也会被 Mallory 截取，这叫做「中间人攻击」， DHKE 方法面临中间人攻击时会变得不再安全.

通过上面的讲解呢，希望您已经了解通过 DHKE 方法在公开信道上构建共享秘密的基本过程和 DHKE 的基本概念.

### 对称双向加密信道

在通过 DHKE 方法计算出共享秘密之后，浏览器和服务器会根据一个同一个算法，计算出一个主密钥(Masterkey)，然后用这个主密钥同时对要发送的信息进行加密和接收到的信息进行解密，这种加密方法实际上叫做对称加密，实现可以参看 [AES](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard), [RC4](https://en.wikipedia.org/wiki/RC4), [Blowfish](https://en.wikipedia.org/wiki/Blowfish_(cipher)) 等，但实际上不止这些，具体使用哪种对称加密方法，也是通过 HTTPS 协议进行协商．

在这之后，浏览器和服务器就可以进行双向的加密通信了，对于之后的通信过程，浏览器和服务器解密数据后，就按照 HTTP 协议来处理解密得到的数．实际上浏览器也可以通过 HTTPS 证书上的公钥加密地给服务器发送自己的公钥，这样双方都有对方的公钥也能实现双向加密通信，但是公钥加密算法和解密算法所消耗的计算资源一般来说比对称加密的要多得多，加解密速度也会相对慢一些，所以非对称加密仅仅是在前期用于身份认证和构建对称双向加密信道，而一般不用于实际要传输的数据的加解密.

## 申请证书并检视证书

在真正给自己的网站启用 HTTPS 之前，我们知道，首先需要有一个由 CA 签发的 HTTPS 证．现在，对小型的个人博客网站和非商业组织的小型网站而言，大多是申请使用由 [Let's Encrypt](https://letsencrypt.org/) 签发的免费证书，申请成功后会得到由 Let's Encrypt 签发的 HTTPS 证书，过程其实非常简单，配合某些工具，还能够实现证书到期后自动续签（从而自动延长到期时间．当然也有其他方式获取证书，我们会逐一介绍.

### Let's Encrypt

申请 Let's Encrypt 免费证书呢常用两种工具，一种叫 `acme.sh` ，是一段脚本程序，下载到服务器上执行，而另一种叫 `certbot` ，可以由包管理系统比如说 `apt` 进行安装，然后运行 `certbot` 就可以申请证书，这两种工具的原理也非常简单，无非两点：

1. 假如说要申请的证书的主体名称是 domainx.com ，那程序会检查 domainx.com 这个域名是否真的指向当前服务器，比如说程序运行在 `104.17.176.85` 这台服务器上，而这台服务器正在申请 `domainx.com` 的证书，那程序会检查 `domainx.com` 是否真的指向 `104.17.176.85` ，这其实是[ACME](https://en.wikipedia.org/wiki/Automated_Certificate_Management_Environment)协议的一部．还有一种方式不一定是验证服务器是否匹配域名，而是验证站长对 `domainx.com` 的所有权，怎么验证？比如说要求站长在域名 `domianx.com` 上设置某些 DNS 记．总之是验证「正在执行申请 domainx.com 证书的人有管理 domainx.com 域名的 DNS 记录的权限或者 domainx.com 所指向的服务器的权限」，概括来说即「网站管理权」的验证.
2. 向 Let's Encrypt 发送网站管理权的验证结果和要申请的证书的主体信息（CSR文件）， Let's Encrypt 签发后，把签发了的证书发送回来.

要用 `acme.sh` 这个工具申请 Let's Encrypt 证书首先要下载相应的脚本并安装：

```
git clone https://github.com/acmesh-official/acme.sh.git
cd ./acme.sh
./acme.sh --install
```

运行了上述命令之后，如果安装成功了，再运行

```
acme.sh version
```

应该能打印出当前已经安装的 `acme.sh` 的版本号：

```
https://github.com/acmesh-official/acme.sh
v2.8.6
```

接下来我要在哪台服务器申请证书，我就把要申请的证书的域名的唯一一个 A 记录指向哪台服务器，比如说我是在 `172.217.5.78` 这台服务器申请 acme-demo.beyondstars.xyz 这个域名的 TLS 证书，那我就在 DNS 解析商那里把这个 acme-demo.beyondstars.xyz 这个域名的唯一的一条 A 记录指向服务器 `172.217.5.78` ，这里呢 `172.217.5.78` 这个地址是用来举例，你要看你自己的 VPS 服务器也就是你运行 `acme.sh` 程序的那台服务器的IP地址是多少.

![figure](/openssl-certificates/create-a-acme-demo-a-record.png)

大概过几分钟，我们在自己机器上 `ping` 自己设置的这个域名，以我设置的举例，acme-demo.beyondstars.xyz，如果看到IP地址是刚才自己设置的，那就算是 DNS 解析设置成功了，就可以进入下一步了.

首先我们登陆VPS服务器，假如刚才你在 DNS 解析商那里把 `yoursite.com` 指向 `x.x.x.x` 这台服务器，那你就登陆`x.x.x.x`

```
ssh username@x.x.x.x
```

然后创建网站根目录，假如说你的网站在没有开通 HTTPS 之前就已经运作了，那应该是已经有网站根目录了，我们假设网站根目录是位于

```
/var/www/yoursite.com
```

如果还没有网站根目录，也没有网站，那我们以简单易于配置的 Nginx 服务器为例，先创建一个网站根目录

```
mkdir -p /var/www/yoursite.com
```

再在 NginX 配置目录下添加新创建的网站

```
vi /etc/nginx/conf.d/yoursite.com.conf
```

在打开的这个文件中，填入以下内容

```
server {
    listen 80;
    server_name yoursite.com;
    root /var/www/yoursite.com;
}
```

保存并退出vi编辑器后发信号给 `nginx` 进程让其重新加载配置

```
nginx -s reload
```

如果一切正常，应该不会看到报错信．现在 `yoursite.com` 网站应该已经启用成功了，只不过还没有 HTTPS 证书而．下面开始申请证书，用 `acme.sh` 这个工具

```
acme.sh --issue \
--domain yoursite.com \
--webroot /var/www/yoursite.com 

```

申请成功后会看到下列提示，主要是提示申请到的证书的位置是在哪儿.

![figure](/openssl-certificates/on-acme-sh-issue-succeed.png)

要安装 `acme.sh` 申请到的证书从而立刻给网站启用 HTTPS 服务也很简单，acme.sh要求我们把证书复制到一个单独的目录，而不建议直接使用`$HOME/.acme`作为证书目．首先我们新建一个这样的目录：

```
mkdir -p /etc/nginx/certs.d/yoursite.com
```

然后开始复制证书，用的是 `acme.sh` 提供的命令

```
acme.sh --install-cert \
--domain yoursite.com \
--key-file /etc/nginx/certs.d/yoursite.com/key.pem \
--fullchain-file /etc/nginx/certs.d/yoursite.com/fullchain.pem

```

复制成功后运行

```
ls -all /etc/nginx/certs.d/yoursite.com
```

应该会看到列出的 `key.pem` （私钥）和 `fullchaim.pem` （证书），然后我们在 `nginx` 中手动启用 HTTPS ，因为 `acme.sh` 不会像 `certbot` 那样帮我们配置`nginx．首先打开配置文件

```
vi /etc/nginx/conf.d/yoursite.com.conf
```

然后在最后边加入以下内容

```
server {
    listen 443 ssl;
    server_name yoursite.com;
    root /var/www/yoursite.com;
    ssl_certificate /etc/nginx/certs.d/yoursite.com/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs.d/yoursite.com/key.pem;
    ssl_protocols       TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers         HIGH:!aNULL:!MD5;
}
```

保存退出之后，执行

```
nginx -s reload
```

使 `nginx` 重新加载配置文件，之后可以测试看 HTTPS 是否已经启用

```
echo "this is a https-enabled site!" > /var/www/yoursite.com/https-test.html
curl https://yoursite.com/https-test.html

```

注意，为了验证 HTTPS ，上边的 `https` 一定不能是 `http` ，如果一切正常，应该能够看到输出

```
this is a https-enabled site!
```

这就说明您已经成功地通过 `acme.sh` 为您的网站启用 HTTPS 了.

如果仅仅是想查看客户端能否和网站成功地进行 TLS 握手，以`acme-demo.beyondstars.xyz`为例

```
echo "" | 
openssl s_client -brief \
-connect acme-demo.beyondstars.xyz:443 \
-verify_hostname acme-demo.beyondstars.xyz

```

会看到输出

```
CONNECTION ESTABLISHED
Protocol version: TLSv1.2
Ciphersuite: ECDHE-RSA-AES256-GCM-SHA384
Peer certificate: CN = acme-demo.beyondstars.xyz
Hash used: SHA256
Signature type: RSA-PSS
Verification: OK
Verified peername: acme-demo.beyondstars.xyz
Supported Elliptic Curve Point Formats: uncompressed:ansiX962_compressed_prime:ansiX962_compressed_char2
Server Temp Key: X25519, 253 bits
DONE
```

会看到`Verification: OK`，这样就验证了 TLS 握手成功了，当前主机查询到的`acme-demo.beyondstars.xyz`的IP地址对应的服务器能够拿得出合法的`acme-demo.beyondstars.xyz`的 TLS 证书来证明自身提供`acme-demo.beyondstars.xyz`的内容是经过授权的.

否则我们可以尝试向另外一个主机请求`acme-demo.beyondstars.xyz`这个网站，看 TLS 握手的证书验证过程是否会通过：

```
echo "" | 
openssl s_client -brief \
-connect 8.8.8.8:443 \
-servername acme-demo.beyondstars.xyz \
-verify_hostname acme-demo.beyondstars.xyz

```

会看到输出

```
depth=0 C = US, ST = California, L = Mountain View, O = Google LLC, CN = dns.google
verify error:num=62:Hostname mismatch
CONNECTION ESTABLISHED
Protocol version: TLSv1.3
Ciphersuite: TLS_AES_256_GCM_SHA384
Peer certificate: C = US, ST = California, L = Mountain View, O = Google LLC, CN = dns.google
Hash used: SHA256
Signature type: RSA-PSS
Verification error: Hostname mismatch
Server Temp Key: X25519, 253 bits
DONE
```

注意到其中的 `Hostname mismatch` 即表明连接到的服务器无法拿出有效证书完成验证，如果一般情况下发生这样子的情况，可能是 DNS 污染或者中间人攻击导致的.

我们还可以使用 `openssl` 命令和 `sed` 命令下载相应网站的 TLS 证书以供更详细的分析，首先，最简单地，使用`openssl s_client`工具查看 TLS 握手情况：

运行的是这个命令

```
echo "" | 
openssl s_client \
-connect acme-demo.beyondstars.xyz:443 \
-verify_hostname acme-demo.beyondstars.xyz

```

会看到目标网站的一些信息，比如证书的签发者，证书的主体名称，和验证结果等，还有证书内容，还有证书的签发者( CA )的主体名称，但是这里没有打印出签发者的证书内容

```
CONNECTED(00000005)
depth=2 O = Digital Signature Trust Co., CN = DST Root CA X3
verify return:1
depth=1 C = US, O = Let's Encrypt, CN = Let's Encrypt Authority X3
verify return:1
depth=0 CN = acme-demo.beyondstars.xyz
verify return:1
---
Certificate chain
 0 s:CN = acme-demo.beyondstars.xyz
   i:C = US, O = Let's Encrypt, CN = Let's Encrypt Authority X3
 1 s:C = US, O = Let's Encrypt, CN = Let's Encrypt Authority X3
   i:O = Digital Signature Trust Co., CN = DST Root CA X3
---
Server certificate
-----BEGIN CERTIFICATE-----
MIIFajCCBFKgAwIBAgISA0s+9XUzvUX+yEbwT3IQhb7DMA0GCSqGSIb3DQEBCwUA
MEoxCzAJBgNVBAYTAlVTMRYwFAYDVQQKEw1MZXQncyBFbmNyeXB0MSMwIQYDVQQD
ExpMZXQncyBFbmNyeXB0IEF1dGhvcml0eSBYMzAeFw0yMDA0MDcwMjIxNTRaFw0y
MDA3MDYwMjIxNTRaMCQxIjAgBgNVBAMTGWFjbWUtZGVtby5iZXlvbmRzdGFycy54
eXowggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDiS+Q+Ko3o/UtanTOk
SsKGIVbTn6g0MEyqeZcyJGittYSgxGetIerOpM/PUCK7q01xoiIL5BDB9ntge0mx
TVI3uE4oHj3gS8bc01IHfSsXFQ9fiJsHyH9/pTG5aeFCsKY1JzccG/I/eaJg1s+S
D9xsht0alTzOpeMcgDvN0Ah0RJbzgLASUSy82yEuDt5IKD2JzhS/kxWJs4CnKA0M
EtlhlWrG5+6ZDIX8gWaenoiGFWGK6OR2iL1vo7Yw3O2nqVRCfD59XCV6O0C5hgcL
JG9vk3uKfG9hKI7zlHqXV+vrUWtE/kSFb77YQqcwR78AC5Aixv5IVFwQ1DgGyyey
RUvHAgMBAAGjggJuMIICajAOBgNVHQ8BAf8EBAMCBaAwHQYDVR0lBBYwFAYIKwYB
BQUHAwEGCCsGAQUFBwMCMAwGA1UdEwEB/wQCMAAwHQYDVR0OBBYEFNaYRd97HS/m
dE+Aukzr3cwkCouEMB8GA1UdIwQYMBaAFKhKamMEfd265tE5t6ZFZe/zqOyhMG8G
CCsGAQUFBwEBBGMwYTAuBggrBgEFBQcwAYYiaHR0cDovL29jc3AuaW50LXgzLmxl
dHNlbmNyeXB0Lm9yZzAvBggrBgEFBQcwAoYjaHR0cDovL2NlcnQuaW50LXgzLmxl
dHNlbmNyeXB0Lm9yZy8wJAYDVR0RBB0wG4IZYWNtZS1kZW1vLmJleW9uZHN0YXJz
Lnh5ejBMBgNVHSAERTBDMAgGBmeBDAECATA3BgsrBgEEAYLfEwEBATAoMCYGCCsG
AQUFBwIBFhpodHRwOi8vY3BzLmxldHNlbmNyeXB0Lm9yZzCCAQQGCisGAQQB1nkC
BAIEgfUEgfIA8AB2APCVpFnyANGCQBAtL5OIjq1L/h1H45nh0DSmsKiqjrJzAAAB
cVKooAgAAAQDAEcwRQIgb/6rjUn6mv2Zqn0UwCvjyLfPynPkY+nc3oK6iNeveDYC
IQDUXJXDA7Q3gUY5qaXbbuE76bgOJknoPzIDKYXeI2SZDAB2AAe3XBvlfWj/8bDG
HSMVx7rmV3xXlLdq7rxhOhpp06IcAAABcVKooFQAAAQDAEcwRQIhAJKJy5MpC8TQ
CoGRd+MTsn9AD+j4jFwgZiBhW079rPFcAiAwSJUS6zZzDX8poRJXxcfy120rc5v4
gF3ZbXOnXMZ/2zANBgkqhkiG9w0BAQsFAAOCAQEABDTN/Af/e5sx4lkd1Vm9yw0L
dSe6pbgRHK7bdhj7QKdl5/ExsyyM1mOdJdZwVQRJ2PpWnbyCOHrH4cpvN8Un8z8z
r4ta35QGvXi+LpC98FD0vfr3xCLfHXdi2Uh44ukKfoIGONpSi9F6O2ibRDBuyJ48
1lCIUvJSHF7Pz1dV4gGOQx8w6Jkha7IU6oXa5GnBI23yjmB/Jj+V9rq/oj/mS9mz
TYgUtut6go4yai4BEWzgvlf3Lzex6WBQYhDYSIxFOZbrlPRKN5AHb1WtVaQUpix0
DrkKWJ/HkiwkqwDD+962bG62zox2tG+p7N9lWFEdyT0jglC4a57hR0g9tUhPNA==
-----END CERTIFICATE-----
subject=CN = acme-demo.beyondstars.xyz

issuer=C = US, O = Let's Encrypt, CN = Let's Encrypt Authority X3

---
No client certificate CA names sent
Peer signing digest: SHA256
Peer signature type: RSA-PSS
Server Temp Key: X25519, 253 bits
---
SSL handshake has read 3244 bytes and written 420 bytes
Verification: OK
Verified peername: acme-demo.beyondstars.xyz
---
New, TLSv1.2, Cipher is ECDHE-RSA-AES256-GCM-SHA384
Server public key is 2048 bit
Secure Renegotiation IS supported
Compression: NONE
Expansion: NONE
No ALPN negotiated
SSL-Session:
    Protocol  : TLSv1.2
    Cipher    : ECDHE-RSA-AES256-GCM-SHA384
    Session-ID: 3818012F5B90D6CF3615028C0AF679DF5552914DED8904180E58F2C904CE32E7
    Session-ID-ctx:
    Master-Key: 0353E57EAA12C4E91D0D1D88444B608A9DB58D73AE4C79D2DB0CE98498241218BC5E997C880DD88F2AC66EE1C84CFE2F
    PSK identity: None
    PSK identity hint: None
    SRP username: None
    TLS session ticket lifetime hint: 300 (seconds)
    TLS session ticket:
    0000 - 64 29 1e 78 29 d5 59 ba-72 1b e8 6d 1a bc 40 10   d).x).Y.r..m..@.
    0010 - cc e9 bd 2e 06 3f 41 6d-57 70 36 26 48 10 e6 5e   .....?AmWp6&H..^
    0020 - de 93 8d 63 d0 38 33 17-78 11 12 89 5d 19 cf 59   ...c.83.x...]..Y
    0030 - 39 05 25 15 0c 8b 4f bf-f3 b8 12 28 fb e2 00 97   9.%...O....(....
    0040 - 6b b6 10 0c a4 1b 67 d5-68 6e a7 14 69 dd 00 cf   k.....g.hn..i...
    0050 - e4 42 06 86 da 2e 23 fc-7f be 51 b0 c9 4d 1d d9   .B....#...Q..M..
    0060 - 3b f5 e6 13 d5 4c 08 07-6a fc 49 28 1a 00 02 ff   ;....L..j.I(....
    0070 - 94 92 46 f0 ed 9f d2 a8-43 30 87 cb 17 4c 86 79   ..F.....C0...L.y
    0080 - 0e 5e c3 50 33 0d 7a a7-64 1e 29 98 7b 9a 5d f4   .^.P3.z.d.).{.].
    0090 - 28 61 6c e8 8e fd 92 27-d2 0c c7 61 87 54 ae 94   (al....'...a.T..
    00a0 - 8d 51 7b a7 84 18 1b 0e-bf fc 92 e0 f7 53 93 8c   .Q{..........S..
    00b0 - 29 ce c9 d1 9a 1a 8e d4-08 10 f8 bc b7 9b 0a 65   )..............e
    00c0 - 9d e8 e2 72 0a 46 bb af-0e 6a 97 d2 cb 38 32 e9   ...r.F...j...82.

    Start Time: 1586244626
    Timeout   : 7200 (sec)
    Verify return code: 0 (ok)
    Extended master secret: yes
---
DONE
```

上面这段信息字可能比较多，我们也可以只看证书的一些信息，用这个命令

```
echo "" | 
openssl s_client \
-connect acme-demo.beyondstars.xyz:443 \
-verify_hostname acme-demo.beyondstars.xyz | 
openssl x509 -noout -text

```

输出结果相比前面的更加详细地显示了证书的信息

```
depth=2 O = Digital Signature Trust Co., CN = DST Root CA X3
verify return:1
depth=1 C = US, O = Let's Encrypt, CN = Let's Encrypt Authority X3
verify return:1
depth=0 CN = acme-demo.beyondstars.xyz
verify return:1
Certificate:
DONE
    Data:
        Version: 3 (0x2)
        Serial Number:
            03:4b:3e:f5:75:33:bd:45:fe:c8:46:f0:4f:72:10:85:be:c3
        Signature Algorithm: sha256WithRSAEncryption
        Issuer: C = US, O = Let's Encrypt, CN = Let's Encrypt Authority X3
        Validity
            Not Before: Apr  7 02:21:54 2020 GMT
            Not After : Jul  6 02:21:54 2020 GMT
        Subject: CN = acme-demo.beyondstars.xyz
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                RSA Public-Key: (2048 bit)
                Modulus:
                    00:e2:4b:e4:3e:2a:8d:e8:fd:4b:5a:9d:33:a4:4a:
                    c2:86:21:56:d3:9f:a8:34:30:4c:aa:79:97:32:24:
                    68:ad:b5:84:a0:c4:67:ad:21:ea:ce:a4:cf:cf:50:
                    22:bb:ab:4d:71:a2:22:0b:e4:10:c1:f6:7b:60:7b:
                    49:b1:4d:52:37:b8:4e:28:1e:3d:e0:4b:c6:dc:d3:
                    52:07:7d:2b:17:15:0f:5f:88:9b:07:c8:7f:7f:a5:
                    31:b9:69:e1:42:b0:a6:35:27:37:1c:1b:f2:3f:79:
                    a2:60:d6:cf:92:0f:dc:6c:86:dd:1a:95:3c:ce:a5:
                    e3:1c:80:3b:cd:d0:08:74:44:96:f3:80:b0:12:51:
                    2c:bc:db:21:2e:0e:de:48:28:3d:89:ce:14:bf:93:
                    15:89:b3:80:a7:28:0d:0c:12:d9:61:95:6a:c6:e7:
                    ee:99:0c:85:fc:81:66:9e:9e:88:86:15:61:8a:e8:
                    e4:76:88:bd:6f:a3:b6:30:dc:ed:a7:a9:54:42:7c:
                    3e:7d:5c:25:7a:3b:40:b9:86:07:0b:24:6f:6f:93:
                    7b:8a:7c:6f:61:28:8e:f3:94:7a:97:57:eb:eb:51:
                    6b:44:fe:44:85:6f:be:d8:42:a7:30:47:bf:00:0b:
                    90:22:c6:fe:48:54:5c:10:d4:38:06:cb:27:b2:45:
                    4b:c7
                Exponent: 65537 (0x10001)
        X509v3 extensions:
            X509v3 Key Usage: critical
                Digital Signature, Key Encipherment
            X509v3 Extended Key Usage:
                TLS Web Server Authentication, TLS Web Client Authentication
            X509v3 Basic Constraints: critical
                CA:FALSE
            X509v3 Subject Key Identifier:
                D6:98:45:DF:7B:1D:2F:E6:74:4F:80:BA:4C:EB:DD:CC:24:0A:8B:84
            X509v3 Authority Key Identifier:
                keyid:A8:4A:6A:63:04:7D:DD:BA:E6:D1:39:B7:A6:45:65:EF:F3:A8:EC:A1

            Authority Information Access:
                OCSP - URI:http://ocsp.int-x3.letsencrypt.org
                CA Issuers - URI:http://cert.int-x3.letsencrypt.org/

            X509v3 Subject Alternative Name:
                DNS:acme-demo.beyondstars.xyz
            X509v3 Certificate Policies:
                Policy: 2.23.140.1.2.1
                Policy: 1.3.6.1.4.1.44947.1.1.1
                  CPS: http://cps.letsencrypt.org

            CT Precertificate SCTs:
                Signed Certificate Timestamp:
                    Version   : v1 (0x0)
                    Log ID    : F0:95:A4:59:F2:00:D1:82:40:10:2D:2F:93:88:8E:AD:
                                4B:FE:1D:47:E3:99:E1:D0:34:A6:B0:A8:AA:8E:B2:73
                    Timestamp : Apr  7 03:21:54.952 2020 GMT
                    Extensions: none
                    Signature : ecdsa-with-SHA256
                                30:45:02:20:6F:FE:AB:8D:49:FA:9A:FD:99:AA:7D:14:
                                C0:2B:E3:C8:B7:CF:CA:73:E4:63:E9:DC:DE:82:BA:88:
                                D7:AF:78:36:02:21:00:D4:5C:95:C3:03:B4:37:81:46:
                                39:A9:A5:DB:6E:E1:3B:E9:B8:0E:26:49:E8:3F:32:03:
                                29:85:DE:23:64:99:0C
                Signed Certificate Timestamp:
                    Version   : v1 (0x0)
                    Log ID    : 07:B7:5C:1B:E5:7D:68:FF:F1:B0:C6:1D:23:15:C7:BA:
                                E6:57:7C:57:94:B7:6A:EE:BC:61:3A:1A:69:D3:A2:1C
                    Timestamp : Apr  7 03:21:55.028 2020 GMT
                    Extensions: none
                    Signature : ecdsa-with-SHA256
                                30:45:02:21:00:92:89:CB:93:29:0B:C4:D0:0A:81:91:
                                77:E3:13:B2:7F:40:0F:E8:F8:8C:5C:20:66:20:61:5B:
                                4E:FD:AC:F1:5C:02:20:30:48:95:12:EB:36:73:0D:7F:
                                29:A1:12:57:C5:C7:F2:D7:6D:2B:73:9B:F8:80:5D:D9:
                                6D:73:A7:5C:C6:7F:DB
    Signature Algorithm: sha256WithRSAEncryption
         04:34:cd:fc:07:ff:7b:9b:31:e2:59:1d:d5:59:bd:cb:0d:0b:
         75:27:ba:a5:b8:11:1c:ae:db:76:18:fb:40:a7:65:e7:f1:31:
         b3:2c:8c:d6:63:9d:25:d6:70:55:04:49:d8:fa:56:9d:bc:82:
         38:7a:c7:e1:ca:6f:37:c5:27:f3:3f:33:af:8b:5a:df:94:06:
         bd:78:be:2e:90:bd:f0:50:f4:bd:fa:f7:c4:22:df:1d:77:62:
         d9:48:78:e2:e9:0a:7e:82:06:38:da:52:8b:d1:7a:3b:68:9b:
         44:30:6e:c8:9e:3c:d6:50:88:52:f2:52:1c:5e:cf:cf:57:55:
         e2:01:8e:43:1f:30:e8:99:21:6b:b2:14:ea:85:da:e4:69:c1:
         23:6d:f2:8e:60:7f:26:3f:95:f6:ba:bf:a2:3f:e6:4b:d9:b3:
         4d:88:14:b6:eb:7a:82:8e:32:6a:2e:01:11:6c:e0:be:57:f7:
         2f:37:b1:e9:60:50:62:10:d8:48:8c:45:39:96:eb:94:f4:4a:
         37:90:07:6f:55:ad:55:a4:14:a6:2c:74:0e:b9:0a:58:9f:c7:
         92:2c:24:ab:00:c3:fb:de:b6:6c:6e:b6:ce:8c:76:b4:6f:a9:
         ec:df:65:58:51:1d:c9:3d:23:82:50:b8:6b:9e:e1:47:48:3d:
         b5:48:4f:34
```

其中前面几行显示的是证书链：

```
depth=2 O = Digital Signature Trust Co., CN = DST Root CA X3
verify return:1
depth=1 C = US, O = Let's Encrypt, CN = Let's Encrypt Authority X3
verify return:1
depth=0 CN = acme-demo.beyondstars.xyz
verify return:1
```

然后可以看到证书有效期：

```
Not Before: Apr  7 02:21:54 2020 GMT
Not After : Jul  6 02:21:54 2020 GMT
```

我们还可以把网址的证书下载到本地

```
echo "" | 
openssl s_client \
-connect acme-demo.beyondstars.xyz:443 \
-verify_hostname acme-demo.beyondstars.xyz \
-showcerts | 
sed \
-n "/-\+BEGIN CERTIFICATE-\+/,/-\+END CERTIFICATE-\+/p" \
> fullchain.pem
```

这样当前文件夹下的 `fullchain.pem` 就同时包含了中间 CA 的证书和网站的证书，我们可以用  `csplit`  工具将 `fullchain.pem` 分解为网站 TLS 证书和中间 CA 的 TLS 证书：

```
csplit --prefix="cert" --suffix="%02d.pem" fullchain.pem '/-----BEGIN CERTIFICATE-----/' '{*}'
```

会得到

```
cert00.pem
cert01.pem
cert02.pem
```

其中 `cert00.pem` 是空白．然后可以分别查看 `cert01.pem` 和 `cert02.pem` ，先查看 `cert01.pem` ：

```
openssl x509 -noout -text -in cert01.pem
```

显示如下

```
Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number:
            03:4b:3e:f5:75:33:bd:45:fe:c8:46:f0:4f:72:10:85:be:c3
        Signature Algorithm: sha256WithRSAEncryption
        Issuer: C = US, O = Let's Encrypt, CN = Let's Encrypt Authority X3
        Validity
            Not Before: Apr  7 02:21:54 2020 GMT
            Not After : Jul  6 02:21:54 2020 GMT
        Subject: CN = acme-demo.beyondstars.xyz
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                RSA Public-Key: (2048 bit)
                Modulus:
                    00:e2:4b:e4:3e:2a:8d:e8:fd:4b:5a:9d:33:a4:4a:
                    c2:86:21:56:d3:9f:a8:34:30:4c:aa:79:97:32:24:
                    68:ad:b5:84:a0:c4:67:ad:21:ea:ce:a4:cf:cf:50:
                    22:bb:ab:4d:71:a2:22:0b:e4:10:c1:f6:7b:60:7b:
                    49:b1:4d:52:37:b8:4e:28:1e:3d:e0:4b:c6:dc:d3:
                    52:07:7d:2b:17:15:0f:5f:88:9b:07:c8:7f:7f:a5:
                    31:b9:69:e1:42:b0:a6:35:27:37:1c:1b:f2:3f:79:
                    a2:60:d6:cf:92:0f:dc:6c:86:dd:1a:95:3c:ce:a5:
                    e3:1c:80:3b:cd:d0:08:74:44:96:f3:80:b0:12:51:
                    2c:bc:db:21:2e:0e:de:48:28:3d:89:ce:14:bf:93:
                    15:89:b3:80:a7:28:0d:0c:12:d9:61:95:6a:c6:e7:
                    ee:99:0c:85:fc:81:66:9e:9e:88:86:15:61:8a:e8:
                    e4:76:88:bd:6f:a3:b6:30:dc:ed:a7:a9:54:42:7c:
                    3e:7d:5c:25:7a:3b:40:b9:86:07:0b:24:6f:6f:93:
                    7b:8a:7c:6f:61:28:8e:f3:94:7a:97:57:eb:eb:51:
                    6b:44:fe:44:85:6f:be:d8:42:a7:30:47:bf:00:0b:
                    90:22:c6:fe:48:54:5c:10:d4:38:06:cb:27:b2:45:
                    4b:c7
                Exponent: 65537 (0x10001)
        X509v3 extensions:
            X509v3 Key Usage: critical
                Digital Signature, Key Encipherment
            X509v3 Extended Key Usage:
                TLS Web Server Authentication, TLS Web Client Authentication
            X509v3 Basic Constraints: critical
                CA:FALSE
            X509v3 Subject Key Identifier:
                D6:98:45:DF:7B:1D:2F:E6:74:4F:80:BA:4C:EB:DD:CC:24:0A:8B:84
            X509v3 Authority Key Identifier:
                keyid:A8:4A:6A:63:04:7D:DD:BA:E6:D1:39:B7:A6:45:65:EF:F3:A8:EC:A1

            Authority Information Access:
                OCSP - URI:http://ocsp.int-x3.letsencrypt.org
                CA Issuers - URI:http://cert.int-x3.letsencrypt.org/

            X509v3 Subject Alternative Name:
                DNS:acme-demo.beyondstars.xyz
            X509v3 Certificate Policies:
                Policy: 2.23.140.1.2.1
                Policy: 1.3.6.1.4.1.44947.1.1.1
                  CPS: http://cps.letsencrypt.org

            CT Precertificate SCTs:
                Signed Certificate Timestamp:
                    Version   : v1 (0x0)
                    Log ID    : F0:95:A4:59:F2:00:D1:82:40:10:2D:2F:93:88:8E:AD:
                                4B:FE:1D:47:E3:99:E1:D0:34:A6:B0:A8:AA:8E:B2:73
                    Timestamp : Apr  7 03:21:54.952 2020 GMT
                    Extensions: none
                    Signature : ecdsa-with-SHA256
                                30:45:02:20:6F:FE:AB:8D:49:FA:9A:FD:99:AA:7D:14:
                                C0:2B:E3:C8:B7:CF:CA:73:E4:63:E9:DC:DE:82:BA:88:
                                D7:AF:78:36:02:21:00:D4:5C:95:C3:03:B4:37:81:46:
                                39:A9:A5:DB:6E:E1:3B:E9:B8:0E:26:49:E8:3F:32:03:
                                29:85:DE:23:64:99:0C
                Signed Certificate Timestamp:
                    Version   : v1 (0x0)
                    Log ID    : 07:B7:5C:1B:E5:7D:68:FF:F1:B0:C6:1D:23:15:C7:BA:
                                E6:57:7C:57:94:B7:6A:EE:BC:61:3A:1A:69:D3:A2:1C
                    Timestamp : Apr  7 03:21:55.028 2020 GMT
                    Extensions: none
                    Signature : ecdsa-with-SHA256
                                30:45:02:21:00:92:89:CB:93:29:0B:C4:D0:0A:81:91:
                                77:E3:13:B2:7F:40:0F:E8:F8:8C:5C:20:66:20:61:5B:
                                4E:FD:AC:F1:5C:02:20:30:48:95:12:EB:36:73:0D:7F:
                                29:A1:12:57:C5:C7:F2:D7:6D:2B:73:9B:F8:80:5D:D9:
                                6D:73:A7:5C:C6:7F:DB
    Signature Algorithm: sha256WithRSAEncryption
         04:34:cd:fc:07:ff:7b:9b:31:e2:59:1d:d5:59:bd:cb:0d:0b:
         75:27:ba:a5:b8:11:1c:ae:db:76:18:fb:40:a7:65:e7:f1:31:
         b3:2c:8c:d6:63:9d:25:d6:70:55:04:49:d8:fa:56:9d:bc:82:
         38:7a:c7:e1:ca:6f:37:c5:27:f3:3f:33:af:8b:5a:df:94:06:
         bd:78:be:2e:90:bd:f0:50:f4:bd:fa:f7:c4:22:df:1d:77:62:
         d9:48:78:e2:e9:0a:7e:82:06:38:da:52:8b:d1:7a:3b:68:9b:
         44:30:6e:c8:9e:3c:d6:50:88:52:f2:52:1c:5e:cf:cf:57:55:
         e2:01:8e:43:1f:30:e8:99:21:6b:b2:14:ea:85:da:e4:69:c1:
         23:6d:f2:8e:60:7f:26:3f:95:f6:ba:bf:a2:3f:e6:4b:d9:b3:
         4d:88:14:b6:eb:7a:82:8e:32:6a:2e:01:11:6c:e0:be:57:f7:
         2f:37:b1:e9:60:50:62:10:d8:48:8c:45:39:96:eb:94:f4:4a:
         37:90:07:6f:55:ad:55:a4:14:a6:2c:74:0e:b9:0a:58:9f:c7:
         92:2c:24:ab:00:c3:fb:de:b6:6c:6e:b6:ce:8c:76:b4:6f:a9:
         ec:df:65:58:51:1d:c9:3d:23:82:50:b8:6b:9e:e1:47:48:3d:
         b5:48:4f:34
```

再来看`cert02.pem`

```
openssl x509 -noout -text -in cert02.pem
```

显示如下

```
Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number:
            0a:01:41:42:00:00:01:53:85:73:6a:0b:85:ec:a7:08
        Signature Algorithm: sha256WithRSAEncryption
        Issuer: O = Digital Signature Trust Co., CN = DST Root CA X3
        Validity
            Not Before: Mar 17 16:40:46 2016 GMT
            Not After : Mar 17 16:40:46 2021 GMT
        Subject: C = US, O = Let's Encrypt, CN = Let's Encrypt Authority X3
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                RSA Public-Key: (2048 bit)
                Modulus:
                    00:9c:d3:0c:f0:5a:e5:2e:47:b7:72:5d:37:83:b3:
                    68:63:30:ea:d7:35:26:19:25:e1:bd:be:35:f1:70:
                    92:2f:b7:b8:4b:41:05:ab:a9:9e:35:08:58:ec:b1:
                    2a:c4:68:87:0b:a3:e3:75:e4:e6:f3:a7:62:71:ba:
                    79:81:60:1f:d7:91:9a:9f:f3:d0:78:67:71:c8:69:
                    0e:95:91:cf:fe:e6:99:e9:60:3c:48:cc:7e:ca:4d:
                    77:12:24:9d:47:1b:5a:eb:b9:ec:1e:37:00:1c:9c:
                    ac:7b:a7:05:ea:ce:4a:eb:bd:41:e5:36:98:b9:cb:
                    fd:6d:3c:96:68:df:23:2a:42:90:0c:86:74:67:c8:
                    7f:a5:9a:b8:52:61:14:13:3f:65:e9:82:87:cb:db:
                    fa:0e:56:f6:86:89:f3:85:3f:97:86:af:b0:dc:1a:
                    ef:6b:0d:95:16:7d:c4:2b:a0:65:b2:99:04:36:75:
                    80:6b:ac:4a:f3:1b:90:49:78:2f:a2:96:4f:2a:20:
                    25:29:04:c6:74:c0:d0:31:cd:8f:31:38:95:16:ba:
                    a8:33:b8:43:f1:b1:1f:c3:30:7f:a2:79:31:13:3d:
                    2d:36:f8:e3:fc:f2:33:6a:b9:39:31:c5:af:c4:8d:
                    0d:1d:64:16:33:aa:fa:84:29:b6:d4:0b:c0:d8:7d:
                    c3:93
                Exponent: 65537 (0x10001)
        X509v3 extensions:
            X509v3 Basic Constraints: critical
                CA:TRUE, pathlen:0
            X509v3 Key Usage: critical
                Digital Signature, Certificate Sign, CRL Sign
            Authority Information Access:
                OCSP - URI:http://isrg.trustid.ocsp.identrust.com
                CA Issuers - URI:http://apps.identrust.com/roots/dstrootcax3.p7c

            X509v3 Authority Key Identifier:
                keyid:C4:A7:B1:A4:7B:2C:71:FA:DB:E1:4B:90:75:FF:C4:15:60:85:89:10

            X509v3 Certificate Policies:
                Policy: 2.23.140.1.2.1
                Policy: 1.3.6.1.4.1.44947.1.1.1
                  CPS: http://cps.root-x1.letsencrypt.org

            X509v3 CRL Distribution Points:

                Full Name:
                  URI:http://crl.identrust.com/DSTROOTCAX3CRL.crl

            X509v3 Subject Key Identifier:
                A8:4A:6A:63:04:7D:DD:BA:E6:D1:39:B7:A6:45:65:EF:F3:A8:EC:A1
    Signature Algorithm: sha256WithRSAEncryption
         dd:33:d7:11:f3:63:58:38:dd:18:15:fb:09:55:be:76:56:b9:
         70:48:a5:69:47:27:7b:c2:24:08:92:f1:5a:1f:4a:12:29:37:
         24:74:51:1c:62:68:b8:cd:95:70:67:e5:f7:a4:bc:4e:28:51:
         cd:9b:e8:ae:87:9d:ea:d8:ba:5a:a1:01:9a:dc:f0:dd:6a:1d:
         6a:d8:3e:57:23:9e:a6:1e:04:62:9a:ff:d7:05:ca:b7:1f:3f:
         c0:0a:48:bc:94:b0:b6:65:62:e0:c1:54:e5:a3:2a:ad:20:c4:
         e9:e6:bb:dc:c8:f6:b5:c3:32:a3:98:cc:77:a8:e6:79:65:07:
         2b:cb:28:fe:3a:16:52:81:ce:52:0c:2e:5f:83:e8:d5:06:33:
         fb:77:6c:ce:40:ea:32:9e:1f:92:5c:41:c1:74:6c:5b:5d:0a:
         5f:33:cc:4d:9f:ac:38:f0:2f:7b:2c:62:9d:d9:a3:91:6f:25:
         1b:2f:90:b1:19:46:3d:f6:7e:1b:a6:7a:87:b9:a3:7a:6d:18:
         fa:25:a5:91:87:15:e0:f2:16:2f:58:b0:06:2f:2c:68:26:c6:
         4b:98:cd:da:9f:0c:f9:7f:90:ed:43:4a:12:44:4e:6f:73:7a:
         28:ea:a4:aa:6e:7b:4c:7d:87:dd:e0:c9:02:44:a7:87:af:c3:
         34:5b:b4:42
```

我们可以看到第一个证书 `cert01.pem` 的主体名字是`acme-demo.beyondstars.xyz`，由`Let's Encrypt Authority X3`签发，而第二个证书 `cert02.pem` 的主体名字刚好就是`Let's Encrypt Authority X3`，由 `DST Root CA X3` 签发，你可能问为什么没有从 `fullchain.pem` 当中分离出根CA `DST Root CA X3` 的证书出来，这是因为跟 CA 的证书一般是保存在

```
/etc/ssl/certs
```

目录的，例如，`DST Root CA X3` 的证书存放在

```
/etc/ssl/certs/DST_Root_CA_X3.pem
```

我们看一下也无妨

```
openssl x509 \
-in /etc/ssl/certs/DST_Root_CA_X3.pem \
-noout -text
```

输出为

```
Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number:
            44:af:b0:80:d6:a3:27:ba:89:30:39:86:2e:f8:40:6b
        Signature Algorithm: sha1WithRSAEncryption
        Issuer: O = Digital Signature Trust Co., CN = DST Root CA X3
        Validity
            Not Before: Sep 30 21:12:19 2000 GMT
            Not After : Sep 30 14:01:15 2021 GMT
        Subject: O = Digital Signature Trust Co., CN = DST Root CA X3
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                RSA Public-Key: (2048 bit)
                Modulus:
                    00:df:af:e9:97:50:08:83:57:b4:cc:62:65:f6:90:
                    82:ec:c7:d3:2c:6b:30:ca:5b:ec:d9:c3:7d:c7:40:
                    c1:18:14:8b:e0:e8:33:76:49:2a:e3:3f:21:49:93:
                    ac:4e:0e:af:3e:48:cb:65:ee:fc:d3:21:0f:65:d2:
                    2a:d9:32:8f:8c:e5:f7:77:b0:12:7b:b5:95:c0:89:
                    a3:a9:ba:ed:73:2e:7a:0c:06:32:83:a2:7e:8a:14:
                    30:cd:11:a0:e1:2a:38:b9:79:0a:31:fd:50:bd:80:
                    65:df:b7:51:63:83:c8:e2:88:61:ea:4b:61:81:ec:
                    52:6b:b9:a2:e2:4b:1a:28:9f:48:a3:9e:0c:da:09:
                    8e:3e:17:2e:1e:dd:20:df:5b:c6:2a:8a:ab:2e:bd:
                    70:ad:c5:0b:1a:25:90:74:72:c5:7b:6a:ab:34:d6:
                    30:89:ff:e5:68:13:7b:54:0b:c8:d6:ae:ec:5a:9c:
                    92:1e:3d:64:b3:8c:c6:df:bf:c9:41:70:ec:16:72:
                    d5:26:ec:38:55:39:43:d0:fc:fd:18:5c:40:f1:97:
                    eb:d5:9a:9b:8d:1d:ba:da:25:b9:c6:d8:df:c1:15:
                    02:3a:ab:da:6e:f1:3e:2e:f5:5c:08:9c:3c:d6:83:
                    69:e4:10:9b:19:2a:b6:29:57:e3:e5:3d:9b:9f:f0:
                    02:5d
                Exponent: 65537 (0x10001)
        X509v3 extensions:
            X509v3 Basic Constraints: critical
                CA:TRUE
            X509v3 Key Usage: critical
                Certificate Sign, CRL Sign
            X509v3 Subject Key Identifier:
                C4:A7:B1:A4:7B:2C:71:FA:DB:E1:4B:90:75:FF:C4:15:60:85:89:10
    Signature Algorithm: sha1WithRSAEncryption
         a3:1a:2c:9b:17:00:5c:a9:1e:ee:28:66:37:3a:bf:83:c7:3f:
         4b:c3:09:a0:95:20:5d:e3:d9:59:44:d2:3e:0d:3e:bd:8a:4b:
         a0:74:1f:ce:10:82:9c:74:1a:1d:7e:98:1a:dd:cb:13:4b:b3:
         20:44:e4:91:e9:cc:fc:7d:a5:db:6a:e5:fe:e6:fd:e0:4e:dd:
         b7:00:3a:b5:70:49:af:f2:e5:eb:02:f1:d1:02:8b:19:cb:94:
         3a:5e:48:c4:18:1e:58:19:5f:1e:02:5a:f0:0c:f1:b1:ad:a9:
         dc:59:86:8b:6e:e9:91:f5:86:ca:fa:b9:66:33:aa:59:5b:ce:
         e2:a7:16:73:47:cb:2b:cc:99:b0:37:48:cf:e3:56:4b:f5:cf:
         0f:0c:72:32:87:c6:f0:44:bb:53:72:6d:43:f5:26:48:9a:52:
         67:b7:58:ab:fe:67:76:71:78:db:0d:a2:56:14:13:39:24:31:
         85:a2:a8:02:5a:30:47:e1:dd:50:07:bc:02:09:90:00:eb:64:
         63:60:9b:16:bc:88:c9:12:e6:d2:7d:91:8b:f9:3d:32:8d:65:
         b4:e9:7c:b1:57:76:ea:c5:b6:28:39:bf:15:65:1c:c8:f6:77:
         96:6a:0a:8d:77:0b:d8:91:0b:04:8e:07:db:29:b6:0a:ee:9d:
         82:35:35:10
```

经过上面这一系列演示，我们看到了，不仅使用浏览器能查看 HTTPS 连接情况，还能用 curl 和 openssl 来查看，而浏览器能显示出证书的详细信息，用openssl也能做到，但是openssl是命令行的，可编程的，肯定更加强大和自由一些.

Let's Encrypt 证书除了可以用 acme.sh 申请，还可以用 certbot 申请，certbot 还能帮您的 NginX 服务器设置重定向——把发往80端口的 HTTP 请求重定向为发往443端口的 HTTPS 请求，基本上比用 acme.sh 简单多了.

和用 acme.sh 申请证书类似，假如说你在服务器 x 运行 certbot 申请 yoursite.com 的 TLS 证书，那么你要确保 yoursite.com 会被解析到服务器 x，下面我们建立一个域名用于演示如何用certbot申请证书，我们用的是 certbot-demo.beyondstars.xyz 这个域名，假设这个 certbot-demo.beyondstars.xyz 域名所指的网站还没有开通，那同样的也要先建立网站根目录和配置 NginX 服务器

![figure](/openssl-certificates/add-a-new-dns-record-certbot-demo.png)

首先建立网站根目录并配置 NginX 服务器：

```
mkdir -p /var/www/certbot-demo.beyondstars.xyz
```

然后新建一个 NginX 配置文件

```
vi /etc/nginx/conf.d/certbot-demo.beyondstars.xyz.conf
```

输入以下内容

```
server {
    listen 80;
    root /var/www/certbot-demo.beyondstars.xyz;
    index index.html;
    server_name certbot-demo.beyondstars.xyz;
}
```

保存并退出文本编辑器，然后执行

```
nginx -s reload
```

使 NginX 服务器重新加载配置文件使新网站启．如果你不放心新的网站是否已经启用可以尝试

```
echo "certbot-demo site enabled" >> /var/www/certbot-demo.beyondstars.xyz/index.html
curl http://certbot-demo.beyondstars.xyz/index.html
```

看到

```
certbot-demo site enabled
```

就说明 NginX 已经成功启用了新的站点并且域名也正确解析．那么接下来就可以使用 certbot 申请证书并为新的网站启用 HTTPS ．

[安装好 certbot](https://certbot.eff.org/)之后，首先运行

```
certbot --nginx
```

会出现对话界面，选择一个要 certbot 帮你申请证书的域名

![figure](/openssl-certificates/run-certbot-in-nginx-mode-1.png)

这里我们输入数字4，也就是为`certbot-demo.beyondstars.xyz`这个域名申请 TLS 证书，然后按回车继续

![figure](/openssl-certificates/run-certbot-in-nginx-mode-2.png)

输入数字 2 并按回车，certbot 将修改 NginX 配置文件，使 HTTP 流量自动重定为 HTTPS 流量，这样网站的 HTTPS 就启用了，而选数字 1 我们还要手动配置，这里输入2并按回车就可以了

![figure](/openssl-certificates/run-certbot-in-nginx-mode-3.png)

出现这个节目提示证书申请成功并且 NginX 的 HTTP 到 HTTPS 的重定向也配置成功.

可以用curl测试一下 HTTPS 是否真的启用了

```
curl https://certbot-demo.beyondstars.xyz/index.html
```

会看到提示

```
certbot-demo site enabled
```

这样就算是成功地用 certbot 为网站启用了 HTTPS 了.

certbot 和acme.sh都仅仅是一个命令行工具用于申请 Let's Encrypt 签发的免费 TLS 证书，certbot 申请得到的证书是存储在

```
/etc/letsencrypt/live/
```

目录下，如果你用 openssl 工具去查看这些证书，你会发现跟我们用 openssl 去查看 acme.sh 申请到的证书很类似，根 CA 和中间 CA 的证书的主体都是一样的.

### 自签证书

前面我们简单地学习了一下一些关于公钥加密和公钥签名的知识，从而我们能够理解，我们自己也可以生成私钥，进而生成 CA 证书并自己对生成的 CA 证书签名，我们甚至可以自己签发根 CA ，然后在根 CA 的基础上签发中间 CA ，再用中间 CA 签发网站 TLS 证书，只不过，由于大家的操作系统上没有安装我们这里生成的自签 CA ，所以，这种办法不能够代替 Let's Encrypt ，也不能够代替付费证书，这种办法，适用于开发环境的部署，开发环境下需要利用 HTTPS 协议做通信，要测试的组件要用到 HTTPS 来互相通信，但是我们也可以不必为之大动干戈配置 DNS 记录指向公网IP然后再申请 Let's Encrypt 证书，如果开发环境要用到 HTTPS ，用自签证书也行，也方便.

首先我们需要生成一个私钥，这个是根 CA 的私钥，通过以下命令：

```
openssl genrsa -out root.key.pem 2048
```

执行完成后目录将多出一个叫 `root.key.pem` 的文件，在自签根 CA 证书之前，需要指定一些配置，首先从

```
/etc/ssl
```

目录复制所有后缀名为 `.cnf` 的文件到当前文件，然后我们按照这些复制过来的样板文件写出我们自己的配置文件，首先写根 CA 的配置文件 `rootca.cnf` ：

```
[ req ]
distinguished_name = req_distinguished_name
x509_extensions = v3_ca
prompt = no

[ req_distinguished_name ]
countryName	= CN
stateOrProvinceName	= Beijing
localityName = Beijing
0.organizationName = Super Powerful Root CA
organizationalUnitName = I.T. Department
commonName = Super Powerful Root CA
emailAddress = admin@x.com

[ v3_ca ]
basicConstraints = CA:true
```

有了 `rootca.cnf` 后就可以自签根 CA 证书了：

```
openssl req \
-new -x509 \
-key root.key.pem \
-out root.crt.pem \
-config rootca.cnf 
```

会得到一个 `root.crt.pem` 的文件，这就是根 CA 的证书文件，主体信息由 `rootca.cnf` 配置文件中的填写的信息而定，接下来要生成中间 CA 的证书，首先生成中间 CA 的私钥：

```
openssl genrsa -out intermediate.key.pem 2048
```

然后准备中间 CA 的信息，保存为 `intermediateca.cnf` ，内容如下：

```
[ req ]
distinguished_name	= req_distinguished_name
prompt = no

[ req_distinguished_name ]
countryName	= CN
stateOrProvinceName	= Beijing
localityName = Beijing
0.organizationName = Super Powerful Intermediate CA
organizationalUnitName = I.T. Department
commonName = Super Powerful Intermediate CA
emailAddress = admin@y.com
```

然后开始生成中间 CA 的CSR(Certificate Signing Request)：

```
#!/bin/sh

openssl req \
-new \
-config intermediateca.cnf \
-key intermediate.key.pem \
-out intermediate.csr
```

然后在用根 CA 证书对 `intermediate.csr` 进行签名之前还要准备一些必要的配置信息，把以下内容填入 `x509v3.cnf` 文件

```
# default settings
CERTPATHLEN		= 1
CERTUSAGE		= digitalSignature,keyCertSign,cRLSign
EXTCERTUSAGE		= serverAuth,clientAuth
CERTIP			= 0.0.0.0
CERTFQDN		= nohost.nodomain

# This section should be referenced when building an x509v3 CA
# Certificate.
# The default path length and the key usage can be overridden
# modified by setting the CERTPATHLEN and CERTUSAGE environment 
# variables.
[x509v3_CA]
basicConstraints=critical,CA:true,pathlen:$ENV::CERTPATHLEN
keyUsage=$ENV::CERTUSAGE

# This section should be referenced to add an IP Address
# as an alternate subject name, needed by isakmpd
# The address must be provided in the CERTIP environment variable
[x509v3_IPAddr]
subjectAltName=IP:$ENV::CERTIP
extendedKeyUsage=$ENV::EXTCERTUSAGE

# This section should be referenced to add a FQDN hostname
# as an alternate subject name, needed by isakmpd
# The address must be provided in the CERTFQDN environment variable
[x509v3_FQDN]
subjectAltName=DNS:$ENV::CERTFQDN
extendedKeyUsage=$ENV::EXTCERTUSAGE
```

然后用根证书和根证书的私钥对中间证书的CSR进行签名得到中间证书：

```
openssl x509 \
-req \
-in intermediate.csr \
-out intermediate.crt.pem \
-CA root.crt.pem \
-CAkey root.key.pem \
-CAcreateserial \
-extfile ./x509v3.cnf \
-extensions x509v3_CA
```

得到中间 CA 证书文件 `intermediate.crt.pem` . 然后生成网站的私钥：

```
openssl genrsa \
-out site.key.pem \
2048 
```

准备网站的信息，保存在 `site.cnf` ，如下：

```
[ req ]
distinguished_name	= req_distinguished_name
prompt = no

[ req_distinguished_name ]
countryName	= CN
stateOrProvinceName	= Beijing
localityName = Beijing
0.organizationName = Internet Company (Beijing Section)
organizationalUnitName = I.T. Department
commonName = yoursite.com
emailAddress = admin@yoursite.com
```

生成网站的 CSR：

```
openssl req \
-new \
-config site.cnf \
-key site.key.pem \
-out site.csr 
```

用中间 CA 证书和中间 CA 的私钥对网站的CSR进行签名得到网站的证书：

```
openssl x509 \
-req \
-in site.csr \
-CA intermediate.crt.pem \
-CAkey intermediate.key.pem \
-CAcreateserial \
-out site.crt.pem 
```

得到网站的证书 `site.crt.pem` ，然后将网站证书文件和中间 CA 证书文件拼接得到 `fullchain.pem` （供 NginX 使用）：

```
cat site.crt.pem intermediate.crt.pem > fullchain.pem
```

下面是 NginX 的样例配置

```
server {
    listen 443 ssl;
    server_name yoursite.com;
    root /var/www/yoursite.com;

    ssl_certificate     /usr/local/etc/nginx/certs.d/yoursite.com/fullchain.pem;
    ssl_certificate_key /usr/local/etc/nginx/certs.d/yoursite.com/site.key.pem;
    ssl_protocols       TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers         HIGH:!aNULL:!MD5;
}
```

需将 `fullchain.pem` （证书）和 `site.key.pem` （网站私钥）复制到相应位置再使 NginX 重新加载配置文件

```
nginx -s reload
```

亦有包含以上命令的脚本文件可供自动化调用，在

```
https://github.com/hsiaofongw/openssl-selfsign-ca-demo
```

同时须知晓较新版本之Google Chrome会将网站显示为不安全，即使在系统中信任了相应地根证书：

![figure](/openssl-certificates/openssl-self-signed-chrome-display-1.png)

![figure](/openssl-certificates/openssl-self-signed-chrome-display-2.png)

以上验证是通过在`/etc/hosts`文件中将 `yoursite.com` 指向 `127.0.0.1` 使Chrome访问 `yoursite.com` 时向 `127.0.0.1` 发起请求实现的，也可以通过openssl手动验证证书

```
openssl verify -CAfile root.crt.pem intermediate.crt.pem
openssl verify -trusted root.crt.pem -trusted intermediate.crt.pem site.crt.pem
```

若验证通过，应该会输出

```
intermediate.crt.pem: OK
site.crt.pem: OK
```

这就表示自签证书创建成功了.

### 付费证书

除了 Let's Encrypt 证书和自签证书外，还有付费证书，在 Let's Encrypt 被熟知之前，付费证书是占主要的，价格相差较大，一般可以在域名注册商那里顺带购买，例如GoDaddy，Gandi.net都提供付费证书签发服务，一些云服务厂商如阿里云，腾讯云亦提供付费证书签发服务，他们可能会要求你生成一个CSR文件，然后把这个CSR文件上传到他们的服务器，签发后会将证书文件发回给你，要注意生成CSR之后保管好私钥，使用时网页服务器中把有关的设置项指向私钥文件和他们发回给你的网站证书文件即．厂商会有具体教程.

## 总结

首先感谢阅读到这．这篇文章总共讲了 HTTPS, 公钥加密和证书的签发，包括自签证书和 Let's Encrypt 证书．希望对你有用．

## 参考文献

[1] [Public-key cryptography - Wikipedia](https://en.wikipedia.org/wiki/Public-key_cryptography)

[2] [Transport Layer Security - Wikipedia](https://en.wikipedia.org/wiki/Transport_Layer_Security)

[3] [HTTPS - Wikipedia](https://en.wikipedia.org/wiki/HTTPS)

[4] [Internet X.509 Public Key Infrastructure Certificate and Certificate Revocation List (CRL) Profile](https://tools.ietf.org/html/rfc5280)

[5] [The Transport Layer Security (TLS) Protocol Version 1.3](https://tools.ietf.org/html/rfc8446)

[6] [X.509 - Wikipedia](https://en.wikipedia.org/wiki/X.509)

[7] [Public key infrastructure - Wikipedia](https://en.wikipedia.org/wiki/Public_key_infrastructure)

[8] [Certification path validation algorithm - Wikipedia](https://en.wikipedia.org/wiki/Certification_path_validation_algorithm)

[9] [Diffie–Hellman key exchange - Wikipedia](https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange)

[10] [Symmetric-key algorithm - Wikipedia](https://en.wikipedia.org/wiki/Symmetric-key_algorithm)

[11] [Automated Certificate Management Environment - Wikipedia](https://en.wikipedia.org/wiki/Automated_Certificate_Management_Environment)

[12] [RFC 8555 - Automatic Certificate Management Environment (ACME)](https://tools.ietf.org/html/rfc8555)