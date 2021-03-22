import React from 'react';

export class UnorderedList extends React.Component {
    render() {
        return <ul className="pl-8 list-disc">{this.props.children}</ul>;
    }
}

export class ListItem extends React.Component {
    render() {
        return <li className="mb-2">{this.props.children}</li>;
    }
}