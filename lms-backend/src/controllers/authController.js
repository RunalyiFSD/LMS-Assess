const userRepository = require('../repositories/userRepository');
const notificationService = require('../services/notificationService');
const AppError = require('../utils/AppError');

// @desc    Register User (Handled by backend to secure role assignment)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // We allow explicit role assignment in registration only if it's securely managed.
    // By default, it will be 'student' as enforced by the repository and trigger.
    const assignedRole = role || 'student';

    // Create auth user securely
    const authUser = await userRepository.createAuthUser(email, password, name, assignedRole);

    // Send welcome notification
    try {
      await notificationService.createNotification(
        authUser.id,
        'Welcome to LMS Assessment',
        `Hello ${name}, your account has been successfully created.`,
        'notification',
        email
      );
    } catch (err) {
      console.error('Failed to send welcome notification:', err);
    }

    res.status(201).json({
      status: 'success',
      message: 'Registration successful. Please log in.',
      data: {
        userId: authUser.id
      },
    });
  } catch (error) {
    if (error.message.includes('already registered')) {
      return next(new AppError('Email address is already registered', 400));
    }
    next(error);
  }
};

// @desc    Get current user details
// @route   GET /api/auth/me
// @access  Protected
exports.getMe = async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
};

// Legacy Login/Logout routes are removed.
// The frontend directly uses Supabase SDK for signInWithPassword and signOut.
exports.login = (req, res) => {
  res.status(400).json({
    status: 'fail',
    message: 'Login is handled by the client using Supabase SDK. Do not call this endpoint.'
  });
};

exports.logout = (req, res) => {
  res.status(400).json({
    status: 'fail',
    message: 'Logout is handled by the client using Supabase SDK. Do not call this endpoint.'
  });
};
