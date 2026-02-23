import { useState, useMemo } from "react";
import { Label } from "@/src/components/ui/label";
import { Switch } from "@/src/components/ui/switch";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useScheduleOptions } from "@/src/hooks/use-schedule-options";
import { jobsSchedules } from "@/src/constants/dummyData/schedules";
import { calculateEndTime } from "@/src/lib/calculate";
import { JobSchedule } from "@/src/constants/interface/jobSchedule";
import { useTechnician } from "@/src/hooks/useTechnician";
import { getStatusBorderColor, getStatusColor } from "@/src/lib/color";
import DashboardFilter from "@/src/components/dashboardFilter/DashboardFilter";
import SelectInput from "@/src/components/input/select";
import JobScheduleDetailsDialog from "@/src/components/schedule/JobScheduleDetailsDialog";
import NewJobScheduleDialog from "@/src/components/schedule/NewJobScheduleDialog";
import MoreJobsDialog from "@/src/components/schedule/MoreJobsDialog";
import ScheduleCalendar from "@/src/components/schedule/calendar/ScheduleCalendar";
import CreateJobForm from "@/src/components/forms/CreateJobForm";

export default function ScheduleIndex() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 13)); // October 13, 2025
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month"); // month, week, day
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobSchedule | null>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showMoreJobsDialog, setShowMoreJobsDialog] = useState(false);
  const [moreJobsDate, setMoreJobsDate] = useState('');
  const [moreJobsList, setMoreJobsList] = useState<JobSchedule[]>([]);
  const [returnToMoreJobsDate, setReturnToMoreJobsDate] = useState<string | null>(null);
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);

  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");

  // Drag and drop states
  const [activeJob, setActiveJob] = useState<JobSchedule | null>(null);
  const [draggedJob, setDraggedJob] = useState<JobSchedule | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Resize states
  const [isResizing, setIsResizing] = useState(false);
  const [resizeJob, setResizeJob] = useState<JobSchedule | null>(null);
  const [resizeDirection, setResizeDirection] = useState(''); // 'start' or 'end'
  
  // Job backup for safety
  const [jobBackup, setJobBackup] = useState<JobSchedule | null>(null);
  
  // New job creation states
  const [showNewJobDialog, setShowNewJobDialog] = useState(false);
  const [newJobData, setNewJobData] = useState({
    title: "",
    client: "",
    clientPhone: "",
    address: "",
    description: "",
    jobType: "HVAC",
    estimatedDuration: 120,
    scheduledDate: "",
    scheduledTime: "09:00",
    endTime: "11:00",
    value: 0,
    technicianId: "unassigned",
    metroArea: "Houston Metro",
    tags: [],
    notes: ""
  });

  // Sample job data with scheduling information - using state for proper updates
  const [jobs, setJobs] = useState<JobSchedule[]>(jobsSchedules);

  // HOOKS
  const { 
    filters, 
    handleFilterChange, 
    moreFiltersOption,  
    technicians,
    metroAreas,
  } = useScheduleOptions();
  const { getTechnicianColor, getTechnicianName } = useTechnician();


  // Filter jobs based on current filters
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = searchTerm === "" || 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filters.statusFilter === "all" || job.status === filters.statusFilter;
      const matchesTechnician = filters.technicianFilter === "all" || job.technicianId === filters.technicianFilter;
      // const matchesJobType = filters.jobTypeFilter === "all" || job.jobType === filters.jobTypeFilter;
      const matchesTags = filters.tagsFilter === "all" || job.tags.includes(filters.tagsFilter);
      const matchesMetroArea = filters.metroAreaFilter === "all" || job.metroArea === filters.metroAreaFilter;
      const matchesSource = filters.sourceFilter === "all" || job.source === filters.sourceFilter;
      const matchesCompany = filters.companyFilter === "all" || job.client === filters.companyFilter;
      
      // Unassigned filter logic
      const matchesUnassigned = !showUnassignedOnly || 
        (job.technicianId === "unassigned" || job.status === "unassigned" || job.technician === "Unassigned");
      
      return matchesSearch && 
        matchesStatus && 
        matchesTechnician && 
        // matchesJobType && 
        matchesTags && 
        matchesSource && 
        matchesCompany && 
        matchesMetroArea && 
        matchesUnassigned;
    });
  }, [jobs, searchTerm, filters]);
  // Get jobs for current view
  const getJobsForDate = (date: string) => {
    return filteredJobs.filter(job => job.scheduledDate === date);
  };

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDateStr = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayJobs = getJobsForDate(dateStr);
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === currentDateStr.toDateString();
      
      days.push({
        date: date,
        dateStr: dateStr,
        day: date.getDate(),
        isCurrentMonth,
        isToday,
        jobs: dayJobs
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  // Handle showing more jobs for a specific date
  const handleShowMoreJobs = (dateStr:string) => {
    const dayJobs = getJobsForDate(dateStr);
    setMoreJobsDate(dateStr);
    setMoreJobsList(dayJobs);
    setShowMoreJobsDialog(true);
    console.log('📋 Showing more jobs for date:', dateStr, dayJobs);
  };

  // Handle clicking on empty calendar spots
  const handleEmptySpotClick = (date: string, time?: string) => {
    const clickTime = time || "09:00";
    const endTime = calculateEndTime(clickTime, newJobData.estimatedDuration);
    
    setNewJobData({
      ...newJobData,
      scheduledDate: date,
      scheduledTime: clickTime,
      endTime: endTime
    });
    setShowNewJobDialog(true);
  };

  // Handle new job form submission
  const handleCreateJob = () => {
    // Generate new job ID based on current jobs length
    const newId = `J${String(jobs.length + 1).padStart(3, '0')}`;
    
    const newJob:JobSchedule = {
      id: newId,
      title: newJobData.title,
      client: newJobData.client,
      clientPhone: newJobData.clientPhone,
      address: newJobData.address,
      technician: getTechnicianName(newJobData.technicianId),
      technicianId: newJobData.technicianId,
      status: newJobData.technicianId === "unassigned" ? "unassigned" : "scheduled",
      jobType: newJobData.jobType,
      estimatedDuration: newJobData.estimatedDuration,
      scheduledDate: newJobData.scheduledDate,
      scheduledTime: newJobData.scheduledTime,
      endTime: newJobData.endTime,
      value: newJobData.value,
      description: newJobData.description,
      tags: newJobData.tags,
      source: "Manual Entry",
      complexity: "medium",
      metroArea: newJobData.metroArea,
      notes: newJobData.notes
    };

    // Add to jobs array (in a real app, this would be an API call)
    setJobs(prevJobs => [...prevJobs, newJob]);
    
    // Reset form and close dialog
    setNewJobData({
      title: "",
      client: "",
      clientPhone: "",
      address: "",
      description: "",
      jobType: "HVAC",
      estimatedDuration: 120,
      scheduledDate: "",
      scheduledTime: "09:00",
      endTime: "11:00",
      value: 0,
      technicianId: "unassigned",
      metroArea: "Houston Metro",
      tags: [],
      notes: ""
    });
    setShowNewJobDialog(false);
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const job = jobs.find(j => j.id === active.id);
    console.log('🚀 Drag start:', { activeId: active.id, job });
    
    if (!job) {
      console.error('🚨 Job not found for drag start:', active.id);
      return;
    }
    
    // Create backup of the job before any operations
    setJobBackup({ ...job });
    setActiveJob(job);
    setDraggedJob(job);
    
    console.log('💾 Job backup created:', job.id);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    console.log('=== DRAG END EVENT ===');
    console.log('Active ID:', active?.id);
    console.log('Over ID:', over?.id);
    console.log('Dragged Job:', draggedJob);
    
    if (!over || !draggedJob) {
      console.log('❌ No drop target or dragged job - aborting');
      // Even if we abort, make sure the job doesn't disappear
      if (draggedJob || jobBackup) {
        console.log('🔄 Ensuring job persists after abort');
        setJobs(prevJobs => {
          const jobToRestore = jobBackup || draggedJob;
          const jobExists = prevJobs.find(j => j.id === jobToRestore?.id);
          if (!jobExists) {
            console.log('🚨 Restoring missing job after abort');
            return [...prevJobs, jobToRestore as JobSchedule];
          }
          return prevJobs;
        });
        setRefreshKey(prev => prev + 1);
      }
      setActiveJob(null);
      setDraggedJob(null);
      setJobBackup(null);
      return;
    }

    const overId = over.id as string;
    console.log('🎯 Drop target ID:', overId);
    
    // Parse the drop target with more robust logic
    let newDate = '';
    let newTime = '';
    let parseSuccess = false;
    
    try {
      if (overId.startsWith('day-')) {
        // Month view: day-2025-10-15
        newDate = overId.replace('day-', '');
        newTime = draggedJob.scheduledTime; // Keep original time
        parseSuccess = true;
        console.log('📅 Month view drop:', { newDate, newTime });
      } else if (overId.startsWith('timeslot-')) {
        // Week/Day view: timeslot-2025-10-15-14
        const parts = overId.split('-');
        console.log('🕐 Timeslot parts:', parts);
        console.log('🕐 Parts length:', parts.length);
        
        if (parts.length >= 4) { // timeslot, year, month, day, hour
          newDate = `${parts[1]}-${parts[2]}-${parts[3]}`;
          const hourPart = parts[4];
          newTime = `${hourPart.padStart(2, '0')}:00`;
          parseSuccess = true;
          console.log('🕐 WEEK/DAY VIEW DROP SUCCESS:', { newDate, newTime, hourPart, originalParts: parts });
        } else {
          console.error('❌ Invalid timeslot format for week/day view:', { parts, length: parts.length, overId });
          // Try alternative parsing for week/day views
          if (parts.length === 3) {
            // Maybe format is different - try parsing as timeslot-date-hour
            newDate = parts[1];
            const hourPart = parts[2];
            newTime = `${hourPart.padStart(2, '0')}:00`;
            parseSuccess = true;
            console.log('🕐 ALTERNATIVE PARSING SUCCESS:', { newDate, newTime, hourPart });
          }
        }
      } else {
        console.error('❌ Unknown drop target format:', overId);
      }
    } catch (error) {
      console.error('❌ Error parsing drop target:', error);
    }

    console.log('📊 Parse result:', { parseSuccess, newDate, newTime, originalDate: draggedJob.scheduledDate, originalTime: draggedJob.scheduledTime });

    // ALWAYS update the job to prevent disappearing, even if drop target parsing fails
    if (parseSuccess && newDate && newTime) {
      // Update job with new schedule
      const endTime = calculateEndTime(newTime, draggedJob.estimatedDuration);
      console.log('✅ Updating job schedule:', { jobId: draggedJob.id, newDate, newTime, endTime });
      
      setJobs(prevJobs => {
        // Ensure the job exists in the array before updating
        const jobExists = prevJobs.find(j => j.id === draggedJob.id);
        if (!jobExists) {
          console.log('🚨 Job missing during update - adding with new schedule');
          const restoredJob = {
            ...(jobBackup || draggedJob),
            scheduledDate: newDate,
            scheduledTime: newTime,
            endTime: endTime
          };
          return [...prevJobs, restoredJob];
        }
        
        const updatedJobs = prevJobs.map(job => 
          job.id === draggedJob.id 
            ? {
                ...job,
                scheduledDate: newDate,
                scheduledTime: newTime,
                endTime: endTime
              }
            : job
        );
        const updatedJob = updatedJobs.find(j => j.id === draggedJob.id);
        console.log('✅ Job updated successfully:', updatedJob);
        return updatedJobs;
      });
    } else {
      console.log('⚠️ Parse failed - keeping job in original position');
      // Ensure the job stays in the jobs array even if drop fails
      setJobs(prevJobs => {
        // Make sure the dragged job is still in the array
        const jobToRestore = jobBackup || draggedJob;
        const jobExists = prevJobs.find(j => j.id === jobToRestore.id);
        if (!jobExists) {
          console.log('🚨 Job missing from array - restoring from backup');
          return [...prevJobs, jobToRestore];
        }
        return prevJobs;
      });
    }
    
    // Always force refresh to ensure calendar updates properly
    setRefreshKey(prev => prev + 1);
    console.log('🔄 Calendar refresh triggered');

    // Multiple safety checks to prevent job disappearing
    const performSafetyChecks = () => {
      setJobs(prevJobs => {
        const draggedJobId = draggedJob?.id || jobBackup?.id;
        if (!draggedJobId) return prevJobs;
        
        const jobExists = prevJobs.find(j => j.id === draggedJobId);
        if (!jobExists) {
          const jobToRestore = jobBackup || draggedJob;
          console.log('🚨 SAFETY CHECK: Job missing - restoring from backup:', jobToRestore.id);
          return [...prevJobs, jobToRestore];
        }
        console.log('✅ SAFETY CHECK: Job exists in array:', draggedJobId);
        return prevJobs;
      });
    };

    // Immediate safety check
    performSafetyChecks();
    
    // Delayed safety checks for complex layouts (3+ jobs)
    setTimeout(performSafetyChecks, 50);
    setTimeout(performSafetyChecks, 150);
    setTimeout(performSafetyChecks, 300);
    setTimeout(performSafetyChecks, 500); // Extra check for very complex layouts

    // Clean up
    setActiveJob(null);
    setDraggedJob(null);
    setJobBackup(null);
    console.log('=== DRAG END COMPLETE ===');
  };


  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <DashboardFilter 
        title="Schedule Calendar"
        description="Advanced job scheduling and calendar management"
        searchQuery={searchTerm} 
        renderToggleOptions={(
          <div className="">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Show Unassigned Jobs Only</Label>
              <Switch 
                checked={showUnassignedOnly} 
                onCheckedChange={(value) => setShowUnassignedOnly(value)}
                className="
                  data-[state=checked]:bg-accent-500
                  data-[state=unchecked]:bg-neutral-300
                "
              />
            </div>
            <p className="text-xs text-neutral-500">
              Toggle to show only jobs that need technician assignment
            </p>
          </div>
        )}
        onChangeSearchQuery={(query) => setSearchTerm(query)} 
        moreFilters={
            moreFiltersOption.map((filter,index) => (
              <SelectInput
                key={index}
                label={filter.label}
                options={filter.options}
                placeholder={`All ${filter.label}`}
                value={filters[filter.key]}
                onSelect={val => handleFilterChange(filter.key, val)}
              />
            ))}
      />

      <div className="bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Calendar Navigation */}
          <ScheduleCalendar
            calendarDays={calendarDays}
            handleEmptySpotClick={handleEmptySpotClick}
            selectedJob={selectedJob}
            setSelectedJob={setSelectedJob}
            setShowJobDetails={setShowJobDetails}
            setCurrentDate={setCurrentDate}
            currentDate={currentDate}
            viewMode={viewMode}
            setViewMode={setViewMode}
            filteredJobs={filteredJobs}
            refreshKey={refreshKey}
            setRefreshKey={setRefreshKey}
            isResizing={isResizing}
            resizeJob={resizeJob}
            resizeDirection={resizeDirection}
            setIsResizing={setIsResizing}
            setResizeJob={setResizeJob}
            setResizeDirection={setResizeDirection}
            handleShowMoreJobs={handleShowMoreJobs} 
            setJobs={setJobs}
          />
          
          {/* Job Details Dialog */}
          <JobScheduleDetailsDialog
            open={showJobDetails}
            onOpenChange={(open) => {
              setShowJobDetails(open);
              if (!open) setReturnToMoreJobsDate(null);
            }}
            job={selectedJob}
            getTechnicianColor={getTechnicianColor}
            getTechnicianName={getTechnicianName}
            getStatusColor={getStatusColor}
            onEdit={(job) => console.log("Edit", job)}
            onCall={(job) => console.log("Call", job)}
            onDirections={(job) => console.log("Directions", job)}
            onBackToMoreJobs={
              returnToMoreJobsDate
                ? () => {
                    setShowJobDetails(false);
                    setMoreJobsDate(returnToMoreJobsDate);
                    setMoreJobsList(getJobsForDate(returnToMoreJobsDate));
                    setShowMoreJobsDialog(true);
                    setReturnToMoreJobsDate(null);
                  }
                : undefined
            }
          />

          {/* New Job Dialog */}
          <CreateJobForm 
            showNewJobDialog={showNewJobDialog}
            setShowNewJobDialog={setShowNewJobDialog}
            newJobData={newJobData}
            setNewJobData={setNewJobData}
            calculateEndTime={calculateEndTime}
            technicians={technicians}
            metroAreas={metroAreas}
            handleCreateJob={handleCreateJob}
          />
          {/* <NewJobScheduleDialog
            showNewJobDialog={showNewJobDialog}
            setShowNewJobDialog={setShowNewJobDialog}
            newJobData={newJobData}
            setNewJobData={setNewJobData}
            calculateEndTime={calculateEndTime}
            technicians={technicians}
            metroAreas={metroAreas}
            handleCreateJob={handleCreateJob}
          /> */}


          {/* More Jobs Dialog */}
          <MoreJobsDialog
            showMoreJobsDialog={showMoreJobsDialog}
            setShowMoreJobsDialog={setShowMoreJobsDialog}
            moreJobsDate={moreJobsDate}
            moreJobsList={moreJobsList}
            setSelectedJob={setSelectedJob}
            setShowJobDetails={setShowJobDetails}
            handleEmptySpotClick={handleEmptySpotClick}
            onViewDetails={(job, dateStr) => {
              setReturnToMoreJobsDate(dateStr);
              setSelectedJob(job);
              setShowMoreJobsDialog(false);
              setShowJobDetails(true);
            }}
          />

          {/* Drag Overlay */}
          <DragOverlay>
            {activeJob ? (
              <div className={`p-2 rounded-lg text-xs border-l-4 ${getStatusColor(activeJob.status)} ${getStatusBorderColor(activeJob.status)} shadow-lg opacity-90`}>
                <div className="flex items-center gap-1 mb-1">
                  <span className="font-medium">{activeJob.title}</span>
                </div>
                <div className="text-xs opacity-75">{activeJob.scheduledTime} • {activeJob.client}</div>
              </div>
            ) : null}
          </DragOverlay>
        </div>
      </div>
    </DndContext>
  );
}
