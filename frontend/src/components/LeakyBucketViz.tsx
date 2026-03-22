import { motion } from 'framer-motion';

interface Props {
  state: Record<string, any>;
}

export default function LeakyBucketViz({ state }: Props) {
  const queueSize = state.queueSize ?? 0;
  const capacity = state.capacity ?? 10;
  const leakRate = state.leakRate ?? 2;
  const processedCount = state.processedCount ?? 0;
  const fillPercent = Math.min(100, (queueSize / capacity) * 100);

  return (
    <div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '24px', textAlign: 'center' }}>
        Leaky Bucket Visualization
      </h3>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '48px' }}>
        {/* Bucket with leak */}
        <div style={{ position: 'relative', width: '180px', height: '280px' }}>
          {/* Bucket */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '10px',
            right: '10px',
            height: '200px',
            borderRadius: '0 0 24px 24px',
            border: '3px solid rgba(0, 184, 148, 0.4)',
            borderTop: 'none',
            overflow: 'hidden',
          }}>
            <motion.div
              animate={{ height: `${fillPercent}%` }}
              transition={{ type: 'spring', stiffness: 80, damping: 15 }}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: `linear-gradient(180deg,
                  rgba(0, 212, 170, 0.5) 0%,
                  rgba(0, 184, 148, 0.7) 100%)`,
                borderRadius: '0 0 21px 21px',
              }}
            />

            {/* Queue items */}
            <div style={{
              position: 'absolute',
              bottom: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column-reverse',
              gap: '4px',
              alignItems: 'center',
            }}>
              {Array.from({ length: Math.min(queueSize, 8) }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.3)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Top rim */}
          <div style={{
            position: 'absolute',
            top: '18px',
            left: '0',
            right: '0',
            height: '8px',
            background: 'rgba(0, 184, 148, 0.5)',
            borderRadius: '4px',
          }} />

          {/* Leak spout */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'rgba(0, 184, 148, 0.3)',
            border: '2px solid rgba(0, 184, 148, 0.5)',
          }} />

          {/* Leak drops */}
          {queueSize > 0 && (
            <motion.div
              animate={{ y: [0, 25], opacity: [0.8, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.5 / leakRate }}
              style={{
                position: 'absolute',
                bottom: '0',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '6px',
                height: '10px',
                borderRadius: '50%',
                background: 'var(--success)',
              }}
            />
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '16px 24px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Queue</div>
            <motion.div
              key={queueSize}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}
            >
              {queueSize}
            </motion.div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>of {capacity}</div>
          </div>

          <div className="glass-card" style={{ padding: '16px 24px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Leak Rate</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
              {leakRate}/sec
            </div>
          </div>

          <div className="glass-card" style={{ padding: '16px 24px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Processed</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--success)' }}>
              {processedCount}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '16px 24px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Queue Level</div>
            <div style={{
              width: '120px',
              height: '8px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '4px',
              overflow: 'hidden',
              marginTop: '6px',
            }}>
              <motion.div
                animate={{ width: `${fillPercent}%` }}
                transition={{ type: 'spring', stiffness: 80 }}
                style={{
                  height: '100%',
                  background: fillPercent < 70 ? 'var(--success)' : fillPercent < 90 ? 'var(--warning)' : 'var(--danger)',
                  borderRadius: '4px',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
