import React from 'react';
import Layout from '../components/Layout';
import { User, Mail, Phone, Shield, Building2, Clock, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const NAVY = '#001e3c';
const ACCENT = '#2563eb';

const ProfilePage: React.FC = () => {
    const { user: authUser } = useAuth();
    const isAdmin = authUser?.role !== 'USER';

    const { data: user, isLoading } = useQuery({
        queryKey: ['user-me'],
        queryFn: async () => { 
            const token = localStorage.getItem('token');
            console.log('Token from localStorage:', token);
            console.log('Fetching user profile...');
            const res = await api.get('/users/me'); 
            console.log('User profile response:', res.data);
            return res.data; 
        }
    });

    if (isLoading) {
        return (
            <Layout isAdmin={isAdmin}>
                <div className="flex items-center justify-center h-[60vh] gap-4 flex-col">
                    <div className="w-9 h-9 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <p className="text-slate-500 text-sm">Loading profile...</p>
                </div>
            </Layout>
        );
    }

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'VERIFIED': return { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: 'Verified', icon: CheckCircle };
            case 'REJECTED': return { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Rejected', icon: AlertCircle };
            default: return { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'Pending', icon: Clock };
        }
    };

    const inputClass = "w-full py-2.5 px-3.5 pl-9 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none text-slate-700 font-inherit focus:border-blue-900 focus:bg-white";

    return (
        <Layout isAdmin={isAdmin}>
            <style>{`
                @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .profile-card { animation: fadeUp 0.35s ease both; }
                .prop-item:hover { background: #f0f9ff; }
                .link-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,30,60,0.2); }
                .modal-input:focus { border-color: ${NAVY} !important; background: #fff !important; }
            `}</style>

            <div className="max-w-4xl mx-auto">

                {/* ── PAGE HEADER ── */}
                <div className="flex items-center justify-between mb-6 animate-[fadeUp_0.3s_ease_both]">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1 h-4.5 bg-cyan-400 rounded-sm" />
                            <h1 className="text-lg font-black text-gray-900 tracking-tight">
                                {isAdmin ? 'Administrative Identity' : 'Citizen Profile'}
                            </h1>
                        </div>
                        <p className="text-xs text-slate-400 ml-3">
                            {isAdmin ? 'Your administrative account details' : 'Manage your personal information and property links'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-[260px_1fr] gap-5">

                    {/* ── LEFT: Identity Card ── */}
                    <div className="profile-card" style={{ animationDelay: '0.05s' }}>
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            {/* Navy top band */}
                            <div className="bg-blue-900 pt-8 px-6 pb-14 relative text-center">
                                <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                                <div className="absolute bottom-[-32px] left-1/2 -translate-x-1/2 w-16 h-16 bg-cyan-400 rounded-full border-4 border-white flex items-center justify-center text-2xl font-black text-blue-900 z-10 shadow-lg">
                                    {user?.name?.[0]?.toUpperCase()}
                                </div>
                                <p className="text-white/40 text-xs uppercase tracking-wider relative z-10">
                                    {isAdmin ? 'Administrator' : 'Citizen Account'}
                                </p>
                            </div>

                            {/* Info section */}
                            <div className="px-6 pt-10 pb-6 text-center">
                                <h3 className="font-black text-base text-gray-900 mb-0.5">{user?.name}</h3>
                                <p className="text-xs text-slate-400 mb-6">
                                    {isAdmin ? user?.role : `Member since ${new Date(user?.created_at).getFullYear()}`}
                                </p>

                                <div className="flex flex-col gap-2.5 text-left border-t border-slate-100 pt-5">
                                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-md">
                                        <Mail className="w-3 text-slate-400 flex-shrink-0" />
                                        <span className="text-xs text-slate-700 font-medium truncate">{user?.email}</span>
                                    </div>
                                    {!isAdmin && (
                                        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-md">
                                            <Phone className="w-3 text-slate-400 flex-shrink-0" />
                                            <span className="text-xs text-slate-700 font-medium">{user?.phone || 'Not provided'}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-md">
                                        <Shield className="w-3 text-slate-400 flex-shrink-0" />
                                        <span className="text-xs text-slate-700 font-medium">{user?.role || 'USER'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: Details ── */}
                    <div className="flex flex-col gap-5">

                        {/* Security Credentials */}
                        <div className="profile-card bg-white rounded-xl border border-slate-200 p-6" style={{ animationDelay: '0.1s' }}>
                            <div className="flex items-center gap-2 mb-5">
                                <div className="bg-blue-50 p-1.5 rounded-md">
                                    <Lock className="w-3 text-sky-700" />
                                </div>
                                <h4 className="font-extrabold text-sm text-gray-900">Security Credentials</h4>
                                <span className="ml-auto text-xs font-bold px-2 py-0.5 bg-green-50 text-green-600 rounded-full">Read-only</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3.5 mb-4">
                                <div>
                                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 text-slate-300" />
                                        <input type="text" defaultValue={user?.name} className={inputClass} readOnly />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 text-slate-300" />
                                        <input type="text" defaultValue={user?.email} className={inputClass} readOnly />
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2">
                                <Shield className="w-3 text-slate-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-0.5">Immutable Identity</p>
                                    <p className="text-xs text-slate-600 leading-relaxed">Identity records can only be modified by the IT Department through official channels.</p>
                                </div>
                            </div>
                        </div>

                        {/* Linked Properties (user only) */}
                        {!isAdmin && (
                            <div className="profile-card bg-white rounded-xl border border-slate-200 p-6" style={{ animationDelay: '0.15s' }}>
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="bg-purple-50 p-1.5 rounded-md">
                                        <Building2 className="w-3 text-purple-600" />
                                    </div>
                                    <h4 className="font-extrabold text-sm text-gray-900">Linked Properties</h4>
                                    <span className="ml-auto text-xs font-bold px-2 py-0.5 bg-slate-50 text-slate-600 rounded-full border border-slate-200">
                                        {user?.properties?.length || 0} linked
                                    </span>
                                </div>

                                {user?.properties && user.properties.length > 0 ? (
                                    <div className="flex flex-col gap-2.5">
                                        {user.properties.map((up: any) => {
                                            const s = getStatusConfig(up.status);
                                            const Icon = s.icon;
                                            return (
                                                <div key={up.property.id} className="prop-item flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-lg border border-slate-100 transition-colors">
                                                    <div className="w-9.5 h-9.5 bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <Building2 className="w-4 text-cyan-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-sm text-gray-900 mb-0.5 truncate">{up.property.address}</p>
                                                        <p className="text-xs text-slate-400">{up.property.suburb} · Stand {up.property.stand_number}</p>
                                                    </div>
                                                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-600 border border-green-200 rounded-full text-xs font-bold flex-shrink-0">
                                                        <Icon className="w-2.5" />
                                                        {s.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl">
                                        <Building2 className="w-8 mx-auto mb-3 text-slate-300 block" />
                                        <p className="font-bold text-sm text-slate-700 mb-1">No Properties Linked</p>
                                        <p className="text-xs text-slate-400">Link a property to access billing and payment history.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Admin block */}
                        {isAdmin && (
                            <div className="profile-card bg-white rounded-xl border-2 border-blue-900 p-6" style={{ animationDelay: '0.15s' }}>
                                <div className="flex items-center gap-2 mb-3.5">
                                    <div className="bg-blue-900 p-1.5 rounded-md">
                                        <Shield className="w-3 text-cyan-400" />
                                    </div>
                                    <h4 className="font-extrabold text-sm text-blue-900">Administrative Access</h4>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    As an official of the City of Mutare, your account holds elevated privileges to manage municipal operations.
                                    All administrative actions are logged and subject to audit by the Supervisory Committee.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            </Layout>
    );
};

export default ProfilePage;
