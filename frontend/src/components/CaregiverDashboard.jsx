import React, { useState, useEffect } from "react";
import { io } from 'socket.io-client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { LogoIcon, DashboardIcon, AnalyticsIcon, BellIcon, SettingsIcon, EmergencyIcon, UserProfileIcon, HeartPulseIcon, ClipboardIcon, ActivityIcon, WifiIcon, BrainIcon, DocumentIcon, CheckIcon, LogoutIcon } from './Icons';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default function CaregiverDashboard({ onLogout, role }) {
  const [vitals, setVitals] = useState({ heartRate: '--', spo2: '--', motion: '--', gsr: '--', status: 'Loading...' });
  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState([]);

  // UI State
  const [activePanel, setActivePanel] = useState('dashboard'); // 'dashboard', 'analytics', 'alerts', 'settings'
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [deviceIP, setDeviceIP] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [alertFilter, setAlertFilter] = useState('all');
  const [mainAlertFilter, setMainAlertFilter] = useState('all');
  const wsRef = React.useRef(null);

  const sendESPCommand = (cmd) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(cmd);
    }
  };

  useEffect(() => {
    const fetchVitals = async () => {
      if (!isConnected) {
        setVitals(prev => ({ ...prev, status: 'Disconnected' }));
        return;
      }
      try {
        if (!deviceIP) {
          // Fallback to Backend Vitals just for initial load
          const res = await fetch(`${API_BASE_URL}/api/vitals`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          if (!res.ok) {
            if (res.status === 401) onLogout();
            return;
          }
          const data = await res.json();
          setVitals(data);
        }
      } catch (err) {
        console.error('Failed to fetch vitals', err);
      }
    };

    const fetchAlerts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/alerts`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAlerts(data);
        }
      } catch (err) {
        console.error('Failed to fetch alerts', err);
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
            time: v.timeStr || new Date(v.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            heartRate: v.heartRate,
            stressLevel: v.stressLevel,
            spo2: v.spo2,
            motion: v.motion
          })));
        }
      } catch (err) { }
    };

    fetchVitals();
    fetchAlerts();
    fetchHistory();

    let interval, historyInterval, socket;

    if (isConnected) {
      if (deviceIP) {
        // WebSocket directly to ESP32
        const wsUrl = `ws://${deviceIP.replace(/^https?:\/\//, '')}:81`;
        wsRef.current = new WebSocket(wsUrl);
        wsRef.current.onopen = () => console.log('Connected to ESP32 WebSocket');
        wsRef.current.onmessage = (event) => {
          try {
            const raw = JSON.parse(event.data);
            const statusMap = { 0: 'Normal', 1: 'Warning', 2: 'Emergency' };
            const newVital = {
              heartRate: raw.heartRate || '--',
              spo2: raw.spo2 || '--',
              motion: raw.motion !== undefined ? raw.motion : '--',
              gsr: raw.gsr !== undefined ? raw.gsr : '--',
              status: statusMap[raw.state] || 'Live (ESP32 Direct)',
              stressLevel: raw.stressLevel || '--'
            };
            setVitals(newVital);
            setHistory(prev => {
              const updatedItem = {
                time: raw.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                heartRate: newVital.heartRate,
                stressLevel: newVital.stressLevel,
                spo2: newVital.spo2,
                motion: newVital.motion
              };
              const updated = [...prev, updatedItem];
              return updated.slice(-30);
            });
          } catch (e) { console.error('WS parse error', e); }
        };
        wsRef.current.onclose = () => {
          setVitals(prev => ({ ...prev, status: 'Disconnected' }));
        };
      } else {
        // Zero-traffic Solution: Socket.IO connection to backend!
        const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        socket = io(socketUrl);

        socket.on('connect', () => console.log('Connected to backend Socket.IO'));

        socket.on('esp32Data', (newVital) => {
          setVitals(newVital);
          // Prepend to history dynamically to avoid polling
          setHistory(prev => {
            const updatedItem = {
              time: newVital.timeStr || new Date(newVital.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              heartRate: newVital.heartRate,
              stressLevel: newVital.stressLevel,
              spo2: newVital.spo2,
              motion: newVital.motion
            };
            // Assuming history array is shown chronologically in charts, we add to the end
            const updated = [...prev, updatedItem];
            return updated.slice(-30); // Keep last 30
          });
        });

        // Polling alerts occasionally (could also be migrated to Socket.IO)
        historyInterval = setInterval(fetchAlerts, 5000);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
      if (historyInterval) clearInterval(historyInterval);
      if (socket) socket.disconnect();
      if (wsRef.current) wsRef.current.close();
    };
  }, [onLogout, isConnected, deviceIP]);

  // Handlers
  const handleChildSelect = (val) => console.log('Child selected:', val);
  const handleCaregiverSearch = (val) => setSearchTerm(val);

  const connectToDeviceIP = () => {
    if (!deviceIP) {
      alert("Please enter a device IP address.");
      return;
    }
    setIsConnected(true);
    showNotification(`Connected to device at ${deviceIP}`);
  };

  const disconnectDevice = () => {
    setIsConnected(false);
    showNotification("Device disconnected.");
  };

  const exportSensorDataCSV = () => { alert("Exporting patient sensor history to CSV..."); };
  const showNotification = (msg) => alert(msg);
  const saveCaregiverSettings = (e) => { e.preventDefault(); alert("Settings saved successfully."); };
  const changePassword = () => alert("Password changed.");
  const mlUpdateApiBase = () => console.log("Updating ML API Base");

  return (
    <div id="caregiver-dashboard" className="dashboard-view" style={{ display: 'flex' }}>
      {/* Left Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <LogoIcon size={36} />
          <div className="brand-name" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Harmony Guardian</div>
        </div>

        <button className="emergency-btn" id="emergencyBtn" onClick={() => showNotification('Emergency Help Protocol Initiated!')}>
          <span className="emergency-icon"><EmergencyIcon size={18} /></span>
          Emergency Help
        </button>

        <nav className="sidebar-nav">
          <div className={`nav-item ${activePanel === 'dashboard' ? 'active' : ''}`} onClick={() => setActivePanel('dashboard')} role="button" tabIndex="0">
            <span className="nav-icon"><DashboardIcon size={18} /></span>
            <span>Dashboard</span>
          </div>
          <div className={`nav-item ${activePanel === 'analytics' ? 'active' : ''}`} onClick={() => setActivePanel('analytics')} role="button" tabIndex="0">
            <span className="nav-icon"><AnalyticsIcon size={18} /></span>
            <span>Analytics</span>
          </div>
          <div className={`nav-item ${activePanel === 'alerts' ? 'active' : ''}`} onClick={() => setActivePanel('alerts')} role="button" tabIndex="0">
            <span className="nav-icon"><BellIcon size={18} /></span>
            <span>Alerts</span>
          </div>
          <div className={`nav-item ${activePanel === 'settings' ? 'active' : ''}`} onClick={() => setActivePanel('settings')} role="button" tabIndex="0">
            <span className="nav-icon"><SettingsIcon size={18} /></span>
            <span>Settings</span>
          </div>
        </nav>

        <div className="sidebar-promo">
          <div className="promo-icon"><UserProfileIcon size={24} /></div>
          <div className="promo-text">
            <strong>Patient Monitoring</strong>
            <p>Real-time health tracking</p>
          </div>
        </div>
        <button type="button" className="logout-btn" onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}><LogoutIcon size={18} /> Log out</button>
      </aside>

      {/* Main Content Area */}
      <div className="main-container">
        <header className="top-header">
          <div className="header-left">
            <div className="child-selector-wrap">
              <label htmlFor="caregiver-child-select">Child</label>
              <select id="caregiver-child-select" className="child-selector" onChange={(e) => handleChildSelect(e.target.value)} aria-label="Select child" defaultValue="child1">
                <option value="child1">Alex (Primary)</option>
                <option value="child2">Jordan</option>
                <option value="child3">Sam</option>
              </select>
            </div>
            <input type="search" placeholder="Search patients, alerts..." className="search-box" id="caregiver-search" value={searchTerm} onChange={(e) => handleCaregiverSearch(e.target.value)} />
          </div>
          <div className="header-right">
            <div className="ip-connect-wrap" style={{ display: 'flex', gap: '0.5rem', marginRight: '1rem', alignItems: 'center' }}>
              <input type="text" id="device-ip-input" placeholder="Device IP Address" className="search-box" style={{ width: '150px', padding: '0.5rem', fontSize: '13px' }} value={deviceIP} onChange={(e) => setDeviceIP(e.target.value)} disabled={isConnected} />
              {isConnected ? (
                <button type="button" className="action-btn outline" onClick={disconnectDevice}>Disconnect</button>
              ) : (
                <button type="button" className="action-btn" onClick={connectToDeviceIP} id="ip-connect-btn">Connect</button>
              )}
            </div>
            <div className="header-notify-wrap">
              <button type="button" className="header-icon-btn" id="caregiver-notify-btn" onClick={() => setNotifyOpen(!notifyOpen)} aria-label="Alerts"><span className="alert-count-badge zero" id="caregiver-alert-badge-count">0</span> <BellIcon size={20} /></button>
              {notifyOpen && (
                <div className="notify-dropdown" id="caregiver-notify-dropdown" style={{ display: 'block' }}>
                  <div className="notify-dropdown-header">Recent Alerts</div>
                  <div id="caregiver-notify-list">No recent alerts.</div>
                </div>
              )}
            </div>
            <button type="button" className="header-icon-btn" onClick={() => setActivePanel('settings')} aria-label="Settings"><SettingsIcon size={20} /></button>
            <div className="user-profile">
              <div className="user-avatar" id="caregiver-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserProfileIcon size={20} /></div>
              <div className="user-info">
                <div className="user-name" id="caregiver-name">Caregiver</div>
                <div className="user-role">{role === 'admin' ? 'Admin' : 'Caregiver'}</div>
              </div>
            </div>
          </div>
        </header>

        {activePanel === 'dashboard' && (
          <div id="caregiver-panel-dashboard" className="content-panel active">
            <div className="dashboard-title">
              <h1>Caregiver Dashboard</h1>
              <div className="status-badge normal" id="systemStatus">{vitals.status}</div>
            </div>

            {/* Status Overview Cards (Hero Section) */}
            <div className="hero-status-row">
              <div className="hero-card hero-green" id="hero-heart">
                <div className="hero-card-icon"><HeartPulseIcon size={24} /></div>
                <div className="hero-card-label">Heart Rate</div>
                <div className="hero-card-value"><span id="hrValue">{vitals.heartRate}</span> <small style={{ fontSize: '14px', color: 'var(--text-muted)' }}>BPM</small></div>
                <div className="hero-card-trend" id="hrTrend">Processing</div>
              </div>
              <div className="hero-card hero-yellow" id="hero-motion">
                <div className="hero-card-icon" style={{ color: '#F59E0B' }}><ActivityIcon size={24} /></div>
                <div className="hero-card-label">Motion</div>
                <div className="hero-card-value"><span id="motionValue">{vitals.motion}</span> <small style={{ fontSize: '14px', color: 'var(--text-muted)' }}>m/s²</small></div>
                <div className="hero-card-trend">Monitoring</div>
              </div>
              <div className="hero-card hero-green" id="hero-connectivity">
                <div className="hero-card-icon" style={{ color: '#10B981' }}><WifiIcon size={24} /></div>
                <div className="hero-card-label">Connectivity</div>
                <div className="hero-card-value" id="deviceStatus">{isConnected ? "Connected" : "Offline"}</div>
                <div className="hero-card-trend" id="deviceTrendText" style={{ color: isConnected ? 'var(--success)' : 'var(--text-muted)' }}>
                  {isConnected ? "System Online" : "Awaiting Connection"}
                </div>
              </div>
            </div>

            {/* Live Monitoring (Left) + Recent Alerts (Right) */}
            <div className="live-alerts-split">
              <div className="live-monitoring-panel">
                <div className="card-header" style={{ justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3>LIVE MONITORING</h3>
                    <span className="card-badge" id="vitalStatus">{vitals.status}</span>
                  </div>
                  <button type="button" className="action-btn outline" onClick={exportSensorDataCSV} style={{ fontSize: '12px', padding: '0.25rem 0.5rem', cursor: 'pointer', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '6px' }}>Export CSV</button>
                </div>
                <p className="text-secondary" style={{ fontSize: '12px', marginBottom: '0.75rem' }}>Real-time sensor data · <span id="patientTime">Live</span></p>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={history}>
                      <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} />
                      <YAxis domain={['auto', 'auto']} stroke="var(--text-muted)" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={3} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="card-header" style={{ marginTop: '1rem' }}><h3>Stress &amp; SpO2</h3><select className="time-select"><option>Last Hour</option><option>Last 6 Hours</option><option>Last 24 Hours</option></select></div>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={history}>
                      <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} />
                      <YAxis domain={['auto', 100]} stroke="var(--text-muted)" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: 'none', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="spo2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="card-header" style={{ marginTop: '1rem' }}><h3>Motion activity</h3></div>
                <p className="text-secondary" style={{ fontSize: '12px' }}>Motion (m/s²): <strong id="motionValueLive">{vitals.motion}</strong> · SpO2: <strong id="spo2Value">{vitals.spo2}</strong>%</p>
              </div>

              <div className="alerts-feed-panel">
                <div className="card-header">
                  <h3>RECENT ALERTS</h3>
                  <div className="alert-tabs">
                    <button className={`tab-btn ${mainAlertFilter === 'all' ? 'active' : ''}`} onClick={() => setMainAlertFilter('all')}>All</button>
                    <button className={`tab-btn ${mainAlertFilter === 'active' ? 'active' : ''}`} onClick={() => setMainAlertFilter('active')}>Active</button>
                    <button className={`tab-btn ${mainAlertFilter === 'history' ? 'active' : ''}`} onClick={() => setMainAlertFilter('history')}>History</button>
                  </div>
                </div>
                <div className="alert-list" id="alertList">
                  {alerts.length === 0 ? <p className="text-secondary" style={{ padding: '1rem' }}>No alerts found.</p> : null}
                  {alerts.map(alert => (
                    <div key={alert.id} className="alert-item" data-severity={alert.severity}>
                      <div>
                        <div className="alert-time">{alert.timeStr}</div>
                        <div className="alert-message">{alert.message}</div>
                      </div>
                      <button className="alert-action">View</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Trends & Insights */}
            <div className="trends-insights-row">
              <div className="trends-card">
                <div className="card-header">
                  <h3>PANIC LEVELS (Last 6 Hours)</h3>
                  <select className="time-select"><option>Last Hour</option><option>Last 6 Hours</option><option>Last 24 Hours</option></select>
                </div>
                <div className="overview-chart" style={{ height: '200px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={history}>
                      <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} />
                      <YAxis stroke="var(--text-muted)" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: 'none', borderRadius: '8px' }} />
                      <Bar dataKey="stressLevel" fill="#f59e0b" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="overview-legend">
                  <div className="legend-item"><span className="legend-color normal"></span><span>Normal</span></div>
                  <div className="legend-item"><span className="legend-color warning"></span><span>Warning</span></div>
                  <div className="legend-item"><span className="legend-color emergency"></span><span>Emergency</span></div>
                </div>
              </div>
              <div className="behavior-insights-card">
                <h3>BEHAVIOR INSIGHTS</h3>
                <p className="insight-text" id="behaviorInsightText">Peak stress usually 1–3 PM. Calmer periods in the morning. Use quiet activities after lunch to support regulation.</p>
                <p className="text-secondary" style={{ fontSize: '11px', marginTop: '0.75rem' }}>Summary from recent patterns · Updates daily</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-bar">
              <button type="button" className="quick-action-btn danger" id="emergencyBtnAction" onClick={() => showNotification('Broadcasting emergency alert to all connected caregivers!')}><span><EmergencyIcon size={16} /></span> Emergency Alert</button>
              <button type="button" className="quick-action-btn secondary" onClick={() => showNotification('Note saved. Add note form would open here.')}><span><ClipboardIcon size={16} /></span> Add Note</button>
              <button type="button" className="quick-action-btn secondary" onClick={() => showNotification('Report generation started.')}><span><DocumentIcon size={16} /></span> Generate Report</button>
              <button type="button" className="quick-action-btn primary" onClick={() => showNotification('Test notification sent.')}><span><BellIcon size={16} /></span> Test Notification</button>
              <button type="button" className="quick-action-btn danger" id="sosBtn" style={{ marginLeft: 'auto' }} onClick={() => { showNotification('SOS Triggered.'); sendESPCommand('emergency:sos'); }}><EmergencyIcon size={16} /> Trigger SOS</button>
              <button type="button" className="quick-action-btn danger" id="fallBtn" onClick={() => { showNotification('Fall detection simulated.'); sendESPCommand('emergency:fall'); }}><EmergencyIcon size={16} /> Fall</button>
              <button type="button" className="quick-action-btn secondary" id="clearBtn" onClick={() => { showNotification('Alert cleared.'); sendESPCommand('emergency:clear'); }} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CheckIcon size={16} /> Clear Alert</button>
            </div>
          </div>
        )}

        {activePanel === 'analytics' && (
          <div id="caregiver-panel-analytics" className="content-panel active">
            <div className="dashboard-title"><h1>Analytics</h1><div className="status-badge normal">Reports &amp; ML</div></div>
            <div className="dashboard-grid">
              <div className="card" style={{ gridColumn: 'span 12' }}>
                <div className="ml-dashboard">
                  <div className="ml-header">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><BrainIcon size={24} /> ML Dashboard</h2>
                    <p>Machine Learning Analytics &amp; Stress Prediction for this wearer.</p>
                  </div>

                  <div className="ml-api-config">
                    <input type="text" id="ml-apiBase" className="ml-api-input" placeholder="API endpoint" />
                    <button className="ml-btn" onClick={mlUpdateApiBase}>Update</button>
                  </div>

                  <div className="ml-grid">
                    <div className="ml-card">
                      <div className="ml-card-header">
                        <div className="ml-card-title">Stress Prediction Score</div>
                        <div className="ml-card-icon"><AnalyticsIcon size={20} /></div>
                      </div>
                      <div className="ml-metric-large" id="ml-stressScore">{vitals.stressLevel || '--'}</div>
                      <div className="ml-metric-label">Current ML Score (0-100%)</div>
                      <div className="ml-progress-bar">
                        <div className="ml-progress-fill" id="ml-stressProgress" style={{ width: `${vitals.stressLevel || 0}%` }}></div>
                      </div>
                      <div style={{ marginTop: '1rem' }}>
                        <span className="ml-status-badge" id="ml-stressLevel">{vitals.status || 'Loading...'}</span>
                      </div>
                    </div>
                    {/* ... (Other ML cards can be safely retained with generic data) ... */}
                    <div className="ml-card">
                      <div className="ml-card-header">
                        <div className="ml-card-title">Current Sensor Values</div>
                        <div className="ml-card-icon"><WifiIcon size={20} /></div>
                      </div>
                      <div style={{ marginTop: '1rem' }}>
                        <div className="ml-feature-item"><span className="ml-feature-name">Heart Rate</span><span className="ml-feature-value">{vitals.heartRate}</span></div>
                        <div className="ml-feature-item"><span className="ml-feature-name">Motion</span><span className="ml-feature-value">{vitals.motion}</span></div>
                        <div className="ml-feature-item"><span className="ml-feature-name">SpO2</span><span className="ml-feature-value">{vitals.spo2}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activePanel === 'alerts' && (
          <div id="caregiver-panel-alerts" className="content-panel active">
            <div className="dashboard-title"><h1>Alerts</h1><div className="status-badge normal" id="caregiver-alerts-badge">All</div></div>
            <div className="dashboard-grid">
              <div className="card alerts-card" style={{ gridColumn: 'span 12' }}>
                <div className="card-header">
                  <h3>All Alerts</h3>
                  <div className="alert-tabs">
                    <button className={`tab-btn ${alertFilter === 'all' ? 'active' : ''}`} onClick={() => setAlertFilter('all')}>All</button>
                    <button className={`tab-btn ${alertFilter === 'active' ? 'active' : ''}`} onClick={() => setAlertFilter('active')}>Active</button>
                    <button className={`tab-btn ${alertFilter === 'history' ? 'active' : ''}`} onClick={() => setAlertFilter('history')}>History</button>
                  </div>
                </div>
                <div className="alert-list" id="caregiver-full-alert-list">
                  {alerts.map(alert => (
                    <div key={alert.id} className="alert-item" data-severity={alert.severity}>
                      <div>
                        <div className="alert-time">{alert.timeStr}</div>
                        <div className="alert-message">{alert.message}</div>
                      </div>
                      <button className="alert-action">View</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activePanel === 'settings' && (
          <div id="caregiver-panel-settings" className="content-panel active">
            <div className="dashboard-title"><h1>User Settings</h1></div>
            <div className="dashboard-grid">
              <form id="caregiver-settings-form" onSubmit={saveCaregiverSettings} style={{ display: 'contents' }}>
                <div className="card" style={{ gridColumn: 'span 6' }}>
                  <div className="card-header"><h3>Profile information</h3></div>
                  <p className="text-secondary" style={{ marginBottom: '1rem' }}>Name and contact shown in the app.</p>
                  <div className="form-group">
                    <label htmlFor="caregiver-display-name">Display name</label>
                    <input type="text" id="caregiver-display-name" className="login-input" placeholder="Your name" style={{ maxWidth: '320px' }} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <span id="caregiver-email-readonly" className="text-secondary">caregiver@harmony.local</span>
                  </div>
                </div>

                <div className="card" style={{ gridColumn: 'span 6' }}>
                  <div className="card-header"><h3>Security &amp; privacy</h3></div>
                  <p className="text-secondary" style={{ marginBottom: '1rem' }}>Change password, MFA, and session history.</p>
                  <div className="form-group">
                    <label htmlFor="caregiver-current-password">Current password</label>
                    <input type="password" id="caregiver-current-password" className="login-input" placeholder="••••••••" style={{ maxWidth: '260px' }} />
                  </div>
                  <button type="button" className="control-btn" onClick={changePassword}>Change password</button>
                  <p className="text-secondary" style={{ marginTop: '1rem' }}>Session timeout: 30 minutes. <button type="button" className="control-btn outline" onClick={onLogout}>Log out</button></p>
                </div>

                <div className="card" style={{ gridColumn: 'span 12' }}>
                  <button type="submit" className="control-btn" id="caregiver-settings-save">Save settings</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}