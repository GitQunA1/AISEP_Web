import { useState } from 'react';
import styles from './InvestorDashboard.module.css';

export default function InvestorDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>Investor Dashboard</h2>
          <p className={styles.subtitle}>Welcome, {user.name}</p>
        </div>
        <button className={styles.logoutBtn} onClick={onLogout}>
          Logout
        </button>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'search' ? styles.active : ''}`}
          onClick={() => setActiveTab('search')}
        >
          🔍 Search Startups
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'portfolio' ? styles.active : ''}`}
          onClick={() => setActiveTab('portfolio')}
        >
          📈 Portfolio
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'trends' ? styles.active : ''}`}
          onClick={() => setActiveTab('trends')}
        >
          📉 Market Trends
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'profile' ? styles.active : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Profile
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'overview' && (
          <div className={styles.section}>
            <h3>🎯 Investment Dashboard</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statValue}>18</div>
                <div className={styles.statLabel}>Startups Followed</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>5</div>
                <div className={styles.statLabel}>Active Deals</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>12</div>
                <div className={styles.statLabel}>New Opportunities</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>$2.5M</div>
                <div className={styles.statLabel}>Total Invested</div>
              </div>
            </div>

            <div className={styles.recentActivity}>
              <h4>Recent Startup Activities</h4>
              <ul>
                <li>✓ Tech Innovations Inc - Raised Series A funding</li>
                <li>✓ AI Solutions Ltd - AI Evaluation Score: 82/100</li>
                <li>✓ Green Energy Co - New partnership announcement</li>
                <li>✓ FinTech Pro - Document verification completed</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className={styles.section}>
            <h3>🔍 Search & Discover Startups</h3>
            <div className={styles.searchFilters}>
              <input type="text" placeholder="Search by company name..." />
              <select>
                <option>All Categories</option>
                <option>Technology</option>
                <option>Healthcare</option>
                <option>Finance</option>
                <option>Green Energy</option>
              </select>
              <select>
                <option>All Stages</option>
                <option>Seed</option>
                <option>Series A</option>
                <option>Series B</option>
              </select>
              <select>
                <option>Min Score: Any</option>
                <option>70+</option>
                <option>80+</option>
                <option>90+</option>
              </select>
            </div>

            <div className={styles.startupsList}>
              <div className={styles.startupCard}>
                <div className={styles.scoreTag}>75</div>
                <h4>Tech Innovations Inc</h4>
                <p className={styles.category}>Technology • Seed Stage</p>
                <p className={styles.description}>
                  Building AI-powered solutions for enterprise automation. Strong team with
                  10+ years of experience.
                </p>
                <div className={styles.tags}>
                  <span>AI</span>
                  <span>Enterprise</span>
                  <span>High Growth</span>
                </div>
                <button className={styles.viewBtn}>View Profile</button>
              </div>

              <div className={styles.startupCard}>
                <div className={styles.scoreTag}>82</div>
                <h4>GreenTech Solutions</h4>
                <p className={styles.category}>Green Energy • Series A</p>
                <p className={styles.description}>
                  Renewable energy optimization platform. Already generating revenue from 50+
                  enterprise clients.
                </p>
                <div className={styles.tags}>
                  <span>Renewable</span>
                  <span>SaaS</span>
                  <span>Revenue Growing</span>
                </div>
                <button className={styles.viewBtn}>View Profile</button>
              </div>

              <div className={styles.startupCard}>
                <div className={styles.scoreTag}>68</div>
                <h4>HealthTech Pro</h4>
                <p className={styles.category}>Healthcare • Seed Stage</p>
                <p className={styles.description}>
                  Telemedicine platform connecting patients with specialists. FDA-cleared
                  technology.
                </p>
                <div className={styles.tags}>
                  <span>Healthcare</span>
                  <span>Telemedicine</span>
                  <span>Regulated</span>
                </div>
                <button className={styles.viewBtn}>View Profile</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className={styles.section}>
            <h3>📈 Your Investment Portfolio</h3>
            <div className={styles.portfolioStats}>
              <div className={styles.portfolioCard}>
                <h4>Total Invested</h4>
                <p className={styles.portfolioValue}>$2,500,000</p>
              </div>
              <div className={styles.portfolioCard}>
                <h4>Current Value</h4>
                <p className={styles.portfolioValue}>$3,200,000</p>
              </div>
              <div className={styles.portfolioCard}>
                <h4>Return Rate</h4>
                <p className={styles.portfolioValue} style={{ color: '#4ade80' }}>
                  +28%
                </p>
              </div>
            </div>

            <h4 style={{ marginTop: '30px' }}>Investments by Stage</h4>
            <div className={styles.investmentsList}>
              <div className={styles.investmentItem}>
                <div className={styles.investmentHeader}>
                  <span>Tech Innovations Inc</span>
                  <span className={styles.stageTag}>Seed</span>
                </div>
                <div className={styles.investmentDetails}>
                  <p>Invested: $500,000 • Stake: 10%</p>
                  <p>Current Value: $650,000 (+30%)</p>
                </div>
              </div>

              <div className={styles.investmentItem}>
                <div className={styles.investmentHeader}>
                  <span>GreenTech Solutions</span>
                  <span className={styles.stageTag}>Series A</span>
                </div>
                <div className={styles.investmentDetails}>
                  <p>Invested: $1,200,000 • Stake: 8%</p>
                  <p>Current Value: $1,680,000 (+40%)</p>
                </div>
              </div>

              <div className={styles.investmentItem}>
                <div className={styles.investmentHeader}>
                  <span>FinTech Pro</span>
                  <span className={styles.stageTag}>Seed</span>
                </div>
                <div className={styles.investmentDetails}>
                  <p>Invested: $800,000 • Stake: 15%</p>
                  <p>Current Value: $870,000 (+8.75%)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className={styles.section}>
            <h3>📊 Market Trends & Insights</h3>
            <div className={styles.trendsGrid}>
              <div className={styles.trendCard}>
                <h4>🔥 Hottest Sectors</h4>
                <ul>
                  <li>AI & Machine Learning (↑45%)</li>
                  <li>Green Energy (↑32%)</li>
                  <li>FinTech (↑28%)</li>
                  <li>HealthTech (↑21%)</li>
                </ul>
              </div>

              <div className={styles.trendCard}>
                <h4>📈 Average Metrics</h4>
                <ul>
                  <li>Avg Startup Score: 73/100</li>
                  <li>Avg Funding Round: $1.2M</li>
                  <li>Avg Time to Series A: 18 months</li>
                  <li>Success Rate: 72%</li>
                </ul>
              </div>

              <div className={styles.trendCard}>
                <h4>🎯 Investor Preferences</h4>
                <ul>
                  <li>B2B SaaS: Most funded (38%)</li>
                  <li>Team experience: Key factor</li>
                  <li>Market size: $10B+ preferred</li>
                  <li>Exit potential: Critical</li>
                </ul>
              </div>

              <div className={styles.trendCard}>
                <h4>⚠️ Risk Indicators</h4>
                <ul>
                  <li>Market saturation: High in certain sectors</li>
                  <li>Regulatory changes: Watch FinTech</li>
                  <li>Competition: Increasing intensity</li>
                  <li>Talent scarcity: AI/ML specialists</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className={styles.section}>
            <h3>👤 Investor Profile</h3>
            <form className={styles.form}>
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <input type="text" defaultValue={user.name} />
              </div>
              <div className={styles.formGroup}>
                <label>Company/Fund Name</label>
                <input type="text" defaultValue={user.companyName} />
              </div>
              <div className={styles.formGroup}>
                <label>Investment Focus</label>
                <textarea defaultValue="Technology, AI, Clean Energy, and FinTech startups..." />
              </div>
              <div className={styles.formGroup}>
                <label>Typical Investment Size</label>
                <select>
                  <option>$100K - $500K</option>
                  <option>$500K - $1M</option>
                  <option>$1M - $5M</option>
                  <option>$5M+</option>
                </select>
              </div>
              <button type="submit" className={styles.submitBtn}>
                Save Changes
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
