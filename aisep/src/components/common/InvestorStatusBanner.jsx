import React from 'react';
import { AlertCircle, ChevronRight } from 'lucide-react';
import sharedStyles from '../../styles/SharedDashboard.module.css';

const InvestorStatusBanner = ({ status, reason, onUpdateProfile }) => {
    // Only show if the status exists and isn't Approved
    if (!status || status === 'Approved') return null;

    return (
        <div className={`${sharedStyles.onboardingBanner} ${
            status === 'Rejected' ? sharedStyles.bannerRejected : 
            status === 'Pending' ? sharedStyles.bannerPending : ''
        }`} style={{ flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                <div style={{ 
                    width: 32, height: 32, borderRadius: '8px', flexShrink: 0,
                    background: status === 'Rejected' ? 'rgba(239, 68, 68, 0.1)' : 
                               status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(29, 155, 240, 0.1)',
                    color: status === 'Rejected' ? '#ef4444' : 
                           status === 'Pending' ? '#f59e0b' : 'var(--primary-blue)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <AlertCircle size={16} />
                </div>
                <div style={{ minWidth: 0 }}>
                    <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)', display: 'block' }}>
                        {status === 'Missing' ? 'Yêu cầu hoàn thiện hồ sơ' : 
                         status === 'Rejected' ? 'Hồ sơ bị từ chối' : 'Hồ sơ đang chờ duyệt'}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {status === 'Missing' ? 'Bạn cần tạo hồ sơ nhà đầu tư để có thể kết nối và đề xuất đầu tư vào các dự án.' : 
                         status === 'Rejected' ? `Lý do: ${reason || 'Hồ sơ không hợp lệ'}. Vui lòng cập nhật lại.` : 
                         'Yêu cầu của bạn đang được xử lý. Bạn sẽ nhận được thông báo sau khi hồ sơ được phê duyệt.'}
                    </span>
                </div>
            </div>
            {onUpdateProfile && (
                <button 
                    className={`${sharedStyles.secondaryBtn} ${sharedStyles.bannerActionBtn}`}
                    onClick={onUpdateProfile}
                    style={{ whiteSpace: 'nowrap', flexShrink: 0, borderRadius: '9999px', padding: '10px 22px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                    Cập nhật hồ sơ <ChevronRight size={14} />
                </button>
            )}
        </div>
    );
};

export default InvestorStatusBanner;
