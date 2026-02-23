const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
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

const createScreening = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("invalid inputs passed, please check your data.", 422));
  }

  const {
    title,
    description,
    jobId,
    date,
    maxTimeAllowed,
    questions = [],
    totalScore,
  } = req.body;

  if (!title || !description || !jobId || !date || !maxTimeAllowed) {
    return next(new HttpError("Missing required screening fields.", 422));
  }

let job;
try {
  job = await Job.findById(jobId);
} catch (err) {
  return next(new HttpError("There was an error validating the job.", 500));
}

  if (!job || job.creator.toString() !== req.userData.userId.toString()) {
    return next(new HttpError("Job not found for this screening or you are not authorized to create a screening for this job.", 404));
  }

  const normalizedQuestions = questions.map(normalizeQuestion);
  const computedTotalScore =
    totalScore !== undefined
      ? Number(totalScore)
      : normalizedQuestions.reduce((sum, question) => sum + (Number(question.points) || 0), 0);

  let createdScreening;
  let createdQuestions;
  let sess;

  try {
    sess = await mongoose.startSession();
    sess.startTransaction();

    createdQuestions = await ScreeningQuestion.insertMany(normalizedQuestions, { session: sess });

    createdScreening = new Screening({
      title,
      description,
      jobId,
      date,
      maxTimeAllowed: Number(maxTimeAllowed),
      totalScore: Number(computedTotalScore) || 0,
      questions: createdQuestions.map((question) => question._id),
    });

    await createdScreening.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    if (sess) {
      await sess.abortTransaction();
    }
    return next(new HttpError("Creating screening failed, please try again.", 500));
  } finally {
    if (sess) {
      sess.endSession();
    }
  }

  await createdScreening.populate("questions");

  return res.status(201).json({
    ok: true,
    screening: createdScreening.toObject({ getters: true }),
  });
};

module.exports = createScreening;
