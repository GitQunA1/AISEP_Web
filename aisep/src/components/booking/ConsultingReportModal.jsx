import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, FileText, CheckCircle, AlertCircle, Clock, RotateCcw, Send, Loader
} from 'lucide-react';
import consultingReportService from '../../services/consultingReportService';
import styles from './ConsultingReportModal.module.css';

const MAX_REVISIONS = 3;

/**
 * ConsultingReportModal
 *
 * Props:
 *   bookingId   {number}   - Booking ID
 *   userRole    {string}   - 'Advisor' | 'Startup' | 'Investor'
 *   advisorName {string}   - Tên advisor (hiển thị)
 *   onClose     {fn}
 *   onDone      {fn}       - Callback sau khi approve/submit thành công
 */
export default function ConsultingReportModal({ bookingId, userRole, advisorName, onClose, onDone }) {
  const isAdvisor = userRole === 'Advisor';

  const [phase, setPhase] = useState('loading'); // loading | submit-form | view-report | success | error
  const [report, setReport] = useState(null);
  const [loadError, setLoadError] = useState('');

  // Advisor form
  const [form, setForm] = useState({
    meetingTitle: '',
    location: '',
    meetingTime: new Date().toISOString().slice(0, 16),
    meetingPurpose: '',
    content: '',
    decisionsMade: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Startup/Investor review
  const [revisionReason, setRevisionReason] = useState('');
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  // Load existing report
  useEffect(() => {
    const load = async () => {
      setPhase('loading');
      try {
        const r = await consultingReportService.getReportByBookingId(bookingId);
        setReport(r);
        if (r) {
          setPhase('view-report');
        } else {
          setPhase(isAdvisor ? 'submit-form' : 'view-report');
        }
      } catch (e) {
        // 404 means no report yet
        if (e?.statusCode === 404 || e?.message?.toLowerCase().includes('not found')) {
          setReport(null);
          setPhase(isAdvisor ? 'submit-form' : 'view-report');
        } else {
          setLoadError(e?.message || 'Không thể tải báo cáo.');
          setPhase('error');
        }
      }
    };
    load();
  }, [bookingId, isAdvisor]);

  // ------ Advisor Submit ------
  const handleSubmit = async () => {
    setFormError('');
    if (!form.meetingTitle.trim()) { setFormError('Vui lòng nhập tiêu đề buổi tư vấn.'); return; }
    setSubmitting(true);
    try {
      const data = {
        bookingId,
        meetingTitle: form.meetingTitle.trim(),
        location: form.location.trim() || undefined,
        meetingTime: new Date(form.meetingTime).toISOString(),
        meetingPurpose: form.meetingPurpose.trim() || undefined,
        content: form.content.trim() || undefined,
        decisionsMade: form.decisionsMade.trim() || undefined,
      };
      const r = await consultingReportService.createReport(data);
      setReport(r);
      setPhase('success');
      onDone?.();
    } catch (e) {
      setFormError(e?.message || 'Không thể nộp báo cáo. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // ------ Startup Approve ------
  const handleApprove = async () => {
    setActionLoading(true);
    setActionError('');
    try {
      await consultingReportService.approveReport(report.consultingReportId);
      setPhase('success');
      onDone?.();
    } catch (e) {
      setActionError(e?.message || 'Không thể chấp nhận báo cáo.');
    } finally {
      setActionLoading(false);
    }
  };

  // ------ Startup Request Revision ------
  const handleRevision = async () => {
    if (!revisionReason.trim()) { setActionError('Vui lòng nhập lý do yêu cầu sửa đổi.'); return; }
    setActionLoading(true);
    setActionError('');
    try {
      await consultingReportService.requestRevision(report.consultingReportId, revisionReason.trim());
      onClose();
      onDone?.();
    } catch (e) {
      setActionError(e?.message || 'Không thể gửi yêu cầu sửa đổi.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
  const getCountdown = (dueAt) => {
    if (!dueAt) return null;
    const diff = new Date(dueAt) - new Date();
    if (diff <= 0) return 'Đã quá hạn';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  const reportStatusLabel = {
    'Submitted': 'Đã nộp – Chờ xem xét',
    'Approved': 'Đã chấp nhận',
    'RevisionRequested': 'Yêu cầu sửa đổi',
    'Completed': 'Hoàn thành',
  };

  const content = (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <FileText size={20} className={styles.headerIcon} />
            <div>
              <h2 className={styles.title}>Báo Cáo Tư Vấn</h2>
              {advisorName && <p className={styles.subtitle}>{advisorName}</p>}
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
        </div>

        <div className={styles.body}>

          {/* Loading */}
          {phase === 'loading' && (
            <div className={styles.centered}>
              <Loader size={32} className={styles.spinning} />
              <p className={styles.mutedText}>Đang tải...</p>
            </div>
          )}

          {/* Error */}
          {phase === 'error' && (
            <div className={styles.centered}>
              <AlertCircle size={40} color="#ef4444" />
              <p className={styles.errorText}>{loadError}</p>
              <button className={styles.secondaryBtn} onClick={onClose}>Đóng</button>
            </div>
          )}

          {/* Success */}
          {phase === 'success' && (
            <div className={styles.centered}>
              <CheckCircle size={56} color="#22c55e" />
              <h3 className={styles.successTitle}>
                {isAdvisor ? 'Báo cáo đã được nộp!' : 'Đã xử lý thành công!'}
              </h3>
              <button className={styles.primaryBtn} onClick={onClose}>Đóng</button>
            </div>
          )}

          {/* Advisor Submit Form */}
          {phase === 'submit-form' && (
            <div className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Tiêu đề buổi tư vấn <span className={styles.required}>*</span></label>
                <input
                  className={styles.input}
                  placeholder="VD: Chiến lược gọi vốn Series A"
                  value={form.meetingTitle}
                  onChange={e => setForm(p => ({ ...p, meetingTitle: e.target.value }))}
                />
              </div>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label className={styles.label}>Thời gian tư vấn</label>
                  <input
                    className={styles.input}
                    type="datetime-local"
                    value={form.meetingTime}
                    onChange={e => setForm(p => ({ ...p, meetingTime: e.target.value }))}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Địa điểm</label>
                  <input
                    className={styles.input}
                    placeholder="VD: Online / VP HCM"
                    value={form.location}
                    onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Mục đích tư vấn</label>
                <input
                  className={styles.input}
                  placeholder="Tóm tắt mục tiêu buổi tư vấn..."
                  value={form.meetingPurpose}
                  onChange={e => setForm(p => ({ ...p, meetingPurpose: e.target.value }))}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Nội dung tư vấn</label>
                <textarea
                  className={styles.textarea}
                  rows={4}
                  placeholder="Mô tả chi tiết nội dung đã tư vấn..."
                  value={form.content}
                  onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Quyết định / Kết luận</label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  placeholder="Các quyết định, hành động tiếp theo..."
                  value={form.decisionsMade}
                  onChange={e => setForm(p => ({ ...p, decisionsMade: e.target.value }))}
                />
              </div>
              {formError && (
                <div className={styles.errorRow}>
                  <AlertCircle size={14} /><span>{formError}</span>
                </div>
              )}
              <div className={styles.footerRow}>
                <button className={styles.secondaryBtn} onClick={onClose} disabled={submitting}>Hủy</button>
                <button className={styles.primaryBtn} onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <Loader size={16} className={styles.spinning} /> : <Send size={16} />}
                  {submitting ? 'Đang nộp...' : 'Nộp báo cáo'}
                </button>
              </div>
            </div>
          )}

          {/* View Report */}
          {phase === 'view-report' && (
            <>
              {!report ? (
                <div className={styles.centered}>
                  <FileText size={40} opacity={0.3} />
                  <p className={styles.mutedText}>Chưa có báo cáo tư vấn cho booking này.</p>
                  <p className={styles.mutedText} style={{ fontSize: 13 }}>Advisor sẽ nộp báo cáo sau buổi tư vấn.</p>
                </div>
              ) : (
                <div className={styles.reportView}>
                  {/* Status bar */}
                  <div className={styles.statusBar}>
                    <span className={`${styles.statusBadge} ${styles[`badge_${report.status}`] || styles.badge_default}`}>
                      {reportStatusLabel[report.status] || report.status}
                    </span>
                    {report.revisionCount > 0 && (
                      <span className={styles.revisionBadge}>
                        <RotateCcw size={12} /> Lần sửa {report.revisionCount}/{MAX_REVISIONS}
                      </span>
                    )}
                    {/* Countdown for startup review */}
                    {!isAdvisor && report.startupReviewDueAt && report.status === 'Submitted' && (
                      <span className={styles.countdownBadge}>
                        <Clock size={12} /> {getCountdown(report.startupReviewDueAt)}
                      </span>
                    )}
                  </div>

                  {/* Report detail fields */}
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Tiêu đề</span>
                      <span className={styles.detailValue}>{report.meetingTitle}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Thời gian tư vấn</span>
                      <span className={styles.detailValue}>{formatDate(report.meetingTime)}</span>
                    </div>
                    {report.location && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Địa điểm</span>
                        <span className={styles.detailValue}>{report.location}</span>
                      </div>
                    )}
                    {report.meetingPurpose && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Mục đích</span>
                        <span className={styles.detailValue}>{report.meetingPurpose}</span>
                      </div>
                    )}
                    {report.content && (
                      <div className={`${styles.detailItem} ${styles.fullWidth}`}>
                        <span className={styles.detailLabel}>Nội dung tư vấn</span>
                        <span className={styles.detailValue} style={{ whiteSpace: 'pre-wrap' }}>{report.content}</span>
                      </div>
                    )}
                    {report.decisionsMade && (
                      <div className={`${styles.detailItem} ${styles.fullWidth}`}>
                        <span className={styles.detailLabel}>Quyết định / Kết luận</span>
                        <span className={styles.detailValue} style={{ whiteSpace: 'pre-wrap' }}>{report.decisionsMade}</span>
                      </div>
                    )}
                    {report.revisionRequestReason && (
                      <div className={`${styles.detailItem} ${styles.fullWidth}`}>
                        <span className={styles.detailLabel} style={{ color: '#f59e0b' }}>Lý do yêu cầu sửa đổi</span>
                        <span className={styles.detailValue} style={{ color: '#fcd34d' }}>{report.revisionRequestReason}</span>
                      </div>
                    )}
                  </div>

                  {/* Startup/Investor actions */}
                  {!isAdvisor && report.status === 'Submitted' && (
                    <>
                      {report.revisionCount >= MAX_REVISIONS ? (
                        <div className={styles.escalationNotice}>
                          <AlertCircle size={16} />
                          Đã yêu cầu sửa đổi {MAX_REVISIONS} lần. Báo cáo sẽ được Staff xử lý.
                        </div>
                      ) : (
                        <>
                          {showRevisionInput && (
                            <textarea
                              className={styles.textarea}
                              rows={3}
                              placeholder="Nhập lý do yêu cầu sửa đổi..."
                              value={revisionReason}
                              onChange={e => setRevisionReason(e.target.value)}
                              style={{ marginBottom: 0 }}
                            />
                          )}
                          {actionError && (
                            <div className={styles.errorRow}>
                              <AlertCircle size={14} /><span>{actionError}</span>
                            </div>
                          )}
                          <div className={styles.footerRow}>
                            {!showRevisionInput ? (
                              <>
                                <button className={styles.secondaryBtn} onClick={() => setShowRevisionInput(true)} disabled={actionLoading}>
                                  <RotateCcw size={14} /> Yêu cầu sửa đổi
                                </button>
                                <button className={styles.approveBtn} onClick={handleApprove} disabled={actionLoading}>
                                  {actionLoading ? <Loader size={14} className={styles.spinning} /> : <CheckCircle size={14} />}
                                  Chấp nhận
                                </button>
                              </>
                            ) : (
                              <>
                                <button className={styles.secondaryBtn} onClick={() => { setShowRevisionInput(false); setRevisionReason(''); setActionError(''); }} disabled={actionLoading}>
                                  Hủy
                                </button>
                                <button className={styles.revisionSubmitBtn} onClick={handleRevision} disabled={actionLoading}>
                                  {actionLoading ? <Loader size={14} className={styles.spinning} /> : <Send size={14} />}
                                  Gửi yêu cầu
                                </button>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {/* Approved / Completed view */}
                  {(report.status === 'Approved' || report.status === 'Completed') && (
                    <div className={styles.approvedNote}>
                      <CheckCircle size={16} color="#22c55e" />
                      Báo cáo đã được chấp nhận{report.startupReviewedAt ? ` lúc ${formatDate(report.startupReviewedAt)}` : ''}.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
