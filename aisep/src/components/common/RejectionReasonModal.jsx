import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import styles from './FilePreviewModal.module.css'; // Reuse modal styles

/**
 * RejectionReasonModal - Form to input rejection reason
 */
export default function RejectionReasonModal({ onSubmit, onCancel, projectName }) {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!reason.trim()) {
            setError('Vui lòng nhập lý do từ chối');
            return;
        }
        if (reason.trim().length < 10) {
            setError('Lý do từ chối phải có ít nhất 10 ký tự');
            return;
        }
        onSubmit(reason.trim());
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleSubmit();
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '500px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px',
                    borderBottom: '1px solid #e5e7eb',
                    background: '#fafafa'
                }}>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                        Từ chối dự án
                    </h2>
                    <button
                        onClick={onCancel}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#6b7280',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '24px' }}>
                    {/* Project name */}
                    <div style={{ marginBottom: '16px' }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
                            Dự án:
                        </p>
                        <div style={{
                            padding: '10px 12px',
                            background: '#f3f4f6',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#1f2937'
                        }}>
                            {projectName}
                        </div>
                    </div>

                    {/* Rejection reason input */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '600',
                            marginBottom: '8px',
                            color: '#1f2937'
                        }}>
                            Lý do từ chối <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                if (error) setError('');
                            }}
                            onKeyPress={handleKeyPress}
                            placeholder="Nhập lý do từ chối dự án (tối thiểu 10 ký tự)..."
                            rows={5}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid ' + (error ? '#ef4444' : '#d1d5db'),
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontFamily: 'inherit',
                                resize: 'vertical',
                                boxSizing: 'border-box',
                                background: error ? '#fef2f2' : '#fff'
                            }}
                        />
                        {error && (
                            <div style={{
                                marginTop: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                color: '#ef4444',
                                fontSize: '13px'
                            }}>
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}
                        <div style={{
                            marginTop: '6px',
                            fontSize: '12px',
                            color: '#6b7280'
                        }}>
                            {reason.length}/10+ ký tự
                        </div>
                    </div>

                    {/* Info */}
                    <div style={{
                        padding: '12px',
                        background: '#fef3c7',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: '#92400e',
                        marginBottom: '20px',
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'flex-start'
                    }}>
                        <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>Lý do này sẽ được gửi cho người sáng lập startup</span>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '16px 24px',
                    borderTop: '1px solid #e5e7eb',
                    background: '#fafafa'
                }}>
                    <button
                        onClick={onCancel}
                        style={{
                            flex: 1,
                            padding: '10px 16px',
                            background: '#f3f4f6',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                            color: '#1f2937',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#e5e7eb'}
                        onMouseLeave={(e) => e.target.style.background = '#f3f4f6'}
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={reason.trim().length < 10}
                        style={{
                            flex: 1,
                            padding: '10px 16px',
                            background: reason.trim().length < 10 ? '#9ca3af' : '#ef4444',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: reason.trim().length < 10 ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                            color: 'white',
                            transition: 'all 0.2s',
                            opacity: reason.trim().length < 10 ? 0.6 : 1
                        }}
                        onMouseEnter={(e) => {
                            if (reason.trim().length >= 10) {
                                e.target.style.background = '#dc2626';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (reason.trim().length >= 10) {
                                e.target.style.background = '#ef4444';
                            }
                        }}
                    >
                        Xác nhận từ chối
                    </button>
                </div>
            </div>
        </div>
    );
}
