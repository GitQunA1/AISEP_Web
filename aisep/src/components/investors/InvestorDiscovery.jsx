import React, { useState } from 'react';
import { Search, CheckCircle, TrendingUp, MapPin, Building2, Target } from 'lucide-react';
import styles from './InvestorDiscovery.module.css';

// Mock investor data
const MOCK_INVESTORS = [
    {
        id: 1,
        name: 'Sequoia Capital',
        type: 'VC Fund',
        avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=150',
        verified: true,
        thesis: 'Investing in early-stage AI & Blockchain infrastructure companies',
        industries: ['AI/ML', 'Blockchain', 'Fintech'],
        stages: ['Seed', 'Series A'],
        location: 'Menlo Park, CA',
        matchScore: 92,
        portfolioSize: '200+ companies',
        ticketSize: '$500K - $5M'
    },
    {
        id: 2,
        name: 'Y Combinator',
        type: 'Accelerator',
        avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=150',
        verified: true,
        thesis: 'Backing ambitious founders building category-defining companies',
        industries: ['SaaS', 'Fintech', 'EdTech'],
        stages: ['Pre-Seed', 'Seed'],
        location: 'Mountain View, CA',
        matchScore: 88,
        portfolioSize: '3000+ companies',
        ticketSize: '$125K - $500K'
    },
    {
        id: 3,
        name: 'Michael Chen',
        type: 'Angel Investor',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
        verified: true,
        thesis: 'Healthcare technology disrupting traditional medical systems',
        industries: ['HealthTech', 'BioTech'],
        stages: ['Pre-Seed', 'Seed'],
        location: 'San Francisco, CA',
        matchScore: 75,
        portfolioSize: '12 companies',
        ticketSize: '$50K - $250K'
    },
    {
        id: 4,
        name: 'Tiger Global',
        type: 'VC Fund',
        avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=150',
        verified: true,
        thesis: 'Growth-stage internet and software companies globally',
        industries: ['E-commerce', 'SaaS', 'Fintech'],
        stages: ['Series A', 'Series B', 'Series C'],
        location: 'New York, NY',
        matchScore: 68,
        portfolioSize: '300+ companies',
        ticketSize: '$10M - $50M'
    }
];

const INDUSTRIES = ['All', 'AI/ML', 'Blockchain', 'Fintech', 'HealthTech', 'SaaS', 'E-commerce', 'EdTech'];
const STAGES = ['All', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C'];

export default function InvestorDiscovery() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIndustry, setSelectedIndustry] = useState('All');
    const [selectedStage, setSelectedStage] = useState('All');

    // Filter investors based on search and filters
    const filteredInvestors = MOCK_INVESTORS.filter(investor => {
        const matchesSearch =
            investor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            investor.thesis.toLowerCase().includes(searchQuery.toLowerCase()) ||
            investor.type.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesIndustry =
            selectedIndustry === 'All' ||
            investor.industries.includes(selectedIndustry);

        const matchesStage =
            selectedStage === 'All' ||
            investor.stages.includes(selectedStage);

        return matchesSearch && matchesIndustry && matchesStage;
    });

    // Get match score badge class
    const getMatchScoreClass = (score) => {
        if (score >= 80) return styles.matchHigh;
        if (score >= 60) return styles.matchMedium;
        return styles.matchLow;
    };

    return (
        <div className={styles.container}>
            {/* Search Header */}
            <div className={styles.header}>
                <h2 className={styles.headerTitle}>Find Investors</h2>
                <div className={styles.searchContainer}>
                    <Search className={styles.searchIcon} size={20} />
                    <input
                        type="text"
                        placeholder="Search funds, angels..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Filter Pills */}
            <div className={styles.filtersSection}>
                <div className={styles.filterGroup}>
                    <span className={styles.filterLabel}>Industry:</span>
                    <div className={styles.filterPills}>
                        {INDUSTRIES.map(industry => (
                            <button
                                key={industry}
                                className={`${styles.filterPill} ${selectedIndustry === industry ? styles.filterPillActive : ''}`}
                                onClick={() => setSelectedIndustry(industry)}
                            >
                                {industry}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.filterGroup}>
                    <span className={styles.filterLabel}>Stage:</span>
                    <div className={styles.filterPills}>
                        {STAGES.map(stage => (
                            <button
                                key={stage}
                                className={`${styles.filterPill} ${selectedStage === stage ? styles.filterPillActive : ''}`}
                                onClick={() => setSelectedStage(stage)}
                            >
                                {stage}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Investor Feed */}
            <div className={styles.feed}>
                {filteredInvestors.length === 0 ? (
                    <div className={styles.emptyState}>
                        <TrendingUp size={48} className={styles.emptyIcon} />
                        <h3>No investors found</h3>
                        <p>Try adjusting your filters or search query.</p>
                    </div>
                ) : (
                    filteredInvestors.map(investor => (
                        <div key={investor.id} className={styles.investorCard}>
                            {/* Header */}
                            <div className={styles.cardHeader}>
                                <img
                                    src={investor.avatar}
                                    alt={investor.name}
                                    className={styles.avatar}
                                />
                                <div className={styles.investorInfo}>
                                    <div className={styles.nameRow}>
                                        <h3 className={styles.investorName}>{investor.name}</h3>
                                        {investor.verified && (
                                            <CheckCircle size={18} className={styles.verifiedBadge} />
                                        )}
                                        <span className={`${styles.matchScore} ${getMatchScoreClass(investor.matchScore)}`}>
                                            {investor.matchScore}% Match
                                        </span>
                                    </div>
                                    <p className={styles.investorType}>{investor.type}</p>
                                </div>
                            </div>

                            {/* Thesis/Bio */}
                            <p className={styles.thesis}>{investor.thesis}</p>

                            {/* Tags */}
                            <div className={styles.tags}>
                                <div className={styles.tagGroup}>
                                    <Target size={14} />
                                    {investor.industries.slice(0, 3).map(industry => (
                                        <span key={industry} className={styles.tag}>{industry}</span>
                                    ))}
                                </div>
                                <div className={styles.tagGroup}>
                                    <TrendingUp size={14} />
                                    {investor.stages.slice(0, 2).map(stage => (
                                        <span key={stage} className={styles.tag}>{stage}</span>
                                    ))}
                                </div  >
                            </div>

                            {/* Metadata */}
                            <div className={styles.metadata}>
                                <div className={styles.metaItem}>
                                    <MapPin size={14} />
                                    <span>{investor.location}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <Building2 size={14} />
                                    <span>{investor.portfolioSize}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <span className={styles.ticketSize}>{investor.ticketSize}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className={styles.actions}>
                                <button className={styles.primaryBtn}>
                                    <TrendingUp size={16} />
                                    <span>Pitch</span>
                                </button>
                                <button className={styles.viewProfileBtn}>View Profile</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
