import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/water-quality.css';
import axios from 'axios';
import ImageUpload from '../components/ImageUpload';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ASSAM_DISTRICTS = [
    'Kamrup', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Sonitpur', 'Tinsukia',
    'Barpeta', 'Cachar', 'Golaghat', 'Sivasagar', 'Dhemaji', 'Lakhimpur',
    'Darrang', 'Kokrajhar', 'Bongaigaon'
];

const SOURCE_TYPES = [
    'River', 'Pond', 'Lake', 'Well', 'Tube Well', 'Public Tap', 'Stream', 'Other'
];

export default function WaterQualityReport() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        problem: '',
        gpsLocation: '',
        locationName: '',
        district: '',
        severity: '',
        sourceType: '',
        pincode: '',
        contactNumber: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);
    const [uploadedImages, setUploadedImages] = useState([]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const getLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude.toFixed(6);
                const lng = position.coords.longitude.toFixed(6);
                setFormData({
                    ...formData,
                    gpsLocation: `${lat}, ${lng}`
                });
                setGettingLocation(false);
            },
            (error) => {
                alert('Unable to get location: ' + error.message);
                setGettingLocation(false);
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Parse GPS location
            const [lat, lng] = formData.gpsLocation.split(',').map(s => parseFloat(s.trim()));

            const reportData = {
                latitude: lat,
                longitude: lng,
                village: formData.locationName,
                contaminationType: 'other', // Map to backend enum
                waterSource: formData.sourceType.toLowerCase().replace(' ', '_'),
                severityLevel: formData.severity.toLowerCase(),
                description: formData.problem,
                reportedBy: null, // Anonymous for now
                userName: 'Anonymous',
                affectedPopulation: 0,
                // Add image URLs
                imageUrl: uploadedImages[0]?.url || null,
                imagePublicId: uploadedImages[0]?.public_id || null
            };

            await axios.post(`${API_URL}/reporting/report`, reportData);

            setSuccess(true);
            setTimeout(() => {
                navigate('/water-quality');
            }, 3000);
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('Error submitting report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const sendViaSMS = () => {
        const { problem, pincode, severity, sourceType } = formData;

        if (!problem || !severity || !sourceType) {
            alert('Please fill in at least Problem, Severity, and Source Type fields');
            return;
        }

        const message = `${problem} ${pincode || 'N/A'} ${severity} ${sourceType}`;
        const phoneNumber = '1234567890'; // Replace with actual SMS number
        const smsLink = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
        window.location.href = smsLink;
    };

    return (
        <div className="wq-container" style={{ background: 'var(--wq-bg-secondary)', minHeight: '100vh' }}>
            {/* Header */}
            <header className="wq-header">
                <div className="wq-header-content">
                    <div className="wq-logo">Water Quality Monitor</div>
                    <nav className="wq-nav">
                        <Link to="/water-quality">Home</Link>
                        <Link to="/water-quality/report" className="active">Report Issue</Link>
                        <Link to="/water-quality/login">Login</Link>
                    </nav>
                </div>
            </header>

            <main className="wq-container">
                <div className="wq-card" style={{ maxWidth: '700px', margin: '0 auto' }}>
                    <h1 className="wq-card-title" style={{ fontSize: '28px', marginBottom: '24px' }}>
                        Report Water Quality Issue
                    </h1>

                    <form onSubmit={handleSubmit}>
                        {/* Problem Description */}
                        <div className="wq-form-group">
                            <label className="wq-form-label">Problem Description *</label>
                            <textarea
                                name="problem"
                                className="wq-form-textarea"
                                placeholder="Describe the water quality issue you've observed..."
                                value={formData.problem}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* GPS Location */}
                        <div className="wq-form-group">
                            <label className="wq-form-label">GPS Location *</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    name="gpsLocation"
                                    className="wq-form-input"
                                    placeholder="Latitude, Longitude"
                                    value={formData.gpsLocation}
                                    readOnly
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={getLocation}
                                    className="wq-btn wq-btn-outline"
                                    disabled={gettingLocation}
                                >
                                    {gettingLocation ? 'Getting...' : 'Get Location'}
                                </button>
                            </div>
                            <small style={{ color: 'var(--wq-text-secondary)', fontSize: '12px' }}>
                                Click "Get Location" to automatically fill your current coordinates
                            </small>
                        </div>

                        {/* Manual Location */}
                        <div className="wq-form-group">
                            <label className="wq-form-label">Location Name *</label>
                            <input
                                type="text"
                                name="locationName"
                                className="wq-form-input"
                                placeholder="e.g., Near Gandhi Park, Guwahati"
                                value={formData.locationName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* District */}
                        <div className="wq-form-group">
                            <label className="wq-form-label">District *</label>
                            <select
                                name="district"
                                className="wq-form-select"
                                value={formData.district}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select district...</option>
                                {ASSAM_DISTRICTS.map(district => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </select>
                        </div>

                        {/* Severity */}
                        <div className="wq-form-group">
                            <label className="wq-form-label">Severity Level *</label>
                            <select
                                name="severity"
                                className="wq-form-select"
                                value={formData.severity}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select severity...</option>
                                <option value="safe">Safe - No issues detected</option>
                                <option value="caution">Caution - Minor concerns</option>
                                <option value="unsafe">Unsafe - Significant contamination</option>
                                <option value="critical">Critical - Immediate danger</option>
                            </select>
                        </div>

                        {/* Type of Source */}
                        <div className="wq-form-group">
                            <label className="wq-form-label">Type of Water Source *</label>
                            <select
                                name="sourceType"
                                className="wq-form-select"
                                value={formData.sourceType}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select source type...</option>
                                {SOURCE_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* Pin Code */}
                        <div className="wq-form-group">
                            <label className="wq-form-label">Pin Code</label>
                            <input
                                type="text"
                                name="pincode"
                                className="wq-form-input"
                                placeholder="e.g., 781001"
                                pattern="[0-9]{6}"
                                maxLength="6"
                                value={formData.pincode}
                                onChange={handleChange}
                            />
                            <small style={{ color: 'var(--wq-text-secondary)', fontSize: '12px' }}>
                                Optional - 6 digit pin code
                            </small>
                        </div>

                        {/* Contact Number */}
                        <div className="wq-form-group">
                            <label className="wq-form-label">Contact Number (Optional)</label>
                            <input
                                type="tel"
                                name="contactNumber"
                                className="wq-form-input"
                                placeholder="Your phone number for updates"
                                value={formData.contactNumber}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="wq-form-group">
                            <label className="wq-form-label">Upload Photos (Optional)</label>
                            <ImageUpload
                                onImagesChange={setUploadedImages}
                                maxImages={3}
                            />
                            <small style={{ color: 'var(--wq-text-secondary)', fontSize: '12px' }}>
                                Upload up to 3 photos of the water quality issue
                            </small>
                        </div>

                        {/* Submit Buttons */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <button
                                type="submit"
                                className="wq-btn wq-btn-primary"
                                style={{ flex: 1 }}
                                disabled={loading}
                            >
                                {loading ? 'Submitting...' : 'Submit Report'}
                            </button>
                            <button
                                type="button"
                                onClick={sendViaSMS}
                                className="wq-btn wq-btn-outline"
                                style={{ flex: 1 }}
                            >
                                Send via SMS
                            </button>
                        </div>
                    </form>

                    {success && (
                        <div className="wq-alert wq-alert-success" style={{ marginTop: '20px' }}>
                            <strong>Report submitted successfully!</strong> Your report has been recorded and will be reviewed by the PHC.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
