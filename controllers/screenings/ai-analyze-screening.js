const HttpError = require("../../models/http-error");
const Screening = require("../../models/screenings");
const ScreeningQuestion = require("../../models/screening-questions");
const Job = require("../../models/jobs");
const { analyzeScreening, createGPTClient } = require("../../lib/ai-analysis");

const aiAnalyzeScreening = async (req, res, next) => {
  const screeningId = req.params.sid;

  let screening;
  try {
    screening = await Screening.findById(screeningId).lean();
  } catch (err) {
    return next(new HttpError("There was an error finding screening by id.", 500));
  }

  if (!screening) {
    return next(new HttpError("Screening not found.", 404));
  }

  let questions;
  let job;
  try {
    questions = await ScreeningQuestion.find({ _id: { $in: screening.questions } }).lean();
    job = await Job.findById(screening.jobId)
      .select("title description requirements hours salary location workPermit creator")
      .lean();
  } catch (err) {
    return next(new HttpError("There was an error gathering screening analysis context.", 500));
  }

  if (!job || job.creator?.toString() !== req.userData?.userId?.toString()) {
    return next(new HttpError("Forbidden - You are not authorized for this action", 403));
  }

  if (!questions || questions.length === 0) {
    return next(new HttpError("No screening questions were found to analyze.", 404));
  }

  if (!process.env.OPENAI_API_KEY) return next(new HttpError("Missing OPENAI_API_KEY configuration.", 500));

  try {
    const ai = createGPTClient();
    const context = await analyzeScreening(questions, job || {});
    const response = await ai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: context,
      temperature: 0.3,
      max_tokens: 350,
    });

    return res.status(200).json({
      ok: true,
      source: "openai",
      analysis: response?.choices?.[0]?.message?.content || "",
    });
  } catch (err) {
    console.log(err);
    return next(new HttpError("There was an error analyzing screening with AI.", 500));
  }
};

module.exports = aiAnalyzeScreening;
