import React from 'react';
import { createPortal } from 'react-dom';
import { Check, AlertCircle, Copy, X, Activity, Shield, ExternalLink } from 'lucide-react';
import styles from './BlockchainVerificationModal.module.css';

/**
 * BlockchainVerificationModal - Display blockchain verification details
 * Shows: authentication status, transaction hash, timestamp, and message
 */
export default function BlockchainVerificationModal({ isOpen, verificationData, onClose, documentName }) {
    const [copied, setCopied] = React.useState(false);

    if (!isOpen || !verificationData) return null;

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
        if (verificationData.txHash) {
            window.open(`https://sepolia.etherscan.io/tx/${verificationData.txHash}`, '_blank');
        }
    };

    const handleCopyTxHash = () => {
        if (verificationData.txHash) {
            navigator.clipboard.writeText(verificationData.txHash);
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
                            {verificationData.isAuthentic ? (
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
                    {/* Authentication Status */}
                    <div className={styles.statusSection}>
                        <div className={`${styles.statusBox} ${verificationData.isAuthentic ? styles.statusAuthentic : styles.statusNotAuthentic}`}>
                            <div className={styles.statusLabel}>Tình trạng xác thực</div>
                            <div className={styles.statusValue}>
                                {verificationData.isAuthentic ? 'Đã xác thực' : 'Chưa xác thực'}
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
                            <span className={styles.timestamp} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Activity size={16} color="var(--primary-blue)" />
                                {verificationData.timestampOnBlockchain}
                            </span>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className={styles.detailsGrid}>
                        <div className={styles.detailItem}>
                            <div className={styles.detailLabel}>Dữ liệu hợp lệ</div>
                            <div className={styles.detailValue}>
                                {verificationData.isAuthentic ? 'Có' : 'Không'}
                            </div>
                        </div>
                        <div className={styles.detailItem}>
                            <div className={styles.detailLabel}>Bảo vệ blockchain</div>
                            <div className={styles.detailValue}>Có</div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.modalFooter}>
                    <span className={styles.securityNote}>
                        <Shield size={16} /> Tài liệu này được bảo vệ bởi công nghệ Blockchain
                    </span>
                    <div className={styles.footerButtons}>
                        {verificationData.txHash && (
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
            </div>
        </div>,
        document.body
    );
}
