import React, { useState, useEffect } from 'react';
import { Newspaper, CheckCircle, AlertCircle, Archive, Loader2, Search } from 'lucide-react';
import styles from '../../styles/SharedDashboard.module.css';
import prService from '../../services/prService';
import NewsCard from './NewsCard';
import NewsDetailModal from './NewsDetailModal';

const EmptyState = ({ icon: Icon, title, message }) => (
    <div style={{textAlign: 'center', padding: '60px 20px'}}>
        <Icon size={48} style={{margin: '0 auto 16px', color: 'var(--text-secondary)'}} />
        <h4 style={{fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px'}}>
            {title}
        </h4>
        <p style={{fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '280px', margin: '0 auto', lineHeight: '1.5'}}>
            {message}
        </p>
    </div>
);

export default function PRNewsSection() {
    const [prNewsList, setPrNewsList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPR, setSelectedPR] = useState(null);

    useEffect(() => {
        fetchPRNews();
    }, []);

    const fetchPRNews = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await prService.getPRs();
            
            let prsList = [];
            if (response?.data?.items && Array.isArray(response.data.items)) {
                prsList = response.data.items;
            } else if (Array.isArray(response?.data)) {
                prsList = response.data;
            } else if (Array.isArray(response?.items)) {
                prsList = response.items;
            }
            
            setPrNewsList(prsList);
        } catch (err) {
            console.error('Error fetching PR news:', err);
            setError('Không thể tải tin tức PR.');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredPRs = prNewsList.filter(pr => {
        if (!searchTerm.trim()) return true;
        const search = searchTerm.toLowerCase();
        return (
            pr.title?.toLowerCase().includes(search) ||
            pr.content?.toLowerCase().includes(search) ||
            pr.projectName?.toLowerCase().includes(search) ||
            pr.investorName?.toLowerCase().includes(search)
        );
    });

    return (
        <div className={styles.section}>
            {/* Header */}
            <div style={{marginBottom: '20px'}}>
                <h2 style={{fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <Newspaper size={24} />
                    Tin tức PR
                </h2>
                <input
                    type="text"
                    placeholder="Tìm kiếm bài PR..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        maxWidth: '400px',
                        padding: '10px 12px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: 'var(--text-primary)',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                    }}
                />
            </div>

            {/* Error State */}
            {error && (
                <div className={styles.card}>
                    <EmptyState
                        icon={AlertCircle}
                        title="Lỗi tải dữ liệu"
                        message={error}
                    />
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className={styles.card}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '12px'}}>
                        <Loader2 size={20} className="animate-spin" />
                        <span style={{color: 'var(--text-secondary)'}}>Đang tải dữ liệu...</span>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && prNewsList.length === 0 && (
                <div className={styles.card}>
                    <EmptyState
                        icon={Archive}
                        title="Chưa có PR được đăng"
                        message="Hiện chưa có bài PR nào được đăng."
                    />
                </div>
            )}

            {/* PR News List */}
            {!isLoading && filteredPRs.length > 0 && (
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px'}}>
                    {filteredPRs.map((pr, idx) => (
                        <NewsCard
                            key={pr.postPrId}
                            index={idx}
                            thumbnail={pr.projectImage}
                            title={pr.title}
                            description={pr.content}
                            category="Đầu tư"
                            projectName={pr.projectName}
                            investorName={pr.investorName}
                            timestamp={pr.publishedAt}
                            onClick={() => setSelectedPR(pr)}
                        />
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {selectedPR && (
                <NewsDetailModal
                    pr={selectedPR}
                    onClose={() => setSelectedPR(null)}
                />
            )}

            {/* No Results */}
            {!isLoading && searchTerm && filteredPRs.length === 0 && prNewsList.length > 0 && (
                <div className={styles.card}>
                    <EmptyState
                        icon={Search}
                        title="Không tìm thấy"
                        message={`Không tìm thấy PR nào khớp với "${searchTerm}"`}
                    />
                </div>
            )}
        </div>
    );
}
