const HttpError = require("../../models/http-error");
const ScreeningResult = require("../../models/screening-result");
const ScreeningQuestion = require("../../models/screening-questions");

const updateScreeningResults = async (req, res, next) => {
    const resultId = req.params.rid;
    const { questionId, answer, pointsAwarded } = req.body;

    try {
        const screeningResult = await ScreeningResult.findById(resultId);
        if(!screeningResult) {
            return next(new HttpError("Screening result not found", 404));
        }

        if(screeningResult.teacherId.toString() !== req.userData?.userId?.toString()) {
            return next(new HttpError("Forbidden - You are not authorized for this action", 403));
        }

        if(screeningResult.outcome !== "incomplete") {
            return next(new HttpError("This screening attempt is not active.", 400));
        }

        const questionEntry = screeningResult.questions.find(
            (entry) => entry._id.toString() === questionId.toString()
        );

        if(!questionEntry) {
            return next(new HttpError("Question not found in this screening result.", 404));
        }

        questionEntry.userAnswer = String(answer || "").trim();
        questionEntry.isAnswered = true;

        const templateQuestion = await ScreeningQuestion.findById(questionId).lean();
        if(!templateQuestion) {
            return next(new HttpError("Template question not found.", 404));
        }

        if(templateQuestion.questionType === "multiple choice" || templateQuestion.questionType === "multi-select") {
            questionEntry.isCorrect =
                String(questionEntry.userAnswer).toLowerCase() === String(questionEntry.correctAnswer || "").toLowerCase();
            questionEntry.pointsAwarded = questionEntry.isCorrect ? (Number(templateQuestion.points) || 0) : 0;
        } else {
            questionEntry.isCorrect = Boolean(req.body?.isCorrect);
            questionEntry.pointsAwarded = Number(pointsAwarded) || 0;
        }

        screeningResult.totalScore = screeningResult.questions.reduce(
            (sum, q) => sum + (Number(q.pointsAwarded) || 0),
            0
        );

        await screeningResult.save();

        return res.status(200).json({ ok: true, result: screeningResult.toObject({ getters: true }) });

    } catch(err) {
        console.log(err);
        return next(new HttpError("Error updating screening results", 500));
    }
    
};

module.exports = updateScreeningResults;