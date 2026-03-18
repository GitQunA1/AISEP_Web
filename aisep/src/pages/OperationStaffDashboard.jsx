import React, { useState, useEffect } from 'react';
import { FileCheck, CheckCircle, AlertCircle, Users, Activity, Settings, Trash2, Download, Eye, ArrowRight, X, FileText, Loader2, TrendingUp, ExternalLink, Shield } from 'lucide-react';
import styles from '../styles/SharedDashboard.module.css';
import local from '../styles/OperationStaffDashboard.module.css';
import FeedHeader from '../components/feed/FeedHeader';
import SuccessModal from '../components/common/SuccessModal';
import ErrorModal from '../components/common/ErrorModal';
import RejectionReasonModal from '../components/common/RejectionReasonModal';
import projectSubmissionService from '../services/projectSubmissionService';
import { STATUS_COLORS, STATUS_LABELS } from '../constants/ProjectStatus';

/**
 * OperationStaffDashboard - Dashboard for Operation Staff
 * Features: Document verification, User approvals, Activity monitoring, Request management
 */
export default function OperationStaffDashboard({ user }) {
    const [activeSection, setActiveSection] = useState('overview');

    const [pendingProjects, setPendingProjects] = useState([]);
    const [approvedProjects, setApprovedProjects] = useState([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(false);
    const [projectSubmissions, setProjectSubmissions] = useState([]);
    const [pendingApprovals, setPendingApprovals] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('success'); // 'success' or 'error'
    const [modalMessage, setModalMessage] = useState('');
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    // Detail modal state
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailProject, setDetailProject] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);

    const dashboardData = {
        pendingApprovals: pendingApprovals.length,
        pendingProjects: pendingProjects.length,
        pendingRequests: pendingRequests.length,
        approvedUsers: 0,
        totalActivity: 0,
        averageApprovalTime: '-'
    };

    // Fetch projects on tab change
    React.useEffect(() => {
        const fetchPendingProjects = async () => {
            setIsLoadingProjects(true);
            try {
                const response = await projectSubmissionService.getPendingProjects();
                if (response.success && response.data) {
                    const projects = response.data.items || [];
                    setPendingProjects(projects);
                }
            } catch (error) {
                console.error('Error fetching pending projects:', error);
                setPendingProjects([]);
            } finally {
                setIsLoadingProjects(false);
            }
        };

        const fetchApprovedProjects = async () => {
            setIsLoadingProjects(true);
            try {
                const response = await projectSubmissionService.getApprovedProjects();
                if (response.success && response.data) {
                    const projects = response.data.items || [];
                    setApprovedProjects(projects);
                }
            } catch (error) {
                console.error('Error fetching approved projects:', error);
                setApprovedProjects([]);
            } finally {
                setIsLoadingProjects(false);
            }
        };

        if (activeSection === 'projects') {
            fetchPendingProjects();
        } else if (activeSection === 'approved_projects') {
            fetchApprovedProjects();
        }
    }, [activeSection]);

    // Fetch project documents when detail modal opens
    useEffect(() => {
        if (showDetailModal && detailProject) {
            fetchProjectDocuments(detailProject.projectId);
        }
    }, [showDetailModal, detailProject]);

    const fetchProjectDocuments = async (projectId) => {
        setIsLoadingDocuments(true);
        setDocuments([]);
        try {
            const response = await projectSubmissionService.getDocuments(projectId);
            if (response && response.data) {
                const docItems = Array.isArray(response.data) ? response.data : (response.data.items || []);
                setDocuments(docItems.map(doc => ({
                    id: doc.documentId,
                    name: doc.fileName || doc.documentType,
                    type: doc.documentType,
                    uploadDate: new Date(doc.uploadedAt || doc.verifiedAt || new Date()).toLocaleDateString('vi-VN'),
                    url: doc.fileUrl
                })));
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setIsLoadingDocuments(false);
        }
    };

    const openDetailModal = (project) => {
        setDetailProject(project);
        setShowDetailModal(true);
    };

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
                setPendingProjects(pendingProjects.filter(p => p.projectId !== projectId));
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
            const project = pendingProjects.find(p => p.projectId === projectId);
            setSelectedProject(project);
            setShowRejectionModal(true);
            return;
        }

        // If reason provided, submit rejection
        try {
            const response = await projectSubmissionService.rejectProject(projectId, reason);
            if (response?.success) {
                setPendingProjects(pendingProjects.filter(p => p.projectId !== projectId));
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
            <h3 className={styles.cardTitle} style={{ margin: '20px 24px 8px', fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Hoạt động hôm nay
            </h3>
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
                    className={`${styles.tab} ${activeSection === 'approved_projects' ? styles.active : ''}`}
                    onClick={() => setActiveSection('approved_projects')}
                >
                    Dự án đã duyệt
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'requests' ? styles.active : ''}`}
                    onClick={() => setActiveSection('requests')}
                >
                    Yêu cầu tư vấn
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'approvals' ? styles.active : ''}`}
                    onClick={() => setActiveSection('approvals')}
                >
                    Phê duyệt người dùng
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
                            <h3 className={styles.cardTitle}>Duyệt dự án ({pendingProjects.length})</h3>
                            <div className={styles.list}>
                                {isLoadingProjects ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        ⏳ Đang tải danh sách dự án...
                                    </div>
                                ) : pendingProjects.length === 0 ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        Không có dự án nào chờ phê duyệt
                                    </div>
                                ) : (
                                    pendingProjects.map(project => (
                                        <div 
                                            key={project.projectId} 
                                            className={local.projectCard}
                                            style={{ borderLeftColor: STATUS_COLORS[project.status || 'Pending'] }}
                                        >
                                            <div className={local.projectHeader}>
                                                <div className={local.titleRow}>
                                                    <h4 className={local.projectTitle}>{project.projectName}</h4>
                                                    <span 
                                                        className={local.statusBadge}
                                                        style={{ 
                                                            backgroundColor: `${STATUS_COLORS[project.status || 'Pending']}25`,
                                                            color: STATUS_COLORS[project.status || 'Pending'],
                                                            border: `1px solid ${STATUS_COLORS[project.status || 'Pending']}40`
                                                        }}
                                                    >
                                                        {STATUS_LABELS[project.status || 'Pending'] || 'Đang chờ duyệt'}
                                                    </span>
                                                </div>
                                                <p className={local.projectDesc}>{project.shortDescription}</p>
                                            </div>

                                            <div className={local.tagContainer}>
                                                <span className={local.metaTag}>
                                                    {project.developmentStage === 0 ? 'Ý tưởng' : project.developmentStage === 1 ? 'MVP' : project.developmentStage === 'MVP' ? 'MVP' : 'Tăng trưởng'}
                                                </span>
                                            </div>

                                            <div className={local.fieldRow}>
                                                <span className={local.fieldLabel}>Vấn đề:</span>
                                                <span className={local.fieldValue} title={project.problemStatement}>{project.problemStatement}</span>
                                            </div>
                                            <div className={local.fieldRow}>
                                                <span className={local.fieldLabel}>Giải pháp:</span>
                                                <span className={local.fieldValue} title={project.solutionDescription}>{project.solutionDescription}</span>
                                            </div>

                                            <div className={local.divider}></div>

                                            <div className={local.footer}>
                                                <div className={local.metaInfo}>
                                                    📅 Nộp: {new Date(project.createdAt).toLocaleDateString('vi-VN')} | 👥 Đội: {project.teamMembers}
                                                </div>
                                                <div className={local.buttonGroup}>
                                                    <button
                                                        onClick={() => handleRejectProject(project.projectId)}
                                                        className={styles.dangerBtn}
                                                    >
                                                        Từ chối
                                                    </button>
                                                    <button
                                                        onClick={() => handleApproveProject(project.projectId)}
                                                        className={styles.primaryBtn}
                                                    >
                                                        Phê duyệt
                                                    </button>
                                                    <button
                                                        onClick={() => openDetailModal(project)}
                                                        className={styles.secondaryBtn}
                                                    >
                                                        Chi tiết
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Approved Projects Section */}
                {activeSection === 'approved_projects' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>Dự án đã phê duyệt ({approvedProjects.length})</h3>
                            <div className={styles.list}>
                                {isLoadingProjects ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        ⏳ Đang tải danh sách dự án...
                                    </div>
                                ) : approvedProjects.length === 0 ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        Chưa có dự án nào được phê duyệt
                                    </div>
                                ) : (
                                    approvedProjects.map(project => (
                                        <div 
                                            key={project.projectId} 
                                            className={local.projectCard}
                                            style={{ borderLeftColor: STATUS_COLORS[project.status || 'Approved'] }}
                                        >
                                            <div className={local.projectHeader}>
                                                <div className={local.titleRow}>
                                                    <h4 className={local.projectTitle}>{project.projectName}</h4>
                                                    <span 
                                                        className={local.statusBadge}
                                                        style={{ 
                                                            backgroundColor: `${STATUS_COLORS[project.status || 'Approved']}25`,
                                                            color: STATUS_COLORS[project.status || 'Approved'],
                                                            border: `1px solid ${STATUS_COLORS[project.status || 'Approved']}40`
                                                        }}
                                                    >
                                                        {STATUS_LABELS[project.status || 'Approved'] || 'Đã được duyệt'}
                                                    </span>
                                                </div>
                                                <p className={local.projectDesc}>{project.shortDescription}</p>
                                            </div>

                                            <div className={local.tagContainer}>
                                                <span className={local.metaTag}>
                                                    {project.developmentStage === 0 ? 'Ý tưởng' : project.developmentStage === 1 ? 'MVP' : project.developmentStage === 'MVP' ? 'MVP' : 'Tăng trưởng'}
                                                </span>
                                            </div>

                                            <div className={local.divider}></div>

                                            <div className={local.footer}>
                                                <div className={local.metaInfo}>
                                                    📅 Phê duyệt ngày: {project.approvedAt ? new Date(project.approvedAt).toLocaleDateString('vi-VN') : 'N/A'}
                                                </div>
                                                <div className={local.buttonGroup}>
                                                    <button
                                                        onClick={() => openDetailModal(project)}
                                                        className={styles.secondaryBtn}
                                                    >
                                                        Chi tiết
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Overview Section */}
                {activeSection === 'overview' && (
                    <div className={styles.section}>
                        <div className={styles.sectionGrid}>
                            {/* Statistics */}
                            <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
                                <h3 className={styles.cardTitle} style={{ fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
                                    Chỉ số hiệu suất hệ thống
                                </h3>
                                <div className={styles.metricsGrid}>
                                    <div className={styles.metricItemInner}>
                                        <div className={styles.metricLabel}>Thời gian phê duyệt TB</div>
                                        <div className={styles.metricValue}>{dashboardData.averageApprovalTime}</div>
                                    </div>
                                    <div className={styles.metricItemInner}>
                                        <div className={styles.metricLabel}>Tổng hoạt động</div>
                                        <div className={styles.metricValue}>{dashboardData.totalActivity}</div>
                                    </div>
                                    <div className={styles.metricItemInner}>
                                        <div className={styles.metricLabel}>Người dùng được phê duyệt</div>
                                        <div className={styles.metricValue}>{dashboardData.approvedUsers}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Pending Items Summary */}
                            <div className={styles.card}>
                                <h3 className={styles.cardTitle}>Các mục chờ xử lý</h3>
                                <div className={local.pendingList}>
                                    <div className={local.pendingItem}>
                                        <div className={local.pendingItemLeft}>
                                            <span className={local.pendingItemTitle}>Dự án chờ phê duyệt</span>
                                            <span className={local.pendingItemSubtitle}>Dự án startup nộp mới</span>
                                        </div>
                                        <span className={`${styles.badge} ${styles.badgeInfo}`} style={{ backgroundColor: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
                                            {dashboardData.pendingProjects}
                                        </span>
                                    </div>
                                    <div className={local.pendingItem}>
                                        <div className={local.pendingItemLeft}>
                                            <span className={local.pendingItemTitle}>Người dùng cần phê duyệt</span>
                                            <span className={local.pendingItemSubtitle}>Yêu cầu đăng ký mới</span>
                                        </div>
                                        <span className={`${styles.badge} ${styles.badgeInfo}`}>
                                            {dashboardData.pendingApprovals}
                                        </span>
                                    </div>
                                    <div className={local.pendingItem}>
                                        <div className={local.pendingItemLeft}>
                                            <span className={local.pendingItemTitle}>Yêu cầu cần xem xét</span>
                                            <span className={local.pendingItemSubtitle}>Các kết nối & tư vấn</span>
                                        </div>
                                        <span className={`${styles.badge} ${styles.badgeError}`}>
                                            {dashboardData.pendingRequests}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ marginTop: '8px', textAlign: 'right' }}>
                                    <button className={styles.linkBtn} onClick={() => setActiveSection('requests')} style={{ fontSize: '12px' }}>
                                        Xem tất cả <ArrowRight size={12} style={{ verticalAlign: 'middle', marginLeft: '2px' }} />
                                    </button>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className={styles.card}>
                                <h3 className={styles.cardTitle}>Hoạt động gần đây</h3>
                                <div className={styles.emptyState}>
                                    <Activity size={32} className={styles.emptyStateIcon} />
                                    <p className={styles.emptyStateText}>Chưa có hoạt động nào trong hệ thống.</p>
                                </div>
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
                                Quản lý yêu cầu tư vấn
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

            {/* Project Detail Modal */}
            {showDetailModal && detailProject && (
                <div
                    className={styles.modalOverlay}
                    onClick={(e) => e.target === e.currentTarget && setShowDetailModal(false)}
                >
                    <div className={styles.modalContent} style={{ maxWidth: '820px', width: '92%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        {/* Modal Header */}
                        <div className={styles.modalHeader}>
                            <div>
                                <h2 className={styles.headerTitle} style={{ margin: '0 0 8px 0' }}>{detailProject.projectName}</h2>
                                <span
                                    className={styles.badge}
                                    style={{
                                        backgroundColor: `${STATUS_COLORS[detailProject.status || 'Pending']}25`,
                                        color: STATUS_COLORS[detailProject.status || 'Pending'],
                                        border: `1px solid ${STATUS_COLORS[detailProject.status || 'Pending']}40`
                                    }}
                                >
                                    {STATUS_LABELS[detailProject.status || 'Pending'] || 'Đang chờ duyệt'}
                                </span>
                            </div>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>

                                {/* Section 1: Basic info */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <h4 style={{ color: 'var(--primary-blue)', fontSize: '15px', fontWeight: '800', marginBottom: '4px' }}>1. Thông tin cơ bản</h4>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Mô tả ngắn</label>
                                        <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6' }}>{detailProject.shortDescription || '—'}</p>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Giai đoạn phát triển</label>
                                        <p style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                                            {detailProject.developmentStage === 0 ? 'Ý tưởng (Idea)' : detailProject.developmentStage === 1 ? 'MVP' : 'Vận hành (Growth)'}
                                        </p>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Vấn đề cần giải quyết</label>
                                        <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6' }}>{detailProject.problemStatement || '—'}</p>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Giải pháp đề xuất</label>
                                        <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6' }}>{detailProject.solutionDescription || '—'}</p>
                                    </div>
                                </div>

                                {/* Section 2: Market & Model */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <h4 style={{ color: 'var(--primary-blue)', fontSize: '15px', fontWeight: '800', marginBottom: '4px' }}>2. Thị trường &amp; Mô hình</h4>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Khách hàng mục tiêu</label>
                                        <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6' }}>{detailProject.targetCustomers || '—'}</p>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Giá trị độc đáo (UVP)</label>
                                        <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6' }}>{detailProject.uniqueValueProposition || '—'}</p>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div className={styles.formGroup}>
                                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Quy mô thị trường</label>
                                            <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '700' }}>
                                                {detailProject.marketSize ? `${detailProject.marketSize.toLocaleString()} VND` : '—'}
                                            </p>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Doanh thu</label>
                                            <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '700' }}>
                                                {detailProject.revenue ? `${detailProject.revenue.toLocaleString()} VND` : '—'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Mô hình kinh doanh</label>
                                        <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6' }}>{detailProject.businessModel || '—'}</p>
                                    </div>
                                </div>

                                {/* Section 3: Team */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <h4 style={{ color: 'var(--primary-blue)', fontSize: '15px', fontWeight: '800', marginBottom: '4px' }}>3. Đội ngũ</h4>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Thành viên &amp; Vai trò</label>
                                        <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{detailProject.teamMembers || '—'}</p>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Kỹ năng cốt lõi</label>
                                        <p style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{detailProject.keySkills || '—'}</p>
                                    </div>
                                </div>

                                {/* Section 4: Competition */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <h4 style={{ color: 'var(--primary-blue)', fontSize: '15px', fontWeight: '800', marginBottom: '4px' }}>4. Cạnh tranh</h4>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Kinh nghiệm đội ngũ</label>
                                        <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6' }}>{detailProject.teamExperience || '—'}</p>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Cạnh tranh viên</label>
                                        <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6' }}>{detailProject.competitors || '—'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Section 5: Documents */}
                            <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                                <h4 style={{ color: 'var(--primary-blue)', fontSize: '15px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileText size={18} />
                                    5. Tài liệu đính kèm
                                </h4>
                                {isLoadingDocuments ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', padding: '16px 0' }}>
                                        <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                        <span>Đang tải tài liệu...</span>
                                    </div>
                                ) : documents.length === 0 ? (
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', padding: '16px 0' }}>Chưa có tài liệu nào được tải lên.</p>
                                ) : (
                                    <div className={styles.tableWrapper}>
                                        <table className={styles.docsTable}>
                                            <thead>
                                                <tr>
                                                    <th>Tên tài liệu</th>
                                                    <th>Loại</th>
                                                    <th>Ngày tải</th>
                                                    <th>Xác thực</th>
                                                    <th>Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {documents.map((doc) => (
                                                    <tr key={doc.id}>
                                                        <td>
                                                            <div className={styles.docNameCell}>
                                                                <FileText size={16} />
                                                                <span title={doc.name}>{doc.name}</span>
                                                            </div>
                                                        </td>
                                                        <td>{doc.type}</td>
                                                        <td>{doc.uploadDate}</td>
                                                        <td>
                                                            <span className={styles.statusBadge}>
                                                                <Shield size={12} />
                                                                Blockchain
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className={styles.tableActions}>
                                                                {doc.url && (
                                                                    <button
                                                                        className={styles.iconBtn}
                                                                        title="Xem"
                                                                        onClick={() => window.open(doc.url, '_blank')}
                                                                    >
                                                                        <ExternalLink size={16} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer — Staff Actions */}
                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '0 0 16px 16px' }}>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className={styles.secondaryBtn}
                            >
                                Đóng
                            </button>
                            {detailProject.status === 'Pending' && (
                                <>
                                    <button
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            handleRejectProject(detailProject.projectId);
                                        }}
                                        className={styles.dangerBtn}
                                    >
                                        Từ chối
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            handleApproveProject(detailProject.projectId);
                                        }}
                                        className={styles.primaryBtn}
                                    >
                                        Phê duyệt
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
