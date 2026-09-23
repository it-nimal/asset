import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, Lock, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import logo from '../photos/VitromedLogo.png';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const toast = useToast();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!username.trim()) {
      setErrorMessage('Please enter your username or email address.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    try {
      const res = await login(username.trim(), password.trim());
      if (res && res.success) {
        toast.success(`Signed in as ${res.user?.name || 'Administrator'}`, 'Welcome');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Invalid credentials. Please verify your username and password.');
      toast.error(err.message || 'Authentication failed', 'Sign In Error');
    }
  };

  const handleFillAdmin = () => {
    setUsername('admin');
    setPassword('Admin@123');
    setErrorMessage('');
    toast.info('Admin credentials auto-filled', 'Quick Access');
  };

  return (
    <div className="login-viewport">
      <div className="login-container">
        {/* Company / Application Header */}
        <div className="login-brand-section">
          <div className="login-logo-wrapper">
            <img src={logo} alt="Vitromed Logo" className="login-brand-logo" />
          </div>
          <h1 className="login-brand-title">IT Asset Management</h1>
          <p className="login-brand-subtitle">Vitromed Healthcare Internal Portal</p>
        </div>

        {/* Login Card */}
        <div className="login-card">
          <div className="login-card-header">
            <h2 className="login-card-title">Welcome back</h2>
            <p className="login-card-desc">Sign in to your account to continue</p>
          </div>

          {/* Validation / Error Banner */}
          {errorMessage && (
            <div className="login-error-alert" role="alert">
              <AlertCircle size={16} className="login-error-icon" />
              <span className="login-error-text">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            {/* Username Field */}
            <div className="login-field-group">
              <label htmlFor="login-username" className="login-field-label">
                Email / Username
              </label>
              <div className="login-input-wrapper">
                <span className="login-input-icon">
                  <User size={16} />
                </span>
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="admin or username@vitromed.com"
                  autoComplete="username"
                  className="login-text-input"
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="login-field-group">
              <div className="login-label-split">
                <label htmlFor="login-password" className="login-field-label">
                  Password
                </label>
              </div>
              <div className="login-input-wrapper">
                <span className="login-input-icon">
                  <Lock size={16} />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="login-text-input has-toggle"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-password-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Options Row: Remember Me & Quick Helper */}
            <div className="login-options-bar">
              <label className="login-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="login-checkbox"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={handleFillAdmin}
                className="login-helper-link"
                title="Fill default admin credentials"
              >
                Auto-fill Admin
              </button>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="login-primary-btn"
            >
              {loading ? (
                <span className="login-btn-loading">
                  <span className="login-spinner" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Discreet Credentials Helper */}
          <div className="login-creds-hint">
            <span>Default Administrator: </span>
            <code>admin</code> / <code>Admin@123</code>
          </div>
        </div>

        {/* Security & Access Notice Footer */}
        <footer className="login-secure-footer">
          <div className="login-secure-badge">
            <ShieldCheck size={14} className="login-shield-icon" />
            <span>Secure access to IT Asset Management</span>
          </div>
          <p className="login-copyright">
            &copy; {new Date().getFullYear()} Vitromed Healthcare. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
