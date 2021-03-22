import React from 'react';

export class Paragraph extends React.Component {
    render() {
        return <p className="mb-6 mt-6 text-justify">{this.props.children}</p>;
    }
}