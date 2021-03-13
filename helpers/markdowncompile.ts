import React from 'react';
import { __compile } from './markdowncompile_wrapped';

export function compile(markdownContent: string): React.Component {
    return __compile(markdownContent) as React.Component;
}