
const {Order} = require("../model/Order");
const { Product } = require("../model/Product");
const { User } = require("../model/User");
const { sendMail, invoiceTemplate } = require("../services/common");
const store = require("store")

exports.createOrder = async(req,resp)=>{
  const item = req.body.Order
  const totalamount = req.body.Order.price
  const totalitems = req.body.totalItems
  const paymentmethod = req.body.paymentMethod
  const totalAmount = req.body.totalAmount
  const selectedaddress = req.body.Userdeatils.user
  const Userdeatils = req.body.Userdeatils.userid

    const order = new Order({
      items:item,
      totalAmount:totalamount,
      totalItems:totalitems,
      totalAmount:totalAmount,
      paymentMethod:paymentmethod,
      selectedAddress:selectedaddress,
      user:Userdeatils
    });
    console.log(order)
    for(let item of order.items){
        const product = await Product.findOneAndUpdate({_id:item.id},{$inc:{stock:-1*req.body.totalItems}});
       await product.save()
    }
    try {
        const doc = await order.save();
       await store.set("order",{order:doc})
        const user = await User.findById(order.user)
         sendMail({to:user.email,html:invoiceTemplate(order),subject:'Order Received' })      
        resp.status(201).json(doc);
      } catch (err) {
        resp.status(400).json(err);
      
      }
}

exports.fetchcurrentOrder = async(req,resp)=>{
  const order =await store.get('order')
 resp.status(200).json(order)
}


exports.fetchOrdersByUser = async (req, resp) => {
const {id} = req.user
try {
  const order = await Order.find({user:id})
  resp.status(200).json(order)
} catch (error) {
  resp.status(400).json(error)
  
}
}

exports.fetchOrders = async (req, resp) => {
const {id} = req.params
try {
  const order = await Order.find({user:id})
  const totalitems  = Order.find({deleted:{$ne:true}})
  const totaldoc = await totalitems.count().exec()
  resp.status(200).json({order,totaldoc})
} catch (error) {
  resp.status(400).json(error)
  
}
}

exports.fetchAllOrders = async (req, res) => {
 
let query =  Order.find({deleted:{$ne:true}})
let totalItems =  Order.find({deleted:{$ne:true}})
const totalorders =await totalItems.count().exec()
if(req.query.page && req.query.limit){
  const page = req.query.page
  const pageSize = req.query.limit
  query = query.skip(pageSize*(page-1)).limit(pageSize)
}

try {
  const order  =  await query.exec()
  res.status(200).json(order)
} catch (error) {
  res.status(400).json(error)
}
}




exports.updateOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findByIdAndUpdate(id,req.body,{new:true});
    res.status(200).json(order)
  } catch (error) {
    res.status(400).json(error)
  }
}

 
exports.deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findByIdAndDelete(id)
    res.status(200).json(order)
  } catch (error) {
    res.status(400).json(error) 
  }
}

