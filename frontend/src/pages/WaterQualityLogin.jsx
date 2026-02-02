import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/water-quality.css';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ASSAM_DISTRICTS = [
    'Kamrup', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Sonitpur', 'Tinsukia',
    'Barpeta', 'Cachar', 'Golaghat', 'Sivasagar', 'Dhemaji', 'Lakhimpur',
    'Darrang', 'Kokrajhar', 'Bongaigaon', 'Karbi Anglong', 'Dima Hasao',
    'Goalpara', 'Dhubri', 'Morigaon'
];

export default function WaterQualityLogin() {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [registerData, setRegisterData] = useState({
        accountType: '',
        email: '',
        password: '',
        confirmPassword: '',
        facilityName: '',
        district: ''
    });
    const [loading, setLoading] = useState(false);

    const handleLoginChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handleRegisterChange = (e) => {
        setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/auth/login`, loginData);
            const user = response.data;

            // Save user session
            sessionStorage.setItem('currentUser', JSON.stringify(user));

            // Redirect based on account type
            if (user.accountType === 'phc' || user.role === 'phc') {
                navigate('/water-quality/phc-dashboard');
            } else if (user.accountType === 'waterlab' || user.role === 'waterlab') {
                navigate('/water-quality/lab-dashboard');
            } else {
                navigate('/water-quality');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Invalid email or password!');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (registerData.password !== registerData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        setLoading(true);

        try {
            const userData = {
                email: registerData.email,
                password: registerData.password,
                role: registerData.accountType,
                facilityName: registerData.facilityName,
                district: registerData.district
            };

            await axios.post(`${API_URL}/auth/register`, userData);

            alert('Registration successful! You can now login.');
            setIsLogin(true);
            setRegisterData({
                accountType: '',
                email: '',
                password: '',
                confirmPassword: '',
                facilityName: '',
                district: ''
            });
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed. Email may already be in use.');
        } finally {
            setLoading(false);
        }
    };

    const getFacilityLabel = () => {
        if (registerData.accountType === 'phc') return 'PHC Name *';
        if (registerData.accountType === 'waterlab') return 'Water Lab Name *';
        return 'PHC/Lab Name *';
    };

    const getFacilityPlaceholder = () => {
        if (registerData.accountType === 'phc') return 'Enter PHC name';
        if (registerData.accountType === 'waterlab') return 'Enter Water Lab name';
        return 'Enter facility name';
    };

    return (
        <div className="wq-container" style={{ background: 'var(--wq-bg-secondary)', minHeight: '100vh' }}>
            {/* Header */}
            <header className="wq-header">
                <div className="wq-header-content">
                    <div className="wq-logo">Water Quality Monitor</div>
                    <nav className="wq-nav">
                        <Link to="/water-quality">Home</Link>
                        <Link to="/water-quality/report">Report Issue</Link>
                        <Link to="/water-quality/login" className="active">Login</Link>
                    </nav>
                </div>
            </header>

            <main className="wq-container">
                <div className="wq-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
                    <h1 className="wq-card-title wq-text-center" style={{ fontSize: '28px', marginBottom: '24px' }}>
                        {isLogin ? 'Login' : 'Register'}
                    </h1>

                    {/* Login Form */}
                    {isLogin ? (
                        <form onSubmit={handleLogin}>
                            <div className="wq-form-group">
                                <label className="wq-form-label">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="wq-form-input"
                                    placeholder="your.email@example.com"
                                    value={loginData.email}
                                    onChange={handleLoginChange}
                                    required
                                />
                            </div>

                            <div className="wq-form-group">
                                <label className="wq-form-label">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="wq-form-input"
                                    placeholder="Enter your password"
                                    value={loginData.password}
                                    onChange={handleLoginChange}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="wq-btn wq-btn-primary"
                                style={{ width: '100%', marginBottom: '12px' }}
                                disabled={loading}
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsLogin(false)}
                                className="wq-btn wq-btn-outline"
                                style={{ width: '100%' }}
                            >
                                Create New Account
                            </button>
                        </form>
                    ) : (
                        /* Registration Form */
                        <form onSubmit={handleRegister}>
                            <div className="wq-form-group">
                                <label className="wq-form-label">Account Type *</label>
                                <select
                                    name="accountType"
                                    className="wq-form-select"
                                    value={registerData.accountType}
                                    onChange={handleRegisterChange}
                                    required
                                >
                                    <option value="">Select account type...</option>
                                    <option value="phc">Primary Health Center (PHC)</option>
                                    <option value="waterlab">Water Treatment Lab</option>
                                </select>
                            </div>

                            <div className="wq-form-group">
                                <label className="wq-form-label">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="wq-form-input"
                                    placeholder="your.email@example.com"
                                    value={registerData.email}
                                    onChange={handleRegisterChange}
                                    required
                                />
                            </div>

                            <div className="wq-form-group">
                                <label className="wq-form-label">Password *</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="wq-form-input"
                                    placeholder="Create a strong password"
                                    minLength="6"
                                    value={registerData.password}
                                    onChange={handleRegisterChange}
                                    required
                                />
                            </div>

                            <div className="wq-form-group">
                                <label className="wq-form-label">Confirm Password *</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className="wq-form-input"
                                    placeholder="Re-enter your password"
                                    minLength="6"
                                    value={registerData.confirmPassword}
                                    onChange={handleRegisterChange}
                                    required
                                />
                            </div>

                            <div className="wq-form-group">
                                <label className="wq-form-label">{getFacilityLabel()}</label>
                                <input
                                    type="text"
                                    name="facilityName"
                                    className="wq-form-input"
                                    placeholder={getFacilityPlaceholder()}
                                    value={registerData.facilityName}
                                    onChange={handleRegisterChange}
                                    required
                                />
                            </div>

                            <div className="wq-form-group">
                                <label className="wq-form-label">District of Assam *</label>
                                <select
                                    name="district"
                                    className="wq-form-select"
                                    value={registerData.district}
                                    onChange={handleRegisterChange}
                                    required
                                >
                                    <option value="">Select district...</option>
                                    {ASSAM_DISTRICTS.map(district => (
                                        <option key={district} value={district}>{district}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="wq-btn wq-btn-primary"
                                style={{ width: '100%', marginBottom: '12px' }}
                                disabled={loading}
                            >
                                {loading ? 'Registering...' : 'Register'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsLogin(true)}
                                className="wq-btn wq-btn-outline"
                                style={{ width: '100%' }}
                            >
                                Already have an account? Login
                            </button>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
}
