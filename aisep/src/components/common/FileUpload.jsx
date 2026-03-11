import React, { useState, useRef } from 'react';
import { UploadCloud, X, CheckCircle } from 'lucide-react';
import styles from './FileUpload.module.css';

/**
 * FileUpload Component
 * Reusable drag-and-drop file upload with progress states
 * States: Idle -> Uploading -> Done
 */
function FileUpload({ 
  onFileSelect, 
  accept = '.pdf,.docx,.xlsx,.doc',
  label = 'Upload File',
  required = false,
  error = null
}) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFile(droppedFiles[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile) => {
    // Simulate file upload
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setFile(selectedFile);
          onFileSelect(selectedFile);
          return 100;
        }
        return prev + Math.random() * 30;
      });
    }, 200);
  };

  const handleRemove = () => {
    setFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileSelect(null);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.fileUploadContainer}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>

      {!file ? (
        // IDLE STATE: Drop zone
        <div
          className={`${styles.dropZone} ${isDragging ? styles.dragging : ''} ${
            error ? styles.error : ''
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            style={{ display: 'none' }}
          />

          {isUploading ? (
            // UPLOADING STATE
            <div className={styles.uploadingState}>
              <div className={styles.progressBarContainer}>
                <div
                  className={styles.progressBar}
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className={styles.uploadingText}>{Math.round(uploadProgress)}%</p>
            </div>
          ) : (
            // IDLE STATE
            <div className={styles.idleState}>
              <UploadCloud size={40} className={styles.uploadIcon} />
              <p className={styles.uploadText}>Drag & drop or click to upload</p>
              <p className={styles.uploadHint}>PDF, DOCX, XLS (Max 10MB)</p>
            </div>
          )}
        </div>
      ) : (
        // DONE STATE: File uploaded
        <div className={styles.doneState}>
          <div className={styles.fileInfo}>
            <CheckCircle size={24} className={styles.checkIcon} />
            <div className={styles.fileDetails}>
              <p className={styles.fileName}>{file.name}</p>
              <p className={styles.fileSize}>
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className={styles.removeButton}
            aria-label="Remove file"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}

export default FileUpload;
