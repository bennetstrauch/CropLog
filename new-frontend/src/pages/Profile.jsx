import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile, updateMyName, getPlanInfo, getErrorMessage } from '../service/apiService';
import Spinner from '../components/universal/Spinner';

// Inject responsive grid styles once
if (!document.getElementById('profile-styles')) {
  const el = document.createElement('style');
  el.id = 'profile-styles';
  el.textContent = `
    .profile-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
    }
    @media (min-width: 640px) {
      .profile-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
  `;
  document.head.appendChild(el);
}

const PLAN_CONFIG = {
  FARM_PAID:  { label: 'Farm Plan', bg: 'linear-gradient(135deg,#92400e,#78350f)', text: '#fde68a', ring: '#d97706' },
  FARM_TRIAL: { label: 'Trial',     bg: 'linear-gradient(135deg,#1e3a5f,#1e3a5f)', text: '#93c5fd', ring: '#3b82f6' },
  FREE:       { label: 'Free Plan', bg: 'linear-gradient(135deg,#2d5a27,#1e4019)', text: '#d4f0d0', ring: '#4a8a42' },
};

export default function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile]         = useState(null);
  const [plan, setPlan]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput]     = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError]     = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    Promise.all([getMyProfile(), getPlanInfo()])
      .then(([p, pl]) => { setProfile(p); setPlan(pl); setNameInput(p.name); })
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setSaveLoading(true); setSaveError(''); setSaveSuccess(false);
    try {
      const updated = await updateMyName(nameInput.trim());
      setProfile(prev => ({ ...prev, name: updated.name }));
      setEditingName(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(getErrorMessage(err));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setNameInput(profile.name);
    setEditingName(false);
    setSaveError('');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner />
    </div>
  );
  if (error) return (
    <div style={{ minHeight: '100vh', padding: 32 }}>
      <BackBtn onClick={() => navigate(-1)} fixed />
      <p style={{ color: '#f87171', marginTop: 80 }}>{error}</p>
    </div>
  );

  const isOnTrial   = plan.trialActive;
  const isPaid      = plan.plan === 'FARM' && !isOnTrial;
  const planKey     = isPaid ? 'FARM_PAID' : isOnTrial ? 'FARM_TRIAL' : 'FREE';
  const pc          = PLAN_CONFIG[planKey];
  const trialDate   = plan.trialEndsAt ? new Date(plan.trialEndsAt) : null;
  const initials    = (profile.name || '?').split(' ').slice(0, 2).map(w => w[0].toUpperCase()).join('');
  const daysLeft    = trialDate ? Math.max(0, Math.ceil((trialDate - new Date()) / 86400000)) : 0;
  const stripeLink  = import.meta.env.VITE_STRIPE_PAYMENT_LINK;
  const showUpgrade = !isPaid;

  return (
    <div style={{ minHeight: '100vh', padding: '16px 20px 40px', position: 'relative', overflow: 'hidden' }}>

      {/* Fixed back button — top left */}
      <BackBtn onClick={() => navigate(-1)} fixed />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto' }}>

        {/* Page title */}
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f0ebe0', margin: '44px 0 24px', letterSpacing: '-0.01em' }}>
          Your Profile
        </h1>

        {/* ── Responsive grid ── */}
        <div className="profile-grid">

          {/* LEFT column: avatar hero + name/email card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Avatar hero */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px', background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ flexShrink: 0, width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#3a6b2e,#2a5020)', border: '2px solid #c8a96e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#f0ebe0' }}>
                {initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#e8c47a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Farmer</p>
                <p style={{ margin: 0, fontSize: 17, fontWeight: 600, color: '#f0ebe0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.name}</p>
              </div>
            </div>

            {/* Name + Email card */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>

              {/* Name */}
              <div style={{ padding: '16px 20px' }}>
                <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 600, color: '#e8c47a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Name</p>
                {editingName ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        value={nameInput}
                        onChange={e => setNameInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') handleCancelEdit(); }}
                        autoFocus
                        style={{ flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(200,169,110,0.4)', borderRadius: 8, fontSize: 14, color: '#f0ebe0', outline: 'none' }}
                      />
                      <ActionBtn onClick={handleSaveName} disabled={saveLoading} accent>
                        {saveLoading ? <Spinner size="sm" /> : 'Save'}
                      </ActionBtn>
                      <ActionBtn onClick={handleCancelEdit}>Cancel</ActionBtn>
                    </div>
                    {saveError && <span style={{ fontSize: 12, color: '#f87171' }}>{saveError}</span>}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 15, color: '#f0ebe0' }}>{profile.name}</span>
                    <button onClick={() => setEditingName(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#e8c47a', padding: '4px 8px' }}>
                      Edit
                    </button>
                  </div>
                )}
                {saveSuccess && <span style={{ fontSize: 12, color: '#86efac', marginTop: 4, display: 'block' }}>Name updated.</span>}
              </div>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

              {/* Email */}
              <div style={{ padding: '16px 20px' }}>
                <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 600, color: '#e8c47a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Email</p>
                <span style={{ fontSize: 15, color: 'rgba(240,235,224,0.6)' }}>{profile.email}</span>
              </div>
            </div>
          </div>

          {/* RIGHT column: subscription card */}
          <div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>

                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#e8c47a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Subscription
                </p>

                <span style={{ padding: '6px 18px', borderRadius: 20, background: pc.bg, color: pc.text, fontSize: 13, fontWeight: 700, border: `1px solid ${pc.ring}`, letterSpacing: '0.02em' }}>
                  {pc.label}
                </span>

                {/* Trial countdown */}
                {isOnTrial && trialDate && (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 700, color: daysLeft <= 14 ? '#fca5a5' : '#f0ebe0' }}>
                      {daysLeft}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                      days left in trial
                    </p>
                  </div>
                )}

                {/* Paid — no action needed */}
                {isPaid && (
                  <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                    Full access active
                  </p>
                )}
              </div>

              {/* Upgrade section */}
              {showUpgrade && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '20px' }}>

                  {/* Plan comparison */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                    <PlanCol
                      title="Free"
                      active={!isOnTrial}
                      items={[
                        `${plan.limits.maxCrops} crops`,
                        `${plan.limits.maxFields} fields`,
                        `${plan.limits.maxMeasureUnits} units`,
                      ]}
                    />
                    <PlanCol
                      title="Farm"
                      highlight
                      items={[
                        'Unlimited crops',
                        'Unlimited fields',
                        'Unlimited units',
                      ]}
                    />
                  </div>

                  {/* CTA button */}
                  <a
                    href={stripeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '11px 16px',
                      background: 'linear-gradient(135deg,#f0c96a,#d4a043)',
                      color: '#1b2e1b',
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 700,
                      textDecoration: 'none',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {isOnTrial ? 'Upgrade before trial ends →' : 'Upgrade to Farm Plan →'}
                  </a>

                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function BackBtn({ onClick, fixed }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8,
        cursor: 'pointer',
        color: 'rgba(240,235,224,0.75)',
        fontSize: 13,
        padding: '7px 12px',
        ...(fixed ? { position: 'fixed', top: 16, left: 16, zIndex: 100 } : {}),
      }}
    >
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </button>
  );
}

function PlanCol({ title, items, highlight, active }) {
  return (
    <div style={{
      padding: '12px',
      borderRadius: 10,
      background: highlight ? 'rgba(200,169,110,0.08)' : 'rgba(0,0,0,0.15)',
      border: highlight ? '1px solid rgba(200,169,110,0.25)' : '1px solid rgba(255,255,255,0.06)',
    }}>
      <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: highlight ? '#c8a96e' : 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {title}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {items.map(item => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: highlight ? '#86efac' : 'rgba(255,255,255,0.2)' }}>
              {highlight ? '✓' : '–'}
            </span>
            <span style={{ fontSize: 12, color: highlight ? 'rgba(240,235,224,0.7)' : 'rgba(255,255,255,0.3)' }}>
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionBtn({ onClick, disabled, accent, children }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '8px 14px',
      background: accent ? 'linear-gradient(135deg,#3a6b2e,#2a5020)' : 'rgba(255,255,255,0.08)',
      color: accent ? '#f0ebe0' : 'rgba(255,255,255,0.6)',
      border: accent ? '1px solid rgba(200,169,110,0.3)' : '1px solid rgba(255,255,255,0.12)',
      borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: 13, fontWeight: 600,
    }}>
      {children}
    </button>
  );
}
