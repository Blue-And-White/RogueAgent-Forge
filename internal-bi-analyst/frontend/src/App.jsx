import { useState } from 'react'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [sqlGenerated, setSqlGenerated] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleQuery = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    setError('')
    setResults(null)
    setSqlGenerated('')

    try {
      const response = await fetch('http://localhost:8003/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })
      const data = await response.json()
      
      setSqlGenerated(data.sql_generated || '')
      if (data.error) {
        setError(data.error)
      } else {
        setResults(data.results)
      }
    } catch (err) {
      console.error(err)
      setError("Failed to connect to BI Analyst service.")
    } finally {
      setIsLoading(false)
    }
  }

  const renderTable = () => {
    if (!results || results.length === 0) return <p>No data returned.</p>
    
    const columns = Object.keys(results[0])
    
    return (
      <table className="data-table">
        <thead>
          <tr>
            {columns.map(col => <th key={col}>{col}</th>)}
          </tr>
        </thead>
        <tbody>
          {results.map((row, idx) => (
            <tr key={idx}>
              {columns.map(col => <td key={col}>{row[col]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  return (
    <div className="bi-app">
      <div className="sidebar">
        <div className="brand">
          <h2>DataInsight BI</h2>
        </div>
        <nav className="nav-menu">
          <a href="#" className="active">Sales Dashboard</a>
          <a href="#">Inventory</a>
          <a href="#">Marketing</a>
          <a href="#">Settings</a>
        </nav>
      </div>
      
      <div className="main-content">
        <header className="top-header">
          <h1>Natural Language Query (AI)</h1>
          <div className="user-profile">Finance Team</div>
        </header>
        
        <div className="query-section">
          <p className="description">
            Ask questions about the <strong>sales</strong> data in plain English. Our AI will automatically translate your question into a database query.
          </p>
          <form onSubmit={handleQuery} className="query-form">
            <input 
              type="text" 
              placeholder="e.g. Total sales of Cloud Server" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Querying...' : 'Ask AI'}
            </button>
          </form>
          <div className="quick-queries">
            <span>Try:</span>
            <button type="button" onClick={() => setQuery("Show all sales")}>Show all sales</button>
            <button type="button" onClick={() => setQuery("Sum of amounts grouped by product")}>Sum of amounts grouped by product</button>
          </div>
        </div>

        {(sqlGenerated || error || results) && (
          <div className="results-section">
            {sqlGenerated && (
              <div className="debug-sql">
                <span>AI Generated SQL:</span>
                <code>{sqlGenerated}</code>
              </div>
            )}
            
            <div className="data-view">
              {error ? (
                <div className="error-message">{error}</div>
              ) : (
                renderTable()
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
