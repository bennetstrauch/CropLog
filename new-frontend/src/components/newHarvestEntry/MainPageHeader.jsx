import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../reduxStore/Slices/AuthSlice';
import { Path_HarvestLog } from '../../routes/AppRouter';

export default function MainPageHeader({
  visibility,
  goBack,
  harvestDate,
  setHarvestDate,
  onTutorial,
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header>
      {/* Hamburger menu */}
      <div ref={menuRef} style={{ display: 'inline-block', position: 'relative' }}>
        <button
          onClick={() => setMenuOpen(prev => !prev)}
          title="Menu"
          aria-label="Open menu"
        >
          ☰
        </button>
        {menuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: 6,
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            zIndex: 1000,
          }}>
            {[
              { label: 'Profile',  action: () => { navigate('/profile'); setMenuOpen(false); } },
              { label: 'Tutorial', action: () => { onTutorial?.(); setMenuOpen(false); } },
              { label: 'Logout',   action: () => { handleLogout(); setMenuOpen(false); } },
            ].map(({ label, action }) => (
              <button
                key={label}
                onClick={action}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 16px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  color: '#111827',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {visibility.afterCropSelection && (
        <button onClick={goBack}>
          ← Back
        </button>
      )}

      {visibility.beforeCropSelection && (
        <button onClick={() => navigate(Path_HarvestLog)}>
          Harvest Log
        </button>
      )}

      {visibility.beforeCropSelection && (
        <ModifyDateButton harvestDate={harvestDate} setHarvestDate={setHarvestDate} />
      )}

    </header>
  );
}

function ModifyDateButton({ harvestDate, setHarvestDate }) {
  const inputRef = useRef(null);

  const handleClick = () => {
    try {
      inputRef.current?.showPicker();
    } catch {
      inputRef.current?.focus();
    }
  };

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={handleClick}>Modify Date</button>
      <input
        ref={inputRef}
        type="date"
        value={harvestDate}
        onChange={(e) => setHarvestDate(e.target.value)}
        style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          opacity: 0,
          pointerEvents: 'none',
          width: '100%',
          height: 0,
          padding: 0,
          border: 0,
        }}
      />
    </span>
  );
}
