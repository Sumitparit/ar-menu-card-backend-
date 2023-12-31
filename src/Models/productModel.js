
const mongoose = require("mongoose")


const uuid = require("uuid")

const productSchema = new mongoose.Schema({

    id: {
        type: String,
        unique: true,
        required: true,
        default: () => uuid.v4()
    },


    // // // not default values (These vlaue should given during the creation of new product) -->

    name: {
        type: String,
        required: [true, "Title of product is required"],
        trim: true
    },

    category: String,


    price: {
        type: Number,
        required: true
    },

    discountPercentage: {
        type: Number,
        default: 0
    },



    option: [
        {
            _id: false,

            optionName: [String, String],
            // // [key , value] ex : ["color" , "white"]
            optionVerity: [String, String],
            // // [key , value] ex : ["RAM-ROM" , "4-64"]
            optionStock: { type: Number, default: 0 },
            optionPrice: { type: Number, default: 0 },
            optionId: {
                type: String,
                default: () => uuid.v4()
            }

        }
    ],


    model: String,

    // // // Default values here ----->

    review: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "review"
    },

    rating: {
        totalPerson: {
            type: Number,
            default: 0
        },
        totalStars: {
            type: Number,
            default: 0
        }
    },


    likes: {
        type: Number,
        required: true,
        default: 0
    },
    
    dislikes: {
        type: Number,
        required: true,
        default: 0
    },

    likedUserIds: {
        type: [String],
        default: []
    },

    dislikedUserIds: {
        type: [String],
        default: []
    },

    isDeleted: {
        type: Boolean,
        default: false
    }

},
    { timestamps: true }
)



module.exports = mongoose.model('product', productSchema)

