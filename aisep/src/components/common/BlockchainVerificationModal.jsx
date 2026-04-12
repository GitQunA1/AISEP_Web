import React from 'react';
import { createPortal } from 'react-dom';
import { Check, AlertCircle, Copy, X, Activity, Shield, ExternalLink } from 'lucide-react';
import styles from './BlockchainVerificationModal.module.css';

/**
 * BlockchainVerificationModal - Display blockchain verification details
 * Shows: authentication status, transaction hash, timestamp, and message
 */
export default function BlockchainVerificationModal({ isOpen, verificationData, onClose, documentName, isLoading, error }) {
    const [copied, setCopied] = React.useState(false);

    if (!isOpen) return null;

    // Extract data from API response format
    const apiData = verificationData?.data || verificationData || {};
    const isFullyVerified = apiData.isFullyVerified;
    const totalDocs = apiData.totalDocuments || 1;
    const verifiedDocs = apiData.verifiedDocuments || 0;
    const docDetails = apiData.verifiedDocumentDetails || [];
    const firstDoc = docDetails[0] || {};
    const txHash = firstDoc.txHash;
    const timestamp = firstDoc.timestampOnBlockchain;
    const signerAddress = firstDoc.signerAddress;

    const truncateName = (name, maxLength = 16) => {
        if (!name || name.length <= maxLength) return name;
        const extension = name.split('.').pop();
        const nameWithoutExtension = name.substring(0, name.lastIndexOf('.'));
        if (nameWithoutExtension.length > maxLength - extension.length - 3) {
            return nameWithoutExtension.substring(0, maxLength - extension.length - 3) + '...' + extension;
        }
        return name;
    };

    const handleViewOnEtherscan = () => {
        if (txHash) {
            window.open(`https://sepolia.etherscan.io/tx/${txHash}`, '_blank');
        }
    };

    const handleCopyTxHash = () => {
        if (txHash) {
            navigator.clipboard.writeText(txHash);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return createPortal(
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.modalHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className={styles.headerIcon}>
                            {isLoading ? (
                                <Activity size={24} color="var(--primary-blue)" />
                            ) : error ? (
                                <AlertCircle size={24} color="#f4212e" />
                            ) : isFullyVerified ? (
                                <Check size={24} color="var(--score-good)" />
                            ) : (
                                <AlertCircle size={24} color="var(--score-medium)" />
                            )}
                        </div>
                        <div>
                            <h2 className={styles.modalTitle}>Xác thực Blockchain</h2>
                            <p className={styles.documentName} title={documentName}>
                                {truncateName(documentName, 16)}
                            </p>
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Main Content */}
                <div className={styles.modalBody}>
                    {isLoading && (
                        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                            <div style={{
                                display: 'inline-block',
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                border: '3px solid #e5e7eb',
                                borderTopColor: '#1d9bf0',
                                animation: 'spin 0.8s linear infinite'
                            }} />
                            <p style={{ marginTop: '12px', color: '#666' }}>Đang xác minh...</p>
                        </div>
                    )}

                    {error && (
                        <div style={{
                            backgroundColor: '#fee',
                            border: '1px solid #fcc',
                            borderRadius: '8px',
                            padding: '16px',
                            display: 'flex',
                            gap: '12px'
                        }}>
                            <AlertCircle size={20} style={{ color: '#f4212e', flexShrink: 0, marginTop: '2px' }} />
                            <div>
                                <div style={{ fontWeight: '600', color: '#f4212e' }}>Lỗi xác minh</div>
                                <div style={{ fontSize: '14px', color: '#999' }}>{error}</div>
                            </div>
                        </div>
                    )}

                    {!isLoading && !error && (
                        <>
                            {/* Authentication Status */}
                            <div className={styles.statusSection}>
                                <div className={`${styles.statusBox} ${isFullyVerified ? styles.statusAuthentic : styles.statusNotAuthentic}`}>
                                    <div className={styles.statusLabel}>Tình trạng xác thực</div>
                                    <div className={styles.statusValue}>
                                        {isFullyVerified ? '✓ Đã xác thực' : 'Chưa xác thực'}
                                    </div>
                                </div>
                            </div>

                            {/* Document Stats */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '12px',
                                marginBottom: '20px'
                            }}>
                                <div style={{
                                    backgroundColor: '#f9f9f9',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    padding: '12px'
                                }}>
                                    <div style={{ fontSize: '11px', color: '#999', fontWeight: '600' }}>Tổng tài liệu</div>
                                    <div style={{ fontSize: '20px', fontWeight: '700', marginTop: '4px' }}>{totalDocs}</div>
                                </div>
                                <div style={{
                                    backgroundColor: '#f9f9f9',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    padding: '12px'
                                }}>
                                    <div style={{ fontSize: '11px', color: '#999', fontWeight: '600' }}>Đã xác minh</div>
                                    <div style={{ fontSize: '20px', fontWeight: '700', marginTop: '4px', color: '#10b981' }}>{verifiedDocs}</div>
                                </div>
                            </div>

                            {/* Transaction Hash */}
                            {txHash && (
                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}>Mã giao dịch Blockchain</h3>
                                    <div className={styles.txHashContainer}>
                                        <code className={styles.txHash} style={{ wordBreak: 'break-all' }}>{txHash}</code>
                                        <button
                                            className={styles.copyBtn}
                                            onClick={handleCopyTxHash}
                                            title="Copy transaction hash"
                                        >
                                            <Copy size={16} />
                                            {copied ? 'Đã sao chép' : 'Sao chép'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Signer Address */}
                            {signerAddress && (
                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}>Địa chỉ ký (Signer)</h3>
                                    <div className={styles.txHashContainer}>
                                        <code className={styles.txHash} style={{ wordBreak: 'break-all', fontSize: '12px' }}>{signerAddress}</code>
                                        <button
                                            className={styles.copyBtn}
                                            onClick={() => {
                                                navigator.clipboard.writeText(signerAddress);
                                                setCopied(true);
                                                setTimeout(() => setCopied(false), 2000);
                                            }}
                                            title="Copy signer address"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Timestamp */}
                            {timestamp && (
                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}>Thời gian xác thực</h3>
                                    <div style={{
                                        backgroundColor: '#f9f9f9',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        padding: '12px',
                                        fontSize: '14px'
                                    }}>
                                        {new Date(timestamp).toLocaleString('vi-VN')}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Info Box - Guide */}
                {!isLoading && !error && txHash && (
                    <div style={{
                        backgroundColor: '#f0f7ff',
                        border: '1px solid #bae6fd',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '16px',
                        display: 'flex',
                        gap: '12px',
                        fontSize: '13px',
                        color: '#0369a1'
                    }}>
                        <span style={{ fontSize: '18px', flexShrink: 0 }}>ℹ️</span>
                        <div>
                            <strong>Hướng dẫn:</strong> Bạn có thể copy mã giao dịch (TX Hash) ở trên và kiểm tra chi tiết trên{' '}
                            <a 
                                href="https://sepolia.etherscan.io/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{
                                    color: '#0369a1',
                                    textDecoration: 'underline',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Sepolia Etherscan
                            </a>
                            {' '}để xác nhận độc lập
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className={styles.modalFooter}>
                    <span className={styles.securityNote}>
                        <Shield size={16} /> Tài liệu này được bảo vệ bởi công nghệ Blockchain
                    </span>
                    <div className={styles.footerButtons}>
                        {txHash && (
                            <button className={styles.secondaryBtn} onClick={handleViewOnEtherscan}>
                                <ExternalLink size={16} style={{ marginRight: '8px' }} />
                                Xem trên Etherscan
                            </button>
                        )}
                        <button className={styles.closeConfirmBtn} onClick={onClose}>
                            Đóng
                        </button>
                    </div>
                </div>

                <style>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>,
        document.body
    );
}
