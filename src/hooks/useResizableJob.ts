import { JobSchedule } from "../constants/interface/jobSchedule";
import { calculateEndTime } from "../lib/calculate";

interface Props {
    job: JobSchedule;
    direction: string;
    setIsResizing: React.Dispatch<React.SetStateAction<boolean>>;
    setResizeJob: React.Dispatch<React.SetStateAction<JobSchedule | null>>;
    setResizeDirection: React.Dispatch<React.SetStateAction<string>>;
    setJobs: React.Dispatch<React.SetStateAction<JobSchedule[]>>;
    setRefreshKey: React.Dispatch<React.SetStateAction<number>>;
}
export const useResizableJob = () => {

    const handleResize = (e:any, props: Props) => {
        e.preventDefault();
            e.stopPropagation();
            
        const { 
            job, 
            direction, 
            setIsResizing, 
            setResizeJob, 
            setResizeDirection, 
            setJobs, 
            setRefreshKey 
        } = props;
        
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

        const handleMouseMove = (moveEvent:any) => {
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

    return { handleResize };

}