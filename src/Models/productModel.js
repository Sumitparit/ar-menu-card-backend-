
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



    model: {
        src: String,
        iosSrc: String
    },

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

    isNonVeg: {
        type: Boolean,
        default: false
    },

    timeRequired: {
        type: String,
        default: '10 min'
    },

    // // This feild will include rank of product.
    // // If any purchse or review given by user dev will increase by value (code is written like that).
    // // purchase by value (i think every time 1) and review added then increase by +1.
    totelPurchases: {
        type: Number,
        default: 0
    },

    productRank: {
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

