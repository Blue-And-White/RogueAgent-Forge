import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi there! I am Sarah from ShopNova customer support. How can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const sessionId = useRef(Math.random().toString(36).substring(7))
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
      const response = await fetch('http://localhost:8001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId.current,
          message: userMsg
        })
      })
      const data = await response.json()
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, our support system is currently unavailable.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="ecommerce-app">
      <header className="main-header">
        <div className="logo">ShopNova</div>
        <nav>
          <a href="#">Men</a>
          <a href="#">Women</a>
          <a href="#">Accessories</a>
          <a href="#">Sale</a>
        </nav>
      </header>

      <main className="hero-section">
        <h1>Summer Collection 2026</h1>
        <p>Discover the latest trends in premium fashion.</p>
        <button className="shop-now">Shop Now</button>
      </main>

      <div className="products-grid">
        <div className="product-card">
          <div className="product-image" style={{backgroundColor: '#e0e0e0'}}></div>
          <h3>Classic White Tee</h3>
          <p>$45.00</p>
        </div>
        <div className="product-card">
          <div className="product-image" style={{backgroundColor: '#d5d5d5'}}></div>
          <h3>Denim Jacket</h3>
          <p>$120.00</p>
        </div>
        <div className="product-card">
          <div className="product-image" style={{backgroundColor: '#c0c0c0'}}></div>
          <h3>Leather Sneakers</h3>
          <p>$180.00</p>
        </div>
      </div>

      {/* Chat Widget */}
      <div className={`chat-widget ${isChatOpen ? 'open' : ''}`}>
        {!isChatOpen ? (
          <button className="chat-toggle" onClick={() => setIsChatOpen(true)}>
            💬 Chat with us
          </button>
        ) : (
          <div className="chat-window">
            <div className="chat-header">
              <h3>ShopNova Support</h3>
              <button onClick={() => setIsChatOpen(false)}>✕</button>
            </div>
            
            <div className="chat-messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.role}`}>
                  <div className="message-bubble">{msg.content}</div>
                </div>
              ))}
              {isLoading && (
                <div className="message assistant">
                  <div className="message-bubble typing">...</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input" onSubmit={handleSend}>
              <input 
                type="text" 
                placeholder="Type your message..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button type="submit" disabled={isLoading}>Send</button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
