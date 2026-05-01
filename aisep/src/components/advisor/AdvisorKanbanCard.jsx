import React from 'react';
import { ArrowRight, CheckCircle, XCircle, Loader2, MapPin, Award, Mail, DollarSign } from 'lucide-react';
import staffLocal from '../../styles/OperationStaffDashboard.module.css';

/**
 * AdvisorKanbanCard - Card phê duyệt cố vấn, đồng bộ style với InvestorKanbanCard
 */
const AdvisorKanbanCard = ({ advisor, status, onDetail, onApprove, onReject, processingId, processingAction, isHighlighted }) => {
    const isPending = status === 'pend';
    const isProcessing = processingId === advisor.advisorId;
    const isAnyProcessing = !!processingId;

    const formatPrice = (price) => Number(price || 0).toLocaleString('vi-VN');

    return (
        <div
            id={`advisor-${advisor.advisorId}`}
            className={`${staffLocal.investorProCard} ${staffLocal[status]} ${isHighlighted ? staffLocal.targetHighlight : ''}`}
        >
            <div className={`${staffLocal.investorProCardStrip} ${staffLocal[status]}`}></div>

            {/* Header */}
            <div className={staffLocal.investorProHeader}>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <h4 className={staffLocal.investorProName} title={advisor.userName || advisor.fullName}>
                        {advisor.userName || advisor.fullName || 'Cố vấn'}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                        <span className={staffLocal.investorProBadge}>
                            Cố vấn
                        </span>
                        {advisor.location && (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <MapPin size={10} />
                                {advisor.location}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className={staffLocal.investorProBody}>
                {/* Expertise */}
                <div className={staffLocal.investorProRow}>
                    <span className={staffLocal.investorProLabel}>Chuyên môn</span>
                    <span className={staffLocal.investorProValue} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Award size={12} style={{ color: 'var(--primary-blue)', flexShrink: 0 }} />
                        {advisor.expertise || 'Chưa cập nhật'}
                    </span>
                </div>

                {/* Email */}
                <div className={staffLocal.investorProRow}>
                    <span className={staffLocal.investorProLabel}>Email</span>
                    <span className={staffLocal.investorProValue} title={advisor.email}>
                        {advisor.email || '-'}
                    </span>
                </div>

                {/* Hourly Rate */}
                <div className={staffLocal.investorProRow}>
                    <span className={staffLocal.investorProLabel}>Phí tư vấn</span>
                    <span className={staffLocal.investorProValue} style={{ color: '#f59e0b', fontWeight: '700' }}>
                        {formatPrice(advisor.hourlyRate)} <span style={{ fontSize: '11px', fontWeight: '400', color: 'var(--text-muted)' }}>₫/giờ</span>
                    </span>
                </div>

                {/* Language */}
                {advisor.languagesSpoken && (
                    <div className={staffLocal.investorProRow}>
                        <span className={staffLocal.investorProLabel}>Ngôn ngữ</span>
                        <span className={staffLocal.investorProValue}>{advisor.languagesSpoken}</span>
                    </div>
                )}

                {/* Industries */}
                {(() => {
                    const industries = advisor.industries || [];
                    if (industries.length === 0) return null;
                    return (
                        <div className={staffLocal.investorProRow} style={{ alignItems: 'flex-start' }}>
                            <span className={staffLocal.investorProLabel} style={{ marginTop: '2px' }}>Lĩnh vực</span>
                            <div className={staffLocal.investorProTags} style={{ margin: '0', flex: 1 }}>
                                {industries.slice(0, 3).map((ind, idx) => (
                                    <span key={idx} className={staffLocal.investorProTag}>{ind}</span>
                                ))}
                                {industries.length > 3 && (
                                    <span className={staffLocal.investorProTag}>+{industries.length - 3}</span>
                                )}
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* Footer */}
            <div className={staffLocal.investorProFooter}>
                <button className={staffLocal.investorProBtn} onClick={onDetail} title="Chi tiết">
                    <ArrowRight size={16} />
                    Chi tiết
                </button>

                {isPending && (
                    <>
                        <button
                            className={`${staffLocal.investorProBtn} ${staffLocal.investorProRejectBtn} ${isAnyProcessing ? staffLocal.btnDisabled : ''}`}
                            onClick={onReject}
                            disabled={isAnyProcessing}
                            title="Từ chối"
                        >
                            {isProcessing && processingAction === 'reject' ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <XCircle size={16} />
                            )}
                            Từ chối
                        </button>
                        <button
                            className={`${staffLocal.investorProBtn} ${staffLocal.investorProApproveBtn} ${isAnyProcessing ? staffLocal.btnDisabled : ''}`}
                            onClick={onApprove}
                            disabled={isAnyProcessing}
                            title="Phê duyệt"
                        >
                            {isProcessing && processingAction === 'approve' ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <CheckCircle size={16} />
                            )}
                            Duyệt
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdvisorKanbanCard;
