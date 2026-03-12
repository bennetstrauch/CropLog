import React, { useState } from 'react';

const DAYS        = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS      = ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ─── helpers ────────────────────────────────────────────────────────────────

function toDateStr(date) {
  return date.toISOString().split('T')[0];
}

function shiftMonth(year, month, delta) {
  const d = new Date(year, month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

function buildCalendarDays(year, month) {
  const firstDay     = new Date(year, month, 1);
  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = (firstDay.getDay() + 6) % 7; // Monday = 0

  const days = [];
  for (let i = leadingBlanks; i > 0; i--)
    days.push({ dateStr: toDateStr(new Date(year, month, 1 - i)), inMonth: false });
  for (let d = 1; d <= daysInMonth; d++)
    days.push({ dateStr: toDateStr(new Date(year, month, d)), inMonth: true });
  let trailing = 1;
  while (days.length < 42)
    days.push({ dateStr: toDateStr(new Date(year, month + 1, trailing++)), inMonth: false });

  return days;
}

// ─── sub-components ──────────────────────────────────────────────────────────

const NavArrow = ({ onClick, children }) => (
  <button
    onClick={onClick}
    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 6px' }}
    className="text-gray-400 hover:text-gray-800 text-2xl font-light leading-none"
  >
    {children}
  </button>
);

const CalendarMonth = ({ year, month, rangeStart, rangeEnd, onDayClick, onDayHover }) => {
  const days = buildCalendarDays(year, month);

  const getCellClass = (dateStr, inMonth) => {
    const isStart = rangeStart && dateStr === rangeStart;
    const isEnd   = rangeEnd   && dateStr === rangeEnd;
    const inRange = rangeStart && rangeEnd && dateStr > rangeStart && dateStr < rangeEnd;

    let cls = 'h-9 flex items-center justify-center text-sm cursor-pointer select-none ';

    if (isStart || isEnd)
      cls += '!bg-teal-600 text-white font-semibold rounded-full ';
    else if (inRange)
      cls += '!bg-yellow-100 ';
    else
      cls += `rounded-full ${inMonth ? 'text-gray-800 hover:!bg-gray-100' : 'text-gray-300'} `;

    return cls;
  };

  return (
    <div className="w-64">
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="h-8 flex items-center justify-center text-xs font-medium text-gray-400">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map(({ dateStr, inMonth }) => (
          <div
            key={dateStr}
            className={getCellClass(dateStr, inMonth)}
            onClick={() => onDayClick(dateStr)}
            onMouseEnter={() => onDayHover(dateStr)}
          >
            {parseInt(dateStr.split('-')[2], 10)}
          </div>
        ))}
      </div>
    </div>
  );
};

// Grid of 12 months for a given year
const MonthOverlay = ({ year, onMonthSelect, onYearClick, onPrevYear, onNextYear }) => (
  <div>
    <div className="flex items-center justify-between mb-4">
      <NavArrow onClick={onPrevYear}>‹</NavArrow>
      <span
        className="text-sm font-semibold text-gray-800 cursor-pointer hover:text-teal-600 transition-colors"
        onClick={onYearClick}
        title="Select year"
      >
        {year}
      </span>
      <NavArrow onClick={onNextYear}>›</NavArrow>
    </div>
    <div className="grid grid-cols-4 gap-2">
      {MONTHS_SHORT.map((name, i) => (
        <button
          key={name}
          onClick={() => onMonthSelect(i)}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          className="hover:!bg-yellow-100 !bg-transparent text-gray-800 text-sm py-3 rounded-lg transition-colors"
        >
          {name}
        </button>
      ))}
    </div>
  </div>
);

// Grid of 12 years starting at decadeStart
const YearOverlay = ({ decadeStart, onYearSelect, onPrevDecade, onNextDecade }) => (
  <div>
    <div className="flex items-center justify-between mb-4">
      <NavArrow onClick={onPrevDecade}>‹</NavArrow>
      <span className="text-sm font-semibold text-gray-800">
        {decadeStart} – {decadeStart + 11}
      </span>
      <NavArrow onClick={onNextDecade}>›</NavArrow>
    </div>
    <div className="grid grid-cols-4 gap-2">
      {Array.from({ length: 12 }, (_, i) => decadeStart + i).map(y => (
        <button
          key={y}
          onClick={() => onYearSelect(y)}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          className="hover:!bg-yellow-100 !bg-transparent text-gray-800 text-sm py-3 rounded-lg transition-colors"
        >
          {y}
        </button>
      ))}
    </div>
  </div>
);

// ─── main component ──────────────────────────────────────────────────────────

const DateRangePicker = ({ currentRange, onSelect, onClose }) => {
  const [leftView, setLeftView] = useState(() => {
    const d = new Date(currentRange.startDate);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [pendingStart, setPendingStart] = useState(null);
  const [hoverDate,    setHoverDate]    = useState(null);

  // overlay: null | { type: 'months'|'years', side: 'left'|'right', year, decadeStart }
  const [overlay, setOverlay] = useState(null);

  const rightView = shiftMonth(leftView.year, leftView.month, 1);

  // While selecting, preview from pendingStart → hoverDate; otherwise show existing range
  const effectiveRange = pendingStart
    ? { start: [pendingStart, hoverDate || pendingStart].sort()[0],
        end:   [pendingStart, hoverDate || pendingStart].sort()[1] }
    : { start: currentRange.startDate, end: currentRange.endDate };

  // ── day selection ──
  const handleDayClick = (dateStr) => {
    if (!pendingStart) {
      setPendingStart(dateStr);
      setHoverDate(dateStr);
    } else {
      const [start, end] = [pendingStart, dateStr].sort();
      onSelect({ startDate: start, endDate: end });
    }
  };

  const handleDayHover = (dateStr) => {
    if (pendingStart) setHoverDate(dateStr);
  };

  // ── overlay openers ──
  const openMonthOverlay = (side) => {
    const view = side === 'left' ? leftView : rightView;
    setOverlay({ type: 'months', side, year: view.year, decadeStart: Math.floor(view.year / 12) * 12 });
  };

  const openYearOverlay = (side) => {
    const view = side === 'left' ? leftView : rightView;
    setOverlay({ type: 'years', side, year: view.year, decadeStart: Math.floor(view.year / 12) * 12 });
  };

  // ── overlay selections ──
  const handleMonthSelect = (monthIndex) => {
    if (overlay.side === 'left') {
      setLeftView({ year: overlay.year, month: monthIndex });
    } else {
      // Place selected month on the right → left is one month earlier
      setLeftView(shiftMonth(overlay.year, monthIndex, -1));
    }
    setOverlay(null);
  };

  const handleYearSelect = (year) => {
    // Drill into month selection for the chosen year
    setOverlay(o => ({ ...o, type: 'months', year }));
  };

  // ── shared props for both calendar grids ──
  const calendarProps = {
    rangeStart: effectiveRange.start,
    rangeEnd:   effectiveRange.end,
    onDayClick:  handleDayClick,
    onDayHover:  handleDayHover,
  };

  return (
    <>
      {/* Backdrop — clicks outside close the picker */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Picker panel */}
      <div className="absolute top-full left-0 z-50 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 min-w-[600px]">

        {overlay ? (
          /* ── Month or Year drill-down overlay ── */
          overlay.type === 'months' ? (
            <MonthOverlay
              year={overlay.year}
              onMonthSelect={handleMonthSelect}
              onYearClick={() => setOverlay(o => ({ ...o, type: 'years', decadeStart: Math.floor(o.year / 12) * 12 }))}
              onPrevYear={() => setOverlay(o => ({ ...o, year: o.year - 1 }))}
              onNextYear={() => setOverlay(o => ({ ...o, year: o.year + 1 }))}
            />
          ) : (
            <YearOverlay
              decadeStart={overlay.decadeStart}
              onYearSelect={handleYearSelect}
              onPrevDecade={() => setOverlay(o => ({ ...o, decadeStart: o.decadeStart - 12 }))}
              onNextDecade={() => setOverlay(o => ({ ...o, decadeStart: o.decadeStart + 12 }))}
            />
          )
        ) : (
          /* ── Normal two-month calendar view ── */
          <div className="flex gap-8">

            {/* Left month */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <NavArrow onClick={() => setLeftView(v => shiftMonth(v.year, v.month, -1))}>‹</NavArrow>
                <span className="flex gap-1 text-sm font-semibold">
                  <span className="text-gray-800 cursor-pointer hover:text-teal-600 transition-colors"
                        onClick={() => openMonthOverlay('left')} title="Select month">
                    {MONTHS[leftView.month]}
                  </span>
                  <span className="text-gray-800 cursor-pointer hover:text-teal-600 transition-colors"
                        onClick={() => openYearOverlay('left')} title="Select year">
                    {leftView.year}
                  </span>
                </span>
                <div className="w-6" />
              </div>
              <CalendarMonth year={leftView.year} month={leftView.month} {...calendarProps} />
            </div>

            <div className="w-px bg-gray-100 self-stretch" />

            {/* Right month */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-6" />
                <span className="flex gap-1 text-sm font-semibold">
                  <span className="text-gray-800 cursor-pointer hover:text-teal-600 transition-colors"
                        onClick={() => openMonthOverlay('right')} title="Select month">
                    {MONTHS[rightView.month]}
                  </span>
                  <span className="text-gray-800 cursor-pointer hover:text-teal-600 transition-colors"
                        onClick={() => openYearOverlay('right')} title="Select year">
                    {rightView.year}
                  </span>
                </span>
                <NavArrow onClick={() => setLeftView(v => shiftMonth(v.year, v.month, 1))}>›</NavArrow>
              </div>
              <CalendarMonth year={rightView.year} month={rightView.month} {...calendarProps} />
            </div>

          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-center">
          {overlay ? (
            <span
              className="text-teal-600 cursor-pointer hover:text-teal-700 transition-colors"
              onClick={() => setOverlay(null)}
            >
              ← Back to calendar
            </span>
          ) : (
            <span className="text-gray-400">
              {pendingStart ? 'Now click an end date' : 'Click a start date'}
            </span>
          )}
        </div>

      </div>
    </>
  );
};

export default DateRangePicker;
