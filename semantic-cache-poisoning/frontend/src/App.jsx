import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Welcome to FastCache IT Support! How can I help you today?', isCached: false }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAdminMode, setIsAdminMode] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle Admin Mode toggle (Simulates an admin logging in to review FAQs)
  const toggleAdminMode = () => {
    const newMode = !isAdminMode
    setIsAdminMode(newMode)
    if (newMode) {
      document.cookie = "admin_session=FLAG_CACHE_POISON_120; path=/";
      setMessages([{ role: 'assistant', content: '🔒 [Admin Mode Enabled] You are now viewing the site as the Administrator. You can review common FAQs to ensure the AI is answering correctly.', isCached: false }])
    } else {
      document.cookie = "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      setMessages([{ role: 'assistant', content: 'Welcome to FastCache IT Support! How can I help you today?', isCached: false }])
    }
  }

  const handleSend = async (e, forcedInput = null) => {
    if (e) e.preventDefault()
    const userMsg = forcedInput || input
    if (!userMsg.trim()) return

    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    if (!forcedInput) setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8011/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      })
      const data = await response.json()
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, isCached: data.cached }])
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Network error.' }])
    } finally {
      setIsLoading(false)
    }
  }

  const clearCache = async () => {
    await fetch('http://localhost:8011/api/clear_cache', { method: 'POST' })
    alert("Backend semantic cache cleared!")
  }

  return (
    <div className={`support-app ${isAdminMode ? 'admin-theme' : ''}`}>
      <header className="app-header">
        <h1>⚡ FastCache IT Support</h1>
        <div className="controls">
          <button onClick={clearCache} className="clear-btn">Clear Server Cache</button>
          <button onClick={toggleAdminMode} className={isAdminMode ? 'admin-btn active' : 'admin-btn'}>
            {isAdminMode ? 'Exit Admin Mode' : 'Simulate Admin Login'}
          </button>
        </div>
      </header>

      {isAdminMode && (
        <div className="admin-banner">
          ⚠️ Admin Review Portal: Click a common query below to review the AI's cached answer.
          <div className="faq-buttons">
            <button onClick={() => handleSend(null, "How do I reset my router?")}>Review: "Reset Router"</button>
            <button onClick={() => handleSend(null, "How to update firmware?")}>Review: "Update Firmware"</button>
          </div>
        </div>
      )}

      <main className="chat-interface">
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-row ${msg.role}`}>
              <div className="message-content">
                {msg.role === 'assistant' ? (
                  <>
                    {msg.isCached && <span className="cache-badge">⚡ Cached Response</span>}
                    {/* VULNERABILITY: Blindly rendering HTML. Combined with Cache Poisoning, affects other users. */}
                    <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                  </>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message-row assistant">
              <div className="message-content loading">AI is thinking (or fetching from Semantic Cache)...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-form" onSubmit={(e) => handleSend(e)}>
          <input 
            type="text" 
            placeholder="Ask a support question..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isAdminMode} // Admin only clicks predefined reviews in this simulation
          />
          <button type="submit" disabled={isLoading || isAdminMode}>Send</button>
        </form>
      </main>
    </div>
  )
}

export default App
