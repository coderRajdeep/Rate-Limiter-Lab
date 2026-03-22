import { motion } from 'framer-motion';

interface Props {
  state: Record<string, any>;
}

export default function FixedWindowViz({ state }: Props) {
  const currentCount = state.currentCount ?? 0;
  const maxRequests = state.maxRequests ?? 10;
  const windowSizeMs = state.windowSizeMs ?? 10000;
  const windowElapsedMs = state.windowElapsedMs ?? 0;
  const fillPercent = (currentCount / maxRequests) * 100;
  const timePercent = Math.min(100, (windowElapsedMs / windowSizeMs) * 100);

  return (
    <div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '24px', textAlign: 'center' }}>
        Fixed Window Counter Visualization
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '500px', margin: '0 auto' }}>
        {/* Window timeline */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Window Progress</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
              {(windowElapsedMs / 1000).toFixed(1)}s / {(windowSizeMs / 1000).toFixed(0)}s
            </span>
          </div>
          <div style={{
            height: '24px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
          }}>
            <motion.div
              animate={{ width: `${timePercent}%` }}
              transition={{ duration: 0.3 }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, rgba(9, 132, 227, 0.6), rgba(116, 185, 255, 0.8))',
                borderRadius: '12px',
                position: 'relative',
              }}
            >
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: '4px',
                  background: 'white',
                  borderRadius: '2px',
                }}
              />
            </motion.div>
          </div>
        </div>

        {/* Counter visualization - blocks */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Request Slots</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              <span style={{ color: currentCount >= maxRequests ? 'var(--danger)' : 'var(--success)' }}>
                {currentCount}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}> / {maxRequests}</span>
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(maxRequests, 10)}, 1fr)`,
            gap: '6px',
          }}>
            {Array.from({ length: maxRequests }).map((_, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{
                  background: i < currentCount
                    ? 'linear-gradient(135deg, #0984e3, #74b9ff)'
                    : 'rgba(255,255,255,0.05)',
                  scale: i < currentCount ? [1, 1.1, 1] : 1,
                  borderColor: i < currentCount
                    ? 'rgba(116, 185, 255, 0.5)'
                    : 'rgba(255,255,255,0.08)',
                }}
                transition={{ duration: 0.3 }}
                style={{
                  height: '32px',
                  borderRadius: '8px',
                  border: '1px solid',
                }}
              />
            ))}
          </div>
        </div>

        {/* Status bar */}
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
        }}>
          <div className="glass-card" style={{ padding: '12px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Status</div>
            <motion.div
              key={currentCount >= maxRequests ? 'full' : 'open'}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: currentCount >= maxRequests ? 'var(--danger)' : 'var(--success)',
                marginTop: '4px',
              }}
            >
              {currentCount >= maxRequests ? '🔴 FULL' : '🟢 ACCEPTING'}
            </motion.div>
          </div>

          <div className="glass-card" style={{ padding: '12px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Remaining</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '4px' }}>
              {Math.max(0, maxRequests - currentCount)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
