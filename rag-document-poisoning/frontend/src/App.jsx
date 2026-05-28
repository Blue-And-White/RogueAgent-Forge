import { useState } from 'react'
import './App.css'

function App() {
  const [file, setFile] = useState(null)
  const [question, setQuestion] = useState("")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState("")

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setFileName(e.target.files[0].name)
    }
  }

  const handleAnalyze = async (e) => {
    e.preventDefault()
    if (!file || !question.trim()) return

    setIsLoading(true)
    setResponse("")

    const formData = new FormData()
    formData.append('file', file)
    formData.append('question', question)

    try {
      const res = await fetch('http://localhost:8017/api/analyze', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      
      if (res.ok) {
        setResponse(data.reply)
      } else {
        setResponse("Error: " + data.detail)
      }
    } catch (err) {
      console.error(err)
      setResponse("Failed to connect to HR Analyzer API.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="hr-app">
      <header className="header">
        <div className="logo">📁 HR Policy Analyzer</div>
        <div className="tagline">Upload documents. Get AI-powered summaries.</div>
      </header>

      <main className="main-content">
        <div className="card">
          <h2>1. Upload Document (.txt)</h2>
          <div className="upload-zone">
            <input 
              type="file" 
              id="file-upload" 
              accept=".txt" 
              onChange={handleFileChange}
              className="file-input"
            />
            <label htmlFor="file-upload" className="file-label">
              <span className="icon">📄</span>
              {fileName ? fileName : 'Choose a text file or drag it here'}
            </label>
          </div>

          <h2 className="mt">2. Ask a Question</h2>
          <form onSubmit={handleAnalyze} className="ask-form">
            <input 
              type="text" 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What is the policy on remote work?"
              className="q-input"
            />
            <button 
              type="submit" 
              disabled={isLoading || !file}
              className="submit-btn"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Document'}
            </button>
          </form>

          {response && (
            <div className="response-box">
              <h3>AI Summary</h3>
              <div className="response-content">
                {response.split('\n').map((line, i) => (
                  <span key={i}>{line}<br /></span>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
