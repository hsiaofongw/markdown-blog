/// <reference types="next" />
/// <reference types="next/types/global" />

interface IPaperProps {

}

interface IFrontMatter {
    author?: string;
    title?: string;
    date?: string;
    description?: string;
}


interface IHomeProps {
    markdown: string;
    frontMatter: IFrontMatter
}

interface ITomlAndMarkdown {
    toml: string;
    markdown: string;
}
