import Head from 'next/head';
import React from 'react';
import fs from 'fs';
import util from 'util';
import { GetStaticProps, GetStaticPaths } from 'next';
import { readdir } from 'fs/promises';
import matter from 'gray-matter';
import { markdownToReact } from '../../helpers/markdown';
import { Paper } from '../../components/paper';

// 告诉 Next.js 哪些路径需要渲染．
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

// 在构建期运行，读取并解析 Markdown 文件内容
export const getStaticProps: GetStaticProps = async ({ params }) => {

    let frontMatter: IFrontMatter = {
        author: 'unknown',
        title: 'unknown',
        date: 'unknown',
        description: 'unknown'
    };

    let markdownContent: string = "# 渲染失败";

    if (params) {
        const { postId } = params;
        if (typeof postId === 'string') {
            const cwd = process.cwd();  
            const fullRelPath = `${cwd}/data/markdowns/${postId}.md`;
            const fileRead = util.promisify(fs.readFile);
            
            const markdownRaw = await fileRead(fullRelPath, 'utf8');

            const { data, content } = matter(markdownRaw);
            
            markdownContent = content;

            for (const key in frontMatter) {
                if (key in data) {
                    frontMatter[key] = data[key];
                }
            }
        }
    }

    return {
        props: {
            markdownContent, frontMatter
        }
    };
}

class Home extends React.Component<IPostProps, { markdownNode: React.ReactNode }> {

    constructor(props: IPostProps) {
        super(props);

        this.state = {
            markdownNode: markdownToReact(this.props.markdownContent)
        }
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

        return <div>
            {headEle}
            <Paper>{this.state.markdownNode}</Paper>
        </div>;
    }

}

export default Home;