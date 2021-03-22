---
title: "为这个站点实现 Pretty URL"
description: "什么是 Pretty URL? 我又怎么为这个站点实现它．"
date: "2021-03-17"
author: "Wayne"
---

# 为这个站点实现 Pretty URL

*写于 2021 年 3 月 17 日：*

## 什么是 Pretty URL

在 RESTFul 风格的 API 设计中，一般要求 HTTP 动词和路径能体现出语义，简单来说，就是看到 HTTP 方法就知道要做什么，看到 HTTP 路径就知道要对谁做．比如说：

```
GET /posts/implement-pretty-url
```

就是 RESTFul 的，因为 GET 动词表示取，`/posts` 表示文章，`/posts/implement-pretty-url` 表示 posts 目录下的一篇被标识为 implement-pretty-url 的文章，所以意思是：获取 posts 目录下一篇标识为 implement-pretty-url 的文章，这就是它的语义．

将互联网比作城市，网站就好像是建筑物，浏览器地址栏上显示的 URL 就好像是路标——告诉用户他此刻处在的位置．

## 为什么要为这个网站实现 Pretty URL

除了 Pretty URL 本身的好处之外，还有其他原因：

- 我为这个网站写过的文章的载体形式有 Markdown 和 PDF 两种；
- 要把新站 [exploro.one](https://exploro.one) 和旧站 [beyondstars.xyz](https://beyondstars.xyz) 的文章的表示在形式上统一起来；
- 要把 Markdown 文档和 PDF 文档的表示在形式上统一起来．

统一成什么呢？

统一成形如：

```
/posts/<postId>
```

的形式．并且为每一篇文章，不论它是来自旧站 [beyondstars.xyz](https://beyondstars.xyz) 还是新站 [exploro.one](https://exploro.one)，不论它是 Markdown 的还是 PDF 的，都分配一个唯一的，清晰易读的 `postId` 作为新的统一 Pretty URL 的关键组成．

## 怎么实现

首先，探索子博客系统在[体系架构](https://exploro.one/abouts/infrastructure-of-this-site)上是数据与样式分离的，并且内容即数据．数据与样式分离，意味着我可以在不改动也不搬动数据一丝一毫的情况下，给网站的前端更换技术方案．比如说将现有的 Next.js 换成 Vue 或者 React 或者 Gatsby, 不会有任何问题．

那么首先，对于数据，我是将它存放在代码仓库 [blog-data-nextjs](https://github.com/hsiaofongw/blog-data-nextjs)，对于前端，我是将它存放在代码仓库 [blog-ng-nextjs](https://github.com/hsiaofongw/blog-ng-nextjs), 对于 Markdown 内容和文章的图片，放在 [markdown-blog](https://github.com/hsiaofongw/markdown-blog). 具体地，每一篇文章都是按照如下的接口来描述：

```
interface IPostExcerptData {
    name: string;
    file: string;
    date: string;
    description?: string;
    prettyPath?: string;
}
```

其中 `file` 是主键，指向这篇文章的实际的、原始的位置．`name` 是中文标题，`description` 是摘要，`prettyPath` 是后续要由程序自动生成并填充的字段，也就是 Pretty URL.

也就是说，我是直接从文章元数据开始生成 PrettyURL．

在仓库 [blog-data-nextjs](https://github.com/hsiaofongw/blog-data-nextjs), 文件 `helpers/dtos.ts`:

```
export async function getPosts(): Promise<IPostExcerptData[]> {

    for (const p of posts) {

        const fileName = p.file;

        if ('prettyPath' in p) {
            ;
        }
        else {
            const pdfRegex = /\/(?<postId>[\w\d\-]+)\.pdf$/g;
            const markdownRegex = /markdown-blog-phi\.vercel\.app\/posts\/(?<postId>[\w\d\-]+)$/g;

            const matchForPDf= pdfRegex.exec(fileName);
            const matchForMarkdown = markdownRegex.exec(fileName);

            const postId = matchForPDf?.groups?.postId || matchForMarkdown?.groups?.postId || "unMatch";

            p['prettyPath'] = `/posts/${postId}`;
        }
    }

    return posts;
}
```

函数 `getPosts` 在返回文章列表的同时，还顺便检查是否已经有了 `prettyPath`, 如果没有，则按照正则表达式替换的方法得到 `prettyPath`．

例如，通过执行：

```
curl https://blog-data-nextjs.vercel.app/api/articles | jq
```

我们可以看到生成的 `prettyPath` 看起来是怎么样的：

```
file: https://markdown-blog-phi.vercel.app/posts/measures-after-an-abuse-warning
prettyPath: /posts/measures-after-an-abuse-warning

file: https://markdown-blog-phi.vercel.app/posts/writing-in-markdown
prettyPath: /posts/writing-in-markdown

file: https://blog-data-nextjs.vercel.app/api/pdfs/proxy-case-study-1.pdf
prettyPath: /posts/proxy-case-study-1

file: https://markdown-blog-phi.vercel.app/posts/dynamic-programming-intro
prettyPath: /posts/dynamic-programming-intro
```

可以看到：函数 `getPosts` 中的替换正则高效地生成了每一篇文章的 `prettyPath`.

数据已经就绪，样式上也需要做出相应地体现，所以说是怎么体现的呢？

在仓库 [blog-ng-nextjs](https://github.com/hsiaofongw/blog-ng-nextjs), 文件 `components/ArticleExcerpt.tsx`:

```
export class ArticleExcerpt extends React.Component<IPostExcerptData, {}> {
    render() {
        const title = this.props.name;
        const description = this.props.description;
        const date = this.props.date;
        const file = this.props.prettyPath || this.props.file;
        // const file = this.props.file;

        return <li>
            <a href={file} target="_blank">
                <h2>{title}</h2>
                <div className={styles.description}>{description}</div>
                <time dateTime={date} >{date}</time>
            </a>
        </li>;
    } 
}
```

在生成列表时，React 会将收到的每一个 IPostExcerptData 都渲染成 ArticleExcerpt, 在这其中，实现 Pretty URL 的主要的逻辑就是：查看收到的数据中有无有效的 `prettyPath` 字段，如果有，那么 `href` 就置成这个 `prettyPath`, 如果没有，那么 `href` 就直接指向文章的原始位置．

现在，如果我们打开[博客首页](https://exploro.one/)，并且用开发者工具去看，就会看到：

![figure](/implement-pretty-url/1.png)

这正是 ArticleExcerpt 实现的效果．

我们没有用包含了域名的绝对 URL，是因为域名是在变动的，比如说，Vercel 会为每一个 Deploy 都生成一个专门的域名用做预览用途．

现在如果我们点击其中一篇，比如说就点击

```
/posts/writing-in-markdown
```

这篇，那么浏览器就会首先将它拼成完整的绝对路径 URL，也就是包含了域名和协议的那种：

```
https://exploro.one/posts/writing-in-markdown
```

浏览器现在会以 TLS 的方式验证 exploro.one 的主体真实性，然后以 HTTP 协议，请求 

```
/posts/writing-in-markdown
```

这个资源．

在服务端，运行着的 Next.js 进程接受到请求，它根据配置文件 `next.config.js`（仓库 [blog-data-nextjs](https://github.com/hsiaofongw/blog-data-nextjs)）中定义了的 URL 重写规则：

```
async function rewrites() {

    const dataAPI = "https://blog-data-nextjs.vercel.app/api";

    let routes = [];

    routes.push({
        source: '/posts/:anything(.+)',
        destination: `${dataAPI}/dynamicrewrites/posts/:anything`
    });

    routes.push({
        source: '/abouts/:anything(.+)',
        destination: `${dataAPI}/dynamicrewrites/abouts/:anything`
    });

    return routes;
}
```

将 URL 重写为：

```
https://blog-data-nextjs.vercel.app/api/dynamicrewrites/posts/writing-in-markdown
```

别担心，并不是说就直接返回这一串这么长的东西给客户端，而是服务端的 Next.js 进程，自己再向这个重写后得到的地址发起请求．

由于 blog-data-nextjs.vercel.app 正是它自己，所以接下来执行的代码是在仓库 [blog-data-nextjs](https://github.com/hsiaofongw/blog-data-nextjs) 的

```
pages/api/dynamicrewrites/[...intercept].ts 
```

文件．

在该文件中，函数 `requestHandler` 首先接待了这个请求：

```
async function requestHandler(req: NextApiRequest, res: NextApiResponse) {

    console.log({
        "datetime": new Date().toISOString(),
        "invoke": "requestHandler",
        "req.url": req.url
    });

    const postRegex = /(?<prettyPath>\/(posts|abouts)\/[\w\d\-]+)$/g;
    const matchPost = postRegex.exec(req?.url || "");
    if (matchPost) {
        const prettyPath = matchPost?.groups?.prettyPath || "";
        if (prettyPath) {
            await rewriteForPost(prettyPath, req, res);
            return;
        }
    }

    const resourceRegex = /\/.+\/(posts|abouts)(?<resourceName>\/.+\.\w+)$/g;
    const matchResource = resourceRegex.exec(req?.url || "");
    if (matchResource) {
        const resourceName = matchResource?.groups?.resourceName || "";
        if (resourceName) {
            await rewriteForResource(resourceName, req, res);
            return;
        }
    }

    res.status(404).json({
        "msg": "Not Found!",
        "req.url": req.url
    });
}
```

我们注意到

```
const postRegex = /(?<prettyPath>\/(posts|abouts)\/[\w\d\-]+)$/g;
```

并且请求路径

```
/api/dynamicrewrites/posts/writing-in-markdown
```

与 `postRegex` 这个正则匹配．

所以接下来被执行的是函数 `rewriteForPost`:

```
async function rewriteForPost(prettyPath: string, req: NextApiRequest, res: NextApiResponse) {

    console.log({
        "datetime": new Date().toISOString(),
        "invoke": "rewriteForPost",
        "prettyPath": prettyPath,
        "req.url": req.url,
        "destination": rules[prettyPath] || ""
    });

    if (Object.keys(rules).length === 0) {
        rules = await buildRewriteRules();
    }

    if (prettyPath in rules) {
        const destination = rules[prettyPath];

        const pdfRegex = /\.pdf$/g;
        const matchPDF = pdfRegex.exec(destination);
        if (matchPDF) {
            await requestForBinary(destination, req, res);
        }
        else {
            await requestForText(destination, req, res);
        }
    }
    else {
        res.status(404).json({
            "msg": "No match post for this prettyPath",
            "prettyPath": prettyPath
        });
    }
}
```

在该函数中，我们注意到了 `rules` 这个对象，它的类型是：

```
interface IRewriteRules {
    [key: string]: string;
}
```

通过它，prettyPath 路径：

```
/posts/writing-in-markdown
```

被转变成回原来的原始路径：

```
https://markdown-blog-phi.vercel.app/posts/writing-in-markdown
```

由于它（原始路径）后面没有 `.pdf` ，所以它被判定为是 Markdown 文档而非 PDF 文档，所以函数 `requestForText` 被执行：

```
async function requestForText(url: string, req: NextApiRequest, res: NextApiResponse) {

    console.log({
        "datetime": new Date().toISOString(),
        "invoke": "requestForText",
        "url": url
    });

    let { headers, body } = await got(url, {
        responseType: 'text'
    }).catch(e => {

        console.log({
            "datetime": new Date().toISOString(),
            "invoke": "requestForText",
            "url": url,
            "error": true,
            "error.message": e.message || "",
            "error.code": e.code || ""
        });

        return {
            headers: {},
            body: "404"
        };
    });

    body = body.replace(/href="\//g, 'href="');
    body = body.replace(/src="\//g, 'src="');
    res.send(body);
}
```

于是请求被发送到了：

```
https://markdown-blog-phi.vercel.app/posts/writing-in-markdown
```

于是一路返回到 `requestHandler` 函数，然后又回到 `next.config.js` ，然后又回到用户的浏览器．

对于 PDF 文档的 Pretty URL 的实现，以及 Abouts 目录下的所有文章的 Pretty URL 的实现，也都是类似的过程．读者若感兴趣，可去翻看具体的[源码](https://github.com/hsiaofongw/blog-data-nextjs)．

## 资源路径的转发

在 Markdown 文件中写作，人们往往会引入图片，使得图文并茂，使文章看起来更生动．但是和 PDF 相反，Markdown 默认是不包括图片内容的，图片的引用是以超链接（或者相对路径）的方式，也就是说，Markdown 文件保存的只是图片的路径而不是图片本身．

本博客的所有 Markdown 文章是位于仓库 [markdown-blog](https://github.com/hsiaofongw/markdown-blog) 中的 `data/markdowns` 目录．对于该目录下的每一篇 Markdown, 比如一幅图片的引用：

```
![figure](/implement-pretty-url/1.png)
```

在该 Markdown 文件被传化为 HTML 文件后，会以这样的形式出现：

```
<img src="/implement-pretty-url/1.png" alt="figure" />
```

也就是说，当用户请求

```
https://exploro.one/posts/implement-pretty-url
```

这篇文章后，浏览器发现服务器返回的 HTML 文件中有

```
<img src="/implement-pretty-url/1.png" alt="figure" />
```

这个 tag, 于是浏览器会向

```
https://exploro.one/implement-pretty-url/1.png
```

拉取图片．exploro.one 对应的是 [blog-ng-nextjs](https://github.com/hsiaofongw/blog-ng-nextjs) 这个仓库，而不是那个 Markdown 仓库 [markdown-blog](https://github.com/hsiaofongw/markdown-blog)，也就是说，这个资源：

```
https://exploro.one/implement-pretty-url/1.png
```

它并不存在．或者说，它不是正确的路径．它正确的路径其实是：

```
https://markdown-blog-phi.vercel.app/implement-pretty-url/1.png
```

从而我们看到这就引出了一个新问题：正确实现资源路径 URL 的重写．

我们的解决方案是这样子的：我们对每一篇 Markdown 文章，我们会将图片路径前面的那个正斜杠去掉，也就是让 

```
href="/implement-pretty-url/1.png"
```

变成：

```
href="implement-pretty-url/1.png
```

具体的实现是位于仓库 [blog-data-nextjs](https://github.com/hsiaofongw/blog-data-nextjs), 文件 

```
/pages/api/dynamicrewrites/[...intercept].ts/
```

中的函数 `requestForText` ：

```
async function requestForText(url: string, req: NextApiRequest, res: NextApiResponse) {

    console.log({
        "datetime": new Date().toISOString(),
        "invoke": "requestForText",
        "url": url
    });

    let { headers, body } = await got(url, {
        responseType: 'text'
    }).catch(e => {

        console.log({
            "datetime": new Date().toISOString(),
            "invoke": "requestForText",
            "url": url,
            "error": true,
            "error.message": e.message || "",
            "error.code": e.code || ""
        });

        return {
            headers: {},
            body: "404"
        };
    });

    body = body.replace(/href="\//g, 'href="');
    body = body.replace(/src="\//g, 'src="');
    res.send(body);
}
```

中的最后几行：

```
body = body.replace(/href="\//g, 'href="');
body = body.replace(/src="\//g, 'src="');
```

意思就是，当 blog-data-nextjs.vercel.app 这个节点向 markdown-blog-phi.vercel.app 这个节点请求到了 Markdown 编译好的 HTML 之后，会将其中的 

```
href="/
src="/
```

统统替换为

```
href="
src="
```

正是实现了上面我们所说的．

那么现在，在浏览器请求：

```
https://exploro.one/posts/implement-pretty-url
```

得到的 HTML 文件中，图片标签实际上更像是：

```
<img src="implement-pretty-url/1.png" alt="figure" />
```

从而浏览器就会向

```
https://exploro.one/posts/implement-pretty-url/1.png
```

发起请求（当前的基路径是 `/posts` 而非 `/posts/implement-pretty-url` ）．

这会触发服务器 exploro.one 上面的重写规则，它位于仓库 [blog-ng-nextjs](https://github.com/hsiaofongw/blog-ng-nextjs), 文件 `next.config.js`:

```
async function rewrites() {

    const dataAPI = "https://blog-data-nextjs.vercel.app/api";

    let routes = [];

    routes.push({
        source: '/posts/:anything(.+)',
        destination: `${dataAPI}/dynamicrewrites/posts/:anything`
    });

    routes.push({
        source: '/abouts/:anything(.+)',
        destination: `${dataAPI}/dynamicrewrites/abouts/:anything`
    });

    return routes;
}
```

实际上它和前面将

```
/posts/writing-in-markdown
```

重写为

```
https://blog-data-nextjs.vercel.app/api/dynamicrewrites/posts/writing-in-markdown
```

的是同一个．这里是将

```
/posts/implement-pretty-url/1.png
```

重写为

```
https://blog-data-nextjs.vercel.app/api/dynamicrewrites/posts/implement-pretty-url/1.png
```

并且会最终交给节点 blog-data-nextjs.vercel.app, 仓库 [blog-data-nextjs](https://github.com/hsiaofongw/blog-ng-nextjs) 上面的

```
pages/api/dynamicrewrites/[...intercept].ts
```

文件来处理，具体而言，先后会触发这些函数：

```
requestHandler -> rewriteForResource -> requestForBinary
```

然后将请求到的图片返回给上一层，上一层再将图片返回给浏览器．

## 总结

写这篇文章的目的是将我编码实现 URL 动态重写的方法记录在这里，一是为了使得代码库具有一定的持续可维护性，二是以防我忘记我当成具体是怎么实现它的．