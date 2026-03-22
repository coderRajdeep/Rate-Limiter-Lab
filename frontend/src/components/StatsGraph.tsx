import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useStore } from '../store/useStore';

export default function StatsGraph() {
  const statsHistory = useStore((s) => s.statsHistory);

  const data = statsHistory.map((entry, i) => ({
    index: i,
    time: new Date(entry.timestamp).toLocaleTimeString(),
    accepted: entry.accepted,
    rejected: entry.rejected,
  }));

  if (data.length < 2) {
    return (
      <div style={{
        height: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)',
        fontSize: '0.85rem',
      }}>
        Waiting for data points...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <defs>
          <linearGradient id="colorAccepted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#00d4aa" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="index" hide />
        <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} />
        <Tooltip
          contentStyle={{
            background: 'rgba(17,17,40,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '0.8rem',
          }}
        />
        <Area
          type="monotone"
          dataKey="accepted"
          stroke="#00d4aa"
          fillOpacity={1}
          fill="url(#colorAccepted)"
          strokeWidth={2}
          name="Accepted"
        />
        <Area
          type="monotone"
          dataKey="rejected"
          stroke="#ff6b6b"
          fillOpacity={1}
          fill="url(#colorRejected)"
          strokeWidth={2}
          name="Rejected"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
