const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All admin routes require authentication and admin role authorization
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.patch('/users/:id', updateUser);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/activation', updateUserActivation);
router.delete('/users/:id', deleteUser);

router.get('/jobs', getAdminJobs);
router.get('/applications', getAdminApplications);
router.get('/ai-status', getAIStatus);

module.exports = router;
