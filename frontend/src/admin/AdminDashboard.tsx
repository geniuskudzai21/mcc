import React, { useState } from 'react';
import Layout from '../components/Layout';
import {
    DollarSign, Users, AlertCircle, FileText,
    TrendingUp, Building2, X, Check, Megaphone
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
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

    const { data: metrics } = useQuery({
        queryKey: ['admin-dashboard'],
        queryFn: async () => { const res = await api.get('/admin/dashboard'); return res.data; }
    });

    const { data: tariffs } = useQuery({
        queryKey: ['admin-tariffs'],
        queryFn: async () => { const res = await api.get('/admin/tariffs'); return res.data; },
        enabled: showTariffModal
    });

    const { data: properties } = useQuery({
        queryKey: ['admin-properties'],
        queryFn: async () => { const res = await api.get('/admin/properties'); return res.data; },
        enabled: showPropertyModal
    });

    const generateBillsMutation = useMutation({
        mutationFn: async () => api.post('/admin/generate-bills'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
            alert('Bills generated successfully!');
        },
        onError: () => alert('Failed to generate bills')
    });

    const createTariffMutation = useMutation({
        mutationFn: async () => api.post('/admin/tariffs', { service_type: newTariff.service_type, cost_per_unit: parseFloat(newTariff.cost_per_unit) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-tariffs'] });
            setNewTariff({ service_type: '', cost_per_unit: '' });
            alert('Tariff created successfully!');
        },
        onError: () => alert('Failed to create tariff')
    });

    const createAnnouncementMutation = useMutation({
        mutationFn: async () => api.post('/admin/announcements', announcement),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
            setAnnouncement({ title: '', body: '' });
            setShowAnnouncementModal(false);
            alert('Announcement sent to all users!');
        },
        onError: () => alert('Failed to send announcement')
    });

    const formatNumber = (num: number | undefined | null) => num === undefined || num === null ? '0.00' : Number(num).toFixed(2);

    const data = (metrics?.weeklyRevenue && metrics.weeklyRevenue.length > 0) ? metrics.weeklyRevenue : [{ name: 'Week 1', revenue: 0 }];

    return (
        <Layout isAdmin>
            <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center"><DollarSign className="w-5 h-5 text-blue-600" /></div>
                        <div><p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Daily Collection</p><h3 className="text-2xl font-extrabold text-gray-900">${formatNumber(metrics?.revenueToday)}</h3></div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-orange-600" /></div>
                        <div><p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Outstanding Arrears</p><h3 className="text-2xl font-extrabold text-gray-900">${formatNumber(metrics?.outstanding)}</h3></div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center"><Users className="w-5 h-5 text-green-600" /></div>
                        <div><p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Active Residents</p><h3 className="text-2xl font-extrabold text-gray-900">{metrics?.totalUsers || 0}</h3></div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center"><AlertCircle className="w-5 h-5 text-red-600" /></div>
                        <div><p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Pending Requests</p><h3 className="text-2xl font-extrabold text-gray-900">{metrics?.pendingRequests || 0}</h3></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-[1fr_350px] gap-6 min-w-0">
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm min-w-0">
                    <div className="flex items-center justify-between mb-6">
                        <div><h3 className="text-lg font-bold text-gray-900">Monthly Collections</h3><p className="text-sm text-slate-500">Current month: ${formatNumber(metrics?.revenueMonth)}</p></div>
                    </div>
                    <div className="h-[300px] w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorRevAdmin" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRevAdmin)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Administrative Tasks</h3>
                    <div className="flex flex-col gap-3">
                        <button className="w-full p-5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer transition-all hover:bg-slate-800 hover:text-white hover:border-slate-800" onClick={() => generateBillsMutation.mutate()} disabled={generateBillsMutation.isPending}>
                            <div className="flex items-center gap-4"><FileText className="w-5 h-5" /><span className="font-bold text-sm">{generateBillsMutation.isPending ? 'Generating Bills...' : 'Generate Monthly Bills'}</span></div>
                            <Check className="w-4 h-4 text-green-600" />
                        </button>

                        <button className="w-full p-5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer transition-all hover:bg-slate-800 hover:text-white hover:border-slate-800" onClick={() => setShowTariffModal(true)}>
                            <div className="flex items-center gap-4"><DollarSign className="w-5 h-5" /><span className="font-bold text-sm">Manage Tariffs</span></div>
                        </button>

                        <button className="w-full p-5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer transition-all hover:bg-slate-800 hover:text-white hover:border-slate-800" onClick={() => setShowPropertyModal(true)}>
                            <div className="flex items-center gap-4"><Building2 className="w-5 h-5" /><span className="font-bold text-sm">Property Audit</span></div>
                        </button>

                        <button className="w-full p-5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer transition-all hover:bg-slate-800 hover:text-white hover:border-slate-800" onClick={() => setShowAnnouncementModal(true)}>
                            <div className="flex items-center gap-4"><Megaphone className="w-5 h-5" /><span className="font-bold text-sm">Send Announcement</span></div>
                            <Check className="w-4 h-4 text-green-600" />
                        </button>
                    </div>
                </div>
            </div>

            {showTariffModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-[500px] max-h-[80vh] overflow-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Manage Tariffs</h3>
                            <button onClick={() => setShowTariffModal(false)}><X className="w-5" /></button>
                        </div>
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold mb-2">Add New Tariff</h4>
                            <div className="flex gap-2">
                                <input type="text" placeholder="Service type" value={newTariff.service_type} onChange={(e) => setNewTariff({ ...newTariff, service_type: e.target.value })} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                                <input type="number" placeholder="Cost" value={newTariff.cost_per_unit} onChange={(e) => setNewTariff({ ...newTariff, cost_per_unit: e.target.value })} className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                                <button onClick={() => createTariffMutation.mutate()} disabled={!newTariff.service_type || !newTariff.cost_per_unit} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm disabled:opacity-50">Add</button>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold mb-2">Current Tariffs</h4>
                            <table className="w-full">
                                <thead><tr className="border-b border-slate-200"><th className="text-left p-2 text-xs">Service</th><th className="text-right p-2 text-xs">Cost</th><th className="text-right p-2 text-xs">Date</th></tr></thead>
                                <tbody>{tariffs?.map((t: any) => (<tr key={t.id} className="border-b border-slate-100"><td className="p-2 text-sm">{t.service_type}</td><td className="p-2 text-sm text-right">${parseFloat(t.cost_per_unit).toFixed(2)}</td><td className="p-2 text-sm text-right">{new Date(t.effective_date).toLocaleDateString()}</td></tr>))}</tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {showPropertyModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-[600px] max-h-[80vh] overflow-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Property Audit</h3>
                            <button onClick={() => setShowPropertyModal(false)}><X className="w-5" /></button>
                        </div>
                        <table className="w-full">
                            <thead><tr className="border-b border-slate-200"><th className="text-left p-2 text-xs">Stand</th><th className="text-left p-2 text-xs">Address</th><th className="text-left p-2 text-xs">Owner</th><th className="text-left p-2 text-xs">Account</th><th className="text-left p-2 text-xs">Users</th></tr></thead>
                            <tbody>{properties?.map((p: any) => (<tr key={p.id} className="border-b border-slate-100"><td className="p-2 text-sm">{p.stand_number}</td><td className="p-2 text-sm">{p.address}, {p.suburb}</td><td className="p-2 text-sm">{p.owner_name}</td><td className="p-2 text-sm font-mono">{p.account_number}</td><td className="p-2 text-sm">{p.users?.length || 0}</td></tr>))}</tbody>
                        </table>
                    </div>
                </div>
            )}

            {showAnnouncementModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-[500px]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Send Announcement</h3>
                            <button onClick={() => setShowAnnouncementModal(false)}><X className="w-5" /></button>
                        </div>
                        <p className="text-sm text-slate-500 mb-6">This announcement will be sent to all registered users.</p>
                        <div className="flex flex-col gap-4">
                            <div><label className="block text-xs font-semibold mb-1">Title</label><input type="text" placeholder="Announcement title" value={announcement.title} onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm" /></div>
                            <div><label className="block text-xs font-semibold mb-1">Message</label><textarea rows={4} placeholder="Enter your announcement message..." value={announcement.body} onChange={(e) => setAnnouncement({ ...announcement, body: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm resize-none" /></div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowAnnouncementModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg font-semibold bg-slate-50">Cancel</button>
                            <button onClick={() => createAnnouncementMutation.mutate()} disabled={!announcement.title || !announcement.body || createAnnouncementMutation.isPending} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50">{createAnnouncementMutation.isPending ? 'Sending...' : 'Send to All Users'}</button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default AdminDashboard;
