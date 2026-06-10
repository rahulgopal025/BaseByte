import Quiz from '../models/Quiz.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getQuizByLangAndTopic = asyncHandler(async (req, res) => {
  const { lang, topic } = req.params;

  // Replace hyphens with spaces and use case-insensitive regex for flexible matching
  const topicSearch = topic.replace(/-/g, ' ');

  const quizzes = await Quiz.find({
    language: lang.toLowerCase(),
    topic: { $regex: new RegExp(`^${topicSearch}$`, 'i') }
  });

  if (quizzes.length === 0) {
    throw new ApiError(404, 'No quizzes found for this language and topic.');
  }

  res.json(new ApiResponse(200, quizzes, 'Quizzes fetched successfully.'));
});
