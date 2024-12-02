const { Category } = require('../models/category'); 
const { Product } = require('../models/product'); 
const express = require('express');
const router = express.Router();
// const pLimit = require('p-limit');
//const cloudinary = require('cloudinary').v2;
const multer  = require('multer');
const fs = require('fs');



// Cloudinary configuration
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CONFIG_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_CONFIG_API_KEY,
//   api_secret: process.env.CLOUDINARY_CONFIG_API_SECRET,
// });
var imagesArr=[];
var productEditId;

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"uploads");
    },
    filename:function(req,file,cb){
        cb(null, `${Date.now()}_${file.originalname}`);
    },
})

const upload = multer({storage:storage})

router.post(`/upload`, upload.array("images"), async (req, res) => {

    let images;
    if(productEditId !== undefined){
        const product= await Product.findById(productEditId);

        if(product){
            images=product.images;
            console.log(images)
        }
        if (images.length !==0){
            for(image of images){
                fs.unlinkSync(`uploads/${image}`);
            }
            productEditId="";
        }
    }
    imagesArr=[];
    const files = req.files;

    for(let i=0; i<files.length;i++){
        imagesArr.push(files[i].filename);
    }
   
    res.send(imagesArr);
});

// Get all products
router.get('/', async (req, res) => {

    try{
    const page = parseInt(req.query.page) ||1;
        const perPage=10;
        const totalPosts = await Product.countDocuments();
        const totalPages=Math.ceil(totalPosts/perPage);

    if(page>totalPages){
        return res.status(404).json({message:"page not found"})
    }

    const productList = await Product.find().populate("category")
    .skip((page - 1)*perPage)
    .limit(perPage)
    .exec();

    if (!productList) {
        res.status(500).json({ success: false });
    }
    return res.status(200).json({
        "products":productList,
        "totalPages":totalPages,
        "page":page
    });
    }catch(error){
         res.send(productList);
    }
});

// Create a new product
router.post('/create', async (req, res) => {

    
    const category = await Category.findById(req.body.category);

    if(!category){
        return res.status(404).send("invalid Category!")
    }

    let product = new Product({
        name:req.body.name,
        description:req.body.description,
        images:imagesArr,
        brand:req.body.brand,
        price:req.body.price,
        oldPrice:req.body.oldPrice,
        category:req.body.category,
        CountInStock:req.body.CountInStock,
        rating:req.body.rating,
        isFeatured:req.body.isFeatured,
    })

    product= await product.save();

    if (!product) {
        res.status(500).json({ 
            error:err ,
            success: false 
        });
    }

    res.status(201).json(product)

});

// Delete a products
router.delete('/:id', async (req, res) => {

    const product = await Product.findById(req.params.id);
    const images = product.images;

    if(images.length!==0){
        for(image of images){
            fs.unlinkSync(`uploads/${images}`)
        }
    }

    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
        return res.status(404).json({
            message: 'Product not found!',
            success: false
        });
    }

    res.status(200).json({
        success: true,
        message: 'Product Deleted!'
    });
});

router.get('/:id', async (req, res) => {
    productEditId=req.params.id;

    const product = await Product.findById(req.params.id);
    if (!product) {
        res.status(500).json({ message: 'the product with the given ID was not found.' });
    }
    return res.status(200).send(product);
});

// Delete a products
router.delete('/:id', async (req, res) => {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
        return res.status(404).json({
            message: 'Product not found!',
            success: false
        });
    }

    res.status(200).json({
        success: true,
        message: 'Product Deleted!'
    });
});


//put Product
router.put('/:id',async(req,res)=>{

    // const limit = pLimit(2);

    // const imagesToUpload = req.body.images.map((image) => {
    //     return limit(async () => {
    //         const result = await cloudinary.uploader.upload(image);
    //         return result;
    //     });
    // });

    // const uploadStatus = await Promise.all(imagesToUpload);
    // const imgurl = uploadStatus.map((item) => item.secure_url);

    // if (!uploadStatus) {
    //     return res.status(500).json({
    //         error: "Images cannot upload!",
    //         status: false
    //     });
    // }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
        name:req.body.name,
        description:req.body.description,
        images:imagesArr,
        brand:req.body.brand,
        price:req.body.price,
        category:req.body.category,
        CountInStock:req.body.CountInStock,
        rating:req.body.rating,
        numReviews:req.body.numReviews,
        isFeatured:req.body.isFeatured,
        dateCreated:req.body.dateCreated,
        },
        {new:true}
    );

    if(!product){
        res.status(404).json({
            message:'product cannot be updated',
            status:false
        })
    }
    res.status(200).json({
        message:"the product is updated!",
        status:true
    });

    //res.send(product); 
});

 





module.exports=router;
