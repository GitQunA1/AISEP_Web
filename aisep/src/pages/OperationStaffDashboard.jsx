import React, { useState } from 'react';
import { FileCheck, CheckCircle, AlertCircle, Users, Activity, Settings, Trash2, Download, Eye } from 'lucide-react';
import styles from './OperationStaffDashboard.module.css';

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
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>Operation Staff Dashboard</h1>
                    <p className={styles.subtitle}>Welcome, {user?.name || 'Staff'}! Manage platform operations and approvals.</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#fef3c7' }}>
                        <FileCheck size={24} color="#d97706" />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.pendingDocuments}</div>
                        <div className={styles.statLabel}>Pending Documents</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#dbeafe' }}>
                        <Users size={24} color="#0284c7" />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.pendingApprovals}</div>
                        <div className={styles.statLabel}>Pending Approvals</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#fce7f3' }}>
                        <AlertCircle size={24} color="#be185d" />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.pendingRequests}</div>
                        <div className={styles.statLabel}>Pending Requests</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#d1fae5' }}>
                        <CheckCircle size={24} color="#059669" />
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
                            <div className={styles.documentsList}>
                                {projectSubmissions.filter(p => p.status === 'pending').map(project => (
                                    <div key={project.id} className={styles.documentItem}>
                                        <div className={styles.documentInfo}>
                                            <div className={styles.documentHeader}>
                                                <h4 className={styles.startupName}>{project.projectName}</h4>
                                                <span style={{ fontSize: '12px', color: '#64748b' }}>
                                                    by {project.startupName}
                                                </span>
                                            </div>
                                            <div className={styles.documentDetails}>
                                                <div className={styles.documentName}>{project.tagline}</div>
                                                <div className={styles.documentMeta}>
                                                    Industry: {project.industry} | Stage: {project.stage} | Submitted: {project.submittedDate}
                                                </div>
                                                <div style={{ marginTop: '8px', fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>
                                                    {project.description}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.documentActions}>
                                            <button
                                                onClick={() => handleApproveProject(project.id)}
                                                className={styles.approveBtn}
                                            >
                                                ✓ Approve
                                            </button>
                                            <button
                                                onClick={() => handleRejectProject(project.id)}
                                                className={styles.rejectBtn}
                                            >
                                                ✗ Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {projectSubmissions.filter(p => p.status === 'pending').length === 0 && (
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                                        No pending project reviews
                                    </div>
                                )}
                            </div>

                            {projectSubmissions.filter(p => p.status === 'approved').length > 0 && (
                                <div style={{ marginTop: '24px' }}>
                                    <h4 style={{ color: '#1e293b', marginBottom: '16px' }}>Approved Projects</h4>
                                    <div className={styles.documentsList}>
                                        {projectSubmissions.filter(p => p.status === 'approved').map(project => (
                                            <div key={project.id} style={{ 
                                                border: '1px solid #e2e8f0', 
                                                borderRadius: '8px', 
                                                padding: '12px 16px',
                                                background: '#f0fdf4',
                                                opacity: 0.8
                                            }}>
                                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                                                    {project.projectName}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#65a30d', marginTop: '4px' }}>
                                                    ✓ Approved - Published to mainboard
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
                                <div className={styles.pendingList}>
                                    <div className={styles.pendingItem}>
                                        <span>Documents Awaiting Verification</span>
                                        <span className={styles.badge}>{dashboardData.pendingDocuments}</span>
                                    </div>
                                    <div className={styles.pendingItem}>
                                        <span>User Approvals Needed</span>
                                        <span className={styles.badge}>{dashboardData.pendingApprovals}</span>
                                    </div>
                                    <div className={styles.pendingItem}>
                                        <span>Requests to Review</span>
                                        <span className={styles.badge}>{dashboardData.pendingRequests}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className={styles.card}>
                                <h3 className={styles.cardTitle}>Recent Activity</h3>
                                <div className={styles.activityList}>
                                    <div className={styles.activityItem}>
                                        <div className={styles.activityIcon}>
                                            <CheckCircle size={18} />
                                        </div>
                                        <div className={styles.activityContent}>
                                            <div>Document verified: Business Plan (TechStartup AI)</div>
                                            <div className={styles.activityTime}>1 hour ago</div>
                                        </div>
                                    </div>
                                    <div className={styles.activityItem}>
                                        <div className={styles.activityIcon}>
                                            <Users size={18} />
                                        </div>
                                        <div className={styles.activityContent}>
                                            <div>User approved: John Investment (Investor)</div>
                                            <div className={styles.activityTime}>3 hours ago</div>
                                        </div>
                                    </div>
                                    <div className={styles.activityItem}>
                                        <div className={styles.activityIcon}>
                                            <AlertCircle size={18} />
                                        </div>
                                        <div className={styles.activityContent}>
                                            <div>Request rejected: Consulting request (FinApp)</div>
                                            <div className={styles.activityTime}>5 hours ago</div>
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
                                    <span className={styles.badge}>{dashboardData.pendingDocuments} Pending</span>
                                )}
                            </h3>

                            <div className={styles.documentsList}>
                                {pendingDocuments.map(doc => (
                                    <div key={doc.id} className={styles.documentItem}>
                                        <div className={styles.documentInfo}>
                                            <div className={styles.documentHeader}>
                                                <h4 className={styles.startupName}>{doc.startupName}</h4>
                                                <span className={styles.founderName}>by {doc.founder}</span>
                                            </div>
                                            <div className={styles.documentDetails}>
                                                <span className={styles.documentName}>📄 {doc.documentName}</span>
                                                <span className={styles.documentMeta}>{doc.size} • {doc.uploadDate}</span>
                                            </div>
                                        </div>
                                        <div className={styles.documentActions}>
                                            <button className={styles.viewBtn}>
                                                <Eye size={16} /> View
                                            </button>
                                            {doc.status === 'pending' && (
                                                <>
                                                    <button
                                                        className={styles.approveBtn}
                                                        onClick={() => handleVerifyDocument(doc.id)}
                                                    >
                                                        ✓ Verify
                                                    </button>
                                                    <button
                                                        className={styles.rejectBtn}
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
                                    <span className={styles.badge}>{dashboardData.pendingApprovals} Pending</span>
                                )}
                            </h3>

                            <div className={styles.approvalsList}>
                                {pendingApprovals.map(approval => (
                                    <div key={approval.id} className={styles.approvalItem}>
                                        <div className={styles.approvalInfo}>
                                            <div className={styles.approvalHeader}>
                                                <h4 className={styles.userName}>{approval.name}</h4>
                                                <span className={styles.roleRole}>{approval.role}</span>
                                            </div>
                                            <div className={styles.approvalDetails}>
                                                <span>Email: {approval.email}</span>
                                                <span>Registered: {approval.registeredDate}</span>
                                                <span className={`${styles.verificationStatus} ${styles[`status-${approval.verification}`]}`}>
                                                    {approval.verification === 'verified' ? '✓ ID Verified' : '⚠ Awaiting Verification'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={styles.approvalActions}>
                                            {approval.status === 'pending' && (
                                                <>
                                                    <button
                                                        className={styles.approveBtn}
                                                        onClick={() => handleApproveUser(approval.id)}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        className={styles.rejectBtn}
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
                                    <span className={styles.badge}>{dashboardData.pendingRequests} Pending</span>
                                )}
                            </h3>

                            <div className={styles.requestsList}>
                                {pendingRequests.map(request => (
                                    <div key={request.id} className={styles.requestItem}>
                                        <div className={styles.requestInfo}>
                                            <div className={styles.requestType}>
                                                {request.requestType === 'consulting' ? '📚' : '🤝'} {request.requestType.charAt(0).toUpperCase() + request.requestType.slice(1)} Request
                                            </div>
                                            <h4>
                                                {request.startupName}
                                                {request.advisorName && ` + ${request.advisorName}`}
                                                {request.investorName && ` + ${request.investorName}`}
                                            </h4>
                                            <span className={styles.submittedDate}>Submitted: {request.submittedDate}</span>
                                        </div>
                                        <div className={styles.requestActions}>
                                            {request.status === 'pending' && (
                                                <>
                                                    <button
                                                        className={styles.approveBtn}
                                                        onClick={() => handleApproveRequest(request.id)}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        className={styles.rejectBtn}
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
                            <div className={styles.activityMonitor}>
                                <div className={styles.monitorItem}>
                                    <span>Total User Logins Today</span>
                                    <strong>143</strong>
                                </div>
                                <div className={styles.monitorItem}>
                                    <span>Documents Uploaded</span>
                                    <strong>24</strong>
                                </div>
                                <div className={styles.monitorItem}>
                                    <span>New Connections Made</span>
                                    <strong>8</strong>
                                </div>
                                <div className={styles.monitorItem}>
                                    <span>Consulting Requests</span>
                                    <strong>15</strong>
                                </div>
                                <div className={styles.monitorItem}>
                                    <span>System Errors</span>
                                    <strong>0</strong>
                                </div>
                                <div className={styles.monitorItem}>
                                    <span>Flagged Issues</span>
                                    <strong>2</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
