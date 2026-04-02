import React, { useState } from 'react';
import { TrendingUp, Heart, DollarSign, CheckCircle, Eye, MessageSquare } from 'lucide-react';
import styles from '../styles/SharedDashboard.module.css';
import FeedHeader from '../components/feed/FeedHeader';
import FloatingChatWidget from '../components/common/FloatingChatWidget';
import followerService from '../services/followerService';
import connectionService from '../services/connectionService';
import chatService from '../services/chatService';
import signalRService from '../services/signalRService';

/**
 * InvestorDashboard - Comprehensive dashboard for investors
 * Features: Portfolio overview, Watchlist, Sent interests, Active investments, Preferences
 */
export default function InvestorDashboard({ user }) {
    const [activeSection, setActiveSection] = useState('overview');
    const [watchlist, setWatchlist] = useState([]);
    const [sentInterests, setSentInterests] = useState([]);
    const [sentConnectionRequests, setSentConnectionRequests] = useState([]);
    const [activeInvestments, setActiveInvestments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeChatConnectionId, setActiveChatConnectionId] = useState(null);
    const [activeChatSession, setActiveChatSession] = useState(null);

    // Initialize SignalR on mount
    React.useEffect(() => {
        const initSignalR = async () => {
            try {
                // Get JWT token from localStorage or auth context
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
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

    React.useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                // Fetch followed projects from /api/projects/my-followed
                const followingRes = await followerService.getMyFollowing();
                console.log('[InvestorDashboard] Followed projects response:', followingRes);
                
                if (followingRes && followingRes.data) {
                    // Handle paginated response structure: data.items
                    let followedProjects = [];
                    
                    if (followingRes.data.items && Array.isArray(followingRes.data.items)) {
                        followedProjects = followingRes.data.items;
                    } else if (Array.isArray(followingRes.data)) {
                        followedProjects = followingRes.data;
                    }
                    
                    console.log('[InvestorDashboard] Followed projects:', followedProjects);
                    
                    // Map response to sentInterests format
                    // Response structure: projectId, projectName, projectImageUrl, industry, followedAt
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
                    
                    console.log('[InvestorDashboard] Formatted interests:', formattedInterests);
                    setSentInterests(formattedInterests);
                }

                // Fetch sent connection requests
                try {
                    const connectRes = await connectionService.getMyConnectionRequests();
                    console.log('[InvestorDashboard] Sent connection requests response:', connectRes);
                    
                    if (connectRes && connectRes.data && connectRes.data.items) {
                        // Map response to display format
                        // Response structure: connectionRequestId, startupName, projectId, status, message, responseDate, chatSessionId
                        const formattedRequests = connectRes.data.items.map(request => {
                            // Format date from responseDate (when the owner responded)
                            let formattedDate = '';
                            let formattedDateObj = null;
                            
                            if (request.responseDate) {
                                formattedDateObj = new Date(request.responseDate);
                                formattedDate = formattedDateObj.toLocaleString('vi-VN', { 
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
                        
                        console.log('[InvestorDashboard] Formatted connection requests:', formattedRequests);
                        setSentConnectionRequests(formattedRequests);
                    }
                } catch (connError) {
                    console.error('[InvestorDashboard] Failed to fetch connection requests:', connError);
                    setSentConnectionRequests([]);
                }
            } catch (error) {
                console.error('[InvestorDashboard] Failed to fetch investor data:', error);
                // Set empty array on error
                setSentInterests([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllData();
    }, []);

    const dashboardData = {
        totalInvested: '$0',
        activeInvestments: activeInvestments.length,
        portfolioValue: '$0',
        watchlistCount: watchlist.length,
        sentInterestsCount: sentInterests.length,
        sentConnectionRequestsCount: sentConnectionRequests.length,
        monthlyActivity: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    };

    const handleRemoveFromWatchlist = (id) => {
        setWatchlist(watchlist.filter(item => item.id !== id));
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

    const handleCloseChatWindow = () => {
        console.log('[InvestorDashboard] Closing chat window');
        setActiveChatSession(null);
        setActiveChatConnectionId(null);
        // Refresh sent requests to update status
        const refetchRequests = async () => {
            try {
                const response = await connectionService.getMyConnectionRequests({ pageNumber: 1, pageSize: 10 });
                if (response && response.data && response.data.items) {
                    // Apply same formatting as initial load
                    const formattedRequests = response.data.items.map(request => {
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
                }
            } catch (error) {
                console.error('[InvestorDashboard] Failed to refetch requests:', error);
            }
        };
        refetchRequests();
    };

    return (
        <div className={styles.container}>
            {/* Unified Header */}
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
                    <div className={`${styles.statIcon} ${styles.iconCyan}`}>
                        <DollarSign size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.totalInvested}</div>
                        <div className={styles.statLabel}>Tổng đầu tư</div>
                    </div>
                </div>

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
                    <div className={`${styles.statIcon} ${styles.iconRed}`}>
                        <Heart size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.watchlistCount}</div>
                        <div className={styles.statLabel}>Danh sách theo dõi</div>
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

            {/* Navigation Tabs */}
            <div className={styles.tabs}>
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
                    Đang đầu tư
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'watchlist' ? styles.active : ''}`}
                    onClick={() => setActiveSection('watchlist')}
                >
                    Theo dõi
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'connectionrequests' ? styles.active : ''}`}
                    onClick={() => setActiveSection('connectionrequests')}
                >
                    Yêu cầu thông tin
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'interests' ? styles.active : ''}`}
                    onClick={() => setActiveSection('interests')}
                >
                    Quan tâm đã gửi
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'preferences' ? styles.active : ''}`}
                    onClick={() => setActiveSection('preferences')}
                >
                    Sở thích đầu tư
                </button>
            </div>

            {/* Content Sections */}
            <div className={styles.content}>
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

                {/* Active Investments Section */}
                {activeSection === 'investments' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>Đầu tư đang hoạt động</h3>
                            <div className={styles.list}>
                                {activeInvestments.length === 0 ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                                        <p>Chưa có khoản đầu tư nào đang hoạt động.</p>
                                    </div>
                                ) : activeInvestments.map(investment => (
                                    <div key={investment.id} className={styles.listItem}>
                                        <div className={styles.listContent}>
                                            <h4 className={styles.listTitle}>{investment.startupName}</h4>
                                            <div className={styles.listMeta} style={{ display: 'flex', gap: '12px' }}>
                                                <span className={`${styles.badge} ${styles.badgeInfo}`}>{investment.stage}</span>
                                                <span>Invested: {investment.date}</span>
                                            </div>
                                            <div style={{ marginTop: '8px', fontSize: '14px', color: 'var(--text-primary)' }}>
                                                <strong>{investment.amount}</strong> for {investment.equity} Equity
                                            </div>
                                        </div>
                                        <div className={styles.listActions}>
                                            <button className={styles.secondaryBtn}>View Details</button>
                                            <button className={styles.secondaryBtn}>Documents</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Watchlist Section */}
                {activeSection === 'watchlist' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>Danh sách theo dõi ({watchlist.length})</h3>
                            <div className={styles.list}>
                                {watchlist.length === 0 ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                                        <p>Danh sách theo dõi của bạn đang trống.</p>
                                    </div>
                                ) : watchlist.map(item => (
                                    <div key={item.id} className={styles.listItem}>
                                        <div className={styles.listContent}>
                                            <h4 className={styles.listTitle}>{item.name}</h4>
                                            <div className={styles.listMeta} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                                                <span className={`${styles.badge} ${styles.badgeInfo}`}>{item.stage}</span>
                                                <span className={`${styles.badge} ${styles.badgePending}`}>{item.industry}</span>
                                                <span>Score: {item.score}/100</span>
                                                <span>👥 {item.followers}</span>
                                            </div>
                                        </div>
                                        <div className={styles.listActions}>
                                            <button className={styles.secondaryBtn}>Profile</button>
                                            <button className={styles.primaryBtn}>Send Interest</button>
                                            <button
                                                className={styles.dangerBtn}
                                                onClick={() => handleRemoveFromWatchlist(item.id)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
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

                <FloatingChatWidget
                    chatSessionId={activeChatSession?.chatSessionId}
                    displayName={activeChatSession?.displayName}
                    currentUserId={user?.userId}
                    sentTime={activeChatSession?.sentTime}
                    onClose={handleCloseChatWindow}
                />
            </div>
        </div>
    );
}
