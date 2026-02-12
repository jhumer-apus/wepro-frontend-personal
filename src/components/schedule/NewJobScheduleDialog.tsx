import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/src/components/ui/select";
import { Plus } from "lucide-react";

interface Props {
  showNewJobDialog: boolean;
  setShowNewJobDialog: (open: boolean) => void;
  newJobData: any;
  setNewJobData: (data: any) => void;
  calculateEndTime: (start: string, duration: number) => string;
  technicians: any[];
  metroAreas: string[];
  handleCreateJob: () => void;
}

const NewJobScheduleDialog: React.FC<Props> = ({
  showNewJobDialog,
  setShowNewJobDialog,
  newJobData,
  setNewJobData,
  calculateEndTime,
  technicians,
  metroAreas,
  handleCreateJob,
}) => {
  return (
    <Dialog open={showNewJobDialog} onOpenChange={setShowNewJobDialog}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-500" />
            Create New Job
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={newJobData.title}
                  onChange={(e) =>
                    setNewJobData({ ...newJobData, title: e.target.value })
                  }
                  placeholder="e.g., HVAC System Repair"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobType">Job Type</Label>
                <Select
                  value={newJobData.jobType}
                  onValueChange={(value) =>
                    setNewJobData({ ...newJobData, jobType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HVAC">HVAC</SelectItem>
                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Installation">
                      Installation
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="w-full p-2 border border-neutral-300 rounded-md resize-none h-20"
                value={newJobData.description}
                onChange={(e) =>
                  setNewJobData({
                    ...newJobData,
                    description: e.target.value,
                  })
                }
                placeholder="Describe the job details..."
              />
            </div>
          </div>

          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Client Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client">Client Name *</Label>
                <Input
                  id="client"
                  value={newJobData.client}
                  onChange={(e) =>
                    setNewJobData({
                      ...newJobData,
                      client: e.target.value,
                    })
                  }
                  placeholder="Client or company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Phone Number</Label>
                <Input
                  id="clientPhone"
                  value={newJobData.clientPhone}
                  onChange={(e) =>
                    setNewJobData({
                      ...newJobData,
                      clientPhone: e.target.value,
                    })
                  }
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={newJobData.address}
                onChange={(e) =>
                  setNewJobData({
                    ...newJobData,
                    address: e.target.value,
                  })
                }
                placeholder="Full address including city and state"
              />
            </div>
          </div>

          {/* Scheduling */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Scheduling</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Date</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={newJobData.scheduledDate}
                  onChange={(e) =>
                    setNewJobData({
                      ...newJobData,
                      scheduledDate: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledTime">Start Time</Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={newJobData.scheduledTime}
                  onChange={(e) => {
                    const newTime = e.target.value;
                    const endTime = calculateEndTime(
                      newTime,
                      newJobData.estimatedDuration
                    );
                    setNewJobData({
                      ...newJobData,
                      scheduledTime: newTime,
                      endTime,
                    });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedDuration">
                  Duration (minutes)
                </Label>
                <Input
                  id="estimatedDuration"
                  type="number"
                  value={newJobData.estimatedDuration}
                  onChange={(e) => {
                    const duration = parseInt(e.target.value) || 120;
                    const endTime = calculateEndTime(
                      newJobData.scheduledTime,
                      duration
                    );
                    setNewJobData({
                      ...newJobData,
                      estimatedDuration: duration,
                      endTime,
                    });
                  }}
                  min="30"
                  step="30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="technician">Technician</Label>
                <Select
                  value={newJobData.technicianId}
                  onValueChange={(value) =>
                    setNewJobData({
                      ...newJobData,
                      technicianId: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">
                      Unassigned
                    </SelectItem>
                    {technicians.map((tech) => (
                      <SelectItem key={tech.id} value={tech.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tech.color }}
                          />
                          {tech.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Additional Details
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">Job Value ($)</Label>
                <Input
                  id="value"
                  type="number"
                  value={newJobData.value}
                  onChange={(e) =>
                    setNewJobData({
                      ...newJobData,
                      value: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metroArea">Metro Area</Label>
                <Select
                  value={newJobData.metroArea}
                  onValueChange={(value) =>
                    setNewJobData({
                      ...newJobData,
                      metroArea: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {metroAreas.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                className="w-full p-2 border border-neutral-300 rounded-md resize-none h-16"
                value={newJobData.notes}
                onChange={(e) =>
                  setNewJobData({
                    ...newJobData,
                    notes: e.target.value,
                  })
                }
                placeholder="Additional notes or special instructions..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowNewJobDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateJob}
              disabled={
                !newJobData.title ||
                !newJobData.client ||
                !newJobData.address
              }
              className="bg-accent-500 text-white hover:bg-accent-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Job
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewJobScheduleDialog;
