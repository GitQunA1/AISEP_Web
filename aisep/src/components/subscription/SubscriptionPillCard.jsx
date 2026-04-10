import React, { useEffect, useState } from 'react';
import { Sparkles, Crown, ArrowRight, ShieldCheck, Loader2, Calendar, AlertCircle, RefreshCcw } from 'lucide-react';
import styles from './SubscriptionPillCard.module.css';
import subscriptionService from '../../services/subscriptionService';

/**
 * PremiumCrown - Custom SVG for a more premium look
 */
const PremiumCrown = ({ size = 20 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5Z" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <circle cx="12" cy="4" r="1.5" fill="currentColor" />
    <circle cx="3" cy="5" r="1" fill="currentColor" />
    <circle cx="21" cy="5" r="1" fill="currentColor" />
    <path d="M5 19H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/**
 * SubscriptionPillCard
 * A premium-styled mini card for the Sidebar to show subscription status.
 */
const SubscriptionPillCard = ({ user, onManage, isActive }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Determine if the user is an Investor or Startup
  const roleStr = user?.role?.toString().toLowerCase() || '';
  const roleNum = Number(user?.role);
  const isEligible = roleStr === 'investor' || roleNum === 1 || roleStr === 'startup' || roleNum === 4 || roleNum === 0;

  const fetchSubscription = async () => {
    if (!isEligible) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const data = await subscriptionService.getMySubscription();
      setSubscription(data);
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [isEligible]);
  
  // Listen for global subscription updates (e.g. from successful payments)
  useEffect(() => {
    const handleUpdate = () => fetchSubscription();
    window.addEventListener('SUBSCRIPTION_UPDATED', handleUpdate);
    return () => window.removeEventListener('SUBSCRIPTION_UPDATED', handleUpdate);
  }, []);

  if (!isEligible) return null;

  const isPremium = (subscription?.status === 1 || subscription?.status === 'Active') && 
                    subscription?.packageName && 
                    !subscription.packageName.toLowerCase().includes('cơ bản') && 
                    !subscription.packageName.toLowerCase().includes('basic');
  const packageName = subscription?.packageName || (isPremium ? 'Premium Plan' : 'Gói Miễn phí');
  const expiryDate = subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString('vi-VN') : null;

  return (
    <div 
      className={`${styles.pillCard} ${isPremium ? styles.premium : ''} ${isActive ? styles.active : ''}`}
      onClick={onManage}
      title={isPremium ? "Quản lý gói thuê bao" : "Nâng cấp gói Premium"}
    >
      {/* Unified container for smooth status rendering */}
      <div className={styles.contentWrapper}>
        <div className={styles.iconContainer}>
          {loading ? (
            <Loader2 className={styles.spin} size={20} />
          ) : error ? (
            <AlertCircle size={20} color="#ef4444" />
          ) : isPremium ? (
            <PremiumCrown size={22} />
          ) : (
            <ShieldCheck size={20} />
          )}
        </div>

        <div className={styles.info}>
          {loading ? (
            <span className={styles.loadingText}>Đang tải...</span>
          ) : error ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className={styles.errorText}>Lỗi dữ liệu</span>
              <RefreshCcw size={12} className={styles.retryIcon} onClick={(e) => {
                e.stopPropagation();
                fetchSubscription();
              }} />
            </div>
          ) : (
            <>
              <div className={`${styles.packageName} ${isPremium ? styles.premiumText : ''}`}>
                {packageName.startsWith('Gói ') ? (
                  <>
                    <div className={styles.packagePrefix}>Gói</div>
                    <div className={styles.packageValue}>{packageName.replace('Gói ', '')}</div>
                  </>
                ) : (
                  <span className={styles.truncatedText}>{packageName}</span>
                )}
              </div>
              {expiryDate && (
                <div className={styles.expiryRow}>
                  {expiryDate}
                </div>
              )}
            </>
          )}
        </div>

        {!loading && !error && (
          <button className={styles.actionBtn}>
            {isPremium ? 'Quản lý' : 'Nâng cấp'}
          </button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPillCard;
