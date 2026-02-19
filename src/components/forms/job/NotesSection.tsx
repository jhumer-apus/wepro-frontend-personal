"use client";

import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Textarea } from "@/src/components/ui/textarea";
import { FileText } from "lucide-react";

export default function NotesSection() {
  const { control } = useFormContext();

  return (
    <div className="space-y-10 border-t-2 border-slate-200 pt-6">
        <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Description & Notes</h3>
        </div>

        <FormField
            control={control}
            name="jobDescription"
            render={({ field }) => (
            <FormItem>
                <Textarea
                    {...field}
                    placeholder="Enter additional notes or job details..."
                    rows={4}
                />

                <FormMessage />
            </FormItem>
            )}
        />
        </div>
  );
}
