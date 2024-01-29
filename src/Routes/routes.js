
const router = require("express").Router()
const passport = require('passport');

const { isAuthorized } = require("../Middlewares/isAutherized")

const { createProduct , fetchAllProducts , fetchOneProduct } = require("../Controllers/productController")

const { createNewOrder } =  require("../Controllers/orderController")


/* GET home page. */
router.get('/', function (req, res) {
    res.send("ok texted go now --->")
});





// // // Create product ------->

router.post("/create-product" , createProduct)


router.get("/all-product" , fetchAllProducts)


router.get("/one-product/:productId" , fetchOneProduct)



// // // User Apis -------------------->


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

        let url = `${process.env.FRONTEND_URL}/user-login/${req.user.token}/newuser`


        // url = `${process.env.FRONTEND_URL}/`


        res.redirect(url)

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


// // Check user data token --->

router.get("/userDataByToken", isAuthorized, (req, res) => {

    try {
        let userData = req.tokenUserData
        res.status(200).send({ status: true, data: userData, token : userData.token ,  message: "User login successful." })

    }
    catch (err) {
        console.log(err.message)
        return res.status(500).send({ status: false, message: `Error by server (${err.message})` })
    }

})






// // // Order Api --------------->

router.post("/createNewOrder" , isAuthorized , createNewOrder)






module.exports = router

