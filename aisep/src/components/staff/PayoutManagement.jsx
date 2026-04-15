import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  DollarSign, Clock, CheckCircle, XCircle, Eye, 
  Loader2, AlertCircle, FileText, Download, Calculator, 
  ChevronRight, Calendar, ArrowLeft, Search, Save, X,
  Archive
} from 'lucide-react';
import EmptyState from '../common/EmptyState';
import styles from '../../styles/OperationStaffDashboard.module.css';
import payoutService from '../../services/payoutService';
import ExcelExportUtil from '../../utils/ExcelExportUtil';
import SuccessModal from '../common/SuccessModal';
import ErrorModal from '../common/ErrorModal';
import CustomSelect from '../common/CustomSelect';

export default function PayoutManagement({ searchTerm = '' }) {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchItems, setBatchItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  
  // Feedback modals
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    try {
      const response = await payoutService.getBatches('-CreatedAt');
      setBatches(response?.items || response || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const handleViewBatch = async (batch) => {
    setSelectedBatch(batch);
    setLoadingItems(true);
    try {
      const response = await payoutService.getBatchItems(batch.monthlyPayoutBatchId);
      setBatchItems(response?.items || response || []);
    } catch (error) {
      console.error('Error fetching batch items:', error);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleExportBatch = () => {
    if (!selectedBatch || batchItems.length === 0) return;
    ExcelExportUtil.exportPayoutBatch(batchItems, selectedBatch);
  };

  const handleMarkPaid = async (item) => {
    if (!window.confirm(`Xác nhận đã thanh toán cho ${item.advisorName}?`)) return;
    try {
      await payoutService.markPaid(item.monthlyPayoutId);
      setModalMessage('Đã cập nhật trạng thái chi trả thành công.');
      setShowSuccess(true);
      // Refresh items
      handleViewBatch(selectedBatch);
    } catch (error) {
      setModalMessage(error?.message || 'Có lỗi xảy ra khi cập nhật.');
      setShowError(true);
    }
  };

  const handleRejectPayout = async (item) => {
    const reason = window.prompt(`Nhập lý do từ chối chi trả cho ${item.advisorName}:`);
    if (reason === null) return;
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do từ chối.');
      return;
    }
    
    try {
      await payoutService.rejectPayout(item.monthlyPayoutId, { reason });
      setModalMessage('Đã từ chối khoản chi trả này.');
      setShowSuccess(true);
      handleViewBatch(selectedBatch);
    } catch (error) {
      setModalMessage(error?.message || 'Có lỗi xảy ra.');
      setShowError(true);
    }
  };

  if (selectedBatch) {
    return (
      <BatchDetailView 
        batch={selectedBatch} 
        items={batchItems} 
        loading={loadingItems} 
        onBack={() => setSelectedBatch(null)} 
        onExport={handleExportBatch}
        onMarkPaid={handleMarkPaid}
        onReject={handleRejectPayout}
      />
    );
  }

  return (
    <div className={styles.withdrawSection}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '4px' }}>
              Tổng đợt chi trả
            </span>
            <span style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-primary)', lineHeight: 1 }}>
              {batches.length}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex' }}>
          <button 
            className={styles.baBtn} 
            style={{ background: 'var(--primary-blue)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '12px', height: '44px', width: 'fit-content' }}
            onClick={() => setShowGenerateModal(true)}
          >
            <Calculator size={18} /> Kết toán tháng mới
          </button>
        </div>
      </div>

      <div className={styles.pendingList}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary-blue)', margin: '0 auto' }} />
          </div>
        ) : batches.length === 0 ? (
          <EmptyState 
            icon={Calendar}
            title="Chưa có đợt chi trả nào"
            message='Hãy nhấn "Kết toán tháng mới" để bắt đầu tạo đợt chi trả đầu tiên cho các cố vấn.'
          />
        ) : (
          batches.map(batch => (
            <div key={batch.monthlyPayoutBatchId} className={styles.pendingItem} onClick={() => handleViewBatch(batch)} style={{ cursor: 'pointer' }}>
              <div className={styles.pendingItemLeft}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 className={styles.pendingItemTitle}>Kỳ thanh toán Tháng {batch.month}/{batch.year}</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>#{batch.monthlyPayoutBatchId}</span>
                </div>
                <div className={styles.pendingItemSubtitle} style={{ display: 'flex', gap: '12px' }}>
                  <span>Tạo ngày: <strong>{new Date(batch.createdAt).toLocaleDateString('vi-VN')}</strong></span>
                  <span>Nhân viên: <strong>Staff #{batch.createdByStaffId || 'System'}</strong></span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-primary)' }}>
                    {batch.totalActualPayableAmount?.toLocaleString('vi-VN')} <span style={{ fontSize: '12px' }}>VND</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Dự kiến: {batch.totalEstimatedAmount?.toLocaleString('vi-VN')} VND
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '900', color: 'var(--primary-blue)' }}>{batch.itemsCount || 0}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Advisor</span>
                  </div>
                  <ChevronRight size={20} color="var(--text-muted)" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showGenerateModal && (
        <GenerateBatchModal 
          onClose={() => setShowGenerateModal(false)} 
          onSuccess={() => { setShowGenerateModal(false); fetchBatches(); }} 
        />
      )}
      
      {showSuccess && <SuccessModal message={modalMessage} onClose={() => setShowSuccess(false)} />}
      {showError && <ErrorModal message={modalMessage} onClose={() => setShowError(true)} />}
    </div>
  );
}

