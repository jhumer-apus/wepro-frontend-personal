"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Plus } from "lucide-react";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobSchema } from "@/src/constants/schema/jobSchema";
import type { z } from "zod";

import JobDetailsSection from "../forms/job/JobDetailsSection";
import ClientInformationSection from "../forms/job/ClientInformationSection";
import ServiceLocationSection from "../forms/job/ServiceLocation";
import ScheduleSection from "../forms/job/ScheduleSection";

type JobFormValues = z.input<typeof jobSchema>;

interface Props {
  showNewJobDialog: boolean;
  setShowNewJobDialog: (open: boolean) => void;
  handleCreateJob: (data: JobFormValues) => void;
}

export default function CreateJobForm({
  showNewJobDialog,
  setShowNewJobDialog,
  handleCreateJob,
}: Props) {
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    mode: "onBlur",
    defaultValues: {
      clientName: "",
      companyName: "",
      email: "",
      phoneNumber: "",
      phoneNumber2: "",

      location: "",
      apartmentNumber: "",
      city: "",
      zipCode: "",
      state: "",
      country: "",

      jobCategory: "",
      jobType: "",
      source: "",

      status: "",
      subStatus: "",

      jobTags: [],
      noteTags: [],

      startDate: "",
      startTime: "",
      endDate: "",
      estimatedEndTime: "",

      closestDistance: "",
      assignedTechnician: "",

      jobDescription: "",
    },
  });

  const onSubmit = (data: JobFormValues) => {
    handleCreateJob(data);
    form.reset();
    setShowNewJobDialog(false);
  };

  return (
    <Dialog open={showNewJobDialog} onOpenChange={setShowNewJobDialog}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto pb-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-500" />
            Create New Job
          </DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-4"
          >
            <JobDetailsSection />
            <ClientInformationSection />
            <ServiceLocationSection />
            <ScheduleSection />

            {/* Footer Inside Form (Correct) */}
            <DialogFooter className="sticky bottom-0 pt-4 border-t bg-white">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewJobDialog(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="bg-accent-500 text-white hover:bg-accent-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Job
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
