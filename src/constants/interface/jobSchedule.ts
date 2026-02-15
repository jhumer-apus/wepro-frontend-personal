export type JobStatus =
  | "scheduled"
  | "in-progress"
  | "completed"
  | "urgent"
  | "unassigned";

export type JobType =
  | "HVAC"
  | "Plumbing"
  | "Electrical"
  | "Installation";

export type JobComplexity =
  | "simple"
  | "medium"
  | "complex";

export interface JobSchedule {
  id: string;
  title: string;
  client: string;
  clientPhone: string;
  address: string;
  technician: string;
  technicianId: string | null;
  status: JobStatus;
  jobType: string;
  estimatedDuration: number; // in minutes
  scheduledDate: string; // ISO date string
  scheduledTime: string; // HH:mm
  endTime: string; // HH:mm
  value: number;
  description: string;
  tags: string[];
  source: string;
  complexity: JobComplexity;
  metroArea: string;
  notes: string;
}
