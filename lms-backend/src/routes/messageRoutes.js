const express = require('express');
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/conversations', messageController.getConversations);
router.get('/conversations/:id', messageController.getMessagesByConversation);
router.get('/direct/:recipientId', messageController.getDirectConversationWithUser);
router.post('/send', messageController.sendMessage);
router.put('/read/:conversationId', messageController.markAsRead);

module.exports = router;
