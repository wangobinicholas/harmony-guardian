import { LogoIcon, ServerIcon, UsersIcon, BellIcon, ShieldIcon, LogoutIcon, SmartphoneIcon } from './Icons';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function AdminDashboard({ onLogout, role }) {
  const [activePanel, setActivePanel] = useState('system'); // 'system', 'users', 'alerts', 'settings'
  const [users, setUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ activeDevices: 0, totalPatients: 0, systemHealth: 'Good' });

  useEffect(() => {
    // Fetch users (Requires admin token)
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
          setStats(prev => ({ ...prev, totalPatients: data.filter(u => u.role === 'user').length }));
        }
      } catch (err) {
        console.error('Failed to fetch users');
      }
    };

    // Fetch global alerts
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
        console.error('Failed to fetch alerts');
      }
    };

    fetchUsers();
    fetchAlerts();
    
    // Mock system stats
    setTimeout(() => {
      setStats(prev => ({ ...prev, activeDevices: Math.floor(Math.random() * 5) + 1 }));
    }, 1000);
  }, []);

  return (
    <div id="admin-dashboard" className="dashboard-view" style={{ display: 'flex' }}>
      {/* Left Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <LogoIcon size={32} />
          <div className="brand-name" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Guardian Admin</div>
        </div>

        <nav className="sidebar-nav">
          <div className={`nav-item ${activePanel === 'system' ? 'active' : ''}`} onClick={() => setActivePanel('system')} role="button">
            <span className="nav-icon"><ServerIcon size={18} /></span>
            <span>System Status</span>
          </div>
          <div className={`nav-item ${activePanel === 'users' ? 'active' : ''}`} onClick={() => setActivePanel('users')} role="button">
            <span className="nav-icon"><UsersIcon size={18} /></span>
            <span>User Management</span>
          </div>
          <div className={`nav-item ${activePanel === 'alerts' ? 'active' : ''}`} onClick={() => setActivePanel('alerts')} role="button">
            <span className="nav-icon"><BellIcon size={18} /></span>
            <span>Global Alerts</span>
          </div>
        </nav>

        <div className="sidebar-promo">
          <div className="promo-icon" style={{ display: 'flex' }}><ShieldIcon size={24} /></div>
          <div className="promo-text">
            <strong>Admin Access</strong>
            <p>Full system control</p>
          </div>
        </div>
        <button type="button" className="logout-btn" onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}><LogoutIcon size={18} /> Log out</button>
      </aside>

      {/* Main Content Area */}
      <div className="main-container">
        <header className="top-header">
          <div className="header-left">
            <h2>Admin Console</h2>
          </div>
          <div className="header-right">
            <div className="user-profile">
              <div className="user-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShieldIcon size={20} /></div>
              <div className="user-info">
                <div className="user-name">System Admin</div>
                <div className="user-role">Administrator</div>
              </div>
            </div>
          </div>
        </header>

        {activePanel === 'system' && (
          <div className="content-panel active">
            <div className="dashboard-title">
              <h1>System Overview</h1>
              <div className="status-badge normal">{stats.systemHealth}</div>
            </div>

            <div className="hero-status-row">
              <div className="hero-card hero-green">
                <div className="hero-card-icon" style={{ color: '#10B981' }}><UsersIcon size={24} /></div>
                <div className="hero-card-label">Total Users</div>
                <div className="hero-card-value">{users.length}</div>
              </div>
              <div className="hero-card hero-green">
                <div className="hero-card-icon" style={{ color: '#10B981' }}><SmartphoneIcon size={24} /></div>
                <div className="hero-card-label">Active Devices</div>
                <div className="hero-card-value">{stats.activeDevices}</div>
              </div>
              <div className="hero-card hero-yellow">
                <div className="hero-card-icon" style={{ color: '#F59E0B' }}><BellIcon size={24} /></div>
                <div className="hero-card-label">Alerts (24h)</div>
                <div className="hero-card-value">{alerts.length}</div>
              </div>
            </div>
            
            <div className="card" style={{ marginTop: '2rem' }}>
              <div className="card-header"><h3>System Health Logs</h3></div>
              <div className="alert-list">
                <div className="alert-item"><div><div className="alert-time">Just now</div><div className="alert-message">All services running optimally.</div></div></div>
                <div className="alert-item"><div><div className="alert-time">1 hr ago</div><div className="alert-message">Database backup completed successfully.</div></div></div>
              </div>
            </div>
          </div>
        )}

        {activePanel === 'users' && (
          <div className="content-panel active">
            <div className="dashboard-title"><h1>User Management</h1></div>
            <div className="card">
              <div className="card-header">
                <h3>Registered Accounts</h3>
                <button className="action-btn" onClick={() => alert("Redirecting to New User form...")}>Add User</button>
              </div>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '1rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '0.5rem' }}>Name</th>
                    <th style={{ padding: '0.5rem' }}>Email</th>
                    <th style={{ padding: '0.5rem' }}>Role</th>
                    <th style={{ padding: '0.5rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem 0.5rem' }}>{u.name || 'N/A'}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>{u.email}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span className={`status-badge ${u.role === 'admin' ? 'emergency' : u.role === 'caregiver' ? 'warning' : 'normal'}`}>{u.role}</span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <button className="action-btn outline" onClick={() => alert(`Editing user: ${u.email}`)} style={{ padding: '0.2rem 0.5rem', fontSize: '12px' }}>Edit</button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading users...</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activePanel === 'alerts' && (
          <div className="content-panel active">
            <div className="dashboard-title"><h1>Global Alerts Dashboard</h1></div>
            <div className="card">
              <div className="alert-list">
                {alerts.map(alert => (
                  <div key={alert.id} className="alert-item" data-severity={alert.severity}>
                    <div>
                      <div className="alert-time">{alert.timeStr} - <span style={{fontSize:'12px', color:'var(--text-secondary)'}}>Patient #{alert.patientId}</span></div>
                      <div className="alert-message">{alert.message}</div>
                    </div>
                  </div>
                ))}
                {alerts.length === 0 && <p className="text-secondary" style={{padding:'1rem'}}>No system alerts.</p>}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
