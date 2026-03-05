import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, ArrowRight, Building2, ShieldCheck, Hash } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ACCENT = '#09d6f1';
const NAVY = '#001e3c';

const inputBase: React.CSSProperties = {
    width: '100%', padding: '0.7rem 0.875rem 0.7rem 2.25rem',
    border: '1.5px solid #e5e7eb', borderRadius: '10px',
    fontSize: '0.82rem', background: '#fafafa',
    outline: 'none', color: '#111827',
    transition: 'border-color 0.2s, background 0.2s',
};

const Label: React.FC<{ text: string }> = ({ text }) => (
    <label style={{ display: 'block', fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#374151', marginBottom: '0.35rem' }}>{text}</label>
);

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [account_number, setAccountNumber] = useState('');
    const [stand_number, setStandNumber] = useState('');
    const [suburb, setSuburb] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [btnHover, setBtnHover] = useState(false);

    const focus = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = NAVY; e.currentTarget.style.background = '#fff'; };
    const blur = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fafafa'; };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
        setLoading(true);
        try {
            const res = await api.post('/auth/register', { name, email, phone, password, account_number, stand_number, suburb });
            login(res.data.token, res.data.user);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally { setLoading(false); }
    };

    return (
        <>
            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes logoPop {
                    0%   { opacity: 0; transform: scale(0.85); }
                    60%  { transform: scale(1.05); }
                    100% { opacity: 1; transform: scale(1); }
                }
                @keyframes pulseDot {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(9,214,241,0.6); }
                    50%      { box-shadow: 0 0 0 6px rgba(9,214,241,0); }
                }
            `}</style>

            <div className="auth-container" style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', system-ui, sans-serif" }}>

                {/* ━━━━━━━━━━━━━━━ LEFT PANEL ━━━━━━━━━━━━━━━ */}
                <div className="auth-left-panel" style={{
                    width: '420px', flexShrink: 0, background: NAVY,
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    padding: '3rem', position: 'relative', overflow: 'hidden'
                }}>
                    {/* Top accent bar */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: ACCENT }} />
                    {/* Dot grid */}
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                    {/* Vertical accent line */}
                    <div style={{ position: 'absolute', top: 0, right: '70px', width: '1px', height: '100%', background: `rgba(9,214,241,0.08)` }} />
                    {/* Ghost text */}
                    <div style={{ position: 'absolute', bottom: '-20px', left: '-10px', fontSize: '150px', fontWeight: 900, color: 'rgba(255,255,255,0.025)', lineHeight: 1, letterSpacing: '-0.04em', userSelect: 'none', pointerEvents: 'none' }}>MCC</div>

                    {/* TOP: location tag */}
                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '8px', height: '8px', background: ACCENT, borderRadius: '50%', animation: 'pulseDot 2.5s ease-in-out infinite' }} />
                            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Zimbabwe · Manicaland</span>
                        </div>
                    </div>

                    {/* MIDDLE: hero */}
                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <img
                            src="/mutarelogo.png" alt="Mutare Crest"
                            style={{ width: '90px', height: '90px', display: 'block', marginBottom: '1.75rem', filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.5))', animation: 'logoPop 0.7s cubic-bezier(0.34,1.56,0.64,1) both' }}
                        />
                        <div style={{ width: '36px', height: '3px', background: ACCENT, marginBottom: '1.25rem', borderRadius: '2px' }} />
                        <h1 className="auth-hero-title" style={{ color: 'white', fontSize: '2.5rem', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
                            CITY OF<br />MUTARE
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                            Register your municipal account to access digital billing, service requests, and property management.
                        </p>

                        {/* Steps */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {[
                                ['01', 'Enter your personal details'],
                                ['02', 'Link your municipal property'],
                                ['03', 'Await admin verification'],
                                ['04', 'Access your full account'],
                            ].map(([num, text]) => (
                                <div key={num} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '26px', height: '26px', border: `1px solid rgba(9,214,241,0.3)`, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'rgba(9,214,241,0.06)' }}>
                                        <span style={{ color: ACCENT, fontSize: '0.6rem', fontWeight: 900 }}>{num}</span>
                                    </div>
                                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* BOTTOM */}
                    <div style={{ position: 'relative', zIndex: 10, color: 'rgba(255,255,255,0.2)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        © 2026 City of Mutare · All Rights Reserved
                    </div>
                </div>

                {/* ━━━━━━━━━━━━━━━ RIGHT FORM PANEL ━━━━━━━━━━━━━━━ */}
                <div className="auth-right-panel" style={{ flex: 1, background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 3rem', overflowY: 'auto', position: 'relative' }}>
                    {/* Top accent bar */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: ACCENT }} />

                    <div style={{ width: '100%', maxWidth: '520px', animation: 'fadeSlideUp 0.5s ease both' }}>

                        {/* Heading */}
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', borderLeft: `3px solid ${ACCENT}`, paddingLeft: '10px', marginBottom: '0.875rem' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#374151' }}>New Citizen Registration</span>
                            </div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.03em', marginBottom: '0.3rem' }}>Create your account</h2>
                            <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>All fields are required. Property links require admin approval.</p>
                        </div>

                        {error && (
                            <div style={{ background: '#fff1f2', borderLeft: '3px solid #dc2626', padding: '0.7rem 0.875rem', borderRadius: '8px', fontSize: '0.8rem', color: '#dc2626', marginBottom: '1.5rem' }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                            {/* Name + Phone */}
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                                <div>
                                    <Label text="Full Legal Name" />
                                    <div style={{ position: 'relative' }}>
                                        <User style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', color: '#9ca3af' }} />
                                        <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} style={inputBase} onFocus={focus} onBlur={blur} required />
                                    </div>
                                </div>
                                <div>
                                    <Label text="Contact Number" />
                                    <div style={{ position: 'relative' }}>
                                        <Phone style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', color: '#9ca3af' }} />
                                        <input type="tel" placeholder="+263 7..." value={phone} onChange={e => setPhone(e.target.value)} style={inputBase} onFocus={focus} onBlur={blur} required />
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <Label text="Email Address" />
                                <div style={{ position: 'relative' }}>
                                    <Mail style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', color: '#9ca3af' }} />
                                    <input type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} style={inputBase} onFocus={focus} onBlur={blur} required />
                                </div>
                            </div>

                            {/* Property Section */}
                            <div style={{ border: '1.5px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                                <div style={{ background: NAVY, padding: '0.625rem 0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                                        <Building2 style={{ width: '13px', color: ACCENT }} />
                                        <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: ACCENT }}>Municipal Property Link</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.5rem', borderRadius: '999px' }}>
                                        <ShieldCheck style={{ width: '11px', color: 'rgba(255,255,255,0.5)' }} />
                                        <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Admin Approval</span>
                                    </div>
                                </div>
                                <div className="form-row" style={{ padding: '0.875rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: '#fafafa' }}>
                                    <div>
                                        <Label text="Stand Number" />
                                        <div style={{ position: 'relative' }}>
                                            <Hash style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '12px', color: '#9ca3af' }} />
                                            <input type="text" placeholder="ST-1001" value={stand_number} onChange={e => setStandNumber(e.target.value)} style={inputBase} onFocus={focus} onBlur={blur} required />
                                        </div>
                                    </div>
                                    <div>
                                        <Label text="Account Number" />
                                        <div style={{ position: 'relative' }}>
                                            <Hash style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '12px', color: '#9ca3af' }} />
                                            <input type="text" placeholder="ACC-0001" value={account_number} onChange={e => setAccountNumber(e.target.value)} style={inputBase} onFocus={focus} onBlur={blur} required />
                                        </div>
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <Label text="Suburb" />
                                        <div style={{ position: 'relative' }}>
                                            <Building2 style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '12px', color: '#9ca3af' }} />
                                            <input type="text" placeholder="e.g., Hobhouse" value={suburb} onChange={e => setSuburb(e.target.value)} style={inputBase} onFocus={focus} onBlur={blur} required />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Password row */}
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                                <div>
                                    <Label text="Password" />
                                    <div style={{ position: 'relative' }}>
                                        <Lock style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', color: '#9ca3af' }} />
                                        <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={inputBase} onFocus={focus} onBlur={blur} required />
                                    </div>
                                </div>
                                <div>
                                    <Label text="Confirm Password" />
                                    <div style={{ position: 'relative' }}>
                                        <Lock style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', color: '#9ca3af' }} />
                                        <input type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputBase} onFocus={focus} onBlur={blur} required />
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                id="register-submit" type="submit" disabled={loading}
                                onMouseEnter={() => setBtnHover(true)}
                                onMouseLeave={() => setBtnHover(false)}
                                style={{
                                    width: '100%', padding: '0.875rem', marginTop: '0.25rem',
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
                                {loading ? 'Creating Account...' : 'Register as Citizen'}
                                {!loading && <ArrowRight style={{ width: '15px' }} />}
                            </button>
                        </form>

                        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: '#6b7280' }}>
                            Already registered?{' '}
                            <NavLink to="/login" style={{ color: NAVY, fontWeight: 800, textDecoration: 'underline' }}>Sign In to Portal</NavLink>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RegisterPage;
