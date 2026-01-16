import { useState } from 'react';
import './styles/global.css';
import MainLayout from './components/layout/MainLayout';
import RegisterSelection from './components/auth/RegisterSelection';

function App() {
  const [currentView, setCurrentView] = useState('main'); // 'main' or 'register'

  const handleShowRegister = () => {
    setCurrentView('register');
  };

  const handleBackToMain = () => {
    setCurrentView('main');
  };

  return (
    <>
      {currentView === 'main' ? (
        <MainLayout onShowRegister={handleShowRegister} />
      ) : (
        <RegisterSelection onBack={handleBackToMain} />
      )}
    </>
  );
}

export default App;
