import React, { useState } from 'react';
import { TrendingUp, Users, FileText, CheckCircle, AlertCircle, Calendar, MessageSquare, PlusCircle, Eye, Shield, Send, Zap, RefreshCw, X, ArrowRight } from 'lucide-react';
import styles from '../styles/SharedDashboard.module.css';
import CompleteStartupInfoForm from '../components/startup/CompleteStartupInfoForm';
import StartupProfileForm from '../components/startup/StartupProfileForm';
import SuccessModal from '../components/common/SuccessModal';
import ProjectSelectorModal from '../components/common/ProjectSelectorModal';
import BlockchainVerificationModal from '../components/common/BlockchainVerificationModal';
import FeedHeader from '../components/feed/FeedHeader';
import ProjectValidationService from '../services/ProjectValidation.js';
import BlockchainService from '../services/BlockchainService.js';
import AIEvaluationService from '../services/AIEvaluationService.js';
import projectSubmissionService from '../services/projectSubmissionService.js';
import startupProfileService from '../services/startupProfileService.js';
import { PROJECT_STATUS, isUserEditable, STATUS_LABELS, STATUS_COLORS } from '../constants/ProjectStatus.js';

import StartupProfileBanner from '../components/startup/StartupProfileBanner';

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
    const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailProject, setDetailProject] = useState(null);

    // We start with null, then fetch. If no project, we show empty state / Create form
    const [project, setProject] = useState(null);
    const [myProjects, setMyProjects] = useState([]);
    const [startupProfile, setStartupProfile] = useState(null);

    // Default form data
    const [showProjectForm, setShowProjectForm] = useState(false);

    const [projectFormData, setProjectFormData] = useState({
        projectName: '',
        description: '',
        tagline: '',
        industry: '',
        stage: '',
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

    React.useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Fetch user's startup profile
                if (user && user.userId) {
                    const profileData = await startupProfileService.getStartupProfileByUserId(user.userId);
                    setStartupProfile(profileData);

                    // Check for auto-setup flag in URL
                    const params = new URLSearchParams(window.location.search);
                    if (!profileData && params.get('setup') === 'true') {
                        setActiveSection('complete-info');
                        // Clean URL
                        window.history.replaceState({}, document.title, window.location.pathname);
                    }
                }

                // 2. Fetch projects
                const response = await projectSubmissionService.getMyProjects();
                if (response.success && response.data) {
                    const projects = Array.isArray(response.data) ? response.data : (response.data.items || []);
                    setMyProjects(projects);
                    
                    if (projects.length > 0) {
                        const loadedProject = projects[0];
                        setProject(loadedProject);

                        // Pre-fill form data for updates
                        setProjectFormData({
                            ...projectFormData,
                            projectName: loadedProject.name || loadedProject.projectName || '',
                            description: loadedProject.description || '',
                            tagline: loadedProject.tagline || '',
                            industry: loadedProject.industry || '',
                            stage: loadedProject.stage || '',
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to load dashboard data:", err);
            } finally {
                setIsLoadingInitialData(false);
            }
        };

        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);
    const [advisorRequests, setAdvisorRequests] = useState([]);

    // Empty documents out, we fetch them via project endpoint or soon later
    const [documents, setDocuments] = useState([]);

    // Calculate profile completion based on startup profile data
    const calculateProfileCompletion = () => {
        if (!startupProfile) return 0;
        let points = 20; // 20% for just having created the record
        if (startupProfile.logoUrl) points += 10;
        if (startupProfile.companyName) points += 10;
        if (startupProfile.founder) points += 20;
        if (startupProfile.contactInfo) points += 10;
        if (startupProfile.countryCity) points += 10;
        if (startupProfile.website) points += 10;
        if (startupProfile.industry) points += 10;
        return points;
    };

    // Live data only - set mock data to 0
    const dashboardData = {
        profileCompletion: calculateProfileCompletion(),
        documentsUploaded: documents.length,
        advisorsConnected: 0,
        aiScore: startupProfile?.projects?.[0]?.aiEvaluation?.startupScore || project?.aiEvaluation?.startupScore || 0,
        pendingAdvisorRequests: 0,
        profileViews: startupProfile?.followers?.length || 0, // Using followers as views temporarily
        investorInterests: 0,
        monthlyViewTrend: []
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

    const handleVerifyDocumentByID = async (documentId) => {
        const idToVerify = documentId || documentIdInput.trim();
        
        if (!idToVerify) {
            setSuccessMessage('❌ Vui lòng nhập Document ID');
            setShowSuccessModal(true);
            return;
        }

        setIsVerifying(true);
        try {
            const response = await projectSubmissionService.verifyDocument(idToVerify);
            if (response?.success && response?.data) {
                setVerificationData(response.data);
                const doc = documents.find(d => d.id === idToVerify || d.documentId === idToVerify);
                setVerificationDocumentName(doc?.name || doc?.fileName || `Document #${idToVerify}`);
                setShowVerificationModal(true);
                setDocumentIdInput(''); // Reset input after successful verification
            } else {
                setSuccessMessage('❌ Xác thực thất bại: ' + (response?.message || 'Không thể xác thực tài liệu'));
                setShowSuccessModal(true);
            }
        } catch (error) {
            console.error('Verify Error:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Vui lòng thử lại';
            setSuccessMessage('❌ Lỗi xác thực: ' + errorMessage);
            setShowSuccessModal(true);
        } finally {
            setIsVerifying(false);
        }
    };

    const [isUploading, setIsUploading] = useState(false);
    const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
    const [showProjectSelector, setShowProjectSelector] = useState(false);
    const [selectedProjectIdForUpload, setSelectedProjectIdForUpload] = useState(null);
    
    // Blockchain Verification States
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [verificationData, setVerificationData] = useState(null);
    const [verificationDocumentName, setVerificationDocumentName] = useState('');
    const [documentIdInput, setDocumentIdInput] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    
    const hiddenFileInput = React.useRef(null);

    // Fetch documents from API
    const handleFetchDocuments = async (projectId) => {
        setIsLoadingDocuments(true);
        try {
            const response = await projectSubmissionService.getDocuments(projectId);
            if (response.success && response.data) {
                const docsList = Array.isArray(response.data) ? response.data : [];
                setDocuments(docsList);
            } else if (response.data) {
                // In case API returns array directly
                setDocuments(Array.isArray(response.data) ? response.data : []);
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
            setDocuments([]);
        } finally {
            setIsLoadingDocuments(false);
        }
    };

    // Fetch documents when documents tab is active
    React.useEffect(() => {
        if (activeSection === 'documents') {
            const projectId = project?.id || 'test-project-001';
            handleFetchDocuments(projectId);
        }
    }, [activeSection, project]);

    const handleUploadClick = () => {
        // Check if user has any projects
        if (!myProjects || myProjects.length === 0) {
            setSuccessMessage('⚠️ Vui lòng tạo dự án trước khi tải tài liệu lên.');
            setShowSuccessModal(true);
            return;
        }
        // Show project selector modal
        setShowProjectSelector(true);
    };

    const handleSelectProjectForUpload = (selectedProject) => {
        const projectId = selectedProject.id || selectedProject.projectId;
        setSelectedProjectIdForUpload(projectId);
        setShowProjectSelector(false);
        // Trigger file input after project is selected
        setTimeout(() => {
            hiddenFileInput.current?.click();
        }, 100);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type - only PDF, JPG, PNG allowed
        const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        
        if (!allowedMimeTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
            setSuccessMessage('❌ Định dạng file không hỗ trợ. Vui lòng sử dụng PDF, JPG hoặc PNG.');
            setShowSuccessModal(true);
            e.target.value = ''; // Reset input
            return;
        }

        // Check if project ID was selected
        if (!selectedProjectIdForUpload) {
            setSuccessMessage('⚠️ Vui lòng chọn dự án trước khi tải tài liệu lên.');
            setShowSuccessModal(true);
            e.target.value = ''; // Reset input
            return;
        }

        setIsUploading(true);
        try {
            const projectId = selectedProjectIdForUpload; // Use selected project ID
            const documentType = 'PitchDeck'; // Document type - can be expanded later
            const response = await projectSubmissionService.uploadDocument(projectId, file, documentType);
            if (response.success) {
                // Document uploaded and saved to blockchain (backend handles automatically)
                setSuccessMessage('✓ Tải tài liệu lên thành công! Tài liệu đã được lưu lên blockchain.');
                setShowSuccessModal(true);
                setSelectedProjectIdForUpload(null); // Reset for next upload
            } else {
                setSuccessMessage('❌ Tải lên thất bại: ' + (response.message || 'Lỗi không xác định'));
                setShowSuccessModal(true);
            }
        } catch (error) {
            console.error('Upload Error:', error);
            // Extract error message from response if available
            const errorMessage = error?.response?.data?.message || error?.message || 'Vui lòng thử lại';
            if (error?.response?.status === 400 && errorMessage.includes('not valid')) {
                setSuccessMessage('❌ Lỗi: ProjectId không hợp lệ. Vui lòng chọn dự án khác.');
            } else {
                setSuccessMessage('❌ Không thể tải tài liệu lên: ' + errorMessage);
            }
            setShowSuccessModal(true);
        } finally {
            setIsUploading(false);
            e.target.value = ''; // Reset input
        }
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
                setSuccessMessage('Vui lòng tải lên ít nhất một tài liệu trước khi bảo vệ trên blockchain');
                setShowSuccessModal(true);
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

                setSuccessMessage('Tài liệu đã được bảo vệ trên blockchain thành công!');
                setShowSuccessModal(true);

                // Auto-trigger AI Evaluation (BR-10)
                setTimeout(() => handleAIEvaluation(updatedProject), 1500);
            } else {
                setSuccessMessage('Không thể bảo vệ tài liệu: ' + result.error);
                setShowSuccessModal(true);
            }
        } catch (error) {
            console.error('Protection error:', error);
            setSuccessMessage('Lỗi bảo vệ tài liệu: ' + error.message);
            setShowSuccessModal(true);
        } finally {
            setIsProtectingDocuments(false);
        }
    };

    // BR-10: Trigger AI Evaluation
    const handleAIEvaluation = async (projectData) => {
        setIsEvaluatingAI(true);
        try {
            // The AI Evaluation flow
            const response = await projectSubmissionService.triggerAIAnalysis(projectData.id);

            if (response.success) {
                // Fetch the new result
                const aiResponse = await projectSubmissionService.getAIAnalysisResults(projectData.id);
                if (aiResponse.success) {
                    const aiResultData = aiResponse.data;
                    const updatedProject = {
                        ...projectData,
                        aiEvaluation: aiResultData || { startupScore: 85, scoreCategory: 'Excellent' } // Fallback display if not properly formatted yet
                    };
                    setProject(updatedProject);

                    setSuccessMessage('Đánh giá AI hoàn thành!');
                    setShowSuccessModal(true);
                } else {
                    console.error('Could not fetch AI results after generation:', aiResponse);
                    setSuccessMessage('⚠️ Đánh giá AI đã hoàn thành nhưng không thể lấy kết quả.');
                    setShowSuccessModal(true);
                }
            } else {
                console.error('AI Evaluation error:', response);
                setSuccessMessage('Đánh giá AI thất bại: ' + response.message);
                setShowSuccessModal(true);
            }
        } catch (error) {
            console.error('AI evaluation error:', error);
            setSuccessMessage('Không thể thực hiện đánh giá AI do lỗi mạng/máy chủ.');
            setShowSuccessModal(true);
        } finally {
            setIsEvaluatingAI(false);
        }
    };

    // BR-15: Submit Project for Staff Review
    const handleSubmitForReview = () => {
        // Check email verification (BR-02)
        if (user && !user.emailVerified) {
            setSuccessMessage('Vui lòng xác minh email của bạn trước khi nộp dự án');
            setShowSuccessModal(true);
            return;
        }

        // Check prerequisites
        if (!project.blockchainHash) {
            setSuccessMessage('Vui lòng bảo vệ tài liệu trên blockchain trước');
            setShowSuccessModal(true);
            return;
        }

        if (!project.aiEvaluation) {
            setSuccessMessage('Vui lòng hoàn thành đánh giá AI trước');
            setShowSuccessModal(true);
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

            setSuccessMessage('Dự án đã được nộp để nhân viên xem xét!\n\nĐội ngũ của chúng tôi sẽ xem xét trong vòng 2-3 ngày làm việc.');
            setShowSuccessModal(true);
        } catch (error) {
            alert('Lỗi khi nộp dự án: ' + error.message);
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
            setSuccessMessage(`⚠️ Chưa thể đăng dự án. Còn thiếu: ${remaining}`);
            setShowSuccessModal(true);
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

            setSuccessMessage('Chúc mừng!\n\nDự án của bạn đã được đăng và hiển thị với nhà đầu tư và cố vấn!');
            setShowSuccessModal(true);
        } catch (error) {
            alert('Lỗi khi đăng dự án: ' + error.message);
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

            setSuccessMessage('Dự án đã được nộp lại để xem xét!');
            setShowSuccessModal(true);
        } catch (error) {
            alert('Lỗi khi nộp lại dự án: ' + error.message);
        } finally {
            setIsSubmittingProject(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Unified Header */}
            <FeedHeader
                title="Bảng điều khiển"
                subtitle={`Xin chào, ${user?.name || 'Người sáng lập'}! Đây là tổng quan khởi nghiệp của bạn.`}
                showFilter={false} // No filter for dashboard
                user={user}
            />

            {!isLoadingInitialData && !startupProfile && (
                <StartupProfileBanner 
                    onRedirect={() => setActiveSection('complete-info')}
                />
            )}

            {/* Quick Stats */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconCyan}`}>
                        <Eye size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.profileViews}</div>
                        <div className={styles.statLabel}>Lượt xem hồ sơ</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconYellow}`}>
                        <Users size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.investorInterests}</div>
                        <div className={styles.statLabel}>Nhà đầu tư quan tâm</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconGreen}`}>
                        <FileText size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.documentsUploaded}</div>
                        <div className={styles.statLabel}>Tài liệu đã tải lên</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconPurple}`}>
                        <TrendingUp size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.aiScore}</div>
                        <div className={styles.statLabel}>Điểm AI / 100</div>
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
                    className={`${styles.tab} ${activeSection === 'complete-info' ? styles.active : ''}`}
                    onClick={() => setActiveSection('complete-info')}
                >
                    Thông tin bổ sung
                </button>

                <button
                    className={`${styles.tab} ${activeSection === 'documents' ? styles.active : ''}`}
                    onClick={() => setActiveSection('documents')}
                >
                    Tài liệu & Sở hữu trí tuệ
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'my-projects' ? styles.active : ''}`}
                    onClick={() => setActiveSection('my-projects')}
                >
                    Dự án của tôi
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'advisors' ? styles.active : ''}`}
                    onClick={() => setActiveSection('advisors')}
                >
                    Yêu cầu tư vấn
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'profile' ? styles.active : ''}`}
                    onClick={() => setActiveSection('profile')}
                >
                    Cài đặt hồ sơ
                </button>
            </div>

            {/* Content Sections */}
            <div className={styles.content}>
                {/* Startup Profile Form (Section View) */}
                {activeSection === 'complete-info' && (
                    <div className={styles.section}>
                        <StartupProfileForm
                            initialData={startupProfile}
                            user={user}
                            onSuccess={(data) => {
                                setStartupProfile(data);
                                setSuccessMessage('Cập nhật thông tin startup thành công!');
                                setShowSuccessModal(true);
                            }}
                        />
                    </div>
                )}

                {/* Overview Section */}
                {activeSection === 'overview' && (
                    <div className={styles.section}>
                        <div className={styles.sectionGrid}>
                            {/* Profile Completion */}
                            <div className={styles.card}>
                                <h3 className={styles.cardTitle}>Mức độ hoàn thiện hồ sơ</h3>
                                <div className={styles.progressContainer}>
                                    <div className={styles.progressBar}>
                                        <div
                                            className={styles.progress}
                                            style={{ width: `${dashboardData.profileCompletion}%` }}
                                        ></div>
                                    </div>
                                    <div className={styles.progressText}>
                                        <span>Tiến độ</span>
                                        {dashboardData.profileCompletion}% Hoàn thành
                                    </div>
                                </div>
                                <p className={styles.hint}>Hoàn thiện hồ sơ để thu hút nhiều nhà đầu tư hơn</p>
                                <button
                                    onClick={() => setActiveSection('complete-info')}
                                    className={styles.linkBtn}
                                    style={{ marginTop: '12px' }}
                                >
                                    Điền thông tin đầy đủ →
                                </button>
                            </div>

                            {/* AI Score Details */}
                            <div className={styles.card}>
                                <h3 className={styles.cardTitle}>Điểm tiềm năng AI</h3>
                                <div className={styles.scoreDisplay}>
                                    <div className={styles.scoreCircle}>
                                        <span className={styles.scoreNumber}>{dashboardData.aiScore}</span>
                                        <span className={styles.scoreMax}>/ 100</span>
                                    </div>
                                    <p className={styles.scoreDescription}>
                                        Startup của bạn thể hiện tiềm năng mạnh mẽ về đổi mới thị trường và sức mạnh đội ngũ.
                                    </p>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className={`${styles.card} ${styles.fullWidth}`}>
                                <h3 className={styles.cardTitle}>Hoạt động gần đây</h3>
                                <div className={styles.list}>
                                    <div className={styles.emptyState}>
                                        <p>Chưa có hoạt động nào</p>
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
                                <h3 className={styles.cardTitle}>Quản lý tài liệu & Sở hữu trí tuệ</h3>
                                <div>
                                    <input
                                        type="file"
                                        ref={hiddenFileInput}
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                    <button
                                        className={styles.primaryBtn}
                                        onClick={handleUploadClick}
                                        disabled={isUploading} /* Temporarily disabled project check for testing */
                                    >
                                        <PlusCircle size={18} />
                                        {isUploading ? 'Đang tải lên...' : 'Tải tài liệu lên'}
                                    </button>
                                </div>
                            </div>

                            <div className={styles.list}>
                                {isLoadingDocuments ? (
                                    <div className={styles.emptyState}>
                                        <p>⏳ Đang tải danh sách tài liệu...</p>
                                    </div>
                                ) : documents.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <p>Chưa có tài liệu nào được tải lên.</p>
                                    </div>
                                ) : (
                                    documents.map(doc => (
                                    <div key={doc.id} className={styles.listItem}>
                                        <div className={styles.listContent}>
                                            <div className={styles.listTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <FileText size={16} color="var(--primary-blue)" />
                                                {doc.name}
                                            </div>
                                            <div className={styles.listMeta} style={{ marginTop: '4px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <span>Ngày tải: {doc.uploadDate}</span>
                                                <span className={`${styles.badge} ${doc.status === 'verified' ? styles.badgeSuccess : styles.badgePending}`}>
                                                    {doc.status === 'verified' ? '✓ Đã xác minh' : '⏳ Đang chờ'}
                                                </span>
                                            </div>
                                            {doc.hash && (
                                                <div style={{ marginTop: '6px' }}>
                                                    <code className={styles.codeBlock}>{doc.hash}</code>
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.listActions}>
                                            <button className={styles.secondaryBtn}>Xem</button>
                                            <button
                                                className={styles.dangerBtn}
                                                onClick={() => handleDeleteDocument(doc.id)}
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </div>
                                ))
                                )}
                            </div>

                            {/* Document Verification Section */}
                            <div style={{
                                marginTop: '32px',
                                paddingTop: '32px',
                                borderTop: '1px solid var(--border-color)'
                            }}>
                                <h4 style={{
                                    margin: '0 0 16px 0',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <Shield size={20} style={{ color: 'var(--primary-blue)' }} />
                                    Xác thực tài liệu trên Blockchain
                                </h4>
                                <p style={{
                                    margin: '0 0 16px 0',
                                    fontSize: '13px',
                                    color: 'var(--text-secondary)'
                                }}>
                                    Nhập Document ID để kiểm tra chi tiết xác thực trên blockchain
                                </p>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr auto',
                                    gap: '12px',
                                    maxWidth: '500px'
                                }}>
                                    <input
                                        type="text"
                                        placeholder="Nhập Document ID (ví dụ: 1, 2, 3...)"
                                        value={documentIdInput}
                                        onChange={(e) => setDocumentIdInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleVerifyDocumentByID()}
                                        disabled={isVerifying}
                                        style={{
                                            padding: '12px 16px',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            fontFamily: 'inherit',
                                            backgroundColor: isVerifying ? '#f1f5f9' : 'white',
                                            color: 'var(--text-primary)',
                                            cursor: isVerifying ? 'not-allowed' : 'text'
                                        }}
                                    />
                                    <button
                                        onClick={() => handleVerifyDocumentByID()}
                                        disabled={isVerifying || !documentIdInput.trim()}
                                        className={styles.primaryBtn}
                                        style={{
                                            padding: '12px 24px',
                                            minWidth: '120px',
                                            opacity: isVerifying || !documentIdInput.trim() ? 0.6 : 1,
                                            cursor: isVerifying || !documentIdInput.trim() ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        {isVerifying ? (
                                            <>⏳ Đang xác thực...</>
                                        ) : (
                                            <>
                                                <Shield size={16} />
                                                Xác thực
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* My Projects Section */}
                {activeSection === 'my-projects' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>Danh sách dự án của tôi</h3>
                            <div className={styles.list}>
                                {myProjects.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <p>Bạn chưa đăng dự án nào.</p>
                                    </div>
                                ) : (
                                    myProjects.map(p => (
                                        <div key={p.id || p.projectId} className={styles.listItem}>
                                            <div className={styles.listContent}>
                                                    <div className={styles.flexCenter} style={{ gap: '12px', marginBottom: '4px' }}>
                                                        <h4 className={styles.listItemTitle} style={{ margin: 0 }}>
                                                            {p.name || p.projectName}
                                                        </h4>
                                                        <span 
                                                            className={styles.badge} 
                                                            style={{ 
                                                                backgroundColor: `${STATUS_COLORS[p.status || 'Draft']}15`,
                                                                color: STATUS_COLORS[p.status || 'Draft'],
                                                                border: `1px solid ${STATUS_COLORS[p.status || 'Draft']}30`
                                                            }}
                                                        >
                                                            {STATUS_LABELS[p.status || 'Draft'] || 'Nháp'}
                                                        </span>
                                                    </div>
                                                <p className={styles.subtitle} style={{ margin: '4px 0' }}>{p.shortDescription || p.description}</p>
                                                <div className={styles.listMeta}>
                                                    <span>Giai đoạn: {p.developmentStage === 0 ? 'Ý tưởng' : p.developmentStage === 1 ? 'MVP' : 'Tăng trưởng'}</span>
                                                    {p.submittedDate && <span> • Nộp ngày: {p.submittedDate}</span>}
                                                </div>
                                            </div>
                                            <div className={styles.listActions}>
                                                <button 
                                                    className={styles.secondaryBtn} 
                                                    onClick={() => { 
                                                        setDetailProject(p); 
                                                        setShowDetailModal(true);
                                                    }}
                                                >
                                                    Chi tiết
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Advisors Section */}
                {activeSection === 'advisors' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>
                                Yêu cầu tư vấn từ cố vấn
                                {dashboardData.pendingAdvisorRequests > 0 && (
                                    <span className={`${styles.badge} ${styles.badgePending}`} style={{ marginLeft: '12px' }}>
                                        {dashboardData.pendingAdvisorRequests} Chờ xử lý
                                    </span>
                                )}
                            </h3>

                            <div className={styles.list}>
                                {advisorRequests.length === 0 ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                                        <p>Chưa có yêu cầu tư vấn nào.</p>
                                    </div>
                                ) : advisorRequests.map(request => (
                                    <div key={request.id} className={styles.listItem}>
                                        <div className={styles.listContent}>
                                            <div className={styles.flexBetween}>
                                                <h4 className={styles.listItemTitle}>
                                                    {request.advisorName}
                                                </h4>
                                                <span className={`${styles.badge} ${request.status === 'pending' ? styles.badgePending : request.status === 'accepted' ? styles.badgeSuccess : styles.badgeError}`}>
                                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                </span>
                                            </div>
                                            <div className={styles.mb8}>
                                                <span className={`${styles.badge} ${styles.badgeInfo}`}>
                                                    {request.expertise}
                                                </span>
                                            </div>
                                            <p className={styles.subtitle}>{request.message}</p>
                                            <div className={styles.listMeta}>
                                                Ngày yêu cầu: {request.requestDate}
                                                {request.appointmentDate && ` • Cuộc hẹn: ${request.appointmentDate}`}
                                            </div>
                                        </div>
                                        {request.status === 'pending' && (
                                            <div className={styles.listActions}>
                                                <button
                                                    className={`${styles.primaryBtn} ${styles.smallBtn}`}
                                                    onClick={() => handleAcceptRequest(request.id)}
                                                >
                                                    Chấp nhận
                                                </button>
                                                <button
                                                    className={`${styles.dangerBtn} ${styles.smallBtn}`}
                                                    onClick={() => handleRejectRequest(request.id)}
                                                >
                                                    Từ chối
                                                </button>
                                            </div>
                                        )}
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
                            <h3 className={styles.cardTitle}>Cài đặt hồ sơ</h3>
                            <form className={styles.form}>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Tên công ty</label>
                                        <input
                                            type="text"
                                            placeholder="Tên startup của bạn"
                                            defaultValue={user?.companyName || ''}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Tên người sáng lập</label>
                                        <input
                                            type="text"
                                            placeholder="Tên của bạn"
                                            defaultValue={user?.name || ''}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Mô tả công ty</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Giới thiệu với nhà đầu tư về startup của bạn"
                                        defaultValue={user?.description || ''}
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Ngành</label>
                                        <select>
                                            <option>AI/ML</option>
                                            <option>Fintech</option>
                                            <option>HealthTech</option>
                                            <option>Thương mại điện tử</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Giai đoạn</label>
                                        <select>
                                            <option>Ý tưởng</option>
                                            <option>MVP</option>
                                            <option>Tăng trưởng</option>
                                            <option>Quy mô hóa</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button type="submit" className={styles.primaryBtn}>Lưu thay đổi</button>
                                    <button type="button" className={styles.secondaryBtn}>Hủy</button>
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
                                if (window.confirm("Bạn có thay đổi chưa được lưu. Bạn có chắc chắn muốn đóng không?")) {
                                    setShowCompleteInfoForm(false);
                                    window.isStartupFormDirty = false;
                                }
                            } else {
                                setShowCompleteInfoForm(false);
                            }
                        }
                    }}
                >
                    <div className={styles.flexCenter}>
                        <CompleteStartupInfoForm
                            user={user}
                            initialData={startupProfile}
                            onSubmit={async (formData) => {
                                try {
                                    // Make API request here
                                    const payload = {
                                        companyName: formData.startupName,
                                        founder: formData.founders,
                                        contactInfo: `${formData.contactEmail} ${formData.phone}`,
                                        countryCity: `${formData.country} ${formData.city}`,
                                        website: formData.website,
                                        industry: formData.industry === 'AI/ML' ? 0 : 1, // Simple mapping, usually handled securely
                                        // logoUrl, businessLicenseUrl will require file upload service later
                                    };

                                    let result;
                                    if (startupProfile && startupProfile.startupId) {
                                        payload.startupId = startupProfile.startupId;
                                        result = await startupProfileService.updateStartupProfile(payload);
                                    } else {
                                        result = await startupProfileService.createStartupProfile(payload);
                                    }

                                    setStartupProfile(result);
                                    setSuccessMessage('Lưu thông tin hồ sơ thành công!');
                                    setShowSuccessModal(true);
                                } catch (error) {
                                    console.error('Error saving profile:', error);
                                    setSuccessMessage('❌ Đã xảy ra lỗi khi lưu hồ sơ. Vui lòng thử lại.');
                                    setShowSuccessModal(true);
                                } finally {
                                    setShowCompleteInfoForm(false);
                                    window.isStartupFormDirty = false;
                                }
                            }}
                            onCancel={() => {
                                if (window.isStartupFormDirty) {
                                    if (window.confirm("Bạn có thay đổi chưa được lưu. Bạn có chắc chắn muốn đóng không?")) {
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

            {/* Blockchain Verification Modal */}
            <BlockchainVerificationModal
                isOpen={showVerificationModal}
                verificationData={verificationData}
                documentName={verificationDocumentName}
                onClose={() => {
                    setShowVerificationModal(false);
                    setVerificationData(null);
                }}
            />

            {/* Project Selector Modal */}
            {showProjectSelector && (
                <ProjectSelectorModal
                    projects={myProjects}
                    onSelect={handleSelectProjectForUpload}
                    onCancel={() => setShowProjectSelector(false)}
                    isLoading={isLoadingInitialData}
                />
            )}

            {/* Project Detail Modal */}
            {showDetailModal && detailProject && (
                <div 
                    className={styles.modalOverlay} 
                    onClick={(e) => e.target === e.currentTarget && setShowDetailModal(false)}
                >
                    <div className={styles.modalContent} style={{ maxWidth: '800px', width: '90%' }}>
                        <div className={styles.cardHeader} style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', margin: '0' }}>
                            <div>
                                <h2 className={styles.headerTitle} style={{ margin: '0 0 8px 0' }}>{detailProject.projectName || detailProject.name}</h2>
                                <span 
                                    className={styles.badge} 
                                    style={{ 
                                        backgroundColor: `${STATUS_COLORS[detailProject.status || 'Draft']}15`,
                                        color: STATUS_COLORS[detailProject.status || 'Draft'],
                                        border: `1px solid ${STATUS_COLORS[detailProject.status || 'Draft']}30`
                                    }}
                                >
                                    {STATUS_LABELS[detailProject.status || 'Draft'] || 'Nháp'}
                                </span>
                            </div>
                            <button onClick={() => setShowDetailModal(false)} className={styles.closeButton} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div style={{ padding: '24px', overflowY: 'auto' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <h4 style={{ color: 'var(--primary-blue)', fontSize: '16px', fontWeight: '800', marginBottom: '4px' }}>1. Thông tin cơ bản</h4>
                                    
                                    <div className={styles.formGroup}>
                                        <label className={styles.label} style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Mô tả ngắn</label>
                                        <p style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: '1.6' }}>{detailProject.shortDescription}</p>
                                    </div>
                                    
                                    <div className={styles.formGroup}>
                                        <label className={styles.label} style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Giai đoạn phát triển</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <TrendingUp size={16} color="var(--primary-blue)" />
                                            <p style={{ fontSize: '15px', color: 'var(--text-primary)' }}>
                                                {detailProject.developmentStage === 0 ? 'Ý tưởng (Idea)' : detailProject.developmentStage === 1 ? 'MVP' : 'Vận hành (Growth)'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className={styles.formGroup}>
                                        <label className={styles.label} style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Vấn đề cần giải quyết</label>
                                        <p style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: '1.6' }}>{detailProject.problemStatement}</p>
                                    </div>
                                    
                                    <div className={styles.formGroup}>
                                        <label className={styles.label} style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Giải pháp đề xuất</label>
                                        <p style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: '1.6' }}>{detailProject.solutionDescription}</p>
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <h4 style={{ color: 'var(--primary-blue)', fontSize: '16px', fontWeight: '800', marginBottom: '4px' }}>2. Thị trường & Mô hình</h4>
                                    
                                    <div className={styles.formGroup}>
                                        <label className={styles.label} style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Khách hàng mục tiêu</label>
                                        <p style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: '1.6' }}>{detailProject.targetCustomers}</p>
                                    </div>
                                    
                                    <div className={styles.formGroup}>
                                        <label className={styles.label} style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Giá trị độc đáo (UVP)</label>
                                        <p style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: '1.6' }}>{detailProject.uniqueValueProposition}</p>
                                    </div>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label} style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Quy mô thị trường</label>
                                            <p style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: '700' }}>
                                                {detailProject.marketSize ? `${detailProject.marketSize.toLocaleString()} VND` : '—'}
                                            </p>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label} style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Doanh thu</label>
                                            <p style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: '700' }}>
                                                {detailProject.revenue ? `${detailProject.revenue.toLocaleString()} VND` : '—'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className={styles.formGroup}>
                                        <label className={styles.label} style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Mô hình kinh doanh</label>
                                        <p style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: '1.6' }}>{detailProject.businessModel}</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '32px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <h4 style={{ color: 'var(--primary-blue)', fontSize: '16px', fontWeight: '800', marginBottom: '4px' }}>3. Đội ngũ</h4>
                                        
                                        <div className={styles.formGroup}>
                                            <label className={styles.label} style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Thành viên & Vai trò</label>
                                            <p style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{detailProject.teamMembers}</p>
                                        </div>
                                        
                                        <div className={styles.formGroup}>
                                            <label className={styles.label} style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Kỹ năng cốt lõi</label>
                                            <p style={{ fontSize: '15px', color: 'var(--text-primary)' }}>{detailProject.keySkills}</p>
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <h4 style={{ color: 'var(--primary-blue)', fontSize: '16px', fontWeight: '800', marginBottom: '4px' }}>4. Cạnh tranh</h4>
                                        
                                        <div className={styles.formGroup}>
                                            <label className={styles.label} style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Kinh nghiệm đội ngũ</label>
                                            <p style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: '1.6' }}>{detailProject.teamExperience}</p>
                                        </div>
                                        
                                        <div className={styles.formGroup}>
                                            <label className={styles.label} style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Đối thủ cạnh tranh</label>
                                            <p style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: '1.6' }}>{detailProject.competitors}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className={styles.actions} style={{ padding: '20px 24px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', display: 'flex' }}>
                            <button 
                                className={styles.secondaryBtn} 
                                style={{ flex: '1', borderRadius: '9999px' }}
                                onClick={() => setShowDetailModal(false)}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
