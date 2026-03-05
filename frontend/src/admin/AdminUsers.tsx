import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
    Search,
    Mail,
    Phone,
    Building2,
    Trash2,
    Edit2,
    X,
    Check,
    FileText
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const AdminUsers: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPropertiesModal, setShowPropertiesModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });
    const [linkPropertyId, setLinkPropertyId] = useState('');

    const { data: users, isLoading, error } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            console.log('Token from localStorage:', token);
            const res = await api.get('/admin/users');
            console.log('Users data from API:', res.data);
            return res.data;
        }
    });

    // Log errors separately
    if (error) {
        console.error('Error fetching users:', error);
    }

    const { data: allProperties } = useQuery({
        queryKey: ['admin-all-properties'],
        queryFn: async () => {
            const res = await api.get('/admin/properties');
            return res.data;
        }
    });

    const { data: userProperties, refetch: refetchUserProperties } = useQuery({
        queryKey: ['admin-user-properties', selectedUser?.id],
        queryFn: async () => {
            if (!selectedUser?.id) return [];
            const res = await api.get(`/admin/users/${selectedUser.id}/properties`);
            console.log('Fetched user properties:', res.data);
            return res.data;
        },
        enabled: !!selectedUser?.id
    });

    const updateUserMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
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
            setShowDeleteModal(false);
            alert('User deleted successfully!');
        },
        onError: () => {
            alert('Failed to delete user');
        }
    });

    const linkPropertyMutation = useMutation({
        mutationFn: async ({ userId, propertyId }: { userId: string; propertyId: string }) => {
            return api.post(`/admin/users/${userId}/properties/${propertyId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            refetchUserProperties();
            setLinkPropertyId('');
            alert('Property linked successfully!');
        }
    });

    const unlinkPropertyMutation = useMutation({
        mutationFn: async ({ userId, propertyId }: { userId: string; propertyId: string }) => {
            return api.delete(`/admin/users/${userId}/properties/${propertyId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            refetchUserProperties();
            alert('Property unlinked successfully!');
        }
    });

    const generateBillForPropertyMutation = useMutation({
        mutationFn: async (propertyId: string) => {
            console.log('Generating bill for property ID:', propertyId);
            return api.post(`/admin/properties/${propertyId}/generate-bill`);
        },
        onSuccess: () => {
            alert('Bill generated successfully for this property!');
        },
        onError: (err: any) => {
            console.error('Error generating bill:', err);
            alert(err.response?.data?.message || 'Failed to generate bill');
        }
    });

    const filteredUsers = (users || []) as any[];
    
    console.log('Total users:', (users as any[])?.length);
    console.log('Filtered users:', filteredUsers.length);
    console.log('Search term:', searchTerm);
    console.log('Raw users data:', users);

    // Debug properties modal
    useEffect(() => {
        if (showPropertiesModal && selectedUser) {
            console.log('Properties modal opened - selectedUser:', selectedUser);
            console.log('Properties modal opened - selectedUser.properties:', selectedUser.properties);
        }
    }, [showPropertiesModal, selectedUser]);

    const handleEdit = (user: any) => {
        setSelectedUser(user);
        setEditForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || ''
        });
        setShowEditModal(true);
    };

    const handleDelete = (user: any) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const handleManageProperties = (user: any) => {
        console.log('Managing properties for user:', user);
        console.log('User properties:', user.properties);
        setSelectedUser(user);
        setShowPropertiesModal(true);
    };

    const handleUpdate = () => {
        if (selectedUser) {
            updateUserMutation.mutate({ id: selectedUser.id, data: editForm });
        }
    };

    const handleDeleteConfirm = () => {
        if (selectedUser) {
            deleteUserMutation.mutate(selectedUser.id);
        }
    };

    if (isLoading) {
        return <Layout isAdmin><div>Loading users...</div></Layout>;
    }

    if (error) {
        return <Layout isAdmin><div>Error loading users: {error.message}</div></Layout>;
    }

    return (
        <Layout isAdmin>
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div>
                        <h1 className="page-title">User Management</h1>
                        <p className="page-subtitle">Manage citizen accounts and their property links.</p>
                    </div>
                    <span style={{
                        background: '#dbeafe',
                        color: '#1d4ed8',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: 600
                    }}>
                        {(users as any[])?.length || 0} Users
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', width: 'auto' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '0.5rem 0.75rem',
                        gap: '0.5rem',
                        width: '280px'
                    }}>
                        <Search style={{ width: '16px', color: '#9ca3af' }} />
                        <input
                            type="text"
                            placeholder="Search by name, email or phone..."
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
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Contact</th>
                            <th style={{ textAlign: 'center' }}>Properties</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user: any) => (
                                <tr key={user.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div className="avatar" style={{ background: '#eff6ff', color: '#2563eb' }}>
                                                {user.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 700, fontSize: '14px' }}>{user.name}</p>
                                                <p style={{ fontSize: '10px', color: '#64748b' }}>{user.id.slice(0, 8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '12px', color: '#64748b' }}>
                                                <Mail style={{ width: '12px' }} />
                                                {user.email}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '12px', color: '#64748b' }}>
                                                <Phone style={{ width: '12px' }} />
                                                {user.phone || 'N/A'}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 700, fontSize: '14px' }}>{user.properties?.length || 0}</span>
                                            <Building2 style={{ width: '12px', color: '#64748b' }} />
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '9999px',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            background: '#dcfce7',
                                            color: '#16a34a'
                                        }}>
                                            ACTIVE
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button
                                                className="btn-secondary"
                                                style={{ width: 'auto', padding: '0.5rem' }}
                                                onClick={() => handleManageProperties(user)}
                                                title="Manage Properties"
                                            >
                                                <Building2 style={{ width: '14px' }} />
                                            </button>
                                            <button
                                                className="btn-secondary"
                                                style={{ width: 'auto', padding: '0.5rem' }}
                                                onClick={() => handleEdit(user)}
                                            >
                                                <Edit2 style={{ width: '14px' }} />
                                            </button>
                                            <button
                                                className="btn-secondary"
                                                style={{ width: 'auto', padding: '0.5rem', color: '#dc2626' }}
                                                onClick={() => handleDelete(user)}
                                            >
                                                <Trash2 style={{ width: '14px' }} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                    {searchTerm ? 'No users found matching your search' : 'No users found'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', width: '450px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Edit User</h3>
                            <button onClick={() => setShowEditModal(false)}><X style={{ width: '20px' }} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '0.25rem' }}>Name</label>
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
                                style={{ flex: 1, padding: '0.625rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontWeight: 600, background: '#f9fafb' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                disabled={updateUserMutation.isPending}
                                style={{ flex: 1, padding: '0.625rem', background: '#2563eb', color: 'white', borderRadius: '8px', fontWeight: 600 }}
                            >
                                {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedUser && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', width: '400px' }}>
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
                                style={{ flex: 1, padding: '0.625rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontWeight: 600, background: '#f9fafb' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={deleteUserMutation.isPending}
                                style={{ flex: 1, padding: '0.625rem', background: '#dc2626', color: 'white', borderRadius: '8px', fontWeight: 600 }}
                            >
                                {deleteUserMutation.isPending ? 'Deleting...' : 'Delete User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Properties Modal */}
            {showPropertiesModal && selectedUser && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', width: '500px', maxHeight: '80vh', overflow: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Manage Properties</h3>
                                <p style={{ fontSize: '13px', color: '#64748b' }}>User: {selectedUser.name}</p>
                            </div>
                            <button onClick={() => setShowPropertiesModal(false)}><X style={{ width: '20px' }} /></button>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '0.75rem' }}>Link New Property</h4>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <select
                                    value={linkPropertyId}
                                    onChange={(e) => setLinkPropertyId(e.target.value)}
                                    style={{ flex: 1, padding: '0.625rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                                >
                                    <option value="">Select a property...</option>
                                    {allProperties?.filter((p: any) =>
                                        !selectedUser.properties.some((up: any) => up.property_id === p.id)
                                    ).map((p: any) => (
                                        <option key={p.id} value={p.id}>{p.address} ({p.account_number})</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => linkPropertyMutation.mutate({ userId: selectedUser.id, propertyId: linkPropertyId })}
                                    disabled={!linkPropertyId || linkPropertyMutation.isPending}
                                    style={{ padding: '0.625rem 1.25rem', background: '#2563eb', color: 'white', borderRadius: '8px', fontWeight: 600, fontSize: '14px' }}
                                >
                                    Link
                                </button>
                            </div>
                        </div>

                        <div>
                            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '0.75rem' }}>Linked Properties</h4>
                            {userProperties && userProperties.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {userProperties.map((up: any) => {
                                        console.log('Rendering user property:', up);
                                        return (
                                        <div key={up.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                                            <div>
                                                <p style={{ fontWeight: 600, fontSize: '14px' }}>{up.property.address}</p>
                                                <p style={{ fontSize: '12px', color: '#64748b' }}>Account: {up.property.account_number}</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => generateBillForPropertyMutation.mutate(up.property_id)}
                                                    disabled={generateBillForPropertyMutation.isPending}
                                                    style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                                                    title="Generate Bill"
                                                >
                                                    <FileText style={{ width: '16px' }} />
                                                </button>
                                                <button
                                                    onClick={() => unlinkPropertyMutation.mutate({ userId: selectedUser.id, propertyId: up.property_id })}
                                                    style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                                                    title="Unlink Property"
                                                >
                                                    <Trash2 style={{ width: '16px' }} />
                                                </button>
                                            </div>
                                        </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b', fontSize: '14px', background: '#f9fafb', borderRadius: '8px' }}>
                                    No properties linked to this user.
                                </p>
                            )}
                        </div>

                        <div style={{ marginTop: '2rem' }}>
                            <button
                                onClick={() => setShowPropertiesModal(false)}
                                style={{ width: '100%', padding: '0.625rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontWeight: 600, background: '#f9fafb' }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default AdminUsers;
