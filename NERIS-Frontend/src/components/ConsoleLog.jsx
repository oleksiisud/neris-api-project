import React, { useEffect, useRef } from 'react'

const LOG_COLORS = {
  info:    'var(--gray)',
  success: 'var(--success)',
  warn:    'var(--amber)',
  error:   'var(--red-bright)',
}

const LOG_PREFIX = {
  info:    '[INFO]   ',
  success: '[OK]     ',
  warn:    '[WARN]   ',
  error:   '[ERROR]  ',
}

const styles = {
  panel: {
    display: 'flex',
    flexDirection: 'column',
    background: '#05090e',
    border: '1px solid var(--navy-mid)',
    borderTop: '2px solid var(--navy-light)',
    borderRadius: '4px',
    height: '200px',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 14px',
    borderBottom: '1px solid var(--navy-mid)',
    background: 'var(--navy)',
  },
  headerLabel: {
    fontFamily: 'var(--font-display)',
    fontSize: '0.8rem',
    letterSpacing: '0.18em',
    color: 'var(--gray)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  clearBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6rem',
    letterSpacing: '0.08em',
    padding: '2px 8px',
    background: 'transparent',
    border: '1px solid var(--gray-dark)',
    color: 'var(--gray-dark)',
    borderRadius: '2px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    transition: 'all 0.15s',
  },
  logScroll: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  logEntry: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    lineHeight: 1.5,
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'baseline',
  },
  timestamp: {
    color: 'var(--navy-light)',
    flexShrink: 0,
  },
  prefix: {
    flexShrink: 0,
    minWidth: '70px',
  },
  empty: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    color: 'var(--navy-light)',
    padding: '8px 0',
    letterSpacing: '0.08em',
  },
  count: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6rem',
    color: 'var(--gray-dark)',
    padding: '4px 6px',
    background: 'var(--navy-mid)',
    borderRadius: '2px',
  }
}

export default function ConsoleLog({ logs, onClear }) {
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <div style={styles.headerLabel}>
          <span>▶</span>
          <span>DEBUG CONSOLE</span>
          {logs.length > 0 && <span style={styles.count}>{logs.length}</span>}
        </div>
        <button
          style={styles.clearBtn}
          onClick={onClear}
          onMouseEnter={(e) => { e.target.style.color = 'var(--red)'; e.target.style.borderColor = 'var(--red)' }}
          onMouseLeave={(e) => { e.target.style.color = 'var(--gray-dark)'; e.target.style.borderColor = 'var(--gray-dark)' }}
        >
          CLEAR
        </button>
      </div>

      <div style={styles.logScroll}>
        {logs.length === 0 ? (
          <div style={styles.empty}>// No log entries yet — submit a payload to begin</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} style={styles.logEntry}>
              <span style={styles.timestamp}>{log.timestamp}</span>
              <span style={{ ...styles.prefix, color: LOG_COLORS[log.type] }}>
                {LOG_PREFIX[log.type]}
              </span>
              <span style={{ color: LOG_COLORS[log.type], wordBreak: 'break-all' }}>
                {log.message}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
