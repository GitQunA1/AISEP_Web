import React, { useState } from 'react';
import { Users, Calendar, FileText, Star, Clock, CheckCircle, MessageSquare, PlusCircle, TrendingUp } from 'lucide-react';
import styles from '../styles/SharedDashboard.module.css';
import FeedHeader from '../components/feed/FeedHeader';

/**
 * AdvisorDashboard - Comprehensive dashboard for advisors/experts
 * Features: Overview stats, Pending requests, Appointments, Active clients, Consulting reports
 */
export default function AdvisorDashboard({ user }) {
    const [activeSection, setActiveSection] = useState('overview');
    const [consultingRequests, setConsultingRequests] = useState([
        {
            id: 1,
            startupName: 'TechStartup AI',
            founderName: 'John Doe',
            expertise: 'AI Architecture',
            inquiry: 'Help with scaling ML infrastructure',
            budget: '$2000 - $3000',
            requestDate: '2024-01-18',
            status: 'pending'
        },
        {
            id: 2,
            startupName: 'FinApp Solutions',
            founderName: 'Jane Smith',
            expertise: 'Financial Strategy',
            inquiry: 'Guidance on Series A fundraising',
            budget: '$3000 - $5000',
            requestDate: '2024-01-15',
            status: 'accepted'
        },
        {
            id: 3,
            startupName: 'BlockChain Lab',
            founderName: 'Mike Johnson',
            expertise: 'Blockchain',
            inquiry: 'Smart contract security review',
            budget: '$1500 - $2500',
            requestDate: '2024-01-10',
            status: 'rejected'
        }
    ]);

    const [appointments, setAppointments] = useState([
        {
            id: 1,
            startupName: 'FinApp Solutions',
            founderName: 'Jane Smith',
            date: '2024-01-25',
            time: '14:00',
            duration: '60 min',
            status: 'scheduled'
        },
        {
            id: 2,
            startupName: 'CloudData Inc',
            founderName: 'Alex Chen',
            date: '2024-01-30',
            time: '10:00',
            duration: '45 min',
            status: 'scheduled'
        }
    ]);

    const [consultingReports, setConsultingReports] = useState([
        {
            id: 1,
            startupName: 'TechStartup AI',
            founderName: 'John Doe',
            date: '2024-01-10',
            consultationDate: '2024-01-05',
            rating: 5,
            status: 'completed'
        },
        {
            id: 2,
            startupName: 'HealthPro Tech',
            founderName: 'Sarah Lee',
            date: '2023-12-20',
            consultationDate: '2023-12-15',
            rating: 4.5,
            status: 'completed'
        }
    ]);

    const dashboardData = {
        activeClients: 5,
        totalConsultations: 12,
        completedReports: consultingReports.length,
        averageRating: 4.8,
        hourlyRate: '$150 - $250',
        upcomingAppointments: appointments.length,
        pendingRequests: consultingRequests.filter(r => r.status === 'pending').length,
        acceptedRequests: consultingRequests.filter(r => r.status === 'accepted').length
    };

    const handleAcceptRequest = (id) => {
        setConsultingRequests(consultingRequests.map(req =>
            req.id === id ? { ...req, status: 'accepted' } : req
        ));
    };

    const handleRejectRequest = (id) => {
        setConsultingRequests(consultingRequests.map(req =>
            req.id === id ? { ...req, status: 'rejected' } : req
        ));
    };

    const handleRescheduleAppointment = (id) => {
        alert('Reschedule functionality would open a calendar picker');
    };

    const handleCancelAppointment = (id) => {
        setAppointments(appointments.filter(appt => appt.id !== id));
    };

    return (
        <div className={styles.container}>
            {/* Unified Header */}
            <FeedHeader
                title="Advisor Dashboard"
                subtitle={`Welcome, ${user?.name || 'Advisor'}! Manage your consulting practice.`}
                showFilter={false}
                user={user}
            />

            {/* Quick Stats */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconPurple}`}>
                        <Users size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.activeClients}</div>
                        <div className={styles.statLabel}>Active Clients</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconYellow}`}>
                        <MessageSquare size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.pendingRequests}</div>
                        <div className={styles.statLabel}>Pending Requests</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconBlue}`}>
                        <Calendar size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.upcomingAppointments}</div>
                        <div className={styles.statLabel}>Upcoming</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconRed}`}>
                        <Star size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.averageRating}</div>
                        <div className={styles.statLabel}>Avg Rating</div>
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
                    className={`${styles.tab} ${activeSection === 'requests' ? styles.active : ''}`}
                    onClick={() => setActiveSection('requests')}
                >
                    Requests
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'appointments' ? styles.active : ''}`}
                    onClick={() => setActiveSection('appointments')}
                >
                    Appointments
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'reports' ? styles.active : ''}`}
                    onClick={() => setActiveSection('reports')}
                >
                    Reports
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'profile' ? styles.active : ''}`}
                    onClick={() => setActiveSection('profile')}
                >
                    Profile
                </button>
            </div>

            {/* Content Sections */}
            <div className={styles.content}>
                {/* Overview Section */}
                {activeSection === 'overview' && (
                    <div className={styles.section}>
                        <div className={styles.sectionGrid}>
                            {/* Summary Stats */}
                            <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
                                <h3 className={styles.cardTitle}>Practice Summary</h3>
                                <div className={styles.metricsGrid}>
                                    <div className={styles.metricItem}>
                                        <div className={styles.metricLabel}>Total Consultations</div>
                                        <div className={styles.metricValue}>{dashboardData.totalConsultations}</div>
                                    </div>
                                    <div className={styles.metricItem}>
                                        <div className={styles.metricLabel}>Completed Reports</div>
                                        <div className={styles.metricValue}>{dashboardData.completedReports}</div>
                                    </div>
                                    <div className={styles.metricItem}>
                                        <div className={styles.metricLabel}>Average Rating</div>
                                        <div className={styles.metricValue}>
                                            {dashboardData.averageRating} ⭐
                                        </div>
                                    </div>
                                    <div className={styles.metricItem}>
                                        <div className={styles.metricLabel}>Hourly Rate</div>
                                        <div className={styles.metricValue}>{dashboardData.hourlyRate}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Upcoming Appointments */}
                            <div className={styles.card}>
                                <h3 className={styles.cardTitle}>Next 7 Days</h3>
                                <div className={styles.list}>
                                    {appointments.slice(0, 3).map(appt => (
                                        <div key={appt.id} className={styles.listItem}>
                                            <div className={styles.dateBox} style={{ marginRight: '12px' }}>
                                                <span className={styles.dateMonth}>Jan</span>
                                                <span className={styles.dateDay}>{appt.date.split('-')[2]}</span>
                                            </div>
                                            <div className={styles.listContent}>
                                                <h4 className={styles.listTitle}>{appt.startupName}</h4>
                                                <div className={styles.listMeta}>{appt.time} • {appt.duration}</div>
                                            </div>
                                            <div className={`${styles.badge} ${styles.badgeSuccess}`}>Confirmed</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className={styles.card}>
                                <h3 className={styles.cardTitle}>Recent Activity</h3>
                                <div className={styles.list}>
                                    <div className={styles.listItem}>
                                        <div className={`${styles.listIcon} ${styles.iconYellow}`}>
                                            <MessageSquare size={18} />
                                        </div>
                                        <div className={styles.listContent}>
                                            <div className={styles.listTitle}>New request from TechStartup AI</div>
                                            <div className={styles.listMeta}>2 hours ago</div>
                                        </div>
                                    </div>
                                    <div className={styles.listItem}>
                                        <div className={`${styles.listIcon} ${styles.iconGreen}`}>
                                            <CheckCircle size={18} />
                                        </div>
                                        <div className={styles.listContent}>
                                            <div className={styles.listTitle}>Report completed for FinApp Solutions</div>
                                            <div className={styles.listMeta}>1 day ago</div>
                                        </div>
                                    </div>
                                    <div className={styles.listItem}>
                                        <div className={`${styles.listIcon} ${styles.iconRed}`}>
                                            <Star size={18} />
                                        </div>
                                        <div className={styles.listContent}>
                                            <div className={styles.listTitle}>Received 5-star rating from HealthPro Tech</div>
                                            <div className={styles.listMeta}>3 days ago</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Requests Section */}
                {activeSection === 'requests' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>
                                Consulting Requests
                                {dashboardData.pendingRequests > 0 && (
                                    <span className={`${styles.badge} ${styles.badgePending}`} style={{ marginLeft: '12px' }}>
                                        {dashboardData.pendingRequests} Pending
                                    </span>
                                )}
                            </h3>

                            <div className={styles.list}>
                                {consultingRequests.map(request => (
                                    <div key={request.id} className={styles.listItem} style={{ alignItems: 'flex-start' }}>
                                        <div className={styles.listContent}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                <h4 className={styles.listTitle}>{request.startupName}</h4>
                                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>by {request.founderName}</span>
                                            </div>
                                            <p style={{ margin: '8px 0', fontSize: '14px', color: 'var(--text-primary)' }}>{request.inquiry}</p>
                                            <div className={styles.listMeta} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                                <span className={`${styles.badge} ${styles.badgeInfo}`}>{request.budget}</span>
                                                <span>Requested: {request.requestDate}</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '120px', alignItems: 'flex-end', marginLeft: '16px' }}>
                                            <span className={`${styles.badge} ${request.status === 'pending' ? styles.badgePending : request.status === 'accepted' ? styles.badgeSuccess : styles.badgeError}`}>
                                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                            </span>
                                            {request.status === 'pending' && (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        className={styles.primaryBtn}
                                                        style={{ padding: '6px 12px', fontSize: '12px' }}
                                                        onClick={() => handleAcceptRequest(request.id)}
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        className={styles.dangerBtn}
                                                        style={{ padding: '6px 12px', fontSize: '12px' }}
                                                        onClick={() => handleRejectRequest(request.id)}
                                                    >
                                                        Decline
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Appointments Section */}
                {activeSection === 'appointments' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.cardTitle}>Scheduled Appointments</h3>
                                <button className={styles.primaryBtn}>
                                    <PlusCircle size={18} />
                                    Add Availability
                                </button>
                            </div>

                            <div className={styles.list}>
                                {appointments.map(appt => (
                                    <div key={appt.id} className={styles.listItem}>
                                        <div className={styles.dateBox} style={{ marginRight: '16px' }}>
                                            <span className={styles.dateMonth}>Jan</span>
                                            <span className={styles.dateDay}>{appt.date.split('-')[2]}</span>
                                        </div>
                                        <div className={styles.listContent}>
                                            <h4 className={styles.listTitle}>{appt.startupName}</h4>
                                            <div className={styles.listMeta} style={{ marginBottom: '4px' }}>with {appt.founderName}</div>
                                            <div className={styles.listMeta} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Clock size={14} />
                                                {appt.time} ({appt.duration})
                                            </div>
                                        </div>
                                        <div className={styles.listActions}>
                                            <button
                                                className={styles.secondaryBtn}
                                                onClick={() => handleRescheduleAppointment(appt.id)}
                                            >
                                                Reschedule
                                            </button>
                                            <button
                                                className={styles.dangerBtn}
                                                onClick={() => handleCancelAppointment(appt.id)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Reports Section */}
                {activeSection === 'reports' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.cardTitle}>Consulting Reports</h3>
                                <button className={styles.primaryBtn}>
                                    <PlusCircle size={18} />
                                    Create Report
                                </button>
                            </div>

                            <div className={styles.list}>
                                {consultingReports.map(report => (
                                    <div key={report.id} className={styles.listItem}>
                                        <div className={styles.listContent}>
                                            <h4 className={styles.listTitle}>{report.startupName}</h4>
                                            <div className={styles.listMeta}>with {report.founderName}</div>
                                            <div className={styles.listMeta} style={{ marginTop: '4px' }}>
                                                Consultation: {report.consultationDate} • Report: {report.date}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ color: '#fbbf24', fontSize: '14px' }}>
                                                    {'⭐'.repeat(Math.floor(report.rating))}
                                                    {report.rating % 1 !== 0 && '✨'}
                                                </div>
                                                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>{report.rating}/5</span>
                                            </div>
                                            <div className={styles.listActions}>
                                                <button className={styles.secondaryBtn}>View</button>
                                                <button className={styles.secondaryBtn}>Download</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Profile Section */}
                {activeSection === 'profile' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>Profile Settings</h3>
                            <form className={styles.form}>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            placeholder="Your full name"
                                            defaultValue={user?.name || ''}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            placeholder="your.email@example.com"
                                            defaultValue={user?.email || ''}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Professional Bio</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Tell startups about your expertise and experience"
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Primary Expertise</label>
                                        <select>
                                            <option>Business Strategy</option>
                                            <option>Fundraising & Finance</option>
                                            <option>AI Architecture</option>
                                            <option>IP & Legal</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Hourly Rate</label>
                                        <input type="text" placeholder="e.g., $150 - $250" />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Years of Experience</label>
                                    <input type="number" min="0" max="70" />
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                    <button type="submit" className={styles.primaryBtn}>Save Changes</button>
                                    <button type="button" className={styles.secondaryBtn}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
