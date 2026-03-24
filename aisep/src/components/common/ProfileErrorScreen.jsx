import React from 'react';
import { AlertCircle, ArrowLeft, RefreshCcw } from 'lucide-react';
import styles from './ProfileErrorScreen.module.css';

/**
 * ProfileErrorScreen - Universal error display for profile detail pages.
 * @param {string}   title    - Section title, e.g. "Nhà đầu tư" / "Startup" / "Cố vấn"
 * @param {string}   message  - Specific error message from the API or catch block
 * @param {function} onBack   - Handler to navigate back to the list
 * @param {function} onRetry  - Optional handler to retry the fetch
 */
export default function ProfileErrorScreen({ title = 'trang này', message, onBack, onRetry }) {
    return (
        <div className={styles.wrapper}>
            <div className={styles.topNav}>
                <button className={styles.backBtn} onClick={onBack}>
                    <ArrowLeft size={20} />
                    <span>Quay lại</span>
                </button>
            </div>

            <div className={styles.body}>
                <div className={styles.iconWrapper}>
                    <AlertCircle size={52} className={styles.icon} />
                </div>

                <h2 className={styles.title}>Không thể tải {title}</h2>
                <p className={styles.message}>
                    {message || 'Đã xảy ra lỗi khi tải thông tin. Vui lòng thử lại sau.'}
                </p>

                <div className={styles.actions}>
                    {onRetry && (
                        <button className={styles.retryBtn} onClick={onRetry}>
                            <RefreshCcw size={16} />
                            <span>Thử lại</span>
                        </button>
                    )}
                    <button className={styles.backLinkBtn} onClick={onBack}>
                        <ArrowLeft size={16} />
                        <span>Quay lại danh sách</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
