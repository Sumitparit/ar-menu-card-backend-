
const orderModel = require("../Models/orderModel")


exports.getAllCurrentOrders = async function (req, res) {

    // res.send("ok ok ")


    try {

        let validStatusOfOrder = ["RECEIVED", "PROCESSING", "ON_TABLE", "COMPLETED", 'CANCELED']

        // let validStatusOfOrder = ["RECEIVED", "PROCESSING"]

        let getCurOrderData = await orderModel.find({ status: { $in: validStatusOfOrder } })
            .sort({ updatedAt: -1 })
            .select("-__v -updatedAt -createdAt -_id")

        // console.log(getCurOrderData)

        if (getCurOrderData.length <= 0) return res.status(404).send({ status: true, message: `Current order not found.(Not any order found with these(${validStatusOfOrder}) status.)` })

        res.status(200).send({ status: true, dataLength: getCurOrderData.length, message: "Current order fetched!", data: getCurOrderData })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}



exports.updateOrderData = async function (req, res) {
    try {


        if (!req.body || Object.keys(req.body).length <= 0) return res.status(400).send({ status: false, message: "Give data to update.(Bad Request)" })

        const { whatUpdate, orderId, ...resBody } = req.body


        if (!whatUpdate || !orderId) return res.status(400).send({ status: false, message: "Give what update field please.(Bad Request)" })

        let updatedData = null;

        let findOrderData = await orderModel.findOne({ id: orderId })

        if (!findOrderData) return res.status(404).send({ status: false, message: "No data found with given orderId." })

        if (whatUpdate === "chefStatus") {

            const { status, time, startPreparation } = resBody


            // findOrderData.startPreparation = startPreparation

            // // console.log(endPreparation, startPreparation)

            if (time) {
                findOrderData.preparationTime = time
            }


            if (status === "PROCESSING") {
                const { startPreparation } = resBody
                findOrderData.startPreparation = startPreparation
            }

            if (status === "ON_TABLE" || status === "COMPLETED" || status === "CANCELED") {
                const { endPreparation } = resBody
                findOrderData.endPreparation = endPreparation || null
            }


            findOrderData.status = status

        }
        else if (whatUpdate === "") {

        }



        // console.log(findOrderData)
        // console.log(updatedData)


        updatedData = await findOrderData.save()

        res.status(200).send({ status: true, message: "Order updated!", data: updatedData })


    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


