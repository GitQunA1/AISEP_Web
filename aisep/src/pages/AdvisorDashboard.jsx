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
    const [consultingRequests, setConsultingRequests] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [consultingReports, setConsultingReports] = useState([]);

    const dashboardData = {
        activeClients: 0,
        totalConsultations: 0,
        completedReports: consultingReports.length,
        averageRating: 0.0,
        hourlyRate: '-',
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
                title="Bảng điều khiển Cố vấn"
                subtitle={`Xin chào, ${user?.name || 'Cố vấn'}! Quản lý hoạt động tư vấn của bạn.`}
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
                        <div className={styles.statLabel}>Khách hàng đang tư vấn</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconYellow}`}>
                        <MessageSquare size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.pendingRequests}</div>
                        <div className={styles.statLabel}>Yêu cầu chờ xử lý</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconBlue}`}>
                        <Calendar size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.upcomingAppointments}</div>
                        <div className={styles.statLabel}>Lịch sắp tới</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconRed}`}>
                        <Star size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statValue}>{dashboardData.averageRating}</div>
                        <div className={styles.statLabel}>Đánh giá trung bình</div>
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
                    className={`${styles.tab} ${activeSection === 'requests' ? styles.active : ''}`}
                    onClick={() => setActiveSection('requests')}
                >
                    Yêu cầu tư vấn
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'appointments' ? styles.active : ''}`}
                    onClick={() => setActiveSection('appointments')}
                >
                    Lịch hẹn
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'reports' ? styles.active : ''}`}
                    onClick={() => setActiveSection('reports')}
                >
                    Báo cáo
                </button>
                <button
                    className={`${styles.tab} ${activeSection === 'profile' ? styles.active : ''}`}
                    onClick={() => setActiveSection('profile')}
                >
                    Hồ sơ
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
                                <h3 className={styles.cardTitle}>Tóm tắt hoạt động</h3>
                                <div className={styles.metricsGrid}>
                                    <div className={styles.metricItem}>
                                        <div className={styles.metricLabel}>Tổng số buổi tư vấn</div>
                                        <div className={styles.metricValue}>{dashboardData.totalConsultations}</div>
                                    </div>
                                    <div className={styles.metricItem}>
                                        <div className={styles.metricLabel}>Báo cáo đã hoàn thành</div>
                                        <div className={styles.metricValue}>{dashboardData.completedReports}</div>
                                    </div>
                                    <div className={styles.metricItem}>
                                        <div className={styles.metricLabel}>Đánh giá trung bình</div>
                                        <div className={styles.metricValue}>
                                            {dashboardData.averageRating} ⭐
                                        </div>
                                    </div>
                                    <div className={styles.metricItem}>
                                        <div className={styles.metricLabel}>Phí theo giờ</div>
                                        <div className={styles.metricValue}>{dashboardData.hourlyRate}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Upcoming Appointments */}
                            <div className={styles.card}>
                                <h3 className={styles.cardTitle}>7 Ngày Tới</h3>
                                <div className={styles.list}>
                                    {appointments.length === 0 ? (
                                        <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                                            <p>Chưa có lịch hẹn nào sắp tới.</p>
                                        </div>
                                    ) : appointments.slice(0, 3).map(appt => (
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
                                <h3 className={styles.cardTitle}>Hoạt động gần đây</h3>
                                <div className={styles.list}>
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                                        <p>Chưa có hoạt động nào.</p>
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
                                Yêu cầu tư vấn
                                {dashboardData.pendingRequests > 0 && (
                                    <span className={`${styles.badge} ${styles.badgePending}`} style={{ marginLeft: '12px' }}>
                                        {dashboardData.pendingRequests} Chờ xử lý
                                    </span>
                                )}
                            </h3>

                            <div className={styles.list}>
                                {consultingRequests.length === 0 ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                                        <p>Chưa có yêu cầu tư vấn nào.</p>
                                    </div>
                                ) : consultingRequests.map(request => (
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
                                                        Chấp nhận
                                                    </button>
                                                    <button
                                                        className={styles.dangerBtn}
                                                        style={{ padding: '6px 12px', fontSize: '12px' }}
                                                        onClick={() => handleRejectRequest(request.id)}
                                                    >
                                                        Từ chối
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
                                <h3 className={styles.cardTitle}>Lịch hẹn đã đặt</h3>
                                <button className={styles.primaryBtn}>
                                    <PlusCircle size={18} />
                                    Thêm khung giờ rảnh
                                </button>
                            </div>

                            <div className={styles.list}>
                                {appointments.length === 0 ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                                        <p>Chưa có lịch hẹn nào được đặt.</p>
                                    </div>
                                ) : appointments.map(appt => (
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
                                <h3 className={styles.cardTitle}>Báo cáo tư vấn</h3>
                                <button className={styles.primaryBtn}>
                                    <PlusCircle size={18} />
                                    Tạo báo cáo
                                </button>
                            </div>

                            <div className={styles.list}>
                                {consultingReports.length === 0 ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                                        <p>Chưa có báo cáo nào.</p>
                                    </div>
                                ) : consultingReports.map(report => (
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
                            <h3 className={styles.cardTitle}>Cài đặt hồ sơ</h3>
                            <form className={styles.form}>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Họ và tên</label>
                                        <input
                                            type="text"
                                            placeholder="Họ và tên của bạn"
                                            defaultValue={user?.name || ''}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            placeholder="email@example.com"
                                            defaultValue={user?.email || ''}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Giới thiệu chuyên môn</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Chia sẻ về chuyên môn và kinh nghiệm của bạn với startup"
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Lĩnh vực chuyên môn chính</label>
                                        <select>
                                            <option>Chiến lược kinh doanh</option>
                                            <option>Gọi vốn & Tài chính</option>
                                            <option>Kiến trúc AI</option>
                                            <option>Sở hữu trí tuệ & Pháp lý</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Phí theo giờ</label>
                                        <input type="text" placeholder="VD: 150$ - 250$" />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Số năm kinh nghiệm</label>
                                    <input type="number" min="0" max="70" />
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                    <button type="submit" className={styles.primaryBtn}>Lưu thay đổi</button>
                                    <button type="button" className={styles.secondaryBtn}>Hủy</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
