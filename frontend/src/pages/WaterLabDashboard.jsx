import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/water-quality.css';
import axios from 'axios';
import ImageGallery from '../components/ImageGallery';
import ImageUpload from '../components/ImageUpload';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function WaterLabDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [showTestForm, setShowTestForm] = useState(false);
    const [testData, setTestData] = useState({
        contaminationType: '',
        arsenicLevel: '',
        fluorideLevel: '',
        pH: '',
        turbidity: '',
        bacteriaLevel: '',
        testDate: new Date().toISOString().split('T')[0],
        recommendations: '',
        finalStatus: 'contaminated'
    });
    const [testReportPdf, setTestReportPdf] = useState([]);
    const [galleryImages, setGalleryImages] = useState([]);
    const [showGallery, setShowGallery] = useState(false);

    useEffect(() => {
        // Check authentication
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
        if (!currentUser || currentUser.role !== 'waterlab') {
            navigate('/water-quality/login');
            return;
        }
        setUser(currentUser);
        loadReports(currentUser.id);
    }, [navigate]);

    const loadReports = async (labId) => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/labs/reports?labId=${labId}`);
            const allReports = response.data.reports || [];
            setReports(allReports);
        } catch (error) {
            console.error('Error loading reports:', error);
            // If endpoint doesn't exist, show empty state
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitTestResults = async () => {
        if (!testData.contaminationType) {
            alert('Please select contamination type');
            return;
        }

        try {
            const testResults = {
                reportId: selectedReport.id,
                contaminationType: testData.contaminationType,
                levels: {
                    arsenic: parseFloat(testData.arsenicLevel) || 0,
                    fluoride: parseFloat(testData.fluorideLevel) || 0,
                    pH: parseFloat(testData.pH) || 7,
                    turbidity: parseFloat(testData.turbidity) || 0,
                    bacteria: parseFloat(testData.bacteriaLevel) || 0
                },
                testDate: testData.testDate,
                pdfUrl: testReportPdf[0]?.url || null,
                finalStatus: testData.finalStatus,
                recommendations: testData.recommendations
            };

            await axios.post(`${API_URL}/labs/test-results`, testResults);

            alert('Test results submitted successfully!');
            setShowTestForm(false);
            setTestData({
                contaminationType: '',
                arsenicLevel: '',
                fluorideLevel: '',
                pH: '',
                turbidity: '',
                bacteriaLevel: '',
                testDate: new Date().toISOString().split('T')[0],
                recommendations: '',
                finalStatus: 'contaminated'
            });
            setTestReportPdf([]);
            loadReports(user.id);
        } catch (error) {
            console.error('Error submitting test results:', error);
            alert('Error submitting test results. Please try again.');
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

    const pendingTests = reports.filter(r => r.status === 'testing' || r.status === 'pending').length;

    return (
        <div className="wq-container" style={{ background: 'var(--wq-bg-secondary)', minHeight: '100vh' }}>
            {/* Header */}
            <header className="wq-header">
                <div className="wq-header-content">
                    <div className="wq-logo">Water Lab Dashboard - {user.facilityName}</div>
                    <nav className="wq-nav">
                        <Link to="/water-quality">Home</Link>
                        <Link to="/water-quality/lab-dashboard" className="active">Dashboard</Link>
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
                <div className="wq-card wq-mb-20">
                    <div className="wq-stat-card" style={{ textAlign: 'center' }}>
                        <div className="wq-stat-value" style={{ color: 'var(--wq-warning)' }}>{pendingTests}</div>
                        <div className="wq-stat-label">Pending Tests</div>
                    </div>
                </div>

                {/* Reports List */}
                <div className="wq-card">
                    <h2 className="wq-card-title">Assigned Reports ({reports.length})</h2>
                    {loading ? (
                        <p style={{ color: 'var(--wq-text-secondary)' }}>Loading reports...</p>
                    ) : reports.length === 0 ? (
                        <div className="wq-alert wq-alert-info">
                            <p>No reports have been forwarded to your lab yet.</p>
                            <p style={{ marginTop: '8px', fontSize: '14px' }}>
                                Reports will appear here when PHCs forward water quality issues for testing.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '15px' }}>
                            {reports.map(report => (
                                <div key={report.id} className="wq-card" style={{ padding: '20px', background: 'var(--wq-bg-secondary)' }}>
                                    {/* Report Header */}
                                    <div className="wq-report-header" style={{ marginBottom: '15px' }}>
                                        <div className="wq-report-info">
                                            <div className="wq-report-location">{report.village}</div>
                                            <div className="wq-report-meta">
                                                <span style={{ color: getSeverityColor(report.severityLevel) }}>
                                                    ● {report.severityLevel?.toUpperCase()}
                                                </span>
                                                {' • '}
                                                {report.waterSource}
                                                {' • '}
                                                {report.district}
                                            </div>
                                        </div>
                                        <span className={`wq-status-badge wq-status-${report.status}`}>
                                            {report.status}
                                        </span>
                                    </div>

                                    {/* Report Details */}
                                    <div style={{ marginBottom: '15px' }}>
                                        <strong>Description:</strong>
                                        <p style={{ color: 'var(--wq-text-secondary)', marginTop: '5px' }}>
                                            {report.description}
                                        </p>
                                    </div>

                                    {/* PHC Notes */}
                                    {report.forwardNotes && (
                                        <div style={{ marginBottom: '15px', padding: '12px', background: 'var(--wq-bg)', borderRadius: '6px' }}>
                                            <strong>PHC Notes:</strong>
                                            <p style={{ color: 'var(--wq-text-secondary)', marginTop: '5px' }}>
                                                {report.forwardNotes}
                                            </p>
                                            {report.priority && (
                                                <div style={{ marginTop: '8px' }}>
                                                    <span className={`wq-status-badge wq-status-${report.priority === 'high' ? 'danger' : report.priority === 'medium' ? 'warning' : 'success'}`}>
                                                        {report.priority.toUpperCase()} PRIORITY
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Image */}
                                    {report.imageUrl && (
                                        <div style={{ marginBottom: '15px' }}>
                                            <strong>Photo:</strong>
                                            <img
                                                src={report.imageUrl}
                                                alt="Report"
                                                className="report-thumbnail"
                                                style={{ marginTop: '8px', cursor: 'pointer' }}
                                                onClick={() => {
                                                    setGalleryImages([report.imageUrl]);
                                                    setShowGallery(true);
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Metadata */}
                                    <div className="wq-report-meta" style={{ marginBottom: '15px' }}>
                                        Forwarded: {formatDate(report.forwardedAt || report.createdAt)}
                                        {' • '}
                                        Coordinates: {report.latitude}, {report.longitude}
                                    </div>

                                    {/* Test Results Form */}
                                    {showTestForm && selectedReport?.id === report.id ? (
                                        <div className="test-results-form" style={{ marginTop: '20px', padding: '20px', background: 'var(--wq-bg)', borderRadius: '8px' }}>
                                            <h3 style={{ marginBottom: '15px' }}>Submit Test Results</h3>

                                            <div className="wq-form-group">
                                                <label className="wq-form-label">Contamination Type *</label>
                                                <select
                                                    className="wq-form-select"
                                                    value={testData.contaminationType}
                                                    onChange={(e) => setTestData({ ...testData, contaminationType: e.target.value })}
                                                >
                                                    <option value="">Select type...</option>
                                                    <option value="arsenic">Arsenic</option>
                                                    <option value="fluoride">Fluoride</option>
                                                    <option value="bacteria">Bacteria</option>
                                                    <option value="turbidity">Turbidity</option>
                                                    <option value="heavy_metals">Heavy Metals</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>

                                            <div className="levels-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                                                <div className="wq-form-group">
                                                    <label className="wq-form-label">Arsenic (ppm)</label>
                                                    <input
                                                        type="number"
                                                        step="0.001"
                                                        className="wq-form-input"
                                                        value={testData.arsenicLevel}
                                                        onChange={(e) => setTestData({ ...testData, arsenicLevel: e.target.value })}
                                                    />
                                                </div>
                                                <div className="wq-form-group">
                                                    <label className="wq-form-label">Fluoride (ppm)</label>
                                                    <input
                                                        type="number"
                                                        step="0.001"
                                                        className="wq-form-input"
                                                        value={testData.fluorideLevel}
                                                        onChange={(e) => setTestData({ ...testData, fluorideLevel: e.target.value })}
                                                    />
                                                </div>
                                                <div className="wq-form-group">
                                                    <label className="wq-form-label">pH Level</label>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        className="wq-form-input"
                                                        value={testData.pH}
                                                        onChange={(e) => setTestData({ ...testData, pH: e.target.value })}
                                                    />
                                                </div>
                                                <div className="wq-form-group">
                                                    <label className="wq-form-label">Turbidity (NTU)</label>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        className="wq-form-input"
                                                        value={testData.turbidity}
                                                        onChange={(e) => setTestData({ ...testData, turbidity: e.target.value })}
                                                    />
                                                </div>
                                                <div className="wq-form-group">
                                                    <label className="wq-form-label">Bacteria (CFU/100ml)</label>
                                                    <input
                                                        type="number"
                                                        className="wq-form-input"
                                                        value={testData.bacteriaLevel}
                                                        onChange={(e) => setTestData({ ...testData, bacteriaLevel: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="wq-form-group">
                                                <label className="wq-form-label">Test Date *</label>
                                                <input
                                                    type="date"
                                                    className="wq-form-input"
                                                    value={testData.testDate}
                                                    onChange={(e) => setTestData({ ...testData, testDate: e.target.value })}
                                                />
                                            </div>

                                            <div className="wq-form-group">
                                                <label className="wq-form-label">Upload Test Report PDF (Optional)</label>
                                                <ImageUpload
                                                    onImagesChange={setTestReportPdf}
                                                    maxImages={1}
                                                />
                                            </div>

                                            <div className="wq-form-group">
                                                <label className="wq-form-label">Final Status *</label>
                                                <select
                                                    className="wq-form-select"
                                                    value={testData.finalStatus}
                                                    onChange={(e) => setTestData({ ...testData, finalStatus: e.target.value })}
                                                >
                                                    <option value="contaminated">Contaminated</option>
                                                    <option value="clean">Clean</option>
                                                </select>
                                            </div>

                                            <div className="wq-form-group">
                                                <label className="wq-form-label">Recommendations</label>
                                                <textarea
                                                    className="wq-form-textarea"
                                                    rows="4"
                                                    placeholder="Add recommendations for treatment or precautions..."
                                                    value={testData.recommendations}
                                                    onChange={(e) => setTestData({ ...testData, recommendations: e.target.value })}
                                                />
                                            </div>

                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button
                                                    onClick={handleSubmitTestResults}
                                                    className="wq-btn wq-btn-primary"
                                                    style={{ flex: 1 }}
                                                >
                                                    Submit Results
                                                </button>
                                                <button
                                                    onClick={() => setShowTestForm(false)}
                                                    className="wq-btn wq-btn-outline"
                                                    style={{ flex: 1 }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setSelectedReport(report);
                                                setShowTestForm(true);
                                            }}
                                            className="wq-btn wq-btn-primary"
                                            style={{ width: '100%' }}
                                            disabled={report.status === 'verified' || report.status === 'clean'}
                                        >
                                            {report.status === 'verified' || report.status === 'clean' ? 'Test Completed' : 'Add Test Results'}
                                        </button>
                                    )}

                                    {/* Show existing test results if available */}
                                    {report.testResults && (
                                        <div style={{ marginTop: '15px', padding: '15px', background: 'var(--wq-bg)', borderRadius: '6px' }}>
                                            <h4 style={{ marginBottom: '10px' }}>Test Results</h4>
                                            <div style={{ fontSize: '14px', color: 'var(--wq-text-secondary)' }}>
                                                <p><strong>Type:</strong> {report.testResults.contaminationType}</p>
                                                <p><strong>Status:</strong> <span className={`wq-status-badge wq-status-${report.status}`}>{report.status}</span></p>
                                                <p><strong>Test Date:</strong> {formatDate(report.testResults.testDate)}</p>
                                                {report.testResults.recommendations && (
                                                    <p><strong>Recommendations:</strong> {report.testResults.recommendations}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

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
