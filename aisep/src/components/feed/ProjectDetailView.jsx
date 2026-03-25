import React, { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, ClipboardList, TrendingUp, Sword, FolderOpen, Users } from 'lucide-react';
import projectSubmissionService from '../../services/projectSubmissionService';
import AIEvaluationService from '../../services/AIEvaluationService';

/* ─── Design tokens (hardcoded to guarantee correct rendering) ─── */
const T = {
  bg: 'var(--pd-bg)',
  surface: 'var(--pd-surface)',
  card: 'var(--pd-card)',
  surface2: 'var(--pd-card)',
  surface3: 'var(--pd-surface-accent)',
  border: 'var(--pd-border)',
  blue: 'var(--pd-blue)',
  blueDim: 'var(--pd-blue-dim)',
  text: 'var(--pd-text)',
  textMuted: 'var(--pd-text-muted)',
  textDim: 'var(--pd-text-dim)',
  green: 'var(--pd-green)',
  greenDim: 'var(--pd-green-dim)',
  shadow: 'var(--pd-shadow)',
  amber: '#ffad1f',
  amberDim: 'rgba(255, 173, 31, 0.12)',
  red: '#f4212e',
};

/* ─── Helpers ─────────────────────────────────────────────── */
const DISP = (v, fb = 'Đang cập nhật') => (v && String(v).trim() ? v : fb);
const FMT = v => v ? Number(v).toLocaleString('vi-VN') + ' VND' : '—';

const avatarGrad = tag => {
  const t = (tag || '').toLowerCase();
  if (t.includes('fintech') || t.includes('blockchain')) return `linear-gradient(135deg,${T.blue},${T.green})`;
  if (t.includes('agri') || t.includes('iot')) return `linear-gradient(135deg,${T.green},#009960)`;
  if (t.includes('ai') || t.includes('saas')) return 'linear-gradient(135deg,#7c3aed,#2D7EFF)';
  return `linear-gradient(135deg,${T.blue},${T.green})`;
};

const stageChip = stage => {
  const s = (stage || '').toLowerCase();
  if (s.includes('mvp') || s.includes('prototype'))
    return { bg: T.blueDim, color: T.blue, border: `1px solid rgba(45,126,255,.2)` };
  if (s.includes('growth'))
    return { bg: T.greenDim, color: T.green, border: `1px solid rgba(0,186,124,.2)` };
  return { bg: T.amberDim, color: T.amber, border: 'none' };
};

/* ─── Primitive components ──────────────────────────────── */
const SectionCard = ({ children, style }) => (
  <div style={{
    background: T.surface2,
    border: `1px solid ${T.border}`,
    borderRadius: 14,
    overflow: 'hidden',
    boxShadow: 'var(--pd-shadow)',
    ...style,
  }}>
    {children}
  </div>
);

const SectionHeader = ({ children }) => (
  <div style={{
    padding: '11px 16px',
    borderBottom: `1px solid ${T.border}`,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  }}>
    <span style={{
      fontSize: 12.5,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '.07em',
      color: T.blue,
    }}>
      {children}
    </span>
  </div>
);

const SectionBody = ({ children, style }) => (
  <div style={{ padding: '14px 16px', ...style }}>
    {children}
  </div>
);

const Field = ({ label, children, accent, green, full, style }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, gridColumn: full ? '1 / -1' : 'auto', ...style }}>
    <div style={{
      fontSize: 10.5,
      fontWeight: 700,
      letterSpacing: '.07em',
      textTransform: 'uppercase',
      color: T.textDim,
    }}>
      {label}
    </div>
    <div style={{
      fontSize: 13.5,
      lineHeight: 1.55,
      color: accent ? T.blue : green ? T.green : T.text,
      fontFamily: (accent || green) ? "'IBM Plex Mono', monospace" : "'IBM Plex Sans', sans-serif",
      fontWeight: (accent || green) ? 600 : 400,
    }}>
      {children}
    </div>
  </div>
);

