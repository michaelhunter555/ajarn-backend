const Users = require("../../models/users");
const { createGPTClient, generateCoverLetter } = require("../../lib/ai-analysis");
const HttpError = require("../../models/http-error");

const generateAICoverLetter = async (req, res, next) => {
    const { userId } = req.params;

    try {
        const user = await Users.findById(userId).select("name location workExperience education skill interests highestCertification nationality");
        if(req.userData?.userId?.toString() !== userId.toString()) {
            return next(new HttpError("Forbidden - You are not authorized to generate an AI cover letter for this user", 403));
        }

        if(!user) {
            return next(new HttpError("User not found", 404));
        }

        const ai = createGPTClient();
        const context = generateCoverLetter(user.toObject());

        const response = await ai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: context,
            temperature: 0.7,
            max_tokens: 1000,
        });

        res.status(200).json({
            message: "AI cover letter generated successfully",
            coverLetter: response.choices[0].message.content,
            ok: true
        });

    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "There was an error with the request to generate an AI cover letter",
            ok: false
        });
    }
}

module.exports = generateAICoverLetter;