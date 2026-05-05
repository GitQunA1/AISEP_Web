/**
 * Translate AI evaluation results to Vietnamese
 */

const componentNameMap = {
  Team: 'Đội ngũ',
  Market: 'Thị trường',
  Product: 'Sản phẩm',
  Competition: 'Cạnh tranh',
  Traction: 'Traction / độ chấp nhận thị trường',
  InvestmentNeed: 'Nhu cầu đầu tư & runway',
  Opportunity: 'Cơ hội thị trường',
  Marketing: 'Marketing',
  Investment: 'Đầu tư',
  Other: 'Khác',
};

const commonPhrases = {
  'Team information is entirely placeholder-only and not verifiable.': 'Thông tin đội ngũ hoàn toàn là placeholder và không thể xác minh được.',
  'No usable market evidence provided; market size is explicitly zero.': 'Không cung cấp bằng chứng thị trường nào; kích thước thị trường bằng không.',
  'Only an unverified MVP claim exists; solution description is placeholder.': 'Chỉ có một yêu cầu MVP chưa được xác minh; mô tả giải pháp là placeholder.',
  'Competitive analysis and unique value proposition are missing or placeholder.': 'Phân tích cạnh tranh và đề xuất giá trị độc đáo bị thiếu hoặc là placeholder.',
  'No real business model or traction data; revenue is zero.': 'Không có mô hình kinh doanh thực tế hoặc dữ liệu tiến triển; doanh thu bằng không.',
  'Investment ask section is completely missing.': 'Phần yêu cầu đầu tư hoàn toàn bị thiếu.',
  'Team information is entirely placeholder-only and not verifiable': 'Thông tin đội ngũ hoàn toàn là placeholder và không thể xác minh được',
  'Only an unverified \'MVP\' claim exists': 'Chỉ có một yêu cầu MVP chưa được xác minh',
  'Market Size = 0 USD': 'Kích thước thị trường = 0 USD',
  'Development Stage = MVP': 'Giai đoạn phát triển = MVP',
  'Revenue = 0 USD': 'Doanh thu = 0 USD',
  'Missing:': 'Thiếu:',
  'items': 'mục',
  'No real business model': 'Không có mô hình kinh doanh thực tế',
  'traction data': 'dữ liệu tiến triển',
  'revenue is zero': 'doanh thu bằng không',
  'entirely placeholder': 'hoàn toàn là placeholder',
  'not verifiable': 'không thể xác minh được',
};

const strengthPatterns = [
  { en: 'revenue', vi: 'doanh thu' },
  { en: 'market', vi: 'thị trường' },
  { en: 'team', vi: 'đội ngũ' },
  { en: 'product', vi: 'sản phẩm' },
  { en: 'growth', vi: 'tăng trưởng' },
  { en: 'customer', vi: 'khách hàng' },
  { en: 'innovation', vi: 'sáng tạo' },
  { en: 'traction', vi: 'tiến triển' },
  { en: 'unique value', vi: 'giá trị độc đáo' },
  { en: 'experience', vi: 'kinh nghiệm' },
];

const weaknessPatterns = [
  { en: 'limited budget', vi: 'ngân sách hạn chế' },
  { en: 'early stage', vi: 'giai đoạn sơ khai' },
  { en: 'unproven', vi: 'chưa được chứng minh' },
  { en: 'limited market', vi: 'thị trường hạn chế' },
  { en: 'no revenue', vi: 'chưa có doanh thu' },
  { en: 'small team', vi: 'đội ngũ nhỏ' },
  { en: 'competition', vi: 'cạnh tranh cao' },
  { en: 'incomplete', vi: 'không hoàn chỉnh' },
  { en: 'missing data', vi: 'dữ liệu thiếu' },
  { en: 'unclear', vi: 'không rõ ràng' },
];

const recommendationPatterns = [
  { en: 'financial plan', vi: 'kế hoạch tài chính' },
  { en: 'market research', vi: 'nghiên cứu thị trường' },
  { en: 'team building', vi: 'xây dựng đội ngũ' },
  { en: 'product development', vi: 'phát triển sản phẩm' },
  { en: 'business model', vi: 'mô hình kinh doanh' },
  { en: 'revenue model', vi: 'mô hình doanh thu' },
  { en: 'marketing strategy', vi: 'chiến lược marketing' },
  { en: 'customer acquisition', vi: 'chiếm lĩnh khách hàng' },
  { en: 'competitive analysis', vi: 'phân tích cạnh tranh' },
  { en: 'risk mitigation', vi: 'giảm thiểu rủi ro' },
  { en: 'scale strategy', vi: 'chiến lược mở rộng' },
  { en: 'partnership', vi: 'hợp tác chiến lược' },
];

/**
 * Translate a text to Vietnamese
 * @param {string} text
 * @returns {string}
 */
const translateText = (text) => {
  if (!text || typeof text !== 'string') return text;

  let result = text;

  // Translate exact phrases first (longest first to avoid partial matches)
  const sortedPhrases = Object.entries(commonPhrases).sort((a, b) => b[0].length - a[0].length);

  for (const [en, vi] of sortedPhrases) {
    const regex = new RegExp(en, 'gi');
    result = result.replace(regex, vi);
  }

  return result;
};