const FieldGrid = ({ children, cols = 2 }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: '14px 18px',
  }}>
    {children}
  </div>
);

const Divider = () => (
  <div style={{ height: 1, background: T.border, margin: '4px 0' }} />
);

/* ─── Mobile Document Card ──────────────────────────────── */
const MobileDocCard = ({ doc }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 0',
    borderBottom: `1px solid ${T.border}`,
  }}>
    {/* Icon */}
    <span style={{ fontSize: 22, flexShrink: 0 }}>📄</span>

    {/* Info */}
    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
      <div style={{
        fontSize: 13,
        fontWeight: 600,
        color: T.text,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        width: '100%',
      }} title={doc.fullName || doc.name}>
        {doc.name}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11.5, color: T.textMuted }}>{doc.type}</span>
        <span style={{ fontSize: 11, color: T.textDim }}>·</span>
        <span style={{ fontSize: 11.5, color: T.textMuted }}>{doc.date}</span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 3,
          fontSize: 11, fontWeight: 700, color: T.green,
        }}>
          ⬡ Blockchain
        </span>
      </div>
    </div>

    {/* Open button */}
    <button
      onClick={() => doc.url && window.open(doc.url, '_blank')}
      title="Mở tài liệu"
      style={{
        width: 34, height: 34, borderRadius: 8, flexShrink: 0,
        border: `1px solid ${T.border}`,
        background: T.surface2,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', fontSize: 15, color: T.textMuted,
      }}
    >
      ↗
    </button>
  </div>
);

