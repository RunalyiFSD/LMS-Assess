const User = require('../models/User');
const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const notificationService = require('../services/notificationService');

// Helper to sign JWT and send Cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  };

  // Remove password from output
  user.password = undefined;

  res.cookie('token', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// @desc    Register User
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, college, department, batch, bio, language, experience } = req.body;

    // Check if email already registered
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return next(new AppError('Email address is already registered', 400));
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      college,
      department,
      batch,
      bio,
      language,
      experience,
    });

    // Send notification
    await notificationService.createNotification(
      user._id,
      'Welcome to LMS Assessment',
      `Hello ${name}, your account has been successfully created.`,
      'notification',
      user.email
    );

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login User
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide an email and password', 400));
    }

    // Find user and select password explicitly
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout User
// @route   POST /api/auth/logout
// @access  Protected
exports.logout = async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
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

// @desc    Forgot Password (Mock)
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError('There is no user with that email address.', 404));
    }

    // Mock verification token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

    // Send mock notification
    await notificationService.createNotification(
      user._id,
      'Password Reset Link',
      `You requested a password reset. Use this URL to reset: ${resetUrl}`,
      'notification',
      user.email
    );

    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent to your email (mocked). Check notifications/console.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password (Mock)
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return next(new AppError('Please provide both email and new password', 400));
    }
    
    // In standard app, verify token against DB hash. Here, for simplicity, we mock check
    // by finding the user matching the provided email.
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('No account exists with this email.', 404));
    }

    user.password = password;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password reset successful! You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};

// Google OAuth Login
exports.googleLogin = (req, res) => {
  const hasClientCredentials = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
  if (!hasClientCredentials) {
    console.log('[AUTH] Google credentials not set in .env. Falling back to Developer Simulation.');
    return res.redirect('/api/auth/simulated?provider=google');
  }

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${
    process.env.GOOGLE_CLIENT_ID
  }&redirect_uri=${encodeURIComponent(
    process.env.GOOGLE_CALLBACK_URL
  )}&response_type=code&scope=${encodeURIComponent('profile email')}`;

  res.redirect(googleAuthUrl);
};

// Google OAuth Callback
exports.googleCallback = async (req, res, next) => {
  try {
    const { code, error } = req.query;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    if (error) {
      return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(error)}`);
    }

    if (!code) {
      return res.redirect(`${clientUrl}/login?error=${encodeURIComponent('No authorization code provided')}`);
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      console.error('[AUTH] Google Token Exchange error:', tokenData);
      return res.redirect(`${clientUrl}/login?error=${encodeURIComponent('Google token exchange failed')}`);
    }

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userResponse.json();
    if (!googleUser.email) {
      return res.redirect(`${clientUrl}/login?error=${encodeURIComponent('Google account has no email address')}`);
    }

    // Find or create user
    let user = await User.findOne({
      $or: [{ googleId: googleUser.sub }, { email: googleUser.email.toLowerCase() }],
    });

    if (user) {
      // Update googleId and provider if not set
      let modified = false;
      if (!user.googleId) {
        user.googleId = googleUser.sub;
        user.provider = 'google';
        modified = true;
      }
      if (!user.profilePicture && googleUser.picture) {
        user.profilePicture = googleUser.picture;
        modified = true;
      }
      if (modified) {
        await user.save();
      }
    } else {
      // Create a new user
      user = await User.create({
        name: googleUser.name || googleUser.email.split('@')[0],
        email: googleUser.email.toLowerCase(),
        googleId: googleUser.sub,
        provider: 'google',
        role: 'student',
        profilePicture: googleUser.picture || '',
        college: 'AssessLMS College',
        department: 'General',
        batch: '2026',
        bio: 'Signed up via Google OAuth',
      });

      // Send welcome notification
      try {
        await notificationService.createNotification(
          user._id,
          'Welcome to LMS Assessment',
          `Hello ${user.name}, your account has been successfully created using Google.`,
          'notification',
          user.email
        );
      } catch (err) {
        console.error('Welcome notification failed:', err.message);
      }
    }

    // Generate JWT cookie and redirect
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const cookieOptions = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    };

    res.cookie('token', token, cookieOptions);
    res.redirect(`${clientUrl}/dashboard`);
  } catch (error) {
    console.error('[AUTH] Google Callback catch error:', error);
    next(error);
  }
};

