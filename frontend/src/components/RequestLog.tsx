import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

export default function RequestLog() {
  const currentState = useStore((s) => s.currentState);
  const logs = currentState?.recentLogs || [];

  return (
    <div style={{
      maxHeight: '320px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    }}>
      <AnimatePresence initial={false}>
        {logs.map((log, i) => (
          <motion.div
            key={`${log.timestamp}-${i}`}
            initial={{ opacity: 0, x: 20, height: 0 }}
            animate={{ opacity: 1, x: 0, height: 'auto' }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              background: log.accepted
                ? 'rgba(0, 212, 170, 0.06)'
                : 'rgba(255, 107, 107, 0.06)',
              borderRadius: '8px',
              borderLeft: `3px solid ${log.accepted ? 'var(--success)' : 'var(--danger)'}`,
            }}
          >
            <span style={{
              fontSize: '0.65rem',
              color: 'var(--text-secondary)',
              fontFamily: 'monospace',
              flexShrink: 0,
            }}>
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            <span className={log.accepted ? 'badge-accepted' : 'badge-rejected'}
              style={{ flexShrink: 0 }}>
              {log.accepted ? '✓' : '✗'}
            </span>
            <span style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {log.detail}
            </span>
            {log.username && (
              <span style={{
                fontSize: '0.65rem',
                color: 'var(--accent-primary)',
                marginLeft: 'auto',
                flexShrink: 0,
              }}>
                @{log.username}
              </span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {logs.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: 'var(--text-secondary)',
          fontSize: '0.85rem',
        }}>
          No requests yet. Send a request to get started!
        </div>
      )}
    </div>
  );
}
