"use client";

import React, { useState, useEffect, useRef } from "react";
import type { DateValueType } from "react-tailwindcss-datepicker";
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
import AddressInput from "@/src/components/input/address";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { toast } from "sonner";
import {
  X,
  User,
  MapPin,
  Wrench,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Users,
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Calculator,
  CreditCard,
  MessageSquare,
  Send,
  Search,
  Plus,
  Minus,
  Trash2,
  Pause,
  Play,
  Upload,
  Volume2,
  VolumeX,
  MoreVertical,
  Pencil,
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

interface PartItem {
  id: string;
  part: string;
  cost: number;
  type: string;
  createdAt: string;
}

type FinanceParty = {
  name: string;
  address1: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
};

type FinanceLineItem = { description: string; qty: number; rate: number };

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

const ESTIMATE_DUMMY_DATA = [
  { id: "EST-1001", amount: "$650.00", status: "Draft", dated: "2025-02-11", validUntil: "2025-03-11" },
  { id: "EST-1002", amount: "$980.00", status: "Sent", dated: "2025-02-05", validUntil: "2025-03-05" },
  { id: "EST-1003", amount: "$1,250.00", status: "Approved", dated: "2025-01-28", validUntil: "2025-02-28" },
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

const DEFAULT_PART_ITEMS: PartItem[] = [
  { id: "part-1", part: "Capacitor", cost: 4, type: "Company", createdAt: "2/27/2026, 10:18:54 PM" },
  { id: "part-2", part: "Thermostat Wire", cost: 2, type: "Tech", createdAt: "2/27/2026, 10:18:27 PM" },
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
  const toLocalYmd = (value: string | Date | null | undefined) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const fromYmdToDate = (value: string | null | undefined) => {
    if (!value) return null;
    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };
  const [activeTab, setActiveTab] = useState("details");
  const [isEditing, setIsEditing] = useState(true);
  const [showSecondPhone, setShowSecondPhone] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [activityFilter, setActivityFilter] = useState("all");
  const [locationActivityFilter, setLocationActivityFilter] = useState("all");
  const [showInlineLocationForm, setShowInlineLocationForm] = useState(false);
  const [locationFormSnapshot, setLocationFormSnapshot] = useState<Record<string, any> | null>(null);
  const [partsForm, setPartsForm] = useState<{ part: string; cost: string; type: string }>({ part: "", cost: "", type: "Tech" });
  const [partsItems, setPartsItems] = useState<PartItem[]>(DEFAULT_PART_ITEMS);
  const [locationMapCenter, setLocationMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 29.7604,
    lng: -95.3698,
  });
  const [activity, setActivity] = useState(DEFAULT_ACTIVITY);
  const [showReplyNote, setShowReplyNote] = useState<number | null>(null);
  const [replyNote, setReplyNote] = useState("");
  const [nearestJobsSearchQuery, setNearestJobsSearchQuery] = useState("");
  const [nearestJobsPage, setNearestJobsPage] = useState(1);
  const [nearestJobsEntriesPerPage, setNearestJobsEntriesPerPage] = useState(10);
  const [invoiceTableSearch, setInvoiceTableSearch] = useState("");
  const [invoiceTablePage, setInvoiceTablePage] = useState(1);
  const [invoiceTablePageSize, setInvoiceTablePageSize] = useState(10);
  const [financeInvoiceSearch, setFinanceInvoiceSearch] = useState("");
  const [financeInvoiceStatus, setFinanceInvoiceStatus] = useState("all");
  const [financeEstimateSearch, setFinanceEstimateSearch] = useState("");
  const [financeEstimateStatus, setFinanceEstimateStatus] = useState("all");
  const todayStr = new Date().toISOString().slice(0, 10);
  const plus30 = new Date();
  plus30.setDate(plus30.getDate() + 30);
  const plus30Str = plus30.toISOString().slice(0, 10);
  const [invoiceForm, setInvoiceForm] = useState<{
    invoiceNumber: string;
    date: string;
    dueDate: string;
    paymentTerms: string;
    from: FinanceParty;
    to: FinanceParty;
    items: FinanceLineItem[];
    discountPct: number;
    taxPct: number;
    depositAmount: number;
    paymentMethods: {
      creditCard: boolean;
      debitCard: boolean;
      check: boolean;
      cash: boolean;
      bankTransfer: boolean;
      paypal: boolean;
    };
    notes: string;
    terms: string;
  }>({
    invoiceNumber: `INV-${Date.now()}`,
    date: todayStr,
    dueDate: plus30Str,
    paymentTerms: "Net 30",
    from: { name: "", address1: "", city: "", state: "", zip: "", phone: "", email: "" },
    to: { name: "", address1: "", city: "", state: "", zip: "", phone: "", email: "" },
    items: [{ description: "", qty: 1, rate: 0 }],
    discountPct: 0,
    taxPct: 8.25,
    depositAmount: 0,
    paymentMethods: { creditCard: true, debitCard: true, check: true, cash: true, bankTransfer: true, paypal: true },
    notes: "",
    terms: "Payment is due within 30 days of invoice date.",
  });
  const [invoiceAttachments, setInvoiceAttachments] = useState<File[]>([]);
  const [invoiceLogoPreview, setInvoiceLogoPreview] = useState<string | null>(null);
  const [isInvoiceAttachmentDragOver, setIsInvoiceAttachmentDragOver] = useState(false);
  const [invoiceAttachmentPreviewUrls, setInvoiceAttachmentPreviewUrls] = useState<Record<string, string>>({});
  const [estimateForm, setEstimateForm] = useState<{
    estimateNumber: string;
    date: string;
    validUntil: string;
    paymentTerms: string;
    items: FinanceLineItem[];
    discountPct: number;
    taxPct: number;
    paymentMethods: {
      creditCard: boolean;
      debitCard: boolean;
      check: boolean;
      cash: boolean;
      bankTransfer: boolean;
      paypal: boolean;
    };
    requireSignature: boolean;
    notes: string;
  }>({
    estimateNumber: `EST-${Date.now()}`,
    date: todayStr,
    validUntil: plus30Str,
    paymentTerms: "Net 30",
    items: [{ description: "", qty: 1, rate: 0 }],
    discountPct: 0,
    taxPct: 8.25,
    paymentMethods: { creditCard: true, debitCard: true, check: true, cash: true, bankTransfer: true, paypal: true },
    requireSignature: true,
    notes: "",
  });
  const [addPaymentForm, setAddPaymentForm] = useState<AddPaymentFormState>(initialAddPaymentForm);
  const [isSaving, setIsSaving] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isAttachmentDragOver, setIsAttachmentDragOver] = useState(false);
  const locationMapRef = useRef<google.maps.Map | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const invoiceAttachmentInputRef = useRef<HTMLInputElement>(null);
  const invoiceLogoInputRef = useRef<HTMLInputElement>(null);
  const attachmentListRef = useRef<HTMLDivElement>(null);
  const invoiceAttachmentListRef = useRef<HTMLDivElement>(null);
  const attachmentIsDragging = useRef(false);
  const invoiceAttachmentIsDragging = useRef(false);
  const attachmentDragStartX = useRef(0);
  const attachmentStartScrollLeft = useRef(0);
  const invoiceAttachmentDragStartX = useRef(0);
  const invoiceAttachmentStartScrollLeft = useRef(0);
  const [attachmentScrollState, setAttachmentScrollState] = useState({ canScrollLeft: false, canScrollRight: false });
  const [invoiceAttachmentScrollState, setInvoiceAttachmentScrollState] = useState({ canScrollLeft: false, canScrollRight: false });

  const getAttachmentKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;
  const [attachmentPreviewUrls, setAttachmentPreviewUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && (formDataProp != null || jobId)) {
      setFormData(formDataProp ?? {});
      const incoming = (formDataProp ?? {}) as {
        lat?: number | string;
        lng?: number | string;
        latitude?: number | string;
        longitude?: number | string;
      };
      const incomingLat = Number(incoming.lat ?? incoming.latitude ?? 29.7604);
      const incomingLng = Number(incoming.lng ?? incoming.longitude ?? -95.3698);
      setLocationMapCenter({
        lat: Number.isFinite(incomingLat) ? incomingLat : 29.7604,
        lng: Number.isFinite(incomingLng) ? incomingLng : -95.3698,
      });
    }
  }, [open, jobId, formDataProp]);

  const handleEditChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    // TODO: API call to save job
    try {
      // Simulate network save request for UX feedback.
      await new Promise((resolve) => setTimeout(resolve, 900));
      const isUpdateAction = Boolean(jobId);
      toast.success(`Job ${isUpdateAction ? "updated" : "saved"} successfully`);
      onJobUpdated?.();
    } finally {
      setIsSaving(false);
    }
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

  const handleEditLocationClick = () => {
    setLocationFormSnapshot({
      location: formData.location ?? "",
      apartmentNumber: (formData as { apartmentNumber?: string }).apartmentNumber ?? "",
      city: formData.city ?? "",
      zipCode: formData.zipCode ?? "",
      state: formData.state ?? "",
      country: formData.country ?? "",
      lat: (formData as { lat?: number | string }).lat ?? "",
      lng: (formData as { lng?: number | string }).lng ?? "",
      latitude: (formData as { latitude?: number | string }).latitude ?? "",
      longitude: (formData as { longitude?: number | string }).longitude ?? "",
    });
    setIsEditing(true);
    setActiveTab("details");
    setShowInlineLocationForm(true);
  };

  const handleInlineLocationCancel = () => {
    if (locationFormSnapshot) {
      setFormData((prev) => ({ ...prev, ...locationFormSnapshot }));
    }
    setShowInlineLocationForm(false);
  };

  const handleInlineLocationSave = () => {
    setShowInlineLocationForm(false);
  };

  const handleAddPart = () => {
    const trimmedPart = partsForm.part.trim();
    const parsedCost = Number(partsForm.cost);
    if (!trimmedPart || !Number.isFinite(parsedCost) || parsedCost <= 0) return;

    setPartsItems((prev) => [
      {
        id: `part-${Date.now()}`,
        part: trimmedPart,
        cost: parsedCost,
        type: partsForm.type || "Tech",
        createdAt: new Date().toLocaleString(),
      },
      ...prev,
    ]);
    setPartsForm((prev) => ({ ...prev, part: "", cost: "" }));
  };

  const handleRemovePart = (partId: string) => {
    setPartsItems((prev) => prev.filter((item) => item.id !== partId));
  };

  const formatCurrency = (n: number) => `$${Number(n || 0).toFixed(2)}`;
  const calcTotal = (items: FinanceLineItem[], discountPct = 0, taxPct = 0) => {
    const subtotal = items.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.rate || 0), 0);
    const discount = subtotal * (Number(discountPct || 0) / 100);
    const taxedBase = Math.max(0, subtotal - discount);
    const tax = taxedBase * (Number(taxPct || 0) / 100);
    return { subtotal, discount, tax, total: taxedBase + tax };
  };

  const updatePinnedLocation = (lat: number, lng: number) => {
    handleEditChange("lat", lat);
    handleEditChange("lng", lng);
    handleEditChange("latitude", lat);
    handleEditChange("longitude", lng);
  };

  const populateAddressFromCoords = (lat: number, lng: number) => {
    if (typeof window === "undefined" || !window.google?.maps?.Geocoder) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status !== "OK" || !results?.[0]) return;
      const primaryResult = results[0];
      const components = primaryResult.address_components ?? [];

      const getComponent = (type: string, useShortName = false) =>
        components.find((component) => component.types.includes(type))?.[useShortName ? "short_name" : "long_name"] ?? "";

      const streetNumber = getComponent("street_number");
      const route = getComponent("route");
      const city =
        getComponent("locality") ||
        getComponent("sublocality") ||
        getComponent("administrative_area_level_2");
      const state = getComponent("administrative_area_level_1", true) || getComponent("administrative_area_level_1");
      const zip = getComponent("postal_code");
      const country = getComponent("country");
      const streetAddress = [streetNumber, route].filter(Boolean).join(" ").trim() || primaryResult.formatted_address || "";

      handleEditChange("location", streetAddress);
      handleEditChange("city", city);
      handleEditChange("state", state);
      handleEditChange("zipCode", zip);
      handleEditChange("country", country);
    });
  };

  const handleLocationMapClick = (event: google.maps.MapMouseEvent) => {
    if (!showInlineLocationForm || !isEditing) return;
    const lat = event.latLng?.lat();
    const lng = event.latLng?.lng();
    if (typeof lat !== "number" || typeof lng !== "number") return;
    updatePinnedLocation(lat, lng);
    populateAddressFromCoords(lat, lng);
  };

  const panMapToAddress = (fullAddress: string) => {
    if (!fullAddress || typeof window === "undefined" || !window.google?.maps?.Geocoder) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: fullAddress }, (results, status) => {
      if (status !== "OK" || !results?.[0]?.geometry?.location) return;
      const nextLat = results[0].geometry.location.lat();
      const nextLng = results[0].geometry.location.lng();
      setLocationMapCenter({ lat: nextLat, lng: nextLng });
      locationMapRef.current?.panTo({ lat: nextLat, lng: nextLng });
    });
  };

  useEffect(() => {
    const imageFiles = attachments.filter((file) => file.type.startsWith("image/"));
    const nextUrls: Record<string, string> = {};
    imageFiles.forEach((file) => {
      nextUrls[getAttachmentKey(file)] = URL.createObjectURL(file);
    });
    setAttachmentPreviewUrls(nextUrls);

    return () => {
      Object.values(nextUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [attachments]);

  useEffect(() => {
    const imageFiles = invoiceAttachments.filter((file) => file.type.startsWith("image/"));
    const nextUrls: Record<string, string> = {};
    imageFiles.forEach((file) => {
      nextUrls[getAttachmentKey(file)] = URL.createObjectURL(file);
    });
    setInvoiceAttachmentPreviewUrls(nextUrls);

    return () => {
      Object.values(nextUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [invoiceAttachments]);

  const addAttachmentFiles = (files: FileList | File[]) => {
    const incomingFiles = Array.from(files);
    if (!incomingFiles.length) return;

    setAttachments((prev) => {
      const seen = new Set(prev.map((file) => getAttachmentKey(file)));
      const merged = [...prev];

      incomingFiles.forEach((file) => {
        const key = getAttachmentKey(file);
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(file);
        }
      });

      return merged;
    });
  };

  const handleAttachmentInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      addAttachmentFiles(event.target.files);
    }
    event.target.value = "";
  };

  const handleAttachmentDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsAttachmentDragOver(false);
    if (event.dataTransfer.files?.length) {
      addAttachmentFiles(event.dataTransfer.files);
    }
  };

  const removeAttachmentByKey = (keyToRemove: string) => {
    setAttachments((prev) => prev.filter((file) => getAttachmentKey(file) !== keyToRemove));
  };

  const addInvoiceAttachmentFiles = (files: FileList | File[]) => {
    const incomingFiles = Array.from(files);
    if (!incomingFiles.length) return;

    setInvoiceAttachments((prev) => {
      const seen = new Set(prev.map((file) => getAttachmentKey(file)));
      const merged = [...prev];

      incomingFiles.forEach((file) => {
        const key = getAttachmentKey(file);
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(file);
        }
      });

      return merged;
    });
  };

  const handleInvoiceAttachmentInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      addInvoiceAttachmentFiles(event.target.files);
    }
    event.target.value = "";
  };

  const handleInvoiceAttachmentDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsInvoiceAttachmentDragOver(false);
    if (event.dataTransfer.files?.length) {
      addInvoiceAttachmentFiles(event.dataTransfer.files);
    }
  };

  const removeInvoiceAttachmentByKey = (keyToRemove: string) => {
    setInvoiceAttachments((prev) => prev.filter((file) => getAttachmentKey(file) !== keyToRemove));
  };

  const startInvoiceAttachmentListDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !invoiceAttachmentListRef.current) return;
    invoiceAttachmentIsDragging.current = true;
    invoiceAttachmentDragStartX.current = event.pageX - invoiceAttachmentListRef.current.offsetLeft;
    invoiceAttachmentStartScrollLeft.current = invoiceAttachmentListRef.current.scrollLeft;
  };

  const handleInvoiceAttachmentListDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!invoiceAttachmentIsDragging.current || !invoiceAttachmentListRef.current) return;
    event.preventDefault();
    const x = event.pageX - invoiceAttachmentListRef.current.offsetLeft;
    const walk = x - invoiceAttachmentDragStartX.current;
    invoiceAttachmentListRef.current.scrollLeft = invoiceAttachmentStartScrollLeft.current - walk;
  };

  const endInvoiceAttachmentListDrag = () => {
    invoiceAttachmentIsDragging.current = false;
  };

  const startAttachmentListDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !attachmentListRef.current) return;
    attachmentIsDragging.current = true;
    attachmentDragStartX.current = event.pageX - attachmentListRef.current.offsetLeft;
    attachmentStartScrollLeft.current = attachmentListRef.current.scrollLeft;
  };

  const handleAttachmentListDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!attachmentIsDragging.current || !attachmentListRef.current) return;
    event.preventDefault();
    const x = event.pageX - attachmentListRef.current.offsetLeft;
    const walk = x - attachmentDragStartX.current;
    attachmentListRef.current.scrollLeft = attachmentStartScrollLeft.current - walk;
  };

  const endAttachmentListDrag = () => {
    attachmentIsDragging.current = false;
  };

  const updateAttachmentScrollState = React.useCallback(() => {
    const el = attachmentListRef.current;
    if (!el) {
      setAttachmentScrollState({ canScrollLeft: false, canScrollRight: false });
      return;
    }
    const maxScroll = el.scrollWidth - el.clientWidth;
    setAttachmentScrollState({
      canScrollLeft: el.scrollLeft > 0,
      canScrollRight: el.scrollLeft < maxScroll - 1,
    });
  }, []);

  const scrollAttachmentList = (direction: "left" | "right") => {
    const el = attachmentListRef.current;
    if (!el) return;
    const amount = direction === "left" ? -220 : 220;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  const updateInvoiceAttachmentScrollState = React.useCallback(() => {
    const el = invoiceAttachmentListRef.current;
    if (!el) {
      setInvoiceAttachmentScrollState({ canScrollLeft: false, canScrollRight: false });
      return;
    }
    const maxScroll = el.scrollWidth - el.clientWidth;
    setInvoiceAttachmentScrollState({
      canScrollLeft: el.scrollLeft > 0,
      canScrollRight: el.scrollLeft < maxScroll - 1,
    });
  }, []);

  const scrollInvoiceAttachmentList = (direction: "left" | "right") => {
    const el = invoiceAttachmentListRef.current;
    if (!el) return;
    const amount = direction === "left" ? -220 : 220;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  useEffect(() => {
    const el = attachmentListRef.current;
    if (!el || attachments.length === 0) return;

    updateAttachmentScrollState();
    const onScroll = () => updateAttachmentScrollState();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateAttachmentScrollState);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateAttachmentScrollState);
    };
  }, [attachments.length, updateAttachmentScrollState]);

  useEffect(() => {
    const el = invoiceAttachmentListRef.current;
    if (!el || invoiceAttachments.length === 0) return;

    updateInvoiceAttachmentScrollState();
    const onScroll = () => updateInvoiceAttachmentScrollState();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateInvoiceAttachmentScrollState);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateInvoiceAttachmentScrollState);
    };
  }, [invoiceAttachments.length, updateInvoiceAttachmentScrollState]);

  const formatAttachmentSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getAttachmentIcon = (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (file.type.startsWith("audio/")) return <FileAudio className="h-8 w-8" />;
    if (file.type.startsWith("video/")) return <FileVideo className="h-8 w-8" />;
    if (["zip", "rar", "7z", "tar", "gz"].includes(extension)) return <FileArchive className="h-8 w-8" />;
    if (["csv", "xls", "xlsx"].includes(extension)) return <FileSpreadsheet className="h-8 w-8" />;
    if (["json", "xml", "js", "jsx", "ts", "tsx", "html", "css", "md"].includes(extension)) return <FileCode className="h-8 w-8" />;
    if (["txt", "pdf", "doc", "docx", "rtf"].includes(extension)) return <FileText className="h-8 w-8" />;
    return <File className="h-8 w-8" />;
  };

  const filteredActivity = activityFilter === "all" ? activity : activity.filter((a) => a.type === activityFilter);
  const locationActivityItems = React.useMemo(() => {
    const sourceActivity = activity.length > 0 ? activity : DEFAULT_ACTIVITY;
    if (locationActivityFilter === "all") return sourceActivity;
    return sourceActivity.filter((item) => item.type === locationActivityFilter);
  }, [activity, locationActivityFilter]);

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
  const selectedJobWithCoords = selectedJob as {
    lat?: number | string;
    lng?: number | string;
    latitude?: number | string;
    longitude?: number | string;
  };
  const resolvedMapLat = Number(
    selectedJobWithCoords.lat ?? selectedJobWithCoords.latitude ?? 29.7604
  );
  const resolvedMapLng = Number(
    selectedJobWithCoords.lng ?? selectedJobWithCoords.longitude ?? -95.3698
  );
  const mapLat = Number.isFinite(resolvedMapLat) ? resolvedMapLat : 29.7604;
  const mapLng = Number.isFinite(resolvedMapLng) ? resolvedMapLng : -95.3698;
  const pinnedLocation = { lat: mapLat, lng: mapLng };

  return (
    <>
      {/* Job Details Dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[100vw] w-[100vw] h-[100vh] [&>button]:hidden rounded-none sm:rounded-none mx-auto p-0 shadow-2xl border bg-white overflow-hidden flex flex-col">
          <div className="flex flex-col min-h-0 flex-1 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-white sticky top-0 z-10">
              <div className="flex flex-row items-start gap-3">
                <div className="flex flex-col">
                  {selectedJob?.id ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-slate-700">{selectedJob.id}</span>
                      </div>
                      {(selectedJob?.jobCategory || selectedJob?.jobType) && (
                        <div className="text-sm text-slate-500">
                          {[selectedJob?.jobCategory, selectedJob?.jobType].filter(Boolean).join(" • ")}
                        </div>
                      )}
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
                          className="px-3 h-6"
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
                  <Badge variant="outline" className="px-3 py-1 h-6">
                    ${selectedJob.revenue}
                  </Badge>
                )}
              </div>
                <div className="flex items-center gap-2">
                  {/* <Button variant="outline" size="sm" onClick={() => setShowInvoiceModal(true)}>
                    Invoice
                  </Button> */}
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
                  <TabsList className="grid w-[600px] grid-cols-3 shrink-0 ml-6">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="financials">Finance</TabsTrigger>
                    <TabsTrigger value="activity">Detailed Logs</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="flex-1 min-h-0 overflow-y-auto p-6 pt-4 pb-20 space-y-6 data-[state=inactive]:hidden data-[state=active]:flex data-[state=active]:flex-col">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="grid grid-cols-1 lg:grid-cols-1 lg:col-span-2 gap-6">
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
                              <Wrench className="w-5 h-5" />
                              Job Details
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                {isEditing ? (
                                  <SelectInput
                                    label="Job Category"
                                    options={[
                                      { label: "Plumbing", value: "Plumbing" },
                                      { label: "Electrical", value: "Electrical" },
                                      { label: "HVAC", value: "HVAC" },
                                      { label: "General", value: "General" },
                                    ]}
                                    placeholder="Select category"
                                    value={formData.jobCategory || ""}
                                    onSearch={() => {}}
                                    onSelect={(val) => handleEditChange("jobCategory", Array.isArray(val) ? (val[0] ?? "") : val)}
                                  />
                                ) : (
                                  <>
                                    <Label className="text-sm font-medium">Job Category</Label>
                                    <div className="mt-1 text-sm">{selectedJob.jobCategory}</div>
                                  </>
                                )}
                              </div>
                              <div>
                                {isEditing ? (
                                  <SelectInput
                                    label="Job Type"
                                    options={[
                                      { label: "Repair", value: "Repair" },
                                      { label: "Installation", value: "Installation" },
                                      { label: "Maintenance", value: "Maintenance" },
                                      { label: "Emergency", value: "Emergency" },
                                    ]}
                                    placeholder="Select type"
                                    value={formData.jobType || ""}
                                    onSearch={() => {}}
                                    onSelect={(val) => handleEditChange("jobType", Array.isArray(val) ? (val[0] ?? "") : val)}
                                  />
                                ) : (
                                  <>
                                    <Label className="text-sm font-medium">Job Type</Label>
                                    <div className="mt-1 text-sm">{selectedJob.jobType}</div>
                                  </>
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
                                  onSearch={() => {}}
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
                                  onSearch={() => {}}
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
                                  onSearch={() => {}}
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
                                  onSearch={() => {}}
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
                                  onSearch={() => {}}
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

                        <div className="space-y-6">
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
                                  {isEditing ? (
                                    <InputDatepicker
                                      label="Start Date Time"
                                      range={false}
                                      withTime={true}
                                      datetimeValue={formData.startDate && formData.startTime ? `${formData.startDate}T${String(formData.startTime)}` : ""}
                                      onDateTimeChange={(v) => {
                                        if (v) {
                                          const [d, t] = v.split("T");
                                          handleEditChange("startDate", d || "");
                                          handleEditChange("startTime", t || "");
                                        } else {
                                          handleEditChange("startDate", "");
                                          handleEditChange("startTime", "");
                                        }
                                      }}
                                      minuteInterval={15}
                                    />
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
                                  {isEditing ? (
                                    <InputDatepicker
                                      label="End Date Time"
                                      range={false}
                                      withTime={true}
                                      datetimeValue={(() => {
                                        const endD = (formData as { endDate?: string }).endDate;
                                        const endT = (formData as { estimatedEndTime?: string }).estimatedEndTime;
                                        return endD && endT ? `${endD}T${String(endT)}` : "";
                                      })()}
                                      onDateTimeChange={(v) => {
                                        if (v) {
                                          const [d, t] = v.split("T");
                                          handleEditChange("endDate", d || "");
                                          handleEditChange("estimatedEndTime", t || "");
                                        } else {
                                          handleEditChange("endDate", "");
                                          handleEditChange("estimatedEndTime", "");
                                        }
                                      }}
                                    />
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
                                  onSearch={() => {}}
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
                                  onSearch={() => {}}
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
                              <CardTitle className="text-lg">Nearest Jobs</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pb-0">
                              
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
                                hideBorder
                                showColumnConfig={false}
                                headerRightComponent={(
                                  <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                      placeholder="Search jobs"
                                      value={nearestJobsSearchQuery}
                                      onChange={(e) => {
                                        setNearestJobsSearchQuery(e.target.value);
                                        setNearestJobsPage(1);
                                      }}
                                      className="pl-9 w-full max-w-xs"
                                    />
                                  </div>
                                )}
                              />
                            </CardContent>
                          </Card>
                        </div>

                      </div>
                      <div className="space-y-6 flex flex-col">
                        <Card className="flex flex-col">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                              {showInlineLocationForm ? <Pencil className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                              {showInlineLocationForm ? "Edit Servive Location" : "Service Location"}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4 text-sm">
                            <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
                              <GoogleMap
                                mapContainerStyle={{ width: "100%", height: "260px" }}
                                center={locationMapCenter}
                                zoom={15}
                                onLoad={(map) => {
                                  locationMapRef.current = map;
                                }}
                                onUnmount={() => {
                                  locationMapRef.current = null;
                                }}
                                onClick={handleLocationMapClick}
                                options={{
                                  mapTypeId: "roadmap",
                                  streetViewControl: false,
                                  fullscreenControl: false,
                                  mapTypeControl: false,
                                }}
                              >
                                <Marker
                                  position={pinnedLocation}
                                  draggable={isEditing && showInlineLocationForm}
                                  onDragEnd={(event) => {
                                    if (!showInlineLocationForm || !isEditing) return;
                                    const lat = event.latLng?.lat();
                                    const lng = event.latLng?.lng();
                                    if (typeof lat !== "number" || typeof lng !== "number") return;
                                    updatePinnedLocation(lat, lng);
                                    populateAddressFromCoords(lat, lng);
                                  }}
                                />
                              </GoogleMap>
                            </div>
                            {!showInlineLocationForm && (
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-slate-600 truncate">
                                {[
                                  selectedJob?.location,
                                  [selectedJob?.city, selectedJob?.state, selectedJob?.zipCode].filter(Boolean).join(", "),
                                  (selectedJob as { country?: string })?.country || "United States",
                                ]
                                  .filter(Boolean)
                                  .join(" • ") || "—"}
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 px-3 text-xs gap-1"
                                onClick={handleEditLocationClick}
                                aria-label="Edit location"
                                title="Edit location"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                <span>Edit</span>
                              </Button>
                            </div>
                            )}
                            {showInlineLocationForm && (
                              <div className="mt-2">
                                <div className="grid grid-cols-2 gap-3">
                                  <AddressInput
                                    isEditing={isEditing}
                                    value={formData.location || ""}
                                    displayValue={selectedJob.location}
                                    onChange={(value) => handleEditChange("location", value)}
                                    onAddressChange={({ address, address2, city, zip, state, country }) => {
                                      handleEditChange("location", address);
                                      handleEditChange("apartmentNumber", address2);
                                      handleEditChange("city", city);
                                      handleEditChange("zipCode", zip);
                                      handleEditChange("state", state);
                                      handleEditChange("country", country);
                                      panMapToAddress(
                                        [address, address2, city, state, zip, country].filter(Boolean).join(", ")
                                      );
                                    }}
                                  />
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
                                <div className="mt-3 grid grid-cols-2 gap-3">
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
                                <div className="mt-3 grid grid-cols-2 gap-3">
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
                                <div className="mt-4 flex items-center justify-end gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleInlineLocationCancel}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleInlineLocationSave}
                                  >
                                    Save
                                  </Button>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                        <Card className="flex flex-col">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between gap-3">
                              <CardTitle className="text-lg">Activity</CardTitle>
                              <div className="w-36">
                                <SelectInput
                                  options={[
                                    { label: "Status", value: "activity" },
                                    { label: "Assign", value: "assign" },
                                    { label: "Payment", value: "payment" },
                                    { label: "Part", value: "part" },
                                    { label: "Note", value: "note" },
                                    { label: "Call", value: "call" },
                                  ]}
                                  placeholder="Types"
                                  value={locationActivityFilter}
                                  onSearch={() => {}}
                                  onSelect={(val) => setLocationActivityFilter(Array.isArray(val) ? (val[0] ?? "all") : val)}
                                />
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="max-h-[360px] overflow-y-auto pr-1">
                              <div className="space-y-3">
                                {locationActivityItems.length > 0 ? (
                                  locationActivityItems.map((item, index) => {
                                    const summaryText = String(item.summary || "").trim() || item.title;
                                    const labelText = item.type === "note" ? `Note: ${summaryText}` : summaryText;
                                    return (
                                      <div key={`location-activity-${index}`} className="flex items-start gap-2.5">
                                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-slate-400" />
                                        <div className="min-w-0">
                                          <p className="truncate text-sm leading-5 text-slate-900">{labelText}</p>
                                          <p className="text-xs text-slate-500">{item.timestamp}</p>
                                        </div>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <p className="text-sm text-slate-500">No activity found.</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="flex flex-col">
                          <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Upload className="w-5 h-5" />
                              Attachment
                            </CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={() => attachmentInputRef.current?.click()}>
                              <Plus className="h-4 w-4 mr-1" />
                              Add More
                            </Button>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <input ref={attachmentInputRef} type="file" multiple className="hidden" onChange={handleAttachmentInputChange} />

                            {attachments.length === 0 ? (
                              <div
                                onDragOver={(event) => {
                                  event.preventDefault();
                                  setIsAttachmentDragOver(true);
                                }}
                                onDragLeave={() => setIsAttachmentDragOver(false)}
                                onDrop={handleAttachmentDrop}
                                className={cn(
                                  "rounded-lg border-2 border-dashed p-6 text-center transition-colors",
                                  isAttachmentDragOver ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50"
                                )}
                              >
                                <Upload className="w-6 h-6 mx-auto mb-2 text-slate-500" />
                                <p className="text-sm font-medium text-slate-700">Drag and drop files here</p>
                                <p className="text-xs text-slate-500 my-2">or</p>
                                <Button type="button" variant="outline" onClick={() => attachmentInputRef.current?.click()}>
                                  Upload Files
                                </Button>
                              </div>
                            ) : (
                              <div className="min-w-0">
                                <div className="relative flex-1 min-w-0 overflow-hidden">
                                  {attachmentScrollState.canScrollLeft && (
                                    <button
                                      type="button"
                                      className="absolute left-0 top-[3.5rem] -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                                      onClick={() => scrollAttachmentList("left")}
                                      disabled={!attachmentScrollState.canScrollLeft}
                                    >
                                      <ChevronLeft className="w-4 h-4" />
                                    </button>
                                  )}
                                  <div
                                    ref={attachmentListRef}
                                    className={`w-full overflow-x-auto pb-1 cursor-grab active:cursor-grabbing select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${attachmentScrollState.canScrollLeft ? "pl-8" : "pl-0"} ${attachmentScrollState.canScrollRight ? "pr-8" : "pr-0"}`}
                                    onMouseDown={startAttachmentListDrag}
                                    onMouseMove={handleAttachmentListDrag}
                                    onMouseUp={endAttachmentListDrag}
                                    onMouseLeave={endAttachmentListDrag}
                                    onDragStart={(event) => event.preventDefault()}
                                  >
                                    <div className="flex min-w-max gap-3">
                                      {attachments.map((file) => {
                                        const attachmentKey = getAttachmentKey(file);
                                        return (
                                          <div key={attachmentKey} className="w-28 shrink-0">
                                            <div className="relative w-28 h-28 rounded-md border bg-slate-50 overflow-hidden flex items-center justify-center">
                                              <button
                                                type="button"
                                                className="absolute right-1 top-1 z-10 h-5 w-5 rounded-full bg-white/95 border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-white"
                                                onMouseDown={(event) => event.stopPropagation()}
                                                onClick={(event) => {
                                                  event.preventDefault();
                                                  event.stopPropagation();
                                                  removeAttachmentByKey(attachmentKey);
                                                }}
                                                aria-label={`Remove ${file.name}`}
                                              >
                                                <X className="h-3 w-3" />
                                              </button>
                                              {file.type.startsWith("image/") && attachmentPreviewUrls[attachmentKey] ? (
                                                <img
                                                  src={attachmentPreviewUrls[attachmentKey]}
                                                  alt={file.name}
                                                  className="h-full w-full object-cover"
                                                  draggable={false}
                                                />
                                              ) : (
                                                <div className="flex flex-col items-center gap-1 text-slate-600">
                                                  {getAttachmentIcon(file)}
                                                  <span className="text-[10px] uppercase font-medium">{file.name.split(".").pop() ?? "file"}</span>
                                                </div>
                                              )}
                                            </div>
                                            <p className="mt-1 text-xs truncate">{file.name}</p>
                                            <p className="text-[11px] text-slate-500">{formatAttachmentSize(file.size)}</p>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                  {attachmentScrollState.canScrollRight && (
                                    <button
                                      type="button"
                                      className="absolute right-0 top-[3.5rem] -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                                      onClick={() => scrollAttachmentList("right")}
                                      disabled={!attachmentScrollState.canScrollRight}
                                    >
                                      <ChevronRight className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                        <div className="flex flex-1">
                          <Card className="flex flex-col w-full">
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
                      </div>
                      <Card className="lg:grid-cols-1 lg:col-span-3">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">Parts</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto] gap-2 items-end">
                            <div>
                              <Label className="text-sm font-medium">Part</Label>
                              <Input
                                value={partsForm.part}
                                onChange={(e) => setPartsForm((prev) => ({ ...prev, part: e.target.value }))}
                                placeholder="Part name"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Cost</Label>
                              <Input
                                type="number"
                                min={0}
                                step="0.01"
                                value={partsForm.cost}
                                onChange={(e) => setPartsForm((prev) => ({ ...prev, cost: e.target.value }))}
                                placeholder="0.00"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <SelectInput
                                label="Type"
                                options={[
                                  { label: "Tech", value: "Tech" },
                                  { label: "Company", value: "Company" },
                                ]}
                                placeholder="Type"
                                value={partsForm.type}
                                onSearch={() => {}}
                                onSelect={(val) => setPartsForm((prev) => ({ ...prev, type: Array.isArray(val) ? (val[0] ?? "Tech") : val }))}
                              />
                            </div>
                            <Button type="button" className="h-10" onClick={handleAddPart}>
                              Add Part
                            </Button>
                          </div>

                          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {partsItems.length > 0 ? (
                              partsItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="secondary" className="text-xs">{item.type}</Badge>
                                      <span className="font-medium">${item.cost.toFixed(2)}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate mt-1">{item.part}</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs text-slate-500 whitespace-nowrap">{item.createdAt}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemovePart(item.id)}
                                      className="text-slate-500 hover:text-slate-700"
                                      aria-label={`Remove ${item.part}`}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-slate-500">No parts added yet.</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="fixed bottom-0 left-0 right-0 bg-white">
                      <div className="flex items-center justify-end gap-3 py-3 px-6 border-t">
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? "Loading..." : "Save"}
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
                              onSearch={() => {}}
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

                  <TabsContent value="financials" className="flex-1 min-h-0 overflow-y-auto p-6 pb-4 space-y-4 data-[state=inactive]:hidden data-[state=active]:flex data-[state=active]:flex-col">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Finance Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {(() => {
                          const total = Number(selectedJob?.revenue || 0);
                          const paid = 0;
                          const due = Math.max(0, total - paid);
                          return (
                            <>
                              <div className="flex items-center justify-between text-sm"><span>Total</span><span>${total.toFixed(2)}</span></div>
                              <div className="flex items-center justify-between text-sm"><span>Paid</span><span>${paid.toFixed(2)}</span></div>
                              <div className="flex items-center justify-between text-sm"><span>Due</span><span className={due > 0 ? "text-red-600 font-medium" : "text-emerald-600 font-medium"}>${due.toFixed(2)}</span></div>
                            </>
                          );
                        })()}
                      </CardContent>
                    </Card>

                    <Tabs defaultValue="invoices" className="w-full">
                      <TabsList className="grid grid-cols-3 w-full max-w-lg">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="invoices">Invoices</TabsTrigger>
                        <TabsTrigger value="estimates">Estimates</TabsTrigger>
                      </TabsList>

                      <TabsContent value="all" className="mt-4 space-y-4">
                        <Card>
                          <CardHeader className="py-3">
                            <CardTitle className="text-base">All Documents</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            {[...INVOICE_DUMMY_DATA.map((d) => ({ kind: "Invoice", id: d.referenceNo || d.id, amount: d.amount, status: d.status, date: d.dated })), ...ESTIMATE_DUMMY_DATA.map((d) => ({ kind: "Estimate", id: d.id, amount: d.amount, status: d.status, date: d.dated }))].map((doc, index) => (
                              <div key={`${doc.kind}-${doc.id}-${index}`} className="grid grid-cols-5 gap-2 items-center px-2 py-2 border-b last:border-b-0">
                                <div className="text-xs text-slate-500">{doc.kind}</div>
                                <div className="font-medium">{doc.id}</div>
                                <div>{doc.status}</div>
                                <div>{doc.date}</div>
                                <div className="text-right">{doc.amount}</div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="invoices" className="mt-4 space-y-4 pb-24">
                        <Card>
                          <CardHeader className="py-3">
                            <div className="flex items-center justify-between gap-2">
                              <CardTitle className="text-base">Invoices</CardTitle>
                              <div className="flex items-center gap-2">
                                <Input
                                  className="w-44"
                                  placeholder="Search by ID"
                                  value={financeInvoiceSearch}
                                  onChange={(e) => setFinanceInvoiceSearch(e.target.value)}
                                />
                                <div className="w-36">
                                  <SelectInput
                                    options={["all", "Paid", "Pending", "Overdue", "Rejected"].map((status) => ({
                                      label: status,
                                      value: status,
                                    }))}
                                    placeholder="Status"
                                    value={financeInvoiceStatus}
                                    onSearch={() => {}}
                                    onSelect={(val) =>
                                      setFinanceInvoiceStatus(Array.isArray(val) ? (val[0] ?? "all") : val)
                                    }
                                    className="mt-0"
                                  />
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="text-sm">
                              <div className="grid grid-cols-5 px-2 py-2 text-xs text-slate-500">
                                <div>ID</div><div>Status</div><div>Date</div><div>Amount</div><div className="text-right">Actions</div>
                              </div>
                              {INVOICE_DUMMY_DATA.filter((inv: any) => {
                                const matchesSearch = !financeInvoiceSearch.trim() || String(inv.referenceNo || inv.id).toLowerCase().includes(financeInvoiceSearch.toLowerCase());
                                const matchesStatus = financeInvoiceStatus === "all" || String(inv.status) === financeInvoiceStatus;
                                return matchesSearch && matchesStatus;
                              }).map((inv: any) => (
                                <div key={`finance-inv-${inv.id}`} className="grid grid-cols-5 items-center px-2 py-2 border-b last:border-b-0">
                                  <div className="font-medium">{inv.referenceNo || inv.id}</div>
                                  <div><Badge variant="secondary">{inv.status || "Unpaid"}</Badge></div>
                                  <div>{inv.dated}</div>
                                  <div className="text-slate-700">{inv.amount}</div>
                                  <div className="text-right space-x-2">
                                    <Button size="sm" variant="outline">View</Button>
                                    <Button size="sm">Send</Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="py-3">
                            <CardTitle className="text-base">Create Invoice</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="rounded-md border bg-slate-50 p-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="flex flex-row items-start gap-3">
                                  <div className="shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => invoiceLogoInputRef.current?.click()}
                                      className="mt-6 flex h-[96px] w-[96px] cursor-pointer items-center justify-center rounded-md border border-dashed border-slate-400 bg-white text-xs text-slate-500 transition hover:border-brandGreen-500 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandGreen-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-brandGreen-500 dark:hover:bg-slate-800"
                                      aria-label="Upload company logo"
                                    >
                                      {invoiceLogoPreview ? (
                                        <img
                                          src={invoiceLogoPreview}
                                          alt="Company logo"
                                          className="h-full w-full rounded-md object-cover"
                                        />
                                      ) : (
                                        <span className="text-[11px] font-medium text-slate-400">Logo</span>
                                      )}
                                    </button>
                                    <input
                                      ref={invoiceLogoInputRef}
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const reader = new FileReader();
                                        reader.onload = () => {
                                          setInvoiceLogoPreview(
                                            typeof reader.result === "string" ? reader.result : null
                                          );
                                        };
                                        reader.readAsDataURL(file);
                                        e.currentTarget.value = "";
                                      }}
                                    />
                                    {invoiceLogoPreview && (
                                      <div className="mt-1 flex flex-col items-center justify-center gap-1">
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => invoiceLogoInputRef.current?.click()}
                                          className="h-6 rounded-md px-2 text-[11px] w-full"
                                        >
                                          Change
                                        </Button>
                                        <button
                                          type="button"
                                          onClick={() => setInvoiceLogoPreview(null)}
                                          className="rounded px-1.5 py-0.5 text-[11px] font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 space-y-2">
                                    <div className="text-xs font-medium">From</div>
                                    <Input placeholder="Company name" value={invoiceForm.from.name} onChange={(e) => setInvoiceForm((p) => ({ ...p, from: { ...p.from, name: e.target.value } }))} />
                                    <Input placeholder="Address" value={invoiceForm.from.address1} onChange={(e) => setInvoiceForm((p) => ({ ...p, from: { ...p.from, address1: e.target.value } }))} />
                                    <div className="grid grid-cols-3 gap-2">
                                      <Input placeholder="City" value={invoiceForm.from.city} onChange={(e) => setInvoiceForm((p) => ({ ...p, from: { ...p.from, city: e.target.value } }))} />
                                      <Input placeholder="State" value={invoiceForm.from.state} onChange={(e) => setInvoiceForm((p) => ({ ...p, from: { ...p.from, state: e.target.value } }))} />
                                      <Input placeholder="Zip" value={invoiceForm.from.zip} onChange={(e) => setInvoiceForm((p) => ({ ...p, from: { ...p.from, zip: e.target.value } }))} />
                                    </div>
                                    <Input placeholder="Phone" value={invoiceForm.from.phone} onChange={(e) => setInvoiceForm((p) => ({ ...p, from: { ...p.from, phone: e.target.value } }))} />
                                    <Input placeholder="Email" value={invoiceForm.from.email} onChange={(e) => setInvoiceForm((p) => ({ ...p, from: { ...p.from, email: e.target.value } }))} />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                <div className="text-xs font-medium">To</div>
                                <Input placeholder="Customer name" value={invoiceForm.to.name} onChange={(e) => setInvoiceForm((p) => ({ ...p, to: { ...p.to, name: e.target.value } }))} />
                                <Input placeholder="Address" value={invoiceForm.to.address1} onChange={(e) => setInvoiceForm((p) => ({ ...p, to: { ...p.to, address1: e.target.value } }))} />
                                <div className="grid grid-cols-3 gap-2">
                                  <Input placeholder="City" value={invoiceForm.to.city} onChange={(e) => setInvoiceForm((p) => ({ ...p, to: { ...p.to, city: e.target.value } }))} />
                                  <Input placeholder="State" value={invoiceForm.to.state} onChange={(e) => setInvoiceForm((p) => ({ ...p, to: { ...p.to, state: e.target.value } }))} />
                                  <Input placeholder="Zip" value={invoiceForm.to.zip} onChange={(e) => setInvoiceForm((p) => ({ ...p, to: { ...p.to, zip: e.target.value } }))} />
                                </div>
                                <Input placeholder="Phone" value={invoiceForm.to.phone} onChange={(e) => setInvoiceForm((p) => ({ ...p, to: { ...p.to, phone: e.target.value } }))} />
                                <Input placeholder="Email" value={invoiceForm.to.email} onChange={(e) => setInvoiceForm((p) => ({ ...p, to: { ...p.to, email: e.target.value } }))} />
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                              <div>
                                <Label className="text-xs">Invoice Number</Label>
                                <Input className="mt-1" value={invoiceForm.invoiceNumber} onChange={(e) => setInvoiceForm((p) => ({ ...p, invoiceNumber: e.target.value }))} />
                              </div>
                              <div>
                                <Label className="text-xs">Date</Label>
                                <div className="mt-1">
                                  <InputDatepicker
                                    range={false}
                                    value={{ startDate: fromYmdToDate(invoiceForm.date), endDate: fromYmdToDate(invoiceForm.date) }}
                                    onChange={(value: DateValueType) => {
                                      const selectedDate = value?.startDate ?? value?.endDate ?? null;
                                      setInvoiceForm((p) => ({ ...p, date: toLocalYmd(selectedDate as string | Date | null) }));
                                    }}
                                  />
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs">Due Date</Label>
                                <div className="mt-1">
                                  <InputDatepicker
                                    range={false}
                                    value={{ startDate: fromYmdToDate(invoiceForm.dueDate), endDate: fromYmdToDate(invoiceForm.dueDate) }}
                                    onChange={(value: DateValueType) => {
                                      const selectedDate = value?.startDate ?? value?.endDate ?? null;
                                      setInvoiceForm((p) => ({ ...p, dueDate: toLocalYmd(selectedDate as string | Date | null) }));
                                    }}
                                  />
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs">Payment Terms</Label>
                                <div className="mt-1">
                                  <SelectInput
                                    options={["Due on receipt", "Net 7", "Net 15", "Net 30", "Net 45", "Net 60"].map((term) => ({
                                      label: term,
                                      value: term,
                                    }))}
                                    placeholder="Terms"
                                    value={invoiceForm.paymentTerms}
                                    onSearch={() => {}}
                                    onSelect={(val) =>
                                      setInvoiceForm((p) => ({
                                        ...p,
                                        paymentTerms: Array.isArray(val) ? (val[0] ?? "Net 30") : val,
                                      }))
                                    }
                                    className="mt-0"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-xs font-medium">Line Items</div>
                              {invoiceForm.items.map((it, idx) => (
                                <div key={`inv-item-${idx}`} className="grid grid-cols-6 gap-2 items-center">
                                  <Input className="col-span-3" placeholder="Description" value={it.description} onChange={(e) => setInvoiceForm((p) => { const arr = [...p.items]; arr[idx] = { ...arr[idx], description: e.target.value }; return { ...p, items: arr }; })} />
                                  <Input className="col-span-1" type="number" placeholder="Qty" value={it.qty} onChange={(e) => setInvoiceForm((p) => { const arr = [...p.items]; arr[idx] = { ...arr[idx], qty: Number(e.target.value) || 0 }; return { ...p, items: arr }; })} />
                                  <Input className="col-span-1" type="number" placeholder="Rate" value={it.rate} onChange={(e) => setInvoiceForm((p) => { const arr = [...p.items]; arr[idx] = { ...arr[idx], rate: Number(e.target.value) || 0 }; return { ...p, items: arr }; })} />
                                  <div className="col-span-1 text-right text-sm">{formatCurrency(Number(it.qty || 0) * Number(it.rate || 0))}</div>
                                </div>
                              ))}
                              <div>
                                <Button size="sm" variant="outline" onClick={() => setInvoiceForm((p) => ({ ...p, items: [...p.items, { description: "", qty: 1, rate: 0 }] }))}>
                                  Add item
                                </Button>
                                <Button size="sm" className="ml-2">Add from Catalog</Button>
                                {(() => {
                                  const price = invoiceForm.items.reduce((sum, it) => sum + Number(it.qty || 0) * Number(it.rate || 0), 0);
                                  const cost = 0;
                                  const margin = price > 0 ? ((price - cost) / price) * 100 : 0;
                                  return (
                                    <div className="inline-block ml-3 text-xs text-slate-600 align-middle">
                                      Cost: {formatCurrency(cost)} • Price: {formatCurrency(price)} • Margin: {margin.toFixed(1)}%
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="rounded-md border p-3 space-y-2">
                                <div className="text-sm font-medium">Payment Options</div>
                                {([
                                  ["creditCard", "Credit Card"],
                                  ["debitCard", "Debit Card"],
                                  ["check", "Check"],
                                  ["cash", "Cash"],
                                  ["bankTransfer", "Bank Transfer"],
                                  ["paypal", "PayPal"],
                                ] as const).map(([key, label]) => (
                                  <div key={key} className="flex items-center justify-between text-sm">
                                    <span>{label}</span>
                                    <Switch
                                      checked={invoiceForm.paymentMethods[key]}
                                      onCheckedChange={(checked) =>
                                        setInvoiceForm((p) => ({ ...p, paymentMethods: { ...p.paymentMethods, [key]: Boolean(checked) } }))
                                      }
                                    />
                                  </div>
                                ))}
                                <div>
                                  <Label className="text-xs">Deposit Amount</Label>
                                  <Input
                                    className="mt-1"
                                    type="number"
                                    value={invoiceForm.depositAmount}
                                    onChange={(e) => setInvoiceForm((p) => ({ ...p, depositAmount: Number(e.target.value) || 0 }))}
                                  />
                                </div>
                              </div>
                              <div className="rounded-md border p-3 space-y-2 flex flex-col">
                                <div className="text-sm font-medium">Financial Summary</div>
                                <div className="flex items-center justify-between text-sm">
                                  <span>Discount</span>
                                  <Input className="h-8 w-20 text-right" type="number" value={invoiceForm.discountPct} onChange={(e) => setInvoiceForm((p) => ({ ...p, discountPct: Number(e.target.value) || 0 }))} />
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span>Tax</span>
                                  <Input className="h-8 w-20 text-right" type="number" value={invoiceForm.taxPct} onChange={(e) => setInvoiceForm((p) => ({ ...p, taxPct: Number(e.target.value) || 0 }))} />
                                </div>
                                {(() => {
                                  const t = calcTotal(invoiceForm.items, invoiceForm.discountPct, invoiceForm.taxPct);
                                  return (
                                    <div className="flex flex-col flex-1 justify-between">
                                      <div>
                                        <div className="flex items-center justify-between text-sm"><span>Subtotal</span><span>{formatCurrency(t.subtotal)}</span></div>
                                        <div className="flex items-center justify-between text-sm"><span>Total</span><span className="font-medium">{formatCurrency(t.total)}</span></div>
                                      </div>
                                      <Button
                                        className="w-full mt-2"
                                        variant="outline"
                                        onClick={() => {
                                          const amount = Number(invoiceForm.depositAmount) > 0 ? Number(invoiceForm.depositAmount) : Number((t.total || 0) * 0.5);
                                          if (!amount || amount <= 0) {
                                            toast.error("Enter a valid deposit amount");
                                            return;
                                          }
                                          toast.success(`Collected deposit ${formatCurrency(amount)} (demo)`);
                                        }}
                                      >
                                        $ Collect Deposit (50%)
                                      </Button>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                            <div className="rounded-md border p-3">
                              <div className="mb-2 flex items-center justify-between">
                                <div className="text-sm font-medium">Attachments</div>
                                <Button type="button" variant="outline" size="sm" onClick={() => invoiceAttachmentInputRef.current?.click()}>
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add More
                                </Button>
                              </div>
                              <input
                                ref={invoiceAttachmentInputRef}
                                type="file"
                                multiple
                                className="hidden"
                                onChange={handleInvoiceAttachmentInputChange}
                              />
                              {invoiceAttachments.length === 0 ? (
                                <div
                                  onDragOver={(event) => {
                                    event.preventDefault();
                                    setIsInvoiceAttachmentDragOver(true);
                                  }}
                                  onDragLeave={() => setIsInvoiceAttachmentDragOver(false)}
                                  onDrop={handleInvoiceAttachmentDrop}
                                  className={cn(
                                    "rounded-lg border-2 border-dashed p-6 text-center transition-colors",
                                    isInvoiceAttachmentDragOver ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50"
                                  )}
                                >
                                  <Upload className="w-6 h-6 mx-auto mb-2 text-slate-500" />
                                  <p className="text-sm font-medium text-slate-700">Drag and drop files here</p>
                                  <p className="text-xs text-slate-500 my-2">or</p>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => invoiceAttachmentInputRef.current?.click()}
                                  >
                                    Upload Files
                                  </Button>
                                </div>
                              ) : (
                                <div className="min-w-0">
                                  <div className="relative flex-1 min-w-0 overflow-hidden">
                                    {invoiceAttachmentScrollState.canScrollLeft && (
                                      <button
                                        type="button"
                                        className="absolute left-0 top-[3.5rem] -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                                        onClick={() => scrollInvoiceAttachmentList("left")}
                                        disabled={!invoiceAttachmentScrollState.canScrollLeft}
                                      >
                                        <ChevronLeft className="w-4 h-4" />
                                      </button>
                                    )}
                                    <div
                                      ref={invoiceAttachmentListRef}
                                      className={`w-full overflow-x-auto pb-1 cursor-grab active:cursor-grabbing select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${invoiceAttachmentScrollState.canScrollLeft ? "pl-8" : "pl-0"} ${invoiceAttachmentScrollState.canScrollRight ? "pr-8" : "pr-0"}`}
                                      onMouseDown={startInvoiceAttachmentListDrag}
                                      onMouseMove={handleInvoiceAttachmentListDrag}
                                      onMouseUp={endInvoiceAttachmentListDrag}
                                      onMouseLeave={endInvoiceAttachmentListDrag}
                                      onDragStart={(event) => event.preventDefault()}
                                    >
                                      <div className="flex min-w-max gap-3">
                                        {invoiceAttachments.map((file) => {
                                          const attachmentKey = getAttachmentKey(file);
                                          return (
                                            <div key={attachmentKey} className="w-28 shrink-0">
                                              <div className="relative w-28 h-28 rounded-md border bg-slate-50 overflow-hidden flex items-center justify-center">
                                                <button
                                                  type="button"
                                                  className="absolute right-1 top-1 z-10 h-5 w-5 rounded-full bg-white/95 border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-white"
                                                  onMouseDown={(event) => event.stopPropagation()}
                                                  onClick={(event) => {
                                                    event.preventDefault();
                                                    event.stopPropagation();
                                                    removeInvoiceAttachmentByKey(attachmentKey);
                                                  }}
                                                  aria-label={`Remove ${file.name}`}
                                                >
                                                  <X className="h-3 w-3" />
                                                </button>
                                                {file.type.startsWith("image/") && invoiceAttachmentPreviewUrls[attachmentKey] ? (
                                                  <img
                                                    src={invoiceAttachmentPreviewUrls[attachmentKey]}
                                                    alt={file.name}
                                                    className="h-full w-full object-cover"
                                                    draggable={false}
                                                  />
                                                ) : (
                                                  <div className="flex flex-col items-center gap-1 text-slate-600">
                                                    {getAttachmentIcon(file)}
                                                    <span className="text-[10px] uppercase font-medium">{file.name.split(".").pop() ?? "file"}</span>
                                                  </div>
                                                )}
                                              </div>
                                              <p className="mt-1 text-xs truncate">{file.name}</p>
                                              <p className="text-[11px] text-slate-500">{formatAttachmentSize(file.size)}</p>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                    {invoiceAttachmentScrollState.canScrollRight && (
                                      <button
                                        type="button"
                                        className="absolute right-0 top-[3.5rem] -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                                        onClick={() => scrollInvoiceAttachmentList("right")}
                                        disabled={!invoiceAttachmentScrollState.canScrollRight}
                                      >
                                        <ChevronRight className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                              <div className="text-xs text-slate-500 mt-1">
                                {invoiceAttachments.length
                                  ? `${invoiceAttachments.length} file(s) selected`
                                  : "Images, PDFs, Word docs (max 10MB each)"}
                              </div>
                            </div>
                            <div className="rounded-md space-y-2">
                              <Label className="text-xs">Notes</Label>
                              <Textarea rows={3} value={invoiceForm.notes} onChange={(e) => setInvoiceForm((p) => ({ ...p, notes: e.target.value }))} />
                              <Label className="text-xs">Terms & Conditions</Label>
                              <Textarea rows={3} value={invoiceForm.terms} onChange={(e) => setInvoiceForm((p) => ({ ...p, terms: e.target.value }))} />
                            </div>
                            <div className="rounded-md border p-3 bg-slate-50">
                              <div className="text-sm font-medium mb-2">Preview</div>
                              <div className="text-xs space-y-1">
                                <div className="font-semibold">INVOICE {invoiceForm.invoiceNumber}</div>
                                <div>Date: {invoiceForm.date} • Due: {invoiceForm.dueDate}</div>
                                <div>Bill To: {invoiceForm.to.name || "—"}</div>
                                <div>{[invoiceForm.to.address1, invoiceForm.to.city, invoiceForm.to.state, invoiceForm.to.zip].filter(Boolean).join(", ") || "—"}</div>
                                {(() => {
                                  const t = calcTotal(invoiceForm.items, invoiceForm.discountPct, invoiceForm.taxPct);
                                  return <div className="font-medium">Total: {formatCurrency(t.total)}</div>;
                                })()}
                              </div>
                            </div>
                            <div className="rounded-md border p-3">
                              <div className="text-sm font-medium mb-2">Send Invoice</div>
                              <div className="flex flex-row gap-2">
                                <div className="grid grid-cols-2 gap-2 flex flex-1">
                                  <div>
                                    <Label className="text-xs">Email</Label>
                                    <Input
                                      className="mt-1"
                                      value={invoiceForm.to.email}
                                      onChange={(e) => setInvoiceForm((p) => ({ ...p, to: { ...p.to, email: e.target.value } }))}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Phone (SMS)</Label>
                                    <Input
                                      className="mt-1"
                                      value={invoiceForm.to.phone}
                                      onChange={(e) => setInvoiceForm((p) => ({ ...p, to: { ...p.to, phone: e.target.value } }))}
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center justify-end gap-2 mt-7">
                                  <Button variant="outline" onClick={() => toast.success("Invoice sent via SMS (demo)")}>Send SMS</Button>
                                  <Button onClick={() => toast.success("Invoice sent via Email (demo)")}>Send Email</Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <div className="fixed bottom-0 left-0 right-0 bg-white">
                          <div className="flex items-center justify-end gap-2 py-3 px-6 border-t">
                            <Button
                              variant="outline"
                              onClick={() =>
                                setInvoiceForm((p) => ({
                                  ...p,
                                  invoiceNumber: `INV-${Date.now()}`,
                                  date: todayStr,
                                  dueDate: plus30Str,
                                  paymentTerms: "Net 30",
                                  items: [{ description: "", qty: 1, rate: 0 }],
                                  discountPct: 0,
                                  taxPct: 8.25,
                                  depositAmount: 0,
                                  paymentMethods: { creditCard: true, debitCard: true, check: true, cash: true, bankTransfer: true, paypal: true },
                                  notes: "",
                                  terms: "Payment is due within 30 days of invoice date.",
                                }))
                              }
                            >
                              Reset
                            </Button>
                            <Button onClick={() => toast.success("Invoice form saved (demo)")}>Save & Request Signature</Button>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="estimates" className="mt-4 space-y-4">
                        <Card>
                          <CardHeader className="py-3">
                            <div className="flex items-center justify-between gap-2">
                              <CardTitle className="text-base">Estimates</CardTitle>
                              <div className="flex items-center gap-2">
                                <Input
                                  className="w-44"
                                  placeholder="Search by ID"
                                  value={financeEstimateSearch}
                                  onChange={(e) => setFinanceEstimateSearch(e.target.value)}
                                />
                                <div className="w-36">
                                  <SelectInput
                                    options={["all", "Draft", "Sent", "Approved", "Declined"].map((status) => ({
                                      label: status,
                                      value: status,
                                    }))}
                                    placeholder="Status"
                                    value={financeEstimateStatus}
                                    onSearch={() => {}}
                                    onSelect={(val) =>
                                      setFinanceEstimateStatus(Array.isArray(val) ? (val[0] ?? "all") : val)
                                    }
                                    className="mt-0"
                                  />
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="text-sm">
                              <div className="grid grid-cols-6 px-2 py-2 text-xs text-slate-500">
                                <div>ID</div><div>Status</div><div>Date</div><div>Valid Until</div><div>Amount</div><div className="text-right">Actions</div>
                              </div>
                              {ESTIMATE_DUMMY_DATA.filter((est) => {
                                const matchesSearch = !financeEstimateSearch.trim() || est.id.toLowerCase().includes(financeEstimateSearch.toLowerCase());
                                const matchesStatus = financeEstimateStatus === "all" || est.status === financeEstimateStatus;
                                return matchesSearch && matchesStatus;
                              }).map((est) => (
                                <div key={`finance-est-${est.id}`} className="grid grid-cols-6 items-center px-2 py-2 border-b last:border-b-0">
                                  <div className="font-medium">{est.id}</div>
                                  <div><Badge variant="secondary">{est.status}</Badge></div>
                                  <div>{est.dated}</div>
                                  <div>{est.validUntil}</div>
                                  <div className="text-slate-700">{est.amount}</div>
                                  <div className="text-right space-x-2">
                                    <Button size="sm" variant="outline">View</Button>
                                    <Button size="sm">Convert</Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="py-3">
                            <CardTitle className="text-base">Create Estimate</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-4 gap-2">
                              <div>
                                <Label className="text-xs">Estimate Number</Label>
                                <Input className="mt-1" value={estimateForm.estimateNumber} onChange={(e) => setEstimateForm((p) => ({ ...p, estimateNumber: e.target.value }))} />
                              </div>
                              <div>
                                <Label className="text-xs">Date</Label>
                                <div className="mt-1">
                                  <InputDatepicker
                                    range={false}
                                    value={{ startDate: fromYmdToDate(estimateForm.date), endDate: fromYmdToDate(estimateForm.date) }}
                                    onChange={(value: DateValueType) => {
                                      const selectedDate = value?.startDate ?? value?.endDate ?? null;
                                      setEstimateForm((p) => ({ ...p, date: toLocalYmd(selectedDate as string | Date | null) }));
                                    }}
                                  />
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs">Valid Until</Label>
                                <div className="mt-1">
                                  <InputDatepicker
                                    range={false}
                                    value={{ startDate: fromYmdToDate(estimateForm.validUntil), endDate: fromYmdToDate(estimateForm.validUntil) }}
                                    onChange={(value: DateValueType) => {
                                      const selectedDate = value?.startDate ?? value?.endDate ?? null;
                                      setEstimateForm((p) => ({ ...p, validUntil: toLocalYmd(selectedDate as string | Date | null) }));
                                    }}
                                  />
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs">Payment Terms</Label>
                                <div className="mt-1">
                                  <SelectInput
                                    options={["Due on receipt", "Net 7", "Net 15", "Net 30", "Net 45", "Net 60"].map((term) => ({
                                      label: term,
                                      value: term,
                                    }))}
                                    placeholder="Terms"
                                    value={estimateForm.paymentTerms}
                                    onSearch={() => {}}
                                    onSelect={(val) =>
                                      setEstimateForm((p) => ({
                                        ...p,
                                        paymentTerms: Array.isArray(val) ? (val[0] ?? "Net 30") : val,
                                      }))
                                    }
                                    className="mt-0"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-xs font-medium">Line Items</div>
                              {estimateForm.items.map((it, idx) => (
                                <div key={`est-item-${idx}`} className="grid grid-cols-6 gap-2 items-center">
                                  <Input className="col-span-3" placeholder="Description" value={it.description} onChange={(e) => setEstimateForm((p) => { const arr = [...p.items]; arr[idx] = { ...arr[idx], description: e.target.value }; return { ...p, items: arr }; })} />
                                  <Input className="col-span-1" type="number" placeholder="Qty" value={it.qty} onChange={(e) => setEstimateForm((p) => { const arr = [...p.items]; arr[idx] = { ...arr[idx], qty: Number(e.target.value) || 0 }; return { ...p, items: arr }; })} />
                                  <Input className="col-span-1" type="number" placeholder="Rate" value={it.rate} onChange={(e) => setEstimateForm((p) => { const arr = [...p.items]; arr[idx] = { ...arr[idx], rate: Number(e.target.value) || 0 }; return { ...p, items: arr }; })} />
                                  <div className="col-span-1 text-right text-sm">{formatCurrency(Number(it.qty || 0) * Number(it.rate || 0))}</div>
                                </div>
                              ))}
                              <div>
                                <Button size="sm" variant="outline" onClick={() => setEstimateForm((p) => ({ ...p, items: [...p.items, { description: "", qty: 1, rate: 0 }] }))}>
                                  Add item
                                </Button>
                                <Button size="sm" className="ml-2">Add from Catalog</Button>
                                {(() => {
                                  const price = estimateForm.items.reduce((sum, it) => sum + Number(it.qty || 0) * Number(it.rate || 0), 0);
                                  const cost = 0;
                                  const margin = price > 0 ? ((price - cost) / price) * 100 : 0;
                                  return (
                                    <div className="inline-block ml-3 text-xs text-slate-600 align-middle">
                                      Cost: {formatCurrency(cost)} • Price: {formatCurrency(price)} • Margin: {margin.toFixed(1)}%
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="rounded-md border p-3 space-y-2">
                                <div className="text-sm font-medium">Options</div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  {([
                                    ["creditCard", "Credit Card"],
                                    ["debitCard", "Debit Card"],
                                    ["check", "Check"],
                                    ["cash", "Cash"],
                                    ["bankTransfer", "Bank Transfer"],
                                    ["paypal", "PayPal"],
                                  ] as const).map(([key, label]) => (
                                    <label key={key} className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={estimateForm.paymentMethods[key]}
                                        onChange={(e) =>
                                          setEstimateForm((p) => ({
                                            ...p,
                                            paymentMethods: { ...p.paymentMethods, [key]: e.target.checked },
                                          }))
                                        }
                                      />
                                      {label}
                                    </label>
                                  ))}
                                </div>
                                <label className="flex items-center gap-2 mt-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={estimateForm.requireSignature}
                                    onChange={(e) => setEstimateForm((p) => ({ ...p, requireSignature: e.target.checked }))}
                                  />
                                  Require Signature
                                </label>
                              </div>
                              <div className="rounded-md border p-3 space-y-2">
                                <div className="text-sm font-medium">Financial Summary</div>
                                <div className="flex items-center justify-between text-sm">
                                  <span>Discount</span>
                                  <Input className="h-8 w-20 text-right" type="number" value={estimateForm.discountPct} onChange={(e) => setEstimateForm((p) => ({ ...p, discountPct: Number(e.target.value) || 0 }))} />
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span>Tax</span>
                                  <Input className="h-8 w-20 text-right" type="number" value={estimateForm.taxPct} onChange={(e) => setEstimateForm((p) => ({ ...p, taxPct: Number(e.target.value) || 0 }))} />
                                </div>
                                {(() => {
                                  const t = calcTotal(estimateForm.items, estimateForm.discountPct, estimateForm.taxPct);
                                  return (
                                    <>
                                      <div className="flex items-center justify-between text-sm"><span>Subtotal</span><span>{formatCurrency(t.subtotal)}</span></div>
                                      <div className="flex items-center justify-between text-sm"><span>Total</span><span className="font-medium">{formatCurrency(t.total)}</span></div>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs">Notes</Label>
                              <Textarea rows={4} value={estimateForm.notes} onChange={(e) => setEstimateForm((p) => ({ ...p, notes: e.target.value }))} />
                            </div>
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() =>
                                  setEstimateForm((p) => ({
                                    ...p,
                                    estimateNumber: `EST-${Date.now()}`,
                                    date: todayStr,
                                    validUntil: plus30Str,
                                    paymentTerms: "Net 30",
                                    items: [{ description: "", qty: 1, rate: 0 }],
                                    discountPct: 0,
                                    taxPct: 8.25,
                                    paymentMethods: { creditCard: true, debitCard: true, check: true, cash: true, bankTransfer: true, paypal: true },
                                    requireSignature: true,
                                    notes: "",
                                  }))
                                }
                              >
                                Reset
                              </Button>
                              <Button onClick={() => toast.success("Estimate form saved (demo)")}>Save & Request Signature</Button>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </TabsContent>

                  <TabsContent value="nearest-jobs" className="flex-1 min-h-0 overflow-hidden flex flex-col p-4 data-[state=inactive]:hidden data-[state=active]:flex">
                    <div className="text-sm text-slate-500">Nearest Jobs moved to Details below Assignment.</div>
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
                    onSearch={() => {}}
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
                    onSearch={() => {}}
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
                  <div className="mt-1">
                    <InputDatepicker
                      range={false}
                      value={{ startDate: fromYmdToDate(addPaymentForm.date), endDate: fromYmdToDate(addPaymentForm.date) }}
                      onChange={(value: DateValueType) => {
                        const selectedDate = value?.startDate ?? value?.endDate ?? null;
                        setAddPaymentForm((prev) => ({ ...prev, date: toLocalYmd(selectedDate as string | Date | null) }));
                      }}
                    />
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <SelectInput
                    options={[{ label: "Pending", value: "Pending" }, { label: "Paid", value: "Paid" }, { label: "Overdue", value: "Overdue" }]}
                    placeholder="Status"
                    value={addPaymentForm.status}
                    onSearch={() => {}}
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
