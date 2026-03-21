import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './AdvisorFilterModal.module.css';

export default function AdvisorFilterModal({ filters, onApply, onClose, isOpen }) {
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
            expertise: 'Tất cả chuyên môn',
            location: 'Tất cả khu vực',
            minRating: 0,
            maxRate: 5000000 // 5M VNĐ
        };
        setLocalFilters(resetFilters);
        onApply(resetFilters);
        onClose();
    };

    if (!isOpen) return null;

    const hasActiveFilters = 
        localFilters.expertise !== 'Tất cả chuyên môn' ||
        localFilters.location !== 'Tất cả khu vực' ||
        localFilters.minRating > 0 ||
        localFilters.maxRate < 5000000;

    return (
        <div className={styles.filterPanel}>
            <div className={styles.filterHeader}>
                <h3>Lọc cố vấn</h3>
                <button
                    className={styles.closeFilterBtn}
                    onClick={onClose}
                >
                    <X size={20} />
                </button>
            </div>

            <div className={styles.filterContent}>
                {/* Expertise Filter */}
                <div className={styles.filterGroup}>
                    <label>Chuyên môn</label>
                    <select
                        value={localFilters.expertise}
                        onChange={(e) => handleChange('expertise', e.target.value)}
                    >
                        <option>Tất cả chuyên môn</option>
                        <option>Chiến lược kinh doanh</option>
                        <option>Marketing & Sales</option>
                        <option>Công nghệ & Kỹ thuật</option>
                        <option>Tài chính & Gọi vốn</option>
                        <option>Pháp lý & Quản trị</option>
                        <option>Product Management</option>
                    </select>
                </div>

                {/* Location Filter */}
                <div className={styles.filterGroup}>
                    <label>Khu vực</label>
                    <select
                        value={localFilters.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                    >
                        <option>Tất cả khu vực</option>
                        <option>Hà Nội</option>
                        <option>TP. Hồ Chí Minh</option>
                        <option>Đà Nẵng</option>
                        <option>Online / Từ xa</option>
                    </select>
                </div>

                {/* Rating Filter */}
                <div className={styles.filterGroup}>
                    <label>Đánh giá tối thiểu: {localFilters.minRating} ⭐</label>
                    <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={localFilters.minRating}
                        onChange={(e) => handleChange('minRating', parseFloat(e.target.value))}
                        className={styles.rangeSlider}
                    />
                    <div className={styles.scoreLabels}>
                        <span>0</span>
                        <span>2.5</span>
                        <span>5</span>
                    </div>
                </div>

                {/* Rate Filter */}
                <div className={styles.filterGroup}>
                    <label>Mức phí tối đa: {localFilters.maxRate.toLocaleString('vi-VN')} VNĐ/giờ</label>
                    <input
                        type="range"
                        min="0"
                        max="5000000"
                        step="100000"
                        value={localFilters.maxRate}
                        onChange={(e) => handleChange('maxRate', parseInt(e.target.value))}
                        className={styles.rangeSlider}
                    />
                    <div className={styles.scoreLabels}>
                        <span>0</span>
                        <span>2.5M</span>
                        <span>5M</span>
                    </div>
                </div>
            </div>

            <div className={styles.filterActions}>
                {hasActiveFilters && (
                    <button
                        className={styles.clearBtn}
                        onClick={handleReset}
                    >
                        Xóa bộ lọc
                    </button>
                )}
                <button
                    className={styles.applyBtn}
                    onClick={handleApply}
                >
                    Áp dụng
                </button>
            </div>
        </div>
    );
}
