import { LogOut, Menu } from 'lucide-react';
import styles from './UserProfilePanel.module.css';

export default function UserProfilePanel({ user, onLogout, onOpenDashboard }) {
  return (
    <div className={styles.profilePanel}>
      <div className={styles.profileHeader}>
        <div className={styles.avatar}>
          {user.avatar || user.name.charAt(0).toUpperCase()}
        </div>
      </div>

      <div className={styles.profileInfo}>
        <h3 className={styles.userName}>{user.name}</h3>
        <p className={styles.userRole}>{user.role}</p>
        <p className={styles.userCompany}>{user.companyName}</p>
      </div>

      <div className={styles.profileActions}>
        <button 
          className={styles.dashboardBtn}
          onClick={onOpenDashboard}
          title="Open Dashboard"
        >
          <Menu size={18} />
          <span>Dashboard</span>
        </button>
        
        <button 
          className={styles.logoutBtn}
          onClick={onLogout}
          title="Logout"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
