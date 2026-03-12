import { useState } from 'react';
import { Calendar, MapPin } from 'lucide-react';
import styles from './ProfilePage.module.css';
import StartupAdvisorsList from '../components/profile/StartupAdvisorsList';

/**
 * ProfilePage - Twitter/X-style profile page with role-specific tabs
 */
export default function ProfilePage({ user, onShowAdvisors }) {
    const [activeTab, setActiveTab] = useState('profile');

    if (!user) {
        return (
            <div className={styles.container}>
                <div className={styles.message}>Please log in to view your profile</div>
            </div>
        );
    }

    // Role-specific tabs
    const getTabs = () => {
        const baseTabs = [
            { id: 'profile', label: 'Basic Profile' },
            // Add Document/other tabs if needed, but for now just Basic Profile as requested
        ];

        return baseTabs;
    };

    const tabs = getTabs();

    // Generate @handle from name or email
    const handle = user.email ? `@${user.email.split('@')[0]}` : `@${(user.name || 'user').toLowerCase().replace(/\s+/g, '')}`;

    // Mock data
    const joinDate = 'February 2024';

    return (
        <div className={styles.container}>
            {/* Cover Banner */}
            <div className={styles.coverBanner}></div>

            {/* Profile Header */}
            <div className={styles.profileHeader}>
                <div className={styles.avatarSection}>
                    <div className={styles.avatar}>
                        <span>{(user.name || user.email || 'U').charAt(0).toUpperCase()}</span>
                    </div>
                </div>

                <div className={styles.profileInfo}>
                    <div className={styles.nameSection}>
                        <h1 className={styles.name}>{user.name || user.email}</h1>
                        <div className={styles.handle}>{handle}</div>
                    </div>

                    <div className={styles.bio}>
                        {(user.role?.toLowerCase() === 'startup' || user.role === 0) && user.companyName && (
                            <p>Building {user.companyName} | Innovating in AI-powered solutions</p>
                        )}
                        {(user.role?.toLowerCase() === 'investor' || user.role === 1) && <p>Investor | Looking for promising AI startups</p>}
                        {(user.role?.toLowerCase() === 'advisor' || user.role === 2) && <p>Advisor | Helping startups scale and succeed</p>}
                    </div>

                    <div className={styles.metadata}>
                        <div className={styles.metaItem}>
                            <Calendar size={16} />
                            <span>Joined {joinDate}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>
                {activeTab === 'profile' && <ProfileTab user={user} />}
            </div>
        </div>
    );
}

// Tab Components (inline for now, can be split later)

function OverviewTab({ user }) {
    return (
        <div className={styles.overview}>
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.cardValue}>42</div>
                    <div className={styles.cardLabel}>Profile Views</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.cardValue}>8</div>
                    <div className={styles.cardLabel}>Interests</div>
                </div>
                {(user.role?.toLowerCase() === 'startup' || user.role === 0) && (
                    <>
                        <div className={styles.statCard}>
                            <div className={styles.cardValue}>3</div>
                            <div className={styles.cardLabel}>Requests</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.cardValue}>75</div>
                            <div className={styles.cardLabel}>AI Score</div>
                        </div>
                    </>
                )}
                {(user.role?.toLowerCase() === 'investor' || user.role === 1) && (
                    <>
                        <div className={styles.statCard}>
                            <div className={styles.cardValue}>12</div>
                            <div className={styles.cardLabel}>Investments</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.cardValue}>$2.5M</div>
                            <div className={styles.cardLabel}>Invested</div>
                        </div>
                    </>
                )}
                {(user.role?.toLowerCase() === 'advisor' || user.role === 2) && (
                    <>
                        <div className={styles.statCard}>
                            <div className={styles.cardValue}>15</div>
                            <div className={styles.cardLabel}>Active Clients</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.cardValue}>98%</div>
                            <div className={styles.cardLabel}>Success Rate</div>
                        </div>
                    </>
                )}
            </div>

            <div className={styles.activity}>
                <h3>Recent Activity</h3>
                <ul className={styles.activityList}>
                    <li>Investor John Smith viewed your profile</li>
                    <li>Dr. Sarah Expert sent a consulting request</li>
                    <li>Your AI evaluation was updated (Score: 75/100)</li>
                    <li>Capital Ventures Fund showed interest</li>
                </ul>
            </div>
        </div>
    );
}

function ProfileTab({ user }) {
    return (
        <div className={styles.profileEdit}>
            <h3>Edit Profile</h3>
            <form className={styles.form}>
                <div className={styles.formGroup}>
                    <label>Name</label>
                    <input type="text" defaultValue={user.name || ''} />
                </div>
                {(user.role?.toLowerCase() === 'startup' || user.role === 0) && (
                    <div className={styles.formGroup}>
                        <label>Company Name</label>
                        <input type="text" defaultValue={user.companyName} />
                    </div>
                )}
                <div className={styles.formGroup}>
                    <label>Bio</label>
                    <textarea rows={4} placeholder="Tell us about yourself..." />
                </div>
                <button type="submit" className={styles.saveBtn}>Save Changes</button>
            </form>
        </div>
    );
}

function DocumentsTab({ user }) {
    return (
        <div className={styles.documents}>
            <h3>Note: Complete Information</h3>
            <p>For comprehensive startup information, head to your <strong>Startup Dashboard → Complete Info</strong> tab to fill out detailed information about your startup.</p>
        </div>
    );
}

function AdvisorsTab({ user, onShowAdvisors }) {
    // Show the booking management for startups
    if (user.role?.toLowerCase() === 'startup' || user.role === 0) {
        return <StartupAdvisorsList onExploreAdvisors={onShowAdvisors} />;
    }

    // For investors and advisors, show placeholder
    return (
        <div className={styles.message}>
            <h3>Coming Soon</h3>
            <p>This feature is currently under development.</p>
        </div>
    );
}
