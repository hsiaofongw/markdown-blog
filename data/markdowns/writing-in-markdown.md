# 用 Markdown 写作

我之前是用 PDF 写作的，如今也打算尝试下用 Markdown 写东西．

## 用 Markdown 写作有什么好处？

首先，VS Code 支持 Markdown 的实时预览，因此可以算得上有非常好的编辑器支持．

其次，Markdown 写起来非常简单，适合做简单的排版，而且 Markdown 也能够被轻易地编译成 HTML 放到网页上面去显示．

以及，Markdown 基本上全是纯文字的，可被 git，可做版本控制．

## Markdown 相比 latex/PDF 方案怎么样？

Markdown 是即时预览的，编译时间忽略不计．

PDF 需要被编译出来，但是在其中可以嵌入字体、图片和数学公式，就显示效果来说更加有效．可以说 PDF 是自含的 (self-contain)，它不像 Markdown 转成 HTML 后，当用户阅读时，浏览器还要去拉取图片等资源．

Markdown 也可以输入数学公式，但是数学公式的显示效果肯定不如 latex/PDF 方案做出来的好．

Markdown 不能方便地自动编号，交叉引用等．

## 将如何与 Next.js/React.js 集成呢？

主要是基于 remark/remark-react.js 方案，它能够自动地将 Markdow 文本信息转成 `React.Component`，这样 Markdown 写成的文章就可以方便地转成 HTML 了．

## 总结

Markdown 和 PDF 方案都有各自的好处，本站将会同时应用这两种方案．不那么复杂的东西，我们一般会用 Markdown 来写，用 Markdown 不太好写的，我们可能会用 PDF．
