import React, { useState } from 'react';
import Layout from '../components/Layout';
import {
    MapPin,
    Calendar,
    AlertCircle,
    Hash,
    Search,
    Trash2,
    Edit2,
    User,
    Clock,
    CheckCircle2,
    Filter,
    X,
    TrendingUp,
    Users,
    MessageSquare
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const AdminRequests: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [newStatus, setNewStatus] = useState('');
    const [editForm, setEditForm] = useState({ category: '', description: '' });

    const { data: requests, isLoading } = useQuery({
        queryKey: ['admin-requests'],
        queryFn: async () => {
            const res = await api.get('/admin/requests');
            return res.data;
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            return api.put(`/admin/requests/${id}/status`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
            setShowStatusModal(false);
            alert('Status updated successfully!');
        }
    });

    const editRequestMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            return api.put(`/admin/requests/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
            setShowEditModal(false);
            alert('Request updated successfully!');
        }
    });

    const deleteRequestMutation = useMutation({
        mutationFn: async (id: string) => {
            return api.delete(`/admin/requests/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
            setShowDeleteModal(false);
            alert('Request deleted successfully!');
        }
    });

    const filteredRequests = requests?.filter((req: any) => {
        const term = searchTerm.toLowerCase();
        return (
            req.category?.toLowerCase().includes(term) ||
            req.status?.toLowerCase().includes(term) ||
            req.user?.name?.toLowerCase().includes(term) ||
            req.property?.address?.toLowerCase().includes(term)
        );
    }) || [];

    const handleUpdateStatus = (request: any) => {
        setSelectedRequest(request);
        setNewStatus(request.status);
        setShowStatusModal(true);
    };

    const handleEdit = (request: any) => {
        setSelectedRequest(request);
        setEditForm({ category: request.category, description: request.description });
        setShowEditModal(true);
    };

    const handleDelete = (request: any) => {
        setSelectedRequest(request);
        setShowDeleteModal(true);
    };

    if (isLoading) {
        return (
            <Layout isAdmin>
                <div className="flex items-center justify-center h-[60vh] flex-col gap-4">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <p className="text-slate-500 text-sm">Loading service requests...</p>
                </div>
            </Layout>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'RESOLVED': return 'bg-green-100 text-green-800 border-green-200';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'RESOLVED': return <CheckCircle2 className="w-4 h-4" />;
            case 'IN_PROGRESS': return <Clock className="w-4 h-4" />;
            case 'PENDING': return <AlertCircle className="w-4 h-4" />;
            case 'CANCELLED': return <X className="w-4 h-4" />;
            default: return <MessageSquare className="w-4 h-4" />;
        }
    };

    const stats = {
        total: requests?.length || 0,
        pending: requests?.filter((r: any) => r.status === 'PENDING').length || 0,
        inProgress: requests?.filter((r: any) => r.status === 'IN_PROGRESS').length || 0,
        resolved: requests?.filter((r: any) => r.status === 'RESOLVED').length || 0,
    };

    return (
        <Layout isAdmin>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Request Queue</h1>
                            <p className="text-gray-600">Manage and track municipal service requests</p>
                        </div>
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Requests</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                    <MessageSquare className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Pending</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                    <Clock className="w-6 h-6 text-yellow-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">In Progress</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                    <AlertCircle className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Resolved</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300">
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 group-focus-within:text-blue-600">
                                <Search className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search requests by category, status, user, or property..."
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
                </div>

                {/* Request Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRequests.length === 0 && (
                        <div className="col-span-full bg-white rounded-xl border border-gray-200 p-12 text-center shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4 transition-transform duration-300 transform hover:scale-110">
                                <MessageSquare className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No service requests found</h3>
                            <p className="text-gray-600">
                                {searchTerm ? 'Try adjusting your search terms' : 'No requests have been submitted yet'}
                            </p>
                        </div>
                    )}
                    
                    {filteredRequests.map((request: any) => (
                        <div key={request.id} className="bg-white rounded-xl border border-gray-200 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 transform hover:scale-110">
                                        {getStatusIcon(request.status)}
                                    </div>
                                    
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border transition-transform duration-300 transform hover:scale-105 ${getStatusColor(request.status)}`}>
                                        {getStatusIcon(request.status)}
                                        {request.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {request.category}
                                </h3>
                                
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {request.description}
                                </p>
                                
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Hash className="w-4 h-4" />
                                        <span className="text-xs">{request.id.slice(0, 8)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-xs">{new Date(request.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <User className="w-4 h-4" />
                                        <span className="text-xs">{request.user?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 truncate">
                                        <MapPin className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate">{request.property?.address}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleUpdateStatus(request)}
                                        className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-sm shadow-blue-600/10 hover:shadow-md hover:shadow-blue-600/20"
                                    >
                                        <Edit2 className="w-3 h-3" />
                                        Update
                                    </button>
                                    <button
                                        onClick={() => handleEdit(request)}
                                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-300 transform hover:scale-110 hover:rotate-12"
                                        title="Edit Request"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(request)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 transform hover:scale-110 hover:rotate-12"
                                        title="Delete Request"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Status Modal */}
            {showStatusModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl border border-gray-200 w-full max-w-md mx-4 shadow-2xl shadow-blue-600/30 animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Update Status</h3>
                                    <p className="text-sm text-gray-600">Change request resolution status</p>
                                </div>
                                <button 
                                    onClick={() => setShowStatusModal(false)} 
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
                            >
                                <option value="PENDING">PENDING</option>
                                <option value="IN_PROGRESS">IN PROGRESS</option>
                                <option value="RESOLVED">RESOLVED</option>
                                <option value="CANCELLED">CANCELLED</option>
                            </select>
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowStatusModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => updateStatusMutation.mutate({ id: selectedRequest.id, status: newStatus })}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Update Status
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl border border-gray-200 w-full max-w-lg mx-4 shadow-2xl shadow-blue-600/30 animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Edit Request Details</h3>
                                    <p className="text-sm text-gray-600">Update request information</p>
                                </div>
                                <button 
                                    onClick={() => setShowEditModal(false)} 
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <input
                                    type="text"
                                    value={editForm.category}
                                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    rows={4}
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>
                        </div>
                        
                        <div className="p-6 border-t border-gray-200">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => editRequestMutation.mutate({ id: selectedRequest.id, data: editForm })}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl border border-gray-200 w-full max-w-md mx-4 shadow-2xl shadow-blue-600/30 animate-in fade-in zoom-in duration-300">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Deletion</h3>
                            <p className="text-gray-600 mb-6">Are you sure you want to permanently delete this request?</p>
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => deleteRequestMutation.mutate(selectedRequest.id)}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Delete Request
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default AdminRequests;
