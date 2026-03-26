import React, { useState } from 'react';
import Layout from '../components/Layout';
import {
    User,
    Mail,
    Phone,
    Search,
    Edit,
    Trash2,
    X,
    Users,
    Home,
    CheckCircle2,
    AlertCircle,
    Building2,
    DollarSign
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const AdminUsers: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showGenerateBillModal, setShowGenerateBillModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });

    const { data: users, isLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const res = await api.get('/admin/users');
            return res.data;
        }
    });

    const { data: userProperties } = useQuery({
        queryKey: ['admin-user-properties'],
        queryFn: async () => {
            const res = await api.get('/admin/all-user-properties');
            return res.data;
        },
        enabled: !!users && users.length > 0
    });

    const updateUserMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: { name: string; email: string; phone: string } }) => {
            return api.put(`/admin/users/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            setShowEditModal(false);
            alert('User updated successfully!');
        },
        onError: () => {
            alert('Failed to update user');
        }
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (id: string) => {
            return api.delete(`/admin/users/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
            setShowDeleteModal(false);
            alert('User deleted successfully!');
        },
        onError: () => {
            alert('Failed to delete user');
        }
    });

    const generateBillMutation = useMutation({
        mutationFn: async (userId: string) => {
            const response = await api.post(`/admin/generate-bill/${userId}`);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['admin-bills'] });
            queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
            alert(`Bill generated successfully! Generated ${data.billsCreated} bills.`);
            setShowGenerateBillModal(false);
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to generate bill';
            alert(`Error: ${errorMessage}`);
        }
    });

    const filteredUsers = users?.filter((user: any) => {
        const term = searchTerm.toLowerCase();
        return (
            user.name?.toLowerCase().includes(term) ||
            user.email?.toLowerCase().includes(term) ||
            user.phone?.toLowerCase().includes(term)
        );
    }) || [];

    const getUserProperties = (userId: string) => {
        return userProperties?.filter((up: any) => up.user_id === userId) || [];
    };

    const handleEdit = (user: any) => {
        setSelectedUser(user);
        setEditForm({ name: user.name, email: user.email, phone: user.phone || '' });
        setShowEditModal(true);
    };

    const handleDelete = (user: any) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const handleGenerateBill = (user: any) => {
        setSelectedUser(user);
        setShowGenerateBillModal(true);
    };

    const confirmEdit = () => {
        if (selectedUser) {
            updateUserMutation.mutate({ id: selectedUser.id, data: editForm });
        }
    };

    const confirmDelete = () => {
        if (selectedUser) {
            deleteUserMutation.mutate(selectedUser.id);
        }
    };

    const confirmGenerateBill = () => {
        if (selectedUser) {
            generateBillMutation.mutate(selectedUser.id);
        }
    };

    if (isLoading) {
        return (
            <Layout isAdmin>
                <div className="flex items-center justify-center h-[60vh] flex-col gap-4">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <p className="text-slate-500 text-sm">Loading users...</p>
                </div>
            </Layout>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'VERIFIED': return 'bg-green-100 text-green-800 border-green-200';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'VERIFIED': return <CheckCircle2 className="w-4 h-4" />;
            case 'PENDING': return <Clock className="w-4 h-4" />;
            case 'REJECTED': return <AlertCircle className="w-4 h-4" />;
            default: return <Building2 className="w-4 h-4" />;
        }
    };

    const stats = {
        total: users?.length || 0,
        withProperties: users?.filter((u: any) => {
            const props = getUserProperties(u.id);
            return props && props.length > 0;
        }).length || 0,
        noProperties: users?.filter((u: any) => {
            const props = getUserProperties(u.id);
            return !props || props.length === 0;
        }).length || 0,
        recent: users?.filter((u: any) => new Date(u.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0,
        verified: userProperties?.filter((up: any) => up.status === 'VERIFIED').length || 0,
    };

    return (
        <Layout isAdmin>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 md:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">User Management</h1>
                            <p className="text-gray-600 text-sm">Manage registered users in the system</p>
                        </div>
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 my-6 md:my-8">
                        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs md:text-sm text-gray-600 mb-1">Total Users</p>
                                    <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                    <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs md:text-sm text-gray-600 mb-1">With Properties</p>
                                    <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.withProperties}</p>
                                </div>
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                    <Home className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs md:text-sm text-gray-600 mb-1">No Properties</p>
                                    <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.noProperties}</p>
                                </div>
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                    <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs md:text-sm text-gray-600 mb-1">Verified Properties</p>
                                    <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.verified}</p>
                                </div>
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                    <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Search Bar */}
                    <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 my-6 md:my-8">
                        <div className="relative group">
                            <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 group-focus-within:text-blue-600">
                                <Search className="w-4 md:w-5 h-4 md:h-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name, email, or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 md:pl-12 pr-9 md:pr-12 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 placeholder-gray-500"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-lg hover:bg-gray-100"
                                >
                                    <X className="w-3 md:w-4 h-3 md:h-4" />
                                </button>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transform scale-x-0 transition-transform duration-200 group-focus-within:scale-x-100"></div>
                        </div>
                    </div>

                    {/* User List - Block Layout */}
                    <div className="space-y-2 my-6 md:my-8">
                        {filteredUsers.length === 0 && (
                            <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-12 text-center shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4 transition-transform duration-300 transform hover:scale-110">
                                    <Users className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">No users found</h3>
                                <p className="text-gray-600 text-sm">
                                    {searchTerm ? 'Try adjusting your search terms' : 'No users registered yet'}
                                </p>
                            </div>
                        )}
                        
                        {filteredUsers.map((user: any) => {
                            const props = getUserProperties(user.id);
                            return (
                                <div key={user.id} className="bg-white rounded-xl border border-gray-200 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1 w-full">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 gap-3">
                                        {/* Left Section - User Info */}
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110 flex-shrink-0">
                                                <User className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 truncate text-sm md:text-base">{user.name}</h3>
                                                <div className="flex flex-wrap items-center gap-x-2 md:gap-x-3 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        <span className="truncate max-w-[150px] md:max-w-[200px]">{user.email}</span>
                                                    </span>
                                                    {user.phone && (
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="w-3 h-3" />
                                                            <span className="md:hidden">{user.phone.slice(0, 8)}...</span>
                                                            <span className="hidden md:inline">{user.phone}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Middle Section - Properties */}
                                        <div className="flex items-center gap-2 sm:px-3 md:px-4 border-t sm:border-t-0 border-gray-200 pt-2 sm:pt-0">
                                            <Home className="w-3 md:w-4 h-3 md:h-4 text-gray-500 flex-shrink-0" />
                                            <div className="text-xs md:text-sm">
                                                <span className="font-medium text-gray-700">{props.length}</span>
                                                <span className="text-gray-500 hidden sm:inline"> Properties</span>
                                                {props.length > 0 && (
                                                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                                                        {props.slice(0, 2).map((p: any) => (
                                                            <span key={p.id} className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(p.status)}`}>
                                                                {p.property.account_number}
                                                            </span>
                                                        ))}
                                                        {props.length > 2 && (
                                                            <span className="text-xs text-gray-500">+{props.length - 2}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right Section - Actions */}
                                        <div className="flex items-center gap-1 md:gap-2 border-t sm:border-t-0 border-gray-200 pt-2 sm:pt-0">
                                            <button
                                                onClick={() => handleGenerateBill(user)}
                                                className="p-1.5 md:p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-300 transform hover:scale-110 shadow-sm shadow-blue-600/10 hover:shadow-md hover:shadow-blue-600/20"
                                                title="Generate Bill"
                                            >
                                                <DollarSign className="w-3 md:w-4 h-3 md:h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="p-1.5 md:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 transform hover:scale-110 shadow-sm shadow-blue-600/10 hover:shadow-md hover:shadow-blue-600/20"
                                                title="Edit User"
                                            >
                                                <Edit className="w-3 md:w-4 h-3 md:h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user)}
                                                className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 transform hover:scale-110 shadow-sm shadow-blue-600/10 hover:shadow-md hover:shadow-blue-600/20"
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-3 md:w-4 h-3 md:h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

            {/* Edit Modal */}
            {showEditModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl border border-gray-200 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl shadow-blue-600/30 animate-in fade-in zoom-in duration-300">
                        <div className="p-4 md:p-6 border-b border-gray-200 sticky top-0 bg-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg md:text-xl font-bold text-gray-900">Edit User</h3>
                                    <p className="text-sm text-gray-600">Update user information</p>
                                </div>
                                <button 
                                    onClick={() => setShowEditModal(false)} 
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                    className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        
                        <div className="p-4 md:p-6 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmEdit}
                                    disabled={updateUserMutation.isPending}
                                    className="flex-1 px-3 md:px-4 py-2 md:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                                >
                                    {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {showDeleteModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl border border-gray-200 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl shadow-blue-600/30 animate-in fade-in zoom-in duration-300">
                        <div className="p-4 md:p-6 text-center">
                            <div className="w-12 md:w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                                <Trash2 className="w-6 md:w-8 h-6 md:h-8 text-red-600" />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Delete User</h3>
                            <p className="text-gray-600 text-sm mb-3 md:mb-4">
                                Are you sure you want to delete <strong>{selectedUser.name}</strong>? This action cannot be undone.
                            </p>
                            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                                <p><strong>Email:</strong> {selectedUser.email}</p>
                                <p><strong>Properties:</strong> {getUserProperties(selectedUser.id)?.length || 0}</p>
                            </div>
                        </div>
                        
                        <div className="p-4 md:p-6 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={deleteUserMutation.isPending}
                                    className="flex-1 px-3 md:px-4 py-2 md:py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
                                >
                                    {deleteUserMutation.isPending ? 'Deleting...' : 'Delete User'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Generate Bill Modal */}
            {showGenerateBillModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl border border-gray-200 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl shadow-blue-600/30 animate-in fade-in zoom-in duration-300">
                        <div className="p-4 md:p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg md:text-xl font-bold text-gray-900">Generate Bill</h3>
                                    <p className="text-sm text-gray-600">Generate bill for user</p>
                                </div>
                                <button 
                                    onClick={() => setShowGenerateBillModal(false)} 
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 md:p-6 text-center">
                            <div className="w-12 md:w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                                <DollarSign className="w-6 md:w-8 h-6 md:h-8 text-green-600" />
                            </div>
                            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                                Generate Bill for {selectedUser.name}?
                            </h3>
                            <p className="text-gray-600 text-sm mb-3 md:mb-4">
                                This will generate a bill for all properties linked to this user for the current billing period.
                            </p>
                            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                                <p><strong>User:</strong> {selectedUser.name}</p>
                                <p><strong>Email:</strong> {selectedUser.email}</p>
                                <p><strong>Properties:</strong> {getUserProperties(selectedUser.id)?.length || 0}</p>
                            </div>
                        </div>
                        
                        <div className="p-4 md:p-6 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                                <button
                                    onClick={() => setShowGenerateBillModal(false)}
                                    className="flex-1 px-3 md:px-4 py-2 md:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmGenerateBill}
                                    disabled={generateBillMutation.isPending}
                                    className="flex-1 px-3 md:px-4 py-2 md:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                                >
                                    {generateBillMutation.isPending ? 'Generating...' : 'Generate Bill'}
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

export default AdminUsers;
