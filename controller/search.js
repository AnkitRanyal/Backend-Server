const {Product} = require('../model/Product')



exports.search = async(req,resp)=>{
    const object = {}
    const {name} = req.query
    object.title = {$regex:name,$options:"i"}
    try {
        const products = await Product.find(object);
        if(products.length){
            resp.status(200).json(products);
           
        }else{
            resp.status(200).json({message:"Product not found"})
           
        }
    } catch (error) {
        resp.status(200).json(error);
    }
}