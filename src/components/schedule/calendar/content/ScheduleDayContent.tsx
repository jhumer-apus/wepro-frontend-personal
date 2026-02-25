import { Fragment, SetStateAction } from "react";
import DroppableArea from "./DroppableArea";
import ResizableJob from "./ResizableJob";
import { getStatusBorderColor, getStatusColor } from "@/src/lib/color";
import { JobSchedule } from "@/src/constants/interface/jobSchedule";
import { useTechnician } from "@/src/hooks/useTechnician";

interface Props {
    currentDate: Date;
    getDayJobs: () => any[];
    handleEmptySpotClick: (dateStr: string, timeStr: string) => void;
    setSelectedJob: (job: any) => void;
    setShowJobDetails: (show: boolean) => void;
    isResizing: boolean;
    resizeJob: JobSchedule | null;
    resizeDirection: string;
    setIsResizing: React.Dispatch<React.SetStateAction<boolean>>;
    setResizeJob: React.Dispatch<React.SetStateAction<JobSchedule | null>>;
    setResizeDirection: React.Dispatch<React.SetStateAction<string>>;
    setJobs: React.Dispatch<React.SetStateAction<JobSchedule[]>>;
    setRefreshKey: React.Dispatch<React.SetStateAction<number>>;
}
export default function ScheduleDayContent(props: Props) {
    const { 
        currentDate, 
        getDayJobs, 
        handleEmptySpotClick, 
        setSelectedJob, 
        setShowJobDetails,
        isResizing,
        resizeJob,
        resizeDirection,
        setIsResizing,
        setResizeJob,
        setResizeDirection,
        setJobs,
        setRefreshKey
    } = props;

    const { getTechnicianColor, getTechnicianName } = useTechnician();
    return (
        <Fragment>
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
                                    <ResizableJob 
                                        key={job.id}
                                        job={job}
                                        viewMode="day"
                                        className="h-full p-1" 
                                        isResizing={isResizing} 
                                        setIsResizing={setIsResizing} 
                                        setResizeJob={setResizeJob} 
                                        setResizeDirection={setResizeDirection} 
                                        setJobs={setJobs} 
                                        setRefreshKey={setRefreshKey}
                                        resizeJob={resizeJob}
                                        resizeDirection={resizeDirection}
                                    >
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
                                                isResizing={isResizing} 
                                                setIsResizing={setIsResizing} 
                                                setResizeJob={setResizeJob}
                                                setResizeDirection={setResizeDirection}
                                                setJobs={setJobs}
                                                setRefreshKey={setRefreshKey}
                                                resizeJob={resizeJob}
                                                resizeDirection={resizeDirection}
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
                                                <ResizableJob 
                                                    key={job.id} 
                                                    job={job} 
                                                    viewMode="day" 
                                                    className="h-full"
                                                    isResizing={isResizing} 
                                                    setIsResizing={setIsResizing} 
                                                    setResizeJob={setResizeJob}
                                                    setResizeDirection={setResizeDirection}
                                                    setJobs={setJobs}
                                                    setRefreshKey={setRefreshKey}
                                                    resizeJob={resizeJob}
                                                    resizeDirection={resizeDirection}
                                                >
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
                                            {   timeSlotJobs.length} jobs • +{timeSlotJobs.length - 3} more
                                        </div>
                                    </div>
                                );
                            }
                            })()}
                        </DroppableArea>
                    ))}
                </div>
            </div>
        </Fragment>
    );
}