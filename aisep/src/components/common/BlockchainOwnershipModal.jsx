import React from 'react';
import { X, Check, AlertCircle, Activity, Copy, ExternalLink } from 'lucide-react';

export default function BlockchainOwnershipModal({
    isOpen,
    ownershipData,
    onClose,
    isLoading = false,
    error = null,
    dealId = null
}) {
    if (!isOpen) return null;

    // Extract data from API response
    const apiData = ownershipData?.data || ownershipData || {};
    const isOwnerAssigned = apiData.isOwnerAssignedOnChain;
    const investorWallet = apiData.investorWallet;
    const registerDocumentTxHash = apiData.registerDocumentTxHash;
    const assignOwnerTxHash = apiData.assignOwnerTxHash;
    const documentHash = apiData.documentHash;
    const onChainOwners = apiData.onChainOwners || [];
    const timestamp = apiData.timestampOnBlockchain;

    const handleCopyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text);
        alert(`${type} đã được sao chép!`);
    };

    const shortenAddress = (address) => {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    };

    const etherscanBaseUrl = 'https://sepolia.etherscan.io/tx/';

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderRadius: '16px',
                    padding: '24px',
                    maxWidth: '600px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                    position: 'relative',
                    border: '1px solid var(--border-color)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {isLoading ? (
                            <Activity size={24} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
                        ) : error ? (
                            <AlertCircle size={24} color="#ef4444" />
                        ) : isOwnerAssigned ? (
                            <Check size={24} color="#10b981" />
                        ) : (
                            <AlertCircle size={24} color="#f59e0b" />
                        )}
                        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                            Xác thực Chuyển giao Quyền Sở hữu Blockchain
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            padding: '0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '40px 20px',
                        gap: '16px'
                    }}>
                        <Activity size={32} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
                            Đang kiểm tra trạng thái chuyển giao quyền sở hữu trên Blockchain...
                        </p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '20px',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start'
                    }}>
                        <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                            <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#ef4444' }}>
                                Lỗi kiểm tra trạng thái
                            </p>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '12px' }}>{error}</p>
                        </div>
                    </div>
                )}

                {/* Success Content */}
                {!isLoading && !error && (
                    <>
                        {/* Status Badge */}
                        <div style={{
                            backgroundColor: isOwnerAssigned ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            border: `1px solid ${isOwnerAssigned ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
                            borderRadius: '8px',
                            padding: '16px',
                            marginBottom: '20px',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: isOwnerAssigned ? '#10b981' : '#f59e0b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}>
                                {isOwnerAssigned ? (
                                    <>
                                        <Check size={18} />
                                        🟢 Hợp đồng đã có hiệu lực & Được bảo chứng trên Blockchain
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle size={18} />
                                        ⏳ Chưa xác nhận quyền sở hữu
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Ownership Details */}
                        {isOwnerAssigned && (
                            <>
                                {/* Owner Wallet */}
                                <div style={{ marginBottom: '20px' }}>
                                    <p style={{
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        color: 'var(--text-secondary)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        marginBottom: '8px'
                                    }}>
                                        👤 Chủ sở hữu hợp pháp
                                    </p>
                                    <div style={{
                                        backgroundColor: 'var(--bg-secondary)',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        fontFamily: 'monospace',
                                        fontSize: '12px',
                                        wordBreak: 'break-all',
                                        color: 'var(--text-primary)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        VÍ: {investorWallet}
                                        <button
                                            onClick={() => handleCopyToClipboard(investorWallet, 'Ví')}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: 'var(--primary-blue)',
                                                padding: '4px 8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                fontSize: '11px'
                                            }}
                                        >
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Etherscan Links */}
                                <div style={{ marginBottom: '20px' }}>
                                    <p style={{
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        color: 'var(--text-secondary)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        marginBottom: '8px'
                                    }}>
                                        🔍 Truy vết Blockchain (Sepolia Testnet)
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {assignOwnerTxHash && (
                                            <a
                                                href={etherscanBaseUrl + assignOwnerTxHash}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    padding: '10px 12px',
                                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                    border: '1px solid rgba(59, 130, 246, 0.2)',
                                                    borderRadius: '6px',
                                                    color: 'var(--primary-blue)',
                                                    textDecoration: 'none',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    transition: 'all 0.2s',
                                                    cursor: 'pointer'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                                                }}
                                            >
                                                🔗 Xem biên lai xác nhận quyền sở hữu
                                                <ExternalLink size={12} />
                                            </a>
                                        )}

                                        {registerDocumentTxHash && (
                                            <a
                                                href={etherscanBaseUrl + registerDocumentTxHash}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    padding: '10px 12px',
                                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                    border: '1px solid rgba(16, 185, 129, 0.2)',
                                                    borderRadius: '6px',
                                                    color: '#10b981',
                                                    textDecoration: 'none',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    transition: 'all 0.2s',
                                                    cursor: 'pointer'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                                                }}
                                            >
                                                🔗 Xem lịch sử bản quyền tài liệu gốc
                                                <ExternalLink size={12} />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Document Hash */}
                                {documentHash && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <p style={{
                                            fontSize: '12px',
                                            fontWeight: '700',
                                            color: 'var(--text-secondary)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            marginBottom: '8px'
                                        }}>
                                            🔐 Mã Hash tài liệu (SHA-256)
                                        </p>
                                        <div style={{
                                            backgroundColor: 'var(--bg-secondary)',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            fontFamily: 'monospace',
                                            fontSize: '11px',
                                            wordBreak: 'break-all',
                                            color: 'var(--text-primary)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            {documentHash}
                                            <button
                                                onClick={() => handleCopyToClipboard(documentHash, 'Hash')}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: 'var(--primary-blue)',
                                                    padding: '4px 8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    fontSize: '11px'
                                                }}
                                            >
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Timestamp */}
                                {timestamp && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <p style={{
                                            fontSize: '12px',
                                            fontWeight: '700',
                                            color: 'var(--text-secondary)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            marginBottom: '8px'
                                        }}>
                                            ⏰ Thời gian xác nhận
                                        </p>
                                        <div style={{
                                            backgroundColor: 'var(--bg-secondary)',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            color: 'var(--text-primary)'
                                        }}>
                                            {new Date(timestamp).toLocaleString('vi-VN')}
                                        </div>
                                    </div>
                                )}

                                {/* Info Message */}
                                <div style={{
                                    backgroundColor: 'rgba(59, 130, 246, 0.05)',
                                    border: '1px solid rgba(59, 130, 246, 0.2)',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    display: 'flex',
                                    gap: '12px',
                                    fontSize: '13px',
                                    color: 'var(--text-secondary)'
                                }}>
                                    <span style={{ fontSize: '18px', flexShrink: 0 }}>ℹ️</span>
                                    <div>
                                        <strong style={{ color: 'var(--primary-blue)' }}>Ghi chú:</strong> Quyền sở hữu hợp đồng này đã được bảo chứng trên mạng lưới Blockchain Sepolia Testnet. Bạn có thể xác minh độc lập bất kỳ lúc nào qua Etherscan.
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* Footer */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    marginTop: '24px',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--border-color)'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'var(--bg-hover)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'var(--bg-secondary)';
                        }}
                    >
                        Đóng
                    </button>
                </div>

                {/* Spin Animation */}
                <style>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>
    );
}
