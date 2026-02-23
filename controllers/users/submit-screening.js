const Screening = require("../../models/screenings");
const ScreeningResult = require("../../models/screening-result");
const ScreeningQuestions = require("../../models/screening-questions");
const HttpError = require("../../models/http-error");

const submitScreening = async (req, res, next) => {
  const { userId } = req.userData;
  const { screeningId } = req.params;
  const { userAnswers = [], passThreshold } = req.body;

  if (!Array.isArray(userAnswers) || userAnswers.length === 0) {
    return next(new HttpError("userAnswers array is required.", 422));
  }

  try {
    const screening = await Screening.findById(screeningId).select("_id");
    if (!screening) {
      return next(new HttpError("Screening not found", 404));
    }

    const existingOpenResult = await ScreeningResult.findOne({
      screeningId,
      teacherId: userId,
      outcome: "incomplete",
    });

    if (!existingOpenResult) {
      return next(new HttpError("No active screening attempt found.", 404));
    }

    const submittedById = new Map(
      userAnswers.map((a) => [
        a.questionId?.toString(),
        String(a.answer || "").trim().toLowerCase(),
      ])
    );

    const questionIds = existingOpenResult.questions.map((q) => q._id);
    const templateQuestions = await ScreeningQuestions.find({ _id: { $in: questionIds } })
      .select("_id points")
      .lean();
    const pointsMap = new Map(templateQuestions.map((q) => [q._id.toString(), Number(q.points) || 0]));

    for (const q of existingOpenResult.questions) {
      const key = q._id.toString();
      if (!submittedById.has(key)) continue;

      const userAnswer = submittedById.get(key);
      const correctAnswer = String(q.correctAnswer || "").trim().toLowerCase();

      q.userAnswer = userAnswer;
      q.isAnswered = true;
      q.isCorrect = userAnswer === correctAnswer;
      q.pointsAwarded = q.isCorrect ? pointsMap.get(key) || 0 : 0;
    }

    existingOpenResult.totalScore = existingOpenResult.questions.reduce(
      (sum, q) => sum + (Number(q.pointsAwarded) || 0),
      0
    );

    const totalPossible = templateQuestions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
    const ratio = totalPossible > 0 ? existingOpenResult.totalScore / totalPossible : 0;
    const rawPassThreshold = Number(passThreshold);
    const normalizedPassThreshold =
      Number.isFinite(rawPassThreshold) && rawPassThreshold > 0
        ? rawPassThreshold > 1
          ? rawPassThreshold / 100
          : rawPassThreshold
        : 0.7;

    existingOpenResult.outcome = ratio >= normalizedPassThreshold ? "passed" : "failed";
    existingOpenResult.completeTime = new Date();

    await existingOpenResult.save();

    return res.status(200).json({
      ok: true,
      message: "Screening submitted successfully.",
      result: existingOpenResult.toObject({ getters: true }),
    });
  } catch (err) {
    console.log(err);
    return next(new HttpError("Failed to submit screening.", 500));
  }
};

module.exports = submitScreening;