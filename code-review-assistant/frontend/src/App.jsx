import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [code, setCode] = useState('# Paste your Python code here...\n\ndef hello():\n    print("Hello, world!")\n\nhello()\n')
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Welcome to AI Code Reviewer. Paste your code on the left and ask me to review or run it.' }
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

    // Combine code and message for context
    const fullPrompt = `Code context:\n\`\`\`python\n${code}\n\`\`\`\n\nUser request: ${userMsg}`

    try {
      const response = await fetch('http://localhost:8005/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: fullPrompt })
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
    <div className="ide-app">
      <header className="ide-header">
        <div className="ide-logo">{"{ } CodeReviewAI"}</div>
        <div className="ide-toolbar">
          <button className="toolbar-btn">File</button>
          <button className="toolbar-btn">Edit</button>
          <button className="toolbar-btn">View</button>
        </div>
      </header>

      <main className="ide-main">
        <div className="editor-pane">
          <div className="pane-header">main.py</div>
          <textarea 
            className="code-editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
          ></textarea>
        </div>

        <div className="chat-pane">
          <div className="pane-header">AI Copilot</div>
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="message-bubble">
                  {msg.content.split('\n').map((line, i) => (
                    <span key={i}>{line}<br /></span>
                  ))}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message assistant">
                <div className="message-bubble typing">Running...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form className="chat-input" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="e.g. Can you run this and check for bugs?" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" disabled={isLoading}>Send</button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default App
