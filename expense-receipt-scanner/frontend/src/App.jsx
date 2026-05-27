import { useState } from 'react'
import './App.css'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [scanResult, setScanResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setScanResult('')
    }
  }

  const handleScan = async (e) => {
    e.preventDefault()
    if (!selectedFile) return

    setIsLoading(true)
    setScanResult('')

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await fetch('http://localhost:8009/api/scan', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      setScanResult(data.result)
    } catch (err) {
      console.error(err)
      setScanResult('Error connecting to the scanner service.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="scanner-app">
      <header className="header">
        <h1>🧾 Finance Dept - Receipt Scanner</h1>
      </header>

      <main className="main-content">
        <div className="upload-section">
          <h2>Upload Receipt</h2>
          <p>Please upload a clear image of your receipt for automated expense processing.</p>
          
          <form onSubmit={handleScan} className="upload-form">
            <div className="file-input-wrapper">
              <input 
                type="file" 
                accept="image/jpeg, image/png, image/webp" 
                onChange={handleFileChange} 
                id="file-upload"
                className="file-input"
              />
              <label htmlFor="file-upload" className="file-label">
                {selectedFile ? selectedFile.name : 'Choose an image...'}
              </label>
            </div>
            
            <button 
              type="submit" 
              disabled={!selectedFile || isLoading} 
              className="scan-btn"
            >
              {isLoading ? 'Scanning AI...' : 'Scan Receipt'}
            </button>
          </form>

          {previewUrl && (
            <div className="preview-container">
              <img src={previewUrl} alt="Receipt preview" className="image-preview" />
            </div>
          )}
        </div>

        {scanResult && (
          <div className="result-section">
            <h2>Scan Result</h2>
            <div className="result-box">
              {scanResult}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
