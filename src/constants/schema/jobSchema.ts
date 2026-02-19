import { z } from "zod"

export const jobSchema = z.object({
    // =========================
    // Client Information
    // =========================
    clientName: z.string().min(1, "Client name is required"),
    companyName: z.string().optional(),
    email: z.email("Invalid email").optional().or(z.literal("")),
    phoneNumber: z.string().min(1, "Phone number is required"),
    phoneNumber2: z.string().optional(),

    // =========================
    // Service Location
    // =========================
    location: z.string().min(1, "Address is required"),
    apartmentNumber: z.string().optional(),
    city: z.string().min(1, "City is required"),
    zipCode: z.string().min(1, "Zip code is required"),
    state: z.string().min(1, "State is required"),
    country: z.string().min(1, "State is required"),

    // =========================
    // Job Details
    // =========================
    jobCategory: z.string().min(1, "Job Category is required"),
    jobType: z.string().min(1, "Job Type is required"),
    source: z
        .string()
        .min(1, "Source is required"),

    status: z.string().min(1, "Status is required"),
    subStatus: z.string().optional(),

    jobTags: z.array(z.string()).optional(),
    noteTags: z.array(z.string()).optional(),

    // =========================
    // Schedule
    // =========================
    startDate: z.string().min(1, "Start date is required"),
    startTime: z.string().min(1, "Start time is required"),

    endDate: z.string().optional(),
    estimatedEndTime: z.string().optional(),

    // =========================
    // Assignment
    // =========================
    closestDistance: z.string().optional(),
    assignedTechnician: z.string().optional(),

    // =========================
    // Notes
    // =========================
    jobDescription: z.string().optional(),
})
