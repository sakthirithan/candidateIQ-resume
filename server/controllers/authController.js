const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id || user.id, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET || 'super_secret_jwt_key_for_ai_recruitment_platform_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Helper to format safe user response
const formatUserResponse = (user) => {
  return {
    id: user._id || user.id,
    _id: user._id || user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    paymentStatus: user.paymentStatus || (['hr', 'recruiter'].includes(user.role) ? 'pending' : 'paid'),
    activated: user.activated !== undefined ? user.activated : (['hr', 'recruiter'].includes(user.role) ? false : true)
  };
};

// @desc    Register new user (Candidate or HR/Recruiter)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userRole = ['candidate', 'hr', 'recruiter', 'admin'].includes(role) ? role : 'candidate';
    const initialPaymentStatus = ['hr', 'recruiter'].includes(userRole) ? 'pending' : 'paid';
    const initialActivated = ['hr', 'recruiter'].includes(userRole) ? false : true;

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: userRole,
      paymentStatus: initialPaymentStatus,
      activated: initialActivated
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      token,
      user: formatUserResponse(user)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    return res.status(200).json({
      success: true,
      token,
      user: formatUserResponse(user)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user details
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const dbUser = await User.findById(req.user.id || req.user._id).select('-password');
    if (!dbUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      user: formatUserResponse(dbUser)
    });
  } catch (error) {
    next(error);
  }
};
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your account email address.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email address.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Account verified. Proceed to set your new password.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password for account
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide email and new password.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email address.' });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword };
