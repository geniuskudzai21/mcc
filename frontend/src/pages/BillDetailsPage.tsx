import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import { ArrowLeft, CheckCircle, CreditCard, Smartphone, X, Loader2, ShieldCheck, Printer, Home, Calendar, FileText, AlertCircle, TrendingUp, Clock } from 'lucide-react';
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

    const { data: bill, isLoading, error } = useQuery({
        queryKey: ['bill', id],
        queryFn: async () => {
            try {
                const res = await api.get(`/bills/${id}`);
                return res.data;
            } catch (err) {
                console.error('Bill API Error:', err);
                throw err;
            }
        },
        enabled: !!id,
        retry: 1,
        retryDelay: 1000,
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

    // Calculate derived values (must be before early returns)
    const monthNames = [
        "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
        "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
    ];
    const formattedDate = bill?.billing_month && bill?.billing_year 
        ? `${monthNames[bill.billing_month - 1]} ${bill.billing_year}` 
        : 'N/A';

    // Create mock payment data for already paid bills (must be before early returns)
    React.useEffect(() => {
        if (bill?.status === 'PAID' && !lastPayment) {
            setLastPayment({
                transaction_reference: `RCPT${Date.now()}`,
                amount: bill.total_amount,
                payment_method: 'CARD',
                paid_at: new Date().toISOString()
            });
        }
    }, [bill, lastPayment]);

    if (isLoading) {
        return <Layout><div className="flex items-center justify-center py-8 text-slate-600">Loading bill details...</div></Layout>;
    }

    if (error) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center py-16 text-slate-600">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Unable to load bill</h3>
                    <p className="text-sm text-slate-500 mb-4">There was a problem loading this bill.</p>
                    <button 
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-2"
                    >
                        Go Back
                    </button>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </Layout>
        );
    }

    if (!bill || !id) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center py-16">
                    <FileText className="w-16 h-16 text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium mb-4">Bill not found</p>
                    <button 
                        onClick={() => navigate(-1)} 
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen">
                
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to My Bills
                    </button>

                    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Main Bill Content */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Header Card */}
                            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-md">
                                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h1 className="text-xl font-bold text-white mb-1">Municipal Bill</h1>
                                            <p className="text-blue-100 text-sm">City of Mutare</p>
                                        </div>
                                        {bill.status === 'PAID' && (
                                            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                                PAID
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="p-4 bg-gradient-to-b from-white to-slate-50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Account Information */}
                                        <div>
                                            <h3 className="text-xs font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                                <Home className="w-3 h-3" />
                                                Account Information
                                            </h3>
                                            <div className="space-y-2">
                                                <div>
                                                    <p className="text-xs text-slate-500">Account Number</p>
                                                    <p className="font-semibold text-sm text-slate-900">{bill.property?.account_number || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Account Name</p>
                                                    <p className="font-semibold text-sm text-slate-900">{bill.property?.owner_name || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Property Address</p>
                                                    <p className="font-semibold text-sm text-slate-900">{bill.property?.address || 'N/A'}</p>
                                                    <p className="text-xs text-slate-600">{bill.property?.suburb || 'N/A'}, Mutare</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Billing Period */}
                                        <div>
                                            <h3 className="text-xs font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                                <Calendar className="w-3 h-3" />
                                                Billing Period
                                            </h3>
                                            <div className="space-y-2">
                                                <div>
                                                    <p className="text-xs text-slate-500">Statement Date</p>
                                                    <p className="font-semibold text-sm text-slate-900">{formattedDate}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Due Date</p>
                                                    <p className="font-semibold text-sm text-slate-900">{bill.due_date ? new Date(bill.due_date).toLocaleDateString() : 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Status</p>
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                        bill.status === 'PAID' 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : bill.status === 'OVERDUE' 
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {bill.status === 'PAID' && <CheckCircle className="w-3 h-3 mr-1" />}
                                                        {bill.status === 'OVERDUE' && <AlertCircle className="w-3 h-3 mr-1" />}
                                                        {bill.status === 'UNPAID' && <Clock className="w-3 h-3 mr-1" />}
                                                        {bill.status || 'UNKNOWN'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bill Details Table */}
                            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-md">
                                <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                                    <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Bill Details
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                                            <tr>
                                                <th className="text-left py-2 px-4 text-xs font-semibold text-slate-700">Description</th>
                                                <th className="text-right py-2 px-4 text-xs font-semibold text-slate-700">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            <tr className="hover:bg-slate-50 transition-colors">
                                                <td className="py-2 px-4 text-xs text-slate-600">Outstanding Balance B/F</td>
                                                <td className="py-2 px-4 text-right text-xs font-medium">$0.00</td>
                                            </tr>
                                            {(bill.items || []).map((item: any) => (
                                                <tr key={item?.id || Math.random()} className="hover:bg-slate-50 transition-colors">
                                                    <td className="py-2 px-4 text-xs text-slate-900">{item?.description || 'N/A'}</td>
                                                    <td className="py-2 px-4 text-right text-xs font-medium">${(parseFloat(item?.amount) || 0).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                            <tr className="bg-gradient-to-r from-slate-100 to-slate-50">
                                                <td className="py-2 px-4 text-xs font-semibold text-slate-900">Total Payable for Period</td>
                                                <td className="py-2 px-4 text-right text-xs font-bold text-slate-900">${(parseFloat(bill?.total_amount) || 0).toFixed(2)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Payment Methods */}
                            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-md">
                                <h3 className="text-base font-semibold text-slate-900 mb-3">Payment Methods</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                            <Smartphone className="w-4 h-4 text-red-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-xs">EcoCash</p>
                                            <p className="text-xs text-slate-500">Mobile Money</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <CreditCard className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-xs">Bank Card</p>
                                            <p className="text-xs text-slate-500">Visa, Mastercard</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                            <TrendingUp className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-xs">PayNow</p>
                                            <p className="text-xs text-slate-500">Online Gateway</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-4">
                            {/* Amount Due Card */}
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-4 text-white shadow-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold">Current Balance</h3>
                                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <p className="text-2xl font-bold mb-1">${(parseFloat(bill?.total_amount) || 0).toFixed(2)}</p>
                                    <p className="text-slate-300 text-xs">USD</p>
                                </div>
                                {bill.status !== 'PAID' ? (
                                    <button
                                        onClick={() => setShowPaymentModal(true)}
                                        className="w-full bg-white text-slate-900 py-2 rounded-lg font-semibold hover:bg-slate-100 transition-colors text-sm"
                                    >
                                        Pay Online Now
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setShowReceipt(true)}
                                        className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm"
                                    >
                                        View Receipt
                                    </button>
                                )}
                            </div>

                            {/* Contact Information */}
                            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-md">
                                <h3 className="text-base font-semibold text-slate-900 mb-3">Contact Information</h3>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-xs text-slate-500">Payable to</p>
                                        <p className="font-semibold text-sm">The City Treasurer</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Inquiries</p>
                                        <p className="font-semibold text-sm">Mutare City Council</p>
                                        <p className="text-xs text-slate-600">(020) 62345 / 61045</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Address</p>
                                        <p className="font-semibold text-sm">Box 910, Mutare</p>
                                    </div>
                                </div>
                            </div>

                            {/* Logo */}
                            <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center justify-center shadow-md">
                                <img
                                    src="/mutarelogo.png"
                                    alt="City of Mutare"
                                    className="w-24 h-24 object-contain opacity-80"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modern Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" style={{ animation: 'modalIn 0.3s ease-out' }}>
                        {processingStep > 0 ? (
                            <div className="text-center py-8 px-6">
                                <div className="processing-pulse mb-6">
                                    <div className="processing-pulse-dot">
                                        {processingStep === 4 ? (
                                            <CheckCircle className="w-8 h-8 text-green-600" />
                                        ) : (
                                            <ShieldCheck className="w-8 h-8 text-blue-600" />
                                        )}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-slate-900">
                                    {processingStep === 1 ? 'Initializing...' :
                                     processingStep === 2 ? 'Authorizing...' :
                                     processingStep === 3 ? 'Verifying...' : 'Payment Confirmed!'}
                                </h3>
                                <p className="text-slate-600 text-sm">
                                    {processingStep < 4 ? 'Please do not close this window.' : 'Your receipt is ready.'}
                                </p>
                                {processingStep < 4 && <Loader2 className="animate-spin w-6 h-6 mx-auto mt-4 text-blue-600" />}
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center p-6 border-b border-slate-200">
                                    <h3 className="text-xl font-bold text-slate-900">Secure Payment</h3>
                                    <button
                                        onClick={() => setShowPaymentModal(false)}
                                        className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
                                    >
                                        <X className="w-5 h-5 text-slate-600" />
                                    </button>
                                </div>

                                <div className="p-6">
                                    <div className="text-center mb-6">
                                        <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg inline-block font-semibold text-sm">
                                            {bill?.total_amount !== null && bill?.total_amount !== undefined ? 
                                                `Amount: $${parseFloat(bill?.total_amount).toFixed(2)}` 
                                                : 
                                                'Amount: N/A'
                                            }
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <button
                                            onClick={() => setPaymentMethod('ECOCASH')}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                                                paymentMethod === 'ECOCASH' 
                                                    ? 'border-blue-600 bg-blue-50' 
                                                    : 'border-slate-200 bg-white hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                                <Smartphone className="w-5 h-5 text-red-600" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="font-semibold text-sm">EcoCash</p>
                                                <p className="text-xs text-slate-500">Mobile Money Transfer</p>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => setPaymentMethod('CARD')}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                                                paymentMethod === 'CARD' 
                                                    ? 'border-blue-600 bg-blue-50' 
                                                    : 'border-slate-200 bg-white hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                <CreditCard className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="font-semibold text-sm">Bank Card</p>
                                                <p className="text-xs text-slate-500">Visa, Mastercard, etc.</p>
                                            </div>
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => payMutation.mutate(paymentMethod)}
                                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                                    >
                                        Confirm Payment
                                    </button>
                                    <p className="text-xs text-slate-500 text-center mt-4">
                                        Secure 256-bit SSL Encrypted Transaction
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Modern Receipt Modal */}
            {showReceipt && lastPayment && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1100] backdrop-blur-lg p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto shadow-2xl" style={{ animation: 'modalIn 0.3s ease-out' }}>
                        <div className="relative">
                            <button
                                onClick={() => setShowReceipt(false)}
                                className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors z-10"
                            >
                                <X className="w-5 h-5 text-slate-600" />
                            </button>

                            <div className="p-8">
                                <div className="text-center mb-8">
                                    <div className="flex justify-center mb-4">
                                        <img
                                            src="/mutarelogo.png"
                                            alt="City of Mutare"
                                            className="w-16 h-16 object-contain opacity-80"
                                        />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 mb-2">PAYMENT RECEIPT</h2>
                                    <p className="text-green-600 font-semibold text-lg">Transaction Successful</p>
                                </div>

                                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 mb-6 border border-slate-200">
                                    <div className="space-y-3">
                                        <div className="flex justify-between pb-3 border-b border-dashed border-slate-300">
                                            <span className="text-slate-600 text-sm font-medium">Receipt No:</span>
                                            <span className="font-semibold text-sm font-mono text-slate-900">{lastPayment.transaction_reference}</span>
                                        </div>
                                        <div className="flex justify-between pb-3 border-b border-dashed border-slate-300">
                                            <span className="text-slate-600 text-sm font-medium">Date & Time:</span>
                                            <span className="font-semibold text-sm text-slate-900">{new Date(lastPayment.paid_at).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between pb-3 border-b border-dashed border-slate-300">
                                            <span className="text-slate-600 text-sm font-medium">Account No:</span>
                                            <span className="font-semibold text-sm text-slate-900">{bill.property?.account_number || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between pb-3 border-b border-dashed border-slate-300">
                                            <span className="text-slate-600 text-sm font-medium">Account Name:</span>
                                            <span className="font-semibold text-sm text-slate-900">{bill.property?.owner_name || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between pb-3 border-b border-dashed border-slate-300">
                                            <span className="text-slate-600 text-sm font-medium">Property Address:</span>
                                            <span className="font-semibold text-sm text-slate-900">{bill.property?.address || 'N/A'}, {bill.property?.suburb || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600 text-sm font-medium">Payment Method:</span>
                                            <span className="font-semibold text-sm text-green-600">{lastPayment.payment_method}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center p-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl mb-6">
                                    <span className="text-white/70 text-xs uppercase tracking-wider font-semibold">Total Amount Settled</span>
                                    <p className="text-white text-4xl font-black my-2">${parseFloat(lastPayment.amount).toFixed(2)}</p>
                                    <span className="text-white/60 text-sm">Payment completed successfully</span>
                                </div>

                                <div className="text-center mb-6">
                                    <p className="text-sm text-slate-600">This is a computer-generated receipt. No signature is required.</p>
                                </div>

                                <button
                                    onClick={() => window.print()}
                                    className="w-full p-4 bg-gradient-to-r from-slate-100 to-slate-200 border border-slate-300 rounded-xl font-semibold flex items-center justify-center gap-3 hover:from-slate-200 hover:to-slate-300 transition-all"
                                >
                                    <Printer className="w-5 h-5" />
                                    Print Official Receipt
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default BillDetailsPage;
