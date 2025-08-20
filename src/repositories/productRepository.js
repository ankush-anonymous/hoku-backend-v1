const { pool } = require("../infrastructure/PgDB/connect");

/**
 * @description Creates a new product.
 * @param {object} productData - { name, description }
 * @returns {Promise<object>} The newly created product.
 */
const createProduct = async (productData) => {
    const { name, description } = productData;
    const query = `
        INSERT INTO products (name, description)
        VALUES ($1, $2)
        RETURNING *;
    `;
    const values = [name, description];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

/**
 * @description Retrieves all active products.
 * @returns {Promise<Array<object>>} A list of all active products.
 */
const getAllProducts = async () => {
    const query = 'SELECT * FROM products WHERE is_active = TRUE;';
    const { rows } = await pool.query(query);
    return rows;
};

/**
 * @description Retrieves a single active product by its ID.
 * @param {string} id - The UUID of the product.
 * @returns {Promise<object|null>} The product object or null if not found.
 */
const getProductById = async (id) => {
    const query = 'SELECT * FROM products WHERE id = $1 AND is_active = TRUE;';
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
};

/**
 * @description Updates a product's information by its ID.
 * @param {string} id - The UUID of the product to update.
 * @param {object} updates - { name, description, is_active }
 * @returns {Promise<object|null>} The updated product object.
 */
const updateProductById = async (id, updates) => {
    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (fields.length === 0) {
        return getProductById(id);
    }

    const setClause = fields.map((field, index) => `"${field}" = $${index + 2}`).join(', ');
    const query = `
        UPDATE products
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND is_active = TRUE
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [id, ...values]);
    return rows[0] || null;
};

/**
 * @description Deletes a product by its ID (soft delete).
 * @param {string} id - The UUID of the product to delete.
 * @returns {Promise<object|null>} The product object marked as inactive.
 */
const deleteProductById = async (id) => {
    const query = `
        UPDATE products
        SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND is_active = TRUE
        RETURNING id, is_active;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProductById,
    deleteProductById,
};