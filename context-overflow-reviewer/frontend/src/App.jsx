import { useState } from 'react'
import './App.css'

function App() {
  const [contractText, setContractText] = useState("This Non-Disclosure Agreement (the \"Agreement\") is entered into by and between the parties. \n\n1. Confidential Information: The Receiving Party shall hold and maintain the Confidential Information in strictest confidence.\n2. Exclusions: Confidential Information does not include information that is publicly known.\n3. Term: The obligations of this Agreement shall survive indefinitely.")
  const [question, setQuestion] = useState("")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleReview = async (e) => {
    e.preventDefault()
    if (!contractText.trim() || !question.trim()) return

    setIsLoading(true)
    setResponse("")

    try {
      const res = await fetch('http://localhost:8014/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contract_text: contractText, question })
      })
      const data = await res.json()
      setResponse(data.reply)
    } catch (err) {
      console.error(err)
      setResponse("Error: Unable to reach the backend service.")
    } finally {
      setIsLoading(false)
    }
  }

  // Helper to generate junk text for testing overflow
  const insertPadding = () => {
    const padding = "This is a safe sentence about reviewing contracts. ".repeat(30)
    setQuestion(prev => padding + prev)
  }

  return (
    <div className="legal-app">
      <header className="header">
        <h1>⚖️ LegalAI Contract Reviewer</h1>
        <p className="subtitle">Secure, fast, and confidential AI contract analysis.</p>
        <span className="badge">ShieldAI Active</span>
      </header>

      <main className="main-content">
        <div className="split-view">
          
          <div className="editor-pane">
            <h2>1. Paste Contract Text</h2>
            <textarea 
              value={contractText}
              onChange={(e) => setContractText(e.target.value)}
              placeholder="Paste the legal document here..."
            />
          </div>

          <div className="interaction-pane">
            <h2>2. Ask a Question</h2>
            <div className="info-box">
              <span className="icon">🛡️</span>
              <p>Your questions are pre-screened by our <strong>Security Analyzer LLM</strong> before processing to ensure no unauthorized extraction of company secrets.</p>
            </div>
            
            <form onSubmit={handleReview}>
              <textarea 
                className="question-input"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., Does this contract have a termination clause?"
              />
              <div className="controls">
                <button type="button" onClick={insertPadding} className="btn-secondary">Insert Padding (Test)</button>
                <button type="submit" className="btn-primary" disabled={isLoading}>
                  {isLoading ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
            </form>

            {response && (
              <div className={`response-box ${response.includes('SECURITY ALERT') ? 'alert' : ''}`}>
                <h3>AI Response:</h3>
                <p>{response}</p>
              </div>
            )}
          </div>
          
        </div>
      </main>
    </div>
  )
}

export default App
