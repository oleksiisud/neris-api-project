import { useState, useCallback, useRef } from 'react'

export function useConsoleLog() {
  const [logs, setLogs] = useState([])
  const idRef = useRef(0)

  const addLog = useCallback((message, type = 'info') => {
    const id = idRef.current++
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false })
    setLogs(prev => [...prev, { id, message, type, timestamp }])
  }, [])

  const clearLogs = useCallback(() => setLogs([]), [])

  return { logs, addLog, clearLogs }
}
