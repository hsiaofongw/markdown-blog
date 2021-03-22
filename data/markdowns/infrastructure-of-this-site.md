---
title: "本站的基础设施以及及架构"
description: "升级到了 Next.js 之后的主要发展．"
date: "2021-03-15"
author: "Wayne"
---

# 本站的基础设施以及架构

*写于 2021 年 3 月 15 日：*

## 概括

**定义1**: 探索子博客系统是一个博客，它由若干个 Bulding-block 组成，正是因为它由什么什么组成，所以后面加了系统两字．

**定义2**: 一个有序四元组 \\( ( N, L, P, A ) \\) 称为是一个博客，其中 \\( N \\) 是一个字符串，它代表博客的名字，也就是站名，\\( L \\) 代表链接，主要是域名，\\( P \\) 代表 Posts, 即文章的列表，\\( A \\) 代表作者．

```
interface IArticle {
    title: string;
    description?: string;
    date: number || string;
    author: string;
    tags?: string[];
    category?: string;
    content: string;
}

interface IBlog {
    name: string;
    link: string;
    posts: IArticle[];
    author: string || IPeople;
}

interface IPeople {
    name: string;
    email?: string;
    gender?: string;
    avatar?: string || Buffer || ArrayBuffer;
}
```

**定义3**: 令：

```
import posts from 'https://exploro.one/';

let 探索子博客 = {
    name: '探索子',
    link: 'https://exploro.one',
    posts: posts as IArticle[],
    author: {
        name: 'Wayne',
        email: 'i@beyondstars.xyz'
    } 
};
```

**性质1**: 探索子博客系统由若干个子系统构成，它 function properly 的充分必要条件是：下列每一个子系统都 function properly: 

