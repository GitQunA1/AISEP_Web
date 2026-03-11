import React, { useState } from 'react';
import { Search, MapPin, Star, Users } from 'lucide-react';
import FeedHeader from '../components/feed/FeedHeader';
import styles from './AdvisorsPage.module.css';

// Mock data for advisors removed.
// This component should fetch from a live API `api/Users?role=advisor` in the future.
const MOCK_ADVISORS = [];

export default function AdvisorsPage() {
    const [advisors, setAdvisors] = useState([]); // Initialize empty
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredAdvisors = advisors.filter(advisor =>
        advisor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        advisor.expertise.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <FeedHeader
                title="Tìm cố vấn"
                subtitle="Kết nối với các chuyên gia đã được xác minh để đẩy nhanh tăng trưởng"
                showFilter={false}
            />

            <div className={styles.searchSection}>
                <div className={styles.searchContainer}>
                    <Search className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc chuyên môn"
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.list}>
                {isLoading ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                        <p>Đang tải cố vấn...</p>
                    </div>
                ) : filteredAdvisors.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Users size={48} className={styles.emptyIcon} />
                        <h3>Không tìm thấy cố vấn</h3>
                        <p>Hiện không có cố vấn nào phù hợp với tìm kiếm của bạn.</p>
                    </div>
                ) : (
                filteredAdvisors.map(advisor => (
                    <div key={advisor.id} className={styles.advisorItem}>
                        <img src={advisor.avatar} alt={advisor.name} className={styles.avatar} />

                        <div className={styles.advisorContent}>
                            <div className={styles.advisorHeader}>
                                <div className={styles.nameInfo}>
                                    <span className={styles.name}>{advisor.name}</span>
                                    <span className={styles.handle}>{advisor.handle}</span>
                                </div>
                                <button
                                    className={`${styles.followBtn} ${advisor.isFollowing ? styles.following : ''}`}
                                >
                                    {advisor.isFollowing ? 'Đang kết nối' : 'Kết nối'}
                                </button>
                            </div>

                            <span className={styles.expertiseChip}>{advisor.expertise}</span>
                            <p className={styles.bio}>{advisor.bio}</p>

                            <div className={styles.stats}>
                                <div className={styles.statItem}>
                                    <MapPin />
                                    <span>{advisor.location}</span>
                                </div>
                                <div className={styles.statItem}>
                                    <Star fill="currentColor" />
                                    <span>{advisor.rating} Đánh giá</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )))}
            </div>
        </div>
    );
}
