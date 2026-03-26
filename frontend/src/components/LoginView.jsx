import React, { useState } from "react";
import { LogoIcon } from './Icons';

export default function LoginView({ onBack, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeRole, setActiveRole] = useState("caregiver");
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    const endpoint = isRegistering ? "/api/register" : "/api/login";
    const bodyArgs = isRegistering ? { email, password, name, role: activeRole } : { email, password };

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyArgs)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setErrorMsg(data.error || "Authentication failed");
      } else {
        localStorage.setItem("token", data.token);
        onLogin(data.user.role);
      }
    } catch (error) {
      setErrorMsg("Failed to connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div id="login-screen">
        <div className="login-card">
          <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} className="login-back">← Back to home</a>
          <LogoIcon size={48} className="login-logo" style={{ display: 'block', margin: '0 auto 1rem auto' }} />
          <h1 className="login-title">Harmony Guardian</h1>
          <p className="login-subtitle">Sign in securely to access your dashboard</p>

          {errorMsg && <div id="login-error" className="login-error" style={{ display: 'block' }}>{errorMsg}</div>}

          <form id="login-form" onSubmit={handleAuth}>
            {isRegistering && (
              <div className="form-group">
                <label htmlFor="login-name">Full Name</label>
                <input type="text" id="login-name" className="login-input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            )}
            <div className="form-group">
              <label htmlFor="login-email">Email address</label>
              <input type="email" id="login-email" className="login-input" placeholder="ca@harmony.local" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <div className="login-input-wrap" style={{ display: 'flex' }}>
                <input type={showPassword ? "text" : "password"} id="login-password" className="login-input" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ flex: 1 }} />
                <button type="button" className="login-toggle-pw" onClick={() => setShowPassword(!showPassword)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginLeft: '-30px' }}>
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <div className="login-options">
              <label className="login-remember">
                <input type="checkbox" id="login-remember" />
                <span>Remember me</span>
              </label>
              <a href="#" className="login-forgot">Forgot password?</a>
            </div>

            <div className="role-selection">
              <div className={`role-btn ${activeRole === 'admin' ? 'active' : ''}`} onClick={() => setActiveRole('admin')}>
                <span className="role-icon">🛡️</span>
                <span className="role-name">Admin</span>
              </div>
              <div className={`role-btn ${activeRole === 'caregiver' ? 'active' : ''}`} onClick={() => setActiveRole('caregiver')}>
                <span className="role-icon">👨‍⚕️</span>
                <span className="role-name">Caregiver</span>
              </div>
              <div className={`role-btn ${activeRole === 'user' ? 'active' : ''}`} onClick={() => setActiveRole('user')}>
                <span className="role-icon">👤</span>
                <span className="role-name">User</span>
              </div>
            </div>

            <button type="submit" className="login-btn" id="login-submit-btn" disabled={isLoading}>
              {isLoading ? <span className="login-spinner" style={{display: 'inline-block'}}></span> : null}
              <span className="login-btn-text">{isLoading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Sign in')}</span>
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '14px' }}>
            {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); setIsRegistering(!isRegistering); setErrorMsg(""); }} style={{ color: 'var(--brand)', fontWeight: 'bold' }}>
              {isRegistering ? "Sign In" : "Create Account"}
            </a>
          </div>

          <p className="login-secure-note" style={{ marginTop: '1.5rem' }}>
            <span>🔒</span> Secure sign-in. Session ends when you close the browser.
          </p>
        </div>
      </div>
    </>
  );
}