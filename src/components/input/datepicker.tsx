'use client';

// import dynamic from "next/dynamic";
import { useState } from "react";
import type { DateValueType } from "react-tailwindcss-datepicker";
import Datepicker from "react-tailwindcss-datepicker";

type DatepickerProps = {
  value?: DateValueType;
  onChange?: (value: DateValueType) => void;
  disabled?: boolean;
  label?: string;
  range?: boolean;
  withTime?: boolean;
  /** Time in HH:mm format. When withTime is true, use with onTimeChange for controlled mode. */
  timeValue?: string;
  /** Called when time input changes. Time string is HH:mm. */
  onTimeChange?: (time: string) => void;
  /** When withTime is true, use a single datetime string (YYYY-MM-DDTHH:mm or ''). Simpler than value/onChange for single datetime. */
  datetimeValue?: string;
  /** Called when date or time changes. Receives combined datetime string (YYYY-MM-DDTHH:mm) or ''. */
  onDateTimeChange?: (datetime: string) => void;
};

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const startOfWeek = (date: Date, weekStartsOn: 0 | 1) => {
  const day = date.getDay(); // 0 = Sun
  const diff = (day - weekStartsOn + 7) % 7;
  return addDays(date, -diff);
};

const startOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const endOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0);

const cloneDate = (date: Date) => new Date(date.getTime());

