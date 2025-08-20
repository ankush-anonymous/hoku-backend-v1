const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const productValidator = require('../validators/productValidator');

// POST /api/products - Create a new product
router.post(
    '/',
    productValidator.validateCreateProduct,
    productController.createProduct
);

// GET /api/products - Get all products
router.get(
    '/',
    productController.getAllProducts
);

// GET /api/products/:id - Get a product by ID
router.get(
    '/:id',
    productController.getProductById
);

// PUT /api/products/:id - Update a product
router.put(
    '/:id',
    productValidator.validateUpdateProduct,
    productController.updateProductById
);

// DELETE /api/products/:id - Delete a product
router.delete(
    '/:id',
    productController.deleteProductById
);

module.exports = router;