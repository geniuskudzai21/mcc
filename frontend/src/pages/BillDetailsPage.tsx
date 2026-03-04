import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import { ArrowLeft, CheckCircle, CreditCard, Smartphone, X, Loader2, ShieldCheck, Printer } from 'lucide-react';
import api from '../services/api';

const BillDetailsPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'ECOCASH' | 'ONEMONEY'>('CARD');
    const [processingStep, setProcessingStep] = useState<number>(0); // 0: Idle, 1: Initializing, 2: Authorizing, 3: Verifying, 4: Done
    const [lastPayment, setLastPayment] = useState<any>(null);

    const { data: bill, isLoading } = useQuery({
        queryKey: ['bill', id],
        queryFn: async () => {
            const res = await api.get(`/bills/${id}`);
            return res.data;
        },
        enabled: !!id
    });

    const payMutation = useMutation({
        mutationFn: async (method: string) => {
            setProcessingStep(1);
            // Simulate realistic multi-step delay
            await new Promise(r => setTimeout(r, 1200));
            setProcessingStep(2);
            await new Promise(r => setTimeout(r, 1500));
            setProcessingStep(3);

            return api.post('/payments/initiate', {
                bill_id: id,
                amount: parseFloat(bill?.total_amount),
                payment_method: method
            });
        },
        onSuccess: (res) => {
            setProcessingStep(4);
            setLastPayment(res.data.payment);
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['bills-list'] });
                queryClient.invalidateQueries({ queryKey: ['bill', id] });
                setShowPaymentModal(false);
                setShowReceipt(true);
            }, 800);
        },
        onError: (err: any) => {
            setProcessingStep(0);
            alert(err.response?.data?.message || 'Transaction could not be authorized. Please check your balance.');
        }
    });

    if (isLoading) {
        return <Layout><div className="flex-center" style={{ height: '60vh' }}>Synchronizing with Billing Server...</div></Layout>;
    }

    if (!bill) {
        return (
            <Layout>
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <p>Bill not found</p>
                    <button onClick={() => navigate(-1)} className="forgot-link">Go Back</button>
                </div>
            </Layout>
        );
    }

    const monthNames = [
        "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
        "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
    ];
    const formattedDate = `${monthNames[bill.billing_month - 1]} ${bill.billing_year}`;

    return (
        <Layout>
            <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '2rem 0' }}>
                <button
                    onClick={() => navigate(-1)}
                    className="forgot-link"
                    style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
                >
                    <ArrowLeft className="nav-icon" style={{ width: '1rem' }} />
                    Back to My Bills
                </button>

                <div className="municipal-bill-container no-print-visible" style={{ position: 'relative' }}>
                    {bill.status === 'PAID' && (
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-30deg)', border: '10px solid #16a34a', color: '#16a34a', padding: '1rem 3rem', fontSize: '64px', fontWeight: 900, borderRadius: '20px', opacity: 0.15, pointerEvents: 'none', textTransform: 'uppercase', zIndex: 10 }}>
                            PAID
                        </div>
                    )}

                    {/* Header */}
                    <header className="bill-header-main">
                        <div className="bill-header-left">
                            <p>Providing Service with Pride</p>
                            <p>BOX 910, MUTARE</p>
                        </div>
                        <div className="bill-header-right">
                            <h1>CITY OF MUTARE</h1>
                            <h2>MUNICIPAL BILLING STATEMENT</h2>
                        </div>
                    </header>

                    {/* Info Grid */}
                    <div className="bill-info-grid">
                        <div>
                            <div className="account-info-box">
                                <p>
                                    <span className="account-info-label">Account No:</span>
                                    <span className="account-number-highlight">{bill.property?.account_number}</span>
                                </p>
                                <p>
                                    <span className="account-info-label">Account Name:</span>
                                    <span className="account-number-highlight">{bill.property?.owner_name}</span>
                                </p>
                                <p>
                                    <span className="account-info-label">Stand/Property:</span>
                                    <span className="account-info-value" style={{ display: 'block', marginTop: '5px' }}>
                                        {bill.property?.address}<br />
                                        {bill.property?.suburb}, Mutare
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div>
                            <div style={{ textAlign: 'right', marginBottom: '1.5rem', fontWeight: 700 }}>
                                <div style={{ textTransform: 'uppercase', fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>STATEMENT OF ACCOUNT</div>
                                <span style={{ marginRight: '1rem', textTransform: 'uppercase', fontSize: '11px' }}>Date:</span>
                                <span style={{ color: '#003366', fontSize: '18px' }}>{formattedDate}</span>
                            </div>

                            <div className="summary-card">
                                <div className="summary-card-header">FINANCIAL SUMMARY</div>
                                <div className="summary-row">
                                    <span>Last Statement Balance:</span>
                                    <span className="font-bold">$0.00</span>
                                </div>
                                <div className="summary-row">
                                    <span>New Charges:</span>
                                    <span className="font-bold">${parseFloat(bill.total_amount).toFixed(2)}</span>
                                </div>
                                <div className="summary-row total">
                                    <span>TOTAL DUE (USD):</span>
                                    <span className="amount">${parseFloat(bill.total_amount).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <div style={{ flex: 1 }}>
                            <div className="billing-details-title">
                                <span>DESCRIPTION OF SERVICES</span>
                                <span>TARIFF AMOUNT</span>
                            </div>
                            <table className="billing-table">
                                <thead>
                                    <tr>
                                        <th>Municipal Service Detail</th>
                                        <th style={{ textAlign: 'right' }}>Total ($)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ background: '#f8fafc' }}>
                                        <td>OUTSTANDING BALANCE B/F</td>
                                        <td className="amount">$0.00</td>
                                    </tr>
                                    {bill.items?.map((item: any) => (
                                        <tr key={item.id}>
                                            <td>{item.description.toUpperCase()}</td>
                                            <td className="amount">${parseFloat(item.amount).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    <tr className="total-row">
                                        <td>TOTAL PAYABLE FOR PERIOD:</td>
                                        <td className="amount">${parseFloat(bill.total_amount).toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div className="payment-methods-section">
                                <div className="payment-methods-header">AUTHORIZED CHANNELS</div>
                                <div className="payment-logos">
                                    <div className="payment-method-item">
                                        <span className="payment-method-name ecocash">EcoCash</span>
                                    </div>
                                    <div className="payment-method-item">
                                        <span className="payment-method-name onemoney">OneMoney</span>
                                    </div>
                                    <div className="payment-method-item">
                                        <span className="payment-method-name paynow">Paynow Gateway</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ width: '300px', textAlign: 'center' }}>
                            <img
                                src="/mutarelogo.png"
                                alt="Coat of Arms"
                                style={{ width: '180px', marginBottom: '2rem', opacity: 0.8 }}
                            />

                            <div className="due-today-card no-print">
                                <div className="due-today-label" style={{ background: '#003366', color: 'white', padding: '0.5rem', borderRadius: '4px 4px 0 0' }}>CURRENT BALANCE</div>
                                <div style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
                                    <span className="due-today-value" style={{ fontSize: '32px' }}>${parseFloat(bill.total_amount).toFixed(2)}</span>
                                    <div className="bill-action-buttons" style={{ marginTop: '1.5rem' }}>
                                        {bill.status !== 'PAID' ? (
                                            <button
                                                className="btn-pay-now"
                                                onClick={() => setShowPaymentModal(true)}
                                            >
                                                PAY ONLINE NOW
                                            </button>
                                        ) : (
                                            <button
                                                className="btn-pay-now"
                                                style={{ background: '#003366' }}
                                                onClick={() => setShowReceipt(true)}
                                            >
                                                VIEW OFFICIAL RECEIPT
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <footer className="bill-redesign-footer">
                        <div className="bill-footer-row">
                            <span className="footer-label">Payable to: </span>
                            <span className="footer-content">The City Treasurer</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px', marginTop: '1rem' }}>
                            <span className="footer-label">Inquiries:</span>
                            <div className="footer-content">
                                MUTARE CITY COUNCIL | PHONES: (020) 62345 / 61045
                            </div>
                        </div>
                    </footer>
                </div>
            </div>

            {/* Compact Payment Modal */}
            {showPaymentModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,10,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(8px)' }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '24rem', boxShadow: 'var(--shadow-2xl)', position: 'relative' }}>
                        {processingStep === 0 && (
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                style={{ position: 'absolute', top: '1rem', right: '1rem', color: '#64748b' }}
                            >
                                <X style={{ width: '1.25rem' }} />
                            </button>
                        )}

                        {processingStep > 0 ? (
                            <div className="text-center py-8">
                                <div className="processing-pulse">
                                    <div className="processing-pulse-dot">
                                        {processingStep === 4 ? <CheckCircle style={{ width: '2.5rem' }} /> : <ShieldCheck style={{ width: '2.5rem' }} />}
                                    </div>
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '0.5rem', color: '#003366' }}>
                                    {processingStep === 1 ? 'Initializing...' :
                                        processingStep === 2 ? 'Authorizing...' :
                                            processingStep === 3 ? 'Verifying...' : 'Payment Confirmed!'}
                                </h3>
                                <p style={{ color: '#64748b', fontSize: '14px' }}>
                                    {processingStep < 4 ? 'Please do not close this window.' : 'Your receipt is ready.'}
                                </p>
                                {processingStep < 4 && <Loader2 className="animate-spin" style={{ margin: '1.5rem auto 0', color: 'var(--primary)' }} />}
                            </div>
                        ) : (
                            <>
                                <div className="text-center mb-6">
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#003366' }}>Secure Payment</h2>
                                    <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '0.5rem', borderRadius: '0.5rem', display: 'inline-block', fontSize: '12px', fontWeight: 700, marginTop: '0.5rem' }}>
                                        Amount: ${parseFloat(bill.total_amount).toFixed(2)}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <button
                                        onClick={() => setPaymentMethod('ECOCASH')}
                                        style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem', borderRadius: '0.75rem', border: `2px solid ${paymentMethod === 'ECOCASH' ? 'var(--primary)' : 'var(--border)'}`, background: paymentMethod === 'ECOCASH' ? '#eff6ff' : 'white', width: '100%', transition: 'all 0.2s' }}
                                    >
                                        <Smartphone style={{ width: '1.5rem', color: '#dc2626' }} />
                                        <span style={{ fontWeight: 700, fontSize: '14px' }}>EcoCash</span>
                                    </button>

                                    <button
                                        onClick={() => setPaymentMethod('CARD')}
                                        style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem', borderRadius: '0.75rem', border: `2px solid ${paymentMethod === 'CARD' ? 'var(--primary)' : 'var(--border)'}`, background: paymentMethod === 'CARD' ? '#eff6ff' : 'white', width: '100%', transition: 'all 0.2s' }}
                                    >
                                        <CreditCard style={{ width: '1.5rem', color: '#16a34a' }} />
                                        <span style={{ fontWeight: 700, fontSize: '14px' }}>Bank Card</span>
                                    </button>
                                </div>

                                <button
                                    className="btn-primary"
                                    style={{ marginTop: '1.5rem' }}
                                    onClick={() => payMutation.mutate(paymentMethod)}
                                >
                                    CONFIRM PAYMENT
                                </button>
                                <p style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'center', marginTop: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Secure 256-bit SSL Encrypted Transaction
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Instant Receipt Modal */}
            {showReceipt && lastPayment && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,10,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, backdropFilter: 'blur(10px)', padding: '1rem' }}>
                    <div style={{ width: '100%', maxWidth: '30rem' }}>
                        <div className="municipal-receipt-container" style={{ padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
                            <button
                                onClick={() => setShowReceipt(false)}
                                style={{ position: 'absolute', top: '1rem', right: '1rem', color: '#003366' }}
                                className="no-print"
                            >
                                <X style={{ width: '1.25rem' }} />
                            </button>

                            <div className="receipt-watermark" style={{ fontSize: '60px', opacity: 0.1 }}>PAID</div>

                            <div className="receipt-header" style={{ marginBottom: '1.25rem', paddingBottom: '1rem' }}>
                                <img src="/mutarelogo.png" alt="Logo" className="receipt-logo" style={{ width: '60px', marginBottom: '0.5rem' }} />
                                <h2 className="receipt-title" style={{ fontSize: '18px' }}>CITY OF MUTARE</h2>
                                <p className="receipt-subtitle" style={{ fontSize: '10px' }}>Official Payment Receipt</p>
                            </div>

                            <div className="receipt-body">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1.5rem' }}>
                                    <div className="receipt-row" style={{ flexDirection: 'column', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                        <span className="receipt-label">Receipt No:</span>
                                        <span className="receipt-value" style={{ textAlign: 'left', fontSize: '12px' }}>{lastPayment.transaction_reference}</span>
                                    </div>
                                    <div className="receipt-row" style={{ flexDirection: 'column', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                        <span className="receipt-label">Date:</span>
                                        <span className="receipt-value" style={{ textAlign: 'left', fontSize: '12px' }}>{new Date(lastPayment.paid_at).toLocaleString()}</span>
                                    </div>
                                    <div className="receipt-row" style={{ flexDirection: 'column', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                        <span className="receipt-label">Account No:</span>
                                        <span className="receipt-value" style={{ textAlign: 'left', fontSize: '12px' }}>{bill.property?.account_number}</span>
                                    </div>
                                    <div className="receipt-row" style={{ flexDirection: 'column', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                        <span className="receipt-label">Paid By (Account Name):</span>
                                        <span className="receipt-value" style={{ textAlign: 'left', fontSize: '11px' }}>{bill.property?.owner_name}</span>
                                    </div>
                                    <div className="receipt-row" style={{ flexDirection: 'column', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                        <span className="receipt-label">Property Address:</span>
                                        <span className="receipt-value" style={{ textAlign: 'left', fontSize: '11px' }}>{bill.property?.address}, {bill.property?.suburb}</span>
                                    </div>
                                </div>

                                <div className="receipt-divider" style={{ margin: '1rem 0' }}></div>

                                <div className="receipt-row" style={{ marginBottom: '0.5rem' }}>
                                    <span className="receipt-label">Service Period:</span>
                                    <span className="receipt-value" style={{ fontSize: '12px' }}>{formattedDate}</span>
                                </div>
                                <div className="receipt-row" style={{ marginBottom: '0.5rem' }}>
                                    <span className="receipt-label">Payment Mode:</span>
                                    <span className="receipt-value" style={{ color: '#16a34a', fontSize: '12px' }}>{lastPayment.payment_method}</span>
                                </div>

                                <div className="receipt-total-box" style={{ padding: '0.75rem', marginTop: '1rem', background: '#f8fafc', border: '1.5px solid #003366', borderRadius: '4px' }}>
                                    <span className="receipt-total-label" style={{ color: '#003366', fontSize: '10px' }}>TOTAL AMOUNT SETTLED</span>
                                    <span className="receipt-total-value" style={{ fontSize: '24px' }}>${parseFloat(lastPayment.amount).toFixed(2)}</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', opacity: 0.5 }}>
                                    <div style={{ border: '1.5px double #003366', padding: '4px 12px', borderRadius: '50%', transform: 'rotate(-5deg)', fontSize: '8px', fontWeight: 900, textAlign: 'center' }}>
                                        MUNICIPAL CASHIER<br />OFFICIAL SEAL
                                    </div>
                                </div>

                                <p className="receipt-footer-msg" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', marginTop: '1rem', fontSize: '9px' }}>
                                    This is a computer-generated receipt. No signature is required.
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }} className="no-print">
                            <button
                                className="btn-primary"
                                style={{
                                    width: 'auto',
                                    padding: '0.5rem 1.5rem',
                                    background: '#003366',
                                    color: 'white',
                                    fontSize: '11px',
                                    borderRadius: '4px',
                                    fontWeight: 800,
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                                }}
                                onClick={() => window.print()}
                            >
                                <Printer style={{ width: '1rem' }} />
                                PRINT OFFICIAL RECEIPT
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default BillDetailsPage;
