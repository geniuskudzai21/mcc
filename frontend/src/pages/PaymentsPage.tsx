import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import {
    CreditCard,
    CheckCircle2,
    ArrowUpRight,
    Receipt,
    Search,
    Download,
    Calendar,
    DollarSign,
    Clock,
    AlertCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

interface Payment {
    id: string;
    amount: string;
    payment_method: string;
    transaction_reference: string;
    paid_at: string;
    status: string;
    bill: {
        id: string;
        property: {
            address: string;
        };
    };
}

type FilterOption = 'all' | 'last7days' | 'last30days' | 'last3months' | 'thisyear';

const PaymentsPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState<FilterOption>('all');

    const { data: payments, isLoading } = useQuery({
        queryKey: ['payments-history'],
        queryFn: async () => {
            const res = await api.get('/payments/history');
            return res.data;
        }
    });

    const filteredPayments = useMemo(() => {
        if (!payments) return [];

        const now = new Date();
        let dateLimit: Date | null = null;

        switch (dateFilter) {
            case 'last7days':
                dateLimit = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'last30days':
                dateLimit = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'last3months':
                dateLimit = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case 'thisyear':
                dateLimit = new Date(now.getFullYear(), 0, 1);
                break;
            case 'all':
            default:
                dateLimit = null;
                break;
        }

        return payments.filter((payment: Payment) => {
            const matchesSearch = searchTerm === '' || 
                payment.bill.property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.transaction_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.payment_method.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesDate = !dateLimit || new Date(payment.paid_at) >= dateLimit;

            return matchesSearch && matchesDate;
        }).sort((a: Payment, b: Payment) => 
            new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime()
        );
    }, [payments, searchTerm, dateFilter]);

    const statistics = useMemo(() => {
        if (!payments) return { totalSpent: 0, totalTransactions: 0, avgPayment: 0, successRate: 0 };

        const totalSpent = payments.reduce((sum: number, p: Payment) => sum + parseFloat(p.amount), 0);
        const totalTransactions = payments.length;
        const avgPayment = totalTransactions > 0 ? totalSpent / totalTransactions : 0;
        const successfulPayments = payments.filter((p: Payment) => p.status === 'COMPLETED').length;
        const successRate = totalTransactions > 0 ? (successfulPayments / totalTransactions) * 100 : 0;

        return { totalSpent, totalTransactions, avgPayment, successRate };
    }, [payments]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'PENDING':
                return <Clock className="w-5 h-5 text-yellow-500" />;
            case 'FAILED':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            default:
                return <CreditCard className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'FAILED':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const downloadReceipt = (payment: Payment) => {
        // Create a simple receipt download
        const receiptContent = `
MUTARE CITY COUNCIL - PAYMENT RECEIPT
=====================================

Transaction Reference: ${payment.transaction_reference}
Payment Date: ${new Date(payment.paid_at).toLocaleDateString()}
Payment Method: ${payment.payment_method}
Amount: $${parseFloat(payment.amount).toFixed(2)}
Status: ${payment.status}

Property Address: ${payment.bill.property.address}
Bill ID: ${payment.bill.id}

This is a computer-generated receipt.
For inquiries, contact Mutare City Council.
        `;

        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${payment.transaction_reference}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center" style={{ height: '60vh' }}>
                    <div className="text-center">
                        <div className="processing-pulse mb-6">
                            <div className="processing-pulse-dot">
                                <DollarSign className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-gray-600 font-medium">Synchronizing with financial system...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment History</h1>
                    <p className="text-gray-600">View and manage your municipal payments</p>
                </div>

                {/* Simple Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Paid</p>
                                <p className="text-2xl font-bold text-gray-900">${statistics.totalSpent.toFixed(2)}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                <DollarSign className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Transactions</p>
                                <p className="text-2xl font-bold text-gray-900">{statistics.totalTransactions}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                <Receipt className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                                <p className="text-2xl font-bold text-gray-900">{statistics.successRate.toFixed(0)}%</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                                <CheckCircle2 className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search payments..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value as FilterOption)}
                            className="px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
                        >
                            <option value="all">All Time</option>
                            <option value="last7days">Last 7 Days</option>
                            <option value="last30days">Last 30 Days</option>
                            <option value="last3months">Last 3 Months</option>
                            <option value="thisyear">This Year</option>
                        </select>
                    </div>
                </div>

                {/* Payment List */}
                <div className="space-y-4">
                    {filteredPayments.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4 transition-transform duration-300 transform hover:scale-110">
                                <CreditCard className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No payments found</h3>
                            <p className="text-gray-600">
                                {searchTerm || dateFilter !== 'all' 
                                    ? 'Try adjusting your search or date filter' 
                                    : 'You haven\'t made any payments yet'}
                            </p>
                        </div>
                    ) : (
                        filteredPayments.map((payment: Payment) => (
                            <div key={payment.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30">
                                <div className="p-4 sm:p-6">
                                    <div className="flex flex-col sm:items-center justify-between gap-4">
                                        <div className="flex items-start gap-3 sm:gap-4">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center transition-transform duration-300 transform hover:scale-110 flex-shrink-0">
                                                {getStatusIcon(payment.status)}
                                            </div>
                                            
                                            <div className="min-w-0">
                                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">
                                                    {payment.bill.property.address}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <CreditCard className="w-3.5 h-3.5" />
                                                        {payment.payment_method}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {new Date(payment.paid_at).toLocaleDateString()}
                                                    </div>
                                                    <div className="flex items-center gap-1 truncate">
                                                        <Receipt className="w-3.5 h-3.5" />
                                                        <span className="truncate max-w-[120px]">{payment.transaction_reference}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-2 ml-11 sm:ml-0">
                                            <div className="text-right">
                                                <p className="text-lg sm:text-xl font-bold text-gray-900">
                                                    ${parseFloat(payment.amount).toFixed(2)}
                                                </p>
                                                <span className={`inline-block px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full border ${getStatusColor(payment.status)} transition-transform duration-300 transform hover:scale-105`}>
                                                    {payment.status}
                                                </span>
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => navigate(`/bills/${payment.bill.id}`)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 transform hover:scale-110 hover:rotate-12 shadow-sm shadow-blue-600/10 hover:shadow-md hover:shadow-blue-600/20"
                                                    title="View Bill"
                                                >
                                                    <ArrowUpRight className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => downloadReceipt(payment)}
                                                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-300 transform hover:scale-110 hover:rotate-12 shadow-sm shadow-blue-600/10 hover:shadow-md hover:shadow-blue-600/20"
                                                    title="Download Receipt"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default PaymentsPage;
