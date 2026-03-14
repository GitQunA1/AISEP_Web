import React from 'react';
import { Check, AlertCircle, Copy, X } from 'lucide-react';
import styles from './BlockchainVerificationModal.module.css';

/**
 * BlockchainVerificationModal - Display blockchain verification details
 * Shows: authentication status, transaction hash, timestamp, and message
 */
export default function BlockchainVerificationModal({ isOpen, verificationData, onClose, documentName }) {
    const [copied, setCopied] = React.useState(false);

    if (!isOpen || !verificationData) return null;

    const handleCopyTxHash = () => {
        navigator.clipboard.writeText(verificationData.txHash);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.modalHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className={styles.headerIcon}>
                            {verificationData.isAuthentic ? (
                                <Check size={24} color="#17bf63" />
                            ) : (
                                <AlertCircle size={24} color="#d97706" />
                            )}
                        </div>
                        <div>
                            <h2 className={styles.modalTitle}>Xác thực Blockchain</h2>
                            <p className={styles.documentName}>{documentName}</p>
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Main Content */}
                <div className={styles.modalBody}>
                    {/* Authentication Status */}
                    <div className={styles.statusSection}>
                        <div className={styles.statusBox} style={{
                            borderColor: verificationData.isAuthentic ? '#17bf63' : '#d97706',
                            backgroundColor: verificationData.isAuthentic ? 'rgba(23, 191, 99, 0.05)' : 'rgba(217, 119, 6, 0.05)'
                        }}>
                            <div className={styles.statusLabel}>Tình trạng xác thực</div>
                            <div className={styles.statusValue} style={{
                                color: verificationData.isAuthentic ? '#17bf63' : '#d97706'
                            }}>
                                {verificationData.isAuthentic ? '✓ Được xác thực' : '⚠ Chưa xác thực'}
                            </div>
                        </div>
                    </div>

                    {/* Verification Message */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Thông điệp xác thực</h3>
                        <div className={styles.messageBox}>
                            <p>{verificationData.message}</p>
                        </div>
                    </div>

                    {/* Transaction Hash */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Mã giao dịch Blockchain</h3>
                        <div className={styles.txHashContainer}>
                            <code className={styles.txHash}>{verificationData.txHash}</code>
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

                    {/* Timestamp */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Thời gian xác thực</h3>
                        <div className={styles.timestampBox}>
                            <span className={styles.timestamp}>⏰ {verificationData.timestampOnBlockchain}</span>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className={styles.detailsGrid}>
                        <div className={styles.detailItem}>
                            <div className={styles.detailLabel}>Dữ liệu hợp lệ</div>
                            <div className={styles.detailValue}>
                                {verificationData.isAuthentic ? '✓ Có' : '✗ Không'}
                            </div>
                        </div>
                        <div className={styles.detailItem}>
                            <div className={styles.detailLabel}>Bảo vệ blockchain</div>
                            <div className={styles.detailValue}>✓ Có</div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.modalFooter}>
                    <span className={styles.securityNote}>
                        🔐 Tài liệu này được bảo vệ bởi công nghệ Blockchain
                    </span>
                    <button className={styles.closeConfirmBtn} onClick={onClose}>
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
