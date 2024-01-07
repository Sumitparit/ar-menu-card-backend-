
const mongoose = require("mongoose")
const uuid = require("uuid")


const userSchema = new mongoose.Schema({

    id: { type: String, default: () => uuid.v4() },

    firstName: { type: String, required: true, trim: true },

    lastName: { type: String, required: true, trim: true },

    email: { type: String, required: true, trim: true, unique: true },

    password: { type: String, required: true, trim: true, default: "LogIn by google" },

    profilePic: { type: String, default: "https://res.cloudinary.com/dlvq8n2ca/image/upload/v1700368567/ej31ylpxtamndu3trqtk.png" },

    role: { type: String, default: "user" },

    // whenCreted: { type: String, default: () => Date.now() },

    // // arr of obj
    address: [{
        _id: false,
        id: {
            type: String,
            default: () => uuid.v4()
        },
        city: { type: String, trim: true },
        street: { type: String, trim: true },
        country: { type: String, trim: true },
        pincode: { type: String, trim: true }
    }],

    orders: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "order"
    },


    carts: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "cart"
    },




}, { timestamps: true })



module.exports = mongoose.model("user", userSchema)
