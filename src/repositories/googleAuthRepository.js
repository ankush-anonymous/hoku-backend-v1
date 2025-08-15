const { pool } = require("../infrastructure/PgDB/connect");

const saveToken = async ({ user_email, access_token, refresh_token, scope, token_type, expiry_date }) => {
    const query = `
        INSERT INTO user_google_tokens (user_email, access_token, refresh_token, scope, token_type, expiry_date)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;
    const values = [user_email, access_token, refresh_token, scope, token_type, expiry_date];
    try {
        const result = await pool.query(query, values);
        console.log(`Token saved for ${user_email}`);
        return result.rows[0];
    } catch (error) {
        console.error('Error saving Google token:', error);
        throw error;
    }
};

const updateToken = async ({ user_email, access_token, refresh_token, scope, token_type, expiry_date }) => {
    const query = `
        UPDATE user_google_tokens
        SET
            access_token = $2,
            refresh_token = $3,
            scope = $4,
            token_type = $5,
            expiry_date = $6,
            updated_at = NOW()
        WHERE user_email = $1
        RETURNING *;
    `;
    const values = [user_email, access_token, refresh_token, scope, token_type, expiry_date];
    try {
        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            console.warn(`No token found to update for ${user_email}`);
            return null;
        }
        console.log(`Token updated for ${user_email}`);
        return result.rows[0];
    } catch (error) {
        console.error('Error updating Google token:', error);
        throw error;
    }
};

const getTokenByEmail = async (user_email) => {
    const query = `
        SELECT * FROM user_google_tokens
        WHERE user_email = $1;
    `;
    try {
        const result = await pool.query(query, [user_email]);
        return result.rows[0] || null;
    } catch (error) {
        console.error(`Error fetching Google token for ${user_email}:`, error);
        throw error;
    }
};

module.exports = {
    saveToken,
    updateToken,
    getTokenByEmail,
};
