import React from 'react';

export class PreciseType extends React.Component {
    render() {
        return <pre className="overflow-scroll border-greenandgray-base01 border-2 rounded-none p-2">{this.props.children}</pre>;
    }
}

export class Code extends React.Component {
    render() {
        return <code className="leading-7">{this.props.children}</code>;
    }
}