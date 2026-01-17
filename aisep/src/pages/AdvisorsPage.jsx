import React, { useState } from 'react';
import { Search, MapPin, Briefcase, Star } from 'lucide-react';
import styles from './AdvisorsPage.module.css';

// Mock data for advisors
const MOCK_ADVISORS = [
    {
        id: 1,
        name: "Dr. Sarah Expert",
        handle: "@sarah_strategy",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
        expertise: "Business Strategy",
        bio: "20+ years of experience in tech startups. Specialized in scaling operations and market entry strategies.",
        location: "San Francisco, CA",
        rating: 4.9,
        isFollowing: false
    },
    {
        id: 2,
        name: "John Finance",
        handle: "@john_vc_guide",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150",
        expertise: "Fundraising & Finance",
        bio: "Ex-VC Partner. Helping startups navigate Series A/B funding rounds. 50+ successful exits.",
        location: "New York, NY",
        rating: 4.8,
        isFollowing: false
    },
    {
        id: 3,
        name: "Elena Tech",
        handle: "@elena_ai_arch",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
        expertise: "AI Architecture",
        bio: "PhD in Machine Learning. Advising on scalable AI infrastructure and LLM integration.",
        location: "Austin, TX",
        rating: 5.0,
        isFollowing: false
    },
    {
        id: 4,
        name: "David Law",
        handle: "@legal_eagle",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
        expertise: "IP & Legal",
        bio: "Specialized in intellectual property rights and tech regulations for AI companies.",
        location: "Boston, MA",
        rating: 4.7,
        isFollowing: false
    }
];

export default function AdvisorsPage() {
    const [advisors] = useState(MOCK_ADVISORS);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredAdvisors = advisors.filter(advisor =>
        advisor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        advisor.expertise.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h2 className={styles.headerTitle}>Find Advisors</h2>
                <div className={styles.searchContainer}>
                    <Search className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by name or expertise"
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            <div className={styles.list}>
                {filteredAdvisors.map(advisor => (
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
                                    {advisor.isFollowing ? 'Following' : 'Connect'}
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
                                    <span>{advisor.rating} Rating</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
