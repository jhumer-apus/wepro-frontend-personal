import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";

interface Props {
    status: string;
    statusPills: { id: string; name: string; color: string }[];
    totalJobs: number;
    jobs: any[];
    getJobStatus: (job: any) => string;
    setSelectedStatus: (status: string) => void;
}

export default function StatusPills(props: Props) { 
    const statusPillsRef = useRef<HTMLDivElement | null>(null);
    const [isDraggingStatusPills, setIsDraggingStatusPills] = useState(false)
    const statusDragStartX = useRef(0);
    const statusDragStartScroll = useRef(0);
    const statusDragMoved = useRef(false);
    const [statusScrollState, setStatusScrollState] = useState({
        canScrollLeft: false,
        canScrollRight: false,
    });
    const scrollStatusPills = (direction: "left" | "right") => {
        const el = statusPillsRef.current;
        if (!el) return;
        const delta = direction === "left" ? -220 : 220;
        el.scrollBy({ left: delta, behavior: "smooth" });
        setTimeout(updateStatusPillScrollState, 180);
    };

    const startStatusPillDrag = (event: React.MouseEvent<HTMLDivElement>) => {
        const container = statusPillsRef.current;
        if (!container) return;
        setIsDraggingStatusPills(true);
        statusDragStartX.current = event.clientX;
        statusDragStartScroll.current = container.scrollLeft;
        statusDragMoved.current = false;
        container.classList.add('cursor-grabbing', 'select-none');
    };

    const handleStatusPillDrag = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!isDraggingStatusPills) return;
        const container = statusPillsRef.current;
        if (!container) return;
        const deltaX = event.clientX - statusDragStartX.current;
        if (Math.abs(deltaX) > 3) {
            statusDragMoved.current = true;
        }
        container.scrollLeft = statusDragStartScroll.current - deltaX;
        updateStatusPillScrollState();
    };

    const endStatusPillDrag = () => {
        if (!isDraggingStatusPills) return;
        setIsDraggingStatusPills(false);
        const container = statusPillsRef.current;
        container?.classList.remove('cursor-grabbing', 'select-none');
        updateStatusPillScrollState();
    };

    const updateStatusPillScrollState = () => {
        const el = statusPillsRef.current;
        if (!el) return;
            const { scrollLeft, scrollWidth, clientWidth } = el;
            setStatusScrollState({
            canScrollLeft: scrollLeft > 2,
            canScrollRight: scrollLeft + clientWidth < scrollWidth - 2,
        });
    };
    return (
        <div className="sticky top-0 backdrop-blur supports-[backdrop-filter]:backdrop-blur px-1 pb-0 mt-2">
            <div className="relative">
                {statusScrollState.canScrollLeft &&
                    <button
                        type="button"
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                        onClick={() => scrollStatusPills("left")}
                        disabled={!statusScrollState.canScrollLeft}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                }
            <div
                ref={statusPillsRef}
                className={`flex items-center gap-1.5 overflow-x-auto scrollbar-none cursor-grab select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${statusScrollState.canScrollLeft ? 'pl-8' : 'pl-0'} ${statusScrollState.canScrollRight ? 'pr-8' : 'pr-0'}`}
                onMouseDown={startStatusPillDrag}
                onMouseMove={handleStatusPillDrag}
                onMouseUp={endStatusPillDrag}
                onMouseLeave={endStatusPillDrag}
            >
            <button
                onClick={() => {
                    if (statusDragMoved.current) {
                        statusDragMoved.current = false;
                        return;
                    }
                    setSelectedStatus('All');
                }}
                className={`flex items-center gap-1.5 rounded-full h-7 px-2 text-xs ${selectedStatus==='All' ? 'bg-slate-900 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}
            >
                <span className="inline-block h-2 w-2 rounded-full bg-slate-500"></span>
                    All
                <span className="opacity-70 hidden sm:inline">{totalJobs}</span>
            </button>

            {[...jobStatuses]
                .sort((a,b)=>{
                    const ai = statusOrder.indexOf(a.name);
                    const bi = statusOrder.indexOf(b.name);
                    const av = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
                    const bv = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
                return av - bv;
                })
                .map((s, idx)=>{
                    const count = jobs.filter(j=>getJobStatus(j)===s.name).length;
                    const sel = selectedStatus===s.name;
                return (
                    <button 
                        key={s.id}
                    // draggable
                    // onDragStart={()=>setDragIndex(idx)}
                    // onDragOver={(e)=>e.preventDefault()}
                    // onDrop={()=>{
                    //   if (dragIndex===null) return;
                    //   const names = [...statusOrder.length? statusOrder : jobStatuses.map(js=>js.name)];
                    //   const from = dragIndex;
                    //   const to = idx;
                    //   const ordered = [...names];
                    //   const [moved] = ordered.splice(from,1);
                    //   ordered.splice(to,0,moved);
                    //   setStatusOrder(ordered);
                    //   setDragIndex(null);
                    // }}
                        onClick={()=>{
                            if (statusDragMoved.current) {
                                statusDragMoved.current = false;
                                return;
                            }
                            setSelectedStatus(s.name);
                        }}
                        className={`flex items-center gap-1.5 rounded-full h-7 px-2 text-xs whitespace-nowrap ${sel? 'bg-slate-900 text-white':'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>
                        <span 
                            className="inline-block h-2 w-2 rounded-full" 
                            style={{backgroundColor:s.color}}
                        ></span>
                        {s.name}
                        {count>0 && <span className="opacity-70 hidden sm:inline">{count}</span>}
                    </button>
                );
                })}
            </div>
                {statusScrollState.canScrollRight &&
                    <button
                        type="button"
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                        onClick={() => scrollStatusPills("right")}
                        disabled={!statusScrollState.canScrollRight}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                }
            {/* More dropdown removed for simplicity; horizontal scroll holds all */}
            </div>
        </div>
            
    )
}