import Head from 'next/head';
import React from 'react';
import { useRouter } from 'next/router';
import fs from 'fs';
import util from 'util';
import { GetStaticProps, GetStaticPaths } from 'next';
import { compile } from '../../helpers/markdowncompile';
import styles from '../../styles/Post.module.scss';

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: [
            { params: { postId: 'writing-in-markdown' } }
        ],
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
        let ele = compile(this.props.markdownContent) as React.Component;

        return <Paper>{ele}</Paper>
    }

}

export default Home;