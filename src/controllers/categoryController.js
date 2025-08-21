// /controllers/category.controller.js
const categoryRepository = require('../repositories/categoryRepository');

class CategoryController {

    async createCategory(req, res) {
        try {
            const { name, description } = req.body;
            const category = await categoryRepository.createCategory(name, description);
            res.status(201).json({ success: true, message: "Category created successfully.", data: category });
        } catch (error) {
            console.error('[CategoryController:createCategory] Error:', error.message);
            res.status(500).json({ success: false, message: "Failed to create category." });
        }
    }

    async getAllCategories(req, res) {
        try {
            const categories = await categoryRepository.findAllCategories();
            res.status(200).json({ success: true, data: categories });
        } catch (error) {
            console.error('[CategoryController:getAllCategories] Error:', error.message);
            res.status(500).json({ success: false, message: "Failed to retrieve categories." });
        }
    }

    /**
     * NEW CONTROLLER METHOD
     * @description Handles the request to get all categories with their sub-categories.
     */
    async getAllCategoriesWithSubCategories(req, res) {
        try {
            const categories = await categoryRepository.findAllCategoriesWithSubCategories();
            res.status(200).json({ success: true, data: categories });
        } catch (error) {
            console.error('[CategoryController:getAllCategoriesWithSubCategories] Error:', error.message);
            res.status(500).json({ success: false, message: "Failed to retrieve nested categories." });
        }
    }

    async updateCategoryById(req, res) {
        try {
            const { categoryId } = req.params;
            const { name, description } = req.body;
            const updatedCategory = await categoryRepository.updateCategory(categoryId, name, description);
            if (!updatedCategory) {
                return res.status(404).json({ success: false, message: "Category not found." });
            }
            res.status(200).json({ success: true, message: "Category updated successfully.", data: updatedCategory });
        } catch (error) {
            console.error('[CategoryController:updateCategoryById] Error:', error.message);
            res.status(500).json({ success: false, message: "Failed to update category." });
        }
    }

    async createSubCategoryInCategory(req, res) {
        try {
            const { categoryId } = req.params;
            const { name, description } = req.body;
            const subCategory = await categoryRepository.createSubCategory(categoryId, name, description);
            res.status(201).json({ success: true, message: "Sub-category created successfully.", data: subCategory });
        } catch (error) {
            console.error('[CategoryController:createSubCategoryInCategory] Error:', error.message);
            res.status(500).json({ success: false, message: "Failed to create sub-category." });
        }
    }

    async getAllSubCategoriesInCategory(req, res) {
        try {
            const { categoryId } = req.params;
            const subCategories = await categoryRepository.findAllSubCategoriesInCategory(categoryId);
            res.status(200).json({ success: true, data: subCategories });
        } catch (error) {
            console.error('[CategoryController:getAllSubCategoriesInCategory] Error:', error.message);
            res.status(500).json({ success: false, message: "Failed to retrieve sub-categories." });
        }
    }

    async updateSubCategoryInCategory(req, res) {
        try {
            const { subCategoryId } = req.params;
            const { name, description } = req.body;
            const updatedSubCategory = await categoryRepository.updateSubCategory(subCategoryId, name, description);
            if (!updatedSubCategory) {
                return res.status(404).json({ success: false, message: "Sub-category not found." });
            }
            res.status(200).json({ success: true, message: "Sub-category updated successfully.", data: updatedSubCategory });
        } catch (error) {
            console.error('[CategoryController:updateSubCategoryInCategory] Error:', error.message);
            res.status(500).json({ success: false, message: "Failed to update sub-category." });
        }
    }

    async deleteSubCategoryInCategory(req, res) {
        try {
            const { subCategoryId } = req.params;
            const deletedSubCategory = await categoryRepository.deleteSubCategory(subCategoryId);
            if (!deletedSubCategory) {
                return res.status(404).json({ success: false, message: "Sub-category not found." });
            }
            res.status(200).json({ success: true, message: "Sub-category deleted successfully." });
        } catch (error) {
            console.error('[CategoryController:deleteSubCategoryInCategory] Error:', error.message);
            res.status(500).json({ success: false, message: "Failed to delete sub-category." });
        }
    }
}

module.exports = new CategoryController();
