import React, { useState } from 'react';
import RegisterLayout from '../components/auth/RegisterLayout';
import StartupRegisterForm from '../components/auth/StartupRegisterForm';
import InvestorRegisterForm from '../components/auth/InvestorRegisterForm';
import AdvisorRegisterForm from '../components/auth/AdvisorRegisterForm';
import RegistrationSuccess from '../components/auth/RegistrationSuccess';

/**
 * RegisterPage Component
 * Container that conditionally renders the registration form based on selected role
 * Displays success screen after registration is complete
 */
function RegisterPage({ selectedRole, onBack, onComplete }) {
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);

  const roleMap = {
    founder: {
      component: StartupRegisterForm,
      title: 'Startup Registration',
    },
    investor: {
      component: InvestorRegisterForm,
      title: 'Investor Registration',
    },
    advisor: {
      component: AdvisorRegisterForm,
      title: 'Advisor Registration',
    },
  };

  const roleConfig = roleMap[selectedRole];

  if (!roleConfig) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <p>Please select a valid role</p>
      </div>
    );
  }

  const FormComponent = roleConfig.component;

  const handleFormComplete = (formData) => {
    console.log(`${selectedRole} registration completed:`, formData);
    setRegistrationData(formData);
    setRegistrationComplete(true);
    // Don't call parent onComplete yet - wait until user navigates away from success screen
  };

  const handleBackHome = () => {
    // Now call the parent callback after showing success
    if (onComplete) {
      onComplete(selectedRole, registrationData);
    } else {
      onBack && onBack();
    }
  };

  // If registration is complete, show success screen (full screen, no layout wrapper)
  if (registrationComplete && registrationData) {
    return (
      <RegistrationSuccess
        userRole={selectedRole}
        email={registrationData.email}
        onBackHome={handleBackHome}
      />
    );
  }

  // Otherwise show the registration form wrapped in layout
  return (
    <RegisterLayout onBack={onBack} title={roleConfig.title}>
      <FormComponent onBack={onBack} onComplete={handleFormComplete} />
    </RegisterLayout>
  );
}

export default RegisterPage;
