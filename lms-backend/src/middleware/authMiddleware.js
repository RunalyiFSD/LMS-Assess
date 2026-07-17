const { supabase } = require('../config/supabase');
const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/AppError');

exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // We only use Bearer token now for Supabase integration since frontend manages sessions
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }

    // Verify token with Supabase
    const { data: { user: authUser }, error } = await supabase.auth.getUser(token);

    if (error || !authUser) {
      return next(new AppError('Invalid or expired token. Please log in again.', 401));
    }

    // Fetch user profile from public.users repository
    const currentUser = await userRepository.findById(authUser.id);
    
    if (!currentUser || !currentUser.is_active) {
      return next(new AppError('The user belonging to this token no longer exists or is disabled.', 401));
    }

    // Grant access and store user details in request
    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};
