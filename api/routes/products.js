const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'./uploads/');
    },
    filename: function(req, file, cb){
        console.log(file.originalname);
        cb(null, new Date().toISOString() + file.originalname);
    }
    
});
const fileFilter = (req,file,cb)=>{
    if(file.mimetype==='image/jpeg' || file.mimetype==='image/png'){
        cb(null,true);
    }else{

        cb(null,false);
    }
   
    
};

const upload = multer({
    storage: storage,
    limits:{
    fileSize: 1024*1024*5
 },
 fileFilter: fileFilter
});

const Product = require('../models/product');

router.get('/',(req,res,next)=>{
    Product.find()
        .select("name price _id")
        .exec()
        .then(docs=>{
            console.log(docs);
            const response = {
                count: docs.length,
                products: docs.map(doc=>{
                    return {
                        name: doc.name,
                        price: doc.price,
                        _id: doc._id,
                        request: {
                            type: 'GET',
                            url: "http://localhost:3000/products/" + doc._id
                        }
                    }
                })

            }
            res.status(200).json(response);
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.post("/",  checkAuth, upload.single('productImage'),(req, res, next)=>{
    console.log("what");
    console.log(storage);
    console.log(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });
    product
        .save()
        .then(result=>{
            console.log(result);
            res.status(201).json({
                message: "Product is created ",
                createdProduct:{
                    name: result.name,
                    price: result.price,
                    _id: result._id,
                    request:{
                        type: 'GET',
                        url: "http://localhost:3000/products/" + result._id
                    }
                }
            });
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json({error: err});
        });
    
});

router.get('/:prductId',(req,res, next)=>{
    const id = req.params.prductId;
    console.log(id);
    Product.findById(id)
        .select()   
        .exec()
        .then(doc =>{
            console.log("From database",doc);
            if(doc){
                res.status(200).json({
                    product: doc,
                    request: {
                        type: 'GET',
                        description: ' Get all the product',
                        url: "http://localhost:3000/products"
                    }
                });
            }else{
                res.status(404).json({message: "no valid entry was found for provided id"});
            }
            
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json({error: err});
        });
});

router.patch('/:productId',checkAuth,(req, res, next)=>{
    const id = req.params.productId;
    console.log(id);
    const updateOps = {};
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Product.update({_id:id},{$set: updateOps})
        .exec()
        .then(result =>{
            console.log(result);
            res.status(200).json({
                message: "Product is updated",
                request:{
                    type: 'GET',
                    url: "http://localhost:3000/products/" + id
                }
            });
        })
        .catch(error=>{
            console.log(error);
            res.status(500).json({
                error: err
            });
        });
});
router.delete('/:productId',checkAuth,(req, res, next)=>{
    id = req.params.productId;
    Product.remove({_id:id})
        .exec()
        .then(result =>{
            console.log(result);
            res.status(200).json({
                message: "product is deleted with productId: " + id,
                request:{
                    type: 'POST',
                    url: "http://localhost:3000/producst",
                    description: "You can creat the product using post request with given body",
                    body:{
                        name: 'String',
                        price: 'Number'
                    }
                }
            });
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});




module.exports = router;
