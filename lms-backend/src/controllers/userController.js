const AppError = require('../utils/AppError');
const userService = require('../services/userService');
const userRepository = require('../repositories/userRepository');

// @desc    Get all users (Admin only)
// @route   GET /api/v1/users
// @access  Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const users = await userService.getAllUsers(role);

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a user (Admin only)
// @route   POST /api/v1/users
// @access  Admin
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Create via Supabase Auth Admin through the repository
    const user = await userRepository.createAuthUser(email, password, name, role);

    res.status(201).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/v1/users/:id
// @access  Admin
exports.deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student profile detail
// @route   GET /api/v1/users/profile/:id
// @access  Protected
// NOTE: Full performance analytics (attempts, results, subject stats, achievements)
//       are deferred to Sprint 3 pending Supabase assessment_submissions aggregation views.
//       Returns Supabase user profile data + empty analytics structure now.
exports.getUserProfile = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await userRepository.findById(userId);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        profile: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          avatar_url: user.avatar_url || null,
          role: user.role,
          department: user.department || null,
          bio: user.bio || null,
          is_active: user.is_active,
          created_at: user.created_at,
        },
        // DEFERRED: Full analytics (rank, subject performance, attempt history)
        // will be implemented in Sprint 3 using Supabase assessment_submissions aggregations.
        summary: {
          note: 'Full analytics available in Sprint 3 after Supabase migration completion.',
          globalRank: null,
          totalPoints: 0,
          assessmentsAttempted: 0,
          assessmentsCompleted: 0,
          averagePercentage: 0,
          successRate: 0,
          totalTimeSpent: 0,
        },
        subjectPerformance: [],
        assessmentHistory: [],
        achievements: [],
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed chart data for public profile analytics
// @route   GET /api/v1/users/profile/:id/analytics
// @access  Protected
// DEFERRED: Sprint 3 — Full analytics aggregation from assessment_submissions
//           requires Supabase RPC/view functions to be created first.
exports.getUserAnalytics = async (req, res, next) => {
  try {
    res.status(200).json({
      status: 'success',
      data: {
        note: 'Analytics data migration to Supabase is in progress. Full data available in Sprint 3.',
        weeklyPerformance: [],
        monthlyPerformance: [],
        subjectComparison: [],
        problemsSolved: [],
        submissionAnalysis: [],
        skillAnalysis: [],
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update logged-in user's profile details
// @route   PUT /api/v1/users/profile
// @access  Protected
exports.updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // Supabase UUID from authMiddleware
    const { full_name, department, bio, avatar_url } = req.body;

    const updatedUser = await userService.updateUserProfile(
      userId,
      {
        full_name,
        department,
        bio,
        avatar_url,
      }
    );

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};
