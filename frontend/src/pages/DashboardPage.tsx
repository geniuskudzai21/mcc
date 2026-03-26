import React, { useState } from 'react';
import Layout from '../components/Layout';
import {
    TrendingUp, AlertCircle, Calendar, CheckCircle2,
    Home as HomeIcon, Bell, FileText,
    ChevronRight, Wrench, Megaphone, CreditCard, Clock, Menu
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';

const ACCENT = '#2563eb';
const NAVY = '#001e3c';

const DashboardPage: React.FC = () => {
    const { user: authUser } = useAuth();
    const navigate = useNavigate();

    if (authUser?.role && authUser.role !== 'USER') {
        return <Navigate to="/admin" replace />;
    }

    const { data: user, isLoading: userLoading } = useQuery({
        queryKey: ['user-me'],
        queryFn: async () => { const res = await api.get('/users/me'); return res.data; }
    });

    const { data: bills, isLoading: billsLoading } = useQuery({
        queryKey: ['bills'],
        queryFn: async () => { const res = await api.get('/bills'); return res.data; }
    });

    const { data: requests, isLoading: requestsLoading } = useQuery({
        queryKey: ['requests'],
        queryFn: async () => { const res = await api.get('/requests'); return res.data; }
    });

    const { data: announcements } = useQuery({
        queryKey: ['announcements'],
        queryFn: async () => { const res = await api.get('/public/announcements'); return res.data; }
    });

    if (userLoading || billsLoading || requestsLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-[60vh] flex-col gap-4">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <p className="text-slate-500 text-sm">Loading your portal...</p>
                </div>
            </Layout>
        );
    }

    const outstanding = bills?.reduce((sum: number, bill: any) =>
        (bill.status === 'UNPAID' || bill.status === 'OVERDUE') ? sum + parseFloat(bill.total_amount) : sum, 0
    ) || 0;

    const paidTotal = bills?.reduce((sum: number, bill: any) =>
        bill.status === 'PAID' ? sum + parseFloat(bill.total_amount) : sum, 0
    ) || 0;

    const lastBill = bills?.[0];
    const properties = user?.properties || [];
    const activeRequests = requests?.filter((r: any) => r.status === 'PENDING' || r.status === 'IN_PROGRESS') || [];
    const unpaidBills = bills?.filter((b: any) => b.status === 'UNPAID' || b.status === 'OVERDUE') || [];

    const chartData = [...(bills || [])]
        .slice(0, 6).reverse()
        .map((bill: any) => ({
            name: new Date(bill.billing_year, bill.billing_month - 1).toLocaleString('default', { month: 'short' }),
            amount: parseFloat(bill.total_amount)
        }));

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <Layout>
            <div>
            
                <div className="relative overflow-hidden rounded-2xl p-4 sm:p-6 mb-6 justify-between z-10 flex flex-col sm:flex-row gap-4" style={{ background: NAVY }}>
                    <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:20px_20px] pointer-events-none" />
                    <div className="absolute top-0 left-0 right-0 h-[4px] bg-blue-600" />

                    <div className="relative z-10">
                        <p className="text-white/50 text-xs uppercase tracking-widest mb-1">{greeting}</p>
                        <h1 className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight mb-1">{user?.name || 'Welcome back'}</h1>
                        <p className="text-white/45 text-sm">Mutare Municipal Digital Billing Portal</p>
                    </div>

                    <div className="relative z-10">
                        {outstanding > 0 && (
                            <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-3 sm:p-4 text-right">
                                <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Outstanding Balance</p>
                                <p className="text-red-200 text-xl sm:text-2xl font-extrabold tracking-tight">${outstanding.toFixed(2)}</p>
                                <p className="text-white/35 text-xs mt-0.5">
                                    {lastBill ? `Due ${new Date(lastBill.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}` : ''}
                                </p>
                            </div>
                        )}
                        {outstanding === 0 && (
                            <div className="bg-green-500/15 border border-green-500/30 rounded-xl p-3 sm:p-4 flex items-center gap-2.5">
                                <CheckCircle2 className="w-5 text-green-400" />
                                <div>
                                    <p className="text-green-400 font-extrabold text-sm">All Clear</p>
                                    <p className="text-white/35 text-xs">No outstanding balance</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                        { icon: <CreditCard className="w-4.5 h-4.5 text-blue-600" />, label: 'Outstanding', value: `$${outstanding.toFixed(2)}`, sub: unpaidBills.length > 0 ? `${unpaidBills.length} unpaid bill${unpaidBills.length > 1 ? 's' : ''}` : 'No pending bills', bg: outstanding > 0 ? 'bg-red-50' : 'bg-green-50' },
                        { icon: <CheckCircle2 className="w-4.5 h-4.5 text-green-600" />, label: 'Total Paid', value: `$${paidTotal.toFixed(2)}`, sub: `${bills?.filter((b: any) => b.status === 'PAID').length || 0} bills settled`, bg: 'bg-green-50' },
                        { icon: <HomeIcon className="w-4.5 h-4.5 text-purple-600" />, label: 'Properties', value: `${properties.length}`, sub: 'Linked to account'},
                        { icon: <Wrench className="w-4.5 h-4.5 text-amber-600" />, label: 'Active Requests', value: `${activeRequests.length}`, sub: 'Pending resolution', bg: 'bg-amber-50' },
                    ].map((m, i) => (
                        <div key={i} className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1 animate-[fadeIn_0.4s_ease_both] cursor-pointer" style={{ animationDelay: `${i * 0.05}s` }}>
                            <div className="flex items-center justify-between mb-3.5">
                                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">{m.label}</span>
                                {m.icon}
                            </div>
                            <p className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mb-1">{m.value}</p>
                            <p className="text-xs text-slate-400">{m.sub}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr_320px] gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-lg shadow-blue-600/20 animate-[fadeIn_0.4s_ease_both]" style={{ animationDelay: '0.2s' }}>
                            <div className="flex items-center gap-3.5 mb-3.5">
                                <div className="w-12 h-12 bg-white rounded-xl border-2 border-slate-200 flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                    <TrendingUp className="w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-sm text-gray-900 mb-0.5">Billing History</h3>
                                    <p className="text-xs text-slate-400">Last 6 billing periods</p>
                                </div>
                            </div>
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={180}>
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="areaGradDash" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={ACCENT} stopOpacity={0.15} />
                                            <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                    <Tooltip cursor={{ stroke: ACCENT, strokeWidth: 1, strokeDasharray: '4 4' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} formatter={(val: any) => [`$${val}`, 'Bill Amount']} />
                                    <Area type="monotone" dataKey="amount" stroke={ACCENT} strokeWidth={2} fill="url(#areaGradDash)" dot={{ fill: ACCENT, r: 3, strokeWidth: 0 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[180px] flex items-center justify-center text-slate-400 text-sm">No billing history yet</div>
                        )}
                    </div>

                    <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-lg shadow-blue-600/20 animate-[fadeIn_0.4s_ease_both]" style={{ animationDelay: '0.25s' }}>
                            <div className="flex items-center gap-3.5 mb-3.5">
                                <div>
                                    <h3 className="font-extrabold text-sm text-gray-900 mb-0.5">Outstanding Bills</h3>
                                    <p className="text-xs text-slate-400">Action required</p>
                                </div>
                                <button onClick={() => navigate('/bills')} className="text-xs font-extrabold text-slate-800 bg-none border-none cursor-pointer flex items-center gap-0.5 hover:text-blue-600 transition-all duration-300 transform hover:scale-110">
                                    View All <ChevronRight className="w-3" />
                                </button>
                            </div>
                        <div className="flex flex-col gap-2">
                            {unpaidBills.length > 0 ? unpaidBills.slice(0, 4).map((bill: any) => (
                                <div key={bill.id} onClick={() => navigate(`/bills/${bill.id}`)} className="flex items-center justify-between p-3 rounded-lg cursor-pointer border border-slate-100 hover:bg-slate-50 transition-all duration-300 transform hover:scale-105 shadow-sm shadow-blue-600/10 hover:shadow-md hover:shadow-blue-600/20">
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110 ${bill.status === 'OVERDUE' ? 'bg-red-50' : 'bg-amber-50'}`}>
                                            <FileText className={`w-3.5 ${bill.status === 'OVERDUE' ? 'text-red-600' : 'text-amber-600'}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{new Date(bill.billing_year, bill.billing_month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                                            <p className="text-xs text-slate-400">Due {new Date(bill.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-extrabold text-gray-900">${parseFloat(bill.total_amount).toFixed(2)}</p>
                                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full transition-transform duration-300 transform hover:scale-105 ${bill.status === 'OVERDUE' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                            {bill.status}
                                        </span>
                                    </div>
                                </div>
                            )) : (
                                <div className="flex flex-col items-center justify-center h-40 gap-2">
                                    <CheckCircle2 className="w-8 text-green-600" />
                                    <p className="text-slate-600 text-sm font-semibold">All bills paid!</p>
                                    <p className="text-slate-400 text-xs">No outstanding balance</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 flex flex-col gap-3 shadow-lg shadow-blue-600/20 animate-[fadeIn_0.4s_ease_both]" style={{ animationDelay: '0.3s' }}>
                        <h3 className="font-extrabold text-sm text-gray-900 mb-1">Quick Actions</h3>

                        <button onClick={() => navigate('/bills')} className="w-full py-2 px-3.5 bg-green-200 text-green-900 border-1 border-green-400 rounded-lg font-bold text-xs flex items-center gap-2 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30">
                            <div className="rounded-lg p-1 transition-transform duration-300 transform hover:scale-110">
                                <Calendar className="w-3.5" />
                            </div>
                            Pay My Bills
                        </button>

                        <button onClick={() => navigate('/requests')} className="w-full py-2 px-3.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg font-bold text-xs flex items-center gap-2 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30">
                            <div className="rounded-lg p-1 transition-transform duration-300 transform hover:scale-110">
                                <AlertCircle className="w-3.5" />
                            </div>
                            Report an Issue
                        </button>

                        <button onClick={() => navigate('/profile')} className="w-full py-2 px-3.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-lg font-bold text-xs flex items-center gap-2 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30">
                            <div className="rounded-lg p-1 transition-transform duration-300 transform hover:scale-110">
                                <HomeIcon className="w-3.5" />
                            </div>
                            My Profile
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
                    <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-lg shadow-blue-600/20 animate-[fadeIn_0.4s_ease_both]" style={{ animationDelay: '0.35s' }}>
                        <div className="flex items-center gap-2 mb-3.5">
                            <div className="w-12 h-12 bg-white rounded-xl border-2 border-slate-200 flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                <Megaphone className="w-4 text-blue-600" />
                            </div>
                            <h3 className="font-extrabold text-sm text-gray-900">City Announcements</h3>
                            <span className="text-[10px] font-extrabold bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full transition-transform duration-300 transform hover:scale-105">
                                {announcements?.length || 0} notices
                            </span>
                        </div>
                        <div className="flex flex-col gap-2.5">
                            {announcements?.length > 0 ? announcements.slice(0, 4).map((ann: any) => (
                                <div key={ann.id} className="flex gap-4 p-3.5 border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all duration-300 transform hover:scale-105 cursor-default">
                                    <div className="text-center min-w-[40px] bg-slate-800 rounded-lg py-2 px-1 flex-shrink-0 transition-transform duration-300 transform hover:scale-110">
                                        <p className="text-blue-600 text-[10px] font-extrabold uppercase">
                                            {new Date(ann.created_at).toLocaleString('default', { month: 'short' })}
                                        </p>
                                        <p className="text-white text-base font-extrabold leading-tight">
                                            {new Date(ann.created_at).getDate()}
                                        </p>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-sm text-gray-900 mb-1">{ann.title}</h4>
                                        <p className="text-xs text-slate-500 leading-relaxed">{ann.body}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="flex flex-col items-center justify-center h-30 gap-2">
                                    <Bell className="w-7 text-slate-300" />
                                    <p className="text-slate-400 text-sm">No announcements at this time</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-lg shadow-blue-600/20 animate-[fadeIn_0.4s_ease_both]" style={{ animationDelay: '0.4s' }}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-extrabold text-sm text-gray-900">Linked Properties</h3>
                            <div className="bg-sky-50 text-slate-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                                {properties.length} linked
                            </div>
                        </div>
                        <div className="flex flex-col gap-2.5">
                            {properties.length > 0 ? properties.map((p: any) => (
                                <div key={p.id} className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-all duration-300 transform hover:scale-105">
                                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 transform hover:scale-110">
                                        <HomeIcon className="w-4.5 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-900 mb-0.5">{p.property.address}</p>
                                        <p className="text-xs text-slate-400">{p.property.suburb} · Stand {p.property.stand_number}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full transition-transform duration-300 transform hover:scale-105 ${p.status === 'VERIFIED' ? 'bg-green-50 text-green-600' : p.status === 'REJECTED' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                            {p.status}
                                        </span>
                                    </div>
                                </div>
                            )) : (
                                <div className="flex flex-col items-center justify-center h-[150px] gap-2">
                                    <HomeIcon className="w-8 text-slate-300" />
                                    <p className="text-slate-600 text-sm font-semibold">No properties linked</p>
                                    <p className="text-slate-400 text-xs">Contact admin to link your property</p>
                                </div>
                            )}
                        </div>

                        {properties.length > 0 && (
                            <div className="mt-4 p-3 bg-slate-50 rounded-lg flex items-center gap-2">
                                <Clock className="w-3.5 text-slate-400" />
                                <span className="text-xs text-slate-500">Account No: <strong className="text-slate-800">{properties[0]?.property?.account_number}</strong></span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </Layout>
    );
};

export default DashboardPage;
