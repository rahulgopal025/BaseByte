const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');

router.post('/save', async (req, res) => {
  try {
    const { email } = req.body;
    const profile = await UserProfile.findOneAndUpdate(
      { email },
      req.body,
      { upsert: true, new: true }
    );
    res.status(200).json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

router.get('/:email', async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ email: req.params.email });
    res.status(200).json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;