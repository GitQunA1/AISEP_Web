import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, AlertCircle, RefreshCcw, QrCode, Loader2 } from 'lucide-react';
import paymentService from '../../services/paymentService';
import styles from './SubscriptionPaymentModal.module.css';

const POLL_INTERVAL_MS = 3000;

/**
 * SubscriptionPaymentModal – Premium payment modal for subscriptions
 * Replicates the popular advisor booking payment design.
 */
export default function SubscriptionPaymentModal({ 
  checkoutData, 
  packageName, 
  activePackageName,
  isPremium,
  onClose, 
  onSuccess 
}) {
  const [phase, setPhase] = useState('qr'); // qr | success | failed
  const pollRef = useRef(null);
  const hasCalledSuccess = useRef(false);
  // Robust check for any active subscription name
  const effectiveActiveName = String(activePackageName || '').trim();
  const hasAlreadyActiveSub = effectiveActiveName !== '' && 
                              effectiveActiveName !== 'null' && 
                              effectiveActiveName !== 'Miễn phí' && 
                              effectiveActiveName !== 'Cơ bản';

  console.log('SubscriptionModal DEBUG:', { 
    newPkg: packageName, 
    activePkg: activePackageName, 
    effective: effectiveActiveName,
    showWarning: hasAlreadyActiveSub 
  });

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPolling = useCallback((transactionId) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const statusRes = await paymentService.getTransactionStatus(transactionId);
        
        // Robust check: the status might be in statusRes.status OR statusRes.data.status
        const actualStatus = statusRes?.status || statusRes?.data?.status;
        
        // Status Success, Completed, or 2 (integer) all mean paid
        if (actualStatus === 'Success' || actualStatus === 'Completed' || actualStatus === 2) {
          stopPolling();
          setPhase('success'); // Change UI first
          
          // Trigger data refresh in background immediately
          if (!hasCalledSuccess.current) {
            hasCalledSuccess.current = true;
            onSuccess?.();
          }
        } else if (actualStatus === 'Failed' || actualStatus === 3) {
          stopPolling();
          setPhase('failed');
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, POLL_INTERVAL_MS);
  }, [stopPolling, onSuccess]);

  useEffect(() => {
    if (checkoutData?.transactionId) {
      startPolling(checkoutData.transactionId);
    }
    return () => stopPolling();
  }, [checkoutData, startPolling, stopPolling]);

  const formatPrice = (p) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

  const content = (
    <div className={`${styles.overlay} ${isPremium ? styles.premium : ''}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <h2 className={styles.title}>Thanh Toán Gói Dịch Vụ</h2>
            <p className={styles.subtitle}>Gói {packageName}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {/* QR Screen */}
          {phase === 'qr' && (
            <div className={styles.qrSection}>
              {/* Warning for Existing Subscription - Forced visible for debugging */}
              <div className={styles.warningBox}>
                <AlertCircle size={20} className={styles.warningIcon} />
                <div className={styles.warningContent}>
                  <p className={styles.warningText}>
                    Gói đăng ký <strong>{activePackageName || 'Miễn phí'}</strong> của bạn đang hoạt động. 
                    Nếu bạn tiếp tục thực hiện mua gói <strong>{packageName}</strong>, các ưu đãi trong gói đăng ký hiện tại của bạn sẽ không được bảo lưu.
                  </p>
                </div>
              </div>

              <div className={styles.amountRow}>
                <span className={styles.amountLabel}>Tổng tiền thanh toán</span>
                <span className={styles.amountValue}>{formatPrice(checkoutData.amount)}</span>
              </div>

              <div className={styles.qrWrapper}>
                {checkoutData.qrCodeUrl ? (
                  <img
                    src={checkoutData.qrCodeUrl}
                    alt="QR thanh toán"
                    className={styles.qrImage}
                  />
                ) : (
                  <div className={styles.qrPlaceholder}>
                    <QrCode size={64} opacity={0.3} />
                    <p>QR không khả dụng</p>
                  </div>
                )}
              </div>

              <div className={styles.paymentCodeRow}>
                <span className={styles.codeLabel}>Nội dung chuyển khoản</span>
                <code className={styles.codeValue}>{checkoutData.paymentCode}</code>
              </div>

              <div className={styles.pollIndicator}>
                <div className={styles.pulsingDot} />
                <span>Đang chờ xác nhận giao dịch...</span>
              </div>

              <p className={styles.instruction}>
                Quét mã QR bằng ứng dụng ngân hàng và chuyển khoản đúng <strong>số tiền</strong> và <strong>nội dung</strong> ở trên.
              </p>
            </div>
          )}

          {/* Success */}
          {phase === 'success' && (
            <div className={styles.centeredState}>
              <div className={styles.successIcon}>
                <CheckCircle2 size={64} />
              </div>
              <h3 className={styles.successTitle}>Kích hoạt thành công!</h3>
              <p className={styles.successText}>
                Gói {packageName} của bạn đã được kích hoạt. Bạn có thể sử dụng các tính năng Premium ngay bây giờ.
              </p>
              <button className={styles.primaryBtn} onClick={onClose}>
                Xác nhận và đóng
              </button>
            </div>
          )}

          {/* Failed */}
          {phase === 'failed' && (
            <div className={styles.centeredState}>
              <div className={styles.failedIcon}>
                <AlertCircle size={64} />
              </div>
              <h3 className={styles.failedTitle}>Giao dịch thất bại</h3>
              <p className={styles.failedText}>
                Đã có lỗi xảy ra trong quá trình xử lý. Tiền của bạn sẽ được hoàn trả nếu giao dịch đã bị trừ.
              </p>
              <div className={styles.actionRow}>
                <button className={styles.cancelBtn} onClick={onClose}>Quay lại</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
