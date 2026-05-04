import React from 'react';
import { Info } from 'lucide-react';
import styles from './ProjectSubmissionForm.module.css';

/**
 * Radio / button-group theo spec: mỗi lựa chọn có tiêu đề + đoạn mô tả (helper) luôn hiển thị;
 * icon ℹ️ trên tiêu đề nhóm gom tóm tắt các mức.
 */
export default function ScorecardRadioGroup({ label, name, value, onChange, options, disabled, error }) {
  const summaryTitle = options.map((o) => `${o.label}: ${o.helper}`).join('\n');

  return (
    <fieldset className={styles.scorecardFieldset} disabled={disabled}>
      <legend className={styles.scorecardLegend}>
        <span className={styles.scorecardLegendText}>{label}</span>
        <span className={styles.scorecardLegendInfo} title={summaryTitle} aria-label="Gợi ý các mức">
          <Info size={16} strokeWidth={2.25} aria-hidden />
        </span>
      </legend>
      <div className={styles.scorecardOptions} role="radiogroup" aria-label={label}>
        {options.map((o) => {
          const selected = value === o.value;
          return (
            <label
              key={o.value}
              className={`${styles.scorecardOption} ${selected ? styles.scorecardOptionActive : ''}`}
            >
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={selected}
                onChange={onChange}
                className={styles.scorecardOptionInput}
              />
              <span className={styles.scorecardOptionBody}>
                <span className={styles.scorecardOptionTitle}>{o.label}</span>
                <span className={styles.scorecardOptionHelper}>{o.helper}</span>
              </span>
            </label>
          );
        })}
      </div>
      {error ? <span className={styles.errorText}>{error}</span> : null}
    </fieldset>
  );
}
