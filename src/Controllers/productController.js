const productModel = require("../Models/productModel")


exports.createProduct = async function (req, res) {

    try {

        console.log(req.body)

        const { name, category, price, model } = req.body

        // // Validation here ------>


        const createNewProduct = await productModel.create(req.body)

        // console.log(createNewProduct)

        res.status(201).send({ status: true, message: `Data created successful.`, data: createNewProduct })



    } catch (err) {
        console.log(err.message)
        return res.status(500).send({ status: false, message: `Error by server (${err.message})` })
    }

}




exports.fetchAllProducts = async function (req, res) {
    try {

        let findAllProducts = await productModel.find({ isDeleted: false }).select("-_id -__v -updatedAt -createdAt -isDeleted -dislikedUserIds -likedUserIds -dislikes -likes -option")

        if (findAllProducts.length <= 0) {
            return res.status(404).send({ status: false, message: `No data found. please connect to developer` })
        }

        res.status(200).send({ status: true, message: `Fetched successfully`, data: findAllProducts })

    } catch (err) {
        console.log(err.message)
        return res.status(500).send({ status: false, message: `Error by server (${err.message})` })
    }

}




exports.fetchOneProduct = async function (req, res) {

    try {

        let productId = req.params.productId

        // console.log(productId)



        const fetchProduct = await productModel.findOne({id : productId})
        .select("-_id -__v -updatedAt -createdAt -isDeleted ")

        // // // TODO populate the review section here -------->


        if((!fetchProduct)){
            return res.status(404).send({ status: false, message: `No product found.` })
        }

        res.status(200).send({ status: true, message: `Fetched successfully`, data: fetchProduct })


    }
    catch (err) {
        console.log(err.message)
        return res.status(500).send({ status: false, message: `Error by server (${err.message})` })
    }
}


