import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ 
    menuItems = [], 
    isOpen = true, 
    onToggle,
    onItemClick 
}) => {
    return (
        <aside className={`app-sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-header">
                <i className="fas fa-chart-line"></i>
                {isOpen && <span>Exchange Manager</span>}
                <button className="sidebar-toggle" onClick={onToggle}>
                    <i className={`fas fa-chevron-${isOpen ? 'left' : 'right'}`}></i>
                </button>
            </div>
            
            <nav className="sidebar-nav">
                {menuItems.map(item => (
                    <NavLink
                        key={item.id}
                        to={item.path}
                        className={({ isActive }) => 
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                        onClick={() => onItemClick && onItemClick(item.id)}
                    >
                        <i className={`fas ${item.icon}`} style={{ color: item.color }}></i>
                        {isOpen && <span>{item.label}</span>}
                        {item.badge && isOpen && (
                            <span className="nav-badge">{item.badge}</span>
                        )}
                    </NavLink>
                ))}
            </nav>
            
            <div className="sidebar-footer">
                <div className="system-status">
                    <i className="fas fa-circle"></i>
                    {isOpen && <span>System Online</span>}
                </div>
                {isOpen && (
                    <div className="version">
                        <i className="fas fa-code-branch"></i>
                        <span>v2.0.0</span>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;