- 负责生成前端页面的：[blog-ng-nextjs](https://github.com/hsiaofongw/blog-ng-nextjs)
- 负责域名解析的：Cloudflare
- 负责 URL 动态重写服务的：[blog-data-nextjs](https://github.com/hsiaofongw/blog-data-nextjs)
- 负责提供网站元数据的：[blog-data-nextjs](https://github.com/hsiaofongw/blog-data-nextjs)
- 负责提供 PDF 资源请求转发的：[blog-data-nextjs](https://github.com/hsiaofongw/blog-data-nextjs)
- 负责 PDF 文件存储的：Aliyun
- 负责代码托管的：GitHub
- 负责持续集成和持续部署的：Vercel
- 负责友链头像图像压缩处理的：[webimagecache](https://github.com/hsiaofongw/webimagecache)
- 负责 Markdown Hosting 的：[markdown-blog](https://github.com/hsiaofongw/markdown-blog)
- 负责 Markdown 渲染的：[markdown-blog](https://github.com/hsiaofongw/markdown-blog)
- 负责数学公式渲染和标号的：MathJax
- 负责内容分发的：Vercel
- 负责访客流量统计的：Umami

**性质2**: 该博客系统使用的普通字体是：

```
font-family: "Hiragino Sans GB", "Noto Sans SC", 
    sans-serif, monospace, system-ui;
```

该博客使用的代码字体是：

```
font-family: Fira Code, Monaco, monospace;
```

**Remark**: 强烈推荐你安装并且使用 Fira Code 字体．

**性质3**: 该博客的背景色（应用于 Markdown 阅读器）是：\#344F5B.

## 工作流程

在本地写成 PDF 或者 Markdown，如果是 PDF ，则要将 PDF 上传至阿里云，然后在 blog-data-nextjs 项目中的 articles.json 文件新增一条记录．PDF 文件上传至阿里云是通过 rclone 工具进行的．

如果是 Markdown, 则在 markdown-blog-phi.vercel.app 项目中写 Markdown 文件，写好后用 Git 提交并且推送更改，则 Vercel 会自动构建，将 Markdown 编译成 HTML．

## 请求过程

当你在浏览器输入

```
exploro.one
```

并敲下回车键后，假设你的电脑安装的是类 Unix 操作系统，假设你没有在 `/etc/hosts` 文件中配置 exploro.one 这个域名的本地解析，那么操作系统将首先会根据文件

```
/etc/resolve.conf
```

中的 `nameserver` 字段来决定向哪个服务器查询 exploro.one 这个域名的 A 记录，每一级服务器，如果自身没有缓存这条记录，那么就会转而询问它的上一级 DNS 服务器（或者返回上一级 DNS 服务器的地址叫你自己去查），终会查到 Cloudflare ，或者某个缓存了 exploro.one 的 A 记录的 DNS 服务器．

你的操作系统最终得到回答：

```
;; ANSWER SECTION:
exploro.one.		377	IN	A	76.76.21.21
```

那么你的电脑紧接着会像 76.76.21.21 这个地址发起 HTTP 请求，请求 exploro.one 这个网站的首页．76.76.21.21 这个地址背后的主体是 Vercel.

我也不知道我上传到 Vercel 的 exploro.one 这个网站的前端的 Next.js 项目到底是被部署在 Vercel 网络中的哪一台服务器，反正经过层层转发，你发的请求，最终会来到那个进程，进程的名字，应该是

```
next start
```

之类的．反正就是 Next.js 的服务端进程，或者简称 Next.js 进程好了．

这个 Next.js 进程*现在*才开始构建网页：

是的，就是*现在*才开始，它首先向我部署的另外一个数据节点拉取数据：

```
export async function getServerSideProps(): Promise< { props: IHomeProps } > {

    const [postExcerptData, blogBasicMetaData] = await getDataForHomePage();
    return { props: { postExcerptData, blogBasicMetaData }};
}
```

这个 `getDataForHomePage` 则是这样的：

```
export async function getDataForHomePage(): Promise<[ IPostExcerptData[], IBlogBasicMetaData ]> {

    const postExcerptData = await getArticles();
    const blogBasicMetaData = await getBlogBasicMetaData();

    return [ postExcerptData, blogBasicMetaData ];
}
```

而 `getArticles` 和 `getBlogBasicMetaDAta` 则是这样的：

```
export async function getArticles(): Promise<IPostExcerptData[]> {
    const dataUrl = `${resourceUrl}/articles`;
    const postExcerptData = await fetch(dataUrl).then(d => d.json()) as IPostExcerptData[];
    
    return postExcerptData;
}

export async function getBlogBasicMetaData(): Promise< IBlogBasicMetaData > {
    const blogBasicMetaDataUrl = `${resourceUrl}/blog-basic-metadata`;
    const blogBasicMetaData = await fetch(blogBasicMetaDataUrl).then(d => d.json()) as IBlogBasicMetaData;

    return blogBasicMetaData;
}
```

好了假设现在 Next.js 拿到了数据，数据是文章的列表，它会把数据交给我写的一个 React.Component 的一个子类：

```
class Home extends React.Component<IHomeProps, IHomeState> {

    constructor(props: IHomeProps) {
        super(props);

        this.state = {
            "postExcerptData": [],
            "timer": undefined,
            "articleIndices": new Set<string>()
        };
    }

    

    addArticles(arrivedArticles: IPostExcerptData[]) {
        let indices = this.state.articleIndices;
        let articles = this.state.postExcerptData;

        let receivedArticles: IPostExcerptData[] = []
        for (const a of arrivedArticles) {
            const key = a.file;
            if (!indices.has(key)) {
                indices.add(key);
                receivedArticles.push(a);
            }
        }


        articles = receivedArticles.concat(articles);

        this.setState({
            "articleIndices": indices,
            "postExcerptData": articles
        });
    }

    componentDidMount() {

        let articles = this.props.postExcerptData;

        const tickPeriod =  30000;
        const timer = window.setInterval(() => this.tick(), tickPeriod);

        this.setState({
            "timer": timer
        }, () => {
            this.addArticles(articles);
            this.fetchNew();
        });
    }

    fetchNew() {
        getArticles().then(d => {
            this.addArticles(d);
        });
    }

    tick() {
        this.fetchNew();
    }

    componentWillUnmount() {
        if (this.state.timer) {
            window.clearInterval(this.state.timer);
        }
    }

    render() {
        const articles = this.state.postExcerptData;

        const articleElements = articles.map(a => <ArticleExcerpt key={a.file} {...a} />);
        const articlesListElement = <ArticleExcerptList>{articleElements}</ArticleExcerptList>

        return <Layout title="探索子" pageName={this.props.blogBasicMetaData.title} blogBasicMetaData={this.props.blogBasicMetaData}>
            <main className={styles.main}>
                {articlesListElement}
            </main>
        </Layout>;
    }

}
```

这个子类它叫做 `Home` ，也就是首页的意思，它负责生成首页的 React.Component，然后这个 React.Component 就会被 Next.js 进程借助于 `React.DOM` 的力量渲染成 HTML 文本序列，然后这个 HTML 最终会被返回到你的浏览器．

你的浏览器拿到的只是按照 HTML 语言组织起来的代码：

![figure](/infrastructure-of-this-site/2.png)

浏览器几乎同时在做两件事：请求这个 HTM 代码里面定义的依赖资源或者引用资源，比如一些 CSS 文件，JavaScript 文件之类的，一边更新显示布局，最终在一个 load 事件发生后，你很快就看到这个：

![figure](/infrastructure-of-this-site/1.png)

假设你点击其中的一篇文章，比如第一篇文章（在这篇文章发布之后就是第二篇），它的地址是：

```
https://exploro.one/posts/measures-after-an-abuse-warning
```

于是浏览器就会向这个地址发起 HTTP GET 请求，还是经过类似上面的过程，最终 Vercel 某个节点运行着的 Next.js 进程会收到这个请求，但这时有些不一样了，我们注意到在 `next.config.js` 文件中，有：

```
async function rewrites() {

    const dataAPI = "https://blog-data-nextjs.vercel.app/api";
    // const dataAPI = "http://localhost:3000/api";

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

module.exports = {
    rewrites
}
```

由于满足第一条 URL Rewrite 规则，于是 Next.js 进程会将请求重写为：

```
https://blog-data-nextjs.vercel.app/api/dynamicrewrites/posts/measures-after-an-abuse-warning
```

当前这个节点叫做 exploro.vercel.app，然后 exploro.vercel.app 会向 blog-data-nextjs.vercel.app 这个节点发起请求，请求什么呢：

```
GET /api/dynamicrewrites/posts/measures-after-an-abuse-warning
```

顾名思义，它是 dynamicrewrites 的，即提供动态重写服务的，我正是通过它来实现 PDF 和 Markdown 的统一 Pretty URL．现在转到 blog-data-nextjs.vercel.app 的视角，处理请求的是文件

```
pages/api/dynamicrewrites/[...intercept].ts
```

中的 `requestHandler` 函数：

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

由于请求的路径会匹配 `postRegex` 这个正则表达式，所以接下来执行的是：

```
await rewriteForPost(prettyPath, req, res);
```

也就是：

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

由于这个是 Markdown 文件而不是 PDF 文件，所以会执行：

```
await requestForText(destination, req, res);
```

也就是：

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

请求转而被发到 markdown-blog-phi.vercel.app ，在 markdown-blog-phi.vercel.app 上，Markdown 页面被提前渲染成 HTML , 具体怎么渲染的呢？在文件

```
pages/posts/[postId].tsx
```

中，每次进程启动时要知道哪些文件要被渲染：

```
export const getStaticPaths: GetStaticPaths = async () => {

    const markdownPath = `${process.cwd()}/data/markdowns`;
    const markdowns = await readdir(markdownPath);
    const paths = markdowns.map(markdown => {
        const markdownFilename = /^(?<postId>[\w\d\-]+)\.md$/g;
        const postId = markdownFilename.exec(markdown)?.groups?.postId || "404";
        return { params: { postId } };
    });

    return {
        paths,
        fallback: false
    };
}
```

并且读取这些文件的内容：

```
export const getStaticProps: GetStaticProps = async ({ params }) => {

    if (params) {
        const { postId } = params;
        if (typeof postId === 'string') {
            const cwd = process.cwd();  
            const fullRelPath = `${cwd}/data/markdowns/${postId}.md`;
            const fileRead = util.promisify(fs.readFile);
            
            const markdownRaw = await fileRead(fullRelPath, 'utf8');
            let { toml, markdown } = tomlAndMarkdownSeparator(markdownRaw);
            let frontMatter = parse(toml);

            return {
                props: { markdown, frontMatter }
            };
        }
    }

    return {
        props: {
            markdown: "",
            frontMatter: {}
        }
    };
}
```

并且通过文件

```
helpers/markdowncompile.ts
```

中的 `compile` 函数，也就是：

```
export function compile(markdownContent: string): React.Component {
    return __compile(markdownContent) as React.Component;
}
```

也就是文件

```
helpers/markdowncompile_wrapped.js
```

中的 `__compile` 函数，也就是：

```
export function __compile(markdownString) {
    return unified()
        .use(parse)
        .use(remark2react)
        .processSync(markdownString)
        .result;
}
```

进行解析．

在此之前，由于 Markdown 文件中都有 Front-Matter , 那么这些 Front-Matter 是怎么和纯 Markdown 进行区分的呢？在

```
helpers/toml.ts
```

文件中：

```
export function tomlAndMarkdownSeparator(mixedContent: string): ITomlAndMarkdown {
    const feature = /\-\-\-\n(?<tomlContent>[\s\S]+\n)\-\-\-\n\n(?<markdownContent>[\s\S]+)/g;
    const result = feature.exec(mixedContent);

    const toml = result?.groups?.tomlContent || "";
    const markdown = result?.groups?.markdownContent || "";

    return {
        toml, markdown
    };
}

export function parse(tomlContent: string): IFrontMatter {

    let context = {};
    const script = new vm.Script(tomlContent);
    vm.createContext(context);
    script.runInContext(context);

    return context as IFrontMatter;
}
```

我们通过正则表达式来区分 TOML 和 Markdown．

Markdown 得到的 `React.Component[]` 和更多东西结合，在 

```
pages/posts/[postId].tsx
```

文件中：

```
class Post extends React.Component<IHomeProps, {}> {

    constructor(props: IHomeProps) {
        super(props);
    }

    render() {
        const title = this.props.frontMatter?.title || "无标题";
        const description = this.props.frontMatter?.description || "无摘要";

        const headEle = <Head>
            <title>{title}</title>
            <meta name="description" content={description} />
            <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
            <script type="text/javascript" id="MathJax-script" async
                src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js">
            </script>
            <script src="/mathJaxConfig.js"></script>
        </Head>;

        const articleEle = compile(this.props.markdown) as React.Component;

        return <div>
            {headEle}
            <Paper>{articleEle}</Paper>
        </div>;
    }

}
```

然后 Next.js 进程将这个类的 `render` 函数返回的 `React.Component` 进行渲染，得到 HTML, 并将 HTML 返回给浏览器，浏览器对 HTML 进行渲染和页面布局，最终呈现出网页的页面．