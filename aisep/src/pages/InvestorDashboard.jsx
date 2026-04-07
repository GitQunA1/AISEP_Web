import React, { useState, useRef } from 'react';
import { TrendingUp, Heart, DollarSign, CheckCircle, Eye, MessageSquare, TrendingUpIcon, Loader2, Crown } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import styles from '../styles/SharedDashboard.module.css';
import FeedHeader from '../components/feed/FeedHeader';
import FloatingChatWidget from '../components/common/FloatingChatWidget';
import PRNewsSection from '../components/common/PRNewsSection';
import followerService from '../services/followerService';
import connectionService from '../services/connectionService';
import chatService from '../services/chatService';
import signalRService from '../services/signalRService';
import dealsService from '../services/dealsService';
import apiDebug from '../utils/apiDebug';
import { apiClient } from '../services/apiClient';

/**
 * InvestorDashboard - Comprehensive dashboard for investors
 * Features: Portfolio overview, Watchlist, Sent interests, Active investments, Preferences
 */
export default function InvestorDashboard({ user, initialSection = 'overview' }) {
    const [activeSection, setActiveSection] = useState(initialSection);
    
    // Sync activeSection with initialSection prop
    React.useEffect(() => {
        if (initialSection) setActiveSection(initialSection);
    }, [initialSection]);
    const [sentInterests, setSentInterests] = useState([]);
    const [sentConnectionRequests, setSentConnectionRequests] = useState([]);
    const [deals, setDeals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeChatConnectionId, setActiveChatConnectionId] = useState(null);
    const [activeChatSession, setActiveChatSession] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Contract signing states
    const [showContractModal, setShowContractModal] = useState(false);
    const [contractPreviewHtml, setContractPreviewHtml] = useState(null);
    const [isLoadingContract, setIsLoadingContract] = useState(false);
    const [contractDealData, setContractDealData] = useState(null);
    const [contractStatus, setContractStatus] = useState(null);
    const [isSigningContract, setIsSigningContract] = useState(false);

    // Contract signing form states
    const [signFormData, setSignFormData] = useState({
        finalAmount: 0,
        finalEquityPercentage: 0,
        additionalTerms: '',
        signatureBase64: ''
    });

    // Signature canvas ref
    const signatureCanvasRef = useRef(null);
    const signatureDataRef = useRef(''); // Keep latest signature value
    const [isSignatureEmpty, setIsSignatureEmpty] = useState(true);

    // Initialize SignalR on mount
    React.useEffect(() => {
        const initSignalR = async () => {
            try {
                // Get JWT token from localStorage or auth context
                const token = localStorage.getItem('aisep_token') || sessionStorage.getItem('token');
                if (token && user?.userId) {
                    await signalRService.initialize(token);
                    console.log('[InvestorDashboard] SignalR initialized successfully');
                }
            } catch (error) {
                console.error('[InvestorDashboard] Failed to initialize SignalR:', error);
            }
        };

        initSignalR();

        // Cleanup on unmount
        return () => {
            signalRService.disconnect();
        };
    }, [user?.userId]);

    // Function to refresh deals after investment
    const refreshDeals = () => {
        console.log('[InvestorDashboard] refreshDeals() called - triggering refetch');
        setRefreshTrigger(prev => prev + 1);
    };

    // Listen for new deal creation events
    React.useEffect(() => {
        const handleDealCreated = (event) => {
            console.log('[InvestorDashboard] New deal created event received:', event.detail);
            refreshDeals();
        };

        window.addEventListener('deal_created', handleDealCreated);

        return () => {
            window.removeEventListener('deal_created', handleDealCreated);
        };
    }, []);

    // Auto-refresh polling interval (every 5 seconds to keep data fresh)
    React.useEffect(() => {
        const pollingInterval = setInterval(() => {
            console.log('[InvestorDashboard] Auto-refresh polling triggered');
            setRefreshTrigger(prev => prev + 1);
        }, 5000); // 5 seconds

        return () => {
            clearInterval(pollingInterval);
        };
    }, []);

    React.useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                console.log('[InvestorDashboard] Starting parallel fetch of all data...');

                // Fetch all 3 APIs in PARALLEL using Promise.all()
                // Use large pageSize to fetch all deals at once (avoid pagination issues)
                const [followingRes, connectRes, dealsRes] = await Promise.all([
                    followerService.getMyFollowing().catch(err => {
                        console.error('Failed to fetch following:', err);
                        return null;
                    }),
                    connectionService.getMyConnectionRequests().catch(err => {
                        console.error('Failed to fetch connection requests:', err);
                        return null;
                    }),
                    dealsService.getInvestorDeals({ pageSize: 100 }).catch(err => {
                        console.error('Failed to fetch deals:', err);
                        return null;
                    })
                ]);

                console.log('[InvestorDashboard] Parallel fetch completed');

                // Process Followed Projects
                if (followingRes && followingRes.data) {
                    let followedProjects = [];
                    if (followingRes.data.items && Array.isArray(followingRes.data.items)) {
                        followedProjects = followingRes.data.items;
                    } else if (Array.isArray(followingRes.data)) {
                        followedProjects = followingRes.data;
                    }

                    const formattedInterests = followedProjects.map(project => ({
                        id: project.projectId,
                        projectId: project.projectId,
                        projectName: project.projectName,
                        projectImageUrl: project.projectImageUrl,
                        industry: project.industry,
                        sentDate: new Date(project.followedAt).toLocaleString('vi-VN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                        }),
                        followedAt: project.followedAt
                    }));
                    setSentInterests(formattedInterests);
                } else {
                    setSentInterests([]);
                }

                // Process Connection Requests
                if (connectRes && connectRes.data && connectRes.data.items) {
                    const formattedRequests = connectRes.data.items.map(request => {
                        let formattedDate = '';
                        if (request.responseDate) {
                            formattedDate = new Date(request.responseDate).toLocaleString('vi-VN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: false
                            });
                        }
                        return {
                            id: request.connectionRequestId || request.id,
                            connectionRequestId: request.connectionRequestId,
                            projectId: request.projectId,
                            projectName: request.projectName || 'Unknown Project',
                            startupName: request.startupName || 'Unknown Startup',
                            status: request.status || 'Pending',
                            message: request.message || '',
                            responseDate: formattedDate,
                            responseDateRaw: request.responseDate,
                            chatSessionId: request.chatSessionId || null
                        };
                    });
                    setSentConnectionRequests(formattedRequests);
                } else {
                    setSentConnectionRequests([]);
                }

                // Process Deals - SIMPLE: just get raw data
                let dealsData = [];
                if (dealsRes?.data?.items && Array.isArray(dealsRes.data.items)) {
                    dealsData = dealsRes.data.items;
                } else if (Array.isArray(dealsRes?.data)) {
                    dealsData = dealsRes.data;
                } else if (Array.isArray(dealsRes)) {
                    dealsData = dealsRes;
                }
                console.log(`[InvestorDashboard] Found ${dealsData.length} deals`);
                setDeals(dealsData);
            } catch (error) {
                console.error('[InvestorDashboard] Failed to fetch investor data:', error);
                setSentInterests([]);
                setSentConnectionRequests([]);
                setDeals([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllData();
    }, [refreshTrigger]);

    const dashboardData = {
        activeInvestments: deals.length,
        acceptedInterests: sentConnectionRequests.filter(r => r.status === 'Accepted').length
    };

    const handleWithdrawInterest = async (id) => {
        try {
            const interest = sentInterests.find(i => i.id === id);
            if (interest) {
                console.log('[InvestorDashboard] Unfollowing project:', interest.projectId);
                await followerService.unfollowProject(interest.projectId);
                setSentInterests(sentInterests.filter(item => item.id !== id));
            }
        } catch (error) {
            console.error('[InvestorDashboard] Failed to unfollow project:', error);
            alert('Lỗi: Không thể bỏ theo dõi dự án');
        }
    };

    const handleStartChat = (connectionRequestId) => {
        console.log('[InvestorDashboard] Starting chat for connectionRequestId:', connectionRequestId);

        // Find the connection request and extract chatSessionId
        const request = sentConnectionRequests.find(r => (r.id || r.connectionRequestId) === connectionRequestId);
        if (request && request.chatSessionId) {
            setActiveChatSession({
                chatSessionId: request.chatSessionId,
                displayName: request.startupName,
                currentUserId: user?.userId,
                sentTime: request.responseDateRaw || new Date().toISOString()
            });
        } else {
            console.warn('[InvestorDashboard] Cannot start chat - no chatSessionId for connectionRequestId:', connectionRequestId);
        }
    };

    const handleShowContractPreview = async (deal) => {
        console.log('[InvestorDashboard] handleShowContractPreview called for deal:', deal.dealId, 'status:', deal.status);
        setIsLoadingContract(true);

        try {
            setContractDealData(deal);
            // Use status directly from deal object (already have it from GET /api/Deals)
            setContractStatus(deal.status);
            console.log('[InvestorDashboard] Set contractStatus to:', deal.status, 'type:', typeof deal.status);

            setSignFormData({
                finalAmount: deal.amount || 0,
                finalEquityPercentage: deal.equityPercentage || 0,
                additionalTerms: '',
                signatureBase64: ''
            });

            const response = await dealsService.getContractPreview(deal.dealId);
            if (response && response.data) {
                setContractPreviewHtml(response.data);
                setShowContractModal(true);
            }
        } catch (error) {
            console.error('[InvestorDashboard] Error loading contract:', error);
            alert('Lỗi: Không thể tải hợp đồng');
        } finally {
            setIsLoadingContract(false);
        }
    };

    const handleSignatureChange = () => {
        // Called when user draws on canvas
        if (signatureCanvasRef.current) {
            const isEmpty = signatureCanvasRef.current.isEmpty();
            setIsSignatureEmpty(isEmpty);
        }
    };

    const handleClearSignature = () => {
        console.log('[InvestorDashboard] Clearing signature');
        if (signatureCanvasRef.current) {
            signatureCanvasRef.current.clear();
            signatureDataRef.current = ''; // Clear ref too
            setIsSignatureEmpty(true);
            setSignFormData(prev => ({ ...prev, signatureBase64: '' }));
        }
    };

    const handleSaveSignature = () => {
        console.log('[InvestorDashboard] Saving signature...');
        if (signatureCanvasRef.current) {
            const isEmpty = signatureCanvasRef.current.isEmpty();
            console.log('[InvestorDashboard] Canvas isEmpty:', isEmpty);

            if (!isEmpty) {
                try {
                    const canvasUrl = signatureCanvasRef.current.toDataURL('image/png');
                    // Extract plain base64 from data URL (remove 'data:image/png;base64,' prefix)
                    const base64String = canvasUrl.replace(/^data:image\/png;base64,/, '');
                    console.log('[InvestorDashboard] Signature Base64 length:', base64String.length);

                    // Store in ref for reliable access
                    signatureDataRef.current = base64String;

                    // Also update state for UI
                    setSignFormData(prev => {
                        const updated = { ...prev, signatureBase64: base64String };
                        console.log('[InvestorDashboard] Updated signFormData with signature');
                        return updated;
                    });
                } catch (err) {
                    console.error('[InvestorDashboard] Error saving signature:', err);
                }
            } else {
                console.log('[InvestorDashboard] Canvas is empty, cannot save');
            }
        } else {
            console.log('[InvestorDashboard] No canvas ref found');
        }
    };

    const handleSignContract = async () => {
        if (!contractDealData) return;

        console.log('[InvestorDashboard] handleSignContract called');
        console.log('[InvestorDashboard] Current signFormData:', signFormData);
        console.log('[InvestorDashboard] Ref signature length:', signatureDataRef.current.length);

        // Priority: ref > state > canvas
        let finalSignature = signatureDataRef.current || signFormData.signatureBase64;

        // If no signature in ref/state, try to get from canvas directly
        if (!finalSignature && signatureCanvasRef.current) {
            console.log('[InvestorDashboard] Getting signature from canvas directly');
            if (!signatureCanvasRef.current.isEmpty()) {
                try {
                    const canvasUrl = signatureCanvasRef.current.toDataURL('image/png');
                    finalSignature = canvasUrl.replace(/^data:image\/png;base64,/, ''); // Extract plain base64
                    signatureDataRef.current = finalSignature; // Store in ref
                    console.log('[InvestorDashboard] Got signature from canvas, length:', finalSignature.length);
                } catch (err) {
                    console.error('[InvestorDashboard] Error getting signature from canvas:', err);
                }
            }
        }

        // Validate form
        if (!signFormData.finalAmount || signFormData.finalAmount === 0) {
            alert('Vui lòng nhập số tiền');
            return;
        }

        if (!signFormData.finalEquityPercentage && signFormData.finalEquityPercentage !== 0) {
            alert('Vui lòng nhập phần trăm cổ phần');
            return;
        }

        if (!finalSignature) {
            console.log('[InvestorDashboard] No signature found');
            alert('Vui lòng vẽ chữ ký');
            return;
        }

        setIsSigningContract(true);
        try {
            console.log('[InvestorDashboard] Signing contract for deal:', contractDealData.dealId);

            // Prepare data with final signature
            const contractData = {
                finalAmount: signFormData.finalAmount,
                finalEquityPercentage: signFormData.finalEquityPercentage,
                additionalTerms: signFormData.additionalTerms,
                signatureBase64: finalSignature
            };

            console.log('[InvestorDashboard] Sending contract data:', {
                dealId: contractDealData.dealId,
                finalAmount: contractData.finalAmount,
                finalEquityPercentage: contractData.finalEquityPercentage,
                signatureBase64Length: contractData.signatureBase64.length
            });

            const response = await dealsService.signContract(contractDealData.dealId, contractData);
            if (response?.success) {
                alert('✓ Hợp đồng đã được ký thành công!');
                setShowContractModal(false);
                setContractPreviewHtml(null);
                setContractDealData(null);
                setSignFormData({ finalAmount: 0, finalEquityPercentage: 0, additionalTerms: '', signatureBase64: '' });
                setIsSignatureEmpty(true);
                signatureDataRef.current = ''; // Clear ref
                setRefreshTrigger(prev => prev + 1);
            }
        } catch (error) {
            console.error('[InvestorDashboard] Error signing contract:', error);
            alert('Lỗi: Không thể ký hợp đồng');
        } finally {
            setIsSigningContract(false);
        }
    };

    const handleCloseContractModal = () => {
        setShowContractModal(false);
        setContractPreviewHtml(null);
        setContractDealData(null);
        setContractStatus(null);
        setSignFormData({ finalAmount: 0, finalEquityPercentage: 0, additionalTerms: '', signatureBase64: '' });
        setIsSignatureEmpty(true);
        signatureDataRef.current = ''; // Clear ref
        if (signatureCanvasRef.current) {
            signatureCanvasRef.current.clear();
        }
    };

    const handleCloseChatWindow = () => {
        console.log('[InvestorDashboard] Closing chat window');
        setActiveChatSession(null);
        setActiveChatConnectionId(null);
        // Refresh ALL data after chat closes (deals, requests, interests)
        refreshDeals();
    };

    return (
        <div className={styles.container}>
            {/* Unified Header - Hidden for PR News */}
            {activeSection !== 'pr_news' && (
                <>
                    <FeedHeader
                        title="Bảng điều khiển Nhà đầu tư"
                        subtitle={`Xin chào, ${user?.name || 'Nhà đầu tư'}! Quản lý đầu tư và khám phá startup.`}
                        showFilter={false}
                        user={user}
                        onOpenChat={(chatSessionId) => {
                            setActiveChatSession({
                                chatSessionId,
                                displayName: 'Startup Founder',
                                currentUserId: user?.userId,
                                sentTime: new Date().toISOString(),
                            });
                        }}
                    />

                    {/* Quick Stats */}
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={`${styles.statIcon} ${styles.iconPurple}`}>
                                <TrendingUp size={20} />
                            </div>
                            <div className={styles.statInfo}>
                                <div className={styles.statValue}>{dashboardData.activeInvestments}</div>
                                <div className={styles.statLabel}>Đang đầu tư</div>
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={`${styles.statIcon} ${styles.iconGreen}`}>
                                <MessageSquare size={20} />
                            </div>
                            <div className={styles.statInfo}>
                                <div className={styles.statValue}>{dashboardData.acceptedInterests}</div>
                                <div className={styles.statLabel}>Pitch được chấp nhận</div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Content Sections */}
            <div className={styles.content} style={activeSection === 'pr_news' ? { paddingTop: 0 } : {}}>
                {/* Overview Section */}
                {activeSection === 'overview' && (
                    <div className={styles.section}>
                        <div className={styles.sectionGrid}>
                            {/* Portfolio Summary */}
                            <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
                                <h3 className={styles.cardTitle}>Tổng quan danh mục</h3>
                                <div className={styles.metricsGrid}>
                                    <div className={styles.metricItem}>
                                        <div className={styles.metricLabel}>Giá trị danh mục</div>
                                        <div className={styles.metricValue}>{dashboardData.portfolioValue}</div>
                                    </div>
                                    <div className={styles.metricItem}>
                                        <div className={styles.metricLabel}>Đang đầu tư</div>
                                        <div className={styles.metricValue}>{dashboardData.activeInvestments}</div>
                                    </div>
                                    <div className={styles.metricItem}>
                                        <div className={styles.metricLabel}>Tổng đã giải ngân</div>
                                        <div className={styles.metricValue}>{dashboardData.totalInvested}</div>
                                    </div>
                                    <div className={styles.metricItem}>
                                        <div className={styles.metricLabel}>Quan tâm được chấp nhận</div>
                                        <div className={styles.metricValue}>{dashboardData.acceptedInterests}</div>
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

                            {/* Quick Stats */}
                            <div className={styles.card}>
                                <h3 className={styles.cardTitle}>Thống kê nhanh</h3>
                                <div className={styles.list}>
                                    <div className={styles.listItem} style={{ justifyContent: 'space-between' }}>
                                        <span className={styles.listSubtitle}>Điểm AI trung bình</span>
                                        <strong>-</strong>
                                    </div>
                                    <div className={styles.listItem} style={{ justifyContent: 'space-between' }}>
                                        <span className={styles.listSubtitle}>Giai đoạn ưu tiên</span>
                                        <strong>-</strong>
                                    </div>
                                    <div className={styles.listItem} style={{ justifyContent: 'space-between' }}>
                                        <span className={styles.listSubtitle}>Ngành hàng đầu</span>
                                        <strong>-</strong>
                                    </div>
                                    <div className={styles.listItem} style={{ justifyContent: 'space-between' }}>
                                        <span className={styles.listSubtitle}>Tỷ lệ thành công</span>
                                        <strong>0%</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sent Connection Requests Section */}
                {activeSection === 'connectionrequests' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>
                                Yêu cầu thông tin đã gửi ({sentConnectionRequests.length})
                            </h3>
                            <div className={styles.list}>
                                {sentConnectionRequests.length === 0 ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                                        <p>Bạn chưa gửi yêu cầu thông tin nào.</p>
                                    </div>
                                ) : sentConnectionRequests.map(request => {
                                    const statusColor = request.status === 'Pending' ? '#f59e0b' :
                                        request.status === 'Accepted' ? '#10b981' : '#ef4444';
                                    const statusText = request.status === 'Pending' ? 'Đang chờ' :
                                        request.status === 'Accepted' ? 'Chấp nhận' : 'Từ chối';
                                    const canChat = request.status === 'Accepted' && request.chatSessionId;

                                    return (
                                        <div key={request.id} className={styles.listItem}>
                                            <div className={styles.listContent}>
                                                <h4 className={styles.listTitle}>
                                                    {request.startupName}
                                                    <span style={{ fontSize: '0.85rem', color: '#64748b', marginLeft: '8px', fontWeight: '400' }}>
                                                        ({request.projectName})
                                                    </span>
                                                </h4>
                                                <div className={styles.listMeta}>
                                                    <span
                                                        className={`${styles.badge}`}
                                                        style={{
                                                            backgroundColor: statusColor,
                                                            color: '#fff',
                                                            marginRight: '8px'
                                                        }}
                                                    >
                                                        {statusText}
                                                    </span>
                                                    {request.responseDate && (
                                                        <span>Trả lời lúc: {request.responseDate}</span>
                                                    )}
                                                </div>
                                                {request.message && (
                                                    <p style={{ marginTop: '8px', fontSize: '0.9rem', color: '#64748b', fontStyle: 'italic' }}>
                                                        💬 {request.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div className={styles.listActions} style={{ alignItems: 'center' }}>
                                                {canChat ? (
                                                    <button
                                                        className={styles.primaryBtn}
                                                        onClick={() => handleStartChat(request.id || request.connectionRequestId)}
                                                    >
                                                        Bắt đầu chat
                                                    </button>
                                                ) : request.status === 'Accepted' ? (
                                                    <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                                                        Chat chưa sẵn sàng
                                                    </span>
                                                ) : (
                                                    <button
                                                        className={styles.secondaryBtn}
                                                        onClick={() => console.log('View details:', request.id)}
                                                    >
                                                        Xem chi tiết
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Sent Interests Section */}
                {activeSection === 'interests' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>
                                Dự án quan tâm ({sentInterests.length})
                            </h3>
                            <div className={styles.list}>
                                {sentInterests.length === 0 ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                                        <p>Bạn chưa quan tâm đến dự án nào.</p>
                                    </div>
                                ) : sentInterests.map(interest => (
                                    <div key={interest.id} className={styles.listItem}>
                                        <div className={styles.listContent}>
                                            <h4 className={styles.listTitle}>{interest.projectName}</h4>
                                            <div className={styles.listMeta}>
                                                <span className={`${styles.badge} ${styles.badgeInfo}`} style={{ marginRight: '8px' }}>{interest.industry}</span>
                                                Quan tâm từ: {interest.sentDate}
                                            </div>
                                            {interest.projectImageUrl && (
                                                <img
                                                    src={interest.projectImageUrl}
                                                    alt={interest.projectName}
                                                    style={{ marginTop: '8px', maxWidth: '200px', maxHeight: '120px', borderRadius: '4px' }}
                                                />
                                            )}
                                        </div>
                                        <div className={styles.listActions} style={{ alignItems: 'center' }}>
                                            <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                                                ♥ Đang theo dõi
                                            </span>
                                            <button
                                                className={styles.dangerBtn}
                                                onClick={() => handleWithdrawInterest(interest.id)}
                                                style={{ marginLeft: '12px' }}
                                            >
                                                Bỏ theo dõi
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Investments (Deals) Section */}
                {activeSection === 'investments' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>
                                Khoản đầu tư của bạn ({deals.length})
                            </h3>
                            <div className={styles.list}>
                                {deals.length === 0 ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                                        <p>Bạn chưa có khoản đầu tư nào. Hãy khám phá và đầu tư vào các startup hứa hẹn.</p>
                                    </div>
                                ) : deals.map(deal => {
                                    // Compute status color and label from raw deal.status
                                    const statusMap = {
                                        'Pending': { label: 'Chờ xác nhận', color: '#f59e0b' },
                                        'Confirmed': { label: 'Đã xác nhận', color: '#10b981' },
                                        'Contract_Signed': { label: 'Đã ký kết', color: '#667eea' },
                                        'Minted_NFT': { label: 'Đã mint NFT', color: '#8b5cf6' },
                                        'Failed': { label: 'Thất bại', color: '#ef4444' }
                                    };
                                    const statusInfo = statusMap[deal.status] || { label: deal.status || 'Unknown', color: '#64748b' };
                                    const isContractSigned = !!deal.contractSignedAt;

                                    return (
                                        <div key={deal.dealId} className={styles.listItem}>
                                            <div className={styles.listContent}>
                                                <h4 className={styles.listTitle}>
                                                    {deal.projectName || deal.startupName || `Deal #${deal.dealId}`}
                                                    {isContractSigned && (
                                                        <CheckCircle size={16} style={{ marginLeft: '8px', color: '#10b981', verticalAlign: 'middle' }} />
                                                    )}
                                                </h4>
                                                <div className={styles.listMeta} style={{ marginTop: '8px' }}>
                                                    <span
                                                        className={`${styles.badge}`}
                                                        style={{
                                                            backgroundColor: statusInfo.color,
                                                            color: '#fff',
                                                            marginRight: '12px'
                                                        }}
                                                    >
                                                        {statusInfo.label}
                                                    </span>
                                                    {deal.amount > 0 && (
                                                        <span style={{ marginRight: '12px' }}>
                                                            💰 {deal.amount.toLocaleString('vi-VN')} VND
                                                        </span>
                                                    )}
                                                    {deal.equityPercentage !== null && deal.equityPercentage > 0 && (
                                                        <span style={{ marginRight: '12px' }}>
                                                            📊 {deal.equityPercentage}%
                                                        </span>
                                                    )}
                                                </div>
                                                {deal.contractSignedAt && (
                                                    <div style={{ marginTop: '6px', fontSize: '0.9rem', color: '#64748b' }}>
                                                        ✓ Ký kết: {new Date(deal.contractSignedAt).toLocaleString('vi-VN')}
                                                    </div>
                                                )}
                                                {deal.contractPdfUrl && (
                                                    <div style={{ marginTop: '6px' }}>
                                                        <a href={deal.contractPdfUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#667eea', textDecoration: 'none', fontSize: '0.9rem' }}>
                                                            📄 Tải hợp đồng
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                            <div className={styles.listActions} style={{ alignItems: 'center', gap: '8px' }}>
                                                <button className={styles.secondaryBtn}>Chi tiết</button>
                                                {(deal.status === 'Confirmed' || deal.status === 1) && (
                                                    <button
                                                        style={{
                                                            padding: '6px 12px',
                                                            backgroundColor: '#667eea',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onClick={() => handleShowContractPreview(deal)}
                                                    >
                                                        📄 Ký hợp đồng
                                                    </button>
                                                )}
                                                {deal.isContractSigned && deal.contractPdfUrl && (
                                                    <button className={styles.secondaryBtn}>Hợp đồng</button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Preferences Section */}
                {activeSection === 'preferences' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>Sở thích đầu tư</h3>
                            <form className={styles.form}>
                                <div className={styles.formGroup}>
                                    <label>Ngành ưu tiên</label>
                                    <div className={styles.checkboxGroup}>
                                        <label><input type="checkbox" defaultChecked /> AI/ML</label>
                                        <label><input type="checkbox" defaultChecked /> Fintech</label>
                                        <label><input type="checkbox" /> HealthTech</label>
                                        <label><input type="checkbox" /> Thương mại điện tử</label>
                                        <label><input type="checkbox" /> SaaS</label>
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Giai đoạn ưu tiên</label>
                                    <div className={styles.checkboxGroup}>
                                        <label><input type="checkbox" /> Pre-Seed</label>
                                        <label><input type="checkbox" defaultChecked /> Seed</label>
                                        <label><input type="checkbox" defaultChecked /> Series A</label>
                                        <label><input type="checkbox" /> Series B</label>
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Điểm AI tối thiểu</label>
                                        <input type="number" min="0" max="100" defaultValue="70" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Quy mô đầu tư thông thường</label>
                                        <input type="text" placeholder="VD: 250 triệu - 1 tỷ VND" />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                                    <button type="submit" className={styles.primaryBtn}>Lưu sở thích</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* PR News Section */}
                {activeSection === 'pr_news' && (
                    <PRNewsSection />
                )}

                <FloatingChatWidget
                    chatSessionId={activeChatSession?.chatSessionId}
                    displayName={activeChatSession?.displayName}
                    currentUserId={user?.userId}
                    sentTime={activeChatSession?.sentTime}
                    onClose={handleCloseChatWindow}
                />

                {/* Contract Preview Modal */}
                {showContractModal && contractPreviewHtml && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '16px',
                        }}
                        onClick={handleCloseContractModal}
                    >
                        <div
                            style={{
                                backgroundColor: '#fff',
                                borderRadius: '8px',
                                width: '100%',
                                maxWidth: '1000px',
                                maxHeight: '90vh',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div
                                style={{
                                    padding: '20px',
                                    borderBottom: '1px solid #e2e8f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <div>
                                    <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700' }}>
                                        Ký hợp đồng đầu tư
                                    </h2>
                                    {contractDealData && (
                                        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                                            <strong>Dự án:</strong> {contractDealData.projectName || contractDealData.startupName} • <strong>Số tiền:</strong> {contractDealData.amount?.toLocaleString('vi-VN')} VND
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={handleCloseContractModal}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '24px',
                                        cursor: 'pointer',
                                        color: '#64748b',
                                    }}
                                >
                                    ×
                                </button>
                            </div>

                            {/* Content: Two Column Layout */}
                            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                                {/* Left: Contract Preview */}
                                <div
                                    style={{
                                        flex: 1,
                                        overflow: 'auto',
                                        padding: '20px',
                                        backgroundColor: '#f9fafb',
                                        borderRight: '1px solid #e2e8f0',
                                    }}
                                >
                                    <h3 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '700', color: '#475569' }}>
                                        📄 Hợp đồng đầu tư
                                    </h3>
                                    {isLoadingContract ? (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                                                <Loader2 size={24} className={styles.spinner} />
                                                <span>Đang tải hợp đồng...</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            style={{
                                                backgroundColor: '#fff',
                                                padding: '20px',
                                                borderRadius: '6px',
                                                border: '1px solid #e2e8f0',
                                                lineHeight: '1.6',
                                                fontSize: '13px',
                                                color: '#334155',
                                                maxHeight: '75vh',
                                                overflowY: 'auto',
                                                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
                                            }}
                                            dangerouslySetInnerHTML={{ __html: contractPreviewHtml }}
                                        />
                                    )}
                                </div>

                                {/* Right: Signing Form */}
                                <div
                                    style={{
                                        flex: 1,
                                        overflow: 'auto',
                                        padding: '20px',
                                        backgroundColor: '#fff',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '16px',
                                    }}
                                >
                                    <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#475569' }}>
                                        ✍️ Điều khoản ký kết
                                    </h3>

                                    {/* Final Amount */}
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>
                                            Số tiền cuối cùng (VND) *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={signFormData.finalAmount || ''}
                                            onChange={(e) => setSignFormData({ ...signFormData, finalAmount: e.target.value ? parseFloat(e.target.value) : 0 })}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                fontSize: '13px',
                                                border: '1px solid #cbd5e1',
                                                borderRadius: '4px',
                                                boxSizing: 'border-box',
                                                fontFamily: 'inherit',
                                            }}
                                            placeholder="Nhập số tiền"
                                        />
                                    </div>

                                    {/* Equity Percentage */}
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>
                                            Phần trăm cổ phần (%) *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={signFormData.finalEquityPercentage || ''}
                                            onChange={(e) => setSignFormData({ ...signFormData, finalEquityPercentage: e.target.value ? parseFloat(e.target.value) : 0 })}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                fontSize: '13px',
                                                border: '1px solid #cbd5e1',
                                                borderRadius: '4px',
                                                boxSizing: 'border-box',
                                                fontFamily: 'inherit',
                                            }}
                                            placeholder="Nhập phần trăm"
                                        />
                                    </div>

                                    {/* Additional Terms */}
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>
                                            Điều khoản bổ sung
                                        </label>
                                        <textarea
                                            value={signFormData.additionalTerms}
                                            onChange={(e) => setSignFormData({ ...signFormData, additionalTerms: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                fontSize: '13px',
                                                border: '1px solid #cbd5e1',
                                                borderRadius: '4px',
                                                boxSizing: 'border-box',
                                                fontFamily: 'inherit',
                                                minHeight: '80px',
                                                resize: 'vertical',
                                            }}
                                            placeholder="Nhập các điều khoản bổ sung (nếu có)"
                                        />
                                    </div>

                                    {/* Signature */}
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>
                                            Chữ ký (vẽ bên dưới) *
                                        </label>
                                        <div style={{
                                            border: '2px dashed #cbd5e1',
                                            borderRadius: '4px',
                                            backgroundColor: '#f9fafb',
                                            overflow: 'hidden',
                                            marginBottom: '8px'
                                        }}>
                                            <SignatureCanvas
                                                ref={signatureCanvasRef}
                                                onEnd={handleSignatureChange}
                                                penColor="#000"
                                                canvasProps={{
                                                    width: 400,
                                                    height: 150,
                                                    className: 'signature-canvas',
                                                    style: {
                                                        display: 'block',
                                                        backgroundColor: '#fff',
                                                        cursor: 'crosshair',
                                                        touchAction: 'none'
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                            <button
                                                type="button"
                                                onClick={handleClearSignature}
                                                style={{
                                                    padding: '6px 12px',
                                                    backgroundColor: '#ef4444',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                                            >
                                                🗑️ Xóa chữ ký
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSaveSignature}
                                                disabled={isSignatureEmpty}
                                                style={{
                                                    padding: '6px 12px',
                                                    backgroundColor: isSignatureEmpty ? '#cbd5e1' : '#10b981',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    cursor: isSignatureEmpty ? 'not-allowed' : 'pointer',
                                                    transition: 'all 0.2s',
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isSignatureEmpty) e.currentTarget.style.backgroundColor = '#059669';
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isSignatureEmpty) e.currentTarget.style.backgroundColor = '#10b981';
                                                }}
                                            >
                                                ✓ Lưu chữ ký
                                            </button>
                                        </div>
                                        <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                                            💡 Vẽ chữ ký ở trên rồi click "Lưu chữ ký" để xác nhận
                                        </p>
                                        {signFormData.signatureBase64 && (
                                            <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#10b981', fontWeight: '600' }}>
                                                ✓ Chữ ký đã được lưu
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer with Action Buttons */}
                            <div
                                style={{
                                    padding: '16px 20px',
                                    borderTop: '1px solid #e2e8f0',
                                    display: 'flex',
                                    gap: '12px',
                                    justifyContent: 'flex-end',
                                    backgroundColor: '#f9fafb',
                                }}
                            >
                                <button
                                    onClick={handleCloseContractModal}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#f1f5f9',
                                        color: '#475569',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '4px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#e2e8f0';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                                    }}
                                >
                                    Hủy
                                </button>

                                {/* Download Button - Show when Contract_Signed */}
                                {contractStatus === 'Contract_Signed' && contractDealData?.contractPdfUrl && (
                                    <a
                                        href={contractDealData.contractPdfUrl}
                                        download={`DEAL-${contractDealData.dealId}.pdf`}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#3b82f6',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            textDecoration: 'none',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#2563eb';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#3b82f6';
                                        }}
                                    >
                                        ⬇️ Tải hợp đồng
                                    </a>
                                )}

                                {/* View Button - Show when Contract_Signed */}
                                {contractStatus === 'Contract_Signed' && (
                                    <button
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#10b981',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#059669';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#10b981';
                                        }}
                                    >
                                        📄 Xem hợp đồng
                                    </button>
                                )}

                                {/* Sign Button - Show when NOT Contract_Signed */}
                                {contractStatus !== 'Contract_Signed' && (
                                    <button
                                        onClick={handleSignContract}
                                        disabled={isSigningContract}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#667eea',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            cursor: isSigningContract ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.2s',
                                            opacity: isSigningContract ? 0.7 : 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSigningContract) {
                                                e.currentTarget.style.backgroundColor = '#5568d3';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSigningContract) {
                                                e.currentTarget.style.backgroundColor = '#667eea';
                                            }
                                        }}
                                    >
                                        {isSigningContract ? (
                                            <>
                                                <Loader2 size={14} className={styles.spinner} />
                                                Đang ký...
                                            </>
                                        ) : (
                                            '✓ Ký hợp đồng'
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
