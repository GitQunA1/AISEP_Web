import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import { History, FileText, Plus, Save, RotateCcw, AlertCircle, Loader2, CheckCircle2, ChevronRight, Clock, X } from 'lucide-react';
import styles from './TermsManagement.module.css';
import adminService from '../../services/adminService';
import termsService from '../../services/termsService';

/**
 * TermsManagement - Admin/Staff interface for T&C
 * @param {boolean} canEdit - Whether the current user can create new versions
 * @param {boolean} hideHeader - Whether to hide the internal title and subtitle
 * @param {string} searchTerm - Search query for filtering versions
 */
const TermsManagement = forwardRef(({ canEdit = false, hideHeader = false, searchTerm = '' }, ref) => {
    const [history, setHistory] = useState([]);
    const [activeTerm, setActiveTerm] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    // Form state for new version
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        contentHtml: '',
        version: ''
    });
    const [selectedTerm, setSelectedTerm] = useState(null);
    const [isSelecting, setIsSelecting] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch history - handle error within to prevent total failure
            let historyData = [];
            try {
                const historyRes = await adminService.getTermsHistory({ pageSize: 10 });
                historyData = historyRes?.data?.items || historyRes?.items || (Array.isArray(historyRes?.data) ? historyRes.data : []);
            } catch (hErr) {
                console.warn('[TermsManagement] History fetch failed:', hErr);
                // Keep history empty
            }
            setHistory(historyData);
            
            // Fetch active term - handle 404 as "no term"
            let activeData = null;
            try {
                const activeRes = await termsService.getActiveTerms();
                activeData = activeRes?.data || activeRes;
            } catch (aErr) {
                if (aErr.response?.status === 404) {
                    console.info('[TermsManagement] No active terms found (404)');
                } else {
                    console.error('[TermsManagement] Active terms fetch failed:', aErr);
                    // Re-throw if it's not a 404 (e.g. 500 or 401)
                    throw aErr;
                }
            }
            setActiveTerm(activeData);
            setSelectedTerm(activeData); // Default to viewing the active term
            
            // Initialize form with current content if editing
            if (activeData) {
                setFormData({
                    contentHtml: activeData.contentHtml || '',
                    version: incrementVersion(activeData.version || 'v1.0')
                });
            } else {
                setFormData({
                    contentHtml: '',
                    version: 'v1.0'
                });
            }
        } catch (err) {
            console.error('[TermsManagement] Fetch failed:', err);
            setError('Không thể tải dữ liệu điều khoản. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectTerm = (item) => {
        if (selectedTerm?.id === item.id) return;
        setIsSelecting(true);
        // Artificial delay for UX "feel"
        setTimeout(() => {
            setSelectedTerm(item);
            setIsSelecting(false);
        }, 400);
    };

    const filteredHistory = React.useMemo(() => {
        if (!searchTerm) return history;
        const lowerSearch = searchTerm.toLowerCase();
        return history.filter(item => 
            item.version.toLowerCase().includes(lowerSearch) ||
            new Date(item.createdAt).toLocaleDateString('vi-VN').includes(searchTerm)
        );
    }, [history, searchTerm]);

    const incrementVersion = (v) => {
        if (!v) return 'v1.1';
        const match = v.match(/v(\d+)\.(\d+)/);
        if (match) {
            const major = match[1];
            const minor = parseInt(match[2]) + 1;
            return `v${major}.${minor}`;
        }
        // Fallback for v1, v2 etc.
        const simpleMatch = v.match(/v(\d+)/);
        if (simpleMatch) {
            return `v${parseInt(simpleMatch[1]) + 1}.0`;
        }
        return v + '_new';
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = () => {
        setFormData({
            contentHtml: activeTerm?.contentHtml || '',
            version: incrementVersion(activeTerm?.version || 'v1.0')
        });
        setIsEditing(true);
    };

    // Expose openModal to parent via ref
    useImperativeHandle(ref, () => ({
        openModal: handleOpenModal
    }));

    const handlePublish = async (e) => {
        e.preventDefault();
        if (!formData.contentHtml.trim() || !formData.version.trim()) {
            setError('Vui lòng điền đầy đủ nội dung và phiên bản.');
            return;
        }

        setIsSaving(true);
        setError(null);
        setSuccess(null);
        try {
            await adminService.publishTerms(formData);
            setSuccess(`Đã xuất bản điều khoản phiên bản ${formData.version} thành công!`);
            setIsEditing(false);
            await fetchData();
            // Clear success after a few seconds
            setTimeout(() => setSuccess(null), 5000);
        } catch (err) {
            console.error('[TermsManagement] Publish failed:', err);
            setError(err?.response?.data?.message || 'Không thể xuất bản điều khoản mới.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader2 size={32} className={styles.spinner} />
                <p>Đang tải dữ liệu điều khoản...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header Area */}
            {!hideHeader && (
                <div className={styles.header}>
                    <div className={styles.titleGroup}>
                        <h2 className={styles.title}>Quản lý Điều khoản & Điều kiện</h2>
                        <p className={styles.subtitle}>
                            {canEdit ? 'Xem lịch sử và cập nhật phiên bản mới cho toàn bộ hệ thống.' : 'Xem lịch sử và phiên bản hiện tại của điều khoản hệ thống.'}
                        </p>
                    </div>
                    {canEdit && (
                        <button className={styles.primaryBtn} onClick={handleOpenModal}>
                            <Plus size={18} /> Cập nhật phiên bản mới
                        </button>
                    )}
                </div>
            )}

            {/* Notifications */}
            {error && (
                <div className={styles.errorAlert}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                    <button className={styles.retryBtn} onClick={fetchData}>
                        <RotateCcw size={14} /> Thử lại
                    </button>
                </div>
            )}
            {success && (
                <div className={styles.successAlert}>
                    <CheckCircle2 size={20} />
                    <span>{success}</span>
                </div>
            )}

            <div className={styles.mainGrid}>
                {/* Active Version Info */}
                <div className={styles.sidebar}>
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>
                            <FileText size={18} /> Phiên bản hiện tại
                        </h3>
                        {activeTerm ? (
                            <div className={styles.activeInfo}>
                                <div className={styles.versionBadge}>{activeTerm.version}</div>
                                <p className={styles.dateInfo}>
                                    <Clock size={14} /> 
                                    Ngày tạo: {new Date(activeTerm.createdAt).toLocaleDateString('vi-VN')}
                                </p>
                                <div className={styles.previewContainer}>
                                    <p className={styles.previewTitle}>Tóm tắt nội dung:</p>
                                    <div className={styles.contentPreview}>
                                        {activeTerm.contentHtml?.substring(0, 200)}...
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className={styles.emptyText}>Chưa có điều khoản nào được kích hoạt.</p>
                        )}
                    </div>

                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>
                            <History size={18} /> Lịch sử thay đổi
                        </h3>
                        <div className={styles.historyList}>
                            {filteredHistory.length > 0 ? filteredHistory.map((item, index) => {
                                // Find actual index in original history for "Đang dùng" tag
                                const originalIndex = history.findIndex(h => h.id === item.id);
                                return (
                                    <div 
                                        key={item.id} 
                                        className={`${styles.historyItem} ${selectedTerm?.id === item.id ? styles.activeHistoryItem : ''}`}
                                        onClick={() => handleSelectTerm(item)}
                                    >
                                        <div className={styles.historyDot}></div>
                                        <div className={styles.historyContent}>
                                            <div className={styles.historyHeader}>
                                                <span className={styles.historyVersion}>{item.version}</span>
                                                <span className={styles.historyDate}>
                                                    {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                            {originalIndex === 0 && <span className={styles.currentTag}>Đang dùng</span>}
                                        </div>
                                    </div>
                                );
                            }) : (
                                <p className={styles.emptyText}>
                                    {searchTerm ? `Không tìm thấy phiên bản "${searchTerm}"` : "Chưa có lịch sử."}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className={styles.contentArea}>
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Nội dung đầy đủ</h3>
                        <div className={styles.fullContent}>
                            {isSelecting ? (
                                <div className={styles.contentSkeleton}>
                                    <div className={styles.skeletonLine} style={{ width: '40%' }}></div>
                                    <div className={styles.skeletonLine} style={{ width: '90%' }}></div>
                                    <div className={styles.skeletonLine} style={{ width: '85%' }}></div>
                                    <div className={styles.skeletonLine} style={{ width: '60%' }}></div>
                                    <div className={styles.skeletonLine} style={{ width: '95%' }}></div>
                                    <div className={styles.skeletonLine} style={{ width: '45%' }}></div>
                                </div>
                            ) : selectedTerm ? (
                                <div 
                                    dangerouslySetInnerHTML={{ __html: selectedTerm.contentHtml }} 
                                    className={styles.htmlViewer}
                                />
                            ) : (
                                <p className={styles.emptyText}>Chọn một phiên bản để xem nội dung.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Update Terms Modal */}
            {isEditing && createPortal(
                <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setIsEditing(false)}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <div className={styles.modalTitleGrp}>
                                <Plus size={20} color="var(--primary-blue)" />
                                <h2 className={styles.modalTitleText}>Cập nhật Điều khoản & Điều kiện</h2>
                            </div>
                            <button onClick={() => setIsEditing(false)} className={styles.modalCloseBtn}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <form id="termsUpdateForm" onSubmit={handlePublish} className={styles.form}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Phiên bản mới (Version)</label>
                                    <input 
                                        type="text" 
                                        className={styles.input}
                                        value={formData.version}
                                        onChange={e => setFormData({...formData, version: e.target.value})}
                                        placeholder="Ví dụ: v1.1"
                                        required
                                    />
                                    <p className={styles.hint}>
                                        {activeTerm ? `Phiên bản hiện tại: ${activeTerm.version}. ` : ''}
                                        Đảm bảo phiên bản mới phải lớn hơn phiên bản hiện tại.
                                    </p>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Nội dung điều khoản (HTML support)</label>
                                    <textarea 
                                        className={styles.textarea}
                                        value={formData.contentHtml}
                                        onChange={e => setFormData({...formData, contentHtml: e.target.value})}
                                        placeholder="Nhập nội dung điều khoản tại đây..."
                                        required
                                    />
                                </div>
                            </form>
                        </div>

                        <div className={styles.modalFooter}>
                            <button 
                                className={styles.secondaryBtn} 
                                onClick={() => setIsEditing(false)}
                                disabled={isSaving}
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                type="submit" 
                                form="termsUpdateForm"
                                className={styles.primaryBtn} 
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <><Loader2 size={18} className={styles.spinner} /> Đang lưu...</>
                                ) : (
                                    <><Save size={18} /> Xuất bản ngay</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
});

export default TermsManagement;
