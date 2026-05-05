import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

/**
 * Radar so sánh % đạt được trên Max từng tiêu chí: Khai báo (base) vs Thực tế AI (final).
 */
export default function AIAnalysisRadarChart({ auditedItems, labelMapper = (c) => c }) {
  const rows = React.useMemo(() => {
    if (!Array.isArray(auditedItems) || auditedItems.length === 0) return [];
    return auditedItems.map((row) => {
      const max = Number(row.maxScore ?? row.MaxScore ?? 1) || 1;
      const base = Number(row.baseScore ?? row.BaseScore ?? 0);
      const fin = Number(row.finalScore ?? row.FinalScore ?? 0);
      const crit = row.criteria ?? row.Criteria ?? '';
      return {
        criterion: labelMapper(crit),
        declaredPct: Math.min(100, Math.max(0, Math.round((base / max) * 100))),
        auditedPct: Math.min(100, Math.max(0, Math.round((fin / max) * 100))),
      };
    });
  }, [auditedItems, labelMapper]);

  if (rows.length === 0) return null;

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="52%" outerRadius="72%" data={rows}>
          <PolarGrid stroke="var(--border-color, #e5e7eb)" />
          <PolarAngleAxis dataKey="criterion" tick={{ fill: 'var(--text-secondary, #6b7280)', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: '1px solid var(--border-color, #e5e7eb)',
              fontSize: 12,
            }}
            formatter={(value, name) => [`${value}%`, name]}
          />
          <Radar
            name="Mức độ Khai báo"
            dataKey="declaredPct"
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="6 4"
            fill="rgba(148, 163, 184, 0.12)"
            dot={{ r: 3 }}
          />
          <Radar
            name="Thực tế AI Kiểm toán"
            dataKey="auditedPct"
            stroke="var(--primary-blue, #0066ff)"
            strokeWidth={2}
            fill="var(--primary-blue, #0066ff)"
            fillOpacity={0.35}
            dot={{ r: 4 }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8, color: 'var(--text-secondary, #64748b)' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
