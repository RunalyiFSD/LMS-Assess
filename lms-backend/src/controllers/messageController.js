const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// @desc    Get all conversations for logged in user
// @route   GET /api/messages/conversations
// @access  Protected
exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    let conversations = await Conversation.find({ participants: userId })
      .populate('participants', 'name email role profilePicture')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          recipient: userId,
          isRead: false,
        });
        const obj = conv.toObject();
        obj.unreadCount = unreadCount;
        return obj;
      })
    );

    res.status(200).json({
      status: 'success',
      results: conversationsWithUnread.length,
      data: {
        conversations: conversationsWithUnread,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages by conversation ID
// @route   GET /api/messages/conversations/:id
// @access  Protected
exports.getMessagesByConversation = async (req, res, next) => {
  try {
    const conversationId = req.params.id;

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name email profilePicture role')
      .populate('recipient', 'name email profilePicture role')
      .sort({ createdAt: 1 });

    res.status(200).json({
      status: 'success',
      results: messages.length,
      data: {
        messages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a new message
// @route   POST /api/messages/send
// @access  Protected
exports.sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user._id;
    const { conversationId, recipientId, text, attachments } = req.body;

    let conversation;

    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    } else if (recipientId) {
      // Find or create direct 1-on-1 conversation
      conversation = await Conversation.findOne({
        type: 'direct',
        participants: { $all: [senderId, recipientId] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          type: 'direct',
          participants: [senderId, recipientId],
        });
      }
    }

    if (!conversation) {
      return next(new AppError('Conversation not found or recipient required', 400));
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: senderId,
      recipient: recipientId || null,
      text: text || '',
      attachments: attachments || [],
      isRead: false,
    });

    // Update conversation metadata
    conversation.lastMessage = message._id;
    conversation.lastMessageSnippet = text || (attachments && attachments.length ? '[Attachment]' : '');
    conversation.lastMessageTime = new Date();
    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email profilePicture role')
      .populate('recipient', 'name email profilePicture role');

    res.status(201).json({
      status: 'success',
      data: {
        message: populatedMessage,
        conversation,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark conversation messages as read
// @route   PUT /api/messages/read/:conversationId
// @access  Protected
exports.markAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    await Message.updateMany(
      { conversation: conversationId, recipient: userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      status: 'success',
      message: 'Messages marked as read',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get or create 1-on-1 direct conversation with a recipient user and fetch messages
// @route   GET /api/messages/direct/:recipientId
// @access  Protected
exports.getDirectConversationWithUser = async (req, res, next) => {
  try {
    const senderId = req.user._id;
    const { recipientId } = req.params;

    let conversation = await Conversation.findOne({
      type: 'direct',
      participants: { $all: [senderId, recipientId] },
    }).populate('participants', 'name email role profilePicture');

    if (!conversation) {
      conversation = await Conversation.create({
        type: 'direct',
        participants: [senderId, recipientId],
      });
      conversation = await Conversation.findById(conversation._id).populate('participants', 'name email role profilePicture');
    }

    // Mark unread messages sent to req.user as read
    await Message.updateMany(
      { conversation: conversation._id, recipient: senderId, isRead: false },
      { $set: { isRead: true } }
    );

    const messages = await Message.find({ conversation: conversation._id })
      .populate('sender', 'name email profilePicture role')
      .populate('recipient', 'name email profilePicture role')
      .sort({ createdAt: 1 });

    res.status(200).json({
      status: 'success',
      data: {
        conversation,
        messages,
      },
    });
  } catch (error) {
    next(error);
  }
};

