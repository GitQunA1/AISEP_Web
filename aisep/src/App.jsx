import { useState } from 'react';
import './styles/global.css';
import MainLayout from './components/layout/MainLayout';
import RegisterSelection from './components/auth/RegisterSelection';
import RegisterPage from './pages/RegisterPage';

function App() {
  const [currentView, setCurrentView] = useState('main'); // 'main', 'roleSelection', or 'register'
  const [selectedRole, setSelectedRole] = useState(null);

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
    setCurrentView('main');
    setSelectedRole(null);
  };

  return (
    <>
      {currentView === 'main' ? (
        <MainLayout onShowRegister={handleShowRegister} />
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
