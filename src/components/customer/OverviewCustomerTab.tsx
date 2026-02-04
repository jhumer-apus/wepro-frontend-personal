import { CustomerT } from "@/src/types/customer"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { User } from "lucide-react"

interface OverviewCustomerTabProps {
  selectedCustomer: CustomerT
  getJobStatusIcon: (status: string) => JSX.Element
}

export const OverviewCustomerTab: React.FC<OverviewCustomerTabProps> = ({
  selectedCustomer,
  getJobStatusIcon,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card className="border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Customer Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Email</label>
              <p className="text-sm text-slate-900">
                {selectedCustomer.email}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">Phone</label>
              <p className="text-sm text-slate-900">
                {selectedCustomer.phoneNumber}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">
                Address
              </label>
              <p className="text-sm text-slate-900">
                {selectedCustomer.addressUnit}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedCustomer.jobHistory?.slice(0, 3).map(job => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getJobStatusIcon(job.status)}
                  <div>
                    <p className="font-medium text-slate-900">{job.type}</p>
                    <p className="text-sm text-slate-500">
                      {job.id} • {job.date}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-slate-900">
                  ${job.amount}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
