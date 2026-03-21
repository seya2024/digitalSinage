import React, { useState, useEffect, useRef } from 'react';
import { currencyService } from '../../services/currencyService';
import { videoService } from '../../services/videoService';
import TVDashboardPreview from './TVDashboardPreview';
import Chart from 'chart.js/auto';

const DashboardStats = () => {
    const [stats, setStats] = useState({
        totalCurrencies: 0,
        activeCurrencies: 0,
        pendingChanges: 0,
        activeVideos: 0,
        totalViews: 0,
        lastUpdate: null
    });
    const [recentActivities, setRecentActivities] = useState([]);
    const [rateTrends, setRateTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    useEffect(() => {
        if (rateTrends.length > 0 && chartRef.current) {
            createChart();
        }
    }, [rateTrends]);

    const loadDashboardData = async () => {
        try {
            const [ratesRes, videosRes, pendingRes] = await Promise.all([
                currencyService.getAll(),
                videoService.getAll(false),
                currencyService.getPendingChanges()
            ]);

            const currencies = ratesRes.data || [];
            const videos = videosRes.data || [];
            const pending = pendingRes.data || [];

            setStats({
                totalCurrencies: currencies.length,
                activeCurrencies: currencies.filter(c => c.is_active).length,
                pendingChanges: pending.length,
                activeVideos: videos.filter(v => v.status === 'active').length,
                totalViews: videos.reduce((sum, v) => sum + (v.view_count || 0), 0),
                lastUpdate: currencies[0]?.updated_at ? new Date(currencies[0].updated_at) : new Date()
            });

            // Create rate trends for chart
            const trends = currencies.slice(0, 5).map(c => ({
                name: c.code,
                sellRate: parseFloat(c.sell_rate),
                buyRate: parseFloat(c.buy_rate),
                spread: parseFloat(c.buy_rate) - parseFloat(c.sell_rate)
            }));
            setRateTrends(trends);

            // Create recent activities
            const activities = [];
            pending.forEach(p => {
                activities.push({
                    id: p.id,
                    type: 'pending',
                    message: `${p.change_type === 'add_currency' ? 'New currency request' : 
                              p.change_type === 'update_rate' ? 'Rate update request' : 'Deletion request'} for ${p.currency_name}`,
                    time: new Date(p.created_at),
                    user: p.requested_by_name
                });
            });
            activities.sort((a, b) => b.time - a.time);
            setRecentActivities(activities.slice(0, 5));
            
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const createChart = () => {
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }
        
        const ctx = chartRef.current.getContext('2d');
        chartInstance.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: rateTrends.map(t => t.name),
                datasets: [
                    {
                        label: 'Selling Rate (ETB)',
                        data: rateTrends.map(t => t.sellRate),
                        backgroundColor: 'rgba(0, 51, 102, 0.8)',
                        borderColor: '#003366',
                        borderWidth: 1,
                        borderRadius: 8
                    },
                    {
                        label: 'Buying Rate (ETB)',
                        data: rateTrends.map(t => t.buyRate),
                        backgroundColor: 'rgba(59, 130, 246, 0.8)',
                        borderColor: '#3b82f6',
                        borderWidth: 1,
                        borderRadius: 8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#1f2937',
                            font: { size: 12, weight: 'bold' }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw.toFixed(4)} ETB`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: { color: '#e5e7eb' },
                        title: {
                            display: true,
                            text: 'Exchange Rate (ETB)',
                            color: '#6b7280'
                        }
                    },
                    x: {
                        grid: { display: false },
                        title: {
                            display: true,
                            text: 'Currency',
                            color: '#6b7280'
                        }
                    }
                }
            }
        });
    };

    const statCards = [
        { title: 'Total Currencies', value: stats.totalCurrencies, icon: 'fa-coins', color: '#003366', change: '+2', changeType: 'increase' },
        { title: 'Active Currencies', value: stats.activeCurrencies, icon: 'fa-check-circle', color: '#10b981', change: '100%', changeType: 'increase' },
        { title: 'Pending Approvals', value: stats.pendingChanges, icon: 'fa-clock', color: '#f59e0b', change: `${stats.pendingChanges} waiting`, changeType: stats.pendingChanges > 0 ? 'warning' : 'neutral' },
        { title: 'Active Videos', value: stats.activeVideos, icon: 'fa-video', color: '#8b5cf6', change: 'Total Views: ' + stats.totalViews, changeType: 'neutral' }
    ];

    if (loading) {
        return <div className="loading-spinner">Loading dashboard...</div>;
    }

    return (
        <div className="dashboard-stats">
            {/* Stat Cards */}
            <div className="stats-grid">
                {statCards.map((card, index) => (
                    <div key={index} className="stat-card" style={{ borderLeftColor: card.color }}>
                        <div className="stat-icon" style={{ background: `${card.color}15`, color: card.color }}>
                            <i className={`fas ${card.icon}`}></i>
                        </div>
                        <div className="stat-info">
                            <h3>{card.value}</h3>
                            <p>{card.title}</p>
                            {card.change && (
                                <span className={`stat-change ${card.changeType}`}>
                                    <i className={`fas fa-${card.changeType === 'increase' ? 'arrow-up' : card.changeType === 'warning' ? 'exclamation-triangle' : 'minus'}`}></i>
                                    {card.change}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* TV Dashboard Preview */}
            <TVDashboardPreview />

            {/* Rate Trends Chart */}
            <div className="chart-section">
                <h3><i className="fas fa-chart-line"></i> Exchange Rate Trends</h3>
                <div className="chart-container">
                    <canvas ref={chartRef}></canvas>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h3><i className="fas fa-bolt"></i> Quick Actions</h3>
                <div className="action-buttons">
                    <button className="action-btn primary" onClick={() => window.location.href = '/admin/panel?tab=currencies'}>
                        <i className="fas fa-plus"></i> Add Currency
                    </button>
                    <button className="action-btn secondary" onClick={() => window.location.href = '/admin/panel?tab=pending'}>
                        <i className="fas fa-check-circle"></i> Review Pending
                    </button>
                    <button className="action-btn info" onClick={() => window.location.href = '/admin/panel?tab=videos'}>
                        <i className="fas fa-upload"></i> Upload Video
                    </button>
                    <button className="action-btn warning" onClick={() => window.open('/', '_blank')}>
                        <i className="fas fa-tv"></i> View TV Dashboard
                    </button>
                </div>
            </div>

            {/* Recent Activity & System Info */}
            <div className="dashboard-grid">
                <div className="recent-activity">
                    <h3><i className="fas fa-history"></i> Recent Activity</h3>
                    {recentActivities.length > 0 ? (
                        <div className="activity-list">
                            {recentActivities.map(activity => (
                                <div key={activity.id} className="activity-item">
                                    <div className="activity-icon">
                                        <i className={`fas fa-${activity.type === 'pending' ? 'clock' : 'exchange-alt'}`}></i>
                                    </div>
                                    <div className="activity-details">
                                        <p>{activity.message}</p>
                                        <span className="activity-time">
                                            {activity.time.toLocaleString()}
                                            {activity.user && <span> by {activity.user}</span>}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-activity">
                            <i className="fas fa-check-circle"></i>
                            <p>No recent activity</p>
                        </div>
                    )}
                </div>

                <div className="system-info-card">
                    <h3><i className="fas fa-server"></i> System Information</h3>
                    <div className="info-list">
                        <div className="info-item">
                            <span>Last Database Update:</span>
                            <strong>{stats.lastUpdate?.toLocaleString() || 'Never'}</strong>
                        </div>
                        <div className="info-item">
                            <span>API Status:</span>
                            <strong className="status-online">
                                <i className="fas fa-circle"></i> Online
                            </strong>
                        </div>
                        <div className="info-item">
                            <span>Database:</span>
                            <strong className="status-online">
                                <i className="fas fa-check-circle"></i> Connected
                            </strong>
                        </div>
                        <div className="info-item">
                            <span>Auto-Refresh:</span>
                            <strong>30 seconds</strong>
                        </div>
                        <div className="info-item">
                            <span>Total Rate Changes:</span>
                            <strong>Tracked in history</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardStats;