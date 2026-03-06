import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, Check, Shield, CheckCircle, Building2, Hash } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
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

    const validateForm = () => {
        if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword || !formData.account_number || !formData.stand_number || !formData.suburb) {
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
        return true;
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
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

    const backgroundStyle = {
        backgroundImage: "url('/mutarebg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(5px) brightness(0.4)'
    };

    return (
        <div className="min-h-screen relative font-['Inter',system-ui,sans-serif]">
            <div className="absolute inset-0" style={backgroundStyle}></div>
            <div className="relative z-10 min-h-screen flex items-center justify-center p-2">
                <div className="w-full max-w-2xl">
                    <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-8">
                        <div className="text-center mb-4">
                            <img 
                                src="/mutarelogo.png" 
                                alt="City of Mutare" 
                                className="w-10 h-10 mx-auto mb-2 drop-shadow-lg" 
                            />
                            <h1 className="text-lg font-bold text-blue-900 mb-1 tracking-tight">
                                City of Mutare
                            </h1>
                            <p className="text-xs text-slate-600 font-medium">
                                Create Account
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-3 flex items-center gap-2 animate-[slideDown_0.3s_ease]">
                                <Shield size={14} className="text-red-600 flex-shrink-0" />
                                <span className="text-red-600 text-xs font-medium">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleRegister} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Personal Information Column */}
                            <div className="space-y-2">
                                <div className="bg-blue-900 rounded-lg p-4 mb-2 border border-slate-200">
                                    <div className="flex items-center gap-2 text-white text-xs">
                                        <User size={12} />
                                        <span>Personal Information</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-0.5">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 text-slate-400 z-10" />
                                        <input
                                            type="text"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={e => updateField('name', e.target.value)}
                                            required
                                            className="w-full px-7 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 outline-none transition-all duration-200 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] placeholder-slate-400"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-0.5">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 text-slate-400 z-10" />
                                        <input
                                            type="email"
                                            placeholder="you@example.com"
                                            value={formData.email}
                                            onChange={e => updateField('email', e.target.value)}
                                            required
                                            className="w-full px-7 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 outline-none transition-all duration-200 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] placeholder-slate-400"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-0.5">
                                        Phone
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 text-slate-400 z-10" />
                                        <input
                                            type="tel"
                                            placeholder="+263 77..."
                                            value={formData.phone}
                                            onChange={e => updateField('phone', e.target.value)}
                                            required
                                            className="w-full px-7 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 outline-none transition-all duration-200 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] placeholder-slate-400"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-0.5">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 text-slate-400 z-10" />
                                        <input
                                            type={showPassword ? 'text' : 'text'}
                                            placeholder="Create password"
                                            value={formData.password}
                                            onChange={e => updateField('password', e.target.value)}
                                            required
                                            className="w-full px-7 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 outline-none transition-all duration-200 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] placeholder-slate-400"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-slate-400 p-0.5 rounded transition-all duration-200 hover:text-blue-600"
                                        >
                                            {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-0.5">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 text-slate-400 z-10" />
                                        <input
                                            type="text"
                                            placeholder="Confirm password"
                                            value={formData.confirmPassword}
                                            onChange={e => updateField('confirmPassword', e.target.value)}
                                            required
                                            className="w-full px-7 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 outline-none transition-all duration-200 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] placeholder-slate-400"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-slate-400 p-0.5 rounded transition-all duration-200 hover:text-blue-600"
                                        >
                                            {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                                        </button>
                                    </div>
                                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                        <div className="flex items-center gap-1 mt-0.5 text-emerald-500 text-xs">
                                            <Check size={8} /> Passwords match
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Property Information Column */}
                            <div className="space-y-2">
                                <div className="bg-blue-900 rounded-lg p-4 mb-2 border border-slate-200">
                                    <div className="flex items-center gap-2 text-white text-xs">
                                        <Building2 size={12} />
                                        <span>Property Information</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-0.5">
                                        Stand Number
                                    </label>
                                    <div className="relative">
                                        <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 text-slate-400 z-10" />
                                        <input
                                            type="text"
                                            placeholder="ST-1001"
                                            value={formData.stand_number}
                                            onChange={e => updateField('stand_number', e.target.value)}
                                            required
                                            className="w-full px-7 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 outline-none transition-all duration-200 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] placeholder-slate-400"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-0.5">
                                        Account Number
                                    </label>
                                    <div className="relative">
                                        <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 text-slate-400 z-10" />
                                        <input
                                            type="text"
                                            placeholder="ACC-0001"
                                            value={formData.account_number}
                                            onChange={e => updateField('account_number', e.target.value)}
                                            required
                                            className="w-full px-7 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 outline-none transition-all duration-200 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] placeholder-slate-400"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-0.5">
                                        Suburb
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 text-slate-400 z-10" />
                                        <input
                                            type="text"
                                            placeholder="e.g., Hobhouse"
                                            value={formData.suburb}
                                            onChange={e => updateField('suburb', e.target.value)}
                                            required
                                            className="w-full px-7 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 outline-none transition-all duration-200 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] placeholder-slate-400"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-2.5 bg-blue-900 text-white border-2 border-blue-600 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_4px_6px_-1px_rgba(30,58,138,0.3)] hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-[0_10px_15px_-3px_rgba(30,58,138,0.4)] disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-2.5 h-2.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Creating Account...
                                            </>
                                        ) : (
                                            <>
                                                Create Account
                                                <CheckCircle size={12} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>

                        <div className="text-center mt-4 pt-3 border-t border-slate-200">
                            <p className="text-slate-600 text-xs">
                                Already have an account?{' '}
                                <NavLink
                                    to="/login"
                                    className="text-blue-600 no-underline font-semibold transition-colors duration-200 hover:text-blue-700"
                                >
                                    Sign in
                                </NavLink>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
