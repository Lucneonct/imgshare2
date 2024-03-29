const path = require('path')
const { randomNumber } = require('../helpers/libs');
const fs = require('fs-extra');
const { Image } = require('../models');
const { Comment }= require('../models');
const md5 = require('md5')
const sidebar = require('../helpers/sidebar')

const ctrl = {};

ctrl.index = async (req, res) => {
    let viewModel = {image: {}, comments: {}}
    let id = req.params.image_id;
    const image = await Image.findOne({filename: { $regex: id }}).lean({ virtuals: true});
    
    if(id.length !== 10) {
        res.redirect('/')
    } else if(image) {
        viewmodel = await sidebar(viewModel);
        viewModel.image = image;
        await Image.findOneAndUpdate({ _id: image.id }, { $inc: { views: 1 } })
        const comments = await Comment.find({image_id: image._id}).lean();
        viewModel.comments = comments;
        res.render('images', viewModel);
    } else {
        res.redirect('/')
    }
};

ctrl.create = (req, res) => {
    const saveImage = async () => {
        const imageUrl = randomNumber();
        const images = await Image.find({filename: imageUrl});
        if(images.length > 0) {
            saveImage()
        } else {        
            const imageTempPath = req.file.path;    
            const ext = path.extname(req.file.originalname).toLowerCase();
            const targetPath = path.resolve(`src/public/upload/${imageUrl + ext}`) 
            if(ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
                await fs.rename(imageTempPath, targetPath);
                const newImg = new Image({
                    title: req.body.title,
                    filename: imageUrl + ext,
                    description: req.body.description
                })
                const imgSaved = await newImg.save();
                res.redirect(`/images/${imageUrl}`);
            } else {
                await fs.unlink(imageTempPath);
                res.status(500).json({error: 'Only images are allowed'});
            }
        }
    };

    saveImage()
};

ctrl.like = async (req, res) => {
    const image = await Image.findOne({filename: {$regex: req.params.image_id}});
    console.log(image)
    if(image) {
        image.likes++;
        await image.save();
        res.json({likes: image.likes})
    } else {
        res.status(500).json({error: 'Internal Error'})
    }
};

ctrl.comment = async (req, res) => {
    const image = await Image.findOne({filename: {$regex: req.params.image_id}});
    if(image) {
        const newComment = new Comment(req.body);
        newComment.gravatar = md5(newComment.email);
        newComment.image_id = image._id;
        newComment.save()
        res.redirect('/images/'+ image.uniqueId)
    }
};

ctrl.remove = async(req, res) => {
    const image = await Image.findOne({filename: {$regex: req.params.image_id}});
    if(image) {
        await fs.unlink(path.resolve('./src/public/upload/' + image.filename));
        await Comment.deleteOne({image_id: image._id});
        await image.remove();
        res.json(true);
    }
};

module.exports = ctrl;