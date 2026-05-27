import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello Employee! I am the Enterprise Knowledge Base Assistant. Ask me anything about HR policies, IT rules, or company guidelines.' }
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
      const response = await fetch('http://localhost:8010/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg, role: 'employee' }) // Hardcoded role for demonstration
      })
      const data = await response.json()
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error retrieving knowledge base documents.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="rag-app">
      <header className="app-header">
        <div className="logo-section">
          <h2>🏢 Enterprise KB</h2>
        </div>
        <div className="user-badge">Role: Standard Employee</div>
      </header>

      <main className="chat-interface">
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-row ${msg.role}`}>
              <div className="message-content">
                {msg.content.split('\n').map((line, i) => (
                  <span key={i}>{line}<br /></span>
                ))}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message-row assistant">
              <div className="message-content loading">Searching knowledge base...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-form" onSubmit={handleSend}>
          <input 
            type="text" 
            placeholder="Search the knowledge base... (e.g. What is the leave policy?)" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" disabled={isLoading}>Search</button>
        </form>
      </main>
    </div>
  )
}

export default App
