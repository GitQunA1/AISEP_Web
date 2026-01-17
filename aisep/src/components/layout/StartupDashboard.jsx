import { useState } from 'react';
import styles from './StartupDashboard.module.css';

export default function StartupDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>Startup Dashboard</h2>
          <p className={styles.subtitle}>Welcome, {user.companyName}</p>
        </div>
        <button className={styles.logoutBtn} onClick={onLogout}>
          Logout
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'profile' ? styles.active : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Profile
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'documents' ? styles.active : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          📄 Documents
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'evaluation' ? styles.active : ''}`}
          onClick={() => setActiveTab('evaluation')}
        >
          🤖 AI Evaluation
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'advisors' ? styles.active : ''}`}
          onClick={() => setActiveTab('advisors')}
        >
          👨‍💼 Find Advisors
        </button>
      </div>

      {/* Content Area */}
      <div className={styles.content}>
        {activeTab === 'overview' && (
          <div className={styles.section}>
            <h3>📈 Your Project Overview</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statValue}>42</div>
                <div className={styles.statLabel}>Profile Views</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>8</div>
                <div className={styles.statLabel}>Investor Interests</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>3</div>
                <div className={styles.statLabel}>Advisor Requests</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>75</div>
                <div className={styles.statLabel}>Potential Score</div>
              </div>
            </div>

            <div className={styles.recentActivity}>
              <h4>Recent Activity</h4>
              <ul>
                <li>✓ Investor John Smith viewed your profile</li>
                <li>✓ Dr. Sarah Expert sent a consulting request</li>
                <li>✓ Your AI evaluation was updated (Score: 75/100)</li>
                <li>✓ Capital Ventures Fund showed interest</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className={styles.section}>
            <h3>👤 Startup Profile</h3>
            <form className={styles.form}>
              <div className={styles.formGroup}>
                <label>Company Name</label>
                <input type="text" defaultValue={user.companyName} />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea defaultValue="Building innovative tech solutions for modern businesses..." />
              </div>
              <div className={styles.formGroup}>
                <label>Industry</label>
                <select>
                  <option>Technology</option>
                  <option>Healthcare</option>
                  <option>Finance</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Funding Stage</label>
                <select>
                  <option>Seed</option>
                  <option>Series A</option>
                  <option>Series B</option>
                </select>
              </div>
              <button type="submit" className={styles.submitBtn}>
                Save Changes
              </button>
            </form>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className={styles.section}>
            <h3>📄 Documents & IP</h3>
            <div className={styles.uploadBox}>
              <input type="file" id="docUpload" multiple />
              <label htmlFor="docUpload" className={styles.uploadLabel}>
                📤 Drag files here or click to upload
              </label>
              <p>Supported: PDF, DOC, DOCX, PPT</p>
            </div>

            <div className={styles.documentsList}>
              <h4>Uploaded Documents</h4>
              <div className={styles.documentItem}>
                <span>📋 Business Plan 2024.pdf</span>
                <div>
                  <button className={styles.smallBtn}>View</button>
                  <button className={styles.smallBtn}>Verify on Blockchain</button>
                  <button className={styles.deleteBtn}>Delete</button>
                </div>
              </div>
              <div className={styles.documentItem}>
                <span>🔐 Patent Application.docx</span>
                <div>
                  <button className={styles.smallBtn}>View</button>
                  <button className={styles.smallBtn}>Verify on Blockchain</button>
                  <button className={styles.deleteBtn}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'evaluation' && (
          <div className={styles.section}>
            <h3>🤖 AI Evaluation Result</h3>
            <div className={styles.evaluationCard}>
              <div className={styles.scoreCircle}>
                <div className={styles.scoreValue}>75</div>
                <div className={styles.scoreLabel}>/ 100</div>
              </div>
              <div className={styles.scoreDetails}>
                <h4>Startup Potential Score</h4>
                <p>Your startup shows strong potential for growth and investor interest.</p>

                <div className={styles.metricsTable}>
                  <div className={styles.metricRow}>
                    <span>Market Size Potential</span>
                    <div className={styles.progressBar}>
                      <div className={styles.progress} style={{ width: '85%' }}></div>
                    </div>
                    <span>85/100</span>
                  </div>
                  <div className={styles.metricRow}>
                    <span>Team Strength</span>
                    <div className={styles.progressBar}>
                      <div className={styles.progress} style={{ width: '72%' }}></div>
                    </div>
                    <span>72/100</span>
                  </div>
                  <div className={styles.metricRow}>
                    <span>Innovation Factor</span>
                    <div className={styles.progressBar}>
                      <div className={styles.progress} style={{ width: '78%' }}></div>
                    </div>
                    <span>78/100</span>
                  </div>
                  <div className={styles.metricRow}>
                    <span>Business Model Viability</span>
                    <div className={styles.progressBar}>
                      <div className={styles.progress} style={{ width: '68%' }}></div>
                    </div>
                    <span>68/100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'advisors' && (
          <div className={styles.section}>
            <h3>👨‍💼 Find & Request Advisors</h3>
            <input
              type="text"
              placeholder="Search advisors by expertise..."
              className={styles.searchInput}
            />

            <div className={styles.advisorsList}>
              <div className={styles.advisorCard}>
                <div className={styles.advisorHeader}>
                  <div className={styles.advisorAvatar}>👨‍💼</div>
                  <div className={styles.advisorInfo}>
                    <h4>Dr. Sarah Expert</h4>
                    <p>Business Strategy & Growth</p>
                  </div>
                </div>
                <p className={styles.advisorBio}>
                  20+ years of experience in tech startups. Specialized in scaling operations
                  and investor relations.
                </p>
                <button className={styles.requestBtn}>Send Request</button>
              </div>

              <div className={styles.advisorCard}>
                <div className={styles.advisorHeader}>
                  <div className={styles.advisorAvatar}>👨‍💼</div>
                  <div className={styles.advisorInfo}>
                    <h4>John Finance Expert</h4>
                    <p>Fundraising & Financial Planning</p>
                  </div>
                </div>
                <p className={styles.advisorBio}>
                  Expert in securing Series A/B funding. Helped 50+ startups raise $500M+.
                </p>
                <button className={styles.requestBtn}>Send Request</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
