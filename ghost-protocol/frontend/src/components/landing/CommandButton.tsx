import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function CommandButton() {
  const [received, setReceived] = useState(false);
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    if (received) return;
    setReceived(true);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      navigate('/dashboard');
    }, 500);
  }, [received, navigate]);

  return (
    <motion.button
      className={`cmd-button ${received ? 'received' : ''}`}
      onClick={handleClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      style={{ cursor: 'pointer', outline: 'none' }}
    >
      {/* Corner decorations */}
      <span
        style={{
          position: 'absolute',
          top: -1, left: -1,
          width: 10, height: 10,
          borderTop: '2px solid #00ff41',
          borderLeft: '2px solid #00ff41',
        }}
      />
      <span
        style={{
          position: 'absolute',
          bottom: -1, right: -1,
          width: 10, height: 10,
          borderBottom: '2px solid #00ff41',
          borderRight: '2px solid #00ff41',
        }}
      />

      {/* Icon */}
      <span style={{ marginRight: 12, fontSize: 16, opacity: 0.8 }}>⬤</span>

      {/* Text */}
      {received ? '// COMMAND RECEIVED' : 'ENTER COMMAND'}
    </motion.button>
  );
}
