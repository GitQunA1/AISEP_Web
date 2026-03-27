import React, { useState, useEffect } from 'react';
import { FileCheck, CheckCircle, AlertCircle, Users, Activity, Settings, Trash2, Download, Eye, ArrowRight, X, FileText, Loader2, TrendingUp, ExternalLink, Shield, History, Calendar, PieChart, Briefcase, Clock, DollarSign } from 'lucide-react';
import styles from '../styles/SharedDashboard.module.css';
import local from '../styles/OperationStaffDashboard.module.css';
import FeedHeader from '../components/feed/FeedHeader';
import SuccessModal from '../components/common/SuccessModal';
import ErrorModal from '../components/common/ErrorModal';
import RejectionReasonModal from '../components/common/RejectionReasonModal';
import projectSubmissionService from '../services/projectSubmissionService';
import AIEvaluationService from '../services/AIEvaluationService';
import bookingService from '../services/bookingService';
import startupProfileService from '../services/startupProfileService';
import AIEvaluationModal from '../components/common/AIEvaluationModal';
import { STATUS_COLORS, STATUS_LABELS, getStageLabel } from '../constants/ProjectStatus';

/**
 * OperationStaffDashboard - Dashboard for Operation Staff
 * Features: Document verification, User approvals, Activity monitoring, Request management
 */
