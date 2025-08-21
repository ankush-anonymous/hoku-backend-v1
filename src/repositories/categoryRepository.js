// /repositories/category.repository.js
const { pool } = require("../infrastructure/PgDB/connect"); // Adjust path if necessary

class CategoryRepository {

    // === Main Category Functions ===

    async createCategory(name, description) {
        const query = 'INSERT INTO dress_category (name, description) VALUES ($1, $2) RETURNING *;';
        try {
            const { rows } = await pool.query(query, [name, description]);
            return rows[0];
        } catch (error) {
            console.error('[CategoryRepository:createCategory] Error:', error);
            throw new Error('Database error while creating category.');
        }
    }

    async findAllCategories() {
        const query = 'SELECT * FROM dress_category ORDER BY name ASC;';
        try {
            const { rows } = await pool.query(query);
            return rows;
        } catch (error) {
            console.error('[CategoryRepository:findAllCategories] Error:', error);
            throw new Error('Database error while fetching all categories.');
        }
    }

    /**
     * NEW FUNCTION
     * @description Retrieves all main categories and nests their sub-categories within them.
     * @returns {Promise<Array<object>>} A list of categories with a 'sub_categories' array.
     */
    async findAllCategoriesWithSubCategories() {
        const query = `
            SELECT
                dc.id,
                dc.name,
                dc.description,
                COALESCE(
                    (
                        SELECT json_agg(
                            json_build_object(
                                'id', dsc.id,
                                'name', dsc.name,
                                'description', dsc.description
                            ) ORDER BY dsc.name ASC
                        )
                        FROM dress_sub_category dsc
                        WHERE dsc.category_id = dc.id
                    ),
                    '[]'::json
                ) AS sub_categories
            FROM
                dress_category dc
            ORDER BY
                dc.name ASC;
        `;
        try {
            const { rows } = await pool.query(query);
            return rows;
        } catch (error) {
            console.error('[CategoryRepository:findAllCategoriesWithSubCategories] Error:', error);
            throw new Error('Database error while fetching categories with sub-categories.');
        }
    }

    async updateCategory(categoryId, name, description) {
        const query = 'UPDATE dress_category SET name = $1, description = $2 WHERE id = $3 RETURNING *;';
        try {
            const { rows } = await pool.query(query, [name, description, categoryId]);
            return rows[0];
        } catch (error) {
            console.error(`[CategoryRepository:updateCategory] Error updating category ${categoryId}:`, error);
            throw new Error('Database error while updating category.');
        }
    }

    // === Sub-Category Functions ===

    async createSubCategory(categoryId, name, description) {
        const query = 'INSERT INTO dress_sub_category (category_id, name, description) VALUES ($1, $2, $3) RETURNING *;';
        try {
            const { rows } = await pool.query(query, [categoryId, name, description]);
            return rows[0];
        } catch (error) {
            console.error(`[CategoryRepository:createSubCategory] Error creating sub-category in category ${categoryId}:`, error);
            throw new Error('Database error while creating sub-category.');
        }
    }

    async findAllSubCategoriesInCategory(categoryId) {
        const query = 'SELECT * FROM dress_sub_category WHERE category_id = $1 ORDER BY name ASC;';
        try {
            const { rows } = await pool.query(query, [categoryId]);
            return rows;
        } catch (error) {
            console.error(`[CategoryRepository:findAllSubCategoriesInCategory] Error fetching sub-categories for category ${categoryId}:`, error);
            throw new Error('Database error while fetching sub-categories.');
        }
    }

    async updateSubCategory(subCategoryId, name, description) {
        const query = 'UPDATE dress_sub_category SET name = $1, description = $2 WHERE id = $3 RETURNING *;';
        try {
            const { rows } = await pool.query(query, [name, description, subCategoryId]);
            return rows[0];
        } catch (error) {
            console.error(`[CategoryRepository:updateSubCategory] Error updating sub-category ${subCategoryId}:`, error);
            throw new Error('Database error while updating sub-category.');
        }
    }

    async deleteSubCategory(subCategoryId) {
        const query = 'DELETE FROM dress_sub_category WHERE id = $1 RETURNING *;';
        try {
            const { rows } = await pool.query(query, [subCategoryId]);
            return rows[0];
        } catch (error) {
            console.error(`[CategoryRepository:deleteSubCategory] Error deleting sub-category ${subCategoryId}:`, error);
            throw new Error('Database error while deleting sub-category.');
        }
    }
}

module.exports = new CategoryRepository();
