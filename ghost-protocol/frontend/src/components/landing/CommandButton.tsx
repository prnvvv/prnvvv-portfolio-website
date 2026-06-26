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
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{ cursor: 'pointer', outline: 'none' }}
    >
      <span style={{ letterSpacing: '0.3em' }}>
        {received ? '// COMMAND RECEIVED' : 'ENTER COMMAND'}
      </span>
      <span style={{ marginLeft: 12, opacity: 0.6, fontSize: 14 }}>→</span>
    </motion.button>
  );
}
