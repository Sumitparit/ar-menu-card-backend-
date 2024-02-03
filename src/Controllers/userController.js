

const userModel = require("../Models/userModel")


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
                select: "-__v -updatedAt -createdAt -_id",
                options: {
                    limit: 7,
                    sort: { createdAt: -1 },
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