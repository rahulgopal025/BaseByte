const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const Lecture = require('../models/Lecture');

router.post('/enroll/request', async (req, res) => {
  try {
    const { userId, userEmail, courseId } = req.body;
    const newRequest = new Enrollment({ userId, userEmail, courseId });
    await newRequest.save();
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

router.get('/enroll/pending', async (req, res) => {
  try {
    const pending = await Enrollment.find({ status: 'pending' });
    res.status(200).json({ success: true, data: pending });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

router.put('/enroll/status', async (req, res) => {
  try {
    const { requestId, status } = req.body;
    const updated = await Enrollment.findByIdAndUpdate(requestId, { status }, { new: true });
    res.status(200).json({ success: true, updated });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

router.get('/my-courses/:email', async (req, res) => {
    try {
      const courses = await Enrollment.find({ userEmail: req.params.email, status: 'approved' });
      res.status(200).json({ success: true, courses });
    } catch (error) {
      res.status(500).json({ success: false });
    }
});

router.post('/lectures/add', async (req, res) => {
  try {
    const newLecture = new Lecture(req.body);
    await newLecture.save();
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

router.get('/lectures/all', async (req, res) => {
  try {
    const lectures = await Lecture.find().sort({ day: 1 });
    res.status(200).json({ success: true, lectures });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;