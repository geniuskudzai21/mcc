import React, { useState } from 'react';
import Layout from '../components/Layout';
import {
    User,
    Building2,
    Hash,
    Check,
    X,
    Search,
    AlertCircle,
    Calendar,
    Users,
    Clock,
    CheckCircle2,
    TrendingUp,
    Mail,
    Phone,
    Home
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const AdminAccountApprovals: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const { data: pendingUsers, isLoading } = useQuery({
        queryKey: ['admin-pending-users'],
        queryFn: async () => {
            const res = await api.get('/admin/users/pending');
            return res.data;
        }
    });

    const approveUserMutation = useMutation({
        mutationFn: async (userId: string) => {
            return api.put(`/admin/users/${userId}/approve`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-pending-users'] });
            queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
            setShowApproveModal(false);
            alert('User account approved successfully!');
        },
        onError: () => {
            alert('Failed to approve user account');
        }
    });

    const rejectUserMutation = useMutation({
        mutationFn: async (userId: string) => {
            return api.put(`/admin/users/${userId}/reject`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-pending-users'] });
            queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
            setShowRejectModal(false);
            alert('User account rejected successfully!');
        },
        onError: () => {
            alert('Failed to reject user account');
        }
    });

    const filteredUsers = pendingUsers?.filter((user: any) => {
        const term = searchTerm.toLowerCase();
        return (
            user.name?.toLowerCase().includes(term) ||
            user.email?.toLowerCase().includes(term) ||
            user.phone?.toLowerCase().includes(term) ||
            user.properties?.some((p: any) => 
                p.property.account_number?.toLowerCase().includes(term) ||
                p.property.stand_number?.toLowerCase().includes(term) ||
                p.property.suburb?.toLowerCase().includes(term)
            )
        );
    }) || [];

    const handleApprove = (user: any) => {
        setSelectedUser(user);
        setShowApproveModal(true);
    };

    const handleReject = (user: any) => {
        setSelectedUser(user);
        setShowRejectModal(true);
    };

    const confirmApprove = () => {
        if (selectedUser) {
            approveUserMutation.mutate(selectedUser.id);
        }
    };

    const confirmReject = () => {
        if (selectedUser) {
            rejectUserMutation.mutate(selectedUser.id);
        }
    };

    if (isLoading) {
        return (
            <Layout isAdmin>
                <div className="flex items-center justify-center h-[60vh] flex-col gap-4">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <p className="text-slate-500 text-sm">Loading pending accounts...</p>
                </div>
            </Layout>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'VERIFIED': return 'bg-green-100 text-green-800 border-green-200';
            case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'VERIFIED': return <CheckCircle2 className="w-4 h-4" />;
            case 'REJECTED': return <X className="w-4 h-4" />;
            case 'PENDING': return <Clock className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    const stats = {
        total: pendingUsers?.length || 0,
        withProperties: pendingUsers?.filter((u: any) => u.properties && u.properties.length > 0).length || 0,
        withoutProperties: pendingUsers?.filter((u: any) => !u.properties || u.properties.length === 0).length || 0,
        recent: pendingUsers?.filter((u: any) => new Date(u.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0,
    };

    return (
        <Layout isAdmin>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Approvals</h1>
                            <p className="text-gray-600">Review and approve citizen account registrations</p>
                        </div>
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Pending</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">With Properties</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.withProperties}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                    <Home className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">No Properties</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.withoutProperties}</p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Recent (7 days)</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.recent}</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                    <TrendingUp className="w-6 h-6 text-purple-600" />
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
                                placeholder="Search by name, email, phone, or property..."
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

                    {/* User Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
                        {filteredUsers.length === 0 && (
                            <div className="col-span-full bg-white rounded-xl border border-gray-200 p-12 text-center shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4 transition-transform duration-300 transform hover:scale-110">
                                    <Users className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No pending accounts</h3>
                                <p className="text-gray-600">
                                    {searchTerm ? 'Try adjusting your search terms' : 'All user accounts have been processed'}
                                </p>
                            </div>
                        )}
                        
                        {filteredUsers.map((user: any) => (
                            <div key={user.id} className="bg-white rounded-xl border border-gray-200 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 transform hover:scale-110">
                                            <User className="w-6 h-6 text-gray-600" />
                                        </div>
                                        
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-transform duration-300 transform hover:scale-105 bg-yellow-100 text-yellow-800 border-yellow-200">
                                            <Clock className="w-4 h-4" />
                                            PENDING
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                {user.name}
                                            </h3>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Mail className="w-4 h-4" />
                                                    <span className="text-xs">{user.email}</span>
                                                </div>
                                                {user.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <Phone className="w-4 h-4" />
                                                        <span className="text-xs">{user.phone}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Hash className="w-4 h-4" />
                                                    <span className="text-xs">{user.id.slice(0, 8)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Calendar className="w-4 h-4" />
                                                    <span className="text-xs">{new Date(user.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="border-t border-gray-100 pt-3">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <Home className="w-4 h-4" />
                                                Properties ({user.properties?.length || 0})
                                            </h4>
                                            {user.properties && user.properties.length > 0 ? (
                                                <div className="space-y-2">
                                                    {user.properties.map((up: any) => (
                                                        <div key={up.id} className="bg-gray-50 rounded-lg p-2">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-xs font-medium text-gray-700">
                                                            Account: {up.property.account_number}
                                                        </span>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border transition-transform duration-300 transform hover:scale-105 ${getStatusColor(up.status)}`}>
                                                            {getStatusIcon(up.status)}
                                                            {up.status}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-600">
                                                        <div>Stand: {up.property.stand_number}</div>
                                                        <div>{up.property.suburb}</div>
                                                        <div className="truncate">{up.property.address}</div>
                                                    </div>
                                                </div>
                                            ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-gray-500 italic">No properties linked</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleApprove(user)}
                                            disabled={approveUserMutation.isPending}
                                            className="flex-1 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-sm shadow-blue-600/10 hover:shadow-md hover:shadow-blue-600/20"
                                        >
                                            <Check className="w-4 h-4" />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(user)}
                                            disabled={rejectUserMutation.isPending}
                                            className="flex-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-sm shadow-blue-600/10 hover:shadow-md hover:shadow-blue-600/20"
                                        >
                                            <X className="w-4 h-4" />
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

            {/* Approve Confirmation Modal */}
            {showApproveModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl border border-gray-200 w-full max-w-md mx-4 shadow-2xl shadow-blue-600/30 animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Approve User Account</h3>
                                    <p className="text-sm text-gray-600">Confirm account approval</p>
                                </div>
                                <button 
                                    onClick={() => setShowApproveModal(false)} 
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Approve {selectedUser.name}?
                            </h3>
                            <p className="text-gray-600 mb-4">
                                This will allow the user to receive bills and access all municipal services.
                            </p>
                            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                                <p><strong>Email:</strong> {selectedUser.email}</p>
                                <p><strong>Properties:</strong> {selectedUser.properties?.length || 0}</p>
                            </div>
                        </div>
                        
                        <div className="p-6 border-t border-gray-200">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowApproveModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmApprove}
                                    disabled={approveUserMutation.isPending}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    {approveUserMutation.isPending ? 'Approving...' : 'Approve Account'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Confirmation Modal */}
            {showRejectModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl border border-gray-200 w-full max-w-md mx-4 shadow-2xl shadow-blue-600/30 animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Reject User Account</h3>
                                    <p className="text-sm text-gray-600">Confirm account rejection</p>
                                </div>
                                <button 
                                    onClick={() => setShowRejectModal(false)} 
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Reject {selectedUser.name}?
                            </h3>
                            <p className="text-gray-600 mb-4">
                                This will deny the user access to municipal services.
                            </p>
                            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                                <p><strong>Email:</strong> {selectedUser.email}</p>
                                <p><strong>Properties:</strong> {selectedUser.properties?.length || 0}</p>
                            </div>
                        </div>
                        
                        <div className="p-6 border-t border-gray-200">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowRejectModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmReject}
                                    disabled={rejectUserMutation.isPending}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    {rejectUserMutation.isPending ? 'Rejecting...' : 'Reject Account'}
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

export default AdminAccountApprovals;
