


const mongoose = require("mongoose")
const uuid = require("uuid")


const notificationSchema = new mongoose.Schema({
    id: { type: String, default: () => uuid.v4() },

    message: String,

    notificationDate: { type: Date, default: Date.now() },

    isDeleted: {
        type: Boolean,
        default: false
    },

    orderId: {
        type: String,
        default: "null"
    },

    userId: {
        type: String,
        default: "null"
    },

    isSeen: {
        type: Boolean,
        default: false
    }

}, { timestamps: true })



module.exports = mongoose.model("notification", notificationSchema)

