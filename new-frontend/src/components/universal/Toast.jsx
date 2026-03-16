import React, { useEffect, useState } from 'react';

const STYLES = {
  success: { background: '#4CAF50', duration: 3000 },
  error:   { background: '#ef4444', duration: 5000 },
};

const Toast = ({ message, type = 'success', isVisible, onClose }) => {
  const [shouldRender, setShouldRender] = useState(false);
  const { background, duration } = STYLES[type] ?? STYLES.success;

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      const timer = setTimeout(() => onClose(), duration);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  if (!shouldRender) return null;

  return (
    <div
      className={`toast ${isVisible ? 'toast-show' : 'toast-hide'}`}
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        backgroundColor: background,
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        fontWeight: '500',
        fontSize: '14px',
        transition: 'all 0.3s ease-in-out',
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? 'translateX(-50%) translateY(0)'
          : 'translateX(-50%) translateY(10px)'
      }}
    >
      {message}
    </div>
  );
};

export default Toast;
