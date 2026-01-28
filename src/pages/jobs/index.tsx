import { useState, useRef, useEffect } from "react";
import { type DateValueType } from "react-tailwindcss-datepicker";
import InputDatepicker from "@/src/components/input/datepicker";
import { useRouter } from "next/router";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import { Progress } from "@/src/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/src/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/src/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { ButtonLoading } from "@/src/components/ui/loading";
import {
  MapPin,
  Phone,
  Calendar,
  Clock,
  User,
  Wrench,
  Search,
  Filter,
  Plus,
  Star,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  X,
  Home,
  Building,
  MoreVertical,
  Trash2,
  Truck,
  Settings,
  Zap,
  Target,
  Globe,
  Eye,
  UserCheck,
  MessageSquare,
  DollarSign,
  AlertTriangle,
  Grid,
  List,
  Edit,
  UserPlus,
  Mail,
  Circle,
  Users,
  Activity,
  FileText,
  Calculator,
  CreditCard,
  Download,
  Send,
  Briefcase,
  ArrowUpDown,
  RefreshCw,
  Columns3,
  Tag,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/src/components/ui/tabs';
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/src/components/ui/sheet";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/components/ui/command";
import Table from "@/src/components/table";
import SelectInput from "@/src/components/input/select";

// Technician interface with proper typing
interface Technician {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  specialties: string[];
  location: string;
  distance: number;
  availability: string;
  completedJobs: number;
  responseTime: string;
  aiScore: number;
  openJobs: number;
  closingRate: number;
  aiReasons: string[];
  enRouteDistance?: number;
}

interface JobStatus {
  id: number;
  name: string;
  color: string;
  parent: number | null;
  showApp: boolean;
  showLeads: boolean;
  showDispatch: boolean;
  isActive?: boolean;
}

const jobStatuses: JobStatus[] = [
  { id: 1, name: "Pending", color: "#8B5CF6", parent: null, showApp: true, showLeads: true, showDispatch: true, isActive: true },
  { id: 2, name: "Rejected", color: "#2563EB", parent: null, showApp: true, showLeads: true, showDispatch: true, isActive: true },
  { id: 3, name: "No Answer", color: "#F59E42", parent: null, showApp: true, showLeads: true, showDispatch: true, isActive: true },
  { id: 4, name: "Canceled", color: "#EF4444", parent: null, showApp: true, showLeads: true, showDispatch: true, isActive: true },
  { id: 5, name: "Done", color: "#22C55E", parent: null, showApp: true, showLeads: true, showDispatch: true, isActive: true },
  { id: 6, name: "In Progress", color: "#3B82F6", parent: null, showApp: true, showLeads: true, showDispatch: true, isActive: true },
  { id: 7, name: "Submitted", color: "#FBBF24", parent: null, showApp: true, showLeads: true, showDispatch: true, isActive: true },
  { id: 8, name: "Appointments", color: "#22C55E", parent: null, showApp: true, showLeads: true, showDispatch: true, isActive: true },
  { id: 9, name: "Not Confirmed", color: "#EF4444", parent: null, showApp: true, showLeads: true, showDispatch: true, isActive: true },
  { id: 10, name: "Confirmed", color: "#22C55E", parent: null, showApp: true, showLeads: true, showDispatch: true, isActive: true },
  { id: 11, name: "Follow Up", color: "#FBBF24", parent: null, showApp: true, showLeads: true, showDispatch: true, isActive: true },
];

export default function Jobs() {
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const [dateRangeValue, setDateRangeValue] = useState<DateValueType>({
    startDate: null,
    endDate: null,
  });
  const [jobPriorityFilter, setJobPriorityFilter] = useState<string>("all");
  const [assignedTechFilter, setAssignedTechFilter] = useState<string>("all");
  const [jobSourceFilter, setJobSourceFilter] = useState<string>("all");
  
  // New multi-select filter states
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedTechnicians, setSelectedTechnicians] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  // Drag-and-drop ordering for statuses (persists per user)
  const [statusOrder, setStatusOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('jobs.statusOrder');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  useEffect(() => {
    try { localStorage.setItem('jobs.statusOrder', JSON.stringify(statusOrder)); } catch {}
  }, [statusOrder]);

  // Density (row height/compactness)
  const [density, setDensity] = useState<'comfortable'|'compact'|'ultra'>(()=>{
    try { return (localStorage.getItem('jobs.density') as any) || 'comfortable'; } catch { return 'comfortable'; }
  });
  useEffect(()=>{ try { localStorage.setItem('jobs.density', density); } catch {} }, [density]);
  const [jobLeadFilter, setJobLeadFilter] = useState<'all' | 'job' | 'lead'>('all');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  
  // Additional missing filters
  const [selectedTagsNotes, setSelectedTagsNotes] = useState<string[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedFranchise, setSelectedFranchise] = useState<string>("all");
  
  // Advanced filter toggle state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  
  // Helper: get status object by name with safety checks
  const getStatusObj = (name) => {
    if (!jobStatuses || !Array.isArray(jobStatuses)) {
      return { name: name || 'Pending', color: '#888', showDispatch: true };
    }
    return jobStatuses.find(s => s.name === name) || { name: name || 'Pending', color: '#888', showDispatch: true };
  };

  // Assign a status to each job for demo (in real app, jobs would have a status property)
  const getJobStatus = (job) => {
    // For demo, assign by job id
    const statusList = jobStatuses.map(s => s.name);
    const idx = parseInt(job.id.replace(/\D/g, '')) % statusList.length;
    return statusList[idx];
  };

  const handleDateRangeChange = (value: DateValueType) => {
    setDateRangeValue(value || { startDate: null, endDate: null });
    setSelectedDateRange('custom-picker');
  };

  const renderDateRangeLabel = () => {
    const start = dateRangeValue?.startDate;
    const end = dateRangeValue?.endDate;
    if (!start || !end) return "Select range";
    return `${start} – ${end}`;
  };

  const [selectedTechnician, setSelectedTechnician] = useState<string | null>(
    null,
  );
  const [showNewJobDialog, setShowNewJobDialog] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (!router.isReady) return;
    const newParam = router.query?.new;
    const newValue = Array.isArray(newParam) ? newParam[0] : newParam;
    if (newValue === "1") setShowNewJobDialog(true);
  }, [router.isReady, router.query]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handler = () => setShowNewJobDialog(true);
    window.addEventListener("jobs:openNewJob", handler);
    return () => window.removeEventListener("jobs:openNewJob", handler);
  }, []);
  const [currentStep, setCurrentStep] = useState(1);
  const [viewMode, setViewMode] = useState<"wizard" | "single">("wizard");
  const [selectedServiceDate, setSelectedServiceDate] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");
  const [technicianFilter, setTechnicianFilter] =
    useState<string>("closest-distance");
  const [aiSortingActive, setAiSortingActive] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [filterStatuses, setFilterStatuses] = useState<{
    [key: string]: boolean;
  }>({
    available: true,
    "on-route": true,
    busy: false,
  });

  const [nearbyJobs, setNearbyJobs] = useState([
    {
      id: "J123",
      client: "Sarah Wilson",
      service: "Kitchen Sink Repair",
      distance: 0.8,
      status: "In Progress",
      type: "Plumbing",
      timeRemaining: "45 min",
      priority: "High",
    },
    {
      id: "J124",
      client: "Mike Chen",
      service: "HVAC Maintenance",
      distance: 1.2,
      status: "Pending",
      type: "HVAC",
      timeRemaining: "2 hrs",
      priority: "Medium",
    },
    {
      id: "J125",
      client: "Lisa Garcia",
      service: "Electrical Outlet",
      distance: 1.5,
      status: "Completed",
      type: "Electrical",
      timeRemaining: "Done",
      priority: "Low",
    },
  ]);

  const [nearbyJobsFilter, setNearbyJobsFilter] = useState("all");
  const [nearbyJobsStatusFilter, setNearbyJobsStatusFilter] = useState('all');
  const [nearbyJobsColumns, setNearbyJobsColumns] = useState(['jobId', 'clientName', 'phoneNumber', 'status', 'jobType', 'scheduled', 'technician']);
  const [techFilter, setTechFilter] = useState('distance');
  const [technicianAssignmentMode, setTechnicianAssignmentMode] =
    useState("auto");
  const [currentAISuggestionIndex, setCurrentAISuggestionIndex] = useState(0);
  const [customStartTime, setCustomStartTime] = useState("");
  const [customEndTime, setCustomEndTime] = useState("");
  const [formData, setFormData] = useState({
    clientName: "",
    companyName: "",
    phoneNumber: "",
    phoneNumber2: "",
    email: "",
    location: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    jobCategory: "",
    jobType: "",
    jobDescription: "",
    startDate: "",
    endDate: "",
    jobLeadType: "job",
    source: "",
    jobTags: "",
    noteTags: "",
  });

  const totalSteps = 4;

  // Sample technicians data with AI scoring
  const technicians: Technician[] = [
    {
      id: "tech1",
      name: "Mike Rodriguez",
      avatar: "🔧",
      rating: 4.9,
      specialties: ["Plumbing", "HVAC", "Emergency Repairs"],
      location: "Downtown Houston",
      distance: 2.3,
      availability: "available",
      completedJobs: 847,
      responseTime: "8 mins",
      aiScore: 95,
      openJobs: 2,
      closingRate: 92,
      aiReasons: [
        "✅ Available immediately with only 2 active jobs",
        "📍 Closest technician at 2.3 miles from your location",
        "🎯 92% closing rate - high success with similar jobs",
        "🔧 Expert plumber specializing in your service type",
        "⭐ 4.9 rating with 847 completed jobs",
        "⚡ Fastest response time at 8 minutes average",
      ],
    },
    {
      id: "tech2",
      name: "Jennifer Lee",
      avatar: "⚡",
      rating: 4.8,
      specialties: ["Electrical", "Smart Home", "Security Systems"],
      location: "Midtown Houston",
      distance: 3.1,
      availability: "on-route",
      completedJobs: 623,
      responseTime: "12 mins",
      aiScore: 88,
      openJobs: 3,
      closingRate: 89,
      enRouteDistance: 1.2,
      aiReasons: [
        "⚡ Electrical specialist - perfect for your service type",
        "🚗 Currently en route, only 1.2 miles away",
        "🏆 89% closing rate with electrical jobs",
        "📱 Smart home expert for advanced installations",
        "⭐ 4.8 rating with 623 completed jobs",
        "🔄 3 open jobs but manageable workload",
      ],
    },
    {
      id: "tech3",
      name: "David Thompson",
      avatar: "❄️",
      rating: 4.7,
      specialties: ["HVAC", "Refrigeration", "Air Quality"],
      location: "West Houston",
      distance: 4.5,
      availability: "available",
      completedJobs: 734,
      responseTime: "15 mins",
      aiScore: 82,
      openJobs: 1,
      closingRate: 95,
      aiReasons: [
        "❄️ HVAC specialist with 95% closing rate",
        "🌟 Highest closing rate among available technicians",
        "✅ Only 1 active job - good availability",
        "🌡️ Expert in air quality and refrigeration",
        "⭐ 4.7 rating with 734 completed jobs",
        "📍 4.5 miles away - reasonable distance",
      ],
    },
    {
      id: "tech4",
      name: "Sarah Kim",
      avatar: "🔌",
      rating: 4.9,
      specialties: ["General Repairs", "Handyman", "Maintenance"],
      location: "North Houston",
      distance: 6.2,
      availability: "busy",
      completedJobs: 892,
      responseTime: "45 mins",
      aiScore: 75,
      openJobs: 5,
      closingRate: 87,
      aiReasons: [
        "🛠️ Versatile handyman for general repairs",
        "⭐ Highest rating at 4.9 stars",
        "🏆 Most experienced with 892 completed jobs",
        "⚠️ Currently busy with 5 active jobs",
        "📍 6.2 miles away - longer distance",
        "⏱️ 45 minute response time due to workload",
      ],
    },
  ];

  // Enhanced AI scoring algorithm
  const calculateAIScore = (techs: Technician[]) => {
    return techs.map((tech) => {
      let score = 0;

      // Distance scoring (closer = better, max 35 points)
      const maxDistance = Math.max(...techs.map((t) => t.distance));
      const distanceScore = ((maxDistance - tech.distance) / maxDistance) * 35;
      score += distanceScore;

      // Availability scoring (max 25 points)
      if (tech.availability === "available") score += 25;
      else if (tech.availability === "on-route") score += 15;
      else score += 5;

      // Experience/Rating scoring (max 20 points)
      score += (tech.rating / 5) * 10; // Rating portion
      score += Math.min((tech.completedJobs / 1000) * 10, 10); // Experience portion

      // Workload scoring (max 20 points)
      const workloadScore = Math.max(0, 20 - tech.openJobs * 4);
      score += workloadScore;

      return { ...tech, aiScore: Math.min(100, Math.round(score / 3)) };
    });
  };

  const getSortedTechnicians = () => {
    const filtered = technicians.filter(
      (tech) => filterStatuses[tech.availability],
    );

    switch (technicianFilter) {
      case "closest-distance":
        return filtered.sort((a, b) => {
          const aDistance = a.enRouteDistance || a.distance;
          const bDistance = b.enRouteDistance || b.distance;
          return aDistance - bDistance;
        });

      case "matching-skills":
        return filtered.sort((a, b) => {
          const aSkillMatch = a.specialties.some((skill) =>
            skill.toLowerCase().includes(formData.jobCategory?.toLowerCase()),
          );
          const bSkillMatch = b.specialties.some((skill) =>
            skill.toLowerCase().includes(formData.jobCategory?.toLowerCase()),
          );
          return bSkillMatch ? 1 : aSkillMatch ? -1 : 0;
        });

      case "matching-metro":
        return filtered.sort((a, b) => {
          // Sort by location proximity (simple string matching for demo)
          const aMetroMatch = a.location.toLowerCase().includes("houston");
          const bMetroMatch = b.location.toLowerCase().includes("houston");
          return bMetroMatch ? 1 : aMetroMatch ? -1 : 0;
        });

      case "combined":
        return filtered.sort((a, b) => {
          // Combined scoring: distance + skills + metro
          let aScore = 0;
          let bScore = 0;

          // Distance (closer is better)
          aScore += (10 - a.distance) * 2;
          bScore += (10 - b.distance) * 2;

          // Skills match
          const aSkillMatch = a.specialties.some((skill) =>
            skill.toLowerCase().includes(formData.jobCategory?.toLowerCase()),
          );
          const bSkillMatch = b.specialties.some((skill) =>
            skill.toLowerCase().includes(formData.jobCategory?.toLowerCase()),
          );
          if (aSkillMatch) aScore += 10;
          if (bSkillMatch) bScore += 10;

          // Rating
          aScore += a.rating * 2;
          bScore += b.rating * 2;

          // Availability
          if (a.availability === "available") aScore += 8;
          if (b.availability === "available") bScore += 8;
          if (a.availability === "on-route") aScore += 4;
          if (b.availability === "on-route") bScore += 4;

          return bScore - aScore;
        });

      case "all":
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetForm = () => {
    setFormData({
      clientName: "",
      companyName: "",
      phoneNumber: "",
      phoneNumber2: "",
      email: "",
      location: "",
      apartment: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      jobCategory: "",
      jobType: "",
      jobDescription: "",
      startDate: "",
      endDate: "",
      jobLeadType: "job",
      source: "",
      jobTags: "",
      noteTags: "",
    });
    setCurrentStep(1);
    setSelectedTechnician(null);
    setSelectedServiceDate("");
    setSelectedDuration("");
    setCustomStartTime("");
    setCustomEndTime("");
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, title: "Customer Info", icon: User },
      { number: 2, title: "Location", icon: MapPin },
      { number: 3, title: "Service Details", icon: Wrench },
      { number: 4, title: "Schedule & Assign", icon: Calendar },
    ];

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;

          return (
            <div key={step.number} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isActive
                    ? "bg-blue-500 text-white border-blue-500"
                    : isCompleted
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-gray-100 text-gray-400 border-gray-300"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <StepIcon className="w-5 h-5" />
                )}
              </div>
              <div className="ml-3 text-left">
                <p
                  className={`text-sm font-medium ${isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-500"}`}
                >
                  Step {step.number}
                </p>
                <p
                  className={`text-xs ${isActive ? "text-blue-500" : isCompleted ? "text-green-500" : "text-gray-400"}`}
                >
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight
                  className={`w-4 h-4 mx-4 ${isCompleted ? "text-green-500" : "text-gray-300"}`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline w-4 h-4 mr-2" />
            Customer Name *
          </label>
          <Input
            placeholder="Enter full name"
            value={formData.clientName}
            onChange={(e) => updateFormData("clientName", e.target.value)}
            className="bg-white border-2 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building className="inline w-4 h-4 mr-2" />
            Company Name
          </label>
          <Input
            placeholder="Business or company name"
            value={formData.companyName}
            onChange={(e) => updateFormData("companyName", e.target.value)}
            className="bg-white border-2 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="inline w-4 h-4 mr-2" />
            Phone Number *
          </label>
          <Input
            placeholder="+1 (555) 123-4567"
            value={formData.phoneNumber}
            onChange={(e) => updateFormData("phoneNumber", e.target.value)}
            className="bg-white border-2 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="inline w-4 h-4 mr-2" />
            Alternate Phone
          </label>
          <Input
            placeholder="+1 (555) 987-6543"
            value={formData.phoneNumber2}
            onChange={(e) => updateFormData("phoneNumber2", e.target.value)}
            className="bg-white border-2 focus:border-blue-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData("email", e.target.value)}
            placeholder="customer@email.com"
            className="bg-white border-2 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline w-4 h-4 mr-2" />
            Service Address *
          </label>
          <Input
            placeholder="123 Main Street"
            value={formData.location}
            onChange={(e) => updateFormData("location", e.target.value)}
            className="bg-white border-2 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Apartment/Unit
          </label>
          <Input
            placeholder="Apt 4B, Suite 100, etc."
            value={formData.apartment}
            onChange={(e) => updateFormData("apartment", e.target.value)}
            className="bg-white border-2 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City *
          </label>
          <Input
            placeholder="Houston"
            value={formData.city}
            onChange={(e) => updateFormData("city", e.target.value)}
            className="bg-white border-2 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State *
          </label>
          <Input
            placeholder="Texas"
            value={formData.state}
            onChange={(e) => updateFormData("state", e.target.value)}
            className="bg-white border-2 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ZIP Code
          </label>
          <Input
            placeholder="77001"
            value={formData.zipCode}
            onChange={(e) => updateFormData("zipCode", e.target.value)}
            className="bg-white border-2 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Wrench className="w-4 h-4 mr-2 text-blue-500" />
            Service Category *
          </label>
          <Select
            value={formData.jobCategory}
            onValueChange={(value) => updateFormData("jobCategory", value)}
          >
            <SelectTrigger className="bg-white border-2 focus:border-blue-500">
              <SelectValue placeholder="Choose service type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="plumbing">🚰 Plumbing</SelectItem>
              <SelectItem value="electrical">⚡ Electrical</SelectItem>
              <SelectItem value="hvac">❄️ HVAC</SelectItem>
              <SelectItem value="appliance">🏠 Appliance Repair</SelectItem>
              <SelectItem value="locksmith">🔐 Locksmith</SelectItem>
              <SelectItem value="handyman">🔨 Handyman</SelectItem>
              <SelectItem value="cleaning">🧽 Cleaning</SelectItem>
              <SelectItem value="pest-control">🐛 Pest Control</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Type *
          </label>
          <Select
            value={formData.jobType}
            onValueChange={(value) => updateFormData("jobType", value)}
          >
            <SelectTrigger className="bg-white border-2 focus:border-blue-500">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="installation">🔧 Installation</SelectItem>
              <SelectItem value="repair">🛠️ Repair</SelectItem>
              <SelectItem value="maintenance">⚙️ Maintenance</SelectItem>
              <SelectItem value="inspection">🔍 Inspection</SelectItem>
              <SelectItem value="emergency">🚨 Emergency Service</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Description *
          </label>
          <Textarea
            rows={4}
            placeholder="Describe the problem or service needed in detail. The more information you provide, the better we can help!"
            value={formData.jobDescription}
            onChange={(e) => updateFormData("jobDescription", e.target.value)}
            className="bg-white border-2 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Type
          </label>
          <Select
            value={formData.jobLeadType || "job"}
            onValueChange={(value) => updateFormData("jobLeadType", value)}
          >
            <SelectTrigger className="bg-white border-2 focus:border-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="job">🔧 Job</SelectItem>
              <SelectItem value="lead">💼 Lead</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lead Source
          </label>
          <Select
            value={formData.source || ""}
            onValueChange={(value) => updateFormData("source", value)}
          >
            <SelectTrigger className="bg-white border-2 focus:border-blue-500">
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yelp">📱 Yelp</SelectItem>
              <SelectItem value="google-ads">🔍 Google Ads</SelectItem>
              <SelectItem value="facebook">📘 Facebook</SelectItem>
              <SelectItem value="referral">🤝 Referral</SelectItem>
              <SelectItem value="website">🌐 Website</SelectItem>
              <SelectItem value="phone">📞 Direct Call</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Tags
          </label>
          <Select
            value={formData.jobTags || ""}
            onValueChange={(value) => updateFormData("jobTags", value)}
          >
            <SelectTrigger className="bg-white border-2 focus:border-blue-500">
              <SelectValue placeholder="Add job tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="urgent">🚨 Urgent</SelectItem>
              <SelectItem value="warranty">🛡️ Warranty</SelectItem>
              <SelectItem value="follow-up">🔄 Follow-up</SelectItem>
              <SelectItem value="inspection">🔍 Inspection</SelectItem>
              <SelectItem value="emergency">⚡ Emergency</SelectItem>
              <SelectItem value="maintenance">⚙️ Maintenance</SelectItem>
              <SelectItem value="installation">🔧 Installation</SelectItem>
              <SelectItem value="repair">🛠️ Repair</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note Tags
          </label>
          <Select
            value={formData.noteTags || ""}
            onValueChange={(value) => updateFormData("noteTags", value)}
          >
            <SelectTrigger className="bg-white border-2 focus:border-blue-500">
              <SelectValue placeholder="Add note tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer-notes">👤 Customer Notes</SelectItem>
              <SelectItem value="special-access">🔑 Special Access</SelectItem>
              <SelectItem value="equipment">🛠️ Equipment Needed</SelectItem>
              <SelectItem value="safety-concern">⚠️ Safety Concern</SelectItem>
              <SelectItem value="follow-up-required">
                📞 Follow-up Required
              </SelectItem>
              <SelectItem value="parts-needed">🔩 Parts Needed</SelectItem>
              <SelectItem value="schedule-conflict">
                📅 Schedule Conflict
              </SelectItem>
              <SelectItem value="payment-issue">💳 Payment Issue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-8">
      {/* Service Date Selection */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          📅 Service Date & Time
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Date *
            </label>
            <Input
              type="date"
              value={formData.startDate ? formData.startDate.split("T")[0] : ""}
              onChange={(e) => {
                updateFormData("startDate", e.target.value);
                setSelectedServiceDate(e.target.value);
                // Auto-select end date if empty or before start date
                if (!formData.endDate || new Date(e.target.value) > new Date(formData.endDate)) {
                  updateFormData("endDate", e.target.value);
                }
              }}
              min={new Date().toISOString().split("T")[0]}
              className="bg-white border-2 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date (Optional)
            </label>
            <Input
              type="date"
              value={formData.endDate ? formData.endDate.split("T")[0] : ""}
              onChange={(e) => updateFormData("endDate", e.target.value)}
              min={formData.startDate || new Date().toISOString().split("T")[0]}
              className="bg-white border-2 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Time Slot Selection */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          ⏰ Time Slot Selection
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            "8:00 AM - 10:00 AM",
            "10:00 AM - 12:00 PM",
            "12:00 PM - 2:00 PM",
            "2:00 PM - 4:00 PM",
            "4:00 PM - 6:00 PM",
            "6:00 PM - 8:00 PM",
            "Emergency (ASAP)",
            "Flexible",
            "Custom Time",
          ].map((timeSlot) => (
            <Button
              key={timeSlot}
              variant={selectedDuration === timeSlot ? "default" : "outline"}
              className={`p-3 text-sm ${
                selectedDuration === timeSlot
                  ? "bg-blue-500 text-white"
                  : "bg-white hover:bg-blue-50"
              }`}
              onClick={() => {
                setSelectedDuration(timeSlot);
                if (timeSlot !== "Custom Time") {
                  setCustomStartTime("");
                  setCustomEndTime("");
                }
              }}
              onDoubleClick={() => {
                setSelectedDuration("");
                setCustomStartTime("");
                setCustomEndTime("");
              }}
            >
              {timeSlot}
            </Button>
          ))}
        </div>

        {/* Custom Time Inputs */}
        {selectedDuration === "Custom Time" && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-3">Set Custom Time</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <Input
                  type="time"
                  value={customStartTime}
                  onChange={(e) => setCustomStartTime(e.target.value)}
                  className="bg-white border-2 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <Input
                  type="time"
                  value={customEndTime}
                  onChange={(e) => setCustomEndTime(e.target.value)}
                  className="bg-white border-2 focus:border-blue-500"
                />
              </div>
            </div>
            <p className="text-sm text-blue-700 mt-2">
              💡 Enter your preferred start and end times for this service
              appointment.
            </p>
          </div>
        )}

        {selectedDuration && selectedDuration !== "Custom Time" && (
          <p className="text-sm text-gray-600 mt-2">
            Selected: {selectedDuration}. Double-click to remove selection.
          </p>
        )}

        {selectedDuration === "Custom Time" &&
          customStartTime &&
          customEndTime && (
            <p className="text-sm text-green-600 mt-2">
              ✅ Custom time set: {customStartTime} - {customEndTime}
            </p>
          )}
      </div>

      {/* Technician Assignment Mode Toggle */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          📅 Schedule & Assign Technician
        </h3>
        <div className="flex items-center bg-gray-100 rounded-lg p-1 mb-6 w-fit">
          <Button
            variant={technicianAssignmentMode === "auto" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTechnicianAssignmentMode("auto")}
            className={`text-xs ${technicianAssignmentMode === "auto" ? "bg-white shadow-sm" : ""}`}
          >
            🤖 AI Auto-Assign
          </Button>
          <Button
            variant={
              technicianAssignmentMode === "manual" ? "default" : "ghost"
            }
            size="sm"
            onClick={() => setTechnicianAssignmentMode("manual")}
            className={`text-xs ${technicianAssignmentMode === "manual" ? "bg-white shadow-sm" : ""}`}
          >
            👤 Manual Select
          </Button>
        </div>

        {technicianAssignmentMode === "auto" ? (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-green-800">
                  AI Auto-Assignment Enabled
                </h4>
                <p className="text-sm text-green-700">
                  Our AI will automatically assign the best technician based on
                  location, skills, and availability.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h5 className="font-medium text-gray-900 mb-2">
                Assignment Criteria:
              </h5>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>📍 Closest available technician</li>
                <li>🔧 Matching skills and experience</li>
                <li>⭐ High customer ratings</li>
                <li>📱 Fast response time</li>
                <li>💼 Current workload balance</li>
              </ul>
            </div>
          </div>
        ) : (
          <div>
            {/* AI Sorting Toggle */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  🤖 AI Recommendations:
                </label>
                <Button
                  variant={aiSortingActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAiSortingActive(!aiSortingActive)}
                  className="text-xs"
                >
                  {aiSortingActive ? "✅ Enabled" : "❌ Disabled"}
                </Button>
              </div>

              {/* Technician Sorting */}
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Sort by:</label>
                <Select
                  value={technicianFilter}
                  onValueChange={setTechnicianFilter}
                >
                  <SelectTrigger className="w-40 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="w-80">
                    <SelectItem value="closest-distance">
                      <div className="flex items-center py-1">
                        <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="font-medium">Closest Distance</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="matching-skills">
                      <div className="flex items-center py-1">
                        <Target className="w-4 h-4 mr-2 text-green-500" />
                        <span className="font-medium">Matching Skills</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="matching-metro">
                      <div className="flex items-center py-1">
                        <Building className="w-4 h-4 mr-2 text-purple-500" />
                        <span className="font-medium">Same Metro Area</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="combined">
                      <div className="flex items-center py-1">
                        <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                        <span className="font-medium">
                          Combined (Distance + Skills + Rating)
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="all">
                      <div className="flex items-center py-1">
                        <UserCheck className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-medium">All Technicians</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Availability Filter */}
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-sm font-medium text-gray-700">
                Filter by availability:
              </span>
              {Object.entries(filterStatuses).map(([status, enabled]) => (
                <Button
                  key={status}
                  variant={enabled ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setFilterStatuses((prev) => ({
                      ...prev,
                      [status]: !enabled,
                    }))
                  }
                  className="text-xs"
                >
                  {status === "available" && "✅ Available"}
                  {status === "on-route" && "🚗 En Route"}
                  {status === "busy" && "⏳ Busy"}
                </Button>
              ))}
            </div>

            {/* Technician List */}
            <div className="space-y-4" ref={scrollRef}>
              {getSortedTechnicians().length > 0 ? (
                getSortedTechnicians().map((technician) => {
                  const isSelected = selectedTechnician === technician.id;
                  const aiRecommended =
                    aiSortingActive && technician.aiScore >= 85;

                  return (
                    <div
                      key={technician.id}
                      className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      } ${aiRecommended ? "ring-2 ring-yellow-300 ring-opacity-50" : ""}`}
                      onClick={() => setSelectedTechnician(technician.id)}
                    >
                      {aiRecommended && (
                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                          🤖 AI Pick
                        </div>
                      )}

                      <div className="flex items-start space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                            {technician.avatar}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-gray-900">
                                {technician.name}
                              </h4>
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm font-medium">
                                  {technician.rating}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {aiSortingActive && (
                                <Badge
                                  variant="outline"
                                  className="bg-purple-50 text-purple-700 border-purple-200"
                                >
                                  🧠 AI Score: {technician.aiScore}%
                                </Badge>
                              )}
                              <Badge
                                className={
                                  technician.availability === "available"
                                    ? "bg-green-100 text-green-800"
                                    : technician.availability === "on-route"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-orange-100 text-orange-800"
                                }
                              >
                                {technician.availability === "available"
                                  ? "✅ Available"
                                  : technician.availability === "on-route"
                                    ? "🚗 En Route"
                                    : "⏳ Busy"}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                              <span>
                                {technician.enRouteDistance
                                  ? `${technician.enRouteDistance} mi (en route)`
                                  : `${technician.distance} mi away`}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1 text-gray-400" />
                              <span>~{technician.responseTime} response</span>
                            </div>
                            <div className="flex items-center">
                              <CheckCircle className="w-4 h-4 mr-1 text-gray-400" />
                              <span>{technician.completedJobs} jobs done</span>
                            </div>
                            <div className="flex items-center">
                              <AlertCircle className="w-4 h-4 mr-1 text-gray-400" />
                              <span>{technician.openJobs} active jobs</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-3">
                            {technician.specialties.map((specialty) => (
                              <Badge
                                key={specialty}
                                variant="outline"
                                className="text-xs bg-gray-50"
                              >
                                {specialty}
                              </Badge>
                            ))}
                          </div>

                          {aiSortingActive && technician.aiReasons && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <h5 className="text-xs font-medium text-gray-700 mb-2">
                                🤖 AI Analysis:
                              </h5>
                              <div className="space-y-1">
                                {technician.aiReasons
                                  .slice(0, 3)
                                  .map((reason, index) => (
                                    <p
                                      key={index}
                                      className="text-xs text-gray-600"
                                    >
                                      {reason}
                                    </p>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No technicians match the current filters</p>
                  <p className="text-sm">Try adjusting your filter settings</p>
                </div>
              )}
            </div>

            {/* Nearby Jobs Section */}
            {selectedTechnician && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    🗺️ Nearby Jobs for Decision Making
                  </h3>
                  <div className="flex items-center space-x-2">
                    <label className="text-xs text-gray-600">
                      Filter by status:
                    </label>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {nearbyJobs.map((job) => (
                    <Card
                      key={job.id}
                      className="border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm text-blue-600">
                            {job.id}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Badge
                              className={
                                job.status === "In Progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : job.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                              }
                            >
                              {job.status}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={
                                job.priority === "High"
                                  ? "border-red-200 text-red-700"
                                  : job.priority === "Medium"
                                    ? "border-yellow-200 text-yellow-700"
                                    : "border-gray-200 text-gray-700"
                              }
                            >
                              {job.priority}
                            </Badge>
                          </div>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">
                          {job.client}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {job.service}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {job.distance} mi
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {job.timeRemaining}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderSingleScreen = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column */}
      <div className="space-y-8">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Enter full name"
                value={formData.clientName}
                onChange={(e) => updateFormData("clientName", e.target.value)}
                className="bg-white border-2 focus:border-blue-500"
              />
              <Input
                placeholder="Business or company name"
                value={formData.companyName}
                onChange={(e) => updateFormData("companyName", e.target.value)}
                className="bg-white border-2 focus:border-blue-500"
              />
              <Input
                placeholder="+1 (555) 123-4567"
                value={formData.phoneNumber}
                onChange={(e) => updateFormData("phoneNumber", e.target.value)}
                className="bg-white border-2 focus:border-blue-500"
              />
              <Input
                placeholder="+1 (555) 987-6543"
                value={formData.phoneNumber2}
                onChange={(e) => updateFormData("phoneNumber2", e.target.value)}
                className="bg-white border-2 focus:border-blue-500"
              />
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                placeholder="customer@email.com"
                className="bg-white border-2 focus:border-blue-500 md:col-span-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Service Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="123 Main Street"
              value={formData.location}
              onChange={(e) => updateFormData("location", e.target.value)}
              className="bg-white border-2 focus:border-blue-500"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Apt 4B, Suite 100"
                value={formData.apartment}
                onChange={(e) => updateFormData("apartment", e.target.value)}
                className="bg-white border-2 focus:border-blue-500"
              />
              <Input
                placeholder="Houston"
                value={formData.city}
                onChange={(e) => updateFormData("city", e.target.value)}
                className="bg-white border-2 focus:border-blue-500"
              />
              <Input
                placeholder="Texas"
                value={formData.state}
                onChange={(e) => updateFormData("state", e.target.value)}
                className="bg-white border-2 focus:border-blue-500"
              />
              <Input
                placeholder="77001"
                value={formData.zipCode}
                onChange={(e) => updateFormData("zipCode", e.target.value)}
                className="bg-white border-2 focus:border-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Service Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wrench className="w-5 h-5 mr-2" />
              Service Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                value={formData.jobCategory}
                onValueChange={(value) => updateFormData("jobCategory", value)}
              >
                <SelectTrigger className="bg-white border-2 focus:border-blue-500">
                  <SelectValue placeholder="Service category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plumbing">🚰 Plumbing</SelectItem>
                  <SelectItem value="electrical">⚡ Electrical</SelectItem>
                  <SelectItem value="hvac">❄️ HVAC</SelectItem>
                  <SelectItem value="appliance">🏠 Appliance Repair</SelectItem>
                  <SelectItem value="locksmith">🔐 Locksmith</SelectItem>
                  <SelectItem value="handyman">🔨 Handyman</SelectItem>
                  <SelectItem value="cleaning">🧽 Cleaning</SelectItem>
                  <SelectItem value="pest-control">🐛 Pest Control</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={formData.jobType}
                onValueChange={(value) => updateFormData("jobType", value)}
              >
                <SelectTrigger className="bg-white border-2 focus:border-blue-500">
                  <SelectValue placeholder="Service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="installation">🔧 Installation</SelectItem>
                  <SelectItem value="repair">🛠️ Repair</SelectItem>
                  <SelectItem value="maintenance">⚙️ Maintenance</SelectItem>
                  <SelectItem value="inspection">🔍 Inspection</SelectItem>
                  <SelectItem value="emergency">🚨 Emergency Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Textarea
              rows={3}
              placeholder="Describe the problem or service needed in detail..."
              value={formData.jobDescription}
              onChange={(e) => updateFormData("jobDescription", e.target.value)}
              className="bg-white border-2 focus:border-blue-500"
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                value={formData.jobLeadType || "job"}
                onValueChange={(value) => updateFormData("jobLeadType", value)}
              >
                <SelectTrigger className="bg-white border-2 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="job">🔧 Job</SelectItem>
                  <SelectItem value="lead">💼 Lead</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={formData.source || ""}
                onValueChange={(value) => updateFormData("source", value)}
              >
                <SelectTrigger className="bg-white border-2 focus:border-blue-500">
                  <SelectValue placeholder="Lead source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yelp">📱 Yelp</SelectItem>
                  <SelectItem value="google-ads">🔍 Google Ads</SelectItem>
                  <SelectItem value="facebook">📘 Facebook</SelectItem>
                  <SelectItem value="referral">🤝 Referral</SelectItem>
                  <SelectItem value="website">🌐 Website</SelectItem>
                  <SelectItem value="phone">📞 Direct Call</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                value={formData.jobTags || ""}
                onValueChange={(value) => updateFormData("jobTags", value)}
              >
                <SelectTrigger className="bg-white border-2 focus:border-blue-500">
                  <SelectValue placeholder="Job tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">🚨 Urgent</SelectItem>
                  <SelectItem value="warranty">🛡️ Warranty</SelectItem>
                  <SelectItem value="follow-up">🔄 Follow-up</SelectItem>
                  <SelectItem value="inspection">🔍 Inspection</SelectItem>
                  <SelectItem value="emergency">⚡ Emergency</SelectItem>
                  <SelectItem value="maintenance">⚙️ Maintenance</SelectItem>
                  <SelectItem value="installation">🔧 Installation</SelectItem>
                  <SelectItem value="repair">🛠️ Repair</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={formData.noteTags || ""}
                onValueChange={(value) => updateFormData("noteTags", value)}
              >
                <SelectTrigger className="bg-white border-2 focus:border-blue-500">
                  <SelectValue placeholder="Add note tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer-notes">👤 Customer Notes</SelectItem>
                  <SelectItem value="special-access">🔑 Special Access</SelectItem>
                  <SelectItem value="equipment">🛠️ Equipment Needed</SelectItem>
                  <SelectItem value="safety-concern">⚠️ Safety Concern</SelectItem>
                  <SelectItem value="follow-up-required">
                    📞 Follow-up Required
                  </SelectItem>
                  <SelectItem value="parts-needed">🔩 Parts Needed</SelectItem>
                  <SelectItem value="schedule-conflict">
                    📅 Schedule Conflict
                  </SelectItem>
                  <SelectItem value="payment-issue">💳 Payment Issue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="space-y-8">
        {/* Schedule & Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Schedule & Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Switches for no schedule and no technician */}
            <div className="flex items-center gap-6 mb-4">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={noSchedule}
                  onChange={() => setNoSchedule(!noSchedule)}
                />
                Create without scheduling
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={noTechnician}
                  onChange={() => setNoTechnician(!noTechnician)}
                />
                Create without assigning technician
              </label>
            </div>

            {/* ...existing schedule/assignment UI, but disable or hide if noSchedule/noTechnician... */}
            {!noSchedule && (
              <>
            {/* Service Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Date *
                </label>
                <Input
                  type="date"
                      value={formData.startDate ? formData.startDate.split("T")[0] : ""}
                  onChange={(e) => {
                    updateFormData("startDate", e.target.value);
                    setSelectedServiceDate(e.target.value);
                        // Auto-select end date if empty or before start date
                        if (!formData.endDate || new Date(e.target.value) > new Date(formData.endDate)) {
                          updateFormData("endDate", e.target.value);
                        }
                  }}
                  min={new Date().toISOString().split("T")[0]}
                  className="bg-white border-2 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date (Optional)
                </label>
                <Input
                  type="date"
                  value={formData.endDate ? formData.endDate.split("T")[0] : ""}
                  onChange={(e) => updateFormData("endDate", e.target.value)}
                      min={formData.startDate || new Date().toISOString().split("T")[0]}
                  className="bg-white border-2 focus:border-blue-500"
                />
              </div>
            </div>

                {/* Time Slot Selection - visually improved */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Time Slot
              </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  "8:00 AM - 10:00 AM",
                  "10:00 AM - 12:00 PM",
                  "12:00 PM - 2:00 PM",
                  "2:00 PM - 4:00 PM",
                  "4:00 PM - 6:00 PM",
                  "6:00 PM - 8:00 PM",
                  "Emergency (ASAP)",
                  "Flexible",
                  "Custom Time",
                ].map((timeSlot) => (
                  <Button
                    key={timeSlot}
                        variant={selectedDuration === timeSlot ? "default" : "outline"}
                        className={`p-3 text-sm rounded-lg shadow-sm border-2 transition-all duration-150 ${
                      selectedDuration === timeSlot
                            ? "bg-blue-500 text-white border-blue-500 scale-105"
                            : "bg-white hover:bg-blue-50 border-gray-200"
                    }`}
                    onClick={() => {
                      setSelectedDuration(timeSlot);
                      if (timeSlot !== "Custom Time") {
                        setCustomStartTime("");
                        setCustomEndTime("");
                      }
                    }}
                    onDoubleClick={() => {
                      setSelectedDuration("");
                      setCustomStartTime("");
                      setCustomEndTime("");
                    }}
                  >
                    {timeSlot}
                  </Button>
                ))}
              </div>

              {/* Custom Time Inputs for Single Screen */}
              {selectedDuration === "Custom Time" && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2 text-sm">
                    Set Custom Time
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Start Time *
                      </label>
                      <Input
                        type="time"
                        value={customStartTime}
                        onChange={(e) => setCustomStartTime(e.target.value)}
                        className="bg-white border-2 focus:border-blue-500 h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        End Time *
                      </label>
                      <Input
                        type="time"
                        value={customEndTime}
                        onChange={(e) => setCustomEndTime(e.target.value)}
                        className="bg-white border-2 focus:border-blue-500 h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

                {/* Appointment Preview Card */}
                <div className="mt-4">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="py-3 px-4 flex items-center gap-4">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="text-sm text-blue-900 font-semibold">
                          {formData.startDate
                            ? new Date(formData.startDate).toLocaleDateString()
                            : "No date selected"}
                        </div>
                        <div className="text-xs text-blue-700">
                          {selectedDuration && selectedDuration !== "Custom Time"
                            ? selectedDuration
                            : selectedDuration === "Custom Time" && customStartTime && customEndTime
                            ? `${customStartTime} - ${customEndTime}`
                            : "No time selected"}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
            {!noTechnician && (
              // ...existing technician assignment UI (AI/manual, tech list, nearby jobs, etc.)
              <>
            {/* Technician Assignment Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Assignment Method
              </label>
              <div className="flex items-center bg-gray-100 rounded-lg p-1 mb-4 w-fit">
                <Button
                  variant={
                    technicianAssignmentMode === "auto" ? "default" : "ghost"
                  }
                  size="sm"
                  onClick={() => setTechnicianAssignmentMode("auto")}
                  className={`text-xs ${technicianAssignmentMode === "auto" ? "bg-white shadow-sm" : ""}`}
                >
                  🤖 AI Auto
                </Button>
                <Button
                  variant={
                    technicianAssignmentMode === "manual" ? "default" : "ghost"
                  }
                  size="sm"
                  onClick={() => setTechnicianAssignmentMode("manual")}
                  className={`text-xs ${technicianAssignmentMode === "manual" ? "bg-white shadow-sm" : ""}`}
                >
                  👤 Manual
                </Button>
              </div>

              {technicianAssignmentMode === "auto" ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    🤖 AI will automatically assign the best technician based on
                    location, skills, and availability.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Technician Filters */}
                  <div className="flex items-center space-x-2">
                    <Select
                      value={technicianFilter}
                      onValueChange={setTechnicianFilter}
                    >
                      <SelectTrigger className="text-xs h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="closest-distance">
                          <span className="text-sm ml-5">Closest Distance</span>
                        </SelectItem>
                        <SelectItem value="matching-skills">
                          <span className="text-sm ml-5">Matching Skills</span>
                        </SelectItem>
                        <SelectItem value="matching-metro">
                          <span className="text-sm ml-5">Matching Metro</span>
                        </SelectItem>
                        <SelectItem value="combined">
                          <span className="text-sm ml-5">Combined Score</span>
                        </SelectItem>
                        <SelectItem value="all">
                          <span className="text-sm ml-5">All</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Technician Cards */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {getSortedTechnicians().map((technician) => {
                      const isSelected = selectedTechnician === technician.id;
                      return (
                        <div
                          key={technician.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedTechnician(technician.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                                {technician.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {technician.name}
                                </p>
                                <Badge
                                  className={
                                    technician.availability === "available"
                                      ? "bg-green-100 text-green-800"
                                      : technician.availability === "on-route"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-orange-100 text-orange-800"
                                  }
                                >
                                  {technician.availability === "available"
                                    ? "Available"
                                    : technician.availability === "on-route"
                                      ? "En Route"
                                      : "Busy"}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                <span>⭐ {technician.rating}</span>
                                <span>📍 {technician.distance} mi</span>
                                <span>⏱️ {technician.responseTime}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Nearby Jobs for Manual Assignment */}
            {technicianAssignmentMode === "manual" && selectedTechnician && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    Nearby Jobs
                  </label>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-32 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {nearbyJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{job.id}</span>
                        <Badge
                          className={
                            job.status === "In Progress"
                              ? "bg-blue-100 text-blue-800"
                              : job.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                          }
                        >
                          {job.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-900">{job.client}</p>
                      <p className="text-xs text-gray-600">{job.service}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                        <span>📍 {job.distance} mi</span>
                        <span>⏱️ {job.timeRemaining}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
              </>
            )}

            {/* AI Suggested Technicians */}
            <div>
              <h4 className="text-base font-semibold text-blue-700 mb-2 flex items-center">
                🤖 AI Suggested Technicians
              </h4>
              <div className="space-y-2">
                {getSortedTechnicians().filter(t => t.aiScore >= 85).length === 0 && (
                  <div className="text-gray-500 text-sm">No AI suggestions for this job.</div>
                )}
                {getSortedTechnicians().filter(t => t.aiScore >= 85).map(technician => (
                  <div
                    key={technician.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all bg-yellow-50 border-yellow-300 ${selectedTechnician === technician.id ? 'ring-2 ring-blue-400' : ''}`}
                    onClick={() => setSelectedTechnician(technician.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">{technician.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">{technician.name}</p>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-yellow-400 text-yellow-900">AI Suggested</Badge>
                            <Popover open={openWhyTechId === technician.id} onOpenChange={open => setOpenWhyTechId(open ? technician.id : null)}>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="w-6 h-6 p-0" onClick={e => { e.stopPropagation(); setOpenWhyTechId(technician.id); }}>
                                  <span className="sr-only">Why?</span>
                                  <AlertCircle className="w-4 h-4 text-yellow-700" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent align="end" className="max-w-xs text-xs text-gray-800">
                                <div className="font-semibold mb-1">Why this tech?</div>
                                <ul className="list-disc pl-4 space-y-1">
                                  {technician.aiReasons && technician.aiReasons.length > 0 ? (
                                    technician.aiReasons.map((reason, i) => <li key={i}>{reason}</li>)
                                  ) : (
                                    <li>No specific reason provided.</li>
                                  )}
                                </ul>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span>⭐ {technician.rating}</span>
                          <span>📍 {technician.distance} mi</span>
                          <span>⏱️ {technician.responseTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Nearby Jobs Section */}
            <div>
              <h4 className="text-base font-semibold text-blue-700 mb-2 flex items-center">
                📍 Nearby Jobs
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {nearbyJobs.length === 0 && (
                  <div className="text-gray-500 text-sm">No nearby jobs found.</div>
                )}
                {nearbyJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{job.id}</span>
                      <Badge
                        className={
                          job.status === "In Progress"
                            ? "bg-blue-100 text-blue-800"
                            : job.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }
                      >
                        {job.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-900">{job.client}</p>
                    <p className="text-xs text-gray-600">{job.service}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                      <span>📍 {job.distance} mi</span>
                      <span>⏱️ {job.timeRemaining}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Sample jobs data for dispatch board
  const [jobs, setJobs] = useState([
    {
      id: "J-2024-001",
      clientName: "Sarah Wilson",
      companyName: "Wilson Residence",
      phoneNumber: "+1 (555) 123-4567",
      email: "sarah.wilson@email.com",
      location: "123 Main St",
      city: "Houston",
      state: "TX",
      zipCode: "77001",
      jobCategory: "Plumbing",
      jobType: "Repair",
      jobDescription: "Kitchen sink clogged, water backing up into dishwasher",
      status: "In Progress",
      priority: "High",
      assignedTechnician: "Mike Rodriguez",
      technicianAvatar: "🔧",
      startDate: "2024-01-15",
      startTime: "09:00",
      estimatedDuration: "2 hours",
      actualStartTime: "09:15",
      estimatedEndTime: "11:15",
      source: "yelp",
      jobTags: ["urgent", "warranty"],
      noteTags: ["customer-notes"],
      distance: 2.3,
      revenue: 285.00,
      customerRating: 4.9,
      lastUpdated: "2024-01-15T10:30:00Z",
      createdAt: "2024-01-15T08:00:00Z",
      updatedAt: "2024-01-15T10:30:00Z",
      photos: ["sink1.jpg", "sink2.jpg"],
      notes: "Customer mentioned this is the second time this month. May need to replace pipes.",
      partsNeeded: ["PVC pipe", "Drain cleaner"],
      specialInstructions: "Enter through back gate, dog in yard",
    },
    {
      id: "J-2024-002",
      clientName: "Mike Chen",
      companyName: "Chen Family Home",
      phoneNumber: "+1 (555) 987-6543",
      email: "mike.chen@email.com",
      location: "456 Oak Ave",
      city: "Houston",
      state: "TX",
      zipCode: "77002",
      jobCategory: "HVAC",
      jobType: "Maintenance",
      jobDescription: "Annual AC maintenance and filter replacement",
      status: "Scheduled",
      priority: "Medium",
      assignedTechnician: "Jennifer Lee",
      technicianAvatar: "⚡",
      startDate: "2024-01-15",
      startTime: "14:00",
      estimatedDuration: "1.5 hours",
      estimatedEndTime: "15:30",
      source: "website",
      jobTags: ["maintenance"],
      noteTags: ["follow-up-required"],
      distance: 3.1,
      revenue: 195.00,
      customerRating: 4.8,
      lastUpdated: "2024-01-15T08:45:00Z",
      notes: "Customer prefers afternoon appointments",
      specialInstructions: "Park in driveway, ring doorbell twice",
    },
    {
      id: "J-2024-003",
      clientName: "Lisa Garcia",
      companyName: "Garcia Business Center",
      phoneNumber: "+1 (555) 456-7890",
      email: "lisa.garcia@business.com",
      location: "789 Business Blvd",
      city: "Houston",
      state: "TX",
      zipCode: "77003",
      jobCategory: "Electrical",
      jobType: "Installation",
      jobDescription: "Install new LED lighting system in office",
      status: "Pending",
      priority: "Low",
      assignedTechnician: "David Thompson",
      technicianAvatar: "⚡",
      startDate: "2024-01-16",
      startTime: "10:00",
      estimatedDuration: "4 hours",
      estimatedEndTime: "14:00",
      source: "referral",
      jobTags: ["installation"],
      noteTags: ["equipment"],
      distance: 4.2,
      revenue: 850.00,
      customerRating: 5.0,
      lastUpdated: "2024-01-15T09:20:00Z",
      notes: "Large office space, need to coordinate with building management",
      partsNeeded: ["LED panels", "Wiring", "Dimmer switches"],
      specialInstructions: "Check in with security desk, building access required",
    },
    {
      id: "J-2024-004",
      clientName: "Robert Johnson",
      companyName: "Johnson Office",
      phoneNumber: "+1 (555) 321-6540",
      email: "robert.johnson@office.com",
      location: "321 Corporate Dr",
      city: "Houston",
      state: "TX",
      zipCode: "77004",
      jobCategory: "Plumbing",
      jobType: "Emergency",
      jobDescription: "Burst pipe in basement, water damage",
      status: "In Progress",
      priority: "High",
      assignedTechnician: "Mike Rodriguez",
      technicianAvatar: "🔧",
      startDate: "2024-01-15",
      startTime: "11:00",
      estimatedDuration: "3 hours",
      actualStartTime: "11:30",
      estimatedEndTime: "14:30",
      source: "phone",
      jobTags: ["emergency", "urgent"],
      noteTags: ["insurance"],
      distance: 1.8,
      revenue: 450.00,
      customerRating: 4.7,
      lastUpdated: "2024-01-15T12:00:00Z",
      createdAt: "2024-01-15T10:45:00Z",
      updatedAt: "2024-01-15T12:00:00Z",
      notes: "Insurance claim filed, customer needs documentation",
      partsNeeded: ["Copper pipe", "Shut-off valve", "Drywall"],
      specialInstructions: "Emergency access through side door",
    },
    {
      id: "J-2024-005",
      clientName: "Emily Davis",
      companyName: "Davis Residence",
      phoneNumber: "+1 (555) 789-0123",
      email: "emily.davis@email.com",
      location: "654 Pine St",
      city: "Houston",
      state: "TX",
      zipCode: "77005",
      jobCategory: "HVAC",
      jobType: "Repair",
      jobDescription: "AC not cooling, thermostat issues",
      status: "Scheduled",
      priority: "Medium",
      assignedTechnician: "Jennifer Lee",
      technicianAvatar: "⚡",
      startDate: "2024-01-16",
      startTime: "13:00",
      estimatedDuration: "2 hours",
      estimatedEndTime: "15:00",
      source: "google-ads",
      jobTags: ["repair"],
      noteTags: ["warranty"],
      distance: 2.7,
      revenue: 320.00,
      customerRating: 4.6,
      lastUpdated: "2024-01-15T10:15:00Z",
      createdAt: "2024-01-15T09:00:00Z",
      updatedAt: "2024-01-15T10:15:00Z",
      notes: "System under warranty, check if covered",
      partsNeeded: ["Thermostat", "Refrigerant"],
      specialInstructions: "Park on street, no driveway access",
    },
    {
      id: "J-2024-006",
      clientName: "James Wilson",
      companyName: "Wilson Manufacturing",
      phoneNumber: "+1 (555) 555-1234",
      email: "james.wilson@manufacturing.com",
      location: "987 Industrial Blvd",
      city: "Houston",
      state: "TX",
      zipCode: "77006",
      jobCategory: "Electrical",
      jobType: "Maintenance",
      jobDescription: "Monthly electrical system inspection",
      status: "Completed",
      priority: "Low",
      assignedTechnician: "David Thompson",
      technicianAvatar: "⚡",
      startDate: "2024-01-14",
      startTime: "08:00",
      estimatedDuration: "1 hour",
      actualStartTime: "08:15",
      estimatedEndTime: "09:15",
      actualEndTime: "09:30",
      source: "contract",
      jobTags: ["maintenance", "contract"],
      noteTags: ["routine"],
      distance: 5.1,
      revenue: 180.00,
      customerRating: 4.9,
      lastUpdated: "2024-01-14T09:30:00Z",
      createdAt: "2024-01-14T07:00:00Z",
      updatedAt: "2024-01-14T09:30:00Z",
      notes: "All systems operating normally",
      partsNeeded: [],
      specialInstructions: "Security clearance required, check in at front desk",
    },
    {
      id: "J-2024-007",
      clientName: "Maria Rodriguez",
      companyName: "Rodriguez Restaurant",
      phoneNumber: "+1 (555) 444-5678",
      email: "maria.rodriguez@restaurant.com",
      location: "555 Food Court",
      city: "Houston",
      state: "TX",
      zipCode: "77007",
      jobCategory: "Plumbing",
      jobType: "Installation",
      jobDescription: "Install commercial dishwasher",
      status: "Pending",
      priority: "Medium",
      assignedTechnician: "Mike Rodriguez",
      technicianAvatar: "🔧",
      startDate: "2024-01-17",
      startTime: "09:00",
      estimatedDuration: "5 hours",
      estimatedEndTime: "14:00",
      source: "referral",
      jobTags: ["installation", "commercial"],
      noteTags: ["equipment"],
      distance: 3.3,
      revenue: 1200.00,
      customerRating: 4.8,
      lastUpdated: "2024-01-15T11:45:00Z",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T11:45:00Z",
      notes: "Equipment delivered, ready for installation",
      partsNeeded: ["Commercial dishwasher", "Plumbing fittings"],
      specialInstructions: "Kitchen access through back door, coordinate with chef",
    },
    {
      id: "J-2024-008",
      clientName: "Thomas Brown",
      companyName: "Brown Residence",
      phoneNumber: "+1 (555) 666-7890",
      email: "thomas.brown@email.com",
      location: "777 Maple Ave",
      city: "Houston",
      state: "TX",
      zipCode: "77008",
      jobCategory: "HVAC",
      jobType: "Installation",
      jobDescription: "New furnace installation",
      status: "Scheduled",
      priority: "High",
      assignedTechnician: "Jennifer Lee",
      technicianAvatar: "⚡",
      startDate: "2024-01-16",
      startTime: "08:00",
      estimatedDuration: "6 hours",
      estimatedEndTime: "14:00",
      source: "website",
      jobTags: ["installation", "new-system"],
      noteTags: ["financing"],
      distance: 2.1,
      revenue: 2800.00,
      customerRating: 4.7,
      lastUpdated: "2024-01-15T14:20:00Z",
      createdAt: "2024-01-15T13:00:00Z",
      updatedAt: "2024-01-15T14:20:00Z",
      notes: "Customer approved financing, equipment ordered",
      partsNeeded: ["Furnace", "Ductwork", "Thermostat"],
      specialInstructions: "Early start, customer will be home all day",
    },
    {
      id: "J-2024-009",
      clientName: "Alex Thompson",
      companyName: "Thompson Residence",
      phoneNumber: "+1 (555) 777-8888",
      email: "alex.thompson@email.com",
      location: "888 Sunset Blvd",
      city: "Houston",
      state: "TX",
      zipCode: "77009",
      jobCategory: "Plumbing",
      jobType: "Emergency",
      jobDescription: "Burst pipe emergency call",
      status: "Submitted",
      priority: "High",
      assignedTechnician: "Mike Rodriguez",
      technicianAvatar: "🔧",
      startDate: "2024-01-15",
      startTime: "16:00",
      estimatedDuration: "2 hours",
      estimatedEndTime: "18:00",
      source: "phone",
      jobTags: ["emergency", "urgent"],
      noteTags: ["insurance"],
      distance: 1.5,
      revenue: 350.00,
      customerRating: 4.5,
      lastUpdated: "2024-01-15T15:30:00Z",
      createdAt: "2024-01-15T15:00:00Z",
      updatedAt: "2024-01-15T15:30:00Z",
      notes: "Emergency call received, customer very distressed",
      partsNeeded: ["Copper pipe", "Shut-off valve"],
      specialInstructions: "Emergency access, customer waiting",
    },
    {
      id: "J-2024-010",
      clientName: "Rachel Green",
      companyName: "Green Office",
      phoneNumber: "+1 (555) 999-0000",
      email: "rachel.green@office.com",
      location: "999 Business Center",
      city: "Houston",
      state: "TX",
      zipCode: "77010",
      jobCategory: "Electrical",
      jobType: "Installation",
      jobDescription: "Office lighting upgrade",
      status: "Not Confirmed",
      priority: "Medium",
      assignedTechnician: "David Thompson",
      technicianAvatar: "⚡",
      startDate: "2024-01-17",
      startTime: "10:00",
      estimatedDuration: "6 hours",
      estimatedEndTime: "16:00",
      source: "website",
      jobTags: ["installation", "commercial"],
      noteTags: ["pending-confirmation"],
      distance: 4.5,
      revenue: 1200.00,
      customerRating: 4.8,
      lastUpdated: "2024-01-15T14:15:00Z",
      createdAt: "2024-01-15T13:45:00Z",
      updatedAt: "2024-01-15T14:15:00Z",
      notes: "Waiting for customer confirmation of appointment",
      partsNeeded: ["LED panels", "Wiring", "Dimmer switches"],
      specialInstructions: "Office hours only, coordinate with reception",
    },
    {
      id: "J-2024-011",
      clientName: "Monica Geller",
      companyName: "Geller Restaurant",
      phoneNumber: "+1 (555) 111-2222",
      email: "monica.geller@restaurant.com",
      location: "111 Food Street",
      city: "Houston",
      state: "TX",
      zipCode: "77011",
      jobCategory: "HVAC",
      jobType: "Repair",
      jobDescription: "Kitchen exhaust system repair",
      status: "Rejected",
      priority: "Low",
      assignedTechnician: "Jennifer Lee",
      technicianAvatar: "⚡",
      startDate: "2024-01-16",
      startTime: "11:00",
      estimatedDuration: "3 hours",
      estimatedEndTime: "14:00",
      source: "yelp",
      jobTags: ["repair", "commercial"],
      noteTags: ["customer-cancelled"],
      distance: 3.8,
      revenue: 450.00,
      customerRating: 4.2,
      lastUpdated: "2024-01-15T13:45:00Z",
      createdAt: "2024-01-15T12:30:00Z",
      updatedAt: "2024-01-15T13:45:00Z",
      notes: "Customer cancelled due to budget constraints",
      partsNeeded: ["Exhaust fan", "Ductwork"],
      specialInstructions: "Kitchen access through back door",
    },
    {
      id: "J-2024-012",
      clientName: "Chandler Bing",
      companyName: "Bing Residence",
      phoneNumber: "+1 (555) 333-4444",
      email: "chandler.bing@email.com",
      location: "333 Comedy Ave",
      city: "Houston",
      state: "TX",
      zipCode: "77012",
      jobCategory: "Plumbing",
      jobType: "Maintenance",
      jobDescription: "Annual plumbing inspection",
      status: "No Answer",
      priority: "Medium",
      assignedTechnician: "Mike Rodriguez",
      technicianAvatar: "🔧",
      startDate: "2024-01-16",
      startTime: "14:00",
      estimatedDuration: "1 hour",
      estimatedEndTime: "15:00",
      source: "referral",
      jobTags: ["maintenance"],
      noteTags: ["no-response"],
      distance: 2.2,
      revenue: 150.00,
      customerRating: 4.6,
      lastUpdated: "2024-01-15T12:30:00Z",
      createdAt: "2024-01-15T11:15:00Z",
      updatedAt: "2024-01-15T12:30:00Z",
      notes: "Customer not responding to calls or messages",
      partsNeeded: [],
      specialInstructions: "Call before arrival",
    },
    {
      id: "J-2024-013",
      clientName: "Joey Tribbiani",
      companyName: "Tribbiani Apartment",
      phoneNumber: "+1 (555) 555-6666",
      email: "joey.tribbiani@email.com",
      location: "555 Actor Lane",
      city: "Houston",
      state: "TX",
      zipCode: "77013",
      jobCategory: "Electrical",
      jobType: "Emergency",
      jobDescription: "Power outage in apartment",
      status: "Canceled",
      priority: "High",
      assignedTechnician: "David Thompson",
      technicianAvatar: "⚡",
      startDate: "2024-01-15",
      startTime: "20:00",
      estimatedDuration: "2 hours",
      estimatedEndTime: "22:00",
      source: "phone",
      jobTags: ["emergency", "urgent"],
      noteTags: ["customer-cancelled"],
      distance: 1.9,
      revenue: 300.00,
      customerRating: 4.3,
      lastUpdated: "2024-01-15T19:30:00Z",
      createdAt: "2024-01-15T19:00:00Z",
      updatedAt: "2024-01-15T19:30:00Z",
      notes: "Customer cancelled - building management resolved issue",
      partsNeeded: ["Circuit breaker", "Wiring"],
      specialInstructions: "Apartment access through main entrance",
    },
    {
      id: "J-2024-014",
      clientName: "Phoebe Buffay",
      companyName: "Buffay Residence",
      phoneNumber: "+1 (555) 777-9999",
      email: "phoebe.buffay@email.com",
      location: "777 Music Street",
      city: "Houston",
      state: "TX",
      zipCode: "77014",
      jobCategory: "HVAC",
      jobType: "Installation",
      jobDescription: "New AC unit installation",
      status: "Confirmed",
      priority: "Medium",
      assignedTechnician: "Jennifer Lee",
      technicianAvatar: "⚡",
      startDate: "2024-01-18",
      startTime: "09:00",
      estimatedDuration: "4 hours",
      estimatedEndTime: "13:00",
      source: "website",
      jobTags: ["installation", "new-system"],
      noteTags: ["confirmed", "called"],
      distance: 3.1,
      revenue: 2200.00,
      customerRating: 4.9,
      lastUpdated: "2024-01-15T16:20:00Z",
      createdAt: "2024-01-15T15:45:00Z",
      updatedAt: "2024-01-15T16:20:00Z",
      notes: "Customer confirmed appointment and payment method",
      partsNeeded: ["AC unit", "Thermostat", "Ductwork"],
      specialInstructions: "Early start, customer will be home",
    },
    {
      id: "J-2024-015",
      clientName: "Ross Geller",
      companyName: "Geller Museum",
      phoneNumber: "+1 (555) 888-1111",
      email: "ross.geller@museum.com",
      location: "888 Museum Drive",
      city: "Houston",
      state: "TX",
      zipCode: "77015",
      jobCategory: "Electrical",
      jobType: "Maintenance",
      jobDescription: "Museum lighting system maintenance",
      status: "Follow Up",
      priority: "Low",
      assignedTechnician: "David Thompson",
      technicianAvatar: "⚡",
      startDate: "2024-01-19",
      startTime: "10:00",
      estimatedDuration: "3 hours",
      estimatedEndTime: "13:00",
      source: "contract",
      jobTags: ["maintenance", "contract"],
      noteTags: ["follow-up-required"],
      distance: 5.2,
      revenue: 400.00,
      customerRating: 4.7,
      lastUpdated: "2024-01-15T17:45:00Z",
      createdAt: "2024-01-15T17:00:00Z",
      updatedAt: "2024-01-15T17:45:00Z",
      notes: "Need to follow up on contract renewal",
      partsNeeded: ["Light bulbs", "Wiring"],
      specialInstructions: "Security clearance required, check in at front desk",
    },
    {
      id: "J-2024-002",
      clientName: "Mike Chen",
      companyName: "Chen Family Home",
      phoneNumber: "+1 (555) 987-6543",
      email: "mike.chen@email.com",
      location: "456 Oak Ave",
      city: "Houston",
      state: "TX",
      zipCode: "77002",
      jobCategory: "HVAC",
      jobType: "Maintenance",
      jobDescription: "Annual AC maintenance and filter replacement",
      status: "Scheduled",
      priority: "Medium",
      assignedTechnician: "Jennifer Lee",
      technicianAvatar: "⚡",
      startDate: "2024-01-15",
      startTime: "14:00",
      estimatedDuration: "1.5 hours",
      estimatedEndTime: "15:30",
      source: "website",
      jobTags: ["maintenance"],
      noteTags: ["follow-up-required"],
      distance: 3.1,
      revenue: 195.00,
      customerRating: 4.8,
      lastUpdated: "2024-01-15T08:45:00Z",
      notes: "Customer prefers afternoon appointments",
      specialInstructions: "Park in driveway, ring doorbell twice",
    },
    {
      id: "J-2024-003",
      clientName: "Lisa Garcia",
      companyName: "Garcia Business Center",
      phoneNumber: "+1 (555) 456-7890",
      email: "lisa.garcia@business.com",
      location: "789 Business Blvd",
      city: "Houston",
      state: "TX",
      zipCode: "77003",
      jobCategory: "Electrical",
      jobType: "Installation",
      jobDescription: "Install new LED lighting system in office",
      status: "Pending",
      priority: "Low",
      assignedTechnician: "David Thompson",
      technicianAvatar: "⚡",
      startDate: "2024-01-16",
      startTime: "10:00",
      estimatedDuration: "4 hours",
      estimatedEndTime: "14:00",
      source: "referral",
      jobTags: ["installation"],
      noteTags: ["equipment"],
      distance: 4.2,
      revenue: 850.00,
      customerRating: 5.0,
      lastUpdated: "2024-01-15T09:20:00Z",
      notes: "Large office space, need to coordinate with building management",
      partsNeeded: ["LED panels", "Wiring", "Dimmer switches"],
      specialInstructions: "Check in with security desk, building access required",
    },
    {
      id: "J-2024-004",
      clientName: "Robert Johnson",
      companyName: "Johnson Residence",
      phoneNumber: "+1 (555) 321-6547",
      email: "robert.johnson@email.com",
      location: "321 Pine St",
      city: "Houston",
      state: "TX",
      zipCode: "77004",
      jobCategory: "Plumbing",
      jobType: "Emergency",
      jobDescription: "Burst pipe in basement, water damage",
      status: "Urgent",
      priority: "Critical",
      assignedTechnician: "Mike Rodriguez",
      technicianAvatar: "🔧",
      startDate: "2024-01-15",
      startTime: "ASAP",
      estimatedDuration: "3 hours",
      actualStartTime: "11:30",
      estimatedEndTime: "14:30",
      source: "phone",
      jobTags: ["emergency", "urgent"],
      noteTags: ["safety-concern"],
      distance: 1.8,
      revenue: 450.00,
      customerRating: 4.7,
      lastUpdated: "2024-01-15T11:30:00Z",
      notes: "Water shut off at main valve, customer very distressed",
      partsNeeded: ["Copper pipe", "Pipe fittings", "Water damage equipment"],
      specialInstructions: "Emergency access - customer will meet at door",
    },
    {
      id: "J-2024-005",
      clientName: "Emily Davis",
      companyName: "Davis Apartment",
      phoneNumber: "+1 (555) 789-0123",
      email: "emily.davis@email.com",
      location: "654 Apartment Dr, Unit 5B",
      city: "Houston",
      state: "TX",
      zipCode: "77005",
      jobCategory: "HVAC",
      jobType: "Repair",
      jobDescription: "AC not cooling, thermostat issues",
      status: "Completed",
      priority: "Medium",
      assignedTechnician: "Jennifer Lee",
      technicianAvatar: "⚡",
      startDate: "2024-01-14",
      startTime: "13:00",
      estimatedDuration: "2 hours",
      actualStartTime: "13:15",
      actualEndTime: "15:00",
      source: "google-ads",
      jobTags: ["repair"],
      noteTags: ["customer-notes"],
      distance: 2.7,
      revenue: 320.00,
      customerRating: 5.0,
      lastUpdated: "2024-01-14T15:00:00Z",
      notes: "Thermostat battery replaced, AC filter cleaned, system working properly",
      partsNeeded: ["Thermostat batteries", "AC filter"],
      specialInstructions: "Apartment complex, parking in visitor spots",
    },
  ]);

  const [dispatchView, setDispatchView] = useState<"board" | "list" | "calendar">("board");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [dispatchTechnicianFilter, setDispatchTechnicianFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("priority");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [activeTab, setActiveTab] = useState('details');
  const [boardStatusFilter, setBoardStatusFilter] = useState<string>('All');
  const [jobDetailsTab, setJobDetailsTab] = useState('details');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showEstimateModal, setShowEstimateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [dataColumn, setDataColumn] = useState('revenue');
  const [showFilters, setShowFilters] = useState(false);
  const [quickJobTypes, setQuickJobTypes] = useState<string[]>([]);
  const [quickAgents, setQuickAgents] = useState<string[]>([]);
  const initialQuickTagNoteOptions = ['Tag Note 1', 'Tag Note 2'];
  const [quickTagNoteOptions, setQuickTagNoteOptions] = useState<string[]>(initialQuickTagNoteOptions);
  const [quickTagNotes, setQuickTagNotes] = useState<string[]>([]);
  const [quickTags, setQuickTags] = useState<string[]>([]);
  const [quickSingleChoice, setQuickSingleChoice] = useState<string>('');
  const [quickDispatches, setQuickDispatches] = useState<string[]>([]);
  const [showAddTagNoteModal, setShowAddTagNoteModal] = useState(false);
  const [newTagNoteName, setNewTagNoteName] = useState('');
  const [showAddTagModal, setShowAddTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagTextColor, setNewTagTextColor] = useState('#000000');
  const [newTagBgColor, setNewTagBgColor] = useState('#000000');
  const handleSaveTagNote = () => {
    const name = newTagNoteName.trim();
    if (!name) return;
    setQuickTagNoteOptions(prev => prev.includes(name) ? prev : [...prev, name]);
    setQuickTagNotes(prev => prev.includes(name) ? prev : [...prev, name]);
    setNewTagNoteName('');
    setShowAddTagNoteModal(false);
  };
  const handleSaveTag = () => {
    const name = newTagName.trim();
    if (!name) return;
    setQuickTags(prev => prev.includes(name) ? prev : [...prev, name]);
    setNewTagName('');
    setShowAddTagModal(false);
  };
  const [selectedDateRange, setSelectedDateRange] = useState('today');
  const dateRangeOptions = [
    { label: 'Today', value: 'today' },
    { label: 'Custom Dates', value: 'custom-picker' },
    { label: 'This Week (Sun - Today)', value: 'week-sun-today' },
    { label: 'This Week (Mon - Today)', value: 'week-mon-today' },
    { label: 'Last 7 Days', value: 'last-7-days' },
    { label: 'Last Week (Sun - Sat)', value: 'last-week-sun-sat' },
    { label: 'Last Week (Mon - Sun)', value: 'last-week-mon-sun' },
    { label: 'Last Business Week (Mon - Fri)', value: 'last-business-week' },
    { label: 'Last 14 Days', value: 'last-14-days' },
    { label: 'This Month', value: 'this-month' },
    { label: 'Last 30 Days', value: 'last-30-days' },
    { label: 'Last Month', value: 'last-month' },
  ];
  const quickAgentOptions = ['Agent 1', 'Agent 2', 'Agent 3'];
  const quickTagOptions = ['Tag 1', 'Tag 2'];
  const quickSingleOptions = [
    { label: 'None', value: 'none' },
    { label: 'Option 1', value: 'option-1' },
    { label: 'Option 2', value: 'option-2' },
  ];
  const quickDispatchOptions = ['Dispatch 1', 'Dispatch 2', 'Dispatch 3'];
  useEffect(() => {
    if (selectedDateRange === 'custom-picker') return;
    const presetRange = getRangeDates(selectedDateRange);
    if (presetRange) {
      setDateRangeValue(presetRange as unknown as DateValueType);
    }
  }, [selectedDateRange]);
  const formatDateShort = (date: Date) =>
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const addDays = (date: Date, days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };
  const startOfWeekSun = (date: Date) => addDays(date, -date.getDay());
  const startOfWeekMon = (date: Date) => addDays(date, -((date.getDay() + 6) % 7));
  const getQuickRangeLabel = (value: string) => {
    const today = new Date();
    let start = today;
    let end = today;
    switch (value) {
      case 'week-sun-today':
        start = startOfWeekSun(today);
        break;
      case 'week-mon-today':
        start = startOfWeekMon(today);
        break;
      case 'last-7-days':
        start = addDays(today, -6);
        break;
      case 'last-14-days':
        start = addDays(today, -13);
        break;
      case 'last-30-days':
        start = addDays(today, -29);
        break;
      case 'last-week-sun-sat':
        start = addDays(startOfWeekSun(today), -7);
        end = addDays(start, 6);
        break;
      case 'last-week-mon-sun':
        start = addDays(startOfWeekMon(today), -7);
        end = addDays(start, 6);
        break;
      case 'last-business-week':
        start = addDays(startOfWeekMon(today), -7);
        end = addDays(start, 4);
        break;
      case 'this-month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'last-month': {
        const year = today.getFullYear();
        const month = today.getMonth();
        start = new Date(year, month - 1, 1);
        end = new Date(year, month, 0);
        break;
      }
      default:
        start = today;
        end = today;
    }
    const startStr = formatDateShort(start);
    const endStr = formatDateShort(end);
    return startStr === endStr ? startStr : `${startStr} – ${endStr}`;
  };
  const getRangeDates = (value: string) => {
    const today = new Date();
    let start = today;
    let end = today;
    switch (value) {
      case 'week-sun-today':
        start = startOfWeekSun(today);
        break;
      case 'week-mon-today':
        start = startOfWeekMon(today);
        break;
      case 'last-7-days':
        start = addDays(today, -6);
        break;
      case 'last-14-days':
        start = addDays(today, -13);
        break;
      case 'last-30-days':
        start = addDays(today, -29);
        break;
      case 'last-week-sun-sat':
        start = addDays(startOfWeekSun(today), -7);
        end = addDays(start, 6);
        break;
      case 'last-week-mon-sun':
        start = addDays(startOfWeekMon(today), -7);
        end = addDays(start, 6);
        break;
      case 'last-business-week':
        start = addDays(startOfWeekMon(today), -7);
        end = addDays(start, 4);
        break;
      case 'this-month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = today;
        break;
      case 'last-month': {
        const year = today.getFullYear();
        const month = today.getMonth();
        start = new Date(year, month - 1, 1);
        end = new Date(year, month, 0);
        break;
      }
      case 'today':
        start = today;
        end = today;
        break;
      default:
        return null;
    }
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    return { startDate: fmt(start), endDate: fmt(end) };
  };
  const [pinnedStatuses, setPinnedStatuses] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('jobs.pinnedStatuses');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobilePage, setMobilePage] = useState(1);

  useEffect(() => {
    try { localStorage.setItem('jobs.pinnedStatuses', JSON.stringify(pinnedStatuses)); } catch {}
  }, [pinnedStatuses]);

  type VisibleClientFields = {
    srNo: boolean;
    status: boolean;
    jobId: boolean;
    clientName: boolean;
    companyName: boolean;
    phoneNumber: boolean;
    phoneNumber2: boolean;
    email: boolean;
    scheduled: boolean;
    apartmentNo: boolean;
    fullAddress: boolean;
    location: boolean;
    city: boolean;
    zip: boolean;
    state: boolean;
    country: boolean;
    tags: boolean;
    jobType: boolean;
    industryName: boolean;
    sourceCompanyName: boolean;
    tagNote: boolean;
    technician: boolean;
    addedBy: boolean;
    jobMasked: boolean;
    source: boolean;
    createdAt: boolean;
    updatedAt: boolean;
  };

  const defaultVisibleFields: VisibleClientFields = {
    srNo: true,
    status: true,
    jobId: true,
    clientName: true,
    companyName: true,
    phoneNumber: true,
    phoneNumber2: false,
    email: true,
    scheduled: true,
    apartmentNo: false,
    fullAddress: false,
    location: true,
    city: true,
    zip: true,
    state: true,
    country: false,
    tags: true,
    jobType: true,
    industryName: false,
    sourceCompanyName: false,
    tagNote: true,
    technician: true,
    addedBy: false,
    jobMasked: false,
    source: true,
    createdAt: true,
    updatedAt: false,
  };

  const [visibleClientFields, setVisibleClientFields] = useState<VisibleClientFields>(() => {
    try {
      const stored = localStorage.getItem("jobs.visibleClientFields");
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultVisibleFields, ...parsed };
      }
    } catch {}
    return defaultVisibleFields;
  });

  useEffect(() => {
    try {
      localStorage.setItem("jobs.visibleClientFields", JSON.stringify(visibleClientFields));
    } catch {}
  }, [visibleClientFields]);

  const toggleVisibleField = (key: keyof VisibleClientFields) =>
    setVisibleClientFields((prev) => ({ ...prev, [key]: !prev[key] }));

  // Add state for invoice creation modal
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lineItems: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    discount: 0,
    total: 0,
    notes: ''
  });

  // Add state for estimate creation modal
  const [estimateForm, setEstimateForm] = useState({
    estimateNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lineItems: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    discount: 0,
    total: 0,
    notes: ''
  });

  // Add state for payment recording modal
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    method: 'Credit Card',
    reference: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    paymentType: 'Payment', // Payment, Deposit, or Refund
    relatedInvoice: '', // Link to specific invoice if applicable
    depositForJob: '' // Job ID if this is a deposit
  });

  // Add dummy data for invoices, estimates, and payments
  const [invoices, setInvoices] = useState([
    { id: 'INV-001', date: '2024-07-01', due: '2024-07-10', amount: 450, status: 'Unpaid' },
    { id: 'INV-002', date: '2024-06-15', due: '2024-06-25', amount: 320, status: 'Paid' },
  ]);
  const [estimates, setEstimates] = useState([
    { id: 'EST-001', date: '2024-07-01', amount: 380, status: 'Pending' },
  ]);
  const [payments, setPayments] = useState([
    { id: 'PAY-001', date: '2024-06-25', amount: 320, method: 'Credit Card', status: 'Completed' },
  ]);

  const compareJobs = (a: any, b: any, by: string, dir: "asc" | "desc") => {
    const direction = dir === "asc" ? 1 : -1;
    switch (by) {
      case "priority": {
        const priorityOrder = { "Critical": 4, "High": 3, "Medium": 2, "Low": 1 };
        return (priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]) * direction;
      }
      case "time":
        return (new Date(a.startTime).getTime() - new Date(b.startTime).getTime()) * direction;
      case "distance":
        return ((a.distance ?? 0) - (b.distance ?? 0)) * direction;
      case "revenue":
        return ((b.revenue ?? 0) - (a.revenue ?? 0)) * direction;
      case "jobType":
        return (a.jobType || "").localeCompare(b.jobType || "") * direction;
      case "clientName":
        return (a.clientName || "").localeCompare(b.clientName || "") * direction;
      case "startDate":
        return (new Date(a.startDate).getTime() - new Date(b.startDate).getTime()) * direction;
      case "location":
        return (a.location || "").localeCompare(b.location || "") * direction;
      case "source":
        return (a.source || "").localeCompare(b.source || "") * direction;
      case "createdAt":
        return (new Date(a.createdAt || a.lastUpdated).getTime() - new Date(b.createdAt || b.lastUpdated).getTime()) * direction;
      case "assignedTechnician":
        return (a.assignedTechnician || "").localeCompare(b.assignedTechnician || "") * direction;
      case "status":
        return (a.status || "").localeCompare(b.status || "") * direction;
      default: {
        if (by && by in a && by in b) {
          const av = a[by as keyof typeof a];
          const bv = b[by as keyof typeof b];
          if (typeof av === "number" && typeof bv === "number") return (av - bv) * direction;
          if (av instanceof Date && bv instanceof Date) return (av.getTime() - bv.getTime()) * direction;
          if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv) * direction;
        }
        return 0;
      }
    }
  };

  const handleSortColumn = (column: string) => {
    setSortBy(prev => {
      const nextBy = column;
      const nextDir = prev === column ? (sortDir === "asc" ? "desc" : "asc") : "asc";
      setSortDir(nextDir);
      setJobs(prevJobs => [...prevJobs].sort((a, b) => compareJobs(a, b, nextBy, nextDir)));
      return nextBy;
    });
  };

  // Filter and sort jobs
  const filteredJobs = jobs
    .filter(job => {
      const matchesStatus = statusFilter === "all" || job.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesPriority = priorityFilter === "all" || job.priority.toLowerCase() === priorityFilter.toLowerCase();
      const matchesTechnician = dispatchTechnicianFilter === "all" || job.assignedTechnician === dispatchTechnicianFilter;
      const matchesLeadType =
        jobLeadFilter === "all" ||
        (((job as { jobLeadType?: string }).jobLeadType || "job") as string).toLowerCase() === jobLeadFilter;
      const matchesSearch = searchQuery === "" || 
        job.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.jobDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesStatus && matchesPriority && matchesTechnician && matchesLeadType && matchesSearch;
    })
    .sort((a, b) => compareJobs(a, b, sortBy, sortDir));

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "urgent":
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "in progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatTime = (time: string) => {
    if (time === "ASAP") return "ASAP";
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getTimeStatus = (job: any) => {
    const now = new Date();
    const jobTime = new Date(`2000-01-01T${job.startTime}`);
    const diff = jobTime.getTime() - now.getTime();
    
    if (job.status === "Completed") return "completed";
    if (job.status === "In Progress") return "in-progress";
    if (diff < -60 * 60 * 1000) return "overdue"; // 1 hour late
    if (diff < 0) return "due-now";
    if (diff < 30 * 60 * 1000) return "upcoming"; // 30 minutes
    return "scheduled";
  };

  // Helper function to get time ago
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} days ago`;
    }
  };

  // Helper function to get time until scheduled
  const getTimeUntil = (scheduledTime: Date) => {
    const now = new Date();
    const diffMs = scheduledTime.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMs < 0) {
      return 'Overdue';
    } else if (diffMinutes < 60) {
      return `In ${diffMinutes} minutes`;
    } else if (diffHours < 24) {
      return `In ${diffHours} hours`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `In ${diffDays} days`;
    }
  };

  const renderJobCard = (job: any) => {
    const timeStatus = getTimeStatus(job);

  return (
      <Card 
        key={job.id} 
        className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-l-4 ${
          timeStatus === "overdue" ? "border-l-red-500" :
          timeStatus === "due-now" ? "border-l-orange-500" :
          timeStatus === "upcoming" ? "border-l-yellow-500" :
          timeStatus === "in-progress" ? "border-l-blue-500" :
          "border-l-green-500"
        }`}
        onClick={() => {
          setSelectedJob(job);
          setShowJobDetails(true);
        }}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getPriorityColor(job.priority)}`}></div>
              <span className="font-mono text-sm font-semibold text-gray-600">{job.id}</span>
              </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(job.status)}>
                {job.status}
              </Badge>
              <Badge variant="outline" className="text-xs">
                ${job.revenue}
              </Badge>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-3">
            <h3 className="font-semibold text-gray-900 mb-1">{job.clientName}</h3>
            <p className="text-sm text-gray-600 mb-1">{job.location}, {job.city}</p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Phone className="w-3 h-3" />
              <span>{job.phoneNumber}</span>
            </div>
          </div>

          {/* Job Details */}
          <div className="mb-3">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-lg">{job.jobCategory === "Plumbing" ? "🔧" : job.jobCategory === "HVAC" ? "❄️" : "⚡"}</span>
              <span className="font-medium text-gray-800">{job.jobCategory} - {job.jobType}</span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{job.jobDescription}</p>
          </div>

          {/* Technician & Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                {job.technicianAvatar}
              </div>
              <span className="text-sm font-medium text-gray-700">{job.assignedTechnician}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">
                {formatTime(job.startTime)}
              </div>
              <div className="text-xs text-gray-500">
                {job.estimatedDuration}
              </div>
            </div>
          </div>

          {/* Tags */}
          {job.jobTags && job.jobTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {job.jobTags.map((tag: string) => (
                <span key={tag} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              <span>{job.distance} mi</span>
            </div>
            <div className="flex items-center space-x-1">
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Phone className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <MessageSquare className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <MoreVertical className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderDispatchBoard = () => {
    return renderListView();
  };

  // Add state for editing
  // const [isEditing, setIsEditing] = useState(false);
  // const [editFormData, setEditFormData] = useState({});
  // const [activeTab, setActiveTab] = useState('details');

  // Initialize edit form data when job is selected
  useEffect(() => {
    if (selectedJob) {
      setEditFormData(selectedJob);
    }
  }, [selectedJob]);

  const handleEditChange = (field: string, value: string) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Here you would typically save to backend
    console.log('Saving job data:', editFormData);
    setIsEditing(false);
    // Update the selectedJob with new data
    // setSelectedJob(editFormData);
  };

  const renderJobDetails = () => (
    <Dialog open={showJobDetails} onOpenChange={setShowJobDetails}>
      <DialogContent className="w-full max-w-4xl mx-auto p-0 rounded-2xl shadow-2xl border bg-white overflow-y-auto max-h-[90vh]">
        {selectedJob && (
          <div className="flex flex-col min-h-0">
            {/* Header with Job ID and Actions */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Job ID:</span>
                  <span className="text-lg font-bold text-blue-700">{selectedJob.id}</span>
                </div>
                <Badge 
                  style={{ backgroundColor: getStatusObj(selectedJob.status || 'Pending').color, color: 'white' }} 
                  className="px-3 py-1"
                >
                  {selectedJob.status || 'Pending'}
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  ${selectedJob.revenue}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                )}
                <Button variant="outline" size="sm">Invoice</Button>
                <Button variant="outline" size="sm">Logs</Button>
                <Button variant="ghost" size="icon" onClick={() => setShowJobDetails(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="financials">Financials</TabsTrigger>
                </TabsList>

                {/* Details Tab */}
                <TabsContent value="details" className="p-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Client Information */}
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
                              <Input 
                                value={editFormData.clientName || ''} 
                                onChange={(e) => handleEditChange('clientName', e.target.value)}
                                className="mt-1"
                              />
                            ) : (
                              <div className="mt-1 text-sm">{selectedJob.clientName}</div>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Company</Label>
                            {isEditing ? (
                              <Input 
                                value={editFormData.companyName || ''} 
                                onChange={(e) => handleEditChange('companyName', e.target.value)}
                                className="mt-1"
                              />
                            ) : (
                              <div className="mt-1 text-sm">{selectedJob.companyName}</div>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm font-medium">Email</Label>
                            {isEditing ? (
                              <Input 
                                value={editFormData.email || ''} 
                                onChange={(e) => handleEditChange('email', e.target.value)}
                                className="mt-1"
                              />
                            ) : (
                              <div className="mt-1 text-sm">{selectedJob.email}</div>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Phone</Label>
                            {isEditing ? (
                              <Input 
                                value={editFormData.phoneNumber || ''} 
                                onChange={(e) => handleEditChange('phoneNumber', e.target.value)}
                                className="mt-1"
                              />
                            ) : (
                              <div className="mt-1 text-sm">{selectedJob.phoneNumber}</div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Location Information */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <MapPin className="w-5 h-5" />
                          Location
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Address</Label>
                          {isEditing ? (
                            <Input 
                              value={editFormData.location || ''} 
                              onChange={(e) => handleEditChange('location', e.target.value)}
                              className="mt-1"
                            />
                          ) : (
                            <div className="mt-1 text-sm">{selectedJob.location}</div>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label className="text-sm font-medium">City</Label>
                            {isEditing ? (
                              <Input 
                                value={editFormData.city || ''} 
                                onChange={(e) => handleEditChange('city', e.target.value)}
                                className="mt-1"
                              />
                            ) : (
                              <div className="mt-1 text-sm">{selectedJob.city}</div>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm font-medium">State</Label>
                            {isEditing ? (
                              <Input 
                                value={editFormData.state || ''} 
                                onChange={(e) => handleEditChange('state', e.target.value)}
                                className="mt-1"
                              />
                            ) : (
                              <div className="mt-1 text-sm">{selectedJob.state}</div>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm font-medium">ZIP</Label>
                            {isEditing ? (
                              <Input 
                                value={editFormData.zipCode || ''} 
                                onChange={(e) => handleEditChange('zipCode', e.target.value)}
                                className="mt-1"
                              />
                            ) : (
                              <div className="mt-1 text-sm">{selectedJob.zipCode}</div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Service Details */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Wrench className="w-5 h-5" />
                          Service Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm font-medium">Category</Label>
                            {isEditing ? (
                              <Select value={editFormData.jobCategory || ''} onValueChange={(value) => handleEditChange('jobCategory', value)}>
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
                            <Label className="text-sm font-medium">Type</Label>
                            {isEditing ? (
                              <Select value={editFormData.jobType || ''} onValueChange={(value) => handleEditChange('jobType', value)}>
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
                          <Label className="text-sm font-medium">Priority</Label>
                          {isEditing ? (
                            <Select value={editFormData.priority || ''} onValueChange={(value) => handleEditChange('priority', value)}>
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                                <SelectItem value="Emergency">Emergency</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="mt-1 text-sm">{selectedJob.priority}</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Scheduling */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          Scheduling
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm font-medium">Date</Label>
                            {isEditing ? (
                              <Input 
                                type="date"
                                value={editFormData.startDate || ''} 
                                onChange={(e) => handleEditChange('startDate', e.target.value)}
                                className="mt-1"
                              />
                            ) : (
                              <div className="mt-1 text-sm">{selectedJob.startDate}</div>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Time</Label>
                            {isEditing ? (
                              <Input 
                                type="time"
                                value={editFormData.startTime || ''} 
                                onChange={(e) => handleEditChange('startTime', e.target.value)}
                                className="mt-1"
                              />
                            ) : (
                              <div className="mt-1 text-sm">{selectedJob.startTime}</div>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Duration</Label>
                          {isEditing ? (
                            <Input 
                              value={editFormData.estimatedDuration || ''} 
                              onChange={(e) => handleEditChange('estimatedDuration', e.target.value)}
                              className="mt-1"
                              placeholder="e.g., 2 hours"
                            />
                          ) : (
                            <div className="mt-1 text-sm">{selectedJob.estimatedDuration}</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Assignment */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Assignment
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Technician</Label>
                          {isEditing ? (
                            <Select value={editFormData.assignedTechnician || ''} onValueChange={(value) => handleEditChange('assignedTechnician', value)}>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select technician" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="John Smith">John Smith</SelectItem>
                                <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                                <SelectItem value="Sarah Wilson">Sarah Wilson</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="mt-1 text-sm">{selectedJob.assignedTechnician || 'Unassigned'}</div>
                          )}
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Status</Label>
                          {isEditing ? (
                            <Select value={editFormData.status || ''} onValueChange={(value) => handleEditChange('status', value)}>
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Confirmed">Confirmed</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="mt-1 text-sm">{selectedJob.status}</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Financials */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <DollarSign className="w-5 h-5" />
                          Financials
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Revenue</Label>
                          {isEditing ? (
                            <Input 
                              value={editFormData.revenue || ''} 
                              onChange={(e) => handleEditChange('revenue', e.target.value)}
                              className="mt-1"
                              type="number"
                            />
                          ) : (
                            <div className="mt-1 text-sm">${selectedJob.revenue}</div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm font-medium">Distance</Label>
                            <div className="mt-1 text-sm">{selectedJob.distance} mi</div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Rating</Label>
                            <div className="mt-1 text-sm">{selectedJob.customerRating} ⭐</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Description & Notes */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Description & Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Job Description</Label>
                        {isEditing ? (
                          <Textarea 
                            value={editFormData.jobDescription || ''} 
                            onChange={(e) => handleEditChange('jobDescription', e.target.value)}
                            className="mt-1"
                            rows={3}
                          />
                        ) : (
                          <div className="mt-1 text-sm">{selectedJob.jobDescription}</div>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Special Instructions</Label>
                        {isEditing ? (
                          <Textarea 
                            value={editFormData.specialInstructions || ''} 
                            onChange={(e) => handleEditChange('specialInstructions', e.target.value)}
                            className="mt-1"
                            rows={2}
                          />
                        ) : (
                          <div className="mt-1 text-sm">{selectedJob.specialInstructions}</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="p-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Activity Feed
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Add Note Section */}
                      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <MessageSquare className="w-4 h-4" />
                          <h3 className="font-medium">Add Note</h3>
                        </div>
                        <div className="flex gap-2">
                          <Textarea 
                            placeholder="Type your note here..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            className="flex-1"
                            rows={2}
                          />
                          <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Activity Filter */}
                      <div className="mb-4">
                        <Select value={activityFilter} onValueChange={setActivityFilter}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter Activity" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Activity</SelectItem>
                            <SelectItem value="note">Notes</SelectItem>
                            <SelectItem value="activity">Job Activity</SelectItem>
                            <SelectItem value="assign">Assignments</SelectItem>
                            <SelectItem value="payment">Payments</SelectItem>
                            <SelectItem value="call">Calls</SelectItem>
                            <SelectItem value="messages">Messages</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Activity List */}
                      <div className="space-y-4">
                        {filteredActivity.map((item, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: item.color }}></div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm">{item.title}</h4>
                                <span className="text-xs text-gray-500">{item.timestamp}</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{item.summary}</p>
                              <p className="text-xs text-gray-500 mt-1">by {item.user}</p>
                              
                              {/* Reply button for notes */}
                              {item.type === 'note' && (
                                <div className="mt-2">
                                  {showReplyNote === index ? (
                                    <div className="flex gap-2">
                                      <Textarea 
                                        placeholder="Type your reply..."
                                        value={replyNote}
                                        onChange={(e) => setReplyNote(e.target.value)}
                                        className="flex-1"
                                        rows={1}
                                      />
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
                </TabsContent>

                {/* Financials Tab */}
                <TabsContent value="financials" className="p-6">
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
              </Tabs>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  // Job status groups for list view
  const JOB_STATUS_GROUPS = [
    { key: "Rejected", color: "red", icon: <AlertCircle className="w-4 h-4 text-red-500 mr-1" /> },
    { key: "Confirmed", color: "green", icon: <CheckCircle className="w-4 h-4 text-green-500 mr-1" /> },
    { key: "Not Confirmed", color: "orange", icon: <AlertTriangle className="w-4 h-4 text-orange-500 mr-1" /> },
    { key: "No Answer", color: "yellow", icon: <AlertTriangle className="w-4 h-4 text-yellow-500 mr-1" /> },
    { key: "Submitted", color: "purple", icon: <CheckCircle className="w-4 h-4 text-purple-500 mr-1" /> },
  ];

  const statusColors = {
    Rejected: "bg-red-100 text-red-700",
    Confirmed: "bg-green-100 text-green-700",
    "Not Confirmed": "bg-orange-100 text-orange-700",
    "No Answer": "bg-yellow-100 text-yellow-700",
    Submitted: "bg-purple-100 text-purple-700",
  };

  const renderListView = () => {
    // Enhanced filtering logic with multiple criteria
    const filteredJobs = jobs.filter(job => {
      // Status filtering
      if (selectedStatus !== "All" && getJobStatus(job) !== selectedStatus) {
        return false;
      }
      // Lead/Job type filtering
      const jobType = (((job as { jobLeadType?: string }).jobLeadType || "job") as string).toLowerCase();
      if (jobLeadFilter !== "all" && jobType !== jobLeadFilter) {
        return false;
      }
      
      // Date range filtering
      if (dateRangeFilter !== "all") {
        const scheduledDate = new Date(job.startDate + ' ' + job.startTime);
        const now = new Date();
        
        if (dateRangeFilter === "upcoming" && scheduledDate <= now) {
          return false;
        }
        if (dateRangeFilter === "past" && scheduledDate > now) {
          return false;
        }
        if (dateRangeFilter === "today") {
          const today = new Date();
          const jobDate = new Date(job.startDate);
          if (jobDate.toDateString() !== today.toDateString()) {
            return false;
          }
        }
        if (dateRangeFilter === "this-week") {
          const today = new Date();
          const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
          const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
          const jobDate = new Date(job.startDate);
          if (jobDate < startOfWeek || jobDate > endOfWeek) {
            return false;
          }
        }
        if (dateRangeFilter === "this-month") {
          const today = new Date();
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          const jobDate = new Date(job.startDate);
          if (jobDate < startOfMonth || jobDate > endOfMonth) {
            return false;
          }
        }
        if (dateRangeFilter === "custom" && customStartDate && customEndDate) {
          const startDate = new Date(customStartDate);
          const endDate = new Date(customEndDate);
          const jobDate = new Date(job.startDate);
          if (jobDate < startDate || jobDate > endDate) {
            return false;
          }
        }
      }
      
      // Priority filtering
      if (jobPriorityFilter !== "all" && job.priority !== jobPriorityFilter) {
        return false;
      }
      
      // Technician filtering
      if (assignedTechFilter !== "all") {
        if (assignedTechFilter === "assigned" && !job.assignedTechnician) {
          return false;
        }
        if (assignedTechFilter === "unassigned" && job.assignedTechnician) {
          return false;
        }
        if (assignedTechFilter !== "assigned" && assignedTechFilter !== "unassigned" && job.assignedTechnician !== assignedTechFilter) {
          return false;
        }
      }
      
      // Source filtering
      if (jobSourceFilter !== "all" && job.source !== jobSourceFilter) {
        return false;
      }
      
      return true;
    });
    
    // Group jobs by status for better organization
    const groupedJobs = jobStatuses.reduce((acc, status) => {
      const statusJobs = jobs.filter(job => getJobStatus(job) === status.name);
      if (statusJobs.length > 0) {
        acc[status.name] = statusJobs;
      }
      return acc;
    }, {});
    
    const statusCounts = jobStatuses.map(status => ({
      ...status,
      count: jobs.filter(job => getJobStatus(job) === status.name).length
    }));
    const totalJobs = jobs.length;
    const filteredCount = filteredJobs.length;
    const totalPages = Math.max(1, Math.ceil(filteredCount / entriesPerPage));
    const handleEntriesChange = (value: string) => {
      const next = parseInt(value, 10);
      setEntriesPerPage(next);
      setCurrentPage(1);
    };
    const handlePageChange = (page: number) => {
      if (page < 1 || page > totalPages) return;
      setCurrentPage(page);
    };
    const pagedJobs = filteredJobs.slice(
      (currentPage - 1) * entriesPerPage,
      currentPage * entriesPerPage
    );
    const mobileJobs = filteredJobs.slice(0, mobilePage * entriesPerPage);
    const rowsPerStatus = density === 'ultra' ? 20 : density === 'compact' ? 10 : 3;
    const showCol = {
      details: visibleClientFields.srNo || visibleClientFields.jobId || visibleClientFields.jobType || visibleClientFields.industryName,
      client: visibleClientFields.clientName || visibleClientFields.companyName || visibleClientFields.phoneNumber || visibleClientFields.phoneNumber2 || visibleClientFields.email,
      schedule: visibleClientFields.scheduled,
      location: visibleClientFields.fullAddress || visibleClientFields.location || visibleClientFields.city || visibleClientFields.state || visibleClientFields.zip || visibleClientFields.country || visibleClientFields.apartmentNo,
      source: visibleClientFields.source || visibleClientFields.tags || visibleClientFields.sourceCompanyName || visibleClientFields.tagNote,
      created: visibleClientFields.createdAt || visibleClientFields.updatedAt,
      addedBy: visibleClientFields.addedBy,
      technician: visibleClientFields.technician,
      status: visibleClientFields.status || visibleClientFields.jobMasked,
      actions: true,
    };

    const handleRowToggle = (jobId: string, checked: boolean) => {
      setSelectedRows(prev => {
        const next = new Set(prev);
        if (checked) next.add(jobId);
        else next.delete(jobId);
        return next;
      });
    };

    const onChangeStatus: ((rowId: string, statusName: string) => void) | undefined = undefined;

    const mobileCard = (row) => {
      const status = getStatusObj(getJobStatus(row));
      const timeAgo = getTimeAgo(row.lastUpdated || row.startDate);
      const scheduledTime = new Date(`${row.startDate} ${row.startTime}`);
      const timeUntilScheduled = getTimeUntil(scheduledTime);
      return (
        <Card key={row.id} className="border-slate-200 dark:border-slate-800 shadow-sm mb-3">
          <CardHeader className="pb-2 flex flex-row items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Checkbox
                aria-label={`Select job ${row.id}`}
                checked={selectedRows.has(row.id)}
                onCheckedChange={checked => handleRowToggle(row.id, Boolean(checked))}
                className="mt-1"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-base">{row.jobType}</CardTitle>
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
                  ${row.revenue}
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
                        onClick={() => onChangeStatus?.(row.id, statusOption.name)}
                      >
                        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: statusOption.color }} />
                        <span>{statusOption.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                {/* <DropdownMenuItem className="flex items-center gap-2 text-red-600" onClick={() => onDelete(job)}>
                  <Trash2 className="w-4 h-4" />
                  Delete
                </DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-300">
              <User className="w-4 h-4" />
              {row.clientName}
              {row.companyName ? <span className="text-xs text-slate-500">• {row.companyName}</span> : null}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-300">
              <Phone className="w-4 h-4" />
              <span>{row.phoneNumber}</span>
              {row.email ? (
                <>
                  <Mail className="w-4 h-4 ml-2" />
                  <span className="truncate max-w-[160px]">{row.email}</span>
                </>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-300">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(row.startDate).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "2-digit",
                })}
                , {row.startTime}
              </span>
              <Badge variant="secondary" className="text-[10px]">
                {new Date(`${row.startDate} ${row.startTime}`) < new Date() ? "Past due" : timeUntilScheduled}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-300">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{row.location}</span>
              <span className="text-xs text-slate-500">
                {row.city}, {row.state} {row.zipCode}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-300">
              <Globe className="w-4 h-4" />
              <span className="capitalize">
                {row.source === "yelp"
                  ? "Yelp"
                  : row.source === "google-ads"
                    ? "Google Ads"
                    : row.source === "facebook"
                      ? "Facebook"
                      : row.source === "referral"
                        ? "Referral"
                        : row.source === "website"
                          ? "Website"
                          : row.source === "phone"
                            ? "Phone Call"
                            : row.source === "contract"
                              ? "Contract"
                              : row.source || "Direct"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-300">
              <User className={`w-4 h-4 ${row.assignedTechnician ? "text-green-500" : "text-red-500"}`} />
              <span className="font-semibold">
                {row.assignedTechnician ? `Assigned: ${row.assignedTechnician}` : "Unassigned"}
              </span>
              <Badge
                variant="secondary"
                className={`text-[10px] ${row.priority === "High" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
              >
                {row.priority === "High" ? "Need payment" : "Opportunity"}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              <Clock className="w-3 h-3" />
              {timeAgo} • {row.estimatedDuration || "—"} • {row.jobCategory || "General"}
            </div>
          </CardContent>
        </Card>
      );
    };

    const tableColumns = [
      {
        columnName: "",
        sortKey: "",
        cell: (row) => (
          
          <div className="flex items-center">
            <div className={`${density === 'ultra' ? 'h-7' : density === 'compact' ? 'h-8' : 'h-10'} flex items-center justify-center`}>
              <Checkbox
                aria-label={`Select job ${row.id}`}
                checked={selectedRows.has(row.id)}
                onCheckedChange={checked => handleRowToggle(row.id, Boolean(checked))}
              />
            </div>
          </div>
        ),
      },
      {
        columnName: "Job Details",
        sortKey: "jobType",
        cell: (row) => {
          const timeAgo = getTimeAgo(row.lastUpdated || row.startDate);
          return (
            <div className={`${density === 'ultra' ? 'space-y-0.5' : density === 'compact' ? 'space-y-1' : 'space-y-2'}`}>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => window.open(`/jobs/${row.id}/view`, '_blank')}
                    className={`${density === 'ultra' ? 'h-7 px-3' : density === 'compact' ? 'h-8 px-3' : 'h-10 px-4'} bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    <span className={`text-white font-bold ${density === 'ultra' ? 'text-[10px]' : density === 'compact' ? 'text-xs' : 'text-sm'}`}>
                      {row.id}
                    </span>
                  </button>
                </div>
                <div className="min-w-0">
                  <p
                    className={`${density === 'ultra' ? 'text-[11px]' : 'text-sm'} font-semibold text-slate-900 dark:text-slate-100 truncate cursor-pointer hover:underline`}
                    onClick={() => window.open(`/jobs/${row.id}/view`, '_blank')}
                  >
                    {row.jobType}
                  </p>
                  <p
                    className={`${density === 'ultra' ? 'text-[10px]' : 'text-sm'} text-slate-600 dark:text-slate-400 truncate cursor-pointer hover:underline`}
                    onClick={() => window.open(`/jobs/${row.id}/view`, '_blank')}
                  >
                    {row.jobDescription}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <Clock className="w-3 h-3" />
                  <span>{timeAgo}</span>
                </span>
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <span>${row.revenue}</span>
                </span>
              </div>
            </div>
          );
        },
      },
      {
        columnName: "Client Info",
        sortKey: "clientName",
        cell: (row) => (
          <div className={`${density === 'ultra' ? 'space-y-0.5' : density === 'compact' ? 'space-y-1' : 'space-y-2'}`}>
            {visibleClientFields.clientName && (
              <div className="min-w-0">
                <p className={`${density === 'ultra' ? 'text-[11px]' : 'text-sm'} font-semibold text-slate-900 dark:text-slate-100 truncate`}>{row.clientName}</p>
                {visibleClientFields.companyName && (
                  <p className={`${density === 'ultra' ? 'text-[10px]' : 'text-sm'} text-slate-600 dark:text-slate-400 truncate`}>{row.companyName}</p>
                )}
              </div>
            )}
            {visibleClientFields.phoneNumber && (
              <div className={`flex items-center space-x-2 ${density === 'ultra' ? 'text-[10px]' : 'text-sm'} text-slate-500 dark:text-slate-400`}>
                <Phone className="w-3 h-3" />
                <span>{row.phoneNumber}</span>
              </div>
            )}
            {visibleClientFields.phoneNumber2 && (row as any).phoneNumber2 && (
              <div className={`flex items-center space-x-2 ${density === 'ultra' ? 'text-[10px]' : 'text-sm'} text-slate-500 dark:text-slate-400`}>
                <Phone className="w-3 h-3" />
                <span>{(row as any).phoneNumber2}</span>
              </div>
            )}
            {visibleClientFields.email && (
              <div className={`flex items-center space-x-2 ${density === 'ultra' ? 'text-[10px]' : 'text-sm'} text-slate-500 dark:text-slate-400 truncate`}>
                <Mail className="w-3 h-3" />
                <span className="truncate">{row.email}</span>
              </div>
            )}
          </div>
        ),
      },
      {
        columnName: "Schedule",
        sortKey: "startDate",
        cell: (row) => {
          const scheduledTime = new Date(`${row.startDate} ${row.startTime}`);
          const timeUntilScheduled = getTimeUntil(scheduledTime);
          return (
            <div className={`${density === 'ultra' ? 'space-y-0.5' : density === 'compact' ? 'space-y-1' : 'space-y-2'}`}>
              <div className="flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <div className={`${density === 'ultra' ? 'text-[11px]' : 'text-sm'} font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap`}>
                  {new Date(row.startDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: '2-digit',
                  })}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <div className={`${density === 'ultra' ? 'text-[11px]' : 'text-sm'} font-semibold ${new Date(`${row.startDate} ${row.startTime}`) < new Date() ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'}`}>
                  {row.startTime}
                </div>
                {new Date(`${row.startDate} ${row.startTime}`) < new Date() && <div className="w-2 h-2 bg-red-500 rounded-full" />}
              </div>
              <div className={`text-[10px] font-bold ${new Date(`${row.startDate} ${row.startTime}`) < new Date() ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                {new Date(`${row.startDate} ${row.startTime}`) < new Date() ? 'PAST DUE' : timeUntilScheduled}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                Duration: {row.estimatedDuration}
              </div>
            </div>
          );
        },
      },
      {
        columnName: "Location",
        sortKey: "location",
        cell: (row) => (
          <div className={`${density === 'ultra' ? 'space-y-0.5' : 'space-y-1'}`}>
            <p className={`${density === 'ultra' ? 'text-[11px]' : 'text-sm'} text-slate-700 dark:text-slate-300 truncate`}>{row.location}</p>
            <p className={`${density === 'ultra' ? 'text-[10px]' : 'text-sm'} text-slate-600 dark:text-slate-400 truncate`}>
              {row.city}, {row.state} {row.zipCode}
            </p>
          </div>
        ),
      },
      {
        columnName: "Source",
        sortKey: "source",
        cell: (row) => (
          <div className={`${density === 'ultra' ? 'space-y-0.5' : density === 'compact' ? 'space-y-1' : 'space-y-2'}`}>
            <div className="flex items-center space-x-2">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span className={`${density === 'ultra' ? 'text-[11px]' : 'text-sm'} font-medium text-slate-900 dark:text-slate-100 capitalize truncate`}>
                {row.source === 'yelp'
                  ? 'Yelp'
                  : row.source === 'google-ads'
                    ? 'Google Ads'
                    : row.source === 'facebook'
                      ? 'Facebook'
                      : row.source === 'referral'
                        ? 'Referral'
                        : row.source === 'website'
                          ? 'Website'
                          : row.source === 'phone'
                            ? 'Phone Call'
                            : row.source === 'contract'
                              ? 'Contract'
                              : row.source || 'Direct'}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Lead Source</div>
          </div>
        ),
      },
      {
        columnName: "Created",
        sortKey: "createdAt",
        cell: (row) => (
          <div className={`${density === 'ultra' ? 'space-y-0.5' : density === 'compact' ? 'space-y-1' : 'space-y-2'}`}>
            <div className="flex items-center space-x-2">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span className={`${density === 'ultra' ? 'text-[11px]' : 'text-sm'} font-medium text-slate-900 dark:text-slate-100`}>
                {new Date(row.createdAt || row.lastUpdated).toLocaleDateString('en-US', {
                  month: 'short',
                  day: '2-digit',
                  year: '2-digit',
                })}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              {new Date(row.createdAt || row.lastUpdated).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        ),
      },
      {
        columnName: "Technician",
        sortKey: "assignedTechnician",
        cell: (row) => (
          <div className={`${density === 'ultra' ? 'space-y-0.5' : density === 'compact' ? 'space-y-1' : 'space-y-2'}`}>
            <div className="flex items-center space-x-2">
              <User className={`w-3.5 h-3.5 ${row.assignedTechnician ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`${density === 'ultra' ? 'text-[11px]' : 'text-sm'} font-medium ${row.assignedTechnician ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'} truncate`}>
                {row.assignedTechnician ? `Assigned: ${row.assignedTechnician}` : 'UNASSIGNED'}
              </span>
            </div>
          </div>
        ),
      },
      {
        columnName: "Status",
        sortKey: "status",
        cell: (row) => {
          const status = getStatusObj(getJobStatus(row));
          const timeAgo = getTimeAgo(row.lastUpdated || row.startDate);
          return (
            <div className={`${density === 'ultra' ? 'space-y-1' : density === 'compact' ? 'space-y-1.5' : 'space-y-3'}`}>
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
                      onClick={() => onChangeStatus?.(row.id, statusOption.name)}
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
                  row.priority === 'High'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                }`}
              >
                {row.priority === 'High' ? 'NEED TO COLLECT PAYMENT' : 'OPPORTUNITY'}
              </Badge>

              <div className="flex items-center space-x-2">
                <Phone className={`w-3 h-3 ${row.noteTags?.includes('called') ? 'text-green-500' : 'text-slate-400'}`} />
                <span className="text-[10px] text-slate-600 dark:text-slate-400">
                  {row.noteTags?.includes('called') ? 'Client Called' : 'No Call Yet'}
                </span>
              </div>
            </div>
          );
        },
      },
    ];

    const columnOptions: [keyof VisibleClientFields, string][] = [
      ["srNo", "Sr No."],
      ["jobId", "Job Id"],
      ["clientName", "Client Name"],
      ["companyName", "Company Name"],
      ["phoneNumber", "Phone Number"],
      ["phoneNumber2", "Phone Number2"],
      ["email", "Email"],
      ["apartmentNo", "Apartment No."],
      ["fullAddress", "Full Address"],
      ["location", "Location"],
      ["city", "City"],
      ["zip", "Zip"],
      ["state", "State"],
      ["country", "Country"],
      ["tags", "Tags"],
      ["jobType", "Job Type"],
      ["industryName", "Industry Name"],
      ["sourceCompanyName", "Source Company Name"],
      ["tagNote", "Tag Note"],
      ["technician", "Technician"],
      ["addedBy", "Added By"],
      ["jobMasked", "Job Masked"],
      ["source", "Source"],
      ["scheduled", "Scheduled"],
      ["status", "Status"],
      ["updatedAt", "Updated At"],
      ["createdAt", "Created At"],
    ];

    return (
      <div className="space-y-6">
        {/* Premium Header with Enhanced Stats */}
        <div className="flex sm:hidden items-end w-full justify-end gap-2 md:hidden">
          <div className="flex flex-row items-center w-full gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-1 py-1 h-10">
            {([
              { key: "all", label: "All" },
              { key: "job", label: "Jobs" },
              { key: "lead", label: "Leads" },
            ] as const).map(item => (
              <Button
                key={item.key}
                variant="ghost"
                className={`flex-1 h-8 rounded-full px-4 text-xs ${
                  jobLeadFilter === item.key
                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700"
                }`}
                onClick={() => setJobLeadFilter(item.key)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="hidden sm:flex items-end w-full justify-end gap-2 md:hidden">
          <div className="flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-1 py-1 h-10">
            {([
              { key: "all", label: "All" },
              { key: "job", label: "Jobs" },
              { key: "lead", label: "Leads" },
            ] as const).map(item => (
              <Button
                key={item.key}
                variant="ghost"
                className={`h-8 rounded-full px-4 text-xs ${
                  jobLeadFilter === item.key
                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700"
                }`}
                onClick={() => setJobLeadFilter(item.key)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="relative rounded-3xl p-4 md:p-8 pb-5 md:pb-6 border border-slate-200/60 dark:border-slate-700/60 shadow-sm md:shadow-xl bg-white dark:bg-slate-900 md:bg-gradient-to-br md:from-slate-50 md:via-blue-50 md:to-indigo-50 md:dark:from-slate-900 md:dark:via-blue-950/20 md:dark:to-indigo-950/20">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 dark:from-slate-100 dark:to-blue-100 bg-clip-text text-transparent">
                  Jobs Dashboard
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm md:text-lg leading-relaxed">
                  {selectedStatus === "All" 
                    ? "Comprehensive job management and tracking system" 
                    : `${selectedStatus} Jobs - ${filteredCount} total`}
                </p>
              </div>
              <div className="md:flex items-start gap-2 hidden">
                <div className="flex items-center gap-1 rounded-full bg-slate-50 dark:bg-slate-800 px-1 py-1 h-10">
                  {([
                    { key: "all", label: "All" },
                    { key: "job", label: "Jobs" },
                    { key: "lead", label: "Leads" },
                  ] as const).map(item => (
                    <Button
                      key={item.key}
                      variant="ghost"
                      className={`h-8 rounded-full px-4 text-xs ${
                        jobLeadFilter === item.key
                          ? "bg-emerald-500 text-white hover:bg-emerald-600"
                          : "text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700"
                      }`}
                      onClick={() => setJobLeadFilter(item.key)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

           {/* Slim toolbar */}
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  className="pl-9"
                  placeholder="Search jobs, clients, phone, address"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(prev => !prev)}
              >
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
            </div>
            
            {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
              <SelectInput
                label="Job Type"
                options={['Repair', 'Install', 'Maintenance', 'Emergency', 'Inspection'].map(type => ({
                  label: type,
                  value: type,
                }))}
                placeholder="All job types"
                value={quickJobTypes}
                multiselect
                onSelect={val => setQuickJobTypes(Array.isArray(val) ? val : [])}
                onSearch={() => {}}
              />
              <SelectInput
                label="Agents"
                options={quickAgentOptions.map(agent => ({
                  label: agent,
                  value: agent,
                }))}
                placeholder="All agents"
                value={quickAgents}
                multiselect
                onSelect={val => setQuickAgents(Array.isArray(val) ? val : [])}
                onSearch={() => {}}
              />
              <SelectInput
                label="Date Range (presets)"
                options={dateRangeOptions}
                placeholder="Select date range"
                value={selectedDateRange}
                onSelect={val => {
                  const next = Array.isArray(val) ? (val[0] ?? '') : val;
                  setSelectedDateRange(next);
                  if (next === 'custom-picker') {
                    setDateRangeValue({ startDate: null, endDate: null });
                  }
                }}
              />
              <InputDatepicker
                value={dateRangeValue}
                onChange={handleDateRangeChange}
                disabled={selectedDateRange !== 'custom-picker'}
                label={"\xA0"}
              />
            </div>
            )}
            {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
              <SelectInput
                label="Tag Notes"
                options={quickTagNoteOptions.map(tagNote => ({
                  label: tagNote,
                  value: tagNote,
                }))}
                placeholder="All Tag Notes"
                value={quickTagNotes}
                multiselect
                onSelect={val => setQuickTagNotes(Array.isArray(val) ? val : [])}
                onSearch={() => {}}
                actionLabel="Add Tag Notes"
                onAction={() => setShowAddTagNoteModal(true)}
              />
              <SelectInput
                label="Tags"
                options={quickTagOptions.map(tag => ({
                  label: tag,
                  value: tag,
                }))}
                placeholder="All Tags"
                value={quickTags}
                multiselect
                onSelect={val => setQuickTags(Array.isArray(val) ? val : [])}
                onSearch={() => {}}
                actionLabel="Add Tag"
                onAction={() => setShowAddTagModal(true)}
              />
              <SelectInput
                label="Sources"
                options={quickSingleOptions}
                placeholder="All Sources"
                value={quickSingleChoice}
                onSelect={val => setQuickSingleChoice(Array.isArray(val) ? (val[0] ?? '') : val)}
                onSearch={() => {}}
              />
              <SelectInput
                label="Dispatch"
                options={quickDispatchOptions.map(dispatch => ({
                  label: dispatch,
                  value: dispatch,
                }))}
                placeholder="All dispatches"
                value={quickDispatches}
                multiselect
                onSelect={val => setQuickDispatches(Array.isArray(val) ? val : [])}
                onSearch={() => {}}
              />
            </div>
            )}
          </div>


          {/* Compact, scalable Status bar */}
          <div className="sticky top-0 backdrop-blur supports-[backdrop-filter]:backdrop-blur px-1 py-2 mt-8">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setSelectedStatus('All')}
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
                    <button key={s.id}
                      draggable
                      onDragStart={()=>setDragIndex(idx)}
                      onDragOver={(e)=>e.preventDefault()}
                      onDrop={()=>{
                        if (dragIndex===null) return;
                        const names = [...statusOrder.length? statusOrder : jobStatuses.map(js=>js.name)];
                        const from = dragIndex;
                        const to = idx;
                        const ordered = [...names];
                        const [moved] = ordered.splice(from,1);
                        ordered.splice(to,0,moved);
                        setStatusOrder(ordered);
                        setDragIndex(null);
                      }}
                      onClick={()=>setSelectedStatus(s.name)}
                      className={`flex items-center gap-1.5 rounded-full h-7 px-2 text-xs whitespace-nowrap ${sel? 'bg-slate-900 text-white':'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>
                      <span className="inline-block h-2 w-2 rounded-full" style={{backgroundColor:s.color}}></span>
                      {s.name}
                      {count>0 && <span className="opacity-70 hidden sm:inline">{count}</span>}
                    </button>
                  );
                })}
              {/* More dropdown removed for simplicity; horizontal scroll holds all */}
            </div>
          </div>
          
          {/* Summary removed (duplicated by status pills) */}
        </div>

        {/* Bulk actions + Column toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 px-1">
          <div className="flex flex-wrap items-center gap-3">
            {selectedRows.size > 0 && (
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Change Status ({selectedRows.size})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-44">
                    {jobStatuses.map(statusOption => (
                      <DropdownMenuItem
                        key={statusOption.id}
                        className="flex items-center gap-2"
                        onClick={() => {
                          // Bulk status change handler goes here
                          // e.g., handleBulkStatusChange(Array.from(selectedRows), statusOption.name)
                        }}
                      >
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: statusOption.color }}
                        />
                        <span>{statusOption.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex items-center gap-2 bg-gray-200 rounded-md">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const selectedId = Array.from(selectedRows)[0];
                      const job =
                        filteredJobs.find(j => j.id === selectedId) ||
                        jobs.find(j => j.id === selectedId);
                      if (!job) return;
                      setSelectedJob(job);
                      setEditFormData(job);
                      setIsEditing(true);
                      setShowJobDetails(true);
                    }}
                    disabled={selectedRows.size !== 1}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  {selectedRows.size > 1 ? <p className="text-xs text-gray-500 pr-4 pl-1">Select only one job to edit</p> : null}
                </div>
                {/* <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleOpenDeleteBulk}
                >
                  Delete ({selectedRows.size})
                </Button> */}
              </div>
            )}
            
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold">Density:</span>
              <div className="flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-1 py-1 h-10">
                {[
                  { key: 'comfortable', label: 'Comfortable' },
                  { key: 'compact', label: 'Compact' },
                  { key: 'ultra', label: 'Ultra' },
                ].map(item => (
                  <Button
                    key={item.key}
                    variant="ghost"
                    className={`h-8 rounded-full px-3 text-xs ${
                      density === item.key
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700'
                    }`}
                    onClick={() => setDensity(item.key as typeof density)}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
            <Button variant="outline" className="border-slate-300 dark:border-slate-700 rounded-full gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-full border-slate-300 dark:border-slate-700 px-3 gap-2"
                  title="Show/Hide Columns"
                >
                  <Columns3 className="w-4 h-4" />
                  <span className="text-sm">Columns</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Manage Columns</SheetTitle>
                  {/* <SheetDescription>Select fields to display. Saved locally.</SheetDescription> */}
                </SheetHeader>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {columnOptions.map(([key,label]) => (
                    <label key={key} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="h-4 w-4" checked={visibleClientFields[key]} onChange={()=>toggleVisibleField(key)} />
                      {label}
                    </label>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
          {/* <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-slate-300 dark:border-slate-700 px-3 gap-2"
                title="Show/Hide Columns"
              >
                <Columns3 className="w-4 h-4" />
                <span className="text-sm">Columns</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Columns
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {columnOptions.map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={visibleClientFields[key]}
                      onChange={() => toggleVisibleField(key)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover> */}
        </div>

        {/* Premium Table View with Status Grouping */}
        {/* Table (companies-style) */}
        <Table
          rows={pagedJobs}
          mobileRows={mobileJobs}
          columns={tableColumns}
          mobileCard={mobileCard}
          onSort={handleSortColumn}
          activeSortKey={sortBy}
          sortDirection={sortDir}
          pageSize={entriesPerPage}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={filteredCount}
          onPageSizeChange={handleEntriesChange}
          onPageChange={page => {
            handlePageChange(page);
            setMobilePage(page);
          }}
        />
      </div>
    );
  };

  const [noSchedule, setNoSchedule] = useState(false);
  const [noTechnician, setNoTechnician] = useState(false);
  const [openWhyTechId, setOpenWhyTechId] = useState<string | null>(null);

  // Inside the Jobs component:
  const [activityFilter, setActivityFilter] = useState('all');
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [showAssignTech, setShowAssignTech] = useState(false);
  const [selectedTech, setSelectedTech] = useState('');
  const [showReplyNote, setShowReplyNote] = useState(null);
  const [replyNote, setReplyNote] = useState('');
  const [showTechList, setShowTechList] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'single' | 'bulk'>('single');
  const [jobToDelete, setJobToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const handleOpenDeleteSingle = (job: any) => {
    setJobToDelete(job);
    setDeleteMode('single');
    setDeleteDialogOpen(true);
  };

  const handleOpenDeleteBulk = () => {
    setJobToDelete(null);
    setDeleteMode('bulk');
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      if (deleteMode === 'single' && jobToDelete) {
        setSelectedRows(prev => {
          const next = new Set(prev);
          next.delete(jobToDelete.id);
          return next;
        });
        // TODO: integrate single delete API and refresh data
      } else if (deleteMode === 'bulk') {
        // TODO: integrate bulk delete API and refresh data
        setSelectedRows(new Set());
      }
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    if (deleting) return;
    setDeleteDialogOpen(false);
    setJobToDelete(null);
  };

  // Dummy activity data
  const activity = [
    { type: 'activity', title: 'Job Activity', summary: 'Responder changed to Not Confirmed', timestamp: '07/02/2025 09:03 PM', user: 'System', color: '#2563eb' },
    { type: 'assign', title: 'Job Assign', summary: 'Job assigned to Technician: OK LINE', timestamp: '07/02/2025 09:03 PM', user: 'Jocres Cartagena Cequiña', color: '#059669' },
    { type: 'note', title: 'Job Note', summary: 'Customer requested early arrival.', timestamp: '07/02/2025 09:02 PM', user: 'Dispatcher', color: '#2563eb' },
    { type: 'payment', title: 'Payment Received', summary: 'Payment of $200 received.', timestamp: '07/02/2025 09:01 PM', user: 'System', color: '#eab308' },
    { type: 'call', title: 'Call Recording', summary: 'Call with customer recorded.', timestamp: '07/02/2025 09:00 PM', user: 'Reception', color: '#a21caf' },
    { type: 'messages', title: 'Message Sent', summary: 'Text message sent to customer.', timestamp: '07/02/2025 08:59 PM', user: 'System', color: '#db2777' },
    { type: 'activity', title: 'Job Created', summary: 'Job created by (LS) Jocres Cartagena Cequiña', timestamp: '07/02/2025 08:58 PM', user: 'Jocres Cartagena Cequiña', color: '#2563eb' },
  ];

  // Filtering logic
  const filteredActivity = activityFilter === 'all' ? activity : activity.filter(a => a.type === activityFilter);

  // Handlers
  const handleAddNote = () => {
    if (!newNote.trim()) return;
    activity.unshift({ type: 'note', title: 'Job Note', summary: newNote, timestamp: new Date().toLocaleString(), user: 'You', color: '#2563eb' });
    setNewNote('');
    setShowAddNote(false);
  };
  const handleAssignTech = () => {
    // Assign tech logic here
    setShowAssignTech(false);
    setSelectedTech('');
  };
  const handleReplyNote = (i) => {
    if (!replyNote.trim()) return;
    // Add reply to note logic here
    setReplyNote('');
    setShowReplyNote(null);
  };

  // Calculate invoice totals
  const calculateInvoiceTotals = (form) => {
    const subtotal = form.lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const taxAmount = (subtotal * form.taxRate) / 100;
    const total = subtotal + taxAmount - form.discount;
    return { subtotal, taxAmount, total };
  };

  // Calculate estimate totals
  const calculateEstimateTotals = (form) => {
    const subtotal = form.lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const taxAmount = (subtotal * form.taxRate) / 100;
    const total = subtotal + taxAmount - form.discount;
    return { subtotal, taxAmount, total };
  };

  // Handle invoice line item changes
  const handleInvoiceLineItemChange = (index, field, value) => {
    const newLineItems = [...invoiceForm.lineItems];
    newLineItems[index] = { ...newLineItems[index], [field]: value };
    
    // Calculate amount for this line item
    if (field === 'quantity' || field === 'rate') {
      newLineItems[index].amount = newLineItems[index].quantity * newLineItems[index].rate;
    }
    
    const newForm = { ...invoiceForm, lineItems: newLineItems };
    const totals = calculateInvoiceTotals(newForm);
    
    setInvoiceForm({
      ...newForm,
      ...totals
    });
  };

  // Handle estimate line item changes
  const handleEstimateLineItemChange = (index, field, value) => {
    const newLineItems = [...estimateForm.lineItems];
    newLineItems[index] = { ...newLineItems[index], [field]: value };
    
    // Calculate amount for this line item
    if (field === 'quantity' || field === 'rate') {
      newLineItems[index].amount = newLineItems[index].quantity * newLineItems[index].rate;
    }
    
    const newForm = { ...estimateForm, lineItems: newLineItems };
    const totals = calculateEstimateTotals(newForm);
    
    setEstimateForm({
      ...newForm,
      ...totals
    });
  };

  // Add line item to invoice
  const addInvoiceLineItem = () => {
    setInvoiceForm({
      ...invoiceForm,
      lineItems: [...invoiceForm.lineItems, { description: '', quantity: 1, rate: 0, amount: 0 }]
    });
  };

  // Add line item to estimate
  const addEstimateLineItem = () => {
    setEstimateForm({
      ...estimateForm,
      lineItems: [...estimateForm.lineItems, { description: '', quantity: 1, rate: 0, amount: 0 }]
    });
  };

  // Remove line item from invoice
  const removeInvoiceLineItem = (index) => {
    const newLineItems = invoiceForm.lineItems.filter((_, i) => i !== index);
    const newForm = { ...invoiceForm, lineItems: newLineItems };
    const totals = calculateInvoiceTotals(newForm);
    
    setInvoiceForm({
      ...newForm,
      ...totals
    });
  };

  // Remove line item from estimate
  const removeEstimateLineItem = (index) => {
    const newLineItems = estimateForm.lineItems.filter((_, i) => i !== index);
    const newForm = { ...estimateForm, lineItems: newLineItems };
    const totals = calculateEstimateTotals(newForm);
    
    setEstimateForm({
      ...newForm,
      ...totals
    });
  };

  // Handle invoice form submission
  const handleCreateInvoice = () => {
    const newInvoice = {
      id: `INV-${Date.now()}`,
      date: invoiceForm.issueDate,
      due: invoiceForm.dueDate,
      amount: invoiceForm.total,
      status: 'Unpaid',
      ...invoiceForm
    };
    
    setInvoices([...invoices, newInvoice]);
    setShowInvoiceModal(false);
    setInvoiceForm({
      invoiceNumber: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lineItems: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
      subtotal: 0,
      taxRate: 0,
      taxAmount: 0,
      discount: 0,
      total: 0,
      notes: ''
    });
  };

  // Handle estimate form submission
  const handleCreateEstimate = () => {
    const newEstimate = {
      id: `EST-${Date.now()}`,
      date: estimateForm.issueDate,
      amount: estimateForm.total,
      status: 'Pending',
      ...estimateForm
    };
    
    setEstimates([...estimates, newEstimate]);
    setShowEstimateModal(false);
    setEstimateForm({
      estimateNumber: '',
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lineItems: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
      subtotal: 0,
      taxRate: 0,
      taxAmount: 0,
      discount: 0,
      total: 0,
      notes: ''
    });
  };

  // Handle payment form submission
  const handleRecordPayment = () => {
    const newPayment = {
      id: `PAY-${Date.now()}`,
      date: paymentForm.date,
      amount: paymentForm.amount,
      method: paymentForm.method,
      status: 'Completed',
      reference: paymentForm.reference,
      notes: paymentForm.notes,
      paymentType: paymentForm.paymentType,
      relatedInvoice: paymentForm.relatedInvoice,
      depositForJob: paymentForm.depositForJob
    };
    
    // If this is a deposit, create a deposit invoice
    if (paymentForm.paymentType === 'Deposit' && paymentForm.depositForJob) {
      const depositInvoice = {
        id: `DEP-${Date.now()}`,
        date: paymentForm.date,
        due: paymentForm.date,
        amount: paymentForm.amount,
        status: 'Paid',
        type: 'Deposit',
        jobId: paymentForm.depositForJob,
        paymentId: newPayment.id,
        lineItems: [{ 
          description: `Deposit for Job ${paymentForm.depositForJob}`, 
          quantity: 1, 
          rate: paymentForm.amount, 
          amount: paymentForm.amount 
        }],
        subtotal: paymentForm.amount,
        taxRate: 0,
        taxAmount: 0,
        discount: 0,
        total: paymentForm.amount,
        notes: `Deposit payment: ${paymentForm.notes}`
      };
      
      setInvoices([...invoices, depositInvoice]);
    }
    
    // If payment is linked to an invoice, update invoice status
    if (paymentForm.relatedInvoice) {
      const updatedInvoices = invoices.map(inv => {
        if (inv.id === paymentForm.relatedInvoice) {
          return { ...inv, status: 'Paid' };
        }
        return inv;
      });
      setInvoices(updatedInvoices);
    }
    
    setPayments([...payments, newPayment]);
    setShowPaymentModal(false);
    setPaymentForm({
      amount: 0,
      method: 'Credit Card',
      reference: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      paymentType: 'Payment',
      relatedInvoice: '',
      depositForJob: ''
    });
  };

  // Generate paid invoice from recorded payment
  const generateInvoiceFromPayment = (payment) => {
    const newInvoice = {
      id: `INV-${Date.now()}`,
      date: payment.date,
      due: payment.date,
      amount: payment.amount,
      status: 'Paid',
      type: payment.paymentType === 'Deposit' ? 'Deposit' : 'Service',
      paymentId: payment.id,
      lineItems: [{ 
        description: payment.paymentType === 'Deposit' 
          ? `Deposit for Job ${payment.depositForJob || 'Unknown'}` 
          : 'Service Payment', 
        quantity: 1, 
        rate: payment.amount, 
        amount: payment.amount 
      }],
      subtotal: payment.amount,
      taxRate: 0,
      taxAmount: 0,
      discount: 0,
      total: payment.amount,
      notes: `Generated from payment: ${payment.notes}`
    };
    
    setInvoices([...invoices, newInvoice]);
  };

  // Calculate financial summary
  const financialSummary = {
    totalInvoiced: invoices.reduce((sum, inv) => sum + inv.amount, 0),
    totalPaid: payments.reduce((sum, pay) => sum + pay.amount, 0),
    outstanding: invoices.reduce((sum, inv) => sum + (inv.status === 'Unpaid' ? inv.amount : 0), 0)
  };

  // 1. Fix job demo data to include all required fields
  const defaultJob = {
    companyName: '',
    phoneNumber: '',
    phoneNumber2: '',
    phoneNumberExtra: '',
    email: '',
    location: '',
    city: '',
    state: '',
    zipCode: '',
    jobCategory: '',
    jobType: '',
    jobDescription: '',
    startDate: '',
    startTime: '',
    assignedTechnician: '',
    technicianAvatar: '',
    status: 'Pending',
    priority: '',
    jobTags: [],
    noteTags: [],
    distance: 0,
    revenue: 0,
    customerRating: 0,
    lastUpdated: '',
    notes: '',
    partsNeeded: [],
    specialInstructions: '',
    photos: [],
  };

  const jobsWithDefaults = jobs.map(job => ({ ...defaultJob, ...job }));

  // 2. Use jobsWithDefaults everywhere jobs are mapped in the UI (e.g., in renderJobDetails, job lists, etc.)
  // 3. For payments, add safe access for paymentType and depositForJob, and use default values if missing
  // 4. In the Quick View, use optional chaining and fallback values for all fields
  // 5. In the payments section, use (payment.paymentType || 'Payment') and (payment.depositForJob || '')

  return (
    <div>
      <div className="flex items-center justify-end">
        <div className="flex space-x-3">
          <Dialog open={showNewJobDialog} onOpenChange={setShowNewJobDialog}>
            {/* Trigger is in global header; this Dialog opens via URL (?new=1) or window event */}
            <DialogContent
              className={`${viewMode === "single" ? "sm:max-w-6xl" : "sm:max-w-4xl"} max-h-[90vh] overflow-y-auto`}
            >
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-2xl font-bold text-gray-900">
                    Create New Service Job
                  </DialogTitle>

                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <Button
                      variant={viewMode === "wizard" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("wizard")}
                      className={`text-xs ${viewMode === "wizard" ? "bg-white shadow-sm" : ""}`}
                    >
                      📋 Step-by-step
                    </Button>
                    <Button
                      variant={viewMode === "single" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("single")}
                      className={`text-xs ${viewMode === "single" ? "bg-white shadow-sm" : ""}`}
                    >
                      📄 All in one
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              {/* Source Announcement in Dialog */}
              {formData.source && (
                <div className="bg-gradient-to-r from-yellow-100 via-yellow-50 to-orange-100 border border-yellow-300 rounded-lg p-4 mx-6 mt-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center">
                        <span className="text-sm">📢</span>
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <h4 className="text-sm font-semibold text-yellow-800 mb-1">
                        Active Offer -{" "}
                        {formData.source === "yelp"
                          ? "Yelp"
                          : formData.source === "google-ads"
                            ? "Google Ads"
                            : formData.source === "facebook"
                              ? "Facebook"
                              : formData.source === "referral"
                                ? "Referral"
                                : formData.source === "website"
                                  ? "Website"
                                  : "Direct Call"}{" "}
                        Customer
                      </h4>
                      <p className="text-sm text-yellow-700">
                        {formData.source === "yelp" &&
                          "🎉 10% off all services for Yelp customers!"}
                        {formData.source === "google-ads" &&
                          "💰 Free estimate for Google customers!"}
                        {formData.source === "facebook" &&
                          "👍 Special Facebook customer pricing available!"}
                        {formData.source === "referral" &&
                          "🤝 Thank you for the referral! Special discount applied."}
                        {formData.source === "website" &&
                          "🌐 Web customer special - priority scheduling available!"}
                        {formData.source === "phone" &&
                          "📞 Direct call customer - premium service included!"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateFormData("source", "")}
                      className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-200 h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="py-6">
                {viewMode === "wizard" && renderStepIndicator()}

                <div className={viewMode === "wizard" ? "min-h-[500px]" : ""}>
                  {viewMode === "wizard" ? (
                    <>
                      {currentStep === 1 && renderStep1()}
                      {currentStep === 2 && renderStep2()}
                      {currentStep === 3 && renderStep3()}
                      {currentStep === 4 && renderStep4()}
                    </>
                  ) : (
                    renderSingleScreen()
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-8 border-t border-gray-200 mt-8">
                  <div className="flex items-center space-x-4">
                    {viewMode === "wizard" && currentStep > 1 && (
                      <Button
                        variant="outline"
                        onClick={prevStep}
                        className="flex items-center"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      onClick={() => {
                        resetForm();
                        setShowNewJobDialog(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>

                  <div className="flex items-center space-x-3">
                    {viewMode === "wizard" ? (
                      currentStep < totalSteps ? (
                        <Button
                          onClick={nextStep}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white flex items-center"
                          disabled={
                            (currentStep === 1 &&
                              (!formData.clientName ||
                                !formData.phoneNumber)) ||
                            (currentStep === 2 &&
                              (!formData.location ||
                                !formData.city ||
                                !formData.state)) ||
                            (currentStep === 3 &&
                              (!formData.jobCategory ||
                                !formData.jobType ||
                                !formData.jobDescription))
                          }
                        >
                          Continue
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      ) : (
                        <Button
                          onClick={() => {
                            console.log("Creating job with data:", {
                              formData,
                              selectedTechnician,
                            });
                            resetForm();
                            setShowNewJobDialog(false);
                            alert(
                              "🎉 Job created successfully! The technician has been notified.",
                            );
                          }}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white flex items-center px-8"
                          disabled={
                            !selectedTechnician ||
                            !formData.startDate ||
                            (selectedDuration === "Custom Time" &&
                              (!customStartTime || !customEndTime))
                          }
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Create Job
                        </Button>
                      )
                    ) : (
                      // Single screen mode - always show create button
                      <Button
                        onClick={() => {
                          console.log("Creating job with data:", {
                            formData,
                            selectedTechnician,
                          });
                          resetForm();
                          setShowNewJobDialog(false);
                          alert(
                            "🎉 Job created successfully! The technician has been notified.",
                          );
                        }}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white flex items-center px-8"
                        disabled={
                          !formData.clientName ||
                          !formData.phoneNumber ||
                          !formData.location ||
                          !formData.city ||
                          !formData.state ||
                          !formData.jobCategory ||
                          !formData.jobType ||
                          !formData.jobDescription ||
                          (!noTechnician && !selectedTechnician) ||
                          (!noSchedule && (!formData.startDate || (selectedDuration === "Custom Time" && (!customStartTime || !customEndTime))))
                        }
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Create Job
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {deleteMode === 'bulk' ? 'Delete Jobs' : 'Delete Job'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {deleteMode === 'bulk' ? (
                  <>
                    Are you sure you want to delete{' '}
                    <strong>{selectedRows.size}</strong> selected job
                    {selectedRows.size > 1 ? 's' : ''}? This action cannot be
                    undone.
                  </>
                ) : (
                  <>
                    Are you sure you want to delete{' '}
                    <strong>{jobToDelete?.clientName || jobToDelete?.id}</strong>?
                    This action cannot be undone.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleDeleteCancel} disabled={deleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? (
                  <>
                    <ButtonLoading message="Deleting..." />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      {/* Jobs List View */}
      <div className="mt-8">
        {renderListView()}
        {renderJobDetails()}
      </div>

      {/* Invoice Creation Modal */}
      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Create Invoice
            </DialogTitle>
            <DialogDescription>
              Create a professional invoice for this job
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Invoice Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceForm.invoiceNumber}
                  onChange={(e) => setInvoiceForm({...invoiceForm, invoiceNumber: e.target.value})}
                  placeholder="INV-001"
                />
            </div>
              <div>
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={invoiceForm.issueDate}
                  onChange={(e) => setInvoiceForm({...invoiceForm, issueDate: e.target.value})}
                />
          </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={invoiceForm.dueDate}
                  onChange={(e) => setInvoiceForm({...invoiceForm, dueDate: e.target.value})}
                />
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-semibold">Line Items</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addInvoiceLineItem}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {invoiceForm.lineItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-6">
                      <Label htmlFor={`description-${index}`}>Description</Label>
                      <Input
                        id={`description-${index}`}
                        value={item.description}
                        onChange={(e) => handleInvoiceLineItemChange(index, 'description', e.target.value)}
                        placeholder="Service description"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`quantity-${index}`}>Qty</Label>
                      <Input
                        id={`quantity-${index}`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleInvoiceLineItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`rate-${index}`}>Rate</Label>
                      <Input
                        id={`rate-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => handleInvoiceLineItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Label>Amount</Label>
                      <div className="text-sm font-medium text-gray-700 p-2 bg-gray-50 rounded border">
                        ${item.amount.toFixed(2)}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInvoiceLineItem(index)}
                        className="text-red-500 hover:text-red-700"
                        disabled={invoiceForm.lineItems.length === 1}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={invoiceForm.taxRate}
                      onChange={(e) => {
                        const taxRate = parseFloat(e.target.value) || 0;
                        const taxAmount = (invoiceForm.subtotal * taxRate) / 100;
                        const total = invoiceForm.subtotal + taxAmount - invoiceForm.discount;
                        setInvoiceForm({
                          ...invoiceForm,
                          taxRate,
                          taxAmount,
                          total
                        });
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="discount">Discount ($)</Label>
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={invoiceForm.discount}
                      onChange={(e) => {
                        const discount = parseFloat(e.target.value) || 0;
                        const total = invoiceForm.subtotal + invoiceForm.taxAmount - discount;
                        setInvoiceForm({
                          ...invoiceForm,
                          discount,
                          total
                        });
                      }}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={invoiceForm.notes}
                    onChange={(e) => setInvoiceForm({...invoiceForm, notes: e.target.value})}
                    placeholder="Additional notes for the invoice"
                    rows={3}
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Invoice Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${invoiceForm.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({invoiceForm.taxRate}%):</span>
                    <span>${invoiceForm.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-${invoiceForm.discount.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>${invoiceForm.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvoiceModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateInvoice} className="bg-blue-600 hover:bg-blue-700">
              Create Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Estimate Creation Modal */}
      <Dialog open={showEstimateModal} onOpenChange={setShowEstimateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Create Estimate
            </DialogTitle>
            <DialogDescription>
              Create a professional estimate for this job
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Estimate Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="estimateNumber">Estimate Number</Label>
                <Input
                  id="estimateNumber"
                  value={estimateForm.estimateNumber}
                  onChange={(e) => setEstimateForm({...estimateForm, estimateNumber: e.target.value})}
                  placeholder="EST-001"
                />
              </div>
              <div>
                <Label htmlFor="estimateIssueDate">Issue Date</Label>
                <Input
                  id="estimateIssueDate"
                  type="date"
                  value={estimateForm.issueDate}
                  onChange={(e) => setEstimateForm({...estimateForm, issueDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={estimateForm.expiryDate}
                  onChange={(e) => setEstimateForm({...estimateForm, expiryDate: e.target.value})}
                />
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-semibold">Line Items</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEstimateLineItem}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {estimateForm.lineItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-6">
                      <Label htmlFor={`est-description-${index}`}>Description</Label>
                      <Input
                        id={`est-description-${index}`}
                        value={item.description}
                        onChange={(e) => handleEstimateLineItemChange(index, 'description', e.target.value)}
                        placeholder="Service description"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`est-quantity-${index}`}>Qty</Label>
                      <Input
                        id={`est-quantity-${index}`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleEstimateLineItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`est-rate-${index}`}>Rate</Label>
                      <Input
                        id={`est-rate-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => handleEstimateLineItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Label>Amount</Label>
                      <div className="text-sm font-medium text-gray-700 p-2 bg-gray-50 rounded border">
                        ${item.amount.toFixed(2)}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEstimateLineItem(index)}
                        className="text-red-500 hover:text-red-700"
                        disabled={estimateForm.lineItems.length === 1}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="estTaxRate">Tax Rate (%)</Label>
                    <Input
                      id="estTaxRate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={estimateForm.taxRate}
                      onChange={(e) => {
                        const taxRate = parseFloat(e.target.value) || 0;
                        const taxAmount = (estimateForm.subtotal * taxRate) / 100;
                        const total = estimateForm.subtotal + taxAmount - estimateForm.discount;
                        setEstimateForm({
                          ...estimateForm,
                          taxRate,
                          taxAmount,
                          total
                        });
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="estDiscount">Discount ($)</Label>
                    <Input
                      id="estDiscount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={estimateForm.discount}
                      onChange={(e) => {
                        const discount = parseFloat(e.target.value) || 0;
                        const total = estimateForm.subtotal + estimateForm.taxAmount - discount;
                        setEstimateForm({
                          ...estimateForm,
                          discount,
                          total
                        });
                      }}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="estNotes">Notes</Label>
                  <Textarea
                    id="estNotes"
                    value={estimateForm.notes}
                    onChange={(e) => setEstimateForm({...estimateForm, notes: e.target.value})}
                    placeholder="Additional notes for the estimate"
                    rows={3}
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Estimate Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${estimateForm.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({estimateForm.taxRate}%):</span>
                    <span>${estimateForm.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-${estimateForm.discount.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>${estimateForm.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEstimateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateEstimate} className="bg-green-600 hover:bg-green-700">
              Create Estimate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Recording Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Record Payment
            </DialogTitle>
            <DialogDescription>
              Record a payment for this job
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="paymentAmount">Amount ($)</Label>
              <Input
                id="paymentAmount"
                type="number"
                min="0"
                step="0.01"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({...paymentForm, amount: parseFloat(e.target.value) || 0})}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={paymentForm.method} onValueChange={(value) => setPaymentForm({...paymentForm, method: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Check">Check</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Digital Payment">Digital Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="paymentReference">Reference Number</Label>
              <Input
                id="paymentReference"
                value={paymentForm.reference}
                onChange={(e) => setPaymentForm({...paymentForm, reference: e.target.value})}
                placeholder="Transaction ID, check number, etc."
              />
            </div>

            <div>
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentForm.date}
                onChange={(e) => setPaymentForm({...paymentForm, date: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="paymentNotes">Notes</Label>
              <Textarea
                id="paymentNotes"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                placeholder="Additional payment notes"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleRecordPayment} className="bg-green-600 hover:bg-green-700">
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Tag Note Modal */}
      <Dialog open={showAddTagNoteModal} onOpenChange={setShowAddTagNoteModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Tag Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Tag"
              value={newTagNoteName}
              onChange={(e) => setNewTagNoteName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTagNoteModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTagNote} disabled={!newTagNoteName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Tag Modal */}
      <Dialog open={showAddTagModal} onOpenChange={setShowAddTagModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Tag"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full border-2 border-neutral-200 dark:border-neutral-700 shadow-sm cursor-pointer overflow-hidden"
                    style={{ backgroundColor: newTagTextColor }}
                    onClick={() => document.getElementById('new_tag_text_color')?.click()}
                  >
                    <input
                      id="new_tag_text_color"
                      type="color"
                      value={newTagTextColor}
                      onChange={(e) => setNewTagTextColor(e.target.value)}
                      className="opacity-0 w-full h-full cursor-pointer"
                    />
                  </div>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400 font-mono">
                    {newTagTextColor}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Background Color</Label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full border-2 border-neutral-200 dark:border-neutral-700 shadow-sm cursor-pointer overflow-hidden"
                    style={{ backgroundColor: newTagBgColor }}
                    onClick={() => document.getElementById('new_tag_bg_color')?.click()}
                  >
                    <input
                      id="new_tag_bg_color"
                      type="color"
                      value={newTagBgColor}
                      onChange={(e) => setNewTagBgColor(e.target.value)}
                      className="opacity-0 w-full h-full cursor-pointer"
                    />
                  </div>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400 font-mono">
                    {newTagBgColor}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTagModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTag} disabled={!newTagName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
