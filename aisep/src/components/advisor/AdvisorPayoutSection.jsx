import React, { useState, useEffect, useCallback } from 'react';
import { Landmark, CreditCard, History, AlertCircle, CheckCircle, XCircle, Clock, Loader2, Save, ExternalLink } from 'lucide-react';
import styles from './AdvisorPayoutSection.module.css';
import bankAccountService from '../../services/bankAccountService';
import payoutService from '../../services/payoutService';
import bankService from '../../services/bankService';
import BankSelect from '../common/BankSelect';
import SuccessModal from '../common/SuccessModal';
import ErrorModal from '../common/ErrorModal';

export default function AdvisorPayoutSection({ user }) {
  const [activeTab, setActiveTab] = useState('account'); // 'account' or 'history'
  const [bankAccount, setBankAccount] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Modals
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountHolderName: ''
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Load global bank list first (essential for UI)
      try {
        const bankList = await bankService.getVietQRBanks();
        setBanks(bankList);
      } catch (bankErr) {
        console.error('Failed to load global bank list:', bankErr);
      }

      // 2. Load advisor-specific data in parallel
      const [myBank, history] = await Promise.all([
        bankAccountService.getMyBank(),
        payoutService.getMyPayouts()
      ]);

      if (myBank) {
        setBankAccount(myBank);
        setFormData({
          bankName: myBank.bankName || '',
          accountNumber: myBank.accountNumber || '',
          accountHolderName: myBank.accountHolderName || ''
        });
      }
      
      setPayouts(history?.items || history || []);
    } catch (error) {
      console.error('Error loading advisor payout state:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveBank = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (bankAccount) {
        await bankAccountService.updateMyBank(bankAccount.advisorBankAccountId, formData);
      } else {
        await bankAccountService.createMyBank(formData);
      }
      setModalMessage('Cập nhật thông tin ngân hàng thành công!');
      setShowSuccess(true);
      loadData();
    } catch (error) {
      setModalMessage(error?.message || 'Không thể lưu thông tin ngân hàng.');
      setShowError(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className="animate-spin" size={40} />
        <p>Đang tải thông tin thanh toán...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'account' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('account')}
        >
          <Landmark size={18} />
          Cài đặt thanh toán
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'history' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <History size={18} />
          Lịch sử chi trả
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'account' ? (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Thông tin tài khoản ngân hàng</h3>
              <p>Mọi khoản thanh toán hàng tháng sẽ được chuyển về tài khoản này.</p>
            </div>
            
            <form onSubmit={handleSaveBank} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Ngân hàng</label>
                <BankSelect 
                  options={banks}
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="Tìm và chọn ngân hàng..."
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Số tài khoản</label>
                  <input 
                    type="text" 
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="Ví dụ: 0123456789"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Tên chủ tài khoản</label>
                  <input 
                    type="text" 
                    value={formData.accountHolderName}
                    onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value.toUpperCase() })}
                    placeholder="NGUYEN VAN A"
                    required
                  />
                </div>
              </div>

              <div className={styles.infoBox}>
                <AlertCircle size={20} />
                <p>Thông tin này được sử dụng để đối soát các khoản thu nhập từ các phiên tư vấn. Vui lòng đảm bảo thông tin chính xác tuyệt đối.</p>
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Lưu thông tin
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className={styles.historyCard}>
            <div className={styles.historyHeader}>
              <h3>Lịch sử thanh toán hàng tháng</h3>
              <div className={styles.statusLegend}>
                <span className={styles.dotPending}>Chờ xử lý</span>
                <span className={styles.dotPaid}>Đã thanh toán</span>
                <span className={styles.dotRejected}>Từ chối</span>
              </div>
            </div>

            <div className={styles.tableWrapper}>
              {payouts.length === 0 ? (
                <div className={styles.emptyState}>
                  <CreditCard size={48} opacity={0.2} />
                  <p>Bạn chưa có lịch sử thanh toán nào trong hệ thống.</p>
                </div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Kỳ thanh toán</th>
                      <th>Số tiền</th>
                      <th>Ngân hàng nhận</th>
                      <th>Trạng thái</th>
                      <th>Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((p) => {
                      const status = p.status;
                      const statusClass = status === 'Paid' ? styles.statusPaid : 
                                          status === 'Rejected' ? styles.statusRejected : styles.statusPending;
                      const statusText = status === 'Paid' ? 'Đã chi trả' : 
                                         status === 'Rejected' ? 'Bị từ chối' : 'Đang xử lý';

                      return (
                        <tr key={p.monthlyPayoutId}>
                          <td className={styles.periodCell}>
                            <strong>Tháng {p.month}/{p.year}</strong>
                          </td>
                          <td className={styles.amountCell}>
                            {p.amount.toLocaleString('vi-VN')} <span>₫</span>
                          </td>
                          <td>
                            <div className={styles.bankSnapshot}>
                              <span className={styles.bankName}>{p.bankName}</span>
                              <span className={styles.bankAcc}>{p.accountNumber}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`${styles.statusBadge} ${statusClass}`}>
                              {status === 'Paid' && <CheckCircle size={12} />}
                              {status === 'Rejected' && <XCircle size={12} />}
                              {status === 'Pending' && <Clock size={12} />}
                              {statusText}
                            </span>
                          </td>
                          <td className={styles.actionsCell}>
                            <div className={styles.noteTip}>
                              {p.paidAt && <span className={styles.dateMeta}>Vào: {new Date(p.paidAt).toLocaleDateString('vi-VN')}</span>}
                              {p.rejectReason && <span className={styles.rejectTip}>{p.rejectReason}</span>}
                              {!p.paidAt && !p.rejectReason && <span className={styles.mutedMeta}>Đang đối soát</span>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {showSuccess && <SuccessModal message={modalMessage} onClose={() => setShowSuccess(false)} />}
      {showError && <ErrorModal message={modalMessage} onClose={() => setShowError(false)} />}
    </div>
  );
}
