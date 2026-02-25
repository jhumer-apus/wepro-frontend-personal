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
import { MapPin } from "lucide-react";

export default function ServiceLocationSection() {
  const { control } = useFormContext();

  const fields = useMemo(
    () => [
      { name: "location", label: "Address", isRequired: true },
      { name: "apartmentNumber", label: "Apartment / Unit" },
      { name: "city", label: "City", isRequired: true },
      { name: "state", label: "State", isRequired: true },
      { name: "zipCode", label: "Zip Code", isRequired: true },
      { name: "country", label: "Country", isRequired: true },
    ],
    []
  );

  const Required = () => (
    <span className="text-red-500">*</span>
  );

  return (
    <div className="space-y-10 border-t-2 border-slate-200 pt-6">
        <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Service Location</h3>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10">
            {fields.map(({ name, label, isRequired }) => (
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

                    <Input {...field} />

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
