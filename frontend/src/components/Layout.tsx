import React, { type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    Home, FileText, CreditCard, MessageSquare,
    User as UserIcon, LogOut, LayoutDashboard,
    AlertCircle, Bell, Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAVY = '#001e3c';
const ACCENT = '#09d6f1';

interface LayoutProps {
    children: ReactNode;
    isAdmin?: boolean;
    hideHeader?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, isAdmin = false, hideHeader = false }) => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const adminNavItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
        { name: 'Account Approvals', icon: Users, path: '/admin/account-approvals' },
        { name: 'Billing', icon: FileText, path: '/admin/bills' },
        { name: 'Requests', icon: AlertCircle, path: '/admin/requests' },
    ];

    const regularNavItems = [
        { name: 'Dashboard', icon: Home, path: '/dashboard' },
        { name: 'My Bills', icon: FileText, path: '/bills' },
        { name: 'Payments', icon: CreditCard, path: '/payments' },
        { name: 'Requests', icon: MessageSquare, path: '/requests' },
    ];

    const currentNavItems = isAdmin ? adminNavItems : regularNavItems;
    const currentTitle = currentNavItems.find(item => location.pathname.startsWith(item.path))?.name
        || (location.pathname.startsWith('/profile') ? 'My Profile' : isAdmin ? 'Admin' : 'Portal');

    return (
        <>
            <style>{`
                @keyframes fadeSlideRight {
                    from { opacity: 0; transform: translateX(-8px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                .sidebar-nav-link {
                    display: flex; align-items: center; gap: 0.75rem;
                    padding: 0.6rem 0.875rem;
                    border-radius: 8px;
                    font-size: 0.825rem; font-weight: 600;
                    color: rgba(255,255,255,0.45);
                    text-decoration: none;
                    transition: all 0.18s ease;
                    position: relative;
                }
                .sidebar-nav-link:hover {
                    color: rgba(255,255,255,0.85);
                    background: rgba(255,255,255,0.06);
                }
                .sidebar-nav-link.active {
                    color: ${NAVY};
                    background: ${ACCENT};
                    font-weight: 800;
                }
                .sidebar-nav-link.active svg {
                    color: ${NAVY};
                }
                .sidebar-nav-link svg {
                    width: 16px; height: 16px; flex-shrink: 0;
                    transition: color 0.18s ease;
                }
                .logout-btn {
                    display: flex; align-items: center; gap: 0.75rem;
                    width: 100%; padding: 0.6rem 0.875rem;
                    border-radius: 8px; font-size: 0.825rem; font-weight: 600;
                    color: rgba(255,255,255,0.35);
                    background: none; border: none; cursor: pointer;
                    transition: all 0.18s ease; text-align: left;
                }
                .logout-btn:hover {
                    color: #fca5a5;
                    background: rgba(239,68,68,0.12);
                }
                .header-btn {
                    display: flex; align-items: center; gap: 6px;
                    padding: 0.4rem 0.75rem; border-radius: 8px;
                    font-size: 0.75rem; font-weight: 700;
                    background: none; border: 1px solid #f3f4f6;
                    color: #374151; cursor: pointer;
                    transition: all 0.15s ease;
                }
                .header-btn:hover { background: #f9fafb; border-color: #e5e7eb; }
                .avatar-ring {
                    width: 34px; height: 34px; border-radius: 50%;
                    background: ${NAVY};
                    border: 2px solid ${ACCENT};
                    display: flex; align-items: center; justify-content: center;
                    color: white; font-size: 0.8rem; font-weight: 900;
                    flex-shrink: 0; cursor: pointer;
                    transition: all 0.2s ease;
                }
                .avatar-ring:hover { transform: scale(1.05); }
                tr:hover td { background: #f8fafc; }
                .main-scroll { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }
            `}</style>

            <div className="app-layout-wrapper" style={{ display: 'flex', height: '100vh', fontFamily: "'Inter', system-ui, sans-serif", background: '#f4f6f9' }}>

                {/* ━━━━━━━━━━ SIDEBAR ━━━━━━━━━━ */}
                <aside className="app-sidebar" style={{
                    width: '240px', flexShrink: 0,
                    background: NAVY,
                    display: 'flex', flexDirection: 'column',
                    position: 'relative', overflow: 'hidden'
                }}>
                    {/* Dot grid texture */}
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '20px 20px', pointerEvents: 'none' }} />
                    {/* Cyan top accent */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: ACCENT }} />

                    {/* Brand */}
                    <div style={{ padding: '1.5rem 1.25rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '7px', flexShrink: 0 }}>
                                <img src="/mutarelogo.png" alt="Logo" style={{ width: '26px', height: '26px', display: 'block' }} />
                            </div>
                            <div>
                                <h1 style={{ color: 'white', fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.03em', lineHeight: 1.2 }}>City of Mutare</h1>
                                <p style={{ color: ACCENT, fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '2px' }}>
                                    {isAdmin ? 'Admin Console' : 'Citizen Portal'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Nav section label */}
                    <div style={{ padding: '1.25rem 1.25rem 0.5rem', position: 'relative', zIndex: 1 }}>
                        <span style={{ fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.2)' }}>
                            Navigation
                        </span>
                    </div>

                    {/* Nav items */}
                    <nav className="sidebar-nav-container" style={{ flex: 1, padding: '0 0.75rem', display: 'flex', flexDirection: 'column', gap: '2px', position: 'relative', zIndex: 1 }}>
                        {currentNavItems.map((item, i) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                                end={item.path === '/admin' || item.path === '/dashboard'}
                                style={{ animationDelay: `${i * 0.05}s` }}
                            >
                                <item.icon />
                                {item.name}
                                {/* Active indicator dot */}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Divider */}
                    <div style={{ margin: '0 1rem', height: '1px', background: 'rgba(255,255,255,0.07)', position: 'relative', zIndex: 1 }} />

                    {/* Footer nav */}
                    <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '2px', position: 'relative', zIndex: 1 }}>
                        <NavLink
                            to="/profile"
                            className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                        >
                            <UserIcon style={{ width: '16px', height: '16px' }} />
                            My Profile
                        </NavLink>
                        <button className="logout-btn" onClick={logout}>
                            <LogOut style={{ width: '16px', height: '16px' }} />
                            Sign Out
                        </button>
                    </div>

                    {/* Bottom user card */}
                    <div style={{ padding: '0.875rem 1rem', borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.15)', position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <div style={{ width: '30px', height: '30px', background: ACCENT, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span style={{ color: NAVY, fontSize: '0.75rem', fontWeight: 900 }}>
                                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                                </span>
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <p style={{ color: 'white', fontSize: '0.775rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {user?.name || 'Citizen'}
                                </p>
                                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.6rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {user?.email || ''}
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* ━━━━━━━━━━ MAIN AREA ━━━━━━━━━━ */}
                <div className="main-scroll">

                    {/* ── TOP HEADER ── */}
                    {!hideHeader && (
                        <header style={{
                            height: '64px', minHeight: '64px', background: 'white',
                            borderBottom: '1px solid #e9ecf0',
                            borderTop: `3px solid ${ACCENT}`,
                            padding: '0 1.75rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            position: 'sticky', top: 0, zIndex: 50,
                            boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
                        }}>
                            {/* Left: breadcrumb */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '3px', height: '18px', background: ACCENT, borderRadius: '2px' }} />
                                <h2 style={{ fontSize: '0.925rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.01em' }}>
                                    {currentTitle}
                                </h2>
                            </div>

                            {/* Right: actions + user */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {/* Notification bell */}
                                <button className="header-btn" style={{ padding: '0.4rem', width: '34px', height: '34px', justifyContent: 'center' }}>
                                    <Bell style={{ width: '15px', color: '#6b7280' }} />
                                </button>

                                {/* Divider */}
                                <div style={{ width: '1px', height: '24px', background: '#f3f4f6' }} />

                                {/* User info */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '0.775rem', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>
                                            {user?.name || 'Guest'}
                                        </p>
                                        <p style={{ fontSize: '0.65rem', color: '#9ca3af', lineHeight: 1.2 }}>
                                            {isAdmin ? 'Administrator' : 'Citizen Account'}
                                        </p>
                                    </div>
                                    <div className="avatar-ring">
                                        {user?.name ? user.name[0].toUpperCase() : <UserIcon style={{ width: '14px' }} />}
                                    </div>
                                </div>
                            </div>
                        </header>
                    )}

                    {/* ── CONTENT ── */}
                    <div style={{ padding: '1.75rem', flex: 1 }}>
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Layout;
