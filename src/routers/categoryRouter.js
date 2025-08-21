// /routes/category.router.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController'); // Corrected filename
const {
    validateCreateCategory,
    validateUpdateCategory,
    validateCreateSubCategory,
    validateUpdateSubCategory
} = require('../validators/categoryValidator'); // Corrected filename

// === Main Category Routes ===

// POST /api/v1/categories/createCategory
router.post('/createCategory', validateCreateCategory, categoryController.createCategory);

// GET /api/v1/categories/getAllCategory
router.get('/getAllCategory', categoryController.getAllCategories);

// GET /api/v1/categories/getAllWithSubCategories - Get all categories with nested sub-categories
router.get('/getAllWithSubCategories', categoryController.getAllCategoriesWithSubCategories);

// PUT /api/v1/categories/updateCategoryById/:categoryId
router.put('/updateCategoryById/:categoryId', validateUpdateCategory, categoryController.updateCategoryById);

// === Sub-Category Routes ===

// POST /api/v1/categories/createSubCategoryInCategory/:categoryId/subcategories
router.post('/createSubCategoryInCategory/:categoryId', validateCreateSubCategory, categoryController.createSubCategoryInCategory);

// GET /api/v1/categories/getAllSubCategoryInCategory/:categoryId
router.get('/getAllSubCategoryInCategory/:categoryId', categoryController.getAllSubCategoriesInCategory);

// PUT /api/v1/categories/updateSubCategory/:subCategoryId
router.put('/updateSubCategory/:subCategoryId', validateUpdateSubCategory, categoryController.updateSubCategoryInCategory);

// DELETE /api/v1/categories/deleteSubCategory/:subCategoryId
router.delete('/deleteSubCategory/:subCategoryId', categoryController.deleteSubCategoryInCategory);

module.exports = router;
