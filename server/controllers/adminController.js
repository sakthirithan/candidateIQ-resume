const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Get Admin Dashboard Aggregated Statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    // Aggregation for Users
    const totalUsers = await User.countDocuments();
    const candidates = await User.countDocuments({ role: 'candidate' });
    const recruiters = await User.countDocuments({ role: { $in: ['hr', 'recruiter'] } });
    const admins = await User.countDocuments({ role: 'admin' });
    const activeUsers = await User.countDocuments({ activated: true });
    const deactivatedUsers = await User.countDocuments({ activated: false });

    // Aggregation for Jobs
    const totalJobs = await Job.countDocuments();
    const publishedJobs = await Job.countDocuments({ status: 'published' });
    const draftJobs = await Job.countDocuments({ status: 'draft' });
    const closedJobs = await Job.countDocuments({ status: 'closed' });

    // Aggregation for Applications
    const totalApplications = await Application.countDocuments();

    // AI Provider Status Check
    const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '' && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');
    const aiProvider = {
      provider: hasGeminiKey ? 'Gemini 1.5 Flash' : 'Fallback Evaluation Engine',
      status: hasGeminiKey ? 'Connected' : 'Active (Deterministic Engine)',
      isFallback: !hasGeminiKey
    };

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          candidates,
          recruiters,
          admins,
          active: activeUsers,
          deactivated: deactivatedUsers
        },
        jobs: {
          total: totalJobs,
          published: publishedJobs,
          draft: draftJobs,
          closed: closedJobs
        },
        applications: {
          total: totalApplications
        },
        aiProvider
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with search, role, status filtering and pagination
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res, next) => {
  try {
    const { search, role, status, page = 1, limit = 50 } = req.query;

    const query = {};

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    if (role && role !== 'All') {
      if (role.toLowerCase() === 'hr' || role.toLowerCase() === 'recruiter') {
        query.role = { $in: ['hr', 'recruiter'] };
      } else {
        query.role = role.toLowerCase();
      }
    }

    if (status && status !== 'All') {
      if (status.toLowerCase() === 'active') {
        query.activated = true;
      } else if (status.toLowerCase() === 'deactivated') {
        query.activated = false;
      }
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user details
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user by admin
// @route   POST /api/admin/users
// @access  Private (Admin)
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, paymentStatus, activated } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and email'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    const defaultPassword = password && password.trim().length >= 6 ? password : 'Password123';
    const validRole = ['candidate', 'hr', 'recruiter', 'admin'].includes(role) ? role : 'candidate';

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: defaultPassword,
      role: validRole,
      paymentStatus: paymentStatus || 'paid',
      activated: activated !== undefined ? activated : true
    });

    const createdUser = await User.findById(user._id).select('-password');

    res.status(201).json({
      success: true,
      message: `User ${createdUser.name} created successfully`,
      data: createdUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details
// @route   PATCH /api/admin/users/:id
// @access  Private (Admin)
const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, paymentStatus, activated } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (email && email.toLowerCase().trim() !== user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase().trim() });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use by another account'
        });
      }
      user.email = email.toLowerCase().trim();
    }

    if (name) user.name = name.trim();
    if (role && ['candidate', 'hr', 'recruiter', 'admin'].includes(role)) {
      // Prevent self-demotion if operating admin is demoting their own admin role
      if (req.user._id.toString() === user._id.toString() && role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Self-Protection: You cannot remove your own admin role.'
        });
      }
      user.role = role;
    }
    if (paymentStatus && ['pending', 'paid'].includes(paymentStatus)) {
      user.paymentStatus = paymentStatus;
    }
    if (activated !== undefined) {
      // Prevent self-deactivation
      if (req.user._id.toString() === user._id.toString() && activated === false) {
        return res.status(400).json({
          success: false,
          message: 'Self-Protection: You cannot deactivate your own admin account.'
        });
      }
      user.activated = activated;
    }

    await user.save();
    const updatedUser = await User.findById(user._id).select('-password');

    res.status(200).json({
      success: true,
      message: `User ${updatedUser.name} updated successfully`,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PATCH /api/admin/users/:id/role
// @access  Private (Admin)
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role || !['candidate', 'hr', 'recruiter', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid role (candidate, hr, recruiter, admin)'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Self-Protection check
    if (req.user._id.toString() === user._id.toString() && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Self-Protection: You cannot remove your own admin role.'
      });
    }

    user.role = role;
    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');

    res.status(200).json({
      success: true,
      message: `Role for ${updatedUser.name} changed to ${updatedUser.role}`,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user activation status
// @route   PATCH /api/admin/users/:id/activation
// @access  Private (Admin)
const updateUserActivation = async (req, res, next) => {
  try {
    const { activated } = req.body;

    if (activated === undefined || typeof activated !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a boolean activated status'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Self-Protection check
    if (req.user._id.toString() === user._id.toString() && activated === false) {
      return res.status(400).json({
        success: false,
        message: 'Self-Protection: You cannot deactivate your own admin account.'
      });
    }

    user.activated = activated;
    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');

    res.status(200).json({
      success: true,
      message: `User ${updatedUser.name} is now ${updatedUser.activated ? 'Active' : 'Deactivated'}`,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Self-Protection check
    if (req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Self-Protection: You cannot delete your own admin account.'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `User ${user.name} deleted successfully`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs for admin audit
// @route   GET /api/admin/jobs
// @access  Private (Admin)
const getAdminJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find()
      .populate('recruiter', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications for admin audit
// @route   GET /api/admin/applications
// @access  Private (Admin)
const getAdminApplications = async (req, res, next) => {
  try {
    const applications = await Application.find()
      .populate('job', 'title department status')
      .populate('candidate', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI Provider Status
// @route   GET /api/admin/ai-status
// @access  Private (Admin)
const getAIStatus = async (req, res, next) => {
  try {
    const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '' && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');
    res.status(200).json({
      success: true,
      data: {
        provider: hasGeminiKey ? 'Gemini 1.5 Flash' : 'Fallback Evaluation Engine',
        status: hasGeminiKey ? 'Connected' : 'Active (Deterministic Engine)',
        isFallback: !hasGeminiKey,
        evaluatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserRole,
  updateUserActivation,
  deleteUser,
  getAdminJobs,
  getAdminApplications,
  getAIStatus
};
