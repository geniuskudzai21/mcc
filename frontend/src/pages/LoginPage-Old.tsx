import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const DEEP_BLUE = '#1e3a8a';
const TEAL = '#14b8a6';
const LIGHT_GRAY = '#f8fafc';
const WHITE = '#ffffff';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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

    const inputStyle = {
        width: '100%',
        padding: '0.875rem 1rem 0.875rem 3rem',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'all 0.2s ease',
        background: WHITE,
        boxSizing: 'border-box'
    };

    const buttonStyle = {
        width: '100%',
        padding: '1rem',
        background: DEEP_BLUE,
        color: WHITE,
        border: 'none',
        borderRadius: '12px',
        fontSize: '1rem',
        fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem'
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: LIGHT_GRAY,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Subtle Background Pattern */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
                    radial-gradient(circle at 20% 20%, rgba(30, 58, 138, 0.03) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(20, 184, 166, 0.03) 0%, transparent 50%),
                    linear-gradient(45deg, rgba(30, 58, 138, 0.02) 25%, transparent 25%),
                    linear-gradient(-45deg, rgba(20, 184, 166, 0.02) 25%, transparent 25%)
                `,
                backgroundSize: '400px 400px, 400px 400px, 20px 20px, 20px 20px',
                backgroundPosition: '0 0, 0 0, 0 0, 10px 10px'
            }} />

            {/* Login Card */}
            <div style={{
                width: '100%',
                maxWidth: '440px',
                padding: '2rem',
                position: 'relative',
                zIndex: 1
            }}>
                <div style={{
                    background: WHITE,
                    borderRadius: '20px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    padding: '3rem',
                    border: '1px solid rgba(226, 232, 240, 0.8)'
                }}>
                    {/* Logo Section */}
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: DEEP_BLUE,
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            boxShadow: '0 10px 15px -3px rgba(30, 58, 138, 0.3)'
                        }}>
                            <img src="/mutarelogo.png" alt="City of Mutare" style={{ width: '50px', height: '50px' }} />
                        </div>

                        <h1 style={{
                            fontSize: '1.75rem',
                            fontWeight: 700,
                            color: DEEP_BLUE,
                            margin: '0 0 0.5rem 0',
                            letterSpacing: '-0.025em'
                        }}>
                            City of Mutare
                        </h1>

                        <p style={{
                            fontSize: '1rem',
                            color: '#64748b',
                            margin: '0',
                            fontWeight: 500
                        }}>
                            Municipal Billing System
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '12px',
                            padding: '1rem',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            animation: 'slideDown 0.3s ease'
                        }}>
                            <AlertCircle size={20} style={{ color: '#dc2626', flexShrink: 0 }} />
                            <span style={{ color: '#dc2626', fontSize: '0.875rem', fontWeight: 500 }}>
                                {error}
                            </span>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Email Field */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }}>
                                Email / Username
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '18px',
                                    color: '#9ca3af',
                                    zIndex: 1
                                }} />
                                <input
                                    type="email"
                                    placeholder="Enter your email or username"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    style={inputStyle}
                                    onFocus={e => {
                                        e.currentTarget.style.borderColor = TEAL;
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.1)';
                                    }}
                                    onBlur={e => {
                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                />
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
