const mongoose = require('mongoose');

const DressSchema = new mongoose.Schema({
    // --- Core Identifiers & Attributes ---
    user_id: {
        type: String, // UUID from your 'users' table in PostgreSQL
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

    // --- Taxonomy & Core Category (Linked to PostgreSQL) ---
    category_id: {
        type: Number, // The ID from the PostgreSQL 'dress_types' table (e.g., shirt, t-shirt, kurta)
        required: true,
        index: true
    },
    category_name: {
        type: String, // The ID from the PostgreSQL 'dress_types' table (e.g., shirt, t-shirt, kurta)
        required: true,
        index: true
    },    
sub_category_name: {
        type: String, // The ID from the PostgreSQL 'categories' table (e.g., Tops, Bottoms)
        required: true
    },
sub_category_id: {
        type: Number, // The ID from the PostgreSQL 'categories' table (e.g., Tops, Bottoms)
        required: true
    },

    // --- Physical Attributes ---
    color_palette: [{
        name: String,
        hex: String,
        coverage: Number // Percentage (0-1)
    }],
    dominant_color_hex: {
        type: String,
        default: null
    },
    print_pattern: {
        type: String,
        default: null
    },
    silhouette: {
        type: String,
        default: null
    },
    garment_length: {
        type: String,
        default: null
    },
    fit_type: {
        type: String,
        default: null
    },

    // --- Structural Components (Nested Object) ---
    components: {
        neckline: { type: String, default: null },
        sleeves: { type: String, default: null },
        waistline: { type: String, default: null },
        hemline: { type: String, default: null },
        closure: { type: String, default: null },
        collar_lapel_type: { type: String, default: null }
    },

    // --- Fabric Details (Nested Object) ---
    fabric: {
        material: { type: [String], default: [] },
        weight_drape: { type: String, default: null }, // e.g., 'lightweight', 'heavy drape'
        texture: { type: String, default: null } // e.g., 'smooth', 'ribbed'
    },

    // --- Embellishments & Details ---
    details: {
        type: [String], // e.g., ['pleats', 'embroidery', 'cut-outs']
        default: []
    },

    // --- Functional & Aesthetic Classification ---
    function_occasion: {
        type: [String], // e.g., ['casual', 'workwear', 'festive']
        default: []
    },
    // --- General & AI-Generated Tags ---
    style_tags: {
        type: [String],
        default: []
    },
    is_favorite: {
        type: Boolean,
        default: false,
        index: true
    },
    
    // --- Media Assets (e.g., URLs from Google Cloud Storage) ---
    media_assets: {
        image_urls: { type: [String], default: [] }
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

const Dress = mongoose.model('Dress', DressSchema);

module.exports = Dress;