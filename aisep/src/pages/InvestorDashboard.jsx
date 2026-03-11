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
    const [watchlist, setWatchlist] = useState([
        { id: 1, name: 'TechStartup AI', stage: 'Series A', industry: 'AI/ML', score: 85, followers: 234 },
        { id: 2, name: 'FinApp Solutions', stage: 'Seed', industry: 'Fintech', score: 78, followers: 156 },
        { id: 3, name: 'HealthPro Tech', stage: 'MVP', industry: 'HealthTech', score: 72, followers: 89 }
    ]);

    const [sentInterests, setSentInterests] = useState([
        { id: 1, startupName: 'CloudData Inc', stage: 'Series A', sentDate: '2024-01-15', status: 'pending' },
        { id: 2, startupName: 'AI Analytics', stage: 'Seed', sentDate: '2024-01-10', status: 'accepted' },
        { id: 3, startupName: 'BlockChain Lab', stage: 'Series B', sentDate: '2024-01-08', status: 'pending' }
    ]);

    const [activeInvestments] = useState([
        { id: 1, startupName: 'VRFuture Labs', amount: '$500K', date: '2023-06-15', stage: 'Series A', equity: '2.5%' },
        { id: 2, startupName: 'QuantumTech', amount: '$250K', date: '2023-09-20', stage: 'Seed', equity: '1.2%' }
    ]);

    const dashboardData = {
        totalInvested: '$750K',
        activeInvestments: activeInvestments.length,
        portfolioValue: '$1.2M',
        watchlistCount: watchlist.length,
        sentInterestsCount: sentInterests.length,
        acceptedInterests: sentInterests.filter(i => i.status === 'accepted').length,
        monthlyActivity: [2, 5, 8, 12, 10, 15, 18, 22, 25, 28, 32, 38]
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
                title="Investor Dashboard"
                subtitle={`Welcome, ${user?.name || 'Investor'}! Manage your investments and discover startups.`}
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
                        <div className={styles.statLabel}>Total Invested</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconPurple}`}>
                        <TrendingUp size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.activeInvestments}</div>
                        <div className={styles.statLabel}>Active Investments</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconRed}`}>
                        <Heart size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.watchlistCount}</div>
                        <div className={styles.statLabel}>Watchlist</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconGreen}`}>
                        <MessageSquare size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.acceptedInterests}</div>
                        <div className={styles.statLabel}>Accepted Pitches</div>
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
                    className={`${styles.tab} ${activeSection === 'investments' ? styles.active : ''}`}
                    onClick={() => setActiveSection('investments')}
                >
                    Active Investments
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'watchlist' ? styles.active : ''}`}
                    onClick={() => setActiveSection('watchlist')}
                >
                    Watchlist
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'interests' ? styles.active : ''}`}
                    onClick={() => setActiveSection('interests')}
                >
                    Sent Interests
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'preferences' ? styles.active : ''}`}
                    onClick={() => setActiveSection('preferences')}
                >
                    Preferences
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
                                <h3 className={styles.cardTitle}>Portfolio Summary</h3>
                                <div className={styles.metricsGrid}>
                                    <div className={styles.metricItem}>
                                        <div className={styles.metricLabel}>Portfolio Value</div>
                                        <div className={styles.metricValue}>{dashboardData.portfolioValue}</div>
                                    </div>
                                    <div className={styles.metricItem}>
                                        <div className={styles.metricLabel}>Active Investments</div>
                                        <div className={styles.metricValue}>{dashboardData.activeInvestments}</div>
                                    </div>
                                    <div className={styles.metricItem}>
                                        <div className={styles.metricLabel}>Total Deployed</div>
                                        <div className={styles.metricValue}>{dashboardData.totalInvested}</div>
                                    </div>
                                    <div className={styles.metricItem}>
                                        <div className={styles.metricLabel}>Accepted Interests</div>
                                        <div className={styles.metricValue}>{dashboardData.acceptedInterests}</div>
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
                                            <div className={styles.listTitle}>Interest accepted by TechStartup AI</div>
                                            <div className={styles.listMeta}>3 hours ago</div>
                                        </div>
                                    </div>
                                    <div className={styles.listItem}>
                                        <div className={`${styles.listIcon} ${styles.iconCyan}`}>
                                            <Eye size={18} />
                                        </div>
                                        <div className={styles.listContent}>
                                            <div className={styles.listTitle}>New startup added to watchlist: FinApp</div>
                                            <div className={styles.listMeta}>1 day ago</div>
                                        </div>
                                    </div>
                                    <div className={styles.listItem}>
                                        <div className={`${styles.listIcon} ${styles.iconPurple}`}>
                                            <TrendingUp size={18} />
                                        </div>
                                        <div className={styles.listContent}>
                                            <div className={styles.listTitle}>AI Score updated for CloudData Inc (82/100)</div>
                                            <div className={styles.listMeta}>2 days ago</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className={styles.card}>
                                <h3 className={styles.cardTitle}>Quick Stats</h3>
                                <div className={styles.list}>
                                    <div className={styles.listItem} style={{ justifyContent: 'space-between' }}>
                                        <span className={styles.listSubtitle}>Average AI Score</span>
                                        <strong>79/100</strong>
                                    </div>
                                    <div className={styles.listItem} style={{ justifyContent: 'space-between' }}>
                                        <span className={styles.listSubtitle}>Preferred Stage</span>
                                        <strong>Series A</strong>
                                    </div>
                                    <div className={styles.listItem} style={{ justifyContent: 'space-between' }}>
                                        <span className={styles.listSubtitle}>Top Industry</span>
                                        <strong>AI/ML</strong>
                                    </div>
                                    <div className={styles.listItem} style={{ justifyContent: 'space-between' }}>
                                        <span className={styles.listSubtitle}>Success Rate</span>
                                        <strong>67%</strong>
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
                            <h3 className={styles.cardTitle}>Active Investments</h3>
                            <div className={styles.list}>
                                {activeInvestments.map(investment => (
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
                            <h3 className={styles.cardTitle}>My Watchlist ({watchlist.length})</h3>
                            <div className={styles.list}>
                                {watchlist.map(item => (
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
                                Sent Interests ({sentInterests.length})
                            </h3>
                            <div className={styles.list}>
                                {sentInterests.map(interest => (
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
                                                {interest.status === 'pending' ? '⏳ Pending' : '✓ Accepted'}
                                            </span>
                                            {interest.status === 'pending' && (
                                                <button
                                                    className={styles.dangerBtn}
                                                    onClick={() => handleWithdrawInterest(interest.id)}
                                                >
                                                    Withdraw
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
                            <h3 className={styles.cardTitle}>Investment Preferences</h3>
                            <form className={styles.form}>
                                <div className={styles.formGroup}>
                                    <label>Preferred Industries</label>
                                    <div className={styles.checkboxGroup}>
                                        <label><input type="checkbox" defaultChecked /> AI/ML</label>
                                        <label><input type="checkbox" defaultChecked /> Fintech</label>
                                        <label><input type="checkbox" /> HealthTech</label>
                                        <label><input type="checkbox" /> E-commerce</label>
                                        <label><input type="checkbox" /> SaaS</label>
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Preferred Stages</label>
                                    <div className={styles.checkboxGroup}>
                                        <label><input type="checkbox" /> Pre-Seed</label>
                                        <label><input type="checkbox" defaultChecked /> Seed</label>
                                        <label><input type="checkbox" defaultChecked /> Series A</label>
                                        <label><input type="checkbox" /> Series B</label>
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Minimum AI Score</label>
                                        <input type="number" min="0" max="100" defaultValue="70" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Typical Check Size</label>
                                        <input type="text" placeholder="e.g., $250K - $1M" />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                                    <button type="submit" className={styles.primaryBtn}>Save Preferences</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