function BatchDetailView({ batch, items, loading, onBack, onExport, onMarkPaid, onReject }) {
  return (
    <div className={styles.withdrawSection}>
      <div className={styles.detailHeader} style={{ marginBottom: '16px' }}>
        <button className={styles.backBtn} onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600', padding: '0' }}>
          <ArrowLeft size={18} /> Quay lại
        </button>
        <div className={styles.headerInfo} style={{ marginTop: '12px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '900', margin: '0' }}>Kỳ chi trả Tháng {batch.month}/{batch.year}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '4px 0 0 0' }}>Đối soát và xác nhận thanh toán cho các cố vấn.</p>
        </div>
        <div style={{ position: 'absolute', top: '0', right: '0' }}>
          <button className={styles.baBtn} onClick={onExport} style={{ background: 'var(--staff-success)', color: 'white', border: 'none', height: '40px', padding: '0 16px' }}>
            <Download size={16} /> Xuất Excel
          </button>
        </div>
      </div>

      <div className={styles.batchStatsStrip} style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div className={styles.stripItem} style={{ background: 'var(--bg-secondary)', padding: '12px 20px', borderRadius: '16px', border: '1px solid var(--border-color)', flex: 1, minWidth: '200px' }}>
          <span className={styles.stripLabel} style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Dự kiến</span>
          <span className={styles.stripValue} style={{ fontSize: '18px', fontWeight: 900 }}>{batch.totalEstimatedAmount?.toLocaleString('vi-VN')} <span style={{ fontSize: '12px' }}>VND</span></span>
        </div>
        <div className={styles.stripItem} style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '12px 20px', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.2)', flex: 1, minWidth: '200px' }}>
          <span className={styles.stripLabel} style={{ fontSize: '11px', textTransform: 'uppercase', color: '#10b981', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Thực tế (Đã duyệt)</span>
          <span className={styles.stripValue} style={{ fontSize: '18px', fontWeight: 900, color: '#10b981' }}>{batch.totalActualPayableAmount?.toLocaleString('vi-VN')} <span style={{ fontSize: '12px' }}>VND</span></span>
        </div>
        <div className={styles.stripItem} style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '12px 20px', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.2)', flex: 1, minWidth: '200px' }}>
          <span className={styles.stripLabel} style={{ fontSize: '11px', textTransform: 'uppercase', color: '#ef4444', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Bị từ chối</span>
          <span className={styles.stripValue} style={{ fontSize: '18px', fontWeight: 900, color: '#ef4444' }}>{batch.totalRejectedAmount?.toLocaleString('vi-VN')} <span style={{ fontSize: '12px' }}>VND</span></span>
        </div>
      </div>

      <div className={styles.pendingList}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary-blue)', margin: '0 auto' }} />
          </div>
        ) : items.length === 0 ? (
          <EmptyState 
            icon={FileText}
            title="Trống"
            message="Không tìm thấy dữ liệu chi tiết cho đợt kết toán này."
          />
        ) : (
          items.map(item => (
            <div key={item.monthlyPayoutId} className={styles.pendingItem}>
              <div className={styles.pendingItemLeft}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 className={styles.pendingItemTitle}>{item.advisorName}</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {item.advisorId}</span>
                </div>
                <div className={styles.pendingItemSubtitle} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <span>Ngân hàng: <strong>{item.bankName}</strong></span>
                  <span>Tài khoản: <strong>{item.accountNumber}</strong></span>
                  <span>Chủ thẻ: <strong>{item.accountHolderName}</strong></span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: item.status === 'Paid' ? '#10b981' : item.status === 'Rejected' ? '#ef4444' : '#f59e0b' }}>
                    {item.amount?.toLocaleString('vi-VN')} <span style={{ fontSize: '11px' }}>VND</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Chi trả cho kỳ {batch.month}/{batch.year}
                  </div>
                </div>

                <div className={styles.buttonGroup}>
                  {item.status === 'Pending' ? (
                    <>
                      <button 
                        className={styles.rejectBtnOutline}
                        onClick={() => onReject(item)}
                        title="Từ chối"
                      >
                        <XCircle size={16} /> Từ chối
                      </button>
                      <button 
                        className={styles.baBtn} 
                        style={{ background: 'var(--staff-success)', color: 'white', border: 'none', padding: '0 16px', height: '34px' }}
                        onClick={() => onMarkPaid(item)}
                        title="Xác nhận thanh toán"
                      >
                        <CheckCircle size={16} /> Duyệt
                      </button>
                    </>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span className={`${styles.statusBadge} ${item.status === 'Paid' ? styles.badgeSuccess : styles.badgeError}`}
                            style={{ 
                              background: item.status === 'Paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: item.status === 'Paid' ? '#10b981' : '#ef4444',
                              padding: '4px 12px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '700'
                            }}>
                        {item.status === 'Paid' ? 'Đã chi trả' : 'Đã từ chối'}
                      </span>
                      {item.status === 'Paid' && item.paidAt && (
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(item.paidAt).toLocaleDateString()}</span>
                      )}
                      {item.status === 'Rejected' && item.rejectReason && (
                        <span style={{ fontSize: '10px', color: '#ef4444', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.rejectReason}>
                          {item.rejectReason}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function GenerateBatchModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    month: new Date().getMonth() === 0 ? 12 : new Date().getMonth(),
    year: new Date().getMonth() === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear()
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await payoutService.generateBatch(formData);
      
      // Handle the case where the API returns success but no payouts were created
      const generatedItems = result?.items || result || [];
      if (generatedItems.length === 0) {
        setError(`Không tìm thấy dữ liệu thu nhập nào trong Tháng ${formData.month}/${formData.year} đủ điều kiện để kết toán.`);
        setLoading(false);
        return;
      }

      onSuccess();
    } catch (err) {
      setError(err?.message || 'Có lỗi xảy ra khi tạo batch. Có thể batch tháng này đã tồn tại hoặc chưa đến kỳ kết toán.');
    } finally {
      setLoading(false);
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => ({
    label: `Tháng ${i + 1}`,
    value: i + 1
  }));

  const years = [2024, 2025, 2026].map(y => ({
    label: String(y),
    value: y
  }));

  return createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Kết toán & Tạo đợt thanh toán</h3>
          <button className={styles.modalCloseBtn} onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 4px 0', lineHeight: 1.5 }}>
              Hệ thống sẽ tổng hợp tất cả thu nhập của Advisor trong tháng được chọn và tạo danh sách chi trả.
            </p>
            <div style={{ padding: '8px 12px', background: 'rgba(29, 155, 240, 0.05)', borderRadius: '8px', borderLeft: '3px solid var(--primary-blue)', marginBottom: '4px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--primary-blue)', fontWeight: 600 }}>Lưu ý: Chỉ có thể tạo 1 batch duy nhất mỗi tháng.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className={styles.formGroup}>
                <label className={styles.modalLabel}>Tháng chi trả</label>
                <CustomSelect
                  name="month"
                  value={formData.month}
                  options={months}
                  onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                  placeholder="Chọn tháng..."
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.modalLabel}>Năm</label>
                <CustomSelect
                  name="year"
                  value={formData.year}
                  options={years}
                  onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                  placeholder="Chọn năm..."
                />
              </div>
            </div>
            {error && (
              <div className={styles.modalError}>
                <AlertCircle size={16} /> {error}
              </div>
            )}
          </div>
          <div className={styles.modalFooter}>
            <button type="button" className={styles.modalCancel} onClick={onClose}>Hủy</button>
            <button type="submit" className={styles.modalSubmit} disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Bắt đầu kết toán'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
