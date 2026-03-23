import React, { useState, useEffect } from 'react';
import { FileCheck, CheckCircle, AlertCircle, Users, Activity, Settings, Trash2, Download, Eye, ArrowRight, X, FileText, Loader2, TrendingUp, ExternalLink, Shield, History, Calendar } from 'lucide-react';
import styles from '../styles/SharedDashboard.module.css';
import local from '../styles/OperationStaffDashboard.module.css';
import FeedHeader from '../components/feed/FeedHeader';
import SuccessModal from '../components/common/SuccessModal';
import ErrorModal from '../components/common/ErrorModal';
import RejectionReasonModal from '../components/common/RejectionReasonModal';
import projectSubmissionService from '../services/projectSubmissionService';
import AIEvaluationService from '../services/AIEvaluationService';
import bookingService from '../services/bookingService';
import AIEvaluationModal from '../components/common/AIEvaluationModal';
import { STATUS_COLORS, STATUS_LABELS, getStageLabel } from '../constants/ProjectStatus';

/**
 * OperationStaffDashboard - Dashboard for Operation Staff
 * Features: Document verification, User approvals, Activity monitoring, Request management
 */
export default function OperationStaffDashboard({ user }) {
    const [activeSection, setActiveSection] = useState('statistics');

    const [pendingProjects, setPendingProjects] = useState([]);
    const [approvedProjects, setApprovedProjects] = useState([]);
    const [rejectedProjects, setRejectedProjects] = useState([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(false);
    const [projectSubmissions, setProjectSubmissions] = useState([]);
    const [pendingApprovals, setPendingApprovals] = useState([]);
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
    const [processingProjectId, setProcessingProjectId] = useState(null);
    const [processingAction, setProcessingAction] = useState(null); // 'approve' or 'reject'
    
    // AI History state
    const [analysisHistory, setAnalysisHistory] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [showHistoryView, setShowHistoryView] = useState(false);
    const [selectedHistoryResult, setSelectedHistoryResult] = useState(null);

    // Additional Statistics state for enhanced dashboard
    const [totalProjects, setTotalProjects] = useState(0);
    const [approvalRate, setApprovalRate] = useState(0);
    const [avgApprovalTime, setAvgApprovalTime] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);
    const [systemHealth, setSystemHealth] = useState(100);
    const [recentActivity, setRecentActivity] = useState([]);

    // Booking Management state
    const [bookings, setBookings] = useState([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState(false);
    const [bookingFilters, setBookingFilters] = useState('');
    const [bookingPage, setBookingPage] = useState(1);
    const [bookingPageSize, setBookingPageSize] = useState(10);
    const [totalBookings, setTotalBookings] = useState(0);
    
    // Booking Detail Modal state
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isLoadingBookingDetail, setIsLoadingBookingDetail] = useState(false);

    const dashboardData = {
        pendingApprovals: pendingApprovals.length,
        pendingProjects: pendingProjects.length,
        approvedUsers: 0,
        totalActivity: 0,
        averageApprovalTime: '-',
        totalProjects: totalProjects,
        approvalRate: approvalRate,
        avgApprovalTime: avgApprovalTime,
        totalUsers: totalUsers,
        systemHealth: systemHealth,
        approvedProjects: approvedProjects.length,
        rejectedProjects: rejectedProjects.length
    };

    // Fetch bookings
    const fetchBookings = async () => {
        setIsLoadingBookings(true);
        try {
            const response = await bookingService.getAllBookings(bookingFilters, '', bookingPage, bookingPageSize);
            console.log('Booking response:', response);
            if (response && response.items) {
                setBookings(response.items || []);
                setTotalBookings(response.totalCount || 0);
            } else if (response) {
                console.warn('Unexpected booking response structure:', response);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setBookings([]);
        } finally {
            setIsLoadingBookings(false);
        }
    };

    const handleViewBookingDetails = async (bookingId) => {
        setShowBookingModal(true);
        setIsLoadingBookingDetail(true);
        try {
            const response = await bookingService.getBookingById(bookingId);
            console.log('Booking detail response:', response);
            // Handle response structure: { success, data: {...}, statusCode }
            if (response && response.data) {
                setSelectedBooking(response.data);
                // Optionally fetch related project info using customerId
                if (response.data.customerId) {
                    console.log('Customer ID:', response.data.customerId);
                }
            } else if (response) {
                setSelectedBooking(response);
            }
        } catch (error) {
            console.error('Error fetching booking details:', error);
            setModalType('error');
            setModalMessage('Không thể tải chi tiết booking');
            setShowModal(true);
        } finally {
            setIsLoadingBookingDetail(false);
        }
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

        const fetchRejectedProjects = async () => {
            setIsLoadingProjects(true);
            try {
                const response = await projectSubmissionService.getRejectedProjects();
                if (response.success && response.data) {
                    const projects = response.data.items || [];
                    setRejectedProjects(projects);
                }
            } catch (error) {
                console.error('Error fetching rejected projects:', error);
                setRejectedProjects([]);
            } finally {
                setIsLoadingProjects(false);
            }
        };

        if (activeSection === 'projects') {
            fetchPendingProjects();
        } else if (activeSection === 'approved_projects') {
            fetchApprovedProjects();
        } else if (activeSection === 'rejected_projects') {
            fetchRejectedProjects();
        } else if (activeSection === 'bookings') {
            fetchBookings();
        }
    }, [activeSection, bookingPage, bookingPageSize]);

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

    const fetchAnalysisHistory = async (projectId) => {
        setIsLoadingHistory(true);
        try {
            const response = await AIEvaluationService.getProjectAnalysisHistory(projectId);
            if (response.success) {
                setAnalysisHistory(response.data || []);
            } else {
                setAnalysisHistory([]);
            }
        } catch (error) {
            console.error('Error fetching analysis history:', error);
            setAnalysisHistory([]);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const openDetailModal = (project) => {
        setDetailProject(project);
        setShowDetailModal(true);
        fetchAnalysisHistory(project.projectId);
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

    const handleApproveProject = async (projectId) => {
        if (processingProjectId) return;
        setProcessingProjectId(projectId);
        setProcessingAction('approve');
        try {
            const response = await projectSubmissionService.approveProject(projectId);
            if (response?.success) {
                setPendingProjects(pendingProjects.filter(p => p.projectId !== projectId));
                setModalType('success');
                setModalMessage('✓ ' + (response?.message || 'Dự án đã được phê duyệt thành công!'));
                setShowModal(true);
            } else {
                setModalType('error');
                setModalMessage('❌ Phê duyệt thất bại: ' + (response?.message || 'Lỗi không xác định'));
                setShowModal(true);
            }
        } catch (error) {
            console.error('Error approving project:', error);
            setModalType('error');
            // If the backend provided a list of specific errors, show the first one.
            // Otherwise, fall back to the general error message.
            const errorMessage = (error?.errors && error.errors.length > 0)
                ? error.errors[0]
                : (error?.message || 'Vui lòng thử lại');
            
            setModalMessage('❌ Phê duyệt thất bại: ' + errorMessage);
            setShowModal(true);
        } finally {
            setProcessingProjectId(null);
            setProcessingAction(null);
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
        if (processingProjectId) return;
        setProcessingProjectId(projectId);
        setProcessingAction('reject');
        try {
            const response = await projectSubmissionService.rejectProject(projectId, reason);
            if (response?.success) {
                setPendingProjects(pendingProjects.filter(p => p.projectId !== projectId));
                setModalType('success');
                setModalMessage('✓ ' + (response?.message || 'Dự án đã bị từ chối!'));
                setShowModal(true);
            } else {
                setModalType('error');
                setModalMessage('❌ Từ chối thất bại: ' + (response?.message || 'Lỗi không xác định'));
                setShowModal(true);
            }
        } catch (error) {
            console.error('Error rejecting project:', error);
            setModalType('error');
            const errorMessage = (error?.errors && error.errors.length > 0)
                ? error.errors[0]
                : (error?.message || 'Vui lòng thử lại');
            
            setModalMessage('❌ Từ chối thất bại: ' + errorMessage);
            setShowModal(true);
        } finally {
            setProcessingProjectId(null);
            setProcessingAction(null);
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

            </div>

            {/* Navigation Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeSection === 'statistics' ? styles.active : ''}`}
                    onClick={() => setActiveSection('statistics')}
                >
                    📊 Thống kê
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'analytics' ? styles.active : ''}`}
                    onClick={() => setActiveSection('analytics')}
                >
                    📈 Phân tích
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'projects' ? styles.active : ''}`}
                    onClick={() => setActiveSection('projects')}
                >
                    Duyệt dự án
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'approvals' ? styles.active : ''}`}
                    onClick={() => setActiveSection('approvals')}
                >
                    Phê duyệt người dùng
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'bookings' ? styles.active : ''}`}
                    onClick={() => setActiveSection('bookings')}
                >
                    📅 Quản lý Booking
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'approved_projects' ? styles.active : ''}`}
                    onClick={() => setActiveSection('approved_projects')}
                >
                    ✓ Dự án đã duyệt
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'rejected_projects' ? styles.active : ''}`}
                    onClick={() => setActiveSection('rejected_projects')}
                >
                    ✕ Dự án từ chối
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
                {/* STATISTICS SECTION - First Priority */}
                {activeSection === 'statistics' && (
                    <div className={styles.section}>
                        <div className={styles.sectionGrid}>
                            {/* Main KPI Cards Grid */}
                            <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                                {/* Total Projects Card */}
                                <div className={`${styles.card} ${local.kpiCard}`} style={{ borderTop: '4px solid #7c3aed' }}>
                                    <div className={local.kpiHeader}>
                                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Tổng dự án</span>
                                        <span style={{ fontSize: '28px', fontWeight: '700', color: '#7c3aed' }}>{dashboardData.pendingProjects + dashboardData.approvedProjects + dashboardData.rejectedProjects}</span>
                                    </div>
                                    <div className={local.kpiBreakdown}>
                                        <div><span>✓ Phê duyệt: </span><strong style={{ color: '#10b981' }}>{dashboardData.approvedProjects}</strong></div>
                                        <div><span>⏳ Chờ: </span><strong style={{ color: '#f59e0b' }}>{dashboardData.pendingProjects}</strong></div>
                                        <div><span>✕ Từ chối: </span><strong style={{ color: '#ef4444' }}>{dashboardData.rejectedProjects}</strong></div>
                                    </div>
                                </div>

                                {/* Approval Rate Card */}
                                <div className={`${styles.card} ${local.kpiCard}`} style={{ borderTop: '4px solid #10b981' }}>
                                    <div className={local.kpiHeader}>
                                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Tỉ lệ chấp thuận</span>
                                        <span style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>
                                            {dashboardData.pendingProjects + dashboardData.approvedProjects + dashboardData.rejectedProjects > 0 
                                                ? Math.round((dashboardData.approvedProjects / (dashboardData.pendingProjects + dashboardData.approvedProjects + dashboardData.rejectedProjects)) * 100)
                                                : 0}%
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                                        Tỉ lệ dự án được phê duyệt so với tổng số
                                    </div>
                                </div>

                                {/* Pending Items Card */}
                                <div className={`${styles.card} ${local.kpiCard}`} style={{ borderTop: '4px solid #f59e0b' }}>
                                    <div className={local.kpiHeader}>
                                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Chờ xử lý</span>
                                        <span style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>
                                            {dashboardData.pendingProjects + dashboardData.pendingApprovals}
                                        </span>
                                    </div>
                                    <div className={local.kpiBreakdown}>
                                        <div><span>📋 Dự án: </span><strong>{dashboardData.pendingProjects}</strong></div>
                                        <div><span>👥 Người dùng: </span><strong>{dashboardData.pendingApprovals}</strong></div>
                                    </div>
                                </div>

                                {/* System Health Card */}
                                <div className={`${styles.card} ${local.kpiCard}`} style={{ borderTop: '4px solid #06b6d4' }}>
                                    <div className={local.kpiHeader}>
                                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Tính khỏe hệ thống</span>
                                        <span style={{ fontSize: '28px', fontWeight: '700', color: '#06b6d4' }}>{systemHealth}%</span>
                                    </div>
                                    <div style={{ 
                                        fontSize: '12px', 
                                        marginTop: '8px',
                                        padding: '4px 8px',
                                        backgroundColor: systemHealth > 80 ? '#d1fae5' : '#fef3c7',
                                        color: systemHealth > 80 ? '#065f46' : '#92400e',
                                        borderRadius: '4px'
                                    }}>
                                        {systemHealth > 80 ? '✓ Bình thường' : '⚠ Cần chú ý'}
                                    </div>
                                </div>
                            </div>

                            {/* Comprehensive Statistics Table */}
                            <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
                                <h3 className={styles.cardTitle} style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
                                    📊 Chỉ số hiệu suất chi tiết
                                </h3>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '12px'
                                }}>
                                    <div className={local.statItem}>
                                        <div className={local.statLabel}>Dự án chờ xử lý</div>
                                        <div className={local.statValue}>{dashboardData.pendingProjects}</div>
                                        <div className={local.statProgress} style={{ width: '100%', height: '4px', backgroundColor: '#f3f4f6', borderRadius: '2px', marginTop: '8px' }}>
                                            <div style={{ height: '100%', width: dashboardData.pendingProjects > 10 ? '100%' : (dashboardData.pendingProjects * 10) + '%', backgroundColor: '#f59e0b', borderRadius: '2px' }}></div>
                                        </div>
                                    </div>
                                    <div className={local.statItem}>
                                        <div className={local.statLabel}>Người dùng chờ phê duyệt</div>
                                        <div className={local.statValue}>{dashboardData.pendingApprovals}</div>
                                        <div className={local.statProgress} style={{ width: '100%', height: '4px', backgroundColor: '#f3f4f6', borderRadius: '2px', marginTop: '8px' }}>
                                            <div style={{ height: '100%', width: dashboardData.pendingApprovals > 10 ? '100%' : (dashboardData.pendingApprovals * 10) + '%', backgroundColor: '#3b82f6', borderRadius: '2px' }}></div>
                                        </div>
                                    </div>
                                    <div className={local.statItem}>
                                        <div className={local.statLabel}>Dự án phê duyệt</div>
                                        <div className={local.statValue}>{dashboardData.approvedProjects}</div>
                                    </div>
                                    <div className={local.statItem}>
                                        <div className={local.statLabel}>Dự án từ chối</div>
                                        <div className={local.statValue} style={{ color: '#ef4444' }}>{dashboardData.rejectedProjects}</div>
                                    </div>
                                    <div className={local.statItem}>
                                        <div className={local.statLabel}>Thời gian TB (giờ)</div>
                                        <div className={local.statValue}>{dashboardData.avgApprovalTime || '-'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions Card */}
                            <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
                                <h3 className={styles.cardTitle} style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
                                    ⚡ Hành động nhanh
                                </h3>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                    gap: '12px'
                                }}>
                                    <button 
                                        onClick={() => setActiveSection('projects')}
                                        style={{
                                            padding: '12px 16px',
                                            border: 'none',
                                            borderRadius: '6px',
                                            backgroundColor: '#f59e0b',
                                            color: 'white',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => e.target.style.opacity = '0.9'}
                                        onMouseOut={(e) => e.target.style.opacity = '1'}
                                    >
                                        📋 Duyệt dự án ({dashboardData.pendingProjects})
                                    </button>
                                    <button 
                                        onClick={() => setActiveSection('approvals')}
                                        style={{
                                            padding: '12px 16px',
                                            border: 'none',
                                            borderRadius: '6px',
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => e.target.style.opacity = '0.9'}
                                        onMouseOut={(e) => e.target.style.opacity = '1'}
                                    >
                                        👥 Phê duyệt người dùng ({dashboardData.pendingApprovals})
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ANALYTICS SECTION */}
                {activeSection === 'analytics' && (
                    <div className={styles.section}>
                        <div className={styles.sectionGrid}>
                            {/* Approval Distribution Chart */}
                            <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
                                <h3 className={styles.cardTitle} style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
                                    📊 Phân bổ trạng thái dự án
                                </h3>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '24px',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <div style={{
                                            width: '150px',
                                            height: '150px',
                                            borderRadius: '50%',
                                            background: `conic-gradient(#10b981 0deg ${(dashboardData.approvedProjects / (dashboardData.approvedProjects + dashboardData.rejectedProjects + dashboardData.pendingProjects) * 360) || 0}deg, #f59e0b ${(dashboardData.approvedProjects / (dashboardData.approvedProjects + dashboardData.rejectedProjects + dashboardData.pendingProjects) * 360) || 0}deg ${((dashboardData.approvedProjects + dashboardData.pendingProjects) / (dashboardData.approvedProjects + dashboardData.rejectedProjects + dashboardData.pendingProjects) * 360) || 0}deg, #ef4444 ${((dashboardData.approvedProjects + dashboardData.pendingProjects) / (dashboardData.approvedProjects + dashboardData.rejectedProjects + dashboardData.pendingProjects) * 360) || 0}deg)`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'relative'
                                        }}>
                                            <div style={{
                                                width: '120px',
                                                height: '120px',
                                                borderRadius: '50%',
                                                backgroundColor: 'var(--bg-secondary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexDirection: 'column'
                                            }}>
                                                <div style={{ fontSize: '24px', fontWeight: '700' }}>
                                                    {dashboardData.approvedProjects + dashboardData.rejectedProjects + dashboardData.pendingProjects}
                                                </div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Tổng</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#d1fae5', borderRadius: '6px' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#065f46' }}>✓ Phê duyệt</span>
                                            <span style={{ fontSize: '18px', fontWeight: '700', color: '#10b981' }}>{dashboardData.approvedProjects}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#fef3c7', borderRadius: '6px' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#92400e' }}>⏳ Chờ xử lý</span>
                                            <span style={{ fontSize: '18px', fontWeight: '700', color: '#f59e0b' }}>{dashboardData.pendingProjects}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#fee2e2', borderRadius: '6px' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#7f1d1d' }}>✕ Từ chối</span>
                                            <span style={{ fontSize: '18px', fontWeight: '700', color: '#ef4444' }}>{dashboardData.rejectedProjects}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Performance Metrics */}
                            <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
                                <h3 className={styles.cardTitle} style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
                                    ⚡ Chỉ số hiệu suất
                                </h3>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                    gap: '16px'
                                }}>
                                    <div className={local.performanceMetric}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Tỉ lệ phê duyệt</span>
                                            <span style={{ fontSize: '16px', fontWeight: '700', color: '#10b981' }}>
                                                {dashboardData.approvedProjects + dashboardData.rejectedProjects > 0 
                                                    ? Math.round((dashboardData.approvedProjects / (dashboardData.approvedProjects + dashboardData.rejectedProjects)) * 100)
                                                    : 0}%
                                            </span>
                                        </div>
                                        <div style={{ width: '100%', height: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%',
                                                width: dashboardData.approvedProjects + dashboardData.rejectedProjects > 0 
                                                    ? ((dashboardData.approvedProjects / (dashboardData.approvedProjects + dashboardData.rejectedProjects)) * 100) + '%'
                                                    : '0%',
                                                backgroundColor: '#10b981',
                                                transition: 'width 0.3s ease'
                                            }}></div>
                                        </div>
                                    </div>

                                    <div className={local.performanceMetric}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Tỉ lệ hoàn thành</span>
                                            <span style={{ fontSize: '16px', fontWeight: '700', color: '#06b6d4' }}>
                                                {dashboardData.approvedProjects + dashboardData.rejectedProjects + dashboardData.pendingProjects > 0 
                                                    ? Math.round(((dashboardData.approvedProjects + dashboardData.rejectedProjects) / (dashboardData.approvedProjects + dashboardData.rejectedProjects + dashboardData.pendingProjects)) * 100)
                                                    : 0}%
                                            </span>
                                        </div>
                                        <div style={{ width: '100%', height: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%',
                                                width: dashboardData.approvedProjects + dashboardData.rejectedProjects + dashboardData.pendingProjects > 0 
                                                    ? (((dashboardData.approvedProjects + dashboardData.rejectedProjects) / (dashboardData.approvedProjects + dashboardData.rejectedProjects + dashboardData.pendingProjects)) * 100) + '%'
                                                    : '0%',
                                                backgroundColor: '#06b6d4',
                                                transition: 'width 0.3s ease'
                                            }}></div>
                                        </div>
                                    </div>

                                    <div className={local.performanceMetric}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Tỉ lệ từ chối</span>
                                            <span style={{ fontSize: '16px', fontWeight: '700', color: '#ef4444' }}>
                                                {dashboardData.approvedProjects + dashboardData.rejectedProjects > 0 
                                                    ? Math.round((dashboardData.rejectedProjects / (dashboardData.approvedProjects + dashboardData.rejectedProjects)) * 100)
                                                    : 0}%
                                            </span>
                                        </div>
                                        <div style={{ width: '100%', height: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%',
                                                width: dashboardData.approvedProjects + dashboardData.rejectedProjects > 0 
                                                    ? ((dashboardData.rejectedProjects / (dashboardData.approvedProjects + dashboardData.rejectedProjects)) * 100) + '%'
                                                    : '0%',
                                                backgroundColor: '#ef4444',
                                                transition: 'width 0.3s ease'
                                            }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Summary */}
                            <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
                                <h3 className={styles.cardTitle} style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
                                    📋 Tóm tắt hành động chờ xử lý
                                </h3>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                    gap: '16px'
                                }}>
                                    <div style={{
                                        padding: '16px',
                                        backgroundColor: '#fef3c7',
                                        borderRadius: '8px',
                                        borderLeft: '4px solid #f59e0b'
                                    }}>
                                        <div style={{ fontSize: '12px', color: '#92400e', fontWeight: '600', marginBottom: '4px' }}>DUYỆT DỰ ÁN</div>
                                        <div style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b', marginBottom: '8px' }}>
                                            {dashboardData.pendingProjects}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#92400e' }}>
                                            {dashboardData.pendingProjects > 0 
                                                ? `${dashboardData.pendingProjects} dự án đang chờ phê duyệt của bạn` 
                                                : 'Không có dự án nào chờ xử lý'}
                                        </div>
                                    </div>

                                    <div style={{
                                        padding: '16px',
                                        backgroundColor: '#dbeafe',
                                        borderRadius: '8px',
                                        borderLeft: '4px solid #3b82f6'
                                    }}>
                                        <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: '600', marginBottom: '4px' }}>PHÂN BỔ NGƯỜI DÙNG</div>
                                        <div style={{ fontSize: '28px', fontWeight: '700', color: '#3b82f6', marginBottom: '8px' }}>
                                            {dashboardData.pendingApprovals}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#1e40af' }}>
                                            {dashboardData.pendingApprovals > 0 
                                                ? `${dashboardData.pendingApprovals} yêu cầu chờ xác nhận` 
                                                : 'Tất cả người dùng đã được phê duyệt'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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
                                                        disabled={processingProjectId !== null}
                                                        style={{ 
                                                            opacity: processingProjectId !== null ? 0.6 : 1,
                                                            cursor: processingProjectId !== null ? 'not-allowed' : 'pointer',
                                                            minWidth: '100px' // Keep size stable
                                                        }}
                                                    >
                                                        {processingProjectId === project.projectId && processingAction === 'reject' ? (
                                                            <Loader2 size={18} className={styles.spinner} />
                                                        ) : (
                                                            'Từ chối'
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleApproveProject(project.projectId)}
                                                        className={styles.primaryBtn}
                                                        disabled={processingProjectId !== null}
                                                        style={{ 
                                                            opacity: processingProjectId !== null ? 0.6 : 1,
                                                            cursor: processingProjectId !== null ? 'not-allowed' : 'pointer',
                                                            minWidth: '100px' // Keep size stable
                                                        }}
                                                    >
                                                        {processingProjectId === project.projectId && processingAction === 'approve' ? (
                                                            <Loader2 size={18} className={styles.spinner} />
                                                        ) : (
                                                            'Phê duyệt'
                                                        )}
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

                {/* Approved Projects Section - Condensed */}
                {activeSection === 'approved_projects' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>Dự án đã phê duyệt ({approvedProjects.length})</h3>
                            <div className={styles.list}>
                                {isLoadingProjects ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        ⏳ Đang tải...
                                    </div>
                                ) : approvedProjects.length === 0 ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        Không có dự án nào
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {approvedProjects.map(project => (
                                            <div 
                                                key={project.projectId}
                                                style={{
                                                    padding: '12px',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: '8px',
                                                    backgroundColor: 'var(--bg-secondary)',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <div>
                                                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{project.projectName}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>✓ Duyệt: {project.approvedAt ? new Date(project.approvedAt).toLocaleDateString('vi-VN') : 'N/A'}</div>
                                                </div>
                                                <button onClick={() => openDetailModal(project)} className={styles.secondaryBtn} style={{ fontSize: '12px', padding: '6px 12px' }}>Chi tiết</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Rejected Projects Section - Condensed */}
                {activeSection === 'rejected_projects' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>Dự án đã từ chối ({rejectedProjects.length})</h3>
                            <div className={styles.list}>
                                {isLoadingProjects ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        ⏳ Đang tải...
                                    </div>
                                ) : rejectedProjects.length === 0 ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        Không có dự án nào
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {rejectedProjects.map(project => (
                                            <div 
                                                key={project.projectId}
                                                style={{
                                                    padding: '12px',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: '8px',
                                                    backgroundColor: 'var(--bg-secondary)',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <div>
                                                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{project.projectName}</div>
                                                    <div style={{ fontSize: '12px', color: '#ef4444' }}>✕ Từ chối: {project.rejectedAt ? new Date(project.rejectedAt).toLocaleDateString('vi-VN') : 'N/A'}</div>
                                                </div>
                                                <button onClick={() => openDetailModal(project)} className={styles.secondaryBtn} style={{ fontSize: '12px', padding: '6px 12px' }}>Chi tiết</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Booking Management Section */}
                {activeSection === 'bookings' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>
                                Quản lý Booking ({bookings.length})
                                <span style={{ marginLeft: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                    Tổng: {totalBookings}
                                </span>
                            </h3>

                            {/* Filter Bar */}
                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                marginBottom: '16px',
                                flexWrap: 'wrap'
                            }}>
                                <button
                                    onClick={() => { setBookingFilters(''); setBookingPage(1); }}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: bookingFilters === '' ? '#7c3aed' : 'var(--bg-secondary)',
                                        color: bookingFilters === '' ? 'white' : 'var(--text-primary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: '600'
                                    }}
                                >
                                    Tất cả
                                </button>
                                {['Pending', 'Confirmed', 'Completed'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => { setBookingFilters(`status:${status}`); setBookingPage(1); }}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: bookingFilters === `status:${status}` ? '#7c3aed' : 'var(--bg-secondary)',
                                            color: bookingFilters === `status:${status}` ? 'white' : 'var(--text-primary)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: '600'
                                        }}
                                    >
                                        {status === 'Pending' ? '⏳ ' : status === 'Confirmed' ? '✓ ' : '✓ '}{status}
                                    </button>
                                ))}
                            </div>

                            {/* Booking List */}
                            <div className={styles.list}>
                                {isLoadingBookings ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        ⏳ Đang tải booking...
                                    </div>
                                ) : bookings.length === 0 ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        Không có booking nào
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {bookings.map((booking, index) => (
                                            <div 
                                                key={`${booking.id}-${index}`}
                                                style={{
                                                    padding: '14px',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: '8px',
                                                    backgroundColor: 'var(--bg-secondary)',
                                                    display: 'grid',
                                                    gridTemplateColumns: '1fr auto',
                                                    gap: '16px',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <div>
                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                                                        <span style={{ fontWeight: '700', fontSize: '14px' }}>
                                                            #{booking.id} - {booking.advisorName} ↔ {booking.customerName}
                                                        </span>
                                                        <span 
                                                            style={{
                                                                fontSize: '11px',
                                                                padding: '3px 10px',
                                                                borderRadius: '4px',
                                                                backgroundColor: booking.status === 'Pending' ? '#fef3c7' : booking.status === 'Confirmed' ? '#d1fae5' : '#e0e7ff',
                                                                color: booking.status === 'Pending' ? '#92400e' : booking.status === 'Confirmed' ? '#065f46' : '#312e81',
                                                                fontWeight: '600',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            {booking.status === 'Pending' ? '⏳ Chờ xác nhận' : booking.status === 'Confirmed' ? '✓ Đã xác nhận' : '✓ Hoàn thành'}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                                        📅 {new Date(booking.startTime).toLocaleString('vi-VN')} → {new Date(booking.endTime).toLocaleString('vi-VN')}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                                        💰 {Number(booking.price).toLocaleString('vi-VN')} VND
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: '#999' }}>
                                                        CV: {booking.customerId} | CTV: {booking.advisorId}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap' }}>
                                                    {booking.status === 'Pending' && (
                                                        <>
                                                            <button
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    backgroundColor: '#10b981',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '6px',
                                                                    fontSize: '12px',
                                                                    fontWeight: '600',
                                                                    cursor: 'pointer',
                                                                    whiteSpace: 'nowrap'
                                                                }}
                                                            >
                                                                Duyệt
                                                            </button>
                                                            <button
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    backgroundColor: '#ef4444',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '6px',
                                                                    fontSize: '12px',
                                                                    fontWeight: '600',
                                                                    cursor: 'pointer',
                                                                    whiteSpace: 'nowrap'
                                                                }}
                                                            >
                                                                Từ chối
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => handleViewBookingDetails(booking.id)}
                                                        style={{
                                                            padding: '6px 12px',
                                                            backgroundColor: '#3b82f6',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        Chi tiết
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {totalBookings > 0 && (
                                <div style={{
                                    marginTop: '16px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontSize: '12px',
                                    color: 'var(--text-secondary)'
                                }}>
                                    <span>Trang {bookingPage} / {Math.ceil(totalBookings / bookingPageSize)}</span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => setBookingPage(Math.max(1, bookingPage - 1))}
                                            disabled={bookingPage === 1}
                                            style={{
                                                padding: '6px 12px',
                                                backgroundColor: bookingPage === 1 ? '#f3f4f6' : '#7c3aed',
                                                color: bookingPage === 1 ? '#9ca3af' : 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: bookingPage === 1 ? 'not-allowed' : 'pointer',
                                                fontSize: '12px',
                                                fontWeight: '600'
                                            }}
                                        >
                                            Trước
                                        </button>
                                        <button
                                            onClick={() => setBookingPage(Math.min(Math.ceil(totalBookings / bookingPageSize), bookingPage + 1))}
                                            disabled={bookingPage >= Math.ceil(totalBookings / bookingPageSize)}
                                            style={{
                                                padding: '6px 12px',
                                                backgroundColor: bookingPage >= Math.ceil(totalBookings / bookingPageSize) ? '#f3f4f6' : '#7c3aed',
                                                color: bookingPage >= Math.ceil(totalBookings / bookingPageSize) ? '#9ca3af' : 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: bookingPage >= Math.ceil(totalBookings / bookingPageSize) ? 'not-allowed' : 'pointer',
                                                fontSize: '12px',
                                                fontWeight: '600'
                                            }}
                                        >
                                            Sau
                                        </button>
                                    </div>
                                </div>
                            )}
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
                            {/* AI History Section */}
                            <div style={{ 
                                marginBottom: '24px', 
                                padding: '16px', 
                                backgroundColor: 'rgba(29, 155, 240, 0.05)', 
                                borderRadius: '12px', 
                                border: '1px solid var(--border-color)' 
                            }}>
                                <h4 style={{ 
                                    fontSize: '14px', 
                                    fontWeight: '800', 
                                    marginBottom: '12px', 
                                    color: 'var(--text-primary)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px' 
                                }}>
                                    <History size={18} color="var(--primary-blue)" />
                                    Lịch sử đánh giá AI
                                </h4>
                                {isLoadingHistory ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                                        <Loader2 size={14} className={styles.spinner} />
                                        Đang tải lịch sử...
                                    </div>
                                ) : analysisHistory.length > 0 ? (
                                    <div style={{ 
                                        display: 'flex', 
                                        gap: '12px', 
                                        overflowX: 'auto', 
                                        paddingBottom: '8px',
                                        msOverflowStyle: 'none',
                                        scrollbarWidth: 'none'
                                    }}>
                                        {analysisHistory.map((item, index) => (
                                            <button
                                                key={item.evaluationId || index}
                                                onClick={() => {
                                                    setSelectedHistoryResult({ data: item });
                                                    setShowHistoryView(true);
                                                }}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    padding: '10px 16px',
                                                    backgroundColor: 'var(--bg-primary)',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: '12px',
                                                    minWidth: '100px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.borderColor = 'var(--primary-blue)';
                                                    e.currentTarget.style.backgroundColor = 'rgba(29, 155, 240, 0.02)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                                    e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                                                }}
                                            >
                                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '4px' }}>
                                                    {new Date(item.createdAt || item.evaluatedAt || Date.now()).toLocaleDateString('vi-VN')}
                                                </span>
                                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                                                    <span style={{ fontSize: '18px', fontWeight: '900', color: 'var(--primary-blue)' }}>
                                                        {item.potentialScore || 0}
                                                    </span>
                                                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>/100</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px', padding: '4px 0' }}>
                                        Chưa có dữ liệu đánh giá
                                    </div>
                                )}
                            </div>
                            {detailProject.status === 'Rejected' && detailProject.rejectionReason && (
                                <div className={styles.rejectionBox} style={{ marginBottom: '24px', marginTop: 0 }}>
                                    <div className={styles.rejectionTitle}>
                                        <AlertCircle size={16} />
                                        <span style={{ fontSize: '15px' }}>Lý do từ chối dự án:</span>
                                    </div>
                                    <p className={styles.rejectionText} style={{ fontSize: '15px' }}>{detailProject.rejectionReason}</p>
                                </div>
                            )}
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
                                            {getStageLabel(detailProject.developmentStage)}
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

            {/* Booking Detail Modal */}
            {showBookingModal && selectedBooking && (
                <div
                    className={styles.modalOverlay}
                    onClick={(e) => e.target === e.currentTarget && setShowBookingModal(false)}
                >
                    <div className={styles.modalContent} style={{ maxWidth: '650px', width: '92%' }}>
                        {/* Modal Header */}
                        <div className={styles.modalHeader}>
                            <div>
                                <h2 className={styles.headerTitle} style={{ margin: '0 0 8px 0' }}>
                                    Booking #{selectedBooking.id}
                                </h2>
                                <span
                                    className={styles.badge}
                                    style={{
                                        backgroundColor: selectedBooking.status === 'Pending' ? '#fef3c7' : selectedBooking.status === 'Confirmed' ? '#d1fae5' : '#e0e7ff',
                                        color: selectedBooking.status === 'Pending' ? '#92400e' : selectedBooking.status === 'Confirmed' ? '#065f46' : '#312e81',
                                        border: '1px solid currentColor',
                                        opacity: 0.3
                                    }}
                                >
                                    {selectedBooking.status === 'Pending' ? '⏳ Chờ xác nhận' : selectedBooking.status === 'Confirmed' ? '✓ Đã xác nhận' : '✓ Hoàn thành'}
                                </span>
                            </div>
                            <button
                                onClick={() => setShowBookingModal(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '24px', overflowY: 'auto', maxHeight: 'calc(90vh - 120px)' }}>
                            {isLoadingBookingDetail ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-secondary)', padding: '32px' }}>
                                    <Loader2 size={18} className={styles.spinner} />
                                    Đang tải chi tiết...
                                </div>
                            ) : (
                                <>
                                    {/* Advisor and Customer Info */}
                                    <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '600' }}>👨‍💼 Cố vấn</div>
                                            <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)' }}>
                                                {selectedBooking.advisorName}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', padding: '4px 8px', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', display: 'inline-block' }}>
                                                ID: {selectedBooking.advisorId}
                                            </div>
                                        </div>
                                        <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '600' }}>👤 Khách hàng</div>
                                            <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)' }}>
                                                {selectedBooking.customerName}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', padding: '4px 8px', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', display: 'inline-block' }}>
                                                ID: {selectedBooking.customerId}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Time and Price Info */}
                                    <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', fontWeight: '600' }}>📅 Thời gian bắt đầu</div>
                                            <div style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-primary)', fontWeight: '500' }}>
                                                {new Date(selectedBooking.startTime).toLocaleString('vi-VN')}
                                            </div>
                                        </div>
                                        <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', fontWeight: '600' }}>📅 Thời gian kết thúc</div>
                                            <div style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-primary)', fontWeight: '500' }}>
                                                {new Date(selectedBooking.endTime).toLocaleString('vi-VN')}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price Info */}
                                    <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f0f7ff', borderRadius: '8px', border: '2px solid #7c3aed', borderLeft: '4px solid #7c3aed' }}>
                                        <div style={{ fontSize: '11px', color: '#6366f1', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '600' }}>💰 Giá cả</div>
                                        <div style={{ fontSize: '28px', fontWeight: '700', color: '#7c3aed' }}>
                                            {Number(selectedBooking.price).toLocaleString('vi-VN')}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#6366f1', marginTop: '4px' }}>VND</div>
                                    </div>

                                    {/* Booking ID and Details */}
                                    <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '600' }}>📋 Chi tiết Booking</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                                            <div>
                                                <span style={{ color: 'var(--text-secondary)' }}>Booking ID:</span>
                                                <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>#{selectedBooking.id}</div>
                                            </div>
                                            <div>
                                                <span style={{ color: 'var(--text-secondary)' }}>Trạng thái:</span>
                                                <div style={{ fontWeight: '600', color: selectedBooking.status === 'Pending' ? '#f59e0b' : selectedBooking.status === 'Confirmed' ? '#10b981' : '#6366f1' }}>
                                                    {selectedBooking.status === 'Pending' ? '⏳ Chờ xác nhận' : selectedBooking.status === 'Confirmed' ? '✓ Đã xác nhận' : '✓ Hoàn thành'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '0 0 16px 16px' }}>
                            <button
                                onClick={() => setShowBookingModal(false)}
                                className={styles.secondaryBtn}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showHistoryView && selectedHistoryResult && (
                <AIEvaluationModal
                    isOpen={showHistoryView}
                    onCancel={() => {
                        setShowHistoryView(false);
                        setSelectedHistoryResult(null);
                    }}
                    analysisResult={selectedHistoryResult}
                    isHistoryMode={true}
                    projectName={detailProject?.projectName || 'Dự án'}
                />
            )}
        </div>
    );
}