const InputDatepicker = ({
  value,
  onChange,
  disabled = false,
  label,
  range = true,
  withTime = false,
  timeValue,
  onTimeChange,
  datetimeValue,
  onDateTimeChange,
}: DatepickerProps) => {
  const [internalTime, setInternalTime] = useState("00:00");
  const today = new Date();

  // When withTime and datetimeValue/onDateTimeChange are used: single datetime string (YYYY-MM-DDTHH:mm or '')
  const useDateTime = withTime && datetimeValue !== undefined && onDateTimeChange;
  const [datePart, timePart] = useDateTime && datetimeValue ? datetimeValue.split("T") : [null, null];
  const singleDateFromDatetime = datePart || null;
  const displayTimeFromDatetime = timePart ? String(timePart).slice(0, 5) : "00:00";

  const displayTime = useDateTime ? displayTimeFromDatetime : (timeValue ?? internalTime);
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = e.target.value;
    setInternalTime(t);
    if (useDateTime) {
      const d = datePart || new Date().toISOString().slice(0, 10);
      onDateTimeChange(`${d}T${t}`);
    } else {
      onTimeChange?.(t);
    }
  };

  // When withTime: single datetime — use datetimeValue or normalize value to one date for both start/end
  const singleDate = useDateTime
    ? singleDateFromDatetime
    : (value?.startDate ?? value?.endDate ?? null);
  const singleDateTimeValue: DateValueType =
    singleDate != null
      ? ({ startDate: singleDate, endDate: singleDate } as DateValueType)
      : { startDate: null, endDate: null };
  const handleSingleDateTimeChange = (val: DateValueType) => {
    const d = val?.startDate ?? val?.endDate ?? null;
    if (useDateTime) {
      const dateStr = d != null ? (typeof d === "string" ? d : (d as Date).toISOString().slice(0, 10)) : "";
      onDateTimeChange(dateStr ? `${dateStr}T${displayTime}` : "");
    } else if (d != null && onChange) {
      onChange({ startDate: d, endDate: d });
    } else if (onChange) {
      onChange(val);
    }
  };

  const shortcuts = {
    today: {
      text: "Today",
      period: { start: cloneDate(today), end: cloneDate(today) },
    },
    thisWeekSunToday: {
      text: "This Week (Sun - Today)",
      period: { start: startOfWeek(today, 0), end: cloneDate(today) },
    },
    thisWeekMonToday: {
      text: "This Week (Mon - Today)",
      period: { start: startOfWeek(today, 1), end: cloneDate(today) },
    },
    last7Days: {
      text: "Last 7 Days",
      period: { start: addDays(today, -6), end: cloneDate(today) },
    },
    lastWeekSunSat: {
      text: "Last Week (Sun - Sat)",
      period: (() => {
        const end = addDays(startOfWeek(today, 0), -1);
        const start = addDays(end, -6);
        return { start, end };
      })(),
    },
    lastWeekMonSun: {
      text: "Last Week (Mon - Sun)",
      period: (() => {
        const end = addDays(startOfWeek(today, 1), -1);
        const start = addDays(end, -6);
        return { start, end };
      })(),
    },
    lastBusinessWeek: {
      text: "Last Business Week (Mon - Fri)",
      period: (() => {
        const start = addDays(startOfWeek(today, 1), -7);
        const end = addDays(start, 4);
        return { start, end };
      })(),
    },
    last14Days: {
      text: "Last 14 Days",
      period: { start: addDays(today, -13), end: cloneDate(today) },
    },
    thisMonth: {
      text: "This Month",
      period: { start: startOfMonth(today), end: endOfMonth(today) },
    },
    last30Days: {
      text: "Last 30 Days",
      period: { start: addDays(today, -29), end: cloneDate(today) },
    },
    lastMonth: {
      text: "Last Month",
      period: (() => {
        const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const end = endOfMonth(start);
        return { start, end };
      })(),
    },
  };

  return (
    <div className="space-y-1 z-[20]">
      {label ? (
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {label}
          </p>
        </div>
      ) : null}
      {withTime ? (
        <div className={`relative ${disabled ? "opacity-60 pointer-events-none" : ""}`}>
          <div className="h-10 w-full z-[80] pr-9 bg-white dark:bg-slate-800 rounded-md border text-sm shadow-none flex flex-row items-center overflow-hidden">
            <Datepicker
              value={singleDateTimeValue}
              onChange={handleSingleDateTimeChange}
              primaryColor="blue"
              useRange={false}
              asSingle={true}
              showShortcuts={false}
              containerClassName="w-[110px] z-[80] focus:outline-none focus:ring-0 focus:ring-transparent focus:ring-offset-0 focus:ring-offset-transparent focus-within:outline-none focus-within:ring-0 focus-within:ring-transparent focus-within:ring-offset-0 focus-within:ring-offset-transparent focus-within:shadow-none focus-within:border-slate-300 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 focus-visible:ring-offset-transparent"
              inputClassName="border-input w-full h-10 rounded-md pl-3 text-sm shadow-none focus:outline-none focus:ring-0 focus:ring-transparent focus:ring-offset-0 focus:ring-offset-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 focus-visible:ring-offset-transparent focus-visible:shadow-none focus:border-slate-300 dark:focus:border-slate-700 !ring-0 !outline-none !shadow-none !ring-offset-0 !ring-offset-transparent"
              configs={{ shortcuts }}
              disabled={disabled}
            />
            <input
              type="time"
              id="time"
              className="grow text-heading text-sm rounded-base focus:outline-none focus:ring-0 focus:ring-transparent focus:ring-offset-0 focus:ring-offset-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 focus-visible:ring-offset-transparent focus-visible:shadow-none focus:border-slate-300 dark:focus:border-slate-700 !ring-0 !outline-none !shadow-none !ring-offset-0 !ring-offset-transparent shadow-xs placeholder:text-body"
              value={displayTime}
              onChange={handleTimeChange}
              min="00:00"
              max="23:59"
              disabled={disabled}
            />
          </div>
        </div>
      ) : (
        <div className={`relative ${disabled ? "opacity-60 pointer-events-none" : ""}`}>
          <Datepicker
            value={value ?? { startDate: null, endDate: null }}
            onChange={onChange ?? (() => {})}
            primaryColor="blue"
            useRange={range}
            asSingle={!range}
            showShortcuts={range}
            containerClassName="w-full z-[80] focus:outline-none focus:ring-0 focus:ring-transparent focus:ring-offset-0 focus:ring-offset-transparent focus-within:outline-none focus-within:ring-0 focus-within:ring-transparent focus-within:ring-offset-0 focus-within:ring-offset-transparent focus-within:shadow-none focus-within:border-slate-300 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 focus-visible:ring-offset-transparent"
            inputClassName="border-input pr-9 w-full h-10 bg-white dark:bg-slate-800 rounded-md border px-3 text-sm shadow-none focus:outline-none focus:ring-0 focus:ring-transparent focus:ring-offset-0 focus:ring-offset-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 focus-visible:ring-offset-transparent focus-visible:shadow-none focus:border-slate-300 dark:focus:border-slate-700 !ring-0 !outline-none !shadow-none !ring-offset-0 !ring-offset-transparent"
            configs={{ shortcuts }}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
};

export default InputDatepicker;

