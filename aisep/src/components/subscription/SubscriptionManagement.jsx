import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, Crown, Check, ShieldCheck, 
  ArrowRight, Loader2, CreditCard, 
  Calendar, Zap, Eye, Ticket,
  X, AlertCircle, CheckCircle2, ChevronRight
} from 'lucide-react';
import styles from './SubscriptionManagement.module.css';
import subscriptionService from '../../services/subscriptionService';
import paymentService from '../../services/paymentService';
import SubscriptionPaymentModal from './SubscriptionPaymentModal';

/**
 * SubscriptionManagement - Desktop Optimized Standalone Page
 */
const SubscriptionManagement = ({ user }) => {
  const [subscription, setSubscription] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutData, setCheckoutData] = useState(null); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPackageName, setSelectedPackageName] = useState('');

  // Role check
  const roleStr = user?.role?.toString().toLowerCase() || '';
  const roleNum = Number(user?.role);
  const isInvestor = roleStr === 'investor' || roleNum === 1;

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [subData, pkgData] = await Promise.all([
        subscriptionService.getMySubscription(),
        isInvestor ? paymentService.getInvestorPackages() : paymentService.getStartupPackages()
      ]);
      setSubscription(subData);
      setPackages(pkgData?.items || pkgData || []);
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [isInvestor]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const handleCheckout = async (pkg) => {
    setIsProcessing(true);
    setSelectedPackageName(pkg.packageName);
    try {
      const result = await paymentService.checkoutSubscription(pkg.packageId);
      setCheckoutData(result);
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Không thể khởi tạo thanh toán. Vui lòng thử lại sau.');
    } finally {
      setIsProcessing(false);
    }
  };
  const handleModalClose = useCallback(() => {
    setCheckoutData(null);
  }, []);

  const handlePaymentSuccess = useCallback(() => {
    fetchData(true); // Silent background refresh
    
    // Dispatch a global event to notify other components (like SubscriptionPillCard)
    window.dispatchEvent(new CustomEvent('SUBSCRIPTION_UPDATED'));
  }, [fetchData]);

  if (loading) {
    return (
      <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader2 className={styles.spin} size={48} color="var(--primary-blue)" />
      </div>
    );
  }

  const isPremium = (subscription?.status === 1 || subscription?.status === 'Active') && 
                    subscription?.packageName && 
                    !subscription.packageName.toLowerCase().includes('cơ bản') && 
                    !subscription.packageName.toLowerCase().includes('basic');

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Quản lý gói dịch vụ</h1>
        <p className={styles.subtitle}>Kiểm tra hiện trạng và nâng cấp các quyền lợi Premium chuyên sâu</p>
      </header>

      {/* Hero Overview: Status & Usage */}
      <section className={styles.overviewGrid}>
        {/* Current Plan Card */}
        <div className={`${styles.card} ${styles.planCard}`}>
          <div className={`${styles.planBadge} ${isPremium ? styles.premiumBadge : styles.basicBadge}`}>
            {subscription?.packageName || 'Gói Cơ bản'}
          </div>
          <h2 style={{ margin: '20px 0 12px', fontSize: '1.4rem', fontWeight: 800 }}>
             Bạn đang dùng gói {subscription?.packageName || 'Cơ bản'}
          </h2>
          
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            {subscription && (subscription.status === 1 || subscription.status === 'Active') ? (
              <>
                <div style={{ marginBottom: '4px' }}>
                  Hết hạn vào: <strong>{new Date(subscription.endDate).toLocaleDateString('vi-VN')}</strong>
                </div>
                <div>
                  Còn lại: <strong style={{ color: '#60a5fa' }}>{Math.max(0, Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)))} ngày</strong>
                </div>
              </>
            ) : (
              'Nâng cấp ngay để mở khóa các phân tích AI chuyên sâu và tương tác không giới hạn.'
            )}
          </div>

          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: (subscription && (subscription.status === 1 || subscription.status === 'Active')) ? '#10b981' : 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
             {(subscription && (subscription.status === 1 || subscription.status === 'Active')) ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
             {(subscription && (subscription.status === 1 || subscription.status === 'Active')) ? 'Gói đang hoạt động' : 'Hãy nâng cấp để có thêm quyền lợi'}
          </div>
        </div>

        {/* Real-time Usage Limits */}
        <div className={styles.card}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Hạn mức sử dụng tháng này</h3>
          </div>
          <div className={styles.usageGrid}>
            <UsageItem 
              icon={<Zap size={18} />} 
              label="Yêu cầu AI (Phân tích)" 
              used={subscription?.usedAiRequests || 0} 
              total={subscription?.maxAiRequests || 5} 
              isPremium={isPremium}
            />
            <UsageItem 
              icon={<Eye size={18} />} 
              label="Lượt xem dự án" 
              used={subscription?.usedProjectViews || 0} 
              total={subscription?.maxProjectViews || 20} 
              isPremium={isPremium}
            />
            <UsageItem 
              icon={<Ticket size={18} />} 
              label="Booking miễn phí" 
              used={subscription ? (subscription.freeBookingCount - subscription.remainingFreeBookings) : 0} 
              total={subscription?.freeBookingCount || 0} 
              isPremium={isPremium}
              reverse={true}
              remaining={subscription?.remainingFreeBookings}
            />
          </div>
        </div>
      </section>

      {/* Upgrade Options: Pricing Table */}
      <section className={styles.upgradeSection}>
        <div className={styles.pricingHeader}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Mở khóa thêm quyền lợi</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Chọn gói phù hợp nhất với nhu cầu tăng trưởng của bạn</p>
        </div>

        <div className={styles.pricingGrid}>
          {packages.map((pkg, index) => {
             const isCurrent = subscription?.packageId === pkg.packageId || 
                              (subscription?.packageName === pkg.packageName);
             const isSpecial = pkg.price > 0;
             const isFeatured = isSpecial && (pkg.packageName.toLowerCase().includes('pro') || pkg.packageName.toLowerCase().includes('nâng cao'));
             
             return (
              <div 
                key={pkg.packageId} 
                className={`${styles.pricingCard} ${isSpecial ? styles.premiumFeatured : ''}`}
              >
                {isFeatured && <div className={styles.featuredTag}>Phổ biến nhất</div>}
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{pkg.packageName}</h3>
                <div className={styles.priceContainer}>
                  <span className={styles.priceValue}>{pkg.price.toLocaleString('vi-VN')}</span>
                  <span className={styles.pricePeriod}> đ / {pkg.durationMonths} tháng</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', minHeight: '40px' }}>
                  {pkg.description}
                </p>
                
                <ul className={styles.featureList}>
                  <FeatureItem text={`${pkg.maxAiRequests} yêu cầu phân tích AI`} />
                  <FeatureItem text={`${pkg.maxProjectViews} lượt xem chi tiết dự án`} />
                  <FeatureItem text={`${pkg.freeBookingCount} lượt tư vấn miễn phí`} />
                  <FeatureItem text="Hỗ trợ ưu tiên 24/7" />
                </ul>

                <button 
                  className={`${styles.actionBtn} ${isCurrent ? styles.secondaryBtn : (isSpecial ? styles.premiumBtn : styles.primaryBtn)}`}
                  onClick={() => !isCurrent && pkg.price > 0 && handleCheckout(pkg)}
                  disabled={isProcessing || isCurrent}
                >
                  {isCurrent 
                    ? `Bạn đang sử dụng gói ${pkg.packageName}` 
                    : isProcessing ? <Loader2 className={styles.spin} /> : 'Nâng cấp ngay'}
                </button>
              </div>
             );
          })}
        </div>
      </section>

      {/* Payment Modal */}
      {checkoutData && (
        <SubscriptionPaymentModal 
          checkoutData={checkoutData}
          packageName={selectedPackageName}
          activePackageName={subscription?.packageName || 'Cơ bản'}
          isPremium={!selectedPackageName.toLowerCase().includes('cơ bản') && !selectedPackageName.toLowerCase().includes('basic')}
          onClose={handleModalClose}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

const UsageItem = ({ icon, label, used, total, isPremium, reverse, remaining }) => {
  const percentage = total > 0 ? (used / total) * 100 : 0;
  const displayUsed = reverse ? remaining : used;
  const displayLabel = reverse ? 'Còn trống' : 'Đã sử dụng';

  return (
    <div className={styles.usageItem}>
      <div className={styles.usageHeader}>
        <div className={styles.usageLabel}>
          {icon}
          <span>{label}</span>
        </div>
        <span className={styles.usageValue}>{displayUsed}/{total}</span>
      </div>
      <div className={styles.progressBar}>
        <div 
          className={`${styles.progressFill} ${isPremium ? styles.premiumFill : ''}`} 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        <span>{displayLabel}</span>
        <span>{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};

const FeatureItem = ({ text }) => (
  <li className={styles.featureItem}>
    <Check size={16} className={styles.checkIcon} />
    <span>{text}</span>
  </li>
);

export default SubscriptionManagement;
