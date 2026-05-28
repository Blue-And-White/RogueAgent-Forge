import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello guest_123! I am your AI Profile Manager. I can help you update your email address or other account settings.' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = input
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8013/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMsg,
          current_user: "guest_123" // Current session user
        })
      })
      const data = await response.json()
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="profile-app">
      <header className="header">
        <h1>⚙️ Account Settings</h1>
        <div className="user-info">Logged in as: <strong>guest_123</strong></div>
      </header>

      <main className="main-content">
        <div className="settings-panel">
          <h2>Profile Management</h2>
          <p>Don't want to navigate menus? Just ask the AI to update your details!</p>
          
          <div className="chat-box">
            <div className="chat-history">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.role}`}>
                  <div className="bubble">
                    {msg.content.split('\n').map((line, i) => (
                      <span key={i}>{line}<br /></span>
                    ))}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message assistant">
                  <div className="bubble loading">Updating profile via API...</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input" onSubmit={handleSend}>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. Please change my email to new@example.com"
              />
              <button type="submit" disabled={isLoading}>Update</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
