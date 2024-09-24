// Import necessary modules
const { Category } = require('../models/category'); 
const express = require('express');
const router = express.Router();
const pLimit = require('p-limit');
const cloudinary = require('cloudinary').v2;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CONFIG_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CONFIG_API_KEY,
  api_secret: process.env.CLOUDINARY_CONFIG_API_SECRET,
});

// Get all categories
router.get('/', async (req, res) => {
    const categoryList = await Category.find();
    if (!categoryList) {
        return res.status(500).json({ success: false });
    }
    res.send(categoryList);
});

// Get category by ID
router.get('/:id', async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        return res.status(404).json({
            message: 'The category with the given Id was not found.'
        });
    }
    return res.status(200).send(category);
});

// Create a new category
router.post('/create', async (req, res) => {
    const limit = pLimit(2);

    const imagesToUpload = req.body.images.map((image) => {
        return limit(async () => {
            const result = await cloudinary.uploader.upload(image);
            return result;
        });
    });

    const uploadStatus = await Promise.all(imagesToUpload);
    const imgurl = uploadStatus.map((item) => item.secure_url);

    if (!uploadStatus) {
        return res.status(500).json({
            error: "Images cannot upload!",
            status: false
        });
    }

    let category = new Category({
        name: req.body.name,
        images: imgurl,
        color: req.body.color
    });

    try {
        category = await category.save();
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({
            error: err.message,
            success: false
        });
    }
});

// Delete a category
router.delete('/:id', async (req, res) => {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);

    if (!deletedCategory) {
        return res.status(404).json({
            message: 'Category not found!',
            success: false
        });
    }

    res.status(200).json({
        success: true,
        message: 'Category Deleted!'
    });
});

//put category
router.put('/:id',async(req,res)=>{

    const limit = pLimit(2);

    const imagesToUpload = req.body.images.map((image) => {
        return limit(async () => {
            const result = await cloudinary.uploader.upload(image);
            return result;
        });
    });

    const uploadStatus = await Promise.all(imagesToUpload);
    const imgurl = uploadStatus.map((item) => item.secure_url);

    if (!uploadStatus) {
        return res.status(500).json({
            error: "Images cannot upload!",
            status: false
        });
    }

    

    const category = await Category.findByIdAndUpdate(
        req.params.id,{
            name: req.body.name,
            images: imgurl,
            color: req.body.color
        },
        {new:true}
    )
    if(!category){
        return res.status(500).json({
            message:'Category cannot be updated',
            success:false
        })
    }
    res.send(category);
});

module.exports = router;
