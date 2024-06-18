const productModel = require("../Models/productModel")

// // // Move below controller into admin api (If user is admin then only he will able to create new product) --------->
exports.createProduct = async function (req, res) {

    try {

        console.log(req.body)

        const { name, category, price, model } = req.body

        // // Validation here ------>


        const createNewProduct = await productModel.create(req.body)

        console.log(createNewProduct)

        res.status(201).send({ status: true, message: `Data created successful.`, data: createNewProduct })



    } catch (err) {
        console.log(err.message)
        return res.status(500).send({ status: false, message: `Error by server (${err.message})` })
    }

}


exports.fetchAllProducts = async function (req, res) {
    try {

        let findAllProducts = await productModel.find({ isDeleted: false }).sort({ totelPurchases: 1, name: 1 }).select("-_id -__v -updatedAt -createdAt -isDeleted -dislikedUserIds -likedUserIds -dislikes -likes -option")

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

        if (!productId) {
            return res.status(400).send({ status: false, message: `ProductID is not given in path params` })
        }


        const fetchProduct = await productModel.findOne({ id: productId })
            .select("-_id -__v -updatedAt -createdAt ")

        // // // TODO populate the review section here -------->


        if ((!fetchProduct)) {
            return res.status(404).send({ status: false, message: `No product found.` })
        }

        if (fetchProduct.isDeleted) {
            return res.status(404).send({ status: false, message: `Product is deleted right now.` })
        }

        res.status(200).send({ status: true, message: `Fetched successfully`, data: fetchProduct })


    }
    catch (err) {
        console.log(err.message)
        return res.status(500).send({ status: false, message: `Error by server (${err.message})` })
    }
}



exports.searchByText = async function (req, res) {

    try {

        // console.log(req.query)

        let { keyword } = req.query

        if (!keyword) return res.status(400).send({ status: false, message: "Search by keyword.See your backend code." })

        keyword = keyword.toLowerCase()

        let option = 'i'          // // // This option used in regex to find data

        let getProductFromDB = await productModel.find({
            $or: [
                { name: { $regex: keyword, $options: option } }, // case-insensitive
                { category: { $regex: keyword, $options: option } },
                // { brand: { $regex: keyword, $options: option } },
            ],
            isDeleted: false     // // // Give not deleted products only 
        })



        if (getProductFromDB.length <= 0) return res.status(404).send({ status: false, message: `No data found with this keyword :(${keyword})` })

        // console.log(getProductFromDB)

        res.status(200).send({ status: true, totalData: getProductFromDB.length, data: getProductFromDB, message: `Data found successfull by this keyword : ${keyword}` })


    }
    catch (err) {
        console.log(err.message)
        return res.status(500).send({ status: false, message: `Error by server (${err.message})` })
    }
}

