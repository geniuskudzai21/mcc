import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import BillsPage from './pages/BillsPage.tsx';
import BillDetailsPage from './pages/BillDetailsPage.tsx';
import PaymentsPage from './pages/PaymentsPage.tsx';
import RequestsPage from './pages/RequestsPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import AdminDashboard from './admin/AdminDashboard.tsx';
import AdminAccountApprovals from './admin/AdminAccountApprovals.tsx';
import AdminBills from './admin/AdminBills.tsx';
import AdminRequests from './admin/AdminRequests.tsx';
import AdminUsers from './admin/AdminUsers.tsx';

import { AuthProvider, useAuth } from './context/AuthContext';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="font-bold text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isInternal = user.role !== 'USER';

  if (adminOnly && !isInternal) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Resident Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/bills" element={<ProtectedRoute><BillsPage /></ProtectedRoute>} />
            <Route path="/bills/:id" element={<ProtectedRoute><BillDetailsPage /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
            <Route path="/requests" element={<ProtectedRoute><RequestsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/account-approvals" element={<ProtectedRoute adminOnly><AdminAccountApprovals /></ProtectedRoute>} />
            <Route path="/admin/bills" element={<ProtectedRoute adminOnly><AdminBills /></ProtectedRoute>} />
            <Route path="/admin/requests" element={<ProtectedRoute adminOnly><AdminRequests /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
            {/* Default */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}


export default App;
