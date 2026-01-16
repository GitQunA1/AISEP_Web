import React from 'react';
import { Clock, Shield, Zap, ArrowLeft } from 'lucide-react';
import styles from './RegistrationSuccess.module.css';
import Button from '../common/Button';

/**
 * RegistrationSuccess Component
 * Displays success screen after user completes registration
 * Status: Application Submitted & Under Review
 */
function RegistrationSuccess({ userRole, email, onBackHome }) {
  console.log('✅ RegistrationSuccess rendered with role:', userRole, 'email:', email);

  const roleMessages = {
    founder: {
      title: 'Application Submitted',
      subtitle: 'Your startup profile and documents have been securely received.',
      description:
        'Our Operation Staff is currently reviewing your submission for validity and IP verification. Once approved, your AI Potential Score will be generated.',
      steps: [
        {
          icon: Shield,
          title: 'Verification',
          description: 'Our team verifies documents & validates your identity (KYC)',
        },
        {
          icon: Zap,
          title: 'Blockchain Hashing',
          description: 'Your documents will be time-stamped on blockchain for security',
        },
        {
          icon: Clock,
          title: 'AI Analysis',
          description: 'Once approved, our AI will generate your Potential Score',
        },
      ],
    },
    investor: {
      title: 'Profile Submitted',
      subtitle: 'Your investor profile has been received.',
      description:
        'Our team is reviewing your information. You\'ll be able to explore verified startups once your profile is approved.',
      steps: [
        {
          icon: Shield,
          title: 'Verification',
          description: 'We verify your investment credentials and background',
        },
        {
          icon: Zap,
          title: 'Profile Setup',
          description: 'Configure your investment preferences and criteria',
        },
        {
          icon: Clock,
          title: 'Access Granted',
          description: 'Start discovering high-potential startups',
        },
      ],
    },
    advisor: {
      title: 'Profile Submitted',
      subtitle: 'Your advisor profile has been received.',
      description:
        'Our team is reviewing your credentials. Once approved, you\'ll be able to accept audit requests and connect with startups.',
      steps: [
        {
          icon: Shield,
          title: 'Verification',
          description: 'We verify your expertise and professional background',
        },
        {
          icon: Zap,
          title: 'Profile Activation',
          description: 'Set your expertise areas and availability',
        },
        {
          icon: Clock,
          title: 'Live to Startups',
          description: 'Start receiving audit requests and consultation offers',
        },
      ],
    },
  };

  const config = roleMessages[userRole] || roleMessages.founder;

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
          <p className={styles.emailLabel}>Confirmation sent to:</p>
          <p className={styles.emailAddress}>{email}</p>
        </div>

        {/* Process Steps */}
        <div className={styles.stepsContainer}>
          {config.steps.map((step, index) => {
            const IconComponent = step.icon;
            const isLast = index === config.steps.length - 1;
            return (
              <div
                key={index}
                className={`${styles.stepItem} ${isLast ? styles.stepItemLast : ''}`}
              >
                <div className={styles.stepIcon}>
                  <IconComponent size={20} />
                </div>
                <div className={styles.stepContent}>
                  <p className={styles.stepTitle}>{step.title}</p>
                  <p className={styles.stepDescription}>{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Message */}
        <div className={styles.infoBox}>
          <p className={styles.infoText}>
            💡 You'll receive an email notification once the review is complete. 
            Check your inbox for updates.
          </p>
        </div>

        {/* Action Button */}
        <Button variant="primary" onClick={onBackHome} className={styles.actionButton}>
          <ArrowLeft size={16} />
          <span>Back to Homepage</span>
        </Button>
      </div>
    </div>
  );
}

export default RegistrationSuccess;
