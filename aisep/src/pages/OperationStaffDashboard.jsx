import React, { useState } from 'react';
import { FileCheck, CheckCircle, AlertCircle, Users, Activity, Settings, Trash2, Download, Eye } from 'lucide-react';
import styles from '../styles/SharedDashboard.module.css';
import FeedHeader from '../components/feed/FeedHeader';
import SuccessModal from '../components/common/SuccessModal';
import ErrorModal from '../components/common/ErrorModal';
import RejectionReasonModal from '../components/common/RejectionReasonModal';
import projectSubmissionService from '../services/projectSubmissionService';

/**
 * OperationStaffDashboard - Dashboard for Operation Staff
 * Features: Document verification, User approvals, Activity monitoring, Request management
 */
export default function OperationStaffDashboard({ user }) {
    const [activeSection, setActiveSection] = useState('overview');

    const [draftProjects, setDraftProjects] = useState([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(false);
    const [projectSubmissions, setProjectSubmissions] = useState([]);
    const [pendingDocuments, setPendingDocuments] = useState([]);
    const [pendingApprovals, setPendingApprovals] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('success'); // 'success' or 'error'
    const [modalMessage, setModalMessage] = useState('');
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    const dashboardData = {
        pendingDocuments: pendingDocuments.length,
        pendingApprovals: pendingApprovals.length + draftProjects.length,
        pendingRequests: pendingRequests.length,
        verifiedDocuments: 0,
        approvedUsers: 0,
        totalActivity: 0,
        documentVerificationRate: '0%',
        averageApprovalTime: '-'
    };

    // Fetch draft projects on component mount
    React.useEffect(() => {
        const fetchDraftProjects = async () => {
            setIsLoadingProjects(true);
            try {
                const response = await projectSubmissionService.getDraftProjects();
                if (response.success && response.data) {
                    const projects = response.data.items || [];
                    setDraftProjects(projects);
                }
            } catch (error) {
                console.error('Error fetching draft projects:', error);
                setDraftProjects([]);
            } finally {
                setIsLoadingProjects(false);
            }
        };
        
        if (activeSection === 'projects') {
            fetchDraftProjects();
        }
    }, [activeSection]);

    const handleVerifyDocument = (id) => {
        setPendingDocuments(pendingDocuments.map(doc =>
            doc.id === id ? { ...doc, status: 'verified' } : doc
        ));
    };

    const handleRejectDocument = (id) => {
        setPendingDocuments(pendingDocuments.map(doc =>
            doc.id === id ? { ...doc, status: 'rejected' } : doc
        ));
    };

    const handleApproveUser = (id) => {
        setPendingApprovals(pendingApprovals.map(user =>
            user.id === id ? { ...user, status: 'approved' } : user
        ));
    };

    const handleRejectUser = (id) => {
        setPendingApprovals(pendingApprovals.map(user =>
            user.id === id ? { ...user, status: 'rejected' } : user
        ));
    };

    const handleApproveRequest = (id) => {
        setPendingRequests(pendingRequests.map(req =>
            req.id === id ? { ...req, status: 'approved' } : req
        ));
    };

    const handleRejectRequest = (id) => {
        setPendingRequests(pendingRequests.map(req =>
            req.id === id ? { ...req, status: 'rejected' } : req
        ));
    };

    const handleApproveProject = async (projectId) => {
        try {
            const response = await projectSubmissionService.approveProject(projectId);
            if (response?.success) {
                setDraftProjects(draftProjects.filter(p => p.projectId !== projectId));
                setModalType('success');
                setModalMessage('✓ Dự án đã được phê duyệt thành công!');
                setShowModal(true);
            } else {
                setModalType('error');
                setModalMessage('❌ Phê duyệt thất bại: ' + (response?.message || 'Lỗi không xác định'));
                setShowModal(true);
            }
        } catch (error) {
            console.error('Error approving project:', error);
            setModalType('error');
            setModalMessage('❌ Lỗi phê duyệt dự án: ' + (error?.response?.data?.message || error?.message || 'Vui lòng thử lại'));
            setShowModal(true);
        }
    };

    const handleRejectProject = async (projectId, reason = null) => {
        // If reason not provided, show modal to collect it
        if (!reason) {
            const project = draftProjects.find(p => p.projectId === projectId);
            setSelectedProject(project);
            setShowRejectionModal(true);
            return;
        }
        
        // If reason provided, submit rejection
        try {
            const response = await projectSubmissionService.rejectProject(projectId, reason);
            if (response?.success) {
                setDraftProjects(draftProjects.filter(p => p.projectId !== projectId));
                setModalType('success');
                setModalMessage('✓ Dự án đã bị từ chối!');
                setShowModal(true);
            } else {
                setModalType('error');
                setModalMessage('❌ Từ chối thất bại: ' + (response?.message || 'Lỗi không xác định'));
                setShowModal(true);
            }
        } catch (error) {
            console.error('Error rejecting project:', error);
            setModalType('error');
            setModalMessage('❌ Lỗi từ chối dự án: ' + (error?.response?.data?.message || error?.message || 'Vui lòng thử lại'));
            setShowModal(true);
        }
    };

    return (
        <div className={styles.container}>
            {/* Unified Header */}
            <FeedHeader
                title="Bảng điều khiển Nhân viên vận hành"
                subtitle={`Xin chào, ${user?.name || 'Nhân viên'}! Quản lý hoạt động nền tảng và các yêu cầu phê duyệt.`}
                showFilter={false}
                user={user}
            />

            {/* Quick Stats */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconYellow}`}>
                        <FileCheck size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.pendingDocuments}</div>
                        <div className={styles.statLabel}>Tài liệu chờ kiểm tra</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconBlue}`}>
                        <Users size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.pendingApprovals}</div>
                        <div className={styles.statLabel}>Phê duyệt chờ xử lý</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconRed}`}>
                        <AlertCircle size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.pendingRequests}</div>
                        <div className={styles.statLabel}>Yêu cầu chờ xử lý</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconGreen}`}>
                        <CheckCircle size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.verifiedDocuments}</div>
                        <div className={styles.statLabel}>Tài liệu đã xác minh</div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeSection === 'overview' ? styles.active : ''}`}
                    onClick={() => setActiveSection('overview')}
                >
                    Tổng quan
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'projects' ? styles.active : ''}`}
                    onClick={() => setActiveSection('projects')}
                >
                    Duyệt dự án
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'documents' ? styles.active : ''}`}
                    onClick={() => setActiveSection('documents')}
                >
                    Xác minh tài liệu
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'approvals' ? styles.active : ''}`}
                    onClick={() => setActiveSection('approvals')}
                >
                    Phê duyệt người dùng
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'requests' ? styles.active : ''}`}
                    onClick={() => setActiveSection('requests')}
                >
                    Quản lý yêu cầu
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'activity' ? styles.active : ''}`}
                    onClick={() => setActiveSection('activity')}
                >
                    Giám sát hoạt động
                </button>
            </div>

            {/* Content Sections */}
            <div className={styles.content}>
                {/* Project Reviews Section */}
                {activeSection === 'projects' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>Duyệt dự án ({draftProjects.length})</h3>
                            <div className={styles.list}>
                                {isLoadingProjects ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        ⏳ Đang tải danh sách dự án...
                                    </div>
                                ) : draftProjects.length === 0 ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        Không có dự án nào chờ phê duyệt
                                    </div>
                                ) : (
                                    draftProjects.map(project => (
                                        <div key={project.projectId} className={styles.listItem}>
                                            <div className={styles.listContent}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                    <h4 className={styles.listTitle}>{project.projectName}</h4>
                                                    <span className={`${styles.badge} ${styles.badgePending}`}>
                                                        {project.status || 'Draft'}
                                                    </span>
                                                </div>
                                                <div className={styles.listSubtitle} style={{ marginBottom: '8px' }}>
                                                    {project.shortDescription}
                                                </div>
                                                <div className={styles.listMeta} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                                    <span>📊 Giai đoạn: <strong>{project.developmentStage}</strong></span>
                                                    <span>💼 Mô hình: {project.businessModel}</span>
                                                    <span>🎯 Khách hàng: {project.targetCustomers}</span>
                                                </div>
                                                <p style={{ marginTop: '8px', fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                                                    <strong>Vấn đề:</strong> {project.problemStatement}
                                                </p>
                                                <p style={{ marginTop: '6px', fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                                                    <strong>Giải pháp:</strong> {project.solutionDescription}
                                                </p>
                                                <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                                    📅 Nộp ngày: {new Date(project.createdAt).toLocaleDateString('vi-VN')} | 👥 Đội: {project.teamMembers}
                                                </div>
                                            </div>
                                            <div className={styles.listActions} style={{ flexDirection: 'column', gap: '8px' }}>
                                                <button
                                                    onClick={() => handleApproveProject(project.projectId)}
                                                    className={styles.primaryBtn}
                                                >
                                                    ✓ Phê duyệt
                                                </button>
                                                <button
                                                    onClick={() => handleRejectProject(project.projectId)}
                                                    className={styles.dangerBtn}
                                                >
                                                    ✗ Từ chối
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {projectSubmissions.filter(p => p.status === 'approved').length > 0 && (
                                <div style={{ marginTop: '24px' }}>
                                    <h4 className={styles.cardTitle} style={{ fontSize: '16px' }}>Dự án đã được phê duyệt</h4>
                                    <div className={styles.list}>
                                        {projectSubmissions.filter(p => p.status === 'approved').map(project => (
                                            <div key={project.id} className={styles.listItem} style={{ backgroundColor: 'var(--bg-hover)' }}>
                                                <div className={styles.listContent}>
                                                    <div className={styles.listTitle}>{project.projectName}</div>
                                                    <div className={`${styles.badge} ${styles.badgeSuccess}`} style={{ marginTop: '4px' }}>
                                                        ✓ Đã phê duyệt - Đã đăng lên bảng chính
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Overview Section */}
                {activeSection === 'overview' && (
                    <div className={styles.section}>
                        <div className={styles.sectionGrid}>
                            {/* Statistics */}
                            <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
                                <h3 className={styles.cardTitle}>Chỉ số hiệu suất</h3>
                                <div className={styles.metricsGrid}>
                                    <div className={styles.metricItem}>
                                        <div className={styles.metricLabel}>Tỷ lệ xác minh</div>
                                        <div className={styles.metricValue}>{dashboardData.documentVerificationRate}</div>
                                    </div>
                                    <div className={styles.metricItem}>
                                        <div className={styles.metricLabel}>Thời gian phê duyệt TB</div>
                                        <div className={styles.metricValue}>{dashboardData.averageApprovalTime}</div>
                                    </div>
                                    <div className={styles.metricItem}>
                                        <div className={styles.metricLabel}>Tổng hoạt động</div>
                                        <div className={styles.metricValue}>{dashboardData.totalActivity}</div>
                                    </div>
                                    <div className={styles.metricItem}>
                                        <div className={styles.metricLabel}>Người dùng được phê duyệt</div>
                                        <div className={styles.metricValue}>{dashboardData.approvedUsers}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Pending Items Summary */}
                            <div className={styles.card}>
                                <h3 className={styles.cardTitle}>Các mục chờ xử lý</h3>
                                <div className={styles.list}>
                                    <div className={styles.listItem}>
                                        <span className={styles.listTitle}>Tài liệu chờ xác minh</span>
                                        <span className={`${styles.badge} ${styles.badgePending}`} style={{ marginLeft: 'auto' }}>
                                            {dashboardData.pendingDocuments}
                                        </span>
                                    </div>
                                    <div className={styles.listItem}>
                                        <span className={styles.listTitle}>Phê duyệt người dùng cần xử lý</span>
                                        <span className={`${styles.badge} ${styles.badgeInfo}`} style={{ marginLeft: 'auto' }}>
                                            {dashboardData.pendingApprovals}
                                        </span>
                                    </div>
                                    <div className={styles.listItem}>
                                        <span className={styles.listTitle}>Yêu cầu cần xem xét</span>
                                        <span className={`${styles.badge} ${styles.badgeError}`} style={{ marginLeft: 'auto' }}>
                                            {dashboardData.pendingRequests}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className={styles.card}>
                                <h3 className={styles.cardTitle}>Hoạt động gần đây</h3>
                                <div className={styles.list}>
                                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        <p>Chưa có hoạt động nào.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Document Verification Section */}
                {activeSection === 'documents' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>
                                Hàng chờ xác minh tài liệu
                                {dashboardData.pendingDocuments > 0 && (
                                    <span className={`${styles.badge} ${styles.badgePending}`} style={{ marginLeft: '12px' }}>
                                        {dashboardData.pendingDocuments} Chờ xử lý
                                    </span>
                                )}
                            </h3>

                            <div className={styles.list}>
                                {pendingDocuments.length === 0 ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        <p>Chưa có tài liệu nào cần xác minh.</p>
                                    </div>
                                ) : pendingDocuments.map(doc => (
                                    <div key={doc.id} className={styles.listItem}>
                                        <div className={styles.listContent}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <h4 className={styles.listTitle}>{doc.startupName}</h4>
                                                    <span className={styles.listMeta}>by {doc.founder}</span>
                                                </div>
                                                <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>📄 {doc.documentName}</span>
                                                <span className={styles.listMeta}>{doc.size} • {doc.uploadDate}</span>
                                            </div>
                                        </div>
                                        <div className={styles.listActions}>
                                            <button className={styles.secondaryBtn}>
                                                <Eye size={16} /> Xem
                                            </button>
                                            {doc.status === 'pending' && (
                                                <>
                                                    <button
                                                        className={styles.primaryBtn}
                                                        onClick={() => handleVerifyDocument(doc.id)}
                                                    >
                                                        ✓ Xác minh
                                                    </button>
                                                    <button
                                                        className={styles.dangerBtn}
                                                        onClick={() => handleRejectDocument(doc.id)}
                                                    >
                                                        ✗ Từ chối
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* User Approvals Section */}
                {activeSection === 'approvals' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>
                                Phê duyệt đăng ký người dùng
                                {dashboardData.pendingApprovals > 0 && (
                                    <span className={`${styles.badge} ${styles.badgeInfo}`} style={{ marginLeft: '12px' }}>
                                        {dashboardData.pendingApprovals} Chờ xử lý
                                    </span>
                                )}
                            </h3>

                            <div className={styles.list}>
                                {pendingApprovals.length === 0 ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        <p>Chưa có yêu cầu phê duyệt đăng ký người dùng nào.</p>
                                    </div>
                                ) : pendingApprovals.map(approval => (
                                    <div key={approval.id} className={styles.listItem}>
                                        <div className={styles.listContent}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <h4 className={styles.listTitle}>{approval.name}</h4>
                                                <span className={`${styles.badge} ${styles.badgePending}`}>{approval.role}</span>
                                            </div>
                                            <div className={styles.listMeta} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <span>Email: {approval.email}</span>
                                                <span>Registered: {approval.registeredDate}</span>
                                                <span style={{ color: 'var(--score-good)', fontWeight: '700', marginTop: '4px' }}>
                                                    {approval.verification === 'verified' ? '✓ Đã xác minh CCCD' : '⚠ Chưa xác minh danh tính'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={styles.listActions}>
                                            {approval.status === 'pending' && (
                                                <>
                                                    <button
                                                        className={styles.primaryBtn}
                                                        onClick={() => handleApproveUser(approval.id)}
                                                    >
                                                        Phê duyệt
                                                    </button>
                                                    <button
                                                        className={styles.dangerBtn}
                                                        onClick={() => handleRejectUser(approval.id)}
                                                    >
                                                        Từ chối
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Request Management Section */}
                {activeSection === 'requests' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>
                                Yêu cầu đang chờ xử lý
                                {dashboardData.pendingRequests > 0 && (
                                    <span className={`${styles.badge} ${styles.badgeError}`} style={{ marginLeft: '12px' }}>
                                        {dashboardData.pendingRequests} Chờ xử lý
                                    </span>
                                )}
                            </h3>

                            <div className={styles.list}>
                                {pendingRequests.length === 0 ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        <p>Chưa có yêu cầu nào đang chờ xử lý.</p>
                                    </div>
                                ) : pendingRequests.map(request => (
                                    <div key={request.id} className={styles.listItem}>
                                        <div className={styles.listContent}>
                                            <div className={styles.listSubtitle} style={{ color: 'var(--primary-blue)', fontWeight: '700', marginBottom: '4px' }}>
                                                {request.requestType === 'consulting' ? '📚 Tư vấn' : '🤝 Kết nối'} Yêu cầu
                                            </div>
                                            <h4 className={styles.listTitle}>
                                                {request.startupName}
                                                {request.advisorName && ` + ${request.advisorName}`}
                                                {request.investorName && ` + ${request.investorName}`}
                                            </h4>
                                            <span className={styles.listMeta}>Submitted: {request.submittedDate}</span>
                                        </div>
                                        <div className={styles.listActions}>
                                            {request.status === 'pending' && (
                                                <>
                                                    <button
                                                        className={styles.primaryBtn}
                                                        onClick={() => handleApproveRequest(request.id)}
                                                    >
                                                        Phê duyệt
                                                    </button>
                                                    <button
                                                        className={styles.dangerBtn}
                                                        onClick={() => handleRejectRequest(request.id)}
                                                    >
                                                        Từ chối
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Activity Monitor Section */}
                {activeSection === 'activity' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>Giám sát hoạt động nền tảng</h3>
                            <div className={styles.metricsGrid}>
                                <div className={styles.metricItem}>
                                    <span className={styles.metricLabel}>Tổng đăng nhập hôm nay</span>
                                    <strong className={styles.metricValue}>0</strong>
                                </div>
                                <div className={styles.metricItem}>
                                    <span className={styles.metricLabel}>Tài liệu đã tải lên</span>
                                    <strong className={styles.metricValue}>0</strong>
                                </div>
                                <div className={styles.metricItem}>
                                    <span className={styles.metricLabel}>Kết nối mới</span>
                                    <strong className={styles.metricValue}>0</strong>
                                </div>
                                <div className={styles.metricItem}>
                                    <span className={styles.metricLabel}>Yêu cầu tư vấn</span>
                                    <strong className={styles.metricValue}>0</strong>
                                </div>
                                <div className={styles.metricItem}>
                                    <span className={styles.metricLabel}>Lỗi hệ thống</span>
                                    <strong className={styles.metricValue}>0</strong>
                                </div>
                                <div className={styles.metricItem}>
                                    <span className={styles.metricLabel}>Vấn đề bị đánh dấu</span>
                                    <strong className={styles.metricValue}>0</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Success/Error Modal */}
            {showModal && (
                modalType === 'success' ? (
                    <SuccessModal
                        message={modalMessage}
                        onClose={() => setShowModal(false)}
                    />
                ) : (
                    <ErrorModal
                        message={modalMessage}
                        onClose={() => setShowModal(false)}
                    />
                )
            )}

            {/* Rejection Reason Modal */}
            {showRejectionModal && selectedProject && (
                <RejectionReasonModal
                    projectName={selectedProject.projectName}
                    onSubmit={(reason) => {
                        setShowRejectionModal(false);
                        handleRejectProject(selectedProject.projectId, reason);
                    }}
                    onCancel={() => {
                        setShowRejectionModal(false);
                        setSelectedProject(null);
                    }}
                />
            )}
        </div>
    );
}
