import React, { useState, useRef } from 'react';
import { TrendingUp, Heart, DollarSign, CheckCircle, Eye, MessageSquare, TrendingUpIcon, Loader2, Crown, X, Info, Calendar, PieChart, ArrowRight, FileText, Check, Users, AlertCircle, RefreshCw, Trash2, Settings, Download, XCircle, Clock, Shield, ChevronRight, GripVertical } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import styles from '../styles/SharedDashboard.module.css';
import contractStyles from './ContractSigningModal.module.css';
import FeedHeader from '../components/feed/FeedHeader';
import FloatingChatWidget from '../components/common/FloatingChatWidget';
import NewsPRSection from '../components/common/NewsPRSection';
import followerService from '../services/followerService';
import connectionService from '../services/connectionService';
import chatService from '../services/chatService';
import signalRService from '../services/signalRService';
import dealsService from '../services/dealsService';
import SuccessModal from '../components/common/SuccessModal';
import InvestorStatusBanner from '../components/common/InvestorStatusBanner';
import apiDebug from '../utils/apiDebug';
import { apiClient } from '../services/apiClient';
import enumService from '../services/enumService';
import investorService from '../services/investorService';
import blockchainOwnershipService from '../services/blockchainOwnershipService';
import BlockchainOwnershipModal from '../components/common/BlockchainOwnershipModal';

/**
 * InvestorDashboard - Comprehensive dashboard for investors
 * Features: Portfolio overview, Watchlist, Sent interests, Active investments, Preferences
 */
