import { Fragment, use } from "react";
import DroppableArea from "./DroppableArea";
import { Badge } from "@/src/components/ui/badge";
import DraggableJob from "./DraggableJob";
import { useTechnician } from "@/src/hooks/useTechnician";
import { getStatusBorderColor, getStatusColor } from "@/src/lib/color";

interface Props {
    calendarDays: any[];
    handleEmptySpotClick: (dateStr: string) => void;
    selectedJob: any;
    setSelectedJob: (job: any) => void;
    setShowJobDetails: (show: boolean) => void;
    handleShowMoreJobs: (dateStr: string) => void;
}
export default function ScheduleMonthContent(props: Props) {

    const { 
        calendarDays,
        handleEmptySpotClick,
        setSelectedJob,
        setShowJobDetails,
        handleShowMoreJobs,
    } = props;

    const { getTechnicianColor, getTechnicianName } = useTechnician();
    
    const daysNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
        <Fragment>
            <div className="grid grid-cols-7 border-b">
                {daysNames.map((day) => (
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
                        onClick={(e:any) => {
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
                            }`}
                        >
                            {day.day}
                        </span>
                        {day.jobs.length > 0 && (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                            {day.jobs.length}
                        </Badge>
                        )}
                    </div>
                    
                    <div className="space-y-1">
                        {day.jobs.slice(0, 3).map((job:any) => (
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
            </Fragment>
    );
}