import { useState, useCallback } from 'react'

// Base URL — point this to your NERIS API server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export function useApi(addLog) {
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState(null)
  const [error, setError] = useState(null)

  const submitJson = useCallback(async (jsonPayload) => {
    setIsLoading(true)
    setResponse(null)
    setError(null)

    addLog(`Initiating request to ${API_BASE_URL}/validate`, 'info')
    addLog(`Payload size: ${new Blob([jsonPayload]).size} bytes`, 'info')

    try {
      // Parse first to validate JSON client-side
      const parsed = JSON.parse(jsonPayload)
      addLog('Client-side JSON parse: OK', 'success')

      const startTime = performance.now()

      const res = await fetch(`${API_BASE_URL}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(parsed),
      })

      const elapsed = (performance.now() - startTime).toFixed(0)
      addLog(`HTTP ${res.status} ${res.statusText} — ${elapsed}ms`, res.ok ? 'success' : 'error')

      const contentType = res.headers.get('content-type') || ''

      if (!res.ok) {
        const errText = await res.text()
        addLog(`Server error body: ${errText}`, 'error')
        setError({ status: res.status, message: errText })
        return
      }

      if (contentType.includes('application/json')) {
        const data = await res.json()
        addLog('Response parsed as JSON successfully', 'success')
        addLog(`Response keys: ${Object.keys(data).join(', ')}`, 'info')
        setResponse(JSON.stringify(data, null, 2))
      } else {
        const text = await res.text()
        addLog('Response is plain text (not JSON)', 'warn')
        setResponse(text)
      }

    } catch (err) {
      if (err instanceof SyntaxError) {
        addLog(`JSON parse error: ${err.message}`, 'error')
        setError({ status: 400, message: `Invalid JSON: ${err.message}` })
      } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
        addLog(`Network error — is the API server running at ${API_BASE_URL}?`, 'error')
        setError({ status: 0, message: 'Network error: Could not connect to server.' })
      } else {
        addLog(`Unexpected error: ${err.message}`, 'error')
        setError({ status: -1, message: err.message })
      }
    } finally {
      setIsLoading(false)
      addLog('Request cycle complete.', 'info')
    }
  }, [addLog])

  return { isLoading, response, error, submitJson }
}
