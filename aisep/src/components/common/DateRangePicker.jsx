import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import s from './DateRangePicker.module.css';

const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const MONTHS_VN = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
  'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
  'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

/** Parse "YYYY-MM-DD" → Date at midnight local */
const parseDate = (str) => {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** Format Date → "YYYY-MM-DD" */
const fmtISO = (d) => {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};

/** Compare two dates by day only */
const sameDay = (a, b) => a && b && a.toDateString() === b.toDateString();
const isBefore = (a, b) => a && b && a < b;

/** Get all calendar cells for a given month view (always 6 rows × 7 cols) */
function getCalendarDays(year, month) {
  // month is 0-indexed
  const first = new Date(year, month, 1);
  // Monday-first: day of week 0=Sun becomes 6, 1=Mon becomes 0 …
  let startOffset = (first.getDay() + 6) % 7;
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(year, month, 1 - startOffset + i);
    cells.push(d);
  }
  return cells;
}

export default function DateRangePicker({
  fromDate,       // "YYYY-MM-DD" | null
  toDate,         // "YYYY-MM-DD" | null
  onChange,       // ({ fromDate, toDate }) => void
  label = 'Chọn khoảng thời gian',
  maxRangeDays = 62,
}) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(null); // Date | null — for hover preview
  const [selecting, setSelecting] = useState(null); // 'from' | null — tracking selection phase

  // Calendar month view state — defaults to from month or current month
  const today = new Date();
  const initMonth = fromDate
    ? parseDate(fromDate)
    : today;
  const [viewYear, setViewYear] = useState(initMonth.getFullYear());
  const [viewMonth, setViewMonth] = useState(initMonth.getMonth());

  const triggerRef = useRef(null);
  const popupRef = useRef(null);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });

  const from = parseDate(fromDate);
  const to = parseDate(toDate);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        popupRef.current && !popupRef.current.contains(e.target)
      ) {
        setOpen(false);
        setSelecting(null);
        setHovered(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Position popup — smart flip if it would overflow the bottom of the viewport
  const POPUP_HEIGHT = 380; // approx height of calendar popup in px
  const POPUP_WIDTH = 320;
  const POPUP_GAP = 8;

  const openPicker = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    let top;
    if (spaceBelow >= POPUP_HEIGHT + POPUP_GAP || spaceBelow >= spaceAbove) {
      // Open below
      top = rect.bottom + POPUP_GAP;
    } else {
      // Flip — open above
      top = rect.top - POPUP_HEIGHT - POPUP_GAP;
    }

    // Clamp left so popup never overflows the right edge
    const left = Math.min(rect.left, window.innerWidth - POPUP_WIDTH - 8);

    setPopupPos({ top, left });
    setOpen(true);
    setSelecting(null);
    setHovered(null);
  }, []);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const handleDayClick = (day) => {
    if (!selecting) {
      // First click — set from, enter "selecting to" phase
      onChange({ fromDate: fmtISO(day), toDate: '' });
      setSelecting('to');
      setHovered(null);
    } else {
      // Second click — set to
      let f = from || day;
      let t = day;
      if (isBefore(t, f)) { [f, t] = [t, f]; }
      onChange({ fromDate: fmtISO(f), toDate: fmtISO(t) });
      setSelecting(null);
      setHovered(null);
      setOpen(false);
    }
  };

  const handleDayHover = (day) => {
    if (selecting === 'to') setHovered(day);
  };

  const handleClear = () => {
    onChange({ fromDate: '', toDate: '' });
    setSelecting(null);
    setHovered(null);
  };

  // Determine range for highlighting
  const rangeStart = from;
  const rangeEnd = selecting === 'to' && hovered
    ? (isBefore(hovered, from) ? hovered : from ? hovered : null)
    : to;
  const rangeFrom = rangeStart && rangeEnd
    ? (isBefore(rangeStart, rangeEnd) ? rangeStart : rangeEnd)
    : rangeStart;
  const rangeTo = rangeStart && rangeEnd
    ? (isBefore(rangeStart, rangeEnd) ? rangeEnd : rangeStart)
    : null;

  const isInRange = (day) =>
    rangeFrom && rangeTo && day > rangeFrom && day < rangeTo;
  const isRangeStart = (day) => sameDay(day, rangeFrom);
  const isRangeEnd = (day) => rangeTo && sameDay(day, rangeTo);

  const cells = getCalendarDays(viewYear, viewMonth);

  // Day count display
  const diffDays = from && to
    ? Math.round((to - from) / 86400000) + 1
    : null;
  const overLimit = diffDays !== null && diffDays > maxRangeDays;

  // Format display string
  const fmtDisplay = (str) => {
    if (!str) return '—';
    const d = parseDate(str);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <div className={s.root}>
      {/* Trigger */}
      <div ref={triggerRef} className={s.triggerRow} onClick={openPicker}>
        <div className={s.field}>
          <span className={s.fieldLabel}>Ngày bắt đầu</span>
          <span className={`${s.fieldValue} ${!fromDate ? s.placeholder : ''}`}>
            {fromDate ? fmtDisplay(fromDate) : 'DD/MM/YYYY'}
          </span>
        </div>
        <div className={s.arrow}>→</div>
        <div className={s.field}>
          <span className={s.fieldLabel}>Ngày kết thúc</span>
          <span className={`${s.fieldValue} ${!toDate ? s.placeholder : ''}`}>
            {toDate ? fmtDisplay(toDate) : 'DD/MM/YYYY'}
          </span>
        </div>
        <Calendar size={16} className={s.calIcon} />
      </div>

      {/* Day count badge */}
      {diffDays !== null && (
        <div className={`${s.dayCount} ${overLimit ? s.dayCountError : ''}`}>
          {diffDays} ngày{overLimit ? ` — vượt quá ${maxRangeDays} ngày` : ''}
        </div>
      )}

      {/* Calendar popup via portal */}
      {open && createPortal(
        <div
          ref={popupRef}
          className={s.popup}
          style={{ top: popupPos.top, left: popupPos.left }}
          onMouseLeave={() => setHovered(null)}
        >
          {/* Navigation */}
          <div className={s.nav}>
            <button className={s.navBtn} onClick={prevMonth}>
              <ChevronLeft size={16} />
            </button>
            <span className={s.navLabel}>
              {MONTHS_VN[viewMonth]} {viewYear}
            </span>
            <button className={s.navBtn} onClick={nextMonth}>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Week header */}
          <div className={s.weekRow}>
            {DAYS.map(d => (
              <div key={d} className={`${s.dayHeader} ${d === 'CN' ? s.sunday : ''}`}>{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className={s.grid}>
            {cells.map((day, idx) => {
              const isCurrentMonth = day.getMonth() === viewMonth;
              const isToday = sameDay(day, today);
              const inRange = isInRange(day);
              const isStart = isRangeStart(day);
              const isEnd = isRangeEnd(day);
              const isSun = day.getDay() === 0;
              const isSat = day.getDay() === 6;
              const isSelected = isStart || isEnd;

              let cellClass = s.day;
              if (!isCurrentMonth) cellClass += ` ${s.otherMonth}`;
              if (isToday && !isSelected) cellClass += ` ${s.today}`;
              if (inRange) cellClass += ` ${s.inRange}`;
              if (isStart) cellClass += ` ${s.rangeStart}`;
              if (isEnd) cellClass += ` ${s.rangeEnd}`;
              if (isStart && isEnd) cellClass += ` ${s.single}`;
              if (isSun && !isSelected) cellClass += ` ${s.sundayDay}`;

              return (
                <div
                  key={idx}
                  className={cellClass}
                  onClick={() => handleDayClick(day)}
                  onMouseEnter={() => handleDayHover(day)}
                >
                  <span className={s.dayInner}>{day.getDate()}</span>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className={s.footer}>
            <button className={s.footerClear} onClick={handleClear}>Xóa</button>
            {selecting === 'to' && (
              <span className={s.hint}>Chọn ngày kết thúc</span>
            )}
            <button className={s.footerToday} onClick={() => {
              const t = today;
              if (!selecting) {
                onChange({ fromDate: fmtISO(t), toDate: '' });
                setSelecting('to');
              } else {
                let f = from || t;
                let end = t;
                if (isBefore(end, f)) [f, end] = [end, f];
                onChange({ fromDate: fmtISO(f), toDate: fmtISO(end) });
                setSelecting(null);
                setOpen(false);
              }
            }}>
              Hôm nay
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
