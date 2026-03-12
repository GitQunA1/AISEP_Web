import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building2, MapPin, Target, TrendingUp, CheckCircle, Briefcase, Mail, Wallet, AlertCircle, Calendar } from 'lucide-react';
import styles from './InvestorDetail.module.css';
import investorService from '../../services/investorService';

export default function InvestorDetail({ investorId, onBack, user }) {
    const [investor, setInvestor] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchInvestorDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await investorService.getInvestorById(investorId);
                if (data) {
                    setInvestor(data);
                } else {
                    setError('Không tìm thấy thông tin nhà đầu tư.');
                }
            } catch (err) {
                setError('Lỗi khi tải thông tin nhà đầu tư.');
            } finally {
                setIsLoading(false);
            }
        };

        if (investorId) {
            fetchInvestorDetails();
        }
    }, [investorId]);

    const handlePitchClick = () => {
        if (!user) {
            alert('Bạn cần đăng nhập để thực hiện hành động này.');
            return;
        }
        if (user.role !== 'startup') {
            alert('Chỉ tài khoản Startup mới có thể gửi yêu cầu kết nối cho nhà đầu tư.');
            return;
        }
        alert(`Yêu cầu kết nối đã được gửi tới ${investor?.userName || 'nhà đầu tư'}! (Tính năng đang phát triển)`);
    };

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingState}>Đang tải chi tiết nhà đầu tư...</div>
            </div>
        );
    }

    if (error || !investor) {
        return (
            <div className={styles.container}>
                <button className={styles.backBtn} onClick={onBack}>
                    <ArrowLeft size={20} /> Quay lại danh sách
                </button>
                <div className={styles.emptyState}>
                    <AlertCircle size={48} className={styles.emptyIcon} style={{ color: '#ef4444' }} />
                    <h3>Lỗi hoặc thông tin chưa cập nhật</h3>
                    <p>{error || 'Thông tin nhà đầu tư chưa được cập nhật đầy đủ.'}</p>
                </div>
            </div>
        );
    }

    // Generate @handle from userName or email
    const handle = investor.email ? `@${investor.email.split('@')[0]}` : `@${(investor.userName || 'investor').toLowerCase().replace(/\s+/g, '')}`;
    
    // Formatting date safely
    const formatJoinDate = (dateString) => {
        if (!dateString) return 'Tháng 1 2024'; // Fallback
        const d = new Date(dateString);
        return `Tháng ${d.getMonth() + 1} ${d.getFullYear()}`;
    };

    return (
        <div className={styles.container}>
            <div className={styles.topNav}>
                <button className={styles.backBtn} onClick={onBack}>
                    <ArrowLeft size={20} />
                    <span>Quay lại</span>
                </button>
                <div className={styles.navTitle}>
                    <h2>{investor.organizationName || investor.userName}</h2>
                    <span>Nhà đầu tư</span>
                </div>
            </div>

            {/* Cover Banner */}
            <div className={styles.coverBanner}></div>

            {/* Profile Header */}
            <div className={styles.profileHeader}>
                <div className={styles.headerTop}>
                    <div className={styles.avatarSection}>
                        <div className={styles.avatar}>
                            <span>{(investor.organizationName || investor.userName || 'I').charAt(0).toUpperCase()}</span>
                        </div>
                    </div>
                    <div className={styles.headerActions}>
                        <button className={styles.primaryBtn} onClick={handlePitchClick}>
                            <TrendingUp size={16} />
                            Yêu cầu kết nối
                        </button>
                    </div>
                </div>

                <div className={styles.profileInfo}>
                    <div className={styles.nameSection}>
                        <h1 className={styles.name}>
                            {investor.organizationName || investor.userName}
                            <span className={styles.verifiedBadge}>
                                <CheckCircle size={16} /> Đã xác minh
                            </span>
                        </h1>
                        <div className={styles.handle}>{handle}</div>
                    </div>

                    <div className={styles.bio}>
                        <p>{investor.investmentTaste || 'Quỹ đầu tư - Tập trung vào các dự án khởi nghiệp tiềm năng cao.'}</p>
                    </div>

                    <div className={styles.metadata}>
                        <div className={styles.metaItem}>
                            <MapPin size={16} />
                            <span>{investor.investmentRegion || 'Khu vực Đông Nam Á'}</span>
                        </div>
                        <div className={styles.metaItem}>
                            <Calendar size={16} />
                            <span>Tham gia {formatJoinDate(investor.investmentDate)}</span>
                        </div>
                    </div>

                    <div className={styles.stats}>
                        {investor.previousInvestments && (
                            <div className={styles.stat}>
                                <span className={styles.statValue}>
                                    {investor.previousInvestments.split(',').length}
                                </span>
                                <span className={styles.statLabel}>Khoản đầu tư</span>
                            </div>
                        )}
                        <div className={styles.stat}>
                            <span className={styles.statValue}>{investor.investmentAmount?.toLocaleString() || '0'} VND</span>
                            <span className={styles.statLabel}>Đã triển khai</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Tổng quan
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'portfolio' ? styles.active : ''}`}
                    onClick={() => setActiveTab('portfolio')}
                >
                    Danh mục đầu tư
                </button>
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>
                {activeTab === 'overview' && (
                    <div className={styles.overview}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>Khẩu vị đầu tư (Investment Taste)</h3>
                            <p className={styles.description}>{investor.investmentTaste || 'Chưa cập nhật chi tiết khẩu vị đầu tư.'}</p>
                        </div>
                        
                        <div className={styles.statsGrid}>
                            <div className={styles.statCard}>
                                <Target size={24} className={styles.statIconLg} />
                                <div className={styles.cardLabel}>Ngành trọng điểm</div>
                                <div className={styles.cardValueSmall}>{investor.focusIndustry || 'Đa ngành'}</div>
                            </div>
                            <div className={styles.statCard}>
                                <TrendingUp size={24} className={styles.statIconLg} />
                                <div className={styles.cardLabel}>Giai đoạn ưu tiên</div>
                                <div className={styles.cardValueSmall}>Giai đoạn {investor.preferredStage || 'Sớm'}</div>
                            </div>
                            <div className={styles.statCard}>
                                <Wallet size={24} className={styles.statIconLg} />
                                <div className={styles.cardLabel}>Kích cỡ vé đầu tư</div>
                                <div className={styles.cardValueSmall}>{investor.investmentAmount?.toLocaleString() || 'N/A'} VND</div>
                            </div>
                            <div className={styles.statCard}>
                                <Briefcase size={24} className={styles.statIconLg} />
                                <div className={styles.cardLabel}>Khả năng rủi ro</div>
                                <div className={styles.cardValueSmall}>Mức {investor.riskTolerance || 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'portfolio' && (
                    <div className={styles.portfolio}>
                         <div className={styles.card}>
                            <h3 className={styles.cardTitle}>Các khoản đầu tư trước đây</h3>
                            <p className={styles.description}>{investor.previousInvestments || 'Chưa cập nhật thông tin các khoản đầu tư.'}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
