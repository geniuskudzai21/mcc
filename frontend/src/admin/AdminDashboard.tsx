import React, { useState } from 'react';
import Layout from '../components/Layout';
import {
    DollarSign,
    Users,
    AlertCircle,
    FileText,
    TrendingUp,
    Building2,
    X,
    Check,
    Megaphone
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const AdminDashboard: React.FC = () => {
    const queryClient = useQueryClient();
    const [showTariffModal, setShowTariffModal] = useState(false);
    const [showPropertyModal, setShowPropertyModal] = useState(false);
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
    const [newTariff, setNewTariff] = useState({ service_type: '', cost_per_unit: '' });
    const [announcement, setAnnouncement] = useState({ title: '', body: '' });

    const { data: metrics, isLoading: metricsLoading } = useQuery({
        queryKey: ['admin-dashboard'],
        queryFn: async () => {
            const res = await api.get('/admin/dashboard');
            console.log('Dashboard metrics:', res.data);
            return res.data;
        }
    });

    const { data: tariffs } = useQuery({
        queryKey: ['admin-tariffs'],
        queryFn: async () => {
            const res = await api.get('/admin/tariffs');
            return res.data;
        },
        enabled: showTariffModal
    });

    const { data: properties } = useQuery({
        queryKey: ['admin-properties'],
        queryFn: async () => {
            const res = await api.get('/admin/properties');
            return res.data;
        },
        enabled: showPropertyModal
    });

    const { data: announcements } = useQuery({
        queryKey: ['admin-announcements'],
        queryFn: async () => {
            const res = await api.get('/admin/announcements');
            return res.data;
        },
        enabled: showAnnouncementModal
    });

    const generateBillsMutation = useMutation({
        mutationFn: async () => {
            return api.post('/admin/generate-bills');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
            alert('Bills generated successfully!');
        },
        onError: () => {
            alert('Failed to generate bills');
        }
    });

    const createTariffMutation = useMutation({
        mutationFn: async () => {
            return api.post('/admin/tariffs', {
                service_type: newTariff.service_type,
                cost_per_unit: parseFloat(newTariff.cost_per_unit)
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-tariffs'] });
            setNewTariff({ service_type: '', cost_per_unit: '' });
            alert('Tariff created successfully!');
        },
        onError: () => {
            alert('Failed to create tariff');
        }
    });

    const createAnnouncementMutation = useMutation({
        mutationFn: async () => {
            return api.post('/admin/announcements', announcement);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
            setAnnouncement({ title: '', body: '' });
            setShowAnnouncementModal(false);
            alert('Announcement sent to all users!');
        },
        onError: () => {
            alert('Failed to send announcement');
        }
    });

    const formatNumber = (num: number | undefined | null) => {
        if (num === undefined || num === null) return '0.00';
        return Number(num).toFixed(2);
    };

    // Use real weekly revenue data from the API, with a sensible fallback
    const data = (metrics?.weeklyRevenue && metrics.weeklyRevenue.length > 0)
        ? metrics.weeklyRevenue
        : [{ name: 'Week 1', revenue: 0 }];

    return (
        <Layout isAdmin>
            <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="stat-card">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="stat-icon-wrapper bg-blue-light" style={{ width: '3rem', height: '3rem' }}>
                            <DollarSign className="nav-icon" style={{ width: '1.25rem' }} />
                        </div>
                        <div>
                            <p className="stat-label">Daily Collection</p>
                            <h3 className="stat-value">${formatNumber(metrics?.revenueToday)}</h3>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="stat-icon-wrapper bg-orange-light" style={{ width: '3rem', height: '3rem' }}>
                            <TrendingUp className="nav-icon" style={{ width: '1.25rem' }} />
                        </div>
                        <div>
                            <p className="stat-label">Outstanding Arrears</p>
                            <h3 className="stat-value">${formatNumber(metrics?.outstanding)}</h3>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="stat-icon-wrapper bg-green-light" style={{ width: '3rem', height: '3rem' }}>
                            <Users className="nav-icon" style={{ width: '1.25rem' }} />
                        </div>
                        <div>
                            <p className="stat-label">Active Residents</p>
                            <h3 className="stat-value">{metrics?.totalUsers || 0}</h3>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="stat-icon-wrapper bg-red-light" style={{ width: '3rem', height: '3rem' }}>
                            <AlertCircle className="nav-icon" style={{ width: '1.25rem' }} />
                        </div>
                        <div>
                            <p className="stat-label">Pending Requests</p>
                            <h3 className="stat-value">{metrics?.pendingRequests || 0}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem', minWidth: 0 }}>
                <div className="chart-card" style={{ gridColumn: 'span 1', minWidth: 0 }}>
                    <div className="card-title-row">
                        <div>
                            <h3 className="card-title">Monthly Collections</h3>
                            <p className="page-subtitle">Current month: ${formatNumber(metrics?.revenueMonth)}</p>
                        </div>
                    </div>
                    <div style={{ height: '300px', width: '100%', minWidth: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="stat-card">
                    <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>Administrative Tasks</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button
                            className="admin-action-btn"
                            onClick={() => generateBillsMutation.mutate()}
                            disabled={generateBillsMutation.isPending}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <FileText className="nav-icon" />
                                <span style={{ fontWeight: 700, fontSize: '14px' }}>
                                    {generateBillsMutation.isPending ? 'Generating Bills...' : 'Generate Monthly Bills'}
                                </span>
                            </div>
                            <Check style={{ width: '14px', color: '#16a34a' }} />
                        </button>

                        <button className="admin-action-btn" onClick={() => setShowTariffModal(true)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <DollarSign className="nav-icon" />
                                <span style={{ fontWeight: 700, fontSize: '14px' }}>Manage Tariffs</span>
                            </div>
                        </button>

                        <button className="admin-action-btn" onClick={() => setShowPropertyModal(true)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Building2 className="nav-icon" />
                                <span style={{ fontWeight: 700, fontSize: '14px' }}>Property Audit</span>
                            </div>
                        </button>

                        <button className="admin-action-btn" onClick={() => setShowAnnouncementModal(true)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Megaphone className="nav-icon" />
                                <span style={{ fontWeight: 700, fontSize: '14px' }}>Send Announcement</span>
                            </div>
                            <Check style={{ width: '14px', color: '#16a34a' }} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Tariff Modal */}
            {showTariffModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', width: '500px', maxHeight: '80vh', overflow: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Manage Tariffs</h3>
                            <button onClick={() => setShowTariffModal(false)}><X style={{ width: '20px' }} /></button>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '0.5rem' }}>Add New Tariff</h4>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="Service type"
                                    value={newTariff.service_type}
                                    onChange={(e) => setNewTariff({ ...newTariff, service_type: e.target.value })}
                                    style={{ flex: 1, padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                                />
                                <input
                                    type="number"
                                    placeholder="Cost"
                                    value={newTariff.cost_per_unit}
                                    onChange={(e) => setNewTariff({ ...newTariff, cost_per_unit: e.target.value })}
                                    style={{ width: '100px', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                                />
                                <button
                                    onClick={() => createTariffMutation.mutate()}
                                    disabled={!newTariff.service_type || !newTariff.cost_per_unit}
                                    style={{ padding: '0.5rem 1rem', background: '#2563eb', color: 'white', borderRadius: '6px', fontWeight: 500 }}
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        <div>
                            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '0.5rem' }}>Current Tariffs</h4>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <th style={{ textAlign: 'left', padding: '0.5rem', fontSize: '12px' }}>Service</th>
                                        <th style={{ textAlign: 'right', padding: '0.5rem', fontSize: '12px' }}>Cost</th>
                                        <th style={{ textAlign: 'right', padding: '0.5rem', fontSize: '12px' }}>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tariffs?.map((t: any) => (
                                        <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '0.5rem', fontSize: '13px' }}>{t.service_type}</td>
                                            <td style={{ padding: '0.5rem', fontSize: '13px', textAlign: 'right' }}>${parseFloat(t.cost_per_unit).toFixed(2)}</td>
                                            <td style={{ padding: '0.5rem', fontSize: '13px', textAlign: 'right' }}>{new Date(t.effective_date).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Property Modal */}
            {showPropertyModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', width: '600px', maxHeight: '80vh', overflow: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Property Audit</h3>
                            <button onClick={() => setShowPropertyModal(false)}><X style={{ width: '20px' }} /></button>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <th style={{ textAlign: 'left', padding: '0.5rem', fontSize: '12px' }}>Stand</th>
                                    <th style={{ textAlign: 'left', padding: '0.5rem', fontSize: '12px' }}>Address</th>
                                    <th style={{ textAlign: 'left', padding: '0.5rem', fontSize: '12px' }}>Owner</th>
                                    <th style={{ textAlign: 'left', padding: '0.5rem', fontSize: '12px' }}>Account</th>
                                    <th style={{ textAlign: 'left', padding: '0.5rem', fontSize: '12px' }}>Users</th>
                                </tr>
                            </thead>
                            <tbody>
                                {properties?.map((p: any) => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '0.5rem', fontSize: '13px' }}>{p.stand_number}</td>
                                        <td style={{ padding: '0.5rem', fontSize: '13px' }}>{p.address}, {p.suburb}</td>
                                        <td style={{ padding: '0.5rem', fontSize: '13px' }}>{p.owner_name}</td>
                                        <td style={{ padding: '0.5rem', fontSize: '13px', fontFamily: 'monospace' }}>{p.account_number}</td>
                                        <td style={{ padding: '0.5rem', fontSize: '13px' }}>{p.users?.length || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Announcement Modal */}
            {showAnnouncementModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', width: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Send Announcement</h3>
                            <button onClick={() => setShowAnnouncementModal(false)}><X style={{ width: '20px' }} /></button>
                        </div>

                        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '1.5rem' }}>
                            This announcement will be sent to all registered users.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '0.25rem' }}>Title</label>
                                <input
                                    type="text"
                                    placeholder="Announcement title"
                                    value={announcement.title}
                                    onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                                    style={{ width: '100%', padding: '0.625rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '0.25rem' }}>Message</label>
                                <textarea
                                    rows={4}
                                    placeholder="Enter your announcement message..."
                                    value={announcement.body}
                                    onChange={(e) => setAnnouncement({ ...announcement, body: e.target.value })}
                                    style={{ width: '100%', padding: '0.625rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <button
                                onClick={() => setShowAnnouncementModal(false)}
                                style={{ flex: 1, padding: '0.625rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontWeight: 600, background: '#f9fafb' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => createAnnouncementMutation.mutate()}
                                disabled={!announcement.title || !announcement.body || createAnnouncementMutation.isPending}
                                style={{ flex: 1, padding: '0.625rem', background: '#2563eb', color: 'white', borderRadius: '8px', fontWeight: 600, opacity: (!announcement.title || !announcement.body) ? 0.5 : 1 }}
                            >
                                {createAnnouncementMutation.isPending ? 'Sending...' : 'Send to All Users'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default AdminDashboard;
