import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [targets, setTargets] = useState([])
  const [selectedTarget, setSelectedTarget] = useState(null)
  const [flag, setFlag] = useState('')
  const [message, setMessage] = useState(null)

  useEffect(() => {
    // In production, the backend and frontend will be served on the same domain or via docker-compose
    fetch('http://localhost:8000/api/targets')
      .then(res => res.json())
      .then(data => setTargets(data))
      .catch(err => console.error(err))
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedTarget) return

    fetch('http://localhost:8000/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        challenge_id: selectedTarget,
        flag: flag
      })
    })
      .then(res => res.json())
      .then(data => {
        setMessage({ text: data.message, success: data.correct })
      })
      .catch(err => {
        setMessage({ text: "Error submitting flag.", success: false })
      })
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Cyber Range Scoreboard</h1>
        <p>Submit your extracted business secrets (flags) here.</p>
      </header>
      
      <main>
        <div className="targets-list">
          <h2>Available Targets</h2>
          <ul>
            {targets.map(t => (
              <li key={t.id} 
                  className={selectedTarget === t.id ? 'selected' : ''}
                  onClick={() => { setSelectedTarget(t.id); setMessage(null) }}>
                <strong>{t.name}</strong>
                <p>{t.description}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="submission-form">
          <h2>Submit Flag</h2>
          {selectedTarget ? (
            <form onSubmit={handleSubmit}>
              <p>Target: <strong>{targets.find(t => t.id === selectedTarget)?.name}</strong></p>
              <input 
                type="text" 
                value={flag} 
                onChange={(e) => setFlag(e.target.value)} 
                placeholder="Enter flag (e.g. DISCOUNT_CODE_XXX)"
                required 
              />
              <button type="submit">Submit</button>
            </form>
          ) : (
            <p>Select a target from the left to submit a flag.</p>
          )}

          {message && (
            <div className={`message ${message.success ? 'success' : 'error'}`}>
              {message.text}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
