import { useState, useEffect } from 'react';
import './styles/global.css';
import MainLayout from './components/layout/MainLayout';
import RegisterSelection from './components/auth/RegisterSelection';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPanel from './components/common/DashboardPanel';

function App() {
  const [currentView, setCurrentView] = useState('main'); // 'login', 'main', 'roleSelection', 'register'
  const [selectedRole, setSelectedRole] = useState(null);
  const [user, setUser] = useState(null);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('aisep_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setCurrentView('main');
    }
  }, []);

  const handleLoginSuccess = (userData, token) => {
    // Store user and token in localStorage (mock - in real app use secure storage)
    localStorage.setItem('aisep_user', JSON.stringify(userData));
    localStorage.setItem('aisep_token', token);
    setUser(userData);
    setCurrentView('main');
  };

  const handleLogout = () => {
    localStorage.removeItem('aisep_user');
    localStorage.removeItem('aisep_token');
    setUser(null);
    setCurrentView('login');
    setIsDashboardOpen(false);
  };

  const handleShowRegister = () => {
    setCurrentView('roleSelection');
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setCurrentView('register');
  };

  const handleBackToMain = () => {
    setCurrentView('main');
    setSelectedRole(null);
  };

  const handleBackToRoleSelection = () => {
    setCurrentView('roleSelection');
  };

  const handleRegistrationComplete = (role, formData) => {
    console.log('Registration complete for', role, formData);
    // TODO: Send data to backend
    setCurrentView('login');
    setSelectedRole(null);
  };

  const handleShowLogin = () => {
    setCurrentView('login');
  };

  const handleOpenDashboard = () => {
    setIsDashboardOpen(true);
  };

  const handleCloseDashboard = () => {
    setIsDashboardOpen(false);
  };

  return (
    <>
      {currentView === 'login' ? (
        <LoginPage 
          onLoginSuccess={handleLoginSuccess}
          onShowRegister={handleShowRegister}
        />
      ) : currentView === 'main' ? (
        <>
          <MainLayout 
            onShowRegister={handleShowRegister} 
            onShowLogin={handleShowLogin}
            user={user}
            onLogout={handleLogout}
            onOpenDashboard={handleOpenDashboard}
          />
          {user && (
            <DashboardPanel 
              user={user}
              isOpen={isDashboardOpen}
              onClose={handleCloseDashboard}
              onLogout={handleLogout}
            />
          )}
        </>
      ) : currentView === 'roleSelection' ? (
        <RegisterSelection 
          onBack={handleBackToMain}
          onRoleSelect={handleRoleSelect}
        />
      ) : (
        <RegisterPage
          selectedRole={selectedRole}
          onBack={handleBackToRoleSelection}
          onComplete={handleRegistrationComplete}
        />
      )}
    </>
  );
}

export default App;
