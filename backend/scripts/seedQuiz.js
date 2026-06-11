const mongoose = require("mongoose");
require("dotenv").config({ path: '../.env' });
const Quiz = require("../models/Quiz.js");

// Import all separate JSON files
const cData = require("../data/cQuizzes.json");
const pythonData = require("../data/pythonQuizzes.json");
const javaData = require("../data/javaQuizzes.json");

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Clear existing data before seeding
    await Quiz.deleteMany({});
    
    // Combine all data arrays into one
    const allQuizzes = [...cData, ...pythonData, ...javaData];
    
    await Quiz.insertMany(allQuizzes);
    console.log("✅ All Quizzes Seeded Successfully!");
    process.exit();

  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
};

seedData();
