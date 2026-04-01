import React, { useMemo, useState, useEffect } from 'react';
import CustomSelect from '../common/CustomSelect';
import styles from './SlotPicker.module.css';

/**
 * SlotPicker – Time-grid nhóm theo ngày cho việc chọn slot booking
 * Props:
 *   slots          – AdvisorAvailabilityResponse[] (chỉ Available)
 *   selectedSlotIds – number[]
 *   onToggle(slotId) – callback
 */
export default function SlotPicker({ slots, selectedSlotIds, onToggle }) {
  // Nhóm slots theo ngày
  const grouped = useMemo(() => {
    const map = {};
    slots.forEach(slot => {
      const dateKey = slot.slotDate?.split('T')[0] || '';
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(slot);
    });

    // Sort ngày tăng dần, sort giờ trong ngày
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, daySlots]) => ({
        date,
        daySlots: daySlots.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || '')),
      }));
  }, [slots]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const dayOptions = useMemo(() => 
    grouped.map(g => ({
      label: formatDate(g.date),
      value: g.date
    })),
  [grouped]);

  const [selectedDate, setSelectedDate] = useState('');

  // Tự động chọn ngày đầu tiên khi list slots thay đổi
  useEffect(() => {
    if (dayOptions.length > 0 && !selectedDate) {
      setSelectedDate(dayOptions[0].value);
    } else if (dayOptions.length > 0 && !dayOptions.some(o => o.value === selectedDate)) {
      setSelectedDate(dayOptions[0].value);
    }
  }, [dayOptions, selectedDate]);

  const activeDay = grouped.find(g => g.date === selectedDate);
  const isSelected = (id) => selectedSlotIds.includes(id);

  const now = new Date();
  const isPast12h = (slot) => {
    const slotStart = new Date(`${slot.slotDate?.split('T')[0]}T${slot.startTime}`);
    return (slotStart - now) < 12 * 60 * 60 * 1000;
  };

  if (slots.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.dropdownSection}>
        <label className={styles.dropdownLabel}>Chọn ngày tư vấn</label>
        <CustomSelect
          options={dayOptions}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          placeholder="Chọn ngày..."
        />
      </div>

      {activeDay && (
        <div className={styles.slotsSection}>
          <div className={styles.sectionHeader}>
            <span>Khung giờ có sẵn ({activeDay.daySlots.length})</span>
          </div>
          <div className={styles.slotsGrid}>
            {activeDay.daySlots.map(slot => {
              const tooSoon = isPast12h(slot);
              const selected = isSelected(slot.advisorAvailabilityId);
              return (
                <button
                  key={slot.advisorAvailabilityId}
                  className={`${styles.slotChip} ${selected ? styles.selected : ''} ${tooSoon ? styles.disabled : ''}`}
                  onClick={() => !tooSoon && onToggle(slot.advisorAvailabilityId)}
                  disabled={tooSoon}
                  title={tooSoon ? 'Phải đặt trước ít nhất 12 giờ' : ''}
                >
                  {slot.startTime?.slice(0, 5)} – {slot.endTime?.slice(0, 5)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
