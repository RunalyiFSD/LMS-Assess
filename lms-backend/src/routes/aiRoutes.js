const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { ROLES } = require('../config/constants');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// All AI routes require authentication
router.use(protect);

router.post('/chat', aiController.chatWithAI);
router.post('/rag/ingest', restrictTo(ROLES.TEACHER, ROLES.ADMIN), upload.single('file'), aiController.ingestDocument);

module.exports = router;
