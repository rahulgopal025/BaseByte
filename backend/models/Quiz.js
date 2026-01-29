const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema({
  language: String,
  topic: String,
  question: String,
  options: [String],
  correctAnswer: Number, 
  explanation: String
});

module.exports = mongoose.model("Quiz", QuizSchema);


