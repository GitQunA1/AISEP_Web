import React from 'react';
import { CheckCircle, AlertCircle, TrendingUp, X, AlertTriangle, BarChart3 } from 'lucide-react';
import styles from './AIEvaluationModal.module.css';

/**
 * AIEvaluationModal - Display AI analysis and eligibility evaluation results
 */
export default function AIEvaluationModal({ 
    isOpen, 
    analysisResult, 
    eligibilityResult, 
    isLoading,
    projectName,
    onSubmit, 
    onCancel 
}) {
    if (!isOpen) return null;

    // Extract data from analysis result
    const analysisData = analysisResult?.data;
    const analysis = analysisData?.analysis || {};
    const scoreBreakdown = analysisData?.scoreBreakdown || [];
    const potentialScore = analysisData?.potentialScore || 0;
    const chaosScore = analysisData?.chaosScore || 0;
    const strengths = analysisData?.strengths || [];
    const weaknesses = analysisData?.weaknesses || [];
    const summary = analysisData?.summary || '';
    const recommendations = analysisData?.recommendations || [];

    // Extract eligibility data
    const eligibilityData = eligibilityResult?.data;
    const isEligible = eligibilityData?.isEligibleStartup !== false;
    
    // Determine if can submit based on score > 0
    const canSubmit = potentialScore > 0;
    const showLowScoreWarning = potentialScore > 0 && potentialScore < 50;

    return (
        <div className={styles.backdrop} onClick={onCancel}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        <TrendingUp size={24} style={{ marginRight: '8px' }} />
                        Kết Quả Đánh Giá AI
                    </h2>
                    <button className={styles.closeBtn} onClick={onCancel}>
                        <X size={20} />
                    </button>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner}></div>
                        <p>Đang đánh giá dự án của bạn...</p>
                    </div>
                )}

                {/* Content */}
                {!isLoading && analysisData && (
                    <div className={styles.content}>
                        {/* Overall Score */}
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>📊 Điểm Đánh Giá</h3>
                            
                            <div className={styles.scoreBox}>
                                <div className={styles.scoreValue}>
                                    {potentialScore}
                                    <span className={styles.scoreMax}>/100</span>
                                </div>
                                <div className={styles.scoreLabel}>Điểm Tiềm Năng</div>
                                <div className={styles.scoreSubtitle}>Điểm Rối Loạn: {chaosScore}</div>
                            </div>

                            {/* Score Breakdown */}
                            {scoreBreakdown.length > 0 && (
                                <div className={styles.scoreBreakdown}>
                                    <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '600' }}>
                                        <BarChart3 size={14} style={{ marginRight: '6px', display: 'inline' }} />
                                        Phân Tích Chi Tiết
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

                        {/* Summary */}
                        {summary && (
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>📝 Tóm Tắt Đánh Giá</h3>
                                <div className={styles.summaryBox}>
                                    {summary}
                                </div>
                            </div>
                        )}

                        {/* Strengths */}
                        {strengths.length > 0 && (
                            <div className={styles.section}>
                                <h4 className={styles.subsectionTitle}>
                                    <CheckCircle size={16} style={{ color: '#17bf63' }} />
                                    Điểm Mạnh
                                </h4>
                                <ul className={styles.list}>
                                    {strengths.map((strength, idx) => (
                                        <li key={idx} className={styles.listItem}>
                                            ✓ {strength}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Weaknesses */}
                        {weaknesses.length > 0 && (
                            <div className={styles.section}>
                                <h4 className={styles.subsectionTitle}>
                                    <AlertCircle size={16} style={{ color: '#d97706' }} />
                                    Điểm Yếu
                                </h4>
                                <ul className={styles.list}>
                                    {weaknesses.map((weakness, idx) => (
                                        <li key={idx} className={styles.listItem}>
                                            ⚠ {weakness}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Analysis Details */}
                        {Object.keys(analysis).length > 0 && (
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>🔍 Chi Tiết Phân Tích</h3>
                                <div className={styles.analysisDetails}>
                                    {Object.entries(analysis).map(([key, section]) => {
                                        if (typeof section !== 'object' || !section.score) return null;
                                        
                                        return (
                                            <div key={key} className={styles.analysisItem}>
                                                <div className={styles.analysisItemHeader}>
                                                    <h5 style={{ margin: 0, textTransform: 'capitalize', fontSize: '14px', fontWeight: '600' }}>
                                                        {key.charAt(0).toUpperCase() + key.slice(1)}
                                                    </h5>
                                                    <span className={styles.analysisScore}>
                                                        Score: {typeof section.score === 'number' ? section.score.toFixed(1) : section.score}
                                                    </span>
                                                </div>
                                                {section.reason && (
                                                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '6px 0' }}>
                                                        {section.reason}
                                                    </p>
                                                )}
                                                {section.evidence?.length > 0 && (
                                                    <div style={{ fontSize: '12px', color: '#17bf63', margin: '4px 0' }}>
                                                        ✓ {section.evidence.slice(0, 2).join(' • ')}
                                                    </div>
                                                )}
                                                {section.missingData?.length > 0 && (
                                                    <div style={{ fontSize: '12px', color: '#d97706', margin: '4px 0' }}>
                                                        ⚠ Missing: {section.missingData.length} items
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Recommendations */}
                        {recommendations.length > 0 && (
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>💡 Gợi Ý Cải Thiện</h3>
                                <ul className={styles.list}>
                                    {recommendations.slice(0, 5).map((rec, idx) => (
                                        <li key={idx} className={styles.listItem} style={{ borderLeftColor: '#667eea' }}>
                                            📋 {rec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Eligibility Status */}
                        {eligibilityData && (
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>✅ Kết Quả Kiểm Tra Điều Kiện</h3>
                                
                                <div className={`${styles.eligibilityBox} ${
                                    isEligible ? styles.eligible : styles.notEligible
                                }`}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {isEligible ? (
                                            <>
                                                <CheckCircle size={24} style={{ color: '#17bf63' }} />
                                                <div>
                                                    <div className={styles.eligibilityStatus}>✓ Đủ điều kiện nộp</div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle size={24} style={{ color: '#d97706' }} />
                                                <div>
                                                    <div className={styles.eligibilityStatus}>⚠ Chưa đủ điều kiện</div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Low Score Warning */}
                        {showLowScoreWarning && (
                            <div className={styles.section}>
                                <div className={styles.warningBox}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                        <AlertTriangle size={20} style={{ color: '#f59e0b', marginTop: '2px', flexShrink: 0 }} />
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
                    </div>
                )}
            </div>
        </div>
    );
}
