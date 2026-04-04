import { 
  Home, Compass, Search, TrendingUp, Users, User, LayoutDashboard, 
  Sparkles, FileText, Calendar, ShieldCheck, Activity, MessageSquare, BarChart2, UserCheck
} from 'lucide-react';
import styles from './BottomNav.module.css';

/**
 * BottomNav Component - Bottom navigation bar (Mobile only)
 * Contains main navigation icons at the bottom of screen
 */
function BottomNav({ user, onShowProfile, onShowHome, onShowAdvisors, onShowInvestors, onShowDashboard, onShowAI, activeTab }) {
  let navItems = [
    { icon: Compass, label: 'Home', displayLabel: 'Khám phá', href: '#' },
    { icon: LayoutDashboard, label: 'Dashboard', displayLabel: 'Tổng quan', href: '#', showWhenLoggedIn: true },
    { icon: TrendingUp, label: 'Investors', displayLabel: 'Đầu tư', href: '#', hideFor: ['investor'] },
    { icon: Users, label: 'Advisors', displayLabel: 'Cố vấn', href: '#', hideFor: ['advisor'] },
  ];

  // Role detection
  const roleStr = user?.role?.toString().toLowerCase() || '';
  const roleNum = Number(user?.role);
  const isStaff = roleStr === 'operationstaff' || roleStr === 'operation_staff' || roleStr === 'staff' || roleNum === 3;
  const isAdvisor = roleStr === 'advisor' || roleNum === 2;

  if (isStaff) {
    const staffItems = [
      { icon: LayoutDashboard, label: 'Dashboard', displayLabel: 'Tổng quan', href: '#', showWhenLoggedIn: true },
      { icon: FileText, label: 'Projects', displayLabel: 'Dự án', href: '#', showWhenLoggedIn: true },
      { icon: Calendar, label: 'Bookings', displayLabel: 'Booking', href: '#', showWhenLoggedIn: true },
      { icon: UserCheck, label: 'AdvisorApproval', displayLabel: 'Duyệt CV', href: '#', showWhenLoggedIn: true },
      { icon: ShieldCheck, label: 'Approvals', displayLabel: 'Startup', href: '#', showWhenLoggedIn: true },
    ];
    const otherItems = navItems.filter(item => item.label !== 'Dashboard' && item.label !== 'Home');
    const homeItem = navItems.find(item => item.label === 'Home');
    navItems = [...staffItems, homeItem, ...otherItems];
  } else if (isAdvisor) {
    const advisorItems = [
      { icon: LayoutDashboard, label: 'Dashboard', displayLabel: 'Tổng quan', href: '#', showWhenLoggedIn: true },
      { icon: ShieldCheck, label: 'ApproveBookings', displayLabel: 'Duyệt', href: '#', showWhenLoggedIn: true },
      { icon: MessageSquare, label: 'Bookings', displayLabel: 'Danh sách', href: '#', showWhenLoggedIn: true },
      { icon: Calendar, label: 'Availability', displayLabel: 'Lịch rảnh', href: '#', showWhenLoggedIn: true },
      { icon: User, label: 'Profile', displayLabel: 'Hồ sơ', href: '#', showWhenLoggedIn: true },
    ];
    const homeItem = navItems.find(item => item.label === 'Home');
    navItems = [...advisorItems, homeItem];
  } else if (roleStr === 'investor' || roleNum === 1) {
    const investorItems = [
      { icon: LayoutDashboard, label: 'Dashboard', displayLabel: 'Tổng quan', href: '#', showWhenLoggedIn: true },
      { icon: Calendar, label: 'Bookings', displayLabel: 'Lịch tư vấn', href: '#', showWhenLoggedIn: true },
    ];
    const otherItems = navItems.filter(item => item.label !== 'Dashboard' && item.label !== 'Home');
    const homeItem = navItems.find(item => item.label === 'Home');
    navItems = [...investorItems, homeItem, ...otherItems];
  }

  const handleClick = (e, label) => {
    e.preventDefault();
    if (label === 'Home' && onShowHome) {
      onShowHome();
    }
    if (label === 'Dashboard' && onShowDashboard) {
      onShowDashboard('overview');
    }
    if (label === 'Projects' && onShowDashboard) {
      onShowDashboard('project_management');
    }
    if (label === 'Bookings' && onShowDashboard) {
      onShowDashboard('bookings');
    }
    if (label === 'ApproveBookings' && onShowDashboard) {
      onShowDashboard('approve_bookings');
    }
    if (label === 'Availability' && onShowDashboard) {
      onShowDashboard('availability');
    }
    if (label === 'Reports' && onShowDashboard) {
      onShowDashboard('reports');
    }
    if (label === 'Approvals' && onShowDashboard) {
      onShowDashboard('approvals');
    }
    if (label === 'AdvisorApproval' && onShowDashboard) {
      onShowDashboard('advisor_approval');
    }
    if (label === 'Advisors' && onShowAdvisors) {
      onShowAdvisors();
    }
    if (label === 'Investors' && onShowInvestors) {
      onShowInvestors();
    }
    if (label === 'Profile' && onShowProfile) {
      onShowProfile();
    }
  };

  return (
    <nav className={styles.bottomNav}>
      {navItems
        .filter(item => {
          // Hide Dashboard when user is not logged in
          if (item.showWhenLoggedIn && !user) {
            return false;
          }
          // Hide items for specific roles
          if (item.hideFor && user?.role && item.hideFor.includes(user.role)) {
            return false;
          }
          return true;
        })
        .map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`${styles.navButton} ${activeTab === item.label ? styles.active : ''}`}
            onClick={(e) => handleClick(e, item.label)}
          >
            <item.icon size={24} />
            <span className={styles.label}>{item.displayLabel || item.label}</span>
          </a>
        ))}
    </nav>
  );
}

export default BottomNav;
