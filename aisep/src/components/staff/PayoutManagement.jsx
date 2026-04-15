import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  DollarSign, Clock, CheckCircle, XCircle, Eye, 
  Loader2, AlertCircle, FileText, Download, Calculator, 
  ChevronRight, Calendar, ArrowLeft, Search, Save, X,
  Archive, RefreshCw, Info
} from 'lucide-react';
import EmptyState from '../common/EmptyState';
import styles from '../../styles/OperationStaffDashboard.module.css';
import payoutService from '../../services/payoutService';
import ExcelExportUtil from '../../utils/ExcelExportUtil';
import SuccessModal from '../common/SuccessModal';
import ErrorModal from '../common/ErrorModal';
import DateRangePicker from '../common/DateRangePicker';

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
      const response = await payoutService.getBatches({ sorts: '-createdAt', pageSize: 100 });
      setBatches(response?.data?.items || response?.items || response || []);
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
      const response = await payoutService.getBatchItems(batch.monthlyPayoutBatchId, { pageSize: 100 });
      setBatchItems(response?.data?.items || response?.items || response || []);
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

  // ─── Action modal state ────────────────────────────────────────────────────
  const [actionModal, setActionModal] = useState(null);
  // actionModal shape: { type: 'markPaid' | 'reject', item }

  const openMarkPaidModal = (item) => setActionModal({ type: 'markPaid', item });
  const openRejectModal = (item) => setActionModal({ type: 'reject', item });
  const closeActionModal = () => setActionModal(null);

  const handleMarkPaidConfirm = async (item, note) => {
    try {
      await payoutService.markPaid(item.monthlyPayoutId, { note: note || undefined });
      setModalMessage('Đã cập nhật trạng thái chi trả thành công.');
      setShowSuccess(true);
      closeActionModal();
      handleViewBatch(selectedBatch);
    } catch (error) {
      setModalMessage(error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi cập nhật.');
      setShowError(true);
    }
  };

  const handleRejectConfirm = async (item, reason) => {
    try {
      await payoutService.rejectPayout(item.monthlyPayoutId, { reason });
      setModalMessage('Đã từ chối khoản chi trả này.');
      setShowSuccess(true);
      closeActionModal();
      handleViewBatch(selectedBatch);
    } catch (error) {
      setModalMessage(error?.response?.data?.message || error?.message || 'Có lỗi xảy ra.');
      setShowError(true);
    }
  };

  if (selectedBatch) {
    return (
      <>
        <BatchDetailView 
          batch={selectedBatch} 
          items={batchItems} 
          loading={loadingItems} 
          onBack={() => setSelectedBatch(null)} 
          onExport={handleExportBatch}
          onMarkPaid={openMarkPaidModal}
          onReject={openRejectModal}
        />
        {actionModal?.type === 'markPaid' && (
          <PayoutActionModal
            type="markPaid"
            item={actionModal.item}
            onClose={closeActionModal}
            onConfirm={handleMarkPaidConfirm}
          />
        )}
        {actionModal?.type === 'reject' && (
          <PayoutActionModal
            type="reject"
            item={actionModal.item}
            onClose={closeActionModal}
            onConfirm={handleRejectConfirm}
          />
        )}
      </>
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
            <Calculator size={18} /> Kết toán theo kỳ
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
            message='Hãy nhấn "Kết toán theo kỳ" để bắt đầu tạo đợt chi trả đầu tiên cho các cố vấn.'
          />
        ) : (
          batches.map(batch => {
            const batchStatusColor = batch.status === 'Completed' ? '#10b981' : '#f59e0b';
            const batchStatusText = batch.status === 'Completed' ? 'Hoàn tất' : 'Đang xử lý';
            return (
              <div key={batch.monthlyPayoutBatchId} className={styles.pendingItem} onClick={() => handleViewBatch(batch)} style={{ cursor: 'pointer' }}>
                <div className={styles.pendingItemLeft}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 className={styles.pendingItemTitle}>
                      Kỳ {batch.month}/{batch.year}
                      {batch.fromDate && batch.toDate && (
                        <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)', marginLeft: 8 }}>
                          ({new Date(batch.fromDate).toLocaleDateString('vi-VN')} – {new Date(batch.toDate).toLocaleDateString('vi-VN')})
                        </span>
                      )}
                    </h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>#{batch.monthlyPayoutBatchId}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: batchStatusColor, background: `${batchStatusColor}18`, padding: '2px 8px', borderRadius: 6 }}>
                      {batchStatusText}
                    </span>
                  </div>
                  <div className={styles.pendingItemSubtitle} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span>Tạo ngày: <strong>{new Date(batch.createdAt).toLocaleDateString('vi-VN')}</strong></span>
                    <span>Bill: <strong>{batch.totalBillCount || 0}</strong></span>
                    {batch.pendingBillCount > 0 && <span style={{ color: '#f59e0b' }}>Chờ: <strong>{batch.pendingBillCount}</strong></span>}
                    {batch.rejectedBillCount > 0 && <span style={{ color: '#ef4444' }}>Từ chối: <strong>{batch.rejectedBillCount}</strong></span>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-primary)' }}>
                      {(batch.actualPayableAmount ?? 0).toLocaleString('vi-VN')} <span style={{ fontSize: '12px' }}>VND</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Dự kiến: {(batch.estimatedTotalAmount ?? 0).toLocaleString('vi-VN')} VND
                    </div>
                    {batch.rejectedAmount > 0 && (
                      <div style={{ fontSize: '11px', color: '#ef4444' }}>
                        Từ chối: {batch.rejectedAmount.toLocaleString('vi-VN')} VND
                      </div>
                    )}
                  </div>

                  <ChevronRight size={20} color="var(--text-muted)" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {showGenerateModal && (
        <GenerateBatchModal 
          onClose={() => setShowGenerateModal(false)} 
          onSuccess={() => { setShowGenerateModal(false); fetchBatches(); }} 
        />
      )}
      
      {showSuccess && <SuccessModal message={modalMessage} onClose={() => setShowSuccess(false)} />}
      {showError && <ErrorModal message={modalMessage} onClose={() => setShowError(false)} />}
    </div>
  );
}

// ─── Status helpers ────────────────────────────────────────────────────────────

function getStatusInfo(status) {
  switch (status) {
    case 'Paid':
      return { label: 'Đã chi trả', color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: <CheckCircle size={13} /> };
    case 'Rejected':
      return { label: 'Đã từ chối', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: <XCircle size={13} /> };
    case 'PendingRecheck':
      return { label: 'Chờ xử lý lại', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: <RefreshCw size={13} /> };
    default:
      return { label: 'Chờ xử lý', color: '#6366f1', bg: 'rgba(99,102,241,0.1)', icon: <Clock size={13} /> };
  }
}

// ─── BatchDetailView ────────────────────────────────────────────────────────────

function BatchDetailView({ batch, items, loading, onBack, onExport, onMarkPaid, onReject }) {
  return (
    <div className={styles.withdrawSection}>
      {/* Header row: back + title + export inline */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, padding: 0, fontSize: 14, width: 'fit-content' }}>
            <ArrowLeft size={16} /> Quay lại
          </button>
          <div>
            <h2 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 900, margin: 0, whiteSpace: 'nowrap' }}>
              Kỳ chi trả Tháng {batch.month}/{batch.year}
            </h2>
            {batch.fromDate && batch.toDate && (
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '3px 0 0 0', fontWeight: 600 }}>
                📅 {new Date(batch.fromDate).toLocaleDateString('vi-VN')} – {new Date(batch.toDate).toLocaleDateString('vi-VN')}
              </p>
            )}
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '2px 0 0 0' }}>Đối soát và xác nhận thanh toán cho các cố vấn.</p>
          </div>
        </div>
        <button 
          className={styles.baBtn} 
          onClick={onExport} 
          style={{ 
            background: 'var(--staff-success)', 
            color: 'white', 
            border: 'none', 
            height: 40, 
            padding: '0 20px', 
            flex: 'none', 
            width: 'fit-content',
            whiteSpace: 'nowrap' 
          }}
        >
          <Download size={16} /> Xuất Excel
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: 16, border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: 4 }}>Dự kiến</span>
          <span style={{ fontSize: 16, fontWeight: 900 }}>{(batch.estimatedTotalAmount ?? 0).toLocaleString('vi-VN')} <span style={{ fontSize: 11 }}>VND</span></span>
        </div>
        <div style={{ background: 'rgba(16,185,129,0.05)', padding: '12px 16px', borderRadius: 16, border: '1px solid rgba(16,185,129,0.2)' }}>
          <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#10b981', fontWeight: 700, display: 'block', marginBottom: 4 }}>Thực tế (Sẽ chi)</span>
          <span style={{ fontSize: 16, fontWeight: 900, color: '#10b981' }}>{(batch.actualPayableAmount ?? 0).toLocaleString('vi-VN')} <span style={{ fontSize: 11 }}>VND</span></span>
        </div>
        <div style={{ background: 'rgba(239,68,68,0.05)', padding: '12px 16px', borderRadius: 16, border: '1px solid rgba(239,68,68,0.2)' }}>
          <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#ef4444', fontWeight: 700, display: 'block', marginBottom: 4 }}>Bị từ chối</span>
          <span style={{ fontSize: 16, fontWeight: 900, color: '#ef4444' }}>{(batch.rejectedAmount ?? 0).toLocaleString('vi-VN')} <span style={{ fontSize: 11 }}>VND</span></span>
        </div>
        <div style={{ background: 'rgba(99,102,241,0.05)', padding: '12px 16px', borderRadius: 16, border: '1px solid rgba(99,102,241,0.2)' }}>
          <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#6366f1', fontWeight: 700, display: 'block', marginBottom: 4 }}>Bill</span>
          <span style={{ fontSize: 13, fontWeight: 900, color: '#6366f1', lineHeight: 1.4 }}>
            {batch.totalBillCount || 0} tổng &nbsp;·&nbsp; {batch.pendingBillCount || 0} chờ &nbsp;·&nbsp; {batch.rejectedBillCount || 0} từ chối
          </span>
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
          items.map(item => {
            const s = getStatusInfo(item.status);
            const isPendingAction = item.status === 'Pending' || item.status === 'PendingRecheck';
            return (
              <div key={item.monthlyPayoutId} className={styles.pendingItem} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>

                {/* ── Top row: identity, amount, actions ─────────────────── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>

                  {/* Left: name + bank */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>{item.advisorName}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '1px 7px', borderRadius: 5 }}>ID: {item.advisorId}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <span>{item.bankName} · <span style={{ fontFamily: 'monospace', letterSpacing: '0.04em' }}>{item.accountNumber}</span></span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {item.accountHolderName}
                    </div>
                  </div>

                  {/* Right: amount + status / action buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 17, fontWeight: 900, color: s.color }}>
                        {(item.amount ?? 0).toLocaleString('vi-VN')} <span style={{ fontSize: 11, fontWeight: 400 }}>VND</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Kỳ {batch.month}/{batch.year}</div>
                    </div>

                    {isPendingAction ? (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className={styles.rejectBtnOutline}
                          onClick={() => onReject(item)}
                        >
                          <XCircle size={15} /> Từ chối
                        </button>
                        <button
                          className={styles.baBtn}
                          style={{ background: 'var(--staff-success)', color: 'white', border: 'none', padding: '0 14px', height: '34px', flex: 'none', width: 'fit-content' }}
                          onClick={() => onMarkPaid(item)}
                        >
                          <CheckCircle size={15} /> {item.status === 'PendingRecheck' ? 'Đã chuyển lại' : 'Duyệt'}
                        </button>
                      </div>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: s.bg, color: s.color, padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                        {s.icon} {s.label}
                      </span>
                    )}
                  </div>
                </div>

                {/* ── Paid: date strip ────────────────────────────────────── */}
                {item.status === 'Paid' && item.paidAt && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '7px 12px' }}>
                    <CheckCircle size={13} color="#10b981" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>
                      Đã thanh toán · {new Date(item.paidAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                )}

                {/* ── Rejected: reason strip ──────────────────────────────── */}
                {item.status === 'Rejected' && item.rejectReason && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '7px 12px' }}>
                    <XCircle size={13} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 12, color: '#ef4444', lineHeight: 1.4 }}>{item.rejectReason}</span>
                  </div>
                )}

                {/* ── PendingRecheck: full-width retry note ──────────────── */}
                {item.status === 'PendingRecheck' && (item.retryRequestNote || item.retryRequestedByName) && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '8px 12px' }}>
                    <RefreshCw size={13} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                      {item.retryRequestedByName && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b' }}>
                          {item.retryRequestedByName} yêu cầu chuyển lại
                          {item.retryRequestedAt && <span style={{ fontWeight: 400, opacity: 0.8 }}> · {new Date(item.retryRequestedAt).toLocaleDateString('vi-VN')}</span>}
                        </span>
                      )}
                      {item.retryRequestNote && (
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{item.retryRequestNote}</span>
                      )}
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── PayoutActionModal ───────────────────────────────────────────────────────
// Used for both mark-paid (optional note) and reject (required reason)

