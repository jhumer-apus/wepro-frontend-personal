import { useState } from "react";
import { jobsSchedules } from "../constants/dummyData/schedules";

type Filters = {
  searchTerm: string;
  statusFilter: string;
  technicianFilter: string;
  jobTypeFilter: string;
  dateRangeFilter: string;
  tagsFilter: string;
  metroAreaFilter: string;
  sourceFilter: string;
  companyFilter: string;
};
type FilterOption = {
  label: string;
  value: string;
};

type FilterConfig<K extends keyof Filters = keyof Filters> = {
  label: string;
  key: K;
  value: Filters[K];
  options: FilterOption[];
};


// Technicians data
const technicians = [
  { id: "T001", name: "Mike Rodriguez", skills: ["HVAC", "Electrical"], status: "available", color: "#3B82F6" },
  { id: "T002", name: "Sarah Wilson", skills: ["Plumbing", "General"], status: "busy", color: "#10B981" },
  { id: "T003", name: "David Chen", skills: ["Electrical", "Smart Home"], status: "available", color: "#8B5CF6" },
  { id: "T004", name: "Lisa Garcia", skills: ["Installation", "Garage Door"], status: "on-route", color: "#F59E0B" }
];

// Metro Area data
const metroAreas = [
  "Houston Metro",
  "Greater Houston"
];

// Sources data
const sources = Array.from(
  new Set(jobsSchedules.map(job => job.source).filter(Boolean))
);


// Companies data
const companies = Array.from(
  new Set(
    jobsSchedules
      .filter(job => job.tags.includes("Commercial"))
      .map(job => job.client)
  )
);


// Tags data (extracted from jobs)
const availableTags = [
  "Emergency",
  "Residential", 
  "Commercial",
  "Urgent",
  "Upgrade",
  "Installation",
  "Maintenance",
  "Replacement"
];
export const useScheduleOptions = () => {
    const [filters, setFilters] = useState<Filters>({
        searchTerm: '',
        statusFilter: 'all',
        technicianFilter: 'all',
        jobTypeFilter: 'all',
        dateRangeFilter: 'current',
        tagsFilter: 'all',
        metroAreaFilter: 'all',
        sourceFilter: 'all',     
        companyFilter: 'all',
    });

    const moreFiltersOption: FilterConfig[] = [
      {
        label: "Status",
        key: "statusFilter",
        value: filters.statusFilter,
        options: [
          { label: "All Status", value: "all" },
          { label: "Scheduled", value: "scheduled" },
          { label: "In Progress", value: "in-progress" },
          { label: "Completed", value: "completed" },
          { label: "Cancelled", value: "cancelled" },
          { label: "Unassigned", value: "unassigned" }
        ]
      },
      // {
      //   label: "Job Type",
      //   key: "jobTypeFilter",
      //   value: filters.jobTypeFilter,
      //   options: [
      //     { label: "All Types", value: "all" },
      //     { label: "HVAC", value: "HVAC" },
      //     { label: "Plumbing", value: "Plumbing" },
      //     { label: "Electrical", value: "Electrical" },
      //     { label: "Installation", value: "Installation" }
      //   ]
      // },
      {
        label: "Company",
        key: "companyFilter",
        value: filters.companyFilter,
        options: [
          { label: "All Companies", value: "all" },
          ...companies.map(company => ({
            label: company,
            value: company
          }))
        ]
      },
      {
        label: "Source",
        key: "sourceFilter",
        value: filters.sourceFilter,
        options: [
          { label: "All Sources", value: "all" },
          ...sources.map(source => ({
            label: source,
            value: source
          }))
        ]
      },

      {
        label: "Tags/Notes",
        key: "tagsFilter",
        value: filters.tagsFilter,
        options: [
          { label: "All Tags", value: "all" },
          ...availableTags.map(tag => ({
            label: tag,
            value: tag
          }))
        ]
      },
      {
        label: "Technician",
        key: "technicianFilter",
        value: filters.technicianFilter,
        options: [
          { label: "All Technicians", value: "all" },
          ...technicians.map(tech => ({
            label: tech.name,
            value: tech.id
          }))
        ]
      },
      {
        label: "Metro Area",
        key: "metroAreaFilter",
        value: filters.metroAreaFilter,
        options: [
          { label: "All Metro Areas", value: "all" },
          ...metroAreas.map(area => ({
            label: area,
            value: area
          }))
        ]
      },
    ];

    
    const handleFilterChange = (filterName:string, value:any) => {
        setFilters((prev:any) => ({
        ...prev,
        [filterName]: value
        }));
    };
    return {
        filters,
        handleFilterChange,
        moreFiltersOption,
        technicians,
        metroAreas,
        availableTags
    }
}