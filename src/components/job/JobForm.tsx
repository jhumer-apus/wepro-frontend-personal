"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/src/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";
import { Switch } from "@/src/components/ui/switch";
import { Slider } from "@/src/components/ui/slider";
import Table from "@/src/components/table";
import SelectInput from "@/src/components/input/select";
import InputDatepicker from "@/src/components/input/datepicker";
import {
  X,
  User,
  MapPin,
  Wrench,
  Calendar,
  Users,
  FileText,
  Calculator,
  CreditCard,
  MessageSquare,
  Send,
  Search,
  Plus,
  Minus,
  Pause,
  Play,
  Volume2,
  VolumeX,
  MoreVertical,
} from "lucide-react";

// Log message type for Activity > Logs
type LogMessageDirection = "incoming" | "outgoing";
type LogMessageKind = "text" | "audio";
export interface LogMessage {
  id: string;
  direction: LogMessageDirection;
  kind: LogMessageKind;
  body?: string;
  audioUrl?: string;
  senderName: string;
  timestamp: string;
}

const TEST_MP3_URL =
  "http://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3";

function InlineAudioPlayer({
  audioUrl,
  className,
}: {
  audioUrl: string;
  className?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const togglePlayPause = async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      try {
        await audioRef.current.play();
      } catch (e) {
        console.error("Play failed:", e);
      }
    }
  };

  const handleSeek = (value: number[]) => {
    const t = value[0];
    if (audioRef.current) {
      audioRef.current.currentTime = t;
      setCurrentTime(t);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  return (
    <div className={cn("flex items-center gap-2 min-w-0", className)}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" className="hidden" />
      <button
        type="button"
        onClick={togglePlayPause}
        className="shrink-0 p-0.5 rounded hover:opacity-80"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 text-black" />
        ) : (
          <Play className="w-4 h-4 text-black fill-black" />
        )}
      </button>
      <span className="text-sm tabular-nums shrink-0">{formatTime(currentTime)}</span>
      <span className="text-sm text-black/70 shrink-0">{formatTime(duration)}</span>
      <div className="flex-1 min-w-0">
        <Slider
          value={[currentTime]}
          onValueChange={handleSeek}
          max={duration || 1}
          step={0.1}
          className="w-full"
          disabled={duration <= 0}
        />
      </div>
      <button
        type="button"
        onClick={toggleMute}
        className="shrink-0 p-0.5 rounded hover:opacity-80"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="shrink-0 p-0.5 rounded hover:opacity-80"
            aria-label="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Download</DropdownMenuItem>
          <DropdownMenuItem>Share</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

const SAMPLE_LOG_MESSAGES: LogMessage[] = [
  { id: "1", direction: "incoming", kind: "text", body: "Ok thanks", senderName: "Liel Levy", timestamp: "02/09/2026 09:25:18" },
  { id: "2", direction: "outgoing", kind: "text", body: "Hi Albert, I'm Jane from Evergreen Turf Installation. I just emailed you the estimate.", senderName: "hayahadjadj e", timestamp: "02/09/2026 09:24:24" },
  { id: "3", direction: "outgoing", kind: "audio", audioUrl: TEST_MP3_URL, senderName: "April Puzon", timestamp: "02/08/2026 12:18:43" },
];

export interface AddPaymentFormState {
  from: { name: string; email: string; street: string; city: string; state: string; zipcode: string; country: string; phone: string };
  billTo: { name: string; email: string; street: string; city: string; state: string; zipcode: string; country: string; phone: string };
  type: string;
  date: string;
  paymentMethod: string;
  status: string;
  techCost: string;
  companyCost: string;
  customRate: string;
  amountPercentage: string;
  lineItems: Array<{ description: string; qty: number; rate: number; amount: number }>;
  tax: string;
  discount: string;
  notes: string;
  clientSignature: boolean;
  sendToClient: string;
}

/** Form data for the job details form. Can be passed from parent or loaded by jobId (API) later. */
export type JobFormData = Record<string, any>;

export interface JobFormProps {
  /** Whether the job details dialog is open */
  open: boolean;
  /** Called when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Current job id (for future API calls: activity, financials, nearest jobs, invoices) */
  jobId: string | null;
  /** Initial/current form data (e.g. selected job from list). API can replace this when jobId is set. */
  formData?: JobFormData | null;
  /** Called after job is saved so parent can refresh list */
  onJobUpdated?: () => void;
}

// Defaults used inside JobForm (will be replaced by API later)
const DEFAULT_JOB_STATUSES = [
  { id: 1, name: "Pending", color: "#8B5CF6" },
  { id: 2, name: "Rejected", color: "#2563EB" },
  { id: 3, name: "No Answer", color: "#F59E42" },
  { id: 4, name: "Canceled", color: "#EF4444" },
  { id: 5, name: "Done", color: "#22C55E" },
  { id: 6, name: "In Progress", color: "#3B82F6" },
  { id: 7, name: "Submitted", color: "#FBBF24" },
  { id: 8, name: "Appointments", color: "#22C55E" },
];

const getStatusObj = (name?: string) => {
  const found = DEFAULT_JOB_STATUSES.find((s) => s.name === name);
  return found ?? { name: name || "Pending", color: "#888" };
};

const DEFAULT_TECHNICIAN_OPTIONS = ["Tech One", "Tech Two", "Tech Three", "OK LINE"];
const DEFAULT_QUICK_TAG_NOTE_OPTIONS = ["follow-up", "rescheduled", "no-answer", "customer-cancelled", "pending-confirmation"];

const INVOICE_DUMMY_DATA = [
  { id: "1", amount: "$500.00", description: "HVAC repair service", paymentMethod: "Credit Card", status: "Paid", approvedStatus: "Approved", dueDate: "2025-02-20", addedBy: "John Doe", referenceNo: "REF-001", dated: "2025-02-01" },
  { id: "2", amount: "$350.00", description: "Annual maintenance", paymentMethod: "Check", status: "Pending", approvedStatus: "Pending", dueDate: "2025-02-25", addedBy: "Jane Smith", referenceNo: "REF-002", dated: "2025-02-05" },
  { id: "3", amount: "$1,200.00", description: "Full system installation", paymentMethod: "Bank Transfer", status: "Paid", approvedStatus: "Approved", dueDate: "2025-02-15", addedBy: "John Doe", referenceNo: "REF-003", dated: "2025-01-28" },
  { id: "4", amount: "$85.00", description: "Service call", paymentMethod: "Cash", status: "Paid", approvedStatus: "Approved", dueDate: "2025-02-10", addedBy: "Jane Smith", referenceNo: "REF-004", dated: "2025-02-08" },
  { id: "5", amount: "$420.00", description: "Parts and labor", paymentMethod: "Credit Card", status: "Overdue", approvedStatus: "Rejected", dueDate: "2025-02-01", addedBy: "John Doe", referenceNo: "REF-005", dated: "2025-01-20" },
];

const DEFAULT_ACTIVITY = [
  { type: "activity", title: "Job Activity", summary: "Responder changed to Not Confirmed", timestamp: "07/02/2025 09:03 PM", user: "System", color: "#2563eb" },
  { type: "assign", title: "Job Assign", summary: "Job assigned to Technician: OK LINE", timestamp: "07/02/2025 09:03 PM", user: "Jocres Cartagena Cequiña", color: "#059669" },
  { type: "note", title: "Job Note", summary: "Customer requested early arrival.", timestamp: "07/02/2025 09:02 PM", user: "Dispatcher", color: "#2563eb" },
  { type: "payment", title: "Payment Received", summary: "Payment of $200 received.", timestamp: "07/02/2025 09:01 PM", user: "System", color: "#eab308" },
  { type: "call", title: "Call Recording", summary: "Call with customer recorded.", timestamp: "07/02/2025 09:00 PM", user: "Reception", color: "#a21caf" },
  { type: "messages", title: "Message Sent", summary: "Text message sent to customer.", timestamp: "07/02/2025 08:59 PM", user: "System", color: "#db2777" },
  { type: "activity", title: "Job Created", summary: "Job created by (LS) Jocres Cartagena Cequiña", timestamp: "07/02/2025 08:58 PM", user: "Jocres Cartagena Cequiña", color: "#2563eb" },
];

const DEFAULT_NEAREST_JOBS = [
  { id: "job-2053", clientName: "test", companyName: "", phoneNumber: "3335555555555", email: "test", jobTags: ["Job"], noteTags: [], status: "Confirmed", revenue: 0, location: "123 Main St", city: "Houston", state: "TX", zipCode: "77001", jobDescription: "Test job description", assignedTechnician: "Tech One" },
  { id: "job-2054", clientName: "test", companyName: "", phoneNumber: "3335555555555", email: "test", jobTags: ["Job"], noteTags: [], status: "Confirmed", revenue: 0, location: "456 Oak Ave", city: "Houston", state: "TX", zipCode: "77002", jobDescription: "Follow-up job", assignedTechnician: "Tech Two" },
  { id: "job-2055", clientName: "tessss", companyName: "", phoneNumber: "3335555555555", email: "tesss", jobTags: ["Job", "Test Tags"], noteTags: [], status: "Done", revenue: 0, location: "789 Business Blvd", city: "Houston", state: "TX", zipCode: "77003", jobDescription: "Completed test job", assignedTechnician: "Tech Three" },
];

const initialAddPaymentForm = (): AddPaymentFormState => ({
  from: { name: "", email: "", street: "", city: "", state: "", zipcode: "", country: "", phone: "" },
  billTo: { name: "", email: "", street: "", city: "", state: "", zipcode: "", country: "", phone: "" },
  type: "",
  date: "",
  paymentMethod: "",
  status: "",
  techCost: "",
  companyCost: "",
  customRate: "",
  amountPercentage: "",
  lineItems: [{ description: "", qty: 0, rate: 0, amount: 0 }],
  tax: "",
  discount: "",
  notes: "",
  clientSignature: false,
  sendToClient: "No",
});

export function JobForm(props: JobFormProps) {
  const { open, onOpenChange, jobId, formData: formDataProp, onJobUpdated } = props;

  // Form data: synced from prop when open/jobId/formDataProp changes; edited locally
  const [formData, setFormData] = useState<JobFormData>(() => formDataProp ?? {});
  const [activeTab, setActiveTab] = useState("details");
  const [isEditing, setIsEditing] = useState(true);
  const [showSecondPhone, setShowSecondPhone] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [activityFilter, setActivityFilter] = useState("all");
  const [activity, setActivity] = useState(DEFAULT_ACTIVITY);
  const [showReplyNote, setShowReplyNote] = useState<number | null>(null);
  const [replyNote, setReplyNote] = useState("");
  const [nearestJobsSearchQuery, setNearestJobsSearchQuery] = useState("");
  const [nearestJobsPage, setNearestJobsPage] = useState(1);
  const [nearestJobsEntriesPerPage, setNearestJobsEntriesPerPage] = useState(10);
  const [invoiceTableSearch, setInvoiceTableSearch] = useState("");
  const [invoiceTablePage, setInvoiceTablePage] = useState(1);
  const [invoiceTablePageSize, setInvoiceTablePageSize] = useState(10);
  const [addPaymentForm, setAddPaymentForm] = useState<AddPaymentFormState>(initialAddPaymentForm);

  useEffect(() => {
    if (open && (formDataProp != null || jobId)) {
      setFormData(formDataProp ?? {});
    }
  }, [open, jobId, formDataProp]);

  const handleEditChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // TODO: API call to save job
    onJobUpdated?.();
    setIsEditing(false);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setActivity((prev) => [{ type: "note", title: "Job Note", summary: newNote, timestamp: new Date().toLocaleString(), user: "You", color: "#2563eb" }, ...prev]);
    setNewNote("");
  };

  const handleReplyNote = (index: number) => {
    if (!replyNote.trim()) return;
    setReplyNote("");
    setShowReplyNote(null);
  };

  const filteredActivity = activityFilter === "all" ? activity : activity.filter((a) => a.type === activityFilter);

  const invoiceFilteredRows = React.useMemo(() => {
    if (!invoiceTableSearch.trim()) return INVOICE_DUMMY_DATA;
    const q = invoiceTableSearch.toLowerCase();
    return INVOICE_DUMMY_DATA.filter(
      (row: any) =>
        row.description?.toLowerCase().includes(q) ||
        row.referenceNo?.toLowerCase().includes(q) ||
        row.addedBy?.toLowerCase().includes(q) ||
        row.status?.toLowerCase().includes(q)
    );
  }, [invoiceTableSearch]);
  const invoiceTotalCount = invoiceFilteredRows.length;
  const invoiceTotalPages = Math.max(1, Math.ceil(invoiceTotalCount / invoiceTablePageSize));
  const invoicePagedRows = React.useMemo(
    () => invoiceFilteredRows.slice((invoiceTablePage - 1) * invoiceTablePageSize, (invoiceTablePage - 1) * invoiceTablePageSize + invoiceTablePageSize),
    [invoiceFilteredRows, invoiceTablePage, invoiceTablePageSize]
  );
  const invoiceTableColumns = React.useMemo(
    () => [
      { columnName: "Sr No.", sortKey: "srNo", cell: (row: any) => (invoiceTablePage - 1) * invoiceTablePageSize + invoiceFilteredRows.indexOf(row) + 1 },
      { columnName: "Amount", sortKey: "amount", cell: (row: any) => row.amount },
      { columnName: "Description", sortKey: "description", cell: (row: any) => row.description },
      { columnName: "Payment Method", sortKey: "paymentMethod", cell: (row: any) => row.paymentMethod },
      { columnName: "Status", sortKey: "status", cell: (row: any) => row.status },
      { columnName: "Approved status", sortKey: "approvedStatus", cell: (row: any) => row.approvedStatus },
      { columnName: "Due Date", sortKey: "dueDate", cell: (row: any) => row.dueDate },
      { columnName: "Added By", sortKey: "addedBy", cell: (row: any) => row.addedBy },
      { columnName: "Reference No", sortKey: "referenceNo", cell: (row: any) => row.referenceNo },
      { columnName: "Dated", sortKey: "dated", cell: (row: any) => row.dated },
      { columnName: "Action", cell: () => <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:text-blue-700">View</Button> },
    ],
    [invoiceTablePage, invoiceTablePageSize, invoiceFilteredRows]
  );

  const addPaymentAddLineItem = () => {
    setAddPaymentForm((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: "", qty: 0, rate: 0, amount: 0 }],
    }));
  };
  const addPaymentRemoveLineItem = (index: number) => {
    setAddPaymentForm((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index),
    }));
  };
  const addPaymentLineItemChange = (index: number, field: "description" | "qty" | "rate", value: string | number) => {
    setAddPaymentForm((prev) => {
      const next = [...prev.lineItems];
      next[index] = { ...next[index], [field]: value };
      if (field === "qty" || field === "rate") next[index].amount = (next[index].qty || 0) * (next[index].rate || 0);
      return { ...prev, lineItems: next };
    });
  };
  const addPaymentSubtotal = addPaymentForm.lineItems.reduce((s, i) => s + (i.qty || 0) * (i.rate || 0), 0);
  const addPaymentProcessingFee = 0;
  const addPaymentGrandTotal = addPaymentSubtotal + addPaymentProcessingFee;

  const nearestJobsFiltered = React.useMemo(() => {
    const q = nearestJobsSearchQuery.trim().toLowerCase();
    if (!q) return DEFAULT_NEAREST_JOBS;
    return DEFAULT_NEAREST_JOBS.filter(
      (row: any) =>
        (row.id || "").toLowerCase().includes(q) ||
        (row.clientName || "").toLowerCase().includes(q) ||
        (row.companyName || "").toLowerCase().includes(q) ||
        (row.phoneNumber || "").toLowerCase().includes(q) ||
        (row.email || "").toLowerCase().includes(q) ||
        (row.status || "").toLowerCase().includes(q)
    );
  }, [nearestJobsSearchQuery]);
  const nearestTotalPages = Math.max(1, Math.ceil(nearestJobsFiltered.length / nearestJobsEntriesPerPage));
  const nearestPaged = nearestJobsFiltered.slice((nearestJobsPage - 1) * nearestJobsEntriesPerPage, nearestJobsPage * nearestJobsEntriesPerPage);
  const nearestJobsColumns = React.useMemo(
    () => [
      { columnName: "Job Details", sortKey: "id", cell: (row: any) => <span className="text-sm font-medium">{row.id}</span> },
      { columnName: "Client", sortKey: "clientName", cell: (row: any) => row.clientName },
      { columnName: "Location", sortKey: "location", cell: (row: any) => row.location },
      { columnName: "Status", sortKey: "status", cell: (row: any) => row.status },
      { columnName: "Revenue", sortKey: "revenue", cell: (row: any) => `$${row.revenue ?? 0}` },
    ],
    []
  );

  const selectedJob = formData;

  return (
    <>
      {/* Job Details Dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[100vw] w-[100vw] h-[100vh] [&>button]:hidden rounded-none sm:rounded-none mx-auto p-0 shadow-2xl border bg-white overflow-hidden flex flex-col">
          <div className="flex flex-col min-h-0 flex-1 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {selectedJob?.id ? (
                    <>
                      <span className="text-sm font-medium text-gray-600">Job ID:</span>
                      <span className="text-lg font-bold text-brandGreen-700">{selectedJob.id}</span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-brandGreen-700">Create New Job</span>
                  )}
                </div>
                {selectedJob?.id &&
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button type="button" className="cursor-pointer focus:outline-none rounded-md">
                        <Badge
                          style={{ backgroundColor: getStatusObj(selectedJob?.status || "Pending").color, color: "white" }}
                          className="px-3 py-1"
                        >
                          {selectedJob?.status || "Pending"}
                        </Badge>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-44">
                      {DEFAULT_JOB_STATUSES.map((statusOption) => (
                        <DropdownMenuItem
                          key={statusOption.id}
                          className="flex items-center gap-2"
                          onClick={() => setFormData((prev) => ({ ...prev, status: statusOption.name }))}
                        >
                          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: statusOption.color }} />
                          <span>{statusOption.name}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                }
                {selectedJob?.revenue != null && (
                  <Badge variant="outline" className="px-3 py-1">
                    ${selectedJob.revenue}
                  </Badge>
                )}
              </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowInvoiceModal(true)}>
                    Invoice
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shadow-sm hover:shadow-md rounded-full transition-all duration-200 text-xs h-9 w-9"
                    onClick={() => onOpenChange(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0 border-b overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 w-full">
                  <TabsList className="grid w-full grid-cols-4 shrink-0">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                    <TabsTrigger value="financials">Financials</TabsTrigger>
                    <TabsTrigger value="nearest-jobs">Nearest Jobs</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="flex-1 min-h-0 overflow-y-auto p-6 pb-20 space-y-6 data-[state=inactive]:hidden data-[state=active]:flex data-[state=active]:flex-col">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Client Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-sm font-medium">Client Name</Label>
                              {isEditing ? (
                                <Input value={formData.clientName || ""} onChange={(e) => handleEditChange("clientName", e.target.value)} className="mt-1" />
                              ) : (
                                <div className="mt-1 text-sm">{selectedJob.clientName}</div>
                              )}
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Company</Label>
                              {isEditing ? (
                                <Input value={formData.companyName || ""} onChange={(e) => handleEditChange("companyName", e.target.value)} className="mt-1" />
                              ) : (
                                <div className="mt-1 text-sm">{selectedJob.companyName}</div>
                              )}
                            </div>
                          </div>
                          <div className={`grid grid-cols-${showSecondPhone ? "3" : "2"} gap-3`}>
                            <div>
                              <Label className="text-sm font-medium">Email</Label>
                              {isEditing ? (
                                <Input value={formData.email || ""} onChange={(e) => handleEditChange("email", e.target.value)} className="mt-1" />
                              ) : (
                                <div className="mt-1 text-sm">{selectedJob.email}</div>
                              )}
                            </div>
                            <div className="mt-1">
                              <div className="flex items-center justify-between gap-2">
                                <Label className="text-sm font-medium">Phone</Label>
                                {isEditing && !showSecondPhone && (
                                  <button
                                    type="button"
                                    onClick={() => setShowSecondPhone(true)}
                                    className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                                  >
                                    + Add more
                                  </button>
                                )}
                              </div>
                              {isEditing ? (
                                <div className="space-y-1 mt-1">
                                  <Input value={formData.phoneNumber || ""} onChange={(e) => handleEditChange("phoneNumber", e.target.value)} />
                                </div>
                              ) : (
                                <div className="mt-1 space-y-0.5">
                                  <div className="text-sm">{selectedJob.phoneNumber}</div>
                                  {(selectedJob as { phoneNumber2?: string }).phoneNumber2 && (
                                    <div className="text-sm text-slate-600 dark:text-slate-400">
                                      {(selectedJob as { phoneNumber2?: string }).phoneNumber2}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            {showSecondPhone && (
                              <div className="mt-1">
                                <div className="flex items-center justify-between gap-2 mt-1">
                                  <Label className="text-sm font-medium">&nbsp;</Label>
                                  {showSecondPhone && (
                                    <button
                                      type="button"
                                      onClick={() => setShowSecondPhone(false)}
                                      className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>
                                <Input
                                  value={(formData as { phoneNumber2?: string }).phoneNumber2 || ""}
                                  onChange={(e) => handleEditChange("phoneNumber2", e.target.value)}
                                  placeholder="Additional phone"
                                />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            Service Location
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-sm font-medium">Location</Label>
                              {isEditing ? (
                                <Input value={formData.location || ""} onChange={(e) => handleEditChange("location", e.target.value)} className="mt-1" />
                              ) : (
                                <div className="mt-1 text-sm">{selectedJob.location}</div>
                              )}
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Apartment #</Label>
                              {isEditing ? (
                                <Input
                                  value={(formData as { apartmentNumber?: string }).apartmentNumber || ""}
                                  onChange={(e) => handleEditChange("apartmentNumber", e.target.value)}
                                  className="mt-1"
                                />
                              ) : (
                                <div className="mt-1 text-sm">{(selectedJob as { apartmentNumber?: string }).apartmentNumber ?? "—"}</div>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-sm font-medium">City</Label>
                              {isEditing ? (
                                <Input value={formData.city || ""} onChange={(e) => handleEditChange("city", e.target.value)} className="mt-1" />
                              ) : (
                                <div className="mt-1 text-sm">{selectedJob.city}</div>
                              )}
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Zip</Label>
                              {isEditing ? (
                                <Input value={formData.zipCode || ""} onChange={(e) => handleEditChange("zipCode", e.target.value)} className="mt-1" />
                              ) : (
                                <div className="mt-1 text-sm">{selectedJob.zipCode}</div>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-sm font-medium">State</Label>
                              {isEditing ? (
                                <Input value={formData.state || ""} onChange={(e) => handleEditChange("state", e.target.value)} className="mt-1" />
                              ) : (
                                <div className="mt-1 text-sm">{selectedJob.state}</div>
                              )}
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Country</Label>
                              {isEditing ? (
                                <Input value={formData.country || ""} onChange={(e) => handleEditChange("country", e.target.value)} className="mt-1" />
                              ) : (
                                <div className="mt-1 text-sm">{(selectedJob as { country?: string }).country ?? "United States"}</div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Wrench className="w-5 h-5" />
                            Job Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-sm font-medium">Job Category</Label>
                              {isEditing ? (
                                <Select value={formData.jobCategory || ""} onValueChange={(value) => handleEditChange("jobCategory", value)}>
                                  <SelectTrigger className="mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                                    <SelectItem value="Electrical">Electrical</SelectItem>
                                    <SelectItem value="HVAC">HVAC</SelectItem>
                                    <SelectItem value="General">General</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <div className="mt-1 text-sm">{selectedJob.jobCategory}</div>
                              )}
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Job Type</Label>
                              {isEditing ? (
                                <Select value={formData.jobType || ""} onValueChange={(value) => handleEditChange("jobType", value)}>
                                  <SelectTrigger className="mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Repair">Repair</SelectItem>
                                    <SelectItem value="Installation">Installation</SelectItem>
                                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                                    <SelectItem value="Emergency">Emergency</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <div className="mt-1 text-sm">{selectedJob.jobType}</div>
                              )}
                            </div>
                          </div>
                          <div>
                            {isEditing ? (
                              <SelectInput
                                label="Source"
                                options={[
                                  { label: "Yelp", value: "yelp" },
                                  { label: "Google Ads", value: "google-ads" },
                                  { label: "Facebook", value: "facebook" },
                                  { label: "Referral", value: "referral" },
                                  { label: "Website", value: "website" },
                                  { label: "Direct Call", value: "phone" },
                                ]}
                                placeholder="Select source"
                                value={formData.source ?? ""}
                                onSelect={(val) => handleEditChange("source", Array.isArray(val) ? (val[0] ?? "") : val)}
                              />
                            ) : (
                              <>
                                <Label className="text-sm font-medium">Source</Label>
                                <div className="mt-1 text-sm">
                                  {[
                                    { label: "Yelp", value: "yelp" },
                                    { label: "Google Ads", value: "google-ads" },
                                    { label: "Facebook", value: "facebook" },
                                    { label: "Referral", value: "referral" },
                                    { label: "Website", value: "website" },
                                    { label: "Direct Call", value: "phone" },
                                  ].find((o) => o.value === (selectedJob as { source?: string }).source)?.label ??
                                    (selectedJob as { source?: string }).source ??
                                    "—"}
                                </div>
                              </>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {isEditing ? (
                              <SelectInput
                                label="Job Status"
                                options={DEFAULT_JOB_STATUSES.map((s) => ({ label: s.name, value: s.name }))}
                                placeholder="Select status"
                                value={formData.status ?? selectedJob?.status ?? ""}
                                onSelect={(val) => handleEditChange("status", Array.isArray(val) ? (val[0] ?? "") : val)}
                              />
                            ) : (
                              <div>
                                <Label className="text-sm font-medium">Job Status</Label>
                                <div className="mt-1 text-sm">{selectedJob?.status ?? "—"}</div>
                              </div>
                            )}
                            {isEditing ? (
                              <SelectInput
                                label="Sub Status"
                                options={[
                                  { label: "Nothing selected", value: "" },
                                  { label: "Follow up", value: "follow-up" },
                                  { label: "Rescheduled", value: "rescheduled" },
                                  { label: "No answer", value: "no-answer" },
                                  { label: "Customer cancelled", value: "customer-cancelled" },
                                  { label: "Pending confirmation", value: "pending-confirmation" },
                                ]}
                                placeholder="Nothing selected"
                                value={(formData as { subStatus?: string }).subStatus ?? (selectedJob as { subStatus?: string }).subStatus ?? ""}
                                onSelect={(val) => handleEditChange("subStatus", Array.isArray(val) ? (val[0] ?? "") : val)}
                              />
                            ) : (
                              <div>
                                <Label className="text-sm font-medium">Sub Status</Label>
                                <div className="mt-1 text-sm">
                                  {([{ label: "Follow up", value: "follow-up" }, { label: "Rescheduled", value: "rescheduled" }, { label: "No answer", value: "no-answer" }, { label: "Customer cancelled", value: "customer-cancelled" }, { label: "Pending confirmation", value: "pending-confirmation" }].find(
                                    (o) => o.value === (selectedJob as { subStatus?: string }).subStatus
                                  )?.label) ??
                                    (selectedJob as { subStatus?: string }).subStatus ??
                                    "—"}
                                </div>
                              </div>
                            )}
                            {isEditing ? (
                              <SelectInput
                                label="Jobs Tag"
                                options={[
                                  { label: "Urgent", value: "urgent" },
                                  { label: "Warranty", value: "warranty" },
                                  { label: "Follow-up", value: "follow-up" },
                                  { label: "Commercial", value: "commercial" },
                                  { label: "Test1", value: "test1" },
                                  { label: "Job", value: "job" },
                                ]}
                                placeholder="Select tags"
                                multiselect
                                value={
                                  Array.isArray((formData as { jobTags?: string[] }).jobTags)
                                    ? (formData as { jobTags?: string[] }).jobTags!
                                    : Array.isArray(selectedJob?.jobTags)
                                    ? selectedJob.jobTags
                                    : []
                                }
                                onSelect={(val) => handleEditChange("jobTags", Array.isArray(val) ? val : [])}
                              />
                            ) : (
                              <div>
                                <Label className="text-sm font-medium">Jobs Tag</Label>
                                <div className="mt-1 text-sm">{Array.isArray(selectedJob?.jobTags) ? selectedJob.jobTags.join(", ") : "—"}</div>
                              </div>
                            )}
                            {isEditing ? (
                              <SelectInput
                                label="Jobs Tag Note"
                                options={DEFAULT_QUICK_TAG_NOTE_OPTIONS.map((t) => ({ label: t.replace(/-/g, " "), value: t }))}
                                placeholder="Select Tag Note"
                                multiselect
                                value={
                                  Array.isArray((formData as { noteTags?: string[] }).noteTags)
                                    ? (formData as { noteTags?: string[] }).noteTags!
                                    : Array.isArray(selectedJob?.noteTags)
                                    ? selectedJob.noteTags
                                    : []
                                }
                                onSelect={(val) => handleEditChange("noteTags", Array.isArray(val) ? val : [])}
                              />
                            ) : (
                              <div>
                                <Label className="text-sm font-medium">Jobs Tag Note</Label>
                                <div className="mt-1 text-sm">{Array.isArray(selectedJob?.noteTags) ? selectedJob.noteTags.join(", ") : "—"}</div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Scheduled
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-sm font-medium">Start DateTime</Label>
                              {isEditing ? (
                                <div className="mt-1">
                                  <InputDatepicker
                                    range={false}
                                    withTime={true}
                                    datetimeValue={formData.startDate && formData.startTime ? `${formData.startDate}T${String(formData.startTime).slice(0, 5)}` : ""}
                                    onDateTimeChange={(v) => {
                                      if (v) {
                                        const [d, t] = v.split("T");
                                        handleEditChange("startDate", d || "");
                                        handleEditChange("startTime", t ? `${t}:00` : "00:00:00");
                                      }
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="mt-1 text-sm">
                                  {selectedJob.startDate && selectedJob.startTime
                                    ? new Date(`${selectedJob.startDate}T${selectedJob.startTime}`).toLocaleString("en-US", {
                                        month: "2-digit",
                                        day: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                      })
                                    : "—"}
                                </div>
                              )}
                            </div>
                            <div>
                              <Label className="text-sm font-medium">End DateTime</Label>
                              {isEditing ? (
                                <div className="mt-1">
                                  <InputDatepicker
                                    range={false}
                                    withTime={true}
                                    datetimeValue={(() => {
                                      const endD = (formData as { endDate?: string }).endDate || formData.startDate;
                                      const endT = (formData as { estimatedEndTime?: string }).estimatedEndTime || formData.startTime || "17:00";
                                      return endD && endT ? `${endD}T${String(endT).slice(0, 5)}` : "";
                                    })()}
                                    onDateTimeChange={(v) => {
                                      if (v) {
                                        const [d, t] = v.split("T");
                                        handleEditChange("endDate", d || "");
                                        handleEditChange("estimatedEndTime", t ? `${t.slice(0, 5)}` : "17:00");
                                      }
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="mt-1 text-sm">
                                  {(() => {
                                    const endD = (selectedJob as { endDate?: string }).endDate || selectedJob.startDate;
                                    const endT = (selectedJob as { estimatedEndTime?: string }).estimatedEndTime || selectedJob.startTime;
                                    return endD && endT
                                      ? new Date(`${endD}T${endT}`).toLocaleString("en-US", {
                                          month: "2-digit",
                                          day: "2-digit",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          hour12: true,
                                        })
                                      : "—";
                                  })()}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Assignment
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {isEditing ? (
                            <SelectInput
                              options={[
                                { label: "All", value: "all" },
                                { label: "Closest Distance", value: "closest-distance" },
                                { label: "Matching Skills", value: "matching-skills" },
                                { label: "Matching Metro", value: "matching-metro" },
                                { label: "Closest Distance + Matching Skill + Matching Metro", value: "closest-distance-matching-skill-matching-metro" },
                              ]}
                              placeholder="Closest Distance"
                              value={(formData as { closestDistance?: string }).closestDistance ?? (selectedJob as { closestDistance?: string }).closestDistance ?? ""}
                              onSelect={(val) => handleEditChange("closestDistance", Array.isArray(val) ? (val[0] ?? "") : val)}
                            />
                          ) : (
                            <div>
                              <Label className="text-sm font-medium">Closest Distance</Label>
                              <div className="mt-1 text-sm">
                                {([{ label: "All", value: "all" }, { label: "Closest Distance", value: "closest-distance" }, { label: "Matching Skills", value: "matching-skills" }, { label: "Matching Metro", value: "matching-metro" }, { label: "Closest Distance + Matching Skill + Matching Metro", value: "closest-distance-matching-skill-matching-metro" }].find(
                                  (o) => o.value === (selectedJob as { closestDistance?: string }).closestDistance
                                )?.label) ??
                                  (selectedJob as { closestDistance?: string }).closestDistance ??
                                  "—"}
                              </div>
                            </div>
                          )}
                          {isEditing ? (
                            <SelectInput
                              label="Assign Technician"
                              options={DEFAULT_TECHNICIAN_OPTIONS.map((name) => ({ label: name, value: name }))}
                              placeholder="Select Technician"
                              value={formData.assignedTechnician ?? selectedJob?.assignedTechnician ?? ""}
                              onSelect={(val) => handleEditChange("assignedTechnician", Array.isArray(val) ? (val[0] ?? "") : val)}
                            />
                          ) : (
                            <div>
                              <Label className="text-sm font-medium">Assign Technician</Label>
                              <div className="mt-1 text-sm">{selectedJob?.assignedTechnician ?? "—"}</div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="flex flex-col">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Description & Notes
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex space-y-3 flex-1">
                          <div className="flex-1 flex">
                            {isEditing ? (
                              <Textarea value={formData.jobDescription || ""} onChange={(e) => handleEditChange("jobDescription", e.target.value)} className="mt-1 flex-1" rows={3} />
                            ) : (
                              <div className="mt-1 text-sm">{selectedJob.jobDescription}</div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="fixed bottom-0 left-0 right-0 bg-white">
                      <div className="flex items-center justify-end gap-3 py-3 px-6 border-t">
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={handleSave}>
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="activity" className="flex flex-col min-h-0 overflow-y-auto p-6 pb-4 data-[state=inactive]:hidden data-[state=active]:flex data-[state=active]:flex-col">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                      <Card className="h-full overflow-hidden flex flex-col">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">Logs</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-scroll bg-gray-100/50">
                          <div className="space-y-4 py-2">
                            {SAMPLE_LOG_MESSAGES.map((msg) => (
                              <div key={msg.id} className={cn("flex flex-col max-w-[85%]", msg.direction === "incoming" ? "items-start" : "items-end")}>
                                <div
                                  className={cn(
                                    "rounded-lg px-3 py-2",
                                    msg.direction === "incoming" ? "bg-gray-200 text-gray-900" : "bg-brandGreen-900 text-white"
                                  )}
                                >
                                  {msg.kind === "text" && msg.body && <p className="text-sm whitespace-pre-wrap break-words">{msg.body}</p>}
                                  {msg.kind === "audio" && msg.audioUrl && (
                                    <div className="py-1">
                                      <InlineAudioPlayer audioUrl={msg.audioUrl} />
                                    </div>
                                  )}
                                </div>
                                <span className={cn("text-xs text-gray-500 mt-1", msg.direction === "incoming" ? "self-start" : "self-end")}>
                                  {msg.senderName} {msg.timestamp}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="h-full overflow-hidden flex flex-col">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">Jobs Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-scroll">
                          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                              <MessageSquare className="w-4 h-4" />
                              <h3 className="font-medium">Add Note</h3>
                            </div>
                            <div className="flex gap-2">
                              <Textarea placeholder="Type your note here..." value={newNote} onChange={(e) => setNewNote(e.target.value)} className="flex-1" rows={2} />
                              <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                                <Send className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="mb-4 w-48">
                            <SelectInput
                              options={[
                                { label: "All Activity", value: "all" },
                                { label: "Notes", value: "note" },
                                { label: "Job Activity", value: "activity" },
                                { label: "Assignments", value: "assign" },
                                { label: "Payments", value: "payment" },
                                { label: "Calls", value: "call" },
                                { label: "Messages", value: "messages" },
                              ]}
                              placeholder="Filter Activity"
                              value={activityFilter}
                              onSelect={(val) => setActivityFilter(Array.isArray(val) ? (val[0] ?? "all") : val)}
                            />
                          </div>
                          <div className="space-y-4">
                            {filteredActivity.map((item, index) => (
                              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: item.color }} />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-sm">{item.title}</h4>
                                    <span className="text-xs text-gray-500">{item.timestamp}</span>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">{item.summary}</p>
                                  <p className="text-xs text-gray-500 mt-1">by {item.user}</p>
                                  {item.type === "note" && (
                                    <div className="mt-2">
                                      {showReplyNote === index ? (
                                        <div className="flex gap-2">
                                          <Textarea placeholder="Type your reply..." value={replyNote} onChange={(e) => setReplyNote(e.target.value)} className="flex-1" rows={1} />
                                          <Button size="sm" onClick={() => handleReplyNote(index)} disabled={!replyNote.trim()}>
                                            Reply
                                          </Button>
                                          <Button size="sm" variant="outline" onClick={() => setShowReplyNote(null)}>
                                            Cancel
                                          </Button>
                                        </div>
                                      ) : (
                                        <Button size="sm" variant="outline" onClick={() => setShowReplyNote(index)}>
                                          Reply
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="financials" className="flex-1 flex flex-col justify-between min-h-0 overflow-y-auto p-6 pb-4 data-[state=inactive]:hidden data-[state=active]:flex data-[state=active]:flex-col">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Calculator className="w-5 h-5" />
                            Invoice Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm">Subtotal:</span>
                            <span className="text-sm font-medium">${selectedJob.revenue}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Tax:</span>
                            <span className="text-sm font-medium">$0.00</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="font-medium">Total:</span>
                            <span className="font-bold">${selectedJob.revenue}</span>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Payment History
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-gray-500">No payments recorded yet.</div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="nearest-jobs" className="flex-1 min-h-0 overflow-hidden flex flex-col p-4 data-[state=inactive]:hidden data-[state=active]:flex">
                    <div className="flex-1 min-h-0 flex flex-col">
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search jobs, clients, phone, email..."
                          value={nearestJobsSearchQuery}
                          onChange={(e) => {
                            setNearestJobsSearchQuery(e.target.value);
                            setNearestJobsPage(1);
                          }}
                          className="pl-9 w-full max-w-xs"
                        />
                      </div>
                      <Table
                        key="nearest-jobs"
                        rows={nearestPaged}
                        mobileRows={nearestJobsFiltered.slice(0, nearestJobsPage * nearestJobsEntriesPerPage)}
                        columns={nearestJobsColumns}
                        pageSize={nearestJobsEntriesPerPage}
                        currentPage={nearestJobsPage}
                        totalPages={nearestTotalPages}
                        totalCount={nearestJobsFiltered.length}
                        onPageSizeChange={(v) => {
                          setNearestJobsEntriesPerPage(Number(v));
                          setNearestJobsPage(1);
                        }}
                        onPageChange={setNearestJobsPage}
                        maxHeightClassName="max-h-[calc(100vh-320px)]"
                        className="flex-1 flex flex-col"
                        tableClassName="flex-1"
                        lockedColumns={0}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
        </DialogContent>
      </Dialog>

      {/* Invoice List Modal */}
      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-b bg-white shrink-0">
            <h2 className="text-xl font-semibold text-slate-900">Invoice</h2>
          </div>
          <div className="flex-1 min-h-0 overflow-auto px-3">
            <Table
              hideBorder
              showColumnConfig={false}
              rows={invoicePagedRows}
              columns={invoiceTableColumns}
              pageSize={invoiceTablePageSize}
              currentPage={invoiceTablePage}
              totalPages={invoiceTotalPages}
              totalCount={invoiceTotalCount}
              onPageSizeChange={(v) => {
                setInvoiceTablePageSize(Number(v));
                setInvoiceTablePage(1);
              }}
              onPageChange={setInvoiceTablePage}
              headerRightComponent={
                <div className="flex flex-row gap-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="invoice-modal-search" className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                      Search:
                    </Label>
                    <Input
                      id="invoice-modal-search"
                      type="text"
                      value={invoiceTableSearch}
                      onChange={(e) => {
                        setInvoiceTableSearch(e.target.value);
                        setInvoiceTablePage(1);
                      }}
                      className="w-40 h-9"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setShowInvoiceModal(false);
                        setShowAddPaymentModal(true);
                      }}
                    >
                      Add
                    </Button>
                    <Button size="sm" variant="secondary">
                      Download
                    </Button>
                    <Button size="sm" variant="secondary">
                      Send Invoice
                    </Button>
                  </div>
                </div>
              }
              tableKey="jobs-invoice-modal"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Payment Modal */}
      <Dialog
        open={showAddPaymentModal}
        onOpenChange={(open) => {
          setShowAddPaymentModal(open);
          if (!open) setShowInvoiceModal(true);
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30 shrink-0">
            <DialogTitle className="text-lg font-semibold">Add Payment</DialogTitle>
          </div>
          <div className="px-6 py-4 space-y-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">From</h4>
                <div>
                  <Label>Name*</Label>
                  <Input value={addPaymentForm.from.name} onChange={(e) => setAddPaymentForm((prev) => ({ ...prev, from: { ...prev.from, name: e.target.value } }))} className="mt-1" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={addPaymentForm.from.email} onChange={(e) => setAddPaymentForm((prev) => ({ ...prev, from: { ...prev.from, email: e.target.value } }))} className="mt-1" />
                </div>
                <div>
                  <Label>Address</Label>
                  <div className="grid grid-cols-1 gap-2 mt-1">
                    <Input placeholder="street" value={addPaymentForm.from.street} onChange={(e) => setAddPaymentForm((prev) => ({ ...prev, from: { ...prev.from, street: e.target.value } }))} />
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="city" value={addPaymentForm.from.city} onChange={(e) => setAddPaymentForm((prev) => ({ ...prev, from: { ...prev.from, city: e.target.value } }))} />
                      <Input placeholder="State" value={addPaymentForm.from.state} onChange={(e) => setAddPaymentForm((prev) => ({ ...prev, from: { ...prev.from, state: e.target.value } }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="zipcode" value={addPaymentForm.from.zipcode} onChange={(e) => setAddPaymentForm((prev) => ({ ...prev, from: { ...prev.from, zipcode: e.target.value } }))} />
                      <Input placeholder="country" value={addPaymentForm.from.country} onChange={(e) => setAddPaymentForm((prev) => ({ ...prev, from: { ...prev.from, country: e.target.value } }))} />
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Phone*</Label>
                  <Input value={addPaymentForm.from.phone} onChange={(e) => setAddPaymentForm((prev) => ({ ...prev, from: { ...prev.from, phone: e.target.value } }))} className="mt-1" />
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Bill To</h4>
                <div>
                  <Label>Name*</Label>
                  <Input value={addPaymentForm.billTo.name} onChange={(e) => setAddPaymentForm((prev) => ({ ...prev, billTo: { ...prev.billTo, name: e.target.value } }))} className="mt-1" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={addPaymentForm.billTo.email} onChange={(e) => setAddPaymentForm((prev) => ({ ...prev, billTo: { ...prev.billTo, email: e.target.value } }))} className="mt-1" />
                </div>
                <div>
                  <Label>Address</Label>
                  <div className="grid grid-cols-1 gap-2 mt-1">
                    <Input placeholder="street" value={addPaymentForm.billTo.street} onChange={(e) => setAddPaymentForm((prev) => ({ ...prev, billTo: { ...prev.billTo, street: e.target.value } }))} />
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="city" value={addPaymentForm.billTo.city} onChange={(e) => setAddPaymentForm((prev) => ({ ...prev, billTo: { ...prev.billTo, city: e.target.value } }))} />
                      <Input placeholder="State" value={addPaymentForm.billTo.state} onChange={(e) => setAddPaymentForm((prev) => ({ ...prev, billTo: { ...prev.billTo, state: e.target.value } }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="zipcode" value={addPaymentForm.billTo.zipcode} onChange={(e) => setAddPaymentForm((prev) => ({ ...prev, billTo: { ...prev.billTo, zipcode: e.target.value } }))} />
                      <Input placeholder="country" value={addPaymentForm.billTo.country} onChange={(e) => setAddPaymentForm((prev) => ({ ...prev, billTo: { ...prev.billTo, country: e.target.value } }))} />
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Phone*</Label>
                  <Input value={addPaymentForm.billTo.phone} onChange={(e) => setAddPaymentForm((prev) => ({ ...prev, billTo: { ...prev.billTo, phone: e.target.value } }))} className="mt-1" />
                </div>
              </div>
            </div>
            <hr />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <Label>Type</Label>
                  <SelectInput
                    options={[{ label: "Invoice", value: "Invoice" }, { label: "Estimate", value: "Estimate" }]}
                    placeholder="Type"
                    value={addPaymentForm.type}
                    onSelect={(v) => setAddPaymentForm((prev) => ({ ...prev, type: Array.isArray(v) ? (v[0] ?? "") : v }))}
                  />
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <SelectInput
                    options={[
                      { label: "Cash (Offline)", value: "Cash (Offline)" },
                      { label: "Credit/Debit Card", value: "Credit/Debit Card" },
                      { label: "Credit/Debit Card Offline", value: "Credit/Debit Card Offline" },
                      { label: "Cheque", value: "Cheque" },
                      { label: "CashApp", value: "CashApp" },
                      { label: "Zelle", value: "Zelle" },
                      { label: "Venmo", value: "Venmo" },
                      { label: "Charge Now", value: "Charge Now" },
                      { label: "Tap To Pay", value: "Tap To Pay" },
                    ]}
                    placeholder="Payment Method"
                    value={addPaymentForm.paymentMethod}
                    onSelect={(v) => setAddPaymentForm((prev) => ({ ...prev, paymentMethod: Array.isArray(v) ? (v[0] ?? "") : v }))}
                  />
                </div>
                <div>
                  <Label>Tech Cost</Label>
                  <Input placeholder="Tech Cost" value={addPaymentForm.techCost} onChange={(e) => setAddPaymentForm((prev) => ({ ...prev, techCost: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <Label>Custom Rate</Label>
                  <SelectInput
                    options={[{ label: "No", value: "No" }, { label: "Yes", value: "Yes" }]}
                    placeholder="Custom Rate"
                    value={addPaymentForm.customRate}
                    onSelect={(v) => setAddPaymentForm((prev) => ({ ...prev, customRate: Array.isArray(v) ? (v[0] ?? "") : v }))}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={addPaymentForm.date} onChange={(e) => setAddPaymentForm((prev) => ({ ...prev, date: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <Label>Status</Label>
                  <SelectInput
                    options={[{ label: "Pending", value: "Pending" }, { label: "Paid", value: "Paid" }, { label: "Overdue", value: "Overdue" }]}
                    placeholder="Status"
                    value={addPaymentForm.status}
                    onSelect={(v) => setAddPaymentForm((prev) => ({ ...prev, status: Array.isArray(v) ? (v[0] ?? "") : v }))}
                  />
                </div>
                <div>
                  <Label>Company Cost</Label>
                  <Input placeholder="Company Cost" value={addPaymentForm.companyCost} onChange={(e) => setAddPaymentForm((prev) => ({ ...prev, companyCost: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <Label>Amount/Percentage</Label>
                  <Input placeholder="Amount/Percentage" value={addPaymentForm.amountPercentage} onChange={(e) => setAddPaymentForm((prev) => ({ ...prev, amountPercentage: e.target.value }))} className="mt-1" />
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">Add Item</h4>
              <div className="border rounded-md overflow-hidden">
                <div className="flex flex-row gap-2 px-2 bg-slate-100 dark:bg-slate-800 font-medium text-xs text-slate-700 dark:text-slate-300 py-2">
                  <div className="w-8" />
                  <div className="grow grid grid-cols-12 gap-2 flex-1">
                    <span className="col-span-8">DESCRIPTION</span>
                    <span className="col-span-2">QTY</span>
                    <span className="col-span-2">RATE</span>
                  </div>
                  <div className="col-span-2 w-[80px] text-right">AMOUNT</div>
                </div>
                {addPaymentForm.lineItems.map((item, index) => (
                  <div key={index} className="flex flex-row gap-2 border-t px-2 items-center">
                    <div className="flex items-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full border-2 border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive disabled:opacity-50"
                        onClick={() => addPaymentRemoveLineItem(index)}
                        disabled={addPaymentForm.lineItems.length === 1}
                        aria-label="Remove row"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-12 gap-2 py-2 items-center flex-1">
                      <div className="col-span-8">
                        <Input placeholder="Description" value={item.description} onChange={(e) => addPaymentLineItemChange(index, "description", e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <Input type="number" min={0} value={item.qty || ""} onChange={(e) => addPaymentLineItemChange(index, "qty", parseFloat(e.target.value) || 0)} />
                      </div>
                      <div className="col-span-2">
                        <Input type="number" min={0} step="0.01" value={item.rate || ""} onChange={(e) => addPaymentLineItemChange(index, "rate", parseFloat(e.target.value) || 0)} />
                      </div>
                    </div>
                    <div className="items-center text-sm font-medium w-[80px] text-right">
                      <div>{item.amount.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
                <div className="flex flex-row gap-2 border-t px-2 items-center bg-slate-50 dark:bg-slate-800/5 font-medium text-sm">
                  <div className="w-8">Total:</div>
                  <div className="grid grid-cols-12 gap-2 py-2 flex-1">
                    <span className="col-span-8" />
                    <span className="col-span-2">{addPaymentForm.lineItems.reduce((s, i) => s + (i.qty || 0), 0)}</span>
                    <span className="col-span-2">{addPaymentForm.lineItems.reduce((s, i) => s + (i.rate || 0), 0).toFixed(2)}</span>
                  </div>
                  <div className="items-center font-medium w-[80px] text-right">{addPaymentSubtotal.toFixed(2)}</div>
                </div>
              </div>
              <div className="flex justify-between items-start mt-3 gap-4">
                <Button type="button" variant="outline" size="sm" onClick={addPaymentAddLineItem} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add More Item
                </Button>
                <div className="text-right space-y-1 text-sm px-2">
                  <div className="flex justify-between gap-6">
                    <span>Subtotal</span>
                    <span>{addPaymentSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between gap-6">
                    <span>Total</span>
                    <span>{addPaymentSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between gap-6">
                    <span>Processing Fee</span>
                    <span>{addPaymentProcessingFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between gap-6 font-semibold">
                    <span>Grand Total</span>
                    <span>{addPaymentGrandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            <hr />
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label>Tax</Label>
                    <SelectInput
                      options={[{ label: "None", value: "None" }, { label: "VAT", value: "VAT" }, { label: "GST", value: "GST" }]}
                      placeholder="Tax"
                      value={addPaymentForm.tax}
                      onSelect={(v) => setAddPaymentForm((prev) => ({ ...prev, tax: Array.isArray(v) ? (v[0] ?? "") : v }))}
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Discount</Label>
                    <SelectInput
                      options={[{ label: "None", value: "None" }, { label: "Percentage", value: "Percentage" }, { label: "Fixed", value: "Fixed" }]}
                      placeholder="Discount"
                      value={addPaymentForm.discount}
                      onSelect={(v) => setAddPaymentForm((prev) => ({ ...prev, discount: Array.isArray(v) ? (v[0] ?? "") : v }))}
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea placeholder="Notes" value={addPaymentForm.notes} onChange={(e) => setAddPaymentForm((prev) => ({ ...prev, notes: e.target.value }))} rows={4} className="mt-1" />
              </div>
              <div className="flex items-center justify-end gap-4 mt-1">
                <div>
                  <Label className="block mb-1">Client signature?</Label>
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm text-muted-foreground">{addPaymentForm.clientSignature ? "YES" : "NO"}</span>
                    <Switch checked={addPaymentForm.clientSignature} onCheckedChange={(v) => setAddPaymentForm((prev) => ({ ...prev, clientSignature: v }))} />
                  </div>
                </div>
                <div>
                  <Label className="block mb-1">Send invoice to client?</Label>
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm text-muted-foreground">{addPaymentForm.sendToClient === "Yes" ? "YES" : "NO"}</span>
                    <Switch checked={addPaymentForm.sendToClient === "Yes"} onCheckedChange={(v) => setAddPaymentForm((prev) => ({ ...prev, sendToClient: v ? "Yes" : "No" }))} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="border-t py-3 px-6 ">
            <Button variant="outline" onClick={() => { setShowAddPaymentModal(false); setShowInvoiceModal(true); }}>Cancel</Button>
            <Button onClick={() => { setShowAddPaymentModal(false); setShowInvoiceModal(true); }}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
