import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Search,
  Filter,
  Users,
  Video,
  Phone,
  Info,
  Paperclip,
  Smile,
  Send,
  CheckCheck,
  Check,
  ArrowLeft,
  MoreVertical,
  Circle,
  FileText,
  User as UserIcon,
  RefreshCw,
  MessageSquare
} from 'lucide-react';

// Format current real date dynamically
const getFormattedTodayDate = () => {
  const d = new Date();
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

// Format timestamp nicely
const formatTimestamp = (dateInput) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();

  if (isToday) {
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Safely extract string ID
const getUserIdStr = (userObj) => {
  if (!userObj) return '';
  if (typeof userObj === 'string') return userObj;
  return (userObj._id || userObj.id || '').toString();
};

// Standard avatar generator if profile picture is empty
const getAvatarUrl = (userObj) => {
  if (userObj?.profilePicture) return userObj.profilePicture;
  const name = userObj?.name || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366F1&color=fff`;
};

// Pre-configured Group Channels
const GROUP_CHANNELS = [
  {
    id: 'grp_1',
    type: 'group',
    name: 'Web Dev Study Group',
    role: 'Instructor Proctored Channel',
    groupIconBg: 'bg-indigo-600 text-white',
    unreadCount: 0,
    lastMessage: "Dr. Arjun: Don't forget tomorrow's review session at 4 PM!",
    lastMessageTime: 'Yesterday',
    messages: [
      {
        id: 'msg_g1',
        sender: 'other',
        senderName: 'Dr. Arjun',
        text: "Dr. Arjun: Don't forget tomorrow's review session at 4 PM!",
        time: 'Yesterday'
      }
    ]
  },
  {
    id: 'grp_2',
    type: 'group',
    name: 'DBMS Faculty Support',
    role: 'Course Support Channel',
    groupIconBg: 'bg-teal-600 text-white',
    unreadCount: 0,
    lastMessage: "Instructor Jane: Guidelines uploaded to course resources.",
    lastMessageTime: 'May 17',
    messages: [
      {
        id: 'msg_g2',
        sender: 'other',
        text: "Instructor Jane: Guidelines uploaded to course resources.",
        time: 'May 17',
        isRead: true
      }
    ]
  }
];

const MessagesPage = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // 'All', 'Unread', 'Groups'
  const [messageInput, setMessageInput] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const messagesEndRef = useRef(null);

  const currentUserId = getUserIdStr(currentUser);
  const userRoleLower = (currentUser?.role || '').toLowerCase();
  const isStudent = userRoleLower === 'student';
  const isInstructor = userRoleLower === 'instructor';
  const isAdmin = userRoleLower === 'admin';

  // Active conversation object
  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  // Auto-scroll to bottom of chat thread when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConvId, activeConv?.messages]);

  // Load Contacts Directory & Existing MongoDB Conversations
  const loadRosterAndConversations = async (isInitial = false) => {
    if (isInitial) setLoading(true);

    try {
      // 1. Fetch user directory
      const dirResponse = await api.get('/users/directory');
      let fetchedUsers = dirResponse.data?.data?.users || [];

      // Enforce role-based access rules:
      // - Students ONLY see Instructors
      // - Instructors see Students and Admins
      if (isStudent) {
        fetchedUsers = fetchedUsers.filter((u) => (u.role || '').toLowerCase() === 'instructor');
      } else if (isInstructor) {
        fetchedUsers = fetchedUsers.filter((u) => {
          const r = (u.role || '').toLowerCase();
          return r === 'student' || r === 'admin' || r === 'instructor';
        });
      }

      // 2. Fetch existing MongoDB conversations
      const convsResponse = await api.get('/messages/conversations');
      const mongoConvs = convsResponse.data?.data?.conversations || [];

      // 3. Map contacts with real MongoDB chat data
      const userConvs = fetchedUsers.map((u) => {
        const dbUserId = getUserIdStr(u);
        const roleTitle = (u.role || '').toLowerCase() === 'instructor'
          ? 'Instructor - Faculty Support'
          : (u.role || '').toLowerCase() === 'admin'
          ? 'Institute Administration'
          : `Student • ${u.department || 'Computer Science'}`;

        const matchConv = mongoConvs.find((mc) =>
          mc.participants?.some((p) => getUserIdStr(p) === dbUserId)
        );

        const lastSnippet = matchConv?.lastMessageSnippet || `Start conversation with ${u.name}`;
        const lastTime = matchConv ? formatTimestamp(matchConv.lastMessageTime || matchConv.updatedAt) : 'Available';
        const unread = matchConv?.unreadCount || 0;

        return {
          id: `user_${dbUserId}`,
          dbUserId,
          mongoId: matchConv?._id || null,
          type: 'direct',
          name: u.name,
          email: u.email,
          userRole: u.role,
          role: roleTitle,
          avatar: getAvatarUrl(u),
          unreadCount: unread,
          lastMessage: lastSnippet,
          lastMessageTime: lastTime,
          messages: []
        };
      });

      const combined = [...userConvs, ...GROUP_CHANNELS];

      setConversations((prev) => {
        if (prev.length === 0) return combined;

        return combined.map((c) => {
          const existing = prev.find((p) => p.id === c.id);
          if (existing && existing.messages?.length > 0) {
            return {
              ...c,
              mongoId: existing.mongoId || c.mongoId,
              lastMessage: existing.lastMessage || c.lastMessage,
              lastMessageTime: existing.lastMessageTime || c.lastMessageTime,
              messages: existing.messages
            };
          }
          return c;
        });
      });

      // Auto-select first direct instructor contact for student
      if (userConvs.length > 0 && (isInitial || !activeConvId)) {
        setActiveConvId(userConvs[0].id);
      } else if (isInitial && combined.length > 0 && !activeConvId) {
        setActiveConvId(combined[0].id);
      }
    } catch (err) {
      console.warn('Failed to load roster:', err.message);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    loadRosterAndConversations(true);
  }, [currentUser]);

  // Sync Thread Messages from MongoDB for selected contact
  const syncThreadMessages = async (targetConv, showSyncIndicator = false) => {
    if (!targetConv || !targetConv.dbUserId) return;
    if (showSyncIndicator) setIsSyncing(true);

    try {
      const response = await api.get(`/messages/direct/${targetConv.dbUserId}`);
      if (response.data?.status === 'success' && response.data?.data) {
        const { conversation: mongoConv, messages: mongoMsgs } = response.data.data;

        const formattedMsgs = mongoMsgs.map((m) => {
          const senderIdStr = getUserIdStr(m.sender);
          const isMe = senderIdStr === currentUserId;

          return {
            id: m._id,
            sender: isMe ? 'me' : 'other',
            senderName: m.sender?.name || targetConv.name,
            text: m.text,
            time: formatTimestamp(m.createdAt),
            isRead: m.isRead,
            attachment: m.attachments && m.attachments.length > 0 ? m.attachments[0] : undefined
          };
        });

        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === targetConv.id) {
              const lastMsgObj = formattedMsgs[formattedMsgs.length - 1];
              return {
                ...c,
                mongoId: mongoConv._id,
                unreadCount: 0,
                lastMessage: lastMsgObj ? lastMsgObj.text : c.lastMessage,
                lastMessageTime: lastMsgObj ? lastMsgObj.time : c.lastMessageTime,
                messages: formattedMsgs
              };
            }
            return c;
          })
        );
      }
    } catch (err) {
      console.warn('Sync thread error:', err.message);
    } finally {
      if (showSyncIndicator) setIsSyncing(false);
    }
  };

  // Fetch thread messages on active conversation change
  useEffect(() => {
    if (activeConv && activeConv.dbUserId) {
      syncThreadMessages(activeConv, true);
    }
  }, [activeConvId]);

  // Real-Time 2-second background sync interval
  useEffect(() => {
    if (!activeConv || !activeConv.dbUserId) return;

    const interval = setInterval(() => {
      syncThreadMessages(activeConv, false);
      loadRosterAndConversations(false);
    }, 2000);

    return () => clearInterval(interval);
  }, [activeConvId, activeConv]);

  // Handle Sending a new message (Real-time DB transaction)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() && !attachment) return;

    const textToSend = messageInput.trim();
    setMessageInput('');
    setSendingMsg(true);

    try {
      if (activeConv && activeConv.dbUserId) {
        // Send real message to Express / MongoDB backend
        const response = await api.post('/messages/send', {
          recipientId: activeConv.dbUserId,
          conversationId: activeConv.mongoId || undefined,
          text: textToSend,
          attachments: attachment ? [attachment] : []
        });

        if (response.data?.status === 'success' && response.data?.data?.message) {
          const savedMsg = response.data.data.message;
          const formattedMsg = {
            id: savedMsg._id,
            sender: 'me',
            text: savedMsg.text,
            time: formatTimestamp(savedMsg.createdAt),
            isRead: true,
            attachment: attachment || undefined
          };

          setConversations((prev) =>
            prev.map((c) => {
              if (c.id === activeConvId) {
                return {
                  ...c,
                  mongoId: response.data.data.conversation?._id || c.mongoId,
                  lastMessage: textToSend || '[Attachment]',
                  lastMessageTime: formattedMsg.time,
                  messages: [...c.messages, formattedMsg]
                };
              }
              return c;
            })
          );
        }
      } else {
        // Group Channel fallback
        const currentTime = formatTimestamp(new Date());
        const newMsg = {
          id: `msg_${Date.now()}`,
          sender: 'me',
          text: textToSend,
          time: currentTime,
          isRead: true,
          attachment: attachment || undefined
        };

        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === activeConvId) {
              return {
                ...c,
                lastMessage: textToSend,
                lastMessageTime: currentTime,
                messages: [...c.messages, newMsg]
              };
            }
            return c;
          })
        );
      }
    } catch (err) {
      console.error('Failed to send message:', err.message);
    } finally {
      setSendingMsg(false);
      setAttachment(null);
    }
  };

  // Handle Attachment trigger
  const handleAttachmentClick = () => {
    setAttachment({
      name: 'Course_Resource_Doc.pdf',
      url: '#',
      fileType: 'pdf'
    });
  };

  // Filter conversations by tab and search query
  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === 'Unread') return c.unreadCount > 0;
    if (activeTab === 'Groups') return c.type === 'group';
    return true;
  });

  return (
    <Layout>
      <div className="h-[calc(100vh-110px)] max-h-[660px] bg-slate-100 rounded-3xl p-4 sm:p-5 my-1 border border-slate-200/80 shadow-sm flex flex-col overflow-hidden">
        
        {/* Role Access & Real-Time Sync Notification Banner */}
        <div className="shrink-0 mb-3 bg-white border border-slate-200 p-3 rounded-2xl flex items-center justify-between text-xs font-semibold text-slate-700 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              Real-Time Messaging Active as <strong className="capitalize text-indigo-600">{currentUser?.name || currentUser?.role}</strong> ({currentUser?.role})
            </span>
            {isSyncing && (
              <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <RefreshCw size={10} className="animate-spin" /> Live Syncing...
              </span>
            )}
          </div>

          <div className="text-[11px] font-bold text-slate-400">
            {isStudent && 'Role Access: Instructors Only'}
            {isInstructor && 'Role Access: Students & Administrators'}
            {isAdmin && 'Role Access: Full Roster Access'}
          </div>
        </div>

        {/* Main Grid: Left Roster (4 cols) + Right Chat Thread (8 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
          
          {/* Left Roster Panel */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col overflow-hidden h-full">
            
            {/* Search Bar Header */}
            <div className="shrink-0 p-3.5 space-y-2.5 border-b border-slate-100">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isStudent ? 'Search instructors...' : 'Search contacts...'}
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <Filter size={14} />
                </button>
              </div>

              {/* Tabs: All, Unread, Groups */}
              <div className="flex items-center gap-6 pt-1 text-xs font-bold border-b border-slate-100 px-2">
                {['All', 'Unread', 'Groups'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2.5 transition-all relative ${
                      activeTab === tab
                        ? 'text-indigo-600 font-extrabold'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <span>{tab}</span>
                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation List Scroll Area */}
            <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-slate-100 custom-scrollbar">
              {filteredConversations.map((c) => {
                const isActive = c.id === activeConvId;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setActiveConvId(c.id);
                      setConversations((prev) =>
                        prev.map((item) => (item.id === c.id ? { ...item, unreadCount: 0 } : item))
                      );
                    }}
                    className={`p-4 flex items-center justify-between gap-3 transition-colors cursor-pointer relative ${
                      isActive
                        ? 'bg-indigo-50/70 border-l-4 border-indigo-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {c.type === 'group' ? (
                        <div className={`w-11 h-11 rounded-2xl ${c.groupIconBg || 'bg-indigo-600 text-white'} flex items-center justify-center font-bold text-sm shrink-0 shadow-sm`}>
                          <Users size={20} />
                        </div>
                      ) : (
                        <img
                          src={c.avatar}
                          alt={c.name}
                          className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-200"
                        />
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-slate-900 truncate">{c.name}</h4>
                          {c.userRole && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded capitalize ${
                              (c.userRole || '').toLowerCase() === 'instructor'
                                ? 'bg-amber-100 text-amber-700'
                                : (c.userRole || '').toLowerCase() === 'admin'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-50 text-blue-600'
                            }`}>
                              {c.userRole}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">{c.lastMessage}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400">{c.lastMessageTime}</span>
                      {c.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-extrabold text-[10px] flex items-center justify-center shadow-xs">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredConversations.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs font-semibold space-y-2">
                  <p>No contacts available for your user role.</p>
                  {isStudent && <p className="text-[11px] text-indigo-600">Students can interact with Instructors only.</p>}
                </div>
              )}
            </div>
          </div>

          {/* Right Chat Thread Panel */}
          {activeConv ? (
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col overflow-hidden h-full">
              
              {/* Active Chat Header */}
              <div className="shrink-0 p-3.5 border-b border-slate-100 flex items-center justify-between gap-4 bg-white">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  {activeConv.type === 'group' ? (
                    <div className={`w-10 h-10 rounded-2xl ${activeConv.groupIconBg || 'bg-indigo-600 text-white'} flex items-center justify-center font-bold text-sm shadow-sm`}>
                      <Users size={18} />
                    </div>
                  ) : (
                    <img
                      src={activeConv.avatar}
                      alt={activeConv.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-slate-900 leading-tight">{activeConv.name}</h3>
                      {activeConv.email && (
                        <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {activeConv.email}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 block">{activeConv.role}</span>
                  </div>
                </div>

                {/* Info Action Icon */}
                <div className="flex items-center gap-2 text-slate-500">
                  <button className="p-2 rounded-xl hover:bg-slate-100 hover:text-slate-800 transition-colors" title="Chat Info">
                    <Info size={18} />
                  </button>
                </div>
              </div>

              {/* Chat Thread Scroll Container */}
              <div className="flex-1 overflow-y-auto min-h-0 p-5 space-y-5 bg-slate-50/40 custom-scrollbar">
                
                {/* Centered Date Divider */}
                <div className="flex justify-center">
                  <span className="text-[11px] font-bold text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-xs">
                    {getFormattedTodayDate()}
                  </span>
                </div>

                {/* Message Bubbles list */}
                {activeConv.messages?.length > 0 ? (
                  activeConv.messages.map((msg) => {
                    const isMe = msg.sender === 'me';

                    return (
                      <React.Fragment key={msg.id}>
                        <div className={`flex items-end gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          {!isMe && (
                            <img
                              src={activeConv.avatar || getAvatarUrl({ name: activeConv.name })}
                              alt="Sender"
                              className="w-8 h-8 rounded-full object-cover shrink-0 mb-1 border border-slate-200"
                            />
                          )}

                          <div className={`max-w-md space-y-1 ${isMe ? 'items-end text-right' : 'items-start text-left'}`}>
                            <div
                              className={`p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-xs ${
                                isMe
                                  ? 'bg-indigo-50 text-indigo-950 border border-indigo-100/80 rounded-br-none'
                                  : 'bg-slate-100/90 text-slate-800 rounded-bl-none'
                              }`}
                            >
                              {msg.text}

                              {msg.attachment && (
                                <div className="mt-2 p-2 bg-white/80 border border-indigo-200 rounded-xl flex items-center gap-2">
                                  <FileText size={16} className="text-indigo-600" />
                                  <span className="text-[11px] font-bold text-slate-700 truncate">{msg.attachment.name}</span>
                                </div>
                              )}
                            </div>

                            <div className={`flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <span>{msg.time}</span>
                              {isMe && <CheckCheck size={14} className="text-indigo-600" />}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-slate-400 text-xs font-semibold space-y-2">
                    <MessageSquare size={32} className="mx-auto text-slate-300 stroke-[1.5]" />
                    <p>No message history with {activeConv.name} yet.</p>
                    <p className="text-[11px] text-indigo-600">Send a message below to start the conversation!</p>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Attachment Preview Chip */}
              {attachment && (
                <div className="shrink-0 px-6 py-2 bg-indigo-50 border-t border-indigo-100 flex items-center justify-between text-xs text-indigo-700 font-bold">
                  <div className="flex items-center gap-2">
                    <Paperclip size={14} />
                    <span>Attached: {attachment.name}</span>
                  </div>
                  <button onClick={() => setAttachment(null)} className="text-indigo-500 hover:text-indigo-800">
                    Remove
                  </button>
                </div>
              )}

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="shrink-0 p-3 bg-white border-t border-slate-100 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAttachmentClick}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Attach file"
                >
                  <Paperclip size={18} />
                </button>

                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Message ${activeConv.name}...`}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                />

                <button
                  type="button"
                  className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Add Emoji"
                >
                  <Smile size={18} />
                </button>

                <button
                  type="submit"
                  disabled={sendingMsg}
                  className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 transition-all shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <Send size={16} className="ml-0.5" />
                </button>
              </form>

            </div>
          ) : (
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-center p-8 text-slate-400 text-xs font-semibold">
              {isStudent ? 'Select an instructor to start messaging.' : 'Select a student or instructor to start messaging.'}
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
};

export default MessagesPage;
