import { useState } from "react";
import { Button } from "../ui/button";
import { Search } from "lucide-react";
import Toggle from "./Toggle";
import { Input } from "../ui/input";
import SelectInput from "../input/select";


interface Props {
    title: string;
    description?: string;
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
        <div className="mb-6 relative rounded-lg p-4 md:p-5 pb-5 md:pb-0 border border-slate-200/60 dark:border-slate-700/60 shadow-none md:shadow-xl bg-white dark:bg-slate-900 md:bg-gradient-to-br md:from-slate-50 md:via-blue-50 md:to-indigo-50 md:dark:from-slate-900 md:dark:via-blue-950/20 md:dark:to-indigo-950/20">

            {/* ================= HEADER ================= */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-2">
                        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 dark:from-slate-100 dark:to-blue-100 bg-clip-text text-transparent">
                            {props.title}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {props.description ?? ""}
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
