const productRepository = require('../repositories/productRepository');

const createProduct = async (req, res) => {
    try {
        const newProduct = await productRepository.createProduct(req.body);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: "Error creating product", error: error.message });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const products = await productRepository.getAllProducts();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving products", error: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productRepository.getProductById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving product", error: error.message });
    }
};

const updateProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedProduct = await productRepository.updateProductById(id, req.body);
        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: "Error updating product", error: error.message });
    }
};

const deleteProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await productRepository.deleteProductById(id);
        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product deleted successfully", productId: deletedProduct.id });
    } catch (error) {
        res.status(500).json({ message: "Error deleting product", error: error.message });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProductById,
    deleteProductById,
};