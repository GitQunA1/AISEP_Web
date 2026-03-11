import React, { useState } from 'react';
import { FileCheck, CheckCircle, AlertCircle, Users, Activity, Settings, Trash2, Download, Eye } from 'lucide-react';
import styles from '../styles/SharedDashboard.module.css';
import FeedHeader from '../components/feed/FeedHeader';

/**
 * OperationStaffDashboard - Dashboard for Operation Staff
 * Features: Document verification, User approvals, Activity monitoring, Request management
 */
export default function OperationStaffDashboard({ user }) {
    const [activeSection, setActiveSection] = useState('overview');

    const [projectSubmissions, setProjectSubmissions] = useState([]);
    const [pendingDocuments, setPendingDocuments] = useState([]);
    const [pendingApprovals, setPendingApprovals] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);

    const dashboardData = {
        pendingDocuments: pendingDocuments.length,
        pendingApprovals: pendingApprovals.length,
        pendingRequests: pendingRequests.length,
        verifiedDocuments: 0,
        approvedUsers: 0,
        totalActivity: 0,
        documentVerificationRate: '0%',
        averageApprovalTime: '-'
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

    const handleApproveProject = (id) => {
        setProjectSubmissions(projectSubmissions.map(proj =>
            proj.id === id ? { ...proj, status: 'approved' } : proj
        ));
    };

    const handleRejectProject = (id) => {
        setProjectSubmissions(projectSubmissions.map(proj =>
            proj.id === id ? { ...proj, status: 'rejected' } : proj
        ));
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
                            <h3 className={styles.cardTitle}>Dự án chờ phê duyệt</h3>
                            <div className={styles.list}>
                                {projectSubmissions.filter(p => p.status === 'pending').map(project => (
                                    <div key={project.id} className={styles.listItem}>
                                        <div className={styles.listContent}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <h4 className={styles.listTitle}>{project.projectName}</h4>
                                                <span className={styles.listMeta}>bởi {project.startupName}</span>
                                            </div>
                                            <div className={styles.listSubtitle} style={{ marginBottom: '8px' }}>{project.tagline}</div>
                                            <div className={styles.listMeta}>
                                                Ngành: {project.industry} | Giai đoạn: {project.stage} | Nộp ngày: {project.submittedDate}
                                            </div>
                                            <p style={{ marginTop: '8px', fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                                                {project.description}
                                            </p>
                                        </div>
                                        <div className={styles.listActions}>
                                            <button
                                                onClick={() => handleApproveProject(project.id)}
                                                className={styles.primaryBtn}
                                            >
                                                ✓ Phê duyệt
                                            </button>
                                            <button
                                                onClick={() => handleRejectProject(project.id)}
                                                className={styles.dangerBtn}
                                            >
                                                ✗ Từ chối
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {projectSubmissions.filter(p => p.status === 'pending').length === 0 && (
                                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        Chưa có dự án nào chờ phê duyệt
                                    </div>
                                )}
                            </div>

                            {projectSubmissions.filter(p => p.status === 'approved').length > 0 && (
                                <div style={{ marginTop: '24px' }}>
                                    <h4 className={styles.cardTitle} style={{ fontSize: '16px' }}>Dự án đã được phê duyệt</h4>
                                    <div className={styles.list}>
                                        {projectSubmissions.filter(p => p.status === 'approved').map(project => (
                                            <div key={project.id} className={styles.listItem} style={{ background: 'rgba(23, 191, 99, 0.05)' }}>
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
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
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
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
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
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
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
                                                <span style={{ color: approval.verification === 'verified' ? '#17bf63' : '#d97706', fontWeight: '600', marginTop: '4px' }}>
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
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
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
        </div>
    );
}
