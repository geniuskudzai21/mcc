import React, { useState } from 'react';
import Layout from '../components/Layout';
import {
    DollarSign, Users, AlertCircle, FileText,
    TrendingUp, Building2, X, Check, Megaphone,
    Home, Calendar, Clock, CheckCircle2,
    Activity, BarChart3, PieChart
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
    const [showGenerateBillsModal, setShowGenerateBillsModal] = useState(false);
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
        mutationFn: async () => {
            try {
                const response = await api.post('/admin/generate-bills');
                return response.data;
            } catch (error) {
                console.error('Generate bills error:', error);
                throw error;
            }
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['admin-bills'] });
            alert(`Bills generated successfully! Generated ${data?.billsGenerated || 'multiple'} bills.`);
        },
        onError: (error: any) => {
            console.error('Generate bills failed:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to generate bills';
            alert(`Error: ${errorMessage}`);
        }
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
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 md:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Admin Dashboard</h1>
                            <p className="text-gray-600 text-sm">Municipal services overview and management</p>
                        </div>
                    </div>
                    
                    {/* Enhanced Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 my-6 md:my-8">
                        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs md:text-sm text-gray-600 mb-1">Daily Collection</p>
                                    <p className="text-xl md:text-2xl font-bold text-gray-900">${formatNumber(metrics?.revenueToday)}</p>
                                </div>
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                    <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs md:text-sm text-gray-600 mb-1">Outstanding Arrears</p>
                                    <p className="text-xl md:text-2xl font-bold text-gray-900">${formatNumber(metrics?.outstanding)}</p>
                                </div>
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                    <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs md:text-sm text-gray-600 mb-1">Active Residents</p>
                                    <p className="text-xl md:text-2xl font-bold text-gray-900">{metrics?.totalUsers || 0}</p>
                                </div>
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                    <Users className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs md:text-sm text-gray-600 mb-1">Pending Requests</p>
                                    <p className="text-xl md:text-2xl font-bold text-gray-900">{metrics?.pendingRequests || 0}</p>
                                </div>
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                    <Activity className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 my-6 md:my-8">
                        {/* Chart Section */}
                        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="p-4 md:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6">
                                    <div>
                                        <h3 className="text-lg md:text-xl font-bold text-gray-900">Monthly Collections</h3>
                                        <p className="text-sm text-gray-600">Current month: ${formatNumber(metrics?.revenueMonth)}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                        <BarChart3 className="w-5 h-5 text-blue-600" />
                                    </div>
                                </div>
                                <div className="h-[250px] md:h-[300px] w-full">
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
                        </div>

                        {/* Administrative Tasks */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="p-4 md:p-6">
                                <div className="flex items-center justify-between mb-4 md:mb-6">
                                    <h3 className="text-lg md:text-xl font-bold text-gray-900">Quick Actions</h3>
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                        <Activity className="w-5 h-5 text-purple-600" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <button 
                                        className="w-full p-3 md:p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-600/20"
                                        onClick={() => setShowGenerateBillsModal(true)} 
                                        disabled={generateBillsMutation.isPending}
                                    >
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                                <FileText className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                                            </div>
                                            <div className="flex flex-col items-start">
                                                <span className="font-bold text-xs md:text-sm text-gray-700">{generateBillsMutation.isPending ? 'Generating...' : 'Generate Bills'}</span>
                                                <span className="text-xs text-gray-500 hidden sm:inline">Monthly billing</span>
                                            </div>
                                        </div>
                                        <div className="w-5 h-5 md:w-6 md:h-6 bg-blue-600 rounded-full flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                            <Check className="w-3 h-3 md:w-4 md:h-4 text-white" />
                                        </div>
                                    </button>

                                    <button 
                                        className="w-full p-3 md:p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:from-green-100 hover:to-green-200 hover:border-green-300 hover:shadow-lg hover:shadow-green-600/20"
                                        onClick={() => setShowTariffModal(true)}
                                    >
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                                <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                                            </div>
                                            <div className="flex flex-col items-start">
                                                <span className="font-bold text-xs md:text-sm text-gray-700">Manage Tariffs</span>
                                                <span className="text-xs text-gray-500 hidden sm:inline">Service rates</span>
                                            </div>
                                        </div>
                                        <div className="w-5 h-5 md:w-6 md:h-6 bg-green-600 rounded-full flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                            <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-white" />
                                        </div>
                                    </button>

                                    <button 
                                        className="w-full p-3 md:p-4 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:from-purple-100 hover:to-purple-200 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-600/20"
                                        onClick={() => setShowPropertyModal(true)}
                                    >
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                                <Building2 className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                                            </div>
                                            <div className="flex flex-col items-start">
                                                <span className="font-bold text-xs md:text-sm text-gray-700">Property Audit</span>
                                                <span className="text-xs text-gray-500 hidden sm:inline">View properties</span>
                                            </div>
                                        </div>
                                        <div className="w-5 h-5 md:w-6 md:h-6 bg-purple-600 rounded-full flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                                <Home className="w-3 h-3 md:w-4 md:h-4 text-white" />
                                            </div>
                                    </button>

                                    <button 
                                        className="w-full p-3 md:p-4 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:from-orange-100 hover:to-orange-200 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-600/20"
                                        onClick={() => setShowAnnouncementModal(true)}
                                    >
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                                <Megaphone className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                                            </div>
                                            <div className="flex flex-col items-start">
                                                <span className="font-bold text-xs md:text-sm text-gray-700">Announcements</span>
                                                <span className="text-xs text-gray-500 hidden sm:inline">Send notices</span>
                                            </div>
                                        </div>
                                        <div className="w-5 h-5 md:w-6 md:h-6 bg-orange-600 rounded-full flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                                <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-white" />
                                            </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

            {/* Enhanced Modals */}
            {showTariffModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-blue-600/30 animate-in fade-in zoom-in duration-300">
                        <div className="p-4 md:p-6 border-b border-gray-200 sticky top-0 bg-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg md:text-xl font-bold text-gray-900">Manage Tariffs</h3>
                                    <p className="text-sm text-gray-600">Configure service rates</p>
                                </div>
                                <button 
                                    onClick={() => setShowTariffModal(false)} 
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                            <div>
                                <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Add New Tariff</h4>
                                <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                                    <input 
                                        type="text" 
                                        placeholder="Service type" 
                                        value={newTariff.service_type} 
                                        onChange={(e) => setNewTariff({ ...newTariff, service_type: e.target.value })} 
                                        className="flex-1 px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                    />
                                    <input 
                                        type="number" 
                                        placeholder="Cost" 
                                        value={newTariff.cost_per_unit} 
                                        onChange={(e) => setNewTariff({ ...newTariff, cost_per_unit: e.target.value })} 
                                        className="w-full sm:w-24 md:w-32 px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                    />
                                    <button 
                                        onClick={() => createTariffMutation.mutate()} 
                                        disabled={!newTariff.service_type || !newTariff.cost_per_unit} 
                                        className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white rounded-lg font-medium text-sm disabled:opacity-50 hover:bg-blue-700 transition-colors whitespace-nowrap"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Current Tariffs</h4>
                                <div className="overflow-x-auto -mx-4 md:mx-0">
                                    <table className="w-full min-w-[300px]">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                                <th className="text-left p-2 md:p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Service</th>
                                                <th className="text-right p-2 md:p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Cost</th>
                                                <th className="text-right p-2 md:p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">Effective Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tariffs?.map((t: any) => (
                                                <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                    <td className="p-2 md:p-3 text-sm font-medium text-gray-900">{t.service_type}</td>
                                                    <td className="p-2 md:p-3 text-sm text-right font-mono">${parseFloat(t.cost_per_unit).toFixed(2)}</td>
                                                    <td className="p-2 md:p-3 text-sm text-right text-gray-600 hidden sm:table-cell">{new Date(t.effective_date).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showPropertyModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl border border-gray-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-blue-600/30 animate-in fade-in zoom-in duration-300">
                        <div className="p-4 md:p-6 border-b border-gray-200 sticky top-0 bg-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg md:text-xl font-bold text-gray-900">Property Audit</h3>
                                    <p className="text-sm text-gray-600">Review registered properties</p>
                                </div>
                                <button 
                                    onClick={() => setShowPropertyModal(false)} 
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 md:p-6">
                            <div className="overflow-x-auto -mx-4 md:mx-0">
                                <table className="w-full min-w-[500px]">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="text-left p-2 md:p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Stand</th>
                                            <th className="text-left p-2 md:p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Address</th>
                                            <th className="text-left p-2 md:p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">Owner</th>
                                            <th className="text-left p-2 md:p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">Account</th>
                                            <th className="text-left p-2 md:p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Users</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {properties?.map((p: any) => (
                                            <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="p-2 md:p-3 text-sm font-mono">{p.stand_number}</td>
                                                <td className="p-2 md:p-3 text-sm">{p.address}, {p.suburb}</td>
                                                <td className="p-2 md:p-3 text-sm font-medium hidden md:table-cell">{p.owner_name}</td>
                                                <td className="p-2 md:p-3 text-sm font-mono hidden sm:table-cell">{p.account_number}</td>
                                                <td className="p-2 md:p-3 text-sm">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {p.users?.length || 0}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showAnnouncementModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl border border-gray-200 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl shadow-blue-600/30 animate-in fade-in zoom-in duration-300">
                        <div className="p-4 md:p-6 border-b border-gray-200 sticky top-0 bg-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg md:text-xl font-bold text-gray-900">Send Announcement</h3>
                                    <p className="text-sm text-gray-600">Broadcast to all users</p>
                                </div>
                                <button 
                                    onClick={() => setShowAnnouncementModal(false)} 
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 md:p-6">
                            <p className="text-sm text-gray-600 mb-4 md:mb-6">This announcement will be sent to all registered users.</p>
                            <div className="space-y-3 md:space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Title</label>
                                    <input 
                                        type="text" 
                                        placeholder="Announcement title" 
                                        value={announcement.title} 
                                        onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })} 
                                        className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Message</label>
                                    <textarea 
                                        rows={3} 
                                        placeholder="Enter your announcement message..." 
                                        value={announcement.body} 
                                        onChange={(e) => setAnnouncement({ ...announcement, body: e.target.value })} 
                                        className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" 
                                    />
                                </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mt-4 md:mt-6">
                                <button 
                                    onClick={() => setShowAnnouncementModal(false)} 
                                    className="flex-1 px-3 md:px-4 py-2 md:py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => createAnnouncementMutation.mutate()} 
                                    disabled={!announcement.title || !announcement.body || createAnnouncementMutation.isPending} 
                                    className="flex-1 px-3 md:px-4 py-2 md:py-3 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {createAnnouncementMutation.isPending ? 'Sending...' : 'Send to All'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Generate Bills Confirmation Modal */}
            {showGenerateBillsModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl border border-gray-200 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl shadow-blue-600/30 animate-in fade-in zoom-in duration-300">
                        <div className="p-4 md:p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg md:text-xl font-bold text-gray-900">Generate Monthly Bills</h3>
                                    <p className="text-sm text-gray-600">Confirm bill generation</p>
                                </div>
                                <button 
                                    onClick={() => setShowGenerateBillsModal(false)} 
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 md:p-6 text-center">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                                <FileText className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                            </div>
                            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                                Generate Monthly Bills?
                            </h3>
                            <p className="text-gray-600 text-sm mb-3 md:mb-4">
                                This will generate bills for all properties based on current meter readings and tariffs.
                            </p>
                            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                                <p><strong>Properties:</strong> {metrics?.totalUsers || 0}</p>
                                <p><strong>Current Month:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>
                        
                        <div className="p-4 md:p-6 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                                <button
                                    onClick={() => setShowGenerateBillsModal(false)}
                                    className="flex-1 px-3 md:px-4 py-2 md:py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        generateBillsMutation.mutate();
                                        setShowGenerateBillsModal(false);
                                    }}
                                    disabled={generateBillsMutation.isPending}
                                    className="flex-1 px-3 md:px-4 py-2 md:py-3 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {generateBillsMutation.isPending ? 'Generating...' : 'Generate Bills'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
                </div>
            </div>
        </Layout>
    );
};

export default AdminDashboard;
