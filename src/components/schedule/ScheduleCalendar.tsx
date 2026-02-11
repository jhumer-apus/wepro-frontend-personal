import { useState, useMemo, Fragment } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Calendar } from "@/src/components/ui/calendar";
import { Switch } from "@/src/components/ui/switch";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Search,
  Users,
  MapPin,
  Clock,
  Wrench,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Eye,
  Edit3,
  Trash2,
  Phone,
  Mail,
  Navigation,
  Zap,
  Target,
  Settings,
  Download,
  RefreshCw,
  Grid3X3,
  List,
  User,
  DollarSign
} from "lucide-react";
import { Job } from "@/src/constants/interface/jobs";
import DashboardFilter from "../dashboardFilter/DashboardFilter";
import { useScheduleOptions } from "@/src/hooks/use-schedule-options";
import { jobsSchedules } from "@/src/constants/dummyData/schedules";
import SelectInput from "../input/select";

export default function ScheduleCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 13)); // October 13, 2025
  const [viewMode, setViewMode] = useState("month"); // month, week, day
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showMoreJobsDialog, setShowMoreJobsDialog] = useState(false);
  const [moreJobsDate, setMoreJobsDate] = useState('');
  const [moreJobsList, setMoreJobsList] = useState([]);
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);

  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");

  // Drag and drop states
  const [activeJob, setActiveJob] = useState(null);
  const [draggedJob, setDraggedJob] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Resize states
  const [isResizing, setIsResizing] = useState(false);
  const [resizeJob, setResizeJob] = useState(null);
  const [resizeDirection, setResizeDirection] = useState(''); // 'start' or 'end'
  
  // Job backup for safety
  const [jobBackup, setJobBackup] = useState(null);
  
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
  const [jobs, setJobs] = useState(jobsSchedules);

  // HOOKS
  const { 
    filters, 
    handleFilterChange, 
    moreFiltersOption,  
    technicians,
    metroAreas,
  } = useScheduleOptions();


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

  // Helper function to get week days for week view
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayJobs = getJobsForDate(dateStr);
      const isToday = date.toDateString() === new Date().toDateString();
      
      weekDays.push({
        date: date,
        dateStr: dateStr,
        day: date.getDate(),
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        isToday,
        jobs: dayJobs
      });
    }
    
    return weekDays;
  };

  // Helper function to get jobs for current day in day view
  const getDayJobs = () => {
    const dateStr = currentDate.toISOString().split('T')[0];
    return getJobsForDate(dateStr);
  };

  // Handle showing more jobs for a specific date
  const handleShowMoreJobs = (dateStr:string) => {
    const dayJobs = getJobsForDate(dateStr);
    setMoreJobsDate(dateStr);
    setMoreJobsList(dayJobs);
    setShowMoreJobsDialog(true);
    console.log('📋 Showing more jobs for date:', dateStr, dayJobs);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800 border-blue-200";
      case "in-progress": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      case "unassigned": return "bg-gray-100 text-gray-800 border-gray-200";
      case "urgent": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case "scheduled": return "border-l-blue-500";
      case "in-progress": return "border-l-yellow-500";
      case "completed": return "border-l-green-500";
      case "cancelled": return "border-l-red-500";
      case "unassigned": return "border-l-gray-500";
      case "urgent": return "border-l-red-600";
      default: return "border-l-gray-500";
    }
  };

  const getTechnicianColor = (technicianId: string) => {
    const technician = technicians.find(t => t.id === technicianId);
    return technician ? technician.color : "#6B7280";
  };

  const getTechnicianName = (technicianId: string) => {
    const technician = technicians.find(t => t.id === technicianId);
    return technician ? technician.name : "Unassigned";
  };

  // Helper function to calculate end time based on start time and duration
  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    return endDate.toTimeString().slice(0, 5);
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
    
    const newJob = {
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
          const jobExists = prevJobs.find(j => j.id === jobToRestore.id);
          if (!jobExists) {
            console.log('🚨 Restoring missing job after abort');
            return [...prevJobs, jobToRestore];
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

  // Handle resize operations - ONLY END TIME (bottom resize)
  const handleResize = (e, job, direction) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only allow end time resize (bottom handle)
    if (direction !== 'end') {
      console.log('❌ Only end time resize allowed');
      return;
    }
    
    setIsResizing(true);
    setResizeJob(job);
    setResizeDirection(direction);
    
    const startY = e.clientY;
    const originalDuration = job.estimatedDuration;
    const originalStartTime = job.scheduledTime;
    
    console.log('🔄 Starting end time resize:', { job: job.id, originalDuration, originalStartTime });

    // Add visual feedback class to body
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (moveEvent) => {
      moveEvent.preventDefault();
      const deltaY = moveEvent.clientY - startY;
      
      // Sensitive resize - 32px per hour for better control
      const hoursDelta = deltaY / 32;
      const minutesDelta = Math.round(hoursDelta * 60 / 15) * 15; // 15-minute increments
      
      // Calculate new duration - only extend/shorten from original start time
      const newDuration = Math.max(15, originalDuration + minutesDelta); // Minimum 15 minutes
      const newEndTime = calculateEndTime(originalStartTime, newDuration);
      
      console.log('🔄 Resizing end time:', { minutesDelta, newDuration, newEndTime });
      
      // Only update if there's a meaningful change
      if (Math.abs(minutesDelta) >= 15) {
        // Update the job with smooth visual feedback
        setJobs(prevJobs => 
          prevJobs.map(j => 
            j.id === job.id 
              ? {
                  ...j,
                  estimatedDuration: newDuration,
                  endTime: newEndTime
                  // scheduledTime stays the same - only end time changes
                }
              : j
          )
        );
        
        setRefreshKey(prev => prev + 1);
      }
    };

    const handleMouseUp = () => {
      console.log('✅ End time resize completed');
      
      // Reset cursor and selection
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      setIsResizing(false);
      setResizeJob(null);
      setResizeDirection('');
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Final refresh to ensure state is consistent
      setRefreshKey(prev => prev + 1);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(currentDate.getMonth() + direction);
    } else if (viewMode === "week") {
      newDate.setDate(currentDate.getDate() + (direction * 7));
    } else if (viewMode === "day") {
      newDate.setDate(currentDate.getDate() + direction);
    }
    setCurrentDate(newDate);
  };

  // Draggable Job Component
  const DraggableJob = ({ job, children, className = "" }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      isDragging,
    } = useDraggable({ id: job.id });

    const style = {
      transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`${className} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} transition-opacity`}
      >
        {children}
      </div>
    );
  };

  // Resizable Job Component for Week and Day views
  const ResizableJob = ({ job, children, className = "", viewMode = "week" }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      isDragging,
    } = useDraggable({ 
      id: job.id,
      data: {
        type: 'job',
        job: job
      }
    });

    const style = {
      transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      opacity: isDragging ? 0.5 : 1,
    };

    // Calculate job height based on duration (for visual representation)
    const jobDurationHours = job.estimatedDuration / 60;
    const jobHeight = Math.max(jobDurationHours * 48, 24); // 48px per hour for better proportions, minimum 24px

    const handleResizeStart = (direction, e) => {
      e.stopPropagation();
      setIsResizing(true);
      setResizeJob(job);
      setResizeDirection(direction);
      console.log('🔄 Resize started:', { job: job.id, direction });
    };

    const handleResizeEnd = (e) => {
      e.stopPropagation();
      if (isResizing) {
        setIsResizing(false);
        setResizeJob(null);
        setResizeDirection('');
        console.log('🔄 Resize ended');
      }
    };

    return (
      <div
        ref={setNodeRef}
        style={{ ...style, height: `${jobHeight}px`, minHeight: '24px' }}
        className={`${className} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} transition-opacity relative group`}
        {...attributes}
        onPointerDown={(e) => {
          // Check if clicking on resize handle - if so, don't start drag
          if (e.target.closest('.resize-handle')) {
            console.log('🚫 Clicked resize handle - not starting drag');
            return;
          }
          
          // Start drag for job area clicks
          console.log('✅ Clicked job area - starting drag');
          if (listeners.onPointerDown) {
            listeners.onPointerDown(e);
          }
        }}
      >
        {children}
        
        {/* Resize handle - only bottom (end time) in week/day view */}
        {(viewMode === "week" || viewMode === "day") && !isDragging && (
          <>
            {/* Bottom resize handle - Extend/Shorten Duration Only */}
            <div
              className="resize-handle absolute -bottom-1 left-0 right-0 h-4 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-all duration-200 bg-gradient-to-t from-blue-500/40 to-transparent hover:from-blue-500/60 z-20"
              data-direction="end"
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleResize(e, job, 'end');
              }}
              title="Drag to extend/shorten job duration"
            >
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-3 bg-blue-500 rounded-full shadow-md flex items-center justify-center hover:bg-blue-600 transition-colors">
                <div className="w-8 h-0.5 bg-white rounded-full"></div>
              </div>
              <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 text-xs text-blue-600 font-medium whitespace-nowrap">
                ⏱️
              </div>
            </div>
            
            {/* Simple resize feedback - no popups */}
            {isResizing && resizeJob?.id === job.id && (
              <div className="absolute inset-0 bg-blue-500/5 border border-blue-400 rounded pointer-events-none"></div>
            )}
          </>
        )}
      </div>
    );
  };

  // Droppable Area Component
  const DroppableArea = ({ id, children, className = "", onClick }) => {
    const { isOver, setNodeRef } = useDroppable({ 
      id,
      data: {
        type: 'timeslot',
        accepts: ['job']
      }
    });

    return (
      <div
        ref={setNodeRef}
        className={`droppable-area ${className} transition-colors duration-200 ${isOver ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-300' : ''}`}
        onClick={onClick}
        data-droppable-id={id}
      >
        {children}
      </div>
    );
  };

  // const toggleList = [
  //   { label: "Month", value: "month" },
  //   { label: "Week", value: "week" },
  //   { label: "Day", value: "day" }
  // ]

  const viewModeOptions = [
    { 
      label: "Month", 
      value: "month",
      viewMode: viewMode === "month" ? "default" : "ghost",
      icon: <Grid3X3 className="w-4 h-4 mr-2" />
    },
    { 
      label: "Week", 
      value: "week",
      viewMode: viewMode === "week" ? "default" : "ghost",
      icon: <List className="w-4 h-4 mr-2" />
    },
    { 
      label: "Day", 
      value: "day",
      viewMode: viewMode === "day" ? "default" : "ghost",
      icon: <CalendarIcon className="w-4 h-4 mr-2" />
    }
  ];
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

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
        <div className="flex justify-end">
          <Button 
            onClick={() => setShowNewJobDialog(true)}
            className="bg-accent-600 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Job
          </Button>
        </div>
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Calendar Navigation */}
          <Card className="shadow-xl bg-white/80 backdrop-blur-sm mt-4">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-b">
              <div className="flex mb-8 bg-white/80 w-fit backdrop-blur-sm border border-slate-200 rounded-xl p-1 shadow-sm"> 
                {viewModeOptions.map((option,index) => (
                  <Button
                    key={index}
                    variant={viewMode === option.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode(option.value)}
                    className={viewMode === option.value ? "bg-accent-600 text-white shadow-md" : ""}
                  >
                    {option.icon}
                    {option.label}
                  </Button>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth(-1)}
                      className="bg-white/50 backdrop-blur-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <h2 className="text-2xl font-bold">
                      {viewMode === "month" && `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                      {viewMode === "week" && `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                      {viewMode === "day" && currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth(1)}
                      className="bg-white/50 backdrop-blur-sm"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                    className="bg-white/50 backdrop-blur-sm"
                  >
                    Today
                  </Button>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{filteredJobs.length} jobs</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0" key={refreshKey}>
              {/* Month View */}
              {viewMode === "month" && (
                <>
                  <div className="grid grid-cols-7 border-b">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day} className="p-4 text-center font-semibold text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7">
                    {calendarDays.map((day, index) => (
                      <DroppableArea
                        key={index}
                        id={`day-${day.dateStr}`}
                        className={`min-h-[120px] p-2 border-r border-b transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-950 cursor-pointer ${
                          !day.isCurrentMonth 
                            ? 'bg-neutral-50 dark:bg-neutral-900 text-neutral-400' 
                            : day.isToday 
                            ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500 ring-inset' 
                            : 'bg-white dark:bg-neutral-950'
                        }`}
                        onClick={(e) => {
                          // Only trigger if clicking on empty space (not on a job)
                          if (e.target === e.currentTarget || e.target.closest('.day-header')) {
                            handleEmptySpotClick(day.dateStr);
                          }
                        }}
                      >
                        <div className="flex justify-between items-start mb-2 day-header">
                          <span className={`text-sm font-medium ${
                            day.isToday ? 'text-blue-600 font-bold' : 
                            !day.isCurrentMonth ? 'text-neutral-400' : 
                            'text-neutral-700 dark:text-neutral-300'
                          }`}>
                            {day.day}
                          </span>
                          {day.jobs.length > 0 && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                              {day.jobs.length}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          {day.jobs.slice(0, 3).map((job) => (
                            <DraggableJob key={job.id} job={job}>
                              <div
                                className={`p-2 rounded-lg text-xs hover:shadow-md transition-all duration-200 border-l-4 ${getStatusColor(job.status)} ${getStatusBorderColor(job.status)}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedJob(job);
                                  setShowJobDetails(true);
                                }}
                              >
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="font-medium truncate">{job.title}</span>
                                </div>
                                <div className="text-xs opacity-75">
                                  {job.scheduledTime} • {job.client}
                                </div>
                                <div className="flex items-center gap-1 text-xs opacity-75">
                                  <div 
                                    className="w-2 h-2 rounded-full" 
                                    style={{ backgroundColor: getTechnicianColor(job.technicianId) }}
                                  />
                                  <span>{getTechnicianName(job.technicianId)}</span>
                                </div>
                              </div>
                            </DraggableJob>
                          ))}
                          {day.jobs.length > 3 && (
                            <div 
                              className="text-xs text-center text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline hover:bg-blue-50 dark:hover:bg-blue-900 rounded px-1 py-0.5 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShowMoreJobs(day.dateStr);
                              }}
                            >
                              +{day.jobs.length - 3} more
                            </div>
                          )}
                        </div>
                      </DroppableArea>
                    ))}
                  </div>
                </>
              )}

              {/* Week View */}
              {viewMode === "week" && (
                <>
                  <div className="grid grid-cols-8 border-b">
                    <div className="p-4 text-center font-semibold text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900">
                      Time
                    </div>
                    {getWeekDays().map((day, index) => (
                      <div key={index} className="p-4 text-center font-semibold text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900">
                        <div className="text-sm">{day.dayName}</div>
                        <div className={`text-lg font-bold ${day.isToday ? 'text-blue-600' : ''}`}>
                          {day.day}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-8 min-h-[600px]">
                    {/* Time slots */}
                    <div className="border-r">
                      {Array.from({ length: 12 }, (_, i) => i + 8).map((hour) => (
                        <div key={hour} className="h-16 border-b p-2 text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-900">
                          {hour}:00
                        </div>
                      ))}
                    </div>
                    
                    {/* Week days */}
                    {getWeekDays().map((day, dayIndex) => (
                      <div key={dayIndex} className={`border-r relative ${day.isToday ? 'bg-blue-50 dark:bg-blue-950' : ''}`}>
                        {Array.from({ length: 12 }, (_, i) => i + 8).map((hour) => (
                          <DroppableArea
                            key={hour}
                            id={`timeslot-${day.dateStr}-${hour}`}
                            className="h-16 border-b hover:bg-blue-50 dark:hover:bg-blue-950 cursor-pointer transition-colors relative overflow-hidden"
                            onClick={(e) => {
                              // Only trigger if clicking on empty space (not on a job)
                              if (e.target === e.currentTarget || e.target.closest('.droppable-area')) {
                                const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                                handleEmptySpotClick(day.dateStr, timeStr);
                              }
                            }}
                          >
                            {(() => {
                              const timeSlotJobs = day.jobs.filter(job => {
                                const jobHour = parseInt(job.scheduledTime.split(':')[0]);
                                return jobHour === hour;
                              });
                              
                              if (timeSlotJobs.length === 0) {
                                return null;
                              } else if (timeSlotJobs.length === 1) {
                                // Single job - full width
                                const job = timeSlotJobs[0];
                                return (
                                  <ResizableJob key={job.id} job={job} viewMode="week" className="h-full p-0.5">
                                    <div
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedJob(job);
                                        setShowJobDetails(true);
                                      }}
                                      className={`text-xs p-1.5 rounded transition-all duration-200 hover:shadow-md border-l-2 ${getStatusColor(job.status)} ${getStatusBorderColor(job.status)} h-full flex flex-col justify-between`}
                                    >
                                      <div className="flex items-center gap-1 mb-1">
                                        <span className="font-medium truncate">{job.title}</span>
                                      </div>
                                      <div className="text-xs opacity-75 truncate">{job.client}</div>
                                      <div className="flex items-center gap-1 text-xs opacity-75 mt-1">
                                        <div 
                                          className="w-1.5 h-1.5 rounded-full" 
                                          style={{ backgroundColor: getTechnicianColor(job.technicianId) }}
                                        />
                                        <span className="truncate">{getTechnicianName(job.technicianId)}</span>
                                      </div>
                                    </div>
                                  </ResizableJob>
                                );
                              } else if (timeSlotJobs.length === 2) {
                                // Two jobs - side by side
                                return (
                                  <div className="flex gap-0.5 h-full p-0.5">
                                    {timeSlotJobs.map((job) => (
                                      <ResizableJob key={job.id} job={job} viewMode="week" className="flex-1">
                                        <div
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedJob(job);
                                            setShowJobDetails(true);
                                          }}
                                          className={`text-xs p-1 rounded transition-all duration-200 hover:shadow-md border-l-2 ${getStatusColor(job.status)} ${getStatusBorderColor(job.status)} h-full flex flex-col justify-center`}
                                        >
                                          <div className="flex items-center gap-1 mb-0.5">
                                            <span className="font-medium truncate text-xs">{job.title.substring(0, 8)}...</span>
                                          </div>
                                          <div className="text-xs opacity-75 truncate">{job.client.substring(0, 10)}...</div>
                                          <div 
                                            className="w-1 h-1 rounded-full mt-0.5" 
                                            style={{ backgroundColor: getTechnicianColor(job.technicianId) }}
                                          />
                                        </div>
                                      </ResizableJob>
                                    ))}
                                  </div>
                                );
                              } else if (timeSlotJobs.length <= 4) {
                                // 3-4 jobs - compact grid layout
                                return (
                                  <div className="h-full p-0.5">
                                    <div className="grid grid-cols-2 gap-0.5 h-full">
                                      {timeSlotJobs.slice(0, 4).map((job) => (
                                        <ResizableJob key={job.id} job={job} viewMode="week" className="h-full">
                                          <div
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedJob(job);
                                              setShowJobDetails(true);
                                            }}
                                            className={`text-xs p-0.5 rounded transition-all duration-200 hover:shadow-md border-l-2 ${getStatusColor(job.status)} ${getStatusBorderColor(job.status)} h-full flex flex-col items-center justify-center`}
                                          >
                                            <span className="font-medium text-xs truncate w-full text-center">{job.title.substring(0, 4)}</span>
                                            <div 
                                              className="w-1 h-1 rounded-full mt-0.5" 
                                              style={{ backgroundColor: getTechnicianColor(job.technicianId) }}
                                            />
                                          </div>
                                        </ResizableJob>
                                      ))}
                                    </div>
                                  </div>
                                );
                              } else {
                                // 5+ jobs - ultra compact with counter
                                return (
                                  <div className="h-full p-0.5 flex flex-col">
                                    <div className="flex-1 grid grid-cols-2 gap-0.5">
                                      {timeSlotJobs.slice(0, 3).map((job) => (
                                        <ResizableJob key={job.id} job={job} viewMode="week" className="h-full">
                                          <div
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedJob(job);
                                              setShowJobDetails(true);
                                            }}
                                            className={`text-xs p-0.5 rounded transition-all duration-200 hover:shadow-md border-l-1 ${getStatusColor(job.status)} ${getStatusBorderColor(job.status)} h-full flex items-center justify-center`}
                                          >
                                          </div>
                                        </ResizableJob>
                                      ))}
                                      <div className="flex items-center justify-center text-xs text-blue-700 font-bold bg-blue-100 rounded border border-blue-300">
                                        +{timeSlotJobs.length - 3}
                                      </div>
                                    </div>
                                    <div className="h-3 flex items-center justify-center text-xs text-blue-600 font-medium bg-blue-50 rounded mt-0.5">
                                      {timeSlotJobs.length} jobs
                                    </div>
                                  </div>
                                );
                              }
                            })()}
                          </DroppableArea>
                        ))}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Day View */}
              {viewMode === "day" && (
                <>
                  <div className="border-b p-4 bg-neutral-50 dark:bg-neutral-900">
                    <div className="text-center">
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
                      </div>
                      <div className={`text-2xl font-bold ${
                        currentDate.toDateString() === new Date().toDateString() ? 'text-blue-600' : ''
                      }`}>
                        {currentDate.getDate()}
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 min-h-[600px]">
                    {/* Time slots */}
                    <div className="border-r">
                      {Array.from({ length: 12 }, (_, i) => i + 8).map((hour) => (
                        <div key={hour} className="h-16 border-b p-2 text-sm text-neutral-500 bg-neutral-50 dark:bg-neutral-900 flex items-center">
                          {hour}:00
                        </div>
                      ))}
                    </div>
                    
                    {/* Day schedule */}
                    <div className="relative">
                      {Array.from({ length: 12 }, (_, i) => i + 8).map((hour) => (
                        <DroppableArea
                          key={hour}
                          id={`timeslot-${currentDate.toISOString().split('T')[0]}-${hour}`}
                          className="h-16 border-b hover:bg-blue-50 dark:hover:bg-blue-950 cursor-pointer transition-colors relative overflow-hidden"
                          onClick={(e) => {
                            // Only trigger if clicking on empty space (not on a job)
                            if (e.target === e.currentTarget) {
                              const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                              handleEmptySpotClick(currentDate.toISOString().split('T')[0], timeStr);
                            }
                          }}
                        >
                          {(() => {
                            const timeSlotJobs = getDayJobs().filter(job => {
                              const jobHour = parseInt(job.scheduledTime.split(':')[0]);
                              return jobHour === hour;
                            });
                            
                            if (timeSlotJobs.length === 0) {
                              return null;
                            } else if (timeSlotJobs.length === 1) {
                              // Single job - full height and width
                              const job = timeSlotJobs[0];
                              return (
                                <ResizableJob key={job.id} job={job} viewMode="day" className="h-full p-1">
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedJob(job);
                                      setShowJobDetails(true);
                                    }}
                                    className={`p-2 rounded transition-all duration-200 hover:shadow-md border-l-3 ${getStatusColor(job.status)} ${getStatusBorderColor(job.status)} h-full flex flex-col justify-between`}
                                  >
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-sm">{job.title}</span>
                                      </div>
                                      <div className="text-xs opacity-75 mb-1">{job.client}</div>
                                    </div>
                                    <div>
                                      <div className="text-xs font-medium mb-1">{job.scheduledTime} - {job.endTime}</div>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                          <div 
                                            className="w-2 h-2 rounded-full" 
                                            style={{ backgroundColor: getTechnicianColor(job.technicianId) }}
                                          />
                                          <span className="text-xs font-medium">{getTechnicianName(job.technicianId)}</span>
                                        </div>
                                        <div className="text-xs text-green-600 font-medium">${job.value.toFixed(2)}</div>
                                      </div>
                                    </div>
                                  </div>
                                </ResizableJob>
                              );
                            } else if (timeSlotJobs.length <= 3) {
                              // 2-3 jobs - stacked layout with good spacing
                              return (
                                <div className="h-full p-1 flex flex-col gap-0.5">
                                  {timeSlotJobs.map((job) => (
                                    <ResizableJob 
                                      key={job.id} 
                                      job={job} 
                                      viewMode="day" 
                                      className="flex-1"
                                    >
                                      <div
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedJob(job);
                                          setShowJobDetails(true);
                                        }}
                                        className={`p-1.5 rounded transition-all duration-200 hover:shadow-md border-l-2 ${getStatusColor(job.status)} ${getStatusBorderColor(job.status)} h-full flex items-center gap-2`}
                                      >
                                        <div className="flex-1 min-w-0">
                                          <div className="font-semibold text-xs truncate">{job.title}</div>
                                          <div className="text-xs opacity-75 truncate">{job.client}</div>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                          <div 
                                            className="w-1.5 h-1.5 rounded-full" 
                                            style={{ backgroundColor: getTechnicianColor(job.technicianId) }}
                                          />
                                          <span className="text-xs font-medium">{getTechnicianName(job.technicianId).split(' ')[0]}</span>
                                        </div>
                                      </div>
                                    </ResizableJob>
                                  ))}
                                </div>
                              );
                            } else {
                              // 4+ jobs - ultra compact with smart display
                              return (
                                <div className="h-full p-0.5 flex flex-col gap-0.5">
                                  {/* Show first 3 jobs in compact format */}
                                  <div className="flex-1 grid grid-cols-3 gap-0.5">
                                    {timeSlotJobs.slice(0, 3).map((job) => (
                                      <ResizableJob key={job.id} job={job} viewMode="day" className="h-full">
                                        <div
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedJob(job);
                                            setShowJobDetails(true);
                                          }}
                                          className={`text-xs p-0.5 rounded transition-all duration-200 hover:shadow-md border-l-1 ${getStatusColor(job.status)} ${getStatusBorderColor(job.status)} h-full flex flex-col items-center justify-center`}
                                        >
                                          <span className="font-medium text-xs truncate w-full text-center">{job.title.substring(0, 3)}</span>
                                          <div 
                                            className="w-1 h-1 rounded-full mt-0.5" 
                                            style={{ backgroundColor: getTechnicianColor(job.technicianId) }}
                                          />
                                        </div>
                                      </ResizableJob>
                                    ))}
                                  </div>
                                  {/* Counter for remaining jobs */}
                                  <div className="h-4 flex items-center justify-center text-xs text-blue-700 font-bold bg-gradient-to-r from-blue-100 to-cyan-100 rounded border border-blue-300">
                                    {timeSlotJobs.length} jobs • +{timeSlotJobs.length - 3} more
                                  </div>
                                </div>
                              );
                            }
                          })()}
                        </DroppableArea>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Job Details Dialog */}
          <Dialog open={showJobDetails} onOpenChange={setShowJobDetails}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Job Details
                </DialogTitle>
              </DialogHeader>
              {selectedJob && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Job Information</Label>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Job ID:</span>
                            <span className="text-sm font-medium">{selectedJob.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Service:</span>
                            <span className="text-sm">{selectedJob.title}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Type:</span>
                            <span className="text-sm">{selectedJob.jobType}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Customer Information</Label>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Client:</span>
                            <span className="text-sm font-medium">{selectedJob.client}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Phone:</span>
                            <span className="text-sm">{selectedJob.clientPhone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Address:</span>
                            <span className="text-sm">{selectedJob.address}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Scheduling</Label>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Date:</span>
                            <span className="text-sm font-medium">{selectedJob.scheduledDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Time:</span>
                            <span className="text-sm">{selectedJob.scheduledTime} - {selectedJob.endTime}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Duration:</span>
                            <span className="text-sm">{selectedJob.estimatedDuration} minutes</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Technician:</span>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: getTechnicianColor(selectedJob.technicianId) }}
                              />
                              <span className="text-sm font-medium">{getTechnicianName(selectedJob.technicianId)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Job Details</Label>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Value:</span>
                            <span className="text-sm font-medium">${selectedJob.value.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Source:</span>
                            <span className="text-sm">{selectedJob.source}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Status:</span>
                            <Badge className={getStatusColor(selectedJob.status)}>
                              {selectedJob.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Description</Label>
                    <p className="text-sm mt-1 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                      {selectedJob.description}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1 bg-accent-500 text-white hover:bg-accent-600">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Job
                    </Button>
                    <Button variant="outline">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Client
                    </Button>
                    <Button variant="outline">
                      <Navigation className="w-4 h-4 mr-2" />
                      Directions
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* New Job Dialog */}
          <Dialog open={showNewJobDialog} onOpenChange={setShowNewJobDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-500" />
                  Create New Job
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title *</Label>
                      <Input
                        id="title"
                        value={newJobData.title}
                        onChange={(e) => setNewJobData({...newJobData, title: e.target.value})}
                        placeholder="e.g., HVAC System Repair"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobType">Job Type</Label>
                      <Select value={newJobData.jobType} onValueChange={(value) => setNewJobData({...newJobData, jobType: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HVAC">HVAC</SelectItem>
                          <SelectItem value="Plumbing">Plumbing</SelectItem>
                          <SelectItem value="Electrical">Electrical</SelectItem>
                          <SelectItem value="Installation">Installation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      className="w-full p-2 border border-neutral-300 rounded-md resize-none h-20"
                      value={newJobData.description}
                      onChange={(e) => setNewJobData({...newJobData, description: e.target.value})}
                      placeholder="Describe the job details..."
                    />
                  </div>
                </div>

                {/* Client Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Client Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client">Client Name *</Label>
                      <Input
                        id="client"
                        value={newJobData.client}
                        onChange={(e) => setNewJobData({...newJobData, client: e.target.value})}
                        placeholder="Client or company name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientPhone">Phone Number</Label>
                      <Input
                        id="clientPhone"
                        value={newJobData.clientPhone}
                        onChange={(e) => setNewJobData({...newJobData, clientPhone: e.target.value})}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={newJobData.address}
                      onChange={(e) => setNewJobData({...newJobData, address: e.target.value})}
                      placeholder="Full address including city and state"
                    />
                  </div>
                </div>

                {/* Scheduling */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Scheduling</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="scheduledDate">Date</Label>
                      <Input
                        id="scheduledDate"
                        type="date"
                        value={newJobData.scheduledDate}
                        onChange={(e) => setNewJobData({...newJobData, scheduledDate: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scheduledTime">Start Time</Label>
                      <Input
                        id="scheduledTime"
                        type="time"
                        value={newJobData.scheduledTime}
                        onChange={(e) => {
                          const newTime = e.target.value;
                          const endTime = calculateEndTime(newTime, newJobData.estimatedDuration);
                          setNewJobData({...newJobData, scheduledTime: newTime, endTime});
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedDuration">Duration (minutes)</Label>
                      <Input
                        id="estimatedDuration"
                        type="number"
                        value={newJobData.estimatedDuration}
                        onChange={(e) => {
                          const duration = parseInt(e.target.value) || 120;
                          const endTime = calculateEndTime(newJobData.scheduledTime, duration);
                          setNewJobData({...newJobData, estimatedDuration: duration, endTime});
                        }}
                        min="30"
                        step="30"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="technician">Technician</Label>
                      <Select value={newJobData.technicianId} onValueChange={(value) => setNewJobData({...newJobData, technicianId: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {technicians.map((tech) => (
                            <SelectItem key={tech.id} value={tech.id}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: tech.color }}
                                />
                                {tech.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Additional Details</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="value">Job Value ($)</Label>
                      <Input
                        id="value"
                        type="number"
                        value={newJobData.value}
                        onChange={(e) => setNewJobData({...newJobData, value: parseFloat(e.target.value) || 0})}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="metroArea">Metro Area</Label>
                      <Select value={newJobData.metroArea} onValueChange={(value) => setNewJobData({...newJobData, metroArea: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {metroAreas.map((area) => (
                            <SelectItem key={area} value={area}>
                              {area}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <textarea
                      id="notes"
                      className="w-full p-2 border border-neutral-300 rounded-md resize-none h-16"
                      value={newJobData.notes}
                      onChange={(e) => setNewJobData({...newJobData, notes: e.target.value})}
                      placeholder="Additional notes or special instructions..."
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowNewJobDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateJob}
                    disabled={!newJobData.title || !newJobData.client || !newJobData.address}
                    className="bg-accent-500 text-white hover:bg-accent-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Job
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* More Jobs Dialog */}
          <Dialog open={showMoreJobsDialog} onOpenChange={setShowMoreJobsDialog}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-blue-500" />
                  All Jobs for {moreJobsDate ? new Date(moreJobsDate + 'T00:00:00').toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : ''}
                  <Badge variant="secondary" className="ml-2">
                    {moreJobsList.length} jobs
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              
              <div className="overflow-y-auto max-h-[60vh]">
                <div className="space-y-3">
                  {moreJobsList
                    .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))
                    .map((job) => (
                      <div
                        key={job.id}
                        className={`p-4 rounded-lg border-l-4 ${getStatusColor(job.status)} ${getStatusBorderColor(job.status)} hover:shadow-md transition-all duration-200 cursor-pointer`}
                        onClick={() => {
                          setSelectedJob(job);
                          setShowJobDetails(true);
                          setShowMoreJobsDialog(false);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{job.title}</h3>
                              <Badge className={getStatusColor(job.status)}>
                                {job.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <User className="w-4 h-4 text-neutral-500" />
                                  <span className="font-medium">{job.client}</span>
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Phone className="w-4 h-4 text-neutral-500" />
                                  <span>{job.clientPhone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-neutral-500" />
                                  <span className="text-neutral-600">{job.address}</span>
                                </div>
                              </div>
                              
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Clock className="w-4 h-4 text-neutral-500" />
                                  <span className="font-medium">{job.scheduledTime} - {job.endTime}</span>
                                  <span className="text-neutral-500">({job.estimatedDuration}m)</span>
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: getTechnicianColor(job.technicianId) }}
                                  />
                                  <span className="font-medium">{getTechnicianName(job.technicianId)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-green-500" />
                                  <span className="font-medium text-green-600">${job.value.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                            
                            {job.description && (
                              <div className="mt-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded">
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">{job.description}</p>
                              </div>
                            )}
                            
                            {job.tags && job.tags.length > 0 && (
                              <div className="mt-2 flex gap-2">
                                {job.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedJob(job);
                                setShowJobDetails(true);
                                setShowMoreJobsDialog(false);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle edit job (placeholder)
                                console.log('Edit job:', job.id);
                              }}
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowMoreJobsDialog(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setShowMoreJobsDialog(false);
                    handleEmptySpotClick(moreJobsDate);
                  }}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Job
                </Button>
              </div>
            </DialogContent>
          </Dialog>

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
