import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, ArrowRight, Building2, Hash, Eye, EyeOff, Check, Shield } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        account_number: '',
        stand_number: '',
        suburb: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateStep1 = () => {
        if (!formData.name || !formData.email || !formData.phone || !formData.password) {
            setError('Please fill in all fields');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        setError('');
        setStep(2);
        return true;
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.account_number || !formData.stand_number || !formData.suburb) {
            setError('Please fill in all property details');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/register', {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                account_number: formData.account_number,
                stand_number: formData.stand_number,
                suburb: formData.suburb
            });
            login(res.data.token, res.data.user);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none transition-all duration-200 focus:border-teal-500 focus:shadow-[0_0_0_3px_rgba(20,184,166,0.1)] bg-white/90 backdrop-blur";

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden font-['Inter',system-ui,sans-serif]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(139,92,246,0.6)_0%,transparent_40%),radial-gradient(ellipse_at_80%_70%,rgba(6,182,212,0.6)_0%,transparent_40%),radial-gradient(ellipse_at_50%_50%,rgba(30,58,138,0.4)_0%,transparent_50%),linear-gradient(135deg,rgba(139,92,246,0.2)_0%,rgba(6,182,212,0.2)_50%,rgba(30,58,138,0.2)_100%)] bg-[length:800px_800px,800px_800px,600px_600px,100%_100%] animate-[gradient-shift_15s_ease-in-out_infinite]" />
            
            <svg className="absolute inset-0 w-full h-full opacity-30">
                <defs>
                    <pattern id="neural-grid-reg" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                        <circle cx="30" cy="30" r="2" fill="#06b6d4" opacity="0.6">
                            <animate attributeName="opacity" values="0.2;0.8;0.2" dur="3s" repeatCount="indefinite" />
                        </circle>
                        <line x1="30" y1="30" x2="90" y2="30" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.4">
                            <animate attributeName="opacity" values="0.1;0.6;0.1" dur="4s" repeatCount="indefinite" />
                        </line>
                        <line x1="30" y1="30" x2="30" y2="90" stroke="#06b6d4" strokeWidth="0.5" opacity="0.4">
                            <animate attributeName="opacity" values="0.1;0.6;0.1" dur="3.5s" repeatCount="indefinite" />
                        </line>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#neural-grid-reg)" />
            </svg>

            <div className="absolute inset-0 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full blur-4xl animate-[float-orb_10s_ease-in-out_infinite]"
                        style={{
                            width: `${Math.random() * 200 + 50}px`,
                            height: `${Math.random() * 200 + 50}px`,
                            background: `radial-gradient(circle, ${i % 2 === 0 ? 'rgba(139,92,246,0.4)' : 'rgba(6,182,212,0.4)'} 0%, transparent 70%)`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`
                        }}
                    />
                ))}
            </div>

            <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(6,182,166,0.03)_2px,rgba(6,182,166,0.03)_4px),repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(139,92,246,0.03)_2px,rgba(139,92,246,0.03)_4px)] animate-[digital-rain_20s_linear_infinite]" />

            <div className="w-full max-w-[420px] p-6 relative z-10">
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)] p-8 border border-white/20">
                    <div className="text-center mb-8">
                        <img src="/mutarelogo.png" alt="City of Mutare" className="w-15 h-15 mx-auto mb-4 drop-shadow-lg" />
                        <h1 className="text-2xl font-bold text-blue-900 mb-1 tracking-tight">City of Mutare</h1>
                        <p className="text-sm text-slate-500 font-medium">Municipal Registration</p>
                    </div>

                    <div className="flex justify-center gap-2 mb-6">
                        {[1, 2].map((s) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step >= s ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                    {step > s ? <Check size={12} /> : s}
                                </div>
                                {s < 2 && <div className={`w-8 h-0.5 ${step > s ? 'bg-teal-500' : 'bg-slate-200'}`} />}
                            </div>
                        ))}
                    </div>

                    <h2 className="text-xl font-bold text-blue-900 mb-2">{step === 1 ? 'Create Account' : 'Property Details'}</h2>
                    <p className="text-slate-500 text-sm mb-6">{step === 1 ? 'Enter your personal information' : 'Link your municipal property'}</p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6 flex items-center gap-3 animate-[slideDown_0.3s_ease]">
                            <Shield size={16} className="text-red-600 flex-shrink-0" />
                            <span className="text-red-600 text-sm font-medium">{error}</span>
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={(e) => { e.preventDefault(); validateStep1(); }} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 text-slate-400 z-10" />
                                    <input type="text" placeholder="John Doe" value={formData.name} onChange={e => updateField('name', e.target.value)} required className={`${inputClass} pl-10`} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 text-slate-400 z-10" />
                                    <input type="email" placeholder="you@example.com" value={formData.email} onChange={e => updateField('email', e.target.value)} required className={`${inputClass} pl-10`} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 text-slate-400 z-10" />
                                    <input type="tel" placeholder="+263 77..." value={formData.phone} onChange={e => updateField('phone', e.target.value)} required className={`${inputClass} pl-10`} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 text-slate-400 z-10" />
                                    <input type={showPassword ? 'text' : 'password'} placeholder="Create password" value={formData.password} onChange={e => updateField('password', e.target.value)} required className={`${inputClass} pl-10 pr-10`} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-slate-400 p-1 rounded transition-colors hover:text-blue-900">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 text-slate-400 z-10" />
                                    <input type="password" placeholder="Confirm password" value={formData.confirmPassword} onChange={e => updateField('confirmPassword', e.target.value)} required className={`${inputClass} pl-10`} />
                                </div>
                                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                    <div className="flex items-center gap-1 mt-1 text-emerald-500 text-xs"><Check size={12} /> Passwords match</div>
                                )}
                            </div>

                            <button type="submit" className="w-full py-3.5 bg-blue-900 text-white border-none rounded-xl font-semibold text-sm cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-blue-800 hover:-translate-y-0.5 hover:shadow-lg">
                                Continue <ArrowRight size={16} />
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister} className="flex flex-col gap-4">
                            <div className="bg-sky-50 rounded-lg p-4 mb-2">
                                <div className="flex items-center gap-2 text-cyan-600 text-sm font-semibold mb-1"><Building2 size={16} /><span>Property Information</span></div>
                                <p className="text-slate-500 text-xs m-0">Enter your municipal account details to link your property</p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Stand Number</label>
                                <div className="relative">
                                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 text-slate-400 z-10" />
                                    <input type="text" placeholder="ST-1001" value={formData.stand_number} onChange={e => updateField('stand_number', e.target.value)} required className={`${inputClass} pl-10`} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number</label>
                                <div className="relative">
                                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 text-slate-400 z-10" />
                                    <input type="text" placeholder="ACC-0001" value={formData.account_number} onChange={e => updateField('account_number', e.target.value)} required className={`${inputClass} pl-10`} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Suburb</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 text-slate-400 z-10" />
                                    <input type="text" placeholder="e.g., Hobhouse" value={formData.suburb} onChange={e => updateField('suburb', e.target.value)} required className={`${inputClass} pl-10`} />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-2">
                                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3.5 bg-white text-slate-600 border border-slate-200 rounded-xl font-semibold text-sm cursor-pointer transition-all hover:bg-slate-50">Back</button>
                                <button type="submit" disabled={loading} className="flex-2 py-3.5 bg-blue-900 text-white border-none rounded-xl font-semibold text-sm cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-blue-800 disabled:bg-slate-400 disabled:cursor-not-allowed">
                                    {loading ? 'Creating...' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="text-center mt-6 pt-6 border-t border-slate-200">
                        <p className="text-slate-500 text-sm">
                            Already have an account?{' '}
                            <NavLink to="/login" className="text-teal-500 no-underline font-semibold transition-colors hover:text-teal-600">
                                Sign in
                            </NavLink>
                        </p>
                    </div>
                </div>

                <div className="text-center mt-6 text-white/70 text-xs">
                    <p className="m-0">City of Mutare © 2026</p>
                    <p className="mt-1 text-xs text-white/50">Secure Municipal Portal</p>
                </div>
            </div>

            <style>{`
                @keyframes gradient-shift {
                    0%, 100% { background-position: 0% 0%, 100% 100%, 50% 50%, 0% 0%; }
                    25% { background-position: 100% 0%, 0% 100%, 0% 50%, 100% 0%; }
                    50% { background-position: 100% 100%, 0% 0%, 100% 50%, 0% 100%; }
                    75% { background-position: 0% 100%, 100% 0%, 50% 0%, 100% 100%; }
                }
                @keyframes float-orb {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
                    25% { transform: translate(30px, -20px) scale(1.1); opacity: 0.6; }
                    50% { transform: translate(-20px, 30px) scale(0.9); opacity: 0.4; }
                    75% { transform: translate(-30px, -10px) scale(1.05); opacity: 0.5; }
                }
                @keyframes digital-rain {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(20px); }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default RegisterPage;
