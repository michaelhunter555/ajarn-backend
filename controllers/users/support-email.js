const { handleSupportEmail } = require("../../lib/brevoHelper");
const User = require("../../models/users");
const HttpError = require("../../models/http-error");

const supportEmail = async (req,res, next) => {
    const { message, userId } = req.body;

    if(req.userData.userId.toString() !== userId.toString()) {
        const error = new HttpError("Forbidden - You are not authorized to send a support email to this user", 403);
        console.log(error);
        return res.status(403).json({ message: 'Forbidden - You are not authorized to send a support email to this user', ok: false });
    }

    try {
        const user = await User.findById(userId).populate("creator");
        if(!user) {
            const error = new HttpError("User not found", 404);
            console.log(error);
            return res.status(403).json({ message: 'Forbidden - User not found', ok: false });
        }

        const companyName = user?.creator?.company ?? user?.name;
        await handleSupportEmail(user.name, companyName, user.email, message);
        res.status(200).json({ message: "Support email sent successfully", ok: true });
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "Failed to send support email", ok: false });
    }

}

module.exports = supportEmail;
