import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  DollarSign, Clock, CheckCircle, XCircle, Eye, 
  Loader2, AlertCircle, ExternalLink, X, Check, Image as ImageIcon
} from 'lucide-react';
import styles from '../../styles/OperationStaffDashboard.module.css';
import modalStyles from './WithdrawManagementModal.module.css';
import walletService from '../../services/walletService';

// Status mapping for backend enums
const STATUS_ENUM = {
  'Pending': 0,
  'Approved': 1,
  'Rejected': 2
};

export default function WithdrawManagement({ searchTerm = '' }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Pending'); // Pending, Approved, Rejected
  const [processingId, setProcessingId] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all requests without status filter (backend filtering is not yet supported for this endpoint)
      const response = await walletService.getAllWithdrawRequests();
      const items = response?.items || response?.data?.items || (Array.isArray(response) ? response : []);
      setRequests(items);
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
    } finally {
      setLoading(false);
    }
  }, []); // Only fetch when needed, not on every filter change

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const filteredRequests = requests.filter(r => {
    // 1. Filter by Status (Frontend Handle)
    const numericStatus = STATUS_ENUM[filter];
    if (r.status !== filter && r.status !== numericStatus) return false;

    // 2. Filter by Search Term
    const search = searchTerm.toLowerCase();
    return (r.advisorName || '').toLowerCase().includes(search) || 
           (r.bankAccount || '').toLowerCase().includes(search) ||
           (r.bankName || '').toLowerCase().includes(search) ||
           String(r.withdrawRequestId).includes(search);
  });

  const handleApprove = async (id, proofUrl) => {
    setProcessingId(id);
    try {
      await walletService.approveWithdrawal(id, proofUrl);
      setShowApproveModal(null);
      fetchRequests();
    } catch (error) {
      alert('Lỗi khi phê duyệt: ' + (error?.message || 'Đã xảy ra lỗi.'));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id, reason) => {
    setProcessingId(id);
    try {
      await walletService.rejectWithdrawal(id, reason);
      setShowRejectModal(null);
      fetchRequests();
    } catch (error) {
      alert('Lỗi khi từ chối: ' + (error?.message || 'Đã xảy ra lỗi.'));
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (s) => {
    switch(s) {
      case 'Pending': return '#f59e0b';
      case 'Approved': return '#10b981';
      case 'Rejected': return '#ef4444';
      default: return 'var(--primary-blue)';
    }
  };

  return (
    <div className={styles.withdrawSection}>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          {['Pending', 'Approved', 'Rejected'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{ 
                padding: '8px 16px', 
                borderRadius: '8px', 
                border: 'none', 
                background: filter === s ? 'var(--bg-primary)' : 'transparent',
                color: filter === s ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: filter === s ? '800' : '500',
                cursor: 'pointer',
                boxShadow: filter === s ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s',
                position: 'relative'
              }}
            >
              {s === 'Pending' ? 'Chờ duyệt' : s === 'Approved' ? 'Đã duyệt' : 'Đã từ chối'}
              {filter === s && (
                <div style={{ 
                  position: 'absolute', 
                  bottom: '-4px', 
                  left: '15%', 
                  right: '15%', 
                  height: '3px', 
                  background: getStatusColor(s), 
                  borderRadius: '10px',
                  zIndex: 2
                }} />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.pendingList}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary-blue)', margin: '0 auto' }} />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className={styles.errorWrapper}>
            <div style={{ textAlign: 'center' }}>
              <Clock size={48} opacity={0.2} style={{ marginBottom: '16px' }} />
              <h3>Không có yêu cầu nào</h3>
              <p>Hiện tại không có yêu cầu rút tiền nào khớp với bộ lọc.</p>
            </div>
          </div>
        ) : (
          filteredRequests.map(req => (
            <div key={req.withdrawRequestId} className={styles.pendingItem}>
              <div className={styles.pendingItemLeft}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 className={styles.pendingItemTitle}>{req.advisorName}</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>#{req.withdrawRequestId}</span>
                </div>
                <div className={styles.pendingItemSubtitle} style={{ display: 'flex', gap: '12px' }}>
                  <span>Ngân hàng: <strong>{req.bankName}</strong></span>
                  <span>Tài khoản: <strong>{req.bankAccount}</strong></span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: filter === 'Pending' ? '#f59e0b' : filter === 'Approved' ? '#10b981' : '#ef4444' }}>
                    {req.amount?.toLocaleString('vi-VN')} <span style={{ fontSize: '12px' }}>VND</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Yêu cầu: {new Date(req.requestedAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>

                <div className={styles.buttonGroup}>
                  {(req.status === 'Pending' || req.status === 0) ? (
                    <>
                      <button 
                        className={styles.rejectBtnOutline}
                        onClick={() => setShowRejectModal(req)}
                        disabled={processingId === req.withdrawRequestId}
                      >
                        <XCircle size={16} /> Từ chối
                      </button>
                      <button 
                        className={styles.baBtn} 
                        style={{ background: 'var(--staff-success)', color: 'white', border: 'none' }}
                        onClick={() => setShowApproveModal(req)}
                        disabled={processingId === req.withdrawRequestId}
                      >
                        <CheckCircle size={16} /> Duyệt
                      </button>
                    </>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {req.proofImageUrl && (
                        <a href={req.proofImageUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '700' }}>
                          <ImageIcon size={14} /> Minh chứng
                        </a>
                      )}
                      <span className={`${styles.statusBadge} ${(req.status === 'Approved' || req.status === 1) ? styles.badgeSuccess : styles.badgeError}`} 
                            style={{ 
                              background: (req.status === 'Approved' || req.status === 1) ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: (req.status === 'Approved' || req.status === 1) ? '#10b981' : '#ef4444'
                            }}>
                        {(req.status === 'Approved' || req.status === 1) ? 'Đã duyệt' : 'Đã từ chối'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showApproveModal && (
        <ApproveModal 
          request={showApproveModal}
          onClose={() => setShowApproveModal(null)}
          onConfirm={handleApprove}
          processing={processingId === showApproveModal.withdrawRequestId}
        />
      )}

      {showRejectModal && (
        <RejectModal 
          request={showRejectModal}
          onClose={() => setShowRejectModal(null)}
          onConfirm={handleReject}
          processing={processingId === showRejectModal.withdrawRequestId}
        />
      )}
    </div>
  );
}

function ApproveModal({ request, onClose, onConfirm, processing }) {
  const [proofUrl, setProofUrl] = useState('');

  return createPortal(
    <div className={modalStyles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={modalStyles.modal}>
        <div className={modalStyles.header}>
          <h3 className={modalStyles.headerTitle}>Phê duyệt rút tiền</h3>
          <button className={modalStyles.closeBtn} onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className={modalStyles.body}>
          <div className={modalStyles.infoBox}>
            Bạn đang phê duyệt yêu cầu rút tiền của <strong>{request.advisorName}</strong>. <br/>
            Số tiền: <strong className={modalStyles.amount}>{request.amount?.toLocaleString('vi-VN')} VND</strong>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label className={modalStyles.label}>Link ảnh minh chứng (Proof URL)</label>
            <input 
              type="text" 
              className={modalStyles.input}
              placeholder="Dán link ảnh tại đây..."
              value={proofUrl}
              onChange={e => setProofUrl(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className={modalStyles.footer}>
          <button className={modalStyles.secondaryBtn} onClick={onClose} disabled={processing}>Hủy</button>
          <button 
            className={`${modalStyles.primaryBtn} ${modalStyles.successBtn}`}
            disabled={processing || !proofUrl.trim()}
            onClick={() => onConfirm(request.withdrawRequestId, proofUrl)}
          >
            {processing ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle size={18} /> Xác nhận Duyệt</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function RejectModal({ request, onClose, onConfirm, processing }) {
  const [reason, setReason] = useState('');

  return createPortal(
    <div className={modalStyles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={modalStyles.modal}>
        <div className={modalStyles.header}>
          <h3 className={modalStyles.headerTitle} style={{ color: '#dc2626' }}>Từ chối rút tiền</h3>
          <button className={modalStyles.closeBtn} onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className={modalStyles.body}>
          <div className={modalStyles.infoBox} style={{ borderLeftColor: '#dc2626', background: 'rgba(220, 38, 38, 0.05)' }}>
            Lý do từ chối yêu cầu của <strong>{request.advisorName}</strong>: <br/>
            Số tiền yêu cầu: <strong>{request.amount?.toLocaleString('vi-VN')} VND</strong>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label className={modalStyles.label}>Lý do chi tiết</label>
            <textarea 
              className={modalStyles.textarea}
              placeholder="Nhập lý do chi tiết..."
              rows={4}
              value={reason}
              onChange={e => setReason(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className={modalStyles.footer}>
          <button className={modalStyles.secondaryBtn} onClick={onClose} disabled={processing}>Quay lại</button>
          <button 
            className={`${modalStyles.primaryBtn} ${modalStyles.dangerBtn}`}
            disabled={processing || !reason.trim()}
            onClick={() => onConfirm(request.withdrawRequestId, reason)}
          >
            {processing ? <Loader2 size={18} className="animate-spin" /> : <><XCircle size={18} /> Xác nhận Từ chối</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
