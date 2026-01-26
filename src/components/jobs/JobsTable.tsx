import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  Calendar,
  Clock,
  DollarSign,
  Edit,
  Globe,
  Mail,
  MoreVertical,
  MapPin,
  Phone,
  RefreshCw,
  Trash2,
  User,
} from "lucide-react";

type Density = "comfortable" | "compact" | "ultra";

type JobStatus = {
  id: number;
  name: string;
  color: string;
};

type JobsTableProps = {
  jobs: any[];
  mobileJobs?: any[];
  density: Density;
  visibleClientFields: Record<string, boolean>;
  selectedRows: Set<string>;
  jobStatuses: JobStatus[];
  getStatusObj: (name: string) => { name: string; color: string };
  getJobStatus: (job: any) => string;
  getTimeAgo: (value: string) => string;
  getTimeUntil: (value: Date) => string;
  onToggleRow: (jobId: string, checked: boolean) => void;
  onDelete: (job: any) => void;
  onChangeStatus?: (jobId: string, statusName: string) => void;
  onLoadMore?: () => void;
  hasMoreMobile?: boolean;
  mobileLoading?: boolean;
};

const JobsTable: React.FC<JobsTableProps> = ({
  jobs,
  mobileJobs,
  density,
  visibleClientFields,
  selectedRows,
  jobStatuses,
  getStatusObj,
  getJobStatus,
  getTimeAgo,
  getTimeUntil,
  onToggleRow,
  onDelete,
  onChangeStatus,
  onLoadMore,
  hasMoreMobile = false,
  mobileLoading = false,
}) => (
  <>
    {/* Desktop table */}
    <div className="overflow-x-auto hidden md:block">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
            <TableHead className="w-10 text-left align-top" />
            <TableHead className={`font-semibold text-slate-900 dark:text-slate-100 ${density === "ultra" ? "py-2" : "py-3"} text-left w-[260px]`}>Job Details</TableHead>
            <TableHead className={`font-semibold text-slate-900 dark:text-slate-100 ${density === "ultra" ? "py-2" : "py-3"} text-left w-[240px]`}>Client Info</TableHead>
            <TableHead className={`font-semibold text-slate-900 dark:text-slate-100 ${density === "ultra" ? "py-2" : "py-3"} text-left w-[180px] whitespace-nowrap`}>Schedule</TableHead>
            <TableHead className={`font-semibold text-slate-900 dark:text-slate-100 ${density === "ultra" ? "py-2" : "py-3"} text-left w-[260px]`}>Location</TableHead>
            <TableHead className={`font-semibold text-slate-900 dark:text-slate-100 ${density === "ultra" ? "py-2" : "py-3"} text-left w-[160px]`}>Source</TableHead>
            <TableHead className={`font-semibold text-slate-900 dark:text-slate-100 ${density === "ultra" ? "py-2" : "py-3"} text-left w-[140px]`}>Created</TableHead>
            <TableHead className={`font-semibold text-slate-900 dark:text-slate-100 ${density === "ultra" ? "py-2" : "py-3"} text-left w-[200px]`}>Technician</TableHead>
            <TableHead className={`font-semibold text-slate-900 dark:text-slate-100 ${density === "ultra" ? "py-2" : "py-3"} text-left w-[220px]`}>Status</TableHead>
            <TableHead className={`font-semibold text-slate-900 dark:text-slate-100 ${density === "ultra" ? "py-2" : "py-3"} text-center w-[120px] sticky right-0 bg-white dark:bg-slate-900 border-l border-slate-300 dark:border-slate-700 shadow-[ -8px_0_12px_-8px_rgba(0,0,0,0.18)] dark:shadow-[ -8px_0_12px_-8px_rgba(0,0,0,0.5)] z-10`}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map(job => {
            const status = getStatusObj(getJobStatus(job));
            const timeAgo = getTimeAgo(job.lastUpdated || job.startDate);
            const scheduledTime = new Date(`${job.startDate} ${job.startTime}`);
            const timeUntilScheduled = getTimeUntil(scheduledTime);

            return (
              <TableRow key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 border-b border-slate-100 dark:border-slate-700">
                <TableCell className={`${density === "ultra" ? "py-1" : density === "compact" ? "py-2" : "py-3"} w-10 align-top`}>
                  <Checkbox
                    aria-label={`Select job ${job.id}`}
                    checked={selectedRows.has(job.id)}
                    onCheckedChange={checked => onToggleRow(job.id, Boolean(checked))}
                  />
                </TableCell>

              <TableCell className={`${density === "ultra" ? "py-1" : density === "compact" ? "py-2" : "py-3"} align-top min-w-[260px]`}>
                <div className={`${density === "ultra" ? "space-y-0.5" : density === "compact" ? "space-y-1" : "space-y-2"}`}>
                  <div className="flex items-center space-x-3">
                    <div className={`${density === "ultra" ? "w-7 h-7" : density === "compact" ? "w-8 h-8" : "w-10 h-10"} bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center`}>
                      <span className={`text-white font-bold ${density === "ultra" ? "text-[10px]" : density === "compact" ? "text-xs" : "text-sm"}`}>
                        {job.id.split("-")[2]}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className={`${density === "ultra" ? "text-[11px]" : "text-sm"} font-semibold text-slate-900 dark:text-slate-100 truncate`}>{job.jobType}</p>
                      <p className={`${density === "ultra" ? "text-[10px]" : "text-sm"} text-slate-600 dark:text-slate-400 truncate`}>{job.jobDescription}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      <span>{timeAgo}</span>
                    </span>
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <DollarSign className="w-3 h-3" />
                      <span>${job.revenue}</span>
                    </span>
                  </div>
                </div>
              </TableCell>

              <TableCell className={`${density === "ultra" ? "py-1" : density === "compact" ? "py-2" : "py-3"} align-top min-w-[240px]`}>
                <div className={`${density === "ultra" ? "space-y-0.5" : density === "compact" ? "space-y-1" : "space-y-2"}`}>
                  {visibleClientFields.clientName && (
                    <div className="min-w-0">
                      <p className={`${density === "ultra" ? "text-[11px]" : "text-sm"} font-semibold text-slate-900 dark:text-slate-100 truncate`}>{job.clientName}</p>
                      {visibleClientFields.companyName && (
                        <p className={`${density === "ultra" ? "text-[10px]" : "text-sm"} text-slate-600 dark:text-slate-400 truncate`}>{job.companyName}</p>
                      )}
                    </div>
                  )}
                  {visibleClientFields.phoneNumber && (
                    <div className={`flex items-center space-x-2 ${density === "ultra" ? "text-[10px]" : "text-sm"} text-slate-500 dark:text-slate-400`}>
                      <Phone className="w-3 h-3" />
                      <span>{job.phoneNumber}</span>
                    </div>
                  )}
                  {visibleClientFields.phoneNumber2 && (job as any).phoneNumber2 && (
                    <div className={`flex items-center space-x-2 ${density === "ultra" ? "text-[10px]" : "text-sm"} text-slate-500 dark:text-slate-400`}>
                      <Phone className="w-3 h-3" />
                      <span>{(job as any).phoneNumber2}</span>
                    </div>
                  )}
                  {visibleClientFields.email && (
                    <div className={`flex items-center space-x-2 ${density === "ultra" ? "text-[10px]" : "text-sm"} text-slate-500 dark:text-slate-400 truncate`}>
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{job.email}</span>
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell className={`${density === "ultra" ? "py-1" : density === "compact" ? "py-2" : "py-3"} align-top min-w-[180px]`}>
                <div className={`${density === "ultra" ? "space-y-0.5" : density === "compact" ? "space-y-1" : "space-y-2"}`}>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <div className={`${density === "ultra" ? "text-[11px]" : "text-sm"} font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap`}>
                      {new Date(job.startDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "2-digit",
                      })}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <div className={`${density === "ultra" ? "text-[11px]" : "text-sm"} font-semibold ${new Date(`${job.startDate} ${job.startTime}`) < new Date() ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-slate-100"}`}>
                      {job.startTime}
                    </div>
                    {new Date(`${job.startDate} ${job.startTime}`) < new Date() && <div className="w-2 h-2 bg-red-500 rounded-full" />}
                  </div>
                  <div className={`text-[10px] font-bold ${new Date(`${job.startDate} ${job.startTime}`) < new Date() ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}`}>
                    {new Date(`${job.startDate} ${job.startTime}`) < new Date() ? "PAST DUE" : timeUntilScheduled}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    Duration: {job.estimatedDuration}
                  </div>
                </div>
              </TableCell>

              <TableCell className={`${density === "ultra" ? "py-1" : density === "compact" ? "py-2" : "py-3"} align-top min-w-[260px]`}>
                <div className={`${density === "ultra" ? "space-y-0.5" : "space-y-1"}`}>
                  <p className={`${density === "ultra" ? "text-[11px]" : "text-sm"} text-slate-700 dark:text-slate-300 truncate`}>{job.location}</p>
                  <p className={`${density === "ultra" ? "text-[10px]" : "text-sm"} text-slate-600 dark:text-slate-400 truncate`}>
                    {job.city}, {job.state} {job.zipCode}
                  </p>
                </div>
              </TableCell>

              <TableCell className={`${density === "ultra" ? "py-1" : density === "compact" ? "py-2" : "py-3"} align-top min-w-[160px]`}>
                <div className={`${density === "ultra" ? "space-y-0.5" : density === "compact" ? "space-y-1" : "space-y-2"}`}>
                  <div className="flex items-center space-x-2">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <span className={`${density === "ultra" ? "text-[11px]" : "text-sm"} font-medium text-slate-900 dark:text-slate-100 capitalize truncate`}>
                      {job.source === "yelp"
                        ? "Yelp"
                        : job.source === "google-ads"
                          ? "Google Ads"
                          : job.source === "facebook"
                            ? "Facebook"
                            : job.source === "referral"
                              ? "Referral"
                              : job.source === "website"
                                ? "Website"
                                : job.source === "phone"
                                  ? "Phone Call"
                                  : job.source === "contract"
                                    ? "Contract"
                                    : job.source || "Direct"}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Lead Source</div>
                </div>
              </TableCell>

              <TableCell className={`${density === "ultra" ? "py-1" : density === "compact" ? "py-2" : "py-3"} align-top min-w-[140px]`}>
                <div className={`${density === "ultra" ? "space-y-0.5" : density === "compact" ? "space-y-1" : "space-y-2"}`}>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span className={`${density === "ultra" ? "text-[11px]" : "text-sm"} font-medium text-slate-900 dark:text-slate-100`}>
                      {new Date(job.createdAt || job.lastUpdated).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {new Date(job.createdAt || job.lastUpdated).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </TableCell>

              <TableCell className={`${density === "ultra" ? "py-1" : density === "compact" ? "py-2" : "py-3"} align-top min-w-[200px]`}>
                <div className={`${density === "ultra" ? "space-y-0.5" : density === "compact" ? "space-y-1" : "space-y-2"}`}>
                  <div className="flex items-center space-x-2">
                    <User className={`w-3.5 h-3.5 ${job.assignedTechnician ? "text-green-500" : "text-red-500"}`} />
                    <span className={`${density === "ultra" ? "text-[11px]" : "text-sm"} font-medium ${job.assignedTechnician ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"} truncate`}>
                      {job.assignedTechnician ? `Assigned: ${job.assignedTechnician}` : "UNASSIGNED"}
                    </span>
                  </div>
                </div>
              </TableCell>

              <TableCell className={`${density === "ultra" ? "py-1" : density === "compact" ? "py-2" : "py-3"} align-top min-w-[220px]`}>
                <div className={`${density === "ultra" ? "space-y-1" : density === "compact" ? "space-y-1.5" : "space-y-3"}`}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="cursor-pointer text-[10px] font-semibold px-2.5 py-0.5 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 dark:focus:ring-slate-600"
                        style={{ backgroundColor: `${status.color}20`, color: status.color }}
                      >
                        {status.name}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      {jobStatuses.map(statusOption => (
                        <DropdownMenuItem
                          key={statusOption.id}
                          className="flex items-center gap-2"
                          onClick={() => onChangeStatus?.(job.id, statusOption.name)}
                        >
                          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: statusOption.color }} />
                          <span>{statusOption.name}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span className="text-[10px] text-slate-600 dark:text-slate-400">{timeAgo} in status</span>
                  </div>

                  <Badge
                    variant="secondary"
                    className={`text-[10px] px-2 py-0.5 ${
                      job.priority === "High"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    }`}
                  >
                    {job.priority === "High" ? "NEED TO COLLECT PAYMENT" : "OPPORTUNITY"}
                  </Badge>

                  <div className="flex items-center space-x-2">
                    <Phone className={`w-3 h-3 ${job.noteTags?.includes("called") ? "text-green-500" : "text-slate-400"}`} />
                    <span className="text-[10px] text-slate-600 dark:text-slate-400">
                      {job.noteTags?.includes("called") ? "Client Called" : "No Call Yet"}
                    </span>
                  </div>
                </div>
              </TableCell>

              <TableCell className={`${density === "ultra" ? "py-1" : density === "compact" ? "py-2" : "py-3"} text-center w-[120px] sticky right-0 bg-white dark:bg-slate-900 border-l border-slate-300 dark:border-slate-700 shadow-[ -8px_0_12px_-8px_rgba(0,0,0,0.18)] dark:shadow-[ -8px_0_12px_-8px_rgba(0,0,0,0.5)]`}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0" aria-label="Actions">
                      <MoreVertical className={`${density === "ultra" ? "w-3.5 h-3.5" : "w-4 h-4"}`} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="flex items-center gap-2">
                      <Edit className="w-4 h-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Change Status
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-44">
                        {jobStatuses.map(statusOption => (
                          <DropdownMenuItem
                            key={statusOption.id}
                            className="flex items-center gap-2"
                            onClick={() => onChangeStatus?.(job.id, statusOption.name)}
                          >
                            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: statusOption.color }} />
                            <span>{statusOption.name}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuItem className="flex items-center gap-2 text-red-600" onClick={() => onDelete(job)}>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>

    {/* Mobile cards */}
    <>
      {(mobileJobs ?? jobs).map(job => {
        const status = getStatusObj(getJobStatus(job));
        const timeAgo = getTimeAgo(job.lastUpdated || job.startDate);
        const scheduledTime = new Date(`${job.startDate} ${job.startTime}`);
        const timeUntilScheduled = getTimeUntil(scheduledTime);

        return (
          <Card key={job.id} className="md:hidden border-slate-200 dark:border-slate-800 shadow-sm mb-3">
            <CardHeader className="pb-2 flex flex-row items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  aria-label={`Select job ${job.id}`}
                  checked={selectedRows.has(job.id)}
                  onCheckedChange={checked => onToggleRow(job.id, Boolean(checked))}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-base">{job.jobType}</CardTitle>
                    <Badge
                      variant="secondary"
                      className="text-[10px]"
                      style={{ backgroundColor: `${status.color}20`, color: status.color }}
                    >
                      {status.name}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
                    <DollarSign className="w-3 h-3" />
                    ${job.revenue}
                    <Clock className="w-3 h-3" />
                    {timeAgo}
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Change Status
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-44">
                      {jobStatuses.map(statusOption => (
                        <DropdownMenuItem
                          key={statusOption.id}
                          className="flex items-center gap-2"
                          onClick={() => onChangeStatus?.(job.id, statusOption.name)}
                        >
                          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: statusOption.color }} />
                          <span>{statusOption.name}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuItem className="flex items-center gap-2 text-red-600" onClick={() => onDelete(job)}>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>

            <CardContent className="space-y-3 text-sm">
              <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-300">
                <User className="w-4 h-4" />
                {job.clientName}
                {job.companyName ? <span className="text-xs text-slate-500">• {job.companyName}</span> : null}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-300">
                <Phone className="w-4 h-4" />
                <span>{job.phoneNumber}</span>
                {job.email ? (
                  <>
                    <Mail className="w-4 h-4 ml-2" />
                    <span className="truncate max-w-[160px]">{job.email}</span>
                  </>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-300">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(job.startDate).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "2-digit",
                  })}
                  , {job.startTime}
                </span>
                <Badge variant="secondary" className="text-[10px]">
                  {new Date(`${job.startDate} ${job.startTime}`) < new Date() ? "Past due" : timeUntilScheduled}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-300">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{job.location}</span>
                <span className="text-xs text-slate-500">
                  {job.city}, {job.state} {job.zipCode}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-300">
                <Globe className="w-4 h-4" />
                <span className="capitalize">
                  {job.source === "yelp"
                    ? "Yelp"
                    : job.source === "google-ads"
                      ? "Google Ads"
                      : job.source === "facebook"
                        ? "Facebook"
                        : job.source === "referral"
                          ? "Referral"
                          : job.source === "website"
                            ? "Website"
                            : job.source === "phone"
                              ? "Phone Call"
                              : job.source === "contract"
                                ? "Contract"
                                : job.source || "Direct"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-300">
                <User className={`w-4 h-4 ${job.assignedTechnician ? "text-green-500" : "text-red-500"}`} />
                <span className="font-semibold">
                  {job.assignedTechnician ? `Assigned: ${job.assignedTechnician}` : "Unassigned"}
                </span>
                <Badge
                  variant="secondary"
                  className={`text-[10px] ${job.priority === "High" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
                >
                  {job.priority === "High" ? "Need payment" : "Opportunity"}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                <Clock className="w-3 h-3" />
                {timeAgo} • {job.estimatedDuration || "—"} • {job.jobCategory || "General"}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {onLoadMore ? (
        <div className="md:hidden pt-2 pb-4 flex justify-center">
          <Button
            size="sm"
            variant="outline"
            onClick={onLoadMore}
            disabled={!hasMoreMobile || mobileLoading}
            className="w-full"
          >
            {mobileLoading ? "Loading..." : hasMoreMobile ? "Load more" : "No more records"}
          </Button>
        </div>
      ) : null}
    </>
  </>
);

export default JobsTable;

