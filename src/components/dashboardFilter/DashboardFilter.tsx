import { useState } from "react";
import { Button } from "../ui/button";
import { Search } from "lucide-react";
import Toggle from "./Toggle";
import { Input } from "../ui/input";
import SelectInput from "../input/select";


interface Props {
    title: string;
    description: string;
    toggleList: { label: string; value: string }[];
    toggleStatus: string;
    searchQuery: string;
    onChangeSearchQuery: (query: string) => void;
    onToggleChange: (value: string) => void;
    moreFilters?: React.ReactNode;
}
export default function DashboardFilter(props: Props){
    const [showFilters, setShowFilters] = useState(false);
    return (
        <div className="mb-8 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm md:shadow-lg">

            {/* ================= HEADER ================= */}
            <div className="p-5 md:p-6 space-y-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            {props.title}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {props.description}
                        </p>
                    </div>
                    <Toggle 
                        toggleList={props.toggleList} 
                        currentToggled={props.toggleStatus} 
                        onSetToggle={props.onToggleChange} 
                    />
                </div>

                {/* ================= TOOLBAR ================= */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                className="pl-9 h-10 rounded-xl"
                                placeholder="Search jobs, clients, phone, address…"
                                value={props.searchQuery}
                                onChange={(e) => props.onChangeSearchQuery(e.target.value)}
                            />
                        </div>

                        <Button
                            variant="outline"
                            className="h-10 rounded-xl"
                            onClick={() => setShowFilters(prev => !prev)}
                        >
                            {showFilters ? "Hide filters" : "Show filters"}
                        </Button>
                    </div>

                    {/* ================= MORE FILTERS ================= */}
                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
                            {props.moreFilters}
                        </div>
                    ) }

                    {/* ================= STATUS PILLS ================= */}
                    {/* {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
                            <SelectInput
                                label="Job Type"
                                options={['Repair', 'Installation', 'Maintenance', 'Emergency', 'Inspection'].map(type => ({
                                    label: type,
                                    value: type,
                                }))}
                                placeholder="All job types"
                                value={quickJobTypes}
                                multiselect
                                onSelect={val => setQuickJobTypes(Array.isArray(val) ? val : [])}
                                onSearch={() => {}}
                            />
                            
                        </div>
                    )} */}
                </div>
            </div>
        </div>
    );
};
