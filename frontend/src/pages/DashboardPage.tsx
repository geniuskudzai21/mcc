import React from 'react';
import Layout from '../components/Layout';
import {
    TrendingUp, AlertCircle, Calendar, CheckCircle2,
    Home as HomeIcon, Bell, FileText,
    ChevronRight, Wrench, Megaphone, CreditCard, Clock
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';

const ACCENT = '#09d6f1';
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', border: `3px solid ${ACCENT}`, borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Loading your portal...</p>
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
        <Layout hideHeader>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideInLeft { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
                .dash-card { animation: fadeIn 0.4s ease both; }
                .action-btn { transition: all 0.2s cubic-bezier(0.4,0,0.2,1); }
                .action-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,30,60,0.18); }
                .action-btn:active { transform: translateY(0); }
                .bill-row { transition: background 0.15s ease; }
                .bill-row:hover { background: #f8fafc; }
                .prop-row { transition: background 0.15s ease; }
                .prop-row:hover { background: #f0f9ff; cursor: pointer; }
                .ann-item { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
                .ann-item:hover { border-color: ${ACCENT}; box-shadow: 0 2px 8px rgba(9,214,241,0.12); }
                .metric-card { animation: fadeIn 0.4s ease both; transition: box-shadow 0.2s ease, transform 0.2s ease; }
                .metric-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.08); }
            `}</style>

            {/* ── HERO HEADER ── */}
            <div className="dash-header" style={{
                background: NAVY, borderRadius: '16px',
                borderTop: `3px solid ${ACCENT}`,
                padding: '2rem 2.5rem', marginBottom: '1.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                position: 'relative', overflow: 'hidden',
                animation: 'fadeIn 0.3s ease both'
            }}>
                {/* Dot pattern */}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '20px 20px', pointerEvents: 'none' }} />
                {/* Accent line */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: ACCENT }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
                        {greeting}
                    </p>
                    <h1 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
                        {user?.name || 'Welcome back'}
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.825rem' }}>
                        Mutare Municipal Digital Billing Portal
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                    {outstanding > 0 && (
                        <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '1rem 1.5rem', textAlign: 'right' }}>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Outstanding Balance</p>
                            <p style={{ color: '#fca5a5', fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em' }}>${outstanding.toFixed(2)}</p>
                            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', marginTop: '2px' }}>
                                {lastBill ? `Due ${new Date(lastBill.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}` : ''}
                            </p>
                        </div>
                    )}
                    {outstanding === 0 && (
                        <div style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '12px', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <CheckCircle2 style={{ width: '20px', color: '#4ade80' }} />
                            <div>
                                <p style={{ color: '#4ade80', fontWeight: 800, fontSize: '0.875rem' }}>All Clear</p>
                                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem' }}>No outstanding balance</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── METRIC CARDS ── */}
            <div className="dash-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    {
                        icon: <CreditCard style={{ width: '18px', color: ACCENT }} />,
                        label: 'Outstanding', value: `$${outstanding.toFixed(2)}`,
                        sub: unpaidBills.length > 0 ? `${unpaidBills.length} unpaid bill${unpaidBills.length > 1 ? 's' : ''}` : 'No pending bills',
                        accent: outstanding > 0 ? '#fef2f2' : '#f0fdf4',
                        delay: '0s'
                    },
                    {
                        icon: <CheckCircle2 style={{ width: '18px', color: '#16a34a' }} />,
                        label: 'Total Paid', value: `$${paidTotal.toFixed(2)}`,
                        sub: `${bills?.filter((b: any) => b.status === 'PAID').length || 0} bills settled`,
                        accent: '#f0fdf4',
                        delay: '0.05s'
                    },
                    {
                        icon: <HomeIcon style={{ width: '18px', color: '#7c3aed' }} />,
                        label: 'Properties', value: `${properties.length}`,
                        sub: 'Linked to account',
                        accent: '#faf5ff',
                        delay: '0.1s'
                    },
                    {
                        icon: <Wrench style={{ width: '18px', color: '#d97706' }} />,
                        label: 'Active Requests', value: `${activeRequests.length}`,
                        sub: 'Pending resolution',
                        accent: '#fffbeb',
                        delay: '0.15s'
                    },
                ].map((m, i) => (
                    <div key={i} className="dash-card" style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', border: '1px solid #f3f4f6', animationDelay: m.delay }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280' }}>{m.label}</span>
                            <div style={{ background: m.accent, borderRadius: '8px', padding: '6px' }}>{m.icon}</div>
                        </div>
                        <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>{m.value}</p>
                        <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{m.sub}</p>
                    </div>
                ))}
            </div>

            {/* ── MAIN GRID ── */}
            <div className="dash-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: '1rem', marginBottom: '1.5rem' }}>

                {/* Billing History Chart */}
                <div className="dash-card" style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #f3f4f6', animationDelay: '0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                        <div>
                            <h3 style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827', marginBottom: '2px' }}>Billing History</h3>
                            <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Last 6 billing periods</p>
                        </div>
                        <TrendingUp style={{ width: '16px', color: ACCENT }} />
                    </div>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={180}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={ACCENT} stopOpacity={0.15} />
                                        <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                <Tooltip
                                    cursor={{ stroke: ACCENT, strokeWidth: 1, strokeDasharray: '4 4' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                    formatter={(val: any) => [`$${val}`, 'Bill Amount']}
                                />
                                <Area type="monotone" dataKey="amount" stroke={ACCENT} strokeWidth={2} fill="url(#areaGrad)" dot={{ fill: ACCENT, r: 3, strokeWidth: 0 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>No billing history yet</div>
                    )}
                </div>

                {/* Unpaid Bills */}
                <div className="dash-card" style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #f3f4f6', animationDelay: '0.25s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                        <div>
                            <h3 style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827', marginBottom: '2px' }}>Outstanding Bills</h3>
                            <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Action required</p>
                        </div>
                        <button onClick={() => navigate('/bills')} style={{ fontSize: '0.7rem', color: NAVY, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            View All <ChevronRight style={{ width: '12px' }} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {unpaidBills.length > 0 ? unpaidBills.slice(0, 4).map((bill: any) => (
                            <div key={bill.id} className="bill-row" onClick={() => navigate(`/bills/${bill.id}`)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.15s', border: '1px solid #f3f4f6' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '32px', height: '32px', background: bill.status === 'OVERDUE' ? '#fef2f2' : '#fffbeb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FileText style={{ width: '14px', color: bill.status === 'OVERDUE' ? '#dc2626' : '#d97706' }} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111827' }}>
                                            {new Date(bill.billing_year, bill.billing_month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                        </p>
                                        <p style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Due {new Date(bill.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '0.875rem', fontWeight: 800, color: '#111827' }}>${parseFloat(bill.total_amount).toFixed(2)}</p>
                                    <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '2px 7px', borderRadius: '999px', background: bill.status === 'OVERDUE' ? '#fef2f2' : '#fffbeb', color: bill.status === 'OVERDUE' ? '#dc2626' : '#d97706' }}>
                                        {bill.status}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '160px', gap: '8px' }}>
                                <CheckCircle2 style={{ width: '32px', color: '#16a34a' }} />
                                <p style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 600 }}>All bills paid!</p>
                                <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>No outstanding balance</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="dash-card dash-actions-col" style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: '0.75rem', animationDelay: '0.3s' }}>
                    <h3 style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827', marginBottom: '0.25rem' }}>Quick Actions</h3>

                    <button className="action-btn" onClick={() => navigate('/bills')} style={{
                        width: '100%', padding: '0.625rem 0.875rem',
                        background: NAVY, color: 'white', border: 'none',
                        borderRadius: '8px', fontWeight: 700, fontSize: '0.78rem',
                        display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                        letterSpacing: '0.02em',
                    }}>
                        <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '5px', padding: '4px', display: 'flex' }}>
                            <Calendar style={{ width: '13px' }} />
                        </div>
                        Pay My Bills
                    </button>

                    <button className="action-btn" onClick={() => navigate('/requests')} style={{
                        width: '100%', padding: '0.625rem 0.875rem',
                        background: '#fff7ed', color: '#c2410c',
                        border: '1.5px solid #fed7aa', borderRadius: '8px',
                        fontWeight: 700, fontSize: '0.78rem',
                        display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                    }}>
                        <div style={{ background: 'rgba(194,65,12,0.1)', borderRadius: '5px', padding: '4px', display: 'flex' }}>
                            <AlertCircle style={{ width: '13px' }} />
                        </div>
                        Report an Issue
                    </button>

                    <button className="action-btn" onClick={() => navigate('/profile')} style={{
                        width: '100%', padding: '0.625rem 0.875rem',
                        background: '#f0f9ff', color: '#0369a1',
                        border: '1.5px solid #bae6fd', borderRadius: '8px',
                        fontWeight: 700, fontSize: '0.78rem',
                        display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                    }}>
                        <div style={{ background: 'rgba(3,105,161,0.1)', borderRadius: '5px', padding: '4px', display: 'flex' }}>
                            <HomeIcon style={{ width: '13px' }} />
                        </div>
                        My Profile
                    </button>

                    {/* Contact block */}
                    <div style={{ marginTop: 'auto', padding: '0.875rem', background: '#f9fafb', borderRadius: '10px', border: '1px solid #f3f4f6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.35rem' }}>
                            <div style={{ width: '6px', height: '6px', background: '#16a34a', borderRadius: '50%' }} />
                            <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Support Hotline</p>
                        </div>
                        <p style={{ fontWeight: 900, color: NAVY, fontSize: '0.9rem' }}>+263 20 20601</p>
                        <p style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Mon–Fri, 8AM – 5PM</p>
                    </div>
                </div>
            </div>

            {/* ── BOTTOM GRID: Announcements + Properties ── */}
            <div className="dash-bottom-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1rem' }}>

                {/* Announcements */}
                <div className="dash-card" style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #f3f4f6', animationDelay: '0.35s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Megaphone style={{ width: '16px', color: ACCENT }} />
                            <h3 style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827' }}>City Announcements</h3>
                        </div>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#f0f9ff', color: '#0369a1', padding: '3px 10px', borderRadius: '999px' }}>
                            {announcements?.length || 0} notices
                        </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                        {announcements?.length > 0 ? announcements.slice(0, 4).map((ann: any) => (
                            <div key={ann.id} className="ann-item" style={{ display: 'flex', gap: '1rem', padding: '0.875rem', border: '1px solid #f3f4f6', borderRadius: '10px', transition: 'border-color 0.2s', cursor: 'default' }}>
                                <div style={{ textAlign: 'center', minWidth: '40px', background: NAVY, borderRadius: '8px', padding: '0.5rem 0.25rem', flexShrink: 0 }}>
                                    <p style={{ color: ACCENT, fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase' }}>
                                        {new Date(ann.created_at).toLocaleString('default', { month: 'short' })}
                                    </p>
                                    <p style={{ color: 'white', fontSize: '1rem', fontWeight: 900, lineHeight: 1 }}>
                                        {new Date(ann.created_at).getDate()}
                                    </p>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontWeight: 700, fontSize: '0.85rem', color: '#111827', marginBottom: '0.25rem' }}>{ann.title}</h4>
                                    <p style={{ fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.5 }}>{ann.body}</p>
                                </div>
                            </div>
                        )) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '120px', gap: '8px' }}>
                                <Bell style={{ width: '28px', color: '#d1d5db' }} />
                                <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No announcements at this time</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Linked Properties */}
                <div className="dash-card" style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #f3f4f6', animationDelay: '0.4s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                        <h3 style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827' }}>Linked Properties</h3>
                        <div style={{ background: '#f0f9ff', color: NAVY, fontSize: '0.65rem', fontWeight: 800, padding: '3px 10px', borderRadius: '999px' }}>
                            {properties.length} linked
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                        {properties.length > 0 ? properties.map((p: any) => (
                            <div key={p.id} className="prop-row" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem', borderRadius: '10px', transition: 'background 0.15s', border: '1px solid #f3f4f6' }}>
                                <div style={{ width: '40px', height: '40px', background: NAVY, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <HomeIcon style={{ width: '18px', color: ACCENT }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.825rem', fontWeight: 700, color: '#111827', marginBottom: '2px' }}>{p.property.address}</p>
                                    <p style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{p.property.suburb} · Stand {p.property.stand_number}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{
                                        fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px',
                                        background: p.status === 'VERIFIED' ? '#f0fdf4' : p.status === 'REJECTED' ? '#fef2f2' : '#fffbeb',
                                        color: p.status === 'VERIFIED' ? '#16a34a' : p.status === 'REJECTED' ? '#dc2626' : '#d97706'
                                    }}>
                                        {p.status}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '150px', gap: '8px' }}>
                                <HomeIcon style={{ width: '32px', color: '#d1d5db' }} />
                                <p style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 600 }}>No properties linked</p>
                                <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Contact admin to link your property</p>
                            </div>
                        )}
                    </div>

                    {/* Account info */}
                    {properties.length > 0 && (
                        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock style={{ width: '13px', color: '#9ca3af' }} />
                            <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Account No: <strong style={{ color: NAVY }}>{properties[0]?.property?.account_number}</strong></span>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default DashboardPage;
