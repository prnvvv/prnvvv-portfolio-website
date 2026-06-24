import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

function getZuluTime() {
  const now = new Date();
  const hh = String(now.getUTCHours()).padStart(2, '0');
  const mm = String(now.getUTCMinutes()).padStart(2, '0');
  const ss = String(now.getUTCSeconds()).padStart(2, '0');
  return `${hh}${mm}${ss}Z`;
}

export default function StatusBar() {
  const [time, setTime] = useState(getZuluTime);

  useEffect(() => {
    const iv = setInterval(() => setTime(getZuluTime()), 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 4.5, duration: 0.6 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}
    >
      {/* System Online */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="status-dot" />
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '12px',
            color: '#00ff41',
            letterSpacing: '0.15em',
          }}
        >
          SYSTEM ONLINE
        </span>
      </div>

      {/* Divider */}
      <span style={{ color: 'rgba(0,255,65,0.2)', fontSize: '12px' }}>|</span>

      {/* Secure Channel */}
      <span className="secure-channel-tag">
        SECURE CHANNEL // AES-256
      </span>

      {/* Divider */}
      <span style={{ color: 'rgba(0,255,65,0.2)', fontSize: '12px' }}>|</span>

      {/* Zulu Time */}
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '12px',
          color: 'rgba(0, 255, 65, 0.55)',
          letterSpacing: '0.12em',
        }}
      >
        {time}
      </span>

      {/* Divider */}
      <span style={{ color: 'rgba(0,255,65,0.2)', fontSize: '12px' }}>|</span>

      {/* Operator tag */}
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '11px',
          color: 'rgba(0, 255, 65, 0.7)',
          letterSpacing: '0.18em',
          border: '1px solid rgba(0, 255, 65, 0.2)',
          padding: '2px 8px',
        }}
      >
        GHOST-01
      </span>
    </motion.div>
  );
}