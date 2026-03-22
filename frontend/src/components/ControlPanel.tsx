import { useState } from 'react';
import { motion } from 'framer-motion';
import { algorithmApi } from '../services/api';
import { useStore } from '../store/useStore';

interface Props {
  algorithmName: string;
}

export default function ControlPanel({ algorithmName }: Props) {
  const { isSimulating, setSimulating, simulationSpeed, setSimulationSpeed } = useStore();
  const [capacity, setCapacity] = useState(10);
  const [rate, setRate] = useState(2);
  const [windowSize, setWindowSize] = useState(10);
  const [burstCount, setBurstCount] = useState(5);

  const isBucketType = algorithmName.includes('bucket');
  const isWindowType = algorithmName.includes('window');

  const handleSendRequest = () => {
    algorithmApi.simulate(algorithmName, 1).catch(console.error);
  };

  const handleSendBurst = () => {
    algorithmApi.simulate(algorithmName, burstCount).catch(console.error);
  };

  const handleReset = () => {
    algorithmApi.reset(algorithmName).catch(console.error);
  };

  const handleUpdateConfig = () => {
    const params: Record<string, any> = {};
    if (isBucketType) {
      params.capacity = capacity;
      if (algorithmName === 'token-bucket') params.refillRate = rate;
      if (algorithmName === 'leaky-bucket') params.leakRate = rate;
    }
    if (isWindowType) {
      params.maxRequests = capacity;
      params.windowSizeMs = windowSize * 1000;
    }
    algorithmApi.updateConfig(algorithmName, params).catch(console.error);
  };

  return (
    <div>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '20px' }}>🎛️ Controls</h3>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="btn-primary"
          onClick={handleSendRequest}
          style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
        >
          Send Request
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="btn-success"
          onClick={handleSendBurst}
          style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
        >
          Burst ×{burstCount}
        </motion.button>
      </div>

      {/* Burst count slider */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Burst Count</label>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{burstCount}</span>
        </div>
        <input
          type="range"
          min="2"
          max="30"
          value={burstCount}
          onChange={(e) => setBurstCount(Number(e.target.value))}
        />
      </div>

      {/* Play/Pause */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        alignItems: 'center',
      }}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className={isSimulating ? 'btn-danger' : 'btn-secondary'}
          onClick={() => setSimulating(!isSimulating)}
          style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
        >
          {isSimulating ? '⏸ Pause' : '▶ Play'}
        </motion.button>
      </div>

      {/* Speed control */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Speed</label>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{simulationSpeed}x</span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[1, 2, 5, 10].map((speed) => (
            <button
              key={speed}
              onClick={() => setSimulationSpeed(speed)}
              style={{
                flex: 1,
                padding: '6px',
                borderRadius: '8px',
                border: `1px solid ${simulationSpeed === speed ? 'var(--accent-primary)' : 'var(--border-glass)'}`,
                background: simulationSpeed === speed ? 'rgba(108,92,231,0.2)' : 'transparent',
                color: simulationSpeed === speed ? 'var(--accent-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-glass)', margin: '20px 0', paddingTop: '20px' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-secondary)' }}>
          ⚙️ Parameters
        </h4>

        {/* Capacity / Max Requests */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {isBucketType ? 'Capacity' : 'Max Requests'}
            </label>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{capacity}</span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
          />
        </div>

        {/* Rate (for bucket types) */}
        {isBucketType && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {algorithmName === 'token-bucket' ? 'Refill Rate' : 'Leak Rate'} (per sec)
              </label>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{rate}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="20"
              step="0.5"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
            />
          </div>
        )}

        {/* Window size (for window types) */}
        {isWindowType && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Window Size (sec)</label>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{windowSize}s</span>
            </div>
            <input
              type="range"
              min="2"
              max="30"
              value={windowSize}
              onChange={(e) => setWindowSize(Number(e.target.value))}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="btn-primary"
            onClick={handleUpdateConfig}
            style={{ flex: 1, padding: '8px', fontSize: '0.82rem' }}
          >
            Apply Config
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="btn-danger"
            onClick={handleReset}
            style={{ padding: '8px 16px', fontSize: '0.82rem' }}
          >
            Reset
          </motion.button>
        </div>
      </div>
    </div>
  );
}
