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

    const [projectSubmissions, setProjectSubmissions] = useState([
        {
            id: 1,
            projectName: 'AI Analytics Platform',
            startupName: 'TechStartup AI',
            founder: 'John Doe',
            tagline: 'Real-time data analytics with AI',
            industry: 'AI/ML',
            stage: 'MVP',
            submittedDate: '2024-01-18',
            status: 'pending',
            description: 'A comprehensive AI-powered analytics platform for real-time data insights'
        },
        {
            id: 2,
            projectName: 'Smart Marketing Tool',
            startupName: 'MarketVision Inc',
            founder: 'Alice Johnson',
            tagline: 'AI-powered marketing automation',
            industry: 'SaaS',
            stage: 'Growth',
            submittedDate: '2024-01-15',
            status: 'pending',
            description: 'Automated marketing campaign optimizer using machine learning'
        }
    ]);

    const [pendingDocuments, setPendingDocuments] = useState([
        {
            id: 1,
            startupName: 'TechStartup AI',
            founder: 'John Doe',
            documentName: 'Business Plan 2024.pdf',
            uploadDate: '2024-01-18',
            status: 'pending',
            size: '2.4 MB',
            type: 'business_plan'
        },
        {
            id: 2,
            startupName: 'FinApp Solutions',
            founder: 'Jane Smith',
            documentName: 'Technical Architecture.docx',
            uploadDate: '2024-01-17',
            status: 'pending',
            size: '1.8 MB',
            type: 'technical_docs'
        }
    ]);

    const [pendingApprovals, setPendingApprovals] = useState([
        {
            id: 1,
            name: 'Michael Chen',
            role: 'investor',
            email: 'michael@example.com',
            registeredDate: '2024-01-18',
            status: 'pending',
            verification: 'not_verified'
        },
        {
            id: 2,
            name: 'Dr. Sarah Expert',
            role: 'advisor',
            email: 'sarah@expert.com',
            registeredDate: '2024-01-17',
            status: 'pending',
            verification: 'verified'
        }
    ]);

    const [pendingRequests, setPendingRequests] = useState([
        {
            id: 1,
            startupName: 'CloudData Inc',
            advisorName: 'John Finance',
            requestType: 'consulting',
            submittedDate: '2024-01-18',
            status: 'pending'
        },
        {
            id: 2,
            startupName: 'BlockChain Lab',
            investorName: 'Sequoia Capital',
            requestType: 'connection',
            submittedDate: '2024-01-17',
            status: 'pending'
        }
    ]);

    const dashboardData = {
        pendingDocuments: pendingDocuments.length,
        pendingApprovals: pendingApprovals.length,
        pendingRequests: pendingRequests.length,
        verifiedDocuments: 24,
        approvedUsers: 18,
        totalActivity: 342,
        documentVerificationRate: '92%',
        averageApprovalTime: '2.5 hours'
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
                title="Operation Staff Dashboard"
                subtitle={`Welcome, ${user?.name || 'Staff'}! Manage platform operations and approvals.`}
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
                        <div className={styles.statLabel}>Pending Documents</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconBlue}`}>
                        <Users size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.pendingApprovals}</div>
                        <div className={styles.statLabel}>Pending Approvals</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconRed}`}>
                        <AlertCircle size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.pendingRequests}</div>
                        <div className={styles.statLabel}>Pending Requests</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconGreen}`}>
                        <CheckCircle size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.verifiedDocuments}</div>
                        <div className={styles.statLabel}>Verified Documents</div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeSection === 'overview' ? styles.active : ''}`}
                    onClick={() => setActiveSection('overview')}
                >
                    Overview
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'projects' ? styles.active : ''}`}
                    onClick={() => setActiveSection('projects')}
                >
                    Project Reviews
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'documents' ? styles.active : ''}`}
                    onClick={() => setActiveSection('documents')}
                >
                    Document Verification
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'approvals' ? styles.active : ''}`}
                    onClick={() => setActiveSection('approvals')}
                >
                    User Approvals
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'requests' ? styles.active : ''}`}
                    onClick={() => setActiveSection('requests')}
                >
                    Request Management
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'activity' ? styles.active : ''}`}
                    onClick={() => setActiveSection('activity')}
                >
                    Activity Monitor
                </button>
            </div>

            {/* Content Sections */}
            <div className={styles.content}>
                {/* Project Reviews Section */}
                {activeSection === 'projects' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>Project Submissions for Review</h3>
                            <div className={styles.list}>
                                {projectSubmissions.filter(p => p.status === 'pending').map(project => (
                                    <div key={project.id} className={styles.listItem}>
                                        <div className={styles.listContent}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <h4 className={styles.listTitle}>{project.projectName}</h4>
                                                <span className={styles.listMeta}>by {project.startupName}</span>
                                            </div>
                                            <div className={styles.listSubtitle} style={{ marginBottom: '8px' }}>{project.tagline}</div>
                                            <div className={styles.listMeta}>
                                                Industry: {project.industry} | Stage: {project.stage} | Submitted: {project.submittedDate}
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
                                                ✓ Approve
                                            </button>
                                            <button
                                                onClick={() => handleRejectProject(project.id)}
                                                className={styles.dangerBtn}
                                            >
                                                ✗ Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {projectSubmissions.filter(p => p.status === 'pending').length === 0 && (
                                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        No pending project reviews
                                    </div>
                                )}
                            </div>

                            {projectSubmissions.filter(p => p.status === 'approved').length > 0 && (
                                <div style={{ marginTop: '24px' }}>
                                    <h4 className={styles.cardTitle} style={{ fontSize: '16px' }}>Approved Projects</h4>
                                    <div className={styles.list}>
                                        {projectSubmissions.filter(p => p.status === 'approved').map(project => (
                                            <div key={project.id} className={styles.listItem} style={{ background: 'rgba(23, 191, 99, 0.05)' }}>
                                                <div className={styles.listContent}>
                                                    <div className={styles.listTitle}>{project.projectName}</div>
                                                    <div className={`${styles.badge} ${styles.badgeSuccess}`} style={{ marginTop: '4px' }}>
                                                        ✓ Approved - Published to mainboard
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
                                <h3 className={styles.cardTitle}>Performance Metrics</h3>
                                <div className={styles.metricsGrid}>
                                    <div className={styles.metricItem}>
                                        <div className={styles.metricLabel}>Verification Rate</div>
                                        <div className={styles.metricValue}>{dashboardData.documentVerificationRate}</div>
                                    </div>
                                    <div className={styles.metricItem}>
                                        <div className={styles.metricLabel}>Avg Approval Time</div>
                                        <div className={styles.metricValue}>{dashboardData.averageApprovalTime}</div>
                                    </div>
                                    <div className={styles.metricItem}>
                                        <div className={styles.metricLabel}>Total Activity</div>
                                        <div className={styles.metricValue}>{dashboardData.totalActivity}</div>
                                    </div>
                                    <div className={styles.metricItem}>
                                        <div className={styles.metricLabel}>Approved Users</div>
                                        <div className={styles.metricValue}>{dashboardData.approvedUsers}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Pending Items Summary */}
                            <div className={styles.card}>
                                <h3 className={styles.cardTitle}>Pending Items</h3>
                                <div className={styles.list}>
                                    <div className={styles.listItem}>
                                        <span className={styles.listTitle}>Documents Awaiting Verification</span>
                                        <span className={`${styles.badge} ${styles.badgePending}`} style={{ marginLeft: 'auto' }}>
                                            {dashboardData.pendingDocuments}
                                        </span>
                                    </div>
                                    <div className={styles.listItem}>
                                        <span className={styles.listTitle}>User Approvals Needed</span>
                                        <span className={`${styles.badge} ${styles.badgeInfo}`} style={{ marginLeft: 'auto' }}>
                                            {dashboardData.pendingApprovals}
                                        </span>
                                    </div>
                                    <div className={styles.listItem}>
                                        <span className={styles.listTitle}>Requests to Review</span>
                                        <span className={`${styles.badge} ${styles.badgeError}`} style={{ marginLeft: 'auto' }}>
                                            {dashboardData.pendingRequests}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className={styles.card}>
                                <h3 className={styles.cardTitle}>Recent Activity</h3>
                                <div className={styles.list}>
                                    <div className={styles.listItem}>
                                        <div className={`${styles.listIcon} ${styles.iconGreen}`}>
                                            <CheckCircle size={18} />
                                        </div>
                                        <div className={styles.listContent}>
                                            <div className={styles.listTitle}>Document verified: Business Plan (TechStartup AI)</div>
                                            <div className={styles.listMeta}>1 hour ago</div>
                                        </div>
                                    </div>
                                    <div className={styles.listItem}>
                                        <div className={`${styles.listIcon} ${styles.iconBlue}`}>
                                            <Users size={18} />
                                        </div>
                                        <div className={styles.listContent}>
                                            <div className={styles.listTitle}>User approved: John Investment (Investor)</div>
                                            <div className={styles.listMeta}>3 hours ago</div>
                                        </div>
                                    </div>
                                    <div className={styles.listItem}>
                                        <div className={`${styles.listIcon} ${styles.iconRed}`}>
                                            <AlertCircle size={18} />
                                        </div>
                                        <div className={styles.listContent}>
                                            <div className={styles.listTitle}>Request rejected: Consulting request (FinApp)</div>
                                            <div className={styles.listMeta}>5 hours ago</div>
                                        </div>
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
                                Document Verification Queue
                                {dashboardData.pendingDocuments > 0 && (
                                    <span className={`${styles.badge} ${styles.badgePending}`} style={{ marginLeft: '12px' }}>
                                        {dashboardData.pendingDocuments} Pending
                                    </span>
                                )}
                            </h3>

                            <div className={styles.list}>
                                {pendingDocuments.map(doc => (
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
                                                <Eye size={16} /> View
                                            </button>
                                            {doc.status === 'pending' && (
                                                <>
                                                    <button
                                                        className={styles.primaryBtn}
                                                        onClick={() => handleVerifyDocument(doc.id)}
                                                    >
                                                        ✓ Verify
                                                    </button>
                                                    <button
                                                        className={styles.dangerBtn}
                                                        onClick={() => handleRejectDocument(doc.id)}
                                                    >
                                                        ✗ Reject
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
                                User Registration Approvals
                                {dashboardData.pendingApprovals > 0 && (
                                    <span className={`${styles.badge} ${styles.badgeInfo}`} style={{ marginLeft: '12px' }}>
                                        {dashboardData.pendingApprovals} Pending
                                    </span>
                                )}
                            </h3>

                            <div className={styles.list}>
                                {pendingApprovals.map(approval => (
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
                                                    {approval.verification === 'verified' ? '✓ ID Verified' : '⚠ Awaiting ID Verification'}
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
                                                        Approve
                                                    </button>
                                                    <button
                                                        className={styles.dangerBtn}
                                                        onClick={() => handleRejectUser(approval.id)}
                                                    >
                                                        Reject
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
                                Pending Requests
                                {dashboardData.pendingRequests > 0 && (
                                    <span className={`${styles.badge} ${styles.badgeError}`} style={{ marginLeft: '12px' }}>
                                        {dashboardData.pendingRequests} Pending
                                    </span>
                                )}
                            </h3>

                            <div className={styles.list}>
                                {pendingRequests.map(request => (
                                    <div key={request.id} className={styles.listItem}>
                                        <div className={styles.listContent}>
                                            <div className={styles.listSubtitle} style={{ color: 'var(--primary-blue)', fontWeight: '700', marginBottom: '4px' }}>
                                                {request.requestType === 'consulting' ? '📚 Consulting' : '🤝 Connection'} Request
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
                                                        Approve
                                                    </button>
                                                    <button
                                                        className={styles.dangerBtn}
                                                        onClick={() => handleRejectRequest(request.id)}
                                                    >
                                                        Reject
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
                            <h3 className={styles.cardTitle}>Platform Activity Monitor</h3>
                            <div className={styles.metricsGrid}>
                                <div className={styles.metricItem}>
                                    <span className={styles.metricLabel}>Total User Logins Today</span>
                                    <strong className={styles.metricValue}>143</strong>
                                </div>
                                <div className={styles.metricItem}>
                                    <span className={styles.metricLabel}>Documents Uploaded</span>
                                    <strong className={styles.metricValue}>24</strong>
                                </div>
                                <div className={styles.metricItem}>
                                    <span className={styles.metricLabel}>New Connections Made</span>
                                    <strong className={styles.metricValue}>8</strong>
                                </div>
                                <div className={styles.metricItem}>
                                    <span className={styles.metricLabel}>Consulting Requests</span>
                                    <strong className={styles.metricValue}>15</strong>
                                </div>
                                <div className={styles.metricItem}>
                                    <span className={styles.metricLabel}>System Errors</span>
                                    <strong className={styles.metricValue}>0</strong>
                                </div>
                                <div className={styles.metricItem}>
                                    <span className={styles.metricLabel}>Flagged Issues</span>
                                    <strong className={styles.metricValue}>2</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
