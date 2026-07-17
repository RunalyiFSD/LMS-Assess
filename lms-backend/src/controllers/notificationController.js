const Notification = require('../legacy/models/Notification');
const AppError = require('../utils/AppError');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Protected
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Protected
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    // Verify ownership
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return next(new AppError('Unauthorized', 403));
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      status: 'success',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};
