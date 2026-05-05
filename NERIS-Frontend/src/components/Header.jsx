import React from 'react'

const styles = {
  header: {
    background: 'linear-gradient(90deg, var(--black) 0%, var(--navy) 60%, var(--navy-mid) 100%)',
    borderBottom: '2px solid var(--orange)',
    padding: '0 2rem',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 24px rgba(230, 126, 34, 0.15)',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  flame: {
    fontSize: '1.6rem',
    lineHeight: 1,
    animation: 'flicker 2.4s ease-in-out infinite',
  },
  titleBlock: {},
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.5rem',
    letterSpacing: '0.12em',
    color: 'var(--orange-bright)',
    lineHeight: 1,
  },
  sub: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6rem',
    letterSpacing: '0.2em',
    color: 'var(--gray)',
    textTransform: 'uppercase',
    marginTop: '2px',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  badge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    padding: '3px 10px',
    border: '1px solid var(--gray-dark)',
    borderRadius: '2px',
    color: 'var(--gray)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--success)',
    boxShadow: '0 0 6px var(--success)',
    animation: 'pulse 2s ease-in-out infinite',
  },
}

export default function Header() {
  return (
    <>
      <style>{`
        @keyframes flicker {
          0%, 100% { opacity: 1; transform: scaleY(1); }
          50% { opacity: 0.85; transform: scaleY(0.97); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 6px var(--success); }
          50% { opacity: 0.6; box-shadow: 0 0 12px var(--success); }
        }
      `}</style>
      <header style={styles.header}>
        <div style={styles.left}>
          <span style={styles.flame}>🔥</span>
          <div style={styles.titleBlock}>
            <div style={styles.title}>OPERATION SMOKEY BEAR</div>
            <div style={styles.sub}>NERIS · Schema Validation Interface</div>
          </div>
        </div>
        <div style={styles.right}>
          <span style={styles.badge}>Llama 3.2 3B</span>
          <span style={styles.badge}>llama.cpp</span>
          <div style={styles.statusDot} title="Service Online" />
        </div>
      </header>
    </>
  )
}
