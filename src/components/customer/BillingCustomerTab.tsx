import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { CreditCard, Download } from "lucide-react"
import { CustomerT } from "@/src/constants/interface/customer"

interface BillingCustomerTabProps {
  selectedCustomer: CustomerT
}

export const BillingCustomerTab: React.FC<BillingCustomerTabProps> = ({
  selectedCustomer,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Billing Information */}
      <Card className="border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Billing Information</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600">
              Billing Address
            </label>
            <p className="text-sm text-slate-900">
              {selectedCustomer.billingAddress}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600">
              Payment Method
            </label>
            <p className="text-sm text-slate-900">
              {selectedCustomer.paymentMethod}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600">
              Total Spent
            </label>
            <p className="text-2xl font-bold text-green-600">
              ${selectedCustomer?.totalSpent?.toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      <Card className="border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {selectedCustomer.jobHistory?.map(job => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {job.type}
                  </p>
                  <p className="text-sm text-slate-500">
                    {job.date}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-slate-900">
                    ${job.amount}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#4a9430] p-0 h-auto"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
