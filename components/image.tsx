import React from 'react';

export class Image extends React.Component<{src:string, alt: string},{}> {
    render() {
        return <img 
            className="max-w-full mx-auto block" 
            src={this.props.src} 
            alt={this.props.alt} 
        />;
    }
}