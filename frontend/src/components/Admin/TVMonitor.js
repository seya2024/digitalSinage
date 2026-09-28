import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './TVMonitor.css';

const TVMonitor = () => {
    const [tvStatus, setTvStatus] = useState([]);
    const [stats, setStats] = useState({ total: 0, online: 0, warning: 0, offline: 0, never: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [lastRefresh, setLastRefresh] = useState(new Date());

    const loadStatus = async () => {
        try {
            const res = await api.get('/branches/status/all');
            if (res.data.success) {
                setTvStatus(res.data.data || []);
                setStats(res.data.stats || {});
                setLastRefresh(new Date());
            }
        } catch (err) {
            console.error('Failed to load TV status:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStatus();
        const t = setInterval(loadStatus, 30000);
        return () => clearInterval(t);
    }, []);

    const timeAgo = (ts) => {
        if (!ts) return 'Never';
        const secs = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
        if (secs < 60) return `${secs}s ago`;
        if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
        if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
        return `${Math.floor(secs / 86400)}d ago`;
    };

    const getStatusBadge = (status) => {
        const map = {
            online:  { label: '🟢 Online',  cls: 'status-online'  },
            warning: { label: '🟡 Warning', cls: 'status-warning' },
            offline: { label: '🔴 Offline', cls: 'status-offline' },
            never:   { label: '⚪ Never',   cls: 'status-never'   },
        };
        const s = map[status] || map.never;
        return <span className={`tv-status-badge ${s.cls}`}>{s.label}</span>;
    };

    const filtered = tvStatus.filter(b => {
        if (filter !== 'all' && b.computed_status !== filter) return false;
        const q = searchTerm.toLowerCase();
        return !q || b.name?.toLowerCase().includes(q) || b.code?.toLowerCase().includes(q);
    });

    if (loading) return <div className="loading-spinner">Loading TV monitor...</div>;

    return (
        <div className="tv-monitor">
            <div className="section-header">
                <h2><i className="fas fa-desktop"></i> TV Monitor — All Branches</h2>
                <div className="monitor-info">
                    <span className="refresh-time">
                        <i className="fas fa-sync-alt"></i> Updated {timeAgo(lastRefresh)}
                    </span>
                    <button onClick={loadStatus} className="btn-refresh">
                        <i className="fas fa-sync-alt"></i> Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="monitor-stats">
                <div className="stat-card stat-total">
                    <i className="fas fa-tv"></i>
                    <div><h3>{stats.total}</h3><p>Total TVs</p></div>
                </div>
                <div className="stat-card stat-online">
                    <i className="fas fa-check-circle"></i>
                    <div><h3>{stats.online}</h3><p>Online</p></div>
                </div>
                <div className="stat-card stat-warning">
                    <i className="fas fa-exclamation-triangle"></i>
                    <div><h3>{stats.warning}</h3><p>Warning</p></div>
                </div>
                <div className="stat-card stat-offline">
                    <i className="fas fa-times-circle"></i>
                    <div><h3>{stats.offline}</h3><p>Offline</p></div>
                </div>
                <div className="stat-card stat-never">
                    <i className="fas fa-question-circle"></i>
                    <div><h3>{stats.never}</h3><p>Never Connected</p></div>
                </div>
            </div>

            {/* Filters */}
            <div className="monitor-filters">
                <div className="filter-tabs">
                    <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All ({stats.total})</button>
                    <button className={filter === 'online' ? 'active' : ''} onClick={() => setFilter('online')}>Online ({stats.online})</button>
                    <button className={filter === 'warning' ? 'active' : ''} onClick={() => setFilter('warning')}>Warning ({stats.warning})</button>
                    <button className={filter === 'offline' ? 'active' : ''} onClick={() => setFilter('offline')}>Offline ({stats.offline})</button>
                    <button className={filter === 'never' ? 'active' : ''} onClick={() => setFilter('never')}>Never ({stats.never})</button>
                </div>
                <input
                    type="text"
                    placeholder="Search by name or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            {/* Table */}
            <div className="monitor-table-wrapper">
                <table className="monitor-table">
                    <thead>
                        <tr>
                            <th>Branch</th>
                            <th>Code</th>
                            <th>District</th>
                            <th>Status</th>
                            <th>Last Heartbeat</th>
                            <th>Version</th>
                            <th>IP</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(b => (
                            <tr key={b.id} className={`row-${b.computed_status}`}>
                                <td className="branch-name">{b.name}</td>
                                <td className="branch-code">{b.code}</td>
                                <td>{b.district_name || '—'}</td>
                                <td>{getStatusBadge(b.computed_status)}</td>
                                <td>{b.last_heartbeat ? timeAgo(b.last_heartbeat) : 'Never'}</td>
                                <td>{b.tv_version || '—'}</td>
                                <td className="ip-cell">{b.tv_ip || '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="empty-state">
                        <i className="fas fa-tv"></i>
                        <p>No TVs match the filter</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TVMonitor;