export default function InvestorDashboard({ user, initialSection = 'overview' }) {
    const [activeSection, setActiveSection] = useState(initialSection);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
    const [showLeftTabIndicator, setShowLeftTabIndicator] = useState(false);
    const [showRightTabIndicator, setShowRightTabIndicator] = useState(false);
    const [indicatorStyle, setIndicatorStyle] = useState({});
    const tabsRef = useRef(null);
    const isFirstLoad = useRef(true);
    const [investorProfile, setInvestorProfile] = useState(null);
    
    // Sync activeSection with initialSection prop
    React.useEffect(() => {
        if (initialSection) setActiveSection(initialSection);
    }, [initialSection]);

    React.useLayoutEffect(() => {
        const updateIndicator = () => {
            if (tabsRef.current) {
                // Animated Line Style
                const activeTab = tabsRef.current.querySelector(`.${styles.tab}.${styles.active}`);
                if (activeTab) {
                    setIndicatorStyle({
                        transform: `translateX(${activeTab.offsetLeft}px)`,
                        width: `${activeTab.offsetWidth}px`
                    });
                }

                // Scroll Indicators Logic
                const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
                setShowLeftTabIndicator(scrollLeft > 5);
                setShowRightTabIndicator(scrollLeft < scrollWidth - clientWidth - 5);
            }
        };

        const handleResize = () => {
            setIsMobile(window.innerWidth <= 1024);
            updateIndicator();
        };

        // Use a small timeout to ensure DOM is ready and styles are applied
        const timer = setTimeout(updateIndicator, 10);
        window.addEventListener('resize', handleResize);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
        };
    }, [activeSection]);

    const checkTabScroll = () => {
        if (tabsRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
            setShowLeftTabIndicator(scrollLeft > 5);
            setShowRightTabIndicator(scrollLeft < scrollWidth - clientWidth - 5);
        }
    };
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

    // Blockchain Ownership Transfer States
    const [showBlockchainOwnershipModal, setShowBlockchainOwnershipModal] = useState(false);
    const [blockchainOwnershipData, setBlockchainOwnershipData] = useState(null);
    const [isLoadingBlockchainOwnership, setIsLoadingBlockchainOwnership] = useState(false);
    const [blockchainOwnershipError, setBlockchainOwnershipError] = useState(null);
    const [selectedDealForOwnership, setSelectedDealForOwnership] = useState(null);
    const blockchainPollingIntervalRef = useRef(null);

    // Detail Modal States
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailType, setDetailType] = useState('connection'); // 'connection' or 'deal'
    const [selectedItem, setSelectedItem] = useState(null);

    // Action Loading States (for buttons)
    const [actionLoading, setActionLoading] = useState({}); // e.g. { 'chat-7': true, 'withdraw-5': true }

    // Success Modal States
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Dashboard Data States
    const [prefFormData, setPrefFormData] = useState({
        organizationName: '',
        investmentTaste: '',
        walletAddress: '',
        investmentAmount: 0,
        investmentDate: null,
        riskTolerance: 1, // Medium
        investmentRegion: '',
        focusIndustry: 0,
        preferredStage: 0,
        previousInvestments: ''
    });

    // Preference States (Custom UI)
    const [preferredIndustries, setPreferredIndustries] = useState([]);
    const [preferredStages, setPreferredStages] = useState([]);
    const [availableIndustries, setAvailableIndustries] = useState([]);
    const [isUpdatingPrefs, setIsUpdatingPrefs] = useState(false);

    // Industry mapping for Vietnamese labels
    const INDUSTRY_MAP = {
        'Fintech': 'Fintech',
        'Edtech': 'Edtech',
        'Healthtech': 'Công nghệ Y tế',
        'Agritech': 'Nông nghiệp công nghệ cao',
        'E_Commerce': 'Thương mại điện tử',
        'Logistics': 'Logistics & Vận tải',
        'Proptech': 'Bất động sản công nghệ',
        'Cleantech': 'Công nghệ Sạch',
        'SaaS': 'Phần mềm (SaaS)',
        'AI_BigData': 'AI & Big Data',
        'Web3_Crypto': 'Web3 & Crypto',
        'Food_Beverage': 'Thực phẩm & Đồ uống',
        'Manufacturing': 'Sản xuất',
        'Media_Entertainment': 'Truyền thông & Giải trí',
        'Other': 'Khác'
    };

    const stageOptions = [
        { value: 'Idea', label: 'Ý tưởng' },
        { value: 'MVP', label: 'MVP' },
        { value: 'Growth', label: 'Phát triển' }
    ];

    // Fetch industries on mount
    React.useEffect(() => {
        const fetchIndustries = async () => {
            try {
                const industries = await enumService.getEnumOptions('Industry');
                if (industries && industries.length > 0) {
                    setAvailableIndustries(industries);
                }
            } catch (error) {
                console.error('Failed to fetch industries:', error);
            }
        };

        fetchIndustries();
    }, []);

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
                const token = localStorage.getItem('aisep_token') || sessionStorage.getItem('token');
                if (token && user?.userId) {
                    await signalRService.initialize(token);
                    console.log('[InvestorDashboard] SignalR initialized successfully');

                    // Register listener for real-time background refreshes
                    signalRService.onNotificationReceived((notif) => {
                        console.log('[InvestorDashboard] SignalR notification received, triggering silent refresh');
                        refreshDeals();
                    });
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

    // Silent background polling to keep all tabs fresh without disrupting the UI.
    // fetchAllData is optimized to only show loading skeletons on the absolute first mount.
    React.useEffect(() => {
        const pollingInterval = setInterval(() => {
            console.log('[InvestorDashboard] Silent background poll triggered');
            setRefreshTrigger(prev => prev + 1);
        }, 5000); // 5 seconds - kept very fresh according to user request

        return () => {
            clearInterval(pollingInterval);
        };
    }, []);

    // Cleanup blockchain polling interval on unmount
    React.useEffect(() => {
        return () => {
            if (blockchainPollingIntervalRef.current) {
                clearInterval(blockchainPollingIntervalRef.current);
                blockchainPollingIntervalRef.current = null;
                console.log('[InvestorDashboard] Cleaned up blockchain polling interval on unmount');
            }
        };
    }, []);

    React.useEffect(() => {
        const fetchAllData = async () => {
            // Only set total loading state on absolute first mount to avoid flashing/resetting the UI
            if (isFirstLoad.current) {
                setIsLoading(true);
            }
            
            try {
                console.log('[InvestorDashboard] Starting fetch of all data (First load:', isFirstLoad.current, ')');
                
                const [followingRes, connectRes, dealsRes, profileRes] = await Promise.all([
                    followerService.getMyFollowing().catch(err => null),
                    connectionService.getMyConnectionRequests().catch(err => null),
                    dealsService.getInvestorDeals({ pageSize: 100 }).catch(err => null),
                    investorService.getMyProfile().catch(err => null)
                ]);

                // Update States... (Omitted logic remains same)
                if (profileRes) {
                    setInvestorProfile(profileRes);
                    setPrefFormData({
                        organizationName: profileRes.organizationName || '',
                        investmentTaste: profileRes.investmentTaste || '',
                        walletAddress: profileRes.walletAddress || '',
                        investmentAmount: profileRes.investmentAmount || 0,
                        riskTolerance: profileRes.riskTolerance || 1,
                        investmentRegion: profileRes.investmentRegion || '',
                        focusIndustry: profileRes.focusIndustry || 0,
                        preferredStage: profileRes.preferredStage || 0,
                        previousInvestments: profileRes.previousInvestments || '',
                        minAIScore: profileRes.minAIScore || 70,
                        typicalInvestmentSize: profileRes.typicalInvestmentSize || ''
                    });

                    let industries = [];
                    if (profileRes.focusIndustry) industries.push(profileRes.focusIndustry);
                    let stages = [];
                    if (profileRes.preferredStage) stages.push(profileRes.preferredStage);

                    if (profileRes.preferredIndustries) {
                        try {
                            const parsed = JSON.parse(profileRes.preferredIndustries);
                            if (Array.isArray(parsed)) industries = [...new Set([...industries, ...parsed])];
                        } catch (e) {
                            if (typeof profileRes.preferredIndustries === 'string') {
                                const csv = profileRes.preferredIndustries.split(',').map(s => s.trim()).filter(Boolean);
                                industries = [...new Set([...industries, ...csv])];
                            }
                        }
                    }

                    if (profileRes.preferredStages) {
                        try {
                            const parsed = JSON.parse(profileRes.preferredStages);
                            if (Array.isArray(parsed)) stages = [...new Set([...stages, ...parsed])];
                        } catch (e) {
                            if (typeof profileRes.preferredStages === 'string') {
                                const csv = profileRes.preferredStages.split(',').map(s => s.trim()).filter(Boolean);
                                stages = [...new Set([...stages, ...csv])];
                            }
                        }
                    }

                    setPreferredIndustries(industries);
                    setPreferredStages(stages);
                }

                if (followingRes?.data) {
                    let followedProjects = Array.isArray(followingRes.data.items) ? followingRes.data.items : Array.isArray(followingRes.data) ? followingRes.data : [];
                    
                    // Sort by newest to oldest based on followedAt
                    followedProjects.sort((a, b) => new Date(b.followedAt) - new Date(a.followedAt));

                    setSentInterests(followedProjects.map(project => ({
                        id: project.projectId,
                        projectId: project.projectId,
                        projectName: project.projectName,
                        projectImageUrl: project.projectImageUrl,
                        industry: project.industry,
                        sentDate: new Date(project.followedAt).toLocaleString('vi-VN'),
                        followedAt: project.followedAt
                    })));
                }

                if (connectRes?.data?.items) {
                    setSentConnectionRequests(connectRes.data.items.map(request => ({
                        id: request.connectionRequestId || request.id,
                        connectionRequestId: request.connectionRequestId,
                        projectId: request.projectId,
                        projectName: request.projectName || 'Unknown Project',
                        startupName: request.startupName || 'Unknown Startup',
                        status: request.status || 'Pending',
                        message: request.message || '',
                        responseDate: request.responseDate ? new Date(request.responseDate).toLocaleString('vi-VN') : '',
                        responseDateRaw: request.responseDate,
                        chatSessionId: request.chatSessionId || null
                    })));
                }

                let dealsData = dealsRes?.data?.items || dealsRes?.data || dealsRes || [];
                if (!Array.isArray(dealsData)) dealsData = [];
                setDeals(dealsData);

                // Mark first load as complete
                isFirstLoad.current = false;
            } catch (error) {
                console.error('[InvestorDashboard] Data fetch error:', error);
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
        const actionKey = `unfollow-${id}`;
        setActionLoading(prev => ({ ...prev, [actionKey]: true }));
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
        } finally {
            setActionLoading(prev => ({ ...prev, [actionKey]: false }));
        }
    };

    const handleStartChat = async (connectionRequestId) => {
        const actionKey = `chat-${connectionRequestId}`;
        setActionLoading(prev => ({ ...prev, [actionKey]: true }));
        
        console.log('[InvestorDashboard] Starting chat for connectionRequestId:', connectionRequestId);

        // Artificial delay for UX feedback
        await new Promise(resolve => setTimeout(resolve, 800));

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
        
        setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    };

    // Detail Modal Handlers
    const handleShowConnectionDetail = (request) => {
        console.log('[InvestorDashboard] handleShowConnectionDetail called:', request.id);
        setDetailType('connection');
        setSelectedItem(request);
        setShowDetailModal(true);
    };

    const handleShowDealDetail = (deal) => {
        console.log('[InvestorDashboard] handleShowDealDetail called:', deal.dealId);
        setDetailType('deal');
        setSelectedItem(deal);
        setShowDetailModal(true);
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedItem(null);
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

    const handleCheckBlockchainOwnership = async (deal) => {
        console.log('[InvestorDashboard] handleCheckBlockchainOwnership called for deal:', deal.dealId);
        
        if (!deal.dealId) {
            console.error('[InvestorDashboard] Deal ID not found');
            return;
        }

        setSelectedDealForOwnership(deal);
        setShowBlockchainOwnershipModal(true);
        setIsLoadingBlockchainOwnership(true);
        setBlockchainOwnershipError(null);
        setBlockchainOwnershipData(null);

        // Clear any existing polling interval
        if (blockchainPollingIntervalRef.current) {
            clearInterval(blockchainPollingIntervalRef.current);
        }

        try {
            // Start polling for blockchain status
            console.log('[InvestorDashboard] Starting to poll blockchain status for deal:', deal.dealId);
            
            const pollResult = await blockchainOwnershipService.pollBlockchainStatus(
                deal.dealId,
                (updateInfo) => {
                    console.log('[InvestorDashboard] Polling update:', updateInfo);
                    
                    if (updateInfo.status === 'polling' || updateInfo.status === 'completed') {
                        setBlockchainOwnershipData(updateInfo.data);
                        setIsLoadingBlockchainOwnership(updateInfo.status === 'polling');
                    } else if (updateInfo.status === 'error') {
                        setBlockchainOwnershipError(updateInfo.error);
                        setIsLoadingBlockchainOwnership(false);
                    }
                }
            );

            console.log('[InvestorDashboard] Polling result:', pollResult);
            
            if (pollResult.status === 'completed' || pollResult.status === 'timeout') {
                setBlockchainOwnershipData(pollResult.data);
                setIsLoadingBlockchainOwnership(false);
            } else if (pollResult.status === 'error') {
                setBlockchainOwnershipError(pollResult.error);
                setIsLoadingBlockchainOwnership(false);
            }
        } catch (error) {
            console.error('[InvestorDashboard] Error checking blockchain ownership:', error);
            setBlockchainOwnershipError(error.message || 'Không thể kiểm tra trạng thái blockchain.');
            setIsLoadingBlockchainOwnership(false);
        }
    };

    const handleCloseBlockchainOwnershipModal = () => {
        setShowBlockchainOwnershipModal(false);
        setBlockchainOwnershipData(null);
        setBlockchainOwnershipError(null);
        setSelectedDealForOwnership(null);
        setIsLoadingBlockchainOwnership(false);

        // Clear polling interval
        if (blockchainPollingIntervalRef.current) {
            clearInterval(blockchainPollingIntervalRef.current);
            blockchainPollingIntervalRef.current = null;
        }
    };

    const handleCloseChatWindow = () => {
        console.log('[InvestorDashboard] Closing chat window');
        setActiveChatSession(null);
        setActiveChatConnectionId(null);
        // Refresh ALL data after chat closes (deals, requests, interests)
        refreshDeals();
    };

    // Preference Handlers
    const toggleIndustry = (industryLabel) => {
        setPreferredIndustries(prev => 
            prev.includes(industryLabel)
                ? prev.filter(i => i !== industryLabel)
                : [...prev, industryLabel]
        );
    };

    const toggleStage = (stageValue) => {
        setPreferredStages(prev => 
            prev.includes(stageValue)
                ? prev.filter(s => s !== stageValue)
                : [...prev, stageValue]
        );
    };

    const handleUpdatePreferences = async (e) => {
        if (e) e.preventDefault();
        
        setIsUpdatingPrefs(true);
        try {
            console.log('[InvestorDashboard] Saving profile...');
            
            // Prepare the payload as FormData because backend uses [FromForm]
            const formData = new FormData();
            formData.append('organizationName', prefFormData.organizationName || '');
            formData.append('investmentTaste', prefFormData.investmentTaste || '');
            formData.append('walletAddress', prefFormData.walletAddress || '');
            formData.append('investmentAmount', prefFormData.investmentAmount || 0);
            if (prefFormData.investmentDate) formData.append('investmentDate', prefFormData.investmentDate);
            formData.append('riskTolerance', prefFormData.riskTolerance);
            formData.append('investmentRegion', prefFormData.investmentRegion || '');
            formData.append('focusIndustry', prefFormData.focusIndustry);
            formData.append('preferredStage', prefFormData.preferredStage);
            formData.append('previousInvestments', prefFormData.previousInvestments || '');

            let response;
            if (investorProfile?.investorId) {
                // Update mode
                response = await investorService.updateInvestor(investorProfile.investorId, formData);
                setSuccessMessage('Hồ sơ nhà đầu tư của bạn đã được cập nhật thành công và đang chờ xét duyệt!');
            } else {
                // Create mode
                response = await investorService.createInvestor(formData);
                setSuccessMessage('Hồ sơ nhà đầu tư của bạn đã được tạo thành công và đang chờ xét duyệt!');
            }
            
            if (response) {
                setShowSuccessModal(true);
                setRefreshTrigger(prev => prev + 1);
            }
        } catch (error) {
            console.error('[InvestorDashboard] Failed to save profile:', error);
            
            // apiClient normalized error contains .message and .errors
            let errorMsg = error.message || 'Không thể lưu hồ sơ. Vui lòng thử lại sau.';
            
            // If backend returned a list of validation errors (array of strings)
            if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
                errorMsg = error.errors.join('\n');
            }
            
            alert(`Lỗi:\n${errorMsg}`);
        } finally {
            setIsUpdatingPrefs(false);
        }
    };

    const PreferenceChip = ({ label, selected, onClick }) => (
        <div 
            onClick={onClick}
            style={{
                padding: '10px 20px',
                borderRadius: '12px',
                border: selected ? '2px solid var(--primary-blue)' : '1px solid var(--border-color)',
                backgroundColor: selected ? 'rgba(29, 155, 240, 0.15)' : 'var(--bg-secondary)',
                color: selected ? 'var(--primary-blue)' : 'var(--text-secondary)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                userSelect: 'none',
            }}
        >
            <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '4px',
                border: `2px solid ${selected ? 'var(--primary-blue)' : 'rgba(255,255,255,0.15)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: selected ? 'var(--primary-blue)' : 'transparent',
                transition: 'all 0.2s'
            }}>
                {selected && <Check size={12} color="#fff" strokeWidth={4} />}
            </div>
            {label}
        </div>
    );


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
                    <InvestorStatusBanner
                        status={investorProfile ? (investorProfile.status || 'Pending') : (isLoading ? null : 'Missing')}
                        reason={investorProfile?.rejectionReason}
                        onUpdateProfile={() => setActiveSection('preferences')}
                    />
                </>
            )}

            {activeSection !== 'pr_news' && (
                <>
                    {/* Stats Section */}
                    <div className={`${styles.statsWrapper} ${activeSection !== 'overview' ? styles.statsCollapsed : ''}`}>
                        <div className={styles.statsGrid}>
                            <div className={styles.statCard}>
                                <div className={`${styles.statIcon} ${styles.iconCyan}`}>
                                    <PieChart size={20} />
                                </div>
                                <div className={styles.statInfo}>
                                    <div className={styles.statValue}>{dashboardData.activeInvestments}</div>
                                    <div className={styles.statLabel}>Đang đầu tư</div>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={`${styles.statIcon} ${styles.iconYellow}`}>
                                    <TrendingUp size={20} />
                                </div>
                                <div className={styles.statInfo}>
                                    <div className={styles.statValue}>{dashboardData.acceptedInterests}</div>
                                    <div className={styles.statLabel}>Pitch được chấp nhận</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Dashboard Tabs */}
                    <div className={styles.tabSwitcherWrapper}>
                        {isMobile && showLeftTabIndicator && <div className={`${styles.scrollIndicator} ${styles.scrollIndicatorLeft}`} />}
                        
                        <div 
                            className={`${styles.tabs} ${styles.animatedTabs}`}
                            ref={tabsRef}
                            onScroll={checkTabScroll}
                        >
                            <button 
                                className={`${styles.tab} ${activeSection === 'overview' ? styles.active : ''}`}
                                onClick={() => setActiveSection('overview')}
                            >
                                Tổng quan
                            </button>
                            <button 
                                className={`${styles.tab} ${activeSection === 'investments' ? styles.active : ''}`}
                                onClick={() => setActiveSection('investments')}
                            >
                                Khoản đầu tư
                            </button>
                            <button 
                                className={`${styles.tab} ${activeSection === 'connectionrequests' ? styles.active : ''}`}
                                onClick={() => setActiveSection('connectionrequests')}
                            >
                                Yêu cầu kết nối
                            </button>
                            <button 
                                className={`${styles.tab} ${activeSection === 'interests' ? styles.active : ''}`}
                                onClick={() => setActiveSection('interests')}
                            >
                                Dự án quan tâm
                            </button>
                            <button 
                                className={`${styles.tab} ${activeSection === 'preferences' ? styles.active : ''}`}
                                onClick={() => setActiveSection('preferences')}
                            >
                                Hồ sơ Nhà đầu tư
                            </button>

                            {/* Animated Indicator Line */}
                            <div className={styles.tabIndicator} style={indicatorStyle} />
                        </div>

                        {isMobile && showRightTabIndicator && <div className={`${styles.scrollIndicator} ${styles.scrollIndicatorRight}`} />}
                    </div>
                </>
            )}

            {/* Content Sections */}
            <div className={styles.content} style={activeSection === 'pr_news' ? { padding: 0 } : {}}>
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
                    <div className={styles.section} style={{ paddingBottom: '40px' }}>
                        {/* Header Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                            <div className={styles.card} style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Users size={24} color="var(--primary-blue)" />
                                    <div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Tổng yêu cầu</div>
                                        <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>
                                            {sentConnectionRequests.length}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.card} style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <AlertCircle size={24} color="#f59e0b" />
                                    <div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Chờ xử lý</div>
                                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#f59e0b' }}>
                                            {sentConnectionRequests.filter(r => r.status === 'Pending').length}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.card} style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <CheckCircle size={24} color="#10b981" />
                                    <div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Đã chấp nhận</div>
                                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#10b981' }}>
                                            {sentConnectionRequests.filter(r => r.status === 'Accepted').length}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Loading State */}
                        {isLoading && (
                            <div className={styles.card} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                                <Loader2 size={24} className={styles.spinner} style={{ marginRight: '12px' }} />
                                <span style={{ color: 'var(--text-secondary)' }}>Đang tải danh sách yêu cầu...</span>
                            </div>
                        )}

                        {/* Empty State */}
                        {!isLoading && sentConnectionRequests.length === 0 && (
                            <div className={styles.card} style={{ padding: '40px', textAlign: 'center' }}>
                                <Users size={48} style={{ margin: '0 auto 16px', color: 'var(--text-secondary)', opacity: 0.5 }} />
                                <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Chưa gửi yêu cầu nào</h3>
                                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Các yêu cầu thông tin bạn đã gửi sẽ xuất hiện ở đây.</p>
                            </div>
                        )}

                        {/* Requests Grid */}
                        {!isLoading && sentConnectionRequests.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                                {sentConnectionRequests.map((request, index) => {
                                    const statusConfig = {
                                        'Pending': { label: 'Chờ xử lý', color: '#f59e0b' },
                                        'Accepted': { label: 'Đã chấp nhận', color: '#10b981' },
                                        'Rejected': { label: 'Đã từ chối', color: '#ef4444' }
                                    };
                                    const statusInfo = statusConfig[request.status] || { label: 'Không xác định', color: '#64748b' };
                                    const canChat = request.status === 'Accepted' && request.chatSessionId;

                                    return (
                                        <div
                                            key={request.id || request.connectionRequestId}
                                            className={`${styles.card} ${styles.itemAppear}`}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '12px',
                                                borderLeft: '4px solid ' + statusInfo.color,
                                                transition: 'all 0.2s ease',
                                                animationDelay: `${index * 0.05}s`
                                            }}
                                        >
                                            {/* Header */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>
                                                        {request.projectName || 'Dự án không tên'}
                                                    </h4>
                                                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                        {request.startupName || 'Startup'}
                                                    </p>
                                                </div>
                                                <div style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    backgroundColor: statusInfo.color + '15',
                                                    color: statusInfo.color,
                                                    padding: '4px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '11px',
                                                    fontWeight: '700'
                                                }}>
                                                    {statusInfo.label}
                                                </div>
                                            </div>

                                            {/* Startup Info */}
                                            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: '6px' }}>
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                                    <strong>Mục đích</strong>
                                                </div>
                                                <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                                                    Yêu cầu thông tin chi tiết dự án
                                                </div>
                                            </div>

                                            {/* Details */}
                                            {/* Details */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                                                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '6px' }}>
                                                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Ngày trả lời</div>
                                                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#10b981' }}>
                                                        {request.responseDate || 'Chưa có'}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Message (if available) */}
                                            {request.message && (
                                                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: '6px', fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', borderLeft: '3px solid var(--primary-blue)' }}>
                                                    💬 {request.message}
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', flexWrap: 'wrap' }}>
                                                {canChat ? (
                                                    <button
                                                        style={{
                                                            flex: 1,
                                                            padding: '8px 12px',
                                                            backgroundColor: '#10b981',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '4px',
                                                            transition: 'all 0.2s',
                                                            opacity: actionLoading[`chat-${request.id || request.connectionRequestId}`] ? 0.7 : 1
                                                        }}
                                                        onClick={() => handleStartChat(request.id || request.connectionRequestId)}
                                                        disabled={actionLoading[`chat-${request.id || request.connectionRequestId}`]}
                                                    >
                                                        {actionLoading[`chat-${request.id || request.connectionRequestId}`] ? <Loader2 size={12} className="animate-spin" /> : <MessageSquare size={12} />}
                                                        Bắt đầu chat
                                                    </button>
                                                ) : request.status === 'Accepted' ? (
                                                    <button
                                                        style={{
                                                            flex: 1,
                                                            padding: '8px 12px',
                                                            backgroundColor: 'var(--bg-secondary)',
                                                            color: 'var(--text-secondary)',
                                                            border: '1px solid var(--border-color)',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            cursor: 'default',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '4px'
                                                        }}
                                                    >
                                                        Chat chưa sẵn sàng
                                                    </button>
                                                ) : (
                                                    <button
                                                        style={{
                                                            flex: 1,
                                                            padding: '8px 12px',
                                                            backgroundColor: 'var(--bg-secondary)',
                                                            color: 'var(--text-primary)',
                                                            border: '1px solid var(--border-color)',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '4px',
                                                            transition: 'all 0.2s',
                                                            opacity: 1
                                                        }}
                                                        onClick={() => handleShowConnectionDetail(request)}
                                                    >
                                                        <Eye size={12} />
                                                        Xem chi tiết
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Sent Interests Section */}
                {activeSection === 'interests' && (
                    <div className={styles.section} style={{ paddingBottom: '40px' }}>
                        {/* Header Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                            <div className={styles.card} style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Heart size={24} color="#ec4899" />
                                    <div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Tổng dự án</div>
                                        <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>
                                            {sentInterests.length}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.card} style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <TrendingUp size={24} color="var(--primary-blue)" />
                                    <div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Ngành ưu tiên</div>
                                        <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary-blue)' }}>
                                            {new Set(sentInterests.map(i => i.industry)).size}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Loading State */}
                        {isLoading && (
                            <div className={styles.card} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                                <Loader2 size={24} className={styles.spinner} style={{ marginRight: '12px' }} />
                                <span style={{ color: 'var(--text-secondary)' }}>Đang tải danh sách quan tâm...</span>
                            </div>
                        )}

                        {/* Empty State */}
                        {!isLoading && sentInterests.length === 0 && (
                            <div className={styles.card} style={{ padding: '40px', textAlign: 'center' }}>
                                <Heart size={48} style={{ margin: '0 auto 16px', color: 'var(--text-secondary)', opacity: 0.5 }} />
                                <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Chưa quan tâm đến dự án nào</h3>
                                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Hãy khám phá và theo dõi các dự án tiềm năng.</p>
                            </div>
                        )}

                        {/* Interests Grid */}
                        {!isLoading && sentInterests.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                                {sentInterests.map((interest, index) => (
                                    <div
                                        key={interest.id}
                                        className={`${styles.card} ${styles.itemAppear}`}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px',
                                            borderLeft: '4px solid #ec4899',
                                            transition: 'all 0.2s ease',
                                            padding: '16px',
                                            animationDelay: `${index * 0.05}s`
                                        }}
                                    >
                                        {/* Header */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>
                                                    {interest.projectName || 'Dự án không tên'}
                                                </h4>
                                                {interest.industry && (
                                                    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-secondary)', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                                        {interest.industry}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                backgroundColor: 'rgba(236, 72, 153, 0.1)',
                                                color: '#ec4899',
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '11px',
                                                fontWeight: '700'
                                            }}>
                                                ♥ Đang theo dõi
                                            </div>
                                        </div>

                                        {/* Project Image */}
                                        <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', marginTop: '4px' }}>
                                            {interest.projectImageUrl ? (
                                                <img
                                                    src={interest.projectImageUrl}
                                                    alt={interest.projectName}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div style={{ 
                                                    width: '100%', 
                                                    height: '100%', 
                                                    backgroundColor: 'var(--bg-secondary)', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
                                                    padding: '20px',
                                                    textAlign: 'center',
                                                    color: 'var(--text-secondary)',
                                                    fontSize: '12px',
                                                    border: '1px dashed var(--border-color)',
                                                    borderRadius: '8px'
                                                }}>
                                                    Dự án này không có hình ảnh đại diện.
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginTop: '4px' }}>
                                            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '10px', borderRadius: '6px' }}>
                                                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Ngày quan tâm</div>
                                                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                                    {interest.sentDate}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', flexWrap: 'wrap', paddingTop: '8px' }}>
                                            <button
                                                style={{
                                                    flex: 1,
                                                    padding: '8px 12px',
                                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                    color: '#ef4444',
                                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '4px',
                                                    transition: 'all 0.2s',
                                                    opacity: actionLoading[`unfollow-${interest.id}`] ? 0.7 : 1
                                                }}
                                                onClick={() => handleWithdrawInterest(interest.id)}
                                                disabled={actionLoading[`unfollow-${interest.id}`]}
                                            >
                                                {actionLoading[`unfollow-${interest.id}`] ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                                                Bỏ theo dõi
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Investments (Deals) Section */}
                {activeSection === 'investments' && (
                    <div className={styles.section} style={{ paddingBottom: '40px' }}>
                        {/* Header Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                            <div className={styles.card} style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <DollarSign size={24} color="var(--primary-blue)" />
                                    <div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Tổng đầu tư</div>
                                        <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>
                                            {deals.length}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.card} style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <AlertCircle size={24} color="#f59e0b" />
                                    <div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Chờ xác nhận</div>
                                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#f59e0b' }}>
                                            {deals.filter(d => d.status === 'Pending').length}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.card} style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <CheckCircle size={24} color="#10b981" />
                                    <div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Đã ký kết</div>
                                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#10b981' }}>
                                            {deals.filter(d => d.status === 'Contract_Signed' || d.status === 'Minted_NFT').length}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Loading State */}
                        {isLoading && (
                            <div className={styles.card} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                                <Loader2 size={24} className={styles.spinner} style={{ marginRight: '12px' }} />
                                <span style={{ color: 'var(--text-secondary)' }}>Đang tải danh sách đầu tư...</span>
                            </div>
                        )}

                        {/* Empty State */}
                        {!isLoading && deals.length === 0 && (
                            <div className={styles.card} style={{ padding: '40px', textAlign: 'center' }}>
                                <DollarSign size={48} style={{ margin: '0 auto 16px', color: 'var(--text-secondary)', opacity: 0.5 }} />
                                <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Chưa có khoản đầu tư nào</h3>
                                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Hãy khám phá và đầu tư vào các startup hứa hẹn.</p>
                            </div>
                        )}

                        {/* Deals Grid */}
                        {!isLoading && deals.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                                {deals.map((deal, index) => {
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
                                        <div
                                            key={deal.dealId}
                                            className={`${styles.card} ${styles.itemAppear}`}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '12px',
                                                borderLeft: '4px solid ' + statusInfo.color,
                                                transition: 'all 0.2s ease',
                                                animationDelay: `${index * 0.05}s`
                                            }}
                                        >
                                            {/* Deal Header */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
                                                        {deal.projectName || 'Dự án không tên'}
                                                        {isContractSigned && (
                                                            <CheckCircle size={14} style={{ marginLeft: '6px', color: '#10b981' }} />
                                                        )}
                                                    </h4>
                                                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                        Deal #{deal.dealId} {deal.startupName ? `• ${deal.startupName}` : ''}
                                                    </p>
                                                </div>
                                                <div style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    backgroundColor: statusInfo.color + '15',
                                                    color: statusInfo.color,
                                                    padding: '4px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '11px',
                                                    fontWeight: '700'
                                                }}>
                                                    {statusInfo.label}
                                                </div>
                                            </div>

                                            {/* Deal Details */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                                                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '6px' }}>
                                                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Số tiền</div>
                                                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#10b981' }}>
                                                        {deal.amount > 0 ? `${deal.amount.toLocaleString('vi-VN')} VNĐ` : 'Chưa có'}
                                                    </div>
                                                </div>
                                                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '10px', borderRadius: '6px' }}>
                                                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Cổ phần</div>
                                                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                                        {deal.equityPercentage !== null && deal.equityPercentage > 0 ? `${deal.equityPercentage}%` : 'Chưa có'}
                                                    </div>
                                                </div>
                                            </div>

                                            {deal.contractSignedAt && (
                                                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Check size={14} color="#10b981" />
                                                    Đã ký lúc: {new Date(deal.contractSignedAt).toLocaleString('vi-VN')}
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', flexWrap: 'wrap', paddingTop: '8px' }}>
                                                <button
                                                    style={{
                                                        flex: 1,
                                                        padding: '8px 12px',
                                                        backgroundColor: 'var(--bg-secondary)',
                                                        color: 'var(--text-primary)',
                                                        border: '1px solid var(--border-color)',
                                                        borderRadius: '4px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '4px',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onClick={() => handleShowDealDetail(deal)}
                                                >
                                                    <Eye size={12} /> Chi tiết
                                                </button>

                                                {(deal.status === 'Confirmed' || deal.status === 1) && (
                                                    <button
                                                        style={{
                                                            flex: 1,
                                                            padding: '8px 12px',
                                                            backgroundColor: '#667eea',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '4px',
                                                            transition: 'all 0.2s',
                                                            opacity: isLoadingContract ? 0.7 : 1
                                                        }}
                                                        onClick={() => handleShowContractPreview(deal)}
                                                        disabled={isLoadingContract}
                                                    >
                                                        {isLoadingContract ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
                                                        Ký hợp đồng
                                                    </button>
                                                )}

                                                {(isContractSigned || deal.status === 'Contract_Signed' || deal.status === 3) && deal.contractPdfUrl && (
                                                    <button
                                                        style={{
                                                            flex: 1,
                                                            padding: '8px 12px',
                                                            backgroundColor: '#10b981',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '4px',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleShowContractPreview(deal);
                                                        }}
                                                    >
                                                        <FileText size={12} /> Xem hợp đồng
                                                    </button>
                                                )}

                                                {(isContractSigned || deal.status === 'Contract_Signed' || deal.status === 3) && (
                                                    <button
                                                        style={{
                                                            flex: 1,
                                                            padding: '8px 12px',
                                                            backgroundColor: '#3b82f6',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '4px',
                                                            transition: 'all 0.2s',
                                                            opacity: isLoadingBlockchainOwnership && selectedDealForOwnership?.dealId === deal.dealId ? 0.7 : 1
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCheckBlockchainOwnership(deal);
                                                        }}
                                                        disabled={isLoadingBlockchainOwnership && selectedDealForOwnership?.dealId === deal.dealId}
                                                        title="Xác thực chuyển giao quyền sở hữu trên blockchain"
                                                    >
                                                        {isLoadingBlockchainOwnership && selectedDealForOwnership?.dealId === deal.dealId ? (
                                                            <Loader2 size={12} className="animate-spin" />
                                                        ) : (
                                                            <Shield size={12} />
                                                        )}
                                                        Xác thực Quyền sở hữu
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Preferences / Profile Section */}
                {activeSection === 'preferences' && (
                    <div className={styles.section}>

                        {!investorProfile && !isLoading && (
                            <div className={styles.card} style={{ marginBottom: '20px', backgroundColor: 'rgba(245, 158, 11, 0.05)', border: '1px dashed #f59e0b' }}>
                                <div style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                    <AlertCircle size={24} color="#f59e0b" style={{ marginTop: '2px' }} />
                                    <div>
                                        <h4 style={{ margin: '0 0 4px 0', color: '#f59e0b', fontWeight: '800' }}>Chưa có hồ sơ nhà đầu tư</h4>
                                        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                            Vui lòng hoàn thiện hồ sơ bên dưới để nhân viên kiểm duyệt. Bạn chỉ có thể thực hiện kết nối và đầu tư sau khi hồ sơ được phê duyệt.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>{investorProfile ? 'Cập nhật hồ sơ nhà đầu tư' : 'Hoàn thiện hồ sơ nhà đầu tư'}</h3>
                            <form className={styles.form} onSubmit={handleUpdatePreferences}>
                                <div className={styles.formGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                                    <div className={styles.formGroup}>
                                        <label>Tên tổ chức / Cá nhân *</label>
                                        <input 
                                            type="text" required
                                            value={prefFormData.organizationName}
                                            onChange={(e) => setPrefFormData({ ...prefFormData, organizationName: e.target.value })}
                                            placeholder="Tên công ty hoặc tên cá nhân đầu tư"
                                            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '12px', padding: '12px 16px' }}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Địa chỉ Ví Blockchain *</label>
                                        <input 
                                            type="text" required
                                            value={prefFormData.walletAddress}
                                            onChange={(e) => setPrefFormData({ ...prefFormData, walletAddress: e.target.value })}
                                            placeholder="0x..."
                                            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '12px', padding: '12px 16px' }}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Ngân sách đầu tư (VNĐ) *</label>
                                        <input 
                                            type="number" required min="0"
                                            value={prefFormData.investmentAmount}
                                            onChange={(e) => setPrefFormData({ ...prefFormData, investmentAmount: e.target.value })}
                                            placeholder="Số tiền bạn dự kiến đầu tư"
                                            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '12px', padding: '12px 16px' }}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Khu vực đầu tư</label>
                                        <input 
                                            type="text"
                                            value={prefFormData.investmentRegion}
                                            onChange={(e) => setPrefFormData({ ...prefFormData, investmentRegion: e.target.value })}
                                            placeholder="VD: Việt Nam, Đông Nam Á..."
                                            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '12px', padding: '12px 16px' }}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                                    <div className={styles.formGroup}>
                                        <label>Mức độ chấp nhận rủi ro</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {[0, 1, 2].map(r => (
                                                <button
                                                    key={r} type="button"
                                                    onClick={() => setPrefFormData({ ...prefFormData, riskTolerance: r })}
                                                    style={{
                                                        flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)',
                                                        backgroundColor: prefFormData.riskTolerance === r ? 'var(--primary-blue)' : 'var(--bg-secondary)',
                                                        color: prefFormData.riskTolerance === r ? '#fff' : 'var(--text-secondary)',
                                                        fontSize: '13px', fontWeight: '600', transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {r === 0 ? 'Thấp' : r === 1 ? 'Trung bình' : 'Cao'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Giai đoạn ưu tiên</label>
                                        <select 
                                            value={prefFormData.preferredStage}
                                            onChange={(e) => setPrefFormData({ ...prefFormData, preferredStage: parseInt(e.target.value) })}
                                            style={{ width: '100%', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '12px', padding: '12px 16px' }}
                                        >
                                            <option value={0}>Ý tưởng (Idea)</option>
                                            <option value={1}>Sản phẩm khả thi (MVP)</option>
                                            <option value={2}>Tăng trưởng (Growth)</option>
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Lĩnh vực quan tâm chính</label>
                                        <select 
                                            value={prefFormData.focusIndustry}
                                            onChange={(e) => setPrefFormData({ ...prefFormData, focusIndustry: parseInt(e.target.value) })}
                                            style={{ width: '100%', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '12px', padding: '12px 16px' }}
                                        >
                                            {availableIndustries.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className={styles.formGroup} style={{ marginBottom: '24px' }}>
                                    <label>Gu đầu tư / Chiến lược *</label>
                                    <textarea 
                                        required rows={4}
                                        value={prefFormData.investmentTaste}
                                        onChange={(e) => setPrefFormData({ ...prefFormData, investmentTaste: e.target.value })}
                                        placeholder="Mô tả gu đầu tư, các tiêu chí lựa chọn startup của bạn..."
                                        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '12px', padding: '12px 16px' }}
                                    />
                                </div>

                                <div className={styles.formGroup} style={{ marginBottom: '24px' }}>
                                    <label>Kinh nghiệm đầu tư trước đây</label>
                                    <textarea 
                                        rows={3}
                                        value={prefFormData.previousInvestments}
                                        onChange={(e) => setPrefFormData({ ...prefFormData, previousInvestments: e.target.value })}
                                        placeholder="Liệt kê các danh mục đầu tư hoặc kinh nghiệm nổi bật..."
                                        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '12px', padding: '12px 16px' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
                                    <button 
                                        type="submit" 
                                        className={styles.primaryBtn} 
                                        disabled={isUpdatingPrefs}
                                        style={{ padding: '14px 40px', height: 'auto', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(29, 155, 240, 0.3)' }}
                                    >
                                        {isUpdatingPrefs ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
                                        {investorProfile ? 'Cập nhật hồ sơ' : 'Gửi hồ sơ duyệt'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {activeSection === 'pr_news' && (
                    <NewsPRSection user={user} onOpenChat={(sessionId) => {
                        setActiveChatSession({ chatSessionId: sessionId, displayName: 'Thông báo', currentUserId: user?.userId, sentTime: new Date().toISOString() });
                    }} 
                    investorProfileStatus={investorProfile ? (investorProfile.status || 'Pending') : (isLoading ? null : 'Missing')}
                    investorProfileReason={investorProfile?.rejectionReason}
                    onUpdateProfile={() => setActiveSection('preferences')}
                    />
                )}

                <FloatingChatWidget
                    chatSessionId={activeChatSession?.chatSessionId}
                    displayName={activeChatSession?.displayName}
                    currentUserId={user?.userId}
                    sentTime={activeChatSession?.sentTime}
                    onClose={handleCloseChatWindow}
                />

                {/* Contract Preview Modal - Modernized */}
                {showContractModal && contractPreviewHtml && (
                    <div className={contractStyles.modalOverlay} onClick={handleCloseContractModal}>
                        <div className={contractStyles.modalContent} onClick={(e) => e.stopPropagation()}>
                            {/* Header */}
                            <div className={contractStyles.header}>
                                <div className={contractStyles.headerInfo}>
                                    <h2>Ký hợp đồng đầu tư</h2>
                                    {contractDealData && (
                                        <p>
                                            Dự án: <strong>{contractDealData.projectName || contractDealData.startupName}</strong> • Số tiền: <strong>{contractDealData.amount?.toLocaleString('vi-VN')} VND</strong>
                                        </p>
                                    )}
                                </div>
                                <button className={contractStyles.closeBtn} onClick={handleCloseContractModal}>
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Body: Two Column / Stacked */}
                            <div className={contractStyles.body}>
                                {/* Left: Contract Preview */}
                                <div className={contractStyles.previewColumn}>
                                    <div className={contractStyles.sectionTitle}>
                                        <FileText size={16} /> Hợp đồng đầu tư
                                    </div>
                                    {isLoadingContract ? (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-secondary)' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                                <Loader2 size={24} className="animate-spin" />
                                                <span>Đang tải hợp đồng...</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className={contractStyles.contractPaper}
                                            dangerouslySetInnerHTML={{ __html: contractPreviewHtml }}
                                        />
                                    )}
                                </div>

                                {/* Right: Signing Form - Only show when NOT Signed */}
                                {![3, 4, '3', '4', 'Contract_Signed', 'Minted_NFT'].includes(contractStatus) && (
                                    <div className={contractStyles.formColumn}>
                                    <div className={contractStyles.sectionTitle}>
                                        <Settings size={16} /> Điều khoản ký kết
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Số tiền cuối cùng (VND) *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={signFormData.finalAmount || ''}
                                            onChange={(e) => setSignFormData({ ...signFormData, finalAmount: e.target.value ? parseFloat(e.target.value) : 0 })}
                                            placeholder="Nhập số tiền"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Phần trăm cổ phần (%) *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={signFormData.finalEquityPercentage || ''}
                                            onChange={(e) => setSignFormData({ ...signFormData, finalEquityPercentage: e.target.value ? parseFloat(e.target.value) : 0 })}
                                            placeholder="Nhập phần trăm"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Điều khoản bổ sung</label>
                                        <textarea
                                            value={signFormData.additionalTerms}
                                            onChange={(e) => setSignFormData({ ...signFormData, additionalTerms: e.target.value })}
                                            placeholder="Nhập các điều khoản bổ sung (nếu có)"
                                            rows={4}
                                        />
                                    </div>

                                    {/* Signature Section */}
                                    <div className={styles.formGroup}>
                                        <label>Chữ ký (vẽ bên dưới) *</label>
                                        <div className={contractStyles.signaturePaper}>
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
                                        
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                            <button
                                                type="button"
                                                onClick={handleClearSignature}
                                                className={styles.dangerBtn}
                                                style={{ flex: 1, padding: '10px' }}
                                            >
                                                <Trash2 size={16} /> Xóa chữ ký
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSaveSignature}
                                                disabled={signFormData.signatureBase64 || isSignatureEmpty}
                                                className={styles.primaryBtn}
                                                style={{ 
                                                    flex: 1, 
                                                    padding: '10px',
                                                    backgroundColor: signFormData.signatureBase64 ? '#10b981' : undefined,
                                                    opacity: signFormData.signatureBase64 ? 0.8 : (isSignatureEmpty ? 0.5 : 1),
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                                }}
                                            >
                                                {signFormData.signatureBase64 ? (
                                                    <><CheckCircle size={16} /> Đã lưu chữ ký</>
                                                ) : (
                                                    <><Check size={16} /> Lưu chữ ký</>
                                                )}
                                            </button>
                                        </div>

                                        <div className={contractStyles.signatureHint}>
                                            <Info size={16} />
                                            <div>
                                                Vẽ chữ ký ở trên rồi click <b>"Lưu chữ ký"</b> để xác nhận. 
                                            </div>
                                        </div>
                                    </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className={contractStyles.footer}>
                                <button
                                    onClick={handleCloseContractModal}
                                    className={styles.secondaryBtn}
                                    style={{ padding: '10px 24px' }}
                                >
                                    Hủy
                                </button>

                                {contractStatus === 'Contract_Signed' && contractDealData?.contractPdfUrl && (
                                    <a
                                        href={contractDealData.contractPdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download={`DEAL-${contractDealData.dealId}.pdf`}
                                        className={styles.primaryBtn}
                                        style={{ padding: '10px 24px', backgroundColor: '#3b82f6' }}
                                    >
                                        <Download size={16} /> Tải hợp đồng
                                    </a>
                                )}

                                {contractStatus !== 'Contract_Signed' && (
                                    <button
                                        onClick={handleSignContract}
                                        disabled={isSigningContract}
                                        className={styles.primaryBtn}
                                        style={{ padding: '10px 32px' }}
                                    >
                                        {isSigningContract ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Đang ký...
                                            </>
                                        ) : (
                                            <><Check size={16} /> Ký hợp đồng</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            <FloatingChatWidget
                chatSessionId={activeChatSession?.chatSessionId}
                displayName={activeChatSession?.displayName}
                currentUserId={user?.userId}
                sentTime={activeChatSession?.sentTime}
                onClose={handleCloseChatWindow}
            />

            {/* Success Modal */}
            {showSuccessModal && (
                <SuccessModal 
                    message={successMessage}
                    onClose={() => setShowSuccessModal(false)}
                />
            )}

            {/* Blockchain Ownership Transfer Modal */}
            <BlockchainOwnershipModal
                isOpen={showBlockchainOwnershipModal}
                ownershipData={blockchainOwnershipData}
                onClose={handleCloseBlockchainOwnershipModal}
                isLoading={isLoadingBlockchainOwnership}
                error={blockchainOwnershipError}
                dealId={selectedDealForOwnership?.dealId}
            />

            {/* Detail Modal */}
            {/* Standardized Detail Modal */}
            {showDetailModal && selectedItem && (
                <div className={styles.modalOverlay} onClick={handleCloseDetailModal}>
                    <div className={styles.modalContent} style={{ maxWidth: '600px', height: 'auto', maxHeight: '85vh' }} onClick={e => e.stopPropagation()}>
                        {/* Unified Modal Header */}
                        <div className={styles.modalSplitDesktopHeader} style={{ padding: '20px 24px' }}>
                            <div>
                                <h3 className={styles.modalSplitDesktopTitle} style={{ fontSize: '20px' }}>
                                    {detailType === 'connection' ? 'Chi tiết yêu cầu kết nối' : 'Chi tiết khoản đầu tư'}
                                </h3>
                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '500' }}>
                                    {detailType === 'connection' 
                                        ? `Gửi tới ${selectedItem.startupName || 'Startup'}` 
                                        : `Dự án: ${selectedItem.projectName || selectedItem.startupName || '—'}`}
                                </div>
                            </div>
                            <button onClick={handleCloseDetailModal} className={styles.modalCloseBtnInline}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className={styles.modalContentBody} style={{ padding: '24px', gap: '24px', overflowY: 'auto' }}>
                            {detailType === 'connection' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    {/* Status Section */}
                                    <div className={styles.projectDetailSection}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            <Info size={14} /> Trạng thái yêu cầu
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span style={{
                                                backgroundColor: selectedItem.status === 'Accepted' ? 'rgba(23, 191, 99, 0.1)' : selectedItem.status === 'Pending' ? 'rgba(255, 173, 31, 0.15)' : 'rgba(244, 33, 46, 0.1)',
                                                color: selectedItem.status === 'Accepted' ? '#17bf63' : selectedItem.status === 'Pending' ? '#d97706' : '#f4212e',
                                                padding: '6px 14px', borderRadius: '9999px', fontSize: '13px', fontWeight: '700', border: '1px solid transparent'
                                            }}>
                                                {selectedItem.status === 'Accepted' ? 'Đã chấp nhận' : selectedItem.status === 'Pending' ? 'Đang chờ phản hồi' : 'Đã từ chối'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Message Section */}
                                    <div className={styles.projectDetailSection}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            <MessageSquare size={14} /> Tin nhắn giới thiệu
                                        </div>
                                        <div style={{ backgroundColor: 'var(--bg-hover)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)', fontSize: '15px', color: 'var(--text-primary)', lineHeight: '1.6', fontWeight: '450' }}>
                                            {selectedItem.message || 'Không có nội dung tin nhắn đính kèm.'}
                                        </div>
                                    </div>

                                    {/* Date Section */}
                                    {selectedItem.responseDate && (
                                        <div className={styles.projectDetailSection}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                <Calendar size={14} /> Thời gian phản hồi
                                            </div>
                                            <div style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: '600', paddingLeft: '4px' }}>
                                                {selectedItem.responseDate}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    {/* Investment Stats */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div style={{ backgroundColor: 'var(--bg-hover)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Số tiền đầu tư</div>
                                            <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--primary-blue)' }}>
                                                {selectedItem.amount?.toLocaleString('vi-VN')} <span style={{ fontSize: '14px', opacity: 0.8 }}>VND</span>
                                            </div>
                                        </div>
                                        <div style={{ backgroundColor: 'var(--bg-hover)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Cổ phần nắm giữ</div>
                                            <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-primary)' }}>
                                                {selectedItem.equityPercentage}<span style={{ fontSize: '14px', marginLeft: '2px' }}>%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Section */}
                                    <div className={styles.projectDetailSection}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            <Info size={14} /> Trạng thái hiện tại
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--primary-blue)', boxShadow: '0 0 8px var(--primary-blue)' }}></div>
                                            <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>{selectedItem.status}</span>
                                        </div>
                                    </div>

                                    {/* Contract Info */}
                                    {selectedItem.contractSignedAt && (
                                        <div className={styles.projectDetailSection}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                <FileText size={14} /> Thông tin hợp đồng
                                            </div>
                                            <div style={{ backgroundColor: 'rgba(29, 155, 240, 0.05)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(29, 155, 240, 0.1)', fontSize: '14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <CheckCircle size={16} color="var(--primary-blue)" />
                                                <span style={{ fontWeight: '500' }}>Đã ký vào lúc {new Date(selectedItem.contractSignedAt).toLocaleString('vi-VN')}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Standardized Sticky Footer */}
                        <div className={styles.stickyActions} style={{ padding: '16px 24px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
                            <button 
                                onClick={handleCloseDetailModal} 
                                className={styles.secondaryBtn}
                                style={{ padding: '10px 32px' }}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
    );
}
