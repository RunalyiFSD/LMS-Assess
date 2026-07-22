const userRepository = require('../repositories/userRepository');
const notificationService = require('../services/notificationService');
const AppError = require('../utils/AppError');

// @desc    Register User (Handled by backend to secure role assignment)
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // We allow explicit role assignment in registration only if it's securely managed.
    // By default, it will be 'student' as enforced by the repository and trigger.
    const assignedRole = role || 'student';

    // Create auth user securely via Supabase Admin
    const authUser = await userRepository.createAuthUser(email, password, name, assignedRole);

    // Send welcome notification (fire-and-forget — errors are non-fatal)
    try {
      await notificationService.createNotification(
        authUser.id,
        'notification',
        `Hello ${name}, your account has been successfully created. Welcome to LMS Assessment.`,
        null
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
    if (error.message && error.message.includes('already registered')) {
      return next(new AppError('Email address is already registered', 400));
    }
    next(error);
  }
};

// @desc    Get current user details
// @route   GET /api/v1/auth/me
// @access  Protected
exports.getMe = async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
};

// @desc    Login placeholder — frontend uses Supabase SDK directly
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = (req, res) => {
  res.status(400).json({
    status: 'fail',
    message: 'Login is handled by the client using Supabase SDK. Do not call this endpoint.'
  });
};

// @desc    Logout placeholder — frontend uses Supabase SDK directly
// @route   POST /api/v1/auth/logout
// @access  Protected
exports.logout = (req, res) => {
  res.status(400).json({
    status: 'fail',
    message: 'Logout is handled by the client using Supabase SDK. Do not call this endpoint.'
  });
};

// ============================================================
// PLACEHOLDER HANDLERS — Not yet implemented (Sprint 3+)
// These return 501 Not Implemented so routes remain active
// and the frontend can handle them gracefully.
// ============================================================

// @desc    Forgot password — to be implemented via Supabase Auth
// @route   POST /api/v1/auth/forgot-password
// @access  Public
// DEFERRED: Sprint 3 — Will use supabase.auth.resetPasswordForEmail()
exports.forgotPassword = (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'Forgot password is not yet implemented. It will use Supabase Auth email reset in Sprint 3.'
  });
};

// @desc    Reset password — to be implemented via Supabase Auth
// @route   POST /api/v1/auth/reset-password/:token
// @access  Public
// DEFERRED: Sprint 3 — Will use supabase.auth.updateUser()
exports.resetPassword = (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'Reset password is not yet implemented. It will use Supabase Auth token exchange in Sprint 3.'
  });
};

// @desc    Google OAuth — to be implemented
// @route   GET /api/v1/auth/google
// @access  Public
// DEFERRED: Sprint 4 — Will use supabase.auth.signInWithOAuth({ provider: 'google' })
exports.googleLogin = (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'Google OAuth is not yet implemented. It will use Supabase Auth OAuth in Sprint 4.'
  });
};

// @desc    Google OAuth callback — to be implemented
// @route   GET /api/v1/auth/google/callback
// @access  Public
exports.googleCallback = (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'Google OAuth callback is not yet implemented.'
  });
};

// @desc    GitHub OAuth — to be implemented
// @route   GET /api/v1/auth/github
// @access  Public
// DEFERRED: Sprint 4 — Will use supabase.auth.signInWithOAuth({ provider: 'github' })
exports.githubLogin = (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'GitHub OAuth is not yet implemented. It will use Supabase Auth OAuth in Sprint 4.'
  });
};

// @desc    GitHub OAuth callback — to be implemented
// @route   GET /api/v1/auth/github/callback
// @access  Public
exports.githubCallback = (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'GitHub OAuth callback is not yet implemented.'
  });
};

// @desc    Simulated login — development/testing only
// @route   GET /api/v1/auth/simulated
// @access  Public
// DEFERRED: Sprint 2 — Will use Supabase service role to generate a test token
exports.simulatedLogin = (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'Simulated login is not yet implemented for the Supabase auth flow.'
  });
};
