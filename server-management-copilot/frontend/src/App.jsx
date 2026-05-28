import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Server Control Panel Copilot connected. I can take notes for you or execute maintenance tasks (like backup.sh). How can I help?' }
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
      const response = await fetch('http://localhost:8020/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      })
      const data = await response.json()
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection to server failed.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="admin-app">
      <header className="header">
        <h1>⚙️ Server Control Panel</h1>
        <div className="user-badge">Role: SysAdmin</div>
      </header>

      <main className="main-layout">
        
        <div className="sidebar">
          <h3>Available AI Capabilities</h3>
          <ul>
            <li>📝 <strong>Write Note:</strong> Save reminders to the server's notes directory.</li>
            <li>🚀 <strong>Execute Task:</strong> Run predefined scripts from the server's scripts directory (e.g., <code>backup.sh</code>).</li>
          </ul>
          
          <div className="hint-box">
            <strong>Security Notice:</strong><br/>
            Direct shell access has been disabled. All operations must be performed through this AI Copilot.
          </div>
        </div>

        <div className="chat-interface">
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
                <div className="bubble loading">Copilot is thinking...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input" onSubmit={handleSend}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Please take a note called todo.txt with 'fix the DB'"
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>Send</button>
          </form>
        </div>

      </main>
    </div>
  )
}

export default App
