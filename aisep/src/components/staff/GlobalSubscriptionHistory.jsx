import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Calendar, 
  Crown, User, UserCheck, 
  ArrowUpRight, Loader2, 
  ChevronLeft, ChevronRight 
} from 'lucide-react';
import styles from './StaffSubscription.module.css';
import subscriptionService from '../../services/subscriptionService';

const GlobalSubscriptionHistory = ({ searchTerm = '' }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      // Backend filtering for /api/Subscriptions appears to be ignored or unsupported.
      // We'll fetch a larger set (100) and perform robust client-side filtering to ensure it works.
      const response = await subscriptionService.getAllSubscriptions({ 
        page: pageNumber, 
        pageSize: 100 
      });
      
      if (response && response.items) {
        setSubscriptions(response.items);
        setTotalPages(Math.ceil(response.totalCount / pageSize));
      } else {
        setSubscriptions(response || []);
      }
    } catch (error) {
      console.error('Failed to fetch global subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPageNumber(1); // Reset to first page when search changes
  }, [searchTerm]);

  useEffect(() => {
    const timer = setTimeout(fetchSubscriptions, 500); // Debounce search
    return () => clearTimeout(timer);
  }, [searchTerm, pageNumber]);

  const getStatusLabel = (status) => {
    if (status === 1 || status === 'Active') return { label: 'Đang hoạt động', class: styles.active };
    if (status === 2 || status === 'Expired') return { label: 'Hết hạn', class: styles.expired };
    return { label: 'Chờ xử lý', class: styles.pending };
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase().trim();
    return (
      (sub.userName || '').toLowerCase().includes(search) ||
      (sub.packageName || '').toLowerCase().includes(search) ||
      (sub.userId || '').toString().toLowerCase().includes(search)
    );
  });

  return (
    <div className={styles.container}>

      <div className={styles.tableContainer}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
            <Loader2 className={styles.spin} size={40} color="var(--primary-blue)" />
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className={`${styles.tableContainer} ${styles.desktopOnly}`}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={`${styles.th} ${styles.colUser}`}>Người dùng</th>
                    <th className={`${styles.th} ${styles.colDuration}`}>Gói dịch vụ</th>
                    <th className={`${styles.th} ${styles.colDate}`}>Ngày bắt đầu</th>
                    <th className={`${styles.th} ${styles.colDate}`}>Ngày hết hạn</th>
                    <th className={`${styles.th} ${styles.colAi}`}>Sử dụng AI</th>
                    <th className={`${styles.th} ${styles.colStatus}`}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                           <Filter size={32} style={{ opacity: 0.2 }} />
                           <span>Không tìm thấy dữ liệu đăng ký nào.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredSubscriptions.map((sub) => {
                      const status = getStatusLabel(sub.status);
                      return (
                        <tr key={sub.subscriptionId} className={styles.tr}>
                          <td className={`${styles.td} ${styles.colUser}`}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                               <div className={styles.userAvatar} style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                                  <User size={18} color="var(--primary-blue)" />
                               </div>
                               <div>
                                  <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)' }}>{sub.userName || 'Người dùng'}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', fontFamily: 'monospace' }}>ID: {sub.userId}</div>
                               </div>
                            </div>
                          </td>
                          <td className={`${styles.td} ${styles.colDuration}`}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Crown size={14} color="#daa520" />
                                <span style={{ fontWeight: 700, fontSize: '13px' }}>{sub.packageName}</span>
                             </div>
                          </td>
                          <td className={`${styles.td} ${styles.colDate}`} style={{ fontSize: '13px', fontWeight: 600 }}>
                            {new Date(sub.startDate).toLocaleDateString('vi-VN')}
                          </td>
                          <td className={`${styles.td} ${styles.colDate}`} style={{ fontSize: '13px', fontWeight: 600 }}>
                            {new Date(sub.endDate).toLocaleDateString('vi-VN')}
                          </td>
                          <td className={`${styles.td} ${styles.colAi}`}>
                             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{sub.usedAiRequests}</span>
                                <span style={{ opacity: 0.4, fontWeight: 400 }}>/</span>
                                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{sub.maxAiRequests || '-'}</span>
                             </div>
                          </td>
                          <td className={`${styles.td} ${styles.colStatus}`}>
                            <span className={`${styles.statusBadge} ${status.class}`} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className={styles.mobileOnly}>
              <div className={styles.mobileCards}>
                 {filteredSubscriptions.length === 0 && (
                   <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                      Không tìm thấy dữ liệu đăng ký nào.
                   </div>
                 )}
                 {filteredSubscriptions.map((sub) => {
                    const status = getStatusLabel(sub.status);
                    return (
                       <div key={sub.subscriptionId} className={styles.mobileCard}>
                          <div className={styles.mobileCardHeader}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                                   <User size={20} color="var(--primary-blue)" />
                                </div>
                                <div>
                                   <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '15px' }}>{sub.userName}</div>
                                   <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>ID: {sub.userId}</div>
                                </div>
                             </div>
                             <span className={`${styles.statusBadge} ${status.class}`}>{status.label}</span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Crown size={14} color="#daa520" />
                                <span style={{ fontSize: '14px', fontWeight: 700 }}>{sub.packageName}</span>
                             </div>
                             <div style={{ fontSize: '13px', fontWeight: 700 }}>
                                {sub.usedAiRequests} <span style={{ opacity: 0.4 }}>/</span> {sub.maxAiRequests || '-'} AI
                             </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Bắt đầu</span>
                                <span style={{ fontSize: '13px', fontWeight: 600 }}>{new Date(sub.startDate).toLocaleDateString('vi-VN')}</span>
                             </div>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end' }}>
                                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Hết hạn</span>
                                <span style={{ fontSize: '13px', fontWeight: 600 }}>{new Date(sub.endDate).toLocaleDateString('vi-VN')}</span>
                             </div>
                          </div>
                       </div>
                    );
                 })}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ padding: '16px', display: 'flex', justifyContent: 'center', gap: '12px', alignItems: 'center', borderTop: '1px solid var(--border-color)' }}>
                <button 
                   className={styles.editBtn} 
                   disabled={pageNumber === 1}
                   onClick={() => setPageNumber(prev => prev - 1)}
                >
                   <ChevronLeft size={18} />
                </button>
                <span style={{ fontWeight: 600 }}>Trang {pageNumber} / {totalPages}</span>
                <button 
                   className={styles.editBtn} 
                   disabled={pageNumber === totalPages}
                   onClick={() => setPageNumber(prev => prev + 1)}
                >
                   <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GlobalSubscriptionHistory;
