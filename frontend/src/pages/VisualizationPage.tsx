import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { algorithmApi } from '../services/api';
import { useStore } from '../store/useStore';
import { useWebSocket } from '../hooks/useWebSocket';
import ControlPanel from '../components/ControlPanel';
import RequestLog from '../components/RequestLog';
import StatsGraph from '../components/StatsGraph';
import TokenBucketViz from '../components/TokenBucketViz';
import LeakyBucketViz from '../components/LeakyBucketViz';
import FixedWindowViz from '../components/FixedWindowViz';
import SlidingWindowLogViz from '../components/SlidingWindowLogViz';
import SlidingWindowCounterViz from '../components/SlidingWindowCounterViz';
import AlgorithmDetails from '../components/AlgorithmDetails';

const vizComponents: Record<string, React.FC<{ state: Record<string, any> }>> = {
  'token-bucket': TokenBucketViz,
  'leaky-bucket': LeakyBucketViz,
  'fixed-window': FixedWindowViz,
  'sliding-window-log': SlidingWindowLogViz,
  'sliding-window-counter': SlidingWindowCounterViz,
};

const algorithmTitles: Record<string, string> = {
  'token-bucket': '🪣 Token Bucket',
  'leaky-bucket': '🚰 Leaky Bucket',
  'fixed-window': '🪟 Fixed Window Counter',
  'sliding-window-log': '📜 Sliding Window Log',
  'sliding-window-counter': '📊 Sliding Window Counter',
};

export default function VisualizationPage() {
  const { algorithmName } = useParams<{ algorithmName: string }>();
  const navigate = useNavigate();
  const { currentState, setCurrentState, isSimulating, simulationSpeed, clearStats } = useStore();
  const simulationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  useWebSocket(algorithmName);

  // Fetch initial state
  useEffect(() => {
    if (algorithmName) {
      clearStats();
      algorithmApi.getState(algorithmName).then((res) => setCurrentState(res.data)).catch(console.error);
    }
    return () => {
      if (simulationRef.current) clearInterval(simulationRef.current);
    };
  }, [algorithmName, setCurrentState, clearStats]);

  // Auto-simulation loop
  useEffect(() => {
    if (simulationRef.current) clearInterval(simulationRef.current);
    if (isSimulating && algorithmName) {
      const interval = 1000 / simulationSpeed;
      simulationRef.current = setInterval(() => {
        algorithmApi.simulate(algorithmName, 1).catch(console.error);
      }, interval);
    }
    return () => {
      if (simulationRef.current) clearInterval(simulationRef.current);
    };
  }, [isSimulating, simulationSpeed, algorithmName]);

  const VizComponent = algorithmName ? vizComponents[algorithmName] : null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top left, #111128 0%, #0a0a1a 60%)',
      padding: '24px 20px',
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
      }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            ← Back
          </button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {algorithmTitles[algorithmName || ''] || algorithmName}
          </h1>
        </motion.div>

        {/* Stats summary */}
        {currentState && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', gap: '16px' }}
          >
            <div className="glass-card" style={{ padding: '10px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Accepted</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--success)' }}>{currentState.acceptedCount}</div>
            </div>
            <div className="glass-card" style={{ padding: '10px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rejected</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--danger)' }}>{currentState.rejectedCount}</div>
            </div>
            <div className="glass-card" style={{ padding: '10px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{currentState.totalRequests}</div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Main content grid */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 350px',
        gap: '24px',
      }}>
        {/* Left: Visualization + Graph */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
            style={{ padding: '32px', minHeight: '350px' }}
          >
            {VizComponent && currentState?.algorithmState ? (
              <VizComponent state={currentState.algorithmState} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                Loading visualization...
              </div>
            )}
          </motion.div>

          {/* Graph */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card"
            style={{ padding: '24px' }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>📈 Request Statistics</h3>
            <StatsGraph />
          </motion.div>
        </div>

        {/* Right sidebar: Controls + Log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card"
            style={{ padding: '24px' }}
          >
            <ControlPanel algorithmName={algorithmName || ''} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card"
            style={{ padding: '24px', flex: 1, maxHeight: '400px', overflow: 'hidden' }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>📋 Request Log</h3>
            <RequestLog />
          </motion.div>
        </div>
      </div>

      {/* Algorithm Details Collapsible Section */}
      {algorithmName && (
        <div style={{ maxWidth: '1400px', margin: '32px auto 0' }}>
          <button
            onClick={() => setDetailsExpanded(!detailsExpanded)}
            className="glass-card"
            style={{
              width: '100%',
              padding: '20px 32px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              border: 'none',
              background: 'rgba(255,255,255,0.03)',
              textAlign: 'left',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.2rem' }}>📘</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>Algorithm Details</span>
            </div>
            <motion.div
              animate={{ rotate: detailsExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              style={{ color: 'var(--accent-primary)', fontSize: '1.2rem' }}
            >
              ▼
            </motion.div>
          </button>

          <AnimatePresence>
            {detailsExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ paddingTop: '24px' }}>
                  <AlgorithmDetails algorithmId={algorithmName} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
