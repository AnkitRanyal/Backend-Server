const express = require('express');
const { addToCart, fetchCartByUser, deleteFromCart, updateCart,fetchCartById } = require('../controller/cart');

const cartrouter = express.Router();
cartrouter.post('/:id', addToCart)
      .get('/', fetchCartByUser)
      .delete('/:id', deleteFromCart)
      .patch('/:id', updateCart)


exports.cartrouter = cartrouter;
