import React, { useState } from 'react';
import { TrendingUp, Users, FileText, CheckCircle, AlertCircle, Calendar, MessageSquare, PlusCircle, Eye } from 'lucide-react';
import styles from './StartupDashboard.module.css';
import CompleteStartupInfoForm from '../components/startup/CompleteStartupInfoForm';

/**
 * StartupDashboard - Comprehensive dashboard for startup founders
 * Features: Overview stats, Profile completion, Documents, AI Score, Advisor requests
 */
export default function StartupDashboard({ user }) {
    const [activeSection, setActiveSection] = useState('overview');
    const [showCompleteInfoForm, setShowCompleteInfoForm] = useState(false);
    const [project, setProject] = useState({
        id: 1,
        name: 'AI Analytics Platform',
        tagline: 'Real-time data analytics with AI',
        status: 'pending',
        submittedDate: '2024-01-15',
        reviewedDate: null,
        feedback: null,
        description: 'A comprehensive AI-powered analytics platform for real-time data insights',
        industry: 'AI/ML',
        stage: 'MVP'
    });
    const [showProjectForm, setShowProjectForm] = useState(false);
    const [projectFormData, setProjectFormData] = useState({
        projectName: project.name,
        description: project.description,
        tagline: project.tagline,
        industry: project.industry,
        stage: project.stage,
        problemStatement: '',
        solution: '',
        targetMarket: '',
        teamSize: '',
        fundingStage: '',
        fundingAmount: '',
        currentRevenue: '',
        monthlyBurn: '',
        website: '',
        videoLink: '',
        keyFeatures: '',
    });
    const [advisorRequests, setAdvisorRequests] = useState([
        {
            id: 1,
            advisorName: 'Dr. Sarah Expert',
            expertise: 'Business Strategy',
            status: 'pending',
            requestDate: '2024-01-18',
            message: 'Interested in discussing your market entry strategy'
        },
        {
            id: 2,
            advisorName: 'John Finance',
            expertise: 'Fundraising',
            status: 'accepted',
            requestDate: '2024-01-15',
            appointmentDate: '2024-01-25'
        }
    ]);

    const [documents, setDocuments] = useState([
        { id: 1, name: 'Business Plan 2024.pdf', type: 'pdf', uploadDate: '2024-01-10', status: 'verified', hash: '0x1a2b3c4d5e' },
        { id: 2, name: 'Technical Architecture.docx', type: 'docx', uploadDate: '2024-01-12', status: 'pending', hash: null },
        { id: 3, name: 'Financial Projections.xlsx', type: 'xlsx', uploadDate: '2024-01-15', status: 'verified', hash: '0x9k8j7h6g5f' }
    ]);

    // Mock data - simulating from user data
    const dashboardData = {
        profileCompletion: 75,
        documentsUploaded: documents.length,
        advisorsConnected: 2,
        aiScore: 78,
        pendingAdvisorRequests: advisorRequests.filter(r => r.status === 'pending').length,
        profileViews: 156,
        investorInterests: 8,
        monthlyViewTrend: [12, 28, 35, 42, 38, 52, 48, 65, 78, 92, 110, 145]
    };

    const handleAcceptRequest = (id) => {
        setAdvisorRequests(advisorRequests.map(req =>
            req.id === id ? { ...req, status: 'accepted', appointmentDate: '2024-02-05' } : req
        ));
    };

    const handleRejectRequest = (id) => {
        setAdvisorRequests(advisorRequests.map(req =>
            req.id === id ? { ...req, status: 'rejected' } : req
        ));
    };

    const handleDeleteDocument = (id) => {
        setDocuments(documents.filter(doc => doc.id !== id));
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>Startup Dashboard</h1>
                    <p className={styles.subtitle}>Welcome, {user?.name || 'Founder'}! Here's your startup overview.</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#e8f4f8' }}>
                        <Eye size={24} color="#0891b2" />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.profileViews}</div>
                        <div className={styles.statLabel}>Profile Views</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#fef3c7' }}>
                        <Users size={24} color="#d97706" />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.investorInterests}</div>
                        <div className={styles.statLabel}>Investor Interests</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#d1fae5' }}>
                        <FileText size={24} color="#059669" />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.documentsUploaded}</div>
                        <div className={styles.statLabel}>Documents Uploaded</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#ede9fe' }}>
                        <TrendingUp size={24} color="#7c3aed" />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.aiScore}</div>
                        <div className={styles.statLabel}>AI Score / 100</div>
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
                    className={`${styles.tab} ${activeSection === 'complete-info' ? styles.active : ''}`}
                    onClick={() => setActiveSection('complete-info')}
                >
                    Complete Info
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'projects' ? styles.active : ''}`}
                    onClick={() => setActiveSection('projects')}
                >
                    Projects
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'documents' ? styles.active : ''}`}
                    onClick={() => setActiveSection('documents')}
                >
                    Documents & IP
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'advisors' ? styles.active : ''}`}
                    onClick={() => setActiveSection('advisors')}
                >
                    Advisor Requests
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'profile' ? styles.active : ''}`}
                    onClick={() => setActiveSection('profile')}
                >
                    Profile Settings
                </button>
            </div>

            {/* Content Sections */}
            <div className={styles.content}>
                {/* Complete Information Form */}
                {activeSection === 'complete-info' && (
                    <div className={styles.section}>
                        {showCompleteInfoForm ? (
                            <CompleteStartupInfoForm
                                onSubmit={(formData) => {
                                    console.log('Complete startup info submitted:', formData);
                                    setShowCompleteInfoForm(false);
                                    // Here you would typically save to backend
                                }}
                                onCancel={() => setShowCompleteInfoForm(false)}
                            />
                        ) : (
                            <div className={styles.card}>
                                <h3 className={styles.cardTitle}>Complete Startup Information</h3>
                                <p className={styles.cardDescription}>
                                    Upload comprehensive information about your startup to help investors and advisors better understand your venture.
                                </p>
                                <button
                                    onClick={() => setShowCompleteInfoForm(true)}
                                    className={styles.primaryBtn}
                                >
                                    + Fill Out Complete Information
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Overview Section */}
                {activeSection === 'overview' && (
                    <div className={styles.section}>
                        <div className={styles.sectionGrid}>
                            {/* Profile Completion */}
                            <div className={styles.card}>
                                <h3 className={styles.cardTitle}>Profile Completion</h3>
                                <div className={styles.progressContainer}>
                                    <div className={styles.progressBar}>
                                        <div
                                            className={styles.progress}
                                            style={{ width: `${dashboardData.profileCompletion}%` }}
                                        ></div>
                                    </div>
                                    <div className={styles.progressText}>
                                        {dashboardData.profileCompletion}% Complete
                                    </div>
                                </div>
                                <p className={styles.hint}>Complete your profile to attract more investors</p>
                                <button
                                    onClick={() => setActiveSection('complete-info')}
                                    className={styles.linkBtn}
                                >
                                    Fill out complete information →
                                </button>
                            </div>

                            {/* AI Score Details */}
                            <div className={styles.card}>
                                <h3 className={styles.cardTitle}>AI Potential Score</h3>
                                <div className={styles.scoreDisplay}>
                                    <div className={styles.scoreCircle}>
                                        <span className={styles.scoreNumber}>{dashboardData.aiScore}</span>
                                        <span className={styles.scoreMax}>/ 100</span>
                                    </div>
                                    <p className={styles.scoreDescription}>
                                        Your startup shows strong potential in market innovation and team strength.
                                    </p>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
                                <h3 className={styles.cardTitle}>Recent Activity</h3>
                                <div className={styles.activityList}>
                                    <div className={styles.activityItem}>
                                        <div className={styles.activityIcon}>
                                            <Eye size={18} />
                                        </div>
                                        <div className={styles.activityContent}>
                                            <div className={styles.activityTitle}>Profile viewed by Sequoia Capital</div>
                                            <div className={styles.activityTime}>2 hours ago</div>
                                        </div>
                                    </div>
                                    <div className={styles.activityItem}>
                                        <div className={styles.activityIcon}>
                                            <MessageSquare size={18} />
                                        </div>
                                        <div className={styles.activityContent}>
                                            <div className={styles.activityTitle}>New advisor request from Dr. Sarah Expert</div>
                                            <div className={styles.activityTime}>5 hours ago</div>
                                        </div>
                                    </div>
                                    <div className={styles.activityItem}>
                                        <div className={styles.activityIcon}>
                                            <CheckCircle size={18} />
                                        </div>
                                        <div className={styles.activityContent}>
                                            <div className={styles.activityTitle}>Document "Business Plan" verified on blockchain</div>
                                            <div className={styles.activityTime}>1 day ago</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Documents Section */}
                {activeSection === 'documents' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <div className={styles.sectionHeader}>
                                <h3 className={styles.cardTitle}>Document & IP Management</h3>
                                <button className={styles.primaryBtn}>
                                    <PlusCircle size={18} />
                                    Upload Document
                                </button>
                            </div>

                            <div className={styles.documentsList}>
                                {documents.map(doc => (
                                    <div key={doc.id} className={styles.documentItem}>
                                        <div className={styles.documentInfo}>
                                            <div className={styles.documentName}>
                                                <FileText size={20} />
                                                <span>{doc.name}</span>
                                            </div>
                                            <div className={styles.documentMeta}>
                                                <span className={styles.uploadDate}>Uploaded: {doc.uploadDate}</span>
                                                <span className={`${styles.status} ${styles[`status-${doc.status}`]}`}>
                                                    {doc.status === 'verified' ? '✓ Verified' : '⏳ Pending'}
                                                </span>
                                            </div>
                                            {doc.hash && (
                                                <div className={styles.hashContainer}>
                                                    <span className={styles.hashLabel}>Blockchain Hash:</span>
                                                    <code className={styles.hash}>{doc.hash}</code>
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.documentActions}>
                                            <button className={styles.actionBtn}>View</button>
                                            <button className={styles.actionBtn}>Details</button>
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => handleDeleteDocument(doc.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Projects Section */}
                {activeSection === 'projects' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>My Project</h3>
                            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
                                Each startup can submit one project for review. Once approved, it will be published to the main board.
                            </p>

                            {showProjectForm ? (
                                <div style={{
                                    background: '#f8fafc',
                                    padding: '20px',
                                    borderRadius: '8px',
                                    marginBottom: '20px',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <h4 style={{ marginTop: 0, color: '#1e293b' }}>Edit Project Details</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                        <input
                                            type="text"
                                            placeholder="Project Name"
                                            value={projectFormData.projectName}
                                            onChange={(e) => setProjectFormData({ ...projectFormData, projectName: e.target.value })}
                                            style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontFamily: 'inherit' }}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Tagline"
                                            value={projectFormData.tagline}
                                            onChange={(e) => setProjectFormData({ ...projectFormData, tagline: e.target.value })}
                                            style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontFamily: 'inherit' }}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                        <select
                                            value={projectFormData.industry}
                                            onChange={(e) => setProjectFormData({ ...projectFormData, industry: e.target.value })}
                                            style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontFamily: 'inherit' }}
                                        >
                                            <option value="">Select Industry</option>
                                            <option value="AI/ML">AI/ML</option>
                                            <option value="Fintech">Fintech</option>
                                            <option value="Healthtech">Healthtech</option>
                                        </select>
                                        <select
                                            value={projectFormData.stage}
                                            onChange={(e) => setProjectFormData({ ...projectFormData, stage: e.target.value })}
                                            style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontFamily: 'inherit' }}
                                        >
                                            <option value="">Select Stage</option>
                                            <option value="Idea">Idea</option>
                                            <option value="MVP">MVP</option>
                                            <option value="Growth">Growth</option>
                                        </select>
                                    </div>

                                    <textarea
                                        placeholder="Project Description"
                                        value={projectFormData.description}
                                        onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                                        rows="4"
                                        style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontFamily: 'inherit', marginBottom: '16px' }}
                                    />

                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={() => {
                                                if (projectFormData.projectName && projectFormData.description) {
                                                    setProject({
                                                        ...project,
                                                        name: projectFormData.projectName,
                                                        tagline: projectFormData.tagline,
                                                        description: projectFormData.description,
                                                        industry: projectFormData.industry,
                                                        stage: projectFormData.stage,
                                                        status: 'pending',
                                                        submittedDate: new Date().toISOString().split('T')[0],
                                                        reviewedDate: null,
                                                        feedback: null
                                                    });
                                                    setShowProjectForm(false);
                                                }
                                            }}
                                            style={{
                                                background: '#10b981',
                                                color: 'white',
                                                border: 'none',
                                                padding: '10px 16px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: '600'
                                            }}
                                        >
                                            Update & Submit
                                        </button>
                                        <button
                                            onClick={() => setShowProjectForm(false)}
                                            style={{
                                                background: '#f1f5f9',
                                                color: '#475569',
                                                border: 'none',
                                                padding: '10px 16px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: '600'
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        padding: '16px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start'
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 4px 0', color: '#1e293b', fontSize: '15px', fontWeight: '600' }}>
                                            {project.name}
                                        </h4>
                                        <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '13px' }}>
                                            {project.tagline}
                                        </p>
                                        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
                                            <span>Industry: {project.industry}</span>
                                            <span>Stage: {project.stage}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
                                            <span>Submitted: {project.submittedDate}</span>
                                            {project.reviewedDate && <span>Reviewed: {project.reviewedDate}</span>}
                                        </div>
                                        <p style={{ margin: '8px 0 0 0', color: '#475569', fontSize: '13px', lineHeight: '1.5' }}>
                                            {project.description}
                                        </p>
                                        {project.feedback && (
                                            <div style={{ marginTop: '12px', padding: '10px', background: '#f0fdf4', borderRadius: '4px', fontSize: '12px', color: '#15803d' }}>
                                                ✓ {project.feedback}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                                        <span
                                            style={{
                                                display: 'inline-block',
                                                padding: '6px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                background: project.status === 'pending' ? '#fef3c7' : '#d1fae5',
                                                color: project.status === 'pending' ? '#92400e' : '#065f46',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {project.status === 'pending' ? '⏳ Pending' : '✓ Approved'}
                                        </span>
                                        <button
                                            onClick={() => {
                                                setProjectFormData({
                                                    projectName: project.name,
                                                    description: project.description,
                                                    tagline: project.tagline,
                                                    industry: project.industry,
                                                    stage: project.stage,
                                                    problemStatement: '',
                                                    solution: '',
                                                    targetMarket: '',
                                                    teamSize: '',
                                                    fundingStage: '',
                                                    fundingAmount: '',
                                                    currentRevenue: '',
                                                    monthlyBurn: '',
                                                    website: '',
                                                    videoLink: '',
                                                    keyFeatures: '',
                                                });
                                                setShowProjectForm(true);
                                            }}
                                            style={{
                                                background: '#3b82f6',
                                                color: 'white',
                                                border: 'none',
                                                padding: '8px 12px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontWeight: '600'
                                            }}
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Documents Section */}
                {activeSection === 'advisors' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>
                                Advisor Consulting Requests
                                {dashboardData.pendingAdvisorRequests > 0 && (
                                    <span className={styles.badge}>{dashboardData.pendingAdvisorRequests} Pending</span>
                                )}
                            </h3>

                            <div className={styles.requestsList}>
                                {advisorRequests.map(request => (
                                    <div key={request.id} className={styles.requestItem}>
                                        <div className={styles.requestInfo}>
                                            <div className={styles.requestHeader}>
                                                <h4 className={styles.advisorName}>{request.advisorName}</h4>
                                                <span className={styles.expertise}>{request.expertise}</span>
                                            </div>
                                            <p className={styles.requestMessage}>{request.message}</p>
                                            <div className={styles.requestDetails}>
                                                <span>Requested: {request.requestDate}</span>
                                                {request.appointmentDate && (
                                                    <span>📅 Appointment: {request.appointmentDate}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className={styles.requestActions}>
                                            <span className={`${styles.statusBadge} ${styles[`badge-${request.status}`]}`}>
                                                {request.status === 'pending' && 'Pending'}
                                                {request.status === 'accepted' && '✓ Accepted'}
                                                {request.status === 'rejected' && '✗ Rejected'}
                                            </span>
                                            {request.status === 'pending' && (
                                                <div className={styles.actionButtons}>
                                                    <button
                                                        className={styles.acceptBtn}
                                                        onClick={() => handleAcceptRequest(request.id)}
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        className={styles.rejectBtn}
                                                        onClick={() => handleRejectRequest(request.id)}
                                                    >
                                                        Decline
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Profile Settings Section */}
                {activeSection === 'profile' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>Profile Settings</h3>
                            <form className={styles.form}>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Company Name</label>
                                        <input
                                            type="text"
                                            placeholder="Your startup name"
                                            defaultValue={user?.companyName || ''}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Founder Name</label>
                                        <input
                                            type="text"
                                            placeholder="Your name"
                                            defaultValue={user?.name || ''}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Company Description</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Tell investors about your startup"
                                        defaultValue={user?.description || ''}
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Industry</label>
                                        <select>
                                            <option>AI/ML</option>
                                            <option>Fintech</option>
                                            <option>HealthTech</option>
                                            <option>E-commerce</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Stage</label>
                                        <select>
                                            <option>Idea</option>
                                            <option>MVP</option>
                                            <option>Growth</option>
                                            <option>Scale</option>
                                        </select>
                                    </div>
                                </div>

                                <div className={styles.formActions}>
                                    <button type="submit" className={styles.saveBtn}>Save Changes</button>
                                    <button type="button" className={styles.cancelBtn}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
