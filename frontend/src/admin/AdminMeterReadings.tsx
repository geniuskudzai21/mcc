import React, { useState } from 'react';
import Layout from '../components/Layout';
import {
    Gauge,
    Plus,
    Search,
    Calendar,
    User,
    Trash2,
    X,
    Building2,
    Hash,
    FileText
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const AdminMeterReadings: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<any>(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [readingForm, setReadingForm] = useState({
        property_id: '',
        reading: '',
        reading_date: new Date().toISOString().split('T')[0],
        officer_name: '',
        notes: ''
    });

    const { data: readings, isLoading } = useQuery({
        queryKey: ['meter-readings'],
        queryFn: async () => {
            const res = await api.get('/admin/meter-readings');
            return res.data;
        }
    });

    const { data: properties } = useQuery({
        queryKey: ['admin-properties'],
        queryFn: async () => {
            const res = await api.get('/admin/properties');
            return res.data;
        }
    });

    const { data: readingHistory } = useQuery({
        queryKey: ['property-reading-history', selectedProperty?.id],
        queryFn: async () => {
            const res = await api.get(`/admin/properties/${selectedProperty.id}/readings/history`);
            return res.data;
        },
        enabled: !!selectedProperty && showHistoryModal
    });

    const addReadingMutation = useMutation({
        mutationFn: async (data: any) => {
            return api.post('/admin/meter-readings', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meter-readings'] });
            setShowAddModal(false);
            setReadingForm({
                property_id: '',
                reading: '',
                reading_date: new Date().toISOString().split('T')[0],
                officer_name: '',
                notes: ''
            });
            alert('Meter reading added successfully!');
        },
        onError: () => {
            alert('Failed to add meter reading');
        }
    });

    const deleteReadingMutation = useMutation({
        mutationFn: async (id: string) => {
            return api.delete(`/admin/meter-readings/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meter-readings'] });
            alert('Reading deleted successfully!');
        },
        onError: () => {
            alert('Failed to delete reading');
        }
    });

    const filteredReadings = readings?.filter((r: any) => {
        const term = searchTerm.toLowerCase();
        return (
            r.property?.account_number?.toLowerCase().includes(term) ||
            r.property?.address?.toLowerCase().includes(term) ||
            r.property?.owner_name?.toLowerCase().includes(term) ||
            r.officer_name?.toLowerCase().includes(term)
        );
    }) || [];

    const handleAddReading = () => {
        if (!readingForm.property_id || !readingForm.reading) {
            alert('Please select a property and enter a reading');
            return;
        }
        addReadingMutation.mutate(readingForm);
    };

    const handleViewHistory = (property: any) => {
        setSelectedProperty(property);
        setShowHistoryModal(true);
    };

    if (isLoading) {
        return <Layout isAdmin><div>Loading meter readings...</div></Layout>;
    }

    return (
        <Layout isAdmin>
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div>
                        <h1 className="page-title">Meter Readings</h1>
                        <p className="page-subtitle">Record and manage water meter readings for billing.</p>
                    </div>
                    <span style={{
                        background: '#dbeafe',
                        color: '#1d4ed8',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: 600
                    }}>
                        {readings?.length || 0} Readings
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        onClick={() => setShowAddModal(true)}
                    >
                        <Plus style={{ width: '16px' }} />
                        Add Reading
                    </button>
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
                width: '300px',
                marginBottom: '1.5rem'
            }}>
                <Search style={{ width: '16px', color: '#9ca3af' }} />
                <input
                    type="text"
                    placeholder="Search by account, address, or officer..."
                    style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%', background: 'transparent' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                            <th style={{ textAlign: 'left', padding: '0.875rem 1rem', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Property</th>
                            <th style={{ textAlign: 'left', padding: '0.875rem 1rem', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Account No.</th>
                            <th style={{ textAlign: 'left', padding: '0.875rem 1rem', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Reading (kL)</th>
                            <th style={{ textAlign: 'left', padding: '0.875rem 1rem', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Reading Date</th>
                            <th style={{ textAlign: 'left', padding: '0.875rem 1rem', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Officer</th>
                            <th style={{ textAlign: 'right', padding: '0.875rem 1rem', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReadings.length > 0 ? (
                            filteredReadings.map((reading: any) => (
                                <tr key={reading.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '36px', height: '36px', background: '#e0f2fe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Gauge style={{ width: '16px', color: '#0284c7' }} />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{reading.property?.address}</p>
                                                <p style={{ fontSize: '12px', color: '#6b7280' }}>{reading.property?.suburb}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '12px' }}>
                                            {reading.property?.account_number}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ fontWeight: 700, fontSize: '14px', color: '#059669' }}>
                                            {parseFloat(reading.reading).toFixed(2)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '13px', color: '#374151' }}>
                                            <Calendar style={{ width: '14px', color: '#9ca3af' }} />
                                            {new Date(reading.reading_date).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '13px', color: '#374151' }}>
                                            <User style={{ width: '14px', color: '#9ca3af' }} />
                                            {reading.officer_name || 'N/A'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => handleViewHistory(reading.property)}
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
                                                title="View History"
                                            >
                                                <FileText style={{ width: '14px', color: '#6b7280' }} />
                                            </button>
                                            <button
                                                onClick={() => deleteReadingMutation.mutate(reading.id)}
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
                                                title="Delete"
                                            >
                                                <Trash2 style={{ width: '14px', color: '#dc2626' }} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center' }}>
                                    <Gauge style={{ width: '48px', color: '#9ca3af', margin: '0 auto 1rem' }} />
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                                        {searchTerm ? 'No readings found' : 'No meter readings recorded'}
                                    </h3>
                                    <p style={{ color: '#6b7280', fontSize: '14px' }}>
                                        {searchTerm ? 'Try adjusting your search terms' : 'Click "Add Reading" to record a new meter reading'}
                                    </p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Reading Modal */}
            {showAddModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Add Meter Reading</h3>
                            <button onClick={() => setShowAddModal(false)}><X style={{ width: '20px' }} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '0.25rem' }}>Property</label>
                                <select
                                    value={readingForm.property_id}
                                    onChange={(e) => setReadingForm({ ...readingForm, property_id: e.target.value })}
                                    style={{ width: '100%', padding: '0.625rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                                >
                                    <option value="">Select Property</option>
                                    {properties?.map((p: any) => (
                                        <option key={p.id} value={p.id}>
                                            {p.account_number} - {p.address}, {p.suburb}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '0.25rem' }}>Meter Reading (kL)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={readingForm.reading}
                                        onChange={(e) => setReadingForm({ ...readingForm, reading: e.target.value })}
                                        placeholder="e.g., 125.50"
                                        style={{ width: '100%', padding: '0.625rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '0.25rem' }}>Reading Date</label>
                                    <input
                                        type="date"
                                        value={readingForm.reading_date}
                                        onChange={(e) => setReadingForm({ ...readingForm, reading_date: e.target.value })}
                                        style={{ width: '100%', padding: '0.625rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '0.25rem' }}>Officer Name</label>
                                <input
                                    type="text"
                                    value={readingForm.officer_name}
                                    onChange={(e) => setReadingForm({ ...readingForm, officer_name: e.target.value })}
                                    placeholder="Name of officer taking reading"
                                    style={{ width: '100%', padding: '0.625rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '0.25rem' }}>Notes (Optional)</label>
                                <textarea
                                    value={readingForm.notes}
                                    onChange={(e) => setReadingForm({ ...readingForm, notes: e.target.value })}
                                    placeholder="Any observations..."
                                    rows={2}
                                    style={{ width: '100%', padding: '0.625rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <button
                                onClick={() => setShowAddModal(false)}
                                style={{ flex: 1, padding: '0.625rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontWeight: 600, background: '#f9fafb' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddReading}
                                disabled={addReadingMutation.isPending}
                                style={{ flex: 1, padding: '0.625rem', background: '#2563eb', color: 'white', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                            >
                                {addReadingMutation.isPending ? 'Saving...' : 'Save Reading'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reading History Modal */}
            {showHistoryModal && selectedProperty && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '600px', maxHeight: '80vh', overflow: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Reading History</h3>
                                <p style={{ fontSize: '13px', color: '#6b7280' }}>
                                    {selectedProperty.address}, {selectedProperty.suburb}
                                </p>
                            </div>
                            <button onClick={() => setShowHistoryModal(false)}><X style={{ width: '20px' }} /></button>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f9fafb' }}>
                                    <th style={{ textAlign: 'left', padding: '0.5rem', fontSize: '11px' }}>Date</th>
                                    <th style={{ textAlign: 'right', padding: '0.5rem', fontSize: '11px' }}>Reading</th>
                                    <th style={{ textAlign: 'right', padding: '0.5rem', fontSize: '11px' }}>Consumption</th>
                                    <th style={{ textAlign: 'left', padding: '0.5rem', fontSize: '11px' }}>Officer</th>
                                </tr>
                            </thead>
                            <tbody>
                                {readingHistory?.map((r: any, index: number) => (
                                    <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '0.5rem', fontSize: '13px' }}>
                                            {new Date(r.reading_date).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '0.5rem', fontSize: '13px', textAlign: 'right', fontWeight: 600 }}>
                                            {parseFloat(r.reading).toFixed(2)} kL
                                        </td>
                                        <td style={{ padding: '0.5rem', fontSize: '13px', textAlign: 'right', color: r.consumption > 0 ? '#059669' : '#6b7280' }}>
                                            {r.consumption !== null ? `${r.consumption.toFixed(2)} kL` : '-'}
                                        </td>
                                        <td style={{ padding: '0.5rem', fontSize: '13px' }}>
                                            {r.officer_name || 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                                {(!readingHistory || readingHistory.length === 0) && (
                                    <tr>
                                        <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                                            No reading history available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default AdminMeterReadings;