// GitHub OAuth Login
exports.githubLogin = (req, res) => {
  const hasClientCredentials = process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET;
  if (!hasClientCredentials) {
    console.log('[AUTH] GitHub credentials not set in .env. Falling back to Developer Simulation.');
    return res.redirect('/api/auth/simulated?provider=github');
  }

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${
    process.env.GITHUB_CLIENT_ID
  }&redirect_uri=${encodeURIComponent(
    process.env.GITHUB_CALLBACK_URL
  )}&scope=${encodeURIComponent('user:email')}`;

  res.redirect(githubAuthUrl);
};

// GitHub OAuth Callback
exports.githubCallback = async (req, res, next) => {
  try {
    const { code, error, error_description } = req.query;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    if (error) {
      return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(error_description || error)}`);
    }

    if (!code) {
      return res.redirect(`${clientUrl}/login?error=${encodeURIComponent('No authorization code provided')}`);
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_CALLBACK_URL,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      console.error('[AUTH] GitHub Token Exchange error:', tokenData);
      return res.redirect(`${clientUrl}/login?error=${encodeURIComponent('GitHub token exchange failed')}`);
    }

    // Get user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/json',
      },
    });

    const githubUser = await userResponse.json();

    // Get email since it can be null in the profile response if set to private
    let email = githubUser.email;
    if (!email) {
      const emailsResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: 'application/json',
        },
      });
      const emails = await emailsResponse.json();
      if (Array.isArray(emails)) {
        const primaryEmail = emails.find((e) => e.primary)?.email || emails[0]?.email;
        email = primaryEmail;
      }
    }

    if (!email) {
      return res.redirect(`${clientUrl}/login?error=${encodeURIComponent('GitHub account has no email address')}`);
    }

    // Find or create user
    let user = await User.findOne({
      $or: [{ githubId: githubUser.id.toString() }, { email: email.toLowerCase() }],
    });

    if (user) {
      // Update githubId and provider if not set
      let modified = false;
      if (!user.githubId) {
        user.githubId = githubUser.id.toString();
        user.provider = 'github';
        modified = true;
      }
      if (!user.profilePicture && githubUser.avatar_url) {
        user.profilePicture = githubUser.avatar_url;
        modified = true;
      }
      if (modified) {
        await user.save();
      }
    } else {
      // Create a new user
      user = await User.create({
        name: githubUser.name || githubUser.login,
        email: email.toLowerCase(),
        githubId: githubUser.id.toString(),
        provider: 'github',
        role: 'student',
        profilePicture: githubUser.avatar_url || '',
        college: 'AssessLMS College',
        department: 'General',
        batch: '2026',
        bio: 'Signed up via GitHub OAuth',
      });

      // Send welcome notification
      try {
        await notificationService.createNotification(
          user._id,
          'Welcome to LMS Assessment',
          `Hello ${user.name}, your account has been successfully created using GitHub.`,
          'notification',
          user.email
        );
      } catch (err) {
        console.error('Welcome notification failed:', err.message);
      }
    }

    // Generate JWT cookie and redirect
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const cookieOptions = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    };

    res.cookie('token', token, cookieOptions);
    res.redirect(`${clientUrl}/dashboard`);
  } catch (error) {
    console.error('[AUTH] GitHub Callback catch error:', error);
    next(error);
  }
};

// Simulated OAuth Login (Developer Fallback)
exports.simulatedLogin = async (req, res, next) => {
  try {
    const { provider } = req.query;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const isGoogle = provider === 'google';

    const testId = isGoogle ? 'simulated_google_123456' : 'simulated_github_123456';
    const testEmail = isGoogle
      ? 'google_simulated_user@lmsassessment.com'
      : 'github_simulated_user@lmsassessment.com';
    const testName = isGoogle ? 'Google Simulation Student' : 'GitHub Simulation Student';
    const testAvatar = isGoogle
      ? 'https://lh3.googleusercontent.com/a/default-user=s96-c'
      : 'https://avatars.githubusercontent.com/u/9919?v=4';

    console.log(`[AUTH] Processing Simulated OAuth Login for: ${testName} (${provider})`);

    // Find or create
    let user = await User.findOne({
      $or: [
        isGoogle ? { googleId: testId } : { githubId: testId },
        { email: testEmail }
      ],
    });

    if (user) {
      let modified = false;
      if (isGoogle && !user.googleId) {
        user.googleId = testId;
        user.provider = 'google';
        modified = true;
      } else if (!isGoogle && !user.githubId) {
        user.githubId = testId;
        user.provider = 'github';
        modified = true;
      }
      if (modified) {
        await user.save();
      }
    } else {
      user = await User.create({
        name: testName,
        email: testEmail,
        googleId: isGoogle ? testId : undefined,
        githubId: !isGoogle ? testId : undefined,
        provider: provider || 'google',
        role: 'student',
        profilePicture: testAvatar,
        college: 'Simulation College',
        department: 'Simulation Engineering',
        batch: '2026',
        bio: `Test Developer account signed in via simulated ${provider} OAuth.`,
      });

      // Send notification
      try {
        await notificationService.createNotification(
          user._id,
          'Welcome to Simulated LMS',
          `Hello ${user.name}, you have logged in via simulated ${provider} OAuth.`,
          'notification',
          user.email
        );
      } catch (err) {
        console.error('Welcome notification failed:', err.message);
      }
    }

    // Set JWT Cookie
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const cookieOptions = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    };

    res.cookie('token', token, cookieOptions);
    res.redirect(`${clientUrl}/dashboard`);
  } catch (error) {
    console.error('[AUTH] Simulated Login catch error:', error);
    next(error);
  }
};
