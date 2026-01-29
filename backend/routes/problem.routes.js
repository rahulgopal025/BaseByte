const express = require("express");
const router = express.Router();
const Problem = require("../models/Problem");


router.get("/", async (req, res) => {
  try {
    const problems = await Problem.find({}); 
    console.log("Found Problems:", problems.length); 
    res.json(problems); 
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;