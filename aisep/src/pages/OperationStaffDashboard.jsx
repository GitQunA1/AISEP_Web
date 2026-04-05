import React, { useState, useEffect } from 'react';
import { FileCheck, CheckCircle, AlertCircle, Search, Archive, Users, Activity, Settings, Trash2, Download, Eye, ArrowRight, X, XCircle, FileText, Loader2, TrendingUp, ExternalLink, Shield, History, Calendar, PieChart, Briefcase, Clock, DollarSign } from 'lucide-react';
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
import userReportService from '../services/userReportService';
import AIEvaluationModal from '../components/common/AIEvaluationModal';
import { STATUS_COLORS, STATUS_LABELS, getStageLabel } from '../constants/ProjectStatus';
import AdvisorApprovalPage from '../components/advisor/AdvisorApprovalPage';

/**
 * ProjectKanbanCard - Single card for the Kanban board
 */
const ProjectKanbanCard = ({ project, status, onDetail, onApprove, onReject, processingProjectId, processingAction }) => {
    // Determine development stage label and class
    const getDevStageTag = (stage) => {
        if (stage === 0 || stage === 'Idea') return { label: 'Ý tưởng', class: local.btagIdea };
        if (stage === 1 || stage === 'MVP') return { label: 'MVP', class: local.btagMvp };
        return { label: 'Tăng trưởng', class: local.btagGrowth };
    };

    const stageInfo = getDevStageTag(project?.developmentStage);
    const teamSize = project?.teamMembers?.toString().split(',').length || 0;
    const teamMembers = project?.teamMembers?.toString().split(',') || [];

    // Helper for mini avatars
    const avaClasses = [local.maB, local.maP, local.maG, local.maPk, local.maO];

    return (
        <div className={local.bcard}>
            <div className={`${local.bcardStrip} ${local[status]}`}></div>
            <div className={local.bcardBody}>
                <div className={local.bcardRow1}>
                    <div className={local.bcardMainInfo}>
                        <div className={local.bcardName} title={project?.projectName}>
                            {project?.projectName || 'Dự án không tên'}
                        </div>
                        <span className={`${local.btag} ${stageInfo.class}`}>{stageInfo.label}</span>
                    </div>
                    <div className={local.bcardTime}>
                        {project?.createdAt ? new Date(project.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </div>
                </div>

                <p className={local.bcardDesc}>{project?.shortDescription || '-'}</p>

                <div className={local.bcardFields}>
                    <div className={local.bf}>
                        <div className={local.bfKey}>Vấn đề</div>
                        <div className={local.bfVal} title={project?.problemStatement}>{project?.problemStatement || '-'}</div>
                    </div>
                    <div className={local.bf}>
                        <div className={local.bfKey}>Giải pháp</div>
                        <div className={local.bfVal} title={project?.solutionDescription}>{project?.solutionDescription || '-'}</div>
                    </div>
                </div>

                <div className={local.bcardTeam}>
                    {teamMembers.slice(0, 3).map((name, i) => (
                        <div
                            key={i}
                            className={`${local.miniAva} ${avaClasses[i % avaClasses.length]}`}
                            style={i > 0 ? { marginLeft: '-8px', border: '2px solid var(--bg-primary)' } : {}}
                            title={name.trim()}
                        >
                            {name.trim().charAt(0).toUpperCase()}
                        </div>
                    ))}
                    {teamSize > 3 && <span>+{teamSize - 3} thành viên</span>}
                    {teamSize <= 3 && teamSize > 0 && <span>{teamSize} thành viên</span>}
                </div>

                <div className={local.bcardActions}>
                    <button className={local.baBtn} onClick={onDetail} title="Chi tiết">
                        <ArrowRight size={16} />
                        Chi tiết
                    </button>

                    {status === 'pend' && (
                        <>
                            <button
                                className={`${local.baBtn} ${local.rej} ${processingProjectId !== null ? local.btnDisabled : ''}`}
                                onClick={onReject}
                                disabled={processingProjectId !== null}
                                title="Từ chối"
                            >
                                {processingProjectId === project.projectId && processingAction === 'reject' ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <XCircle size={16} />
                                )}
                                Từ chối
                            </button>
                            <button
                                className={`${local.baBtn} ${local.apr} ${processingProjectId !== null ? local.btnDisabled : ''}`}
                                onClick={onApprove}
                                disabled={processingProjectId !== null}
                                title="Phê duyệt"
                            >
                                {processingProjectId === project.projectId && processingAction === 'approve' ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <CheckCircle size={16} />
                                )}
                                Duyệt
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * BookingKanbanCard - Single card for the Booking Kanban board
 */
const BookingKanbanCard = ({ booking, status, onDetail }) => {
    // Generate an alias dynamically based on status mapping
    // map status from 'pend', 'conf', 'comp'
    let statusLabel = 'Chờ xác nhận';
    let localStatus = status; // To map API status names to CSS classes

    if (status === 'conf' || status === 'Confirmed') {
        statusLabel = 'Đã xác nhận';
        localStatus = 'conf';
    } else if (status === 'comp' || status === 'Completed') {
        statusLabel = 'Hoàn thành';
        localStatus = 'comp';
    } else if (status === 'canc' || status === 'Cancel' || status === 'Cancelled') {
        statusLabel = 'Đã hủy';
        localStatus = 'rej'; // Re-use the rejected/red CSS class from projects
    } else {
        localStatus = 'pend';
    }

    return (
        <div className={local.bcard}>
            <div className={`${local.bcardStrip} ${local[localStatus]}`}></div>
            <div className={local.bcardBody}>
                <div className={local.bcardRow1}>
                    <div className={local.bcardMainInfo}>
                        <div className={local.bcardName} style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-secondary)' }} title={`#${booking?.id || '-'}`}>
                            #{booking?.id || '-'}
                        </div>
                        <span className={`${local.btag}`} style={{
                            background: localStatus === 'pend' ? 'rgba(255, 122, 0, 0.1)' : localStatus === 'conf' ? 'rgba(29, 155, 240, 0.1)' : localStatus === 'comp' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 33, 46, 0.1)',
                            color: localStatus === 'pend' ? '#ff7a00' : localStatus === 'conf' ? '#1d9bf0' : localStatus === 'comp' ? '#10b981' : '#f4212e'
                        }}>
                            {statusLabel}
                        </span>
                    </div>
                </div>

                <div style={{ marginTop: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', fontWeight: '800' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', width: '50px', flexShrink: 0, textTransform: 'uppercase' }}>Cố vấn</span>
                            <span style={{
                                color: localStatus === 'pend' ? '#ff7a00' : localStatus === 'conf' ? '#1d9bf0' : localStatus === 'comp' ? '#10b981' : '#f4212e',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                            }}>
                                {booking?.advisorName || 'N/A'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', width: '50px', flexShrink: 0, textTransform: 'uppercase' }}>Khách</span>
                            <span style={{
                                color: localStatus === 'pend' ? '#ff7a00' : localStatus === 'conf' ? '#1d9bf0' : localStatus === 'comp' ? '#10b981' : '#f4212e',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                            }}>
                                {booking?.customerName || 'N/A'}
                            </span>
                        </div>
                    </div>

                    <div style={{ marginTop: '12px', fontSize: '14px', fontWeight: '700', color: '#f59e0b' }}>
                        {Number(booking?.price || 0).toLocaleString('vi-VN')} <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>VND</span>
                    </div>
                </div>

                <div className={local.bcardFields} style={{ gridTemplateColumns: '1fr', gap: '6px', marginBottom: '8px' }}>
                    <div className={local.bf} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <Calendar size={13} style={{ flexShrink: 0 }} />
                        <span style={{ whiteSpace: 'nowrap' }}>{booking?.startTime ? new Date(booking.startTime).toLocaleDateString('vi-VN') : '-'}</span>
                        <Clock size={13} style={{ marginLeft: '4px', flexShrink: 0 }} />
                        <span style={{ whiteSpace: 'nowrap' }}>{booking?.startTime ? new Date(booking.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                    </div>
                </div>

                <div className={local.bcardActions} style={{ gridTemplateColumns: '1fr', marginTop: 'auto' }}>
                    <button className={local.baBtn} style={{ marginLeft: 'auto', padding: '6px 16px' }} onClick={onDetail} title="Chi tiết">
                        Chi tiết
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * KanbanSkeleton - Shimmering loading placeholder
 */
const KanbanSkeleton = ({ count = 3 }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px 0' }}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={local.skeletonCard}>
                    <div className={local.shimmer}></div>
                    <div className={local.skTitle}></div>
                    <div className={local.skDesc}></div>
                    <div className={local.skDesc} style={{ width: '70%' }}></div>
                    <div className={local.skTags}>
                        <div className={local.skTag}></div>
                        <div className={local.skTag}></div>
                    </div>
                    <div className={local.skBottom}></div>
                </div>
            ))}
        </div>
    );
};

/**
 * EmptyState - Reusable empty or error view
 */
const EmptyState = ({ icon: Icon, title, message, onRetry, isError = false }) => {
    return (
        <div className={local.emptyStateContainer}>
            <div className={local.emptyStateIcon}>
                <Icon size={48} strokeWidth={1.5} color={isError ? '#f4212e' : 'var(--text-muted)'} />
            </div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>{title}</h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '280px', lineHeight: '1.5' }}>{message}</p>
            {onRetry && (
                <button className={local.retryBtn} onClick={onRetry}>
                    Thử lại
                </button>
            )}
        </div>
    );
};


/**
 * OperationStaffDashboard - Dashboard for Operation Staff
 * Features: Document verification, User approvals, Activity monitoring, Request management
 */
function OperationStaffDashboard({ user, initialSection = 'statistics' }) {
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
    const [searchTerm, setSearchTerm] = useState('');

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
    const [bookingSearchTerm, setBookingSearchTerm] = useState('');
    const [activeMobileBookingTab, setActiveMobileBookingTab] = useState('pend'); // 'pend', 'conf', 'comp'
    const [bookingsError, setBookingsError] = useState(null);
    const [projectsError, setProjectsError] = useState(null);

    // User Reports state
    const [userReports, setUserReports] = useState([]);
    const [isLoadingUserReports, setIsLoadingUserReports] = useState(false);
    const [userReportsError, setUserReportsError] = useState(null);

    // Mobile States
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
    const [activeMobileTab, setActiveMobileTab] = useState('pend'); // 'pend', 'appr', 'rej'

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const [bookingPageSize, setBookingPageSize] = useState(10);
    const [allBookings, setAllBookings] = useState([]);

    // Project Management Filtering
    const [projectFilter, setProjectFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'

    // Booking Detail Modal state
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isLoadingBookingDetail, setIsLoadingBookingDetail] = useState(false);

    const filterBookings = (list) => {
        if (!bookingSearchTerm || !bookingSearchTerm.trim()) return list || [];
        const lowerSearch = bookingSearchTerm.toLowerCase();
        return (list || []).filter(b =>
            b.advisorName?.toLowerCase().includes(lowerSearch) ||
            b.customerName?.toLowerCase().includes(lowerSearch) ||
            b.id?.toString().toLowerCase().includes(lowerSearch)
        );
    };

    // Derived booking lists
    const pendingBookingsList = filterBookings(allBookings.filter(b => b.status === 'Pending'));
    const confirmedBookingsList = filterBookings(allBookings.filter(b => b.status === 'Confirmed'));
    const completedBookingsList = filterBookings(allBookings.filter(b => b.status === 'Completed'));
    const cancelledBookingsList = filterBookings(allBookings.filter(b => b.status === 'Cancel' || b.status === 'Cancelled'));

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

    // Mobile Tab Scroll Tracking
    const tabSwitcherRef = React.useRef(null);
    const [showLeftTabIndicator, setShowLeftTabIndicator] = useState(false);
    const [showRightTabIndicator, setShowRightTabIndicator] = useState(false);

    const checkTabScroll = () => {
        if (tabSwitcherRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = tabSwitcherRef.current;
            setShowLeftTabIndicator(scrollLeft > 10);
            setShowRightTabIndicator(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    // Check scroll on mount, section change, or data change
    useEffect(() => {
        if (activeSection === 'bookings' && isMobile) {
            // Need a slight delay to ensure DOM is updated and widths are calculated
            const timer = setTimeout(checkTabScroll, 100);
            window.addEventListener('resize', checkTabScroll);
            return () => {
                clearTimeout(timer);
                window.removeEventListener('resize', checkTabScroll);
            };
        }
    }, [activeSection, isMobile, activeMobileBookingTab, pendingBookingsList.length, confirmedBookingsList.length, completedBookingsList.length, cancelledBookingsList.length]);

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
        setBookingsError(null);
        try {
            // Fetch all bookings at once for client-side filtering and counting
            const response = await bookingService.getAllBookings('', '', 1, 100);
            if (response && response.items) {
                setAllBookings(response.items || []);
            } else {
                setBookingsError('Không thể tải dữ liệu booking. Vui lòng thử lại sau.');
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setBookingsError('Lỗi kết nối máy chủ hoặc API không phản hồi.');
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

    const fetchPendingProjects = async () => {
        setIsLoadingProjects(true);
        setProjectsError(null);
        try {
            const response = await projectSubmissionService.getPendingProjects();
            if (response.success && response.data) {
                const projects = response.data.items || [];
                setPendingProjects(projects);
            } else {
                setProjectsError('Không thể tải danh sách dự án chờ xử lý.');
            }
        } catch (error) {
            console.error('Error fetching pending projects:', error);
            setProjectsError('Lỗi kết nối máy chủ khi tải dự án.');
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

    // Tự động tải dữ liệu cần thiết cho Statistics và các tab chính ngay khi component khởi tập (Mounting).
    // Giúp hiển thị số liệu thực ngay ở tab Tổng quan thay vì số 0.
    React.useEffect(() => {
        const loadInitialData = () => {
            fetchPendingProjects();
            fetchApprovedProjects();
            fetchRejectedProjects();
            fetchBookings();
            fetchPendingStartups();
            fetchUserReports();
        };
        loadInitialData();
    }, []);

    // Refresh dữ liệu khi người dùng chủ động chuyển tab (nếu cần cập nhật mới nhất)
    React.useEffect(() => {
        if (activeSection === 'project_management') {
            fetchPendingProjects();
            fetchApprovedProjects();
            fetchRejectedProjects();
        } else if (activeSection === 'bookings') {
            fetchBookings();
        } else if (activeSection === 'approvals') {
            fetchPendingStartups();
        } else if (activeSection === 'user_reports') {
            fetchUserReports();
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
                const projectToMove = pendingProjects.find(p => p.projectId === projectId);
                if (projectToMove) {
                    setApprovedProjects([{ ...projectToMove, status: 'Approved' }, ...approvedProjects]);
                    setPendingProjects(pendingProjects.filter(p => p.projectId !== projectId));
                }
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
                const projectToMove = pendingProjects.find(p => p.projectId === projectId);
                if (projectToMove) {
                    setRejectedProjects([{ ...projectToMove, status: 'Rejected' }, ...rejectedProjects]);
                    setPendingProjects(pendingProjects.filter(p => p.projectId !== projectId));
                }
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

    const fetchUserReports = async () => {
        setIsLoadingUserReports(true);
        setUserReportsError(null);
        try {
            const response = await userReportService.getAllReports();
            setUserReports(response || []);
        } catch (error) {
            console.error('Error fetching user reports:', error);
            setUserReportsError('Không thể tải danh sách báo cáo vi phạm.');
        } finally {
            setIsLoadingUserReports(false);
        }
    };

    const handleResolveReport = async (reportId, isValid) => {
        if (processingProjectId === reportId) return;
        setProcessingProjectId(reportId);
        try {
            if (isValid) {
                await userReportService.resolveValid(reportId);
            } else {
                await userReportService.resolveFalse(reportId);
            }
            setModalType('success');
            setModalMessage(isValid ? '✓ Đã xác nhận báo cáo hợp lệ!' : '✓ Đã xác nhận báo cáo sai lệch!');
            setShowModal(true);
            fetchUserReports();
        } catch (error) {
            console.error('Error resolving report:', error);
            setModalType('error');
            setModalMessage('❌ Lỗi: ' + (error?.message || 'Không thể xử lý báo cáo'));
            setShowModal(true);
        } finally {
            setProcessingProjectId(null);
        }
    };

    const filterProjects = (projects) => {
        if (!searchTerm || !searchTerm.trim()) return projects || [];
        const lowerSearch = searchTerm.toLowerCase();
        return (projects || []).filter(p =>
            p.projectName?.toLowerCase().includes(lowerSearch) ||
            p.companyName?.toLowerCase().includes(lowerSearch) ||
            p.startupName?.toLowerCase().includes(lowerSearch) ||
            p.shortDescription?.toLowerCase().includes(lowerSearch)
        );
    };

    const filteredPending = filterProjects(pendingProjects);
    const filteredApproved = filterProjects(approvedProjects);
    const filteredRejected = filterProjects(rejectedProjects);

    return (
        <div className={styles.container}>
            {/* Unified Header */}
            <FeedHeader
                title="Bảng điều khiển Nhân viên vận hành"
                subtitle={`Xin chào, ${user?.name || 'Nhân viên'}! Quản lý hoạt động nền tảng và các yêu cầu phê duyệt.`}
                showFilter={false}
                user={user}
                searchTerm={activeSection === 'project_management' ? searchTerm : (activeSection === 'bookings' ? bookingSearchTerm : '')}
                onSearchChange={activeSection === 'project_management' ? setSearchTerm : (activeSection === 'bookings' ? setBookingSearchTerm : null)}
                searchPlaceholder={activeSection === 'project_management' ? "Tìm kiếm dự án..." : (activeSection === 'bookings' ? "Tìm kiếm booking..." : "Tìm kiếm...")}
            />



            {/* Navigation Tabs (Only for main statistics/analytics/activity) */}
            {['statistics', 'analytics', 'activity'].includes(activeSection) && (
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
                    <button
                        className={`${styles.tab} ${activeSection === 'activity' ? styles.active : ''}`}
                        onClick={() => setActiveSection('activity')}
                    >
                        Giám sát hoạt động
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
                {/* Project Management Kanban Board */}
                {activeSection === 'project_management' && (
                    <div className={styles.section} style={{ background: 'transparent', boxShadow: 'none', padding: 0, gap: 0 }}>

                        {/* Mobile Tab Switcher */}
                        {isMobile && (
                            <div className={local.mobileTabSwitcher}>
                                <button
                                    className={`${local.mobileTab} ${activeMobileTab === 'pend' ? local.activeMobileTab : ''}`}
                                    onClick={() => setActiveMobileTab('pend')}
                                    data-status="pend"
                                >
                                    <div className={`${local.bctDot} ${local.pend}`}></div>
                                    <span>Chờ Xử Lý</span>
                                    <span className={local.mobileTabCount}>{filteredPending.length}</span>
                                </button>
                                <button
                                    className={`${local.mobileTab} ${activeMobileTab === 'appr' ? local.activeMobileTab : ''}`}
                                    onClick={() => setActiveMobileTab('appr')}
                                    data-status="appr"
                                >
                                    <div className={`${local.bctDot} ${local.appr}`}></div>
                                    <span>Đã Duyệt</span>
                                    <span className={local.mobileTabCount}>{filteredApproved.length}</span>
                                </button>
                                <button
                                    className={`${local.mobileTab} ${activeMobileTab === 'rej' ? local.activeMobileTab : ''}`}
                                    onClick={() => setActiveMobileTab('rej')}
                                    data-status="rej"
                                >
                                    <div className={`${local.bctDot} ${local.rej}`}></div>
                                    <span>Từ Chối</span>
                                    <span className={local.mobileTabCount}>{filteredRejected.length}</span>
                                </button>
                            </div>
                        )}

                        {projectsError ? (
                            <div className={local.errorWrapper}>
                                <EmptyState
                                    icon={AlertCircle}
                                    title="Lỗi tải dữ liệu"
                                    message={projectsError}
                                    isError={true}
                                    onRetry={() => {
                                        setProjectsError(null);
                                        fetchPendingProjects();
                                        fetchApprovedProjects();
                                        fetchRejectedProjects();
                                    }}
                                />
                            </div>
                        ) : (
                            <div className={local.boardGrid}>
                                {/* Pending Column */}
                                {(!isMobile || activeMobileTab === 'pend') && (
                                    <div className={local.bcol}>
                                        {!isMobile && (
                                            <div className={`${local.bcolHead} ${local.pend}`}>
                                                <div className={local.bcolTitle}>
                                                    <div className={`${local.bctDot} ${local.pend}`}></div>
                                                    Chờ Xử Lý
                                                </div>
                                                <div className={`${local.bcolN} ${local.pend}`}>{filteredPending.length}</div>
                                            </div>
                                        )}
                                        <div className={local.bcolCards}>
                                            {isLoadingProjects ? (
                                                <KanbanSkeleton count={3} />
                                            ) : (filteredPending.length === 0 ? (
                                                <EmptyState
                                                    icon={searchTerm ? Search : Archive}
                                                    title={searchTerm ? "Không tìm thấy" : "Trống"}
                                                    message={searchTerm ? `Không tìm thấy dự án nào khớp với "${searchTerm}"` : 'Không có dự án chờ xử lý'}
                                                />
                                            ) : (
                                                filteredPending.map(project => (
                                                    <ProjectKanbanCard
                                                        key={project.projectId}
                                                        project={project}
                                                        status="pend"
                                                        onDetail={() => openDetailModal(project)}
                                                        onApprove={() => handleApproveProject(project.projectId)}
                                                        onReject={() => handleRejectProject(project.projectId)}
                                                        processingProjectId={processingProjectId}
                                                        processingAction={processingAction}
                                                    />
                                                ))
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Approved Column */}
                                {(!isMobile || activeMobileTab === 'appr') && (
                                    <div className={local.bcol}>
                                        {!isMobile && (
                                            <div className={`${local.bcolHead} ${local.appr}`}>
                                                <div className={local.bcolTitle}>
                                                    <div className={`${local.bctDot} ${local.appr}`}></div>
                                                    Đã Duyệt
                                                </div>
                                                <div className={`${local.bcolN} ${local.appr}`}>{filteredApproved.length}</div>
                                            </div>
                                        )}
                                        <div className={local.bcolCards}>
                                            {isLoadingProjects ? (
                                                <KanbanSkeleton count={2} />
                                            ) : (filteredApproved.length === 0 ? (
                                                <EmptyState
                                                    icon={searchTerm ? Search : Archive}
                                                    title={searchTerm ? "Không tìm thấy" : "Trống"}
                                                    message={searchTerm ? `Không tìm thấy dự án nào khớp với "${searchTerm}"` : 'Chưa có dự án nào được duyệt'}
                                                />
                                            ) : (
                                                filteredApproved.map(project => (
                                                    <ProjectKanbanCard
                                                        key={project.projectId}
                                                        project={project}
                                                        status="appr"
                                                        onDetail={() => openDetailModal(project)}
                                                    />
                                                ))
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Rejected Column */}
                                {(!isMobile || activeMobileTab === 'rej') && (
                                    <div className={local.bcol}>
                                        {!isMobile && (
                                            <div className={`${local.bcolHead} ${local.rej}`}>
                                                <div className={local.bcolTitle}>
                                                    <div className={`${local.bctDot} ${local.rej}`}></div>
                                                    Từ Chối
                                                </div>
                                                <div className={`${local.bcolN} ${local.rej}`}>{filteredRejected.length}</div>
                                            </div>
                                        )}
                                        <div className={local.bcolCards}>
                                            {isLoadingProjects ? (
                                                <KanbanSkeleton count={1} />
                                            ) : (filteredRejected.length === 0 ? (
                                                <EmptyState
                                                    icon={searchTerm ? Search : Archive}
                                                    title={searchTerm ? "Không tìm thấy" : "Trống"}
                                                    message={searchTerm ? `Không tìm thấy dự án nào khớp với "${searchTerm}"` : 'Chưa có dự án nào bị từ chối'}
                                                />
                                            ) : (
                                                filteredRejected.map(project => (
                                                    <ProjectKanbanCard
                                                        key={project.projectId}
                                                        project={project}
                                                        status="rej"
                                                        onDetail={() => openDetailModal(project)}
                                                    />
                                                ))
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}


                {/* Booking Management Section */}
                {activeSection === 'bookings' && (
                    <div className={styles.section} style={{ background: 'transparent', boxShadow: 'none', padding: 0, gap: 0 }}>

                        {/* Mobile Tab Switcher for Bookings */}
                        {isMobile && (
                            <div className={local.tabSwitcherWrapper}>
                                {showLeftTabIndicator && <div className={`${local.scrollIndicator} ${local.scrollIndicatorLeft}`} />}
                                <div
                                    className={local.mobileTabSwitcher}
                                    data-tabs="4"
                                    ref={tabSwitcherRef}
                                    onScroll={checkTabScroll}
                                >
                                    <button
                                        className={`${local.mobileTab} ${activeMobileBookingTab === 'pend' ? local.activeMobileTab : ''}`}
                                        onClick={() => setActiveMobileBookingTab('pend')}
                                        data-status="pend"
                                    >
                                        <div className={`${local.bctDot} ${local.pend}`}></div>
                                        <span>Chờ xác nhận</span>
                                        <span className={local.mobileTabCount}>{pendingBookingsList.length}</span>
                                    </button>
                                    <button
                                        className={`${local.mobileTab} ${activeMobileBookingTab === 'conf' ? local.activeMobileTab : ''}`}
                                        onClick={() => setActiveMobileBookingTab('conf')}
                                        data-status="conf"
                                    >
                                        <div className={`${local.bctDot} ${local.conf}`}></div>
                                        <span>Đã xác nhận</span>
                                        <span className={local.mobileTabCount}>{confirmedBookingsList.length}</span>
                                    </button>
                                    <button
                                        className={`${local.mobileTab} ${activeMobileBookingTab === 'comp' ? local.activeMobileTab : ''}`}
                                        onClick={() => setActiveMobileBookingTab('comp')}
                                        data-status="comp"
                                    >
                                        <div className={`${local.bctDot} ${local.comp}`}></div>
                                        <span>Hoàn thành</span>
                                        <span className={local.mobileTabCount}>{completedBookingsList.length}</span>
                                    </button>
                                    <button
                                        className={`${local.mobileTab} ${activeMobileBookingTab === 'canc' ? local.activeMobileTab : ''}`}
                                        onClick={() => setActiveMobileBookingTab('canc')}
                                        data-status="rej"
                                    >
                                        <div className={`${local.bctDot} ${local.rej}`}></div>
                                        <span>Đã hủy</span>
                                        <span className={local.mobileTabCount}>{cancelledBookingsList.length}</span>
                                    </button>
                                </div>
                                {showRightTabIndicator && <div className={`${local.scrollIndicator} ${local.scrollIndicatorRight}`} />}
                            </div>
                        )}

                        {bookingsError ? (
                            <div className={local.errorWrapper}>
                                <EmptyState
                                    icon={AlertCircle}
                                    title="Lỗi tải dữ liệu"
                                    message={bookingsError}
                                    isError={true}
                                    onRetry={() => {
                                        setBookingsError(null);
                                        fetchBookings();
                                    }}
                                />
                            </div>
                        ) : (
                            <div className={local.boardGrid} style={{
                                gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
                                minHeight: isMobile ? 'auto' : 'calc(100vh - 150px)',
                                overflowX: isMobile ? 'hidden' : 'auto',
                                margin: isMobile ? '0' : '-24px -24px -84px -24px'
                            }}>
                                {/* Pending Bookings Column */}
                                {(!isMobile || activeMobileBookingTab === 'pend') && (
                                    <div className={local.bcol}>
                                        {!isMobile && (
                                            <div className={`${local.bcolHead} ${local.pend}`}>
                                                <div className={local.bcolTitle}>
                                                    <div className={`${local.bctDot} ${local.pend}`}></div>
                                                    Chờ xác nhận
                                                </div>
                                                <div className={`${local.bcolN} ${local.pend}`}>{pendingBookingsList.length}</div>
                                            </div>
                                        )}
                                        <div className={local.bcolCards}>
                                            {isLoadingBookings ? (
                                                <KanbanSkeleton count={3} />
                                            ) : (pendingBookingsList.length === 0 ? (
                                                <EmptyState
                                                    icon={bookingSearchTerm ? Search : Archive}
                                                    title={bookingSearchTerm ? "Không tìm thấy" : "Trống"}
                                                    message={bookingSearchTerm ? `Không tìm thấy booking nào khớp với "${bookingSearchTerm}"` : 'Không có booking chờ xác nhận'}
                                                />
                                            ) : (
                                                pendingBookingsList.map(booking => (
                                                    <BookingKanbanCard
                                                        key={booking.id}
                                                        booking={booking}
                                                        status="pend"
                                                        onDetail={() => handleViewBookingDetails(booking.id)}
                                                    />
                                                ))
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Confirmed Bookings Column */}
                                {(!isMobile || activeMobileBookingTab === 'conf') && (
                                    <div className={local.bcol}>
                                        {!isMobile && (
                                            <div className={`${local.bcolHead} ${local.conf}`}>
                                                <div className={local.bcolTitle}>
                                                    <div className={`${local.bctDot} ${local.conf}`}></div>
                                                    Đã xác nhận
                                                </div>
                                                <div className={`${local.bcolN} ${local.conf}`}>{confirmedBookingsList.length}</div>
                                            </div>
                                        )}
                                        <div className={local.bcolCards}>
                                            {isLoadingBookings ? (
                                                <KanbanSkeleton count={2} />
                                            ) : (confirmedBookingsList.length === 0 ? (
                                                <EmptyState
                                                    icon={bookingSearchTerm ? Search : Archive}
                                                    title={bookingSearchTerm ? "Không tìm thấy" : "Trống"}
                                                    message={bookingSearchTerm ? `Không tìm thấy booking nào khớp with "${bookingSearchTerm}"` : 'Chưa có booking nào được xác nhận'}
                                                />
                                            ) : (
                                                confirmedBookingsList.map(booking => (
                                                    <BookingKanbanCard
                                                        key={booking.id}
                                                        booking={booking}
                                                        status="conf"
                                                        onDetail={() => handleViewBookingDetails(booking.id)}
                                                    />
                                                ))
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Completed Bookings Column */}
                                {(!isMobile || activeMobileBookingTab === 'comp') && (
                                    <div className={local.bcol}>
                                        {!isMobile && (
                                            <div className={`${local.bcolHead} ${local.comp}`}>
                                                <div className={local.bcolTitle}>
                                                    <div className={`${local.bctDot} ${local.comp}`}></div>
                                                    Hoàn thành
                                                </div>
                                                <div className={`${local.bcolN} ${local.comp}`}>{completedBookingsList.length}</div>
                                            </div>
                                        )}
                                        <div className={local.bcolCards}>
                                            {isLoadingBookings ? (
                                                <KanbanSkeleton count={4} />
                                            ) : (completedBookingsList.length === 0 ? (
                                                <EmptyState
                                                    icon={bookingSearchTerm ? Search : Archive}
                                                    title={bookingSearchTerm ? "Không tìm thấy" : "Trống"}
                                                    message={bookingSearchTerm ? `Không tìm thấy booking nào khớp with "${bookingSearchTerm}"` : 'Chưa có booking nào hoàn thành'}
                                                />
                                            ) : (
                                                completedBookingsList.map(booking => (
                                                    <BookingKanbanCard
                                                        key={booking.id}
                                                        booking={booking}
                                                        status="comp"
                                                        onDetail={() => handleViewBookingDetails(booking.id)}
                                                    />
                                                ))
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Cancelled Bookings Column */}
                                {(!isMobile || activeMobileBookingTab === 'canc') && (
                                    <div className={local.bcol}>
                                        {!isMobile && (
                                            <div className={`${local.bcolHead} ${local.rej}`}>
                                                <div className={local.bcolTitle}>
                                                    <div className={`${local.bctDot} ${local.rej}`}></div>
                                                    Đã hủy
                                                </div>
                                                <div className={`${local.bcolN} ${local.rej}`}>{cancelledBookingsList.length}</div>
                                            </div>
                                        )}
                                        <div className={local.bcolCards}>
                                            {isLoadingBookings ? (
                                                <KanbanSkeleton count={1} />
                                            ) : (cancelledBookingsList.length === 0 ? (
                                                <EmptyState
                                                    icon={bookingSearchTerm ? Search : Archive}
                                                    title={bookingSearchTerm ? "Không tìm thấy" : "Trống"}
                                                    message={bookingSearchTerm ? `Không tìm thấy booking nào khớp with "${bookingSearchTerm}"` : 'Không có booking nào bị hủy'}
                                                />
                                            ) : (
                                                cancelledBookingsList.map(booking => (
                                                    <BookingKanbanCard
                                                        key={booking.id}
                                                        booking={booking}
                                                        status="canc"
                                                        onDetail={() => handleViewBookingDetails(booking.id)}
                                                    />
                                                ))
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
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
                                                className={`${styles.primaryBtn} ${processingProjectId !== null ? local.btnDisabled : ''}`}
                                                style={{ borderRadius: '99px', padding: '6px 16px', fontSize: '13px' }}
                                                onClick={() => handleApproveStartup(startup?.id)}
                                                disabled={processingProjectId !== null}
                                            >
                                                Phê duyệt
                                            </button>
                                            <button
                                                className={`${styles.secondaryBtn} ${processingProjectId !== null ? local.btnDisabled : ''}`}
                                                style={{ borderRadius: '99px', padding: '6px 16px', fontSize: '13px', color: 'var(--staff-danger)' }}
                                                onClick={() => handleRejectStartup(startup?.id, null)}
                                                disabled={processingProjectId !== null}
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

                {/* User Reports Section */}
                {activeSection === 'user_reports' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>
                                Quản lý báo cáo vi phạm
                                {userReports.filter(r => r.status === 'Pending').length > 0 && (
                                    <span className={`${styles.badge} ${styles.badgeInfo}`} style={{ marginLeft: '12px' }}>
                                        {userReports.filter(r => r.status === 'Pending').length} Chờ xử lý
                                    </span>
                                )}
                            </h3>

                            {isLoadingUserReports ? (
                                <div style={{ padding: '40px', textAlign: 'center' }}>
                                    <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 16px', color: 'var(--primary-blue)' }} />
                                    <p style={{ color: 'var(--text-secondary)' }}>Đang tải danh sách báo cáo...</p>
                                </div>
                            ) : userReportsError ? (
                                <EmptyState icon={AlertCircle} title="Lỗi" message={userReportsError} onRetry={fetchUserReports} isError />
                            ) : userReports.length === 0 ? (
                                <EmptyState icon={Shield} title="Trống" message="Hiện không có báo cáo vi phạm nào cần xử lý." />
                            ) : (
                                <div className={styles.list}>
                                    {userReports.map(report => (
                                        <div key={report.userReportId} className={styles.listItem} style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '24px', gap: '16px' }}>
                                            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div style={{ display: 'flex', gap: '12px' }}>
                                                    <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(244, 33, 46, 0.1)', color: '#f4212e' }}>
                                                        <AlertCircle size={24} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>{report.category}</div>
                                                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                                            Người báo cáo: <strong>{report.reporterName}</strong> | 
                                                            {report.targetUserName && <> Đối tượng: <strong>{report.targetUserName}</strong> |</>}
                                                            Ngày: {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`${styles.badge} ${report.status === 'Pending' ? styles.badgeInfo : report.status === 'Valid' ? styles.badgeSuccess : styles.badgeError}`}>
                                                    {report.status === 'Pending' ? 'Đang chờ' : report.status === 'Valid' ? 'Hợp lệ' : 'Sai lệch'}
                                                </div>
                                            </div>

                                            <div style={{ width: '100%', background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Mô tả chi tiết</div>
                                                <div style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-primary)' }}>{report.description}</div>
                                            </div>

                                            {(report.evidenceImages?.length > 0 || report.videoEvidenceUrl) && (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', width: '100%' }}>
                                                    {report.evidenceImages?.split(',').map((img, i) => (
                                                        <a key={i} href={img.trim()} target="_blank" rel="noopener noreferrer" style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                                                            <img src={img.trim()} alt="Evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        </a>
                                                    ))}
                                                    {report.videoEvidenceUrl && (
                                                        <a href={report.videoEvidenceUrl} target="_blank" rel="noopener noreferrer" className={styles.baBtn} style={{ height: '100px', width: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '8px', background: 'rgba(29, 155, 240, 0.1)', color: 'var(--primary-blue)', border: '1px dashed var(--primary-blue)' }}>
                                                            <ExternalLink size={20} />
                                                            <span style={{ fontSize: '11px', fontWeight: '700' }}>Xem Video</span>
                                                        </a>
                                                    )}
                                                </div>
                                            )}

                                            {report.status === 'Pending' && (
                                                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                                    <button 
                                                        className={`${styles.baBtn} ${styles.apr}`} 
                                                        onClick={() => handleResolveReport(report.userReportId, true)}
                                                        disabled={processingProjectId === report.userReportId}
                                                    >
                                                        {processingProjectId === report.userReportId ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                                        Báo cáo hợp lệ
                                                    </button>
                                                    <button 
                                                        className={`${styles.baBtn} ${styles.rej}`} 
                                                        onClick={() => handleResolveReport(report.userReportId, false)}
                                                        disabled={processingProjectId === report.userReportId}
                                                    >
                                                        {processingProjectId === report.userReportId ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                                                        Báo cáo sai lệch
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Advisor Approvals Section */}
                {activeSection === 'advisor_approval' && (
                    <div className={styles.section} style={{ padding: 0, gap: 0, background: 'transparent', boxShadow: 'none' }}>
                        <AdvisorApprovalPage />
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
                        {/* Modal Header (Unique & Standardized) */}
                        <div className={local.staffModalHeader}>
                            <div className={local.staffModalTitleGrp}>
                                <h2 className={local.staffModalTitleText}>{detailProject.projectName}</h2>
                                <span
                                    className={styles.badge}
                                    style={{
                                        backgroundColor: `${STATUS_COLORS[detailProject.status || 'Pending']}25`,
                                        color: STATUS_COLORS[detailProject.status || 'Pending'],
                                        border: `1px solid ${STATUS_COLORS[detailProject.status || 'Pending']}40`,
                                        width: 'fit-content'
                                    }}
                                >
                                    {STATUS_LABELS[detailProject.status || 'Pending'] || 'Đang chờ duyệt'}
                                </span>
                            </div>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className={local.staffModalCloseBtn}
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
                                        className={`${styles.dangerBtn} ${processingProjectId !== null ? local.btnDisabled : ''}`}
                                        disabled={processingProjectId !== null}
                                    >
                                        Từ chối
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            handleApproveProject(detailProject.projectId);
                                        }}
                                        className={`${styles.primaryBtn} ${processingProjectId !== null ? local.btnDisabled : ''}`}
                                        disabled={processingProjectId !== null}
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
                    <div className={styles.modalContent} style={{ maxWidth: '800px', width: '95%' }}>
                        {/* Modal Header (Unique & Standardized) */}
                        <div className={local.staffModalHeader}>
                            <div className={local.staffModalTitleGrp}>
                                <h2 className={local.staffModalTitleText}>
                                    Booking #{selectedBooking.id}
                                </h2>
                                <span
                                    className={`${local.bookingBadge} ${selectedBooking.status === 'Pending' ? local.bookingBadgePending :
                                        selectedBooking.status === 'Confirmed' ? local.bookingBadgeConfirmed :
                                            selectedBooking.status === 'Completed' ? local.bookingBadgeCompleted :
                                                local.bookingBadgeCancelled
                                        }`}
                                    style={{ marginTop: '0', width: 'fit-content' }}
                                >
                                    {selectedBooking.status === 'Pending' ? 'Chờ xác nhận' :
                                        selectedBooking.status === 'Confirmed' ? 'Đã xác nhận' :
                                            selectedBooking.status === 'Completed' ? 'Hoàn thành' : 'Đã hủy'}
                                </span>
                            </div>
                            <button
                                onClick={() => setShowBookingModal(false)}
                                className={local.staffModalCloseBtn}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                            {isLoadingBookingDetail ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-secondary)', padding: '60px 0' }}>
                                    <Loader2 size={24} className={styles.spinner} />
                                    <span>Đang tải thông tin chi tiết...</span>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                    {/* 1. Thông tin nhân sự */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <h4 style={{ color: 'var(--primary-blue)', fontSize: '15px', fontWeight: '800', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>1. Thông tin nhân sự</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                                            <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '700' }}>Cố vấn chuyên môn</div>
                                                <div style={{
                                                    fontSize: '16px', fontWeight: '800', marginBottom: '4px',
                                                    color: selectedBooking.status === 'Pending' ? '#ff7a00' :
                                                        selectedBooking.status === 'Confirmed' ? '#1d9bf0' :
                                                            selectedBooking.status === 'Completed' ? '#10b981' : '#f4212e'
                                                }}>
                                                    {selectedBooking.advisorName}
                                                </div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>Mã: {selectedBooking.advisorId}</div>
                                            </div>
                                            <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '700' }}>Startup / Khách hàng</div>
                                                <div style={{
                                                    fontSize: '16px', fontWeight: '800', marginBottom: '4px',
                                                    color: selectedBooking.status === 'Pending' ? '#ff7a00' :
                                                        selectedBooking.status === 'Confirmed' ? '#1d9bf0' :
                                                            selectedBooking.status === 'Completed' ? '#10b981' : '#f4212e'
                                                }}>
                                                    {selectedBooking.customerName}
                                                </div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>Mã: {selectedBooking.customerId}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Thời gian tư vấn */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <h4 style={{ color: 'var(--primary-blue)', fontSize: '15px', fontWeight: '800', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>2. Thời gian tư vấn</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                                            <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-blue)' }}>
                                                    <Calendar size={20} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Bắt đầu</div>
                                                    <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                                        {new Date(selectedBooking.startTime).toLocaleDateString('vi-VN')}
                                                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '400', marginLeft: '8px' }}>
                                                            {new Date(selectedBooking.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-blue)' }}>
                                                    <Clock size={20} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Kết thúc</div>
                                                    <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                                        {new Date(selectedBooking.endTime).toLocaleDateString('vi-VN')}
                                                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '400', marginLeft: '8px' }}>
                                                            {new Date(selectedBooking.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. Chi phí & Hệ thống */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <h4 style={{ color: 'var(--primary-blue)', fontSize: '15px', fontWeight: '800', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>3. Chi phí &amp; Hệ thống</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <div style={{ padding: '20px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '700' }}>Chi phí tư vấn</div>
                                                <div style={{ fontSize: '24px', fontWeight: '900', color: '#f59e0b' }}>
                                                    {Number(selectedBooking.price).toLocaleString('vi-VN')} <span style={{ fontSize: '14px', fontWeight: '600' }}>₫</span>
                                                </div>
                                                <div style={{ position: 'absolute', right: '12px', bottom: '-10px', fontSize: '60px', fontWeight: '900', opacity: 0.05, color: '#f59e0b', userSelect: 'none' }}>₫</div>
                                            </div>
                                            <div style={{ padding: '20px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', fontWeight: '700' }}>Trạng thái hiện tại</div>
                                                <div className={`${local.bookingBadge} ${selectedBooking.status === 'Pending' ? local.bookingBadgePending :
                                                    selectedBooking.status === 'Confirmed' ? local.bookingBadgeConfirmed :
                                                        selectedBooking.status === 'Completed' ? local.bookingBadgeCompleted :
                                                            local.bookingBadgeCancelled
                                                    }`} style={{ padding: '8px 16px', fontSize: '13px' }}>
                                                    {selectedBooking.status === 'Pending' ? <Clock size={14} /> :
                                                        selectedBooking.status === 'Confirmed' ? <CheckCircle size={14} /> :
                                                            selectedBooking.status === 'Completed' ? <CheckCircle size={14} /> : <X size={14} />}
                                                    {selectedBooking.status === 'Pending' ? 'Chờ xác nhận' :
                                                        selectedBooking.status === 'Confirmed' ? 'Đã xác nhận' :
                                                            selectedBooking.status === 'Completed' ? 'Hoàn thành' : 'Đã hủy'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: 'var(--bg-secondary)' }}>
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
};

export default OperationStaffDashboard;
