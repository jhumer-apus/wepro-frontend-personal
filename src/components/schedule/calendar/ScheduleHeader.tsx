import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../ui/button";
import ViewModeOptions from "./header/ViewModeOptions";

interface Props {
    navigateMonth: (direction: number) => void;
    setCurrentDate: (date: Date) => void;
    currentDate: Date;
    viewMode: string;
    setViewMode: (mode: string) => void;
    filteredJobs: any[];
    monthNames: string[];
}

export default function ScheduleHeader(props:Props) {

    const { 
        navigateMonth, 
        setCurrentDate, 
        currentDate, 
        viewMode, 
        setViewMode, 
        filteredJobs,
        monthNames
    } = props;

    return (
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
                    {/* ================ Label ================ */}
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
                {/*================== Number of Jobs Shown ================ */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{filteredJobs.length} jobs</span>
                    </div>
                </div>
                <ViewModeOptions 
                    viewMode={viewMode} 
                    setViewMode={setViewMode} 
                />
            </div>
        </div>
    );
}