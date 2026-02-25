import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import ScheduleHeader from "./ScheduleHeader";
import ScheduleMonthContent from "./content/ScheduleMonthContent";
import ScheduleWeekContent from "./content/ScheduleWeekContent";
import ScheduleDayContent from "./content/ScheduleDayContent";
import { JobSchedule } from "@/src/constants/interface/jobSchedule";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/src/components/ui/dialog";

import { Maximize2, X } from "lucide-react";
import { Fragment, SetStateAction, useState } from "react";
import { Button } from "../../ui/button";

interface Props {
    calendarDays: any[];
    handleEmptySpotClick: (dateStr: string) => void;
    selectedJob: any;
    setSelectedJob: (job: any) => void;
    setShowJobDetails: (show: boolean) => void;
    setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
    currentDate: Date;
    viewMode: "month" | "week" | "day";
    setViewMode: React.Dispatch<React.SetStateAction<"month" | "week" | "day">>;
    filteredJobs: JobSchedule[];
    refreshKey: number;
    setRefreshKey: React.Dispatch<React.SetStateAction<number>>;
    isResizing: boolean;
    resizeJob: any;
    resizeDirection: string;
    setIsResizing: React.Dispatch<React.SetStateAction<boolean>>;
    setResizeJob: React.Dispatch<React.SetStateAction<any>>;
    setResizeDirection: React.Dispatch<React.SetStateAction<string>>;
    handleShowMoreJobs: (dateStr: string) => void;
    setJobs: React.Dispatch<React.SetStateAction<JobSchedule[]>>;
}


