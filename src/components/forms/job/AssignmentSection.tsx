"use client";

import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import SelectInput from "@/src/components/input/select";
import { useMemo } from "react";
import { Users } from "lucide-react";

export default function AssignmentSection() {
  const { control } = useFormContext();

    const closestDistanceOptions = useMemo(
        () => [
                { label: "All", value: "all" },
                { label: "Closest Distance", value: "closest-distance" },
                { label: "Matching Skills", value: "matching-skills" },
                { label: "Matching Metro", value: "matching-metro" },
                {
                    label:
                        "Closest Distance + Matching Skill + Matching Metro",
                    value:
                        "closest-distance-matching-skill-matching-metro",
                },
            ],
        []
    );

    const technicianOptions = useMemo(
        () => [
                { label: "Unassigned", value: "unassigned" },
                { label: "John Smith", value: "john-smith" },
                { label: "Michael Cruz", value: "michael-cruz" },
                { label: "David Lee", value: "david-lee" },
                { label: "Chris Anderson", value: "chris-anderson" },
            ],
        []
    );

    const Required = () => (
        <span className="text-red-500">*</span>
    );

  return (
    <div className="space-y-10 border-t-2 border-slate-200 pt-6">
        <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Assignment</h3>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 items-start">

            {/* Closest Distance */}
            <FormField
            control={control}
            name="closestDistance"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Assignment Strategy <Required /> </FormLabel>

                <SelectInput
                    options={closestDistanceOptions}
                    // placeholder="Closest Distance"
                    value={field.value ?? ""}
                    onSelect={(val) => field.onChange(val)}
                />

                <FormMessage />
                </FormItem>
            )}
            />

            {/* Assigned Technician */}
            <FormField
            control={control}
            name="assignedTechnician"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Assigned Technician <Required /></FormLabel>

                <SelectInput
                    options={technicianOptions}
                    value={field.value}
                    onSelect={(val) => field.onChange(val)}
                />

                <FormMessage />
                </FormItem>
            )}
            />
        </div>
    </div>
  );
}
