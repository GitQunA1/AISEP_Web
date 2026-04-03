import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, RefreshCw, QrCode, Clock } from 'lucide-react';
import paymentService from '../../services/paymentService';
import styles from './PaymentModal.module.css';

const POLL_INTERVAL_MS = 3000;

/**
 * PaymentModal – Hiển thị QR thanh toán cho booking và poll trạng thái.
 *
 * Props:
 *   bookingId       {number}  - ID của booking cần thanh toán
 *   price           {number}  - Giá hiển thị (decimal VNĐ)
 *   advisorName     {string}  - Tên advisor
 *   slotCount       {number}  - Số giờ tư vấn
 *   onClose         {fn}      - Đóng modal
 *   onPaid          {fn}      - Callback khi thanh toán thành công
 */
export default function PaymentModal({ bookingId, price, advisorName, slotCount, onClose, onPaid }) {
  const [phase, setPhase] = useState('loading'); // loading | qr | success | failed | error
  const [checkout, setCheckout] = useState(null); // { transactionId, amount, paymentCode, qrCodeUrl }
  const [errorMsg, setErrorMsg] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);
  const pollRef = useRef(null);
  const hasCalledPaid = useRef(false);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPolling = useCallback((bid) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const status = await paymentService.getBookingPaymentStatus(bid);
        if (status?.isPaid || status?.transactionStatus === 'Completed') {
          stopPolling();
          setPhase('success');
          if (!hasCalledPaid.current) {
            hasCalledPaid.current = true;
            onPaid?.();
          }
        } else if (status?.transactionStatus === 'Failed') {
          stopPolling();
          setPhase('failed');
        }
      } catch (_) {
        // Bỏ qua lỗi poll tạm thời
      }
    }, POLL_INTERVAL_MS);
  }, [stopPolling, onPaid]);

  const doCheckout = useCallback(async (bid) => {
    setPhase('loading');
    setErrorMsg('');
    try {
      const result = await paymentService.checkoutBooking(bid);
      setCheckout(result);
      setPhase('qr');
      startPolling(bid);
    } catch (e) {
      setErrorMsg(e?.message || 'Không thể tạo thanh toán. Vui lòng thử lại.');
      setPhase('error');
    }
  }, [startPolling]);

  useEffect(() => {
    doCheckout(bookingId);
    return () => stopPolling();
  }, [bookingId, doCheckout, stopPolling]);

  const handleRetry = async () => {
    setIsRetrying(true);
    await doCheckout(bookingId);
    setIsRetrying(false);
  };

  const formatPrice = (p) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

  const content = (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <h2 className={styles.title}>Thanh Toán Tư Vấn</h2>
            <p className={styles.subtitle}>{advisorName} · {slotCount} giờ</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {/* Loading */}
          {phase === 'loading' && (
            <div className={styles.centeredState}>
              <div className={styles.spinner} />
              <p className={styles.statusText}>Đang tạo mã thanh toán...</p>
            </div>
          )}

          {/* QR Screen */}
          {phase === 'qr' && checkout && (
            <div className={styles.qrSection}>
              <div className={styles.amountRow}>
                <span className={styles.amountLabel}>Tổng tiền</span>
                <span className={styles.amountValue}>{formatPrice(checkout.amount)}</span>
              </div>

              <div className={styles.qrWrapper}>
                {checkout.qrCodeUrl ? (
                  <img
                    src={checkout.qrCodeUrl}
                    alt="QR thanh toán"
                    className={styles.qrImage}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className={styles.qrPlaceholder}>
                    <QrCode size={64} opacity={0.3} />
                    <p>QR không khả dụng</p>
                  </div>
                )}
              </div>

              <div className={styles.paymentCodeRow}>
                <span className={styles.codeLabel}>Mã thanh toán</span>
                <code className={styles.codeValue}>{checkout.paymentCode}</code>
              </div>

              <div className={styles.pollIndicator}>
                <div className={styles.pulsingDot} />
                <span>Đang chờ xác nhận thanh toán...</span>
              </div>

              <p className={styles.instruction}>
                Quét mã QR bằng ứng dụng ngân hàng và chuyển khoản đúng <strong>số tiền</strong> và <strong>nội dung chuyển khoản</strong> ở trên.
              </p>
            </div>
          )}

          {/* Success */}
          {phase === 'success' && (
            <div className={styles.centeredState}>
              <div className={styles.successIcon}>
                <CheckCircle size={56} />
              </div>
              <h3 className={styles.successTitle}>Thanh toán thành công!</h3>
              <p className={styles.successText}>
                Booking đã được xác nhận. Bạn có thể chat với advisor khi buổi tư vấn bắt đầu.
              </p>
              <button className={styles.primaryBtn} onClick={onClose}>
                Đóng
              </button>
            </div>
          )}

          {/* Failed */}
          {phase === 'failed' && (
            <div className={styles.centeredState}>
              <div className={styles.failedIcon}>
                <AlertCircle size={56} />
              </div>
              <h3 className={styles.failedTitle}>Thanh toán thất bại</h3>
              <p className={styles.failedText}>Giao dịch không thể hoàn thành. Vui lòng thử lại.</p>
              <div className={styles.actionRow}>
                <button className={styles.retryBtn} onClick={handleRetry} disabled={isRetrying}>
                  <RefreshCw size={16} className={isRetrying ? styles.spinning : ''} />
                  {isRetrying ? 'Đang tạo lại...' : 'Thử lại'}
                </button>
                <button className={styles.cancelBtn} onClick={onClose}>Hủy</button>
              </div>
            </div>
          )}

          {/* Error */}
          {phase === 'error' && (
            <div className={styles.centeredState}>
              <div className={styles.failedIcon}>
                <AlertCircle size={56} />
              </div>
              <h3 className={styles.failedTitle}>Lỗi kết nối</h3>
              <p className={styles.failedText}>{errorMsg}</p>
              <div className={styles.actionRow}>
                <button className={styles.retryBtn} onClick={handleRetry} disabled={isRetrying}>
                  <RefreshCw size={16} className={isRetrying ? styles.spinning : ''} />
                  {isRetrying ? 'Đang thử lại...' : 'Thử lại'}
                </button>
                <button className={styles.cancelBtn} onClick={onClose}>Hủy</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
