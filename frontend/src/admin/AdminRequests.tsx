import React, { useState } from 'react';
import Layout from '../components/Layout';
import {
    MapPin,
    Calendar,
    AlertCircle,
    Hash,
    Search,
    Trash2,
    Edit2
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
        return <Layout isAdmin><div>Loading requests...</div></Layout>;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'RESOLVED': return { bg: '#dcfce7', color: '#16a34a' };
            case 'IN_PROGRESS': return { bg: '#dbeafe', color: '#2563eb' };
            case 'PENDING': return { bg: '#fef3c7', color: '#d97706' };
            case 'CANCELLED': return { bg: '#fef2f2', color: '#dc2626' };
            default: return { bg: '#f3f4f6', color: '#6b7280' };
        }
    };

    return (
        <Layout isAdmin>
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div>
                        <h1 className="page-title">Service Request Queue</h1>
                        <p className="page-subtitle">Assign to departments and update resolution status.</p>
                    </div>
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
                        placeholder="Search requests..."
                        style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%', background: 'transparent' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredRequests.map((request: any) => {
                    const statusStyle = getStatusColor(request.status);
                    return (
                        <div key={request.id} className="stat-card" style={{ display: 'flex', gap: '2rem', padding: '1.25rem' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                    <span style={{ fontSize: '10px', fontWeight: 600, padding: '0.25rem 0.5rem', borderRadius: '4px', background: statusStyle.bg, color: statusStyle.color }}>
                                        {request.status}
                                    </span>
                                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Hash style={{ width: '12px' }} /> {request.id.slice(0, 8)}
                                    </span>
                                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Calendar style={{ width: '12px' }} /> {new Date(request.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="card-title" style={{ marginBottom: '0.5rem' }}>{request.category}</h3>
                                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '0.75rem' }}>{request.description}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '12px', color: '#64748b' }}>
                                        <div className="avatar" style={{ width: '1.5rem', height: '1.5rem', fontSize: '10px', background: '#eff6ff', color: '#2563eb' }}>
                                            {request.user?.name?.[0]}
                                        </div>
                                        {request.user?.name} ({request.user?.email})
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '12px', color: '#64748b' }}>
                                        <MapPin style={{ width: '14px' }} /> {request.property?.address}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
                                <button onClick={() => handleUpdateStatus(request)} className="btn-primary" style={{ width: 'auto', fontSize: '12px', padding: '0.5rem 1rem' }}>
                                    Update Status
                                </button>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => handleEdit(request)} className="btn-secondary" style={{ flex: 1, padding: '0.5rem' }}>
                                        <Edit2 style={{ width: '14px' }} />
                                    </button>
                                    <button onClick={() => handleDelete(request)} className="btn-secondary" style={{ flex: 1, padding: '0.5rem', color: '#dc2626' }}>
                                        <Trash2 style={{ width: '14px' }} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Status Modal */}
            {showStatusModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '400px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Update Status</h3>
                        <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '1.5rem' }}
                        >
                            <option value="PENDING">PENDING</option>
                            <option value="IN_PROGRESS">IN PROGRESS</option>
                            <option value="RESOLVED">RESOLVED</option>
                            <option value="CANCELLED">CANCELLED</option>
                        </select>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setShowStatusModal(false)} className="btn-secondary">Cancel</button>
                            <button onClick={() => updateStatusMutation.mutate({ id: selectedRequest.id, status: newStatus })} className="btn-primary">Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '450px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Edit Request Details</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 600 }}>Category</label>
                                <input
                                    type="text"
                                    value={editForm.category}
                                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 600 }}>Description</label>
                                <textarea
                                    rows={4}
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', resize: 'none' }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button onClick={() => setShowEditModal(false)} className="btn-secondary">Cancel</button>
                            <button onClick={() => editRequestMutation.mutate({ id: selectedRequest.id, data: editForm })} className="btn-primary">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {showDeleteModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '400px', textAlign: 'center' }}>
                        <AlertCircle style={{ width: '48px', height: '48px', color: '#dc2626', margin: '0 auto 1rem' }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Confirm Deletion</h3>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Are you sure you want to permanently delete this request?</p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setShowDeleteModal(false)} className="btn-secondary">Cancel</button>
                            <button onClick={() => deleteRequestMutation.mutate(selectedRequest.id)} className="btn-primary" style={{ background: '#dc2626' }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default AdminRequests;
