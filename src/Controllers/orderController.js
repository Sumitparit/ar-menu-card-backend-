
const orderModel = require("../Models/orderModel")

const userModel = require("../Models/userModel")


async function createNewOrder(req, res) {

    try {


        // console.log(req.body)

        const { tableNumber, totalPrice, cartData, userId, status } = req.body

        if (!tableNumber || !totalPrice || !cartData || !userId || !status) return res.status(400).send({ status: false, message: "All feilds are mandatory. Check the controller" })

        // // // Authorisation to create new order ---->

        let userIdInToken = req.tokenUserData.id

        // console.log(req.tokenUserData)

        // console.log(userIdInToken.toString() , userId.toString())

        if (userIdInToken.toString() !== userId.toString()) return res.status(403).send({ status: false, message: "Forbidden to create the order." })

        let getUserDetails = await userModel.findOne({ id: userId })

        if (!getUserDetails) return res.status(400).send({ status: false, message: "No user found with given Id." })


        // // // Now here we can put some current oder logic ---------->

        let findCurrentOrder = await orderModel.findOne({ userId: userId, currentOrder: true })

        // console.log('Current order ---> ', findCurrentOrder)


        if (findCurrentOrder && (findCurrentOrder.status === "RECEIVED" || findCurrentOrder.status === "PROCESSING" || findCurrentOrder.status === "ON_TABLE")) {

            findCurrentOrder.cartData = [...cartData, ...findCurrentOrder.cartData]

            let updatedOrderData = await findCurrentOrder.save()

            return res.status(200).send({ status: true, message: "New item added in current order.", data: updatedOrderData })

        } else {

            // // // Adding more keys in req.body
            req.body.customer = getUserDetails._id

            let dateNow = Date.now()
            req.body.orderDate = dateNow
            req.body.preparationTime = dateNow
            req.body.currentOrder = true

            // console.log(req.body)

            let createNewOrder = await orderModel.create(req.body)

            // console.log(createNewOrder)
            // // // push order _id into user data --->

            getUserDetails.orders.push(createNewOrder._id)

            await getUserDetails.save()

            // console.log(getUserDetails)

            return res.status(201).send({ status: true, message: "New order created.", data: createNewOrder })
        }

        // // // final res if no give by some reason.
        res.status(200).send({ status: true, message: "Something breaks." })

    }
    catch (err) {

        // console.log(err)

        return res.status(500).send({ status: false, message: `Server Error. ${err.message}` })
    }

}


module.exports = { createNewOrder }




