const { query } = require('express');
const { Brand } = require('../model/Brand');
const {Product} = require("../model/Product")
exports.fetchBrands = async (req, res) => {
  try {
    const brands = await Brand.find({}).exec();
    
    res.status(200).json(brands);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.fetchBrandsByName = async (req, resp) => {
  try {
    if(req.query.brand){
      const  product =await Product.find({brand:req.query.brand})
      const  totalitem =await Product.find({brand:req.query.brand}).count().exec()
      resp.status(200).json({product,totalitem})
    }else{
    resp.status(400).json(err);
  }
   
  } catch (err) {
    resp.status(400).json(err);
  }
};

exports.createBrand = async (req, res) => {
  const brand = new Brand(req.body);
  try {
    const doc = await brand.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json(err);
  }
};
