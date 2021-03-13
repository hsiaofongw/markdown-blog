import Head from 'next/head';
import React from 'react';
import fs from 'fs';
import util from 'util';
import { GetStaticProps, GetStaticPaths } from 'next';
import { compile } from '../../helpers/markdowncompile';
import styles from '../../styles/Post.module.scss';
import { readdir } from 'fs/promises';

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

export const getStaticProps: GetStaticProps = async ({ params }) => {

    let markdownContent = "";

    if (params) {
        const { postId } = params;
        if (typeof postId === 'string') {
            const cwd = process.cwd();  
            const fullRelPath = `${cwd}/data/markdowns/${postId}.md`;
            const fileRead = util.promisify(fs.readFile);
            
            markdownContent = await fileRead(fullRelPath, 'utf8');
        }
    }

    return {
        props: {
            markdownContent
        }
    };
}

class Paper extends React.Component<IPaperProps, {}> {
    constructor(props: IPaperProps) {
        super(props);
    }

    render() {
        return <main className={styles.paper}>{this.props.children}</main>
    }
}

class Home extends React.Component<IHomeProps, {}> {

    constructor(props: IHomeProps) {
        super(props);
    }

    render() {
        const headEle = <Head>
            <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
            <script type="text/javascript" id="MathJax-script" async
                src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js">
            </script>
            <script src="/mathJaxConfig.js"></script>
        </Head>;

        const articleEle = compile(this.props.markdownContent) as React.Component;

        return <div>
            {headEle}
            <Paper>{articleEle}</Paper>
        </div>;
    }

}

export default Home;