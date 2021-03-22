import React from 'react';

export class Paper extends React.Component {
    render() {
        return <div className="w-full bg-greenandgray-base3 sm:py-8 md:py-12 lg:py-24 text-greenandgray-base02">
            <div className="max-w-3xl md:max-w-4xl p-4 sm:p-8 md:p-16 lg:p-24 mx-auto">
                {this.props.children}
                <div className="py-32"></div>
            </div>
        </div>;
    }
}