import React, { useState } from 'react';
import { Calendar, Clock, Video, AlertCircle, Star, Flag, X } from 'lucide-react';
import styles from './StartupAdvisorsList.module.css';

// Mock appointment data
const MOCK_APPOINTMENTS = {
    upcoming: [
        {
            id: 1,
            advisor: {
                name: 'Dr. Sarah Expert',
                title: 'Business Strategy Consultant',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
            },
            topic: 'Seed Round Pitch Audit',
            date: '2026-01-20',
            time: '10:00 AM',
            status: 'confirmed',
            meetingLink: '#'
        },
        {
            id: 2,
            advisor: {
                name: 'John Finance',
                title: 'Fundraising Advisor',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'
            },
            topic: 'Financial Planning Review',
            date: '2026-01-22',
            time: '2:00 PM',
            status: 'confirmed',
            meetingLink: '#'
        }
    ],
    completed: [
        {
            id: 3,
            advisor: {
                name: 'Elena Tech',
                title: 'AI Architecture Advisor',
                avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150'
            },
            topic: 'Technical Architecture Review',
            date: '2026-01-15',
            time: '3:00 PM',
            status: 'completed'
        }
    ],
    pending: [
        {
            id: 4,
            advisor: {
                name: 'David Law',
                title: 'Legal Consultant',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
            },
            topic: 'IP Rights Consultation',
            date: 'TBD',
            time: 'Awaiting confirmation',
            status: 'pending'
        }
    ]
};

