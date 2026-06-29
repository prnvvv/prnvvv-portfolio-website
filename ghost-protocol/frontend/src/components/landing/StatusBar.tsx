import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getProfile } from '../../services/dataService';

const profile = getProfile();

function getZuluTime() {
  const now = new Date();
  const hh = String(now.getUTCHours()).padStart(2, '0');
  const mm = String(now.getUTCMinutes()).padStart(2, '0');
  const ss = String(now.getUTCSeconds()).padStart(2, '0');
  return `${hh}${mm}${ss}Z`;
}

function getZuluDate() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function StatusBar() {
  const [time, setTime] = useState(getZuluTime);
  const [date] = useState(getZuluDate);

  useEffect(() => {
    const iv = setInterval(() => setTime(getZuluTime()), 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 24px',
        background: 'rgba(8, 12, 9, 0.75)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 230, 122, 0.08)',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '10px',
        letterSpacing: '0.1em',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ color: '#00e67a', fontSize: 14 }}>◆</span>
        <span style={{ color: 'rgba(255, 255, 255, 0.94)', letterSpacing: '0.2em', fontWeight: 500, fontFamily: "'Orbitron', monospace" }}>
          GHOST PROTOCOL
        </span>
        <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: 9 }}>v1.0.0</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00e67a', display: 'inline-block' }} />
          <span style={{ color: '#00e67a' }}>ACTIVE</span>
        </div>
        <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>|</span>
        <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{date}</span>
        <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{time}</span>
        <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>|</span>
        <span style={{
          color: 'rgba(255, 255, 255, 0.6)',
          border: '1px solid rgba(0, 230, 122, 0.15)',
          padding: '2px 8px',
          fontSize: 9,
        }}>
          {profile.clearanceLevel}
        </span>
      </div>
    </motion.header>
  );
}
