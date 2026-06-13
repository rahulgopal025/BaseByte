import crypto from 'crypto';
import Order from '../models/Order.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// NOTE: Razorpay integration requires RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env
// For now this returns mock data. Replace with real Razorpay SDK when keys are ready.

export const createOrder = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  if (!courseId) throw new ApiError(400, 'courseId is required.');

  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, 'Course not found.');
  if (course.isFree) throw new ApiError(400, 'This course is free. No payment needed.');

  // When Razorpay keys are ready, replace this block with:
  // const Razorpay = (await import('razorpay')).default;
  // const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  // const order = await razorpay.orders.create({ amount: course.price * 100, currency: 'INR' });

  const order = await Order.create({
    userId: req.user.id,
    courseId,
    amount: course.price,
    currency: 'INR',
    status: 'created'
  });

  res.status(201).json(new ApiResponse(201, {
    orderId: order._id,
    amount: course.price * 100,
    currency: 'INR',
    courseName: course.title,
    key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder'
  }, 'Order created.'));
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, courseId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  if (razorpay_signature && process.env.RAZORPAY_KEY_SECRET) {
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new ApiError(400, 'Payment verification failed. Invalid signature.');
    }
  }

  await Order.findByIdAndUpdate(orderId, {
    status: 'paid',
    razorpayPaymentId: razorpay_payment_id
  });

  const enrollment = await Enrollment.create({
    userId: req.user.id,
    courseId,
    status: 'approved',
    paymentId: razorpay_payment_id || 'manual'
  });

  res.json(new ApiResponse(200, enrollment, 'Payment verified. Enrolled successfully.'));
});
