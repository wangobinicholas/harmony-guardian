import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { LogoIcon, HomeIcon, PhoneIcon, HeartPulseIcon, LungsIcon, EmergencyIcon, LogoutIcon } from './Icons';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default function UserDashboard({ onLogout, role }) {
  const [vitals, setVitals] = useState({ heartRate: '--', spo2: '--', status: 'Connecting...' });
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'contact', 'settings'
  const [isConnected, setIsConnected] = useState(false);

  // Intervention State
  const [timeLeft, setTimeLeft] = useState(60);
  const [isBreathing, setIsBreathing] = useState(false);
  const timerRef = React.useRef(null);

  // Auto-reset breathing if status normalizes
  useEffect(() => {
    if (vitals.status === 'Normal') {
      setIsBreathing(false);
      clearTimeout(timerRef.current);
    }
  }, [vitals.status]);

  useEffect(() => {
    if (isBreathing && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsBreathing(false);
    }
    return () => clearTimeout(timerRef.current);
  }, [isBreathing, timeLeft]);

  const toggleBreathing = () => {
    if (isBreathing) {
      setIsBreathing(false);
      clearTimeout(timerRef.current);
    } else {
      if (timeLeft === 0) setTimeLeft(60);
      setIsBreathing(true);
    }
  };

  useEffect(() => {
    const fetchVitals = async () => {
      if (!isConnected) {
        setVitals(prev => ({ ...prev, status: 'Offline' }));
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/vitals`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) {
          if (res.status === 401) onLogout();
          return;
        }
        const data = await res.json();
        setVitals(data);
      } catch (err) {
        console.error('Failed to fetch vitals');
      }
    };

    const fetchHistory = async () => {
      if (!isConnected) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/history`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setHistory(data.map(v => ({ 
            time: v.timeStr || new Date(v.recordedAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), 
            heartRate: v.heartRate,
            spo2: v.spo2
          })));
        }
      } catch (err) {}
    };
    
    fetchVitals();
    fetchHistory();
    const interval = setInterval(fetchVitals, 5000);
    const histInterval = setInterval(fetchHistory, 10000);
    return () => { clearInterval(interval); clearInterval(histInterval); };
  }, [onLogout, isConnected]);

  // Active Ingestion Simulator (ESP32 Mock)
  useEffect(() => {
    let simulatorInterval;
    if (isConnected) {
      const pushData = async () => {
        const heart_rate = Math.floor(Math.random() * (105 - 65 + 1)) + 65; // realistic HR
        const spo2 = Math.floor(Math.random() * (100 - 95 + 1)) + 95;
        const motion = Math.random() * 2;
        const gsr = Math.floor(Math.random() * (600 - 300 + 1)) + 300;
        
        try {
          await fetch(`${API_BASE_URL}/api/sensor/data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              device_id: 'HG-ESP32-SIM',
              heart_rate,
              spo2,
              motion,
              gsr,
              timestamp: new Date().toISOString()
            })
          });
        } catch (err) {
          console.error('Simulator failed to post data', err);
        }
      };

      // Push immediately on connect
      pushData();
      
      // Simulate real hardware pushing every 5 seconds
      simulatorInterval = setInterval(pushData, 5000);
    }
    return () => clearInterval(simulatorInterval);
  }, [isConnected]);

  const requestHelp = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/action`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ action: 'help_requested', description: 'Patient requested immediate assistance.' })
      });
      alert('Help request sent to your caregiver.');
    } catch (e) {
      alert('Failed to send request.');
    }
  };

  return (
    <div className="dashboard-view" style={{ display: 'flex' }}>
      {/* Light Sidebar for User */}
      <aside className="sidebar" style={{ width: '200px' }}>
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <LogoIcon size={32} />
          <div className="brand-name" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>My Harmony</div>
        </div>

        <nav className="sidebar-nav">
          <div className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')} role="button">
            <span className="nav-icon"><HomeIcon size={18} /></span>
            <span>My Status</span>
          </div>
          <div className={`nav-item ${activeTab === 'contact' ? 'active' : ''}`} onClick={() => setActiveTab('contact')} role="button">
            <span className="nav-icon"><PhoneIcon size={18} /></span>
            <span>Contact Help</span>
          </div>
        </nav>
        
        <button type="button" className="logout-btn" onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          <LogoutIcon size={18} /> Log out
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="main-container" style={{ backgroundColor: 'var(--bg-main)', padding: '2rem' }}>
        <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Hello, Patient!</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button onClick={() => setIsConnected(!isConnected)} className={isConnected ? "action-btn outline" : "action-btn"} style={{ padding: '0.4rem 0.8rem', cursor: 'pointer', borderRadius: '8px', fontSize: '0.9rem' }}>
              {isConnected ? "Disconnect Wearable" : "Connect Wearable"}
            </button>
            <div className={`status-badge ${vitals.status === 'Emergency' ? 'emergency' : vitals.status === 'Warning' ? 'warning' : 'normal'}`} style={{ fontSize: '1.1rem', padding: '0.5rem 1rem' }}>
              Feeling: {isConnected ? (vitals.status === 'Normal' ? 'Calm 😌' : vitals.status === 'Emergency' ? 'Overwhelmed 😟' : vitals.status === 'Warning' ? 'Elevated 😐' : 'Okay 😐') : 'Offline ⏸️'}
            </div>
          </div>
        </header>

        {/* Dynamic Intervention UI based on Product Guidelines */}
        {(vitals.status === 'Emergency' || vitals.status === 'Warning') && isConnected && (
          <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', border: '2px solid var(--w-brand)', padding: '2rem', borderRadius: '16px', marginBottom: '2rem', textAlign: 'center', transition: 'all 0.5s ease' }}>
            <h2 style={{ color: 'var(--w-brand)', marginBottom: '0.5rem', fontSize: '1.8rem' }}>You're safe. Let's slow your breathing.</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>We noticed you might be feeling overwhelmed. Tap start to regulate your breath with me.</p>
            
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'var(--bg-elevated)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
              <div style={{ 
                width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'var(--w-brand)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem',
                transform: isBreathing ? `scale(${1 + (timeLeft % 4 < 2 ? 0.3 : 0)})` : 'scale(1)', transition: 'transform 2s ease-in-out', boxShadow: isBreathing && timeLeft % 4 < 2 ? '0 0 30px rgba(56, 189, 248, 0.6)' : 'none'
              }}>
                0:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '1rem', minHeight: '1.5rem' }}>
                {isBreathing ? (timeLeft % 4 < 2 ? "Breathe In..." : "Breathe Out...") : ""}
              </div>
              <button onClick={toggleBreathing} style={{ backgroundColor: 'var(--w-brand)', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', outline: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                {isBreathing ? "Pause" : timeLeft === 0 ? "Restart" : "Start Recovery"}
              </button>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <button onClick={requestHelp} style={{ backgroundColor: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)', padding: '0.5rem 1.5rem', borderRadius: '20px', fontSize: '1rem', cursor: 'pointer' }}>
                I still need help (Notify Caregiver)
              </button>
            </div>
          </div>
        )}

        {activeTab === 'home' && (
          <div className="content-panel active" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="hero-status-row">
              <div className="hero-card hero-green" style={{ transform: 'none', transition: 'none', cursor: 'default' }}>
                <div style={{ textAlign: 'center', color: '#EF4444' }}><HeartPulseIcon size={48} /></div>
                <div style={{ fontSize: '1.5rem', textAlign: 'center', marginTop: '1rem' }}>{vitals.heartRate} BPM</div>
              </div>
              <div className="hero-card hero-green" style={{ transform: 'none', transition: 'none', cursor: 'default' }}>
                <div style={{ textAlign: 'center', color: '#38BDF8' }}><LungsIcon size={48} /></div>
                <div style={{ fontSize: '1.5rem', textAlign: 'center', marginTop: '1rem' }}>{vitals.spo2}% Oxygen</div>
              </div>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <h3>My Heart Rate Trend</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Your heart rate over the last few hours</p>
              <div style={{ height: '250px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} />
                    <YAxis domain={['auto', 'auto']} stroke="var(--text-muted)" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: 'none', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={3} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <h3>Daily Summary</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.6' }}>
                Great job today! Your average heart rate is staying within the normal range and your oxygen levels are excellent. You had a brief peak in stress around midday, but you recovered well. Remember to use the 🌬️ Breathing Tool if you ever feel overwhelmed.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <h3>Do you need help?</h3>
              <p style={{ margin: '1rem 0', color: 'var(--text-secondary)' }}>Press the button below to alert your caregiver immediately.</p>
              <button 
                onClick={requestHelp}
                style={{
                  backgroundColor: 'var(--emergency-color)',
                  color: 'white',
                  border: 'none',
                  padding: '1.5rem 3rem',
                  fontSize: '1.5rem',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                <EmergencyIcon size={24} /> Send SOS Alert
              </button>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="content-panel active">
            <div className="card">
              <h3>Caregiver Contact</h3>
              <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Primary Caregiver: <strong>Caregiver</strong></p>
              <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>Email: caregiver@harmony.local</p>
              
              <button className="action-btn" style={{ marginTop: '2rem' }} onClick={() => alert('Sending direct message to caregiver...')}>Send Message</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
