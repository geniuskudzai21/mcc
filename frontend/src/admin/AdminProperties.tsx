import React from 'react';
import Layout from '../components/Layout';
import {
    CheckCircle2,
    XCircle,
    User,
    MapPin,
    Hash,
    ShieldCheck
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const AdminProperties: React.FC = () => {
    const queryClient = useQueryClient();

    const { data: pendingLinks, isLoading } = useQuery({
        queryKey: ['pending-property-links'],
        queryFn: async () => {
            const res = await api.get('/admin/property-links/pending');
            return res.data;
        }
    });

    const verifyMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            return api.put(`/admin/property-links/${id}/status`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-property-links'] });
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            alert('Property link status updated successfully');
        }
    });

    return (
        <Layout isAdmin={true}>
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Property Verifications</h1>
                    <p className="text-gray-600 text-sm">Security audit for citizen-property link requests.</p>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-60">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-slate-500 text-sm ml-4">Loading verification requests...</p>
                    </div>
                ) : (
                    <div className="space-y-3 md:space-y-4">
                        {pendingLinks && pendingLinks.length > 0 ? (
                            pendingLinks.map((link: any) => (
                                <div key={link.id} className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300">
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <ShieldCheck className="w-5 md:w-6 h-5 md:h-6 text-yellow-600" />
                                        </div>

                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Citizen</p>
                                                <div className="flex items-center gap-2">
                                                    <User className="w-3 md:w-4 h-3 md:h-4 text-gray-400" />
                                                    <span className="font-semibold text-sm text-gray-900 truncate">{link.user.name}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 ml-5 truncate">{link.user.email}</p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Property Details</p>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3 md:w-4 h-3 md:h-4 text-gray-400" />
                                                    <span className="font-semibold text-sm text-gray-900 truncate">{link.property.address}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 ml-5">{link.property.suburb}</p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Identifiers</p>
                                                <div className="flex items-center gap-2">
                                                    <Hash className="w-3 md:w-4 h-3 md:h-4 text-gray-400" />
                                                    <span className="font-semibold text-sm text-gray-900">{link.property.account_number}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 ml-5">Stand: {link.property.stand_number}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-row lg:flex-col gap-2 lg:gap-2">
                                            <button
                                                onClick={() => verifyMutation.mutate({ id: link.id, status: 'VERIFIED' })}
                                                className="flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-green-600 text-white rounded-lg text-xs md:text-sm font-medium hover:bg-green-700 transition-colors"
                                            >
                                                <CheckCircle2 className="w-3 md:w-4 h-3 md:h-4" />
                                                <span>Verify</span>
                                            </button>
                                            <button
                                                onClick={() => verifyMutation.mutate({ id: link.id, status: 'REJECTED' })}
                                                className="flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-red-100 text-red-600 rounded-lg text-xs md:text-sm font-medium hover:bg-red-200 transition-colors"
                                            >
                                                <XCircle className="w-3 md:w-4 h-3 md:h-4" />
                                                <span>Deny</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-12 text-center shadow-lg">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-6 md:w-8 h-6 md:h-8 text-green-600" />
                                </div>
                                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
                                <p className="text-gray-600 text-sm">There are no pending property link requests awaiting verification.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AdminProperties;