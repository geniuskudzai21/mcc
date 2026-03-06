import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

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

    const backgroundStyle = {
        backgroundImage: "url('/mutarebg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(5px)'
    };

    return (
        <div className="min-h-screen relative font-['Inter',system-ui,sans-serif]">
            <div className="absolute inset-0" style={backgroundStyle}></div>
            <div className="relative z-10 min-h-screen flex items-center justify-center">
                <div className="w-full max-w-[380px] p-6">
                    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-8">
                        <div className="text-center mb-8">
                            <img 
                                src="/mutarelogo.png" 
                                alt="City of Mutare" 
                                className="w-16 h-16 mx-auto mb-4 drop-shadow-lg" 
                            />
                            <h1 className="text-2xl font-bold text-blue-900 mb-1 tracking-tight">
                                City of Mutare
                            </h1>
                            <p className="text-sm text-slate-500 font-medium">
                                Municipal Billing System
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3 animate-[slideDown_0.3s_ease]">
                                <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                                <span className="text-red-600 text-sm font-medium">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Email 
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 text-slate-400 z-10" />
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        className="w-full px-10 py-3 border border-slate-200 rounded-xl text-sm outline-none transition-all duration-200 focus:border-teal-500 focus:shadow-[0_0_0_3px_rgba(20,184,166,0.1)]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 text-slate-400 z-10" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        className="w-full px-10 py-3 border border-slate-200 rounded-xl text-sm outline-none transition-all duration-200 focus:border-teal-500 focus:shadow-[0_0_0_3px_rgba(20,184,166,0.1)]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-slate-400 p-1 rounded transition-all duration-200 hover:text-blue-900"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={e => setRememberMe(e.target.checked)}
                                        className="w-3.5 h-3.5 accent-blue-900 cursor-pointer"
                                    />
                                    Remember me
                                </label>
                                <NavLink
                                    to="/forgot-password"
                                    className="text-teal-500 no-underline font-medium transition-colors duration-200 hover:text-teal-600"
                                >
                                    Forgot password?
                                </NavLink>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-blue-900 text-white border-none rounded-[10px] text-sm font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_4px_6px_-1px_rgba(30,58,138,0.3)] hover:bg-blue-800 hover:-translate-y-0.5 hover:shadow-[0_10px_15px_-3px_rgba(30,58,138,0.4)] disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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

                        <div className="text-center mt-6 pt-6 border-t border-slate-200">
                            <p className="text-slate-500 text-xs">
                                Don't have an account?{' '}
                                <NavLink
                                    to="/register"
                                    className="text-teal-500 no-underline font-semibold transition-colors duration-200 hover:text-teal-600"
                                >
                                    Register here
                                </NavLink>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

