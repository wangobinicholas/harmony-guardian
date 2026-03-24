import { useState } from 'react';
import WelcomeView from './components/WelcomeView';
import LoginView from './components/LoginView';
import CaregiverDashboard from './components/CaregiverDashboard';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState('welcome');
  const [userRole, setUserRole] = useState(null);

  const navigateTo = (view, role = null) => {
    setCurrentView(view);
    if (role) setUserRole(role);
  };

  const renderDashboard = () => {
    if (userRole === 'admin') return <AdminDashboard onLogout={() => navigateTo('welcome')} role={userRole} />;
    if (userRole === 'user') return <UserDashboard onLogout={() => navigateTo('welcome')} role={userRole} />;
    return <CaregiverDashboard onLogout={() => navigateTo('welcome')} role={userRole} />;
  };

  return (
    <>
      {currentView === 'welcome' && <WelcomeView onLogin={() => navigateTo('login')} />}
      {currentView === 'login' && <LoginView onBack={() => navigateTo('welcome')} onLogin={(role) => navigateTo('dashboard', role)} />}
      {currentView === 'dashboard' && renderDashboard()}
    </>
  );
}

export default App;
