const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

// All AI routes require authentication
router.use(protect);

router.post('/chat', aiController.chatWithAI);

module.exports = router;
