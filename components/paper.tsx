import React from 'react';
import styles from '../styles/Post.module.scss';

export class Paper extends React.Component<IPaperProps, {}> {
    constructor(props: IPaperProps) {
        super(props);
    }

    render() {
        return <main className={styles.paper}>{this.props.children}</main>
    }
}
