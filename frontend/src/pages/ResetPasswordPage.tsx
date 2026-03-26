import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '../services/api';

const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [tokenValid, setTokenValid] = useState<boolean | null>(null);

    useEffect(() => {
        if (!token) {
            setError('Invalid reset link. Please request a new password reset.');
            setTokenValid(false);
        } else {
            setTokenValid(true);
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            await api.post('/auth/reset-password', { token, newPassword });
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password');
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

    if (success) {
        return (
            <div className="min-h-screen relative font-['Inter',system-ui,sans-serif]">
                <div className="absolute inset-0" style={backgroundStyle}></div>
                <div className="relative z-10 min-h-screen flex items-center justify-center">
                    <div className="w-full max-w-[380px] p-6">
                        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-8">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle size={32} className="text-green-600" />
                                </div>
                                <h1 className="text-2xl font-bold text-blue-900 mb-2 tracking-tight">
                                    Password Reset Successful
                                </h1>
                                <p className="text-sm text-slate-500 font-medium">
                                    Your password has been updated successfully
                                </p>
                            </div>

                            <button
                                onClick={() => navigate('/login')}
                                className="w-full py-2.5 bg-blue-900 text-white border-none rounded-[10px] text-sm font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_4px_6px_-1px_rgba(30,58,138,0.3)] hover:bg-blue-800 hover:-translate-y-0.5 hover:shadow-[0_10px_15px_-3px_rgba(30,58,138,0.4)]"
                            >
                                Sign In Now
                                <CheckCircle size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                                Reset Password
                            </h1>
                            <p className="text-sm text-slate-500 font-medium">
                                Enter your new password
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3 animate-[slideDown_0.3s_ease]">
                                <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                                <span className="text-red-600 text-sm font-medium">{error}</span>
                            </div>
                        )}

                        {tokenValid && (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 text-slate-400 z-10" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Enter new password"
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            required
                                            minLength={6}
                                            className="w-full px-9 py-2 border border-slate-300 rounded-xl text-sm outline-none transition-all duration-200 focus:border-teal-500 focus:shadow-[0_0_0_3px_rgba(20,184,166,0.1)]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-slate-400 p-1 rounded transition-all duration-200 hover:text-blue-900"
                                        >
                                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 text-slate-400 z-10" />
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Confirm new password"
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            required
                                            minLength={6}
                                            className="w-full px-9 py-2 border border-slate-300 rounded-xl text-sm outline-none transition-all duration-200 focus:border-teal-500 focus:shadow-[0_0_0_3px_rgba(20,184,166,0.1)]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-slate-400 p-1 rounded transition-all duration-200 hover:text-blue-900"
                                        >
                                            {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2.5 bg-blue-900 text-white border-none rounded-[10px] text-sm font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_4px_6px_-1px_rgba(30,58,138,0.3)] hover:bg-blue-800 hover:-translate-y-0.5 hover:shadow-[0_10px_15px_-3px_rgba(30,58,138,0.4)] disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Resetting...
                                        </>
                                    ) : (
                                        <>
                                            Reset Password
                                            <CheckCircle size={16} />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        <div className="text-center mt-6 pt-6 border-t border-slate-200">
                            <NavLink
                                to="/login"
                                className="inline-flex items-center gap-2 text-blue-600 no-underline font-medium transition-colors duration-200 hover:text-teal-600"
                            >
                                <ArrowLeft size={16} />
                                Back to Sign In
                            </NavLink>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
