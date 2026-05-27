import { useState } from 'react'
import './App.css'

function App() {
  const [prompt, setPrompt] = useState('')
  const [summary, setSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSummarize = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsLoading(true)
    setSummary('')

    try {
      const response = await fetch('http://localhost:8004/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      const data = await response.json()
      setSummary(data.reply)
    } catch (err) {
      console.error(err)
      setSummary("Error connecting to the AI summarizer.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="summarizer-app">
      <nav className="navbar">
        <div className="logo">Briefly.ai</div>
        <div className="links">
          <a href="#">Pricing</a>
          <a href="#">API</a>
          <button className="login-btn">Login</button>
        </div>
      </nav>

      <main className="main-container">
        <div className="text-center">
          <h1 className="title">AI Web Summarizer Agent</h1>
          <p className="subtitle">Drop a link or ask me to research a topic, and I will read the web for you.</p>
        </div>

        <div className="card">
          <form onSubmit={handleSummarize}>
            <div className="input-wrapper">
              <input 
                type="text" 
                className="url-input"
                placeholder="e.g. Can you summarize https://example.com for me?" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <button type="submit" className="action-btn" disabled={isLoading}>
                {isLoading ? 'Agent is working...' : 'Summarize'}
              </button>
            </div>
          </form>

          {summary && (
            <div className="result-area">
              <h3>Agent Response</h3>
              <div className="markdown-body">
                {summary.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer>
        <p>&copy; 2026 Briefly.ai Agent Technology</p>
      </footer>
    </div>
  )
}

export default App
