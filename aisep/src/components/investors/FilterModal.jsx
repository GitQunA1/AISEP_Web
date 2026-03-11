import React, { useState, useEffect } from 'react';
import { X, Filter } from 'lucide-react';
import styles from './FilterModal.module.css';

export default function FilterModal({ filters, onApply, onClose, isOpen }) {
    const [localFilters, setLocalFilters] = useState(filters);

    // Sync local state with parent filters when modal opens
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
            industry: 'All Industries',
            stage: 'All Stages',
            fundingStatus: 'All Statuses',
            minAiScore: 0
        };
        setLocalFilters(resetFilters);
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <h2 className={styles.title}>Filter Projects</h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className={styles.body}>
                    {/* Dropdowns Row */}
                    <div className={styles.dropdownRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Industry</label>
                            <select
                                className={styles.select}
                                value={localFilters.industry}
                                onChange={(e) => handleChange('industry', e.target.value)}
                            >
                                <option>All Industries</option>
                                <option>AI/ML</option>
                                <option>Blockchain</option>
                                <option>Fintech</option>
                                <option>HealthTech</option>
                                <option>SaaS</option>
                                <option>E-commerce</option>
                                <option>EdTech</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Stage</label>
                            <select
                                className={styles.select}
                                value={localFilters.stage}
                                onChange={(e) => handleChange('stage', e.target.value)}
                            >
                                <option>All Stages</option>
                                <option>Pre-Seed</option>
                                <option>Seed</option>
                                <option>Series A</option>
                                <option>Series B</option>
                                <option>Series C</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Funding Status</label>
                            <select
                                className={styles.select}
                                value={localFilters.fundingStatus}
                                onChange={(e) => handleChange('fundingStatus', e.target.value)}
                            >
                                <option>All Statuses</option>
                                <option>Funded</option>
                                <option>Seeking Funding</option>
                                <option>Not Seeking</option>
                            </select>
                        </div>
                    </div>

                    {/* AI Score Slider */}
                    <div className={styles.sliderGroup}>
                        <label className={styles.label}>Minimum AI Score: {localFilters.minAiScore}</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={localFilters.minAiScore}
                            onChange={(e) => handleChange('minAiScore', parseInt(e.target.value))}
                            className={styles.slider}
                        />
                        <div className={styles.sliderLabels}>
                            <span>0</span>
                            <span>50</span>
                            <span>100</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <button className={styles.resetBtn} onClick={handleReset}>
                        Reset
                    </button>
                    <button className={styles.applyBtn} onClick={handleApply}>
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
}
