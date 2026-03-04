import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ACCENT = '#09d6f1';
const NAVY = '#001e3c';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [btnHover, setBtnHover] = useState(false);
    const [regHover, setRegHover] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            login(res.data.token, res.data.user);
            if (res.data.user.role !== 'USER') navigate('/admin');
            else navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes logoPop {
                    0%   { opacity: 0; transform: scale(0.85); }
                    60%  { transform: scale(1.04); }
                    100% { opacity: 1; transform: scale(1); }
                }
                @keyframes pulseDot {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(9,214,241,0.6); }
                    50%      { box-shadow: 0 0 0 6px rgba(9,214,241,0); }
                }
                @keyframes statsIn {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <div className="auth-container" style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', system-ui, sans-serif" }}>

                {/* ── LEFT BRAND PANEL ── */}
                <div className="auth-left-panel" style={{
                    width: '58%', background: NAVY,
                    display: 'flex', flexDirection: 'column',
                    position: 'relative', overflow: 'hidden'
                }}>
                    {/* Dot grid */}
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                    {/* Top accent bar */}
                    <div style={{ height: '4px', background: ACCENT, width: '100%', position: 'absolute', top: 0 }} />
                    {/* Ghost text */}
                    <div style={{ position: 'absolute', bottom: '-30px', right: '-20px', fontSize: '220px', fontWeight: 900, lineHeight: 1, color: 'rgba(255,255,255,0.025)', letterSpacing: '-0.05em', userSelect: 'none', pointerEvents: 'none' }}>CITY</div>
                    {/* Accent lines */}
                    <div style={{ position: 'absolute', top: 0, right: '80px', width: '1px', height: '100%', background: 'rgba(9,214,241,0.08)' }} />
                    <div style={{ position: 'absolute', top: 0, right: '160px', width: '1px', height: '40%', background: 'rgba(255,255,255,0.04)' }} />

                    {/* Content */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '3rem 3.5rem', position: 'relative', zIndex: 10 }}>

                        {/* Top bar */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '8px', height: '8px', background: ACCENT, borderRadius: '50%', animation: 'pulseDot 2.5s ease-in-out infinite' }} />
                                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                                    Zimbabwe · Manicaland Province
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(9,214,241,0.08)', border: `1px solid rgba(9,214,241,0.25)`, padding: '0.25rem 0.75rem', borderRadius: '999px' }}>
                                <ShieldCheck style={{ width: '11px', color: ACCENT }} />
                                <span style={{ color: ACCENT, fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Secure Portal</span>
                            </div>
                        </div>

                        {/* Hero */}
                        <div>
                            <div style={{ marginBottom: '2.5rem' }}>
                                <img
                                    src="/mutarelogo.png"
                                    alt="Mutare Coat of Arms"
                                    style={{ width: '120px', height: '120px', display: 'block', marginBottom: '2rem', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.5))', animation: 'logoPop 0.7s cubic-bezier(0.34,1.56,0.64,1) both' }}
                                />
                                <div style={{ width: '48px', height: '3px', background: ACCENT, marginBottom: '1.5rem', borderRadius: '2px' }} />
                                <h1 className="auth-hero-title" style={{ color: 'white', fontSize: '3.5rem', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
                                    CITY OF<br />MUTARE
                                </h1>
                                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                    Municipal Digital Services Platform
                                </p>
                            </div>

                            {/* Stats */}
                            <div style={{ display: 'flex', gap: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.75rem' }}>
                                {[
                                    { figure: '272K+', label: 'Residents' },
                                    { figure: '48K+', label: 'Properties' },
                                    { figure: '100%', label: 'Secure' },
                                ].map((s, i) => (
                                    <div key={i} style={{ animation: `statsIn 0.5s ease ${0.2 + i * 0.1}s both` }}>
                                        <div style={{ color: ACCENT, fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>{s.figure}</div>
                                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>© 2026 City of Mutare</span>
                            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Platform v2.0</span>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT FORM PANEL ── */}
                <div className="auth-right-panel" style={{ flex: 1, background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative' }}>
                    {/* Top accent bar */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: ACCENT }} />

                    {/* Animated form card */}
                    <div style={{ width: '100%', maxWidth: '360px', animation: 'fadeSlideUp 0.55s ease both' }}>

                        {/* Heading */}
                        <div style={{ marginBottom: '2.5rem' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', borderLeft: `3px solid ${ACCENT}`, paddingLeft: '10px', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#374151' }}>
                                    Citizen Login
                                </span>
                            </div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '0.5rem' }}>
                                Welcome back.
                            </h2>
                            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                                Sign in to access your municipal account.
                            </p>
                        </div>

                        {error && (
                            <div style={{ background: '#fff1f2', borderLeft: '3px solid #dc2626', padding: '0.7rem 0.875rem', borderRadius: '8px', fontSize: '0.8rem', color: '#dc2626', marginBottom: '1.5rem' }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#374151', marginBottom: '0.4rem' }}>Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', color: '#9ca3af' }} />
                                    <input
                                        id="login-email" type="email" placeholder="name@example.com"
                                        value={email} onChange={e => setEmail(e.target.value)} required
                                        style={{ width: '100%', padding: '0.75rem 0.875rem 0.75rem 2.4rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.875rem', background: '#fafafa', outline: 'none', color: '#111827', transition: 'border-color 0.2s, background 0.2s' }}
                                        onFocus={e => { e.currentTarget.style.borderColor = NAVY; e.currentTarget.style.background = '#fff'; }}
                                        onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fafafa'; }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#374151', marginBottom: '0.4rem' }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', color: '#9ca3af' }} />
                                    <input
                                        id="login-password" type="password" placeholder="••••••••"
                                        value={password} onChange={e => setPassword(e.target.value)} required
                                        style={{ width: '100%', padding: '0.75rem 0.875rem 0.75rem 2.4rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.875rem', background: '#fafafa', outline: 'none', color: '#111827', transition: 'border-color 0.2s, background 0.2s' }}
                                        onFocus={e => { e.currentTarget.style.borderColor = NAVY; e.currentTarget.style.background = '#fff'; }}
                                        onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fafafa'; }}
                                    />
                                </div>
                            </div>

                            <button
                                id="login-submit" type="submit" disabled={loading}
                                onMouseEnter={() => setBtnHover(true)}
                                onMouseLeave={() => setBtnHover(false)}
                                style={{
                                    width: '100%', padding: '0.875rem', marginTop: '0.5rem',
                                    background: loading ? '#6b7280' : (btnHover ? '#002f5a' : NAVY),
                                    color: 'white', border: 'none', borderRadius: '12px',
                                    fontWeight: 800, fontSize: '0.875rem', letterSpacing: '0.05em',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    transform: btnHover && !loading ? 'translateY(-1px)' : 'translateY(0)',
                                    boxShadow: btnHover && !loading ? '0 8px 20px rgba(0,30,60,0.25)' : 'none',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {loading ? 'Authenticating...' : 'Sign In to Portal'}
                                {!loading && <ArrowRight style={{ width: '15px' }} />}
                            </button>
                        </form>

                        {/* Divider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.75rem 0 1.25rem' }}>
                            <div style={{ flex: 1, height: '1px', background: '#f3f4f6' }} />
                            <span style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>New to Mutare Portal?</span>
                            <div style={{ flex: 1, height: '1px', background: '#f3f4f6' }} />
                        </div>

                        <NavLink to="/register" style={{ textDecoration: 'none' }}>
                            <div
                                onMouseEnter={() => setRegHover(true)}
                                onMouseLeave={() => setRegHover(false)}
                                style={{
                                    width: '100%', padding: '0.75rem',
                                    border: `1.5px solid ${regHover ? NAVY : '#d1d5db'}`,
                                    borderRadius: '12px', color: NAVY, fontWeight: 700,
                                    fontSize: '0.875rem', textAlign: 'center',
                                    letterSpacing: '0.03em', cursor: 'pointer',
                                    background: regHover ? '#f0f7ff' : 'transparent',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                Register as Citizen →
                            </div>
                        </NavLink>

                        {/* SSL */}
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '2rem', color: '#9ca3af', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            <ShieldCheck style={{ width: '12px', color: '#16a34a' }} />
                            256-bit SSL · Official Government Portal
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginPage;
