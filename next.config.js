async function rewrites() {
    return [
        {
            source: '/posts/:postId/:resourceId',
            destination: '/:postId/:resourceId'
        }
    ];
}

module.exports = {
    rewrites
};