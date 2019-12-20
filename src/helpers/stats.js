const { Comment, Image } = require('../models');

async function imagesCounter() {
    return await Image.countDocuments();
}

async function commentsCounter() {
    return await Comment.countDocuments();
}

async function imageTotalViewsCounter() {
    const images = await Image.find();
    let views = 0;
    images.map(data => {
        views += data.views;
    })
    return views;
}

async function imageTotalLikesCounter() {
    const images = await Image.find();
    let likes = 0;
    images.map(data => {
        likes += data.likes
    })
    return likes;
}

module.exports = async () => {
    const results = await Promise.all([
        imagesCounter(),
        commentsCounter(),
        imageTotalLikesCounter(),
        imageTotalViewsCounter()
    ]);

    return {
        images: results[0],
        comments: results[1],
        totalLikes: results[2],
        totalViews: results[3]
    }
}