import React from 'react';
import { AlertCircle, ArrowRight, ShieldCheck, XCircle } from 'lucide-react';
import styles from './AdvisorProfileBanner.module.css';

/**
 * AdvisorProfileBanner - A persistent, non-intrusive header notification
 * for the Advisor Dashboard when the profile is missing, pending, or rejected.
 */
const AdvisorProfileBanner = ({ onRedirect, status, approvalStatus, reason }) => {
  // Normalize status - Advisors use 'status' or 'approvalStatus' depending on the endpoint
  const currentStatus = (status !== undefined && status !== null) ? status : approvalStatus;
  
  // Status mapping: 
  // Missing: advisorProfile is null
  // Pending: 0
  // Approved: 1
  // Rejected: 2
  
  const isPending = currentStatus === 0 || currentStatus === '0' || String(currentStatus || '').toUpperCase() === 'PENDING';
  const isRejected = currentStatus === 2 || currentStatus === '2' || String(currentStatus || '').toUpperCase() === 'REJECTED';
  const isMissing = !currentStatus && currentStatus !== 0;

  if (!isPending && !isRejected && !isMissing) return null;

  return (
    <div className={`${styles.bannerContainer} ${isPending ? styles.pending : ''} ${isRejected ? styles.rejected : ''}`}>
      <div className={styles.bannerContent}>
        <div className={styles.leftSection}>
          <div className={styles.iconCircle}>
            {isPending ? <ShieldCheck size={20} /> : isRejected ? <XCircle size={20} /> : <AlertCircle size={20} />}
          </div>
          <div className={styles.textWrapper}>
            <h4 className={styles.title}>
              {isPending 
                ? 'Hồ sơ chuyên gia đang chờ phê duyệt' 
                : isRejected 
                  ? 'Hồ sơ chuyên gia bị từ chối' 
                  : 'Hoàn thiện hồ sơ chuyên gia của bạn'}
            </h4>
            <p className={styles.description}>
              {isPending 
                ? 'Thông tin chuyên môn của bạn đang được đội ngũ Staff kiểm tra. Quá trình này thường mất 1-2 ngày làm việc.' 
                : isRejected
                  ? `Lý do: ${reason || 'Hồ sơ chưa đạt yêu cầu chuyên môn hoặc thiếu thông tin minh chứng'}. Vui lòng cập nhật lại thông tin để được phê duyệt.`
                  : 'Hãy hoàn thiện hồ sơ để có thể thiết lập lịch rảnh, kết nối với Startup và bắt đầu hành trình cố vấn tại AISEP.'}
            </p>
          </div>
        </div>
        {onRedirect && (
          <button className={styles.actionBtn} onClick={onRedirect}>
            <span>{isPending || isRejected ? 'Xem hồ sơ' : 'Thiết lập ngay'}</span>
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default AdvisorProfileBanner;
