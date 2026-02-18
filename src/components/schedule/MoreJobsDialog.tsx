import { CalendarIcon, Clock, DollarSign, Edit3, Eye, MapPin, Phone, Plus, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { getStatusBorderColor, getStatusColor } from "@/src/lib/color";
import { Button } from "../ui/button";
import { useTechnician } from "@/src/hooks/useTechnician";

interface Props {
    showMoreJobsDialog: boolean;
    setShowMoreJobsDialog: React.Dispatch<React.SetStateAction<boolean>>;
    moreJobsDate: string;
    moreJobsList: any[];
    setSelectedJob: React.Dispatch<React.SetStateAction<any>>;
    setShowJobDetails: React.Dispatch<React.SetStateAction<boolean>>;
    handleEmptySpotClick: (dateStr: string) => void;
}
export default function MoreJobsDialog(props:Props) {

    const { 
        showMoreJobsDialog, 
        setShowMoreJobsDialog, 
        moreJobsDate, 
        moreJobsList, 
        setSelectedJob, 
        setShowJobDetails, 
        handleEmptySpotClick 
    } = props;
    const { getTechnicianColor, getTechnicianName } = useTechnician();

    return (
        <Dialog open={showMoreJobsDialog} onOpenChange={setShowMoreJobsDialog}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-blue-500" />
                    All Jobs for {moreJobsDate ? new Date(moreJobsDate + 'T00:00:00').toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    }) : ''}
                  <Badge variant="secondary" className="ml-2">
                    {moreJobsList.length} jobs
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              
              <div className="overflow-y-auto max-h-[60vh]">
                <div className="space-y-3">
                  {moreJobsList
                    .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))
                    .map((job) => (
                      <div
                        key={job.id}
                        className={`p-4 rounded-lg border-l-4 ${getStatusColor(job.status)} ${getStatusBorderColor(job.status)} hover:shadow-md transition-all duration-200 cursor-pointer`}
                        onClick={() => {
                          setSelectedJob(job);
                          setShowJobDetails(true);
                          setShowMoreJobsDialog(false);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{job.title}</h3>
                              <Badge className={getStatusColor(job.status)}>
                                {job.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <User className="w-4 h-4 text-neutral-500" />
                                  <span className="font-medium">{job.client}</span>
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Phone className="w-4 h-4 text-neutral-500" />
                                  <span>{job.clientPhone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-neutral-500" />
                                  <span className="text-neutral-600">{job.address}</span>
                                </div>
                              </div>
                              
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Clock className="w-4 h-4 text-neutral-500" />
                                  <span className="font-medium">{job.scheduledTime} - {job.endTime}</span>
                                  <span className="text-neutral-500">({job.estimatedDuration}m)</span>
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: getTechnicianColor(job.technicianId) }}
                                  />
                                  <span className="font-medium">{getTechnicianName(job.technicianId)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-green-500" />
                                  <span className="font-medium text-green-600">${job.value.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                            
                            {job.description && (
                              <div className="mt-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded">
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">{job.description}</p>
                              </div>
                            )}
                            
                            {job.tags && job.tags.length > 0 && (
                              <div className="mt-2 flex gap-2">
                                {job.tags.map((tag:string) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedJob(job);
                                setShowJobDetails(true);
                                setShowMoreJobsDialog(false);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle edit job (placeholder)
                                console.log('Edit job:', job.id);
                              }}
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowMoreJobsDialog(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setShowMoreJobsDialog(false);
                    handleEmptySpotClick(moreJobsDate);
                  }}
                  className="bg-accent-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Job
                </Button>
              </div>
            </DialogContent>
        </Dialog>
    )
}