/* ─── Main Component ─────────────────────────────────────── */
export default function ProjectDetailView({ projectId, onBack }) {
  const [project, setProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [aiHistory, setAiHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 850);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 850);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true); setError(null);
    Promise.all([
      projectSubmissionService.getProjectById(projectId),
      projectSubmissionService.getDocuments(projectId).catch(() => null),
      AIEvaluationService.getProjectAnalysisHistory(projectId).catch(() => null),
    ]).then(([pRes, dRes, aRes]) => {
      if (pRes?.success && pRes?.data) {
        const d = pRes.data;
        setProject({
          ...d,
          name: d.projectName || 'Dự án',
          stage: d.developmentStage || 'Ý tưởng',
          status: d.status || 'Pending',
          tags: d.keySkills ? d.keySkills.split(',').map(s => s.trim()).filter(Boolean) : [],
        });
      } else {
        setError('Không tìm thấy thông tin dự án.');
      }
      const rawDocs = dRes?.data?.items ?? (Array.isArray(dRes?.data) ? dRes?.data : []);
      const truncateName = (name, max = 28) => {
        if (!name || name.length <= max) return name;
        const ext = name.includes('.') ? '.' + name.split('.').pop() : '';
        const base = name.slice(0, name.length - ext.length);
        return base.slice(0, max - ext.length - 1) + '…' + ext;
      };
      setDocuments(rawDocs.map(doc => ({
        id: doc.documentId,
        name: truncateName(doc.fileName || doc.documentType),
        fullName: doc.fileName || doc.documentType,
        type: doc.documentType,
        date: new Date(doc.verifiedAt || doc.uploadedAt || new Date()).toLocaleDateString('vi-VN'),
        url: doc.fileUrl,
      })));
      setAiHistory(aRes?.data || []);
    }).catch(err => setError(err?.message || 'Lỗi khi tải dự án.'))
      .finally(() => setLoading(false));
  }, [projectId]);

  /* ── Loading state ── */
  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flex: 1, width: '100%', background: T.bg, minHeight: '400px'
    }}>
      <Loader2 size={28} style={{ color: T.blue, animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  /* ── Error state ── */
  if (error || !project) return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', flex: 1, width: '100%', gap: 16,
      color: T.textMuted, background: T.bg, minHeight: '400px'
    }}>
      <span style={{ fontSize: 42 }}>⚠️</span>
      <div style={{ fontSize: 14 }}>{error || 'Dự án không tồn tại.'}</div>
      <button
        onClick={onBack}
        style={{
          padding: '8px 22px', borderRadius: 9999,
          background: T.surface2, border: `1px solid ${T.border}`,
          color: T.text, cursor: 'pointer', fontSize: 13,
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}
      >
        ← Quay lại
      </button>
    </div>
  );

  /* ── Derived values ── */
  const chip = stageChip(project.stage);
  const letter = project.name.charAt(0).toUpperCase();
  const mainTag = project.tags[0] || '';
  const approved = ['approved', 'Approved'].includes(project.status);
  const latestAI = aiHistory.length > 0
    ? (aiHistory[0].potentialScore ?? aiHistory[0].startupScore ?? null)
    : null;

  return (
    <div className="project-detail-view" style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      flex: 1,
      minHeight: '100%',
      fontFamily: "'IBM Plex Sans', sans-serif",
      background: T.bg
    }}>
      <style>{`
        .project-detail-view {
          --pd-bg: var(--bg-primary);
          --pd-surface: #ffffff;
          --pd-card: #ffffff;
          --pd-surface-accent: #f8fafc;
          --pd-border: rgba(0, 0, 0, 0.08);
          --pd-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          --pd-text: var(--text-primary);
          --pd-text-muted: var(--text-secondary);
          --pd-text-dim: #64748b;
          --pd-blue: var(--primary-blue);
          --pd-blue-dim: rgba(29, 155, 240, 0.1);
          --pd-green: #10b981;
          --pd-green-dim: rgba(16, 185, 129, 0.1);
          --pd-topbar: rgba(255, 255, 255, 0.7);
          --pd-cover-bg: linear-gradient(135deg, #e0f2fe 0%, #ecfdf5 50%, #f5f3ff 100%);
          --pd-cover-overlay: radial-gradient(ellipse at 30% 50%, rgba(45, 126, 255, 0.1) 0%, transparent 60%),
                            radial-gradient(ellipse at 70% 50%, rgba(0, 186, 124, 0.08) 0%, transparent 60%);
        }
        [data-theme='dark'] .project-detail-view {
          --pd-surface: #090a0f;
          --pd-card: #11131a;
          --pd-surface-accent: #181b24;
          --pd-border: rgba(255, 255, 255, 0.05);
          --pd-shadow: 0 8px 32px rgba(0,0,0,0.3);
          --pd-text-dim: rgba(113, 121, 138, 0.7);
          --pd-green: #17bf63;
          --pd-topbar: rgba(15, 20, 25, 0.7);
          --pd-cover-bg: linear-gradient(135deg, #0d2040 0%, #0a3020 50%, #1a0d38 100%);
          --pd-cover-overlay: radial-gradient(ellipse at 30% 50%, rgba(45, 126, 255, 0.18) 0%, transparent 60%),
                            radial-gradient(ellipse at 70% 50%, rgba(0, 186, 124, 0.12) 0%, transparent 60%);
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* ════════════════════════
          STICKY TOPBAR
          ════════════════════════ */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        minHeight: 53, height: 53,
        background: 'var(--pd-topbar)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${T.border}`,
        padding: '0 16px',
        display: 'flex', alignItems: 'center', gap: 16,
        marginBottom: -53,
        top: isMobile ? 60 : 0,
      }}>
        <button
          onClick={onBack}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: T.text, flexShrink: 0,
            background: 'transparent', border: 'none',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          title="Quay lại"
        >
          <ArrowLeft size={20} />
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{
            fontSize: 19, fontWeight: 800, color: T.text, margin: 0,
            lineHeight: 1.2, letterSpacing: '-0.2px',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
          }}>
            {project.name}
          </h2>
          <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1 }}>Chi tiết dự án</div>
        </div>

        {approved && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 12px', borderRadius: 9999,
            fontSize: 12, fontWeight: 700,
            background: T.greenDim, color: T.green,
            border: '1px solid rgba(0,186,124,0.25)',
            flexShrink: 0, whiteSpace: 'nowrap',
          }}>
            ✓ Đã được duyệt
          </span>
        )}
      </div>

      {/* ════════════════════════
          COVER BANNER
          ════════════════════════ */}
      <div style={{
        height: 160,
        background: 'var(--pd-cover-bg)',
        borderBottom: `1px solid ${T.border}`,
        position: 'relative', overflow: 'hidden', flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'var(--pd-cover-overlay)',
        }} />
      </div>

      {/* ════════════════════════
          PROFILE CARD
          ════════════════════════ */}
      <div style={{
        margin: '0 20px',
        marginTop: -48,
        position: 'relative', zIndex: 1,
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 20,
        padding: 20,
        display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap',
        boxShadow: T.shadow,
      }}>
        <div style={{
          width: 68, height: 68, borderRadius: '50%',
          background: avatarGrad(mainTag),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 24, color: '#fff',
          border: `3px solid ${T.card}`,
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {letter}
        </div>

        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 5 }}>
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.3px', color: T.text }}>
              {project.name}
            </span>
          </div>
          <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.55 }}>
            {project.description}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {project.tags.map((t, i) => (
              <span key={i} style={{ fontSize: 13, color: T.blue, fontWeight: 500 }}>#{t}</span>
            ))}
          </div>
        </div>

        <div style={{
          width: '100%',
          display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          borderTop: `1px solid ${T.border}`,
          marginTop: 16,
          paddingTop: 16,
        }}>
          {[
            { icon: '💵', val: project.revenue ? Number(project.revenue).toLocaleString('vi-VN') + ' VND' : '—', lbl: 'Doanh thu', color: T.blue },
            { icon: '📊', val: project.marketSize ? Number(project.marketSize).toLocaleString('vi-VN') + ' VND' : '—', lbl: 'Quy mô thị trường', color: T.green },
            { icon: '⚡', val: latestAI != null ? String(latestAI) : 'Chưa có', lbl: 'Điểm AI', color: latestAI != null ? T.amber : T.textDim },
          ].map((k, i, arr) => (
            <div key={i} style={{
              textAlign: 'center',
              borderRight: (!isMobile && i < arr.length - 1) ? `1px solid ${T.border}` : 'none',
              borderBottom: (isMobile && i < arr.length - 1) ? `1px solid ${T.border}` : 'none',
              padding: isMobile ? '12px 10px' : '0 10px',
            }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{k.icon}</div>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 17, fontWeight: 700, color: k.color,
              }}>
                {k.val}
              </div>
              <div style={{
                fontSize: 11, color: T.textMuted,
                marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.5px'
              }}>
                {k.lbl}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════
          MAIN CONTENT — 2 columns
          ════════════════════════ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '38% 62%',
        padding: isMobile ? '24px 16px 32px' : '36px 24px 32px',
        gap: 0,
      }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 14,
          paddingRight: isMobile ? 0 : 20,
          borderRight: isMobile ? 'none' : `1px solid ${T.border}`,
        }}>

          {/* 1 · Thông tin cơ bản */}
          <SectionCard>
            <SectionHeader><ClipboardList size={14} style={{ color: T.blue }} /> Thông tin cơ bản</SectionHeader>
            <SectionBody>
              <FieldGrid>
                <Field label="Mô tả ngắn" full>
                  {DISP(project.shortDescription)}
                </Field>
                <Field label="Giai đoạn phát triển" full>
                  <span style={{
                    display: 'inline-block',
                    background: chip.bg, color: chip.color, border: chip.border,
                    padding: '3px 10px', borderRadius: 5,
                    fontSize: 12, fontWeight: 700,
                  }}>
                    📈 {project.stage}
                  </span>
                </Field>
                <Field label="Vấn đề cần giải quyết">
                  {DISP(project.problemStatement)}
                </Field>
                <Field label="Giải pháp đề xuất">
                  {DISP(project.solutionDescription)}
                </Field>
              </FieldGrid>
            </SectionBody>
          </SectionCard>

          {/* 2 · Đội ngũ */}
          <SectionCard>
            <SectionHeader><Users size={14} style={{ color: '#7c3aed' }} /> Đội ngũ</SectionHeader>
            <SectionBody>
              <div style={{
                fontSize: 10.5, fontWeight: 700, letterSpacing: '.07em',
                textTransform: 'uppercase', color: T.textDim, marginBottom: 10,
              }}>
                Thành viên &amp; Vai trò
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {project.teamMembers
                  ? project.teamMembers.split(',').map((m, i, arr) => {
                    const parts = m.split('-');
                    const name = parts[0]?.trim() || 'Thành viên';
                    const role = parts.slice(1).join('-').trim() || 'Thành viên cốt lõi';
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 0',
                        borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : 'none',
                      }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: `linear-gradient(135deg,${T.blue},#5BA8FF)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 13, color: '#fff', flexShrink: 0,
                        }}>
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text }}>{name}</div>
                          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 1 }}>{role}</div>
                        </div>
                      </div>
                    );
                  })
                  : (
                    <div style={{ fontSize: 13.5, color: T.textMuted, padding: '8px 0' }}>
                      Đang cập nhật
                    </div>
                  )
                }
              </div>

              {project.keySkills && (
                <>
                  <Divider />
                  <Field label="Kỹ năng cốt lõi" style={{ marginTop: 10 }}>
                    {DISP(project.keySkills)}
                  </Field>
                </>
              )}
            </SectionBody>
          </SectionCard>

          {/* AI History Card */}
          <div style={{
            padding: '16px 20px',
            background: T.card,
            border: `1px solid ${T.border}`,
            borderRadius: 16,
            display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: T.shadow,
          }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>⚡</span>
            <div style={{ flex: 1, fontSize: 13, color: T.textMuted, lineHeight: 1.5 }}>
              <strong style={{ color: T.text, fontWeight: 700, fontSize: 13.5 }}>Lịch sử đánh giá AI</strong><br />
              {aiHistory.length > 0
                ? `Cập nhật lần cuối: ${new Date(aiHistory[0].evaluationDate || new Date()).toLocaleDateString('vi-VN')}`
                : 'Chưa có dữ liệu đánh giá'}
            </div>
            {latestAI != null && (
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 20, fontWeight: 700, color: T.amber, flexShrink: 0,
              }}>
                {latestAI}
              </div>
            )}
          </div>

        </div>{/* /left col */}

        {/* Mobile divider */}
        {isMobile && (
          <div style={{
            height: 1,
            background: 'rgba(100,116,139,0.2)',
            margin: '20px 0',
          }} />
        )}

        {/* ── RIGHT COLUMN ── */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 14,
          paddingLeft: isMobile ? 0 : 20,
        }}>

          {/* 3 · Thị trường & Mô hình */}
          <SectionCard>
            <SectionHeader><TrendingUp size={14} style={{ color: T.green }} /> Thị trường &amp; Mô hình</SectionHeader>
            <SectionBody>
              <FieldGrid>
                <Field label="Khách hàng mục tiêu">
                  {DISP(project.targetCustomers)}
                </Field>
                <Field label="Giá trị độc đáo (UVP)">
                  {DISP(project.uniqueValueProposition)}
                </Field>
                <Field label="Quy mô thị trường" accent>
                  {FMT(project.marketSize)}
                </Field>
                <Field label="Doanh thu" accent>
                  {FMT(project.revenue)}
                </Field>
                <Field label="Mô hình kinh doanh" full>
                  {DISP(project.businessModel)}
                </Field>
              </FieldGrid>
            </SectionBody>
          </SectionCard>

          {/* 4 · Cạnh tranh */}
          <SectionCard>
            <SectionHeader><Sword size={14} style={{ color: '#ff4b2b' }} /> Cạnh tranh</SectionHeader>
            <SectionBody>
              <FieldGrid>
                <Field label="Kinh nghiệm đội ngũ">
                  {DISP(project.teamExperience)}
                </Field>
                <Field label="Đối thủ cạnh tranh">
                  {DISP(project.competitors)}
                </Field>
              </FieldGrid>
            </SectionBody>
          </SectionCard>

          {/* 5 · Tài liệu */}
          <SectionCard>
            <SectionHeader><FolderOpen size={14} style={{ color: T.amber }} /> Tài liệu dự án</SectionHeader>
            <SectionBody style={{ padding: documents.length > 0 ? '0 16px' : '14px 16px' }}>
              {documents.length > 0 ? (
                isMobile ? (
                  /* ── Mobile: card list ── */
                  <div>
                    {documents.map((doc, i) => (
                      <MobileDocCard key={i} doc={doc} />
                    ))}
                    {/* Remove the bottom border on the last item */}
                    <style>{`.mobile-doc-card:last-child { border-bottom: none !important; }`}</style>
                  </div>
                ) : (
                  /* ── Desktop: full table ── */
                  <div style={{
                    background: T.surface3,
                    border: `1px solid ${T.border}`,
                    borderRadius: 10,
                    overflow: 'hidden',
                    margin: '14px 0',
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: T.surface3 }}>
                          {['Tên tài liệu', 'Loại', 'Ngày tải', 'Xác thực', 'Xem'].map((h, i) => (
                            <th key={i} style={{
                              textAlign: i === 4 ? 'center' : 'left',
                              padding: '9px 14px',
                              fontSize: 10.5, fontWeight: 700, letterSpacing: '.07em',
                              textTransform: 'uppercase', color: T.textDim,
                              borderBottom: `1px solid ${T.border}`,
                              whiteSpace: 'nowrap',
                            }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map((doc, i) => (
                          <tr
                            key={i}
                            style={{ transition: 'background .15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '11px 14px', borderBottom: `1px solid ${T.border}`, verticalAlign: 'middle' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.text, fontWeight: 600, fontSize: 13.5 }}>
                                <span style={{ color: T.textMuted, fontSize: 15, flexShrink: 0 }}>📄</span>
                                <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {doc.name}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: '11px 14px', fontSize: 13, color: T.textMuted, borderBottom: `1px solid ${T.border}`, verticalAlign: 'middle' }}>
                              {doc.type}
                            </td>
                            <td style={{ padding: '11px 14px', fontSize: 13, color: T.textMuted, borderBottom: `1px solid ${T.border}`, verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                              {doc.date}
                            </td>
                            <td style={{ padding: '11px 14px', borderBottom: `1px solid ${T.border}`, verticalAlign: 'middle' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 700, color: T.green }}>
                                ⬡ Blockchain
                              </span>
                            </td>
                            <td style={{ padding: '11px 14px', borderBottom: `1px solid ${T.border}`, verticalAlign: 'middle', textAlign: 'center' }}>
                              <button
                                onClick={() => doc.url && window.open(doc.url, '_blank')}
                                title="Mở tài liệu"
                                style={{
                                  width: 30, height: 30, borderRadius: 7,
                                  border: `1px solid ${T.border}`,
                                  background: T.surface2,
                                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                  cursor: 'pointer', fontSize: 13, color: T.textMuted,
                                  transition: 'all .15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = T.blue; e.currentTarget.style.color = T.blue; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted; }}
                              >
                                ↗
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                <div style={{
                  padding: '28px 0', textAlign: 'center',
                  color: T.textMuted, fontSize: 13.5,
                }}>
                  Chưa có tài liệu đính kèm
                </div>
              )}
            </SectionBody>
          </SectionCard>

        </div>{/* /right col */}
      </div>{/* /grid */}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}