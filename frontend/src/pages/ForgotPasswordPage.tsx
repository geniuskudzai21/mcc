import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/auth/forgot-password', { email });
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send reset instructions');
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
                                    Check Your Email
                                </h1>
                                <p className="text-sm text-slate-500 font-medium">
                                    We've sent password reset instructions to your email
                                </p>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                                <p className="text-blue-700 text-sm">
                                    <strong>Development Mode:</strong> Check the console for your reset token
                                </p>
                            </div>

                            <div className="text-center">
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
                                Forgot Password
                            </h1>
                            <p className="text-sm text-slate-500 font-medium">
                                Enter your email to receive reset instructions
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3 animate-[slideDown_0.3s_ease]">
                                <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                                <span className="text-red-600 text-sm font-medium">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 text-slate-400 z-10" />
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        className="w-full px-9 py-2 border border-slate-300 rounded-xl text-sm outline-none transition-all duration-200 focus:border-teal-500 focus:shadow-[0_0_0_3px_rgba(20,184,166,0.1)]"
                                    />
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
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        Send Reset Instructions
                                        <Mail size={16} />
                                    </>
                                )}
                            </button>
                        </form>

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

export default ForgotPasswordPage;
