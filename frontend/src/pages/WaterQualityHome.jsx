import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/water-quality.css';
import axios from 'axios';
import ImageGallery from '../components/ImageGallery';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ASSAM_DISTRICTS = [
    'Kamrup', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Sonitpur', 'Tinsukia',
    'Barpeta', 'Cachar', 'Golaghat', 'Sivasagar', 'Dhemaji', 'Lakhimpur',
    'Darrang', 'Kokrajhar', 'Bongaigaon'
];

export default function WaterQualityHome() {
    const [stats, setStats] = useState({ total: 0, active: 0, resolved: 0 });
    const [recentReports, setRecentReports] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [galleryImages, setGalleryImages] = useState([]);
    const [showGallery, setShowGallery] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            // Fetch reports from the LUIT backend
            const response = await axios.get(`${API_URL}/reports`);
            const reports = response.data || [];

            // Calculate statistics
            const total = reports.length;
            const active = reports.filter(r =>
                r.status === 'pending' || r.status === 'contaminated' || r.status === 'pending-verification'
            ).length;
            const resolved = reports.filter(r => r.status === 'clean' || r.status === 'resolved').length;

            setStats({ total, active, resolved });
            setRecentReports(reports.slice(0, 5));
        } catch (error) {
            console.error('Error loading data:', error);
            // Use sample data if API fails
            setStats({ total: 0, active: 0, resolved: 0 });
            setRecentReports([]);
        } finally {
            setLoading(false);
        }
    };

    const checkAreaStatus = async () => {
        if (!selectedDistrict) {
            alert('Please select a district');
            return;
        }

        try {
            const response = await axios.get(`${API_URL}/reports`);
            const reports = response.data || [];
            const districtReports = reports.filter(
                r => r.district === selectedDistrict && r.status !== 'clean' && r.status !== 'resolved'
            );

            if (districtReports.length === 0) {
                setModalContent({
                    type: 'success',
                    title: '✓ Area is Clean',
                    message: `No active contamination reports in ${selectedDistrict} district. Water sources are safe to use.`,
                    reports: []
                });
            } else {
                setModalContent({
                    type: 'danger',
                    title: '⚠ Area is Contaminated',
                    message: `${districtReports.length} active contamination report(s) in ${selectedDistrict} district.`,
                    reports: districtReports
                });
            }
            setShowModal(true);
        } catch (error) {
            console.error('Error checking area status:', error);
            alert('Error checking area status. Please try again.');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="wq-container" style={{ background: 'var(--wq-bg-secondary)', minHeight: '100vh' }}>
            {/* Header */}
            <header className="wq-header">
                <div className="wq-header-content">
                    <div className="wq-logo">Water Quality Monitor</div>
                    <nav className="wq-nav">
                        <Link to="/water-quality" className="active">Home</Link>
                        <Link to="/water-quality/report">Report Issue</Link>
                        <Link to="/water-quality/login">Login</Link>
                    </nav>
                </div>
            </header>

            <main className="wq-container">
                {/* Welcome Section */}
                <div className="wq-card wq-text-center wq-mb-20">
                    <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>Welcome to Water Quality Monitor</h1>
                    <p style={{ fontSize: '18px', color: 'var(--wq-text-secondary)', maxWidth: '700px', margin: '0 auto' }}>
                        A community-driven platform to monitor, report, and resolve water contamination issues across Assam.
                        Together, we can ensure clean and safe water for everyone.
                    </p>
                </div>

                {/* About Section */}
                <div className="wq-card wq-mb-20">
                    <h2 className="wq-card-title">About the App</h2>
                    <p style={{ marginBottom: '12px' }}>
                        This platform connects citizens, Primary Health Centers (PHC), and Water Treatment Labs to:
                    </p>
                    <ul style={{ marginLeft: '20px', color: 'var(--wq-text-secondary)' }}>
                        <li>Report water contamination issues in real-time</li>
                        <li>Track active contamination reports by district</li>
                        <li>Alert communities about unsafe water sources</li>
                        <li>Coordinate testing and treatment solutions</li>
                        <li>Monitor cleanup progress and maintain historical records</li>
                    </ul>
                </div>

                {/* Area Status Check */}
                <div className="wq-card wq-mb-20">
                    <h2 className="wq-card-title">Check Your Area Status</h2>
                    <div className="wq-form-group">
                        <label className="wq-form-label">Select District</label>
                        <select
                            className="wq-form-select"
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                        >
                            <option value="">Choose a district...</option>
                            {ASSAM_DISTRICTS.map(district => (
                                <option key={district} value={district}>{district}</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={checkAreaStatus} className="wq-btn wq-btn-primary">Check Status</button>
                </div>

                {/* Statistics */}
                <div className="wq-grid wq-grid-3 wq-mb-20">
                    <div className="wq-stat-card">
                        <div className="wq-stat-value">{loading ? '...' : stats.total}</div>
                        <div className="wq-stat-label">Total Reports</div>
                    </div>
                    <div className="wq-stat-card">
                        <div className="wq-stat-value">{loading ? '...' : stats.active}</div>
                        <div className="wq-stat-label">Active Reports</div>
                    </div>
                    <div className="wq-stat-card">
                        <div className="wq-stat-value">{loading ? '...' : stats.resolved}</div>
                        <div className="wq-stat-label">Resolved Issues</div>
                    </div>
                </div>

                {/* Recent Reports */}
                <div className="wq-card wq-mb-20">
                    <h2 className="wq-card-title">Recent Reported Issues</h2>
                    <div>
                        {loading ? (
                            <p style={{ color: 'var(--wq-text-secondary)' }}>Loading reports...</p>
                        ) : recentReports.length === 0 ? (
                            <p style={{ color: 'var(--wq-text-secondary)' }}>No reports yet. Be the first to report an issue!</p>
                        ) : (
                            recentReports.map(report => (
                                <div key={report.id} className="wq-report-item">
                                    <div className="wq-report-header">
                                        <div className="wq-report-info">
                                            <div className="wq-report-location">{report.location || report.locationName}</div>
                                            <div className="wq-report-meta">
                                                {report.district} • {report.severity} Severity • {report.sourceType}
                                            </div>
                                        </div>
                                        <span className={`wq-status-badge wq-status-${report.status}`}>{report.status}</span>
                                    </div>

                                    {/* Display image if available */}
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

                                    <p style={{ marginBottom: '8px', color: 'var(--wq-text-secondary)' }}>{report.problem || report.description}</p>
                                    <div className="wq-report-meta">Reported: {formatDate(report.timestamp || report.createdAt)}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Report Button */}
                <div className="wq-text-center">
                    <Link to="/water-quality/report" className="wq-btn wq-btn-primary" style={{ fontSize: '16px', padding: '14px 32px' }}>
                        Report a Water Quality Issue
                    </Link>
                </div>
            </main>

            {/* Status Modal */}
            {showModal && (
                <div className="wq-modal active" onClick={() => setShowModal(false)}>
                    <div className="wq-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="wq-modal-header">
                            <h3 className="wq-modal-title">Area Status</h3>
                            <button className="wq-close-btn" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <div>
                            <div className={`wq-alert wq-alert-${modalContent.type}`}>
                                <h3 style={{ marginBottom: '8px' }}>{modalContent.title}</h3>
                                <p>{modalContent.message}</p>
                            </div>
                            {modalContent.reports.length > 0 && (
                                <div style={{ marginTop: '16px' }}>
                                    <h4 style={{ marginBottom: '12px' }}>Active Reports:</h4>
                                    {modalContent.reports.map(r => (
                                        <div key={r.id} style={{ padding: '12px', background: 'var(--wq-bg-secondary)', borderRadius: '6px', marginBottom: '8px' }}>
                                            <div style={{ fontWeight: 600 }}>{r.location || r.locationName}</div>
                                            <div style={{ fontSize: '14px', color: 'var(--wq-text-secondary)' }}>{r.problem || r.description}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--wq-text-secondary)', marginTop: '4px' }}>
                                                {r.severity} Severity • {r.sourceType}
                                            </div>
                                        </div>
                                    ))}
                                    <p style={{ marginTop: '16px', fontSize: '14px', color: 'var(--wq-text-secondary)' }}>
                                        Please avoid using water from these sources until they are marked as clean.
                                    </p>
                                </div>
                            )}
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
