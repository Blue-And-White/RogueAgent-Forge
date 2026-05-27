import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi there, I am your Workspace Copilot. I can help you read your files. (You are logged in as: bob)' }
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

    // In a real app we'd pass the auth token.
    // The backend just blindly trusts the AI to decide whose files to read.
    const promptContext = `Current user is Bob. Request: ${userMsg}`

    try {
      const response = await fetch('http://localhost:8007/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: promptContext })
      })
      const data = await response.json()
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error connecting to Workspace Copilot.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="workspace-app">
      <aside className="sidebar">
        <div className="logo">Workspace Hub</div>
        <nav className="nav-links">
          <a href="#" className="active">Copilot</a>
          <a href="#">My Files</a>
          <a href="#">Calendar</a>
          <a href="#">Team Directory</a>
        </nav>
      </aside>
      
      <main className="main-chat">
        <header className="chat-header">
          <h2>Enterprise AI Copilot</h2>
          <div className="user-info">👤 Bob (Sales Team)</div>
        </header>

        <div className="chat-history">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-row ${msg.role}`}>
              <div className="message-bubble">
                {msg.content.split('\n').map((line, i) => (
                  <span key={i}>{line}<br /></span>
                ))}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message-row assistant">
              <div className="message-bubble loading">Copilot is thinking...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleSend}>
          <input 
            type="text" 
            placeholder="Ask Copilot to read your files..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" disabled={isLoading}>Send</button>
        </form>
      </main>
    </div>
  )
}

export default App
