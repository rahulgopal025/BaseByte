const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  firstName: String,
  midName: String,
  lastName: String,
  college: String,
  address: String,
  mobile: String,
  degree: String
});

module.exports = mongoose.model('UserProfile', UserProfileSchema);