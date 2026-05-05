import React, { useRef, useState } from 'react'

const styles = {
  panel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    height: '100%',
  },
  panelLabel: {
    fontFamily: 'var(--font-display)',
    fontSize: '0.95rem',
    letterSpacing: '0.15em',
    color: 'var(--orange)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  dropzone: {
    border: '2px dashed var(--gray-dark)',
    borderRadius: '4px',
    padding: '1rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.2s, background 0.2s',
    background: 'rgba(13,27,42,0.5)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    color: 'var(--gray)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  dropzoneActive: {
    borderColor: 'var(--orange)',
    background: 'rgba(230,126,34,0.05)',
    color: 'var(--orange)',
  },
  textarea: {
    flex: 1,
    background: 'rgba(13,27,42,0.8)',
    border: '1px solid var(--gray-dark)',
    borderRadius: '4px',
    color: 'var(--white)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.78rem',
    padding: '1rem',
    resize: 'none',
    lineHeight: 1.6,
    outline: 'none',
    transition: 'border-color 0.2s',
    minHeight: '320px',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  btnClear: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    letterSpacing: '0.1em',
    padding: '6px 14px',
    background: 'transparent',
    border: '1px solid var(--gray-dark)',
    color: 'var(--gray)',
    borderRadius: '3px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    transition: 'all 0.15s',
  },
  btnSubmit: {
    fontFamily: 'var(--font-display)',
    fontSize: '1rem',
    letterSpacing: '0.12em',
    padding: '8px 28px',
    background: 'linear-gradient(135deg, var(--red) 0%, var(--orange) 100%)',
    border: 'none',
    color: 'var(--white)',
    borderRadius: '3px',
    cursor: 'pointer',
    transition: 'opacity 0.15s, transform 0.1s',
    flex: 1,
  },
  btnSubmitDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  charCount: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    color: 'var(--gray-dark)',
    marginLeft: 'auto',
  },
}

const PLACEHOLDER = `{
  "incident_type": "wildfire",
  "location": {
    "lat": 37.7749,
    "lon": -122.4194
  },
  "severity": "high",
  "resources_needed": ["engine", "aerial"]
}`

export default function JsonInput({ onSubmit, isLoading }) {
  const [value, setValue] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()

  const handleFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => setValue(e.target.result)
    reader.readAsText(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/json') handleFile(file)
  }

  const handleSubmit = () => {
    if (!value.trim() || isLoading) return
    onSubmit(value)
  }

  const isValid = value.trim().length > 0

  return (
    <div style={styles.panel}>
      <div style={styles.panelLabel}>
        <span>📋</span> JSON INPUT
      </div>

      {/* Drop Zone */}
      <div
        style={{ ...styles.dropzone, ...(dragOver ? styles.dropzoneActive : {}) }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
        {dragOver ? '⬇ Drop JSON file here' : '📁 Upload .json file or drag & drop'}
      </div>

      {/* Editor */}
      <textarea
        style={{
          ...styles.textarea,
          borderColor: value.trim() ? 'var(--navy-light)' : 'var(--gray-dark)',
          flex: 1,
        }}
        placeholder={PLACEHOLDER}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        spellCheck={false}
        onFocus={(e) => e.target.style.borderColor = 'var(--orange)'}
        onBlur={(e) => e.target.style.borderColor = value.trim() ? 'var(--navy-light)' : 'var(--gray-dark)'}
      />

      <div style={styles.actions}>
        <button
          style={styles.btnClear}
          onClick={() => setValue('')}
          onMouseEnter={(e) => { e.target.style.borderColor = 'var(--red)'; e.target.style.color = 'var(--red)' }}
          onMouseLeave={(e) => { e.target.style.borderColor = 'var(--gray-dark)'; e.target.style.color = 'var(--gray)' }}
        >
          CLEAR
        </button>
        <button
          style={{
            ...styles.btnSubmit,
            ...((!isValid || isLoading) ? styles.btnSubmitDisabled : {})
          }}
          onClick={handleSubmit}
          disabled={!isValid || isLoading}
        >
          {isLoading ? 'DISPATCHING...' : 'DISPATCH →'}
        </button>
        <span style={styles.charCount}>{value.length} chars</span>
      </div>
    </div>
  )
}
