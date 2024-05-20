// const instance = require()

// // // Checkout handler fn here ------------>

const Razorpay = require('razorpay')
const crypto = require("crypto")


// // // RazorPay options creating here to inti razorpay (Creating new instance here) ------------>
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET,
});



exports.checkout = async (req, res) => {

    try {

        // console.log(req.body)

        const amount = req.body.amount

        if (!amount) return res.status(400).send({ status: false, message: "Amount is not given in body." })


        const options = {
            amount: Number(amount) * 100,  // amount in the smallest currency unit
            currency: "INR",
            // receipt: "order_rcptid_11"
        };

        let order = await instance.orders.create(options);

        // console.log({ order })

        res.status(200).send({ status: true, message: "Order create successfully. ", order })


    } catch (err) {
        return res.status(500).send({ status: false, message: err.message, })
    }

}




const razorPaymentModel = require('../Models/razorPaymentModel')



exports.verifyPayment = async (req, res) => {

    try {

        // console.log(req.body)

        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
        } = req.body


        // console.log({ razorpay_payment_id, razorpay_order_id, razorpay_signature, cartData })

        // if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return res.status(400).send({ status: false, message: "Mandatory fields are not given." })


        // // // Now verify order ------------------>

        const body = razorpay_order_id + '|' + razorpay_payment_id

        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_API_SECRET)
            .update(body.toString())
            .digest("hex")


        // console.log("sig r", razorpay_signature)
        // console.log("sig g", expectedSignature)


        const isPaymentVerified = razorpay_signature === expectedSignature

        if (isPaymentVerified) {

            // // // Now here save in database -------------->

            const paymentInToDB = await razorPaymentModel.create(req.body)

            console.log({ paymentInToDB })


            let queryUrl = `${process.env.FRONTEND_URL}${process.env.HASH || "/"}orderSuccess?orderId=${razorpay_order_id}`

            // let url = `${process.env.FRONTEND_URL}/`
            res.redirect(queryUrl)

        } else {

            return res.status(400).send({ status: false, message: "Payment is not verified." })
        }



        // res.status(200).send({ status: true, message: "Order create successfully. " })


    } catch (err) {
        return res.status(500).send({ status: false, message: err.message, })
    }

}




exports.checkPayment = async (req, res) => {
    try {

        // console.log(req.query)

        let orderId = req.query.orderId

        if (!orderId) return res.status(400).send({ status: false, message: "Order Id is not given." })

        let findPaymentData = await razorPaymentModel.findOne({ razorpay_order_id: orderId })

        if (!findPaymentData) return res.status(404).send({ status: false, message: "No payment data found with given orderId." })

        res.status(200).send({ status: true, message: "Payment data fetched.", payment: findPaymentData })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message, })
    }
}


