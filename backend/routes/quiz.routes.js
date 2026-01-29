const express = require("express");
const router = express.Router();
const Quiz = require("../models/Quiz");

// Fetch questions based on language AND topic
router.get("/:lang/:topic", async (req, res) => {
  try {
    const { lang, topic } = req.params;

    // Filtering by both language and topic (case-insensitive)
    const quizzes = await Quiz.find({ 
      language: lang.toLowerCase(),
      topic: topic.replace(/-/g, ' ') 
    });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
