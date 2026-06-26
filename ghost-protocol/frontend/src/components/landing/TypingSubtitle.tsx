import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getProfile } from '../../services/dataService';

const profile = getProfile();

const LINES = [
  { label: 'CALLSIGN', value: profile.callSign, delay: 1200 },
  { label: 'SPECIALIZATION', value: profile.specialization, delay: 2400 },
  { label: 'CLEARANCE', value: profile.clearanceLevel, delay: 3400 },
  { label: 'LOCATION', value: profile.location, delay: 4400 },
];

function TypedLine({ label, value, startDelay }: { label: string; value: string; startDelay: number }) {
  const [text, setText] = useState('');
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const full = `${label}: ${value}`;

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(t);
  }, [startDelay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const iv = setInterval(() => {
      setText(full.slice(0, i + 1));
      i++;
      if (i >= full.length) {
        clearInterval(iv);
        setDone(true);
      }
    }, 38);
    return () => clearInterval(iv);
  }, [started, full]);

  if (!started && text === '') return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '13px',
        color: '#e8e8e8',
        letterSpacing: '0.12em',
        display: 'flex',
        alignItems: 'center',
        gap: '0',
        minHeight: '22px',
      }}
    >
      <span style={{ color: 'rgba(0, 230, 59, 0.5)', marginRight: '0' }}>
        {text.slice(0, label.length + 2)}
      </span>
      <span style={{ color: '#e8e8e8' }}>
        {text.slice(label.length + 2)}
      </span>
      {!done && (
        <span className="typing-cursor" />
      )}
    </motion.div>
  );
}

export default function TypingSubtitle() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
      {LINES.map((line) => (
        <TypedLine
          key={line.label}
          label={line.label}
          value={line.value}
          startDelay={line.delay}
        />
      ))}
    </div>
  );
}
