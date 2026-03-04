import React from 'react';
import Layout from '../components/Layout';
import {
    Search,
    CheckCircle2,
    Calendar
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const BillsPage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: bills, isLoading } = useQuery({
        queryKey: ['bills-list'],
        queryFn: async () => {
            const res = await api.get('/bills');
            return res.data;
        }
    });

    const payMutation = useMutation({
        mutationFn: async ({ billId, amount }: { billId: string; amount: number }) => {
            return api.post('/payments/initiate', {
                bill_id: billId,
                amount,
                payment_method: 'CARD'
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bills-list'] });
        }
    });

    const handlePayBill = (bill: any) => {
        navigate(`/bills/${bill.id}`);
    };

    const handlePayBalance = () => {
        if (unPaidBills.length > 0) {
            navigate(`/bills/${unPaidBills[0].id}`);
        }
    };

    if (isLoading) {
        return <Layout><div>Synchronizing with billing server...</div></Layout>;
    }

    const unPaidBills = bills?.filter((b: any) => b.status === 'UNPAID' || b.status === 'OVERDUE') || [];
    const totalOutstanding = unPaidBills.reduce((sum: number, b: any) => sum + parseFloat(b.total_amount), 0);

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Municipal Bills</h1>
                    <p className="page-subtitle">View and manage all your property bills.</p>
                </div>
                <div className="search-box">
                    <Search className="input-icon" />
                    <input
                        type="text"
                        placeholder="Search bills..."
                        className="input-field"
                    />
                </div>
            </div>

            <div className="table-container mb-8">
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Property</th>
                                <th>Period</th>
                                <th>Amount</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bills?.map((bill: any) => (
                                <tr key={bill.id} className="group">
                                    <td>
                                        <div className="flex items-center gap-4">
                                            <div className="stat-icon-wrapper bg-blue-light" style={{ padding: '0.25rem 0.5rem', borderRadius: '0.375rem', fontSize: '10px', fontWeight: 700 }}>
                                                BP
                                            </div>
                                            <span style={{ fontWeight: 700 }}>{bill.property.address}</span>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 500 }}>{bill.billing_month}/{bill.billing_year}</td>
                                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>${parseFloat(bill.total_amount).toFixed(2)}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{new Date(bill.due_date).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`badge ${bill.status === 'PAID' ? "badge-success" :
                                            bill.status === 'OVERDUE' ? "badge-danger" :
                                                "badge-info"
                                            }`}>
                                            {bill.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/bills/${bill.id}`)}
                                                className="forgot-link"
                                                style={{ fontSize: '12px' }}
                                            >
                                                Details
                                            </button>
                                            {bill.status !== 'PAID' && (
                                                <button
                                                    className="btn-primary"
                                                    style={{ width: 'auto', padding: '0.375rem 0.75rem', fontSize: '10px' }}
                                                    onClick={() => handlePayBill(bill)}
                                                    disabled={payMutation.isPending}
                                                >
                                                    {payMutation.isPending ? 'Processing...' : 'Pay'}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {bills?.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No bills found for your account.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
                {/* Bill Breakdown Card */}
                <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <div className="flex-between mb-6">
                        <h3 className="card-title">Outstanding Summary</h3>
                    </div>

                    <div style={{ padding: '1.5rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Arrears</p>
                            <h4 style={{ fontSize: '24px', fontWeight: 900 }}>${totalOutstanding.toFixed(2)}</h4>
                        </div>
                        <button
                            className="btn-primary"
                            style={{ width: 'auto', padding: '0.625rem 1.25rem' }}
                            disabled={totalOutstanding <= 0 || payMutation.isPending}
                            onClick={handlePayBalance}
                        >
                            {payMutation.isPending ? 'Processing...' : 'Pay Balance'}
                        </button>
                    </div>
                </div>

                {/* Payment Methods Info */}
                <div className="stat-card">
                    <h3 className="card-title mb-6">Security & Transparency</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>All transactions are encrypted. You will receive an instant digital receipt after every successful payment.</p>

                    <div className="grid grid-cols-2 gap-4">
                        <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                            <div className="avatar" style={{ width: '36px', height: '36px', flexShrink: 0 }}>
                                <CheckCircle2 style={{ width: '18px', color: 'white' }} />
                            </div>
                            <p style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Instant Receipts</p>
                        </div>
                        <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                            <div className="avatar" style={{ width: '36px', height: '36px', flexShrink: 0 }}>
                                <Calendar style={{ width: '18px', color: 'white' }} />
                            </div>
                            <p style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>History Logs</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default BillsPage;

