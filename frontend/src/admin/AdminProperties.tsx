import React from 'react';
import Layout from '../components/Layout';
import {
    CheckCircle2,
    XCircle,
    User,
    MapPin,
    Hash,
    ShieldCheck
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const AdminProperties: React.FC = () => {
    const queryClient = useQueryClient();

    const { data: pendingLinks, isLoading } = useQuery({
        queryKey: ['pending-property-links'],
        queryFn: async () => {
            const res = await api.get('/admin/property-links/pending');
            return res.data;
        }
    });

    const verifyMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            return api.put(`/admin/property-links/${id}/status`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-property-links'] });
            alert('Property link status updated successfully');
        }
    });

    return (
        <Layout isAdmin={true}>
            <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
                <div className="page-header" style={{ marginBottom: '2rem' }}>
                    <div>
                        <h1 className="page-title">Property Verifications</h1>
                        <p className="page-subtitle">Security audit for citizen-property link requests.</p>
                    </div>
                </div>

                {isLoading ? (
                    <div>Loading verification requests...</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {pendingLinks && pendingLinks.length > 0 ? (
                            pendingLinks.map((link: any) => (
                                <div key={link.id} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '1.5rem' }}>
                                    <div style={{ width: '48px', height: '48px', background: '#fef3c7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <ShieldCheck style={{ width: '24px', color: '#d97706' }} />
                                    </div>

                                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                                        <div>
                                            <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Citizen</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <User style={{ width: '14px', color: '#94a3b8' }} />
                                                <span style={{ fontWeight: 600, fontSize: '14px' }}>{link.user.name}</span>
                                            </div>
                                            <p style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '22px' }}>{link.user.email}</p>
                                        </div>

                                        <div>
                                            <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Property Details</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <MapPin style={{ width: '14px', color: '#94a3b8' }} />
                                                <span style={{ fontWeight: 600, fontSize: '14px' }}>{link.property.address}</span>
                                            </div>
                                            <p style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '22px' }}>{link.property.suburb}</p>
                                        </div>

                                        <div>
                                            <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Identifiers</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Hash style={{ width: '14px', color: '#94a3b8' }} />
                                                <span style={{ fontWeight: 600, fontSize: '14px' }}>{link.property.account_number}</span>
                                            </div>
                                            <p style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '22px' }}>Stand: {link.property.stand_number}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button
                                            onClick={() => verifyMutation.mutate({ id: link.id, status: 'VERIFIED' })}
                                            className="btn-primary"
                                            style={{ background: '#16a34a', border: 'none', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                                        >
                                            <CheckCircle2 style={{ width: '16px' }} />
                                            Verify
                                        </button>
                                        <button
                                            onClick={() => verifyMutation.mutate({ id: link.id, status: 'REJECTED' })}
                                            style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                                        >
                                            <XCircle style={{ width: '16px' }} />
                                            Deny
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="stat-card" style={{ textAlign: 'center', padding: '4rem' }}>
                                <div style={{ width: '64px', height: '64px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                    <CheckCircle2 style={{ width: '32px', color: '#16a34a', opacity: 0.5 }} />
                                </div>
                                <h3 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>All Caught Up!</h3>
                                <p style={{ color: '#64748b', fontSize: '14px' }}>There are no pending property link requests awaiting verification.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AdminProperties;
