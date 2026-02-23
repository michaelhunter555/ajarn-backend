const { generateJobDescription } = require("../../lib/ai-analysis");
const Users = require("../../models/users");
const { createGPTClient } = require("../../lib/ai-analysis");
const HttpError = require("../../models/http-error");


const generateAIJobDescription = async (req, res, next) => {
    const { jobTitle, hours, jobType, workPermit, requirements, description, location, salary } = req.body;

    if(req.userData.userId.toString() !== userId.toString()) {
        return next(new HttpError("Forbidden - You are not authorized to generate an AI job description for this job", 403));
    }

    try {
        const ai = createGPTClient();
        const context = generateJobDescription(jobTitle, hours, jobType, workPermit, requirements, description, location, salary);

        const response = await ai.chat.completions.create({
            model: "gpt-5.1-mini",
            messages: context,
        });

        res.status(200).json({
            message: "AI cover letter generated successfully",
            coverLetter: response.choices[0].message.content,
            ok: true
        });

    }
    catch (err) {
        res.status(500).json({
            message: "There was an error with the request to generate an AI cover letter",
            ok: false
        });
        return next(err);
    }
}

module.exports = generateAIJobDescription;