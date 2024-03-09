const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    // Login information
    ID: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },

    // Essential
    isDeveloper: {
        type: Boolean,
        default: false
    },
    isPremium: {
        type: Boolean,
        default: false
    },

    // Economy
    wallet: {
        type: Number,
        default: 310
    },
    bank: {
        type: Number,
        default: 0
    },
    lastDaily: {
        type: Number
    }
})
const userSchemaData = mongoose.model("Users", userSchema)

module.exports = {
    userSchemaData
}