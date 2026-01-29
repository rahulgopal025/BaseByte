require('dotenv').config();
const mongoose = require("mongoose");
const Problem = require("./models/Problem");
const problemsData = require("./data/seedProblems.json");

const seedDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Problem.deleteMany({});
  await Problem.insertMany(problemsData);
  console.log("Seeded!");
  process.exit();
};

seedDB();