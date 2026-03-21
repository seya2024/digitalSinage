import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = ({ children, showSidebar = true, showHeader = true, showFooter = true }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    
    // Define menu items based on current route
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt', path: '/admin/panel', color: '#3b82f6' },
        { id: 'currencies', label: 'Currency Manager', icon: 'fa-coins', path: '/admin/panel?tab=currencies', color: '#10b981' },
        { id: 'pending', label: 'Pending Approvals', icon: 'fa-clock', path: '/admin/panel?tab=pending', color: '#f59e0b' },
        { id: 'videos', label: 'Video Manager', icon: 'fa-video', path: '/admin/panel?tab=videos', color: '#8b5cf6' },
        { id: 'users', label: 'User Management', icon: 'fa-users', path: '/admin/panel?tab=users', color: '#ef4444' },
        { id: 'profile', label: 'My Profile', icon: 'fa-user-circle', path: '/admin/panel?tab=profile', color: '#6b7280' },
        { id: 'reports', label: 'Rate History', icon: 'fa-chart-line', path: '/admin/panel?tab=reports', color: '#06b6d4' },
        { id: 'settings', label: 'Settings', icon: 'fa-cog', path: '/admin/panel?tab=settings', color: '#6b7280' }
    ];

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleMenuItemClick = (itemId) => {
        // Handle menu item click if needed
        console.log('Clicked:', itemId);
    };

    // Determine if we're on TV dashboard (no sidebar needed)
    const isTVDashboard = location.pathname === '/' || location.pathname === '/tv';

    if (isTVDashboard) {
        return (
            <div className="app-layout tv-layout">
                {showHeader && <Header showDateTime={true} />}
                <main className="app-main">
                    {children}
                </main>
                {showFooter && <Footer />}
            </div>
        );
    }

    return (
        <div className="app-layout admin-layout">
            {showHeader && <Header />}
            <div className="layout-container">
                {showSidebar && (
                    <Sidebar 
                        menuItems={menuItems}
                        isOpen={sidebarOpen}
                        onToggle={toggleSidebar}
                        onItemClick={handleMenuItemClick}
                    />
                )}
                <main className={`app-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                    {children}
                </main>
            </div>
            {showFooter && <Footer />}
        </div>
    );
};

export default Layout;