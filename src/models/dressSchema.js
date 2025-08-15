const mongoose = require('mongoose');

const DressSchema = new mongoose.Schema({
    // --- Core Identifiers & Attributes ---
    user_id: {
        type: String, // UUID from your 'users' table
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    brand: {
        type: String,
        default: null,
        index: true
    },
    size: {
        type: String,
        default: null
    },

    // --- Dynamic Taxonomy (Linked to PostgreSQL) ---
    dress_type_id: {
        type: Number, // The ID from the PostgreSQL 'dress_types' table
        required: true,
        index: true
    },
    category_id: {
        type: Number, // The ID from the PostgreSQL 'categories' table
        required: true
    },

    // --- AI-Generated & Analytical Fields ---
    style_tags: { type: [String], default: [] },
    material: { type: [String], default: [] },
    pattern: { type: String, default: null },
    color_palette: [{
        name: String,
        hex: String,
        coverage: Number // Percentage (0-1)
    }],
    dominant_color_hex: { type: String, default: null },
    ai_features: {
        clarity_score: Number,
        composition_score: Number,
        embedding: { type: [Number], default: [] }, // Vector embedding for similarity search
        generated_tags: { type: [String], default: [] }
    },

    // --- Context and Suitability ---
    season_suitability: {
        type: [String],
        enum: ["spring", "summer", "autumn", "winter", "rainy", "all_seasons"],
        default: []
    },
    occasion_suitability: {
        type: [String],
        enum: ["daily_wear", "beach", "party", "work", "formal_event", "sport", "lounge", "wedding", "halloween", "cosplay_event", "themed_party", "other"],
        default: []
    },

    // --- User-Specific Context ---
    user_context: {
        personal_rating: { type: Number, min: 1, max: 5 },
        notes: String
    },
    is_favorite: {
        type: Boolean,
        default: false,
        index: true
    },
    
    // --- Media Assets (Stored in Google Cloud Storage) ---
    media_assets: {
        image_urls: { type: [String], default: [] },
        video_url: { type: String, default: null }
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

const Dress = mongoose.model('Dress', DressSchema);

module.exports = Dress;