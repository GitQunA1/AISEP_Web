import { useState, useEffect } from 'react';
import './styles/global.css';
import MainLayout from './components/layout/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import RegisterSelection from './components/auth/RegisterSelection';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import StartupDashboard from './pages/StartupDashboard';
import InvestorDashboard from './pages/InvestorDashboard';
import AdvisorDashboard from './pages/AdvisorDashboard';
import OperationStaffDashboard from './pages/OperationStaffDashboard';
import InvestorBookings from './components/investor/InvestorBookings';
import VerifyEmailPage from './pages/VerifyEmailPage';
import authService from './services/authService';
import startupProfileService from './services/startupProfileService';
import AdvisorProfilePage from './pages/AdvisorProfilePage';
import AdvisorApprovalPage from './components/advisor/AdvisorApprovalPage';
import SessionExpiredModal from './components/auth/SessionExpiredModal';

function App() {
  const [currentView, setCurrentView] = useState('main'); // 'login', 'main', 'roleSelection', 'register'
  const [selectedRole, setSelectedRole] = useState(null);
  const [user, setUser] = useState(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // Listen for global session_expired events from apiClient
  useEffect(() => {
    const handleSessionExpired = () => {
      setIsSessionExpired(true);
      setUser(null);
    };

    window.addEventListener('session_expired', handleSessionExpired);
    return () => window.removeEventListener('session_expired', handleSessionExpired);
  }, []);

  // Load user from localStorage on mount
  useEffect(() => {
    // Check if URL has userId and token (email verification payload)
    const params = new URLSearchParams(window.location.search);
    if (params.get('userId') && params.get('token')) {
      setCurrentView('verifyEmail');
      return;
    }

    const storedUser = localStorage.getItem('aisep_user');
    const storedToken = localStorage.getItem('aisep_token');
    
    if (storedUser) {
      let parsedUser = JSON.parse(storedUser);
      
      // Repair logic for users who logged in before JWT decoding was added
      if (!parsedUser.userId && storedToken) {
         try {
           const payloadBase64 = storedToken.split('.')[1];
           const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
           const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
             return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
           }).join(''));
           const decodedToken = JSON.parse(jsonPayload);
           
           parsedUser.userId = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
           localStorage.setItem('aisep_user', JSON.stringify(parsedUser));
         } catch (e) {
           console.error("Token repair failed", e);
         }
      }

      setUser(parsedUser);
      
      // For staff and advisors, default to dashboard view; others default to main
      const roleStr = parsedUser.role?.toString().toLowerCase() || '';
      const roleNum = Number(parsedUser.role);
      const isStaff = roleStr === 'operationstaff' || roleStr === 'operation_staff' || roleStr === 'staff' || roleNum === 3;
      const isAdvisor = roleStr === 'advisor' || roleNum === 2;
      
      if (isStaff || isAdvisor) {
        setCurrentView('dashboard');
      } else {
        setCurrentView('main');
      }
    }
  }, []);

  const handleLoginSuccess = async (userData, accessToken, refreshToken) => {
    // Store user and tokens in localStorage
    localStorage.setItem('aisep_user', JSON.stringify(userData));
    localStorage.setItem('aisep_token', accessToken);
    localStorage.setItem('aisep_refresh_token', refreshToken);
    setUser(userData);
    setIsSessionExpired(false); // Reset session expired flag

    // Determine role-based redirect — must derive from userData, not outer scope
    const roleStr = userData.role?.toString().toLowerCase() || '';
    const roleNum = Number(userData.role);
    const isStaff = roleStr === 'operationstaff' || roleStr === 'operation_staff' || roleStr === 'staff' || roleNum === 3;
    const isAdvisor = roleStr === 'advisor' || roleNum === 2;

    // Operation Staff and Advisor redirect to dashboard directly
    if (isStaff || isAdvisor) {
      setCurrentView('dashboard');
      return;
    }
    
    // Startup users check profile
    if (roleStr === 'startup' || roleStr === '0' || roleNum === 0) {
      try {
        const response = await startupProfileService.getStartupProfileByUserId(userData.userId);
        if (!response) {
          // No profile, redirect to HOME with setup flag so MainLayout shows the modal
          setCurrentView('main');
          window.history.replaceState({}, document.title, window.location.pathname + '?setup=true');
        } else {
          setCurrentView('main');
        }
      } catch (err) {
        console.error("Failed to check profile after login:", err);
        setCurrentView('main');
      }
    } else {
      // Other roles go to main
      setCurrentView('main');
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('aisep_user');
    localStorage.removeItem('aisep_token');
    localStorage.removeItem('aisep_refresh_token');
    setUser(null);
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


  const handleShowHome = () => {
    setCurrentView('main');
  };

  const handleShowAdvisors = () => {
    setCurrentView('advisors');
  };

  const handleShowInvestors = () => {
    setCurrentView('investors');
  };

  const handleShowDashboard = (section = 'statistics') => {
    if (section === 'statistics' || section === '') {
      setCurrentView('dashboard');
    } else {
      setCurrentView(`dashboard_${section}`);
    }
  };

  const handleShowAI = () => {
    setCurrentView('ai');
  };

  const handleShowProfile = () => {
    setCurrentView('profile');
  };

  return (
    <>
      {isSessionExpired && (
        <SessionExpiredModal
          onLogin={() => {
            setIsSessionExpired(false);
            setCurrentView('login');
          }}
          onHome={() => {
            setIsSessionExpired(false);
            setCurrentView('main');
          }}
        />
      )}

      {currentView === 'login' ? (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onShowRegister={handleShowRegister}
          onBack={handleBackToMain}
        />
      ) : (['main', 'advisors', 'investors', 'ai', 'dashboard', 'profile'].includes(currentView) || currentView.startsWith('dashboard_')) ? (
        <MainLayout
          onShowRegister={handleShowRegister}
          onShowLogin={handleShowLogin}
          onShowHome={handleShowHome}
          onShowAdvisors={handleShowAdvisors}
          onShowInvestors={handleShowInvestors}
          onShowDashboard={handleShowDashboard}
          onShowAI={handleShowAI}
          onShowProfile={handleShowProfile}
          user={user}
          onLogout={handleLogout}
          showAdvisors={currentView === 'advisors'}
          showInvestors={currentView === 'investors'}
          showAI={currentView === 'ai'}
          activeView={currentView}
        >
          {currentView === 'profile' && <AdvisorProfilePage user={user} onBack={handleShowHome} />}
          {currentView.startsWith('dashboard') && (
            (() => {
              const roleStr = user?.role?.toString().toLowerCase() || '';
              const roleNum = Number(user?.role);
              const isStaff = roleStr === 'operationstaff' || roleStr === 'operation_staff' || roleStr === 'staff' || roleNum === 3;
              
              if (roleStr === 'startup' || roleNum === 0) {
                return <StartupDashboard user={user} />;
              } else if (roleStr === 'investor' || roleNum === 1) {
                if (currentView === 'dashboard_bookings') {
                  return <InvestorBookings user={user} />;
                }
                return <InvestorDashboard user={user} />;
              } else if (roleStr === 'advisor' || roleNum === 2) {
                const section = currentView.startsWith('dashboard_') ? currentView.replace('dashboard_', '') : 'overview';
                return <AdvisorDashboard user={user} initialSection={section} onSectionChange={handleShowDashboard} onShowProfile={handleShowProfile} />;
              } else if (isStaff) {
                const section = currentView.startsWith('dashboard_') ? currentView.replace('dashboard_', '') : 'statistics';
                if (section === 'advisor_approval') {
                  return <AdvisorApprovalPage user={user} />;
                }
                return <OperationStaffDashboard user={user} initialSection={section} />;
              } else {
                return <div style={{ padding: '20px', textAlign: 'center' }}><p>Dashboard not available for your role</p></div>;
              }
            })()
          )}
        </MainLayout>
      ) : currentView === 'verifyEmail' ? (
        <VerifyEmailPage onVerified={() => {
          window.history.replaceState({}, document.title, window.location.pathname);
          setCurrentView('login');
        }} />
      ) : currentView === 'roleSelection' ? (
        <RegisterSelection
          onRoleSelect={handleRoleSelect}
          onBack={handleBackToMain}
        />
      ) : currentView === 'register' ? (
        <RegisterPage
          selectedRole={selectedRole}
          onBack={handleBackToRoleSelection}
          onComplete={handleRegistrationComplete}
        />
      ) : null}
    </>
  );
}

export default App;
