const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    images:[
        {
        type:String,
        required:true
    }
    ],
    brand: {
        type: String,
        default: '',
    },
    price: {
        type: Number,
        default: 0,
    },
    category: {  // Corrected key name
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    CountInStock: {
        type: Number,
        required: true,
    },
    rating: {
        type: Number,
        default: 0,
    },
    numReviews: {
        type: Number,
        default: 0,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    dateCreated: {
        type: Date,
        default: Date.now,  // Capitalized 'D' for Date
    },
});

exports.Product = mongoose.model('Product', productSchema);
