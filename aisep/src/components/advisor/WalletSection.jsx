import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, DollarSign, Clock, ArrowUpRight, CheckCircle, XCircle, AlertCircle, Loader2, Search, ExternalLink, X, Landmark } from 'lucide-react';
import styles from './WalletSection.module.css';
import walletService from '../../services/walletService';

export default function WalletSection({ advisorProfile, user }) {
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' or 'withdrawals'

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

      // 2. Get Transaction History (Always load both or switch based on tab? Let's load both for now for counts)
      const transRes = await walletService.getMyTransactions('-CreatedAt');
      const transItems = transRes?.items || transRes?.data?.items || (Array.isArray(transRes) ? transRes : []);
      setTransactions(transItems);

      // 3. Get Withdrawal Requests
      const withdrawRes = await walletService.getMyWithdrawRequests('-RequestedAt');
      const withdrawItems = withdrawRes?.items || withdrawRes?.data?.items || (Array.isArray(withdrawRes) ? withdrawRes : []);
      setWithdrawHistory(withdrawItems);
      
    } catch (err) {
      console.error('Failed to load wallet data', err);
      // Robust detection for Wallet Not Found (apiClient normalizes errors)
      const statusCode = err?.statusCode || err?.response?.status;
      const errorList = err?.errors || err?.response?.data?.errors || [];
      const errorMsg = (err?.message || "").toLowerCase();
      
      const isNotFound = statusCode === 404 || 
                         errorList.some(e => e.toLowerCase().includes("not found") || e.toLowerCase().includes("wallet")) ||
                         errorMsg.includes("wallet not found") ||
                         errorMsg.includes("not found");

      if (isNotFound) {
        setError("Tài khoản cố vấn của bạn chưa có ví thu nhập trong hệ thống. Hãy thực hiện cập nhật thông tin hồ sơ cố vấn, ví của bạn sẽ được tạo sau khi nhân viên của chúng tôi phê duyệt hồ sơ thành công.");
      } else {
        setError('Không thể kết nối với máy chủ ví. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWalletData();
  }, [loadWalletData]);

  const handleWithdrawSuccess = () => {
    setShowWithdrawModal(false);
    loadWalletData(true);
  };

  // Helper to get total withdrawn from completed transactions
  const totalWithdrawn = transactions
    .filter(t => (t.type === 'Withdrawal' || t.type === 1) && (t.status === 'Completed' || t.status === 0))
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
          background: 'rgba(244, 33, 46, 0.05)', 
          border: '1px solid rgba(244, 33, 46, 0.2)', 
          padding: '16px', 
          borderRadius: '12px', 
          marginBottom: '32px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          color: '#f4212e'
        }}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', lineHeight: '1.5' }}>{error}</p>
          <button 
            onClick={() => loadWalletData(true)}
            style={{ marginLeft: 'auto', background: 'white', border: '1px solid var(--border-color)', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap' }}
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
          
          <button 
            className={styles.walletCardActionIcon}
            onClick={() => setShowWithdrawModal(true)}
            disabled={!advisorProfile?.advisorId || (walletSummary?.availableBalance || 0) <= 0}
            title={(walletSummary?.availableBalance || 0) <= 0 ? "Số dư không đủ" : "Rút tiền"}
          >
            <Landmark size={20} />
          </button>

          <div className={styles.walletStatInfo}>
            <div className={styles.walletStatValue}>
              {walletSummary ? (walletSummary.availableBalance || 0).toLocaleString('vi-VN') : '0'} 
              <span style={{ fontSize: '14px', marginLeft: '4px', opacity: 0.7 }}>VND</span>
            </div>
            <div className={styles.walletStatLabel}>Số dư khả dụng</div>
          </div>
        </div>

        <div className={styles.walletStatCard}>
          <div className={`${styles.walletStatIcon} ${styles.walletIconOrange}`}>
            <Clock size={24} />
          </div>
          <div className={styles.walletStatInfo}>
            <div className={styles.walletStatValue}>
              {walletSummary ? (walletSummary.pendingWithdrawAmount || 0).toLocaleString('vi-VN') : '0'} 
              <span style={{ fontSize: '14px', marginLeft: '4px', opacity: 0.7 }}>VND</span>
            </div>
            <div className={styles.walletStatLabel}>Đang chờ xử lý</div>
          </div>
        </div>

        <div className={styles.walletStatCard}>
          <div className={`${styles.walletStatIcon} ${styles.walletIconGreen}`}>
            <DollarSign size={24} />
          </div>
          <div className={styles.walletStatInfo}>
            <div className={styles.walletStatValue}>
              {totalWithdrawn.toLocaleString('vi-VN')} 
              <span style={{ fontSize: '14px', marginLeft: '4px', opacity: 0.7 }}>VND</span>
            </div>
            <div className={styles.walletStatLabel}>Tổng đã rút</div>
          </div>
        </div>
      </div>

      <div className={styles.walletHistoryCard}>
        <div className={styles.walletCardHeader} style={{ borderBottom: 'none' }}>
          <h3 className={styles.walletCardTitle}>Hoạt động tài chính</h3>
          <button className={styles.walletSecondaryBtn} onClick={() => loadWalletData(true)} disabled={refreshing}>
            {refreshing ? <Loader2 size={14} className="animate-spin" /> : 'Làm mới'}
          </button>
        </div>

        <div className={styles.walletTabsContainer}>
          <button 
            className={`${styles.walletTab} ${activeTab === 'transactions' ? styles.walletTabActive : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            Lịch sử giao dịch
            <span className={styles.walletTabCount}>{transactions.length}</span>
          </button>
          <button 
            className={`${styles.walletTab} ${activeTab === 'withdrawals' ? styles.walletTabActive : ''}`}
            onClick={() => setActiveTab('withdrawals')}
          >
            Yêu cầu rút tiền
            <span className={styles.walletTabCount}>{withdrawHistory.length}</span>
          </button>
        </div>

        <div className={styles.walletTableContainer}>
          <table className={styles.walletTable}>
            <thead>
              {activeTab === 'transactions' ? (
                <tr>
                  <th className={styles.walletTableHead}>Thời gian</th>
                  <th className={styles.walletTableHead}>Loại</th>
                  <th className={styles.walletTableHead}>Số tiền</th>
                  <th className={styles.walletTableHead}>Trạng thái</th>
                </tr>
              ) : (
                <tr>
                  <th className={styles.walletTableHead}>Thời gian</th>
                  <th className={styles.walletTableHead}>Số tiền</th>
                  <th className={styles.walletTableHead}>Ngân hàng</th>
                  <th className={styles.walletTableHead}>Trạng thái</th>
                  <th className={styles.walletTableHead}>Minh chứng</th>
                </tr>
              )}
            </thead>
            <tbody>
              {refreshing && (activeTab === 'transactions' ? transactions.length === 0 : withdrawHistory.length === 0) ? (
                <tr>
                  <td colSpan={activeTab === 'transactions' ? "4" : "5"} className={styles.walletTableData} style={{ textAlign: 'center', padding: '40px' }}>
                    <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto' }} />
                  </td>
                </tr>
              ) : activeTab === 'transactions' ? (
                transactions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className={styles.walletTableData}>
                      <div className={styles.walletEmptyState}>
                        <ArrowUpRight size={40} opacity={0.2} />
                        <p>Chưa có giao dịch nào phát sinh.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((t, idx) => (
                    <tr key={t.walletTransactionId || idx} className={styles.walletTableRow}>
                      <td className={styles.walletTableData}>
                        <div style={{ fontWeight: 600 }}>{new Date(t.createdAt).toLocaleDateString('vi-VN')}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {new Date(t.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className={styles.walletTableData}>
                        <span className={`${styles.walletTypeBadge} ${(t.type === 'Deposit' || t.type === 0) ? styles.walletTypeDeposit : styles.walletTypeWithdraw}`}>
                          {(t.type === 'Deposit' || t.type === 0) ? 'Nhận tiền' : 'Rút tiền'}
                        </span>
                      </td>
                      <td className={`${styles.walletTableData} ${styles.walletAmountCell}`} style={{ color: (t.type === 'Deposit' || t.type === 0) ? '#10b981' : 'var(--text-primary)' }}>
                        {(t.type === 'Deposit' || t.type === 0) ? '+' : '-'}{t.amount?.toLocaleString('vi-VN')} 
                        <span style={{ fontSize: '10px', marginLeft: '4px' }}>VND</span>
                      </td>
                      <td className={styles.walletTableData}>
                        <span className={`${styles.walletBadge} ${
                          (t.status === 'Pending' || t.status === 1) ? styles.walletBadgePending :
                          (t.status === 'Completed' || t.status === 0) ? styles.walletBadgeApproved : styles.walletBadgeRejected
                        }`}>
                          {(t.status === 'Pending' || t.status === 1) ? 'Đang xử lý' :
                           (t.status === 'Completed' || t.status === 0) ? 'Thành công' : 'Thất bại'}
                        </span>
                      </td>
                    </tr>
                  ))
                )
              ) : (
                withdrawHistory.length === 0 ? (
                  <tr>
                    <td colSpan="5" className={styles.walletTableData}>
                      <div className={styles.walletEmptyState}>
                        <Clock size={40} opacity={0.2} />
                        <p>Chưa có yêu cầu rút tiền nào.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  withdrawHistory.map((req, idx) => (
                    <tr key={req.withdrawRequestId || idx} className={styles.walletTableRow}>
                      <td className={styles.walletTableData}>
                        <div style={{ fontWeight: 600 }}>{new Date(req.requestedAt).toLocaleDateString('vi-VN')}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {new Date(req.requestedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className={`${styles.walletTableData} ${styles.walletAmountCell}`}>
                        {req.amount?.toLocaleString('vi-VN')} <span style={{ fontSize: '10px' }}>VND</span>
                      </td>
                      <td className={styles.walletTableData}>
                        <div className={styles.walletBankInfo}>
                          <span className={styles.walletBankName}>{req.bankName}</span>
                          <span className={styles.walletBankAccount}>{req.bankAccount}</span>
                        </div>
                      </td>
                      <td className={styles.walletTableData}>
                        <span className={`${styles.walletBadge} ${
                          (req.status === 'Pending' || req.status === 0) ? styles.walletBadgePending :
                          (req.status === 'Approved' || req.status === 1) ? styles.walletBadgeApproved : styles.walletBadgeRejected
                        }`}>
                          {(req.status === 'Pending' || req.status === 0) ? 'Đang chờ' :
                           (req.status === 'Approved' || req.status === 1) ? 'Thành công' : 'Từ chối'}
                        </span>
                      </td>
                      <td className={styles.walletTableData}>
                        {req.proofImageUrl ? (
                          <a href={req.proofImageUrl} target="_blank" rel="noopener noreferrer" className={styles.walletProofLink}>
                            <ExternalLink size={14} />
                            Xem ảnh
                          </a>
                        ) : (req.rejectionReason && (req.status === 'Rejected' || req.status === 2)) ? (
                          <div style={{ color: '#f4212e', fontSize: '12px', maxWidth: '150px' }} title={req.rejectionReason}>
                            Lý do: {req.rejectionReason}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showWithdrawModal && (
        <WithdrawRequestModal 
          onClose={() => setShowWithdrawModal(false)}
          onSuccess={handleWithdrawSuccess}
        />
      )}
    </div>
  );
}

function WithdrawRequestModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    amount: '',
    bankName: '',
    bankAccount: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) {
      setError('Số tiền không hợp lệ.');
      return;
    }
    if (!formData.bankName || !formData.bankAccount) {
      setError('Vui lòng nhập đầy đủ thông tin ngân hàng.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await walletService.createWithdrawRequest({
        amount: Number(formData.amount),
        bankName: formData.bankName,
        bankAccount: formData.bankAccount
      });
      onSuccess();
    } catch (err) {
      console.error('Withdraw error', err);
      setError(err?.response?.data?.message || 'Lỗi khi tạo yêu cầu. Vui lòng kiểm tra lại số dư.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.walletModalOverlay} onClick={onClose}>
      <div className={styles.walletModalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.walletModalHeader}>
          <h4 className={styles.walletModalTitle}>Tạo yêu cầu rút tiền</h4>
          <button className={styles.walletCloseBtn} onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.walletModalBody}>
            <div className={styles.walletFormGroup}>
              <label className={styles.walletLabel}>Số tiền rút (VND)</label>
              <input 
                type="number" 
                className={styles.walletInput}
                placeholder="Ví dụ: 500000"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                required
              />
            </div>
            <div className={styles.walletFormGroup}>
              <label className={styles.walletLabel}>Tên ngân hàng</label>
              <input 
                type="text" 
                className={styles.walletInput}
                placeholder="Ví dụ: Vietcombank, MB Bank..."
                value={formData.bankName}
                onChange={e => setFormData({...formData, bankName: e.target.value})}
                required
              />
            </div>
            <div className={styles.walletFormGroup}>
              <label className={styles.walletLabel}>Số tài khoản & Tên chủ thẻ</label>
              <input 
                type="text" 
                className={styles.walletInput}
                placeholder="Số tài khoản - Họ tên"
                value={formData.bankAccount}
                onChange={e => setFormData({...formData, bankAccount: e.target.value})}
                required
              />
            </div>

            {error && (
              <div style={{ color: '#f4212e', fontSize: '13px', display: 'flex', gap: '8px', marginTop: '12px', background: 'rgba(244, 33, 46, 0.05)', padding: '10px', borderRadius: '8px' }}>
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{error}</span>
              </div>
            )}
          </div>
          <div className={styles.walletModalFooter}>
            <button type="button" className={styles.walletCancelBtn} onClick={onClose}>Hủy</button>
            <button type="submit" className={styles.walletSubmitBtn} disabled={submitting}>
              {submitting ? <Loader2 size={18} className="animate-spin" style={{ margin: '0 auto' }} /> : 'Gửi yêu cầu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
