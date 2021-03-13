import vm from 'vm';

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