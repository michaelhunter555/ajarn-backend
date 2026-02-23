const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const screeningResultSchema = new Schema({
    screeningId: { type: mongoose.Types.ObjectId, required: true, ref: "Screenings" },
    teacherId: { type: mongoose.Types.ObjectId, required: true, ref: "Users" },
    jobId: { type: mongoose.Types.ObjectId, required: true, ref: "Jobs" },
    totalScore: { type: Number, required: true, default: 0 },
    outcome: { type: String, required: true, enum: ["passed", "failed", "incomplete"], default: "incomplete" },
    startTime: { type: Date, default: Date.now },
    completeTime: { type: Date, default: null },
    questions: [{ 
        _id: { type: mongoose.Types.ObjectId, required: true, ref: "ScreeningQuestions" },
        userAnswer: { type: String, required: false },
        isAnswered: { type: Boolean, required: true, default: false },
        isCorrect: { type: Boolean, required: true, default: false },
        correctAnswer: { type: String, required: false, enum: ["a", "b", "c", "d", "e", "f"] },
        pointsAwarded: { type: Number, required: true, default: 0 },
    }],
    status: { type: String, required: false, enum: ["in progress", "completed", "cancelled"] }
}, { timestamps: true });

module.exports = mongoose.model("ScreeningResult", screeningResultSchema);