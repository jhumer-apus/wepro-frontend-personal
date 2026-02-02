import { useMemo } from "react";
import { useRouter } from "next/router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Activity,
  Calendar,
  Calculator,
  CreditCard,
  DollarSign,
  FileText,
  MapPin,
  MessageSquare,
  Send,
  User,
  Users,
  Wrench,
} from "lucide-react";
import { dummyJobs } from "@/src/constants/dummyData/jobs";

const jobStatuses = [
  { id: 1, name: "Pending", color: "#8B5CF6" },
  { id: 2, name: "Rejected", color: "#2563EB" },
  { id: 3, name: "No Answer", color: "#F59E42" },
  { id: 4, name: "Canceled", color: "#EF4444" },
  { id: 5, name: "Done", color: "#22C55E" },
  { id: 6, name: "In Progress", color: "#3B82F6" },
  { id: 7, name: "Submitted", color: "#FBBF24" },
  { id: 8, name: "Appointments", color: "#22C55E" },
  { id: 9, name: "Not Confirmed", color: "#EF4444" },
  { id: 10, name: "Confirmed", color: "#22C55E" },
  { id: 11, name: "Follow Up", color: "#FBBF24" },
];

const activity = [
  { type: "activity", title: "Job Activity", summary: "Responder changed to Not Confirmed", timestamp: "07/02/2025 09:03 PM", user: "System", color: "#2563eb" },
  { type: "assign", title: "Job Assign", summary: "Job assigned to Technician: OK LINE", timestamp: "07/02/2025 09:03 PM", user: "Jocres Cartagena Cequiña", color: "#059669" },
  { type: "note", title: "Job Note", summary: "Customer requested early arrival.", timestamp: "07/02/2025 09:02 PM", user: "Dispatcher", color: "#2563eb" },
  { type: "payment", title: "Payment Received", summary: "Payment of $200 received.", timestamp: "07/02/2025 09:01 PM", user: "System", color: "#eab308" },
  { type: "call", title: "Call Recording", summary: "Call with customer recorded.", timestamp: "07/02/2025 09:00 PM", user: "Reception", color: "#a21caf" },
  { type: "messages", title: "Message Sent", summary: "Text message sent to customer.", timestamp: "07/02/2025 08:59 PM", user: "System", color: "#db2777" },
  { type: "activity", title: "Job Created", summary: "Job created by (LS) Jocres Cartagena Cequiña", timestamp: "07/02/2025 08:58 PM", user: "Jocres Cartagena Cequiña", color: "#2563eb" },
];

const getStatusObj = (name?: string) =>
  jobStatuses.find((s) => s.name === name) || { name: name || "Pending", color: "#888" };

export default function ViewJobPage() {
  const router = useRouter();
  const { id } = router.query;
  const jobId = Array.isArray(id) ? id[0] : id;

  const job = useMemo<any>(() => {
    if (!jobId) return null;
    return dummyJobs.find((j) => (j.id || "").toString().toLowerCase() === jobId.toLowerCase()) || null;
  }, [jobId]);

  if (!router.isReady) return null;

  if (!job) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-semibold text-slate-800">Job not found</h1>
          <p className="text-slate-500">We couldn't locate a job with ID "{jobId}".</p>
          <Button variant="outline" onClick={() => router.push("/jobs")}>Back to jobs</Button>
        </div>
      </div>
    );
  }

  const status = getStatusObj(job.status || "Pending");

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Job ID:</span>
            <span className="text-xl font-bold text-blue-700">{job.id}</span>
          </div>
          <Badge style={{ backgroundColor: status.color, color: "white" }} className="px-3 py-1">
            {status.name}
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            ${job.revenue ?? 0}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/jobs")}>Back to list</Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="p-0 pt-4 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium">Client Name</Label>
                    <div className="mt-1">{job.clientName || "—"}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Company</Label>
                    <div className="mt-1">{job.companyName || "—"}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <div className="mt-1">{job.email || "—"}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <div className="mt-1">{job.phoneNumber || "—"}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <div>
                  <Label className="text-sm font-medium">Address</Label>
                  <div className="mt-1">{job.location || "—"}</div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-sm font-medium">City</Label>
                    <div className="mt-1">{job.city || "—"}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">State</Label>
                    <div className="mt-1">{job.state || "—"}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">ZIP</Label>
                    <div className="mt-1">{job.zipCode || "—"}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Service Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <div className="mt-1">{job.jobCategory || "—"}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Type</Label>
                    <div className="mt-1">{job.jobType || "—"}</div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <div className="mt-1">{job.priority || "—"}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Scheduling
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium">Date</Label>
                    <div className="mt-1">{job.startDate || "—"}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Time</Label>
                    <div className="mt-1">{job.startTime || "—"}</div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Duration</Label>
                  <div className="mt-1">{job.estimatedDuration || "—"}</div>
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
              <CardContent className="space-y-3 text-sm text-slate-700">
                <div>
                  <Label className="text-sm font-medium">Technician</Label>
                  <div className="mt-1">{job.assignedTechnician || "Unassigned"}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{job.status || "Pending"}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Financials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <div>
                  <Label className="text-sm font-medium">Revenue</Label>
                  <div className="mt-1">${job.revenue ?? 0}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium">Distance</Label>
                    <div className="mt-1">{job.distance ?? 0} mi</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Rating</Label>
                    <div className="mt-1">{job.customerRating ?? "—"} ⭐</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

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
                <Textarea value={job.jobDescription || ""} readOnly className="mt-1" rows={3} />
              </div>
              <div>
                <Label className="text-sm font-medium">Special Instructions</Label>
                <Textarea value={job.specialInstructions || ""} readOnly className="mt-1" rows={2} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Activity Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {activity.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: item.color }}></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <span className="text-xs text-gray-500">{item.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{item.summary}</p>
                      <p className="text-xs text-gray-500 mt-1">by {item.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financials" className="pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Invoice Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">${job.revenue ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold">${job.revenue ?? 0}</span>
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
  );
}


