import React from 'react';

export class Heading1 extends React.Component {
    render() {
        return <h1 className="text-4xl mt-16 md:mt-32 mb-64 text-greenandgray-base03">{this.props.children}</h1>;
    }
}

export class Heading2 extends React.Component {
    render() {
        return <h2 className="text-2xl mb-8 mt-8 text-greenandgray-base03">{this.props.children}</h2>;
    }
}
