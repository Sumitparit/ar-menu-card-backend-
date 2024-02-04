

const userModel = require("../Models/userModel")
const notificatinModel = require("../Models/notificationModel")


exports.getUserData = async function (req, res) {
    try {
        let userData = req.tokenUserData


        let getUserAllData = await userModel.findById(req.tokenUserData.userId)
            .populate({
                path: 'orders',
                select: "-__v -updatedAt -createdAt -_id",
                options: {
                    // limit: 10,
                    sort: { createdAt: -1 },
                }
                // // // Check sort here ( Yes working but not using becouse of unshift ) ---->
            })
            .populate({
                // strictPopulate: false,
                path: "notification",
                match: { isDeleted: false },
                select: "-__v -updatedAt -createdAt -_id",
                options: {
                    limit: 7,
                    sort: { isSeen: 1, createdAt: -1, },
                    // skip: req.params.pageIndex * 2
                }
            })
            .select(" -__v -updatedAt -createdAt -_id -address -password ")


        // console.log(getUserAllData)


        res.status(200).send({ status: true, data: getUserAllData, token: userData.token, message: "User login successful." })

    }
    catch (err) {
        console.log(err.message)
        return res.status(500).send({ status: false, message: `Error by server (${err.message})` })
    }
}


exports.updateManyNotiToSeen = async function (req, res) {
    try {
        let userData = req.tokenUserData

        // // // TODO : sigle call by FE
        console.log(userData.id)

        let makeAllNotificationSeen = await notificatinModel.updateMany(
            { userId: userData.id },
            { isSeen: true },
            // { upsert: true }
        )


        if (makeAllNotificationSeen.modifiedCount === 0) {
            res.status(404).send({ status: false, message: "Not updated.", data: makeAllNotificationSeen.modifiedCount })
        }


        res.status(200).send({ status: true, message: "Notifiation status updated.", data: makeAllNotificationSeen.modifiedCount })

    }
    catch (err) {
        console.log(err.message)
        return res.status(500).send({ status: false, message: `Error by server (${err.message})` })
    }
}