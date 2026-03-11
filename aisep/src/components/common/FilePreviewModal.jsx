import React, { useEffect } from 'react';
import { X, Download } from 'lucide-react';
import styles from './FilePreviewModal.module.css';

/**
 * FilePreviewModal - Display file previews for different file types
 * Supports: PDF, Images, and download prompts for Word/PowerPoint
 */
export default function FilePreviewModal({ file, onClose }) {
    // Close on ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!file) return null;

    const fileUrl = URL.createObjectURL(file);
    const fileType = file.type;
    const fileName = file.name;

    // Determine if file is previewable
    const isImage = fileType.startsWith('image/');
    const isPDF = fileType === 'application/pdf';
    const isPreviewable = isImage || isPDF;

    const handleDownload = () => {
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = fileName;
        a.click();
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.fileInfo}>
                        <h3 className={styles.fileName}>{fileName}</h3>
                        <p className={styles.fileSize}>
                            {(file.size / 1024).toFixed(2)} KB
                        </p>
                    </div>
                    <div className={styles.actions}>
                        <button
                            className={styles.iconButton}
                            onClick={handleDownload}
                            title="Download"
                        >
                            <Download size={20} />
                        </button>
                        <button
                            className={styles.iconButton}
                            onClick={onClose}
                            title="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className={styles.body}>
                    {isImage && (
                        <img
                            src={fileUrl}
                            alt={fileName}
                            className={styles.imagePreview}
                        />
                    )}

                    {isPDF && (
                        <iframe
                            src={fileUrl}
                            className={styles.pdfPreview}
                            title={fileName}
                        />
                    )}

                    {!isPreviewable && (
                        <div className={styles.noPreview}>
                            <div className={styles.noPreviewIcon}>📄</div>
                            <h4>Preview not available</h4>
                            <p>This file type cannot be previewed in the browser.</p>
                            <button
                                className={styles.downloadButton}
                                onClick={handleDownload}
                            >
                                <Download size={18} />
                                Download to view
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
