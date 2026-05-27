import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Welcome to WanderLust Travel! 🌍 Where would you like to go today? I can help you find flights and hotels.' }
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
    const currentHistory = [...messages]
    
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8008/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMsg,
          history: currentHistory.slice(-10) // Keep last 10 messages for context
        })
      })
      const data = await response.json()
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again later.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="travel-app">
      <header className="app-header">
        <h1>✈️ WanderLust Travel Assistant</h1>
        <p>Book your dream vacation with AI</p>
      </header>

      <main className="chat-container">
        <div className="chat-history">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-wrapper ${msg.role}`}>
              <div className="avatar">
                {msg.role === 'assistant' ? '🤖' : '👤'}
              </div>
              <div className="message-content">
                {msg.content.split('\n').map((line, i) => (
                  <span key={i}>{line}<br /></span>
                ))}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message-wrapper assistant">
              <div className="avatar">🤖</div>
              <div className="message-content loading">Looking for flights...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-form" onSubmit={handleSend}>
          <input 
            type="text" 
            placeholder="e.g. Find me a flight from New York to London next Friday..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" disabled={isLoading}>✈️ Send</button>
        </form>
      </main>
    </div>
  )
}

export default App
