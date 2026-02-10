'use client';

// import dynamic from "next/dynamic";
import type { DateValueType } from "react-tailwindcss-datepicker";
import Datepicker from "react-tailwindcss-datepicker";

type DatepickerProps = {
  value: DateValueType;
  onChange: (value: DateValueType) => void;
  disabled?: boolean;
  label?: string;
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
}: DatepickerProps) => {
  const today = new Date();

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
      <div className={`relative ${disabled ? "opacity-60 pointer-events-none" : ""}`}>
        <Datepicker
          value={value}
          onChange={onChange}
          primaryColor="blue"
          useRange={false}
          showShortcuts={true}
          containerClassName="w-full z-[80] focus:outline-none focus:ring-0 focus:ring-transparent focus:ring-offset-0 focus:ring-offset-transparent focus-within:outline-none focus-within:ring-0 focus-within:ring-transparent focus-within:ring-offset-0 focus-within:ring-offset-transparent focus-within:shadow-none focus-within:border-slate-300 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 focus-visible:ring-offset-transparent"
          inputClassName="border-input pr-9 w-full h-10 bg-white dark:bg-slate-800 rounded-md border px-3 text-sm shadow-none focus:outline-none focus:ring-0 focus:ring-transparent focus:ring-offset-0 focus:ring-offset-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 focus-visible:ring-offset-transparent focus-visible:shadow-none focus:border-slate-300 dark:focus:border-slate-700 !ring-0 !outline-none !shadow-none !ring-offset-0 !ring-offset-transparent"
          configs={{ shortcuts }}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default InputDatepicker;

