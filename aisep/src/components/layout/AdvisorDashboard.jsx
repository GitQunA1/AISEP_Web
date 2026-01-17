import { useState } from 'react';
import styles from './AdvisorDashboard.module.css';

export default function AdvisorDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>Advisor Dashboard</h2>
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
          className={`${styles.tab} ${activeTab === 'requests' ? styles.active : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          📨 Consulting Requests
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'schedule' ? styles.active : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          📅 Appointments
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'reports' ? styles.active : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          📝 Reports
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
            <h3>👨‍💼 Advisor Overview</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statValue}>24</div>
                <div className={styles.statLabel}>Clients Helped</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>18</div>
                <div className={styles.statLabel}>Successful Cases</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>4.8/5</div>
                <div className={styles.statLabel}>Average Rating</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>95%</div>
                <div className={styles.statLabel}>Success Rate</div>
              </div>
            </div>

            <div className={styles.recentActivity}>
              <h4>Recent Consulting Sessions</h4>
              <ul>
                <li>✓ Tech Innovations Inc - Strategy session (Jan 15)</li>
                <li>✓ GreenTech Solutions - Fundraising advice (Jan 12)</li>
                <li>✓ HealthTech Pro - Market analysis (Jan 10)</li>
                <li>✓ FinTech Pro - Team building guidance (Jan 8)</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className={styles.section}>
            <h3>📨 Consulting Requests</h3>
            <div className={styles.requestsList}>
              <div className={styles.requestCard}>
                <div className={styles.requestStatus}>Pending</div>
                <h4>Tech Innovations Inc</h4>
                <p className={styles.requestType}>Expertise: Business Strategy & Growth</p>
                <p className={styles.requestMessage}>
                  We need advice on scaling our operations and preparing for Series A funding.
                  Looking for guidance on investor relations and business model optimization.
                </p>
                <div className={styles.requestMeta}>
                  <span>📅 Requested: Jan 16, 2024</span>
                  <span>💰 Budget: $2,000/hour</span>
                </div>
                <div className={styles.requestActions}>
                  <button className={styles.acceptBtn}>✓ Accept</button>
                  <button className={styles.declineBtn}>✗ Decline</button>
                </div>
              </div>

              <div className={styles.requestCard}>
                <div className={`${styles.requestStatus} ${styles.accepted}`}>Accepted</div>
                <h4>GreenTech Solutions</h4>
                <p className={styles.requestType}>Expertise: Fundraising & Financial Planning</p>
                <p className={styles.requestMessage}>
                  Help with Series B funding strategy. We have strong traction and need
                  guidance on investor pitching.
                </p>
                <div className={styles.requestMeta}>
                  <span>📅 Requested: Jan 14, 2024</span>
                  <span>💰 Budget: $3,000/hour</span>
                </div>
                <div className={styles.requestActions}>
                  <button className={styles.scheduleBtn}>Schedule Session</button>
                  <button className={styles.messageBtn}>Send Message</button>
                </div>
              </div>

              <div className={styles.requestCard}>
                <div className={`${styles.requestStatus} ${styles.rejected}`}>Declined</div>
                <h4>FinTech Startup X</h4>
                <p className={styles.requestType}>Expertise: Regulatory Compliance</p>
                <p className={styles.requestMessage}>
                  Need guidance on payment processing regulations and compliance.
                </p>
                <div className={styles.requestMeta}>
                  <span>📅 Requested: Jan 12, 2024</span>
                  <span>📌 Reason: Outside expertise area</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className={styles.section}>
            <h3>📅 Upcoming Appointments</h3>
            <div className={styles.appointmentsList}>
              <div className={styles.appointmentCard}>
                <div className={styles.appointmentDate}>
                  <div className={styles.date}>18</div>
                  <div className={styles.month}>JAN</div>
                </div>
                <div className={styles.appointmentInfo}>
                  <h4>GreenTech Solutions - Series B Strategy</h4>
                  <p>
                    <strong>Time:</strong> 2:00 PM - 3:30 PM (UTC+7)
                  </p>
                  <p>
                    <strong>Type:</strong> Video Call
                  </p>
                  <p>
                    <strong>Client:</strong> John CEO, GreenTech Solutions
                  </p>
                  <p className={styles.description}>
                    Discuss Series B funding strategy, investor targeting, and pitching
                    approach.
                  </p>
                </div>
                <div className={styles.appointmentActions}>
                  <button className={styles.joinBtn}>Join Call</button>
                  <button className={styles.editBtn}>Edit</button>
                </div>
              </div>

              <div className={styles.appointmentCard}>
                <div className={styles.appointmentDate}>
                  <div className={styles.date}>20</div>
                  <div className={styles.month}>JAN</div>
                </div>
                <div className={styles.appointmentInfo}>
                  <h4>Tech Innovations Inc - Operations Scaling</h4>
                  <p>
                    <strong>Time:</strong> 10:00 AM - 11:00 AM (UTC+7)
                  </p>
                  <p>
                    <strong>Type:</strong> Video Call
                  </p>
                  <p>
                    <strong>Client:</strong> Sarah CTO, Tech Innovations Inc
                  </p>
                  <p className={styles.description}>
                    Operations scaling, team hiring strategy, and process optimization.
                  </p>
                </div>
                <div className={styles.appointmentActions}>
                  <button className={styles.joinBtn}>Join Call</button>
                  <button className={styles.editBtn}>Edit</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className={styles.section}>
            <h3>📝 Consulting Reports</h3>
            <div className={styles.reportsList}>
              <div className={styles.reportCard}>
                <div className={styles.reportHeader}>
                  <h4>GreenTech Solutions - Series B Strategy Session</h4>
                  <span className={styles.reportDate}>Jan 15, 2024</span>
                </div>
                <p className={styles.clientName}>Client: GreenTech Solutions</p>
                <div className={styles.reportContent}>
                  <h5>Key Recommendations:</h5>
                  <ul>
                    <li>Target strategic VCs focused on climate tech</li>
                    <li>Strengthen financial projections and runway</li>
                    <li>Develop compelling Series B pitch deck</li>
                    <li>Build advisor board for credibility</li>
                  </ul>
                </div>
                <div className={styles.reportActions}>
                  <button className={styles.viewBtn}>View Full Report</button>
                  <button className={styles.editBtn}>Edit</button>
                  <button className={styles.shareBtn}>Share with Client</button>
                </div>
              </div>

              <div className={styles.reportCard}>
                <div className={styles.reportHeader}>
                  <h4>Tech Innovations Inc - Scaling Strategy</h4>
                  <span className={styles.reportDate}>Jan 10, 2024</span>
                </div>
                <p className={styles.clientName}>Client: Tech Innovations Inc</p>
                <div className={styles.reportContent}>
                  <h5>Key Recommendations:</h5>
                  <ul>
                    <li>Expand engineering team to 25+ people</li>
                    <li>Establish product roadmap for next 12 months</li>
                    <li>Implement OKR framework for alignment</li>
                    <li>Focus on customer retention metrics</li>
                  </ul>
                </div>
                <div className={styles.reportActions}>
                  <button className={styles.viewBtn}>View Full Report</button>
                  <button className={styles.editBtn}>Edit</button>
                  <button className={styles.shareBtn}>Share with Client</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className={styles.section}>
            <h3>👤 Advisor Profile</h3>
            <form className={styles.form}>
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <input type="text" defaultValue={user.name} />
              </div>
              <div className={styles.formGroup}>
                <label>Title/Expertise</label>
                <input type="text" defaultValue="Business Strategy & Growth Expert" />
              </div>
              <div className={styles.formGroup}>
                <label>Bio</label>
                <textarea defaultValue="20+ years of experience in tech startups. Specialized in scaling operations and investor relations. Helped 50+ startups achieve success." />
              </div>
              <div className={styles.formGroup}>
                <label>Expertise Areas</label>
                <input type="text" defaultValue="Business Strategy, Fundraising, Operations, Team Building" />
              </div>
              <div className={styles.formGroup}>
                <label>Hourly Rate</label>
                <input type="number" defaultValue="200" />
              </div>
              <div className={styles.formGroup}>
                <label>Availability</label>
                <select>
                  <option>Available</option>
                  <option>Limited</option>
                  <option>Unavailable</option>
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
