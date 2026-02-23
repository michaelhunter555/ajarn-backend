const mongoose = require("mongoose");
const HttpError = require("../../models/http-error");
const Screening = require("../../models/screenings");
const ScreeningQuestion = require("../../models/screening-questions");
const Job = require("../../models/jobs");

const normalizeAnswers = (answers) => {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    return {};
  }

  return {
    a: answers.a || "",
    b: answers.b || "",
    c: answers.c || "",
    d: answers.d || "",
    e: answers.e || "",
    f: answers.f || "",
  };
};

const normalizeQuestion = (question) => {
  const normalizedType = question?.questionType || "multiple choice";

  return {
    question: question?.question || "",
    answers: normalizeAnswers(question?.answers),
    correctAnswer: question?.correctAnswer || "",
    shortAnswer: question?.shortAnswer || "",
    longAnswer: question?.longAnswer || "",
    points: Number(question?.points) || 1,
    questionType: normalizedType,
    requiresReview:
      question?.requiresReview === true ||
      normalizedType === "short answer" ||
      normalizedType === "long answer",
  };
};

const updateScreening = async (req, res, next) => {
  const screeningId = req.params.sid;
  const {
    title,
    description,
    date,
    maxTimeAllowed,
    totalScore,
    questions,
  } = req.body;

  let screening;
  try {
    screening = await Screening.findById(screeningId);
  } catch (err) {
    return next(new HttpError("There was an error finding screening by id.", 500));
  }

  if (!screening) {
    return next(new HttpError("Screening not found.", 404));
  }

  let job;
  try {
    job = await Job.findById(screening.jobId).select("creator");
  } catch (err) {
    return next(new HttpError("There was an error checking screening ownership.", 500));
  }

  if (!job || job.creator.toString() !== req.userData?.userId?.toString()) {
    return next(new HttpError("Forbidden - You are not authorized for this action", 403));
  }

  if (title !== undefined) screening.title = title;
  if (description !== undefined) screening.description = description;
  if (date !== undefined) screening.date = date;
  if (maxTimeAllowed !== undefined) screening.maxTimeAllowed = Number(maxTimeAllowed) || 0;
  if (totalScore !== undefined) screening.totalScore = Number(totalScore) || 0;

  let sess;
  try {
    sess = await mongoose.startSession();
    sess.startTransaction();

    if (Array.isArray(questions)) {
      const oldQuestionIds = [...screening.questions];
      const normalizedQuestions = questions.map(normalizeQuestion);
      const createdQuestions = await ScreeningQuestion.insertMany(normalizedQuestions, { session: sess });

      screening.questions = createdQuestions.map((question) => question._id);

      if (totalScore === undefined) {
        screening.totalScore = createdQuestions.reduce(
          (sum, question) => sum + (Number(question.points) || 0),
          0
        );
      }

      if (oldQuestionIds.length > 0) {
        await ScreeningQuestion.deleteMany({ _id: { $in: oldQuestionIds } }, { session: sess });
      }
    }

    await screening.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    if (sess) {
      await sess.abortTransaction();
    }
    return next(new HttpError("Updating screening failed, please try again.", 500));
  } finally {
    if (sess) {
      sess.endSession();
    }
  }

  await screening.populate("questions");

  return res.status(200).json({
    ok: true,
    screening: screening.toObject({ getters: true }),
  });
};

module.exports = updateScreening;
