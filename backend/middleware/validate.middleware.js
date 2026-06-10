export const validateSignup = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ status: 'error', message: 'Name is required.' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ status: 'error', message: 'Please enter a valid email address.' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ status: 'error', message: 'Password must be at least 6 characters.' });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ status: 'error', message: 'Email is required.' });
  }
  if (!password) {
    return res.status(400).json({ status: 'error', message: 'Password is required.' });
  }

  next();
};