---
title: "Git 原理"
date: "2021-05-18T01:57:35+08:00"
lastmod: "2021-05-18T01:57:41+08:00"
draft: false
tags: ["git"]
---

# Git 原理

*写于 2021 年 5 月 18 日：*

## 摘要

在 Git 的底层实现中，一切都是以键值对的方式存储的，有四种基本对象 (object), 它们分别是：blob, tree, commit, 和 tag, 我们将会在本文中逐渐引入它们。

## blob

blob 即文件的意思，我们首先创建一个临时文件夹，并且将它初始化为一个空的 git 仓库来作为我们接下来的实验场所：

```
mkdir -p test/git-demonstration/git-internals
cd test/git-demonstration/git-internals
git init
```

加下来我们在 Working tree 下 创建一个新文件：

```
touch a.txt
```

赋予它一些内容：

```
echo "Hello Hello Hello" >> a.txt
```

存储它：

```
git hash-object -w a.txt
```

输出为：

```
ed14234311fa7ffdb95b1d40b4619bf206707d85
```

它就是 a.txt 这个文件在 git 数据库中的键，而文件 a.txt 的内容就是值。

我们可以通过：

```
find .git/objects -type f
```

查看 git 数据库中所有的条目：

```
.git/objects/ed/14234311fa7ffdb95b1d40b4619bf206707d85
```

可看到：

```
ed/14234311fa7ffdb95b1d40b4619bf206707d85
```

正是 a.txt.

我们可通过：

```
git cat-file -p ed14234311fa7ffdb95b1d40b4619bf206707d85
```

查看 a.txt 的内容。

对任意一条 git 数据库中的条目，比如说对于

```
ed14234311fa7ffdb95b1d40b4619bf206707d85
```

这个条目，我们可通过：

```
git cat-file -t ed14234311fa7ffdb95b1d40b4619bf206707d85
```

来查看它的类型，输出，毫无疑问是：

```
blob
```

这整好说明了 ed14234311fa7ffdb95b1d40b4619bf206707d85 是一个 blob.

这样一来我们就建好了一个 blob，它叫做 ed14234311fa7ffdb95b1d40b4619bf206707d85.

## tree

tree 即文件夹，要创建它，我们首先要把文件放入暂存区，怎么做呢？

```
git update-index --add --cacheinfo 100644 ed14234311fa7ffdb95b1d40b4619bf206707d85 a.txt
```

即可．

接下来我们来把暂存区保存为一颗树：

```
git write-tree
```

输出为：

```
0c6e56b67610fbbf4de47767f9d578d590f66aca
```

我们可以查看它：

```
git cat-file -p 
```

输出为：

```
100644 blob ed14234311fa7ffdb95b1d40b4619bf206707d85	a.txt
```

这是正常的，因为我们当前只是用一个 blob 来构造一颗树．

## commit

有了树，我们就可以构造提交 (commit) 了：

```
echo 'First commit' | git commit-tree 
```

输出为：

```
403e8a29747c43ce129b22a6bc64a00475763107
```

我们可以查看它，查看 403e8a29747c43ce129b22a6bc64a00475763107 这个提交：

```
git cat-file -p 
```

输出为：

```
tree 0c6e56b67610fbbf4de47767f9d578d590f66aca
author hsiaofongw <hsiaofong.w@gmail.com> 1621275635 +0800
committer hsiaofongw <hsiaofong.w@gmail.com> 1621275635 +0800

First commit
```

为了能够让我们不用记住 commit 的 SHA1，我们需要建立分支来跟踪提交：

```
git update-ref refs/heads/master 403e8a29747c43ce129b22a6bc64a00475763107
```

这就把 master 分支指到 403e8a29747c43ce129b22a6bc64a00475763107 上面去啦．

在分支间自由切换的功能是通过符号链接 HEAD 来实现的，我们一起来实现它吧：

```
git symbolic-ref HEAD refs/heads/master
```

接下来查看：

```
git log --all
```

可以看到：

```
commit 403e8a29747c43ce129b22a6bc64a00475763107 (HEAD -> master)
Author: hsiaofongw <hsiaofong.w@gmail.com>
Date:   Tue May 18 02:20:35 2021 +0800

    First commit
```

