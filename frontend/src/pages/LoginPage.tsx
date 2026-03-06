import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const DEEP_BLUE = '#1e3a8a';
const TEAL = '#14b8a6';
const DARK_BG = '#0f172a';
const PURPLE = '#8b5cf6';
const CYAN = '#06b6d4';
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

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.875rem 1rem 0.875rem 3rem',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'all 0.2s ease',
        background: WHITE,
        boxSizing: 'border-box' as const
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: DARK_BG,
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Futuristic AI Background */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: `
                    radial-gradient(ellipse at 20% 30%, ${PURPLE}60 0%, transparent 40%),
                    radial-gradient(ellipse at 80% 70%, ${CYAN}60 0%, transparent 40%),
                    radial-gradient(ellipse at 50% 50%, ${DEEP_BLUE}40 0%, transparent 50%),
                    linear-gradient(135deg, ${PURPLE}20 0%, ${CYAN}20 50%, ${DEEP_BLUE}20 100%)
                `,
                backgroundSize: '800px 800px, 800px 800px, 600px 600px, 100% 100%',
                backgroundPosition: '0 0, 0 0, 0 0, 0 0',
                animation: 'gradient-shift 15s ease-in-out infinite'
            }} />
            
            {/* Animated Neural Network */}
            <svg style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                opacity: 0.3
            }}>
                <defs>
                    <pattern id="neural-grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                        <circle cx="30" cy="30" r="2" fill={CYAN} opacity="0.6">
                            <animate attributeName="opacity" values="0.2;0.8;0.2" dur="3s" repeatCount="indefinite" />
                        </circle>
                        <line x1="30" y1="30" x2="90" y2="30" stroke={PURPLE} strokeWidth="0.5" opacity="0.4">
                            <animate attributeName="opacity" values="0.1;0.6;0.1" dur="4s" repeatCount="indefinite" />
                        </line>
                        <line x1="30" y1="30" x2="30" y2="90" stroke={CYAN} strokeWidth="0.5" opacity="0.4">
                            <animate attributeName="opacity" values="0.1;0.6;0.1" dur="3.5s" repeatCount="indefinite" />
                        </line>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#neural-grid)" />
            </svg>

            {/* Floating Orbs */}
            <div style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden'
            }}>
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            width: `${Math.random() * 200 + 50}px`,
                            height: `${Math.random() * 200 + 50}px`,
                            borderRadius: '50%',
                            background: `radial-gradient(circle, ${i % 2 === 0 ? PURPLE : CYAN}40 0%, transparent 70%)`,
                            filter: 'blur(40px)',
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animation: `float-orb ${10 + Math.random() * 10}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 5}s`
                        }}
                    />
                ))}
            </div>

            {/* Digital Rain Effect */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
                    repeating-linear-gradient(
                        90deg,
                        transparent,
                        transparent 2px,
                        rgba(6, 182, 166, 0.03) 2px,
                        rgba(6, 182, 166, 0.03) 4px
                    ),
                    repeating-linear-gradient(
                        0deg,
                        transparent,
                        transparent 2px,
                        rgba(139, 92, 246, 0.03) 2px,
                        rgba(139, 92, 246, 0.03) 4px
                    )
                `,
                animation: 'digital-rain 20s linear infinite'
            }} />

            {/* Login Card */}
            <div style={{
                width: '100%',
                maxWidth: '380px',
                padding: '1.5rem',
                position: 'relative',
                zIndex: 1
            }}>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '16px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                    padding: '2rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    {/* Logo Section */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <img 
                            src="/mutarelogo.png" 
                            alt="City of Mutare" 
                            style={{ 
                                width: '60px', 
                                height: '60px',
                                marginBottom: '1rem',
                                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
                            }} 
                        />
                        
                        <h1 style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: DEEP_BLUE,
                            margin: '0 0 0.25rem 0',
                            letterSpacing: '-0.025em'
                        }}>
                            City of Mutare
                        </h1>
                        
                        <p style={{
                            fontSize: '0.875rem',
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
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Email Field */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                color: '#374151',
                                marginBottom: '0.4rem'
                            }}>
                                Email / Username
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail style={{
                                    position: 'absolute',
                                    left: '0.875rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '16px',
                                    color: '#9ca3af',
                                    zIndex: 1
                                }} />
                                <input
                                    type="email"
                                    placeholder="Enter your email or username"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    style={{
                                        ...inputStyle,
                                        paddingLeft: '2.5rem',
                                        fontSize: '0.875rem',
                                        padding: '0.75rem 1rem 0.75rem 2.5rem'
                                    }}
                                    onFocus={e => {
                                        e.currentTarget.style.borderColor = TEAL;
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.1)';
                                    }}
                                    onBlur={e => {
                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                color: '#374151',
                                marginBottom: '0.4rem'
                            }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock style={{
                                    position: 'absolute',
                                    left: '0.875rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '16px',
                                    color: '#9ca3af',
                                    zIndex: 1
                                }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    style={{
                                        ...inputStyle,
                                        paddingLeft: '2.5rem',
                                        paddingRight: '2.5rem',
                                        fontSize: '0.875rem',
                                        padding: '0.75rem 1rem 0.75rem 2.5rem',
                                        boxSizing: 'border-box' as const
                                    }}
                                    onFocus={e => {
                                        e.currentTarget.style.borderColor = TEAL;
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.1)';
                                    }}
                                    onBlur={e => {
                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '0.875rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#9ca3af',
                                        padding: '0.25rem',
                                        borderRadius: '4px',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={e => { e.currentTarget.style.color = DEEP_BLUE; }}
                                    onMouseOut={e => { e.currentTarget.style.color = '#9ca3af'; }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.8rem'
                        }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                cursor: 'pointer',
                                color: '#374151'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={e => setRememberMe(e.target.checked)}
                                    style={{
                                        width: '14px',
                                        height: '14px',
                                        accentColor: DEEP_BLUE,
                                        cursor: 'pointer'
                                    }}
                                />
                                Remember me
                            </label>
                            <NavLink
                                to="/forgot-password"
                                style={{
                                    color: TEAL,
                                    textDecoration: 'none',
                                    fontWeight: 500,
                                    transition: 'color 0.2s'
                                }}
                                onMouseOver={e => { e.currentTarget.style.color = '#0d9488'; }}
                                onMouseOut={e => { e.currentTarget.style.color = TEAL; }}
                            >
                                Forgot password?
                            </NavLink>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                background: loading ? '#94a3b8' : DEEP_BLUE,
                                color: WHITE,
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transform: loading ? 'none' : 'translateY(0)',
                                boxShadow: loading ? 'none' : '0 4px 6px -1px rgba(30, 58, 138, 0.3)'
                            }}
                            onMouseOver={e => {
                                if (!loading) {
                                    e.currentTarget.style.background = '#1e40af';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(30, 58, 138, 0.4)';
                                }
                            }}
                            onMouseOut={e => {
                                if (!loading) {
                                    e.currentTarget.style.background = DEEP_BLUE;
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(30, 58, 138, 0.3)';
                                }
                            }}
                        >
                            {loading ? (
                                <>
                                    <div style={{
                                        width: '14px',
                                        height: '14px',
                                        border: '2px solid rgba(255, 255, 255, 0.3)',
                                        borderTop: '2px solid white',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite'
                                    }} />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <CheckCircle size={16} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <div style={{
                        textAlign: 'center',
                        marginTop: '1.5rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid #e2e8f0'
                    }}>
                        <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>
                            Don't have an account?{' '}
                            <NavLink
                                to="/register"
                                style={{
                                    color: TEAL,
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                    transition: 'color 0.2s'
                                }}
                                onMouseOver={e => { e.currentTarget.style.color = '#0d9488'; }}
                                onMouseOut={e => { e.currentTarget.style.color = TEAL; }}
                            >
                                Register here
                            </NavLink>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    textAlign: 'center',
                    marginTop: '1.5rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.75rem'
                }}>
                    <p style={{ margin: 0 }}>City of Mutare © 2026</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                        Secure Municipal Portal
                    </p>
                </div>
            </div>

            {/* Animations */}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes gradient-shift {
                    0%, 100% { 
                        background-position: 0% 0%, 100% 100%, 50% 50%, 0% 0%;
                    }
                    25% { 
                        background-position: 100% 0%, 0% 100%, 0% 50%, 100% 0%;
                    }
                    50% { 
                        background-position: 100% 100%, 0% 0%, 100% 50%, 0% 100%;
                    }
                    75% { 
                        background-position: 0% 100%, 100% 0%, 50% 0%, 100% 100%;
                    }
                }
                @keyframes float-orb {
                    0%, 100% { 
                        transform: translate(0, 0) scale(1);
                        opacity: 0.3;
                    }
                    25% { 
                        transform: translate(30px, -20px) scale(1.1);
                        opacity: 0.6;
                    }
                    50% { 
                        transform: translate(-20px, 30px) scale(0.9);
                        opacity: 0.4;
                    }
                    75% { 
                        transform: translate(-30px, -10px) scale(1.05);
                        opacity: 0.5;
                    }
                }
                @keyframes digital-rain {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(20px); }
                }
            `}</style>
        </div>
    );
};

export default LoginPage;
