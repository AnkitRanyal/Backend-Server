const { Cart } = require('../model/Cart');



exports.fetchOrderById = async (req, resp) => {
   
    if(req.query.user && req.query.product){
        
        try {
            const cartitems = await Cart.findOne({product:req.query.product,user:req.query.user}).populate('product');
            resp.status(200).json(cartitems)
        } catch (error) {
            resp.status(400).json(error)
        }
    }
   
}

exports.fetchOrders = async (req, resp) => {
   console.log(req.params)
    if(req.params.id){
        try {
            const cartitems = await Cart.find({user:req.params.id}).populate('product');
            resp.status(200).json(cartitems)
        } catch (error) {
            resp.status(400).json(error)
        }
    }
   
}
