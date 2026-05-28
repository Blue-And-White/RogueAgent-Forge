import { useState } from 'react'
import './App.css'

function App() {
  const [nlQuery, setNlQuery] = useState("Show me all employees in the Engineering department")
  const [sqlQuery, setSqlQuery] = useState("")
  const [results, setResults] = useState([])
  const [errorMsg, setErrorMsg] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!nlQuery.trim()) return

    setIsLoading(true)
    setSqlQuery("")
    setResults([])
    setErrorMsg("")

    try {
      const res = await fetch('http://localhost:8019/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ natural_language_query: nlQuery })
      })
      const data = await res.json()
      
      setSqlQuery(data.sql || "")
      
      if (data.error) {
        setErrorMsg(data.error)
      } else if (data.data) {
        setResults(data.data)
      }
    } catch (err) {
      console.error(err)
      setErrorMsg("Failed to connect to the database service.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="db-app">
      <header className="header">
        <h1>📊 DataAssist NL2SQL</h1>
        <p>Query your HR Database using everyday language.</p>
      </header>

      <main className="main-content">
        <div className="search-panel">
          <form onSubmit={handleSearch} className="search-form">
            <div className="input-group">
              <span className="icon">🔍</span>
              <input 
                type="text" 
                value={nlQuery}
                onChange={(e) => setNlQuery(e.target.value)}
                placeholder="Ask a question about the employees data..."
              />
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Querying...' : 'Ask AI'}
              </button>
            </div>
          </form>

          {sqlQuery && (
            <div className="sql-preview">
              <span className="label">Generated SQL:</span>
              <code>{sqlQuery}</code>
            </div>
          )}
        </div>

        <div className="results-panel">
          {errorMsg ? (
            <div className="error-alert">
              <strong>Error:</strong> {errorMsg}
            </div>
          ) : results.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  {Object.keys(results[0]).map(key => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val, i) => (
                      <td key={i}>{String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              {sqlQuery ? "No results found." : "Run a query to see results here."}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
