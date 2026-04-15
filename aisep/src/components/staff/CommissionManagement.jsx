import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Percent, History, Edit3, X, AlertTriangle, 
  CheckCircle, Loader2, MessageSquare, Search, Clock,
  Hash, Calendar, User, Archive
} from 'lucide-react';
import EmptyState from '../common/EmptyState';
import styles from '../../styles/OperationStaffDashboard.module.css';
import commissionService from '../../services/commissionService';

export default function CommissionManagement({ searchTerm }) {
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [currRes, histRes] = await Promise.all([
        commissionService.getCurrentCommission(),
        commissionService.getHistory('-AppliedAt')
      ]);
      
      const currData = currRes?.data || currRes;
      setCurrent(currData);
      
      const histItems = histRes?.items || histRes?.data?.items || (Array.isArray(histRes) ? histRes : []);
      setHistory(histItems);
    } catch (err) {
      console.error('Error fetching commission data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  const filteredHistory = useMemo(() => {
    const query = (searchTerm || '').trim().toLowerCase();
    if (!query) return history;
    return history.filter(item => 
      (item.reason || '').toLowerCase().includes(query) ||
      (item.newPercent?.toString() || '').includes(query)
    );
  }, [history, searchTerm]);

  const getRelativeTime = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className={styles.statisticsSection}>
      <div className={styles.commissionGrid}>
        {/* Left Column: Current Rate Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className={styles.rateCard}>
            <div className={styles.rateHeader}>
              <span className={styles.activeBadge}>
                <CheckCircle size={12} /> Đang hoạt động
              </span>
              <button 
                className={styles.editGhostBtn}
                onClick={() => setShowModal(true)}
              >
                Chỉnh sửa
              </button>
            </div>
            
            <div style={{ marginTop: '8px' }}>
              <div className={styles.summaryTitle} style={{ marginBottom: '4px' }}>Tỷ lệ hiện tại</div>
              <div className={styles.rateValue}>
                {loading ? '—' : (current?.percent !== undefined ? `${current.percent}%` : '—')}
              </div>
            </div>

            <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
              Áp dụng từ: {current?.effectiveFrom ? <strong>{new Date(current.effectiveFrom).toLocaleString('vi-VN')}</strong> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
            </div>
          </div>
        </div>

        {/* Right Column: History Panel */}
        <div className={styles.historyPanel}>
          <div className={styles.historyHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={18} color="var(--text-secondary)" />
              <span className={styles.summaryTitle} style={{ marginBottom: 0 }}>Lịch sử thay đổi</span>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary-blue)', margin: '0 auto' }} />
              </div>
            ) : filteredHistory.length === 0 ? (
              <EmptyState 
                icon={searchTerm ? Search : Archive}
                title={searchTerm ? 'Không tìm thấy kết quả' : 'Chưa có thay đổi nào'}
                message={searchTerm 
                  ? `Không tìm thấy lịch sử nào khớp với "${searchTerm}"` 
                  : 'Lịch sử sẽ xuất hiện sau khi bạn cập nhật tỷ lệ hoa hồng lần đầu.'
                }
              />
            ) : (
              <div className={styles.timeline}>
                {filteredHistory.map((item, idx) => {
                  const prevItem = history[history.indexOf(item) + 1];
                  const oldRate = item.oldPercent !== null ? item.oldPercent : (prevItem?.newPercent || 0);
                  const isIncrease = item.newPercent > oldRate;
                  const isFirst = item.oldPercent === null && !prevItem;

                  const accentClass = isFirst ? styles.accentNeutral : (isIncrease ? styles.accentGreen : styles.accentRed);
                  
                  return (
                    <div key={item.logId || idx} className={`${styles.sleekCard} ${accentClass}`}>
                      <div className={styles.cardHeaderArea}>
                        <div className={styles.cardMainContent}>
                          <div className={styles.cardReasonText}>
                            {item.reason || "Cập nhật cấu hình hệ thống"}
                          </div>
                        </div>

                        <div className={styles.pillBadge}>
                          <div className={styles.pillBadgeInner}>
                            {!isFirst && (
                              <>
                                <span style={{ opacity: 0.5, fontSize: '13px' }}>{oldRate}%</span>
                                <span className={styles.badgeArrow}>→</span>
                              </>
                            )}
                            <span style={{ color: isFirst ? 'var(--text-primary)' : (isIncrease ? '#10b981' : '#ef4444') }}>
                              {item.newPercent}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className={styles.cardMetaStrip}>
                        <div className={styles.metaItemStrip}>
                          <User size={14} className={`${styles.metaIcon} ${styles.metaUser}`} />
                          <span className={styles.metaValueLink}>{item.changedByName}</span>
                        </div>
                        <div className={styles.metaItemStrip}>
                          <Clock size={14} className={`${styles.metaIcon} ${styles.metaClock}`} />
                          <span>{new Date(item.changedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className={styles.metaItemStrip}>
                          <Calendar size={14} className={`${styles.metaIcon} ${styles.metaCalendar}`} />
                          <span>{new Date(item.newEffectiveFrom).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div style={{ marginLeft: 'auto' }} className={styles.idStamp}>
                          LOG#{item.logId} • CFG#{item.configId}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <CommissionEditModal 
          currentPercent={current?.percentage}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            setSuccessToast(true);
            fetchData();
          }}
        />
      )}

      {/* Success Toast - Rendering in Portal for top-level visibility */}
      {successToast && createPortal(
        <div style={{ 
          position: 'fixed', top: '24px', right: '24px', zIndex: 100000,
          background: '#00ba7c', color: 'white', padding: '12px 24px',
          borderRadius: '12px', boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: '10px',
          animation: 'slideInRight 0.3s ease-out'
        }}>
          <CheckCircle size={20} />
          <span style={{ fontWeight: 700 }}>Cập nhật tỷ lệ hoa hồng thành công</span>
        </div>,
        document.body
      )}
    </div>
  );
}

function CommissionEditModal({ currentPercent, onClose, onSuccess }) {
  const [percent, setPercent] = useState(currentPercent || '');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!percent || percent < 0 || percent > 100) {
      setError('Phần trăm hoa hồng phải từ 0 đến 100.');
      return;
    }
    if (!reason || reason.length < 5) {
      setError('Vui lòng nhập lý do thay đổi (ít nhất 5 ký tự).');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await commissionService.updateCommission({
        Percent: Number(percent),
        Reason: reason
      });
      onSuccess();
    } catch (err) {
      if (err?.response?.status === 409) {
        setError('Tỷ lệ này đã được cấu hình trước đó. Vui lòng chọn một tỷ lệ khác.');
      } else {
        setError(err?.response?.data?.message || 'Lỗi khi cập nhật cấu hình.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const modalContent = (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalFrame} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Chỉnh sửa hoa hồng</h3>
          <button onClick={onClose} className={styles.modalCloseBtn}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Phần trăm hoa hồng (%)</label>
              <div className={styles.inputWrapper}>
                <input 
                  type="number" 
                  className={`${styles.modalInput} ${error && (percent === '' || error.includes('Tỷ lệ')) ? styles.inputError : ''}`}
                  value={percent}
                  onChange={e => {
                    setPercent(e.target.value);
                    setError(null);
                  }}
                  min="0" max="100" step="0.1"
                  placeholder="0.0"
                  autoFocus
                />
                <span className={styles.percentBadge}>%</span>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Lý do thay đổi</label>
              <div className={styles.textareaContainer}>
                <textarea 
                  className={`${styles.modalTextarea} ${error && !reason ? styles.inputError : ''}`}
                  value={reason}
                  onChange={e => {
                    setReason(e.target.value.slice(0, 500));
                    setError(null);
                  }}
                  rows="4"
                  placeholder="Ví dụ: Điều chỉnh theo chính sách quý mới..."
                />
                <span className={styles.charCount}>{reason.length}/500</span>
              </div>
              {error && <div className={styles.inputErrorText}>{error}</div>}
            </div>

            <div className={styles.alertBox}>
              <AlertTriangle size={20} style={{ flexShrink: 0 }} />
              <div className={styles.alertText}>
                <strong>Lưu ý quan trọng:</strong> Thay đổi tỷ lệ hoa hồng sẽ không ảnh hưởng đến các Booking đã được tạo trước đó. Tỷ lệ mới sẽ chỉ áp dụng cho các lượt Booking phát sinh sau thời điểm lưu cấu hình.
              </div>
            </div>
          </div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.modalSecondaryBtn} onClick={onClose} disabled={submitting}>Hủy</button>
            <button 
              type="submit" 
              className={styles.modalPrimaryBtn} 
              disabled={submitting}
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Lưu cấu hình mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
