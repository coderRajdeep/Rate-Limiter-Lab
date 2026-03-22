import { motion } from 'framer-motion';

interface Props {
  state: Record<string, any>;
}

export default function SlidingWindowCounterViz({ state }: Props) {
  const currentWindowCount = state.currentWindowCount ?? 0;
  const previousWindowCount = state.previousWindowCount ?? 0;
  const effectiveCount = state.effectiveCount ?? 0;
  const maxRequests = state.maxRequests ?? 10;
  const windowSizeMs = state.windowSizeMs ?? 10000;
  const windowElapsedMs = state.windowElapsedMs ?? 0;

  const windowSizeSec = windowSizeMs / 1000;
  const elapsedRatio = Math.min(1, windowElapsedMs / windowSizeMs);
  const prevWeight = (1 - elapsedRatio);
  const effectivePercent = (effectiveCount / maxRequests) * 100;

  return (
    <div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '24px', textAlign: 'center' }}>
        Sliding Window Counter Visualization
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '520px', margin: '0 auto' }}>
        {/* Two overlapping windows */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Window Overlap</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
              {(elapsedRatio * 100).toFixed(0)}% into current window
            </span>
          </div>

          {/* Previous window */}
          <div style={{ position: 'relative', marginBottom: '8px' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Previous Window (weight: {(prevWeight * 100).toFixed(0)}%)
            </div>
            <div style={{
              height: '36px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '10px',
              border: '1px solid rgba(225, 112, 85, 0.3)',
              overflow: 'hidden',
              position: 'relative',
            }}>
              <motion.div
                animate={{ width: `${(previousWindowCount / maxRequests) * 100}%`, opacity: prevWeight }}
                transition={{ type: 'spring', stiffness: 80 }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, rgba(225, 112, 85, 0.4), rgba(225, 112, 85, 0.6))',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '12px',
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'white' }}>
                  {previousWindowCount}
                </span>
              </motion.div>
            </div>
          </div>

          {/* Current window */}
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Current Window ({(windowElapsedMs / 1000).toFixed(1)}s / {windowSizeSec}s)
            </div>
            <div style={{
              height: '36px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '10px',
              border: '1px solid rgba(253, 203, 110, 0.3)',
              overflow: 'hidden',
              position: 'relative',
            }}>
              <motion.div
                animate={{ width: `${(currentWindowCount / maxRequests) * 100}%` }}
                transition={{ type: 'spring', stiffness: 80 }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, rgba(253, 203, 110, 0.4), rgba(243, 156, 18, 0.6))',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '12px',
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'white' }}>
                  {currentWindowCount}
                </span>
              </motion.div>

              {/* Time progress indicator */}
              <motion.div
                animate={{ left: `${elapsedRatio * 100}%` }}
                transition={{ duration: 0.3 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  width: '2px',
                  background: 'var(--accent-primary)',
                  boxShadow: '0 0 6px var(--accent-primary)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Weighted calculation display */}
        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Weighted Calculation
          </div>
          <div style={{
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            color: 'var(--text-primary)',
            lineHeight: 1.8,
          }}>
            <span style={{ color: '#e17055' }}>{previousWindowCount}</span>
            <span style={{ color: 'var(--text-secondary)' }}> × </span>
            <span style={{ color: '#e17055' }}>{prevWeight.toFixed(2)}</span>
            <span style={{ color: 'var(--text-secondary)' }}> + </span>
            <span style={{ color: '#fdcb6e' }}>{currentWindowCount}</span>
            <span style={{ color: 'var(--text-secondary)' }}> = </span>
            <motion.span
              key={effectiveCount}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              style={{
                color: effectiveCount >= maxRequests ? 'var(--danger)' : 'var(--success)',
                fontWeight: 700,
                fontSize: '1.1rem',
              }}
            >
              {effectiveCount}
            </motion.span>
            <span style={{ color: 'var(--text-secondary)' }}> / {maxRequests}</span>
          </div>
        </div>

        {/* Effective count bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Effective Rate</span>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: effectivePercent >= 100 ? 'var(--danger)' : 'var(--success)',
            }}>
              {effectiveCount}/{maxRequests}
            </span>
          </div>
          <div style={{
            height: '12px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '6px',
            overflow: 'hidden',
          }}>
            <motion.div
              animate={{ width: `${Math.min(100, effectivePercent)}%` }}
              transition={{ type: 'spring', stiffness: 80 }}
              style={{
                height: '100%',
                background: effectivePercent >= 100
                  ? 'linear-gradient(90deg, var(--danger), #ee5a24)'
                  : 'linear-gradient(90deg, var(--success), #00b894)',
                borderRadius: '6px',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
