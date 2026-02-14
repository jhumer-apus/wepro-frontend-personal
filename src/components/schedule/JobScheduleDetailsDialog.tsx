import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Wrench, Edit3, Phone, Navigation } from "lucide-react";
import { JobSchedule } from "@/src/constants/interface/jobSchedule";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobSchedule | null;
  getTechnicianColor: (technicianId: string) => string;
  getTechnicianName: (technicianId: string) => string;
  getStatusColor: (status: string) => string;
  onEdit?: (job: JobSchedule) => void;
  onCall?: (job: JobSchedule) => void;
  onDirections?: (job: JobSchedule) => void;
}

const JobScheduleDetailsDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  job,
  getTechnicianColor,
  getTechnicianName,
  getStatusColor,
  onEdit,
  onCall,
  onDirections,
}) => {
  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Job Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* LEFT COLUMN */}
            <div className="space-y-4">
              {/* Job Info */}
              <div>
                <Label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Job Information
                </Label>
                <div className="mt-2 space-y-2">
                  <InfoRow label="Job ID" value={job.id} bold />
                  <InfoRow label="Service" value={job.title} />
                  <InfoRow label="Type" value={job.jobType} />
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <Label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Customer Information
                </Label>
                <div className="mt-2 space-y-2">
                  <InfoRow label="Client" value={job.client} bold />
                  <InfoRow label="Phone" value={job.clientPhone} />
                  <InfoRow label="Address" value={job.address} />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-4">
              {/* Scheduling */}
              <div>
                <Label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Scheduling
                </Label>
                <div className="mt-2 space-y-2">
                  <InfoRow label="Date" value={job.scheduledDate} bold />
                  <InfoRow
                    label="Time"
                    value={`${job.scheduledTime} - ${job.endTime}`}
                  />
                  <InfoRow
                    label="Duration"
                    value={`${job.estimatedDuration} minutes`}
                  />
                  <div className="flex justify-between">
                    <span className="text-sm">Technician:</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: getTechnicianColor(job.technicianId ?? "")
                        }}
                      />
                      <span className="text-sm font-medium">
                        {getTechnicianName(job.technicianId ?? "")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div>
                <Label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Job Details
                </Label>
                <div className="mt-2 space-y-2">
                  <InfoRow
                    label="Value"
                    value={`$${job.value.toFixed(2)}`}
                    bold
                  />
                  <InfoRow label="Source" value={job.source} />
                  <div className="flex justify-between">
                    <span className="text-sm">Status:</span>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Description
            </Label>
            <p className="text-sm mt-1 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
              {job.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              className="flex-1 bg-accent-500 text-white hover:bg-accent-600"
              onClick={() => onEdit?.(job)}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Job
            </Button>

            <Button variant="outline" onClick={() => onCall?.(job)}>
              <Phone className="w-4 h-4 mr-2" />
              Call Client
            </Button>

            <Button variant="outline" onClick={() => onDirections?.(job)}>
              <Navigation className="w-4 h-4 mr-2" />
              Directions
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobScheduleDetailsDialog;


/* ---------------------- */
/* Reusable InfoRow */
/* ---------------------- */
interface InfoRowProps {
  label: string;
  value: string;
  bold?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, bold }) => (
  <div className="flex justify-between">
    <span className="text-sm">{label}:</span>
    <span className={`text-sm ${bold ? "font-medium" : ""}`}>
      {value}
    </span>
  </div>
);
