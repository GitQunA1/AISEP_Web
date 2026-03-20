import React from 'react';
import { CheckCircle, AlertCircle, TrendingUp, X, AlertTriangle, BarChart3, Brain, Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import styles from './AIEvaluationModal.module.css';

/**
 * AIEvaluationModal - Display AI analysis and eligibility evaluation results
 */
export default function AIEvaluationModal({
    isOpen,
    analysisResult,
    eligibilityResult,
    isLoading,
    error,
    projectName,
    isHistoryMode = false,
    onSubmit,
    onCancel
}) {
    const [expandedSections, setExpandedSections] = React.useState({});

    const toggleSection = (key) => {
        setExpandedSections(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    if (!isOpen) return null;

    // Extract data from analysis result with fallbacks to handle both wrapped and unwrapped data
    const analysisData = analysisResult?.data || analysisResult || {};
    const analysis = analysisData?.analysis || analysisResult?.analysis || {};
    const scoreBreakdown = analysisData?.scoreBreakdown || analysisResult?.scoreBreakdown || [];

    // Look everywhere for scores and highlights
    const potentialScore = analysisData?.potentialScore || analysis?.potentialScore || analysisResult?.potentialScore || 0;
    const chaosScore = analysisData?.chaosScore || analysis?.chaosScore || analysisResult?.chaosScore || 0;
    const strengths = analysisData?.strengths || analysis?.strengths || analysisResult?.strengths || [];
    const weaknesses = analysisData?.weaknesses || analysis?.weaknesses || analysisResult?.weaknesses || [];
    const summary = analysisData?.summary || analysis?.summary || analysisResult?.summary || '';
    const recommendations = analysisData?.recommendations || analysis?.recommendations || analysisResult?.recommendations || [];

    // Determine if can submit based on score > 0
    const canSubmit = potentialScore > 0;
    const showLowScoreWarning = potentialScore > 0 && potentialScore < 50;

    const translateKey = (k) => {
        const map = {
            'team': 'Đội ngũ',
            'opportunity': 'Cơ hội thị trường',
            'product': 'Sản phẩm',
            'market': 'Thị trường',
            'competition': 'Cạnh tranh',
            'financials': 'Tài chính',
            'strategy': 'Chiến lược',
            'execution': 'Thực thi',
            'marketing': 'Tiếp thị',
            'growth': 'Tăng trưởng',
            'risk': 'Rủi ro',
            'investment': 'Huy động vốn'
        };
        return map[k.toLowerCase()] || k.charAt(0).toUpperCase() + k.slice(1);
    };

    const translateAIString = (str) => {
        if (!str || typeof str !== 'string') return str;
        let result = str;
        const map = {
            'Market Size': 'Quy mô thị trường',
            'Revenue': 'Doanh thu',
            'unrealistically low': 'thấp bất thường',
            'unrealistically high': 'cao bất thường',
            'Business Model': 'Mô hình kinh doanh',
            'BusinessModel': 'Mô hình kinh doanh',
            'Target Audience': 'Khách hàng mục tiêu',
            'Potential': 'Tiềm năng',
            'Strategy': 'Chiến lược',
            'Growth': 'Tăng trưởng',
            'Missing': 'Thiếu',
            'Evidence': 'Bằng chứng',
            'Go-to-market plan': 'Tiến độ thâm nhập thị trường',
            'Sales Chiến lược': 'Chiến lược bán hàng',
            'Customer acquisition': 'Thu hút khách hàng',
            'Traction metrics': 'Chỉ số tăng trưởng',
            'TeamMembers': 'Thành viên đội ngũ',
            'KeySkills': 'Kỹ năng then chốt',
            'TeamExperience': 'Kinh nghiệm đội ngũ',
            'Founder background': 'Tiểu sử người sáng lập',
            'Role split': 'Phân chia vai trò',
            'Domain experience': 'Kinh nghiệm lĩnh vực',
            'Investment': 'Huy động vốn'
        };
        Object.entries(map).forEach(([eng, vi]) => {
            const regex = new RegExp(eng, 'gi');
            result = result.replace(regex, vi);
        });
        return result;
    };

    return (
        <div className={styles.backdrop} onClick={onCancel}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        <TrendingUp size={24} className={styles.recommendationIcon} />
                        {isHistoryMode ? 'Lịch Sử Kết Quả Đánh Giá AI' : 'Kết Quả Đánh Giá AI'}
                    </h2>
                    <button className={styles.closeBtn} onClick={onCancel}>
                        <X size={24} />
                    </button>
                </div>

                {/* Error State */}
                {error && (
                    <div className={styles.loadingContainer}>
                        <div className={styles.aiIconContainer} style={{ color: '#ef4444' }}>
                            <AlertTriangle size={64} />
                        </div>
                        <h3 className={styles.loadingText}>Không thể hoàn thành đánh giá</h3>
                        <p className={styles.loadingSubtext}>{error}</p>
                        <button className={styles.primaryBtn} onClick={onCancel} style={{ marginTop: '20px' }}>
                            Đóng và thử lại sau
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && !error && (
                    <div className={styles.loadingContainer}>
                        <div className={styles.aiIconContainer}>
                            <div className={styles.pulseRing}></div>
                            <div className={styles.pulseRing} style={{ animationDelay: '1s' }}></div>
                            <Brain size={64} className={styles.brainIcon} />
                            <Sparkles
                                size={24}
                                style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    color: 'var(--primary-blue)',
                                    animation: 'pulse 1s infinite alternate'
                                }}
                            />
                        </div>
                        <h3 className={styles.loadingText}>Đang khởi chạy AI Analyst</h3>
                        <p className={styles.loadingSubtext}>
                            Hệ thống đang phân tích chi tiết các đầu mục trong dự án của bạn để đưa ra đánh giá chính xác nhất...
                        </p>
                        <div className={styles.progressBeamContainer}>
                            <div className={styles.progressBeam}></div>
                        </div>
                    </div>
                )}

                {/* Content */}
                {!isLoading && analysisData && (
                    <div className={styles.content}>
                        {/* 1. Overall Score */}
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>📊 Điểm Đánh Giá Hệ Thống</h3>

                            <div className={styles.scoreBox}>
                                <div className={styles.scoreValue}>
                                    {potentialScore}
                                    <span className={styles.scoreMax}>/100</span>
                                </div>
                                <div className={styles.scoreLabel}>Chỉ số Tiềm năng Dự án</div>
                                <div className={styles.scoreSubtitle}>Điểm Rối loạn (Hệ số rủi ro): {chaosScore}</div>
                            </div>

                            {/* Score Breakdown */}
                            {scoreBreakdown.length > 0 && (
                                <div className={styles.scoreBreakdown}>
                                    <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                                        <BarChart3 size={14} style={{ marginRight: '6px', display: 'inline' }} />
                                        Cấu trúc điểm số thành phần
                                    </h4>
                                    <div className={styles.breakdownGrid}>
                                        {scoreBreakdown.map((item, idx) => (
                                            <div key={idx} className={styles.breakdownItem}>
                                                <span className={styles.componentName}>{item.component}</span>
                                                <div className={styles.scoreBar}>
                                                    <div
                                                        className={styles.scoreBarFill}
                                                        style={{ width: `${(item.score / 1.5) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className={styles.componentScore}>{item.score?.toFixed(1) || 0}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. Analysis Details (Single Column List) */}
                        {Object.keys(analysis).length > 0 && (
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>🔍 Chi Tiết Phân Phối Điểm</h3>
                                <div className={styles.analysisList}>
                                    {Object.entries(analysis).map(([key, section]) => {
                                        if (typeof section !== 'object' || !section.score) return null;

                                        const isExpanded = expandedSections[key];

                                        return (
                                            <div key={key} className={`${styles.analysisItem} ${isExpanded ? styles.expanded : ''}`}>
                                                <div
                                                    className={styles.analysisItemHeader}
                                                    onClick={() => toggleSection(key)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <div className={styles.analysisItemTitleGroup}>
                                                        <ChevronRight
                                                            size={16}
                                                            className={`${styles.chevron} ${isExpanded ? styles.chevronExpanded : ''}`}
                                                        />
                                                        <h5 style={{ margin: 0, textTransform: 'capitalize', fontSize: '15px', fontWeight: '800' }}>
                                                            {translateKey(key)}
                                                        </h5>
                                                    </div>
                                                    <span className={styles.analysisScore}>
                                                        Điểm: {typeof section.score === 'number' ? section.score.toFixed(1) : section.score}
                                                    </span>
                                                </div>

                                                <div className={`${styles.analysisDetailsContent} ${isExpanded ? styles.show : ''}`}>
                                                    {section.reason && (
                                                        <div className={styles.detailSection}>
                                                            <div className={styles.detailLabel}>Lý do:</div>
                                                            <p className={styles.analysisReason}>
                                                                {translateAIString(section.reason)}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {section.evidence?.length > 0 && (
                                                        <div className={styles.detailSection}>
                                                            <div className={styles.detailLabel}>Bằng chứng:</div>
                                                            <ul className={styles.detailList}>
                                                                {section.evidence.map((e, idx) => (
                                                                    <li key={idx}>✓ {translateAIString(e)}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {section.missingData?.length > 0 && (
                                                        <div className={styles.detailSection}>
                                                            <div className={styles.detailLabel}>Dữ liệu thiếu:</div>
                                                            <ul className={styles.detailList} style={{ color: 'var(--text-secondary)' }}>
                                                                {section.missingData.map((m, idx) => (
                                                                    <li key={idx}>⚠ {translateAIString(m)}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>

                                                {!isExpanded && (
                                                    <div className={styles.previewText}>
                                                        {section.reason ? translateAIString(section.reason).substring(0, 60) + '...' : 'Nhấn để xem chi tiết'}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 3. Summary Section */}
                        {summary && (
                            <div className={styles.section}>
                                <div className={styles.summaryBox}>
                                    <div className={styles.summaryHeader}>
                                        <Sparkles size={20} className={styles.summaryIcon} />
                                        <h3 className={styles.summaryTitle}>📝 Phân Tích Tổng Quan Từ AI</h3>
                                    </div>
                                    <p className={styles.summaryText}>{summary}</p>
                                </div>
                            </div>
                        )}

                        {/* 4. Highlights: Strengths & Weaknesses */}
                        {(strengths.length > 0 || weaknesses.length > 0) && (
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>⭐ Ưu Điểm & Thách Thức</h3>
                                <div className={styles.highlightsGrid}>
                                    {strengths.length > 0 && (
                                        <div className={styles.highlightSection}>
                                            <div className={`${styles.highlightTitle} ${styles.strengthTitle}`}>
                                                <CheckCircle size={18} /> Điểm mạnh
                                            </div>
                                            <ul className={styles.highlightList}>
                                                {strengths.map((s, idx) => (
                                                    <li key={idx} className={styles.highlightItem}>
                                                        <Sparkles size={14} className={styles.highlightIcon} style={{ color: '#10b981' }} /> {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {weaknesses.length > 0 && (
                                        <div className={styles.highlightSection}>
                                            <div className={`${styles.highlightTitle} ${styles.weaknessTitle}`}>
                                                <AlertCircle size={18} /> Cần cải thiện
                                            </div>
                                            <ul className={styles.highlightList}>
                                                {weaknesses.map((w, idx) => (
                                                    <li key={idx} className={styles.highlightItem}>
                                                        <AlertTriangle size={14} className={styles.highlightIcon} style={{ color: '#f59e0b' }} /> {w}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 5. AI Recommendations */}
                        {recommendations.length > 0 && (
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>💡 Khuyến Nghị Hành Động</h3>
                                <div className={styles.highlightSection} style={{ borderLeft: '4px solid var(--primary-blue)', background: 'rgba(0, 102, 255, 0.03)' }}>
                                    <ul className={styles.highlightList}>
                                        {recommendations.slice(0, 10).map((rec, idx) => (
                                            <li key={idx} className={styles.highlightItem} style={{ marginBottom: '10px' }}>
                                                <TrendingUp size={16} style={{ color: 'var(--primary-blue)', flexShrink: 0, marginTop: '2px' }} /> {rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}


                        {/* Low Score Warning */}
                        {showLowScoreWarning && (
                            <div className={styles.section}>
                                <div className={styles.warningBox}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                        <AlertTriangle size={24} className={styles.weaknessIcon} style={{ marginTop: '2px', flexShrink: 0 }} />
                                        <div>
                                            <div className={styles.warningTitle}>⚠️ Cảnh báo: Điểm Đánh Giá Thấp</div>
                                            <div className={styles.warningText}>
                                                Dự án của bạn có điểm {potentialScore}/100. Bạn vẫn có thể nộp dự án, nhưng hãy cân nhắc cải thiện các điểm yếu được nhấn mạnh ở trên để tăng khả năng được cấp vốn.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Actions */}
                {!isLoading && (
                    <div className={styles.footer}>
                        {isHistoryMode ? (
                            <button
                                className={styles.secondaryBtn}
                                onClick={onCancel}
                                style={{ width: '100%', maxWidth: '200px' }}
                            >
                                Đóng
                            </button>
                        ) : (
                            <>
                                <button className={styles.secondaryBtn} onClick={onCancel}>
                                    Quay lại chỉnh sửa
                                </button>
                                <button
                                    className={styles.primaryBtn}
                                    onClick={onSubmit}
                                    disabled={!canSubmit}
                                    title={!canSubmit ? 'Dự án phải có điểm > 0 để nộp' : showLowScoreWarning ? 'Chú ý: Điểm thấp hơn 50%' : ''}
                                >
                                    {canSubmit ? '✓ Nộp dự án' : 'Không thể nộp (Điểm = 0)'}
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
