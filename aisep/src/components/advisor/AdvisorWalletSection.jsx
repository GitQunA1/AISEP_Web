import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, DollarSign, Clock, ArrowUpRight, CheckCircle, XCircle, AlertCircle, Loader2, Search, ExternalLink, X, Landmark } from 'lucide-react';
import styles from './WalletSection.module.css';
import walletService from '../../services/walletService';

export default function AdvisorWalletSection({ advisorProfile, user }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Stats from backend
  const [walletSummary, setWalletSummary] = useState(null);

  const loadWalletData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    setError(null);
    try {
      // 1. Get Wallet Summary
      const summaryRes = await walletService.getMyWallet();
      setWalletSummary(summaryRes?.data || summaryRes);

      // 2. Get Transaction History
      const transRes = await walletService.getMyTransactions('-CreatedAt');
      const transItems = transRes?.items || transRes?.data?.items || (Array.isArray(transRes) ? transRes : []);
      setTransactions(transItems);
      
    } catch (err) {
      console.error('Failed to load wallet data', err);
      const statusCode = err?.statusCode || err?.response?.status;
      const errorMsg = (err?.message || "").toLowerCase();
      
      if (statusCode === 404 || errorMsg.includes("not found")) {
        setError("Dữ liệu thu nhập chưa được khởi tạo. Thông thường mục này sẽ được kích hoạt sau khi hồ sơ cố vấn của bạn được phê duyệt. Vui lòng liên hệ quản trị viên nếu bạn tin rằng đây là lỗi.");
      } else {
        setError('Không thể kết nối với máy chủ ví. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWalletData();
  }, [loadWalletData]);

  // Helper to get total payouts from completed transactions
  const totalPayoutReceived = transactions
    .filter(t => (t.type === 'Payout' || t.type === 2) && (t.status === 'Completed' || t.status === 0))
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  if (loading) {
    return (
      <div className={styles.walletSection} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <Loader2 size={48} className="animate-spin" style={{ color: 'var(--primary-blue)', marginBottom: '16px' }} />
        <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Đang tải thông tin tài chính...</p>
      </div>
    );
  }

  return (
    <div className={styles.walletSection}>
      {error && (
        <div style={{ 
          background: 'rgba(29, 155, 240, 0.05)', 
          border: '1px solid rgba(29, 155, 240, 0.2)', 
          padding: '20px', 
          borderRadius: '16px', 
          marginBottom: '32px',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          color: 'var(--primary-blue)'
        }}>
          <AlertCircle size={24} style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', lineHeight: '1.5', color: 'var(--text-primary)' }}>{error}</p>
          <button 
            onClick={() => loadWalletData(true)}
            className={styles.walletSecondaryBtn}
            style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}
          >
            Thử lại
          </button>
        </div>
      )}

      <div className={styles.walletStatsGrid}>
        <div className={styles.walletStatCard}>
          <div className={`${styles.walletStatIcon} ${styles.walletIconBlue}`}>
            <CreditCard size={24} />
          </div>
          
          <div className={styles.walletStatInfo}>
            <div className={styles.walletStatValue}>
              {walletSummary ? (walletSummary.balance || 0).toLocaleString('vi-VN') : '0'} 
              <span style={{ fontSize: '14px', marginLeft: '4px', opacity: 0.7 }}>VND</span>
            </div>
            <div className={styles.walletStatLabel}>Số dư hiện tại</div>
          </div>
        </div>

        <div className={styles.walletStatCard}>
          <div className={`${styles.walletStatIcon} ${styles.walletIconGreen}`}>
            <DollarSign size={24} />
          </div>
          <div className={styles.walletStatInfo}>
            <div className={styles.walletStatValue}>
              {totalPayoutReceived.toLocaleString('vi-VN')} 
              <span style={{ fontSize: '14px', marginLeft: '4px', opacity: 0.7 }}>VND</span>
            </div>
            <div className={styles.walletStatLabel}>Đã nhận thanh toán</div>
          </div>
        </div>
      </div>

      <div className={styles.walletHistoryCard}>
        <div className={styles.walletCardHeader}>
          <h3 className={styles.walletCardTitle}>Lịch sử giao dịch</h3>
          <button className={styles.walletSecondaryBtn} onClick={() => loadWalletData(true)} disabled={refreshing}>
            {refreshing ? <Loader2 size={14} className="animate-spin" /> : 'Làm mới dữ liệu'}
          </button>
        </div>

        <div className={styles.walletTableContainer}>
          <table className={styles.walletTable}>
            <thead>
              <tr>
                <th className={styles.walletTableHead}>Thời gian</th>
                <th className={styles.walletTableHead}>Loại giao dịch</th>
                <th className={styles.walletTableHead}>Số tiền</th>
                <th className={styles.walletTableHead}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="4" className={styles.walletTableData}>
                    <div className={styles.walletEmptyState}>
                      <ArrowUpRight size={40} opacity={0.2} />
                      <p>Chưa có giao dịch nào được ghi nhận.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((t, idx) => {
                  const isPlus = (t.type === 'Deposit' || t.type === 0);
                  const isPayout = (t.type === 'Payout' || t.type === 2);
                  const isWithdraw = (t.type === 'Withdrawal' || t.type === 1);
                  
                  return (
                    <tr key={t.walletTransactionId || idx} className={styles.walletTableRow}>
                      <td className={styles.walletTableData}>
                        <div style={{ fontWeight: 600 }}>{new Date(t.createdAt).toLocaleDateString('vi-VN')}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {new Date(t.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className={styles.walletTableData}>
                        <span className={`${styles.walletTypeBadge} ${isPlus ? styles.walletTypeDeposit : styles.walletTypeWithdraw}`}>
                          {isPlus ? 'Nhận thu nhập' : isPayout ? 'Chi trả định kỳ' : 'Rút tiền'}
                        </span>
                      </td>
                      <td className={`${styles.walletTableData} ${styles.walletAmountCell}`} style={{ color: isPlus ? '#10b981' : isPayout ? '#ef4444' : 'var(--text-primary)' }}>
                        {isPlus ? '+' : '-'}{t.amount?.toLocaleString('vi-VN')} 
                        <span style={{ fontSize: '10px', marginLeft: '4px' }}>VND</span>
                      </td>
                      <td className={styles.walletTableData}>
                        <span className={`${styles.walletBadge} ${
                          (t.status === 'Pending' || t.status === 1) ? styles.walletBadgePending :
                          (t.status === 'Completed' || t.status === 0) ? styles.walletBadgeApproved : styles.walletBadgeRejected
                        }`}>
                          {(t.status === 'Pending' || t.status === 1) ? 'Đang xử lý' :
                           (t.status === 'Completed' || t.status === 0) ? 'Đã xong' : 'Thất bại'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
