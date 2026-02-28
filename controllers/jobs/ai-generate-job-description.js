const Users = require("../../models/users");
const { createGPTClient, generateJobDescription } = require("../../lib/ai-analysis");
const HttpError = require("../../models/http-error");

const generateAIJobDescription = async (req, res, next) => {
    const { uid } = req.params;
    const { hours, workPermit, title, salary, location, requirements } = req.body;

    try {
        if(req.userData?.userId?.toString() !== uid.toString()) {
            return next(new HttpError("Forbidden - You are not authorized to generate an AI job description for this user", 403));
        }
        const user = await Users.findById(uid).select("credits");

        if(!user) {
            return next(new HttpError("User not found", 404));
        }

        if(user.credits < 5) {
            return next(new HttpError("Insufficient credits to post job.", 400));
        }

        const ai = createGPTClient();
        const context = generateJobDescription(title, hours, workPermit, requirements, location, salary);

        const response = await ai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: context,
            temperature: 0.7,
            max_tokens: 1000,
        });

        res.status(200).json({
            message: "AI job description generated successfully",
            jobDescription: response.choices[0].message.content,
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

module.exports = generateAIJobDescription;