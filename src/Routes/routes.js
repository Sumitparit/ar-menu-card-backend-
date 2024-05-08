
const router = require("express").Router()
const passport = require('passport');

const { isAuthorized, isChef, isAdmin } = require("../Middlewares/isAutherized")

const { createProduct, fetchAllProducts, fetchOneProduct } = require("../Controllers/productController")

const { createNewOrder } = require("../Controllers/orderController")

const { getUserData, updateManyNotiToSeen } = require("../Controllers/userController")

const { getAllCurrentOrders, updateOrderData } = require("../Controllers/chefController")

const { updateProduct } = require("../Controllers/adminController")

const { checkout, verifyPayment, checkPayment } = require("../Controllers/paymentController")


/* GET home page. */
router.get('/', function (req, res) {
    res.send("ok texted go now --->")
});



// // // Create product -------------------------------------------------------------------------->

router.post("/create-product", createProduct)


router.get("/all-product", fetchAllProducts)


router.get("/one-product/:productId", fetchOneProduct)



// // // User Apis ---------------------------------------------------------------------------------->

// // // Routes for login by Google ----->
// // // Scope should given which scope of data you want to get like :- email and profile --->
router.get("/google-login", passport.authenticate("google", { scope: ['email', 'profile'] }))

router.get("/auth/google/callback", passport.authenticate("google", {
    // successRedirect: `${process.env.FRONTEND_URL}`,
    // successRedirect: `/login/success`,
    failureRedirect: "/login/failed"
}), (req, res) => {

    // console.log("User logined by Google.")

    if (req.user) {

        // console.log(req.user)

        res.cookie("token", req.user.token,
            {
                expires: new Date(Date.now() + 36000000),
                path: "/",

            }
        )

        // res.status(200).send({ status: true, message: "LogIn Successfull", data: req.user })

        // res.redirect(`${process.env.FRONTEND_URL}`)

        // res.render("googleAuth", { check: `${req.user.token}` })

        /*
          // // // TODO :  1) ---> redirect to user on google auth page from frontend with token as path params 
          2) ---> Grave the token value in page and get user data with given token by useEffect and then if eveything is good then only show the home page of frontend.
          Hope everything will good and accordingly.
        */


        // console.log("Login Done ------->")

        // let url = `${process.env.FRONTEND_URL}/user-login/${req.user.token}/newuser`


        // console.log(process.env.HASH)
        // console.log(process.env.FRONTEND_URL)

        // let url = `${process.env.FRONTEND_URL}${process.env.HASH}user-login${process.env.HASH}${req.user.token}${process.env.HASH}newuser`


        let queryUrl = `${process.env.FRONTEND_URL}${process.env.HASH || "/"}user-login?token=${req.user.token}`



        // let url = `${process.env.FRONTEND_URL}/`


        res.redirect(queryUrl)

    }
    else {
        res.status(200).send({ status: false, message: "No user found." })
    }


})


router.get("/login/failed", (req, res) => {
    // console.log(req.user)
    console.log("Failed")

    res.status(401).send({ status: false, message: "LogIn Failed" })
})


// // Check user data token ------------------------------------------------------------------------->
router.get("/userDataByToken", isAuthorized, getUserData)

router.put("/updateManyNotiToSeen", isAuthorized, updateManyNotiToSeen)



// // // Order Api ----------------------------------------------------------------------------------->
router.post("/createNewOrder", isAuthorized, createNewOrder)




// // // Chef Apis --------------------------------------------------------------------------------->
router.get("/getAllCurrentOrders", isAuthorized, isChef, getAllCurrentOrders)


router.post("/updateOrderData", isAuthorized, updateOrderData)



// // // Admin Apis ------------------------------------------------------------------------------>
router.post('/updateProductAdmin', isAuthorized, isAdmin, updateProduct)


// // // RazorPay payment route ---------------------------------->

router.post('/checkout', isAuthorized, checkout)

router.post('/verifyPayment', verifyPayment)

router.get('/getApiKey', isAuthorized, (req, res) => {

    let apiKey = process.env.RAZORPAY_API_KEY

    if (!apiKey) return res.status(400).send({ status: false, message: "Key not found, dev err." })

    res.status(200).send({ status: true, key: apiKey })
})


// // Now check paymet is done or not ???

router.get("/checkPayment", checkPayment)





module.exports = router

