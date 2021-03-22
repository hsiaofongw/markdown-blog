import { _markdownToReact } from './_markdown';

export function markdownToReact(text: string): React.ReactNode {
    return _markdownToReact(text) as React.ReactNode;
}