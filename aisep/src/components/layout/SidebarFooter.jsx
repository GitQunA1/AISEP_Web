import React, { useState } from 'react';
import { Rocket, Loader } from 'lucide-react';
import styles from './SidebarFooter.module.css';
import termsService from '../../services/termsService';
import TermsModal from '../common/TermsModal';

/**
 * SidebarFooter - Small informational section at the bottom of the right sidebar
 */
export default function SidebarFooter({ user }) {
    const [isTermsOpen, setIsTermsOpen] = useState(false);
    const [termsData, setTermsData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Only show for authenticated users
    if (!user) return null;

    const handleOpenTerms = async () => {
        setIsTermsOpen(true);
        setIsLoading(true);
        setError(null);
        try {
            const response = await termsService.getActiveTerms();
            // Handle both wrapped and unwrapped API responses
            const actualData = response?.data || response;
            setTermsData(actualData);
        } catch (err) {
            console.error('Failed to fetch terms for footer:', err);
            setError(err.message || 'Không thể tải điều khoản sử dụng.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <footer className={styles.footer}>
            <div className={styles.logo}>
                <Rocket size={20} color="var(--primary-blue)" />
                <span>AISEP</span>
            </div>

            <nav className={styles.links}>
                <button 
                    className={styles.link} 
                    onClick={handleOpenTerms}
                    disabled={isLoading}
                >
                    {isLoading ? <Loader size={12} className={styles.spin} /> : 'Điều khoản & Điều kiện'}
                </button>
            </nav>

            <div className={styles.copyright}>
                © AISEP 2026. Bảo lưu mọi quyền.
            </div>

            <TermsModal 
                isOpen={isTermsOpen}
                onClose={() => setIsTermsOpen(false)}
                termsContent={termsData?.contentHtml || termsData?.content}
                termsVersion={termsData?.version}
                error={error}
                isLoading={isLoading}
            />
        </footer>
    );
}
