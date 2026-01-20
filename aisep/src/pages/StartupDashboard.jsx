import React, { useState } from 'react';
import { TrendingUp, Users, FileText, CheckCircle, AlertCircle, Calendar, MessageSquare, PlusCircle, Eye } from 'lucide-react';
import styles from '../styles/SharedDashboard.module.css';
import CompleteStartupInfoForm from '../components/startup/CompleteStartupInfoForm';
import SuccessModal from '../components/common/SuccessModal';
import FeedHeader from '../components/feed/FeedHeader';

/**
 * StartupDashboard - Comprehensive dashboard for startup founders
 * Features: Overview stats, Profile completion, Documents, AI Score, Advisor requests
 */
export default function StartupDashboard({ user }) {
    const [activeSection, setActiveSection] = useState('overview');
    const [showCompleteInfoForm, setShowCompleteInfoForm] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
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
            {/* Unified Header */}
            <FeedHeader
                title="Dashboard"
                subtitle={`Welcome, ${user?.name || 'Founder'}! Here's your startup overview.`}
                showFilter={false} // No filter for dashboard
                user={user}
            />

            {/* Quick Stats */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconCyan}`}>
                        <Eye size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.profileViews}</div>
                        <div className={styles.statLabel}>Profile Views</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconYellow}`}>
                        <Users size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.investorInterests}</div>
                        <div className={styles.statLabel}>Investor Interests</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconGreen}`}>
                        <FileText size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.documentsUploaded}</div>
                        <div className={styles.statLabel}>Documents Uploaded</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconPurple}`}>
                        <TrendingUp size={20} />
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
                {/* Complete Information Form (Section View) */}
                {activeSection === 'complete-info' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>Complete Startup Information</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
                                Upload comprehensive information about your startup to help investors and advisors better understand your venture.
                            </p>
                            <button
                                onClick={() => setShowCompleteInfoForm(true)}
                                className={styles.primaryBtn}
                            >
                                + Fill Out Complete Information
                            </button>
                        </div>
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
                                        <span>Progress</span>
                                        {dashboardData.profileCompletion}% Complete
                                    </div>
                                </div>
                                <p className={styles.hint}>Complete your profile to attract more investors</p>
                                <button
                                    onClick={() => setActiveSection('complete-info')}
                                    className={styles.linkBtn}
                                    style={{ marginTop: '12px' }}
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
                                <div className={styles.list}>
                                    <div className={styles.listItem}>
                                        <div className={`${styles.listIcon} ${styles.iconCyan}`}>
                                            <Eye size={18} />
                                        </div>
                                        <div className={styles.listContent}>
                                            <div className={styles.listTitle}>Profile viewed by Sequoia Capital</div>
                                            <div className={styles.listMeta}>2 hours ago</div>
                                        </div>
                                    </div>
                                    <div className={styles.listItem}>
                                        <div className={`${styles.listIcon} ${styles.iconYellow}`}>
                                            <MessageSquare size={18} />
                                        </div>
                                        <div className={styles.listContent}>
                                            <div className={styles.listTitle}>New advisor request from Dr. Sarah Expert</div>
                                            <div className={styles.listMeta}>5 hours ago</div>
                                        </div>
                                    </div>
                                    <div className={styles.listItem}>
                                        <div className={`${styles.listIcon} ${styles.iconGreen}`}>
                                            <CheckCircle size={18} />
                                        </div>
                                        <div className={styles.listContent}>
                                            <div className={styles.listTitle}>Document "Business Plan" verified on blockchain</div>
                                            <div className={styles.listMeta}>1 day ago</div>
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
                            <div className={styles.cardHeader}>
                                <h3 className={styles.cardTitle}>Document & IP Management</h3>
                                <button className={styles.primaryBtn}>
                                    <PlusCircle size={18} />
                                    Upload Document
                                </button>
                            </div>

                            <div className={styles.list}>
                                {documents.map(doc => (
                                    <div key={doc.id} className={styles.listItem}>
                                        <div className={styles.listContent}>
                                            <div className={styles.listTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <FileText size={16} color="var(--primary-blue)" />
                                                {doc.name}
                                            </div>
                                            <div className={styles.listMeta} style={{ marginTop: '4px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <span>Uploaded: {doc.uploadDate}</span>
                                                <span className={`${styles.badge} ${doc.status === 'verified' ? styles.badgeSuccess : styles.badgePending}`}>
                                                    {doc.status === 'verified' ? '✓ Verified' : '⏳ Pending'}
                                                </span>
                                            </div>
                                            {doc.hash && (
                                                <div style={{ marginTop: '6px' }}>
                                                    <code className={styles.codeBlock}>{doc.hash}</code>
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.listActions}>
                                            <button className={styles.secondaryBtn}>View</button>
                                            <button
                                                className={styles.dangerBtn}
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
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
                                Each startup can submit one project for review. Once approved, it will be published to the main board.
                            </p>

                            {showProjectForm ? (
                                <div className={styles.card} style={{ background: 'var(--bg-secondary)', border: 'none' }}>
                                    <h4 className={styles.cardTitle}>Edit Project Details</h4>
                                    <div className={styles.form}>
                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <label>Project Name</label>
                                                <input
                                                    type="text"
                                                    value={projectFormData.projectName}
                                                    onChange={(e) => setProjectFormData({ ...projectFormData, projectName: e.target.value })}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Tagline</label>
                                                <input
                                                    type="text"
                                                    value={projectFormData.tagline}
                                                    onChange={(e) => setProjectFormData({ ...projectFormData, tagline: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <label>Industry</label>
                                                <select
                                                    value={projectFormData.industry}
                                                    onChange={(e) => setProjectFormData({ ...projectFormData, industry: e.target.value })}
                                                >
                                                    <option value="">Select Industry</option>
                                                    <option value="AI/ML">AI/ML</option>
                                                    <option value="Fintech">Fintech</option>
                                                    <option value="Healthtech">Healthtech</option>
                                                </select>
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Stage</label>
                                                <select
                                                    value={projectFormData.stage}
                                                    onChange={(e) => setProjectFormData({ ...projectFormData, stage: e.target.value })}
                                                >
                                                    <option value="">Select Stage</option>
                                                    <option value="Idea">Idea</option>
                                                    <option value="MVP">MVP</option>
                                                    <option value="Growth">Growth</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Description</label>
                                            <textarea
                                                rows="4"
                                                value={projectFormData.description}
                                                onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px' }}>
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
                                                className={styles.primaryBtn}
                                            >
                                                Update & Submit
                                            </button>
                                            <button
                                                onClick={() => setShowProjectForm(false)}
                                                className={styles.secondaryBtn}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.listItem}>
                                    <div className={styles.listContent}>
                                        <div>
                                            <h4 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                                                {project.name}
                                            </h4>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: '0 0 12px 0' }}>
                                                {project.tagline}
                                            </p>
                                        </div>

                                        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                                            <span className={`${styles.badge} ${styles.badgeInfo}`}>
                                                {project.industry}
                                            </span>
                                            <span className={`${styles.badge} ${styles.badgeInfo}`}>
                                                {project.stage}
                                            </span>
                                        </div>

                                        <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                                            {project.description}
                                        </p>

                                        <div className={styles.listMeta}>
                                            Submitted: {project.submittedDate}
                                            {project.reviewedDate && ` • Reviewed: ${project.reviewedDate}`}
                                        </div>
                                    </div>
                                    <div className={styles.listActions}>
                                        <span className={`${styles.badge} ${project.status === 'pending' ? styles.badgePending : styles.badgeSuccess}`}>
                                            {project.status === 'pending' ? 'Pending Review' : 'Approved'}
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
                                            className={styles.secondaryBtn}
                                            style={{ fontSize: '13px', padding: '8px 16px' }}
                                        >
                                            Edit Project
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Advisors Section */}
                {activeSection === 'advisors' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>
                                Advisor Consulting Requests
                                {dashboardData.pendingAdvisorRequests > 0 && (
                                    <span className={`${styles.badge} ${styles.badgePending}`} style={{ marginLeft: '12px' }}>
                                        {dashboardData.pendingAdvisorRequests} Pending
                                    </span>
                                )}
                            </h3>

                            <div className={styles.list}>
                                {advisorRequests.map(request => (
                                    <div key={request.id} className={styles.listItem}>
                                        <div className={styles.listContent}>
                                            <div>
                                                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                                    {request.advisorName}
                                                </h4>
                                                <span className={`${styles.badge} ${styles.badgeInfo}`} style={{ display: 'inline-block', marginBottom: '8px' }}>
                                                    {request.expertise}
                                                </span>
                                            </div>
                                            <p style={{ margin: '8px 0', fontSize: '14px', color: 'var(--text-primary)' }}>{request.message}</p>
                                            <div className={styles.listMeta}>
                                                Requested: {request.requestDate}
                                                {request.appointmentDate && ` • Appointment: ${request.appointmentDate}`}
                                            </div>
                                        </div>
                                        <div className={styles.listActions}>
                                            <span className={`${styles.badge} ${request.status === 'pending' ? styles.badgePending : request.status === 'accepted' ? styles.badgeSuccess : styles.badgeError}`}>
                                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                            </span>
                                            {request.status === 'pending' && (
                                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                                    <button
                                                        className={styles.primaryBtn}
                                                        style={{ fontSize: '12px', padding: '6px 12px' }}
                                                        onClick={() => handleAcceptRequest(request.id)}
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        className={styles.dangerBtn}
                                                        style={{ fontSize: '12px', padding: '6px 12px' }}
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

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button type="submit" className={styles.primaryBtn}>Save Changes</button>
                                    <button type="button" className={styles.secondaryBtn}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Overlay for Complete Info Form */}
            {showCompleteInfoForm && (
                <div
                    className={styles.modalOverlay}
                    onClick={(e) => {
                        // Close if clicked directly on overlay (not child)
                        if (e.target === e.currentTarget) {
                            if (window.isStartupFormDirty) {
                                if (window.confirm("You have unsaved changes. Are you sure you want to close?")) {
                                    setShowCompleteInfoForm(false);
                                    window.isStartupFormDirty = false;
                                }
                            } else {
                                setShowCompleteInfoForm(false);
                            }
                        }
                    }}
                >
                    <div style={{ width: '100%', maxWidth: '100%', display: 'flex', justifyContent: 'center' }}>
                        <CompleteStartupInfoForm
                            onSubmit={(formData) => {
                                console.log('Complete startup info submitted:', formData);
                                setShowCompleteInfoForm(false);
                                setShowSuccessModal(true);
                                window.isStartupFormDirty = false;
                            }}
                            onCancel={() => {
                                if (window.isStartupFormDirty) {
                                    if (window.confirm("You have unsaved changes. Are you sure you want to close?")) {
                                        setShowCompleteInfoForm(false);
                                        window.isStartupFormDirty = false;
                                    }
                                } else {
                                    setShowCompleteInfoForm(false);
                                }
                            }}
                            onDirtyChange={(isDirty) => {
                                window.isStartupFormDirty = isDirty;
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <SuccessModal
                    onClose={() => setShowSuccessModal(false)}
                    title="Profile Submitted Successfully!"
                    message="Thank you for completing your startup profile. Our team will review your information and get back to you soon."
                />
            )}
        </div>
    );
}
