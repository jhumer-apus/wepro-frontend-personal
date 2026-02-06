import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import {
  Plus,
  Eye,
  Edit,
  Download,
  MoreVertical,
  Star,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/src/components/ui/dropdown-menu"
import { CustomerT } from "@/src/types/customer"

interface JobsCustomerTabProps {
  selectedCustomer: CustomerT
  getJobStatusIcon: (status: string) => JSX.Element
  getStatusColor: (status: string) => string
}

export const JobsCustomerTab: React.FC<JobsCustomerTabProps> = ({
  selectedCustomer,
  getJobStatusIcon,
  getStatusColor,
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">
          Job History
        </h3>
        <Button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Job
        </Button>
      </div>

      {/* Jobs list */}
      {selectedCustomer.jobHistory?.map(job => (
        <Card
          key={job.id}
          className="border-0 bg-white/70 backdrop-blur-sm"
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                {getJobStatusIcon(job.status)}

                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-slate-900">
                      {job.type}
                    </h4>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-slate-600 mb-2">
                    {job.description}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-500">
                    <div>
                      <span className="font-medium">Job ID:</span>{" "}
                      {job.id}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span>{" "}
                      {job.date}
                    </div>
                    <div>
                      <span className="font-medium">Technician:</span>{" "}
                      {job.tech}
                    </div>
                    <div>
                      <span className="font-medium">Amount:</span> $
                      {job.amount}
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center space-x-1 mb-1">
                      <span className="text-sm font-medium text-slate-600">
                        Rating:
                      </span>
                      {[...Array(job.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600">
                      {job.notes}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Job
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="w-4 h-4 mr-2" />
                    Download Invoice
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
