import { motion } from 'framer-motion';

interface Props {
  state: Record<string, any>;
}

export default function SlidingWindowLogViz({ state }: Props) {
  const currentCount = state.currentCount ?? 0;
  const maxRequests = state.maxRequests ?? 10;
  const windowSizeMs = state.windowSizeMs ?? 10000;
  const timestamps: number[] = state.timestamps ?? [];
  const windowSizeSec = windowSizeMs / 1000;
  const fillPercent = (currentCount / maxRequests) * 100;

  return (
    <div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '24px', textAlign: 'center' }}>
        Sliding Window Log Visualization
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '550px', margin: '0 auto' }}>
        {/* Timeline */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sliding Window ({windowSizeSec}s)</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
              {currentCount} requests in window
            </span>
          </div>

          {/* Timeline bar */}
          <div style={{
            position: 'relative',
            height: '80px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden',
            padding: '8px',
          }}>
            {/* Time labels */}
            <div style={{
              position: 'absolute',
              bottom: '4px',
              left: '12px',
              right: '12px',
              display: 'flex',
              justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>-{windowSizeSec}s</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>now</span>
            </div>

            {/* Request dots on timeline */}
            {timestamps.map((secAgo, i) => {
              const position = Math.max(0, Math.min(100, (1 - secAgo / windowSizeSec) * 100));
              return (
                <motion.div
                  key={i}
                  initial={{ scale: 0, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  style={{
                    position: 'absolute',
                    left: `${position}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: 'var(--accent-primary)',
                    boxShadow: '0 0 8px rgba(108, 92, 231, 0.5)',
                  }}
                />
              );
            })}

            {/* Moving window edge indicator */}
            <motion.div
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '2px',
                background: 'var(--danger)',
              }}
            />
          </div>
        </div>

        {/* Capacity bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Capacity Usage</span>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: fillPercent >= 100 ? 'var(--danger)' : 'var(--success)',
            }}>
              {currentCount}/{maxRequests}
            </span>
          </div>
          <div style={{
            height: '12px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '6px',
            overflow: 'hidden',
          }}>
            <motion.div
              animate={{ width: `${Math.min(100, fillPercent)}%` }}
              transition={{ type: 'spring', stiffness: 80 }}
              style={{
                height: '100%',
                background: fillPercent >= 100
                  ? 'linear-gradient(90deg, var(--danger), #ee5a24)'
                  : fillPercent >= 70
                    ? 'linear-gradient(90deg, var(--warning), #f39c12)'
                    : 'linear-gradient(90deg, var(--success), #00b894)',
                borderRadius: '6px',
              }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <div className="glass-card" style={{ padding: '12px 20px', textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>In Window</div>
            <motion.div
              key={currentCount}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)' }}
            >
              {currentCount}
            </motion.div>
          </div>
          <div className="glass-card" style={{ padding: '12px 20px', textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Available</div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: maxRequests - currentCount > 0 ? 'var(--success)' : 'var(--danger)',
            }}>
              {Math.max(0, maxRequests - currentCount)}
            </div>
          </div>
          <div className="glass-card" style={{ padding: '12px 20px', textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Status</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '4px' }}>
              {currentCount >= maxRequests ? '🔴 Full' : '🟢 Open'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
