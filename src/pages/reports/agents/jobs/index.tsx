import { useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { type DateValueType } from "react-tailwindcss-datepicker";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import Table from "@/src/components/table";
import SelectInput from "@/src/components/input/select";
import InputDatepicker from "@/src/components/input/datepicker";
import AddressInput from "@/src/components/input/address";
import { Search } from "lucide-react";

interface AgentJobStats {
  id: number;
  agent: string;
  technician: string;
  sourceProvider: string;
  jobType: string;
  area: string;
  city: string;
  zip: string;
  state: string;
  reportDate: string;
  jobIncomingCall: number;
  jobOutgoingCall: number;
  leadIncomingCall: number;
  leadOutgoingCall: number;
  answeredBookingPct: string;
}

const mockAgentJobStats: AgentJobStats[] = [
  { id: 1, agent: "John Carter", technician: "Robert Miles", sourceProvider: "Google Ads", jobType: "Repair", area: "120 Main St", city: "Dallas", zip: "75201", state: "TX", reportDate: "2026-02-21", jobIncomingCall: 34, jobOutgoingCall: 17, leadIncomingCall: 22, leadOutgoingCall: 9, answeredBookingPct: "62.5%" },
  { id: 2, agent: "Anna Blake", technician: "Sarah Young", sourceProvider: "Facebook", jobType: "Installation", area: "300 Oak Ave", city: "Austin", zip: "73301", state: "TX", reportDate: "2026-02-24", jobIncomingCall: 29, jobOutgoingCall: 20, leadIncomingCall: 14, leadOutgoingCall: 11, answeredBookingPct: "70.2%" },
  { id: 3, agent: "Michael Scott", technician: "Nina Brooks", sourceProvider: "Website", jobType: "Maintenance", area: "88 River Rd", city: "Houston", zip: "77002", state: "TX", reportDate: "2026-02-23", jobIncomingCall: 38, jobOutgoingCall: 12, leadIncomingCall: 30, leadOutgoingCall: 6, answeredBookingPct: "66.1%" },
  { id: 4, agent: "Rachel Green", technician: "Robert Miles", sourceProvider: "Google Ads", jobType: "Emergency", area: "15 Pine St", city: "Phoenix", zip: "85001", state: "AZ", reportDate: "2026-02-22", jobIncomingCall: 21, jobOutgoingCall: 19, leadIncomingCall: 14, leadOutgoingCall: 8, answeredBookingPct: "58.0%" },
  { id: 5, agent: "David Harper", technician: "Clara West", sourceProvider: "Referral", jobType: "Inspection", area: "444 Lake View", city: "San Diego", zip: "92101", state: "CA", reportDate: "2026-02-20", jobIncomingCall: 41, jobOutgoingCall: 25, leadIncomingCall: 33, leadOutgoingCall: 8, answeredBookingPct: "74.4%" },
  { id: 6, agent: "Sophia Turner", technician: "Sarah Young", sourceProvider: "Facebook", jobType: "Repair", area: "760 Sunset Blvd", city: "Los Angeles", zip: "90001", state: "CA", reportDate: "2026-02-19", jobIncomingCall: 18, jobOutgoingCall: 11, leadIncomingCall: 11, leadOutgoingCall: 5, answeredBookingPct: "52.3%" },
  { id: 7, agent: "James Wilson", technician: "Nina Brooks", sourceProvider: "Website", jobType: "Installation", area: "51 Market St", city: "San Jose", zip: "95112", state: "CA", reportDate: "2026-02-18", jobIncomingCall: 32, jobOutgoingCall: 16, leadIncomingCall: 26, leadOutgoingCall: 5, answeredBookingPct: "68.9%" },
  { id: 8, agent: "Olivia Martin", technician: "Clara West", sourceProvider: "Referral", jobType: "Maintenance", area: "99 Cedar Ln", city: "Miami", zip: "33101", state: "FL", reportDate: "2026-02-17", jobIncomingCall: 25, jobOutgoingCall: 21, leadIncomingCall: 21, leadOutgoingCall: 8, answeredBookingPct: "63.7%" },
  { id: 9, agent: "Daniel Lewis", technician: "Robert Miles", sourceProvider: "Google Ads", jobType: "Emergency", area: "10 Bay St", city: "Orlando", zip: "32801", state: "FL", reportDate: "2026-02-16", jobIncomingCall: 36, jobOutgoingCall: 14, leadIncomingCall: 27, leadOutgoingCall: 12, answeredBookingPct: "71.0%" },
  { id: 10, agent: "Emma Johnson", technician: "Sarah Young", sourceProvider: "Website", jobType: "Inspection", area: "620 North Ave", city: "Atlanta", zip: "30301", state: "GA", reportDate: "2026-02-15", jobIncomingCall: 24, jobOutgoingCall: 16, leadIncomingCall: 16, leadOutgoingCall: 6, answeredBookingPct: "59.3%" },
  { id: 11, agent: "Chris Evans", technician: "Nina Brooks", sourceProvider: "Referral", jobType: "Repair", area: "805 Elm St", city: "Chicago", zip: "60601", state: "IL", reportDate: "2026-02-14", jobIncomingCall: 31, jobOutgoingCall: 14, leadIncomingCall: 21, leadOutgoingCall: 5, answeredBookingPct: "67.8%" },
  { id: 12, agent: "Liam Carter", technician: "Clara West", sourceProvider: "Facebook", jobType: "Installation", area: "40 State St", city: "Boston", zip: "02108", state: "MA", reportDate: "2026-02-13", jobIncomingCall: 19, jobOutgoingCall: 9, leadIncomingCall: 14, leadOutgoingCall: 6, answeredBookingPct: "54.5%" },
];

export default function AgentsJobsReportPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("agent");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [quickAgents, setQuickAgents] = useState<string[]>([]);
  const [quickTechnician, setQuickTechnician] = useState("");
  const [quickSourceProvider, setQuickSourceProvider] = useState("");
  const [quickJobTypes, setQuickJobTypes] = useState<string[]>([]);
  const [quickArea, setQuickArea] = useState("");
  const [quickCity, setQuickCity] = useState("");
  const [quickZip, setQuickZip] = useState("");
  const [quickState, setQuickState] = useState("");
  const [dateRangeValue, setDateRangeValue] = useState<DateValueType>({
    startDate: null,
    endDate: null,
  });

  const agentOptions = Array.from(new Set(mockAgentJobStats.map(row => row.agent))).map(
    agent => ({ label: agent, value: agent })
  );
  const technicianOptions = Array.from(
    new Set(mockAgentJobStats.map(row => row.technician))
  ).map(technician => ({ label: technician, value: technician }));
  const sourceProviderOptions = Array.from(
    new Set(mockAgentJobStats.map(row => row.sourceProvider))
  ).map(sourceProvider => ({ label: sourceProvider, value: sourceProvider }));
  const jobTypeOptions = Array.from(
    new Set(mockAgentJobStats.map(row => row.jobType))
  ).map(jobType => ({ label: jobType, value: jobType }));

  const filteredRows = useMemo(() => {
    return mockAgentJobStats.filter(row => {
      const matchesSearch =
        searchQuery === "" ||
        row.agent.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAgent = quickAgents.length === 0 || quickAgents.includes(row.agent);
      const matchesTechnician = quickTechnician === "" || row.technician === quickTechnician;

      const matchesSourceProvider =
        quickSourceProvider === "" || row.sourceProvider === quickSourceProvider;
      const matchesJobType = quickJobTypes.length === 0 || quickJobTypes.includes(row.jobType);
      const matchesArea =
        quickArea.trim() === "" ||
        row.area.toLowerCase().includes(quickArea.trim().toLowerCase());
      const matchesCity =
        quickCity.trim() === "" ||
        row.city.toLowerCase().includes(quickCity.trim().toLowerCase());
      const matchesZip =
        quickZip.trim() === "" || row.zip.toLowerCase().includes(quickZip.trim().toLowerCase());
      const matchesState =
        quickState.trim() === "" ||
        row.state.toLowerCase().includes(quickState.trim().toLowerCase());

      const startDate = dateRangeValue?.startDate
        ? new Date(dateRangeValue.startDate)
        : null;
      const endDate = dateRangeValue?.endDate ? new Date(dateRangeValue.endDate) : null;
      const rowDate = new Date(row.reportDate);

      const matchesDateRange =
        (!startDate || rowDate >= startDate) && (!endDate || rowDate <= endDate);

      return (
        matchesSearch &&
        matchesAgent &&
        matchesTechnician &&
        matchesSourceProvider &&
        matchesJobType &&
        matchesArea &&
        matchesCity &&
        matchesZip &&
        matchesState &&
        matchesDateRange
      );
    });
  }, [
    searchQuery,
    quickAgents,
    quickTechnician,
    quickSourceProvider,
    quickJobTypes,
    quickArea,
    quickCity,
    quickZip,
    quickState,
    dateRangeValue,
  ]);

  const sortedRows = useMemo(() => {
    const rows = [...filteredRows];
    const direction = sortDir === "asc" ? 1 : -1;

    rows.sort((a, b) => {
      switch (sortBy) {
        case "agent":
          return a.agent.localeCompare(b.agent) * direction;
        case "jobIncomingCall":
          return (a.jobIncomingCall - b.jobIncomingCall) * direction;
        case "jobOutgoingCall":
          return (a.jobOutgoingCall - b.jobOutgoingCall) * direction;
        case "leadIncomingCall":
          return (a.leadIncomingCall - b.leadIncomingCall) * direction;
        case "leadOutgoingCall":
          return (a.leadOutgoingCall - b.leadOutgoingCall) * direction;
        case "totalJobLeadIncomingCall":
          return (
            (a.jobIncomingCall + a.leadIncomingCall - (b.jobIncomingCall + b.leadIncomingCall)) *
            direction
          );
        case "totalJobLeadOutgoingCall":
          return (
            (a.jobOutgoingCall + a.leadOutgoingCall - (b.jobOutgoingCall + b.leadOutgoingCall)) *
            direction
          );
        case "answeredBookingPct":
          return (
            (parseFloat(a.answeredBookingPct) - parseFloat(b.answeredBookingPct)) * direction
          );
        case "totalIncomingCall":
          return (
            (a.jobIncomingCall + a.leadIncomingCall - (b.jobIncomingCall + b.leadIncomingCall)) *
            direction
          );
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
    totalJobLeadIncomingCall: row.jobIncomingCall + row.leadIncomingCall,
    totalJobLeadOutgoingCall: row.jobOutgoingCall + row.leadOutgoingCall,
    totalIncomingCall: row.jobIncomingCall + row.leadIncomingCall,
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
    { columnName: "Job Incoming Call", cell: "jobIncomingCall", sortKey: "jobIncomingCall" },
    { columnName: "Job Outgoing Call", cell: "jobOutgoingCall", sortKey: "jobOutgoingCall" },
    { columnName: "Lead Incoming Call", cell: "leadIncomingCall", sortKey: "leadIncomingCall" },
    { columnName: "Lead Outgoing Call", cell: "leadOutgoingCall", sortKey: "leadOutgoingCall" },
    {
      columnName: "Total Job & Lead Incoming Call",
      cell: "totalJobLeadIncomingCall",
      sortKey: "totalJobLeadIncomingCall",
    },
    {
      columnName: "Total Job & Lead Outgoing Call",
      cell: "totalJobLeadOutgoingCall",
      sortKey: "totalJobLeadOutgoingCall",
    },
    { columnName: "Answered Booking(%)", cell: "answeredBookingPct", sortKey: "answeredBookingPct" },
    { columnName: "Total Incoming Call", cell: "totalIncomingCall", sortKey: "totalIncomingCall" },
  ];

  return (
    <>
      <Head>
        <title>Agent Jobs Report - WePro</title>
        <meta name="description" content="Agent jobs report" />
      </Head>
      <div className="md:h-[calc(100vh-112px)] flex flex-col">
        <div className="mb-6 relative rounded-lg p-4 md:p-5 pb-5 md:pb-6 border border-slate-200/60 dark:border-slate-700/60 shadow-none md:shadow-xl bg-white dark:bg-slate-900 md:bg-gradient-to-br md:from-slate-50 md:via-blue-50 md:to-indigo-50 md:dark:from-slate-900 md:dark:via-blue-950/20 md:dark:to-indigo-950/20">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 dark:from-slate-100 dark:to-blue-100 bg-clip-text text-transparent">
                  Agent Jobs Performance
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
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4">
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
                  label="Technician"
                  options={technicianOptions}
                  placeholder="All technicians"
                  value={quickTechnician}
                  onSearch={() => {}}
                  onSelect={val => {
                    setQuickTechnician(Array.isArray(val) ? (val[0] ?? "") : val);
                    setCurrentPage(1);
                  }}
                />
                <SelectInput
                  label="Source Provider"
                  options={sourceProviderOptions}
                  placeholder="All source providers"
                  value={quickSourceProvider}
                  onSearch={() => {}}
                  onSelect={val => {
                    setQuickSourceProvider(Array.isArray(val) ? (val[0] ?? "") : val);
                    setCurrentPage(1);
                  }}
                />
                <SelectInput
                  label="Job Type"
                  options={jobTypeOptions}
                  placeholder="All job types"
                  value={quickJobTypes}
                  multiselect
                  onSearch={() => {}}
                  onSelect={val => {
                    setQuickJobTypes(Array.isArray(val) ? val : []);
                    setCurrentPage(1);
                  }}
                />
                <AddressInput
                  isEditing
                  label="Area"
                  value={quickArea}
                  onChange={value => {
                    setQuickArea(value);
                    setCurrentPage(1);
                  }}
                  onAddressChange={({ address, city, zip, state }) => {
                    setQuickArea(address);
                    setQuickCity(city);
                    setQuickZip(zip);
                    setQuickState(state);
                    setCurrentPage(1);
                  }}
                />
                <div>
                  <label className="text-sm font-medium">City</label>
                  <Input
                    className="mt-1"
                    value={quickCity}
                    onChange={e => {
                      setQuickCity(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Zip</label>
                  <Input
                    className="mt-1"
                    value={quickZip}
                    onChange={e => {
                      setQuickZip(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">State</label>
                  <Input
                    className="mt-1"
                    value={quickState}
                    onChange={e => {
                      setQuickState(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
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
