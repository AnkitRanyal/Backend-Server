const express = require('express');
const { fetchBrands, createBrand, fetchBrandsByName } = require('../controller/brand');

const brandrouter = express.Router();
brandrouter.get('/', fetchBrands).post('/', createBrand).get("/name",fetchBrandsByName);

exports.brandrouter = brandrouter;
