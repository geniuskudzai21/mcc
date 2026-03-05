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
    CreditCard
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
        return <Layout isAdmin><div>Loading bills...</div></Layout>;
    }

    const totalBillings = bills?.reduce((sum: number, b: any) => sum + parseFloat(b.total_amount), 0) || 0;
    const pendingBillings = bills?.filter((b: any) => b.status !== 'PAID').reduce((sum: number, b: any) => sum + parseFloat(b.total_amount), 0) || 0;
    const collectedBillings = totalBillings - pendingBillings;

    return (
        <Layout isAdmin>
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div>
                        <h1 className="page-title">Billing Management</h1>
                        <p className="page-subtitle">Manage property bills, tariffs, and revenue collections.</p>
                    </div>
                    <span style={{
                        background: '#dbeafe',
                        color: '#1d4ed8',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: 600
                    }}>
                        {bills?.length || 0} Bills
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', width: 'auto' }}>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="stat-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #2563eb' }}>
                    <div>
                        <p className="stat-label">Total Billings (MTD)</p>
                        <h3 className="stat-value" style={{ fontSize: '1.25rem' }}>${totalBillings.toFixed(2)}</h3>
                    </div>
                    <div className="stat-icon-wrapper bg-blue-light" style={{ width: '3rem', height: '3rem' }}>
                        <DollarSign className="nav-icon" style={{ width: '1.25rem' }} />
                    </div>
                </div>

                <div className="stat-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #16a34a' }}>
                    <div>
                        <p className="stat-label">Collected (MTD)</p>
                        <h3 className="stat-value" style={{ fontSize: '1.25rem' }}>${collectedBillings.toFixed(2)}</h3>
                    </div>
                    <div className="stat-icon-wrapper bg-green-light" style={{ width: '3rem', height: '3rem' }}>
                        <CheckCircle2 className="nav-icon" style={{ width: '1.25rem' }} />
                    </div>
                </div>

                <div className="stat-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #f97316' }}>
                    <div>
                        <p className="stat-label">Outstanding (MTD)</p>
                        <h3 className="stat-value" style={{ fontSize: '1.25rem' }}>${pendingBillings.toFixed(2)}</h3>
                    </div>
                    <div className="stat-icon-wrapper bg-orange-light" style={{ width: '3rem', height: '3rem' }}>
                        <AlertCircle className="nav-icon" style={{ width: '1.25rem' }} />
                    </div>
                </div>
            </div>

            <div className="table-container">
                <div className="card-title-row" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="card-title" style={{ fontSize: '14px' }}>All Invoices</h3>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '0.5rem 0.75rem',
                        gap: '0.5rem',
                        width: '300px'
                    }}>
                        <Search style={{ width: '16px', color: '#9ca3af' }} />
                        <input
                            type="text"
                            placeholder="Search by account, address or status..."
                            style={{
                                border: 'none',
                                outline: 'none',
                                fontSize: '13px',
                                width: '100%',
                                background: 'transparent'
                            }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                            >
                                <X style={{ width: '14px', color: '#9ca3af' }} />
                            </button>
                        )}
                    </div>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Account No.</th>
                            <th>Resident / Property</th>
                            <th>Period</th>
                            <th>Amount</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBills.length > 0 ? (
                            filteredBills.map((bill: any) => (
                                <tr key={bill.id}>
                                    <td style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px' }}>{bill.property?.account_number}</td>
                                    <td>
                                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{bill.property?.owner_name || 'Unassigned'}</div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{bill.property?.address}</div>
                                    </td>
                                    <td>{bill.billing_month}/{bill.billing_year}</td>
                                    <td style={{ fontWeight: 700 }}>${parseFloat(bill.total_amount).toFixed(2)}</td>
                                    <td>{new Date(bill.due_date).toLocaleDateString()}</td>
                                    <td>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '9999px',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            background: bill.status === 'PAID' ? '#dcfce7' : bill.status === 'OVERDUE' ? '#fef2f2' : '#fef3c7',
                                            color: bill.status === 'PAID' ? '#16a34a' : bill.status === 'OVERDUE' ? '#dc2626' : '#d97706'
                                        }}>
                                            {bill.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            {bill.status !== 'PAID' && (
                                                <button
                                                    onClick={() => markPaidMutation.mutate(bill.id)}
                                                    disabled={markPaidMutation.isPending}
                                                    style={{
                                                        padding: '0.5rem',
                                                        background: '#16a34a',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white'
                                                    }}
                                                    title="Mark as Paid"
                                                >
                                                    <CreditCard style={{ width: '14px' }} />
                                                </button>
                                            )}
                                            <button
                                                className="btn-secondary"
                                                style={{ width: 'auto', padding: '0.5rem' }}
                                                onClick={() => handleEdit(bill)}
                                            >
                                                <Edit2 style={{ width: '14px' }} />
                                            </button>
                                            <button
                                                className="btn-secondary"
                                                style={{ width: 'auto', padding: '0.5rem', color: '#dc2626' }}
                                                onClick={() => handleDelete(bill)}
                                            >
                                                <Trash2 style={{ width: '14px' }} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                    {searchTerm ? 'No bills found matching your search' : 'No bills found'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="grid grid-cols-1 mb-8">
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #003366 0%, #001a33 100%)', color: 'white', border: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <FilePlus style={{ width: '1.5rem', color: '#16a34a' }} />
                                Municipal Billing Engine
                            </h3>
                            <p style={{ fontSize: '14px', color: '#94a3b8', maxWidth: '600px' }}>
                                Run this process to generate monthly invoices for <strong>all municipal properties</strong>.
                                The engine will automatically calculate charges based on current tariffs (Water, Sewer, Refuse, Rates)
                                and skip properties that already have an invoice for the current period.
                            </p>
                        </div>
                        <button
                            className="btn-primary"
                            style={{
                                width: 'auto',
                                background: '#16a34a',
                                padding: '1rem 2.5rem',
                                height: 'fit-content',
                                fontSize: '14px',
                                boxShadow: '0 10px 15px -3px rgba(22, 163, 74, 0.4)'
                            }}
                            onClick={() => generateBillsMutation.mutate()}
                            disabled={generateBillsMutation.isPending}
                        >
                            {generateBillsMutation.isPending ? 'PROCESSING BATCH...' : 'RUN MONTH-END BILLING'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', width: '450px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Edit Bill</h3>
                            <button onClick={() => setShowEditModal(false)}><X style={{ width: '20px' }} /></button>
                        </div>

                        <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                            <p style={{ fontSize: '12px', color: '#64748b' }}>Property</p>
                            <p style={{ fontWeight: 600 }}>{selectedBill?.property?.address}</p>
                            <p style={{ fontSize: '12px', color: '#64748b' }}>Account: {selectedBill?.property?.account_number}</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '0.25rem' }}>Status</label>
                                <select
                                    value={editForm.status}
                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                    style={{ width: '100%', padding: '0.625rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                                >
                                    <option value="UNPAID">UNPAID</option>
                                    <option value="PAID">PAID</option>
                                    <option value="OVERDUE">OVERDUE</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '0.25rem' }}>Amount ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={editForm.total_amount}
                                    onChange={(e) => setEditForm({ ...editForm, total_amount: e.target.value })}
                                    style={{ width: '100%', padding: '0.625rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <button
                                onClick={() => setShowEditModal(false)}
                                style={{ flex: 1, padding: '0.625rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontWeight: 600, background: '#f9fafb' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                disabled={updateBillMutation.isPending}
                                style={{ flex: 1, padding: '0.625rem', background: '#2563eb', color: 'white', borderRadius: '8px', fontWeight: 600 }}
                            >
                                {updateBillMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedBill && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', width: '400px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ width: '48px', height: '48px', background: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                <Trash2 style={{ width: '24px', color: '#dc2626' }} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Delete Bill</h3>
                            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '0.5rem' }}>
                                Are you sure you want to delete this bill for <strong>{selectedBill.property?.address}</strong>?
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                style={{ flex: 1, padding: '0.625rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontWeight: 600, background: '#f9fafb' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={deleteBillMutation.isPending}
                                style={{ flex: 1, padding: '0.625rem', background: '#dc2626', color: 'white', borderRadius: '8px', fontWeight: 600 }}
                            >
                                {deleteBillMutation.isPending ? 'Deleting...' : 'Delete Bill'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default AdminBills;
