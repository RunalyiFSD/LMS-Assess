import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AIChatWindow.css';
import api from '../../services/api';

const AIChatWindow = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi there! I am your AI Tutor. Ask me any questions about your courses.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      // Find courseId if available in URL or context, for now we will pass a global or specific context
      // Assuming a generic tutor query, contextId could be parsed from route params if within a course
      const pathParts = window.location.pathname.split('/');
      let contextId = 'global';
      if (pathParts[1] === 'courses' && pathParts[2]) {
        contextId = pathParts[2];
      }

      const res = await api.post('/ai/chat', {
        message: userMessage,
        agentType: 'tutor',
        contextId: contextId
      });

      setMessages(prev => [...prev, { role: 'assistant', content: res.data.data.response }]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  // Only show for authenticated users
  if (!user) return null;

  return (
    <div className="ai-chat-container">
      {isOpen && (
        <div className="ai-chat-window glass-panel animate-fade-in-up">
          <div className="ai-chat-header">
            <div className="ai-header-info">
              <div className="ai-avatar pulse"></div>
              <h3>AI Tutor</h3>
            </div>
            <button className="close-btn" onClick={toggleChat}>&times;</button>
          </div>
          
          <div className="ai-chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-bubble ${msg.role}`}>
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="chat-bubble assistant typing-indicator">
                <span></span><span></span><span></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="ai-chat-input-area" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={!input.trim() || loading} className="send-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </form>
        </div>
      )}

      <button className={`ai-chat-trigger ${isOpen ? 'active' : ''}`} onClick={toggleChat}>
        {!isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default AIChatWindow;
