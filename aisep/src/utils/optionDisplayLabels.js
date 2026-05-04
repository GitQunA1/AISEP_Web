/**
 * Nhãn hiển thị cho option API (industry / stage).
 * Giữ nguyên value (id) khi submit — chỉ đổi phần UI.
 */

/** Industry option: AI_BigData → "AI BigData" */
export function formatIndustryOptionDisplayLabel(raw) {
  if (raw == null) return '';
  return String(raw).replace(/_/g, ' ');
}

const STAGE_EN_TO_VI = new Map([
  ['idea', 'Ý tưởng'],
  ['mvp', 'MVP (sản phẩm khả thi tối thiểu)'],
  ['growth', 'Tăng trưởng'],
  ['seed', 'Seed'],
  ['preseed', 'Pre-Seed'],
  ['seriesa', 'Series A'],
  ['seriesb', 'Series B'],
  ['seriesc', 'Series C'],
  ['expansion', 'Mở rộng'],
  ['bridge', 'Bridge'],
  ['earlystage', 'Giai đoạn đầu'],
  ['latestage', 'Giai đoạn sau'],
  ['scaleup', 'Scale-up'],
  ['prototype', 'Bản mẫu (Prototype)'],
  ['marketready', 'Sẵn sàng ra thị trường'],
]);

function normalizeStageLookupKey(raw) {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Stage option (Value từ API như Idea, MVP, Growth) → tiếng Việt cho dropdown.
 * Form vẫn gửi stageOptionId (số).
 */
export function formatStageOptionDisplayLabel(apiValue) {
  if (apiValue == null || apiValue === '') return '';
  const raw = String(apiValue).trim();
  const key = normalizeStageLookupKey(raw);
  if (STAGE_EN_TO_VI.has(key)) return STAGE_EN_TO_VI.get(key);
  return formatIndustryOptionDisplayLabel(raw);
}
