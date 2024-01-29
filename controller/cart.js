const { Cart } = require('../model/Cart');


exports.addToCart = async (req, resp) => {
    const id = req.params.id;
   
    if(id){
        console.log(id)
    try {
        const cart = new Cart({quantity:req.body.quantity,product:req.body.id, user: id });
        const cartitems = await cart.save()
        const result = await cartitems.populate('product');
        resp.status(201).json(result)
    } catch (error) {
        resp.status(400).json(error)
    }
}
}


exports.fetchCartByUser = async (req, resp) => {
    const id = req.query.user
    try {
        const cart = await Cart.find({ user: id }).populate("product");
        resp.status(200).json(cart)
    } catch (error) {
        resp.status(400).json(error)
    }
    
}

exports.updateCart = async (req, resp) => {
    const { id } = req.params;
    try {
        const cart = await Cart.findByIdAndUpdate(id, req.body, { new: true })
        const result = await cart.populate("product")
        resp.status(200).json(result)
    } catch (error) {
        resp.status(400).json(error)
    }
}


exports.deleteFromCart = async (req, res) => {
    const { id } = req.params;
    try {
        const doc = await Cart.findOneAndDelete({product:id})
        res.status(200).json(doc);
    } catch (err) {
        res.status(400).json(err);
    }
};