/**
 * Chuẩn hóa payload phân tích AI — Startup / Investor / GET có pagination / analysisJson.
 */

function mapAuditedFromPascal(item) {
  if (!item || typeof item !== 'object') return null;
  return {
    criteria: item.Criteria ?? item.criteria,
    maxScore: item.MaxScore ?? item.maxScore,
    baseScore: item.BaseScore ?? item.baseScore,
    finding: item.Finding ?? item.finding,
    adjustment: item.Adjustment ?? item.adjustment,
    finalScore: item.FinalScore ?? item.finalScore,
  };
}

function parseAnalysisJsonString(str) {
  if (!str || typeof str !== 'string') return null;
  try {
    const j = JSON.parse(str);
    const auditedRaw = j.AuditedItems ?? j.auditedItems;
    const auditedItems = Array.isArray(auditedRaw)
      ? auditedRaw.map(mapAuditedFromPascal).filter(Boolean)
      : [];

    return {
      totalBaseScore: j.TotalBaseScore ?? j.totalBaseScore,
      totalAIAdjustmentScore: j.TotalAIAdjustmentScore ?? j.totalAIAdjustmentScore,
      totalFinalScore: j.TotalFinalScore ?? j.totalFinalScore,
      auditedItems,
      strengths: j.Strengths ?? j.strengths,
      weaknesses: j.Weaknesses ?? j.weaknesses,
      advice: j.Advice ?? j.advice,
    };
  } catch {
    return null;
  }
}

export function normalizeAIAnalysisPayload(analysisResult) {
  let analysisData = analysisResult?.data ?? analysisResult ?? {};

  if (analysisData.items && Array.isArray(analysisData.items) && analysisData.items.length > 0) {
    analysisData = analysisData.items[0];
  }

  let nested =
    analysisData.analysis && typeof analysisData.analysis === 'object' && !Array.isArray(analysisData.analysis)
      ? { ...analysisData.analysis }
      : {};

  const fromJson = parseAnalysisJsonString(analysisData.analysisJson);
  if (fromJson) {
    if (!nested.auditedItems?.length && fromJson.auditedItems?.length) {
      nested = {
        ...nested,
        auditedItems: fromJson.auditedItems,
      };
    }
    if (nested.strengths == null && Array.isArray(fromJson.strengths)) nested.strengths = fromJson.strengths;
    if (nested.weaknesses == null && Array.isArray(fromJson.weaknesses)) nested.weaknesses = fromJson.weaknesses;
    if (nested.advice == null && Array.isArray(fromJson.advice)) nested.advice = fromJson.advice;
    nested.totalBaseScore = nested.totalBaseScore ?? fromJson.totalBaseScore;
    nested.totalAIAdjustmentScore = nested.totalAIAdjustmentScore ?? fromJson.totalAIAdjustmentScore;
    nested.totalFinalScore = nested.totalFinalScore ?? fromJson.totalFinalScore;
  }

  const finalPotentialScore = Number(
    analysisData.finalPotentialScore ??
      nested.totalFinalScore ??
      analysisData.potentialScore ??
      nested.potentialScore ??
      0
  );
  const baseScore = Number(analysisData.baseScore ?? nested.totalBaseScore ?? 0);
  const aiAdjustmentScore = Number(analysisData.aiAdjustmentScore ?? nested.totalAIAdjustmentScore ?? 0);

  const strengths = analysisData.strengths ?? nested.strengths ?? [];
  const weaknesses = analysisData.weaknesses ?? nested.weaknesses ?? [];
  const recommendations =
    analysisData.recommendations ?? nested.recommendations ?? nested.advice ?? [];

  const auditedItems = Array.isArray(nested.auditedItems) ? nested.auditedItems : [];

  const legacyScoreBreakdown = Array.isArray(analysisData.scoreBreakdown) ? analysisData.scoreBreakdown : [];

  const chaosScore =
    analysisData.chaosScore ??
    nested.chaosScore ??
    (Number.isFinite(aiAdjustmentScore) ? aiAdjustmentScore : undefined);

  const summary = analysisData.summary ?? nested.summary ?? '';

  const skipNestedKeys = new Set([
    'auditedItems',
    'strengths',
    'weaknesses',
    'advice',
    'recommendations',
    'totalBaseScore',
    'totalAIAdjustmentScore',
    'totalFinalScore',
  ]);

  const legacyDetailEntries = Object.entries(nested).filter(([key, section]) => {
    if (skipNestedKeys.has(key)) return false;
    return (
      section &&
      typeof section === 'object' &&
      !Array.isArray(section) &&
      ('score' in section || 'reason' in section)
    );
  });

  return {
    analysisData,
    nested,
    finalPotentialScore,
    baseScore,
    aiAdjustmentScore,
    strengths,
    weaknesses,
    recommendations,
    auditedItems,
    legacyScoreBreakdown,
    legacyDetailEntries,
    chaosScore,
    summary,
  };
}

export default normalizeAIAnalysisPayload;