/**
 * Translate a component name to Vietnamese
 * @param {string} componentName
 * @returns {string}
 */
export const translateComponent = (componentName) => {
  if (!componentName) return '';
  // Try case-insensitive match
  const match = Object.entries(componentNameMap).find(
    ([en]) => en.toLowerCase() === componentName.toLowerCase()
  );
  if (match) return match[1];

  // Default fallback with capitalization
  return componentName.charAt(0).toUpperCase() + componentName.slice(1);
};

/**
 * Translate strength item
 * @param {string} strength
 * @returns {string}
 */
const translateStrength = (strength) => {
  if (!strength || typeof strength !== 'string') return strength;

  return translateText(strength);
};

/**
 * Translate weakness item
 * @param {string} weakness
 * @returns {string}
 */
const translateWeakness = (weakness) => {
  if (!weakness || typeof weakness !== 'string') return weakness;

  return translateText(weakness);
};

/**
 * Translate recommendation item
 * @param {string} recommendation
 * @returns {string}
 */
const translateRecommendation = (recommendation) => {
  if (!recommendation || typeof recommendation !== 'string') return recommendation;

  return translateText(recommendation);
};

/**
 * Translate analysis reason text
 * @param {string} reason
 * @returns {string}
 */
const translateAnalysisReason = (reason) => {
  if (!reason || typeof reason !== 'string') return reason;

  return translateText(reason);
};

/**
 * Translate entire AI evaluation result
 * @param {object} analysisResult - API response from analyzeProjectAPI
 * @param {object} eligibilityResult - API response from evaluateEligibilityAPI
 * @returns {object} - Translated results
 */
export const translateAIResults = (analysisResult, eligibilityResult) => {
  const payload = analysisResult?.data ?? analysisResult;
  if (!payload || typeof payload !== 'object') {
    return { analysisResult, eligibilityResult };
  }

  const hasDataWrapper = analysisResult && typeof analysisResult === 'object' && 'data' in analysisResult && analysisResult.data != null;
  const data = hasDataWrapper ? { ...analysisResult.data } : { ...payload };
  const translatedAnalysis = hasDataWrapper ? { ...analysisResult, data } : { ...payload };

  // Translate strengths (top-level legacy)
  if (Array.isArray(data.strengths)) {
    data.strengths = data.strengths.map(translateStrength);
  }

  // Translate weaknesses (top-level legacy)
  if (Array.isArray(data.weaknesses)) {
    data.weaknesses = data.weaknesses.map(translateWeakness);
  }

  // Translate recommendations (legacy name)
  if (Array.isArray(data.recommendations)) {
    data.recommendations = data.recommendations.map(translateRecommendation);
  }

  // Translate score breakdown component names (legacy)
  if (Array.isArray(data.scoreBreakdown)) {
    data.scoreBreakdown = data.scoreBreakdown.filter((item) => item !== null).map((item) => ({
      ...item,
      component: translateComponent(item.component),
    }));
  }

  // Nested analysis (API mới: analysis.auditedItems, strengths, weaknesses, advice)
  if (data.analysis && typeof data.analysis === 'object' && !Array.isArray(data.analysis)) {
    const na = { ...data.analysis };

    if (Array.isArray(na.strengths)) {
      na.strengths = na.strengths.map(translateStrength);
    }
    if (Array.isArray(na.weaknesses)) {
      na.weaknesses = na.weaknesses.map(translateWeakness);
    }
    if (Array.isArray(na.advice)) {
      na.advice = na.advice.map(translateRecommendation);
    }
    if (Array.isArray(na.auditedItems)) {
      na.auditedItems = na.auditedItems.map((item) => ({
        ...item,
        criteria: item.criteria ? translateComponent(item.criteria) : item.criteria,
        finding: item.finding ? translateAnalysisReason(item.finding) : item.finding,
      }));
    }

    // Legacy shape: các key Team/Market dạng object có .score / .reason
    const legacyKeys = Object.keys(na).filter((k) => {
      const v = na[k];
      return (
        v &&
        typeof v === 'object' &&
        !Array.isArray(v) &&
        ('score' in v || 'reason' in v) &&
        !['auditedItems', 'strengths', 'weaknesses', 'advice'].includes(k)
      );
    });
    if (legacyKeys.length > 0) {
      legacyKeys.forEach((key) => {
        const section = { ...na[key] };
        if (section.reason) section.reason = translateAnalysisReason(section.reason);
        if (Array.isArray(section.evidence)) {
          section.evidence = section.evidence.map((e) =>
            typeof e === 'string' ? translateAnalysisReason(e) : e
          );
        }
        delete na[key];
        na[translateComponent(key)] = section;
      });
    }

    data.analysis = na;
  }

  if (hasDataWrapper) {
    return { analysisResult: { ...analysisResult, data }, eligibilityResult };
  }
  return { analysisResult: data, eligibilityResult };
};

export default translateAIResults;
