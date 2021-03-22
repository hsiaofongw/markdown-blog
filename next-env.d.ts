/// <reference types="next" />
/// <reference types="next/types/global" />

interface IPaperProps {

}

interface IFrontMatter {
    [key: string]: string;

    author?: string;
    title?: string;
    date?: string;
    description?: string;
}

interface IPostProps {
    markdownContent: string;
    frontMatter: IFrontMatter
}

interface ITomlAndMarkdown {
    toml: string;
    markdown: string;
}
