const User = require("../../models/users");
const Screening = require("../../models/screenings");
const ScreeningResult = require("../../models/screening-result");
const ScreeningQuestions = require("../../models/screening-questions");
const HttpError = require("../../models/http-error");

const startScreening = async (req, res, next) => {
    const { userId } = req.userData;
    const { screeningId } = req.params;

    try {
        const screening = await Screening.findById(screeningId);
        if(!screening) {
            const error = new HttpError("Screening not found", 404);
            return next(error);
        }

        const existingOpenResult = await ScreeningResult.findOne({
            screeningId,
            teacherId: userId,
            status: "completed"
        })

        if(existingOpenResult) {
            return res.status(200).json({
                ok: true,
                message: "You completed this screening already."
            })
        }

        const questions = await ScreeningQuestions.find({ 
            screeningId,    
        }).select("-correctAnswer");

        if(!questions || questions.length === 0) {
            return res.status(404).json({
                ok: false,
                message: "No questions found for this screening."
            })
        }

        const userScreeningTest = new ScreeningResult({
            screeningId,
            teacherId: userId,
            jobId: screening.jobId,
            status: "in progress",
            outcome: "incomplete",
            startTime: new Date(),
            questions: questions.map((question) => ({
                _id: question._id,
                userAnswer: "",
                isAnswered: false,
                isCorrect: false,
                pointsAwarded: 0,
            }))
        })

        await userScreeningTest.save();

        res.status(200).json({
            ok: true,
            message: "Screening started successfully.",
            questions: questions.map((question) => question.toObject({ getters: true })),
        })

    } catch(err) {
        console.log(err);
        const error = new HttpError("Failed to start screening.", 500);
        return next(error);
    }
}

module.exports = startScreening;