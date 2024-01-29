const express = require('express');
const { fetchOrderById,fetchOrders} = require('../controller/checkout');

const checkoutrouter = express.Router();

checkoutrouter.get('/',fetchOrderById).get('/:id',fetchOrders)
      


exports.checkoutrouter = checkoutrouter;