export default function OperationStaffDashboard({ user, initialSection = 'statistics' }) {
    // Safety check for styles
    const s = local || {};
    if (!local) {
        console.warn('OperationStaffDashboard: local styles (OperationStaffDashboard.module.css) could not be loaded.');
    }

    const [activeSection, setActiveSection] = useState(initialSection);

    // Sync internal state with prop changes from sidebar
    useEffect(() => {
        if (initialSection) {
            setActiveSection(initialSection);
        }
    }, [initialSection]);

    const [pendingProjects, setPendingProjects] = useState([]);
    const [approvedProjects, setApprovedProjects] = useState([]);
    const [rejectedProjects, setRejectedProjects] = useState([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(false);
    const [projectSubmissions, setProjectSubmissions] = useState([]);
    const [pendingStartups, setPendingStartups] = useState([]);
    const [isLoadingStartups, setIsLoadingStartups] = useState(false);
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
    const [allBookings, setAllBookings] = useState([]);

    // Project Management Filtering
    const [projectFilter, setProjectFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'

    // Booking Detail Modal state
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isLoadingBookingDetail, setIsLoadingBookingDetail] = useState(false);

    const dashboardData = {
        pendingApprovals: pendingStartups.length,
        pendingProjects: pendingProjects.length,
        approvedUsers: 0,
        totalActivity: 0,
        averageApprovalTime: '-',
        totalProjects: totalProjects,
        approvalRate: approvalRate,
        avgApprovalTime: avgApprovalTime,
        totalUsers: totalUsers,
        systemHealth: systemHealth,
        pendingDocuments: 0,
        approvedProjects: approvedProjects.length,
        rejectedProjects: rejectedProjects.length
    };

    // Derived booking lists
    const pendingBookingsList = allBookings.filter(b => b.status === 'Pending');
    const confirmedBookingsList = allBookings.filter(b => b.status === 'Confirmed');
    const completedBookingsList = allBookings.filter(b => b.status === 'Completed');

    const displayedBookings = bookingFilters === ''
        ? allBookings
        : bookingFilters === 'status:Pending' ? pendingBookingsList
            : bookingFilters === 'status:Confirmed' ? confirmedBookingsList
                : bookingFilters === 'status:Completed' ? completedBookingsList
                    : allBookings;

    // We can slice displayedBookings if we want client-side pagination
    const paginatedBookings = displayedBookings.slice((bookingPage - 1) * bookingPageSize, bookingPage * bookingPageSize);

    // Fetch bookings
    const fetchBookings = async () => {
        setIsLoadingBookings(true);
        try {
            // Fetch all bookings at once for client-side filtering and counting
            const response = await bookingService.getAllBookings('', '', 1, 100);
            if (response && response.items) {
                setAllBookings(response.items || []);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setAllBookings([]);
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

        const fetchPendingStartups = async () => {
            setIsLoadingStartups(true);
            try {
                const response = await startupProfileService.getAllStartups();
                const items = Array.isArray(response) ? response : (response?.data?.items || response?.items || []);
                const unverified = items.filter(s => s.approvalStatus === 'Pending' || s.approvalStatus === 'Unverified');
                setPendingStartups(unverified);
            } catch (error) {
                console.error('Error fetching pending startups:', error);
            } finally {
                setIsLoadingStartups(false);
            }
        };

        if (activeSection === 'project_management') {
            fetchPendingProjects();
            fetchApprovedProjects();
            fetchRejectedProjects();
        } else if (activeSection === 'bookings') {
            fetchBookings();
        } else if (activeSection === 'approvals') {
            fetchPendingStartups();
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
            // Only log if it's not a permission error or if debugging
            if (error?.response?.status !== 403) {
                console.error('Error fetching analysis history:', error);
            }
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



    const handleApproveStartup = async (id) => {
        if (processingProjectId) return;
        setProcessingProjectId(id);
        setProcessingAction('approve');
        try {
            await startupProfileService.approveStartup(id);
            setPendingStartups(pendingStartups.filter(s => s.id !== id));
            setModalType('success');
            setModalMessage('✓ Startup đã được phê duyệt thành công!');
            setShowModal(true);
        } catch (error) {
            console.error('Error approving startup:', error);
            setModalType('error');
            setModalMessage('❌ Phê duyệt thất bại: ' + (error?.message || 'Lỗi không xác định'));
            setShowModal(true);
        } finally {
            setProcessingProjectId(null);
            setProcessingAction(null);
        }
    };

    const handleRejectStartup = async (id, reason = null) => {
        if (!reason) {
            const startup = pendingStartups.find(s => s.id === id);
            // Use selectedProject for the rejection modal since it requires a ProjectName
            setSelectedProject({ projectId: id, projectName: startup?.companyName || 'Startup' });
            setShowRejectionModal(true);
            return;
        }

        if (processingProjectId) return;
        setProcessingProjectId(id);
        setProcessingAction('reject');
        try {
            await startupProfileService.rejectStartup(id, reason);
            setPendingStartups(pendingStartups.filter(s => s.id !== id));
            setModalType('success');
            setModalMessage('✓ Startup đã bị từ chối!');
            setShowModal(true);
        } catch (error) {
            console.error('Error rejecting startup:', error);
            setModalType('error');
            setModalMessage('❌ Từ chối thất bại: ' + (error?.message || 'Lỗi không xác định'));
            setShowModal(true);
        } finally {
            setProcessingProjectId(null);
            setProcessingAction(null);
        }
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

            {/* Quick Stats - Only show in main statistics/analytics dashboard views */}
            {['statistics', 'analytics'].includes(activeSection) && (
                <>
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
                </>
            )}

            {/* Navigation Tabs (Only for main statistics/analytics) */}
            {['statistics', 'analytics'].includes(activeSection) && (
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeSection === 'statistics' ? styles.active : ''}`}
                        onClick={() => setActiveSection('statistics')}
                    >
                        Thống kê
                    </button>
                    <button
                        className={`${styles.tab} ${activeSection === 'analytics' ? styles.active : ''}`}
                        onClick={() => setActiveSection('analytics')}
                    >
                        Phân tích
                    </button>
                </div>
            )}

            {/* Content Sections */}
            <div className={styles.content}>
                {/* STATISTICS SECTION */}
                {activeSection === 'statistics' && (
                    <div className={styles.section}>
                        <div className={s.statisticsSection}>
                            {/* Main KPI Cards Grid */}
                            <div className={s.statsGrid}>
                                {/* Total Projects Card */}
                                <div className={s.kpiCard}>
                                    <div className={s.kpiHeader}>
                                        <span className={s.statLabel}>Tổng dự án</span>
                                        <span className={s.statValue}>
                                            {dashboardData.pendingProjects + dashboardData.approvedProjects + dashboardData.rejectedProjects}
                                        </span>
                                    </div>
                                    <div className={s.kpiBreakdown}>
                                        <div><span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={14} color="#10b981" /> Phê duyệt</span><strong>{dashboardData.approvedProjects}</strong></div>
                                        <div><span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><History size={14} color="#f59e0b" /> Chờ xử lý</span><strong>{dashboardData.pendingProjects}</strong></div>
                                        <div><span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><X size={14} color="#ef4444" /> Từ chối</span><strong>{dashboardData.rejectedProjects}</strong></div>
                                    </div>
                                </div>

                                {/* Approval Rate Card */}
                                <div className={s.kpiCard}>
                                    <div className={s.kpiHeader}>
                                        <span className={s.statLabel}>Tỉ lệ chấp thuận</span>
                                        <span className={s.statValue}>
                                            {dashboardData.pendingProjects + dashboardData.approvedProjects + dashboardData.rejectedProjects > 0
                                                ? Math.round((dashboardData.approvedProjects / (dashboardData.pendingProjects + dashboardData.approvedProjects + dashboardData.rejectedProjects)) * 100)
                                                : 0}%
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <TrendingUp size={14} /> Hiệu quả phê duyệt hệ thống
                                    </div>
                                </div>

                                {/* Pending Items Card */}
                                <div className={s.kpiCard}>
                                    <div className={s.kpiHeader}>
                                        <span className={s.statLabel}>Chờ xử lý</span>
                                        <span className={s.statValue}>
                                            {dashboardData.pendingProjects + dashboardData.pendingApprovals}
                                        </span>
                                    </div>
                                    <div className={s.kpiBreakdown}>
                                        <div><span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FileCheck size={14} /> Dự án</span><strong>{dashboardData.pendingProjects}</strong></div>
                                        <div><span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={14} /> Người dùng</span><strong>{dashboardData.pendingApprovals}</strong></div>
                                    </div>
                                </div>

                                {/* System Health Card */}
                                <div className={s.kpiCard}>
                                    <div className={s.kpiHeader}>
                                        <span className={s.statLabel}>Tính khỏe hệ thống</span>
                                        <span className={s.statValue}>{systemHealth}%</span>
                                    </div>
                                    <div style={{
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        marginTop: '12px',
                                        padding: '4px 10px',
                                        backgroundColor: systemHealth > 80 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                        color: systemHealth > 80 ? '#10b981' : '#f59e0b',
                                        borderRadius: '20px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        {systemHealth > 80 ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                        {systemHealth > 80 ? 'Bình thường' : 'Cần chú ý'}
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Stats Row */}
                            <div className={styles.card} style={{ gridColumn: '1 / -1', border: '1px solid var(--border-color)', background: 'transparent' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                                    <Activity size={18} color="var(--primary-blue)" />
                                    <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                                        Chỉ số hiệu suất chi tiết
                                    </h3>
                                </div>
                                <div className={s.detailedStatsRow}>
                                    <div className={s.statItem}>
                                        <div className={s.statLabel}>Dự án chờ xử lý</div>
                                        <div className={s.statValue}>{dashboardData.pendingProjects}</div>
                                        <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '2px', marginTop: '12px' }}>
                                            <div style={{ height: '100%', width: dashboardData.pendingProjects > 10 ? '100%' : (dashboardData.pendingProjects * 10) + '%', backgroundColor: '#f59e0b', borderRadius: '2px' }}></div>
                                        </div>
                                    </div>
                                    <div className={s.statItem}>
                                        <div className={s.statLabel}>Người dùng chờ phê duyệt</div>
                                        <div className={s.statValue}>{dashboardData.pendingApprovals}</div>
                                        <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '2px', marginTop: '12px' }}>
                                            <div style={{ height: '100%', width: dashboardData.pendingApprovals > 10 ? '100%' : (dashboardData.pendingApprovals * 10) + '%', backgroundColor: 'var(--primary-blue)', borderRadius: '2px' }}></div>
                                        </div>
                                    </div>
                                    <div className={s.statItem}>
                                        <div className={s.statLabel}>Dự án phê duyệt</div>
                                        <div className={s.statValue}>{dashboardData.approvedProjects}</div>
                                    </div>
                                    <div className={s.statItem}>
                                        <div className={s.statLabel}>Dự án từ chối</div>
                                        <div className={s.statValue} style={{ color: '#ef4444' }}>{dashboardData.rejectedProjects}</div>
                                    </div>
                                    <div className={s.statItem}>
                                        <div className={s.statLabel}>Thời gian TB (giờ)</div>
                                        <div className={s.statValue}>{dashboardData.avgApprovalTime || '-'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ANALYTICS SECTION */}
                {activeSection === 'analytics' && (
                    <div className={styles.section}>
                        <div className={s.analyticsSection}>
                            {/* Main Analytics Grid */}
                            <div className={s.analyticsGrid}>
                                {/* Project Distribution (Donut Chart) */}
                                <div className={styles.card}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                                        <PieChart size={18} color="var(--primary-blue)" />
                                        <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                                            Phân bổ trạng thái dự án
                                        </h3>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                                        {/* Minimalist CSS Donut */}
                                        <div style={{
                                            width: '120px',
                                            height: '120px',
                                            borderRadius: '50%',
                                            border: '12px solid #10b981',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            position: 'relative'
                                        }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>
                                                    {dashboardData.approvedProjects + dashboardData.pendingProjects + dashboardData.rejectedProjects}
                                                </div>
                                                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tổng</div>
                                            </div>
                                        </div>

                                        {/* Legend */}
                                        <div style={{ flex: 1 }} className={s.legendList}>
                                            <div className={s.legendItem}>
                                                <div className={s.legendLabel}>
                                                    <div className={s.indicatorCircle} style={{ backgroundColor: '#10b981' }}></div>
                                                    Phê duyệt
                                                </div>
                                                <div className={s.legendValue}>{dashboardData.approvedProjects}</div>
                                            </div>
                                            <div className={s.legendItem}>
                                                <div className={s.legendLabel}>
                                                    <div className={s.indicatorCircle} style={{ backgroundColor: '#f59e0b' }}></div>
                                                    Chờ xử lý
                                                </div>
                                                <div className={s.legendValue}>{dashboardData.pendingProjects}</div>
                                            </div>
                                            <div className={s.legendItem}>
                                                <div className={s.legendLabel}>
                                                    <div className={s.indicatorCircle} style={{ backgroundColor: '#ef4444' }}></div>
                                                    Từ chối
                                                </div>
                                                <div className={s.legendValue}>{dashboardData.rejectedProjects}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Performance Metrics */}
                                <div className={styles.card}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                                        <Activity size={18} color="var(--primary-blue)" />
                                        <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                                            Chỉ số hiệu suất
                                        </h3>
                                    </div>

                                    <div className={s.performanceGrid}>
                                        <div className={s.progressWrapper}>
                                            <div className={s.progressLabelRow}>
                                                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Tỉ lệ phê duyệt</span>
                                                <span style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>
                                                    {dashboardData.approvedProjects + dashboardData.rejectedProjects > 0
                                                        ? Math.round((dashboardData.approvedProjects / (dashboardData.approvedProjects + dashboardData.rejectedProjects)) * 100)
                                                        : 0}%
                                                </span>
                                            </div>
                                            <div className={s.progressTrack}>
                                                <div className={s.progressFill} style={{
                                                    width: (dashboardData.approvedProjects + dashboardData.rejectedProjects > 0
                                                        ? Math.round((dashboardData.approvedProjects / (dashboardData.approvedProjects + dashboardData.rejectedProjects)) * 100)
                                                        : 0) + '%',
                                                    backgroundColor: '#10b981'
                                                }}></div>
                                            </div>
                                        </div>

                                        <div className={s.progressWrapper}>
                                            <div className={s.progressLabelRow}>
                                                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Tỉ lệ hoàn thành</span>
                                                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary-blue)' }}>
                                                    {dashboardData.approvedProjects + dashboardData.rejectedProjects + dashboardData.pendingProjects > 0
                                                        ? Math.round(((dashboardData.approvedProjects + dashboardData.rejectedProjects) / (dashboardData.approvedProjects + dashboardData.rejectedProjects + dashboardData.pendingProjects)) * 100)
                                                        : 0}%
                                                </span>
                                            </div>
                                            <div className={s.progressTrack}>
                                                <div className={s.progressFill} style={{
                                                    width: (dashboardData.approvedProjects + dashboardData.rejectedProjects + dashboardData.pendingProjects > 0
                                                        ? Math.round(((dashboardData.approvedProjects + dashboardData.rejectedProjects) / (dashboardData.approvedProjects + dashboardData.rejectedProjects + dashboardData.pendingProjects)) * 100)
                                                        : 0) + '%'
                                                }}></div>
                                            </div>
                                        </div>

                                        <div className={s.progressWrapper}>
                                            <div className={s.progressLabelRow}>
                                                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Tỉ lệ từ chối</span>
                                                <span style={{ fontSize: '14px', fontWeight: '700', color: '#ef4444' }}>
                                                    {dashboardData.approvedProjects + dashboardData.rejectedProjects > 0
                                                        ? Math.round((dashboardData.rejectedProjects / (dashboardData.approvedProjects + dashboardData.rejectedProjects)) * 100)
                                                        : 0}%
                                                </span>
                                            </div>
                                            <div className={s.progressTrack}>
                                                <div className={s.progressFill} style={{
                                                    width: (dashboardData.approvedProjects + dashboardData.rejectedProjects > 0
                                                        ? Math.round((dashboardData.rejectedProjects / (dashboardData.approvedProjects + dashboardData.rejectedProjects)) * 100)
                                                        : 0) + '%',
                                                    backgroundColor: '#ef4444'
                                                }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Summary Row */}
                            <div className={s.summaryGrid}>
                                <div className={s.summaryCard}>
                                    <div className={s.summaryIndicator} style={{ backgroundColor: '#f59e0b' }}></div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Briefcase size={16} color="#f59e0b" />
                                        <div className={s.summaryTitle}>Duyệt dự án</div>
                                    </div>
                                    <div className={s.summaryValue}>{dashboardData.pendingProjects}</div>
                                    <div className={s.summaryText}>
                                        {dashboardData.pendingProjects > 0
                                            ? `${dashboardData.pendingProjects} dự án đang chờ phê duyệt của bạn`
                                            : 'Không có dự án nào chờ xử lý'}
                                    </div>
                                </div>

                                <div className={s.summaryCard}>
                                    <div className={s.summaryIndicator} style={{ backgroundColor: 'var(--primary-blue)' }}></div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Users size={16} color="var(--primary-blue)" />
                                        <div className={s.summaryTitle}>Phân bổ người dùng</div>
                                    </div>
                                    <div className={s.summaryValue}>{dashboardData.pendingApprovals}</div>
                                    <div className={s.summaryText}>
                                        {dashboardData.pendingApprovals > 0
                                            ? `${dashboardData.pendingApprovals} yêu cầu chờ xác nhận`
                                            : 'Tất cả người dùng đã được phê duyệt'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Project Management Section (All statuses) */}
                {activeSection === 'project_management' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <div className={styles.cardHeader} style={{ marginBottom: '24px' }}>
                                <h3 className={styles.cardTitle} style={{ marginBottom: 0 }}>Quản lý dự án</h3>
                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    flexWrap: 'wrap'
                                }}>
                                    <button
                                        onClick={() => setProjectFilter('all')}
                                        className={projectFilter === 'all' ? styles.primaryBtn : styles.secondaryBtn}
                                        style={{ padding: '8px 20px', fontSize: '12px' }}
                                    >
                                        Tất cả ({(pendingProjects?.length || 0) + (approvedProjects?.length || 0) + (rejectedProjects?.length || 0)})
                                    </button>
                                    <button
                                        onClick={() => setProjectFilter('pending')}
                                        className={projectFilter === 'pending' ? styles.primaryBtn : styles.secondaryBtn}
                                        style={{ padding: '8px 20px', fontSize: '12px' }}
                                    >
                                        Chờ xử lý ({pendingProjects?.length || 0})
                                    </button>
                                    <button
                                        onClick={() => setProjectFilter('approved')}
                                        className={projectFilter === 'approved' ? styles.primaryBtn : styles.secondaryBtn}
                                        style={{ padding: '8px 20px', fontSize: '12px' }}
                                    >
                                        Đã duyệt ({approvedProjects?.length || 0})
                                    </button>
                                    <button
                                        onClick={() => setProjectFilter('rejected')}
                                        className={projectFilter === 'rejected' ? styles.primaryBtn : styles.secondaryBtn}
                                        style={{ padding: '8px 20px', fontSize: '12px' }}
                                    >
                                        Từ chối ({rejectedProjects?.length || 0})
                                    </button>
                                </div>
                            </div>

                            <div className={styles.list}>
                                {isLoadingProjects ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        ⏳ Đang tải danh sách dự án...
                                    </div>
                                ) : (
                                    [
                                        ...(projectFilter === 'all' || projectFilter === 'pending' ? (Array.isArray(pendingProjects) ? pendingProjects : []) : []),
                                        ...(projectFilter === 'all' || projectFilter === 'approved' ? (Array.isArray(approvedProjects) ? approvedProjects : []) : []),
                                        ...(projectFilter === 'all' || projectFilter === 'rejected' ? (Array.isArray(rejectedProjects) ? rejectedProjects : []) : [])
                                    ].length === 0 ? (
                                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                            Không có dự án nào trong mục này
                                        </div>
                                    ) : (
                                        [
                                            ...(projectFilter === 'all' || projectFilter === 'pending' ? (Array.isArray(pendingProjects) ? pendingProjects : []) : []),
                                            ...(projectFilter === 'all' || projectFilter === 'approved' ? (Array.isArray(approvedProjects) ? approvedProjects : []) : []),
                                            ...(projectFilter === 'all' || projectFilter === 'rejected' ? (Array.isArray(rejectedProjects) ? rejectedProjects : []) : [])
                                        ].map(project => (
                                            <div
                                                key={project?.projectId || Math.random()}
                                                className={s.projectCard}
                                                style={{ borderLeftColor: STATUS_COLORS[project?.status || 'Pending'] || '#ccc' }}
                                            >
                                                <div className={s.projectHeader}>
                                                    <div className={s.titleRow}>
                                                        <h4 className={s.projectTitle}>{project?.projectName || 'Dự án không tên'}</h4>
                                                        <span
                                                            className={s.statusBadge}
                                                            style={{
                                                                backgroundColor: `${STATUS_COLORS[project?.status || 'Pending']}25`,
                                                                color: STATUS_COLORS[project?.status || 'Pending'],
                                                                fontWeight: '600',
                                                                border: `1px solid ${STATUS_COLORS[project?.status || 'Pending']}40`
                                                            }}
                                                        >
                                                            {STATUS_LABELS[project?.status || 'Pending'] || 'Đang chờ duyệt'}
                                                        </span>
                                                    </div>
                                                    <p className={s.projectDesc}>{project?.shortDescription || '-'}</p>
                                                </div>

                                                <div className={s.tagContainer}>
                                                    <span className={s.metaTag}>
                                                        {project?.developmentStage === 0 ? 'Ý tưởng' : project?.developmentStage === 1 ? 'MVP' : project?.developmentStage === 'MVP' ? 'MVP' : 'Tăng trưởng'}
                                                    </span>
                                                </div>

                                                <div className={s.fieldRow}>
                                                    <span className={s.fieldLabel}>Vấn đề:</span>
                                                    <span className={s.fieldValue} title={project?.problemStatement || ''}>{project?.problemStatement || '-'}</span>
                                                </div>
                                                <div className={s.fieldRow}>
                                                    <span className={s.fieldLabel}>Giải pháp:</span>
                                                    <span className={s.fieldValue} title={project?.solutionDescription || ''}>{project?.solutionDescription || '-'}</span>
                                                </div>

                                                <div className={s.divider}></div>

                                                <div className={s.footer}>
                                                    <div className={s.metaInfo}>
                                                        📅 Nộp: {project?.createdAt ? new Date(project.createdAt).toLocaleDateString('vi-VN') : 'N/A'} | 👥 Đội: {project?.teamMembers?.toString() || '0'}
                                                    </div>
                                                    <div className={s.buttonGroup}>
                                                        <button
                                                            onClick={() => openDetailModal(project)}
                                                            className={styles.secondaryBtn}
                                                            style={{ minWidth: '100px' }}
                                                        >
                                                            Chi tiết
                                                        </button>
                                                        {project.status === 'Pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleRejectProject(project.projectId)}
                                                                    className={styles.dangerBtn}
                                                                    disabled={processingProjectId !== null}
                                                                    style={{
                                                                        opacity: processingProjectId !== null ? 0.6 : 1,
                                                                        cursor: processingProjectId !== null ? 'not-allowed' : 'pointer',
                                                                        minWidth: '100px'
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
                                                                        minWidth: '100px'
                                                                    }}
                                                                >
                                                                    {processingProjectId === project.projectId && processingAction === 'approve' ? (
                                                                        <Loader2 size={18} className={styles.spinner} />
                                                                    ) : (
                                                                        'Phê duyệt'
                                                                    )}
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Booking Management Section */}
                {activeSection === 'bookings' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <div className={styles.cardHeader} style={{ marginBottom: '24px' }}>
                                <h3 className={styles.cardTitle} style={{ marginBottom: 0 }}>Quản lý Booking</h3>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <button
                                        onClick={() => { setBookingFilters(''); setBookingPage(1); }}
                                        className={bookingFilters === '' ? styles.primaryBtn : styles.secondaryBtn}
                                        style={{ padding: '8px 20px', fontSize: '12px' }}
                                    >
                                        Tất cả ({allBookings.length})
                                    </button>
                                    <button
                                        onClick={() => { setBookingFilters('status:Pending'); setBookingPage(1); }}
                                        className={bookingFilters === 'status:Pending' ? styles.primaryBtn : styles.secondaryBtn}
                                        style={{ padding: '8px 20px', fontSize: '12px' }}
                                    >
                                        Chờ xác nhận ({pendingBookingsList.length})
                                    </button>
                                    <button
                                        onClick={() => { setBookingFilters('status:Confirmed'); setBookingPage(1); }}
                                        className={bookingFilters === 'status:Confirmed' ? styles.primaryBtn : styles.secondaryBtn}
                                        style={{ padding: '8px 20px', fontSize: '12px' }}
                                    >
                                        Đã xác nhận ({confirmedBookingsList.length})
                                    </button>
                                    <button
                                        onClick={() => { setBookingFilters('status:Completed'); setBookingPage(1); }}
                                        className={bookingFilters === 'status:Completed' ? styles.primaryBtn : styles.secondaryBtn}
                                        style={{ padding: '8px 20px', fontSize: '12px' }}
                                    >
                                        Hoàn thành ({completedBookingsList.length})
                                    </button>
                                </div>
                            </div>

                            {/* Booking List */}
                            <div className={styles.list}>
                                {isLoadingBookings ? (
                                    <div style={{
                                        padding: '60px 20px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--text-secondary)',
                                        gap: '16px'
                                    }}>
                                        <Loader2 className="animate-spin" size={28} color="var(--primary-blue)" />
                                        <span style={{ fontSize: '14px', fontWeight: '500' }}>Đang tải danh sách booking...</span>
                                    </div>
                                ) : paginatedBookings.length === 0 ? (
                                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        <Calendar size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                                        <p>Không có booking nào trong danh sách này.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {paginatedBookings.map((booking, index) => (
                                            <div key={`${booking?.id || index}-${index}`} className={s.bookingCard}>
                                                <div className={s.bookingMainInfo}>
                                                    <div className={s.bookingHeader} style={{ justifyContent: 'flex-start', gap: '8px' }}>
                                                        <span className={s.bookingTitle}>
                                                            #{booking?.id || '-'}
                                                        </span>
                                                        <div className={`${s.bookingBadge} ${booking?.status === 'Pending' ? s.bookingBadgePending :
                                                                booking?.status === 'Confirmed' ? s.bookingBadgeConfirmed :
                                                                    s.bookingBadgeCompleted
                                                            }`}>
                                                            {booking?.status === 'Pending' ? 'Chờ xác nhận' :
                                                                booking?.status === 'Confirmed' ? 'Đã xác nhận' : 'Hoàn thành'}
                                                        </div>
                                                    </div>

                                                    <div className={s.participantsRow}>
                                                        <span className={s.advisorText}>{booking?.advisorName || '-'}</span>
                                                        <div className={s.linkLine}>
                                                            <div className={s.line} />
                                                            <ArrowRight size={14} className={s.linkArrow} />
                                                        </div>
                                                        <span className={s.customerText}>{booking?.customerName || '-'}</span>
                                                    </div>

                                                    <div className={s.priceRow} style={{ marginTop: '-4px', marginBottom: '8px' }}>
                                                        <div className={s.priceTag}>
                                                            {Number(booking?.price || 0).toLocaleString('vi-VN')} <span>VND</span>
                                                        </div>
                                                    </div>

                                                    <div className={s.bookingFooterWrapper} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '16px' }}>
                                                        <div className={s.footerLeft} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                            <div className={s.metaRow} style={{ marginTop: 0, paddingTop: 0, borderTop: 'none', gap: '12px' }}>
                                                                <div className={s.metaItem}>
                                                                    <Calendar size={13} />
                                                                    <span>{booking?.startTime ? new Date(booking.startTime).toLocaleDateString('vi-VN') : '-'}</span>
                                                                </div>
                                                                <div className={s.metaItem}>
                                                                    <Clock size={13} />
                                                                    <span>{booking?.startTime ? new Date(booking.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                                                                </div>
                                                            </div>
                                                            <div className={s.bookingIdList} style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                                                                KHÁCH: <span style={{ color: 'var(--text-secondary)' }}>{booking?.customerName || '-'}</span> • CỐ VẤN: <span style={{ color: 'var(--text-secondary)' }}>{booking?.advisorName || '-'}</span>
                                                            </div>
                                                        </div>
                                                        <div className={s.bookingActions}>
                                                            <button
                                                                onClick={() => handleViewBookingDetails(booking?.id)}
                                                                className={styles.secondaryBtn}
                                                                style={{ padding: '6px 16px', fontSize: '13px', borderRadius: '99px' }}
                                                            >
                                                                Chi tiết
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {displayedBookings.length > 0 && (
                                <div style={{
                                    marginTop: '24px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingTop: '16px',
                                    borderTop: '1px solid var(--border-color)'
                                }}>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                        Trang <strong>{bookingPage}</strong> trên {Math.max(1, Math.ceil(displayedBookings.length / bookingPageSize))}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => setBookingPage(Math.max(1, bookingPage - 1))}
                                            disabled={bookingPage === 1}
                                            className={styles.secondaryBtn}
                                            style={{ padding: '6px 16px', opacity: bookingPage === 1 ? 0.5 : 1 }}
                                        >
                                            Trước
                                        </button>
                                        <button
                                            onClick={() => setBookingPage(Math.min(Math.ceil(displayedBookings.length / bookingPageSize), bookingPage + 1))}
                                            disabled={bookingPage >= Math.ceil(displayedBookings.length / bookingPageSize)}
                                            className={styles.secondaryBtn}
                                            style={{ padding: '6px 16px', opacity: bookingPage >= Math.ceil(displayedBookings.length / bookingPageSize) ? 0.5 : 1 }}
                                        >
                                            Sau
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Startup Approvals Section */}
                {activeSection === 'approvals' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>
                                Phê duyệt Startup
                                {dashboardData.pendingApprovals > 0 && (
                                    <span className={`${styles.badge} ${styles.badgeInfo}`} style={{ marginLeft: '12px' }}>
                                        {dashboardData.pendingApprovals} Chờ xử lý
                                    </span>
                                )}
                            </h3>

                            <div className={styles.list}>
                                {isLoadingStartups ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        <Loader2 size={24} className={styles.spinner} style={{ margin: '0 auto 12px' }} />
                                        <p>Đang tải dữ liệu...</p>
                                    </div>
                                ) : pendingStartups.length === 0 ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        <p>Chưa có yêu cầu phê duyệt Startup nào.</p>
                                    </div>
                                ) : pendingStartups.map(startup => (
                                    <div key={startup?.id || Math.random()} className={styles.listItem}>
                                        <div className={styles.listContent} style={{ width: '100%' }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <h4 className={styles.listTitle} style={{ margin: 0 }}>
                                                    {startup?.companyName || startup?.name || 'Công ty khởi nghiệp'}
                                                </h4>
                                                <span className={`${styles.badge} ${styles.badgePending}`}>
                                                    {startup?.industry || 'Chưa xác định'}
                                                </span>
                                            </div>
                                            <div className={styles.listMeta} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <span>Người đại diện: {startup?.founder || startup?.representName || 'Chưa cập nhật'}</span>
                                                <span>Email: {startup?.email || 'Chưa cập nhật'}</span>
                                                <span>Ngày đăng ký: {startup?.createdAt ? new Date(startup.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className={styles.listActions}>
                                            <button
                                                className={styles.primaryBtn}
                                                style={{ borderRadius: '99px', padding: '6px 16px', fontSize: '13px' }}
                                                onClick={() => handleApproveStartup(startup?.id)}
                                                disabled={processingProjectId === startup?.id}
                                            >
                                                Phê duyệt
                                            </button>
                                            <button
                                                className={styles.secondaryBtn}
                                                style={{ borderRadius: '99px', padding: '6px 16px', fontSize: '13px', color: 'var(--staff-danger)' }}
                                                onClick={() => handleRejectStartup(startup?.id, null)}
                                                disabled={processingProjectId === startup?.id}
                                            >
                                                Từ chối
                                            </button>
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
                                        <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Cố vấn</div>
                                            <div style={{ fontSize: '15px', fontWeight: '800', marginBottom: '6px', color: 'var(--text-primary)' }}>
                                                {selectedBooking.advisorName}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', padding: '4px 8px', backgroundColor: 'var(--bg-hover)', borderRadius: '6px', display: 'inline-block', fontFamily: 'monospace' }}>
                                                ID: {selectedBooking.advisorId}
                                            </div>
                                        </div>
                                        <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Khách hàng</div>
                                            <div style={{ fontSize: '15px', fontWeight: '800', marginBottom: '6px', color: 'var(--text-primary)' }}>
                                                {selectedBooking.customerName}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', padding: '4px 8px', backgroundColor: 'var(--bg-hover)', borderRadius: '6px', display: 'inline-block', fontFamily: 'monospace' }}>
                                                ID: {selectedBooking.customerId}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Time Info */}
                                    <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Calendar size={12} /> Bắt đầu
                                            </div>
                                            <div style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-primary)', fontWeight: '600' }}>
                                                {new Date(selectedBooking.startTime).toLocaleDateString('vi-VN')}
                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '400' }}>
                                                    {new Date(selectedBooking.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Clock size={12} /> Kết thúc
                                            </div>
                                            <div style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-primary)', fontWeight: '600' }}>
                                                {new Date(selectedBooking.endTime).toLocaleDateString('vi-VN')}
                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '400' }}>
                                                    {new Date(selectedBooking.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price Info */}
                                    <div style={{
                                        marginBottom: '24px',
                                        padding: '20px',
                                        backgroundColor: 'var(--bg-secondary)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border-color)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Chi phí tư vấn</div>
                                            <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--staff-warning)' }}>
                                                {Number(selectedBooking.price).toLocaleString('vi-VN')} <span style={{ fontSize: '14px', fontWeight: '600' }}>VND</span>
                                            </div>
                                        </div>
                                        <DollarSign size={32} style={{ opacity: 0.1, color: 'var(--staff-warning)' }} />
                                    </div>

                                    {/* Booking ID and Details */}
                                    <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Chi tiết hệ thống</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                                            <div>
                                                <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Mã tham chiếu:</span>
                                                <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'monospace' }}>{selectedBooking.id}</div>
                                            </div>
                                            <div>
                                                <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Trạng thái hiện tại:</span>
                                                <div className={`${s.bookingBadge} ${selectedBooking.status === 'Pending' ? s.bookingBadgePending :
                                                        selectedBooking.status === 'Confirmed' ? s.bookingBadgeConfirmed :
                                                            s.bookingBadgeCompleted
                                                    }`} style={{ display: 'inline-flex' }}>
                                                    {selectedBooking.status === 'Pending' ? <Clock size={12} /> : <CheckCircle size={12} />}
                                                    {selectedBooking.status === 'Pending' ? 'Chờ xác nhận' :
                                                        selectedBooking.status === 'Confirmed' ? 'Đã xác nhận' : 'Hoàn thành'}
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
