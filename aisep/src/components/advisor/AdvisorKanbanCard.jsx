import React from 'react';
import { ArrowRight, CheckCircle, XCircle, Loader2, MapPin, Globe, Award, DollarSign } from 'lucide-react';
import local from './AdvisorApprovalPage.module.css';

import staffLocal from '../../styles/OperationStaffDashboard.module.css';

/**
 * AdvisorKanbanCard - Single card for the Advisor Approval Kanban board
 */
const AdvisorKanbanCard = ({ advisor, status, onDetail, onApprove, onReject, processingId, processingAction }) => {
    const isPending = status === 'pend';
    const isApproved = status === 'appr';
    const isRejected = status === 'rej';

    // Format hourly rate
    const formatPrice = (price) => {
        return Number(price || 0).toLocaleString('vi-VN');
    };

    return (
        <div className={staffLocal.inv_card}>
            <div className={`${staffLocal.inv_cardStrip} ${staffLocal[status]}`}></div>
            <div className={local.bcardBody}>
                <div className={local.bcardRow1}>
                    <div className={local.bcardMainInfo}>
                        <div className={local.bcardName} title={advisor?.userName || advisor?.fullName}>
                            {advisor?.userName || advisor?.fullName || 'Ẩn danh'}
                        </div>
                        {advisor?.location && (
                            <div className={local.bcardLoc}>
                                <MapPin size={12} />
                                <span>{advisor.location}</span>
                            </div>
                        )}
                    </div>
                    <div className={local.bcardTime}>
                        {advisor?.createdAt ? new Date(advisor.createdAt).toLocaleDateString('vi-VN') : null}
                    </div>
                </div>

                <div className={local.advisorExpertise}>
                    <Award size={14} className={local.expIcon} />
                    <span>{advisor?.expertise || 'Chuyên môn chưa cập nhật'}</span>
                </div>

                <p className={local.bcardDesc}>{advisor?.bio || 'Không có mô tả tiểu sử...'}</p>

                <div className={local.bcardFields}>
                    <div className={local.bf}>
                        <div className={local.bfKey}>Phí tư vấn</div>
                        <div className={local.bfVal} style={{ color: '#f59e0b', fontWeight: '700' }}>
                            {formatPrice(advisor?.hourlyRate)} <span style={{ fontSize: '11px', fontWeight: '400', color: 'var(--text-secondary)' }}>₫/giờ</span>
                        </div>
                    </div>
                    {advisor?.languagesSpoken && (
                        <div className={local.bf}>
                            <div className={local.bfKey}>Ngôn ngữ</div>
                            <div className={local.bfVal}>{advisor.languagesSpoken}</div>
                        </div>
                    )}
                </div>

                <div className={local.bcardActions}>
                    <button className={local.baBtn} onClick={onDetail} title="Chi tiết">
                        <ArrowRight size={16} />
                        Chi tiết
                    </button>

                    {isPending && (
                        <>
                            <button
                                className={`${local.baBtn} ${local.rej} ${processingId !== null ? local.btnDisabled : ''}`}
                                onClick={onReject}
                                disabled={processingId !== null}
                                title="Từ chối"
                            >
                                {processingId === advisor.advisorId && processingAction === 'reject' ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <XCircle size={16} />
                                )}
                                Từ chối
                            </button>
                            <button
                                className={`${local.baBtn} ${local.apr} ${processingId !== null ? local.btnDisabled : ''}`}
                                onClick={onApprove}
                                disabled={processingId !== null}
                                title="Phê duyệt"
                            >
                                {processingId === advisor.advisorId && processingAction === 'approve' ? (
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
        </div>
    );
};

export default AdvisorKanbanCard;
