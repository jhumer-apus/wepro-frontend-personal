import { Button } from "@/src/components/ui/button";
import { CalendarIcon, Grid3X3, List } from "lucide-react";

interface Props {
    viewMode: string;
    setViewMode: (mode: string) => void;
}

export default function ViewModeOptions(props: Props) {

    const { viewMode, setViewMode } = props;

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
        <div className="flex bg-white/80 w-fit backdrop-blur-sm border border-slate-200 rounded-xl p-1 shadow-sm"> 
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
    )
}