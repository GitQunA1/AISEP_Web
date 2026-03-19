import React, { useState, useEffect } from 'react';
import projectSubmissionService from '../../services/projectSubmissionService';
import ReviewStartupInfoForm from './ReviewStartupInfoForm';
import FormContentSteps from './FormContentSteps';

/**
 * CompleteStartupInfoForm - Wizard style form for comprehensive startup profile
 * Implements BR-02 (email verification), BR-05 (required fields), BR-06 (validation)
 * Steps 1-6: Basic Info, Problem, Solution, Market, Revenue Model, Team
 */
export default function CompleteStartupInfoForm({ onSubmit, onCancel, onDirtyChange, user, initialData }) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    projectName: '',
    industry: '',
    location: '',
    stage: 'idea',
    
    // Step 2: Problem Statement
    problemDescription: '',
    problemAffects: '',
    problemFrequency: '',
    currentSolution: '',
    
    // Step 3: Solution
    proposedSolution: '',
    differentiator: '',
    minimumViable: '',
    
    // Step 4: Market & Customers
    idealCustomerBuyer: '',
    willPayFor: '',
    customerCount: '',
    currentRevenue: '',
    growthRate: '',
    
    // Step 5: Revenue Model
    revenueMethod: '',
    revenueType: '',
    pricingStrategy: '',
    
    // Step 6: Team
    teamSize: '',
    teamRoles: '',
    employmentType: '',
    
    // Documents
    documents: [],
  });

  const [errors, setErrors] = useState({});
  const [emailVerificationError, setEmailVerificationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isReviewMode, setIsReviewMode] = useState(false);

  // Pre-populate data if editing an existing profile
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        projectName: initialData.projectName || initialData.companyName || prev.projectName,
        industry: initialData.industry || prev.industry,
        location: initialData.countryCity || prev.location,
        stage: initialData.stage || prev.stage,
      }));
    }
  }, [initialData]);

  // Check for dirty state
  useEffect(() => {
    const isDirty = Object.values(formData).some(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.length > 0;
      return value !== null;
    });

    if (onDirtyChange) {
      onDirtyChange(isDirty);
    }
  }, [formData, onDirtyChange]); // Added formData to dependency

  // Reset fields when stage changes
  useEffect(() => {
    if (currentStep === 1) {
      setFormData(prev => ({
        ...prev,
        // Reset steps 2-6
        problemDescription: '',
        problemAffects: '',
        problemFrequency: '',
        currentSolution: '',
        proposedSolution: '',
        differentiator: '',
        minimumViable: '',
        idealCustomerBuyer: '',
        willPayFor: '',
        customerCount: '',
        currentRevenue: '',
        growthRate: '',
        revenueMethod: '',
        revenueType: '',
        pricingStrategy: '',
        teamSize: '',
        teamRoles: '',
        employmentType: '',
        documents: [],
      }));
      setErrors({});
    }
  }, [formData.stage]);

  // BR-02: Check email verification on component mount
  useEffect(() => {
    if (user && !user.emailVerified) {
      setEmailVerificationError(
        'Vui lòng xác minh địa chỉ email của bạn trước khi gửi dự án.'
      );
    }
  }, [user]);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // --- Validation ---
  const validateStep = () => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.projectName.trim()) newErrors.projectName = 'Tên dự án là bắt buộc';
      if (!formData.industry) newErrors.industry = 'Lĩnh vực là bắt buộc';
      if (!formData.location.trim()) newErrors.location = 'Địa phương triển khai là bắt buộc';
      if (!formData.stage) newErrors.stage = 'Giai đoạn hiện tại là bắt buộc';
    }

    if (currentStep === 2) {
      if (!formData.problemDescription.trim()) newErrors.problemDescription = 'Mô tả vấn đề là bắt buộc';
      if (!formData.problemAffects.trim()) newErrors.problemAffects = 'Vui lòng mô tả ai gặp vấn đề này';
      if (!formData.currentSolution.trim()) newErrors.currentSolution = 'Vui lòng mô tả giải pháp hiện tại';
    }

    if (currentStep === 3) {
      if (!formData.proposedSolution.trim()) newErrors.proposedSolution = 'Vui lòng mô tả giải pháp của bạn';
      if (!formData.differentiator.trim()) newErrors.differentiator = 'Vui lòng giải thích điểm khác biệt';
      if (!formData.minimumViable.trim()) newErrors.minimumViable = 'Vui lòng mô tả cách bắt đầu nhỏ';
    }

    if (currentStep === 4) {
      if (formData.stage === 'idea') {
        // Step 4 is mostly optional or simplified for Idea in FormContentSteps
        // But if displayed, we can add validation here
      } else if (['mvp', 'growth'].includes(formData.stage)) {
        if (!formData.customerCount.trim()) newErrors.customerCount = 'Vui lòng nhập số lượng khách hàng';
        if (!formData.currentRevenue.trim()) newErrors.currentRevenue = 'Vui lòng nhập doanh thu hiện tại';
        if (formData.stage === 'growth') {
          if (parseInt(formData.currentRevenue) <= 0) newErrors.currentRevenue = 'Doanh thu phải lớn hơn 0 cho giai đoạn Tăng trưởng';
        }
      }
    }

    if (currentStep === 5) {
      if (formData.stage !== 'idea') {
        if (!formData.revenueMethod.trim()) newErrors.revenueMethod = 'Vui lòng mô tả cách kiếm tiền';
        if (!formData.revenueType) newErrors.revenueType = 'Vui lòng chọn loại doanh thu';
        if (!formData.pricingStrategy.trim()) newErrors.pricingStrategy = 'Vui lòng mô tả chiến lược giá';
      }
    }

    if (currentStep === 6) {
      if (!formData.teamSize.trim()) newErrors.teamSize = 'Vui lòng nhập số lượng thành viên';
      if (!formData.teamRoles.trim()) newErrors.teamRoles = 'Vui lòng mô tả vai trò từng người';
      
      if (formData.stage !== 'idea') {
        if (!formData.employmentType) newErrors.employmentType = 'Vui lòng chọn loại hình làm việc';
        if (formData.documents.length === 0) {
          newErrors.documents = 'Vui lòng đính kèm ít nhất một tài liệu (Pitch Deck hoặc Demo)';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    setSubmitError('');
    if (validateStep()) setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handlePrevious = () => {
    setSubmitError('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (user && !user.emailVerified) {
      setEmailVerificationError('Vui lòng xác minh địa chỉ email của bạn trước khi gửi dự án.');
      return;
    }

    if (!validateStep()) return;

    setIsSubmitting(true);
    try {
      const { documents, ...payload } = formData;
      const response = await projectSubmissionService.submitStartupInfo(payload);
      
      if (response && (response.isSuccess || response.success)) {
        // If there are files to upload, handle them separately
        if (documents && documents.length > 0) {
          const pId = response.data?.projectId || response.data?.id;
          if (pId) {
            const uploadPromises = documents.map(file => 
              projectSubmissionService.uploadDocument(pId, file)
            );
            await Promise.all(uploadPromises);
          }
        }
        setIsReviewMode(true);
      } else {
        setSubmitError(response?.message || 'Lỗi khi gửi dự án. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error submitting project:', error);
      setSubmitError(error?.message || 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    isReviewMode ? (
      <ReviewStartupInfoForm
        formData={formData}
        user={user}
        onEdit={() => setIsReviewMode(false)}
        onConfirm={(data) => {
          setIsReviewMode(false);
          if (onSubmit) {
            onSubmit(data);
          }
        }}
      />
    ) : (
      <FormContentSteps
        currentStep={currentStep}
        totalSteps={totalSteps}
        formData={formData}
        errors={errors}
        emailVerificationError={emailVerificationError}
        submitError={submitError}
        isSubmitting={isSubmitting}
        handleInputChange={handleInputChange}
        handleNext={handleNext}
        handlePrevious={handlePrevious}
        handleSubmit={handleSubmit}
      />
    )
  );
}
