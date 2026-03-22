import { motion, AnimatePresence } from 'framer-motion';
import { algorithmDetailsData } from '../data/algorithmDetails';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  algorithmId: string;
}

export default function InfoModal({ isOpen, onClose, algorithmId }: InfoModalProps) {
  const data = algorithmDetailsData[algorithmId];

  return (
    <AnimatePresence>
      {isOpen && data && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass-card"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1001,
              width: '90%',
              maxWidth: '500px',
              padding: '32px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{data.name}</h3>
              <button 
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  lineHeight: 1,
                  padding: '4px',
                }}
              >
                ×
              </button>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '1rem' }}>
              {data.shortSummary}
            </p>
            
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-primary" onClick={onClose} style={{ padding: '8px 20px' }}>
                Got it
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
