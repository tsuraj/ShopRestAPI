const express = require('express');
const app = express();
//use this one for logging 
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/user');
const { urlencoded } = require('body-parser');

//to log 
app.use(morgan('dev'));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin',"*");
    res.header('Access-Control-Allow-Headers',"Origin, X-Requested-With,Content-Type,Accept,Authorization");
    if(req.method==='OPTIONS'){
        res.header('Access-Control-Allow-Methods','PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

// Routes for handling requests
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/user', userRoutes);
mongoose.connect('mongodb+srv://suraj:'+process.env.MONGO_ATLAS_PW +'@cluster0.tzax7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
{
    useUnifiedTopology: true,
    useNewUrlParser: true
}
);
//Error handling
app.use((req,res, next)=>{
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});
//for handling all types of error
app.use((error, req, res, next)=>{
    res.status(error.status || 500).json({
        error:{
            message: error.message
        }
    });
});

//app.listen(3000,()=>console.log("check if port is running"));
module.exports = app;
