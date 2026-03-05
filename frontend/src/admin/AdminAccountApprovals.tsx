import React, { useState } from 'react';
import Layout from '../components/Layout';
import {
    User,
    Mail,
    Phone,
    Building2,
    Hash,
    Check,
    X,
    Search,
    AlertCircle,
    Calendar
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
        return <Layout isAdmin><div>Loading pending accounts...</div></Layout>;
    }

    return (
        <Layout isAdmin>
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div>
                        <h1 className="page-title">Account Approvals</h1>
                        <p className="page-subtitle">Review and approve citizen account registrations.</p>
                    </div>
                    <span style={{
                        background: '#fef3c7',
                        color: '#d97706',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: 600
                    }}>
                        {pendingUsers?.length || 0} Pending
                    </span>
                </div>
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
                        placeholder="Search by name, email, phone, or property..."
                        style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%', background: 'transparent' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user: any) => (
                        <div key={user.id} className="stat-card" style={{ display: 'flex', gap: '2rem', padding: '1.5rem' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '10px', fontWeight: 600, padding: '0.25rem 0.5rem', borderRadius: '4px', background: '#fef3c7', color: '#d97706' }}>
                                        PENDING APPROVAL
                                    </span>
                                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Hash style={{ width: '12px' }} /> {user.id.slice(0, 8)}
                                    </span>
                                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Calendar style={{ width: '12px' }} /> {new Date(user.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1rem' }}>
                                    <div>
                                        <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <User style={{ width: '14px', color: '#2563eb' }} />
                                            User Information
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            <p style={{ fontSize: '13px', color: '#374151' }}>
                                                <strong>Name:</strong> {user.name}
                                            </p>
                                            <p style={{ fontSize: '13px', color: '#374151' }}>
                                                <strong>Email:</strong> {user.email}
                                            </p>
                                            <p style={{ fontSize: '13px', color: '#374151' }}>
                                                <strong>Phone:</strong> {user.phone || 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Building2 style={{ width: '14px', color: '#2563eb' }} />
                                            Property Information
                                        </h4>
                                        {user.properties && user.properties.length > 0 ? (
                                            user.properties.map((up: any, index: number) => (
                                                <div key={up.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: index < user.properties.length - 1 ? '0.5rem' : '0' }}>
                                                    <p style={{ fontSize: '13px', color: '#374151' }}>
                                                        <strong>Account:</strong> {up.property.account_number}
                                                    </p>
                                                    <p style={{ fontSize: '13px', color: '#374151' }}>
                                                        <strong>Stand:</strong> {up.property.stand_number}
                                                    </p>
                                                    <p style={{ fontSize: '13px', color: '#374151' }}>
                                                        <strong>Suburb:</strong> {up.property.suburb}
                                                    </p>
                                                    <p style={{ fontSize: '13px', color: '#374151' }}>
                                                        <strong>Address:</strong> {up.property.address}
                                                    </p>
                                                    <p style={{ fontSize: '13px', color: '#374151' }}>
                                                        <strong>Status:</strong> 
                                                        <span style={{
                                                            fontSize: '11px',
                                                            fontWeight: 700,
                                                            padding: '2px 8px',
                                                            borderRadius: '999px',
                                                            background: up.status === 'VERIFIED' ? '#f0fdf4' : up.status === 'REJECTED' ? '#fef2f2' : '#fffbeb',
                                                            color: up.status === 'VERIFIED' ? '#16a34a' : up.status === 'REJECTED' ? '#dc2626' : '#d97706',
                                                            marginLeft: '0.5rem'
                                                        }}>
                                                            {up.status}
                                                        </span>
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <p style={{ fontSize: '13px', color: '#9ca3af' }}>No property linked</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'center' }}>
                                <button
                                    onClick={() => handleApprove(user)}
                                    disabled={approveUserMutation.isPending}
                                    className="btn-primary"
                                    style={{ width: 'auto', fontSize: '13px', padding: '0.625rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <Check style={{ width: '14px' }} />
                                    Approve Account
                                </button>
                                <button
                                    onClick={() => handleReject(user)}
                                    disabled={rejectUserMutation.isPending}
                                    className="btn-secondary"
                                    style={{ width: 'auto', fontSize: '13px', padding: '0.625rem 1.25rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <X style={{ width: '14px' }} />
                                    Reject Account
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', background: '#f9fafb', borderRadius: '12px' }}>
                        <User style={{ width: '48px', color: '#9ca3af', margin: '0 auto 1rem' }} />
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                            {searchTerm ? 'No matching pending accounts found' : 'No pending account approvals'}
                        </h3>
                        <p style={{ color: '#6b7280', fontSize: '14px' }}>
                            {searchTerm ? 'Try adjusting your search terms' : 'All user accounts have been processed'}
                        </p>
                    </div>
                )}
            </div>

            {/* Approve Confirmation Modal */}
            {showApproveModal && selectedUser && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '450px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ width: '48px', height: '48px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                <Check style={{ width: '24px', color: '#16a34a' }} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Approve User Account</h3>
                            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '0.5rem' }}>
                                Are you sure you want to approve <strong>{selectedUser.name}</strong>?
                            </p>
                            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '0.5rem' }}>
                                This will allow the user to receive bills and access all municipal services.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => setShowApproveModal(false)}
                                className="btn-secondary"
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmApprove}
                                disabled={approveUserMutation.isPending}
                                className="btn-primary"
                                style={{ flex: 1 }}
                            >
                                {approveUserMutation.isPending ? 'Approving...' : 'Approve Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Confirmation Modal */}
            {showRejectModal && selectedUser && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '450px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <AlertCircle style={{ width: '48px', height: '48px', color: '#dc2626', margin: '0 auto 1rem' }} />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Reject User Account</h3>
                            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '0.5rem' }}>
                                Are you sure you want to reject <strong>{selectedUser.name}</strong>?
                            </p>
                            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '0.5rem' }}>
                                This will deny the user access to municipal services.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="btn-secondary"
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmReject}
                                disabled={rejectUserMutation.isPending}
                                className="btn-primary"
                                style={{ flex: 1, background: '#dc2626' }}
                            >
                                {rejectUserMutation.isPending ? 'Rejecting...' : 'Reject Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default AdminAccountApprovals;
