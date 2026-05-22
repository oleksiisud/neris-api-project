import React, { useState, useCallback } from 'react'
import Header from './components/Header.jsx'
import PipelineStatus from './components/PipelineStatus.jsx'
import JsonInput from './components/JsonInput.jsx'
import JsonOutput from './components/JsonOutput.jsx'
import ConsoleLog from './components/ConsoleLog.jsx'
import ConfigModal from './components/ConfigModal.jsx'
import { useConsoleLog } from './hooks/useConsoleLog.js'

const DEFAULT_CONFIG = {
  baseUrl: import.meta.env.NERIS_API,
  endpoint: '/validate',
  timeout: 300000,
}

const styles = {
  app: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    background: `
      radial-gradient(ellipse at 80% 0%, rgba(192,57,43,0.06) 0%, transparent 60%),
      radial-gradient(ellipse at 10% 90%, rgba(13,27,42,0.8) 0%, transparent 70%),
      var(--black)
    `,
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 2rem',
    borderBottom: '1px solid var(--navy-mid)',
    background: 'rgba(13,27,42,0.5)',
  },
  toolbarLeft: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    letterSpacing: '0.1em',
    color: 'var(--gray-dark)',
    textTransform: 'uppercase',
  },
  toolbarRight: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  configBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.68rem',
    letterSpacing: '0.1em',
    padding: '5px 14px',
    background: 'transparent',
    border: '1px solid var(--navy-light)',
    color: 'var(--gray)',
    borderRadius: '3px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    transition: 'all 0.15s',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  endpointDisplay: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    color: 'var(--navy-light)',
    padding: '4px 10px',
    background: 'rgba(13,27,42,0.8)',
    border: '1px solid var(--navy-mid)',
    borderRadius: '3px',
    letterSpacing: '0.05em',
  },
  main: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr',
    gap: '1px',
    background: 'var(--navy-mid)',
  },
  pane: {
    background: 'var(--black)',
    padding: '1.25rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '500px',
  },
  bottom: {
    padding: '0 1.5rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
}

export default function App() {
  const { logs, addLog, clearLogs } = useConsoleLog()
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [configOpen, setConfigOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = useCallback(async (jsonPayload) => {
    setIsLoading(true)
    setResponse(null)
    setError(null)

    const url = `${config.baseUrl}${config.endpoint}`
    addLog(`Initiating POST → ${url}`, 'info')
    addLog(`Payload size: ${new Blob([jsonPayload]).size} bytes`, 'info')

    try {
      const parsed = JSON.parse(jsonPayload)
      addLog('Client-side JSON parse: OK ✓', 'success')

      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), config.timeout)

      const startTime = performance.now()

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(parsed),
        signal: controller.signal,
      })

      clearTimeout(timer)
      const elapsed = (performance.now() - startTime).toFixed(0)
      addLog(`HTTP ${res.status} ${res.statusText} — ${elapsed}ms`, res.ok ? 'success' : 'error')

      const contentType = res.headers.get('content-type') || ''

      if (!res.ok) {
        const errText = await res.text()
        addLog(`Server response body: ${errText}`, 'error')
        setError({ status: res.status, message: errText })
        return
      }

      if (contentType.includes('application/json')) {
        const data = await res.json()
        addLog('Response deserialized as JSON ✓', 'success')
        addLog(`Top-level keys: [${Object.keys(data).join(', ')}]`, 'info')

        // Log any validation errors from the response body
        if (data.errors || data.validation_errors) {
          const errs = data.errors || data.validation_errors
          addLog(`Validation errors found: ${JSON.stringify(errs).slice(0, 200)}`, 'warn')
        }
        if (data.proposed_changes) {
          addLog('Proposed changes included in response ✓', 'success')
        }

        setResponse(JSON.stringify(data, null, 2))
      } else {
        const text = await res.text()
        addLog('Response is plain text (not JSON)', 'warn')
        setResponse(text)
      }

    } catch (err) {
      if (err.name === 'AbortError') {
        addLog(`Request timed out after ${config.timeout}ms`, 'error')
        setError({ status: 408, message: `Request timed out after ${config.timeout}ms. The LLM inference may need more time — try increasing the timeout in config.` })
      } else if (err instanceof SyntaxError) {
        addLog(`JSON parse error: ${err.message}`, 'error')
        setError({ status: 400, message: `Invalid JSON: ${err.message}` })
      } else if (err.name === 'TypeError') {
        addLog(`Network error — cannot reach ${config.baseUrl}`, 'error')
        addLog('Check that the API server is running and CORS is configured', 'warn')
        setError({ status: 0, message: `Network error: Could not connect to ${config.baseUrl}.\n\nVerify the server is running and accessible.` })
      } else {
        addLog(`Unexpected error: ${err.message}`, 'error')
        setError({ status: -1, message: err.message })
      }
    } finally {
      setIsLoading(false)
      addLog('── Request cycle complete ──', 'info')
    }
  }, [config, addLog])

  return (
    <div style={styles.app}>
      <Header />
      <PipelineStatus />

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.toolbarLeft}>
          Schema Validation · AWS EC2 · Docker · llama.cpp
        </div>
        <div style={styles.toolbarRight}>
          <div style={styles.endpointDisplay}>
            POST {config.baseUrl}{config.endpoint}
          </div>
          <button
            style={styles.configBtn}
            onClick={() => setConfigOpen(true)}
            onMouseEnter={(e) => { e.target.style.borderColor = 'var(--orange)'; e.target.style.color = 'var(--orange)' }}
            onMouseLeave={(e) => { e.target.style.borderColor = 'var(--navy-light)'; e.target.style.color = 'var(--gray)' }}
          >
            ⚙ CONFIG
          </button>
        </div>
      </div>

      {/* Main split panels */}
      <div style={styles.main}>
        <div style={styles.pane}>
          <JsonInput onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
        <div style={styles.pane}>
          <JsonOutput response={response} error={error} isLoading={isLoading} />
        </div>
      </div>

      {/* Console */}
      <div style={styles.bottom}>
        <ConsoleLog logs={logs} onClear={clearLogs} />
      </div>

      <ConfigModal
        isOpen={configOpen}
        onClose={() => setConfigOpen(false)}
        config={config}
        onSave={setConfig}
      />
    </div>
  )
}
