import React, { useState, useEffect, useRef } from 'react';
import { Search, Archive, AlertCircle, Loader2, X, User, Mail, MapPin, Globe, Award, Briefcase, DollarSign, FileText, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import local from './AdvisorApprovalPage.module.css';
import advisorService from '../../services/advisorService';
import AdvisorKanbanCard from './AdvisorKanbanCard';
import SuccessModal from '../common/SuccessModal';
import ErrorModal from '../common/ErrorModal';
import RejectionReasonModal from '../common/RejectionReasonModal';
import FeedHeader from '../feed/FeedHeader';
import staffLocal from '../../styles/OperationStaffDashboard.module.css';

/**
 * AdvisorDetailModal - Detailed view of an advisor profile for staff review
 */
const AdvisorDetailModal = ({ advisor, onClose, onApprove, onReject, processingId, processingAction }) => {
    if (!advisor) return null;

    const formatPrice = (price) => {
        return Number(price || 0).toLocaleString('vi-VN');
    };

    const status = advisor.approvalStatus || 'Pending';
    const isPending = status === 'Pending';

    return (
        <div className={local.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={local.detailModalContent}>
                {/* Header */}
                <div className={local.modalHeader}>
                    <div className={local.modalHeaderTitle}>
                        <User size={20} />
                        <span>Chi tiết hồ sơ Cố vấn</span>
                    </div>
                    <button onClick={onClose} className={local.closeBtn}>
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className={local.modalBody}>
                    <div className={local.detailGrid}>
                        {/* Profile Info */}
                        <div className={local.detailSection}>
                            <h3 className={local.sectionTitle}>THÔNG TIN CÁ NHÂN</h3>
                            <div className={local.infoRows}>
                                <div className={local.infoRow}>
                                    <span className={local.infoLabel}>Họ và tên</span>
                                    <span className={local.infoValue}>{advisor.userName || advisor.fullName || 'N/A'}</span>
                                </div>
                                <div className={local.infoRow}>
                                    <span className={local.infoLabel}>Email</span>
                                    <span className={local.infoValue}>{advisor.email || 'N/A'}</span>
                                </div>
                                <div className={local.infoRow}>
                                    <span className={local.infoLabel}>Khu vực</span>
                                    <span className={local.infoValue}>
                                        <MapPin size={14} style={{ marginRight: '4px' }} />
                                        {advisor.location || 'Chưa cập nhật'}
                                    </span>
                                </div>
                                <div className={local.infoRow}>
                                    <span className={local.infoLabel}>Phí tư vấn</span>
                                    <span className={local.infoValue} style={{ color: '#f59e0b', fontWeight: '800' }}>
                                        {formatPrice(advisor.hourlyRate)} ₫/giờ
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Professional Info */}
                        <div className={local.detailSection}>
                            <h3 className={local.sectionTitle}>CHUYÊN MÔN & KINH NGHIỆM</h3>
                            <div className={local.expertiseBox}>
                                <Award size={18} />
                                <span>{advisor.expertise || 'Chưa cập nhật'}</span>
                            </div>
                            <div className={local.industriesList}>
                                {advisor.industries?.map((ind, i) => (
                                    <span key={i} className={local.industryTag}>{ind}</span>
                                ))}
                            </div>
                            <div className={local.descriptionBox}>
                                <h4 className={local.boxLabel}>Tiểu sử</h4>
                                <p>{advisor.bio || 'Không có mô tả.'}</p>
                            </div>
                            <div className={local.descriptionBox}>
                                <h4 className={local.boxLabel}>Kinh nghiệm làm việc</h4>
                                <p>{advisor.previousExperience || 'Không có thông tin kinh nghiệm.'}</p>
                            </div>
                        </div>

                        {/* Documents */}
                        <div className={local.detailSection}>
                            <h3 className={local.sectionTitle}>CHỨNG CHỈ & BẰNG CẤP</h3>
                            {advisor.certifications ? (
                                <a
                                    href={advisor.certifications}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={local.certLink}
                                >
                                    <FileText size={18} />
                                    <span>Xem hồ sơ chứng chỉ</span>
                                    <Globe size={14} style={{ marginLeft: 'auto' }} />
                                </a>
                            ) : (
                                <div className={local.noCert}>
                                    <AlertCircle size={16} />
                                    <span>Chưa tải lên chứng chỉ.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className={local.modalFooter}>
                    <button onClick={onClose} className={local.secondaryBtn}>Đóng</button>
                    {isPending && (
                        <div className={local.footerActions}>
                            <button
                                className={`${local.dangerBtn} ${processingId !== null ? local.btnDisabled : ''}`}
                                onClick={() => onReject(advisor)}
                                disabled={processingId !== null}
                            >
                                {processingId === advisor.advisorId && processingAction === 'reject' ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <XCircle size={16} />
                                )}
                                Từ chối
                            </button>
                            <button
                                className={`${local.approveBtn} ${processingId !== null ? local.btnDisabled : ''}`}
                                onClick={() => onApprove(advisor.advisorId)}
                                disabled={processingId !== null}
                            >
                                {processingId === advisor.advisorId && processingAction === 'approve' ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <CheckCircle size={16} />
                                )}
                                Duyệt hồ sơ
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function AdvisorApprovalPage({ user }) {
    const [isLoading, setIsLoading] = useState(true);
    const [advisors, setAdvisors] = useState({ pending: [], approved: [], rejected: [] });
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState(null);
    const [processingAction, setProcessingAction] = useState(null);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('success');
    const [modalMessage, setModalMessage] = useState('');
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [selectedAdvisor, setSelectedAdvisor] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Mobile UI state
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [activeMobileTab, setActiveMobileTab] = useState('All');

    useEffect(() => {
        fetchAdvisors();
    }, []);

    const fetchAdvisors = async () => {
        setIsLoading(true);
        try {
            // Fetch all advisors and sort client-side for the Kanban board
            const response = await advisorService.getAllAdvisors({ pageSize: 100 });
            const allAdvisors = response?.data?.items || [];

            setAdvisors({
                pending: allAdvisors.filter(a => a.approvalStatus === 'Pending'),
                approved: allAdvisors.filter(a => a.approvalStatus === 'Approved'),
                rejected: allAdvisors.filter(a => a.approvalStatus === 'Rejected')
            });
        } catch (error) {
            console.error('Error fetching advisors:', error);
            setModalType('error');
            setModalMessage('Không thể tải danh sách cố vấn');
            setShowModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (processingId) return;
        setProcessingId(id);
        setProcessingAction('approve');
        try {
            await advisorService.approveAdvisor(id);
            setModalType('success');
            setModalMessage('Hồ sơ cố vấn đã được duyệt thành công!');
            setShowModal(true);
            setShowDetailModal(false);
            fetchAdvisors();
        } catch (error) {
            setModalType('error');
            setModalMessage(error?.response?.data?.message || 'Có lỗi xảy ra khi duyệt hồ sơ');
            setShowModal(true);
        } finally {
            setProcessingId(null);
            setProcessingAction(null);
        }
    };

    const handleReject = async (advisor, reason = null) => {
        if (!reason) {
            setSelectedAdvisor(advisor);
            setShowRejectionModal(true);
            return;
        }

        if (processingId) return;
        setProcessingId(advisor.advisorId);
        setProcessingAction('reject');
        try {
            await advisorService.rejectAdvisor(advisor.advisorId, reason);
            setModalType('success');
            setModalMessage('Hồ sơ cố vấn đã bị từ chối.');
            setShowModal(true);
            setShowRejectionModal(false);
            setShowDetailModal(false);
            fetchAdvisors();
        } catch (error) {
            setModalType('error');
            setModalMessage(error?.response?.data?.message || 'Có lỗi xảy ra khi từ chối hồ sơ');
            setShowModal(true);
        } finally {
            setProcessingId(null);
            setProcessingAction(null);
        }
    };

    const openDetails = (advisor) => {
        setSelectedAdvisor(advisor);
        setShowDetailModal(true);
    };

    const filterAdvisors = (list) => {
        if (!searchTerm.trim()) return list;
        const low = searchTerm.toLowerCase();
        return list.filter(a =>
            (a.userName || '').toLowerCase().includes(low) ||
            (a.expertise || '').toLowerCase().includes(low)
        );
    };

    return (
        <div className={local.container}>
            <FeedHeader
                title="Duyệt hồ sơ Cố vấn"
                subtitle="Quản lý và phê duyệt đội ngũ chuyên gia cố vấn cho nền tảng."
                showFilter={false}
                user={user}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Tìm kiếm tên hoặc chuyên môn..."
                showNotification={true}
            />

            <div className={local.section} style={{ flex: 1, minHeight: 0, paddingBottom: 0 }}>
                {/* Tab Switcher - Consistent with Dashboard */}
                <div className={local.tabs} style={{ margin: '0 -24px 0 -24px', padding: '0 24px', overflowX: 'auto', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '8px' }}>
                    <button className={`${local.tab} ${activeMobileTab === 'All' ? local.active : ''}`} onClick={() => setActiveMobileTab('All')}>
                        Tất cả
                        <span className={local.mobileTabCount} style={{ marginLeft: '8px' }}>{advisors.pending.length + advisors.approved.length + advisors.rejected.length}</span>
                    </button>
                    <button className={`${local.tab} ${activeMobileTab === 'Pending' ? local.active : ''}`} onClick={() => setActiveMobileTab('Pending')}>
                        <div className={`${local.bctDot} ${local.pend}`} style={{ display: 'inline-block', marginRight: '6px' }}></div>
                        Chờ xử lý
                        <span className={local.mobileTabCount} style={{ marginLeft: '8px' }}>{advisors.pending.length}</span>
                    </button>
                    <button className={`${local.tab} ${activeMobileTab === 'Approved' ? local.active : ''}`} onClick={() => setActiveMobileTab('Approved')}>
                        <div className={`${local.bctDot} ${local.appr}`} style={{ display: 'inline-block', marginRight: '6px' }}></div>
                        Đã duyệt
                        <span className={local.mobileTabCount} style={{ marginLeft: '8px' }}>{advisors.approved.length}</span>
                    </button>
                    <button className={`${local.tab} ${activeMobileTab === 'Rejected' ? local.active : ''}`} onClick={() => setActiveMobileTab('Rejected')}>
                        <div className={`${local.bctDot} ${local.rej}`} style={{ display: 'inline-block', marginRight: '6px' }}></div>
                        Từ chối
                        <span className={local.mobileTabCount} style={{ marginLeft: '8px' }}>{advisors.rejected.length}</span>
                    </button>
                </div>

                <div className={staffLocal.inv_scrollCardsContainer} style={{ flex: 1, overflowY: 'auto' }}>
                    {isLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--text-secondary)' }} />
                        </div>
                    ) : (
                        (() => {
                            let list = [];
                            if (activeMobileTab === 'Pending') list = advisors.pending;
                            else if (activeMobileTab === 'Approved') list = advisors.approved;
                            else if (activeMobileTab === 'Rejected') list = advisors.rejected;
                            else list = [...advisors.pending, ...advisors.approved, ...advisors.rejected];

                            const filteredList = filterAdvisors(list);

                            if (filteredList.length === 0) {
                                return (
                                    <div className={staffLocal.inv_emptyState}>
                                        <Archive size={40} className={staffLocal.inv_emptyIcon} />
                                        <p>Trống</p>
                                    </div>
                                );
                            }

                            return (
                                <div className={staffLocal.sectionGrid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', display: 'grid' }}>
                                    {filteredList.map(advisor => (
                                        <AdvisorKanbanCard
                                            key={advisor.advisorId}
                                            advisor={advisor}
                                            status={advisor.approvalStatus === 'Approved' ? 'appr' : (advisor.approvalStatus === 'Rejected' ? 'rej' : 'pend')}
                                            onDetail={() => openDetails(advisor)}
                                            onApprove={() => handleApprove(advisor.advisorId)}
                                            onReject={() => handleReject(advisor)}
                                            processingId={processingId}
                                            processingAction={processingAction}
                                            isAnyProcessing={processingId !== null}
                                        />
                                    ))}
                                </div>
                            );
                        })()
                    )}
                </div>
            </div>

            {/* Modals */}
            {showDetailModal && (
                <AdvisorDetailModal
                    advisor={selectedAdvisor}
                    onClose={() => setShowDetailModal(false)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    processingId={processingId}
                    processingAction={processingAction}
                />
            )}

            {showRejectionModal && selectedAdvisor && (
                <RejectionReasonModal
                    projectName={selectedAdvisor.userName || selectedAdvisor.fullName}
                    onCancel={() => setShowRejectionModal(false)}
                    onSubmit={(reason) => handleReject(selectedAdvisor, reason)}
                />
            )}

            {showModal && (
                modalType === 'success' ? (
                    <SuccessModal message={modalMessage} onClose={() => setShowModal(false)} />
                ) : (
                    <ErrorModal message={modalMessage} onClose={() => setShowModal(false)} />
                )
            )}
        </div>
    );
}
