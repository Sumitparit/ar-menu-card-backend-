
const orderModel = require("../Models/orderModel")

const userModel = require("../Models/userModel")


// // // Create and update controller ----------->
async function createNewOrder(req, res) {

    try {


        // console.log(req.body)
        // console.log(req.tokenUserData)


        const { tableNumber, totalPrice, cartData, status } = req.body

        if (!tableNumber || !totalPrice || !cartData || !status) return res.status(400).send({ status: false, message: "All feilds are mandatory. Check the controller" })

        // // // Authorisation to create new order ---->

        let userIdInToken = req.tokenUserData.id

        // console.log(req.tokenUserData)

        // console.log(userIdInToken.toString() , userId.toString())

        // // // Not using now after Razor pay intigration ------------->
        // if (userIdInToken.toString() !== userId.toString()) return res.status(403).send({ status: false, message: "Forbidden to create the order." })


        let getUserDetails = await userModel.findOne({ id: userIdInToken })

        if (!getUserDetails) return res.status(400).send({ status: false, message: "No user found with given Id." })


        // // // Now here we can put some current oder logic ---------->

        let findCurrentOrder = await orderModel.findOne({ userId: userIdInToken, currentOrder: true }).sort({ createdAt: -1 })

        // console.log('Current order ---> ', findCurrentOrder)



        // RECEIVED" | "PROCESSING" | "ON_TABLE" 

        let arrOfOrderstatus = ["RECEIVED", "PROCESSING", "ON_TABLE"]

        if (findCurrentOrder && arrOfOrderstatus.includes(findCurrentOrder.status)) {

            // // // Some changes when new order created with current order ---->
            // // // 1. Update cart arr 
            // // // 2. Update Total Price.
            // // // 3. Update Status (Should be RECEIVED again)

            // console.log(findCurrentOrder)
            // console.log(totalPrice, findCurrentOrder.totalPrice)
            // console.log(totalPrice + findCurrentOrder.totalPrice)


            findCurrentOrder.cartData = [...cartData, ...findCurrentOrder.cartData]
            findCurrentOrder.totalPrice = totalPrice + findCurrentOrder.totalPrice
            findCurrentOrder.status = "RECEIVED"


            let updatedOrderData = await findCurrentOrder.save()

            return res.status(200).send({ status: true, message: "New item added in current order.", data: updatedOrderData, updated: true })

        } else {

            // // // Adding more keys in req.body
            req.body.customer = getUserDetails._id
            req.body.userId = getUserDetails.id

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

            return res.status(201).send({ status: true, message: "New order created.", data: createNewOrder, created: true })
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




