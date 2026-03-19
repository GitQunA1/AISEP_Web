import React from 'react';
import { ChevronRight, ChevronLeft, AlertCircle, Sparkles, Upload, FileText, X } from 'lucide-react';
import styles from './FormContentSteps.module.css';

/**
 * FormContentSteps - Form content for 6 steps
 * Improved with professional styling and theme support.
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
  return (
    <div className={styles.formCard}>
      <div className={styles.cardHeader}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
        </div>
        <p className={styles.stepIndicator}>Bước {currentStep} trên {totalSteps}</p>
      </div>

      {/* BODY */}
      <div className={styles.cardBody}>
        {/* Error Alerts */}
        {emailVerificationError && (
          <div className={styles.errorBanner}>
            <AlertCircle size={18} />
            {emailVerificationError}
          </div>
        )}

        {submitError && (
          <div className={styles.errorBanner}>
            <AlertCircle size={18} />
            {submitError}
          </div>
        )}

        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className={styles.stepContainer}>
            <div>
              <h2 className={styles.stepTitle}>1. Thông tin cơ bản dự án</h2>
              <p className={styles.stepSubtitle}>Bắt đầu với những thông tin thiết yếu</p>
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
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="stage"
                    value="idea"
                    checked={formData.stage === 'idea'}
                    onChange={handleInputChange}
                  />
                  <span>Chỉ có ý tưởng</span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="stage"
                    value="mvp"
                    checked={formData.stage === 'mvp'}
                    onChange={handleInputChange}
                  />
                  <span>Đã có sản phẩm thử</span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="stage"
                    value="customers"
                    checked={formData.stage === 'customers'}
                    onChange={handleInputChange}
                  />
                  <span>Đã có khách hàng</span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="stage"
                    value="growth"
                    checked={formData.stage === 'growth'}
                    onChange={handleInputChange}
                  />
                  <span>Đang tăng trưởng</span>
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
              <h2 className={styles.stepTitle}>2. Vấn đề bạn muốn giải quyết</h2>
              <p className={styles.stepSubtitle}>Mô tả rõ vấn đề cốt lõi</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Vấn đề bạn đang giải quyết là gì? <span className={styles.required}>*</span></label>
              <textarea
                name="problemDescription"
                value={formData.problemDescription}
                onChange={handleInputChange}
                className={`${styles.textarea} ${errors.problemDescription ? styles.inputError : ''}`}
                placeholder="Mô tả chi tiết vấn đề mà bạn phát hiện..."
                rows={4}
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
                rows={3}
              />
              {errors.problemAffects && <p className={styles.errorText}>{errors.problemAffects}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Vấn đề này xảy ra thường xuyên không? <span className={styles.optional}>(Tùy chọn)</span>
              </label>
              <input
                type="text"
                name="problemFrequency"
                value={formData.problemFrequency}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Ví dụ: Hàng ngày, hàng tuần, hàng tháng..."
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
                rows={3}
              />
              {errors.currentSolution && <p className={styles.errorText}>{errors.currentSolution}</p>}
            </div>
          </div>
        )}

        {/* Step 3: Solution */}
        {currentStep === 3 && (
          <div className={styles.stepContainer}>
            <div>
              <h2 className={styles.stepTitle}>3. Giải pháp của bạn</h2>
              <p className={styles.stepSubtitle}>Mô tả cách bạn giải quyết vấn đề</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Bạn đề xuất giải pháp gì? <span className={styles.required}>*</span></label>
              <textarea
                name="proposedSolution"
                value={formData.proposedSolution}
                onChange={handleInputChange}
                className={`${styles.textarea} ${errors.proposedSolution ? styles.inputError : ''}`}
                placeholder="Mô tả chi tiết giải pháp, sản phẩm, hoặc dịch vụ của bạn..."
                rows={4}
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
                rows={3}
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
                rows={3}
              />
              {errors.minimumViable && <p className={styles.errorText}>{errors.minimumViable}</p>}
            </div>
          </div>
        )}

        {/* Step 4: Market & Customers */}
        {currentStep === 4 && (
          <div className={styles.stepContainer}>
            <div>
              <h2 className={styles.stepTitle}>4. Khách hàng & Thị trường</h2>
              <p className={styles.stepSubtitle}>Thông tin phụ thuộc vào giai đoạn</p>
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
                    rows={4}
                  />
                  {errors.idealCustomerBuyer && <p className={styles.errorText}>{errors.idealCustomerBuyer}</p>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Họ sẵn sàng trả tiền không? <span className={styles.optional}>(Tùy chọn)</span></label>
                  <textarea
                    name="willPayFor"
                    value={formData.willPayFor}
                    onChange={handleInputChange}
                    className={styles.textarea}
                    placeholder="Dự kiến mức giá họ sẵn sàng trả là bao nhiêu?"
                    rows={3}
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
                  <label className={styles.label}>
                    Doanh thu hiện tại {formData.stage === 'growth' ? <span className={styles.required}>*</span> : <span className={styles.optional}>(Tùy chọn)</span>}
                  </label>
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
                  <label className={styles.label}>Tốc độ tăng trưởng <span className={styles.optional}>(Tùy chọn)</span></label>
                  <textarea
                    name="growthRate"
                    value={formData.growthRate}
                    onChange={handleInputChange}
                    className={styles.textarea}
                    placeholder="Ví dụ: Tăng 20% MoM, tăng 3x trong năm qua"
                    rows={3}
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
              <h2 className={styles.stepTitle}>5. Mô hình kiếm tiền</h2>
              <p className={styles.stepSubtitle}>Cách bạn tạo doanh thu</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Bạn kiếm tiền bằng cách nào? {formData.stage === 'idea' ? <span className={styles.optional}>(Tùy chọn)</span> : <span className={styles.required}>*</span>}
              </label>
              <textarea
                name="revenueMethod"
                value={formData.revenueMethod}
                onChange={handleInputChange}
                className={`${styles.textarea} ${errors.revenueMethod ? styles.inputError : ''}`}
                placeholder="Mô tả chi tiết mô hình doanh thu, nguồn tiền của bạn..."
                rows={4}
              />
              {errors.revenueMethod && <p className={styles.errorText}>{errors.revenueMethod}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Loại doanh thu {formData.stage === 'idea' ? <span className={styles.optional}>(Tùy chọn)</span> : <span className={styles.required}>*</span>}
              </label>
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
              <label className={styles.label}>
                Giá dự kiến {formData.stage === 'idea' ? <span className={styles.optional}>(Tùy chọn)</span> : <span className={styles.required}>*</span>}
              </label>
              <textarea
                name="pricingStrategy"
                value={formData.pricingStrategy}
                onChange={handleInputChange}
                className={`${styles.textarea} ${errors.pricingStrategy ? styles.inputError : ''}`}
                placeholder="Ví dụ: Free tier + Premium ($9.99/tháng), Pay-per-use, v.v..."
                rows={3}
              />
              {errors.pricingStrategy && <p className={styles.errorText}>{errors.pricingStrategy}</p>}
            </div>
          </div>
        )}

        {/* Step 6: Team */}
        {currentStep === 6 && (
          <div className={styles.stepContainer}>
            <div>
              <h2 className={styles.stepTitle}>6. Đội ngũ</h2>
              <p className={styles.stepSubtitle}>Ai đang xây dựng dự án này?</p>
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
                placeholder="Ví dụ: Jane (CEO) - Quản lý, John (CTO) - Kỹ thuật..."
                rows={4}
              />
              {errors.teamRoles && <p className={styles.errorText}>{errors.teamRoles}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Làm full-time hay part-time? {formData.stage === 'idea' ? <span className={styles.optional}>(Tùy chọn)</span> : <span className={styles.required}>*</span>}
              </label>
              <select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleInputChange}
                className={`${styles.select} ${errors.employmentType ? styles.inputError : ''}`}
              >
                <option value="">Chọn loại hình làm việc</option>
                <option value="fulltime">Full-time toàn bộ</option>
                <option value="parttime">Part-time toàn bộ</option>
                <option value="mixed">Kết hợp</option>
                <option value="other">Khác</option>
              </select>
              {errors.employmentType && <p className={styles.errorText}>{errors.employmentType}</p>}
            </div>

            {formData.stage !== 'idea' && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Tài liệu dự án (Pitch Deck / Demo) <span className={styles.required}>*</span></label>
                <div className={styles.fileUploadArea}>
                  <label className={styles.fileInputLabel}>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        handleInputChange({ target: { name: 'documents', value: [...formData.documents, ...files] } });
                      }}
                      className={styles.hiddenInput}
                    />
                    <div className={styles.uploadPlaceholder}>
                      <Upload size={24} />
                      <span>Chọn file để tải lên</span>
                    </div>
                  </label>
                  {formData.documents && formData.documents.length > 0 && (
                    <div className={styles.fileList}>
                      {formData.documents.map((file, idx) => (
                        <div key={idx} className={styles.fileItem}>
                          <FileText size={18} />
                          <span className={styles.fileName}>{file.name}</span>
                          <button 
                            type="button" 
                            className={styles.removeFileBtn}
                            onClick={() => {
                              const newDocs = formData.documents.filter((_, i) => i !== idx);
                              handleInputChange({ target: { name: 'documents', value: newDocs } });
                            }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.documents && <p className={styles.errorText}>{errors.documents}</p>}
              </div>
            )}

            <div className={styles.hintBox}>
              <p className={styles.hintText}>
                <Sparkles size={18} className={styles.hintHighlight} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                <span className={styles.hintHighlight}>AI sẽ đánh giá:</span> Logic mô hình doanh thu, tính khả thi, và mức độ phù hợp giữa vấn đề - giải pháp - thị trường.
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
        >
          {isSubmitting ? (
            'Đang gửi...'
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
