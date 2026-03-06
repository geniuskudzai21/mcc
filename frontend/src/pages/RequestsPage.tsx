import React, { useState } from 'react';
import Layout from '../components/Layout';
import {
    Plus,
    MapPin,
    Calendar,
    X,
    AlertTriangle,
    Droplets,
    Trash2,
    Zap,
    DollarSign,
    Edit2,
    CheckCircle2,
    Clock,
    MessageSquare
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const categoryIcons: Record<string, React.ReactNode> = {
    'Water Leak': <Droplets className="w-5 h-5" />,
    'Sewer Blockage': <Trash2 className="w-5 h-5" />,
    'Missed Refuse': <Trash2 className="w-5 h-5" />,
    'Streetlight Fault': <Zap className="w-5 h-5" />,
    'Billing Query': <DollarSign className="w-5 h-5" />
};

const categoryColors: Record<string, string> = {
    'Water Leak': 'bg-blue-100 text-blue-700 border-blue-200',
    'Sewer Blockage': 'bg-orange-100 text-orange-700 border-orange-200',
    'Missed Refuse': 'bg-green-100 text-green-700 border-green-200',
    'Streetlight Fault': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Billing Query': 'bg-purple-100 text-purple-700 border-purple-200'
};

const RequestsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [editRequest, setEditRequest] = useState<any>(null);
    const [category, setCategory] = useState('');
    const [propertyId, setPropertyId] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Fetch Requests
    const { data: requests, isLoading: requestsLoading } = useQuery({
        queryKey: ['requests'],
        queryFn: async () => {
            const res = await api.get('/requests');
            return res.data;
        }
    });

    // Fetch User Properties
    const { data: user } = useQuery({
        queryKey: ['user-me'],
        queryFn: async () => {
            const res = await api.get('/users/me');
            return res.data;
        }
    });

    const properties = user?.properties || [];

    // Create Request Mutation
    const createMutation = useMutation({
        mutationFn: async (newData: any) => {
            return api.post('/requests', newData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['requests'] });
            closeModal();
        }
    });

    // Update Request Mutation
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            return api.patch(`/requests/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['requests'] });
            closeModal();
        }
    });

    // Delete Request Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return api.delete(`/requests/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['requests'] });
        }
    });

    const handleEdit = (request: any) => {
        setEditRequest(request);
        setCategory(request.category);
        setPropertyId(request.property_id);
        setDescription(request.description);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to withdraw this request?')) {
            try {
                await deleteMutation.mutateAsync(id);
            } catch (err: any) {
                alert(err.response?.data?.message || 'Failed to delete request');
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'RESOLVED':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'IN_PROGRESS':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'RESOLVED':
                return <CheckCircle2 className="w-5 h-5 text-green-600" />;
            case 'IN_PROGRESS':
                return <Clock className="w-5 h-5 text-blue-600" />;
            case 'PENDING':
                return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
            default:
                return <MessageSquare className="w-5 h-5 text-gray-600" />;
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditRequest(null);
        setCategory('');
        setPropertyId('');
        setDescription('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!category || !propertyId || !description) return;

        setSubmitting(true);
        try {
            if (editRequest) {
                await updateMutation.mutateAsync({
                    id: editRequest.id,
                    data: { category, description }
                });
            } else {
                await createMutation.mutateAsync({
                    category,
                    property_id: propertyId,
                    description
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (requestsLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center" style={{ height: '60vh' }}>
                    <div className="text-center">
                        <div className="processing-pulse mb-6">
                            <div className="processing-pulse-dot">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-gray-600 font-medium">Loading service requests...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Requests</h1>
                            <p className="text-gray-600">Report and track municipal service issues</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30"
                        >
                            <Plus className="w-5 h-5" />
                            New Request
                        </button>
                    </div>
                </div>

                {/* Request Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Requests</p>
                                <p className="text-2xl font-bold text-gray-900">{requests?.length || 0}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <MessageSquare className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Pending</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {requests?.filter((r: any) => r.status === 'PENDING').length || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Resolved</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {requests?.filter((r: any) => r.status === 'RESOLVED').length || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Request List */}
                <div className="space-y-4">
                    {requests?.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No service requests</h3>
                            <p className="text-gray-600 mb-6">You haven't submitted any service requests yet</p>
                            <button
                                onClick={() => setShowModal(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                            >
                                <Plus className="w-5 h-5" />
                                Create Your First Request
                            </button>
                        </div>
                    ) : (
                        requests.map((request: any) => (
                            <div key={request.id} className="bg-white rounded-xl border border-gray-200 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${categoryColors[request.category] || 'bg-gray-100 text-gray-700'} shadow-md transition-transform duration-300 transform hover:scale-110`}>
                                                {categoryIcons[request.category] || <AlertTriangle className="w-5 h-5" />}
                                            </div>
                                            
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {request.category}
                                                    </h3>
                                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(request.status)} transition-transform duration-300 transform hover:scale-105`}>
                                                        {request.status}
                                                    </span>
                                                </div>
                                                
                                                <p className="text-gray-600 mb-3">
                                                    {request.description}
                                                </p>
                                                
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-4 h-4" />
                                                        {request.property.address}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(request.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {request.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(request)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 transform hover:scale-110 hover:rotate-12"
                                                        title="Edit Request"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(request.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 transform hover:scale-110 hover:rotate-12"
                                                        title="Delete Request"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* New/Edit Request Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl border border-gray-200 w-full max-w-md mx-4 shadow-2xl shadow-blue-600/30 animate-in fade-in zoom-in duration-300">
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {editRequest ? 'Edit Request' : 'Report an Issue'}
                                    </h3>
                                    <p className="text-xs text-gray-600">Municipal Service Desk</p>
                                </div>
                                <button 
                                    onClick={closeModal} 
                                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-300 transform hover:scale-110 hover:rotate-90"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            {!editRequest && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Issue Category</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Water Leak', 'Sewer Blockage', 'Missed Refuse', 'Streetlight Fault', 'Billing Query'].map((cat) => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setCategory(cat)}
                                                className={`p-2 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                                                    category === cat 
                                                        ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-600/30' 
                                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                                                }`}
                                            >
                                                <div className={`flex flex-col items-center gap-1 transition-transform duration-300 transform hover:scale-110 ${
                                                    category === cat ? 'text-blue-700' : 'text-gray-600'
                                                }`}>
                                                    <div className="w-4 h-4">
                                                        {categoryIcons[cat]}
                                                    </div>
                                                    <span className="text-xs font-medium text-center">{cat}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!editRequest && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Affected Property</label>
                                    <select
                                        value={propertyId}
                                        onChange={(e) => setPropertyId(e.target.value)}
                                        required
                                        className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Choose property...</option>
                                        {properties.map((p: any) => (
                                            <option key={p.property.id} value={p.property.id}>
                                                {p.property.address}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Issue Description</label>
                                <textarea
                                    rows={3}
                                    placeholder="Provide details to help our teams resolve this quickly..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!category || !propertyId || !description || submitting}
                                    className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30"
                                >
                                    {submitting ? 'Processing...' : (editRequest ? 'Update' : 'Submit')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default RequestsPage;
