import ApiError from '../utils/ApiError.js';
export const verifyAdmin = (req, res, next) => {

  console.log("REQ.USER =", req.user);

  if (!req.user || req.user.role !== 'admin') {
    throw new ApiError(403, 'Access denied. Admin privileges required.');
  }

  next();
};
