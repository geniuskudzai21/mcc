import React, { useState } from 'react';
import Layout from '../components/Layout';
import {
    Plus,
    MapPin,
    Calendar,
    X,
    ArrowRight,
    AlertTriangle,
    Droplets,
    Trash2,
    Zap,
    DollarSign,
    Edit2,
    CheckCircle2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const categoryIcons: Record<string, React.ReactNode> = {
    'Water Leak': <Droplets style={{ width: '20px' }} />,
    'Sewer Blockage': <Trash2 style={{ width: '20px' }} />,
    'Missed Refuse': <Trash2 style={{ width: '20px' }} />,
    'Streetlight Fault': <Zap style={{ width: '20px' }} />,
    'Billing Query': <DollarSign style={{ width: '20px' }} />
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
        return <Layout><div className="flex-center" style={{ height: '60vh' }}>Accessing municipal records...</div></Layout>;
    }

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Service Requests</h1>
                    <p className="page-subtitle">Track and report municipal service issues.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary"
                    style={{ width: 'auto' }}
                >
                    <Plus className="nav-icon" />
                    New Request
                </button>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {requests?.map((request: any) => (
                    <div key={request.id} className="stat-card" style={{ borderTop: `4px solid ${request.status === 'RESOLVED' ? '#16a34a' : 'var(--primary)'}`, padding: '1.5rem', position: 'relative' }}>
                        <div className="flex-between mb-4">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div className="stat-icon-wrapper" style={{ width: '32px', height: '32px', background: 'var(--bg-main)', color: 'var(--primary)', borderRadius: '6px' }}>
                                    {categoryIcons[request.category] || <AlertTriangle style={{ width: '16px' }} />}
                                </div>
                                <h3 className="card-title" style={{ margin: 0, fontSize: '14px' }}>{request.category}</h3>
                            </div>
                            <span className={`badge ${request.status === 'RESOLVED' ? "badge-success" :
                                request.status === 'PENDING' ? "badge-warning" :
                                    "badge-info"
                                }`} style={{ fontSize: '9px', padding: '0.25rem 0.5rem' }}>
                                {request.status}
                            </span>
                        </div>

                        <div className="mb-4">
                            <p className="page-subtitle" style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '13px', marginBottom: '0.5rem' }}>"{request.description}"</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '11px', color: 'var(--text-muted)' }}>
                                    <MapPin style={{ width: '12px' }} />
                                    {request.property.address}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '11px', color: 'var(--text-muted)' }}>
                                    <Calendar style={{ width: '12px' }} />
                                    {new Date(request.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                            {request.status === 'PENDING' && (
                                <>
                                    <button
                                        onClick={() => handleEdit(request)}
                                        className="forgot-link"
                                        style={{ fontSize: '11px', color: '#2563eb', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <Edit2 style={{ width: '12px' }} /> EDIT
                                    </button>
                                    <button
                                        onClick={() => handleDelete(request.id)}
                                        className="forgot-link"
                                        style={{ fontSize: '11px', color: '#dc2626', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <Trash2 style={{ width: '12px' }} /> DELETE
                                    </button>
                                </>
                            )}
                            <button className="forgot-link" style={{ fontSize: '11px', marginLeft: 'auto', fontWeight: 700 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>DETAILS</span>
                                    <ArrowRight style={{ width: '12px' }} />
                                </div>
                            </button>
                        </div>
                    </div>
                ))}
                {requests?.length === 0 && (
                    <div className="col-span-3 flex-center" style={{ height: '200px', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)' }}>
                        <CheckCircle2 style={{ width: '48px', height: '48px', opacity: 0.2 }} />
                        <p>No active service requests for your account.</p>
                    </div>
                )}
            </div>

            {/* New/Edit Request Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,51,102,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="stat-card" style={{ width: '450px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#003366', textTransform: 'uppercase' }}>
                                    {editRequest ? 'Edit Request' : 'Report an Issue'}
                                </h3>
                                <p style={{ fontSize: '12px', color: '#64748b' }}>Municipal Service Desk</p>
                            </div>
                            <button onClick={closeModal} style={{ background: '#f1f5f9', border: 'none', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}>
                                <X style={{ width: '18px', color: '#003366' }} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!editRequest && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '0.5rem', color: '#003366', textTransform: 'uppercase' }}>ISSUE CATEGORY</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Water Leak', 'Sewer Blockage', 'Missed Refuse', 'Streetlight Fault', 'Billing Query'].map((cat) => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setCategory(cat)}
                                                style={{
                                                    padding: '0.75rem 0.5rem',
                                                    border: `2px solid ${category === cat ? '#003366' : 'transparent'}`,
                                                    borderRadius: '8px',
                                                    background: category === cat ? '#eff6ff' : '#f8fafc',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <div style={{ color: category === cat ? '#003366' : '#64748b' }}>{categoryIcons[cat]}</div>
                                                <span style={{ fontSize: '10px', fontWeight: 700, color: category === cat ? '#003366' : '#64748b', textAlign: 'center' }}>{cat}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!editRequest && (
                                <div style={{ marginTop: '1.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '0.5rem', color: '#003366', textTransform: 'uppercase' }}>AFFECTED PROPERTY</label>
                                    <select
                                        value={propertyId}
                                        onChange={(e) => setPropertyId(e.target.value)}
                                        required
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#1e293b', background: '#f8fafc' }}
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

                            <div style={{ marginTop: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '0.5rem', color: '#003366', textTransform: 'uppercase' }}>ISSUE DESCRIPTION</label>
                                <textarea
                                    rows={3}
                                    placeholder="Provide details to help our teams resolve this quickly..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', resize: 'none', background: '#f8fafc' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    style={{ flex: 1, padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', fontWeight: 700, fontSize: '13px', color: '#64748b', cursor: 'pointer' }}
                                >
                                    DISCARD
                                </button>
                                <button
                                    type="submit"
                                    disabled={!category || !propertyId || !description || submitting}
                                    className="btn-primary"
                                    style={{ flex: 2, padding: '0.75rem', background: '#003366', color: 'white', borderRadius: '8px', fontWeight: 700, fontSize: '13px', border: 'none', cursor: 'pointer', opacity: (!category || !propertyId || !description || submitting) ? 0.7 : 1 }}
                                >
                                    {submitting ? 'PROCESSING...' : (editRequest ? 'UPDATE REPORT' : 'SUBMIT REPORT')}
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
