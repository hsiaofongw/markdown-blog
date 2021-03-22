import unified from 'unified'
import parse from 'remark-parse'
import remark2react from 'remark-react'
import React from 'react';

import { Heading1, Heading2 } from '../components/heading';
import { Code, PreciseType } from '../components/code';
import { Paragraph } from '../components/paragraph';
import { UnorderedList, ListItem } from '../components/list';
import { Image } from '../components/image';

export function _markdownToReact(text) {
    return unified()
        .use(parse)
        .use(remark2react, {
            remarkReactComponents: {
                h1: Heading1,
                h2: Heading2,
                pre: PreciseType,
                code: Code,
                p: Paragraph,
                ul: UnorderedList,
                li: ListItem,
                img: Image
            }
        })
        .processSync(text).result;
}

