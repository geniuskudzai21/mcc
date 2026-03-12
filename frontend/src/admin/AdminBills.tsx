import React, { useState } from 'react';
import Layout from '../components/Layout';
import {
    FilePlus,
    Search,
    CheckCircle2,
    AlertCircle,
    DollarSign,
    Trash2,
    Edit2,
    X,
    CreditCard,
    Calendar,
    Home,
    TrendingUp,
    Users,
    FileText,
    Clock
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const AdminBills: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedBill, setSelectedBill] = useState<any>(null);
    const [editForm, setEditForm] = useState({ status: '', total_amount: '' });

    const { data: bills, isLoading } = useQuery({
        queryKey: ['admin-bills'],
        queryFn: async () => {
            const res = await api.get('/admin/bills');
            return res.data;
        }
    });

    const generateBillsMutation = useMutation({
        mutationFn: async () => {
            return api.post('/admin/generate-bills');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-bills'] });
            alert('Bills generated successfully! Users can now see them in their accounts.');
        },
        onError: () => {
            alert('Failed to generate bills');
        }
    });

    const updateBillMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            return api.put(`/admin/bills/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-bills'] });
            setShowEditModal(false);
            alert('Bill updated successfully!');
        },
        onError: () => {
            alert('Failed to update bill');
        }
    });

    const deleteBillMutation = useMutation({
        mutationFn: async (id: string) => {
            return api.delete(`/admin/bills/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-bills'] });
            setShowDeleteModal(false);
            alert('Bill deleted successfully!');
        },
        onError: () => {
            alert('Failed to delete bill');
        }
    });

    const markPaidMutation = useMutation({
        mutationFn: async (id: string) => {
            return api.put(`/admin/bills/${id}`, { status: 'PAID' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-bills'] });
            alert('Bill marked as paid!');
        },
        onError: () => {
            alert('Failed to mark bill as paid');
        }
    });

    const filteredBills = bills?.filter((bill: any) => {
        const term = searchTerm.toLowerCase();
        return (
            bill.property?.account_number?.toLowerCase().includes(term) ||
            bill.property?.address?.toLowerCase().includes(term) ||
            bill.status?.toLowerCase().includes(term)
        );
    }) || [];

    const handleEdit = (bill: any) => {
        setSelectedBill(bill);
        setEditForm({
            status: bill.status || '',
            total_amount: bill.total_amount || ''
        });
        setShowEditModal(true);
    };

    const handleDelete = (bill: any) => {
        setSelectedBill(bill);
        setShowDeleteModal(true);
    };

    const handleUpdate = () => {
        if (selectedBill) {
            updateBillMutation.mutate({
                id: selectedBill.id,
                data: {
                    status: editForm.status,
                    total_amount: parseFloat(editForm.total_amount)
                }
            });
        }
    };

    const handleDeleteConfirm = () => {
        if (selectedBill) {
            deleteBillMutation.mutate(selectedBill.id);
        }
    };

    if (isLoading) {
        return (
            <Layout isAdmin>
                <div className="flex items-center justify-center h-[60vh] flex-col gap-4">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <p className="text-slate-500 text-sm">Loading billing data...</p>
                </div>
            </Layout>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-green-100 text-green-800 border-green-200';
            case 'OVERDUE': return 'bg-red-100 text-red-800 border-red-200';
            case 'UNPAID': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PAID': return <CheckCircle2 className="w-4 h-4" />;
            case 'OVERDUE': return <AlertCircle className="w-4 h-4" />;
            case 'UNPAID': return <Clock className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const stats = {
        total: bills?.length || 0,
        paid: bills?.filter((b: any) => b.status === 'PAID').length || 0,
        unpaid: bills?.filter((b: any) => b.status !== 'PAID').length || 0,
        overdue: bills?.filter((b: any) => b.status === 'OVERDUE').length || 0,
        totalRevenue: bills?.reduce((sum: number, b: any) => sum + parseFloat(b.total_amount), 0) || 0,
        collectedRevenue: bills?.filter((b: any) => b.status === 'PAID').reduce((sum: number, b: any) => sum + parseFloat(b.total_amount), 0) || 0,
    };

    return (
        <Layout isAdmin>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing Management</h1>
                            <p className="text-gray-600">Manage property bills, tariffs, and revenue collections</p>
                        </div>
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Bills</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Paid Bills</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.paid}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Unpaid Bills</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.unpaid}</p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                    <Clock className="w-6 h-6 text-yellow-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Overdue Bills</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
                                </div>
                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                    <AlertCircle className="w-6 h-6 text-red-600" />
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
                                placeholder="Search by account, property address, or status..."
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

                    {/* Bills List - Block Layout */}
                    <div className="space-y-2 my-8">
                        {filteredBills.length === 0 && (
                            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4 transition-transform duration-300 transform hover:scale-110">
                                    <FileText className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No bills found</h3>
                                <p className="text-gray-600">
                                    {searchTerm ? 'Try adjusting your search terms' : 'No bills available'}
                                </p>
                            </div>
                        )}
                        
                        {filteredBills.map((bill: any) => (
                            <div key={bill.id} className="bg-white rounded-xl border border-gray-200 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1 w-full">
                                <div className="flex items-center justify-between p-4">
                                    {/* Left Section - Bill Info */}
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110 flex-shrink-0">
                                            {getStatusIcon(bill.status)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 truncate">{bill.billing_month}/{bill.billing_year}</h3>
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Home className="w-3 h-3" />
                                                    <span className="truncate max-w-[200px]">{bill.property?.address}</span>
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(bill.due_date).toLocaleDateString()}
                                                </span>
                                                <span className="text-gray-400">Acc: {bill.property?.account_number}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle Section - Amount & Status */}
                                    <div className="flex items-center gap-2 px-4 border-l border-r border-gray-200">
                                        <DollarSign className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                        <div className="text-sm">
                                            <span className="font-bold text-gray-900">${parseFloat(bill.total_amount).toFixed(2)}</span>
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium border transition-transform duration-300 transform hover:scale-95 flex-shrink-0 ${getStatusColor(bill.status)}`}>
                                                    {getStatusIcon(bill.status)}
                                                    {bill.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Section - Actions */}
                                    <div className="flex items-center gap-2 pl-4">
                                        {bill.status !== 'PAID' && (
                                            <button
                                                onClick={() => markPaidMutation.mutate(bill.id)}
                                                disabled={markPaidMutation.isPending}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-300 transform hover:scale-110 shadow-sm shadow-blue-600/10 hover:shadow-md hover:shadow-blue-600/20"
                                                title="Mark Paid"
                                            >
                                                <CreditCard className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleEdit(bill)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 transform hover:scale-110 shadow-sm shadow-blue-600/10 hover:shadow-md hover:shadow-blue-600/20"
                                            title="Edit Bill"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(bill)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 transform hover:scale-110 shadow-sm shadow-blue-600/10 hover:shadow-md hover:shadow-blue-600/20"
                                            title="Delete Bill"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Billing Engine */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1 my-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                    <FilePlus className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">Municipal Billing Engine</h3>
                                    <p className="text-sm text-gray-600">Generate monthly invoices for all properties</p>
                                </div>
                            </div>
                            <button
                                onClick={() => generateBillsMutation.mutate()}
                                disabled={generateBillsMutation.isPending}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {generateBillsMutation.isPending ? 'Processing...' : 'Generate Monthly Bills'}
                            </button>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-2">
                                <strong>How it works:</strong> The billing engine automatically calculates charges based on current tariffs (Water, Sewer, Refuse, Rates) and skips properties that already have an invoice for the current period.
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                                    <span>Smart calculations</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3 text-blue-600" />
                                    <span>Revenue tracking</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users className="w-3 h-3 text-purple-600" />
                                    <span>Batch processing</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Edit Modal */}
                    {showEditModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="bg-white rounded-xl border border-gray-200 w-full max-w-lg mx-4 shadow-2xl shadow-blue-600/30 animate-in fade-in zoom-in duration-300">
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">Edit Bill</h3>
                                            <p className="text-sm text-gray-600">Update bill information</p>
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
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm font-semibold text-gray-700 mb-1">Property Information</p>
                                        <p className="text-sm text-gray-600">{selectedBill?.property?.address}</p>
                                        <p className="text-xs text-gray-500">Account: {selectedBill?.property?.account_number}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                        <select
                                            value={editForm.status}
                                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="UNPAID">UNPAID</option>
                                            <option value="PAID">PAID</option>
                                            <option value="OVERDUE">OVERDUE</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editForm.total_amount}
                                            onChange={(e) => setEditForm({ ...editForm, total_amount: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                            onClick={handleUpdate}
                                            disabled={updateBillMutation.isPending}
                                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                        >
                                            {updateBillMutation.isPending ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Delete Confirmation */}
                    {showDeleteModal && selectedBill && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="bg-white rounded-xl border border-gray-200 w-full max-w-md mx-4 shadow-2xl shadow-blue-600/30 animate-in fade-in zoom-in duration-300">
                                <div className="p-6 text-center">
                                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Trash2 className="w-8 h-8 text-red-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Bill</h3>
                                    <p className="text-gray-600 mb-6">
                                        Are you sure you want to delete this bill for <strong>{selectedBill.property?.address}</strong>?
                                    </p>
                                    
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowDeleteModal(false)}
                                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDeleteConfirm}
                                            disabled={deleteBillMutation.isPending}
                                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                        >
                                            {deleteBillMutation.isPending ? 'Deleting...' : 'Delete Bill'}
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

export default AdminBills;
