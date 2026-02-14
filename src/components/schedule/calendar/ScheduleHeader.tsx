import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { Button } from "../../ui/button";
import ViewModeOptions from "./header/ViewModeOptions";

interface Props {
    setCurrentDate: (date: Date) => void;
    currentDate: Date;
    viewMode: "month" | "week" | "day";
    setViewMode: (mode: "month" | "week" | "day") => void;
    filteredJobs: any[];
    setOpenFullScreen: React.Dispatch<React.SetStateAction<boolean>>;
    isOpenFullScreen: boolean;
}

export default function ScheduleHeader(props:Props) {

    const { 
        setCurrentDate, 
        currentDate, 
        viewMode, 
        setViewMode, 
        filteredJobs,
        setOpenFullScreen,
        isOpenFullScreen
    } = props;

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

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];


    return (
        <div className="flex justify-between items-center gap-6">
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
                {/*================== Full Screen Button ================ */}
                {!isOpenFullScreen && (
                    <button
                        onClick={() => setOpenFullScreen(true)}
                        className="p-2 rounded-md hover:bg-white/60 dark:hover:bg-slate-800 transition"
                    >
                        <Maximize2 className="w-4 h-4" />
                    </button>
                )}

            </div>
        </div>
    );
}