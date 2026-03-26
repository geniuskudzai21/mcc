import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import {
    Search,
    CheckCircle2,
    CreditCard,
    X,
    Loader2,
    ShieldCheck,
    Smartphone,
    Printer,
    TrendingUp,
    AlertCircle,
    Home,
    FileText
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

    const { data: bills, isLoading, error } = useQuery({
        queryKey: ['bills-list'],
        queryFn: async () => {
            try {
                const res = await api.get('/bills');
                return res.data;
            } catch (err) {
                console.error('API Error:', err);
                throw err;
            }
        },
        retry: 1,
        retryDelay: 1000,
        staleTime: 30000,
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

    // Calculate derived values (must be before early returns)
    const unPaidBills = bills?.filter((b: any) => b && (b.status === 'UNPAID' || b.status === 'OVERDUE')) || [];
    const totalOutstanding = unPaidBills.reduce((sum: number, b: any) => sum + (parseFloat(b.total_amount) || 0), 0);
    const safeBills = Array.isArray(bills) ? bills : [];

    // Filter bills based on search query (must be before early returns)
    const filteredBills = useMemo(() => {
        if (!searchQuery.trim()) return safeBills;
        
        const query = searchQuery.toLowerCase();
        return safeBills.filter((bill: any) => {
            if (!bill) return false;
            return (
                bill.property?.address?.toLowerCase().includes(query) ||
                `${bill.billing_month}/${bill.billing_year}`.includes(query) ||
                bill.total_amount?.toString().includes(query) ||
                bill.status?.toLowerCase().includes(query)
            );
        });
    }, [safeBills, searchQuery]);

    if (isLoading) {
        return <Layout><div className="flex items-center justify-center py-8 text-slate-600">Synchronizing with billing server...</div></Layout>;
    }

    if (error) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center py-16 text-slate-600">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Unable to load bills</h3>
                    <p className="text-sm text-slate-500 mb-4">There was a problem connecting to the billing server.</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            {/* Header Section */}
            <div className="mb-4 md:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1 md:mb-2">Municipal Bills</h1>
                        <p className="text-slate-600 text-sm">Manage and track all your property bills in one place</p>
                    </div>
                </div>
                
                {/* Enhanced Search and Filter Bar */}
                <div className="bg-white rounded-xl border border-slate-200 p-3 md:p-6 mb-4 md:mb-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300">
                    <div className="flex flex-col lg:flex-row gap-3 md:gap-6">
                        {/* Search Section */}
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-1 md:mb-2">Search Bills</label>
                            <div className="relative group">
                                <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 group-focus-within:text-blue-600">
                                    <Search className="w-4 md:w-5 h-4 md:h-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by property, period, amount..."
                                    className="w-full pl-9 md:pl-12 pr-9 md:pr-12 py-2.5 md:py-3.5 bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 placeholder-gray-500"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-lg hover:bg-gray-100"
                                    >
                                        <X className="w-3 md:w-4 h-3 md:h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        {/* Filter Section */}
                        <div className="lg:w-40 md:w-48">
                            <label className="block text-sm font-semibold text-gray-700 mb-1 md:mb-2">Status</label>
                            <select
                                value={searchQuery === 'UNPAID' ? 'UNPAID' : searchQuery === 'OVERDUE' ? 'OVERDUE' : searchQuery === 'PAID' ? 'PAID' : 'all'}
                                onChange={(e) => setSearchQuery(e.target.value === 'all' ? '' : e.target.value)}
                                className="w-full px-3 md:px-4 py-2.5 md:py-3.5 bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                            >
                                <option value="all">All Status</option>
                                <option value="UNPAID">Unpaid</option>
                                <option value="OVERDUE">Overdue</option>
                                <option value="PAID">Paid</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bills Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-4 md:mb-8 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left py-3 md:py-4 px-3 md:px-6 text-xs md:text-sm font-semibold text-slate-700">Property</th>
                                <th className="text-left py-3 md:py-4 px-3 md:px-6 text-xs md:text-sm font-semibold text-slate-700">Period</th>
                                <th className="text-left py-3 md:py-4 px-3 md:px-6 text-xs md:text-sm font-semibold text-slate-700">Amount</th>
                                <th className="text-left py-3 md:py-4 px-3 md:px-6 text-xs md:text-sm font-semibold text-slate-700 hidden sm:table-cell">Due Date</th>
                                <th className="text-left py-3 md:py-4 px-3 md:px-6 text-xs md:text-sm font-semibold text-slate-700">Status</th>
                                <th className="text-right py-3 md:py-4 px-3 md:px-6 text-xs md:text-sm font-semibold text-slate-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredBills?.map((bill: any) => {
                                if (!bill || !bill.id) return null;
                                return (
                                <tr key={bill.id} className="hover:bg-slate-50 transition-colors duration-300">
                                    <td className="py-3 md:py-4 px-3 md:px-6">
                                        <div className="flex items-start gap-2 md:gap-3">
                                            <div className="w-4 md:w-5 h-4 md:h-5 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Home className="w-2.5 md:w-3 h-2.5 md:h-3 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 text-sm">{bill.property?.address || 'N/A'}</p>
                                                <p className="text-xs text-slate-500 mt-0.5 hidden md:block">Acct: {bill.property?.account_number || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 md:py-4 px-3 md:px-6">
                                        <span className="font-medium text-sm">{bill.billing_month}/{bill.billing_year}</span>
                                    </td>
                                    <td className="py-3 md:py-4 px-3 md:px-6">
                                        <p className="font-bold text-base md:text-lg text-slate-900">${(parseFloat(bill.total_amount) || 0).toFixed(2)}</p>
                                    </td>
                                    <td className="py-3 md:py-4 px-3 md:px-6 hidden sm:table-cell">
                                        <span className="text-sm text-slate-600">{bill.due_date ? new Date(bill.due_date).toLocaleDateString() : 'N/A'}</span>
                                    </td>
                                    <td className="py-3 md:py-4 px-3 md:px-6">
                                        <span className={`inline-flex items-center px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-medium ${
                                            bill.status === 'PAID' 
                                                ? 'bg-green-100 text-green-800' 
                                                : bill.status === 'OVERDUE' 
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {bill.status || 'UNKNOWN'}
                                        </span>
                                    </td>
                                    <td className="py-3 md:py-4 px-3 md:px-6">
                                        <div className="flex items-center justify-end gap-1 md:gap-2">
                                            <button
                                                onClick={() => navigate(`/bills/${bill.id}`)}
                                                className="flex items-center gap-1 px-2 md:px-3 py-1.5 text-xs md:text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            >
                                                <FileText className="w-3 md:w-4 h-3 md:h-4" />
                                                <span className="hidden sm:inline">Details</span>
                                            </button>
                                            {bill.status !== 'PAID' && (
                                                <button
                                                    className="flex items-center gap-1 px-2 md:px-3 py-1.5 bg-blue-600 text-white text-xs md:text-sm font-medium rounded-lg hover:bg-blue-700 transition-all"
                                                    onClick={() => handlePayBill(bill)}
                                                    disabled={payMutation.isPending}
                                                >
                                                    <CreditCard className="w-3 md:w-4 h-3 md:h-4" />
                                                    <span className="hidden sm:inline">{payMutation.isPending ? 'Processing...' : 'Pay'}</span>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                );
                            })}
                            {(filteredBills || []).length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 md:py-12">
                                        <div className="flex flex-col items-center">
                                            <FileText className="w-8 md:w-12 h-8 md:h-12 text-slate-300 mb-3" />
                                            <p className="text-slate-500 font-medium">
                                                {searchQuery ? 'No bills found' : 'No bills found for your account'}
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Outstanding Summary Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 md:p-6 text-white shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <div>
                            <h3 className="text-base md:text-lg font-bold mb-1">Outstanding Balance</h3>
                            <p className="text-slate-300 text-xs md:text-sm">Total amount due</p>
                        </div>
                        <div className="w-10 md:w-12 h-10 md:h-12 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 md:w-6 h-5 md:h-6 text-white" />
                        </div>
                    </div>
                    <div className="mb-4 md:mb-6">
                        <p className="text-2xl md:text-3xl font-bold mb-1">${totalOutstanding.toFixed(2)}</p>
                        <p className="text-slate-400 text-xs md:text-sm">{unPaidBills.length} unpaid {unPaidBills.length === 1 ? 'bill' : 'bills'}</p>
                    </div>
                    <button
                        className="w-full bg-white text-slate-900 py-2 md:py-3 rounded-lg font-semibold text-sm hover:bg-slate-100 transition-all disabled:opacity-50"
                        disabled={totalOutstanding <= 0 || payMutation.isPending}
                        onClick={handlePayBalance}
                    >
                        {payMutation.isPending ? 'Processing...' : 'Pay All'}
                    </button>
                </div>

                {/* Security Features Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <h3 className="text-base md:text-lg font-bold text-slate-900">Payment Security</h3>
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4 text-green-600" />
                        </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-4 md:mb-6">All transactions are protected with industry-standard encryption.</p>
                    <div className="space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-5 md:w-6 h-5 md:h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 className="w-2.5 md:w-3 h-2.5 md:h-3 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs md:text-sm font-semibold text-slate-900">256-bit SSL Encryption</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-5 md:w-6 h-5 md:h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <FileText className="w-2.5 md:w-3 h-2.5 md:h-3 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs md:text-sm font-semibold text-slate-900">Instant Receipts</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Methods Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <h3 className="text-base md:text-lg font-bold text-slate-900">Payment Methods</h3>
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-blue-600" />
                        </div>
                    </div>
                    <div className="space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 border border-slate-200 rounded-lg">
                            <div className="w-6 md:w-8 h-6 md:h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <CreditCard className="w-3 md:w-4 h-3 md:h-4 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs md:text-sm font-semibold text-slate-900">Credit/Debit Card</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 border border-slate-200 rounded-lg">
                            <div className="w-6 md:w-8 h-6 md:h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Smartphone className="w-3 md:w-4 h-3 md:h-4 text-red-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs md:text-sm font-semibold text-slate-900">EcoCash</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedBill && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl shadow-blue-600/30 animate-in fade-in zoom-in duration-300" style={{ animation: 'modalIn 0.3s ease-out' }}>
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

