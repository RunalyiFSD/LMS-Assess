const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const restrictTo = require('../middleware/roleMiddleware');
const ROLES = require('../constants/roles');
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
