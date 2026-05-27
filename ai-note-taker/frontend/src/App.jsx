import { useState, useEffect } from 'react'
import './App.css'
// Note: We use a simple markdown parser if needed, but the backend says it might return HTML.
// We'll trust the backend AI completely to demonstrate the vulnerability.

function App() {
  const [inputText, setInputText] = useState('')
  const [notes, setNotes] = useState([
    { id: 1, content: '<h1>Welcome to NoteAI</h1><p>Your intelligent, auto-formatting note assistant.</p>' }
  ])
  const [isLoading, setIsLoading] = useState(false)

  // Inject a simulated admin cookie/token on load
  useEffect(() => {
    document.cookie = "admin_session=cookie_flag_xss_391; path=/";
  }, [])

  const handleCreateNote = async (e) => {
    e.preventDefault()
    if (!inputText.trim()) return

    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8006/api/format_note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_input: inputText })
      })
      const data = await response.json()
      
      const newNote = {
        id: Date.now(),
        content: data.html_content
      }
      
      setNotes(prev => [newNote, ...prev])
      setInputText('')
    } catch (err) {
      console.error(err)
      alert("Error generating note.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="note-app">
      <header className="header">
        <div className="logo">📝 NoteAI Web</div>
        <div className="user-profile">Demo User</div>
      </header>
      
      <main className="main-content">
        <section className="input-section">
          <h2>Create a new Note</h2>
          <p className="hint">Just brain-dump your thoughts. Our AI will perfectly format it into a structured HTML/Markdown document for you.</p>
          <form onSubmit={handleCreateNote}>
            <textarea
              className="note-input"
              rows={5}
              placeholder="e.g. buy milk, call john about the project status tomorrow..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            ></textarea>
            <div className="actions">
              <button type="submit" disabled={isLoading} className="generate-btn">
                {isLoading ? 'AI is formatting...' : '✨ Magic Format'}
              </button>
            </div>
          </form>
        </section>

        <section className="notes-list">
          <h2>Your Notes</h2>
          <div className="notes-grid">
            {notes.map(note => (
              <div key={note.id} className="note-card">
                {/* VULNERABILITY: Blindly rendering AI output as HTML */}
                <div 
                  className="note-content" 
                  dangerouslySetInnerHTML={{ __html: note.content }} 
                />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