// Review Modal Component
function ReviewModal({ appointment, onClose }) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [feedback, setFeedback] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Review submitted:', { appointmentId: appointment.id, rating, feedback });
        onClose();
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>Review Appointment</h3>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.advisorPreview}>
                        <img src={appointment.advisor.avatar} alt={appointment.advisor.name} className={styles.modalAvatar} />
                        <div>
                            <h4>{appointment.advisor.name}</h4>
                            <p>{appointment.topic}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className={styles.ratingSection}>
                            <label>How was your session?</label>
                            <div className={styles.stars}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={32}
                                        className={`${styles.star} ${star <= (hoveredRating || rating) ? styles.starFilled : ''}`}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className={styles.feedbackSection}>
                            <label htmlFor="feedback">Share your feedback (optional)</label>
                            <textarea
                                id="feedback"
                                className={styles.feedbackInput}
                                rows={4}
                                placeholder="Your feedback helps us improve the platform..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                            />
                        </div>

                        <div className={styles.modalActions}>
                            <button type="button" className={styles.cancelModalBtn} onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className={styles.primaryBtn} disabled={rating === 0}>
                                Submit Review
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// Report Modal Component
function ReportModal({ appointment, onClose }) {
    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Report submitted:', { appointmentId: appointment.id, reason, details });
        onClose();
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={`${styles.modal} ${styles.dangerModal}`} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>Report Advisor</h3>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.advisorPreview}>
                        <img src={appointment.advisor.avatar} alt={appointment.advisor.name} className={styles.modalAvatar} />
                        <div>
                            <h4>{appointment.advisor.name}</h4>
                            <p>{appointment.topic}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className={styles.reasonSection}>
                            <label htmlFor="reason">Reason for reporting</label>
                            <select
                                id="reason"
                                className={styles.selectInput}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                            >
                                <option value="">Select a reason...</option>
                                <option value="unprofessional">Unprofessional conduct</option>
                                <option value="noshow">No-show without notice</option>
                                <option value="inappropriate">Inappropriate behavior</option>
                                <option value="misleading">Misleading expertise</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className={styles.feedbackSection}>
                            <label htmlFor="details">Additional details</label>
                            <textarea
                                id="details"
                                className={styles.feedbackInput}
                                rows={4}
                                placeholder="Please provide more information about the issue..."
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.modalActions}>
                            <button type="button" className={styles.cancelModalBtn} onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className={styles.dangerBtn} disabled={!reason}>
                                Submit Report
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function StartupAdvisorsList({ onExploreAdvisors }) {
    const [activeTab, setActiveTab] = useState('upcoming');
    const [reviewModalAppointment, setReviewModalAppointment] = useState(null);
    const [reportModalAppointment, setReportModalAppointment] = useState(null);

    const appointments = MOCK_APPOINTMENTS[activeTab] || [];

    const getStatusBadge = (status) => {
        const statusConfig = {
            confirmed: { label: 'Upcoming', className: styles.statusUpcoming },
            completed: { label: 'Completed', className: styles.statusCompleted },
            pending: { label: 'Pending', className: styles.statusPending }
        };

        const config = statusConfig[status] || statusConfig.pending;
        return <span className={`${styles.statusBadge} ${config.className}`}>{config.label}</span>;
    };

    const renderActionButtons = (appointment) => {
        if (activeTab === 'upcoming') {
            return (
                <div className={styles.actions}>
                    <button className={styles.primaryBtn}>
                        <Video size={16} />
                        <span>Join Meeting</span>
                    </button>
                    <button className={styles.rescheduleBtn}>Reschedule</button>
                </div>
            );
        }

        if (activeTab === 'completed') {
            return (
                <div className={styles.actions}>
                    <button
                        className={styles.outlineBtn}
                        onClick={() => setReviewModalAppointment(appointment)}
                    >
                        <Star size={16} />
                        <span>Review</span>
                    </button>
                    <button
                        className={styles.dangerTextBtn}
                        onClick={() => setReportModalAppointment(appointment)}
                    >
                        <Flag size={16} />
                        <span>Report</span>
                    </button>
                </div>
            );
        }

        if (activeTab === 'pending') {
            return (
                <div className={styles.actions}>
                    <button className={styles.cancelRequestBtn}>Cancel Request</button>
                </div>
            );
        }
    };

    const renderEmptyState = () => {
        const emptyMessages = {
            upcoming: {
                title: 'No upcoming appointments',
                message: 'You don\'t have any scheduled sessions yet.'
            },
            completed: {
                title: 'No completed appointments',
                message: 'Your completed sessions will appear here.'
            },
            pending: {
                title: 'No pending requests',
                message: 'You don\'t have any pending appointment requests.'
            }
        };

        const { title, message } = emptyMessages[activeTab];

        return (
            <div className={styles.emptyState}>
                <AlertCircle size={48} className={styles.emptyIcon} />
                <h3>{title}</h3>
                <p>{message}</p>
                <button className={styles.primaryBtn} onClick={onExploreAdvisors}>
                    Explore Advisors
                </button>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            {/* Tab Navigation - Sticky */}
            <div className={styles.tabNav}>
                <button
                    className={`${styles.tab} ${activeTab === 'upcoming' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('upcoming')}
                >
                    Upcoming
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'completed' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('completed')}
                >
                    Completed
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'pending' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Pending
                </button>
            </div>

            {/* Appointments Feed */}
            <div className={styles.feed}>
                {appointments.length === 0 ? (
                    renderEmptyState()
                ) : (
                    appointments.map((appointment) => (
                        <div key={appointment.id} className={styles.appointmentItem}>
                            <img
                                src={appointment.advisor.avatar}
                                alt={appointment.advisor.name}
                                className={styles.avatar}
                            />

                            <div className={styles.content}>
                                <div className={styles.header}>
                                    <div className={styles.advisorInfo}>
                                        <h4 className={styles.advisorName}>{appointment.advisor.name}</h4>
                                        <p className={styles.advisorTitle}>{appointment.advisor.title}</p>
                                    </div>
                                    {getStatusBadge(appointment.status)}
                                </div>

                                <div className={styles.topic}>{appointment.topic}</div>

                                <div className={styles.dateTime}>
                                    <div className={styles.dateTimeItem}>
                                        <Calendar size={16} />
                                        <span>{appointment.date}</span>
                                    </div>
                                    <div className={styles.dateTimeItem}>
                                        <Clock size={16} />
                                        <span>{appointment.time}</span>
                                    </div>
                                </div>

                                {renderActionButtons(appointment)}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modals */}
            {reviewModalAppointment && (
                <ReviewModal
                    appointment={reviewModalAppointment}
                    onClose={() => setReviewModalAppointment(null)}
                />
            )}
            {reportModalAppointment && (
                <ReportModal
                    appointment={reportModalAppointment}
                    onClose={() => setReportModalAppointment(null)}
                />
            )}
        </div>
    );
}
