import { CustomerT } from "@/src/constants/interface/customer"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { User } from "lucide-react"

interface OverviewCustomerTabProps {
  selectedCustomer: CustomerT
  getJobStatusIcon: (status: string) => JSX.Element
}

interface Field_T {
  label: string
  value: string | number | undefined | React.ReactNode
}

export const OverviewCustomerTab: React.FC<OverviewCustomerTabProps> = ({
  selectedCustomer,
  getJobStatusIcon,
}) => {
  const {
    clientName,
    companyName,
    serialNumber,
    email,
    phoneNumber,
    apartmentUnit,
    city,
    state,
    country,
    zipCode,
    location,
    sourceTitle,
  } = selectedCustomer

  const fullAddress = [
    apartmentUnit,
    city,
    state,
    country,
    zipCode,
  ]
    .filter(Boolean)
    .join(", ")

  const customerFields: Field_T[] = [
    { label: "Customer Name", value: clientName },
    { label: "Company", value: companyName },
    { label: "Serial Number", value: serialNumber },
    { label: "Email", value: email },
    { label: "Phone", value: phoneNumber },
    { label: "Address", value: fullAddress },
    { label: "Location", value: location },
    { label: "Source", value: sourceTitle },
  ]

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
            {customerFields.map(({ label, value }) => (
              <div key={label}>
                <label className="text-sm font-medium text-slate-600">
                  {label}
                </label>
                <p className="text-sm text-slate-900 break-all">
                  {value || "—"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Job Activities</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {selectedCustomer.jobActivities?.length ? (
              selectedCustomer.jobActivities.map(activity => (
                <div key={activity.id} className="flex gap-4">
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1" />
                    <div className="flex-1 w-px bg-slate-200" />
                  </div>

                  {/* Activity content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-900">
                          {activity.title}
                        </p>

                        <p className="text-sm text-slate-500">
                          {activity.jobId} • {activity.method}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-slate-900">
                          ${activity.amount}
                        </p>
                        <p className="text-xs text-slate-500">
                          Cost: ${activity.cost}
                        </p>
                      </div>
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <span>{activity.addedBy}</span>
                      <span>•</span>
                      <span>
                        {new Date(activity.createdAt).toLocaleString()}
                      </span>
                      <span
                        className={`ml-2 font-medium ${
                          activity.paymentStatus === "Paid"
                            ? "text-green-600"
                            : "text-orange-600"
                        }`}
                      >
                        {activity.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-6">
                No job activities yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
