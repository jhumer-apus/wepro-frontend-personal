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

interface AgentCallStats {
  id: number;
  agent: string;
  totalIncomingCalls: number;
  incomingAnsweredCalls: number;
  incomingAnsweredRate: string;
  incomingAvgAnsweredCalls: string;
  outgoingCalls: number;
  outgoingAvgCalls: string;
  incomingOutgoingAvgCalls: string;
  workedHours: string;
  sourceProvider: string;
  callDate: string;
}

const mockAgentCallStats: AgentCallStats[] = [
  {
    id: 1,
    agent: "John Carter",
    totalIncomingCalls: 56,
    incomingAnsweredCalls: 49,
    incomingAnsweredRate: "87.5%",
    incomingAvgAnsweredCalls: "00:02:18",
    outgoingCalls: 24,
    outgoingAvgCalls: "00:01:52",
    incomingOutgoingAvgCalls: "00:02:05",
    workedHours: "08:30",
    sourceProvider: "Google Ads",
    callDate: "2026-02-21",
  },
  {
    id: 2,
    agent: "Anna Blake",
    totalIncomingCalls: 43,
    incomingAnsweredCalls: 40,
    incomingAnsweredRate: "93.0%",
    incomingAvgAnsweredCalls: "00:01:57",
    outgoingCalls: 31,
    outgoingAvgCalls: "00:01:48",
    incomingOutgoingAvgCalls: "00:01:53",
    workedHours: "07:55",
    sourceProvider: "Facebook",
    callDate: "2026-02-24",
  },
  {
    id: 3,
    agent: "Michael Scott",
    totalIncomingCalls: 68,
    incomingAnsweredCalls: 61,
    incomingAnsweredRate: "89.7%",
    incomingAvgAnsweredCalls: "00:02:11",
    outgoingCalls: 18,
    outgoingAvgCalls: "00:01:39",
    incomingOutgoingAvgCalls: "00:01:57",
    workedHours: "09:10",
    sourceProvider: "Website",
    callDate: "2026-02-23",
  },
  {
    id: 4,
    agent: "Rachel Green",
    totalIncomingCalls: 35,
    incomingAnsweredCalls: 30,
    incomingAnsweredRate: "85.7%",
    incomingAvgAnsweredCalls: "00:02:44",
    outgoingCalls: 27,
    outgoingAvgCalls: "00:01:46",
    incomingOutgoingAvgCalls: "00:02:12",
    workedHours: "07:20",
    sourceProvider: "Google Ads",
    callDate: "2026-02-22",
  },
  {
    id: 5,
    agent: "David Harper",
    totalIncomingCalls: 74,
    incomingAnsweredCalls: 70,
    incomingAnsweredRate: "94.6%",
    incomingAvgAnsweredCalls: "00:01:49",
    outgoingCalls: 33,
    outgoingAvgCalls: "00:01:31",
    incomingOutgoingAvgCalls: "00:01:41",
    workedHours: "08:45",
    sourceProvider: "Referral",
    callDate: "2026-02-20",
  },
  {
    id: 6,
    agent: "Sophia Turner",
    totalIncomingCalls: 29,
    incomingAnsweredCalls: 24,
    incomingAnsweredRate: "82.8%",
    incomingAvgAnsweredCalls: "00:03:02",
    outgoingCalls: 16,
    outgoingAvgCalls: "00:02:04",
    incomingOutgoingAvgCalls: "00:02:36",
    workedHours: "06:50",
    sourceProvider: "Facebook",
    callDate: "2026-02-19",
  },
  {
    id: 7,
    agent: "James Wilson",
    totalIncomingCalls: 58,
    incomingAnsweredCalls: 52,
    incomingAnsweredRate: "89.7%",
    incomingAvgAnsweredCalls: "00:02:06",
    outgoingCalls: 21,
    outgoingAvgCalls: "00:01:42",
    incomingOutgoingAvgCalls: "00:01:56",
    workedHours: "08:05",
    sourceProvider: "Website",
    callDate: "2026-02-18",
  },
  {
    id: 8,
    agent: "Olivia Martin",
    totalIncomingCalls: 46,
    incomingAnsweredCalls: 41,
    incomingAnsweredRate: "89.1%",
    incomingAvgAnsweredCalls: "00:02:21",
    outgoingCalls: 29,
    outgoingAvgCalls: "00:01:35",
    incomingOutgoingAvgCalls: "00:02:03",
    workedHours: "07:40",
    sourceProvider: "Referral",
    callDate: "2026-02-17",
  },
  {
    id: 9,
    agent: "Daniel Lewis",
    totalIncomingCalls: 63,
    incomingAnsweredCalls: 57,
    incomingAnsweredRate: "90.5%",
    incomingAvgAnsweredCalls: "00:01:58",
    outgoingCalls: 26,
    outgoingAvgCalls: "00:01:48",
    incomingOutgoingAvgCalls: "00:01:53",
    workedHours: "08:25",
    sourceProvider: "Google Ads",
    callDate: "2026-02-16",
  },
  {
    id: 10,
    agent: "Emma Johnson",
    totalIncomingCalls: 40,
    incomingAnsweredCalls: 34,
    incomingAnsweredRate: "85.0%",
    incomingAvgAnsweredCalls: "00:02:33",
    outgoingCalls: 22,
    outgoingAvgCalls: "00:01:57",
    incomingOutgoingAvgCalls: "00:02:15",
    workedHours: "07:05",
    sourceProvider: "Website",
    callDate: "2026-02-15",
  },
  {
    id: 11,
    agent: "Chris Evans",
    totalIncomingCalls: 52,
    incomingAnsweredCalls: 48,
    incomingAnsweredRate: "92.3%",
    incomingAvgAnsweredCalls: "00:01:52",
    outgoingCalls: 19,
    outgoingAvgCalls: "00:01:41",
    incomingOutgoingAvgCalls: "00:01:47",
    workedHours: "08:15",
    sourceProvider: "Referral",
    callDate: "2026-02-14",
  },
  {
    id: 12,
    agent: "Liam Carter",
    totalIncomingCalls: 33,
    incomingAnsweredCalls: 27,
    incomingAnsweredRate: "81.8%",
    incomingAvgAnsweredCalls: "00:02:48",
    outgoingCalls: 15,
    outgoingAvgCalls: "00:02:09",
    incomingOutgoingAvgCalls: "00:02:29",
    workedHours: "06:35",
    sourceProvider: "Facebook",
    callDate: "2026-02-13",
  },
];

