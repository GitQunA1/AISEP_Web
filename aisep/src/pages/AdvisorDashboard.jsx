import React, { useState } from 'react';
import { Users, Calendar, FileText, Star, Clock, CheckCircle, MessageSquare, PlusCircle, TrendingUp } from 'lucide-react';
import styles from './AdvisorDashboard.module.css';

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
        // Mock reschedule - in real app, open a date picker
        alert('Reschedule functionality would open a calendar picker');
    };

    const handleCancelAppointment = (id) => {
        setAppointments(appointments.filter(appt => appt.id !== id));
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>Advisor Dashboard</h1>
                    <p className={styles.subtitle}>Welcome, {user?.name || 'Advisor'}! Manage your consulting practice.</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#ede9fe' }}>
                        <Users size={24} color="#7c3aed" />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.activeClients}</div>
                        <div className={styles.statLabel}>Active Clients</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#fef3c7' }}>
                        <MessageSquare size={24} color="#d97706" />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.pendingRequests}</div>
                        <div className={styles.statLabel}>Pending Requests</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#dbeafe' }}>
                        <Calendar size={24} color="#0284c7" />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.upcomingAppointments}</div>
                        <div className={styles.statLabel}>Upcoming</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#fce7f3' }}>
                        <Star size={24} color="#be185d" />
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
                                <div className={styles.summaryGrid}>
                                    <div className={styles.summaryItem}>
                                        <div className={styles.summaryLabel}>Total Consultations</div>
                                        <div className={styles.summaryValue}>{dashboardData.totalConsultations}</div>
                                    </div>
                                    <div className={styles.summaryItem}>
                                        <div className={styles.summaryLabel}>Completed Reports</div>
                                        <div className={styles.summaryValue}>{dashboardData.completedReports}</div>
                                    </div>
                                    <div className={styles.summaryItem}>
                                        <div className={styles.summaryLabel}>Average Rating</div>
                                        <div className={styles.summaryValue}>
                                            <span>{dashboardData.averageRating}</span>
                                            <span className={styles.stars}>⭐</span>
                                        </div>
                                    </div>
                                    <div className={styles.summaryItem}>
                                        <div className={styles.summaryLabel}>Hourly Rate</div>
                                        <div className={styles.summaryValue}>{dashboardData.hourlyRate}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Upcoming Appointments */}
                            <div className={styles.card}>
                                <h3 className={styles.cardTitle}>Next 7 Days</h3>
                                {appointments.slice(0, 3).map(appt => (
                                    <div key={appt.id} className={styles.upcomingItem}>
                                        <div className={styles.appointmentDate}>
                                            <div className={styles.dateDay}>{appt.date.split('-')[2]}</div>
                                            <div className={styles.dateMonth}>Jan</div>
                                        </div>
                                        <div className={styles.appointmentInfo}>
                                            <h4>{appt.startupName}</h4>
                                            <p>{appt.time} - {appt.duration}</p>
                                        </div>
                                        <div className={styles.appointmentStatus}>
                                            <span className={styles.badge}>Confirmed</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Recent Activity */}
                            <div className={styles.card}>
                                <h3 className={styles.cardTitle}>Recent Activity</h3>
                                <div className={styles.activityList}>
                                    <div className={styles.activityItem}>
                                        <div className={styles.activityIcon}>
                                            <MessageSquare size={18} />
                                        </div>
                                        <div className={styles.activityContent}>
                                            <div className={styles.activityTitle}>New request from TechStartup AI</div>
                                            <div className={styles.activityTime}>2 hours ago</div>
                                        </div>
                                    </div>
                                    <div className={styles.activityItem}>
                                        <div className={styles.activityIcon}>
                                            <CheckCircle size={18} />
                                        </div>
                                        <div className={styles.activityContent}>
                                            <div className={styles.activityTitle}>Report completed for FinApp Solutions</div>
                                            <div className={styles.activityTime}>1 day ago</div>
                                        </div>
                                    </div>
                                    <div className={styles.activityItem}>
                                        <div className={styles.activityIcon}>
                                            <Star size={18} />
                                        </div>
                                        <div className={styles.activityContent}>
                                            <div className={styles.activityTitle}>Received 5-star rating from HealthPro Tech</div>
                                            <div className={styles.activityTime}>3 days ago</div>
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
                                    <span className={styles.badge}>{dashboardData.pendingRequests} Pending</span>
                                )}
                            </h3>

                            <div className={styles.requestsList}>
                                {consultingRequests.map(request => (
                                    <div key={request.id} className={styles.requestItem}>
                                        <div className={styles.requestInfo}>
                                            <div className={styles.requestHeader}>
                                                <h4 className={styles.startupName}>{request.startupName}</h4>
                                                <span className={styles.founderName}>by {request.founderName}</span>
                                            </div>
                                            <p className={styles.inquiry}>{request.inquiry}</p>
                                            <div className={styles.requestDetails}>
                                                <span className={styles.budget}>💰 {request.budget}</span>
                                                <span>Requested: {request.requestDate}</span>
                                            </div>
                                        </div>
                                        <div className={styles.requestActions}>
                                            <span className={`${styles.statusBadge} ${styles[`badge-${request.status}`]}`}>
                                                {request.status === 'pending' && 'Pending'}
                                                {request.status === 'accepted' && '✓ Accepted'}
                                                {request.status === 'rejected' && '✗ Declined'}
                                            </span>
                                            {request.status === 'pending' && (
                                                <div className={styles.actionButtons}>
                                                    <button
                                                        className={styles.acceptBtn}
                                                        onClick={() => handleAcceptRequest(request.id)}
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        className={styles.rejectBtn}
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
                            <div className={styles.sectionHeader}>
                                <h3 className={styles.cardTitle}>Scheduled Appointments</h3>
                                <button className={styles.primaryBtn}>
                                    <PlusCircle size={18} />
                                    Add Availability
                                </button>
                            </div>

                            <div className={styles.appointmentsList}>
                                {appointments.map(appt => (
                                    <div key={appt.id} className={styles.appointmentCard}>
                                        <div className={styles.appointmentDateTime}>
                                            <div className={styles.dateBox}>
                                                <span className={styles.day}>{appt.date.split('-')[2]}</span>
                                                <span className={styles.month}>Jan</span>
                                            </div>
                                            <div className={styles.timeInfo}>
                                                <span className={styles.time}>{appt.time}</span>
                                                <span className={styles.duration}>{appt.duration}</span>
                                            </div>
                                        </div>
                                        <div className={styles.appointmentDetails}>
                                            <h4>{appt.startupName}</h4>
                                            <p>with {appt.founderName}</p>
                                        </div>
                                        <div className={styles.appointmentButtons}>
                                            <button
                                                className={styles.rescheduleBtn}
                                                onClick={() => handleRescheduleAppointment(appt.id)}
                                            >
                                                Reschedule
                                            </button>
                                            <button
                                                className={styles.cancelBtn}
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
                            <div className={styles.sectionHeader}>
                                <h3 className={styles.cardTitle}>Consulting Reports</h3>
                                <button className={styles.primaryBtn}>
                                    <PlusCircle size={18} />
                                    Create Report
                                </button>
                            </div>

                            <div className={styles.reportsList}>
                                {consultingReports.map(report => (
                                    <div key={report.id} className={styles.reportItem}>
                                        <div className={styles.reportInfo}>
                                            <h4>{report.startupName}</h4>
                                            <p className={styles.founderName}>with {report.founderName}</p>
                                            <div className={styles.reportMeta}>
                                                <span>Consultation: {report.consultationDate}</span>
                                                <span>Report: {report.date}</span>
                                            </div>
                                        </div>
                                        <div className={styles.reportRating}>
                                            <div className={styles.rating}>
                                                {'⭐'.repeat(Math.floor(report.rating))}
                                                {report.rating % 1 !== 0 && '✨'}
                                            </div>
                                            <span className={styles.ratingText}>{report.rating}/5</span>
                                        </div>
                                        <div className={styles.reportActions}>
                                            <button className={styles.viewBtn}>View</button>
                                            <button className={styles.downloadBtn}>Download</button>
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

                                <div className={styles.formActions}>
                                    <button type="submit" className={styles.saveBtn}>Save Changes</button>
                                    <button type="button" className={styles.cancelBtn}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
