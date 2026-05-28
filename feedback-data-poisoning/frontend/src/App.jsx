import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi there! How can I help you with your shopping experience today?' }
  ])
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [feedbackStatus, setFeedbackStatus] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendChat = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = input
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8015/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      })
      const data = await response.json()
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Support is currently offline.' }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendFeedback = async (e) => {
    e.preventDefault()
    if (!feedback.trim()) return

    try {
      const response = await fetch('http://localhost:8015/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: feedback })
      })
      const data = await response.json()
      setFeedbackStatus(data.status)
      setFeedback('')
      setTimeout(() => setFeedbackStatus(''), 3000)
    } catch (err) {
      console.error(err)
      setFeedbackStatus('Failed to submit feedback.')
    }
  }

  return (
    <div className="store-app">
      <header className="header">
        <h1>🛍️ ShopMate Customer Portal</h1>
      </header>

      <main className="main-content">
        
        <div className="feedback-section">
          <h2>Continuous Improvement 📈</h2>
          <p>We use your feedback to dynamically train and improve our AI Support Agent. Help us get better!</p>
          <form onSubmit={handleSendFeedback} className="feedback-form">
            <textarea 
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g. 'The AI should be more cheerful' or 'Please explain return policies clearer.'"
            />
            <button type="submit">Submit Feedback to Training Queue</button>
            {feedbackStatus && <span className="status-msg">{feedbackStatus}</span>}
          </form>
        </div>

        <div className="chat-section">
          <h2>💬 Live Support</h2>
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
                  <div className="bubble loading">Typing...</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input" onSubmit={handleSendChat}>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
              />
              <button type="submit" disabled={isLoading}>Send</button>
            </form>
          </div>
        </div>

      </main>
    </div>
  )
}

export default App
