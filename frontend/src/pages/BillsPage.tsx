import React, { useState } from 'react';
import Layout from '../components/Layout';
import {
    Search,
    CheckCircle2,
    Calendar,
    CreditCard,
    X,
    Loader2,
    ShieldCheck,
    Smartphone,
    Printer
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const BillsPage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedBill, setSelectedBill] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'ECOCASH'>('CARD');
    const [processingStep, setProcessingStep] = useState(0);
    const [showReceipt, setShowReceipt] = useState(false);
    const [lastPayment, setLastPayment] = useState<any>(null);

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

    const quickPayMutation = useMutation({
        mutationFn: async ({ billId, amount, method }: { billId: string; amount: number; method: string }) => {
            setProcessingStep(1);
            await new Promise(r => setTimeout(r, 1200));
            setProcessingStep(2);
            await new Promise(r => setTimeout(r, 1500));
            setProcessingStep(3);
            
            return api.post('/payments/initiate', {
                bill_id: billId,
                amount,
                payment_method: method
            });
        },
        onSuccess: (res) => {
            setProcessingStep(4);
            setLastPayment(res.data.payment);
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['bills-list'] });
                setShowPaymentModal(false);
                setProcessingStep(0);
                setShowReceipt(true);
            }, 800);
        },
        onError: () => {
            setProcessingStep(0);
            alert('Payment failed. Please try again.');
        }
    });

    const handlePayBill = (bill: any) => {
        setSelectedBill(bill);
        setShowPaymentModal(true);
    };

    const handleQuickPay = () => {
        if (selectedBill) {
            quickPayMutation.mutate({
                billId: selectedBill.id,
                amount: parseFloat(selectedBill.total_amount),
                method: paymentMethod
            });
        }
    };

    const handlePayBalance = () => {
        if (unPaidBills.length > 0) {
            setSelectedBill(unPaidBills[0]);
            setShowPaymentModal(true);
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
                                                    style={{ width: 'auto', padding: '0.375rem 1rem', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                                                    onClick={() => handlePayBill(bill)}
                                                    disabled={payMutation.isPending}
                                                >
                                                    <CreditCard style={{ width: '14px' }} />
                                                    {payMutation.isPending ? 'Processing...' : 'Pay Now'}
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

            {/* Payment Modal */}
            {showPaymentModal && selectedBill && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '400px' }}>
                        {processingStep > 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <div style={{ width: '60px', height: '60px', background: processingStep === 4 ? '#dcfce7' : '#e0e7ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                    {processingStep === 4 ? (
                                        <CheckCircle2 style={{ width: '30px', color: '#16a34a' }} />
                                    ) : (
                                        <Loader2 className="animate-spin" style={{ width: '30px', color: '#2563eb' }} />
                                    )}
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                                    {processingStep === 1 ? 'Processing...' : 
                                     processingStep === 2 ? 'Authorizing...' : 
                                     processingStep === 3 ? 'Verifying...' : 'Payment Successful!'}
                                </h3>
                                <p style={{ color: '#64748b', fontSize: '14px' }}>
                                    {processingStep < 4 ? 'Please wait...' : 'Your payment has been processed.'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Pay Bill</h3>
                                    <button onClick={() => setShowPaymentModal(false)}><X style={{ width: '20px', color: '#6b7280' }} /></button>
                                </div>

                                <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ color: '#6b7280', fontSize: '13px' }}>Property</span>
                                        <span style={{ fontWeight: 600, fontSize: '13px' }}>{selectedBill.property?.address}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ color: '#6b7280', fontSize: '13px' }}>Period</span>
                                        <span style={{ fontWeight: 600, fontSize: '13px' }}>{selectedBill.billing_month}/{selectedBill.billing_year}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #e5e7eb' }}>
                                        <span style={{ fontWeight: 700, fontSize: '14px' }}>Total Amount</span>
                                        <span style={{ fontWeight: 700, fontSize: '18px', color: '#2563eb' }}>${parseFloat(selectedBill.total_amount).toFixed(2)}</span>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '0.5rem' }}>Payment Method</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => setPaymentMethod('CARD')}
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem',
                                                border: `2px solid ${paymentMethod === 'CARD' ? '#2563eb' : '#e5e7eb'}`,
                                                borderRadius: '8px',
                                                background: paymentMethod === 'CARD' ? '#eff6ff' : 'white',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <CreditCard style={{ width: '16px', color: '#16a34a' }} />
                                            <span style={{ fontWeight: 600, fontSize: '13px' }}>Card</span>
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod('ECOCASH')}
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem',
                                                border: `2px solid ${paymentMethod === 'ECOCASH' ? '#2563eb' : '#e5e7eb'}`,
                                                borderRadius: '8px',
                                                background: paymentMethod === 'ECOCASH' ? '#eff6ff' : 'white',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <Smartphone style={{ width: '16px', color: '#dc2626' }} />
                                            <span style={{ fontWeight: 600, fontSize: '13px' }}>EcoCash</span>
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.5rem', background: '#f0fdf4', borderRadius: '6px' }}>
                                    <ShieldCheck style={{ width: '16px', color: '#16a34a' }} />
                                    <span style={{ fontSize: '12px', color: '#16a34a' }}>Secure 256-bit SSL encrypted transaction</span>
                                </div>

                                <button
                                    onClick={handleQuickPay}
                                    className="btn-primary"
                                    style={{ width: '100%', padding: '0.875rem', fontSize: '14px' }}
                                >
                                    Pay ${parseFloat(selectedBill.total_amount).toFixed(2)}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Receipt Modal */}
            {showReceipt && lastPayment && selectedBill && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(10px)', padding: '1rem' }}>
                    <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '28rem', maxHeight: '90vh', overflow: 'auto' }}>
                        <div style={{ padding: '1.5rem' }}>
                            <button
                                onClick={() => setShowReceipt(false)}
                                style={{ position: 'absolute', top: '1rem', right: '1rem', color: '#003366', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                <X style={{ width: '1.25rem' }} />
                            </button>

                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ width: '60px', height: '60px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                    <CheckCircle2 style={{ width: '30px', color: '#16a34a' }} />
                                </div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#003366', marginBottom: '0.25rem' }}>PAYMENT RECEIPT</h2>
                                <p style={{ color: '#16a34a', fontWeight: 600 }}>Transaction Successful</p>
                            </div>

                            <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px dashed #e2e8f0' }}>
                                    <span style={{ color: '#64748b', fontSize: '12px' }}>Receipt No:</span>
                                    <span style={{ fontWeight: 600, fontSize: '12px', fontFamily: 'monospace' }}>{lastPayment.transaction_reference}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px dashed #e2e8f0' }}>
                                    <span style={{ color: '#64748b', fontSize: '12px' }}>Date:</span>
                                    <span style={{ fontWeight: 600, fontSize: '12px' }}>{new Date(lastPayment.paid_at).toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px dashed #e2e8f0' }}>
                                    <span style={{ color: '#64748b', fontSize: '12px' }}>Account No:</span>
                                    <span style={{ fontWeight: 600, fontSize: '12px' }}>{selectedBill.property?.account_number}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px dashed #e2e8f0' }}>
                                    <span style={{ color: '#64748b', fontSize: '12px' }}>Property:</span>
                                    <span style={{ fontWeight: 600, fontSize: '12px' }}>{selectedBill.property?.address}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px dashed #e2e8f0' }}>
                                    <span style={{ color: '#64748b', fontSize: '12px' }}>Billing Period:</span>
                                    <span style={{ fontWeight: 600, fontSize: '12px' }}>{selectedBill.billing_month}/{selectedBill.billing_year}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b', fontSize: '12px' }}>Payment Method:</span>
                                    <span style={{ fontWeight: 600, fontSize: '12px', color: '#2563eb' }}>{lastPayment.payment_method}</span>
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', padding: '1rem', background: '#003366', borderRadius: '8px', marginBottom: '1rem' }}>
                                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount Paid</span>
                                <p style={{ color: 'white', fontSize: '28px', fontWeight: 900, margin: '0.25rem 0' }}>${parseFloat(lastPayment.amount).toFixed(2)}</p>
                            </div>

                            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                <p style={{ fontSize: '11px', color: '#64748b' }}>Thank you for your payment. A copy of this receipt has been sent to your email.</p>
                            </div>

                            <button
                                onClick={() => window.print()}
                                style={{ width: '100%', padding: '0.75rem', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            >
                                <Printer style={{ width: '16px' }} />
                                Print Receipt
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default BillsPage;

