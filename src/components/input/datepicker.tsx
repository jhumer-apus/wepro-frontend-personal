'use client';

import dynamic from "next/dynamic";
import type { DateValueType } from "react-tailwindcss-datepicker";

type DatepickerProps = {
  value: DateValueType;
  onChange: (value: DateValueType) => void;
  disabled?: boolean;
  label?: string;
};

const Datepicker = dynamic(() => import("react-tailwindcss-datepicker"), {
  ssr: false,
});

const InputDatepicker = ({
  value,
  onChange,
  disabled = false,
  label,
}: DatepickerProps) => {
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
          containerClassName="w-full z-[80]"
          inputClassName="aaa pr-9 w-full h-10 bg-white dark:bg-slate-800 rounded-md border border-slate-300 dark:border-slate-700 px-3 text-sm"
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default InputDatepicker;

