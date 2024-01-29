const express = require('express');
const { fetchCategories, createCategory, fetchCategoriesByName } = require('../controller/category');

const categoryrouter = express.Router();

categoryrouter.get('/', fetchCategories).post('/',createCategory).get("/:category",fetchCategoriesByName)

exports.categoryrouter = categoryrouter;
