require('dotenv').config()
const express = require('express');
const mongoose = require("mongoose")
const cors = require('cors')
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require("jsonwebtoken")

const userModel = require("./src/Models/userModel")



// const bcrypt = require("bcrypt")


const app = express()
const indexRouter = require("./src/Routes/routes")


// // TODO : change mongoDB string below --------->

mongoose.connect(process.env.DB_STRING)
    .then(() => console.log("Mongoose connected successfully"))
    .catch((err) => { console.log("An error occured :- " + err) })



// // // CORS code ---->
app.use(cors({
    credentials: true,
    origin: `${process.env.FRONTEND_URL}`
}))


// // // UseFull middlewares ------->
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



// // Code for passport and express-session

app.use(session({
    secret: 'keyboard',
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
}));

app.use(passport.authenticate('session'));




// // // Code for Google Stratgy ---->
passport.use("google", new GoogleStrategy({

    // // Using in production on my app --->
    clientID: `${process.env.LOCAL === "LOCAL" ? process.env.GOOGLE_CLIENT_ID_LOACL : process.env.GOOGLE_CLIENT_ID}`,
    clientSecret: `${process.env.LOCAL === "LOCAL" ? process.env.GOOGLE_CLIENT_SECRET_LOCAL : process.env.GOOGLE_CLIENT_SECRET}`,
    callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,

    // // // Credential for laocal --->
    // clientID: `${process.env.GOOGLE_CLIENT_ID_LOACL}`,
    // clientSecret: `${process.env.GOOGLE_CLIENT_SECRET_LOCAL}`,
    // callbackURL: `http://localhost:3000/auth/google/callback`
},
    async function (accessToken, refreshToken, profile, done) {
        // userModel.findOrCreate({ googleId: profile.id }, function (err, user) {
        //   return cb(err, user);
        // });


        // console.log(profile)


        const { photos, name } = profile

        const email = profile.emails[0].value

        // console.log(email)

        const { givenName: firstName, familyName: lastName } = name

        // console.log(id)
        // console.log(displayName)
        // console.log(photos[0].value)
        // console.log(firstName)
        // console.log(lastName)

        // let createOrFindUser = await userModel.



        // // // This will store data -->
        let userProfile;


        // // // Checking user is present or not --->
        let checkUserWithEmail = await userModel.findOne({ email: email })

        if (checkUserWithEmail) {

            userProfile = checkUserWithEmail

        } else {

            let newUserDataObj = {
                email: email,
                firstName: firstName,
                lastName: lastName,
                profilePic: photos[0].value,
            }

            userProfile = await userModel.create(newUserDataObj)

        }


        // let userProfile = await userModel.findOneAndUpdate(
        //   { email: email },
        //   newUserDataObj,
        //   { new: true, upsert: true }
        // ).lean()
        // // // Below object to check only ------>
        // console.log(userProfile)



        // // // Create JWT Token, store UUID id of user inside it.
        // // // Means email storing in token o user (user token will store user id) ------>
        const token = jwt.sign({ id: userProfile.id }, process.env.JWT_SECRET_KEY, { expiresIn: '100d' });

        let sendUserdetails = {
            id: userProfile.id,
            // name: `${userProfile.firstName} ${userProfile.lastName}`,
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            email: userProfile.email,
            profilePic: userProfile.profilePic,
            role: userProfile.role,
            token: token,
        }

        // console.log(sendUserdetails)

        done(null, sendUserdetails)

    }
));



// // // This creates session variable req.user on being from callbacks -->
passport.serializeUser(function (user, cb) {
    process.nextTick(function () {

        // return cb(null, {
        //   id: user.id,
        //   username: user.username,
        //   picture: user.picture
        // });


        return cb(null, user);


    });
});


// // // This chenges session variable req.user when called from authorized user request --->
passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});





// // // Index route api ----->

app.use('/', indexRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    res.status(400).send({ success: false, message: "Path not found.(400)" })
});


let PORT = process.env.PORT || 3000



const uuid = require("uuid")
const http = require('http');
const socketIo = require('socket.io');
const notificatinModel = require("./src/Models/notificationModel")

const server = http.createServer(app);
const io = socketIo(server);

const { getUserDataFromToken } = require("./src/Middlewares/isAutherized")


server.listen(PORT, () => { console.log(`Express app runing at ${PORT}`) })




// // // All Socket io code here ------->

// // // Stop IO code for now, work on this letar ---->


// const userModel = require("./src/Models/userModel")



// // // A fn() to carete new notification here ---->

function createNewNotiFormate(msg, orderId) {
    return {
        message: `${msg}`,
        orderId: `${orderId}`,
        id: `${uuid.v4()}`,
        notificationDate: Date.now(),
        isDeleted: false
    }
}




