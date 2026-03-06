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
    Calendar
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const AdminUsers: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
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
        mutationFn: async (userId: string) => {
            return api.delete(`/admin/users/${userId}`);
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

    if (isLoading) {
        return <Layout isAdmin><div>Loading users...</div></Layout>;
    }

    return (
        <Layout isAdmin>
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div>
                        <h1 className="page-title">User Management</h1>
                        <p className="page-subtitle">Manage registered users in the system.</p>
                    </div>
                    <span style={{
                        background: '#e0e7ff',
                        color: '#4338ca',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: 600
                    }}>
                        {users?.length || 0} Users
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
                        placeholder="Search by name, email, or phone..."
                        style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%', background: 'transparent' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                            <th style={{ textAlign: 'left', padding: '0.875rem 1rem', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</th>
                            <th style={{ textAlign: 'left', padding: '0.875rem 1rem', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact</th>
                            <th style={{ textAlign: 'left', padding: '0.875rem 1rem', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Properties</th>
                            <th style={{ textAlign: 'left', padding: '0.875rem 1rem', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registered</th>
                            <th style={{ textAlign: 'right', padding: '0.875rem 1rem', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user: any) => {
                                const props = getUserProperties(user.id);
                                return (
                                    <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '36px', height: '36px', background: '#e0e7ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <User style={{ width: '16px', color: '#4338ca' }} />
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{user.name}</p>
                                                    <p style={{ fontSize: '12px', color: '#6b7280' }}>ID: {user.id.slice(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                <p style={{ fontSize: '13px', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Mail style={{ width: '12px', color: '#9ca3af' }} />
                                                    {user.email}
                                                </p>
                                                <p style={{ fontSize: '13px', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Phone style={{ width: '12px', color: '#9ca3af' }} />
                                                    {user.phone || 'N/A'}
                                                </p>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                {props.length > 0 ? (
                                                    props.map((p: any) => (
                                                        <span key={p.id} style={{
                                                            fontSize: '11px',
                                                            fontWeight: 600,
                                                            padding: '2px 8px',
                                                            borderRadius: '999px',
                                                            background: p.status === 'VERIFIED' ? '#f0fdf4' : p.status === 'PENDING' ? '#fffbeb' : '#fef2f2',
                                                            color: p.status === 'VERIFIED' ? '#16a34a' : p.status === 'PENDING' ? '#d97706' : '#dc2626',
                                                            display: 'inline-block',
                                                            width: 'fit-content'
                                                        }}>
                                                            {p.property?.account_number} - {p.status}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>No property linked</span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <p style={{ fontSize: '13px', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Calendar style={{ width: '12px', color: '#9ca3af' }} />
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    style={{
                                                        padding: '0.5rem',
                                                        background: '#f3f4f6',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <Edit style={{ width: '14px', color: '#6b7280' }} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user)}
                                                    style={{
                                                        padding: '0.5rem',
                                                        background: '#fef2f2',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <Trash2 style={{ width: '14px', color: '#dc2626' }} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center' }}>
                                    <User style={{ width: '48px', color: '#9ca3af', margin: '0 auto 1rem' }} />
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                                        {searchTerm ? 'No matching users found' : 'No users registered'}
                                    </h3>
                                    <p style={{ color: '#6b7280', fontSize: '14px' }}>
                                        {searchTerm ? 'Try adjusting your search terms' : 'Users will appear here once they register'}
                                    </p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {showEditModal && selectedUser && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '450px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Edit User</h3>
                            <button onClick={() => setShowEditModal(false)}><X style={{ width: '20px' }} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '0.25rem' }}>Full Name</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.625rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '0.25rem' }}>Email</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    style={{ width: '100%', padding: '0.625rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '0.25rem' }}>Phone</label>
                                <input
                                    type="tel"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                    style={{ width: '100%', padding: '0.625rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="btn-secondary"
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmEdit}
                                disabled={updateUserMutation.isPending}
                                className="btn-primary"
                                style={{ flex: 1 }}
                            >
                                {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedUser && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '400px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ width: '48px', height: '48px', background: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                <Trash2 style={{ width: '24px', color: '#dc2626' }} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Delete User</h3>
                            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '0.5rem' }}>
                                Are you sure you want to delete <strong>{selectedUser.name}</strong>? This action cannot be undone.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="btn-secondary"
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deleteUserMutation.isPending}
                                style={{ flex: 1, padding: '0.625rem', background: '#dc2626', color: 'white', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                            >
                                {deleteUserMutation.isPending ? 'Deleting...' : 'Delete User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default AdminUsers;
