import { motion } from 'framer-motion';

interface Props {
  state: Record<string, any>;
}

export default function TokenBucketViz({ state }: Props) {
  const tokens = state.tokens ?? 0;
  const capacity = state.capacity ?? 10;
  const refillRate = state.refillRate ?? 2;
  const fillPercent = Math.min(100, (tokens / capacity) * 100);

  return (
    <div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '24px', textAlign: 'center' }}>
        Token Bucket Visualization
      </h3>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '48px' }}>
        {/* Bucket visual */}
        <div style={{ position: 'relative', width: '180px', height: '260px' }}>
          {/* Bucket outline */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: '10px',
            right: '10px',
            height: '220px',
            borderRadius: '0 0 24px 24px',
            border: '3px solid rgba(108, 92, 231, 0.4)',
            borderTop: 'none',
            overflow: 'hidden',
          }}>
            {/* Water fill */}
            <motion.div
              animate={{ height: `${fillPercent}%` }}
              transition={{ type: 'spring', stiffness: 80, damping: 15 }}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: `linear-gradient(180deg,
                  rgba(108, 92, 231, 0.6) 0%,
                  rgba(168, 85, 247, 0.4) 50%,
                  rgba(108, 92, 231, 0.8) 100%)`,
                borderRadius: '0 0 21px 21px',
              }}
            >
              {/* Ripple effect */}
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'rgba(255,255,255,0.3)',
                  borderRadius: '2px',
                }}
              />
            </motion.div>
          </div>

          {/* Bucket top rim */}
          <div style={{
            position: 'absolute',
            top: '38px',
            left: '0',
            right: '0',
            height: '8px',
            background: 'rgba(108, 92, 231, 0.5)',
            borderRadius: '4px',
          }} />

          {/* Refill drops */}
          <motion.div
            animate={{ y: [0, 30], opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1 / refillRate }}
            style={{
              position: 'absolute',
              top: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '8px',
              height: '12px',
              borderRadius: '50% 50% 50% 50%',
              background: 'var(--accent-primary)',
            }}
          />
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '16px 24px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Tokens</div>
            <motion.div
              key={tokens}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)' }}
            >
              {tokens}
            </motion.div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>of {capacity}</div>
          </div>

          <div className="glass-card" style={{ padding: '16px 24px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Refill Rate</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--success)' }}>
              {refillRate}/sec
            </div>
          </div>

          <div className="glass-card" style={{ padding: '16px 24px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Fill Level</div>
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
                  background: fillPercent > 30 ? 'var(--success)' : fillPercent > 10 ? 'var(--warning)' : 'var(--danger)',
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
