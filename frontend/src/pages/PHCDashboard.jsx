import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/water-quality.css';
import axios from 'axios';
import ImageGallery from '../components/ImageGallery';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PHCDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [stats, setStats] = useState({ pending: 0, verified: 0, resolved: 0 });
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showForwardModal, setShowForwardModal] = useState(false);
    const [forwardData, setForwardData] = useState({ labId: '', notes: '', priority: 'medium' });
    const [filters, setFilters] = useState({ status: '', severity: '', search: '' });
    const [galleryImages, setGalleryImages] = useState([]);
    const [showGallery, setShowGallery] = useState(false);

    useEffect(() => {
        // Check authentication
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
        if (!currentUser || currentUser.role !== 'phc') {
            navigate('/water-quality/login');
            return;
        }
        setUser(currentUser);
        loadReports(currentUser.district);
    }, [navigate]);

    const loadReports = async (district) => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/reporting/reports?district=${district}`);
            const allReports = response.data.reports || [];

            setReports(allReports);
            setFilteredReports(allReports);

            // Calculate stats
            const pending = allReports.filter(r => r.status === 'pending' || r.status === 'contaminated').length;
            const verified = allReports.filter(r => r.status === 'verified' || r.status === 'testing').length;
            const resolved = allReports.filter(r => r.status === 'clean' || r.status === 'resolved').length;

            setStats({ pending, verified, resolved });
        } catch (error) {
            console.error('Error loading reports:', error);
            alert('Error loading reports. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Apply filters
        let filtered = reports;

        if (filters.status) {
            filtered = filtered.filter(r => r.status === filters.status);
        }

        if (filters.severity) {
            filtered = filtered.filter(r => r.severityLevel === filters.severity);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(r =>
                r.village?.toLowerCase().includes(searchLower) ||
                r.description?.toLowerCase().includes(searchLower)
            );
        }

        setFilteredReports(filtered);
    }, [filters, reports]);

    const handleUpdateStatus = async (reportId, newStatus) => {
        try {
            await axios.put(`${API_URL}/reporting/reports/${reportId}`, { status: newStatus });
            alert('Report status updated successfully!');
            loadReports(user.district);
            setShowDetailModal(false);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error updating status. Please try again.');
        }
    };

    const handleForwardToLab = async () => {
        if (!forwardData.labId) {
            alert('Please select a water lab');
            return;
        }

        try {
            await axios.post(`${API_URL}/reporting/forward`, {
                reportId: selectedReport.id,
                labId: forwardData.labId,
                notes: forwardData.notes,
                priority: forwardData.priority
            });

            alert('Report forwarded to water lab successfully!');
            setShowForwardModal(false);
            setForwardData({ labId: '', notes: '', priority: 'medium' });
            loadReports(user.district);
        } catch (error) {
            console.error('Error forwarding report:', error);
            alert('Error forwarding report. Please try again.');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getSeverityColor = (severity) => {
        const colors = {
            safe: 'var(--wq-success)',
            caution: 'var(--wq-warning)',
            unsafe: 'var(--wq-danger)',
            critical: '#8b0000'
        };
        return colors[severity] || 'var(--wq-text-secondary)';
    };

    if (!user) return null;

    return (
        <div className="wq-container" style={{ background: 'var(--wq-bg-secondary)', minHeight: '100vh' }}>
            {/* Header */}
            <header className="wq-header">
                <div className="wq-header-content">
                    <div className="wq-logo">PHC Dashboard - {user.district}</div>
                    <nav className="wq-nav">
                        <Link to="/water-quality">Home</Link>
                        <Link to="/water-quality/phc-dashboard" className="active">Dashboard</Link>
                        <button onClick={() => {
                            sessionStorage.removeItem('currentUser');
                            navigate('/water-quality/login');
                        }} className="wq-btn wq-btn-outline" style={{ marginLeft: '10px' }}>
                            Logout
                        </button>
                    </nav>
                </div>
            </header>

            <main className="wq-container">
                {/* Stats */}
                <div className="wq-grid wq-grid-3 wq-mb-20">
                    <div className="wq-stat-card">
                        <div className="wq-stat-value" style={{ color: 'var(--wq-danger)' }}>{stats.pending}</div>
                        <div className="wq-stat-label">Pending Reports</div>
                    </div>
                    <div className="wq-stat-card">
                        <div className="wq-stat-value" style={{ color: 'var(--wq-warning)' }}>{stats.verified}</div>
                        <div className="wq-stat-label">Under Testing</div>
                    </div>
                    <div className="wq-stat-card">
                        <div className="wq-stat-value" style={{ color: 'var(--wq-success)' }}>{stats.resolved}</div>
                        <div className="wq-stat-label">Resolved</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="wq-card wq-mb-20">
                    <h2 className="wq-card-title">Filter Reports</h2>
                    <div className="wq-grid wq-grid-3" style={{ gap: '15px' }}>
                        <div className="wq-form-group" style={{ marginBottom: 0 }}>
                            <label className="wq-form-label">Status</label>
                            <select
                                className="wq-form-select"
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="contaminated">Contaminated</option>
                                <option value="testing">Testing</option>
                                <option value="verified">Verified</option>
                                <option value="clean">Clean</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>
                        <div className="wq-form-group" style={{ marginBottom: 0 }}>
                            <label className="wq-form-label">Severity</label>
                            <select
                                className="wq-form-select"
                                value={filters.severity}
                                onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                            >
                                <option value="">All Severities</option>
                                <option value="safe">Safe</option>
                                <option value="caution">Caution</option>
                                <option value="unsafe">Unsafe</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                        <div className="wq-form-group" style={{ marginBottom: 0 }}>
                            <label className="wq-form-label">Search</label>
                            <input
                                type="text"
                                className="wq-form-input"
                                placeholder="Search by location or description..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Reports List */}
                <div className="wq-card">
                    <h2 className="wq-card-title">District Reports ({filteredReports.length})</h2>
                    {loading ? (
                        <p style={{ color: 'var(--wq-text-secondary)' }}>Loading reports...</p>
                    ) : filteredReports.length === 0 ? (
                        <p style={{ color: 'var(--wq-text-secondary)' }}>No reports found.</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '15px' }}>
                            {filteredReports.map(report => (
                                <div key={report.id} className="wq-report-item" style={{ cursor: 'pointer' }}>
                                    <div className="wq-report-header">
                                        <div className="wq-report-info">
                                            <div className="wq-report-location">{report.village}</div>
                                            <div className="wq-report-meta">
                                                <span style={{ color: getSeverityColor(report.severityLevel) }}>
                                                    ● {report.severityLevel?.toUpperCase()}
                                                </span>
                                                {' • '}
                                                {report.waterSource}
                                            </div>
                                        </div>
                                        <span className={`wq-status-badge wq-status-${report.status}`}>
                                            {report.status}
                                        </span>
                                    </div>

                                    {report.imageUrl && (
                                        <div className="report-images" style={{ marginTop: '12px' }}>
                                            <img
                                                src={report.imageUrl}
                                                alt="Report"
                                                className="report-thumbnail"
                                                onClick={() => {
                                                    setGalleryImages([report.imageUrl]);
                                                    setShowGallery(true);
                                                }}
                                            />
                                        </div>
                                    )}

                                    <p style={{ marginTop: '10px', color: 'var(--wq-text-secondary)' }}>
                                        {report.description}
                                    </p>
                                    <div className="wq-report-meta" style={{ marginTop: '8px' }}>
                                        Reported: {formatDate(report.createdAt)} • By: {report.userName || 'Anonymous'}
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                                        <button
                                            onClick={() => {
                                                setSelectedReport(report);
                                                setShowDetailModal(true);
                                            }}
                                            className="wq-btn wq-btn-outline"
                                            style={{ flex: 1 }}
                                        >
                                            View Details
                                        </button>
                                        {report.status === 'pending' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedReport(report);
                                                    setShowForwardModal(true);
                                                }}
                                                className="wq-btn wq-btn-primary"
                                                style={{ flex: 1 }}
                                            >
                                                Forward to Lab
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Detail Modal */}
            {showDetailModal && selectedReport && (
                <div className="wq-modal active" onClick={() => setShowDetailModal(false)}>
                    <div className="wq-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="wq-modal-header">
                            <h3 className="wq-modal-title">Report Details</h3>
                            <button className="wq-close-btn" onClick={() => setShowDetailModal(false)}>×</button>
                        </div>
                        <div>
                            <div style={{ marginBottom: '15px' }}>
                                <strong>Location:</strong> {selectedReport.village}
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <strong>Coordinates:</strong> {selectedReport.latitude}, {selectedReport.longitude}
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <strong>Severity:</strong>{' '}
                                <span style={{ color: getSeverityColor(selectedReport.severityLevel) }}>
                                    {selectedReport.severityLevel?.toUpperCase()}
                                </span>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <strong>Water Source:</strong> {selectedReport.waterSource}
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <strong>Description:</strong> {selectedReport.description}
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <strong>Status:</strong>{' '}
                                <span className={`wq-status-badge wq-status-${selectedReport.status}`}>
                                    {selectedReport.status}
                                </span>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <strong>Reported:</strong> {formatDate(selectedReport.createdAt)}
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <strong>Reported By:</strong> {selectedReport.userName || 'Anonymous'}
                            </div>

                            {selectedReport.imageUrl && (
                                <div style={{ marginBottom: '15px' }}>
                                    <strong>Photo:</strong>
                                    <img
                                        src={selectedReport.imageUrl}
                                        alt="Report"
                                        style={{ width: '100%', marginTop: '10px', borderRadius: '6px', cursor: 'pointer' }}
                                        onClick={() => {
                                            setGalleryImages([selectedReport.imageUrl]);
                                            setShowGallery(true);
                                        }}
                                    />
                                </div>
                            )}

                            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => handleUpdateStatus(selectedReport.id, 'verified')}
                                    className="wq-btn wq-btn-primary"
                                    style={{ flex: 1 }}
                                    disabled={selectedReport.status === 'verified'}
                                >
                                    Mark as Verified
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(selectedReport.id, 'resolved')}
                                    className="wq-btn wq-btn-success"
                                    style={{ flex: 1 }}
                                    disabled={selectedReport.status === 'resolved'}
                                >
                                    Mark as Resolved
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Forward Modal */}
            {showForwardModal && selectedReport && (
                <div className="wq-modal active" onClick={() => setShowForwardModal(false)}>
                    <div className="wq-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="wq-modal-header">
                            <h3 className="wq-modal-title">Forward to Water Lab</h3>
                            <button className="wq-close-btn" onClick={() => setShowForwardModal(false)}>×</button>
                        </div>
                        <div>
                            <div className="wq-form-group">
                                <label className="wq-form-label">Water Lab ID</label>
                                <input
                                    type="text"
                                    className="wq-form-input"
                                    placeholder="Enter lab ID"
                                    value={forwardData.labId}
                                    onChange={(e) => setForwardData({ ...forwardData, labId: e.target.value })}
                                />
                            </div>
                            <div className="wq-form-group">
                                <label className="wq-form-label">Priority</label>
                                <select
                                    className="wq-form-select"
                                    value={forwardData.priority}
                                    onChange={(e) => setForwardData({ ...forwardData, priority: e.target.value })}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div className="wq-form-group">
                                <label className="wq-form-label">Notes for Lab</label>
                                <textarea
                                    className="wq-form-textarea"
                                    placeholder="Add any special instructions or observations..."
                                    value={forwardData.notes}
                                    onChange={(e) => setForwardData({ ...forwardData, notes: e.target.value })}
                                    rows="4"
                                />
                            </div>
                            <button onClick={handleForwardToLab} className="wq-btn wq-btn-primary" style={{ width: '100%' }}>
                                Forward Report
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Gallery */}
            {showGallery && (
                <ImageGallery
                    images={galleryImages}
                    onClose={() => setShowGallery(false)}
                />
            )}
        </div>
    );
}
