"use client";

import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";

import { Input } from "@/src/components/ui/input";
import SelectInput from "@/src/components/input/select";
import { useMemo } from "react";
import { Wrench } from "lucide-react";

export default function JobDetailsSection() {
  const { control } = useFormContext();

  const jobCategories = useMemo(
    () => [
      { label: "Plumbing", value: "Plumbing" },
      { label: "Electrical", value: "Electrical" },
      { label: "HVAC", value: "HVAC" },
      { label: "General", value: "General" },
    ],
    []
  );

  const jobTypes = useMemo(
    () => [
      { label: "Repair", value: "Repair" },
      { label: "Installation", value: "Installation" },
      { label: "Maintenance", value: "Maintenance" },
      { label: "Emergency", value: "Emergency" },
    ],
    []
  );

  const sources = useMemo(
    () => [
      { label: "Yelp", value: "yelp" },
      { label: "Google Ads", value: "google-ads" },
      { label: "Facebook", value: "facebook" },
      { label: "Referral", value: "referral" },
      { label: "Website", value: "website" },
      { label: "Direct Call", value: "phone" },
    ],
    []
  );

  const jobStatuses = useMemo(
    () => [
      { label: "Pending", value: "Pending" },
      { label: "Rejected", value: "Rejected" },
      { label: "No Answer", value: "No Answer" },
      { label: "Canceled", value: "Canceled" },
      { label: "Done", value: "Done" },
      { label: "In Progress", value: "In Progress" },
      { label: "Submitted", value: "Submitted" },
      { label: "Appointments", value: "Appointments" },
    ],
    []
  );

  const subStatuses = useMemo(
    () => [
      { label: "Nothing selected", value: "" },
      { label: "Follow up", value: "follow-up" },
      { label: "Rescheduled", value: "rescheduled" },
      { label: "No answer", value: "no-answer" },
      { label: "Customer cancelled", value: "customer-cancelled" },
      { label: "Pending confirmation", value: "pending-confirmation" },
    ],
    []
  );

  const jobTags = useMemo(
    () => [
      { label: "Urgent", value: "urgent" },
      { label: "Warranty", value: "warranty" },
      { label: "Follow-up", value: "follow-up" },
      { label: "Commercial", value: "commercial" },
      { label: "Test1", value: "test1" },
      { label: "Job", value: "job" },
    ],
    []
  );

  const jobTagNotes = useMemo(
    () => [
      { label: "Follow Up", value: "follow up" },
      { label: "Rescheduled", value: "rescheduled" },
      { label: "No Answer", value: "no answer" },
      { label: "Customer Cancelled", value: "customer cancelled" },
      { label: "Pending Confirmation", value: "pending confirmation" },
    ],
    []
  );

  const selectOptions = useMemo(
    () => [
      { name: "jobCategory", label: "Job Category", options: jobCategories, isRequired:true },
      { name: "jobType", label: "Job Type", options: jobTypes, isRequired:true },
      { name: "source", label: "Source", options: sources, isRequired:true },
      { name: "status", label: "Job Status", options: jobStatuses, isRequired:true },
      { name: "subStatus", label: "Sub Status", options: subStatuses },
      { name: "jobTags", label: "Jobs Tag", options: jobTags, multiple: true },
      { name: "noteTags", label: "Jobs Tag Note", options: jobTagNotes, multiple: true },
    ],
    [
      jobCategories,
      jobTypes,
      sources,
      jobStatuses,
      subStatuses,
      jobTags,
      jobTagNotes,
    ]
  );

  const Required = () => ( 
    <span className="text-red-500">*</span> 
  )

  return (
    <div className="space-y-10 border-t-2 border-slate-200 py-6">
      <div className="flex items-center gap-2">
        <Wrench className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Job Details</h3>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10">
        {/* Dynamic Select Fields */}
        {selectOptions.map(({ name, label, options, multiple, isRequired }) => (
          <div className="space-y-6">
            <FormField
              key={name}
              control={control}
              name={name as any}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-slate-800 flex items-center gap-1">
                    {label}
                    {isRequired && <Required />}
                  </FormLabel>

                  <SelectInput
                    options={options}
                    placeholder={`Select ${label}`}
                    value={field.value ?? (multiple ? [] : "")}
                    multiselect={multiple}
                    onSelect={(val) => field.onChange(val)}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
