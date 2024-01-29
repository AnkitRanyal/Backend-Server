const express = require('express');
const { createOrder, fetchOrdersByUser, deleteOrder, updateOrder, fetchAllOrders, fetchOrders, fetchcurrentOrder } = require('../controller/order');

const orderrouter = express.Router();

orderrouter.post('/', createOrder)
      .get('/current', fetchcurrentOrder)
      .get('/:id', fetchOrders)
      .get('/', fetchAllOrders)
      .get('/own/', fetchOrdersByUser)
      .delete('/delete/:id', deleteOrder)
      .patch('/:id', updateOrder)


exports.orderrouter = orderrouter;
