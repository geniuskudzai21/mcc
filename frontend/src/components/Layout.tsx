import React, { type ReactNode, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    Home, FileText, CreditCard, MessageSquare,
    User as UserIcon, LogOut, LayoutDashboard,
    AlertCircle, Users, ShieldUser, Menu, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
    children: ReactNode;
    isAdmin?: boolean;
    hideHeader?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, isAdmin = false, hideHeader = false }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const adminNavItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
        { name: 'Users', icon: Users, path: '/admin/users' },
        { name: 'Account Approvals', icon: ShieldUser, path: '/admin/account-approvals' },
        { name: 'Billing', icon: FileText, path: '/admin/bills' },
        { name: 'Requests', icon: AlertCircle, path: '/admin/requests' },
    ];

    const regularNavItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'My Bills', icon: FileText, path: '/bills' },
        { name: 'Payments', icon: CreditCard, path: '/payments' },
        { name: 'Requests', icon: MessageSquare, path: '/requests' },
    ];

    const currentNavItems = isAdmin ? adminNavItems : regularNavItems;
    const currentTitle = currentNavItems.find(item => location.pathname.startsWith(item.path))?.name
        || (location.pathname.startsWith('/profile') ? 'My Profile' : isAdmin ? 'Admin' : 'Portal');

    return (
        <div className="flex h-screen font-['Inter',system-ui,sans-serif] bg-slate-200 relative">
            {/* Mobile overlay and sidebar - only shown on mobile */}
            {sidebarOpen && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <aside className="fixed inset-y-0 left-0 z-50 w-60 bg-[#001e3c] flex flex-col relative overflow-hidden transform transition-transform duration-300 ease-in-out lg:hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:20px_20px] pointer-events-none" />
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#2563eb]" />

                        {/* Mobile close button */}
                        <div className="absolute top-4 right-4 z-10">
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 pb-4 border-b border-white/[0.07] relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/[0.08] border border-white/[0.12] rounded-lg p-1.5 flex-shrink-0">
                                    <img src="/mutarelogo.png" alt="Logo" className="w-6 h-6 block" />
                                </div>
                                <div>
                                    <h1 className="text-white text-[0.8rem] font-extrabold tracking-[0.03em] leading-tight">City of Mutare</h1>
                                    <p className="text-[#2563eb] text-[0.6rem] font-bold uppercase tracking-[0.1em] mt-0.5">
                                        {isAdmin ? 'Admin Console' : 'Citizen Portal'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="px-5 pt-5 pb-2 relative z-10">
                            <span className="text-[0.55rem] font-extrabold uppercase tracking-[0.15em] text-white/[0.2]">Navigation</span>
                        </div>

                        <nav className="flex-1 px-3 flex flex-col gap-0.5 relative z-10">
                            {currentNavItems.map((item, i) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={({ isActive }) => `
                                        flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[0.825rem] font-semibold no-underline transition-all duration-200
                                        ${isActive 
                                            ? 'bg-[#2563eb] text-[#001e3c] font-extrabold' 
                                            : 'text-white/[0.45] hover:text-white/[0.85] hover:bg-white/[0.06]'}
                                    `}
                                    end={item.path === '/admin' || item.path === '/dashboard'}
                                    style={{ animationDelay: `${i * 0.05}s` }}
                                >
                                    <item.icon className="w-4 h-4 flex-shrink-0" />
                                    {item.name}
                                </NavLink>
                            ))}
                        </nav>

                        <div className="mx-4 h-px bg-white/[0.07]" />

                        <div className="px-3 py-3 flex flex-col gap-0.5 relative z-10">
                            <NavLink
                                to="/profile"
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[0.825rem] font-semibold no-underline transition-all duration-200
                                    ${isActive 
                                        ? 'bg-[#2563eb] text-[#001e3c] font-extrabold' 
                                        : 'text-white/[0.45] hover:text-white/[0.85] hover:bg-white/[0.06]'}
                            `}
                            >
                                <UserIcon className="w-4 h-4" />
                                My Profile
                            </NavLink>
                            <button 
                                onClick={() => {
                                    logout();
                                    setSidebarOpen(false);
                                }} 
                                className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[0.825rem] font-semibold text-white/[0.35] bg-none border-none cursor-pointer transition-all duration-200 hover:text-red-300 hover:bg-red-500/[0.12] text-left"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>

                        <div className="p-3.5 border-t border-white/[0.07] bg-black/[0.15] relative z-10">
                            <div className="flex items-center gap-2.5">
                                <div className="w-[30px] h-[30px] bg-[#2563eb] rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-[#001e3c] text-[0.75rem] font-extrabold">
                                        {user?.name ? user.name[0].toUpperCase() : 'U'}
                                    </span>
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-white text-[0.775rem] font-bold truncate">{user?.name || 'Citizen'}</p>
                                    <p className="text-white/[0.35] text-[0.6rem] truncate">{user?.email || ''}</p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </>
            )}

            {/* Desktop sidebar - always visible on desktop */}
            <aside className="hidden lg:flex lg:flex-shrink-0 lg:w-60 bg-[#001e3c] flex-col relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:20px_20px] pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#2563eb]" />

                <div className="p-5 pb-4 border-b border-white/[0.07] relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/[0.08] border border-white/[0.12] rounded-lg p-1.5 flex-shrink-0">
                            <img src="/mutarelogo.png" alt="Logo" className="w-6 h-6 block" />
                        </div>
                        <div>
                            <h1 className="text-white text-[0.8rem] font-extrabold tracking-[0.03em] leading-tight">City of Mutare</h1>
                            <p className="text-[#2563eb] text-[0.6rem] font-bold uppercase tracking-[0.1em] mt-0.5">
                                {isAdmin ? 'Admin Console' : 'Citizen Portal'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-5 pt-5 pb-2 relative z-10">
                    <span className="text-[0.55rem] font-extrabold uppercase tracking-[0.15em] text-white/[0.2]">Navigation</span>
                </div>

                <nav className="flex-1 px-3 flex flex-col gap-0.5 relative z-10">
                    {currentNavItems.map((item, i) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[0.825rem] font-semibold no-underline transition-all duration-200
                                ${isActive 
                                    ? 'bg-[#2563eb] text-[#001e3c] font-extrabold' 
                                    : 'text-white/[0.45] hover:text-white/[0.85] hover:bg-white/[0.06]'}
                            `}
                            end={item.path === '/admin' || item.path === '/dashboard'}
                            style={{ animationDelay: `${i * 0.05}s` }}
                        >
                            <item.icon className="w-4 h-4 flex-shrink-0" />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                <div className="mx-4 h-px bg-white/[0.07]" />

                <div className="px-3 py-3 flex flex-col gap-0.5 relative z-10">
                    <NavLink
                        to="/profile"
                        className={({ isActive }) => `
                            flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[0.825rem] font-semibold no-underline transition-all duration-200
                            ${isActive 
                                ? 'bg-[#2563eb] text-[#001e3c] font-extrabold' 
                                : 'text-white/[0.45] hover:text-white/[0.85] hover:bg-white/[0.06]'}
                    `}
                    >
                        <UserIcon className="w-4 h-4" />
                        My Profile
                    </NavLink>
                    <button 
                        onClick={logout} 
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[0.825rem] font-semibold text-white/[0.35] bg-none border-none cursor-pointer transition-all duration-200 hover:text-red-300 hover:bg-red-500/[0.12] text-left"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>

                <div className="p-3.5 border-t border-white/[0.07] bg-black/[0.15] relative z-10">
                    <div className="flex items-center gap-2.5">
                        <div className="w-[30px] h-[30px] bg-[#2563eb] rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-[#001e3c] text-[0.75rem] font-extrabold">
                                {user?.name ? user.name[0].toUpperCase() : 'U'}
                            </span>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-white text-[0.775rem] font-bold truncate">{user?.name || 'Citizen'}</p>
                            <p className="text-white/[0.35] text-[0.6rem] truncate">{user?.email || ''}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content - hidden when sidebar is open on mobile */}
            <div className={`flex-1 overflow-y-auto flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? 'opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto' : ''}`}>
                {!hideHeader && (
                    <header className="bg-white border-b border-slate-300 border-t-4 border-t-[#2563eb] px-4 sm:px-7 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                        {/* Mobile hamburger menu */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                <Menu className="w-5 h-5 text-slate-600" />
                            </button>
                            <div className="w-[3px] h-[18px] bg-[#2563eb] rounded-sm" />
                            <h2 className="text-[0.925rem] font-extrabold text-gray-900 tracking-tight">{currentTitle}</h2>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-px h-6 bg-slate-200 hidden sm:block" />

                            <div className="flex items-center gap-2.5">
                                <div className="text-right hidden sm:block">
                                    <p className="text-[0.775rem] font-bold text-gray-900 leading-tight">{user?.name || 'Guest'}</p>
                                    <p className="text-[0.65rem] text-slate-400 leading-tight">{isAdmin ? 'Administrator' : 'Citizen Account'}</p>
                                </div>
                                <div className="w-9 h-9 rounded-full bg-[#001e3c] border-2 border-[#2563eb] flex items-center justify-center text-white text-[0.8rem] font-extrabold flex-shrink-0 cursor-pointer transition-transform hover:scale-105">
                                    {user?.name ? user.name[0].toUpperCase() : <UserIcon className="w-3.5" />}
                                </div>
                            </div>
                        </div>
                    </header>
                )}

                <div className="p-4 sm:p-7 flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;
