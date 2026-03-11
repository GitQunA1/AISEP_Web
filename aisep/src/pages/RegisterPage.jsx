import React, { useState } from 'react';
import RegisterLayout from '../components/auth/RegisterLayout';
import StartupRegisterForm from '../components/auth/StartupRegisterForm';
import InvestorRegisterForm from '../components/auth/InvestorRegisterForm';
import AdvisorRegisterForm from '../components/auth/AdvisorRegisterForm';
import OperationStaffRegisterForm from '../components/auth/OperationStaffRegisterForm';
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
    startup: {
      component: StartupRegisterForm,
      title: 'Đăng ký Startup',
    },
    investor: {
      component: InvestorRegisterForm,
      title: 'Đăng ký Nhà đầu tư',
    },
    advisor: {
      component: AdvisorRegisterForm,
      title: 'Đăng ký Cố vấn',
    },
    operation_staff: {
      component: OperationStaffRegisterForm,
      title: 'Đăng ký Nhân viên vận hành',
    },
  };

  const roleConfig = roleMap[selectedRole];

  if (!roleConfig) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <p>Vui lòng chọn vai trò hợp lệ.</p>
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
