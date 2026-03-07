import React, { useState } from 'react';
import Layout from '../components/Layout';
import {
    Gauge,
    Plus,
    Search,
    Calendar,
    User,
    Trash2,
    X,
    FileText,
    Home,
    TrendingUp,
    Activity,
    BarChart3,
    CheckCircle2,
    AlertCircle,
    Clock,
    Building2,
    Zap,
    Droplets
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const AdminMeterReadings: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<any>(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [readingForm, setReadingForm] = useState({
        property_id: '',
        reading: '',
        reading_date: new Date().toISOString().split('T')[0],
        officer_name: '',
        notes: ''
    });

    const { data: readings, isLoading } = useQuery({
        queryKey: ['meter-readings'],
        queryFn: async () => {
            const res = await api.get('/admin/meter-readings');
            return res.data;
        }
    });

    const { data: properties } = useQuery({
        queryKey: ['admin-properties'],
        queryFn: async () => {
            const res = await api.get('/admin/properties');
            return res.data;
        }
    });

    const { data: readingHistory } = useQuery({
        queryKey: ['property-reading-history', selectedProperty?.id],
        queryFn: async () => {
            const res = await api.get(`/admin/properties/${selectedProperty.id}/readings/history`);
            return res.data;
        },
        enabled: !!selectedProperty && showHistoryModal
    });

    const addReadingMutation = useMutation({
        mutationFn: async (data: any) => {
            return api.post('/admin/meter-readings', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meter-readings'] });
            setShowAddModal(false);
            setReadingForm({
                property_id: '',
                reading: '',
                reading_date: new Date().toISOString().split('T')[0],
                officer_name: '',
                notes: ''
            });
            alert('Meter reading added successfully!');
        },
        onError: () => {
            alert('Failed to add meter reading');
        }
    });

    const deleteReadingMutation = useMutation({
        mutationFn: async (id: string) => {
            return api.delete(`/admin/meter-readings/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meter-readings'] });
            alert('Reading deleted successfully!');
        },
        onError: () => {
            alert('Failed to delete reading');
        }
    });

    const filteredReadings = readings?.filter((r: any) => {
        const term = searchTerm.toLowerCase();
        return (
            r.property?.account_number?.toLowerCase().includes(term) ||
            r.property?.address?.toLowerCase().includes(term) ||
            r.property?.owner_name?.toLowerCase().includes(term) ||
            r.officer_name?.toLowerCase().includes(term)
        );
    }) || [];

    const handleAddReading = () => {
        if (!readingForm.property_id || !readingForm.reading) {
            alert('Please select a property and enter a reading');
            return;
        }
        addReadingMutation.mutate(readingForm);
    };

    const handleViewHistory = (property: any) => {
        setSelectedProperty(property);
        setShowHistoryModal(true);
    };

    if (isLoading) {
        return (
            <Layout isAdmin>
                <div className="flex items-center justify-center h-[60vh] flex-col gap-4">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <p className="text-slate-500 text-sm">Loading meter readings...</p>
                </div>
            </Layout>
        );
    }

    const stats = {
        total: readings?.length || 0,
        today: readings?.filter((r: any) => new Date(r.reading_date).toDateString() === new Date().toDateString()).length || 0,
        thisMonth: readings?.filter((r: any) => new Date(r.reading_date).getMonth() === new Date().getMonth() && new Date(r.reading_date).getFullYear() === new Date().getFullYear()).length || 0,
        properties: properties?.length || 0,
        avgReading: readings?.length > 0 ? readings.reduce((sum: number, r: any) => sum + parseFloat(r.reading), 0) / readings.length : 0,
    };

    return (
        <Layout isAdmin>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Meter Readings</h1>
                            <p className="text-gray-600">Record and manage water meter readings for billing</p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transform hover:scale-105"
                        >
                            <Plus className="w-5 h-5" />
                            Add Reading
                        </button>
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 my-8">
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Readings</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                    <Gauge className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Today</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                    <Calendar className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">This Month</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.thisMonth}</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                    <TrendingUp className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Properties</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.properties}</p>
                                </div>
                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                    <Home className="w-6 h-6 text-orange-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Avg Reading</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.avgReading.toFixed(1)} kL</p>
                                </div>
                                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                    <Droplets className="w-6 h-6 text-cyan-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Search Bar */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 my-8">
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 group-focus-within:text-blue-600">
                                <Search className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by account, address, or officer..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 placeholder-gray-500"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-lg hover:bg-gray-100"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transform scale-x-0 transition-transform duration-200 group-focus-within:scale-x-100"></div>
                        </div>
                    </div>

                    {/* Meter Readings Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
                        {filteredReadings.length === 0 && (
                            <div className="col-span-full bg-white rounded-xl border border-gray-200 p-12 text-center shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4 transition-transform duration-300 transform hover:scale-110">
                                    <Gauge className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No meter readings</h3>
                                <p className="text-gray-600">
                                    {searchTerm ? 'Try adjusting your search terms' : 'Click "Add Reading" to record a new meter reading'}
                                </p>
                            </div>
                        )}
                        
                        {filteredReadings.map((reading: any) => (
                            <div key={reading.id} className="bg-white rounded-xl border border-gray-200 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 transform hover:scale-110">
                                            <Gauge className="w-6 h-6 text-blue-600" />
                                        </div>
                                        
                                        <div className="text-right">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-transform duration-300 transform hover:scale-105 bg-green-100 text-green-800 border-green-200">
                                                <CheckCircle2 className="w-4 h-4" />
                                                Recorded
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                {reading.property?.address}
                                            </h3>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Home className="w-4 h-4" />
                                                    <span className="text-xs">{reading.property?.suburb}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Building2 className="w-4 h-4" />
                                                    <span className="text-xs font-mono">{reading.property?.account_number}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="border-t border-gray-100 pt-3">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Reading</p>
                                                    <p className="text-lg font-bold text-green-600">{parseFloat(reading.reading).toFixed(2)} kL</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Date</p>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3 text-gray-400" />
                                                        <span className="text-sm text-gray-700">{new Date(reading.reading_date).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-3">
                                                <p className="text-xs text-gray-500 mb-1">Officer</p>
                                                <div className="flex items-center gap-1">
                                                    <User className="w-3 h-3 text-gray-400" />
                                                    <span className="text-sm text-gray-700">{reading.officer_name || 'N/A'}</span>
                                                </div>
                                            </div>

                                            {reading.notes && (
                                                <div className="mt-3">
                                                    <p className="text-xs text-gray-500 mb-1">Notes</p>
                                                    <p className="text-xs text-gray-600 italic">{reading.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={() => handleViewHistory(reading.property)}
                                            className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-sm shadow-blue-600/10 hover:shadow-md hover:shadow-blue-600/20"
                                        >
                                            <FileText className="w-4 h-4" />
                                            History
                                        </button>
                                        <button
                                            onClick={() => deleteReadingMutation.mutate(reading.id)}
                                            className="flex-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-sm shadow-blue-600/10 hover:shadow-md hover:shadow-blue-600/20"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

            {/* Enhanced Add Reading Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl border border-gray-200 w-full max-w-lg mx-4 shadow-2xl shadow-blue-600/30 animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Add Meter Reading</h3>
                                    <p className="text-sm text-gray-600">Record new water meter reading</p>
                                </div>
                                <button 
                                    onClick={() => setShowAddModal(false)} 
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Property</label>
                                <select
                                    value={readingForm.property_id}
                                    onChange={(e) => setReadingForm({ ...readingForm, property_id: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select Property</option>
                                    {properties?.map((p: any) => (
                                        <option key={p.id} value={p.id}>
                                            {p.account_number} - {p.address}, {p.suburb}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Meter Reading (kL)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={readingForm.reading}
                                        onChange={(e) => setReadingForm({ ...readingForm, reading: e.target.value })}
                                        placeholder="e.g., 125.50"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Reading Date</label>
                                    <input
                                        type="date"
                                        value={readingForm.reading_date}
                                        onChange={(e) => setReadingForm({ ...readingForm, reading_date: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Officer Name</label>
                                <input
                                    type="text"
                                    value={readingForm.officer_name}
                                    onChange={(e) => setReadingForm({ ...readingForm, officer_name: e.target.value })}
                                    placeholder="Name of officer taking reading"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                                <textarea
                                    value={readingForm.notes}
                                    onChange={(e) => setReadingForm({ ...readingForm, notes: e.target.value })}
                                    placeholder="Any observations..."
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                />
                            </div>
                        </div>
                        
                        <div className="p-6 border-t border-gray-200">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddReading}
                                    disabled={addReadingMutation.isPending}
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {addReadingMutation.isPending ? 'Saving...' : 'Save Reading'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced Reading History Modal */}
            {showHistoryModal && selectedProperty && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl border border-gray-200 w-full max-w-2xl mx-4 shadow-2xl shadow-blue-600/30 animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Reading History</h3>
                                    <p className="text-sm text-gray-600">
                                        {selectedProperty.address}, {selectedProperty.suburb}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setShowHistoryModal(false)} 
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="text-left p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                                            <th className="text-right p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Reading</th>
                                            <th className="text-right p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Consumption</th>
                                            <th className="text-left p-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Officer</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {readingHistory?.map((r: any) => (
                                            <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="p-3 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        {new Date(r.reading_date).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="p-3 text-sm text-right font-mono font-semibold text-green-600">
                                                    {parseFloat(r.reading).toFixed(2)} kL
                                                </td>
                                                <td className="p-3 text-sm text-right">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                        r.consumption > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {r.consumption !== null ? `${r.consumption.toFixed(2)} kL` : '-'}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-gray-400" />
                                                        {r.officer_name || 'N/A'}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!readingHistory || readingHistory.length === 0) && (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-gray-500">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <FileText className="w-8 h-8 text-gray-300" />
                                                        <span>No reading history available</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
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

export default AdminMeterReadings;
