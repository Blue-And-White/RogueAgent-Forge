import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '🏭 Smart Factory Orchestrator Online.\nI am the Planner Agent. Send me your production requests.' }
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
      const response = await fetch('http://localhost:8012/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      })
      const data = await response.json()
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.result }])
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection to Orchestrator failed.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="factory-app">
      <header className="header">
        <div className="logo">⚙️ Factory Orchestrator</div>
        <div className="status">Status: Active</div>
      </header>

      <main className="main-content">
        <div className="terminal">
          <div className="terminal-history">
            {messages.map((msg, idx) => (
              <div key={idx} className={`log-entry ${msg.role}`}>
                <span className="prompt">{msg.role === 'user' ? 'Operator > ' : 'System > '}</span>
                <span className="output">
                  {msg.content.split('\n').map((line, i) => (
                    <span key={i}>{line}<br /></span>
                  ))}
                </span>
              </div>
            ))}
            {isLoading && (
              <div className="log-entry assistant">
                <span className="prompt">System > </span>
                <span className="output blink">Orchestrating agents...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="terminal-input" onSubmit={handleSend}>
            <span className="prompt">Operator > </span>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Please produce 100 widgets..."
              autoFocus
            />
            <button type="submit" disabled={isLoading}>EXECUTE</button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default App
