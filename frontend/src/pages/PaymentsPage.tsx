import React from 'react';
import Layout from '../components/Layout';
import {
    CreditCard,
    CheckCircle2,
    ArrowUpRight,
    Receipt
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const PaymentsPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: payments, isLoading } = useQuery({
        queryKey: ['payments-history'],
        queryFn: async () => {
            const res = await api.get('/payments/history');
            return res.data;
        }
    });

    if (isLoading) {
        return <Layout><div className="flex-center" style={{ height: '60vh' }}>Synchronizing with financial system...</div></Layout>;
    }

    const annualSpending = payments?.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0) || 0;

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Payment History</h1>
                    <p className="page-subtitle">Track your municipal payments and download receipts.</p>
                </div>
            </div>

            <div className="mb-8" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {payments?.map((payment: any) => (
                    <div key={payment.id} className="payment-card">
                        <div className="payment-icon-box">
                            <CheckCircle2 className="nav-icon" style={{ width: '1.5rem', height: '1.5rem' }} />
                        </div>

                        <div className="payment-info" style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <h3 className="payment-title">Payment for {payment.bill?.property?.address}</h3>
                                <span className="stat-label" style={{ background: 'var(--bg-main)', padding: '0 0.5rem', borderRadius: '4px', fontSize: '9px' }}>{payment.id.slice(0, 8)}</span>
                            </div>
                            <div className="payment-meta">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <CreditCard style={{ width: '12px' }} />
                                    {payment.payment_method}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Receipt style={{ width: '12px' }} />
                                    Ref: {payment.transaction_reference}
                                </div>
                                <span style={{ marginLeft: 'auto', fontWeight: 700 }}>{new Date(payment.paid_at).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="payment-amount-box" style={{ textAlign: 'right', minWidth: '120px' }}>
                            <p className="payment-value" style={{ fontSize: '1.25rem' }}>${parseFloat(payment.amount).toFixed(2)}</p>
                            <button
                                onClick={() => navigate(`/bills/${payment.bill_id}`)}
                                className="forgot-link"
                                style={{ fontSize: '10px', marginTop: '0.5rem' }}
                            >
                                View Receipt
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 gap-8">
                <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <div className="flex-between">
                        <div>
                            <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Municipal Investment</p>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                <span style={{ fontSize: '2.5rem', fontWeight: 900 }}>${annualSpending.toFixed(2)}</span>
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>aggregate</span>
                            </div>
                        </div>
                        <ArrowUpRight style={{ width: '40px', height: '40px', color: 'var(--primary)', opacity: 0.2 }} />
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default PaymentsPage;
