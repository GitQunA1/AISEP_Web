import React, { useState } from 'react';
import { TrendingUp, Heart, DollarSign, CheckCircle, Calendar, Target, Eye, MessageSquare } from 'lucide-react';
import styles from './InvestorDashboard.module.css';

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
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>Investor Dashboard</h1>
                    <p className={styles.subtitle}>Welcome, {user?.name || 'Investor'}! Manage your investments and discover startups.</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#dbeafe' }}>
                        <DollarSign size={24} color="#0284c7" />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.totalInvested}</div>
                        <div className={styles.statLabel}>Total Invested</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#ede9fe' }}>
                        <TrendingUp size={24} color="#7c3aed" />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.activeInvestments}</div>
                        <div className={styles.statLabel}>Active Investments</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#fce7f3' }}>
                        <Heart size={24} color="#be185d" />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.watchlistCount}</div>
                        <div className={styles.statLabel}>Watchlist</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#f0fdf4' }}>
                        <MessageSquare size={24} color="#16a34a" />
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
                                <div className={styles.summaryGrid}>
                                    <div className={styles.summaryItem}>
                                        <div className={styles.summaryLabel}>Portfolio Value</div>
                                        <div className={styles.summaryValue}>{dashboardData.portfolioValue}</div>
                                    </div>
                                    <div className={styles.summaryItem}>
                                        <div className={styles.summaryLabel}>Active Investments</div>
                                        <div className={styles.summaryValue}>{dashboardData.activeInvestments}</div>
                                    </div>
                                    <div className={styles.summaryItem}>
                                        <div className={styles.summaryLabel}>Total Deployed</div>
                                        <div className={styles.summaryValue}>{dashboardData.totalInvested}</div>
                                    </div>
                                    <div className={styles.summaryItem}>
                                        <div className={styles.summaryLabel}>Accepted Interests</div>
                                        <div className={styles.summaryValue}>{dashboardData.acceptedInterests}</div>
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
                                            <div className={styles.activityTitle}>Interest accepted by TechStartup AI</div>
                                            <div className={styles.activityTime}>3 hours ago</div>
                                        </div>
                                    </div>
                                    <div className={styles.activityItem}>
                                        <div className={styles.activityIcon}>
                                            <Eye size={18} />
                                        </div>
                                        <div className={styles.activityContent}>
                                            <div className={styles.activityTitle}>New startup added to watchlist: FinApp</div>
                                            <div className={styles.activityTime}>1 day ago</div>
                                        </div>
                                    </div>
                                    <div className={styles.activityItem}>
                                        <div className={styles.activityIcon}>
                                            <TrendingUp size={18} />
                                        </div>
                                        <div className={styles.activityContent}>
                                            <div className={styles.activityTitle}>AI Score updated for CloudData Inc (82/100)</div>
                                            <div className={styles.activityTime}>2 days ago</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className={styles.card}>
                                <h3 className={styles.cardTitle}>Quick Stats</h3>
                                <div className={styles.statsDetails}>
                                    <div className={styles.statRow}>
                                        <span>Average AI Score</span>
                                        <strong>79/100</strong>
                                    </div>
                                    <div className={styles.statRow}>
                                        <span>Preferred Stage</span>
                                        <strong>Series A</strong>
                                    </div>
                                    <div className={styles.statRow}>
                                        <span>Top Industry</span>
                                        <strong>AI/ML</strong>
                                    </div>
                                    <div className={styles.statRow}>
                                        <span>Success Rate</span>
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
                            <div className={styles.investmentsList}>
                                {activeInvestments.map(investment => (
                                    <div key={investment.id} className={styles.investmentItem}>
                                        <div className={styles.investmentInfo}>
                                            <h4 className={styles.startupName}>{investment.startupName}</h4>
                                            <div className={styles.investmentDetails}>
                                                <span className={styles.stage}>{investment.stage}</span>
                                                <span className={styles.date}>Invested: {investment.date}</span>
                                            </div>
                                            <div className={styles.investmentBreakdown}>
                                                <span>Amount: {investment.amount}</span>
                                                <span>Equity: {investment.equity}</span>
                                            </div>
                                        </div>
                                        <div className={styles.investmentActions}>
                                            <button className={styles.viewBtn}>View Details</button>
                                            <button className={styles.documentsBtn}>Documents</button>
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
                            <div className={styles.watchlistItems}>
                                {watchlist.map(item => (
                                    <div key={item.id} className={styles.watchlistItem}>
                                        <div className={styles.watchlistInfo}>
                                            <h4 className={styles.startupName}>{item.name}</h4>
                                            <div className={styles.watchlistMeta}>
                                                <span className={styles.stage}>{item.stage}</span>
                                                <span className={styles.industry}>{item.industry}</span>
                                                <span className={styles.score}>Score: {item.score}/100</span>
                                                <span className={styles.followers}>👥 {item.followers}</span>
                                            </div>
                                        </div>
                                        <div className={styles.watchlistActions}>
                                            <button className={styles.viewBtn}>View Profile</button>
                                            <button className={styles.interestBtn}>Send Interest</button>
                                            <button
                                                className={styles.removeBtn}
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
                            <div className={styles.interestsList}>
                                {sentInterests.map(interest => (
                                    <div key={interest.id} className={styles.interestItem}>
                                        <div className={styles.interestInfo}>
                                            <h4 className={styles.startupName}>{interest.startupName}</h4>
                                            <div className={styles.interestMeta}>
                                                <span className={styles.stage}>{interest.stage}</span>
                                                <span>Sent: {interest.sentDate}</span>
                                            </div>
                                        </div>
                                        <div className={styles.interestStatus}>
                                            <span className={`${styles.statusBadge} ${styles[`badge-${interest.status}`]}`}>
                                                {interest.status === 'pending' && '⏳ Pending'}
                                                {interest.status === 'accepted' && '✓ Accepted'}
                                            </span>
                                        </div>
                                        {interest.status === 'pending' && (
                                            <button
                                                className={styles.withdrawBtn}
                                                onClick={() => handleWithdrawInterest(interest.id)}
                                            >
                                                Withdraw
                                            </button>
                                        )}
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

                                <div className={styles.formActions}>
                                    <button type="submit" className={styles.saveBtn}>Save Preferences</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
