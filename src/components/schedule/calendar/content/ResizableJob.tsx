import { Job } from "@/src/constants/interface/jobs";
import { JobSchedule } from "@/src/constants/interface/jobSchedule";
import { useResizableJob } from "@/src/hooks/useResizableJob";
import { useDraggable } from "@dnd-kit/core";
import { Fragment, PropsWithChildren } from "react";
import { set } from "react-hook-form";

interface Props {
  job: JobSchedule;
  className?: string;
  viewMode?: "month" | "week" | "day";
  isResizing: boolean;
  resizeJob: JobSchedule | null;
  resizeDirection?: string;

  setIsResizing: React.Dispatch<React.SetStateAction<boolean>>;
  setResizeJob: React.Dispatch<React.SetStateAction<JobSchedule | null>>;
  setResizeDirection: React.Dispatch<React.SetStateAction<string>>;
  setJobs: React.Dispatch<React.SetStateAction<JobSchedule[]>>;
  setRefreshKey: React.Dispatch<React.SetStateAction<number>>;
}

export default function ResizableJob(props: PropsWithChildren<Props>) {
    const { 
        job, 
        children, 
        className = "", 
        viewMode = "week", 
        isResizing,
        resizeJob,
        resizeDirection,
        setIsResizing, 
        setResizeJob, 
        setResizeDirection, 
        setJobs, 
        setRefreshKey 
    } = props;
    const { handleResize } = useResizableJob();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useDraggable(
        { 
            id: job.id,
            data: {
                type: 'job',
                job: job
            }
        }
    );

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.5 : 1,
    };

    // Calculate job height based on duration (for visual representation)
    const jobDurationHours = job.estimatedDuration / 60;
    const jobHeight = Math.max(jobDurationHours * 48, 24); // 48px per hour for better proportions, minimum 24px

    // const handleResizeStart = (direction, e) => {
    //     e.stopPropagation();
    //     setIsResizing(true);
    //     setResizeJob(job);
    //     setResizeDirection(direction);
    //     console.log('🔄 Resize started:', { job: job.id, direction });
    // };

    // const handleResizeEnd = (e) => {
    //     e.stopPropagation();
    //     if (isResizing) {
    //     setIsResizing(false);
    //     setResizeJob(null);
    //     setResizeDirection('');
    //     console.log('🔄 Resize ended');
    //     }
    // };

    return (
        <div
            ref={setNodeRef}
            style={{ ...style, height: `${jobHeight}px`, minHeight: '24px' }}
            className={`${className} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} transition-opacity relative group`}
            {...attributes}
            onPointerDown={(e) => {
                // Check if clicking on resize handle - if so, don't start drag

                const target = e.target as HTMLElement;
                if (target.closest('.resize-handle')) {
                    console.log('🚫 Clicked resize handle - not starting drag');
                    return;
                }
                
                // Start drag for job area clicks
                console.log('✅ Clicked job area - starting drag');
                if (listeners?.onPointerDown) {
                    listeners.onPointerDown(e);
                }
            }}
        >
            {children}
        
            {/* Resize handle - only bottom (end time) in week/day view */}
            {(viewMode === "week" || viewMode === "day") && !isDragging && (
                <Fragment>
                    {/* Bottom resize handle - Extend/Shorten Duration Only */}
                    <div
                        className="resize-handle absolute -bottom-1 left-0 right-0 h-4 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-all duration-200 bg-gradient-to-t from-blue-500/40 to-transparent hover:from-blue-500/60 z-20"
                        data-direction="end"
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            const resizeProps = {
                                job,
                                direction: 'end',
                                setIsResizing, // Placeholder, should be passed from parent
                                setResizeJob, // Placeholder, should be passed from parent
                                setResizeDirection, // Placeholder, should be passed from parent
                                setJobs, // Placeholder, should be passed from parent
                                setRefreshKey, // Placeholder, should be passed from parent
                            }
                            handleResize(e, resizeProps);
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
                </Fragment>
            )}
        </div>
    );
};