// Import necessary modules
const { Category } = require('../models/category'); 
const express = require('express');
const router = express.Router();

const multer  = require('multer');
const fs = require('fs');
const { error } = require('console');

var imagesArr=[];
var categoryEditId;

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"uploads");
    },
    filename:function(req,file,cb){
        cb(null, `${Date.now()}_${file.originalname}`);
    },
})

const upload = multer({storage:storage})

router.post('/upload', upload.array("images"), async (req, res) => {

    if(categoryEditId!==undefined){
        const category=await Category.findById(categoryEditId);

        const images = category.images;

        if(images.length !==0){
            for(image of images){
                fs.unlinkSync(`uploads/${image}`);
            }
        }
    }
    imagesArr=[];
    const files = req.files;

    for(let i=0; i<files.length;i++){
        imagesArr.push(files[i].filename);
    }
    res.send(imagesArr);
});
// const cloudinary = require('cloudinary').v2;

// // Cloudinary configuration
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CONFIG_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_CONFIG_API_KEY,
//   api_secret: process.env.CLOUDINARY_CONFIG_API_SECRET,
// });

// Get all categories
router.get('/', async (req, res) => {
    try{
    const page = parseInt(req.query.page) || 1;
    const perPage = 8;
    const totalPosts = await Category.countDocuments();
    const totalPages = Math.ceil(totalPosts/perPage);

    if (page > totalPages){
        return res.status(404).json({message: "Page Not Found"})
    }

    const categoryList = await Category.find()
    .skip((page - 1) * perPage)
    .limit(perPage)
    .exec();

    if (!categoryList) {
        return res.status(500).json({ success: false });
    }

    return res.status(200).json({
        "categoryList":categoryList,
        "totalPages":totalPages,
        "page":page
    });
    
    }catch(error){
        res.status(500).json({success:false})
    }
   
});

// Get category by ID
router.get('/:id', async (req, res) => {
    categoryEditId=req.params.id;
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

    let category = new Category({
        name: req.body.name,
        images: imagesArr ,
        color: req.body.color
    });

   if (!category){
    res.status(500).json({
        error:err,
        success:false
    })
   }

   category=await category.save();
   res.status(201).json(category);
});

// Delete a category
router.delete('/:id', async (req, res) => {

    const category = await Category.findById(req.params.id);
    const images = category.images;

    if(images.length!==0){
        for(image of images){
            fs.unlinkSync(`uploads/${images}`)
        }
    }

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

    const category = await Category.findByIdAndUpdate(
        req.params.id,{
            name: req.body.name,
            images: imagesArr,
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
