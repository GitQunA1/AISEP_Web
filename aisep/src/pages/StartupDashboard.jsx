import React, { useState } from 'react';
import { TrendingUp, Users, FileText, CheckCircle, AlertCircle, Calendar, MessageSquare, PlusCircle, Eye, Shield, Send, Zap, RefreshCw } from 'lucide-react';
import styles from '../styles/SharedDashboard.module.css';
import CompleteStartupInfoForm from '../components/startup/CompleteStartupInfoForm';
import SuccessModal from '../components/common/SuccessModal';
import FeedHeader from '../components/feed/FeedHeader';
import ProjectValidationService from '../services/ProjectValidation.js';
import BlockchainService from '../services/BlockchainService.js';
import AIEvaluationService from '../services/AIEvaluationService.js';
import { PROJECT_STATUS, isUserEditable } from '../constants/ProjectStatus.js';

/**
 * StartupDashboard - Comprehensive dashboard for startup founders
 * Features: Overview stats, Profile completion, Documents, AI Score, Advisor requests
 */
export default function StartupDashboard({ user }) {
    const [activeSection, setActiveSection] = useState('overview');
    const [showCompleteInfoForm, setShowCompleteInfoForm] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isProtectingDocuments, setIsProtectingDocuments] = useState(false);
    const [isEvaluatingAI, setIsEvaluatingAI] = useState(false);
    const [isSubmittingProject, setIsSubmittingProject] = useState(false);
    const [isPublishingProject, setIsPublishingProject] = useState(false);
    const [blockchainProof, setBlockchainProof] = useState(null);
    const [project, setProject] = useState({
        id: 1,
        name: 'AI Analytics Platform',
        tagline: 'Real-time data analytics with AI',
        status: PROJECT_STATUS.DRAFT,
        createdAt: '2024-01-15',
        submittedDate: null,
        reviewedDate: null,
        feedback: null,
        description: 'A comprehensive AI-powered analytics platform for real-time data insights',
        industry: 'AI/ML',
        stage: 'MVP',
        // BR-08: Blockchain fields
        blockchainHash: null,
        transactionHash: null,
        ipProtectionDate: null,
        // BR-10: AI Evaluation fields
        aiEvaluation: null,
        // BR-19: Publication fields
        isPublished: false
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

    // BR-08: Protect Documents on Blockchain
    const handleProtectDocuments = async () => {
        setIsProtectingDocuments(true);
        try {
            // Get files from documents state
            const filesToProtect = documents
                .filter(doc => doc.type && ['pdf', 'docx', 'xlsx'].includes(doc.type))
                .map(doc => new File([new ArrayBuffer()], doc.name, { type: 'application/octet-stream' }));

            if (filesToProtect.length === 0) {
                alert('Please upload at least one document before protecting on blockchain');
                setIsProtectingDocuments(false);
                return;
            }

            const result = await BlockchainService.protectDocumentsOnBlockchain(filesToProtect, project.id);
            
            if (result.success) {
                // Update project with blockchain info
                const updatedProject = {
                    ...project,
                    blockchainHash: result.blockchainHash,
                    transactionHash: result.transactionHash,
                    ipProtectionDate: result.timestamp,
                    status: PROJECT_STATUS.IP_PROTECTED
                };
                setProject(updatedProject);
                setBlockchainProof(BlockchainService.getBlockchainProof(updatedProject));
                
                setSuccessMessage('✅ Documents protected on blockchain successfully!');
                setShowSuccessModal(true);

                // Auto-trigger AI Evaluation (BR-10)
                setTimeout(() => handleAIEvaluation(updatedProject), 1500);
            } else {
                alert('Failed to protect documents: ' + result.error);
            }
        } catch (error) {
            console.error('Protection error:', error);
            alert('Error protecting documents: ' + error.message);
        } finally {
            setIsProtectingDocuments(false);
        }
    };

    // BR-10: Trigger AI Evaluation
    const handleAIEvaluation = async (projectData) => {
        setIsEvaluatingAI(true);
        try {
            const result = await AIEvaluationService.evaluateProject(projectData, documents);
            
            if (result.success) {
                const updatedProject = {
                    ...projectData,
                    aiEvaluation: result.evaluation
                };
                setProject(updatedProject);
                
                setSuccessMessage(`🤖 AI Evaluation Complete!\n\nScore: ${result.evaluation.startupScore}/100 (${result.evaluation.scoreCategory})`);
                setShowSuccessModal(true);
            } else {
                console.error('AI Evaluation error:', result.error);
            }
        } catch (error) {
            console.error('AI evaluation error:', error);
        } finally {
            setIsEvaluatingAI(false);
        }
    };

    // BR-15: Submit Project for Staff Review
    const handleSubmitForReview = () => {
        // Check email verification (BR-02)
        if (user && !user.emailVerified) {
            alert('Please verify your email before submitting your project');
            return;
        }

        // Check prerequisites
        if (!project.blockchainHash) {
            alert('Please protect your documents on blockchain first');
            return;
        }

        if (!project.aiEvaluation) {
            alert('Please complete AI evaluation first');
            return;
        }

        setIsSubmittingProject(true);
        try {
            // Update status to SUBMITTED
            const updatedProject = {
                ...project,
                status: PROJECT_STATUS.SUBMITTED,
                submittedDate: new Date().toISOString().split('T')[0]
            };
            setProject(updatedProject);
            
            setSuccessMessage('✅ Project submitted for staff review!\n\nOur team will review it within 2-3 business days.');
            setShowSuccessModal(true);
        } catch (error) {
            alert('Error submitting project: ' + error.message);
        } finally {
            setIsSubmittingProject(false);
        }
    };

    // BR-19: Publish Project
    const handlePublishProject = async () => {
        // Check all publication prerequisites (BR-19)
        const checklist = ProjectValidationService.getPublicationChecklist(project);
        
        if (!checklist.canPublish) {
            const remaining = checklist.remainingItems.join(', ');
            alert(`Cannot publish yet. Remaining: ${remaining}`);
            return;
        }

        setIsPublishingProject(true);
        try {
            const updatedProject = {
                ...project,
                status: PROJECT_STATUS.PUBLISHED,
                isPublished: true
            };
            setProject(updatedProject);
            
            setSuccessMessage('🎉 Congratulations!\n\nYour project is now published and visible to investors and advisors!');
            setShowSuccessModal(true);
        } catch (error) {
            alert('Error publishing project: ' + error.message);
        } finally {
            setIsPublishingProject(false);
        }
    };

    // BR-18: Resubmit After Rejection
    const handleResubmitProject = () => {
        setIsSubmittingProject(true);
        try {
            const updatedProject = {
                ...project,
                status: PROJECT_STATUS.SUBMITTED,
                submittedDate: new Date().toISOString().split('T')[0],
                feedback: null
            };
            setProject(updatedProject);
            
            setSuccessMessage('✅ Project resubmitted for review!');
            setShowSuccessModal(true);
        } catch (error) {
            alert('Error resubmitting project: ' + error.message);
        } finally {
            setIsSubmittingProject(false);
        }
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
                                            Status: <strong>{project.status}</strong>
                                            {project.submittedDate && ` • Submitted: ${project.submittedDate}`}
                                            {project.reviewedDate && ` • Reviewed: ${project.reviewedDate}`}
                                        </div>

                                        {/* Blockchain Proof Display */}
                                        {blockchainProof && blockchainProof.available && (
                                            <div style={{
                                                background: '#F0FDF4',
                                                border: '1px solid #86EFAC',
                                                borderRadius: '8px',
                                                padding: '12px',
                                                marginTop: '12px',
                                                fontSize: '13px'
                                            }}>
                                                <div style={{ color: '#166534', fontWeight: '600', marginBottom: '6px' }}>
                                                    ✅ IP Protected on Blockchain
                                                </div>
                                                <div style={{ color: '#15803D', fontSize: '12px' }}>
                                                    Hash: {blockchainProof.shortHash}
                                                </div>
                                                <div style={{ color: '#15803D', fontSize: '12px' }}>
                                                    Timestamp: {blockchainProof.timestamp}
                                                </div>
                                            </div>
                                        )}

                                        {/* AI Evaluation Display */}
                                        {project.aiEvaluation && (
                                            <div style={{
                                                background: '#F5F3FF',
                                                border: '1px solid #C4B5FD',
                                                borderRadius: '8px',
                                                padding: '12px',
                                                marginTop: '12px',
                                                fontSize: '13px'
                                            }}>
                                                <div style={{ color: '#5B21B6', fontWeight: '600', marginBottom: '6px' }}>
                                                    🤖 AI Evaluation: {project.aiEvaluation.startupScore}/100 ({project.aiEvaluation.scoreCategory})
                                                </div>
                                                <div style={{ color: '#6D28D9', fontSize: '11px' }}>
                                                    {project.aiEvaluation.disclaimer}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className={styles.listActions} style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                                        {/* Status Badge */}
                                        <span className={`${styles.badge}`} style={{
                                            background: project.status === PROJECT_STATUS.DRAFT ? '#E5E7EB' :
                                                       project.status === PROJECT_STATUS.IP_PROTECTED ? '#DBEAFE' :
                                                       project.status === PROJECT_STATUS.SUBMITTED ? '#FEF3C7' :
                                                       project.status === PROJECT_STATUS.APPROVED ? '#D1FAE5' :
                                                       project.status === PROJECT_STATUS.PUBLISHED ? '#DCFCE7' : '#FEE2E2',
                                            color: project.status === PROJECT_STATUS.DRAFT ? '#374151' :
                                                   project.status === PROJECT_STATUS.IP_PROTECTED ? '#1E40AF' :
                                                   project.status === PROJECT_STATUS.SUBMITTED ? '#92400E' :
                                                   project.status === PROJECT_STATUS.APPROVED ? '#065F46' :
                                                   project.status === PROJECT_STATUS.PUBLISHED ? '#166534' : '#991B1B'
                                        }}>
                                            {project.status}
                                        </span>

                                        {/* Edit Button - Only if editable */}
                                        {isUserEditable(project.status) && (
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
                                                ✏️ Edit Project
                                            </button>
                                        )}

                                        {/* BR-08: Protect Documents Button */}
                                        {!project.blockchainHash && project.status === PROJECT_STATUS.DRAFT && (
                                            <button
                                                onClick={handleProtectDocuments}
                                                disabled={isProtectingDocuments}
                                                style={{
                                                    padding: '10px 16px',
                                                    background: '#3B82F6',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: isProtectingDocuments ? 'not-allowed' : 'pointer',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    opacity: isProtectingDocuments ? 0.6 : 1
                                                }}
                                            >
                                                <Shield size={16} />
                                                {isProtectingDocuments ? 'Protecting...' : 'Protect Documents'}
                                            </button>
                                        )}

                                        {/* BR-15: Submit for Review Button */}
                                        {project.status === PROJECT_STATUS.IP_PROTECTED && project.aiEvaluation && (
                                            <button
                                                onClick={handleSubmitForReview}
                                                disabled={isSubmittingProject}
                                                style={{
                                                    padding: '10px 16px',
                                                    background: '#F59E0B',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: isSubmittingProject ? 'not-allowed' : 'pointer',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    opacity: isSubmittingProject ? 0.6 : 1
                                                }}
                                            >
                                                <Send size={16} />
                                                {isSubmittingProject ? 'Submitting...' : 'Submit for Review'}
                                            </button>
                                        )}

                                        {/* BR-19: Publish Button */}
                                        {project.status === PROJECT_STATUS.APPROVED && (
                                            <button
                                                onClick={handlePublishProject}
                                                disabled={isPublishingProject}
                                                style={{
                                                    padding: '10px 16px',
                                                    background: '#10B981',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: isPublishingProject ? 'not-allowed' : 'pointer',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    opacity: isPublishingProject ? 0.6 : 1
                                                }}
                                            >
                                                <Zap size={16} />
                                                {isPublishingProject ? 'Publishing...' : 'Publish Project'}
                                            </button>
                                        )}

                                        {/* BR-18: Resubmit After Rejection */}
                                        {project.status === PROJECT_STATUS.REJECTED && (
                                            <button
                                                onClick={handleResubmitProject}
                                                disabled={isSubmittingProject}
                                                style={{
                                                    padding: '10px 16px',
                                                    background: '#8B5CF6',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: isSubmittingProject ? 'not-allowed' : 'pointer',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    opacity: isSubmittingProject ? 0.6 : 1
                                                }}
                                            >
                                                <RefreshCw size={16} />
                                                {isSubmittingProject ? 'Resubmitting...' : 'Resubmit Project'}
                                            </button>
                                        )}

                                        {/* Publication Checklist for IP_PROTECTED status */}
                                        {project.status === PROJECT_STATUS.IP_PROTECTED && !project.aiEvaluation && (
                                            <div style={{
                                                fontSize: '12px',
                                                color: '#6B7280',
                                                textAlign: 'right',
                                                marginTop: '4px'
                                            }}>
                                                ⏳ Running AI evaluation...
                                            </div>
                                        )}
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
                    title={successMessage.split('\n')[0] || 'Success!'}
                    message={successMessage.split('\n').slice(1).join('\n') || successMessage}
                />
            )}
        </div>
    );
}
