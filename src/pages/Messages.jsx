import { useState, useRef, useEffect } from 'react'
import { Search, Send, MessageSquare } from 'lucide-react'
import { getLayoutForRole } from '../utils/layoutForRole'

// Req 68, 69, 70: Private messaging

export default function Messages({
  currentUser,
  onLogout,
  notifications,
  onMarkRead,
  userList,
  messages,
  onSendMessage,
  onMarkConversationRead,
}) {
  const Layout = getLayoutForRole(currentUser?.role)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [query, setQuery] = useState('')
  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  // People the current user can message: everyone except self and admin (unless admin)
  const contacts = (userList || []).filter((u) => u.id !== currentUser.id && u.active !== false)

  const filteredContacts = contacts.filter((u) =>
    !query || u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase())
  )

  function getConvId(uid1, uid2) {
    return [uid1, uid2].sort().join('_')
  }

  function getConversation(userId) {
    const convId = getConvId(currentUser.id, userId)
    return messages[convId] || []
  }

  function getUnread(userId) {
    return getConversation(userId).filter((m) => m.senderId !== currentUser.id && !m.read).length
  }

  const selectedUser = contacts.find((u) => u.id === selectedUserId)
  const conversation = selectedUserId ? getConversation(selectedUserId) : []

  useEffect(() => {
    if (selectedUserId && onMarkConversationRead) onMarkConversationRead(selectedUserId)
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedUserId, conversation.length]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSend(e) {
    e.preventDefault()
    if (!text.trim() || !selectedUserId) return
    onSendMessage(selectedUserId, text.trim())
    setText('')
  }

  function formatTime(iso) {
    try { return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) } catch { return '' }
  }

  return (
    <Layout currentUser={currentUser} onLogout={onLogout} notifications={notifications} onMarkRead={onMarkRead}>
      <div className="max-w-[1280px] mx-auto w-full h-[calc(100vh-8rem)] flex gap-6">
        {/* Sidebar — contact list */}
        <div className="w-72 flex-shrink-0 bg-white border border-[#e5e2e1] flex flex-col">
          <div className="p-4 border-b border-[#e5e2e1]">
            <h1 className="text-xl font-bold text-[#111111] mb-3" style={{ fontFamily: "'Newsreader', serif" }}>
              Messages
            </h1>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#747878]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search people…"
                className="w-full pl-8 pr-3 py-2 border border-[#e5e2e1] bg-[#fdf8f8] focus:border-[#111111] focus:outline-none text-xs text-[#111111] placeholder:text-[#747878] transition-colors"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredContacts.length === 0 ? (
              <p className="text-xs text-[#747878] p-4">No users found.</p>
            ) : (
              filteredContacts.map((u) => {
                const unread = getUnread(u.id)
                const conv = getConversation(u.id)
                const lastMsg = conv[conv.length - 1]
                return (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    className={`w-full flex items-center gap-3 p-4 text-left border-b border-[#f1edec] transition-colors
                      ${selectedUserId === u.id ? 'bg-[#f1edec] border-l-2 border-l-[#111111]' : 'hover:bg-[#fdf8f8]'}`}
                  >
                    <div className="w-9 h-9 bg-[#111111] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{u.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-[#111111] truncate" style={{ fontFamily: "'Manrope', sans-serif" }}>
                          {u.name}
                        </p>
                        {unread > 0 && (
                          <span className="ml-1 bg-[#111111] text-white text-[9px] font-black px-1.5 py-0.5 flex-shrink-0">
                            {unread}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#747878] uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {u.role}
                      </p>
                      {lastMsg && (
                        <p className="text-xs text-[#747878] truncate mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {lastMsg.senderId === currentUser.id ? 'You: ' : ''}{lastMsg.text}
                        </p>
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Conversation pane */}
        <div className="flex-1 bg-white border border-[#e5e2e1] flex flex-col">
          {selectedUser ? (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-[#e5e2e1]">
                <div className="w-9 h-9 bg-[#111111] flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{selectedUser.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#111111]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                    {selectedUser.name}
                  </p>
                  <p className="text-[10px] text-[#747878] uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {selectedUser.role}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {conversation.length === 0 ? (
                  <p className="text-center text-sm text-[#747878] py-10" style={{ fontFamily: "'Manrope', sans-serif" }}>
                    No messages yet. Start the conversation.
                  </p>
                ) : (
                  conversation.map((m) => {
                    const isMe = m.senderId === currentUser.id
                    return (
                      <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[70%] px-4 py-2.5 text-sm leading-relaxed
                            ${isMe ? 'bg-[#111111] text-white' : 'bg-[#f1edec] text-[#111111]'}`}
                          style={{ fontFamily: "'Manrope', sans-serif" }}
                        >
                          {m.text}
                          <p className={`text-[10px] mt-1 ${isMe ? 'text-[#c4c7c7]' : 'text-[#747878]'}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                            {formatTime(m.createdAt)}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="flex gap-3 px-6 py-4 border-t border-[#e5e2e1]">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={`Message ${selectedUser.name}…`}
                  className="flex-1 border-b border-[#c4c7c7] py-2 bg-transparent focus:border-[#111111] focus:outline-none text-sm text-[#111111] placeholder:text-[#747878] transition-colors"
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                />
                <button
                  type="submit"
                  disabled={!text.trim()}
                  className="flex items-center gap-2 bg-[#111111] text-white px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#333] transition-colors disabled:opacity-40"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <Send size={13} /> Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <MessageSquare size={32} className="text-[#c4c7c7]" />
              <p className="text-sm text-[#747878]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                Select a contact to start messaging.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
