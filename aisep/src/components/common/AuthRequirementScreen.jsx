import React from 'react';
import { Lock, ArrowLeft, LogIn } from 'lucide-react';
import styles from './AuthRequirementScreen.module.css';

/**
 * AuthRequirementScreen - Professional "Login Required" view for restricted profiles
 * @param {string}   type    - Type of profile being blocked (e.g., "startup", "nhà đầu tư", "cố vấn")
 * @param {function} onBack  - Handler to go back to the previous list
 * @param {function} onLogin - Handler to trigger the login modal
 */
export default function AuthRequirementScreen({ type = 'thông tin này', onBack, onLogin }) {
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
                    <Lock size={48} className={styles.icon} />
                </div>

                <h2 className={styles.title}>Yêu cầu đăng nhập</h2>
                <p className={styles.message}>
                    Vui lòng đăng nhập tài khoản của bạn để xem nội dung chi tiết và các thông số của <strong>{type}</strong> này.
                </p>

                <div className={styles.actions}>
                    <button className={styles.loginBtn} onClick={onLogin}>
                        <LogIn size={18} />
                        <span>Đăng nhập ngay</span>
                    </button>
                    
                    <button className={styles.backLinkBtn} onClick={onBack}>
                        <ArrowLeft size={16} />
                        <span>Quay lại danh sách</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
