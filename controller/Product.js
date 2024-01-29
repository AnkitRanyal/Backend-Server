const {Product} = require("../model/Product")


exports.createProduct = async(req,resp)=>{
    
    try {
        const product = new Product(req.body)
        const doc= await product.save()
    resp.status(201).json(doc)
    } catch (error) {
        resp.status(400).json(error)
    }
}

exports.fetchAllProducts = async(req,resp)=>{
    let condition = {}
    if(!req.query.admin){
        condition.deleted = {$ne:true}
    }
    
    let query =  Product.find(condition)
    let totalitem = Product.find(condition)
if(req.query.brand){
    query = query.find({brand:req.query.brand})
    totalitem = totalitem.find({brand:req.query.brand})
 
}
if(req.query.category){
    query = query.find({category:req.query.category})
  
    totalitem = totalitem.find({category:req.query.category})
   
}
if(req.query.sort && req.query.order && req.query.limit){
    query =query.find({}).sort({[req.query.sort]:req.query.order}).limit(req.query.limit)
    totalitem =  Product.find({}).sort({[req.query.sort]:req.query.order})


}



if(req.query.page && req.query.limit){
    const page = req.query.page
    const pageSize = req.query.limit
    query = query.skip(pageSize*(page-1)).limit(pageSize)
}
try {
        const totaldoc =await totalitem.count().exec()
        const product = await query.exec()
resp.status(200).json({product,totaldoc})
    } catch (error) {
        resp.status(400).json(error)
    }
}



exports.fetchProductById = async(req,resp)=>{
    const id = req.params.id
   
    try {
     const product = await Product.findById(id)
     resp.status(200).json(product)
    } catch (error) {
     resp.status(200).json(error)
    }
 }
 


exports.UpdateProduct = async(req,resp)=>{
   const id = req.params.id
   try {
    const product = await Product.findByIdAndUpdate(id,req.body,{new:true})
    resp.status(200).json(product)
   } catch (error) {
    resp.status(200).json(error)
   }
}

exports.DeleteProduct = async(req,resp)=>{
   const id = req.params.id
   try {
    const product = await Product.findByIdAndDelete(id)
    resp.status(200).json(product)
   } catch (error) {
    resp.status(200).json(error)
   }
}