export default function ScheduleCalendar(props:Props) {

    const { 
        calendarDays, 
        handleEmptySpotClick, 
        selectedJob, 
        setSelectedJob, 
        setShowJobDetails, 
        setCurrentDate, 
        currentDate, 
        viewMode, 
        setViewMode,
        filteredJobs,
        refreshKey,
        setRefreshKey,
        handleShowMoreJobs,
        isResizing,
        resizeJob,
        resizeDirection,        
        setIsResizing,
        setResizeJob,
        setResizeDirection,
        setJobs
    } = props;

    const [openFullScreen, setOpenFullScreen] = useState(false);


    return (
        <Fragment>
            <Card className="shadow-xl bg-white/80 backdrop-blur-sm mt-4 max-h-[calc(100vh-320px)] overflow-y-auto">
                <CardHeader className="p-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-b">
                    <ScheduleHeader 
                        setCurrentDate={setCurrentDate}
                        currentDate={currentDate}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        filteredJobs={filteredJobs}
                        setOpenFullScreen={setOpenFullScreen} 
                        isOpenFullScreen={openFullScreen}                    
                    />
                </CardHeader>
                
                <CardContent className="p-0" key={refreshKey}>
                    {/* Month View */}
                    {viewMode === "month" && (
                        <ScheduleMonthContent 
                            calendarDays={calendarDays} 
                            handleEmptySpotClick={handleEmptySpotClick}
                            selectedJob={selectedJob}
                            setSelectedJob={setSelectedJob}
                            setShowJobDetails={setShowJobDetails}
                            handleShowMoreJobs={handleShowMoreJobs} 
                        />
                    )}

                    {/* Week View */}
                    {viewMode === "week" && (
                        <ScheduleWeekContent
                            calendarDays={calendarDays}
                            handleEmptySpotClick={handleEmptySpotClick}
                            filteredJobs={filteredJobs}
                            currentDate={currentDate}
                            setSelectedJob={setSelectedJob}
                            setShowJobDetails={setShowJobDetails}
                            setIsResizing={setIsResizing}
                            setResizeJob={setResizeJob}
                            setResizeDirection={setResizeDirection}
                            setJobs={setJobs}
                            setRefreshKey={setRefreshKey}
                            isResizing={isResizing} 
                            resizeJob={resizeJob}                
                        />
                    )}

                    {/* Day View */}
                    {viewMode === "day" && (
                        <ScheduleDayContent
                            currentDate={currentDate}
                            getDayJobs={() => filteredJobs.filter(job => {
                                const jobDate = new Date(job.scheduledDate);
                                return jobDate.toDateString() === currentDate.toDateString();
                            })}
                            handleEmptySpotClick={handleEmptySpotClick}
                            setSelectedJob={setSelectedJob}
                            setShowJobDetails={setShowJobDetails}
                            isResizing={isResizing}
                            resizeJob={resizeJob}
                            resizeDirection={resizeDirection}
                            setIsResizing={setIsResizing}
                            setResizeJob={setResizeJob}
                            setResizeDirection={setResizeDirection}
                            setJobs={setJobs}
                            setRefreshKey={setRefreshKey}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Full Screen Dialog */}
            <Dialog open={openFullScreen} onOpenChange={setOpenFullScreen}>
                <DialogContent className="[&>button]:hidden max-w-none max-h-screen p-0 rounded-none overflow-y-auto">


                    <div className="h-full flex flex-col bg-white dark:bg-slate-900">

                        {/* Header Inside Dialog */}
                        <div className="p-1 border-b flex items-center justify-between gap-4">
                            <ScheduleHeader
                                setCurrentDate={setCurrentDate}
                                currentDate={currentDate}
                                viewMode={viewMode}
                                setViewMode={setViewMode}
                                filteredJobs={filteredJobs}
                                setOpenFullScreen={setOpenFullScreen} 
                                isOpenFullScreen={openFullScreen}                            
                            />
                            {/* Custom Close Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                className="shadow-sm hover:shadow-md rounded-full transition-all duration-200 text-xs h-9 w-9"
                                onClick={() => setOpenFullScreen(false)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Calendar Content */}
                        <div className="flex-1 overflow-auto">
                            <CardContent className="p-0" key={refreshKey}>

                            {viewMode === "month" && (
                                <ScheduleMonthContent
                                    calendarDays={calendarDays}
                                    handleEmptySpotClick={handleEmptySpotClick}
                                    selectedJob={selectedJob}
                                    setSelectedJob={setSelectedJob}
                                    setShowJobDetails={setShowJobDetails}
                                    handleShowMoreJobs={handleShowMoreJobs}
                                />
                            )}

                            {viewMode === "week" && (
                                <ScheduleWeekContent
                                    calendarDays={calendarDays}
                                    handleEmptySpotClick={handleEmptySpotClick}
                                    filteredJobs={filteredJobs}
                                    currentDate={currentDate}
                                    setSelectedJob={setSelectedJob}
                                    setShowJobDetails={setShowJobDetails}
                                    setIsResizing={setIsResizing}
                                    setResizeJob={setResizeJob}
                                    setResizeDirection={setResizeDirection}
                                    setJobs={setJobs}
                                    setRefreshKey={setRefreshKey}
                                    isResizing={isResizing}
                                    resizeJob={resizeJob}
                                />
                            )}

                            {viewMode === "day" && (
                                <ScheduleDayContent
                                    currentDate={currentDate}
                                    getDayJobs={() =>
                                        filteredJobs.filter((job) => {
                                        const jobDate = new Date(job.scheduledDate);
                                        return jobDate.toDateString() === currentDate.toDateString();
                                        })
                                    }
                                    handleEmptySpotClick={handleEmptySpotClick}
                                    setSelectedJob={setSelectedJob}
                                    setShowJobDetails={setShowJobDetails}
                                    isResizing={isResizing}
                                    resizeJob={resizeJob}
                                    resizeDirection={resizeDirection}
                                    setIsResizing={setIsResizing}
                                    setResizeJob={setResizeJob}
                                    setResizeDirection={setResizeDirection}
                                    setJobs={setJobs}
                                    setRefreshKey={setRefreshKey}
                                />
                            )}

                            </CardContent>
                        </div>

                    </div>

                </DialogContent>
            </Dialog>

        </Fragment>
    )
}