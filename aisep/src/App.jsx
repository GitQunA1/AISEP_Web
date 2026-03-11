import { useState, useEffect } from 'react';
import './styles/global.css';
import MainLayout from './components/layout/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import RegisterSelection from './components/auth/RegisterSelection';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import StartupDashboard from './pages/StartupDashboard';
import InvestorDashboard from './pages/InvestorDashboard';
import AdvisorDashboard from './pages/AdvisorDashboard';
import OperationStaffDashboard from './pages/OperationStaffDashboard';

function App() {
  const [currentView, setCurrentView] = useState('main'); // 'login', 'main', 'roleSelection', 'register', 'profile'
  const [selectedRole, setSelectedRole] = useState(null);
  const [user, setUser] = useState(null);

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
    setIsDashboardOpen(false);
    // Stay on main page, don't redirect to login
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


  const handleShowProfile = () => {
    setCurrentView('profile');
  };

  const handleShowHome = () => {
    setCurrentView('main');
  };

  const handleShowAdvisors = () => {
    setCurrentView('advisors');
  };

  const handleShowInvestors = () => {
    setCurrentView('investors');
  };

  const handleShowDashboard = () => {
    setCurrentView('dashboard');
  };

  return (
    <>
      {currentView === 'login' ? (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onShowRegister={handleShowRegister}
          onBack={handleBackToMain}
        />
      ) : currentView === 'dashboard' ? (
        // Show role-specific dashboard wrapped in DashboardLayout
        <DashboardLayout
          onShowRegister={handleShowRegister}
          onShowLogin={handleShowLogin}
          onShowProfile={handleShowProfile}
          onShowHome={handleShowHome}
          onShowAdvisors={handleShowAdvisors}
          onShowInvestors={handleShowInvestors}
          onShowDashboard={handleShowDashboard}
          user={user}
          onLogout={handleLogout}
          activeView={currentView}
        >
          {user?.role === 'startup' ? (
            <StartupDashboard user={user} />
          ) : user?.role === 'investor' ? (
            <InvestorDashboard user={user} />
          ) : user?.role === 'advisor' ? (
            <AdvisorDashboard user={user} />
          ) : user?.role === 'operation_staff' ? (
            <OperationStaffDashboard user={user} />
          ) : (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <p>Dashboard not available for your role</p>
            </div>
          )}
        </DashboardLayout>
      ) : currentView === 'main' ? (
        <MainLayout
          onShowRegister={handleShowRegister}
          onShowLogin={handleShowLogin}
          onShowProfile={handleShowProfile}
          onShowHome={handleShowHome}
          onShowAdvisors={handleShowAdvisors}
          onShowInvestors={handleShowInvestors}
          onShowDashboard={handleShowDashboard}
          user={user}
          onLogout={handleLogout}
          activeView={currentView}
        />
      ) : currentView === 'roleSelection' ? (
        <RegisterSelection
          onBack={handleBackToMain}
          onRoleSelect={handleRoleSelect}
        />
      ) : currentView === 'profile' ? (
        <MainLayout
          onShowRegister={handleShowRegister}
          onShowLogin={handleShowLogin}
          onShowProfile={handleShowProfile}
          onShowHome={handleShowHome}
          onShowAdvisors={handleShowAdvisors}
          onShowInvestors={handleShowInvestors}
          onShowDashboard={handleShowDashboard}
          user={user}
          onLogout={handleLogout}
          showProfile={true}
          activeView={currentView}
        />
      ) : currentView === 'advisors' ? (
        <MainLayout
          onShowRegister={handleShowRegister}
          onShowLogin={handleShowLogin}
          onShowProfile={handleShowProfile}
          onShowHome={handleShowHome}
          onShowAdvisors={handleShowAdvisors}
          onShowInvestors={handleShowInvestors}
          onShowDashboard={handleShowDashboard}
          user={user}
          onLogout={handleLogout}
          showAdvisors={true}
          activeView={currentView}
        />
      ) : currentView === 'investors' ? (
        <MainLayout
          onShowRegister={handleShowRegister}
          onShowLogin={handleShowLogin}
          onShowProfile={handleShowProfile}
          onShowHome={handleShowHome}
          onShowAdvisors={handleShowAdvisors}
          onShowInvestors={handleShowInvestors}
          onShowDashboard={handleShowDashboard}
          user={user}
          onLogout={handleLogout}
          showInvestors={true}
          activeView={currentView}
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
