import React from 'react'

const stages = [
  { id: 'client',    label: 'CLIENT',     icon: '💻' },
  { id: 'api',       label: 'API SVC',    icon: '🔌' },
  { id: 'validate',  label: 'VALIDATOR',  icon: '🛡' },
  { id: 'prompt',    label: 'PROMPT BLD', icon: '📝' },
  { id: 'llm',       label: 'LLAMA 3.2',  icon: '🦙' },
  { id: 'enforce',   label: 'JSON ENF',   icon: '⚙️' },
  { id: 'response',  label: 'RESPONSE',   icon: '✅' },
]

const styles = {
  wrapper: {
    background: 'var(--navy)',
    borderBottom: '1px solid var(--navy-mid)',
    padding: '8px 2rem',
    overflowX: 'auto',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '0',
    minWidth: 'max-content',
  },
  stage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  stageInner: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    border: '1px solid var(--navy-mid)',
    borderRadius: '3px',
    background: 'rgba(13,27,42,0.6)',
  },
  stageIcon: {
    fontSize: '0.75rem',
  },
  stageLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.58rem',
    letterSpacing: '0.1em',
    color: 'var(--gray)',
    textTransform: 'uppercase',
  },
  arrow: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    color: 'var(--orange)',
    padding: '0 4px',
    opacity: 0.5,
  },
  legend: {
    display: 'flex',
    gap: '1.2rem',
    alignItems: 'center',
    marginTop: '0',
    paddingTop: '6px',
    borderTop: '1px solid var(--navy-mid)',
    marginLeft: 'auto',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.55rem',
    letterSpacing: '0.08em',
    color: 'var(--gray-dark)',
    textTransform: 'uppercase',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
}

export default function PipelineStatus() {
  return (
    <div style={styles.wrapper}>
      <div style={styles.row}>
        {stages.map((s, i) => (
          <React.Fragment key={s.id}>
            <div style={styles.stage}>
              <div style={styles.stageInner}>
                <span style={styles.stageIcon}>{s.icon}</span>
                <span style={styles.stageLabel}>{s.label}</span>
              </div>
            </div>
            {i < stages.length - 1 && <span style={styles.arrow}>──▶</span>}
          </React.Fragment>
        ))}

        <div style={styles.legend}>
          <div style={styles.legendItem}>
            <div style={{ ...styles.dot, background: 'var(--success)' }} />
            Valid Path
          </div>
          <div style={styles.legendItem}>
            <div style={{ ...styles.dot, background: 'var(--red)' }} />
            Error Path
          </div>
          <div style={styles.legendItem}>
            <div style={{ ...styles.dot, background: 'var(--orange)' }} />
            Retry Loop
          </div>
        </div>
      </div>
    </div>
  )
}
