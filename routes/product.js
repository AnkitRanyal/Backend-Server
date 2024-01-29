
const express = require("express")
const {isAuth} = require("../services/common")
const { createProduct, fetchAllProducts, fetchProductById, DeleteProduct,UpdateProduct } = require("../controller/Product")
const productrouter = express.Router()


productrouter.post("/",createProduct)
             .patch("/:id",UpdateProduct)
             .get("/",fetchAllProducts)
             .get("/?sort=&order=&page=&limit=",fetchAllProducts)
             .get("/?page=&limit=",fetchAllProducts)
             .get("/:id",fetchProductById)
             .delete("/delete/:id",DeleteProduct)

exports.productrouter = productrouter