function PayoutActionModal({ type, item, onClose, onConfirm }) {
  const isReject = type === 'reject';
  const isPendingRecheck = item?.status === 'PendingRecheck';
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (isReject && !value.trim()) {
      setError('Vui lòng nhập lý do từ chối.');
      return;
    }
    setLoading(true);
    await onConfirm(item, value.trim() || undefined);
    setLoading(false);
  };

  const actionLabel = isReject
    ? 'Từ chối chi trả'
    : isPendingRecheck ? 'Xác nhận đã chuyển lại' : 'Xác nhận đã thanh toán';

  const accentColor = isReject ? '#ef4444' : '#10b981';
  const accentBg = isReject ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)';

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 99998, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, animation: 'modalOverlayIn 0.2s ease' }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 440, boxShadow: '0 24px 64px rgba(0,0,0,0.5)', animation: 'modalCardIn 0.25s cubic-bezier(0.22, 1, 0.36, 1)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isReject ? <XCircle size={20} color={accentColor} /> : <CheckCircle size={20} color={accentColor} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{actionLabel}</h3>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{item?.advisorName}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', borderRadius: 8, padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Amount summary */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Số tiền</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: accentColor }}>{(item?.amount ?? 0).toLocaleString('vi-VN')} ₫</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Ngân hàng</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{item?.bankName}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{item?.accountNumber}</div>
          </div>
        </div>

        {/* Note / Reason field */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>
            {isReject ? 'Lý do từ chối *' : 'Ghi chú / Minh chứng (tuỳ chọn)'}
          </label>
          <textarea
            value={value}
            onChange={e => { setValue(e.target.value); setError(''); }}
            placeholder={isReject
              ? 'Nhập lý do từ chối… (bắt buộc)'
              : 'Nhập số giao dịch, ảnh minh chứng hoặc ghi chú khác…'}
            rows={3}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: `1.5px solid ${error ? '#ef4444' : 'var(--border-color)'}`, background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 14, resize: 'vertical', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s', fontFamily: 'inherit' }}
          />
          {error && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 6, color: '#ef4444', fontSize: 12, fontWeight: 600 }}>
              <AlertCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: 12, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 12, border: 'none', background: accentColor, color: '#fff', fontWeight: 800, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : (isReject ? <XCircle size={16} /> : <CheckCircle size={16} />)}
            {loading ? 'Đang xử lý…' : actionLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function getDefaultDateRange() {
  const now = new Date();
  const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastOfPrevMonth = new Date(firstOfThisMonth - 1);
  const firstOfPrevMonth = new Date(lastOfPrevMonth.getFullYear(), lastOfPrevMonth.getMonth(), 1);
  
  const fmt = (d) => d.toISOString().split('T')[0];
  return { fromDate: fmt(firstOfPrevMonth), toDate: fmt(lastOfPrevMonth) };
}

function GenerateBatchModal({ onClose, onSuccess }) {
  const defaults = getDefaultDateRange();
  const [formData, setFormData] = useState({ fromDate: defaults.fromDate, toDate: defaults.toDate });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);

  const validate = () => {
    if (!formData.fromDate || !formData.toDate) return 'Vui lòng chọn cả ngày bắt đầu và ngày kết thúc.';
    const from = new Date(formData.fromDate);
    const to = new Date(formData.toDate);
    if (from > to) return 'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.';
    const diffDays = (to - from) / (1000 * 60 * 60 * 24);
    if (diffDays > 62) return 'Khoảng thời gian quá lớn. Vui lòng chọn tối đa 62 ngày.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      const result = await payoutService.generateBatch({
        fromDate: formData.fromDate,
        toDate: formData.toDate,
      });
      
      const generatedItems = result?.data || result || [];
      const itemsArray = Array.isArray(generatedItems) ? generatedItems : (generatedItems.items || []);

      if (itemsArray.length === 0) {
        setInfoMessage(`Không tìm thấy giao dịch hợp lệ nào trong kỳ ${new Date(formData.fromDate).toLocaleDateString('vi-VN')} – ${new Date(formData.toDate).toLocaleDateString('vi-VN')}. Có thể tất cả các cố vấn đã được kết toán hoặc chưa có thu nhập trong kỳ này.`);
        setLoading(false);
        return;
      }

      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tạo batch. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };



  return createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Kết toán &amp; Tạo đợt thanh toán</h3>
          <button className={styles.modalCloseBtn} onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 4px 0', lineHeight: 1.5 }}>
              Chọn khoảng thời gian cần kết toán. Hệ thống sẽ tổng hợp tất cả giao dịch thu nhập của Advisor trong kỳ đó và tạo danh sách chi trả.
            </p>
            <div style={{ padding: '8px 12px', background: 'rgba(29,155,240,0.05)', borderRadius: '8px', borderLeft: '3px solid var(--primary-blue)', marginBottom: '16px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--primary-blue)', fontWeight: 600 }}>Lưu ý: Tối đa 62 ngày mỗi đợt kết toán.</p>
            </div>

            <DateRangePicker
              fromDate={formData.fromDate}
              toDate={formData.toDate}
              maxRangeDays={62}
              onChange={({ fromDate, toDate }) => {
                setFormData({ fromDate, toDate });
                setError(null);
                setInfoMessage(null);
              }}
            />

            {error && (
              <div className={styles.modalError} style={{ marginTop: 12 }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {infoMessage && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(29,155,240,0.06)', border: '1px solid rgba(29,155,240,0.2)', borderRadius: 10, fontSize: 13, color: 'var(--primary-blue)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Info size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{infoMessage}</span>
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
