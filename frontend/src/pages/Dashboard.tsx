import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { algorithmApi } from '../services/api';
import { useStore } from '../store/useStore';
import InfoModal from '../components/InfoModal';

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

const algorithmColors: Record<string, string> = {
  'token-bucket': 'linear-gradient(135deg, #6c5ce7, #a855f7)',
  'leaky-bucket': 'linear-gradient(135deg, #00b894, #00d4aa)',
  'fixed-window': 'linear-gradient(135deg, #0984e3, #74b9ff)',
  'sliding-window-log': 'linear-gradient(135deg, #e17055, #fab1a0)',
  'sliding-window-counter': 'linear-gradient(135deg, #fdcb6e, #f39c12)',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { algorithms, setAlgorithms, username, logout } = useStore();
  const [selectedAlgoId, setSelectedAlgoId] = useState<string | null>(null);

  useEffect(() => {
    algorithmApi.list().then((res) => setAlgorithms(res.data)).catch(console.error);
  }, [setAlgorithms]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top left, #111128 0%, #0a0a1a 60%)',
      padding: '40px 20px',
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '48px',
      }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
            ⚡ <span className="gradient-text">Rate Limiter</span> Lab
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Welcome, <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{username}</span>
          </p>
        </motion.div>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="btn-secondary"
          onClick={() => { logout(); navigate('/login'); }}
          style={{ fontSize: '0.85rem' }}
        >
          Sign Out
        </motion.button>
      </div>

      {/* Section Title */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 32px' }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '8px' }}
        >
          Choose an Algorithm
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}
        >
          Each algorithm visualizes a different approach to rate limiting in real-time
        </motion.p>
      </div>

      {/* Algorithm Cards Grid */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '24px',
      }}>
        {algorithms.map((algo, i) => (
          <motion.div
            key={algo.name}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="glass-card"
            onClick={() => navigate(`/visualize/${algo.name}`)}
            style={{
              padding: '32px',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Gradient accent bar */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: algorithmColors[algo.name] || 'var(--accent-gradient)',
            }} />

            {/* Info Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAlgoId(algo.name);
              }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                transition: 'all 0.2s ease',
                zIndex: 2,
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              title="Algorithm Details Summary"
            >
              ℹ️
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{
                fontSize: '2.5rem',
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '16px',
              }}>
                {algo.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{algo.displayName}</h3>
              </div>
            </div>

            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.88rem',
              lineHeight: 1.6,
              marginBottom: '20px',
            }}>
              {algo.description}
            </p>

            {/* Default params chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {Object.entries(algo.defaultParams).map(([key, val]) => (
                <span key={key} style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                }}>
                  {key}: {val}
                </span>
              ))}
            </div>

            {/* Arrow indicator */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              color: 'var(--text-secondary)',
              fontSize: '1.2rem',
              transition: 'transform 0.2s',
            }}>
              →
            </div>
          </motion.div>
        ))}
      </div>

      <InfoModal 
        isOpen={!!selectedAlgoId} 
        onClose={() => setSelectedAlgoId(null)} 
        algorithmId={selectedAlgoId || ''} 
      />
    </div>
  );
}
