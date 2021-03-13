import unified from 'unified'
import parse from 'remark-parse'
import remark2react from 'remark-react'

export function __compile(markdownString) {
    return unified()
        .use(parse)
        .use(remark2react)
        .processSync(markdownString)
        .result;
}
