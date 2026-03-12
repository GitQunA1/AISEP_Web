import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import styles from '../auth/RegisterForms.module.css';

/**
 * FormContentSteps - Form content for 6 steps
 * Extracted to separate component to prevent input re-render issues
 */
export default function FormContentSteps({
  currentStep,
  totalSteps,
  formData,
  errors,
  emailVerificationError,
  submitError,
  isSubmitting,
  handleInputChange,
  handleNext,
  handlePrevious,
  handleSubmit
}) {
  const stageLabels = {
    'idea': '🔍 Ý tưởng',
    'mvp': '🛠️ MVP',
    'customers': '👥 Có khách hàng',
    'growth': '📈 Tăng trưởng'
  };

  return (
    <div className={styles.formCard}>
      <div className={styles.cardHeader}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
        </div>
        <p className={styles.stepIndicator}>Step {currentStep} of {totalSteps}</p>
      </div>

      {/* BODY */}
      <div className={styles.cardBody}>
        {/* Email Verification Error Alert */}
        {emailVerificationError && (
          <div style={{
            padding: '12px 16px',
            background: '#FEE2E2',
            border: '1px solid #FCA5A5',
            borderRadius: '8px',
            marginBottom: '16px',
            color: '#991B1B',
            fontSize: '14px'
          }}>
            ⚠️ {emailVerificationError}
          </div>
        )}

        {/* Submit Error Alert */}
        {submitError && (
          <div style={{
            padding: '12px 16px',
            background: '#FEE2E2',
            border: '1px solid #FCA5A5',
            borderRadius: '8px',
            marginBottom: '16px',
            color: '#991B1B',
            fontSize: '14px'
          }}>
            ❌ {submitError}
          </div>
        )}

        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className={styles.stepContainer}>
            <div>
              <h2 className={styles.stepTitle}>1️ Thông tin cơ bản dự án</h2>
              <p className={styles.stepSubtitle}>Bắt đầu với những thông tin thiết yếu (Bước 1)</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Tên Dự án <span className={styles.required}>*</span></label>
              <input
                type="text"
                name="projectName"
                value={formData.projectName}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.projectName ? styles.inputError : ''}`}
                placeholder="Ví dụ: Smart Farm Management"
              />
              {errors.projectName && <p className={styles.errorText}>{errors.projectName}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Lĩnh vực <span className={styles.required}>*</span></label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                className={`${styles.select} ${errors.industry ? styles.inputError : ''}`}
              >
                <option value="">Chọn lĩnh vực</option>
                <option value="agriculture">Nông nghiệp</option>
                <option value="education">Giáo dục</option>
                <option value="technology">Công nghệ</option>
                <option value="social">Xã hội</option>
                <option value="healthcare">Y tế</option>
                <option value="fintech">Fintech</option>
                <option value="ecommerce">E-commerce</option>
                <option value="other">Khác</option>
              </select>
              {errors.industry && <p className={styles.errorText}>{errors.industry}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Địa phương triển khai <span className={styles.required}>*</span></label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.location ? styles.inputError : ''}`}
                placeholder="Ví dụ: Hồ Chí Minh, Mekong Delta"
              />
              {errors.location && <p className={styles.errorText}>{errors.location}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Giai đoạn hiện tại <span className={styles.required}>*</span></label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="stage"
                    value="idea"
                    checked={formData.stage === 'idea'}
                    onChange={handleInputChange}
                  />
                  ☐ Chỉ có ý tưởng
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="stage"
                    value="mvp"
                    checked={formData.stage === 'mvp'}
                    onChange={handleInputChange}
                  />
                  ☐ Đã có sản phẩm thử
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="stage"
                    value="customers"
                    checked={formData.stage === 'customers'}
                    onChange={handleInputChange}
                  />
                  ☐ Đã có khách hàng
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="stage"
                    value="growth"
                    checked={formData.stage === 'growth'}
                    onChange={handleInputChange}
                  />
                  ☐ Đang tăng trưởng
                </label>
              </div>
              {errors.stage && <p className={styles.errorText}>{errors.stage}</p>}
            </div>
          </div>
        )}

        {/* Step 2: Problem Statement */}
        {currentStep === 2 && (
          <div className={styles.stepContainer}>
            <div>
              <h2 className={styles.stepTitle}>2️ Vấn đề bạn muốn giải quyết</h2>
              <p className={styles.stepSubtitle}>Mô tả rõ vấn đề cốt lõi (Bước 2)</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Vấn đề bạn đang giải quyết là gì? <span className={styles.required}>*</span></label>
              <textarea
                name="problemDescription"
                value={formData.problemDescription}
                onChange={handleInputChange}
                className={`${styles.textarea} ${errors.problemDescription ? styles.inputError : ''}`}
                placeholder="Mô tả chi tiết vấn đề mà bạn phát hiện..."
                style={{ minHeight: '100px' }}
              />
              {errors.problemDescription && <p className={styles.errorText}>{errors.problemDescription}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Ai đang gặp vấn đề đó? <span className={styles.required}>*</span></label>
              <textarea
                name="problemAffects"
                value={formData.problemAffects}
                onChange={handleInputChange}
                className={`${styles.textarea} ${errors.problemAffects ? styles.inputError : ''}`}
                placeholder="Nhóm người hoặc loại doanh nghiệp gặp vấn đề này..."
                style={{ minHeight: '80px' }}
              />
              {errors.problemAffects && <p className={styles.errorText}>{errors.problemAffects}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Vấn đề này xảy ra thường xuyên không?</label>
              <textarea
                name="problemFrequency"
                value={formData.problemFrequency}
                onChange={handleInputChange}
                className={styles.textarea}
                placeholder="Ví dụ: Hàng ngày, hàng tuần, hàng tháng..."
                style={{ minHeight: '60px' }}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Hiện tại họ đang giải quyết bằng cách nào? <span className={styles.required}>*</span></label>
              <textarea
                name="currentSolution"
                value={formData.currentSolution}
                onChange={handleInputChange}
                className={`${styles.textarea} ${errors.currentSolution ? styles.inputError : ''}`}
                placeholder="Phương pháp, công cụ, hoặc cách làm hiện tại của họ..."
                style={{ minHeight: '100px' }}
              />
              {errors.currentSolution && <p className={styles.errorText}>{errors.currentSolution}</p>}
            </div>
          </div>
        )}

        {/* Step 3: Solution */}
        {currentStep === 3 && (
          <div className={styles.stepContainer}>
            <div>
              <h2 className={styles.stepTitle}>3️ Giải pháp của bạn</h2>
              <p className={styles.stepSubtitle}>Mô tả cách bạn giải quyết vấn đề (Bước 3)</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Bạn đề xuất giải pháp gì? <span className={styles.required}>*</span></label>
              <textarea
                name="proposedSolution"
                value={formData.proposedSolution}
                onChange={handleInputChange}
                className={`${styles.textarea} ${errors.proposedSolution ? styles.inputError : ''}`}
                placeholder="Mô tả chi tiết giải pháp, sản phẩm, hoặc dịch vụ của bạn..."
                style={{ minHeight: '120px' }}
              />
              {errors.proposedSolution && <p className={styles.errorText}>{errors.proposedSolution}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Giải pháp khác gì so với cách hiện tại? <span className={styles.required}>*</span></label>
              <textarea
                name="differentiator"
                value={formData.differentiator}
                onChange={handleInputChange}
                className={`${styles.textarea} ${errors.differentiator ? styles.inputError : ''}`}
                placeholder="Điểm nổi bật, lợi thế, hoặc cải tiến so với phương pháp hiện tại..."
                style={{ minHeight: '100px' }}
              />
              {errors.differentiator && <p className={styles.errorText}>{errors.differentiator}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Có thể bắt đầu nhỏ như thế nào? <span className={styles.required}>*</span></label>
              <textarea
                name="minimumViable"
                value={formData.minimumViable}
                onChange={handleInputChange}
                className={`${styles.textarea} ${errors.minimumViable ? styles.inputError : ''}`}
                placeholder="Mô tả MVP, bước đầu tiên, hoặc phiên bản tối giản có thể bắt đầu..."
                style={{ minHeight: '100px' }}
              />
              {errors.minimumViable && <p className={styles.errorText}>{errors.minimumViable}</p>}
            </div>
          </div>
        )}

        {/* Step 4: Market & Customers */}
        {currentStep === 4 && (
          <div className={styles.stepContainer}>
            <div>
              <h2 className={styles.stepTitle}>4️ Khách hàng & Thị trường</h2>
              <p className={styles.stepSubtitle}>Thông tin phụ thuộc vào giai đoạn (Bước 4)</p>
            </div>

            {/* For Idea Stage */}
            {formData.stage === 'idea' && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Bạn nghĩ ai sẽ mua? <span className={styles.required}>*</span></label>
                  <textarea
                    name="idealCustomerBuyer"
                    value={formData.idealCustomerBuyer}
                    onChange={handleInputChange}
                    className={`${styles.textarea} ${errors.idealCustomerBuyer ? styles.inputError : ''}`}
                    placeholder="Vẽ hình ảnh khách hàng lý tưởng của bạn..."
                    style={{ minHeight: '100px' }}
                  />
                  {errors.idealCustomerBuyer && <p className={styles.errorText}>{errors.idealCustomerBuyer}</p>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Họ sẵn sàng trả tiền không?</label>
                  <textarea
                    name="willPayFor"
                    value={formData.willPayFor}
                    onChange={handleInputChange}
                    className={styles.textarea}
                    placeholder="Dự kiến mức giá họ sẵn sàng trả là bao nhiêu?"
                    style={{ minHeight: '80px' }}
                  />
                </div>
              </>
            )}

            {/* For MVP, Customers, Growth Stages */}
            {['mvp', 'customers', 'growth'].includes(formData.stage) && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Bao nhiêu khách hàng? <span className={styles.required}>*</span></label>
                  <input
                    type="text"
                    name="customerCount"
                    value={formData.customerCount}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.customerCount ? styles.inputError : ''}`}
                    placeholder="Ví dụ: 50 khách hàng, 10k người dùng"
                  />
                  {errors.customerCount && <p className={styles.errorText}>{errors.customerCount}</p>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Doanh thu hiện tại <span className={styles.required}>*</span></label>
                  <input
                    type="text"
                    name="currentRevenue"
                    value={formData.currentRevenue}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.currentRevenue ? styles.inputError : ''}`}
                    placeholder="Ví dụ: $5k/tháng, $100k/năm"
                  />
                  {errors.currentRevenue && <p className={styles.errorText}>{errors.currentRevenue}</p>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Tốc độ tăng trưởng</label>
                  <textarea
                    name="growthRate"
                    value={formData.growthRate}
                    onChange={handleInputChange}
                    className={styles.textarea}
                    placeholder="Ví dụ: Tăng 20% MoM, tăng 3x trong năm qua"
                    style={{ minHeight: '80px' }}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 5: Revenue Model */}
        {currentStep === 5 && (
          <div className={styles.stepContainer}>
            <div>
              <h2 className={styles.stepTitle}>5️ Mô hình kiếm tiền</h2>
              <p className={styles.stepSubtitle}>Cách bạn tạo doanh thu (Bước 5)</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Bạn kiếm tiền bằng cách nào? <span className={styles.required}>*</span></label>
              <textarea
                name="revenueMethod"
                value={formData.revenueMethod}
                onChange={handleInputChange}
                className={`${styles.textarea} ${errors.revenueMethod ? styles.inputError : ''}`}
                placeholder="Mô tả chi tiết mô hình doanh thu, nguồn tiền của bạn..."
                style={{ minHeight: '100px' }}
              />
              {errors.revenueMethod && <p className={styles.errorText}>{errors.revenueMethod}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Loại doanh thu <span className={styles.required}>*</span></label>
              <select
                name="revenueType"
                value={formData.revenueType}
                onChange={handleInputChange}
                className={`${styles.select} ${errors.revenueType ? styles.inputError : ''}`}
              >
                <option value="">Chọn loại doanh thu</option>
                <option value="product">Bán sản phẩm</option>
                <option value="service">Thu phí dịch vụ (Subscription/SaaS)</option>
                <option value="commission">Hoa hồng (Commission)</option>
                <option value="hybrid">Kết hợp nhiều cách</option>
                <option value="other">Khác</option>
              </select>
              {errors.revenueType && <p className={styles.errorText}>{errors.revenueType}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Giá dự kiến <span className={styles.required}>*</span></label>
              <textarea
                name="pricingStrategy"
                value={formData.pricingStrategy}
                onChange={handleInputChange}
                className={`${styles.textarea} ${errors.pricingStrategy ? styles.inputError : ''}`}
                placeholder="Ví dụ: Free tier + Premium ($9.99/tháng), Pay-per-use, v.v..."
                style={{ minHeight: '100px' }}
              />
              {errors.pricingStrategy && <p className={styles.errorText}>{errors.pricingStrategy}</p>}
            </div>
          </div>
        )}

        {/* Step 6: Team */}
        {currentStep === 6 && (
          <div className={styles.stepContainer}>
            <div>
              <h2 className={styles.stepTitle}>6️ Đội ngũ</h2>
              <p className={styles.stepSubtitle}>Ai đang xây dựng dự án này? (Bước 6)</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Có bao nhiêu người tham gia? <span className={styles.required}>*</span></label>
              <input
                type="text"
                name="teamSize"
                value={formData.teamSize}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.teamSize ? styles.inputError : ''}`}
                placeholder="Ví dụ: 3 người, 10 người"
              />
              {errors.teamSize && <p className={styles.errorText}>{errors.teamSize}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Mỗi người phụ trách gì? <span className={styles.required}>*</span></label>
              <textarea
                name="teamRoles"
                value={formData.teamRoles}
                onChange={handleInputChange}
                className={`${styles.textarea} ${errors.teamRoles ? styles.inputError : ''}`}
                placeholder="Ví dụ: 
Jane (CEO) - Quản lý & Marketing
John (Tech Lead) - Backend Developer
Sarah (Designer) - UI/UX"
                style={{ minHeight: '120px' }}
              />
              {errors.teamRoles && <p className={styles.errorText}>{errors.teamRoles}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Làm full-time hay part-time? <span className={styles.required}>*</span></label>
              <select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleInputChange}
                className={`${styles.select} ${errors.employmentType ? styles.inputError : ''}`}
              >
                <option value="">Chọn loại hình làm việc</option>
                <option value="fulltime">Full-time toàn bộ</option>
                <option value="parttime">Part-time toàn bộ</option>
                <option value="mixed">Kết hợp (một số full-time, một số part-time)</option>
                <option value="other">Khác</option>
              </select>
              {errors.employmentType && <p className={styles.errorText}>{errors.employmentType}</p>}
            </div>

            <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', marginTop: '20px' }}>
              <p style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--text-primary)' }}>
                ✨ <strong>AI sẽ đánh giá:</strong>
                <br /> • Logic của mô hình doanh thu
                <br /> • Tính thực tế và khả thi
                <br /> • Khớp giữa vấn đề - giải pháp - thị trường
              </p>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className={styles.cardFooter}>
        <button
          onClick={handlePrevious}
          className={styles.secondaryButton}
          disabled={isSubmitting || currentStep === 1}
        >
          {currentStep === 1 ? 'Hủy' : (
            <>
              <ChevronLeft size={20} /> Quay lại
            </>
          )}
        </button>

        <button
          onClick={currentStep === totalSteps ? handleSubmit : handleNext}
          className={styles.primaryButton}
          disabled={isSubmitting}
          style={{
            opacity: isSubmitting ? 0.6 : 1,
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? (
            <>
              ⏳ Đang gửi...
            </>
          ) : currentStep === totalSteps ? (
            'Gửi dự án'
          ) : (
            <>
              Bước tiếp theo <ChevronRight size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
