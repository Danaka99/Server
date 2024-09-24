const express= require('express');
const app= express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors= require('cors');
require('dotenv/config');
const pLimit = require('p-limit');

app.use(cors());
app.options('*',cors());

//middleware
app.use(bodyParser.json());
app.use(express.json());  // Add this middleware to parse JSON requests
mongoose.connect(process.env.CONNECTION_STRING)


//routes
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');

app.use('/api/category', categoryRoutes);
app.use('/api/products', productRoutes);

mongoose.connect(process.env.CONNECTION_STRING,{
    useNewUrlParser: true,
    useUnifiedTopology:true
})
.then(()=>{
    console.log('Database Connection is ready...');

    //Server
    app.listen(process.env.PORT,()=>{
    console.log(`server is running http://localhost:${process.env.PORT}`);
})
})
.catch((err)=>{
    console.log(err);
})

