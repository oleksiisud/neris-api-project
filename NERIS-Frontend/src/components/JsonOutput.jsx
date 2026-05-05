import React, { useState } from 'react'

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
    justifyContent: 'space-between',
  },
  labelRight: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  output: {
    flex: 1,
    background: 'rgba(13,27,42,0.8)',
    border: '1px solid var(--gray-dark)',
    borderRadius: '4px',
    padding: '1rem',
    overflowY: 'auto',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.78rem',
    lineHeight: 1.65,
    minHeight: '360px',
    position: 'relative',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  emptyState: {
    color: 'var(--gray-dark)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.78rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '0.5rem',
    opacity: 0.6,
  },
  statusBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    padding: '2px 10px',
    borderRadius: '2px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  btnCopy: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    letterSpacing: '0.1em',
    padding: '4px 12px',
    background: 'transparent',
    border: '1px solid var(--gray-dark)',
    color: 'var(--gray)',
    borderRadius: '3px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    transition: 'all 0.15s',
  },
  btnDownload: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    letterSpacing: '0.1em',
    padding: '4px 12px',
    background: 'transparent',
    border: '1px solid var(--navy-light)',
    color: 'var(--gray)',
    borderRadius: '3px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    transition: 'all 0.15s',
  },
  loadingSpinner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '1rem',
    color: 'var(--orange)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    letterSpacing: '0.1em',
  },
}

function colorizeJson(json) {
  return json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
      if (/^"/.test(match)) {
        if (/:$/.test(match)) return `<span style="color:#f39c12">${match}</span>`
        return `<span style="color:#2ecc71">${match}</span>`
      }
      if (/true|false/.test(match)) return `<span style="color:#e74c3c">${match}</span>`
      if (/null/.test(match)) return `<span style="color:#95a5a6">${match}</span>`
      return `<span style="color:#3498db">${match}</span>`
    })
}

export default function JsonOutput({ response, error, isLoading }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!response) return
    navigator.clipboard.writeText(response).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleDownload = () => {
    if (!response) return
    const blob = new Blob([response], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `neris-response-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatus = () => {
    if (error) return { label: `${error.status || 'ERR'} ERROR`, bg: 'rgba(192,57,43,0.2)', color: 'var(--red-bright)', border: 'var(--red)' }
    if (response) return { label: '200 OK', bg: 'rgba(39,174,96,0.15)', color: 'var(--success)', border: 'var(--success-dim)' }
    return null
  }

  const status = getStatus()

  return (
    <div style={styles.panel}>
      <div style={styles.panelLabel}>
        <span>⚡ API RESPONSE</span>
        <div style={styles.labelRight}>
          {status && (
            <span style={{
              ...styles.statusBadge,
              background: status.bg,
              color: status.color,
              border: `1px solid ${status.border}`,
            }}>
              {status.label}
            </span>
          )}
          {response && (
            <>
              <button
                style={styles.btnCopy}
                onClick={handleCopy}
                onMouseEnter={(e) => { e.target.style.borderColor = 'var(--orange)'; e.target.style.color = 'var(--orange)' }}
                onMouseLeave={(e) => { e.target.style.borderColor = 'var(--gray-dark)'; e.target.style.color = 'var(--gray)' }}
              >
                {copied ? '✓ COPIED' : 'COPY'}
              </button>
              <button
                style={styles.btnDownload}
                onClick={handleDownload}
                onMouseEnter={(e) => { e.target.style.borderColor = 'var(--orange)'; e.target.style.color = 'var(--orange)' }}
                onMouseLeave={(e) => { e.target.style.borderColor = 'var(--navy-light)'; e.target.style.color = 'var(--gray)' }}
              >
                ↓ SAVE
              </button>
            </>
          )}
        </div>
      </div>

      <div style={styles.output}>
        {isLoading && (
          <div style={styles.loadingSpinner}>
            <div style={{ animation: 'spin 1s linear infinite', fontSize: '1.5rem' }}>🔄</div>
            <span>VALIDATING SCHEMA...</span>
            <span style={{ color: 'var(--gray)', fontSize: '0.7rem' }}>Dispatched to NERIS API</span>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {!isLoading && error && (
          <div style={{ color: 'var(--red-bright)' }}>
            <div style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', fontSize: '0.9rem' }}>
              ✖ REQUEST FAILED
            </div>
            <div style={{ color: 'var(--gray)', marginBottom: '0.75rem', fontSize: '0.72rem' }}>Status: {error.status}</div>
            <div style={{ whiteSpace: 'pre-wrap', color: 'var(--red-bright)' }}>{error.message}</div>
          </div>
        )}

        {!isLoading && !error && !response && (
          <div style={styles.emptyState}>
            <span style={{ fontSize: '2rem' }}>📡</span>
            <span>Awaiting dispatch</span>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>SUBMIT A JSON PAYLOAD TO BEGIN</span>
          </div>
        )}

        {!isLoading && !error && response && (
          <div
            style={{ color: 'var(--white)' }}
            dangerouslySetInnerHTML={{ __html: colorizeJson(response) }}
          />
        )}
      </div>
    </div>
  )
}
