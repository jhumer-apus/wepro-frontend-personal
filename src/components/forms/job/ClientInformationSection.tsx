"use client";

import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { useMemo } from "react";
import { User } from "lucide-react";

export default function ClientInformationSection() {
  const { control } = useFormContext();

  const fields = useMemo(
    () => [
      { name: "clientName", label: "Client Name", isRequired: true },
      { name: "companyName", label: "Company Name" },
      { name: "email", label: "Email", type: "email" },
      { name: "phoneNumber", label: "Phone Number", isRequired: true },
      { name: "phoneNumber2", label: "Secondary Phone" },
    ],
    []
  );

  const Required = () => (
    <span className="text-red-500">*</span>
  );

  return (
    <div className="space-y-10 border-t-2 border-slate-200 py-6">
      <div className="flex items-center gap-2">
        <User className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Client Information</h3>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-10">
        {fields.map(({ name, label, type, isRequired }) => (
          <div key={name} className="space-y-6">
            <FormField
              control={control}
              name={name as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1 text-slate-800">
                    {label}
                    {isRequired && <Required />}
                  </FormLabel>

                  <Input
                    type={type || "text"}
                    {...field}
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