io.on('connection', async (socket) => {

    // console.log("socket info ---> ", socket)


    // console.log(socket.handshake.headers.cookie)
    // console.log(socket.handshake.headers.cookie.split("="))


    let userData = false


    // // // Getting token in socket variabe ---->

    if (socket.handshake.headers.cookie) {
        // // // If token coming in cookie -------->

        let allCookies = socket.handshake.headers.cookie.split(";")

        // console.log(allCookies)

        let token = false

        for (let singleCookei of allCookies) {
            // console.log(singleCookei.split("="))

            let arrOfCookie = singleCookei.split("=")

            if (arrOfCookie[0] === "token") {
                token = arrOfCookie[1]
                break
            }

        }

        userData = await getUserDataFromToken(token)
    }
    else {

        // // // Sending cookie manually in auth of socket

        let token = false

        // console.log(socket.handshake.auth.token)

        if (socket.handshake && socket.handshake.auth && socket.handshake.auth.token) {

            token = socket.handshake.auth.token
            userData = await getUserDataFromToken(token)
        }

    }


    // console.log(userData)


    if (userData) {
        socket.join(userData.id);

        if (userData.role === 'chef') {
            socket.join('chefs');
            console.log(`The chef(${userData.firstName}) connected ✅`);
        } else {
            console.log(`New client(${userData.firstName}) connected ✅`);
        }


    } else {
        console.log(`New client connected ✅`);
    }



    // const userId = getUserIdFromSocket(socket); // Implement this function

    // console.log("userId")

    // socket.join(userId);




    // // // Getting order ------->
    socket.on('new-order', async (order) => {
        // Emit to all chefs

        // console.log("Order Data ------> ", order)

        let userId = order.userId

        // io.to(userId).emit('order-received-done', { data: order, message: "Order done✅", id: uuid.v4(), notificationDate: Date.now() });

        // // // A Back notifiaction to user --->
        io.to(userId).emit('order-received-done', { data: order, ...createNewNotiFormate("Order done✅", order.id) });




        // // // Notification structure ----->
        // id : "1124dd83-1c64-4157-8efc-61ff5184931e"
        // message :  "Order done✅"
        // notificationDate : "2024-01-31T13:04:31.470Z"




        // // // Sending msg to all chefs ---->

        // // // Now i'm sending a message to chef channel, there all chefs are connected --->
        // io.to('chefs').emit('chef-order-recived', { data: order, message: "New order recived.", id: uuid.v4(), notificationDate: Date.now(), isDeleted: false, orderId: order.id });
        io.to('chefs').emit('chef-order-recived', { data: order, ...createNewNotiFormate("New order recived.", order.id) });



        // // // Code to save data into data base ------>
        // // // ToDO now save the message and time for notification --->
        // // // If user id is present then save into user data --->
        if (userId) {

            let orderDoneMsg = 'Order send to kitchen✅'

            // let saveNotificaton = await notificatinModel.create({ message: orderDoneMsg, id: order.id })
            let saveNotificaton = await notificatinModel.create(createNewNotiFormate(orderDoneMsg, order.id))

            // console.log(saveNotificaton)

            let findUserData = await userModel.findOne({ id: userId })

            if (findUserData) {

                if (findUserData.notification) {
                    findUserData.notification.push(saveNotificaton._id)
                }
                else {
                    findUserData.notification = [saveNotificaton._id]
                }

                await findUserData.save()

                // console.log(logToCheck)

            }

        }


        // // // now sending msg to all chefs -------->


        // console.log("order proccess done --->")
    });




    // // // This event started by chef to give notification about update order status.

    socket.on('update-order-status', async (order) => {


        console.log("Getting notification for order", order)



        let userId = order.userId

        let statusOfOrder = order.status

        let orderDoneMsg = 'Status of order changed.'

        switch (statusOfOrder) {
            case "RECEIVED":
                orderDoneMsg = "Order recived.✅"
                break;

            case "PROCESSING":
                orderDoneMsg = "Order Processing now.⌛"
                break;

            case "ON_TABLE":
                orderDoneMsg = "Order on your table.🍽️"
                break;

            case "COMPLETED":
                orderDoneMsg = "Order Completed.✅"
                break;

            case "CANCELED":
                orderDoneMsg = "Order canceled.❌"
                break;

            default:
                break;
        }


        // console.log(orderDoneMsg)

        if (userId) {



            // let saveNotificaton = await notificatinModel.create({ message: orderDoneMsg, id: order.id })
            let saveNotificaton = await notificatinModel.create(createNewNotiFormate(orderDoneMsg, order.id))

            // console.log(saveNotificaton)

            let findUserData = await userModel.findOne({ id: userId })

            if (findUserData) {

                if (findUserData.notification) {
                    findUserData.notification.push(saveNotificaton._id)
                }
                else {
                    findUserData.notification = [saveNotificaton._id]
                }

                await findUserData.save()

                // console.log(logToCheck)

            }

        }



        // // // Notification to user --->
        io.to(userId).emit('update-order-status-user', { data: order, ...createNewNotiFormate("Order done✅", order.id) });



        // // // Back to chef (notification) ---->
        io.to('chefs').emit('update-order-status-chef', { data: order, ...createNewNotiFormate("New order recived.", order.id) });


        // console.log(order)
        // console.log("Proccess done ....")

    })




    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

    // Additional event listeners here
});





