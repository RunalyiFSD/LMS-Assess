const aiPlatform = require('../integrations/aiPlatform');
const { sendSuccess, sendError } = require('../utils/responseHandlers');
const HTTP_STATUS = require('../utils/httpStatus');

exports.chatWithAI = async (req, res) => {
  try {
    const { message, agentType, contextId } = req.body;
    const userId = req.user.id;

    if (!message) {
      return sendError(res, 'Message is required', null, HTTP_STATUS.BAD_REQUEST);
    }

    // Construct a unique session ID based on user and context (e.g. course or assessment id)
    const sessionId = `${userId}_${contextId || 'global'}`;

    const responseText = await aiPlatform.sendChat(sessionId, message, agentType);

    return sendSuccess(res, { response: responseText }, 'AI response generated successfully');
  } catch (error) {
    return sendError(res, error.message, null, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};
