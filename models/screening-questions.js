const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ScreeningQuestions = new Schema({
    isPublic: { type: Boolean, required: true, default: false },
    maxTimeAllowed: { type: Number, required: true, default: 0 },
    question: { type: String, required: true },
    correctAnswer: { type: String, required: false, },
    answers: { 
        a: { type: String, required: false },
        b: { type: String, required: false },
        c: { type: String, required: false },
        d: { type: String, required: false },
        e: { type: String, required: false },
        f: { type: String, required: false },
     },
    shortAnswer: { type: String, required: false, maxlength: 100 },
    longAnswer: { type: String, required: false, maxlength: 300 },
    points: { type: Number, required: true, default: 1 },
    questionType: { type: String, required: true, enum: ["multi-select","multiple choice", "short answer", "long answer"] },
    requiresReview: { type: Boolean, required: true, default: true },
});

module.exports = mongoose.model("ScreeningQuestions", ScreeningQuestions);