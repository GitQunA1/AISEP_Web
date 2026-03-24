import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './FilterModal.module.css';

export default function FilterModal({ filters, onApply, onClose, isOpen }) {
    const [localFilters, setLocalFilters] = useState(filters);

    useEffect(() => {
        if (isOpen) {
            setLocalFilters(filters);
        }
    }, [isOpen, filters]);

    const handleChange = (field, value) => {
        setLocalFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    const handleReset = () => {
        const resetFilters = {
            industry: 'Tất cả ngành nghề',
            stage: 'Tất cả giai đoạn',
            fundingStatus: 'Tất cả trạng thái',
            minAiScore: 0
        };
        setLocalFilters(resetFilters);
        onApply(resetFilters);
        onClose();
    };

    if (!isOpen) return null;

    const hasActiveFilters =
        localFilters.industry !== 'Tất cả ngành nghề' ||
        localFilters.stage !== 'Tất cả giai đoạn' ||
        localFilters.fundingStatus !== 'Tất cả trạng thái' ||
        localFilters.minAiScore > 0;

    return (
        <div className={styles.filterPanel}>
            <div className={styles.filterHeader}>
                <h3>Lọc nhà đầu tư</h3>
                <button className={styles.closeFilterBtn} onClick={onClose}>
                    <X size={20} />
                </button>
            </div>

            <div className={styles.filterContent}>
                <div className={styles.filterGroup}>
                    <label>Ngành nghề</label>
                    <select value={localFilters.industry} onChange={(e) => handleChange('industry', e.target.value)}>
                        <option>Tất cả ngành nghề</option>
                        <option>AI/ML</option>
                        <option>Blockchain</option>
                        <option>Fintech</option>
                        <option>Healthtech</option>
                        <option>SaaS</option>
                        <option>Thương mại điện tử</option>
                        <option>EdTech</option>
                    </select>
                </div>

                <div className={styles.filterGroup}>
                    <label>Giai đoạn</label>
                    <select value={localFilters.stage} onChange={(e) => handleChange('stage', e.target.value)}>
                        <option>Tất cả giai đoạn</option>
                        <option>Pre-Seed</option>
                        <option>Seed</option>
                        <option>Series A</option>
                        <option>Series B</option>
                        <option>Series C</option>
                    </select>
                </div>

                <div className={styles.filterGroup}>
                    <label>Trạng thái gọi vốn</label>
                    <select value={localFilters.fundingStatus} onChange={(e) => handleChange('fundingStatus', e.target.value)}>
                        <option>Tất cả trạng thái</option>
                        <option>Đã được rót vốn</option>
                        <option>Đang tìm kiếm đầu tư</option>
                        <option>Không tìm kiếm</option>
                    </select>
                </div>

                <div className={styles.filterGroup}>
                    <label>Điểm Match tối thiểu: {localFilters.minAiScore}%</label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={localFilters.minAiScore}
                        onChange={(e) => handleChange('minAiScore', parseInt(e.target.value))}
                        className={styles.rangeSlider}
                    />
                    <div className={styles.scoreLabels}>
                        <span>0</span>
                        <span>50</span>
                        <span>100</span>
                    </div>
                </div>
            </div>

            <div className={styles.filterActions}>
                {hasActiveFilters && (
                    <button className={styles.clearBtn} onClick={handleReset}>
                        Xóa bộ lọc
                    </button>
                )}
                <button className={styles.applyBtn} onClick={handleApply}>
                    Áp dụng
                </button>
            </div>
        </div>
    );
}
