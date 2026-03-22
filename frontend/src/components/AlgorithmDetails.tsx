import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { algorithmDetailsData } from '../data/algorithmDetails';

interface AlgorithmDetailsProps {
  algorithmId: string;
}

export default function AlgorithmDetails({ algorithmId }: AlgorithmDetailsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'proscons' | 'usecases'>('overview');
  const data = algorithmDetailsData[algorithmId];

  if (!data) return null;

  const tabs = [
    { id: 'overview', label: '📖 Overview' },
    { id: 'proscons', label: '⚖️ Pros & Cons' },
    { id: 'usecases', label: '🎯 Use Cases' },
  ];

  return (
    <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
      {/* Tabs Header */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        overflowX: 'auto'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'overview' | 'proscons' | 'usecases')}
            style={{
              flex: 1,
              padding: '16px 24px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ padding: '32px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <div>
                <h4 style={{ color: 'var(--accent-primary)', marginBottom: '12px', fontWeight: 600 }}>Visual Explanation</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                  {data.visualExplanation}
                </p>

                <h4 style={{ color: 'var(--accent-primary)', marginBottom: '12px', fontWeight: 600 }}>How it Works (Step-by-Step)</h4>
                <ol style={{ 
                  color: 'var(--text-secondary)', 
                  lineHeight: 1.6, 
                  paddingLeft: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {data.howItWorks.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {activeTab === 'proscons' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <div style={{ background: 'rgba(0, 255, 136, 0.05)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(0, 255, 136, 0.1)' }}>
                  <h4 style={{ color: '#00d4aa', marginBottom: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ✅ Pros
                  </h4>
                  <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {data.pros.map((pro, i) => <li key={i}>{pro}</li>)}
                  </ul>
                </div>
                <div style={{ background: 'rgba(255, 71, 87, 0.05)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255, 71, 87, 0.1)' }}>
                  <h4 style={{ color: '#ff4757', marginBottom: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ❌ Cons
                  </h4>
                  <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {data.cons.map((con, i) => <li key={i}>{con}</li>)}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'usecases' && (
              <div>
                <h4 style={{ color: 'var(--accent-primary)', marginBottom: '12px', fontWeight: 600 }}>Industry Use Cases</h4>
                <ul style={{ 
                  color: 'var(--text-secondary)', 
                  lineHeight: 1.6, 
                  paddingLeft: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginBottom: '24px',
                  listStyleType: 'disc'
                }}>
                  {data.useCases.map((useCase, i) => (
                    <li key={i}>{useCase}</li>
                  ))}
                </ul>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px' }}>
                    <h5 style={{ color: '#fff', marginBottom: '8px', fontWeight: 600 }}>When to use</h5>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>{data.whenToUse}</p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px' }}>
                    <h5 style={{ color: '#fff', marginBottom: '8px', fontWeight: 600 }}>When NOT to use</h5>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>{data.whenNotToUse}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
