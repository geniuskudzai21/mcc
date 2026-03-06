import React, { useState, useMemo } from 'react';
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
    Printer,
    TrendingUp,
    AlertCircle,
    Clock,
    Home,
    FileText,
    Filter,
    Download
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
    const [searchQuery, setSearchQuery] = useState('');

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

    // Filter bills based on search query
    const filteredBills = useMemo(() => {
        if (!searchQuery.trim()) return bills;
        
        const query = searchQuery.toLowerCase();
        return bills?.filter((bill: any) => {
            return (
                bill.property?.address?.toLowerCase().includes(query) ||
                `${bill.billing_month}/${bill.billing_year}`.includes(query) ||
                bill.total_amount?.toString().includes(query) ||
                bill.status?.toLowerCase().includes(query)
            );
        }) || [];
    }, [bills, searchQuery]);

    return (
        <Layout>
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Municipal Bills</h1>
                        <p className="text-slate-600">Manage and track all your property bills in one place</p>
                    </div>
        
                </div>
                
                {/* Search and Stats Bar */}
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                    <div className="flex-1 relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <Search className="w-5 h-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search bills by property, period, amount, or status..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all shadow-sm hover:shadow-md"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3 w-full lg:w-auto">
                        <div className="flex-1 lg:flex-initial bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 min-w-[160px]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-blue-600">Total Outstanding</p>
                                    <p className="text-lg font-bold text-slate-900">${totalOutstanding.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 lg:flex-initial bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100 min-w-[140px]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <AlertCircle className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-amber-600">Overdue</p>
                                    <p className="text-lg font-bold text-slate-900">{bills?.filter((b: any) => b.status === 'OVERDUE').length || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bills Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Property Details</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Billing Period</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Amount</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Due Date</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Status</th>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredBills?.map((bill: any) => (
                                <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-start gap-3">
                                            <Home className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-semibold text-slate-900 text-sm">{bill.property.address}</p>
                                                <p className="text-xs text-slate-500 mt-1">Acct: {bill.property.account_number}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span className="font-medium text-sm">{bill.billing_month}/{bill.billing_year}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="font-bold text-lg text-slate-900">${parseFloat(bill.total_amount).toFixed(2)}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm text-slate-600">{new Date(bill.due_date).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                            bill.status === 'PAID' 
                                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                                : bill.status === 'OVERDUE' 
                                                ? 'bg-red-100 text-red-800 border border-red-200'
                                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                                        }`}>
                                            {bill.status === 'PAID' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                            {bill.status === 'OVERDUE' && <AlertCircle className="w-3 h-3 mr-1" />}
                                            {bill.status === 'UNPAID' && <Clock className="w-3 h-3 mr-1" />}
                                            {bill.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/bills/${bill.id}`)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <FileText className="w-4 h-4" />
                                                Details
                                            </button>
                                            {bill.status !== 'PAID' && (
                                                <button
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    onClick={() => handlePayBill(bill)}
                                                    disabled={payMutation.isPending}
                                                >
                                                    <CreditCard className="w-4 h-4" />
                                                    {payMutation.isPending ? 'Processing...' : 'Pay Now'}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredBills?.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-12">
                                        <div className="flex flex-col items-center">
                                            <FileText className="w-12 h-12 text-slate-300 mb-3" />
                                            <p className="text-slate-500 font-medium">
                                                {searchQuery ? 'No bills found matching your search' : 'No bills found for your account'}
                                            </p>
                                            <p className="text-slate-400 text-sm mt-1">
                                                {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new billing statements'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Actions and Info Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Outstanding Summary Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold mb-1">Outstanding Balance</h3>
                            <p className="text-slate-300 text-sm">Total amount due across all properties</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div className="mb-6">
                        <p className="text-3xl font-bold mb-1">${totalOutstanding.toFixed(2)}</p>
                        <p className="text-slate-400 text-sm">{unPaidBills.length} unpaid {unPaidBills.length === 1 ? 'bill' : 'bills'}</p>
                    </div>
                    <button
                        className="w-full bg-white text-slate-900 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={totalOutstanding <= 0 || payMutation.isPending}
                        onClick={handlePayBalance}
                    >
                        {payMutation.isPending ? 'Processing...' : 'Pay All Outstanding'}
                    </button>
                </div>

                {/* Security Features Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Payment Security</h3>
                        <ShieldCheck className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-sm text-slate-600 mb-6">All transactions are protected with industry-standard encryption and security measures.</p>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-slate-900">256-bit SSL Encryption</p>
                                <p className="text-xs text-slate-500">Bank-level security</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-slate-900">Instant Receipts</p>
                                <p className="text-xs text-slate-500">Digital proof of payment</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Methods Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Payment Methods</h3>
                        <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-sm text-slate-600 mb-6">Choose from multiple convenient payment options.</p>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                            <CreditCard className="w-5 h-5 text-green-600" />
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-900">Credit/Debit Card</p>
                                <p className="text-xs text-slate-500">Visa, Mastercard, etc.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                            <Smartphone className="w-5 h-5 text-red-600" />
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-900">EcoCash</p>
                                <p className="text-xs text-slate-500">Mobile money transfer</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedBill && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" style={{ animation: 'modalIn 0.3s ease-out' }}>
                        {processingStep > 0 ? (
                            <div className="text-center py-8 px-6">
                                <div className="processing-pulse mb-6">
                                    <div className="processing-pulse-dot">
                                        {processingStep === 4 ? (
                                            <CheckCircle2 className="w-8 h-8" />
                                        ) : (
                                            <Loader2 className="w-8 h-8 animate-spin" />
                                        )}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-slate-900">
                                    {processingStep === 1 ? 'Processing Payment...' : 
                                     processingStep === 2 ? 'Authorizing Transaction...' : 
                                     processingStep === 3 ? 'Verifying Payment...' : 'Payment Successful!'}
                                </h3>
                                <p className="text-slate-600 text-sm">
                                    {processingStep < 4 ? 'Please wait while we process your payment securely.' : 'Your payment has been processed successfully.'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center p-6 border-b border-slate-200">
                                    <h3 className="text-xl font-bold text-slate-900">Complete Payment</h3>
                                    <button 
                                        onClick={() => setShowPaymentModal(false)}
                                        className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
                                    >
                                        <X className="w-5 h-5 text-slate-600" />
                                    </button>
                                </div>

                                <div className="p-6">
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl mb-6 border border-blue-100">
                                        <div className="flex justify-between mb-3">
                                            <span className="text-slate-600 text-sm font-medium">Property</span>
                                            <span className="font-semibold text-sm text-slate-900">{selectedBill.property?.address}</span>
                                        </div>
                                        <div className="flex justify-between mb-3">
                                            <span className="text-slate-600 text-sm font-medium">Billing Period</span>
                                            <span className="font-semibold text-sm text-slate-900">{selectedBill.billing_month}/{selectedBill.billing_year}</span>
                                        </div>
                                        <div className="flex justify-between pt-3 border-t border-blue-200">
                                            <span className="font-bold text-sm text-slate-900">Total Amount</span>
                                            <span className="font-bold text-xl text-blue-600">${parseFloat(selectedBill.total_amount).toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-sm font-semibold text-slate-900 mb-3">Select Payment Method</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => setPaymentMethod('CARD')}
                                                className={`p-4 border-2 rounded-xl cursor-pointer flex flex-col items-center gap-2 transition-all ${
                                                    paymentMethod === 'CARD' 
                                                        ? 'border-blue-600 bg-blue-50 shadow-sm' 
                                                        : 'border-slate-200 bg-white hover:bg-slate-50'
                                                }`}
                                            >
                                                <CreditCard className="w-6 h-6 text-green-600" />
                                                <span className="font-semibold text-sm">Card Payment</span>
                                                <span className="text-xs text-slate-500">Visa, Mastercard</span>
                                            </button>
                                            <button
                                                onClick={() => setPaymentMethod('ECOCASH')}
                                                className={`p-4 border-2 rounded-xl cursor-pointer flex flex-col items-center gap-2 transition-all ${
                                                    paymentMethod === 'ECOCASH' 
                                                        ? 'border-blue-600 bg-blue-50 shadow-sm' 
                                                        : 'border-slate-200 bg-white hover:bg-slate-50'
                                                }`}
                                            >
                                                <Smartphone className="w-6 h-6 text-red-600" />
                                                <span className="font-semibold text-sm">EcoCash</span>
                                                <span className="text-xs text-slate-500">Mobile Money</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mb-6 p-3 bg-green-50 rounded-lg border border-green-200">
                                        <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                                        <span className="text-sm text-green-700">Secure 256-bit SSL encrypted transaction</span>
                                    </div>

                                    <button
                                        onClick={handleQuickPay}
                                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold text-sm hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                                    >
                                            Pay ${parseFloat(selectedBill.total_amount).toFixed(2)} Now
                                        </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Receipt Modal */}
            {showReceipt && lastPayment && selectedBill && (
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
                                    <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-200">
                                        <CheckCircle2 className="w-10 h-10 text-green-600" />
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
                                            <span className="font-semibold text-sm text-slate-900">{selectedBill.property?.account_number}</span>
                                        </div>
                                        <div className="flex justify-between pb-3 border-b border-dashed border-slate-300">
                                            <span className="text-slate-600 text-sm font-medium">Property:</span>
                                            <span className="font-semibold text-sm text-slate-900">{selectedBill.property?.address}</span>
                                        </div>
                                        <div className="flex justify-between pb-3 border-b border-dashed border-slate-300">
                                            <span className="text-slate-600 text-sm font-medium">Billing Period:</span>
                                            <span className="font-semibold text-sm text-slate-900">{selectedBill.billing_month}/{selectedBill.billing_year}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600 text-sm font-medium">Payment Method:</span>
                                            <span className="font-semibold text-sm text-blue-600">{lastPayment.payment_method}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center p-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl mb-6">
                                    <span className="text-white/70 text-xs uppercase tracking-wider font-semibold">Amount Paid</span>
                                    <p className="text-white text-4xl font-black my-2">${parseFloat(lastPayment.amount).toFixed(2)}</p>
                                    <span className="text-white/60 text-sm">Payment completed successfully</span>
                                </div>

                                <div className="text-center mb-6">
                                    <p className="text-sm text-slate-600">Thank you for your payment. A copy of this receipt has been sent to your registered email address.</p>
                                </div>

                                <button
                                    onClick={() => window.print()}
                                    className="w-full p-4 bg-gradient-to-r from-slate-100 to-slate-200 border border-slate-300 rounded-xl font-semibold cursor-pointer flex items-center justify-center gap-3 hover:from-slate-200 hover:to-slate-300 transition-all"
                                >
                                    <Printer className="w-5 h-5" />
                                    Print Receipt
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default BillsPage;

