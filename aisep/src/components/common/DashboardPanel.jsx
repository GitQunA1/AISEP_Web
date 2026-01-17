import { X } from 'lucide-react';
import StartupDashboard from '../layout/StartupDashboard';
import InvestorDashboard from '../layout/InvestorDashboard';
import AdvisorDashboard from '../layout/AdvisorDashboard';
import styles from './DashboardPanel.module.css';

export default function DashboardPanel({ user, isOpen, onClose, onLogout }) {
  if (!user) return null;

  const getDashboardComponent = () => {
    if (user.role === 'startup') {
      return <StartupDashboard user={user} onLogout={onLogout} />;
    } else if (user.role === 'investor') {
      return <InvestorDashboard user={user} onLogout={onLogout} />;
    } else if (user.role === 'advisor') {
      return <AdvisorDashboard user={user} onLogout={onLogout} />;
    }
    return null;
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className={styles.overlay} onClick={onClose}></div>
      )}

      {/* Panel */}
      <div className={`${styles.dashboardPanel} ${isOpen ? styles.open : ''}`}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={24} />
        </button>
        <div className={styles.panelContent}>
          {getDashboardComponent()}
        </div>
      </div>
    </>
  );
}