export default function AgentsCallsReportPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("agent");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [quickAgents, setQuickAgents] = useState<string[]>([]);
  const [quickSourceProvider, setQuickSourceProvider] = useState("");
  const [dateRangeValue, setDateRangeValue] = useState<DateValueType>({
    startDate: null,
    endDate: null,
  });

  const agentOptions = Array.from(new Set(mockAgentCallStats.map(row => row.agent))).map(
    agent => ({ label: agent, value: agent })
  );
  const sourceProviderOptions = Array.from(
    new Set(mockAgentCallStats.map(row => row.sourceProvider))
  ).map(sourceProvider => ({ label: sourceProvider, value: sourceProvider }));

  const filteredRows = useMemo(() => {
    return mockAgentCallStats.filter(row => {
      const matchesSearch =
        searchQuery === "" ||
        row.agent.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAgent =
        quickAgents.length === 0 || quickAgents.includes(row.agent);

      const matchesSourceProvider =
        quickSourceProvider === "" || row.sourceProvider === quickSourceProvider;

      const startDate = dateRangeValue?.startDate
        ? new Date(dateRangeValue.startDate)
        : null;
      const endDate = dateRangeValue?.endDate
        ? new Date(dateRangeValue.endDate)
        : null;
      const rowDate = new Date(row.callDate);

      const matchesDateRange =
        (!startDate || rowDate >= startDate) && (!endDate || rowDate <= endDate);

      return (
        matchesSearch &&
        matchesAgent &&
        matchesSourceProvider &&
        matchesDateRange
      );
    });
  }, [
    searchQuery,
    quickAgents,
    quickSourceProvider,
    dateRangeValue,
  ]);

  const sortedRows = useMemo(() => {
    const rows = [...filteredRows];
    const direction = sortDir === "asc" ? 1 : -1;

    rows.sort((a, b) => {
      switch (sortBy) {
        case "agent":
          return a.agent.localeCompare(b.agent) * direction;
        case "totalIncomingCalls":
          return (a.totalIncomingCalls - b.totalIncomingCalls) * direction;
        case "incomingAnsweredCalls":
          return (a.incomingAnsweredCalls - b.incomingAnsweredCalls) * direction;
        case "incomingAnsweredRate":
          return (
            (parseFloat(a.incomingAnsweredRate) - parseFloat(b.incomingAnsweredRate)) *
            direction
          );
        case "outgoingCalls":
          return (a.outgoingCalls - b.outgoingCalls) * direction;
        default:
          return 0;
      }
    });

    return rows;
  }, [filteredRows, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / entriesPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedRows = sortedRows.slice(
    (safeCurrentPage - 1) * entriesPerPage,
    safeCurrentPage * entriesPerPage
  );

  const tableRows = pagedRows.map((row, index) => ({
    ...row,
    srNo: (safeCurrentPage - 1) * entriesPerPage + index + 1,
  }));

  const handleSortColumn = (column: string) => {
    if (sortBy === column) {
      setSortDir(prev => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(column);
    setSortDir("asc");
  };

  const tableColumns = [
    { columnName: "Sr No.", cell: "srNo", sortKey: "srNo", isFixed: true },
    { columnName: "Agent", cell: "agent", sortKey: "agent", isFixed: true },
    {
      columnName: "Total Incoming Calls",
      cell: "totalIncomingCalls",
      sortKey: "totalIncomingCalls",
    },
    {
      columnName: "Incoming Answered Calls",
      cell: "incomingAnsweredCalls",
      sortKey: "incomingAnsweredCalls",
    },
    {
      columnName: "Incoming Answered Rate",
      cell: "incomingAnsweredRate",
      sortKey: "incomingAnsweredRate",
    },
    { columnName: "Incoming Avg Answered Calls", cell: "incomingAvgAnsweredCalls" },
    { columnName: "Outgoing Calls", cell: "outgoingCalls", sortKey: "outgoingCalls" },
    { columnName: "Outgoing Avg Calls", cell: "outgoingAvgCalls" },
    {
      columnName: "Incoming & Outgoing Avg Calls",
      cell: "incomingOutgoingAvgCalls",
    },
    { columnName: "Worked Hours", cell: "workedHours", sortKey: "workedHours" },
  ];

  return (
    <>
      <Head>
        <title>Agent Calls Report - WePro</title>
        <meta name="description" content="Agent calls report" />
      </Head>
      <div className="md:h-[calc(100vh-112px)] flex flex-col">
        <div className="mb-6 relative rounded-lg p-4 md:p-5 pb-5 md:pb-6 border border-slate-200/60 dark:border-slate-700/60 shadow-none md:shadow-xl bg-white dark:bg-slate-900 md:bg-gradient-to-br md:from-slate-50 md:via-blue-50 md:to-indigo-50 md:dark:from-slate-900 md:dark:via-blue-950/20 md:dark:to-indigo-950/20">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 dark:from-slate-100 dark:to-blue-100 bg-clip-text text-transparent">
                  Calls
                </h2>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <SelectInput
                  label="Agents"
                  options={agentOptions}
                  placeholder="All agents"
                  value={quickAgents}
                  multiselect
                  onSearch={() => {}}
                  onSelect={val => setQuickAgents(Array.isArray(val) ? val : [])}
                />
                <SelectInput
                  label="Source Provider"
                  options={sourceProviderOptions}
                  placeholder="All source providers"
                  value={quickSourceProvider}
                  onSearch={() => {}}
                  onSelect={val =>
                    setQuickSourceProvider(Array.isArray(val) ? (val[0] ?? "") : val)
                  }
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
          lockedColumns={2}
        />
      </div>
    </>
  );
}
