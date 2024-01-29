const {Product} = require('../model/Product')



exports.search = async(req,resp)=>{
    const object = {}
    const {name} = req.query
    object.title = {$regex:name,$options:"i"}
    try {
        const products = await Product.find(object);
    resp.status(200).json(products);
    } catch (error) {
        resp.status(200).json(error);
    }
}