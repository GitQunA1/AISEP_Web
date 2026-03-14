import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';

/**
 * ProjectSelectorModal - Modal to select a project for document upload
 */
export default function ProjectSelectorModal({ projects, onSelect, onCancel, isLoading }) {
    const [selectedProjectId, setSelectedProjectId] = useState(null);

    const handleSelect = () => {
        if (!selectedProjectId) return;
        const selected = projects.find(p => (p.id === selectedProjectId || p.projectId === selectedProjectId));
        if (selected) {
            onSelect(selected);
        }
    };

    const isProjectSelected = (project) => {
        // Rõ ràng: chỉ return true nếu selectedProjectId khớp với ID của project
        return selectedProjectId !== null && (selectedProjectId === project.id || selectedProjectId === project.projectId);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '550px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                overflow: 'hidden',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '24px',
                    borderBottom: '2px solid #e5e7eb',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #fafbfc 100%)'
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                            Chọn dự án để tải tài liệu
                        </h2>
                        <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                            {projects.length} dự án có sẵn
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px'
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#1f2937'}
                        onMouseLeave={(e) => e.target.style.color = '#6b7280'}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* List */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px'
                }}>
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
                            <div style={{ fontSize: '14px', marginBottom: '12px' }}>Đang tải dự án...</div>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                border: '3px solid #e5e7eb',
                                borderTop: '3px solid #3b82f6',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                margin: '0 auto'
                            }} />
                        </div>
                    ) : projects.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
                            <div style={{ fontSize: '14px' }}>
                                Bạn chưa có dự án nào. <br /> Vui lòng tạo dự án trước.
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {projects.map((project) => {
                                const selected = isProjectSelected(project);
                                return (
                                    <div
                                        key={project.id || project.projectId}
                                        onClick={() => setSelectedProjectId(project.id || project.projectId)}
                                        style={{
                                            padding: '16px',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            background: selected 
                                                ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' 
                                                : '#ffffff',
                                            transition: 'all 0.3s ease',
                                            boxShadow: selected 
                                                ? '0 4px 12px rgba(59, 130, 246, 0.15)' 
                                                : 'none',
                                            transform: selected ? 'scale(1.02)' : 'scale(1)',
                                            borderColor: selected ? '#3b82f6' : '#e5e7eb',
                                            borderWidth: selected ? '2px' : '1px',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!selected) {
                                                e.currentTarget.style.background = '#ffffff';
                                                e.currentTarget.style.borderColor = '#e5e7eb';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!selected) {
                                                e.currentTarget.style.background = '#ffffff';
                                                e.currentTarget.style.borderColor = '#e5e7eb';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                                            {/* Radio Circle - chỉ hiển thị khi selected */}
                                            {selected && (
                                                <div style={{
                                                    minWidth: '28px',
                                                    height: '28px',
                                                    borderRadius: '50%',
                                                    background: '#3b82f6',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginTop: '2px',
                                                    position: 'relative',
                                                    transition: 'all 0.3s ease'
                                                }}>
                                                    <CheckCircle2 size={28} color="#ffffff" fill="#3b82f6" />
                                                </div>
                                            )}

                                            {/* Content */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    fontSize: '15px',
                                                    fontWeight: selected ? '700' : '600',
                                                    color: selected ? '#1e40af' : '#1f2937',
                                                    marginBottom: '6px',
                                                    transition: 'color 0.3s ease'
                                                }}>
                                                    {project.projectName || project.name}
                                                </div>
                                                <div style={{
                                                    fontSize: '13px',
                                                    color: '#6b7280',
                                                    marginBottom: '6px',
                                                    lineHeight: '1.4',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical'
                                                }}>
                                                    {project.shortDescription || project.description || 'Không có mô tả'}
                                                </div>
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: selected ? '#1e40af' : '#9ca3af',
                                                    fontWeight: '500',
                                                    backgroundColor: selected ? '#dbeafe' : '#f3f4f6',
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    display: 'inline-block',
                                                    transition: 'all 0.3s ease'
                                                }}>
                                                    ID: {project.id || project.projectId}
                                                </div>
                                            </div>

                                            {/* Selected Indicator - chỉ hiển thị khi selected */}
                                            {selected && (
                                                <div style={{
                                                    background: '#10b981',
                                                    color: 'white',
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    ✓ Đã chọn
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '20px',
                    borderTop: '2px solid #e5e7eb',
                    background: '#fafbfc'
                }}>
                    <button
                        onClick={onCancel}
                        style={{
                            flex: 1,
                            padding: '12px 16px',
                            background: '#f3f4f6',
                            border: '1.5px solid #d1d5db',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                            color: '#374151',
                            transition: 'all 0.2s',
                            textDecoration: 'none'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#e5e7eb';
                            e.currentTarget.style.borderColor = '#9ca3af';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f3f4f6';
                            e.currentTarget.style.borderColor = '#d1d5db';
                        }}
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSelect}
                        disabled={selectedProjectId === null || projects.length === 0}
                        style={{
                            flex: 1,
                            padding: '12px 16px',
                            background: selectedProjectId === null || projects.length === 0 
                                ? '#9ca3af' 
                                : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: selectedProjectId === null || projects.length === 0 ? 'not-allowed' : 'pointer',
                            fontWeight: '700',
                            fontSize: '14px',
                            color: 'white',
                            transition: 'all 0.3s',
                            opacity: selectedProjectId === null || projects.length === 0 ? 0.5 : 1,
                            boxShadow: selectedProjectId === null || projects.length === 0 
                                ? 'none' 
                                : '0 4px 12px rgba(59, 130, 246, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                            if (selectedProjectId !== null && projects.length > 0) {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.4)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (selectedProjectId !== null && projects.length > 0) {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }
                        }}
                    >
                        Chọn dự án
                    </button>
                </div>

                <style>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>
    );
}
