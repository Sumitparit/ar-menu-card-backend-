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
    clientID: `${process.env.GOOGLE_CLIENT_ID}`,
    clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
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

        let newUserDataObj = { email: email, firstName: firstName, lastName: lastName, profilePic: photos[0].value  }

        let userProfile = await userModel.findOneAndUpdate(
            { email: email },
            newUserDataObj,
            { new: true, upsert: true }
        ).lean()

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

app.listen(PORT, () => { console.log(`Express app runing at ${PORT}`) })




