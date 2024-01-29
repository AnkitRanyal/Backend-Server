const express = require('express');
const { fetchUserById, updateUser } = require('../controller/user');

const userrouter = express.Router();
userrouter.get('/:id', fetchUserById)
      .patch('/:id', updateUser)

exports.userrouter = userrouter;
