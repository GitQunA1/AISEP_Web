import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import styles from './ProjectSelectorModal.module.css';

/**
 * ProjectSelectorModal - Modal to select a project for document upload
 * Refactored for uniform design and theme support.
 */
export default function ProjectSelectorModal({ projects, onSelect, onCancel, isLoading }) {
    const [selectedProjectId, setSelectedProjectId] = useState(null);

    const handleSelect = () => {
        if (!selectedProjectId) return;
        const selected = projects.find(p => (p.id === selectedProjectId || p.projectId === selectedProjectId));
        if (selected) {
            onSelect(selected);
        }
    };

    const isProjectSelected = (project) => {
        const id = project.id || project.projectId;
        return selectedProjectId === id;
    };

    return (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onCancel()}>
            <div className={styles.modalContent}>
                {/* Header */}
                <div className={styles.modalHeader}>
                    <div>
                        <h2 className={styles.headerTitle}>Chọn dự án để tải tài liệu</h2>
                        <p className={styles.headerSubtitle}>{projects.length} dự án có sẵn</p>
                    </div>
                    <button onClick={onCancel} className={styles.closeButton}>
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className={styles.modalBody}>
                    {isLoading ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.spinner} />
                            <p>Đang tải dự án...</p>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className={styles.loadingContainer}>
                            <p>Bạn chưa có dự án nào.<br />Vui lòng tạo dự án trước.</p>
                        </div>
                    ) : (
                        <div className={styles.projectList}>
                            {projects.map((project) => {
                                const selected = isProjectSelected(project);
                                const id = project.id || project.projectId;
                                return (
                                    <div
                                        key={id}
                                        className={`${styles.projectItem} ${selected ? styles.projectItemActive : ''}`}
                                        onClick={() => setSelectedProjectId(id)}
                                    >
                                        <div className={styles.radioCircle}>
                                            {selected && <Check size={16} color="white" />}
                                        </div>
                                        <div className={styles.projectInfo}>
                                            <h3 className={styles.projectName}>
                                                {project.projectName || project.name}
                                            </h3>
                                            <p className={styles.projectDescription}>
                                                {project.shortDescription || project.description || 'Không có mô tả'}
                                            </p>
                                            <span className={styles.projectId}>ID: {id}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={styles.actions}>
                    <button onClick={onCancel} className={styles.secondaryBtn}>
                        Hủy
                    </button>
                    <button
                        onClick={handleSelect}
                        disabled={selectedProjectId === null || projects.length === 0}
                        className={styles.primaryBtn}
                    >
                        Chọn dự án
                    </button>
                </div>
            </div>
        </div>
    );
}
