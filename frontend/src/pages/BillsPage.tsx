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
        return <Layout><div className="flex items-center justify-center py-8 text-slate-600">Synchronizing with billing server...</div></Layout>;
    }

    const unPaidBills = bills?.filter((b: any) => b.status === 'UNPAID' || b.status === 'OVERDUE') || [];
    const totalOutstanding = unPaidBills.reduce((sum: number, b: any) => sum + parseFloat(b.total_amount), 0);

    return (
        <Layout>
            <div className="mb-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Municipal Bills</h1>
                    <p className="text-slate-600">View and manage all your property bills.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search bills..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                    />
                </div>
            </div>

            <div className="mb-8 overflow-x-auto">
                <div className="min-w-full">
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Property</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Period</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Amount</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Due Date</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bills?.map((bill: any) => (
                                <tr key={bill.id} className="group">
                                    <td>
                                        <div className="flex items-center gap-4">
                                            <div className="bg-blue-100 px-2 py-1 rounded-md text-xs font-bold text-blue-800">
                                                BP
                                            </div>
                                            <span className="font-bold">{bill.property.address}</span>
                                        </div>
                                    </td>
                                    <td className="font-medium">{bill.billing_month}/{bill.billing_year}</td>
                                    <td className="font-bold text-cyan-600">${parseFloat(bill.total_amount).toFixed(2)}</td>
                                    <td className="text-slate-500">{new Date(bill.due_date).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`badge ${bill.status === 'PAID' ? "badge-success" :
                                            bill.status === 'OVERDUE' ? "badge-danger" :
                                                "badge-info"
                                            }`}>
                                            {bill.status}
                                        </span>
                                    </td>
                                    <td className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/bills/${bill.id}`)}
                                                className="text-cyan-600 hover:text-cyan-700 text-xs font-medium"
                                            >
                                                Details
                                            </button>
                                            {bill.status !== 'PAID' && (
                                                <button
                                                    className="bg-blue-900 text-white px-4 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 hover:bg-blue-800 disabled:opacity-50"
                                                    onClick={() => handlePayBill(bill)}
                                                    disabled={payMutation.isPending}
                                                >
                                                    <CreditCard className="w-3.5 h-3.5" />
                                                    {payMutation.isPending ? 'Processing...' : 'Pay Now'}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {bills?.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-slate-500">No bills found for your account.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
                {/* Bill Breakdown Card */}
                <div className="bg-white rounded-xl border-l-4 border-l-cyan-500 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Outstanding Summary</h3>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Arrears</p>
                            <h4 className="text-2xl font-black">${totalOutstanding.toFixed(2)}</h4>
                        </div>
                        <button
                            className="bg-blue-900 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-blue-800 disabled:opacity-50"
                            disabled={totalOutstanding <= 0 || payMutation.isPending}
                            onClick={handlePayBalance}
                        >
                            {payMutation.isPending ? 'Processing...' : 'Pay Balance'}
                        </button>
                    </div>
                </div>

                {/* Payment Methods Info */}
                <div className="bg-white rounded-xl p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Security & Transparency</h3>
                    <p className="text-sm text-slate-600 mb-6">All transactions are encrypted. You will receive an instant digital receipt after every successful payment.</p>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 flex items-center gap-3 border border-slate-200 rounded-lg">
                            <div className="w-9 h-9 bg-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 className="w-4.5 text-white" />
                            </div>
                            <p className="text-sm font-bold text-slate-900 m-0">Instant Receipts</p>
                        </div>
                        <div className="p-4 flex items-center gap-3 border border-slate-200 rounded-lg">
                            <div className="w-9 h-9 bg-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Calendar className="w-4.5 text-white" />
                            </div>
                            <p className="text-sm font-bold text-slate-900 m-0">History Logs</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedBill && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-xl w-96 max-w-full mx-4">
                        {processingStep > 0 ? (
                            <div className="text-center py-8">
                                <div className={`w-15 h-15 rounded-full flex items-center justify-center mx-auto mb-4 ${
                                    processingStep === 4 ? 'bg-green-100' : 'bg-blue-100'
                                }`}>
                                    {processingStep === 4 ? (
                                        <CheckCircle2 className="w-8 text-green-600" />
                                    ) : (
                                        <Loader2 className="w-8 text-blue-600 animate-spin" />
                                    )}
                                </div>
                                <h3 className="text-xl font-bold mb-2">
                                    {processingStep === 1 ? 'Processing...' : 
                                     processingStep === 2 ? 'Authorizing...' : 
                                     processingStep === 3 ? 'Verifying...' : 'Payment Successful!'}
                                </h3>
                                <p className="text-slate-600 text-sm">
                                    {processingStep < 4 ? 'Please wait...' : 'Your payment has been processed.'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold">Pay Bill</h3>
                                    <button onClick={() => setShowPaymentModal(false)}>
                                        <X className="w-5 text-slate-600" />
                                    </button>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-lg mb-6">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-slate-600 text-sm">Property</span>
                                        <span className="font-semibold text-sm">{selectedBill.property?.address}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-slate-600 text-sm">Period</span>
                                        <span className="font-semibold text-sm">{selectedBill.billing_month}/{selectedBill.billing_year}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-slate-200">
                                        <span className="font-bold text-sm">Total Amount</span>
                                        <span className="font-bold text-lg text-blue-600">${parseFloat(selectedBill.total_amount).toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-xs font-semibold mb-2">Payment Method</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setPaymentMethod('CARD')}
                                            className={`flex-1 p-3 border-2 rounded-lg cursor-pointer flex items-center justify-center gap-2 transition-colors ${
                                                paymentMethod === 'CARD' 
                                                    ? 'border-blue-600 bg-blue-50' 
                                                    : 'border-slate-200 bg-white hover:bg-slate-50'
                                            }`}
                                        >
                                            <CreditCard className="w-4 text-green-600" />
                                            <span className="font-semibold text-sm">Card</span>
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod('ECOCASH')}
                                            className={`flex-1 p-3 border-2 rounded-lg cursor-pointer flex items-center justify-center gap-2 transition-colors ${
                                                paymentMethod === 'ECOCASH' 
                                                    ? 'border-blue-600 bg-blue-50' 
                                                    : 'border-slate-200 bg-white hover:bg-slate-50'
                                            }`}
                                        >
                                            <Smartphone className="w-4 text-red-600" />
                                            <span className="font-semibold text-sm">EcoCash</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mb-4 p-2 bg-green-50 rounded-md">
                                    <ShieldCheck className="w-4 text-green-600" />
                                    <span className="text-xs text-green-600">Secure 256-bit SSL encrypted transaction</span>
                                </div>

                                <button
                                    onClick={handleQuickPay}
                                    className="w-full bg-blue-900 text-white py-3.5 rounded-lg font-semibold text-sm hover:bg-blue-800"
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
                <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[1100] backdrop-blur-lg p-4">
                    <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-auto">
                        <div className="p-6">
                            <button
                                onClick={() => setShowReceipt(false)}
                                className="absolute top-4 right-4 text-blue-900 bg-none border-none cursor-pointer"
                            >
                                <X className="w-5" />
                            </button>

                            <div className="text-center mb-6">
                                <div className="w-15 h-15 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-black text-blue-900 mb-1">PAYMENT RECEIPT</h2>
                                <p className="text-green-600 font-semibold">Transaction Successful</p>
                            </div>

                            <div className="bg-slate-50 rounded-lg p-4 mb-4">
                                <div className="flex justify-between pb-2 mb-2 border-b border-dashed border-slate-200">
                                    <span className="text-slate-500 text-xs">Receipt No:</span>
                                    <span className="font-semibold text-xs font-mono">{lastPayment.transaction_reference}</span>
                                </div>
                                <div className="flex justify-between pb-2 mb-2 border-b border-dashed border-slate-200">
                                    <span className="text-slate-500 text-xs">Date:</span>
                                    <span className="font-semibold text-xs">{new Date(lastPayment.paid_at).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between pb-2 mb-2 border-b border-dashed border-slate-200">
                                    <span className="text-slate-500 text-xs">Account No:</span>
                                    <span className="font-semibold text-xs">{selectedBill.property?.account_number}</span>
                                </div>
                                <div className="flex justify-between pb-2 mb-2 border-b border-dashed border-slate-200">
                                    <span className="text-slate-500 text-xs">Property:</span>
                                    <span className="font-semibold text-xs">{selectedBill.property?.address}</span>
                                </div>
                                <div className="flex justify-between pb-2 mb-2 border-b border-dashed border-slate-200">
                                    <span className="text-slate-500 text-xs">Billing Period:</span>
                                    <span className="font-semibold text-xs">{selectedBill.billing_month}/{selectedBill.billing_year}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-xs">Payment Method:</span>
                                    <span className="font-semibold text-xs text-blue-600">{lastPayment.payment_method}</span>
                                </div>
                            </div>

                            <div className="text-center p-4 bg-blue-900 rounded-lg mb-4">
                                <span className="text-white/70 text-xs uppercase tracking-wider">Amount Paid</span>
                                <p className="text-white text-3xl font-black my-1">${parseFloat(lastPayment.amount).toFixed(2)}</p>
                            </div>

                            <div className="text-center mb-4">
                                <p className="text-xs text-slate-500">Thank you for your payment. A copy of this receipt has been sent to your email.</p>
                            </div>

                            <button
                                onClick={() => window.print()}
                                className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg font-semibold cursor-pointer flex items-center justify-center gap-2 hover:bg-slate-200"
                            >
                                <Printer className="w-4" />
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

