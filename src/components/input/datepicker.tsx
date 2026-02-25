'use client';

// import dynamic from "next/dynamic";
import type { DateValueType } from "react-tailwindcss-datepicker";
import Datepicker from "react-tailwindcss-datepicker";
import { Label } from "@/src/components/ui/label";

const DatepickerWithCustomTime = Datepicker as unknown as React.ComponentType<any>;

type DatepickerProps = {
  value?: DateValueType;
  onChange?: (value: DateValueType) => void;
  disabled?: boolean;
  label?: string;
  range?: boolean;
  withTime?: boolean;
  minuteInterval?: number;
  isMilitary?: boolean;
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
const to12HourTime = (time24: string) => {
  const [h, m] = time24.split(":");
  const hourNum = Number(h);
  if (!Number.isFinite(hourNum)) return "";
  const period = hourNum >= 12 ? "PM" : "AM";
  const hour12 = hourNum % 12 === 0 ? 12 : hourNum % 12;
  return `${String(hour12).padStart(2, "0")}:${m} ${period}`;
};

const formatDateAsLocalYmd = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const normalizeTimeForPicker = (rawTime: string) => {
  const value = String(rawTime).trim();
  const twelveHourMatch = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (twelveHourMatch) {
    const [, h, m, period] = twelveHourMatch;
    return `${String(Number(h)).padStart(2, "0")}:${m} ${period.toUpperCase()}`;
  }

  const twentyFourHourMatch = value.match(/^(\d{1,2}):(\d{2})/);
  if (twentyFourHourMatch) {
    const [, h, m] = twentyFourHourMatch;
    return to12HourTime(`${String(Number(h)).padStart(2, "0")}:${m}`);
  }

  return "";
};

const normalizeTimeForMilitaryPicker = (rawTime: string) => {
  const value = String(rawTime).trim();
  const twelveHourMatch = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (twelveHourMatch) {
    const [, h, m, period] = twelveHourMatch;
    const hourNum = Number(h);
    if (!Number.isFinite(hourNum)) return "";
    const hour24 = period.toUpperCase() === "PM" ? (hourNum % 12) + 12 : hourNum % 12;
    return `${String(hour24).padStart(2, "0")}:${m}`;
  }

  const twentyFourHourMatch = value.match(/^(\d{1,2}):(\d{2})/);
  if (twentyFourHourMatch) {
    const [, h, m] = twentyFourHourMatch;
    return `${String(Number(h)).padStart(2, "0")}:${m}`;
  }

  return "";
};

const InputDatepicker = ({
  value,
  onChange,
  disabled = false,
  label,
  range = true,
  withTime = false,
  minuteInterval = 15,
  isMilitary = true,
  datetimeValue,
  onDateTimeChange,
}: DatepickerProps) => {
  const today = new Date();
  // When withTime and datetimeValue/onDateTimeChange are used: single datetime string (YYYY-MM-DDTHH:mm or '')
  const useDateTime = withTime && datetimeValue !== undefined && onDateTimeChange;
  const [datePart, timePart] = useDateTime && datetimeValue ? datetimeValue.split("T") : [null, null];
  const singleDateFromDatetime = datePart || null;
  const pickerTimeValue = (() => {
    if (timePart) {
      return isMilitary
        ? normalizeTimeForMilitaryPicker(timePart)
        : normalizeTimeForPicker(timePart);
    }
    return "";
  })();
  const renderedTime = pickerTimeValue;
  const shouldShowTimePlaceholder = renderedTime == null || renderedTime === "";

  // When withTime: single datetime — use datetimeValue or normalize value to one date for both start/end
  const singleDate = useDateTime
    ? singleDateFromDatetime
    : (value?.startDate ?? value?.endDate ?? null);
  const singleDateTimeValue: DateValueType =
    singleDate != null
      ? ({ startDate: singleDate, endDate: singleDate } as DateValueType)
      : { startDate: null, endDate: null };
  const handleSingleDateTimeChange = (val: DateValueType) => {
    const selectedTime = (val as DateValueType & { time?: string })?.time;
    const d = val?.startDate ?? val?.endDate ?? null;
    if (useDateTime) {
      const dateStr = d != null ? (typeof d === "string" ? d : formatDateAsLocalYmd(d as Date)) : "";
      const effectiveTime = typeof selectedTime === "string" ? selectedTime : pickerTimeValue;
      onDateTimeChange(dateStr && effectiveTime ? `${dateStr}T${effectiveTime}` : "");
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
        <Label className="text-sm font-medium">{label}</Label>
      ) : null}
      {withTime ? (
        <div className={`relative ${disabled ? "opacity-60 pointer-events-none" : ""}`}>
          <div className="h-10 w-full z-[80] pr-9 bg-white dark:bg-slate-800 rounded-md border text-sm shadow-none flex flex-row items-center overflow-hidden">
            <DatepickerWithCustomTime
              value={singleDateTimeValue}
              timeValue={pickerTimeValue}
              onChange={handleSingleDateTimeChange}
              primaryColor="blue"
              useRange={false}
              asSingle={true}
              showShortcuts={false}
              containerClassName="w-[220px] z-[80] focus:outline-none focus:ring-0 focus:ring-transparent focus:ring-offset-0 focus:ring-offset-transparent focus-within:outline-none focus-within:ring-0 focus-within:ring-transparent focus-within:ring-offset-0 focus-within:ring-offset-transparent focus-within:shadow-none focus-within:border-slate-300 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 focus-visible:ring-offset-transparent"
              inputClassName="border-input w-full h-10 rounded-md pl-3 text-sm shadow-none focus:outline-none focus:ring-0 focus:ring-transparent focus:ring-offset-0 focus:ring-offset-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 focus-visible:ring-offset-transparent focus-visible:shadow-none focus:border-slate-300 dark:focus:border-slate-700 !ring-0 !outline-none !shadow-none !ring-offset-0 !ring-offset-transparent"
              configs={{ shortcuts }}
              disabled={disabled}
              withTime={withTime}
              minuteInterval={minuteInterval}
              isMilitary={isMilitary}
              showFooter={withTime}
              onReset={() => {
                (onDateTimeChange as ((datetime?: string) => void) | undefined)?.(undefined);
              }}
            />
            {/* <div>
              <p className={shouldShowTimePlaceholder ? "text-slate-400 dark:text-slate-500" : ""}>
                {shouldShowTimePlaceholder ? "hh:mm AM/PM" : renderedTime}
              </p>
            </div> */}
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

