import { useState } from 'react'
import './App.css'

function App() {
  const [resumeText, setResumeText] = useState('')
  const [evaluation, setEvaluation] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!resumeText.trim()) return

    setIsLoading(true)
    setEvaluation('')

    try {
      const response = await fetch('http://localhost:8002/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resume_text: resumeText })
      })
      const data = await response.json()
      setEvaluation(data.evaluation)
    } catch (err) {
      console.error(err)
      setEvaluation("Error connecting to the evaluation server.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="hr-app">
      <header className="hr-header">
        <div className="logo-container">
          <div className="logo-icon">🏢</div>
          <h1>GlobalCorp HR</h1>
        </div>
        <nav>
          <span>Careers</span>
          <span>About Us</span>
          <span>Contact</span>
        </nav>
      </header>

      <main className="main-content">
        <div className="intro">
          <h2>Auto-Screener 3000</h2>
          <p>Welcome to the GlobalCorp candidate portal. Paste your resume below to receive an instant AI evaluation of your profile.</p>
        </div>

        <div className="screener-container">
          <form className="resume-form" onSubmit={handleSubmit}>
            <label htmlFor="resume">Your Resume (Text Format)</label>
            <textarea 
              id="resume" 
              rows="15" 
              placeholder="Paste your resume content here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              required
            ></textarea>
            <button type="submit" disabled={isLoading} className="submit-btn">
              {isLoading ? 'Analyzing...' : 'Submit for Evaluation'}
            </button>
          </form>

          <div className="evaluation-panel">
            <h3>AI Evaluation Report</h3>
            {isLoading && (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Auto-Screener is reading your resume...</p>
              </div>
            )}
            {!isLoading && evaluation && (
              <div className="report-content">
                <pre>{evaluation}</pre>
              </div>
            )}
            {!isLoading && !evaluation && (
              <div className="empty-state">
                Submit your resume to see the report here.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
