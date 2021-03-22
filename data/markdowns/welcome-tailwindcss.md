---
title: "拥抱 tailwindcss"
description: "本站已经完成了到 tailwindcss 的改造．"
date: "2021-03-22"
author: "Wayne"
---

# 拥抱 tailwindcss

*写于 2021 年 3 月 22 日：*

## 什么是 tailwindcss

简单来说，它是一系列预制的 CSS 类．并且，对于没有预先提供的，也支持一定程度的自定义．

例如 `mx-auto` 这个类，实际上相当于：

```
.mx-auto {
    margin-left: auto;
    margin-right: auto;
}
```

而 `max-w-3xl` 这个类，就相当于：

```
.max-w-3xl {
    max-width: 48rem;
}
```

对于一个标签，例如：

```
<div className="max-w-3xl mx-auto" ></div>
```

我们仅需写其中的 `max-w-3xl` 和 `mx-auto`，就能得到期待中的效果，而无需手动去把

```
.mx-auto {
    margin-left: auto;
    margin-right: auto;
}

.max-w-3xl {
    max-width: 48rem;
}
```

完整地写出来．

对于这种预制的 CSS 类，在 [tailwindcss](https://tailwindcss.com/) 的官网上还列出有许多．

对于一些简单的情形，我们可以不用写一行 CSS 代码，仅仅在 `className` 字段中写 `tailwindcss` 类名，就能实现想要的效果．

![figure](/welcome-tailwindcss/1.png)

图中显示的：`flex`, `bg-gray-100`, `rounded-xl` 都是原先 CSS 代码的浓缩，一个这样的 `tailwindcss` 类一般对应原来的一行或者多行原生 CSS.

实际上，你也可以认为是：tailwindcss 将原生 CSS 中最常被用到的那部分，以及相对较正交的那部分单独拿出来，组成一个个类供设计者直接调用．

## 我怎么能记做这么多类名

要开始使用 tailwindcss, 实际上我们仅仅需要记做每一类类大致的名称，例如：`text-*` 是用来调整字体的大小和颜色的，或者更应该认为 `text-*` 包含了常用的字体风格组合：

![figure](/welcome-tailwindcss/2.png)

![figure](/welcome-tailwindcss/3.png)

而 `h-*` 用来选择高度设置组合，`w-*` 用来选择宽度设置组合，`m-*`, `mb-*`, `mt-*` 分别用来选择 `margin` 效果，`margin-bottom` 效果和 `margin-top` 效果，这些都很好记住．

又如上图所示，VS Code 上的 [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) 插件能很好地实现 tailwindcss 类名的拼写的自动提示功能．

## 本站应用 tailwindcss 的程度

探索子博客网站的首页：

![figure](/welcome-tailwindcss/4.png)

![figure](/welcome-tailwindcss/5.png)

通过应用 tailwindcss 已经获得了更好的 Responsive 效果，如今在 iPhone 屏幕上显示效果变得比以前更好了．

评论区页面也是依靠 tailwindcss 才快速地做出来：

![figure](/welcome-tailwindcss/6.png)

并且在移动设备上也有较为自然的显示效果．

当然还有你现在看到的这个页面，它也是响应式的．

响应式其实现在已经不算新鲜了，我想说的只是 tailwindcss 让响应式开发变得简单．

## 应用 tailwindcss 的一些好处

首先，自己其实完全可以不写一行 CSS 代码，而仅仅是拿 tailwindcss 预制的那些个 CSS 类来灵活组合，这样已经可以实现大多数常见的效果．省去了以往写原生 CSS 或者 SCSS 时需要为每一个类单独起名的烦恼，从而大大加快了开发速度．

其次，tailwindcss 是天然地响应式友好的，对于响应式开发，我们不再需要去写 `@media` Media 查询语句．tailwindcss 提供了常见的断点，例如：`sm:` 对应

```
@media (min-width: 640px)
```

而 `md:` 对应：

```
@media (min-width: 768px)
```

更大的还有 `2xl:` 对应：

```
@media (min-width: 1536px)
```

当我写：

```
className="md:w-32 lg:w-48"
```

的时候，就表示

```
@media (min-width: 768px) {
    width: 8rem;
}

@media (min-width: 1024px) {
    width: 12rem;
}
```

所以说响应式的 style 用 tailwindcss 写起来那是相当的优雅、方便和简洁．

我个人觉得，tailwindcss 相当于传统 CSS, 就好比 TypeScript 相当于 JavaScript, 是一种跨域，也是一种正规化，规范化．

## 具体的做法

您现在所看到的这个页面它是由代码生成，代码位于仓库 [markdown-blog](https://github.com/hsiaofongw/markdown-blog), 具体来说，这个项目是基于 Next.js, unified, remark-react, gray-matter 的．

简单来说，Next.js 负责 routing, data-fetching 和维护一个项目构建时所需的运行环境．

gray-matter 负责将包含了 Front-Matter 的 Markdown 文本内容的 Front-Matter 和 Markdown 正文区分开来，并且将 Front-Matter 内容解析成 JavaScript 的 Object.

unified 提供了一个统一的结构式文本 (structured text) 解析 (parsing) 的框架，remark-react 作为这个框架上的一个插件 (plugin), 功能是将 Markdown 文本解析成 `React.ReactElement`，这和直接操作 `innerHTML` (往往是使用 `dangerouslySetInnerHTML` 方法) 有着本质上的不同．

有什么不同呢？

从 [remarkjs](https://remark.js.org/) 的角度看，一份 Markdown 文本可以被解析成一个结构分明的抽象语法树 ([AST](https://astexplorer.net/#/gist/0a92bbf654aca4fdfb3f139254cf0bad/ffe102014c188434c027e43661dbe6ec30042ee2)):

![figure](/welcome-tailwindcss/7.png)

建出了这个树，相当于程序「理解」了 Markdown 文本的「结构」，而非仅仅是机械式地将一种文本 (Markdown) 转换为另外一种文本 (HTML)．

从而，我们可以灵活地决定，当 AST 要被转换称为 ReactElement 时，具体的转换规则，例如，我们可以将 `<h1>` 替换为我们自己实现的一个 

```
class Heading1 extends React.Component { ... }
```

实际上：

![figure](/welcome-tailwindcss/8.png)

如上图所示，我们最终可以从 Markdown 中解析出一系列的 ReactElement 对象，并且自己来实现这些 ReactElement 对象的类．

比如说，`Heading1` 的实现：

![figure](/welcome-tailwindcss/9.png)

我们就是通过这种方式，将 tailwindcss 应用在产生自 Markdown 的网页中的．
