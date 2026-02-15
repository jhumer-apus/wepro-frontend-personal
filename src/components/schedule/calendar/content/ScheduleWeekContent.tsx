import { Fragment, SetStateAction } from "react";
import DroppableArea from "./DroppableArea";
import ResizableJob from "./ResizableJob";
import { JobSchedule } from "@/src/constants/interface/jobSchedule";
import { useTechnician } from "@/src/hooks/useTechnician";
import { getStatusBorderColor, getStatusColor } from "@/src/lib/color";

interface Props {
    calendarDays: any[];
    handleEmptySpotClick: (dateStr: string, timeStr: string) => void;
    filteredJobs: any[];
    currentDate: Date;
    resizeJob: JobSchedule | null;
    setSelectedJob: (job: any) => void;
    setShowJobDetails: (show: boolean) => void;
    setIsResizing: React.Dispatch<React.SetStateAction<boolean>>;
    setResizeJob: React.Dispatch<React.SetStateAction<JobSchedule | null>>;
    setResizeDirection: React.Dispatch<React.SetStateAction<string>>;
    setJobs: React.Dispatch<React.SetStateAction<JobSchedule[]>>;
    setRefreshKey: React.Dispatch<React.SetStateAction<number>>;
    isResizing: boolean;
    
}
export default function ScheduleWeekContent(props: Props) {

    const { getTechnicianColor, getTechnicianName } = useTechnician();
    const { 
        calendarDays,
        resizeJob,
        handleEmptySpotClick,
        filteredJobs,
        currentDate,
        setSelectedJob,
        setShowJobDetails,
        setIsResizing,
        setResizeJob,
        setResizeDirection,
        setJobs,
        setRefreshKey,
        isResizing
    } = props;

    const getJobsForDate = (date: string) => {
        return filteredJobs.filter(job => job.scheduledDate === date);
    };
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
    return (
        <Fragment>
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
                            <ResizableJob 
                                key={job.id}
                                job={job}
                                viewMode="week"
                                className="h-full p-0.5"
                                isResizing={isResizing}
                                setIsResizing={setIsResizing}
                                setResizeJob={setResizeJob}
                                setResizeDirection={setResizeDirection}
                                setJobs={setJobs}
                                setRefreshKey={setRefreshKey} 
                                resizeJob={null
                            
                                }                            >
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
                                        <ResizableJob 
                                            key={job.id} job={job} 
                                            viewMode="week" 
                                            className="flex-1" 
                                            isResizing={isResizing} 
                                            setIsResizing={setIsResizing} 
                                            setResizeJob={setResizeJob} 
                                            setResizeDirection={setResizeDirection} 
                                            setJobs={setJobs} 
                                            setRefreshKey={setRefreshKey}
                                            resizeJob={resizeJob}
                                        >
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
                                            <ResizableJob 
                                                key={job.id} 
                                                job={job} 
                                                viewMode="week" 
                                                className="h-full" 
                                                isResizing={false} 
                                                setIsResizing={setIsResizing} 
                                                setResizeJob={setResizeJob}
                                                setResizeDirection={setResizeDirection}
                                                setJobs={setJobs}
                                                setRefreshKey={setRefreshKey}
                                                resizeJob={resizeJob}
                                            >
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
                                            <ResizableJob 
                                                key={job.id} 
                                                job={job} 
                                                viewMode="week" 
                                                className="h-full"
                                                isResizing={false}
                                                setIsResizing={setIsResizing} 
                                                setResizeJob={setResizeJob} 
                                                setResizeDirection={setResizeDirection}
                                                setJobs={setJobs}
                                                setRefreshKey={setRefreshKey}
                                                resizeJob={resizeJob}
                                            >
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
        </Fragment>
    )
}