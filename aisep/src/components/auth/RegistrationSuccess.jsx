import React from 'react';
import { Clock, ArrowLeft } from 'lucide-react';
import styles from './RegistrationSuccess.module.css';
import Button from '../common/Button';

/**
 * RegistrationSuccess Component
 * Displays success screen after user completes registration
 */
function RegistrationSuccess({ userRole, email, onBackHome }) {

  const roleMessages = {
    startup: {
      title: 'Đăng ký thành công',
      subtitle: 'Biểu mẫu đăng ký hồ sơ startup của bạn đã được tiếp nhận an toàn.',
      description:
        'Một email chứa liên kết xác nhận đã được gửi đến địa chỉ email đã đăng ký. Vui lòng kiểm tra hộp thư spam nếu bạn không tìm thấy email của chúng tôi.',
    },
    investor: {
      title: 'Đăng ký thành công',
      subtitle: 'Hồ sơ nhà đầu tư của bạn đã được tiếp nhận an toàn.',
      description:
        'Một email chứa liên kết xác nhận đã được gửi đến địa chỉ email đã đăng ký. Vui lòng kiểm tra hộp thư spam nếu bạn không tìm thấy email của chúng tôi.',
    },
    advisor: {
      title: 'Đăng ký thành công',
      subtitle: 'Hồ sơ cố vấn của bạn đã được tiếp nhận an toàn.',
      description:
        'Một email chứa liên kết xác nhận đã được gửi đến địa chỉ email đã đăng ký. Vui lòng kiểm tra hộp thư spam nếu bạn không tìm thấy email của chúng tôi.',
    },
    operation_staff: {
      title: 'Đăng ký thành công',
      subtitle: 'Thông tin đăng ký của bạn đã được tiếp nhận an toàn.',
      description:
        'Một email chứa liên kết xác nhận đã được gửi đến địa chỉ email đã đăng ký. Vui lòng kiểm tra hộp thư spam nếu bạn không tìm thấy email của chúng tôi.',
    },
  };

  const config = roleMessages[userRole] || roleMessages.startup;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Icon */}
        <div className={styles.iconWrapper}>
          <Clock size={48} strokeWidth={1.5} />
        </div>

        {/* Main Message */}
        <h1 className={styles.title}>{config.title}</h1>
        <p className={styles.subtitle}>{config.subtitle}</p>
        <p className={styles.description}>{config.description}</p>

        {/* Email Confirmation */}
        <div className={styles.emailSection}>
          <p className={styles.emailLabel}>Email xác nhận đã gửi đến:</p>
          <p className={styles.emailAddress}>{email}</p>
        </div>

        {/* Action Button */}
        <Button variant="primary" onClick={onBackHome} className={styles.actionButton}>
          <ArrowLeft size={16} />
          <span>Quay về trang chủ</span>
        </Button>
      </div>
    </div>
  );
}

export default RegistrationSuccess;