就这样我们就手动建立了第一个提交．

## 对象

现在我们可以来回顾一下看都有了哪些对象：

```
find .git/objects -type f
```

输出为：

```
.git/objects/0c/6e56b67610fbbf4de47767f9d578d590f66aca
.git/objects/40/3e8a29747c43ce129b22a6bc64a00475763107
.git/objects/ed/14234311fa7ffdb95b1d40b4619bf206707d85
```

先查看：

```
git cat-file -t 0c6e56b67610fbbf4de47767f9d578d590f66aca
git cat-file -p 0c6e56b67610fbbf4de47767f9d578d590f66aca
```

输出为：

```
tree
100644 blob ed14234311fa7ffdb95b1d40b4619bf206707d85	a.txt
```

由此可知 0c6e5 是一个 tree，这个 tree 里面有 ed142 这个文件，ed142 这个文件的文件名叫做 a.txt.

谁指向 0c6e5 这颗 tree 呢？

我们先查看 HEAD:

```
cat .git/HEAD
```

输出为：

```
ref: refs/heads/master
```

我们再查看：

```
cat .git/refs/heads/master
```

输出为：

```
403e8a29747c43ce129b22a6bc64a00475763107
```

我们查看它：

```
git cat-file -p 403e8
```

输出为：

```
tree 0c6e56b67610fbbf4de47767f9d578d590f66aca
author hsiaofongw <hsiaofong.w@gmail.com> 1621275635 +0800
committer hsiaofongw <hsiaofong.w@gmail.com> 1621275635 +0800

First commit
```

由此可知 403e8 是一个 commit, 该 commit 指向 0c6e5 这个 tree.

这就清楚了：

![figure](/git-internals/first-commit.png)

接下来我们再接再厉，再建立第二个提交，并且该提交指向第一个提交，我相信这应该不难做到．

## 第二个提交

首先我们添加一个新文件：

```
touch b.txt
echo "new file" >> b.txt
```

这样一个有内容的新文件就建好了．

然后我们把它加入 git 数据库，也就是 .git/objects 这个地方：

```
git hash-object -w b.txt
```

输出为：

```
fa49b077972391ad58037050f2a75f74e3671e92
```

然后我们把它加入暂存区：

```
git update-index --add --cacheinfo 100644 fa49b077972391ad58037050f2a75f74e3671e92 b.txt
```

然后我们建立一个新的文件夹：

```
mkdir -p foo
```

并且在该新文件夹下面建造一个新文件：

```
touch foo/bar.txt
```

并且在该新文件夹下面的新文件里面写一点东西在里面：

```
echo "foobar foobar foobar foobar" >> foo/bar.txt
```

然后我们也存储这个文件：

```
git hash-object -w foo/bar.txt
```

输出为：

```
6d7462eed29047e69a3f75f9729bd99bc61f9292
```

然后我们也跟踪这个文件：

```
git update-index --add --cacheinfo 100644 6d7462eed29047e69a3f75f9729bd99bc61f9292 foo/bar.txt
```

然后我们保存这个树：

```
git write-tree
```

输出为：

```
8dc01d6ddd6ff4c1e9d9263a7943416c7adfc503
```

我们来查看一下它：

```
git cat-file -p 8dc01
```

可以看到：

```
100644 blob ed14234311fa7ffdb95b1d40b4619bf206707d85	a.txt
100644 blob fa49b077972391ad58037050f2a75f74e3671e92	b.txt
040000 tree cc30d8487c54051c41dcc231461b3b59cffdcb8c	foo
```

也就是说 cc30d 这个树是自动创建的了．

再来看 cc30d 这个树：

```
git cat-file -p cc30d
```

输出为：

```
100644 blob 6d7462eed29047e69a3f75f9729bd99bc61f9292	bar.txt
```

所以说树就是目录，目录就是树．

树我们有了，提交还没有，所以说要建一个提交：

```
echo 'Second commit' | git commit-tree -p 403e8 8dc01
```

这里的 8dc01 是新的树，403e8 是上一次的提交，输出为：

