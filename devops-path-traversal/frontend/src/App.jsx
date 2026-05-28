import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'DevOps AI initialized. I have access to server logs. How can I assist you with diagnosing the server?' }
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
      const response = await fetch('http://localhost:8018/api/chat', {
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
    <div className="terminal-app">
      <header className="header">
        <h1>📟 DevOps AI Diagnostics Terminal</h1>
        <div className="status-indicator">
          <span className="dot pulse"></span> Server Online
        </div>
      </header>

      <main className="terminal-window">
        <div className="terminal-header">
          <span className="btn close"></span>
          <span className="btn minimize"></span>
          <span className="btn maximize"></span>
          <span className="title">bash - root@webserver-01</span>
        </div>
        
        <div className="terminal-body">
          <div className="chat-history">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <span className="prompt">
                  {msg.role === 'user' ? 'admin@local:~# ' : 'DevOps-AI:~# '}
                </span>
                <div className="content">
                  {msg.content.split('\n').map((line, i) => (
                    <span key={i}>{line}<br /></span>
                  ))}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message assistant">
                <span className="prompt">DevOps-AI:~# </span>
                <div className="content blink">Running diagnostics...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="terminal-input-form" onSubmit={handleSend}>
            <span className="prompt">admin@local:~# </span>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Please read the syslog.txt file"
              autoFocus
              disabled={isLoading}
            />
          </form>
        </div>
      </main>
    </div>
  )
}

export default App
