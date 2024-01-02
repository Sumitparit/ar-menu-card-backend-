
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



    customizations: {
        sizes: [
            {
                name: String,
                additionalPrice: Number
            },
            {
                name: String,
                additionalPrice: Number
            },
            {
                name: String,
                additionalPrice: Number
            }

        ],
        crusts: [
            {
                name: String,
                additionalPrice: Number
            },

            {
                name: String,
                additionalPrice: Number
            },
            {
                name: String,
                additionalPrice: Number
            }


        ]
    },



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

    totelPurchases: {
        type: Number,
        default: 0
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