```
2edd7f5c1072ff61990a5771b1a9028c8cf2e599
```

现在我们要让 master 分支移到最新的提交，这也正是「提交」的实现：

```
git update-ref refs/heads/master 2edd7f5c1072ff61990a5771b1a9028c8cf2e599
```

当然 HEAD 已经是在 master 了不用变，所以现在我们可以直接看：

```
git log --all
```

输出为：

```
commit 2edd7f5c1072ff61990a5771b1a9028c8cf2e599 (HEAD -> master)
Author: hsiaofongw <hsiaofong.w@gmail.com>
Date:   Tue May 18 02:52:51 2021 +0800

    Second commit

commit 403e8a29747c43ce129b22a6bc64a00475763107
Author: hsiaofongw <hsiaofong.w@gmail.com>
Date:   Tue May 18 02:20:35 2021 +0800

    First commit
```

好家伙，现在我们已经有了两个提交了，并且其中一个还指向之前那个，这也就和我们直接用高层命令：git-add, git-commit 没有啥差别了．

那么回顾一下：

我们先看 HEAD，显然，HEAD 是没变的：

```
cat .git/HEAD
```

输出照样为：

```
ref: refs/heads/master
```

然后我们查看：

```
git cat-file -p refs/heads/master
```

输出为：

```
tree 8dc01d6ddd6ff4c1e9d9263a7943416c7adfc503
parent 403e8a29747c43ce129b22a6bc64a00475763107
author hsiaofongw <hsiaofong.w@gmail.com> 1621277571 +0800
committer hsiaofongw <hsiaofong.w@gmail.com> 1621277571 +0800

Second commit
```

然后我们查看：

```
git cat-file -p 8dc01d6ddd6ff4c1e9d9263a7943416c7adfc503
```

输出为：

```
100644 blob ed14234311fa7ffdb95b1d40b4619bf206707d85	a.txt
100644 blob fa49b077972391ad58037050f2a75f74e3671e92	b.txt
040000 tree cc30d8487c54051c41dcc231461b3b59cffdcb8c	foo
```

然后我们查看：

```
git cat-file -p cc30d8487c54051c41dcc231461b3b59cffdcb8c
```

输出为：

```
100644 blob 6d7462eed29047e69a3f75f9729bd99bc61f9292	bar.txt
```

这下我们就清楚了：

![figure](/git-internals/second-commit.png)

## 一个有趣的问题

我们看到第二个提交 2edd7 指向 8dc01 这棵树，8dc01 这棵树指向 ed142 也就是那个 a.txt, 与此同时第一个提交也间接地指向 ed142 也就是 a.txt，万一我们修改 a.txt 再提交会怎样呢？

```
echo "editing" >> a.txt
git add a.txt
git commit
```

我们再来看 HEAD:

```
cat .git/HEAD
```

显然没变：

```
ref: refs/heads/master
```

再看 master:

```
git cat-file -p master
```

输出为：

```
tree b6eaace9a0957d121f139de0ed85dfffcc887871
parent 2edd7f5c1072ff61990a5771b1a9028c8cf2e599
author hsiaofongw <hsiaofong.w@gmail.com> 1621278774 +0800
committer hsiaofongw <hsiaofong.w@gmail.com> 1621278774 +0800

修改 a.txt
```

这其中的 2edd7 正是第二个提交也就是上一个提交，再看 b6eaa 这颗新建的树：

```
git cat-file -p b6eaa
```

输出为：

```
100644 blob 56863b2f5fc3be4167e056610934744850660bbb	a.txt
100644 blob fa49b077972391ad58037050f2a75f74e3671e92	b.txt
040000 tree cc30d8487c54051c41dcc231461b3b59cffdcb8c	foo
```

画出来就是：

![figure](/git-internals/third-commit.png)

由此我们看出来，修改后的 a.txt 被放到了一个新的 blob 里面去了．

## 结论

当提交时，Git 保存的是当前时刻的一个快照，而不是当前时刻和上一时刻的差别，每一个 commit 都对应着一个完整的状态以及上一次的提交，理论上来说，如果我们有足够频繁的提交，我们理论上可以恢复到过去的任何状态．
