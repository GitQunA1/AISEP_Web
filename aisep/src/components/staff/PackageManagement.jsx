import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Edit3, Check, X, Shield, Zap, Eye, Ticket, Loader2, AlertCircle } from 'lucide-react';
import styles from './StaffSubscription.module.css';
import paymentService from '../../services/paymentService';

const PackageManagement = ({ searchTerm = '' }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPackage, setEditingPackage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      // Fetch both investor and startup packages
      const [investorPkgs, startupPkgs] = await Promise.all([
        paymentService.getInvestorPackages(),
        paymentService.getStartupPackages()
      ]);
      
      const allPkgs = [
        ...(investorPkgs.items || investorPkgs || []).map(p => ({ ...p, role: 'Investor' })),
        ...(startupPkgs.items || startupPkgs || []).map(p => ({ ...p, role: 'Startup' }))
      ];
      setPackages(allPkgs);
    } catch (error) {
      console.error('Failed to fetch packages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const filteredPackages = packages.filter(pkg => 
    pkg.packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (pkg) => {
    setEditingPackage({ ...pkg });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: editingPackage.packageName,
        description: editingPackage.description,
        price: editingPackage.price,
        durationMonths: editingPackage.durationMonths,
        maxAiRequests: editingPackage.maxAiRequests,
        maxProjectViews: editingPackage.maxProjectViews,
        freeBookingCount: editingPackage.freeBookingCount
      };
      
      await paymentService.updatePackage(editingPackage.packageId, payload);
      setEditingPackage(null);
      fetchPackages();
    } catch (error) {
      console.error('Failed to update package:', error);
      alert('Không thể cập nhật gói. Vui lòng kiểm tra lại dữ liệu.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <Loader2 className={styles.spin} size={40} color="var(--primary-blue)" />
      </div>
    );
  }

  return (
    <div className={styles.container}>

      {/* Desktop Table View */}
      <div className={`${styles.tableContainer} ${styles.desktopOnly}`}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Tên gói</th>
              <th className={`${styles.th} ${styles.colRole}`}>Đối tượng</th>
              <th className={`${styles.th} ${styles.colPrice}`}>Giá (VND)</th>
              <th className={`${styles.th} ${styles.colDuration}`}>Thời hạn</th>
              <th className={`${styles.th} ${styles.colAi}`}>AI</th>
              <th className={`${styles.th} ${styles.colView}`}>Views</th>
              <th className={`${styles.th} ${styles.colBook}`}>Books</th>
              <th className={styles.th} style={{ width: '100px', textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredPackages.map((pkg) => (
              <tr key={`${pkg.role}-${pkg.packageId}`} className={styles.tr}>
                <td className={styles.td}>
                   <div style={{ fontWeight: 800, fontSize: '15px' }}>{pkg.packageName}</div>
                   <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{pkg.description.substring(0, 60)}...</div>
                </td>
                <td className={`${styles.td} ${styles.colRole}`}>
                  <span className={`${styles.roleBadge} ${pkg.role === 'Investor' ? styles.investor : styles.startup}`}>
                    {pkg.role}
                  </span>
                </td>
                <td className={`${styles.td} ${styles.colPrice}`} style={{ fontWeight: 700 }}>
                  {pkg.price.toLocaleString('vi-VN')} <span style={{ fontSize: '11px', opacity: 0.6 }}>đ</span>
                </td>
                <td className={`${styles.td} ${styles.colDuration}`}>
                   <span style={{ fontWeight: 600 }}>{pkg.durationMonths}</span> <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>tháng</span>
                </td>
                <td className={`${styles.td} ${styles.colAi}`}>
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '13px', fontWeight: 700 }}>
                      <Zap size={14} color="#1d9bf0" /> {pkg.maxAiRequests}
                   </div>
                </td>
                <td className={`${styles.td} ${styles.colView}`}>
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '13px', fontWeight: 700 }}>
                      <Eye size={14} color="#1d9bf0" /> {pkg.maxProjectViews}
                   </div>
                </td>
                <td className={`${styles.td} ${styles.colBook}`}>
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '13px', fontWeight: 700 }}>
                      <Ticket size={14} color="#1d9bf0" /> {pkg.freeBookingCount}
                   </div>
                </td>
                <td className={styles.td} style={{ textAlign: 'right' }}>
                  <button className={styles.editBtn} onClick={() => handleEdit(pkg)}>
                    <Edit3 size={14} />
                    Sửa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className={styles.mobileOnly}>
        <div className={styles.mobileCards}>
          {filteredPackages.map((pkg) => (
            <div key={`${pkg.role}-${pkg.packageId}`} className={styles.mobileCard}>
              <div className={styles.mobileCardHeader}>
                <div style={{ flex: 1 }}>
                  <h3 className={styles.mobileCardTitle}>{pkg.packageName}</h3>
                  <div className={styles.mobileCardDesc}>{pkg.description.substring(0, 80)}...</div>
                </div>
                <span className={`${styles.roleBadge} ${pkg.role === 'Investor' ? styles.investor : styles.startup}`}>
                  {pkg.role}
                </span>
              </div>

              <div className={styles.mobileCardMetrics}>
                <div className={styles.mobileMetricItem}>
                  <div className={styles.mobileMetricValue}><Zap size={14} color="#1d9bf0" /> {pkg.maxAiRequests}</div>
                  <div className={styles.mobileMetricLabel}>AI</div>
                </div>
                <div className={styles.mobileMetricItem}>
                  <div className={styles.mobileMetricValue}><Eye size={14} color="#1d9bf0" /> {pkg.maxProjectViews}</div>
                  <div className={styles.mobileMetricLabel}>Views</div>
                </div>
                <div className={styles.mobileMetricItem}>
                  <div className={styles.mobileMetricValue}><Ticket size={14} color="#1d9bf0" /> {pkg.freeBookingCount}</div>
                  <div className={styles.mobileMetricLabel}>Books</div>
                </div>
              </div>

              <div className={styles.mobileCardFooter}>
                 <div className={styles.mobilePrice}>
                   <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 400 }}>{pkg.durationMonths}th / </span>
                   {pkg.price.toLocaleString('vi-VN')}đ
                 </div>
                 <button className={styles.editBtn} onClick={() => handleEdit(pkg)}>
                   <Edit3 size={14} /> Sửa
                 </button>
              </div>
            </div>
          ))}
          {filteredPackages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                Không tìm thấy gói dịch vụ nào.
            </div>
          )}
        </div>
      </div>

      {editingPackage && createPortal(
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setEditingPackage(null)}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGrp}>
                <h3 className={styles.modalTitle}>Chỉnh sửa: {editingPackage.packageName}</h3>
              </div>
              <div className={styles.modalHeaderActions}>
                <span className={`${styles.roleBadge} ${editingPackage.role === 'Investor' ? styles.investor : styles.startup} ${styles.modalHeaderBadge}`}>
                  {editingPackage.role}
                </span>
                <button className={styles.closeBtn} onClick={() => setEditingPackage(null)}>
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Tên gói</label>
                  <input 
                    className={styles.input} 
                    value={editingPackage.packageName} 
                    onChange={e => setEditingPackage({...editingPackage, packageName: e.target.value})}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Giá (VND)</label>
                  <input 
                    type="number" 
                    className={styles.input} 
                    value={editingPackage.price} 
                    onChange={e => setEditingPackage({...editingPackage, price: parseInt(e.target.value)})}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Thời hạn (tháng)</label>
                  <input 
                    type="number" 
                    className={styles.input} 
                    value={editingPackage.durationMonths} 
                    onChange={e => setEditingPackage({...editingPackage, durationMonths: parseInt(e.target.value)})}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>AI Requests</label>
                  <input 
                    type="number" 
                    className={styles.input} 
                    value={editingPackage.maxAiRequests} 
                    onChange={e => setEditingPackage({...editingPackage, maxAiRequests: parseInt(e.target.value)})}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Project Views</label>
                  <input 
                    type="number" 
                    className={styles.input} 
                    value={editingPackage.maxProjectViews} 
                    onChange={e => setEditingPackage({...editingPackage, maxProjectViews: parseInt(e.target.value)})}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Free Bookings</label>
                  <input 
                    type="number" 
                    className={styles.input} 
                    value={editingPackage.freeBookingCount} 
                    onChange={e => setEditingPackage({...editingPackage, freeBookingCount: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className={styles.formGroup} style={{ marginTop: '20px' }}>
                <label className={styles.label}>Mô tả gói dịch vụ</label>
                <textarea 
                  className={styles.input} 
                  style={{ height: '100px', resize: 'none' }}
                  value={editingPackage.description} 
                  onChange={e => setEditingPackage({...editingPackage, description: e.target.value})}
                />
              </div>
            </div>

            <div className={styles.footer}>
              <button className={styles.cancelBtn} onClick={() => setEditingPackage(null)}>Hủy bỏ</button>
              <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className={styles.spin} size={18} /> : 'Lưu cập nhật'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PackageManagement;
