import React, { useState } from 'react';
import { TrendingUp, Heart, DollarSign, CheckCircle, Eye, MessageSquare } from 'lucide-react';
import styles from '../styles/SharedDashboard.module.css';
import FeedHeader from '../components/feed/FeedHeader';

/**
 * InvestorDashboard - Comprehensive dashboard for investors
 * Features: Portfolio overview, Watchlist, Sent interests, Active investments, Preferences
 */
export default function InvestorDashboard({ user }) {
    const [activeSection, setActiveSection] = useState('overview');
    const [watchlist, setWatchlist] = useState([]);
    const [sentInterests, setSentInterests] = useState([]);
    const [activeInvestments, setActiveInvestments] = useState([]);

    const dashboardData = {
        totalInvested: '$0',
        activeInvestments: activeInvestments.length,
        portfolioValue: '$0',
        watchlistCount: watchlist.length,
        sentInterestsCount: sentInterests.length,
        acceptedInterests: sentInterests.filter(i => i.status === 'accepted').length,
        monthlyActivity: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    };

    const handleRemoveFromWatchlist = (id) => {
        setWatchlist(watchlist.filter(item => item.id !== id));
    };

    const handleWithdrawInterest = (id) => {
        setSentInterests(sentInterests.filter(item => item.id !== id));
    };

    return (
        <div className={styles.container}>
            {/* Unified Header */}
            <FeedHeader
                title="Bảng điều khiển Nhà đầu tư"
                subtitle={`Xin chào, ${user?.name || 'Nhà đầu tư'}! Quản lý đầu tư và khám phá startup.`}
                showFilter={false}
                user={user}
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

                {/* Sent Interests Section */}
                {activeSection === 'interests' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>
                                Quan tâm đã gửi ({sentInterests.length})
                            </h3>
                            <div className={styles.list}>
                                {sentInterests.length === 0 ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                                        <p>Bạn chưa gửi quan tâm đến startup nào.</p>
                                    </div>
                                ) : sentInterests.map(interest => (
                                    <div key={interest.id} className={styles.listItem}>
                                        <div className={styles.listContent}>
                                            <h4 className={styles.listTitle}>{interest.startupName}</h4>
                                            <div className={styles.listMeta}>
                                                <span className={`${styles.badge} ${styles.badgeInfo}`} style={{ marginRight: '8px' }}>{interest.stage}</span>
                                                Sent: {interest.sentDate}
                                            </div>
                                        </div>
                                        <div className={styles.listActions} style={{ alignItems: 'center' }}>
                                            <span className={`${styles.badge} ${interest.status === 'pending' ? styles.badgePending : styles.badgeSuccess}`}>
                                                {interest.status === 'pending' ? '⏳ Chờ xử lý' : '✓ Đã chấp nhận'}
                                            </span>
                                            {interest.status === 'pending' && (
                                                <button
                                                    className={styles.dangerBtn}
                                                    onClick={() => handleWithdrawInterest(interest.id)}
                                                >
                                                    Rút lại
                                                </button>
                                            )}
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
            </div>
        </div>
    );
}
