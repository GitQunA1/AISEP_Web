import React, { useState } from 'react';
import { Edit2, Eye, Trash2, Upload } from 'lucide-react';
import FilePreviewModal from '../common/FilePreviewModal';
import styles from './SubmissionReviewStep.module.css';

/**
 * SubmissionReviewStep - Final review screen before submission
 * Shows summary of all collected data with edit navigation and file management
 */
export default function SubmissionReviewStep({
    formData,
    onJumpToStep,
    onFileRemove,
    onFileReplace,
}) {
    const [previewFile, setPreviewFile] = useState(null);

    const handleFileReplace = (field) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = field === 'pitchDeck' ? '.pdf,.ppt,.pptx' : '.pdf,.docx,.doc';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) onFileReplace(field, file);
        };
        input.click();
    };

    const SummaryCard = ({ title, stepNumber, children }) => (
        <div className={styles.summaryCard}>
            <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{title}</h3>
                <button
                    className={styles.editButton}
                    onClick={() => onJumpToStep(stepNumber)}
                    title="Edit this section"
                >
                    <Edit2 size={16} />
                    <span>Edit</span>
                </button>
            </div>
            <div className={styles.cardBody}>{children}</div>
        </div>
    );

    const FieldRow = ({ label, value }) => (
        <div className={styles.fieldRow}>
            <span className={styles.fieldLabel}>{label}:</span>
            <span className={styles.fieldValue}>{value || '—'}</span>
        </div>
    );

    const FileCard = ({ label, file, field }) => (
        <div className={styles.fileCard}>
            <div className={styles.fileInfo}>
                <div className={styles.fileName}>{file ? file.name : 'No file uploaded'}</div>
                {file && (
                    <div className={styles.fileSize}>
                        {(file.size / 1024).toFixed(2)} KB
                    </div>
                )}
            </div>
            {file && (
                <div className={styles.fileActions}>
                    <button
                        className={styles.fileActionButton}
                        onClick={() => setPreviewFile(file)}
                        title="Preview"
                    >
                        <Eye size={16} />
                        <span>Preview</span>
                    </button>
                    <button
                        className={styles.fileActionButton}
                        onClick={() => handleFileReplace(field)}
                        title="Replace"
                    >
                        <Upload size={16} />
                        <span>Replace</span>
                    </button>
                    <button
                        className={`${styles.fileActionButton} ${styles.deleteButton}`}
                        onClick={() => {
                            if (window.confirm('Are you sure you want to remove this file?')) {
                                onFileRemove(field);
                            }
                        }}
                        title="Remove"
                    >
                        <Trash2 size={16} />
                        <span>Remove</span>
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className={styles.reviewContainer}>
            <div className={styles.reviewHeader}>
                <h2 className={styles.reviewTitle}>Review & Confirm</h2>
                <p className={styles.reviewSubtitle}>
                    Please review all information before submitting. Click "Edit" on any section to make changes.
                </p>
            </div>

            <div className={styles.summaryGrid}>
                {/* Section A: Basic Info */}
                <SummaryCard title="Basic Information" stepNumber={1}>
                    <FieldRow label="Startup Name" value={formData.startupName} />
                    <FieldRow label="Founder(s)" value={formData.founders} />
                    <FieldRow label="Contact Email" value={formData.contactEmail} />
                    <FieldRow label="Phone" value={formData.phone} />
                    <FieldRow label="Country" value={formData.country} />
                    <FieldRow label="City" value={formData.city} />
                    <FieldRow label="Website" value={formData.website} />
                    {formData.logo && (
                        <div className={styles.logoPreview}>
                            <span className={styles.fieldLabel}>Logo:</span>
                            <img
                                src={URL.createObjectURL(formData.logo)}
                                alt="Startup logo"
                                className={styles.logoImage}
                            />
                        </div>
                    )}
                </SummaryCard>

                {/* Section B: Business Info */}
                <SummaryCard title="Business Information" stepNumber={2}>
                    <FieldRow label="Industry" value={formData.industry} />
                    <FieldRow label="Stage" value={formData.stage} />
                    <FieldRow label="Problem Statement" value={formData.problemStatement} />
                    <FieldRow label="Solution" value={formData.solutionDescription} />
                    <FieldRow label="Target Customers" value={formData.targetCustomers} />
                    <FieldRow label="Value Proposition" value={formData.uniqueValueProposition} />
                </SummaryCard>

                {/* Section C: Market & Model */}
                <SummaryCard title="Market & Business Model" stepNumber={3}>
                    <FieldRow label="Market Size" value={formData.marketSize} />
                    <FieldRow label="Business Model" value={formData.businessModel} />
                    <FieldRow label="Current Revenue" value={formData.currentRevenue} />
                    <FieldRow label="Competitors" value={formData.competitors} />
                </SummaryCard>

                {/* Section D: Team */}
                <SummaryCard title="Team Information" stepNumber={4}>
                    <FieldRow label="Team Members" value={formData.teamMembers} />
                    <FieldRow label="Key Skills" value={formData.keySkills} />
                    <FieldRow label="Experience" value={formData.experience} />
                </SummaryCard>

                {/* Section E: Documents */}
                <SummaryCard title="Documents" stepNumber={5}>
                    <div className={styles.filesSection}>
                        <div className={styles.fileGroup}>
                            <div className={styles.fileLabel}>Pitch Deck (Required)</div>
                            <FileCard file={formData.pitchDeck} field="pitchDeck" />
                        </div>
                        <div className={styles.fileGroup}>
                            <div className={styles.fileLabel}>Business Plan (Optional)</div>
                            <FileCard file={formData.businessPlan} field="businessPlan" />
                        </div>
                    </div>
                </SummaryCard>
            </div>

            {/* File Preview Modal */}
            {previewFile && (
                <FilePreviewModal
                    file={previewFile}
                    onClose={() => setPreviewFile(null)}
                />
            )}
        </div>
    );
}
