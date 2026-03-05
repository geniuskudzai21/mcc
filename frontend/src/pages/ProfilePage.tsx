import React, { useState } from 'react';
import Layout from '../components/Layout';
import { User, Mail, Phone, Shield, Building2, Plus, X, Clock, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const NAVY = '#001e3c';
const ACCENT = '#09d6f1';

const ProfilePage: React.FC = () => {
    const { user: authUser } = useAuth();
    const isAdmin = authUser?.role !== 'USER';
    const queryClient = useQueryClient();
    const [showPropertyModal, setShowPropertyModal] = useState(false);
    const [propertyForm, setPropertyForm] = useState({ stand_number: '', address: '', suburb: '' });

    const { data: user, isLoading } = useQuery({
        queryKey: ['user-me'],
        queryFn: async () => { 
            const token = localStorage.getItem('token');
            console.log('Token from localStorage:', token);
            console.log('Fetching user profile...');
            const res = await api.get('/users/me'); 
            console.log('User profile response:', res.data);
            return res.data; 
        }
    });

    const linkPropertyMutation = useMutation({
        mutationFn: async () => api.post('/users/link-property', propertyForm),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-me'] });
            setShowPropertyModal(false);
            setPropertyForm({ stand_number: '', address: '', suburb: '' });
            alert('Property link request submitted! Awaiting admin verification.');
        },
        onError: (err: any) => alert(err.response?.data?.message || 'Failed to link property')
    });

    if (isLoading) {
        return (
            <Layout isAdmin={isAdmin}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem', flexDirection: 'column' }}>
                    <div style={{ width: '36px', height: '36px', border: `3px solid ${ACCENT}`, borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Loading profile...</p>
                </div>
            </Layout>
        );
    }

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'VERIFIED': return { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: 'Verified', icon: CheckCircle };
            case 'REJECTED': return { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Rejected', icon: AlertCircle };
            default: return { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'Pending', icon: Clock };
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.65rem 0.875rem 0.65rem 2.25rem',
        border: '1.5px solid #e5e7eb', borderRadius: '8px',
        fontSize: '0.85rem', background: '#f9fafb',
        outline: 'none', color: '#374151',
        fontFamily: 'inherit',
    };

    return (
        <Layout isAdmin={isAdmin}>
            <style>{`
                @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .profile-card { animation: fadeUp 0.35s ease both; }
                .prop-item:hover { background: #f0f9ff; }
                .link-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,30,60,0.2); }
                .modal-input:focus { border-color: ${NAVY} !important; background: #fff !important; }
            `}</style>

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>

                {/* ── PAGE HEADER ── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', animation: 'fadeUp 0.3s ease both' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <div style={{ width: '3px', height: '18px', background: ACCENT, borderRadius: '2px' }} />
                            <h1 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#111827', letterSpacing: '-0.02em' }}>
                                {isAdmin ? 'Administrative Identity' : 'Citizen Profile'}
                            </h1>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginLeft: '11px' }}>
                            {isAdmin ? 'Your administrative account details' : 'Manage your personal information and property links'}
                        </p>
                    </div>
                    {!isAdmin && (
                        <button
                            className="link-btn"
                            onClick={() => setShowPropertyModal(true)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '7px',
                                padding: '0.55rem 1rem', background: NAVY,
                                color: 'white', borderRadius: '8px', fontSize: '0.78rem',
                                fontWeight: 700, border: 'none', cursor: 'pointer',
                                transition: 'all 0.2s ease', letterSpacing: '0.02em',
                            }}
                        >
                            <Plus style={{ width: '13px' }} />
                            Link Property
                        </button>
                    )}
                </div>

                <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.25rem' }}>

                    {/* ── LEFT: Identity Card ── */}
                    <div className="profile-card" style={{ animationDelay: '0.05s' }}>
                        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e9ecf0', overflow: 'hidden' }}>
                            {/* Navy top band */}
                            <div style={{ background: NAVY, padding: '2rem 1.5rem 3.5rem', position: 'relative', textAlign: 'center' }}>
                                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '16px 16px', pointerEvents: 'none' }} />
                                <div style={{ position: 'absolute', bottom: '-32px', left: '50%', transform: 'translateX(-50%)', width: '64px', height: '64px', background: ACCENT, borderRadius: '50%', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900, color: NAVY, zIndex: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                                    {user?.name?.[0]?.toUpperCase()}
                                </div>
                                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.12em', position: 'relative', zIndex: 1 }}>
                                    {isAdmin ? 'Administrator' : 'Citizen Account'}
                                </p>
                            </div>

                            {/* Info section */}
                            <div style={{ padding: '2.5rem 1.5rem 1.5rem', textAlign: 'center' }}>
                                <h3 style={{ fontWeight: 900, fontSize: '1rem', color: '#111827', marginBottom: '2px' }}>{user?.name}</h3>
                                <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: '1.5rem' }}>
                                    {isAdmin ? user?.role : `Member since ${new Date(user?.created_at).getFullYear()}`}
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', textAlign: 'left', borderTop: '1px solid #f3f4f6', paddingTop: '1.25rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 0.625rem', background: '#f9fafb', borderRadius: '6px' }}>
                                        <Mail style={{ width: '13px', color: '#9ca3af', flexShrink: 0 }} />
                                        <span style={{ fontSize: '0.75rem', color: '#374151', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</span>
                                    </div>
                                    {!isAdmin && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 0.625rem', background: '#f9fafb', borderRadius: '6px' }}>
                                            <Phone style={{ width: '13px', color: '#9ca3af', flexShrink: 0 }} />
                                            <span style={{ fontSize: '0.75rem', color: '#374151', fontWeight: 500 }}>{user?.phone || 'Not provided'}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 0.625rem', background: '#f9fafb', borderRadius: '6px' }}>
                                        <Shield style={{ width: '13px', color: '#9ca3af', flexShrink: 0 }} />
                                        <span style={{ fontSize: '0.75rem', color: '#374151', fontWeight: 500 }}>{user?.role || 'USER'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: Details ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                        {/* Security Credentials */}
                        <div className="profile-card" style={{ background: 'white', borderRadius: '12px', border: '1px solid #e9ecf0', padding: '1.5rem', animationDelay: '0.1s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                                <div style={{ background: '#f0f9ff', padding: '6px', borderRadius: '7px' }}>
                                    <Lock style={{ width: '13px', color: '#0369a1' }} />
                                </div>
                                <h4 style={{ fontWeight: 800, fontSize: '0.85rem', color: '#111827' }}>Security Credentials</h4>
                                <span style={{ marginLeft: 'auto', fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px', background: '#f0fdf4', color: '#16a34a', borderRadius: '999px' }}>Read-only</span>
                            </div>

                            <div className="profile-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280', marginBottom: '0.35rem' }}>Full Name</label>
                                    <div style={{ position: 'relative' }}>
                                        <User style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', color: '#d1d5db' }} />
                                        <input type="text" defaultValue={user?.name} style={inputStyle} readOnly />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280', marginBottom: '0.35rem' }}>Email Address</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', color: '#d1d5db' }} />
                                        <input type="text" defaultValue={user?.email} style={inputStyle} readOnly />
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e9ecf0', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                <Shield style={{ width: '13px', color: '#9ca3af', flexShrink: 0, marginTop: '1px' }} />
                                <div>
                                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Immutable Identity</p>
                                    <p style={{ fontSize: '0.72rem', color: '#6b7280', lineHeight: 1.5 }}>Identity records can only be modified by the IT Department through official channels.</p>
                                </div>
                            </div>
                        </div>

                        {/* Linked Properties (user only) */}
                        {!isAdmin && (
                            <div className="profile-card" style={{ background: 'white', borderRadius: '12px', border: '1px solid #e9ecf0', padding: '1.5rem', animationDelay: '0.15s' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                                    <div style={{ background: '#faf5ff', padding: '6px', borderRadius: '7px' }}>
                                        <Building2 style={{ width: '13px', color: '#7c3aed' }} />
                                    </div>
                                    <h4 style={{ fontWeight: 800, fontSize: '0.85rem', color: '#111827' }}>Linked Properties</h4>
                                    <span style={{ marginLeft: 'auto', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', background: '#f9fafb', color: '#6b7280', borderRadius: '999px', border: '1px solid #e9ecf0' }}>
                                        {user?.properties?.length || 0} linked
                                    </span>
                                </div>

                                {user?.properties && user.properties.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                        {user.properties.map((up: any) => {
                                            const s = getStatusConfig(up.status);
                                            const Icon = s.icon;
                                            return (
                                                <div key={up.property.id} className="prop-item" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6', transition: 'background 0.15s ease' }}>
                                                    <div style={{ width: '38px', height: '38px', background: NAVY, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <Building2 style={{ width: '16px', color: ACCENT }} />
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#111827', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{up.property.address}</p>
                                                        <p style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{up.property.suburb} · Stand {up.property.stand_number}</p>
                                                    </div>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: '999px', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0 }}>
                                                        <Icon style={{ width: '11px' }} />
                                                        {s.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '2rem', border: '1.5px dashed #e5e7eb', borderRadius: '10px' }}>
                                        <Building2 style={{ width: '32px', margin: '0 auto 0.75rem', color: '#d1d5db', display: 'block' }} />
                                        <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#374151', marginBottom: '4px' }}>No Properties Linked</p>
                                        <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Link a property to access billing and payment history.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Admin block */}
                        {isAdmin && (
                            <div className="profile-card" style={{ background: 'white', borderRadius: '12px', border: `1.5px solid ${NAVY}`, padding: '1.5rem', animationDelay: '0.15s' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.875rem' }}>
                                    <div style={{ background: NAVY, padding: '6px', borderRadius: '7px' }}>
                                        <Shield style={{ width: '13px', color: ACCENT }} />
                                    </div>
                                    <h4 style={{ fontWeight: 800, fontSize: '0.85rem', color: NAVY }}>Administrative Access</h4>
                                </div>
                                <p style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.7 }}>
                                    As an official of the City of Mutare, your account holds elevated privileges to manage municipal operations.
                                    All administrative actions are logged and subject to audit by the Supervisory Committee.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Link Property Modal ── */}
            {showPropertyModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', animation: 'fadeUp 0.2s ease both' }}>
                    <div style={{ background: 'white', borderRadius: '14px', width: '440px', overflow: 'hidden', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}>
                        {/* Modal header */}
                        <div style={{ background: NAVY, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Building2 style={{ width: '15px', color: ACCENT }} />
                                <h3 style={{ color: 'white', fontSize: '0.9rem', fontWeight: 800 }}>Link Municipal Property</h3>
                            </div>
                            <button onClick={() => setShowPropertyModal(false)} style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '2px' }}>
                                <X style={{ width: '16px' }} />
                            </button>
                        </div>

                        <div style={{ padding: '1.5rem' }}>
                            {/* Warning */}
                            <div style={{ display: 'flex', gap: '10px', padding: '0.75rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', marginBottom: '1.25rem' }}>
                                <Shield style={{ width: '14px', color: '#d97706', flexShrink: 0, marginTop: '1px' }} />
                                <p style={{ fontSize: '0.72rem', color: '#92400e', lineHeight: 1.5 }}>
                                    Property links are subject to verification by the Billing Department. Providing false information may lead to account suspension.
                                </p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                {[
                                    { label: 'Stand / Account Number', key: 'stand_number', placeholder: 'e.g. ST-101 or ACC-0001' },
                                    { label: 'Street Address', key: 'address', placeholder: 'e.g. 123 First Avenue' },
                                    { label: 'Suburb', key: 'suburb', placeholder: 'e.g. Chikanga' },
                                ].map(({ label, key, placeholder }) => (
                                    <div key={key}>
                                        <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#374151', marginBottom: '0.35rem' }}>{label}</label>
                                        <input
                                            type="text"
                                            placeholder={placeholder}
                                            className="modal-input"
                                            value={(propertyForm as any)[key]}
                                            onChange={(e) => setPropertyForm({ ...propertyForm, [key]: e.target.value })}
                                            style={{ width: '100%', padding: '0.65rem 0.875rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.85rem', outline: 'none', color: '#111827', fontFamily: 'inherit', background: '#f9fafb', transition: 'border-color 0.15s, background 0.15s' }}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                                <button onClick={() => setShowPropertyModal(false)} style={{ flex: 1, padding: '0.7rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontWeight: 700, color: '#6b7280', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit', background: 'white' }}>
                                    Cancel
                                </button>
                                <button
                                    onClick={() => linkPropertyMutation.mutate()}
                                    disabled={!propertyForm.stand_number || !propertyForm.address || linkPropertyMutation.isPending}
                                    style={{ flex: 1, padding: '0.7rem', background: (!propertyForm.stand_number || !propertyForm.address) ? '#9ca3af' : NAVY, color: 'white', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', border: 'none', cursor: (!propertyForm.stand_number || !propertyForm.address) ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}
                                >
                                    {linkPropertyMutation.isPending ? 'Submitting...' : 'Submit for Review'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default ProfilePage;
