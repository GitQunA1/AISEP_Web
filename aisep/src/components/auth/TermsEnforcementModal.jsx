import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ShieldAlert, Loader2, LogOut } from 'lucide-react';
import styles from '../common/AIEvaluationModal.module.css';
import termsService from '../../services/termsService';

/**
 * TermsEnforcementModal - Blocks user until they accept current T&C
 */
export default function TermsEnforcementModal({ isOpen, user, termsData, onAccepted, onLogout }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleAccept = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await termsService.acceptTerms(termsData.version);
            if (response.success || response) {
                onAccepted();
            } else {
                setError('Không thể cập nhật điều khoản. Vui lòng thử lại.');
            }
        } catch (err) {
            console.error('Failed to accept terms:', err);
            setError(err.message || 'Lỗi hệ thống khi chấp nhận điều khoản.');
        } finally {
            setIsLoading(false);
        }
    };

    return createPortal(
        <div className={styles.backdrop} style={{ zIndex: 9999 }}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                {/* Header */}
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        <ShieldAlert size={24} style={{ color: '#ffad1f', marginRight: '12px' }} />
                        Cập nhật Điều khoản sử dụng
                    </h2>
                </div>

                {/* Content */}
                <div className={styles.content} style={{ padding: '24px' }}>
                    <p style={{ marginBottom: '16px', fontWeight: '600' }}>
                        Chào {user?.fullName || 'bạn'}, chúng tôi vừa cập nhật Điều khoản sử dụng (Phiên bản {termsData?.version || 'mới'}).
                    </p>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                        Vui lòng đọc và chấp nhận các điều khoản mới để tiếp tục sử dụng nền tảng AISEP.
                    </p>

                    <div 
                        style={{ 
                            maxHeight: '300px', 
                            overflowY: 'auto', 
                            padding: '16px', 
                            backgroundColor: 'rgba(0,0,0,0.05)', 
                            borderRadius: '12px',
                            fontSize: '0.9rem',
                            lineHeight: '1.6',
                            border: '1px solid var(--border-color)'
                        }}
                        dangerouslySetInnerHTML={{ __html: termsData?.content || 'Đang tải nội dung điều khoản...' }}
                    />

                    {error && (
                        <p style={{ color: '#ef4444', marginTop: '16px', fontSize: '0.85rem' }}>{error}</p>
                    )}
                </div>

                {/* Footer */}
                <div className={styles.footer} style={{ gap: '12px' }}>
                    <button
                        className={styles.secondaryBtn}
                        onClick={onLogout}
                        disabled={isLoading}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        <LogOut size={18} /> Đăng xuất
                    </button>
                    <button
                        className={styles.primaryBtn}
                        onClick={handleAccept}
                        disabled={isLoading || !termsData?.version}
                        style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Tôi đồng ý & Tiếp tục'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
