import React, { useState } from 'react'

const styles = {
  backdrop: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.75)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    background: 'var(--navy)',
    border: '1px solid var(--navy-light)',
    borderTop: '3px solid var(--orange)',
    borderRadius: '6px',
    padding: '2rem',
    width: '480px',
    maxWidth: '90vw',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.2rem',
    letterSpacing: '0.15em',
    color: 'var(--orange)',
    marginBottom: '1.5rem',
  },
  field: {
    marginBottom: '1.25rem',
  },
  label: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.68rem',
    letterSpacing: '0.12em',
    color: 'var(--gray)',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    background: 'rgba(13,27,42,0.8)',
    border: '1px solid var(--gray-dark)',
    borderRadius: '3px',
    color: 'var(--white)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    padding: '8px 12px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  hint: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.62rem',
    color: 'var(--gray-dark)',
    marginTop: '4px',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'flex-end',
    marginTop: '1.5rem',
  },
  btnCancel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.72rem',
    padding: '7px 18px',
    background: 'transparent',
    border: '1px solid var(--gray-dark)',
    color: 'var(--gray)',
    borderRadius: '3px',
    cursor: 'pointer',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  btnSave: {
    fontFamily: 'var(--font-display)',
    fontSize: '0.9rem',
    letterSpacing: '0.1em',
    padding: '7px 22px',
    background: 'linear-gradient(135deg, var(--red) 0%, var(--orange) 100%)',
    border: 'none',
    color: 'var(--white)',
    borderRadius: '3px',
    cursor: 'pointer',
  },
}

export default function ConfigModal({ isOpen, onClose, config, onSave }) {
  const [baseUrl, setBaseUrl] = useState(config.baseUrl)
  const [endpoint, setEndpoint] = useState(config.endpoint)
  const [timeout, setTimeout_] = useState(config.timeout)

  if (!isOpen) return null

  const handleSave = () => {
    onSave({ baseUrl, endpoint, timeout: parseInt(timeout, 10) || 30000 })
    onClose()
  }

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.title}>⚙ API CONFIGURATION</div>

        <div style={styles.field}>
          <label style={styles.label}>Base URL</label>
          <input
            style={styles.input}
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="http://localhost:8000"
            onFocus={(e) => e.target.style.borderColor = 'var(--orange)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--gray-dark)'}
          />
          <div style={styles.hint}>NERIS API server address (EC2 instance URL or localhost)</div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Endpoint Path</label>
          <input
            style={styles.input}
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder="/validate"
            onFocus={(e) => e.target.style.borderColor = 'var(--orange)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--gray-dark)'}
          />
          <div style={styles.hint}>POST endpoint for schema validation</div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Request Timeout (ms)</label>
          <input
            style={styles.input}
            value={timeout}
            type="number"
            onChange={(e) => setTimeout_(e.target.value)}
            placeholder="30000"
            onFocus={(e) => e.target.style.borderColor = 'var(--orange)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--gray-dark)'}
          />
          <div style={styles.hint}>Default: 30000ms — LLM inference may take longer</div>
        </div>

        <div style={styles.actions}>
          <button style={styles.btnCancel} onClick={onClose}>CANCEL</button>
          <button style={styles.btnSave} onClick={handleSave}>SAVE CONFIG</button>
        </div>
      </div>
    </div>
  )
}
