"use client";

import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import InputDatepicker from "../../input/datepicker";
import { Calendar } from "lucide-react";

export default function ScheduleSection() {
  const { control, setValue, watch } = useFormContext();

  const startDate = watch("startDate");
  const startTime = watch("startTime");
  const endDate = watch("endDate");
  const estimatedEndTime = watch("estimatedEndTime");

  const Required = () => (
    <span className="text-red-500">*</span>
  );

  return (
    <div className="space-y-10 border-t-2 border-slate-200 pt-6">
        <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Schedule</h3>
        </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-10 items-center">

        {/* Start DateTime */}
        <FormField
          control={control}
          name="startDate"
          render={() => (
            <FormItem>
              <FormLabel className="flex text-slate-800 items-center gap-1">
                Start Date & Time <Required />
              </FormLabel>

              <InputDatepicker
                label=""
                range={false}
                withTime={true}
                datetimeValue={
                  startDate && startTime
                    ? `${startDate}T${startTime}`
                    : ""
                }
                onDateTimeChange={(value) => {
                  if (value) {
                    const [date, time] = value.split("T");
                    setValue("startDate", date || "", { shouldValidate: true });
                    setValue("startTime", time || "", { shouldValidate: true });
                  } else {
                    setValue("startDate", "", { shouldValidate: true });
                    setValue("startTime", "", { shouldValidate: true });
                  }
                }}
              />

              <FormMessage />
            </FormItem>
          )}
        />

        {/* End DateTime */}
        <FormField
          control={control}
          name="endDate"
          render={() => (
            <FormItem>
                <FormLabel className="flex text-slate-800 items-center gap-1">
                    End Date & Time <Required />
                </FormLabel>
                <InputDatepicker
                    label=""
                    range={false}
                    withTime={true}
                    datetimeValue={
                    endDate && estimatedEndTime
                        ? `${endDate}T${estimatedEndTime}`
                        : ""
                    }
                    onDateTimeChange={(value) => {
                    if (value) {
                        const [date, time] = value.split("T");
                        setValue("endDate", date || "", { shouldValidate: true });
                        setValue("estimatedEndTime", time || "", {
                        shouldValidate: true,
                        });
                    } else {
                        setValue("endDate", "", { shouldValidate: true });
                        setValue("estimatedEndTime", "", {
                        shouldValidate: true,
                        });
                    }
                    }}
                />

                <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
