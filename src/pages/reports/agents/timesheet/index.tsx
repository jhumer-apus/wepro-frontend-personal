import { useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { type DateValueType } from "react-tailwindcss-datepicker";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import Table from "@/src/components/table";
import SelectInput from "@/src/components/input/select";
import InputDatepicker from "@/src/components/input/datepicker";
import { Search } from "lucide-react";

interface AgentTimesheetStats {
  id: number;
  agent: string;
  timeZone: string;
  reportDate: string;
  totalDurationSec: number;
  totalDurationTime: string;
  totalActiveDurationSec: number;
  totalActiveDuration: string;
  totalTalkTime: string;
  totalIncomingTime: string;
  totalOutgoingTime: string;
  totalBreakTime: string;
  status: "Online" | "Break" | "Offline";
}

const mockTimesheetStats: AgentTimesheetStats[] = [
  { id: 1, agent: "John Carter", timeZone: "America/Chicago", reportDate: "2026-02-21", totalDurationSec: 32400, totalDurationTime: "09:00:00", totalActiveDurationSec: 27900, totalActiveDuration: "07:45:00", totalTalkTime: "03:42:00", totalIncomingTime: "02:11:00", totalOutgoingTime: "01:31:00", totalBreakTime: "01:15:00", status: "Online" },
  { id: 2, agent: "Anna Blake", timeZone: "America/Chicago", reportDate: "2026-02-24", totalDurationSec: 28800, totalDurationTime: "08:00:00", totalActiveDurationSec: 25200, totalActiveDuration: "07:00:00", totalTalkTime: "03:15:00", totalIncomingTime: "01:58:00", totalOutgoingTime: "01:17:00", totalBreakTime: "01:00:00", status: "Online" },
  { id: 3, agent: "Michael Scott", timeZone: "America/Chicago", reportDate: "2026-02-23", totalDurationSec: 30600, totalDurationTime: "08:30:00", totalActiveDurationSec: 26100, totalActiveDuration: "07:15:00", totalTalkTime: "03:36:00", totalIncomingTime: "02:02:00", totalOutgoingTime: "01:34:00", totalBreakTime: "01:15:00", status: "Break" },
  { id: 4, agent: "Rachel Green", timeZone: "America/Phoenix", reportDate: "2026-02-22", totalDurationSec: 27000, totalDurationTime: "07:30:00", totalActiveDurationSec: 23400, totalActiveDuration: "06:30:00", totalTalkTime: "02:58:00", totalIncomingTime: "01:46:00", totalOutgoingTime: "01:12:00", totalBreakTime: "01:00:00", status: "Online" },
  { id: 5, agent: "David Harper", timeZone: "America/Los_Angeles", reportDate: "2026-02-20", totalDurationSec: 34200, totalDurationTime: "09:30:00", totalActiveDurationSec: 29700, totalActiveDuration: "08:15:00", totalTalkTime: "04:06:00", totalIncomingTime: "02:24:00", totalOutgoingTime: "01:42:00", totalBreakTime: "01:15:00", status: "Online" },
  { id: 6, agent: "Sophia Turner", timeZone: "America/Los_Angeles", reportDate: "2026-02-19", totalDurationSec: 25200, totalDurationTime: "07:00:00", totalActiveDurationSec: 20700, totalActiveDuration: "05:45:00", totalTalkTime: "02:27:00", totalIncomingTime: "01:31:00", totalOutgoingTime: "00:56:00", totalBreakTime: "01:15:00", status: "Offline" },
  { id: 7, agent: "James Wilson", timeZone: "America/Los_Angeles", reportDate: "2026-02-18", totalDurationSec: 31500, totalDurationTime: "08:45:00", totalActiveDurationSec: 27000, totalActiveDuration: "07:30:00", totalTalkTime: "03:31:00", totalIncomingTime: "02:05:00", totalOutgoingTime: "01:26:00", totalBreakTime: "01:15:00", status: "Online" },
  { id: 8, agent: "Olivia Martin", timeZone: "America/New_York", reportDate: "2026-02-17", totalDurationSec: 27900, totalDurationTime: "07:45:00", totalActiveDurationSec: 23400, totalActiveDuration: "06:30:00", totalTalkTime: "03:02:00", totalIncomingTime: "01:44:00", totalOutgoingTime: "01:18:00", totalBreakTime: "01:15:00", status: "Break" },
  { id: 9, agent: "Daniel Lewis", timeZone: "America/New_York", reportDate: "2026-02-16", totalDurationSec: 33300, totalDurationTime: "09:15:00", totalActiveDurationSec: 28800, totalActiveDuration: "08:00:00", totalTalkTime: "03:54:00", totalIncomingTime: "02:17:00", totalOutgoingTime: "01:37:00", totalBreakTime: "01:15:00", status: "Online" },
  { id: 10, agent: "Emma Johnson", timeZone: "America/New_York", reportDate: "2026-02-15", totalDurationSec: 26100, totalDurationTime: "07:15:00", totalActiveDurationSec: 21600, totalActiveDuration: "06:00:00", totalTalkTime: "02:41:00", totalIncomingTime: "01:36:00", totalOutgoingTime: "01:05:00", totalBreakTime: "01:15:00", status: "Offline" },
  { id: 11, agent: "Chris Evans", timeZone: "America/Chicago", reportDate: "2026-02-14", totalDurationSec: 30000, totalDurationTime: "08:20:00", totalActiveDurationSec: 25500, totalActiveDuration: "07:05:00", totalTalkTime: "03:08:00", totalIncomingTime: "01:52:00", totalOutgoingTime: "01:16:00", totalBreakTime: "01:15:00", status: "Online" },
  { id: 12, agent: "Liam Carter", timeZone: "America/New_York", reportDate: "2026-02-13", totalDurationSec: 24300, totalDurationTime: "06:45:00", totalActiveDurationSec: 19800, totalActiveDuration: "05:30:00", totalTalkTime: "02:19:00", totalIncomingTime: "01:27:00", totalOutgoingTime: "00:52:00", totalBreakTime: "01:15:00", status: "Offline" },
];

export default function AgentsTimesheetReportPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("agent");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [quickTimeZone, setQuickTimeZone] = useState("");
  const [quickStatus, setQuickStatus] = useState("");
  const [quickAgents, setQuickAgents] = useState<string[]>([]);
  const [quickMinDuration, setQuickMinDuration] = useState("0 Sec");
  const [quickMaxDuration, setQuickMaxDuration] = useState("No Limit");
  const [dateRangeValue, setDateRangeValue] = useState<DateValueType>({
    startDate: null,
    endDate: null,
  });

  const timeZoneOptions = Array.from(
    new Set(mockTimesheetStats.map(row => row.timeZone))
  ).map(timeZone => ({ label: timeZone, value: timeZone }));
  const statusOptions: Array<{ label: string; value: string }> = [
    { label: "Online", value: "Online" },
    { label: "Break", value: "Break" },
    { label: "Offline", value: "Offline" },
  ];
  const agentOptions = Array.from(new Set(mockTimesheetStats.map(row => row.agent))).map(
    agent => ({ label: agent, value: agent })
  );
  const durationOptions: Array<{ label: string; value: string; seconds: number | null }> = [
    { label: "No Limit", value: "No Limit", seconds: null },
    { label: "0 Sec", value: "0 Sec", seconds: 0 },
    { label: "5 Sec", value: "5 Sec", seconds: 5 },
    { label: "15 Sec", value: "15 Sec", seconds: 15 },
    { label: "30 Sec", value: "30 Sec", seconds: 30 },
    { label: "1 Min", value: "1 Min", seconds: 60 },
    { label: "5 Min", value: "5 Min", seconds: 300 },
    { label: "15 Min", value: "15 Min", seconds: 900 },
    { label: "20 Min", value: "20 Min", seconds: 1200 },
    { label: "30 Min", value: "30 Min", seconds: 1800 },
    { label: "45 Min", value: "45 Min", seconds: 2700 },
    { label: "1 Hour", value: "1 Hour", seconds: 3600 },
    { label: "1:30 Min", value: "1:30 Min", seconds: 5400 },
    { label: "2 Hours", value: "2 Hours", seconds: 7200 },
    { label: "3 Hours", value: "3 Hours", seconds: 10800 },
  ];

  const filteredRows = useMemo(() => {
    return mockTimesheetStats.filter(row => {
      const matchesSearch =
        searchQuery === "" ||
        row.agent.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTimeZone = quickTimeZone === "" || row.timeZone === quickTimeZone;
      const matchesStatus = quickStatus === "" || row.status === quickStatus;
      const matchesAgent = quickAgents.length === 0 || quickAgents.includes(row.agent);
      const minSeconds =
        durationOptions.find(option => option.value === quickMinDuration)?.seconds ?? 0;
      const maxSeconds =
        durationOptions.find(option => option.value === quickMaxDuration)?.seconds ?? null;
      const matchesMin = row.totalDurationSec >= minSeconds;
      const matchesMax = maxSeconds === null || row.totalDurationSec <= maxSeconds;

      const startDate = dateRangeValue?.startDate
        ? new Date(dateRangeValue.startDate)
        : null;
      const endDate = dateRangeValue?.endDate ? new Date(dateRangeValue.endDate) : null;
      const rowDate = new Date(row.reportDate);

      const matchesDateRange =
        (!startDate || rowDate >= startDate) && (!endDate || rowDate <= endDate);

      return (
        matchesSearch &&
        matchesTimeZone &&
        matchesStatus &&
        matchesAgent &&
        matchesMin &&
        matchesMax &&
        matchesDateRange
      );
    });
  }, [
    searchQuery,
    quickTimeZone,
    quickStatus,
    quickAgents,
    quickMinDuration,
    quickMaxDuration,
    dateRangeValue,
  ]);

  const sortedRows = useMemo(() => {
    const rows = [...filteredRows];
    const direction = sortDir === "asc" ? 1 : -1;

    rows.sort((a, b) => {
      switch (sortBy) {
        case "agent":
          return a.agent.localeCompare(b.agent) * direction;
        case "totalDurationSec":
          return (a.totalDurationSec - b.totalDurationSec) * direction;
        case "totalActiveDurationSec":
          return (a.totalActiveDurationSec - b.totalActiveDurationSec) * direction;
        case "status":
          return a.status.localeCompare(b.status) * direction;
        default:
          return 0;
      }
    });

    return rows;
  }, [filteredRows, sortBy, sortDir]);

  const totalTimeLabel = useMemo(() => {
    const totalSeconds = filteredRows.reduce(
      (sum, row) => sum + row.totalDurationSec,
      0
    );
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  }, [filteredRows]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / entriesPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedRows = sortedRows.slice(
    (safeCurrentPage - 1) * entriesPerPage,
    safeCurrentPage * entriesPerPage
  );

  const tableRows = pagedRows;

  const handleSortColumn = (column: string) => {
    if (sortBy === column) {
      setSortDir(prev => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(column);
    setSortDir("asc");
  };

  const tableColumns = [
    { columnName: "Agent", cell: "agent", sortKey: "agent", isFixed: true },
    {
      columnName: "Total Duration(Sec)",
      cell: "totalDurationSec",
      sortKey: "totalDurationSec",
    },
    { columnName: "Total Duration Time", cell: "totalDurationTime" },
    {
      columnName: "Total Active Duration (Sec)",
      cell: "totalActiveDurationSec",
      sortKey: "totalActiveDurationSec",
    },
    { columnName: "Total Active Duration", cell: "totalActiveDuration" },
    { columnName: "Total Talk Time", cell: "totalTalkTime" },
    { columnName: "Total Incoming Time", cell: "totalIncomingTime" },
    { columnName: "Total Outgoing Time", cell: "totalOutgoingTime" },
    { columnName: "Total Break Time", cell: "totalBreakTime" },
    {
      columnName: "Status",
      sortKey: "status",
      cell: (row: AgentTimesheetStats) => (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
            row.status === "Online"
              ? "bg-green-100 text-green-700"
              : row.status === "Break"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-slate-100 text-slate-700"
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>Agent Timesheet Report - WePro</title>
        <meta name="description" content="Agent timesheet report" />
      </Head>
      <div className="md:h-[calc(100vh-112px)] flex flex-col">
        <div className="mb-6 relative rounded-lg p-4 md:p-5 pb-5 md:pb-6 border border-slate-200/60 dark:border-slate-700/60 shadow-none md:shadow-xl bg-white dark:bg-slate-900 md:bg-gradient-to-br md:from-slate-50 md:via-blue-50 md:to-indigo-50 md:dark:from-slate-900 md:dark:via-blue-950/20 md:dark:to-indigo-950/20">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 dark:from-slate-100 dark:to-blue-100 bg-clip-text text-transparent">
                  Time Clock
                </h2>
              </div>
              <div className="md:pt-1 text-2xl md:text-3xl text-slate-500 dark:text-slate-300 font-medium">
                Total Time:{totalTimeLabel}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  className="pl-9"
                  placeholder="Search agents"
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <Button variant="outline" onClick={() => setShowFilters(prev => !prev)}>
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
                <SelectInput
                  label="Time Zone"
                  options={timeZoneOptions}
                  placeholder="All time zones"
                  value={quickTimeZone}
                  onSearch={() => {}}
                  onSelect={val => {
                    setQuickTimeZone(Array.isArray(val) ? (val[0] ?? "") : val);
                    setCurrentPage(1);
                  }}
                />
                <SelectInput
                  label="Status"
                  options={statusOptions}
                  placeholder="All statuses"
                  value={quickStatus}
                  onSearch={() => {}}
                  onSelect={val => {
                    setQuickStatus(Array.isArray(val) ? (val[0] ?? "") : val);
                    setCurrentPage(1);
                  }}
                />
                <SelectInput
                  label="Agents"
                  options={agentOptions}
                  placeholder="All agents"
                  value={quickAgents}
                  multiselect
                  onSearch={() => {}}
                  onSelect={val => {
                    setQuickAgents(Array.isArray(val) ? val : []);
                    setCurrentPage(1);
                  }}
                />
                <SelectInput
                  label="Min"
                  options={durationOptions
                    .filter(option => option.value !== "No Limit")
                    .map(option => ({ label: option.label, value: option.value }))}
                  placeholder="0 Sec"
                  value={quickMinDuration}
                  onSearch={() => {}}
                  onSelect={val => {
                    setQuickMinDuration(Array.isArray(val) ? (val[0] ?? "0 Sec") : val);
                    setCurrentPage(1);
                  }}
                />
                <SelectInput
                  label="Max"
                  options={durationOptions.map(option => ({
                    label: option.label,
                    value: option.value,
                  }))}
                  placeholder="No Limit"
                  value={quickMaxDuration}
                  onSearch={() => {}}
                  onSelect={val => {
                    setQuickMaxDuration(
                      Array.isArray(val) ? (val[0] ?? "No Limit") : val
                    );
                    setCurrentPage(1);
                  }}
                />
                <InputDatepicker
                  value={dateRangeValue}
                  onChange={val => {
                    setDateRangeValue(val);
                    setCurrentPage(1);
                  }}
                  label="Date Range"
                />
              </div>
            )}
          </div>
        </div>

        <Table
          key={router.pathname}
          rows={tableRows}
          columns={tableColumns}
          onSort={handleSortColumn}
          activeSortKey={sortBy}
          sortDirection={sortDir}
          pageSize={entriesPerPage}
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          totalCount={sortedRows.length}
          onPageSizeChange={value => {
            setEntriesPerPage(parseInt(value || "10", 10));
            setCurrentPage(1);
          }}
          onPageChange={setCurrentPage}
          onExport={() => {}}
          tableKey={router.pathname}
          className="flex-1 flex flex-col"
          tableClassName="flex-1 flex flex-col overflow-y-hidden"
          lockedColumns={1}
        />
      </div>
    </>
  );
}
